import sqlite3
import os

DB_PATH = 'instance/sas.db'

def cleanup():
    if not os.path.exists(DB_PATH):
        return
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Names to remove if they were created as real records by mistake
    names = ['اختر الاسم', '-- اختر الاسم --', 'عميل نقدي', 'عميل نقدي WALK IN']
    
    # We keep CUST-001 (the real one) if it's named 'عميل نقدي' in seed data
    # but the user said they don't want it in the list.
    
    # Actually, let's just remove the ones specifically mentioned as unwanted.
    cursor.execute("DELETE FROM Customers WHERE name_ar = 'اختر الاسم' OR name_ar = '-- اختر الاسم --'")
    count = cursor.rowcount
    
    conn.commit()
    conn.close()
    print(f"Removed {count} records.")

if __name__ == "__main__":
    cleanup()
