"""
SAS Desktop Launcher - Optimized for PyInstaller
"""
import sys
import io
import threading
import time
import webbrowser
import os
import subprocess
from pathlib import Path

# --- PyInstaller Path Helper ---
def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# Fix console encoding on Windows
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

# Add project root to path
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
if getattr(sys, 'frozen', False):
    # If running as EXE, the base dir is where the EXE is
    BASE_DIR = os.path.dirname(sys.executable)
    # But for templates/static, we use the _MEIPASS temp folder
    BUNDLE_DIR = sys._MEIPASS
else:
    BUNDLE_DIR = BASE_DIR

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

def kill_port_5000():
    """Kill any process running on port 5000 (Windows only)."""
    if sys.platform == "win32":
        try:
            output = subprocess.check_output(['netstat', '-ano', '-p', 'TCP'], str(True)).decode()
            for line in output.splitlines():
                if ':5000 ' in line and 'LISTENING' in line:
                    pid = line.strip().split()[-1]
                    if pid != '0':
                        print(f"  Cleaning up old process (PID: {pid})...")
                        subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True)
        except Exception:
            pass

def start_flask_server():
    """Start the Flask server in a background thread."""
    from app import app, initialize_database
    
    # Configure paths for bundled app
    db_dir = os.path.join(BASE_DIR, "instance")
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
        
    db_path = os.path.join(db_dir, "sas.db")
    schema_path = resource_path("schema.sql")
    
    # Update app config to use absolute paths
    app.config["DATABASE"] = db_path
    app.template_folder = resource_path("templates")
    app.static_folder = resource_path("static")
    
    # Initialize database if needed
    initialize_database(db_path, schema_path, with_demo=True, force=False)
    
    # Suppress Flask output
    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.WARNING)
    
    # Run Flask
    debug_mode = not getattr(sys, 'frozen', False)
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=debug_mode,
        use_reloader=False, # Must be False when running in a thread
        threaded=True
    )

def wait_for_server(host="127.0.0.1", port=5000, timeout=15):
    import socket
    start = time.time()
    while time.time() - start < timeout:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            sock.close()
            if result == 0:
                return True
        except Exception:
            pass
        time.sleep(0.3)
    return False

def check_license():
    from license_manager import is_licensed, get_machine_id
    if is_licensed():
        return True
    print("\n" + "=" * 50)
    print("  SAS - Smart Accounting Suite")
    print("=" * 50)
    print(f"  Machine ID: {get_machine_id()}")
    print("  This software requires a license to run.")
    print("=" * 50)
    return False

def launch_desktop():
    print("\n" + "=" * 50)
    print("  SAS - Smart Accounting Suite v1.0")
    print("  Starting...")
    print("=" * 50)
    
    # Kill existing server if any
    kill_port_5000()
    
    # Start Flask in background thread
    server_thread = threading.Thread(target=start_flask_server, daemon=True)
    server_thread.start()
    
    # Wait for server
    print("  Loading system...")
    if not wait_for_server():
        print("  ERROR: Server failed to start!")
        time.sleep(5)
        sys.exit(1)
    
    print("  System ready!")
    url = "http://127.0.0.1:5000"
    
    # Open browser only if not in a Flask reloader child process
    if os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        try:
            import webview
            webview.create_window("SAS - Smart Accounting Suite", url, width=1280, height=800)
            webview.start()
        except Exception:
            webbrowser.open(url)
            print("\n  Application is running. Do NOT close this window!")
        try:
            while True: time.sleep(1)
        except KeyboardInterrupt:
            print("\n  Goodbye!")

if __name__ == "__main__":
    launch_desktop()
