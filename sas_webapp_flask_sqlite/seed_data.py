import os
import sqlite3
from werkzeug.security import generate_password_hash

from services import create_purchase_invoice, create_sales_invoice, create_sales_return, get_connection


ACCOUNTS = [
    ("1000", None, "الأصول", "ASSET", "DEBIT", 1, 1, 1),
    ("1110", 1, "الصندوق", "ASSET", "DEBIT", 2, 0, 1),
    ("1200", 1, "الذمم المدينة", "ASSET", "DEBIT", 2, 0, 1),
    ("1300", 1, "المخزون", "ASSET", "DEBIT", 2, 0, 1),
    ("2000", None, "الالتزامات", "LIABILITY", "CREDIT", 1, 1, 1),
    ("2100", 5, "الذمم الدائنة", "LIABILITY", "CREDIT", 2, 0, 1),
    ("2200", 5, "ضريبة المبيعات", "LIABILITY", "CREDIT", 2, 0, 1),
    ("3000", None, "حقوق الملكية", "EQUITY", "CREDIT", 1, 1, 1),
    ("3100", 8, "رأس المال", "EQUITY", "CREDIT", 2, 0, 1),
    ("4000", None, "الإيرادات", "REVENUE", "CREDIT", 1, 1, 1),
    ("4100", 10, "إيرادات المبيعات", "REVENUE", "CREDIT", 2, 0, 1),
    ("4190", 10, "مردودات المبيعات", "REVENUE", "DEBIT", 2, 0, 1),
    ("5000", None, "المصروفات", "EXPENSE", "DEBIT", 1, 1, 1),
    ("5100", 13, "تكلفة البضاعة المباعة", "EXPENSE", "DEBIT", 2, 0, 1),
    ("6100", 13, "مصروفات تشغيلية", "EXPENSE", "DEBIT", 2, 0, 1),
]


