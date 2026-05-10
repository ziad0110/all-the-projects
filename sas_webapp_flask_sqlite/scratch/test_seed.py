import sys
import os
import sqlite3
sys.path.append(os.getcwd())
from seed_data import seed_demo_data

db_path = "instance/test_seed.db"
schema_path = "schema.sql"

if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)
with open(schema_path, "r", encoding="utf-8") as f:
    conn.executescript(f.read())

print("Seeding...")
try:
    seed_demo_data(conn, with_demo=False)
    conn.commit()
    print("Seeding completed.")
except Exception as e:
    print(f"Seeding failed: {e}")
    import traceback
    traceback.print_exc()

# Check data
cat_count = conn.execute("SELECT COUNT(*) FROM Categories").fetchone()[0]
unit_count = conn.execute("SELECT COUNT(*) FROM Units").fetchone()[0]
print(f"Categories: {cat_count}")
print(f"Units: {unit_count}")

conn.close()
os.remove(db_path)
