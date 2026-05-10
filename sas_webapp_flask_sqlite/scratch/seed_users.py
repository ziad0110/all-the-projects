import sqlite3
from werkzeug.security import generate_password_hash

conn = sqlite3.connect('instance/sas.db')
cursor = conn.cursor()

# Get roles
roles = {r[1]: r[0] for r in cursor.execute('SELECT role_id, role_code FROM Roles').fetchall()}

users_to_add = [
    ('cashier', generate_password_hash('cash123'), 'كاشير الفرع', roles.get('CASHIER')),
    ('accountant', generate_password_hash('acc123'), 'المحاسب العام', roles.get('ACCOUNTANT'))
]

for username, pwd_hash, name, role_id in users_to_add:
    cursor.execute('SELECT 1 FROM Users WHERE username = ?', (username,))
    if not cursor.fetchone():
        cursor.execute('INSERT INTO Users (username, password_hash, full_name_ar, role_id, branch_id, is_active) VALUES (?, ?, ?, ?, 1, 1)',
                      (username, pwd_hash, name, role_id))
        print(f"Added user: {username}")

conn.commit()
conn.close()