def initialize_database(db_path: str, schema_path: str, with_demo: bool = True, force: bool = False):
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    # If force is true, we delete the file
    if force and os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception as e:
            print(f"Warning: Could not remove database file: {e}")

    # Check if the database is actually initialized (has Users table)
    is_initialized = False
    if os.path.exists(db_path) and os.path.getsize(db_path) > 0:
        try:
            conn = sqlite3.connect(db_path)
            res = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'").fetchone()
            if res:
                is_initialized = True
            conn.close()
        except Exception:
            is_initialized = False

    if is_initialized and not force:
        return

    # Initialize from schema
    conn = get_connection(db_path)
    try:
        with open(schema_path, "r", encoding="utf-8") as handle:
            conn.executescript(handle.read())
        
        # Always seed essential data if we are here
        seed_demo_data(conn, with_demo)
        conn.commit()
    except Exception as e:
        print(f"Error during database initialization: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()


def seed_demo_data(conn: sqlite3.Connection, with_demo: bool = True):
    # Helper to safe-execute
    def safe_run(label, func):
        try:
            func()
        except Exception as e:
            print(f"Error seeding {label}: {e}")

    # 1. Currencies
    def seed_currencies():
        if conn.execute("SELECT COUNT(*) FROM Currencies").fetchone()[0] == 0:
            conn.execute("INSERT INTO Currencies (code, name_ar, name_en, symbol, decimal_places, is_base, is_active) VALUES ('YER', 'ريال يمني', 'Yemeni Rial', 'ر.ي', 0, 1, 1)")
            conn.execute("INSERT INTO Currencies (code, name_ar, name_en, symbol, decimal_places, is_base, is_active) VALUES ('USD', 'دولار أمريكي', 'US Dollar', '$', 2, 0, 1)")
    safe_run("Currencies", seed_currencies)

    # 2. Company
    def seed_company():
        if conn.execute("SELECT COUNT(*) FROM Company").fetchone()[0] == 0:
            conn.execute("""
                INSERT INTO Company (company_id, name_ar, name_en, legal_name, tax_number, commercial_reg, address_ar, phone, email, website, base_currency_id, fiscal_year_start_month)
                VALUES (1, 'مؤسسة النظام الذكي التجارية', 'Smart Accounting Demo Co.', 'مؤسسة النظام الذكي التجارية', '1000000000', '1010101010', 'صنعاء - حدة', '736499765', 'info@example.com', 'https://example.com', 1, 1)
            """)
    safe_run("Company", seed_company)

    # 3. Roles
    def seed_roles():
        if conn.execute("SELECT COUNT(*) FROM Roles").fetchone()[0] == 0:
            roles = [
                ("ADMIN", "مدير النظام", "System Admin", "Full access", 1, 1),
                ("CASHIER", "كاشير", "Cashier", "POS user", 0, 1),
                ("ACCOUNTANT", "محاسب", "Accountant", "Accounting user", 0, 1),
            ]
            conn.executemany(
                "INSERT INTO Roles (role_code, name_ar, name_en, description, is_system, is_active) VALUES (?, ?, ?, ?, ?, ?)",
                roles,
            )
    safe_run("Roles", seed_roles)

    # 4. Permissions
    def seed_permissions():
        if conn.execute("SELECT COUNT(*) FROM Permissions").fetchone()[0] == 0:
            permissions = [
                ("manage_items", "INVENTORY", "إدارة الأصناف", "Manage Items"),
                ("manage_sales", "SALES", "إدارة المبيعات", "Manage Sales"),
                ("manage_purchases", "PURCHASES", "إدارة المشتريات", "Manage Purchases"),
                ("manage_customers", "CONTACTS", "إدارة العملاء", "Manage Customers"),
                ("manage_suppliers", "CONTACTS", "إدارة الموردين", "Manage Suppliers"),
                ("manage_accounts", "ACCOUNTING", "إدارة الحسابات", "Manage Accounts"),
                ("view_reports", "REPORTS", "عرض التقارير", "View Reports"),
                ("manage_settings", "SETTINGS", "إعدادات النظام", "Manage Settings"),
                ("manage_users", "USERS", "إدارة المستخدمين", "Manage Users"),
                ("pos_access", "SALES", "الوصول لنقطة البيع", "POS Access"),
            ]
            conn.executemany(
                "INSERT INTO Permissions (permission_code, module, name_ar, name_en) VALUES (?, ?, ?, ?)",
                permissions,
            )
    safe_run("Permissions", seed_permissions)

    # 5. Role Permissions
    def seed_role_perms():
        if conn.execute("SELECT COUNT(*) FROM RolePermissions").fetchone()[0] == 0:
            # Refresh maps
            roles_rows = conn.execute("SELECT role_id, role_code FROM Roles").fetchall()
            role_id_map = {row[1]: row[0] for row in roles_rows}
            
            perms_rows = conn.execute("SELECT permission_id, permission_code FROM Permissions").fetchall()
            perm_map = {row[1]: row[0] for row in perms_rows}
            
            if "ADMIN" in role_id_map:
                admin_id = role_id_map["ADMIN"]
                conn.execute("INSERT INTO RolePermissions (role_id, permission_id) SELECT ?, permission_id FROM Permissions", (admin_id,))
            
            if "CASHIER" in role_id_map and "pos_access" in perm_map:
                conn.execute("INSERT INTO RolePermissions (role_id, permission_id) VALUES (?, ?)", (role_id_map["CASHIER"], perm_map["pos_access"]))
            
            if "ACCOUNTANT" in role_id_map:
                acc_id = role_id_map["ACCOUNTANT"]
                for p_code in ["manage_accounts", "view_reports", "manage_sales", "manage_purchases"]:
                    if p_code in perm_map:
                        conn.execute("INSERT INTO RolePermissions (role_id, permission_id) VALUES (?, ?)", (acc_id, perm_map[p_code]))
    safe_run("RolePermissions", seed_role_perms)

    # 6. Categories (Essential Defaults)
    def seed_categories():
        if conn.execute("SELECT COUNT(*) FROM Categories").fetchone()[0] == 0:
            categories = [
                ("01", "عام", "General", 1),
                ("02", "إلكترونيات", "Electronics", 2),
                ("03", "مواد غذائية", "Foodstuffs", 3),
                ("04", "أدوات منزلية", "Home Appliances", 4),
            ]
            conn.executemany(
                "INSERT INTO Categories (code, name_ar, name_en, sort_order, is_active) VALUES (?, ?, ?, ?, 1)",
                categories
            )
    safe_run("Categories", seed_categories)

    # 7. Units (Essential Defaults)
    def seed_units():
        if conn.execute("SELECT COUNT(*) FROM Units").fetchone()[0] == 0:
            units = [
                ("PCS", "حبة", "Piece"),
                ("BOX", "كرتون", "Box"),
                ("KG", "كيلو", "Kilogram"),
                ("MTR", "متر", "Meter"),
                ("PKT", "بكت", "Packet"),
            ]
            conn.executemany(
                "INSERT INTO Units (code, name_ar, name_en) VALUES (?, ?, ?)",
                units
            )
    safe_run("Units", seed_units)

    # 8. Price Levels (Essential Defaults)
    def seed_price_levels():
        if conn.execute("SELECT COUNT(*) FROM PriceLevels").fetchone()[0] == 0:
            levels = [
                ("RET", "سعر التجزئة", "Retail Price", 1, 1),
                ("WHL", "سعر الجملة", "Wholesale Price", 0, 2),
                ("VIP", "سعر خاص", "VIP Price", 0, 3),
            ]
            conn.executemany(
                "INSERT INTO PriceLevels (code, name_ar, name_en, is_default, sort_order, is_active) VALUES (?, ?, ?, ?, ?, 1)",
                levels
            )
    safe_run("Price Levels", seed_price_levels)

    # 9. System Settings (Essential Defaults)
    def seed_settings():
        if conn.execute("SELECT COUNT(*) FROM Settings").fetchone()[0] == 0:
            settings = [
                ("tax_enabled", "0", "BOOLEAN", "FINANCE", "Enable VAT/Tax calculation"),
                ("tax_rate", "15", "NUMBER", "FINANCE", "Default VAT rate"),
                ("allow_negative_stock", "0", "BOOLEAN", "INVENTORY", "Allow selling items with zero stock"),
                ("pos_print_receipt", "1", "BOOLEAN", "POS", "Print receipt automatically after sale"),
                ("decimal_places", "2", "NUMBER", "GENERAL", "Number of decimal places for amounts"),
            ]
            conn.executemany(
                "INSERT INTO Settings (setting_key, setting_value, data_type, category, description) VALUES (?, ?, ?, ?, ?)",
                settings
            )
    safe_run("Settings", seed_settings)

    # 10. Chart of Accounts
    def seed_accounts():
        if conn.execute("SELECT COUNT(*) FROM ChartOfAccounts").fetchone()[0] == 0:
            account_map = {}
            for code, _, name_ar, acc_type, nature, level, is_parent, is_active in ACCOUNTS:
                parent_code = None
                if code.startswith("11") or code.startswith("12") or code.startswith("13"): parent_code = "1000"
                elif code.startswith("21") or code.startswith("22"): parent_code = "2000"
                elif code.startswith("31"): parent_code = "3000"
                elif code.startswith("41"): parent_code = "4000"
                elif code.startswith("51") or code.startswith("61"): parent_code = "5000"
                
                parent_id = account_map.get(parent_code)
                cursor = conn.execute(
                    "INSERT INTO ChartOfAccounts (account_code, parent_id, name_ar, name_en, account_type, account_nature, level, is_parent, is_system, is_active, opening_balance, current_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0, 0)",
                    (code, parent_id, name_ar, name_ar, acc_type, nature, level, is_parent, is_active),
                )
                account_map[code] = cursor.lastrowid
    safe_run("Accounts", seed_accounts)

    # 11. Essential Branch & Warehouse (Mandatory for POS/Stock)
    def seed_essentials_org():
        if conn.execute("SELECT COUNT(*) FROM Branches").fetchone()[0] == 0:
            conn.execute("INSERT INTO Branches (branch_code, name_ar, is_main, is_active) VALUES ('MAIN', 'المركز الرئيسي', 1, 1)")
        
        main_branch_id = conn.execute("SELECT branch_id FROM Branches WHERE branch_code = 'MAIN'").fetchone()[0]
        
        if conn.execute("SELECT COUNT(*) FROM Warehouses").fetchone()[0] == 0:
            conn.execute("INSERT INTO Warehouses (branch_id, warehouse_code, name_ar, is_default, is_active) VALUES (?, 'WH01', 'المستودع الرئيسي', 1, 1)", (main_branch_id,))
    safe_run("Essential Org", seed_essentials_org)

    # 12. Initial Users
    def seed_users():
        if conn.execute("SELECT COUNT(*) FROM Users").fetchone()[0] == 0:
            roles_rows = conn.execute("SELECT role_id, role_code FROM Roles").fetchall()
            role_id_map = {row[1]: row[0] for row in roles_rows}
            
            # Check if we have any branches
            branch_row = conn.execute("SELECT branch_id FROM Branches LIMIT 1").fetchone()
            branch_id = branch_row[0] if branch_row else None

            users = [
                ("admin", generate_password_hash("admin123"), "مدير النظام", "admin@example.com", "736499765", role_id_map.get("ADMIN", 1), branch_id, 1),
                ("cashier", generate_password_hash("cash123"), "كاشير الفرع", "cashier@example.com", "736499765", role_id_map.get("CASHIER", 2), branch_id, 1),
                ("accountant", generate_password_hash("acc123"), "المحاسب العام", "acc@example.com", "736499765", role_id_map.get("ACCOUNTANT", 3), branch_id, 1),
            ]
            conn.executemany("INSERT INTO Users (username, password_hash, full_name_ar, email, phone, role_id, branch_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", users)
    safe_run("Users", seed_users)

    # 13. Transaction Demo Data (Optional)
    if with_demo:
        try:
            print("Seeding demo data (Branches, Warehouses, Transactions)...")
            
            # Seed Branches & Warehouses
            if conn.execute("SELECT COUNT(*) FROM Branches").fetchone()[0] == 0:
                conn.execute("INSERT INTO Branches (branch_code, name_ar, is_main, is_active) VALUES ('MAIN', 'المركز الرئيسي', 1, 1)")
                conn.execute("INSERT INTO Branches (branch_code, name_ar, is_main, is_active) VALUES ('ADE', 'فرع عدن', 0, 1)")
            
            if conn.execute("SELECT COUNT(*) FROM Warehouses").fetchone()[0] == 0:
                main_branch_id = conn.execute("SELECT branch_id FROM Branches WHERE branch_code = 'MAIN'").fetchone()[0]
                ade_branch_id = conn.execute("SELECT branch_id FROM Branches WHERE branch_code = 'ADE'").fetchone()[0]
                conn.execute("INSERT INTO Warehouses (branch_id, warehouse_code, name_ar, is_default, is_active) VALUES (?, 'WH01', 'مستودع صنعاء الرئيسي', 1, 1)", (main_branch_id,))
                conn.execute("INSERT INTO Warehouses (branch_id, warehouse_code, name_ar, is_default, is_active) VALUES (?, 'SAN-RET', 'مستودع معرض صنعاء', 0, 1)", (main_branch_id,))
                conn.execute("INSERT INTO Warehouses (branch_id, warehouse_code, name_ar, is_default, is_active) VALUES (?, 'ADE-MAIN', 'مستودع عدن', 1, 1)", (ade_branch_id,))

            # Update Admin user's branch if we just created them
            branch_id_row = conn.execute("SELECT branch_id FROM Branches LIMIT 1").fetchone()
            if branch_id_row:
                conn.execute("UPDATE Users SET branch_id = ? WHERE branch_id IS NULL", (branch_id_row[0],))

        except Exception as e:
            print(f"Error seeding demo data: {e}")
            import traceback
            traceback.print_exc()
