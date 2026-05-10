import os
import sqlite3
from seed_data import initialize_database

db_path = "scratch/test_sas.db"
schema_path = "schema.sql"

if os.path.exists(db_path):
    os.remove(db_path)

try:
    initialize_database(db_path, schema_path, with_demo=False)
    conn = sqlite3.connect(db_path)
    users = conn.execute("SELECT username FROM Users").fetchall()
    print(f"Users created: {users}")
    roles = conn.execute("SELECT name_ar FROM Roles").fetchall()
    print(f"Roles created: {roles}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
