import sqlite3
import os

db_path = r'c:\Users\ziad\Desktop\sas_webapp_flask_sqlite\instance\sas.db'
if not os.path.exists(db_path):
    db_path = r'c:\Users\ziad\Desktop\sas_webapp_flask_sqlite\sas.db'

print(f"Connecting to {db_path}...")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

try:
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Quotations'")
    if cur.fetchone():
        print("Table Quotations already exists.")
    else:
        print("Creating Quotations table...")
        cur.execute("""
        CREATE TABLE Quotations (
            quotation_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            quotation_number VARCHAR(30) UNIQUE NOT NULL,
            quotation_date  DATE NOT NULL,
            valid_until     DATE,
            customer_id     INTEGER,
            branch_id       INTEGER NOT NULL,
            warehouse_id    INTEGER NOT NULL,
            currency_id     INTEGER NOT NULL,
            exchange_rate   DECIMAL(18,6) DEFAULT 1,
            subtotal        DECIMAL(18,4) NOT NULL DEFAULT 0,
            discount_amount DECIMAL(18,4) DEFAULT 0,
            tax_amount      DECIMAL(18,4) DEFAULT 0,
            total           DECIMAL(18,4) NOT NULL DEFAULT 0,
            status          VARCHAR(20) DEFAULT 'DRAFT',
            converted_invoice_id INTEGER,
            notes           TEXT,
            created_by      INTEGER,
            created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id)  REFERENCES Customers(customer_id),
            FOREIGN KEY (branch_id)    REFERENCES Branches(branch_id),
            FOREIGN KEY (warehouse_id) REFERENCES Warehouses(warehouse_id),
            FOREIGN KEY (currency_id)  REFERENCES Currencies(currency_id),
            FOREIGN KEY (created_by)   REFERENCES Users(user_id),
            FOREIGN KEY (converted_invoice_id) REFERENCES SalesInvoices(invoice_id)
        )
        """)

    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='QuotationItems'")
    if cur.fetchone():
        print("Table QuotationItems already exists.")
    else:
        print("Creating QuotationItems table...")
        cur.execute("""
        CREATE TABLE QuotationItems (
            line_id         INTEGER PRIMARY KEY AUTOINCREMENT,
            quotation_id    INTEGER NOT NULL,
            item_id         INTEGER NOT NULL,
            item_unit_id    INTEGER NOT NULL,
            quantity        DECIMAL(18,4) NOT NULL,
            unit_price      DECIMAL(18,4) NOT NULL,
            discount_amount DECIMAL(18,4) DEFAULT 0,
            tax_rate        DECIMAL(5,2) DEFAULT 0,
            tax_amount      DECIMAL(18,4) DEFAULT 0,
            line_total      DECIMAL(18,4) NOT NULL,
            notes           VARCHAR(250),
            FOREIGN KEY (quotation_id) REFERENCES Quotations(quotation_id) ON DELETE CASCADE,
            FOREIGN KEY (item_id)      REFERENCES Items(item_id),
            FOREIGN KEY (item_unit_id) REFERENCES ItemUnits(item_unit_id)
        )
        """)

    conn.commit()
    print("Done! Database tables are ready.")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
