from pathlib import Path
from seed_data import initialize_database
from services import get_connection, create_purchase_invoice, create_sales_invoice, create_sales_return

BASE = Path(__file__).resolve().parent
DB = BASE / 'instance' / 'test_sas.db'
SCHEMA = BASE / 'schema.sql'

initialize_database(str(DB), str(SCHEMA), with_demo=True, force=True)
conn = get_connection(str(DB))

assert conn.execute("SELECT COUNT(*) FROM Users").fetchone()[0] >= 3
assert conn.execute("SELECT COUNT(*) FROM Items").fetchone()[0] >= 4
assert conn.execute("SELECT COUNT(*) FROM PurchaseInvoices").fetchone()[0] >= 2
assert conn.execute("SELECT COUNT(*) FROM SalesInvoices").fetchone()[0] >= 1
assert conn.execute("SELECT COUNT(*) FROM JournalEntries").fetchone()[0] >= 3

item_id = conn.execute("SELECT item_id FROM Items WHERE item_code='ITM-002'").fetchone()[0]
item_unit_id = conn.execute("SELECT iu.item_unit_id FROM ItemUnits iu JOIN Items i ON i.item_id=iu.item_id JOIN Units u ON u.unit_id=iu.unit_id WHERE i.item_code='ITM-002' AND u.code='KG'").fetchone()[0]

before_qty = float(conn.execute("SELECT quantity FROM Stock WHERE item_id=? AND warehouse_id=1", (item_id,)).fetchone()[0])
purchase_id = create_purchase_invoice(conn, {
    'invoice_date': '2026-05-04',
    'branch_id': 1,
    'warehouse_id': 1,
    'supplier_id': 1,
    'payment_type': 'CREDIT',
    'paid_amount': 0,
    'created_by': 1,
    'items': [
        {'item_id': item_id, 'item_unit_id': item_unit_id, 'quantity': 10, 'unit_cost': 13, 'tax_amount': 0, 'discount_amount': 0, 'batch_number': 'TST-BATCH', 'expiry_date': '2026-12-31'}
    ]
})
conn.commit()
after_purchase_qty = float(conn.execute("SELECT quantity FROM Stock WHERE item_id=? AND warehouse_id=1", (item_id,)).fetchone()[0])
assert round(after_purchase_qty - before_qty, 2) == 10.0

customer_id = conn.execute("SELECT customer_id FROM Customers WHERE is_walkin=0 LIMIT 1").fetchone()[0]
sales_id = create_sales_invoice(conn, {
    'invoice_date': '2026-05-04 12:00:00',
    'branch_id': 1,
    'warehouse_id': 1,
    'customer_id': customer_id,
    'payment_type': 'CREDIT',
    'paid_amount': 0,
    'created_by': 2,
    'items': [
        {'item_id': item_id, 'item_unit_id': item_unit_id, 'quantity': 5, 'unit_price': 18, 'discount_amount': 0, 'tax_rate': 0}
    ]
})
conn.commit()
after_sale_qty = float(conn.execute("SELECT quantity FROM Stock WHERE item_id=? AND warehouse_id=1", (item_id,)).fetchone()[0])
assert round(after_purchase_qty - after_sale_qty, 2) == 5.0

line_id = conn.execute("SELECT line_id FROM SalesInvoiceItems WHERE invoice_id=? LIMIT 1", (sales_id,)).fetchone()[0]
return_id = create_sales_return(conn, {
    'original_invoice_id': sales_id,
    'return_date': '2026-05-04',
    'refund_method': 'ACCOUNT',
    'created_by': 2,
    'items': [
        {'original_line_id': line_id, 'quantity': 2}
    ]
})
conn.commit()
after_return_qty = float(conn.execute("SELECT quantity FROM Stock WHERE item_id=? AND warehouse_id=1", (item_id,)).fetchone()[0])
assert round(after_return_qty - after_sale_qty, 2) == 2.0

customer_balance = float(conn.execute("SELECT current_balance FROM Customers WHERE customer_id=?", (customer_id,)).fetchone()[0])
supplier_balance = float(conn.execute("SELECT current_balance FROM Suppliers WHERE supplier_id=1").fetchone()[0])
assert customer_balance >= 0
assert supplier_balance >= 0
assert conn.execute("SELECT COUNT(*) FROM StockBatches WHERE batch_number='TST-BATCH'").fetchone()[0] == 1
assert conn.execute("SELECT COUNT(*) FROM JournalEntries WHERE reference_type='SALE_RETURN' AND reference_id=?", (return_id,)).fetchone()[0] == 1

print('SMOKE TESTS PASSED')
print({'purchase_id': purchase_id, 'sales_id': sales_id, 'return_id': return_id, 'customer_balance': customer_balance, 'supplier_balance': supplier_balance})
