"""Quick script to expire the current license for testing.
Uses the SAME path as the running app (license_manager.LICENSE_FILE)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from license_manager import LICENSE_FILE, load_license, _sign_data
import json
from datetime import datetime, timedelta

print(f"License file path: {LICENSE_FILE}")
print(f"File exists: {LICENSE_FILE.exists()}")

if not LICENSE_FILE.exists():
    print("\nNo license file found! Make sure you've activated a key first.")
    sys.exit(1)

data = load_license()
if not data:
    print("\nLicense file exists but failed to load (possibly tampered).")
    sys.exit(1)

print(f"Current key: {data['license_key']}")
print(f"Current activated_at: {data['activated_at']}")
print(f"Expiry days: {data['expiry_days']}")

# Move activation date back so the key is expired
old_date = (datetime.now() - timedelta(days=data['expiry_days'] + 1)).isoformat()
data['activated_at'] = old_date
data['last_run_date'] = old_date
data['signature'] = _sign_data(data)

LICENSE_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"\nNew activated_at: {old_date}")
print("License is now EXPIRED!")
print(f"\nGo to http://127.0.0.1:5000/license and try re-entering: {data['license_key']}")
