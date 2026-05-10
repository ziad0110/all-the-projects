"""
SAS License Manager V4 - Professional Licensing System
"""
import hashlib
import uuid
import os
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

def get_app_data_path():
    """Get the path to the AppData folder for the application."""
    if os.name == 'nt': # Windows
        base_path = Path(os.environ.get('APPDATA')) / "SmartAccountingSuite"
    else: # Linux/Mac
        base_path = Path.home() / ".smart_accounting_suite"
    
    # Ensure the directory exists
    base_path.mkdir(parents=True, exist_ok=True)
    (base_path / "instance").mkdir(parents=True, exist_ok=True)
    return base_path

def get_base_dir():
    if getattr(sys, 'frozen', False):
        return get_app_data_path()
    return Path(__file__).resolve().parent

LICENSE_FILE = get_base_dir() / "instance" / ".license"
# This salt should be kept secret by the developer
SECRET_SALT = "SAS-PRO-CORE-2026-SECURE-SALT-99"

def get_machine_id():
    """Generates a unique ID based on the hardware."""
    try:
        # Get hardware UUID (more stable than node)
        import subprocess
        cmd = 'wmic csproduct get uuid'
        raw_id = subprocess.check_output(cmd, shell=True).decode().split('\n')[1].strip()
    except:
        raw_id = str(uuid.getnode())
        
    return hashlib.sha256(raw_id.encode()).hexdigest()[:16].upper()

def generate_license_key(machine_id: str, days: int, gen: int = 0):
    """
    Format: SAS-[DAYS]-[HASH]
    DAYS: 3 digits (e.g. 365) or LIF for Lifetime
    gen: generation/renewal number (0=first, 1=first renewal, 2=second renewal...)
    Each gen produces a UNIQUE key for the same machine+days combination.
    """
    day_str = "LIF" if days == 0 else str(days).zfill(3)
    if gen > 0:
        raw_source = f"{SECRET_SALT}:{machine_id}:{days}:{gen}"
    else:
        # gen=0: original format for backward compatibility
        raw_source = f"{SECRET_SALT}:{machine_id}:{days}"
    hash_val = hashlib.sha256(raw_source.encode()).hexdigest().upper()
    
    # Take segments of hash for a professional look
    p1, p2, p3 = hash_val[:4], hash_val[4:8], hash_val[8:12]
    return f"SAS-{day_str}-{p1}-{p2}-{p3}"

def validate_license_key(full_key: str, machine_id: str):
    """Verifies the key and returns (is_valid, days).
    Tries all generation numbers (0-99) for compatibility."""
    try:
        parts = full_key.strip().upper().split("-")
        if len(parts) != 5 or parts[0] != "SAS":
            return False, 0
            
        day_part = parts[1]
        days = 0 if day_part == "LIF" else int(day_part)
        
        # Try all generation numbers (0=original, 1-99=renewals)
        for gen in range(100):
            expected = generate_license_key(machine_id, days, gen)
            if full_key.strip().upper() == expected:
                return True, days
    except:
        pass
    return False, 0

def _sign_data(data: dict) -> str:
    import hmac
    payload = f"{data.get('license_key')}:{data.get('machine_id')}:{data.get('expiry_days')}:{data.get('activated_at')}:{data.get('last_run_date', '')}"
    return hmac.new(SECRET_SALT.encode(), payload.encode(), hashlib.sha256).hexdigest()

def save_license(key: str, days: int):
    """Save license data. Returns (success: bool, message: str)."""
    LICENSE_FILE.parent.mkdir(parents=True, exist_ok=True)
    now_iso = datetime.now().isoformat()
    
    # --- Anti-Reuse Protection ---
    # If the same key was already activated before, keep the original activation date.
    # This prevents clients from bypassing expiry by re-entering the same key.
    existing = load_license()
    if existing and existing.get("license_key", "").strip().upper() == key.strip().upper():
        original_activated = existing.get("activated_at")
        if original_activated and days > 0:
            # Check if the original activation has expired
            activated_at = datetime.fromisoformat(original_activated)
            expiry_date = activated_at + timedelta(days=days)
            if datetime.now() > expiry_date:
                # Key is expired - block re-activation with same key
                return False, "هذا المفتاح منتهي الصلاحية. يرجى التواصل مع المطور للحصول على مفتاح جديد."
            else:
                # Key still valid - keep original date (no benefit to re-enter)
                now_iso = original_activated
    
    data = {
        "license_key": key,
        "machine_id": get_machine_id(),
        "expiry_days": days,
        "activated_at": now_iso,
        "last_run_date": datetime.now().isoformat(),
        "v": "4.2"
    }
    data["signature"] = _sign_data(data)
    LICENSE_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return True, "تم التفعيل بنجاح"

def load_license():
    if not LICENSE_FILE.exists(): return None
    try:
        data = json.loads(LICENSE_FILE.read_text(encoding="utf-8"))
        if data.get("signature") != _sign_data(data):
            return None # Tampered file detected
        return data
    except:
        return None

def is_licensed():
    """Main check used by the application."""
    data = load_license()
    if not data: return False
    
    # 1. Check if it belongs to this machine
    if data.get("machine_id") != get_machine_id(): return False
    
    # 2. Check key validity
    valid, expiry_days = validate_license_key(data["license_key"], data["machine_id"])
    if not valid: return False
    
    now = datetime.now()
    
    # 3. Anti-Rollback Check
    if "last_run_date" in data:
        last_run = datetime.fromisoformat(data["last_run_date"])
        # If current time is earlier than last run time (with 2 hours buffer for timezone/DST changes)
        if now < last_run - timedelta(hours=2):
            return False # Clock was rolled back!
            
    # 4. Check time expiry
    if expiry_days > 0:
        activated_at = datetime.fromisoformat(data["activated_at"])
        expiry_date = activated_at + timedelta(days=expiry_days)
        if now > expiry_date:
            return False
            
    # Update last_run_date periodically to prevent freezing time
    if "last_run_date" not in data or now > datetime.fromisoformat(data["last_run_date"]) + timedelta(minutes=30):
        try:
            data["last_run_date"] = now.isoformat()
            data["signature"] = _sign_data(data)
            LICENSE_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        except:
            pass # Failsafe
            
    return True

def get_license_info():
    data = load_license()
    mid = get_machine_id()
    if not data: return {"status": "unlicensed", "machine_id": mid}
    
    valid = is_licensed()
    info = {
        "status": "valid" if valid else "expired",
        "machine_id": mid,
        "expiry_days": data.get("expiry_days", 0),
        "license_key": data.get("license_key", "")
    }
    
    expiry_days = data.get("expiry_days", 0)
    if expiry_days > 0:
        activated_at = datetime.fromisoformat(data["activated_at"])
        expiry_date = activated_at + timedelta(days=expiry_days)
        info["expiry_date"] = expiry_date.strftime("%Y-%m-%d")
        days_left = (expiry_date - datetime.now()).days
        info["days_left"] = max(0, days_left)
    else:
        info["expiry_date"] = "مدى الحياة"
        info["days_left"] = "∞"
    return info
