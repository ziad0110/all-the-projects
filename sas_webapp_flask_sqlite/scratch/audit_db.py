import sqlite3
import os

db_path = r'c:\Users\ziad\Desktop\sas_webapp_flask_sqlite\instance\sas.db'
if not os.path.exists(db_path):
    db_path = r'c:\Users\ziad\Desktop\sas_webapp_flask_sqlite\sas.db'

print(f"Connecting to {db_path}...")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cur.fetchall()]

print("Tables in database:")
for t in sorted(tables):
    print(f"- {t}")

expected_tables = [
    "Users", "Roles", "Permissions", "RolePermissions", "Branches", "Warehouses",
    "Currencies", "Categories", "Units", "Items", "ItemUnits", "PriceLevels",
    "Stock", "StockMovements", "StockBatches", "FiscalYears", "ChartOfAccounts",
    "JournalEntries", "JournalEntryLines", "Expenses", "Checks", "Customers",
    "Suppliers", "SalesInvoices", "SalesInvoiceItems", "CashSessions", "Payments",
    "SalesReturns", "SalesReturnItems", "HeldInvoices", "PurchaseInvoices",
    "PurchaseInvoiceItems", "StockTransfers", "StockTransferItems", "PurchaseReturns",
    "Quotations", "QuotationItems", "AuditLog"
]

missing = []
for t in expected_tables:
    if t not in tables:
        missing.append(t)

if missing:
    print("\nMissing tables:")
    for t in missing:
        print(f"!!! {t}")
else:
    print("\nAll expected tables are present.")

conn.close()
