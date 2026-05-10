import sqlite3
import os
from pathlib import Path

# Target the AppData location where the installed app stores its database
app_data_base = Path(os.environ.get('APPDATA')) / "SmartAccountingSuite"
db_path = app_data_base / "instance" / "sas.db"

print(f"Targeting installed app database at: {db_path}")

if not db_path.exists():
    print("Database file not found at this location. Is the app installed and has it been run once?")
    # Also check dev locations just in case
    dev_path = Path(r'c:\Users\ziad\Desktop\sas_webapp_flask_sqlite\instance\sas.db')
    if dev_path.exists():
        db_path = dev_path
        print(f"Using dev path instead: {db_path}")
    else:
        dev_path2 = Path(r'c:\Users\ziad\Desktop\sas_webapp_flask_sqlite\sas.db')
        if dev_path2.exists():
            db_path = dev_path2
            print(f"Using dev path instead: {db_path}")

conn = sqlite3.connect(str(db_path))
cur = conn.cursor()

try:
    print("Checking/Creating Quotations table...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS Quotations (
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

    print("Checking/Creating QuotationItems table...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS QuotationItems (
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
    print("Done! The installed application's database has been updated.")
except Exception as e:
    print(f"Error updating database: {e}")
finally:
    conn.close()
