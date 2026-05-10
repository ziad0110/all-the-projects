import sqlite3
import os

db_path = os.path.join('instance', 'sas.db')
conn = sqlite3.connect(db_path)
try:
    conn.execute("UPDATE Currencies SET name_ar = 'ريال سعودي' WHERE code = 'SAR'")
    conn.commit()
    print("Success: Updated SAR name_ar")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
