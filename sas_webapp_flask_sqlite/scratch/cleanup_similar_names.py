import sqlite3
import os
import re

DB_PATH = 'instance/sas.db'

def super_norm(text):
    if not text: return ""
    t = text.replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ة','ه').replace('ى','ي')
    t = re.sub(r'\W+', '', t)
    t = re.sub(r'(.)\1+', r'\1', t)
    return t

def cleanup_similar_names():
    if not os.path.exists(DB_PATH):
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT customer_id, name_ar FROM Customers")
    customers = cursor.fetchall()
    
    seen_norms = {}
    to_delete = []
    
    for cid, name in customers:
        n = super_norm(name)
        if not n: continue
        
        if n in seen_norms:
            to_delete.append(cid)
        else:
            seen_norms[n] = cid
            
    if to_delete:
        cursor.execute(f"DELETE FROM Customers WHERE customer_id IN ({','.join(map(str, to_delete))})")
        conn.commit()
        print(f"Cleanup finished. Deleted {len(to_delete)} similar records.")
    else:
        print("No similar names found.")
        
    conn.close()

if __name__ == "__main__":
    cleanup_similar_names()
