import sqlite3
import os
from werkzeug.security import generate_password_hash

db_path = "instance/sas.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check users
    cursor.execute("SELECT user_id, username FROM Users")
    users = cursor.fetchall()
    print(f"Existing users: {users}")
    
    # Reset admin password
    new_hash = generate_password_hash("admin123")
    cursor.execute("UPDATE Users SET password_hash = ? WHERE username = 'admin'", (new_hash,))
    if cursor.rowcount > 0:
        print("Admin password has been reset to 'admin123'")
    else:
        # Create admin if missing
        cursor.execute("INSERT INTO Users (username, password_hash, full_name_ar, role_id, branch_id, is_active) VALUES (?, ?, ?, ?, ?, ?)",
                      ("admin", new_hash, "مدير النظام", 1, 1, 1))
        print("Admin user created with password 'admin123'")
        
    conn.commit()
    conn.close()
else:
    print("Database file not found.")
