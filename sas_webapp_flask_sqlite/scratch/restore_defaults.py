import sqlite3
import os

db_path = "instance/sas.db"

def restore_defaults():
    if not os.path.exists(db_path):
        print("Database not found.")
        return

    conn = sqlite3.connect(db_path)
    
    categories = [
        ("01", "عام", "General", 1),
        ("02", "إلكترونيات", "Electronics", 2),
        ("03", "مواد غذائية", "Foodstuffs", 3),
        ("04", "أدوات منزلية", "Home Appliances", 4),
    ]
    
    units = [
        ("PCS", "حبة", "Piece"),
        ("BOX", "كرتون", "Box"),
        ("KG", "كيلو", "Kilogram"),
        ("MTR", "متر", "Meter"),
        ("PKT", "بكت", "Packet"),
    ]

    levels = [
        ("RET", "سعر التجزئة", "Retail Price", 1, 1),
        ("WHL", "سعر الجملة", "Wholesale Price", 0, 2),
        ("VIP", "سعر خاص", "VIP Price", 0, 3),
    ]

    settings = [
        ("tax_enabled", "0", "BOOLEAN", "FINANCE", "Enable VAT/Tax calculation"),
        ("tax_rate", "15", "NUMBER", "FINANCE", "Default VAT rate"),
        ("allow_negative_stock", "0", "BOOLEAN", "INVENTORY", "Allow selling items with zero stock"),
        ("pos_print_receipt", "1", "BOOLEAN", "POS", "Print receipt automatically after sale"),
        ("decimal_places", "2", "NUMBER", "GENERAL", "Number of decimal places for amounts"),
    ]

    # Categories
    for code, name_ar, name_en, sort in categories:
        exists = conn.execute("SELECT 1 FROM Categories WHERE name_ar = ?", (name_ar,)).fetchone()
        if not exists:
            conn.execute("INSERT INTO Categories (code, name_ar, name_en, sort_order, is_active) VALUES (?, ?, ?, ?, 1)", (code, name_ar, name_en, sort))

    # Units
    for code, name_ar, name_en in units:
        exists = conn.execute("SELECT 1 FROM Units WHERE name_ar = ?", (name_ar,)).fetchone()
        if not exists:
            conn.execute("INSERT INTO Units (code, name_ar, name_en) VALUES (?, ?, ?)", (code, name_ar, name_en))

    # Price Levels
    for code, name_ar, name_en, is_def, sort in levels:
        exists = conn.execute("SELECT 1 FROM PriceLevels WHERE name_ar = ?", (name_ar,)).fetchone()
        if not exists:
            conn.execute("INSERT INTO PriceLevels (code, name_ar, name_en, is_default, sort_order, is_active) VALUES (?, ?, ?, ?, ?, 1)", (code, name_ar, name_en, is_def, sort))

    # Settings
    for key, val, dtype, cat, desc in settings:
        exists = conn.execute("SELECT 1 FROM Settings WHERE setting_key = ?", (key,)).fetchone()
        if not exists:
            conn.execute("INSERT INTO Settings (setting_key, setting_value, data_type, category, description) VALUES (?, ?, ?, ?, ?)", (key, val, dtype, cat, desc))

    # Branches
    exists_branch = conn.execute("SELECT 1 FROM Branches LIMIT 1").fetchone()
    if not exists_branch:
        conn.execute("INSERT INTO Branches (branch_code, name_ar, is_main, is_active) VALUES ('MAIN', 'المركز الرئيسي', 1, 1)")
    
    main_branch_id = conn.execute("SELECT branch_id FROM Branches WHERE branch_code = 'MAIN'").fetchone()[0]

    # Warehouses
    exists_wh = conn.execute("SELECT 1 FROM Warehouses LIMIT 1").fetchone()
    if not exists_wh:
        conn.execute("INSERT INTO Warehouses (branch_id, warehouse_code, name_ar, is_default, is_active) VALUES (?, 'WH01', 'المستودع الرئيسي', 1, 1)", (main_branch_id,))

    conn.commit()
    conn.close()
    print("Done.")

if __name__ == "__main__":
    restore_defaults()
