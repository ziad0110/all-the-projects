import sqlite3
import os

DB_PATH = 'instance/sas.db'

def apply_indexes():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    indexes = [
        ("idx_customers_code", "Customers(customer_code)"),
        ("idx_customers_phone", "Customers(phone)"),
        ("idx_suppliers_code", "Suppliers(supplier_code)"),
        ("idx_items_barcode", "ItemBarcodes(barcode_value)"),
        ("idx_items_code", "Items(item_code)"),
        ("idx_sales_inv_no", "SalesInvoices(invoice_number)"),
        ("idx_sales_date", "SalesInvoices(invoice_date)"),
        ("idx_purchase_inv_no", "PurchaseInvoices(invoice_number)"),
        ("idx_stock_warehouse", "Stock(warehouse_id, item_id)"),
        ("idx_journal_number", "JournalEntries(entry_number)"),
        ("idx_journal_date", "JournalEntries(entry_date)"),
    ]

    print("Applying performance indexes...")
    for idx_name, target in indexes:
        try:
            cursor.execute(f"CREATE INDEX IF NOT EXISTS {idx_name} ON {target}")
            print(f" [OK] {idx_name}")
        except Exception as e:
            print(f" [ERROR] {idx_name}: {e}")

    conn.commit()
    conn.close()
    print("Optimization complete.")

if __name__ == "__main__":
    apply_indexes()
