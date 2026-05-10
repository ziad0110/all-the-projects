"""
Seed Permissions Script - تهيئة الصلاحيات الافتراضية
هذا السكريبت يقوم بتعبئة جداول الصلاحيات وربطها بالأدوار الافتراضية (مدير، كاشير).
"""
import sqlite3
import os

DB_PATH = "instance/sas.db"

PERMISSIONS = [
    # Module, Code, Name AR, Name EN
    ('POS', 'pos_access', 'الدخول لنقطة البيع', 'POS Access'),
    ('SALES', 'view_sales', 'عرض المبيعات', 'View Sales'),
    ('SALES', 'delete_sales', 'حذف/تعديل الفواتير', 'Delete/Edit Invoices'),
    ('PURCHASES', 'manage_purchases', 'إدارة المشتريات', 'Manage Purchases'),
    ('INVENTORY', 'manage_inventory', 'إدارة المخزون', 'Manage Inventory'),
    ('ACCOUNTING', 'view_accounting', 'عرض الحسابات', 'View Accounting'),
    ('ACCOUNTING', 'manage_journals', 'إدارة القيود المحاسبية', 'Manage Journal Entries'),
    ('REPORTS', 'view_reports', 'عرض التقارير المالية', 'View Financial Reports'),
    ('SETTINGS', 'manage_settings', 'إدارة إعدادات النظام', 'Manage System Settings'),
    ('USERS', 'manage_users', 'إدارة المستخدمين والصلاحيات', 'Manage Users & Permissions'),
]

def seed():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("--- Seeding Permissions ---")
    for module, code, name_ar, name_en in PERMISSIONS:
        cursor.execute("""
            INSERT OR IGNORE INTO Permissions (module, permission_code, name_ar, name_en)
            VALUES (?, ?, ?, ?)
        """, (module, code, name_ar, name_en))
    
    conn.commit()

    # Get Role IDs
    admin_role = cursor.execute("SELECT role_id FROM Roles WHERE role_code = 'ADMIN'").fetchone()
    cashier_role = cursor.execute("SELECT role_id FROM Roles WHERE role_code = 'CASHIER'").fetchone()

    if admin_role:
        role_id = admin_role[0]
        print(f"Linking all permissions to ADMIN (Role ID: {role_id})")
        # Admin gets everything
        all_perms = cursor.execute("SELECT permission_id FROM Permissions").fetchall()
        for p in all_perms:
            cursor.execute("INSERT OR IGNORE INTO RolePermissions (role_id, permission_id) VALUES (?, ?)", (role_id, p[0]))

    if cashier_role:
        role_id = cashier_role[0]
        print(f"Linking basic permissions to CASHIER (Role ID: {role_id})")
        # Cashier gets only POS and limited view
        cashier_perms = ['pos_access', 'view_sales']
        for code in cashier_perms:
            p_id = cursor.execute("SELECT permission_id FROM Permissions WHERE permission_code = ?", (code,)).fetchone()
            if p_id:
                cursor.execute("INSERT OR IGNORE INTO RolePermissions (role_id, permission_id) VALUES (?, ?)", (role_id, p_id[0]))

    conn.commit()
    conn.close()
    print("--- Done! ---")

if __name__ == "__main__":
    seed()
