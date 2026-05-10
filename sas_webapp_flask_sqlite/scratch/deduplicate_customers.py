import sqlite3
import os

DB_PATH = 'instance/sas.db'

def deduplicate_customers():
    if not os.path.exists(DB_PATH):
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Use SQL to find duplicates based on normalized names
    cursor.execute("""
        SELECT REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ة', 'ه'), 'ى', 'ي') as norm_name, COUNT(*) 
        FROM Customers 
        GROUP BY norm_name 
        HAVING COUNT(*) > 1
    """)
    duplicates = cursor.fetchall()
    
    deleted_total = 0
    for norm_name, count in duplicates:
        # Find all IDs matching this normalized name
        cursor.execute("""
            SELECT customer_id FROM Customers 
            WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ة', 'ه'), 'ى', 'ي') = ?
            ORDER BY customer_id ASC
        """, (norm_name,))
        ids = [row[0] for row in cursor.fetchall()]
        
        if len(ids) > 1:
            delete_ids = ids[1:]
            cursor.execute(f"DELETE FROM Customers WHERE customer_id IN ({','.join(map(str, delete_ids))})")
            deleted_total += len(delete_ids)
    
    conn.commit()
    conn.close()
    print(f"Cleanup finished. Deleted {deleted_total} duplicate records.")

if __name__ == "__main__":
    deduplicate_customers()
