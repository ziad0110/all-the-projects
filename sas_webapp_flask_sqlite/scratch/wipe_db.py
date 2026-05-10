import sqlite3
import os

DB_PATH = 'instance/sas.db'

def wipe_data():
    if not os.path.exists(DB_PATH):
        print("Database not found.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tables to clear (Transactional)
    tables_to_clear = [
        "SalesInvoiceItems", "SalesInvoices",
        "PurchaseInvoiceItems", "PurchaseInvoices",
        "SalesReturnItems", "SalesReturns",
        "PurchaseReturnItems", "PurchaseReturns",
        "JournalEntries", "JournalEntryLines",
        "StockTransactions", "StockBatches",
        "CashSessions", "Expenses",
        "Checks", "InventoryCounts", "InventoryCountItems",
        "InventoryTransfers", "InventoryTransferItems",
        "Quotations", "QuotationItems",
        "AuditLog"
    ]
    
    # Master data to clear
    master_tables = [
        "Items", "ItemUnits", "ItemPrices",
        "Customers", "Suppliers",
        "Categories"
    ]
    
    print("Wiping transactional data...")
    for table in tables_to_clear:
        try:
            cursor.execute(f"DELETE FROM {table}")
            cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
        except:
            pass
            
    print("Wiping master data...")
    for table in master_tables:
        try:
            cursor.execute(f"DELETE FROM {table}")
            cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
        except:
            pass
            
    conn.commit()
    conn.close()
    print("Database is now clean.")

if __name__ == "__main__":
    wipe_data()
