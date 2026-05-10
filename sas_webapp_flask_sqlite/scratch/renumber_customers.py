import sqlite3
import os

DB_PATH = 'instance/sas.db'

def renumber_customers():
    if not os.path.exists(DB_PATH):
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Find the highest current numeric code
    cursor.execute("SELECT customer_code FROM Customers")
    codes = cursor.fetchall()
    
    max_num = 1000
    for (c,) in codes:
        try:
            val = int(c)
            if val > max_num:
                max_num = val
        except:
            continue
            
    print(f"Current max numeric code: {max_num}")
    
    # 2. Find all customers with alphanumeric codes (contains letters)
    # We look for codes that cannot be cast to integer
    cursor.execute("SELECT customer_id, customer_code, name_ar FROM Customers")
    all_customers = cursor.fetchall()
    
    to_renumber = []
    for cid, code, name in all_customers:
        try:
            int(code)
        except:
            to_renumber.append((cid, code, name))
            
    print(f"Found {len(to_renumber)} customers to renumber.")
    
    # 3. Update them sequentially
    next_code = max_num + 1
    for cid, old_code, name in to_renumber:
        new_code = str(next_code)
        cursor.execute("UPDATE Customers SET customer_code = ? WHERE customer_id = ?", (new_code, cid))
        # print(f"Updated {name}: {old_code} -> {new_code}") # Avoid encoding crash
        next_code += 1
        
    conn.commit()
    conn.close()
    print(f"Renumbering complete. Processed {len(to_renumber)} records.")

if __name__ == "__main__":
    renumber_customers()
