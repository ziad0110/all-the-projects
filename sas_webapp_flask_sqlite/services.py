import os
import sqlite3
import zipfile
from datetime import datetime
from typing import Any


def get_connection(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def fetch_one(conn: sqlite3.Connection, sql: str, params: tuple = ()):
    return conn.execute(sql, params).fetchone()


def fetch_value(conn: sqlite3.Connection, sql: str, params: tuple = (), default=None):
    row = conn.execute(sql, params).fetchone()
    return row[0] if row else default


def current_date() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def next_number(conn: sqlite3.Connection, table: str, field: str, prefix: str) -> str:
    row = conn.execute(
        f"SELECT {field} FROM {table} WHERE {field} LIKE ? ORDER BY ROWID DESC LIMIT 1",
        (f"{prefix}-%",),
    ).fetchone()
    if not row or not row[0]:
        return f"{prefix}-00001"
    try:
        number = int(str(row[0]).split("-")[-1]) + 1
    except ValueError:
        number = 1
    return f"{prefix}-{number:05d}"


def account_id_by_code(conn: sqlite3.Connection, code: str) -> int:
    row = conn.execute(
        "SELECT account_id FROM ChartOfAccounts WHERE account_code = ? LIMIT 1", (code,)
    ).fetchone()
    if not row:
        raise ValueError(f"Account code {code} not found")
    return int(row[0])


def get_base_currency_id(conn: sqlite3.Connection) -> int:
    row = conn.execute("SELECT currency_id FROM Currencies WHERE is_base = 1 LIMIT 1").fetchone()
    if not row:
        raise ValueError("Base currency is not configured")
    return int(row[0])


def get_current_fiscal_year(conn: sqlite3.Connection) -> int:
    row = conn.execute(
        "SELECT fiscal_year_id FROM FiscalYears WHERE is_current = 1 ORDER BY fiscal_year_id LIMIT 1"
    ).fetchone()
    if not row:
        raise ValueError("Current fiscal year is not configured")
    return int(row[0])


def ensure_stock_row(conn: sqlite3.Connection, item_id: int, warehouse_id: int) -> sqlite3.Row:
    row = conn.execute(
        "SELECT * FROM Stock WHERE item_id = ? AND warehouse_id = ?",
        (item_id, warehouse_id),
    ).fetchone()
    if row:
        return row

    default_cost = float(
        fetch_value(conn, "SELECT cost_price FROM Items WHERE item_id = ?", (item_id,), 0) or 0
    )
    conn.execute(
        """
        INSERT INTO Stock (item_id, warehouse_id, quantity, reserved_qty, avg_cost, last_updated)
        VALUES (?, ?, 0, 0, ?, CURRENT_TIMESTAMP)
        """,
        (item_id, warehouse_id, default_cost),
    )
    return conn.execute(
        "SELECT * FROM Stock WHERE item_id = ? AND warehouse_id = ?",
        (item_id, warehouse_id),
    ).fetchone()


def add_stock(conn: sqlite3.Connection, item_id: int, warehouse_id: int, quantity: float, unit_cost: float) -> float:
    row = ensure_stock_row(conn, item_id, warehouse_id)
    old_qty = float(row["quantity"] or 0)
    old_avg = float(row["avg_cost"] or 0)
    new_qty = old_qty + float(quantity)
    if new_qty < 0:
        raise ValueError("Stock quantity cannot be negative")
    if quantity > 0:
        new_avg = ((old_qty * old_avg) + (float(quantity) * float(unit_cost))) / new_qty if new_qty else float(unit_cost)
    else:
        new_avg = old_avg
    conn.execute(
        "UPDATE Stock SET quantity = ?, avg_cost = ?, last_updated = CURRENT_TIMESTAMP WHERE stock_id = ?",
        (new_qty, new_avg, row["stock_id"]),
    )
    conn.execute(
        "UPDATE Items SET cost_price = ?, updated_at = CURRENT_TIMESTAMP WHERE item_id = ?",
        (new_avg, item_id),
    )
    return new_avg


def remove_stock(conn: sqlite3.Connection, item_id: int, warehouse_id: int, quantity: float) -> float:
    row = ensure_stock_row(conn, item_id, warehouse_id)
    old_qty = float(row["quantity"] or 0)
    if old_qty < quantity:
        item_name = fetch_value(conn, "SELECT name_ar FROM Items WHERE item_id = ?", (item_id,), "الصنف")
        raise ValueError(f"الكمية غير كافية للصنف: {item_name}")
    new_qty = old_qty - float(quantity)
    conn.execute(
        "UPDATE Stock SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE stock_id = ?",
        (new_qty, row["stock_id"]),
    )
    return float(row["avg_cost"] or 0)


def create_stock_batch(
    conn: sqlite3.Connection,
    item_id: int,
    warehouse_id: int,
    quantity: float,
    cost_price: float,
    purchase_invoice_id: int | None = None,
    batch_number: str | None = None,
    production_date: str | None = None,
    expiry_date: str | None = None,
) -> int:
    cursor = conn.execute(
        """
        INSERT INTO StockBatches (
            item_id, warehouse_id, batch_number, production_date, expiry_date,
            quantity, remaining_qty, cost_price, purchase_invoice_id, received_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """,
        (
            item_id,
            warehouse_id,
            batch_number,
            production_date,
            expiry_date,
            quantity,
            quantity,
            cost_price,
            purchase_invoice_id,
        ),
    )
    return int(cursor.lastrowid)


def consume_batches(conn: sqlite3.Connection, item_id: int, warehouse_id: int, quantity: float) -> tuple[float, int | None]:
    rows = conn.execute(
        """
        SELECT * FROM StockBatches
        WHERE item_id = ? AND warehouse_id = ? AND remaining_qty > 0
        ORDER BY CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END,
                 expiry_date,
                 received_at,
                 batch_id
        """,
        (item_id, warehouse_id),
    ).fetchall()

    remaining = float(quantity)
    total_cost = 0.0
    used_batch_ids: list[int] = []

    for row in rows:
        if remaining <= 0:
            break
        available = float(row["remaining_qty"] or 0)
        if available <= 0:
            continue
        take = min(available, remaining)
        conn.execute(
            "UPDATE StockBatches SET remaining_qty = remaining_qty - ? WHERE batch_id = ?",
            (take, row["batch_id"]),
        )
        total_cost += take * float(row["cost_price"] or 0)
        remaining -= take
        used_batch_ids.append(int(row["batch_id"]))

    if remaining > 0:
        avg_cost = float(
            fetch_value(
                conn,
                "SELECT avg_cost FROM Stock WHERE item_id = ? AND warehouse_id = ?",
                (item_id, warehouse_id),
                0,
            )
            or 0
        )
        total_cost += remaining * avg_cost

    batch_id = used_batch_ids[0] if len(used_batch_ids) == 1 else None
    return total_cost, batch_id


def restore_batch(
    conn: sqlite3.Connection,
    item_id: int,
    warehouse_id: int,
    quantity: float,
    unit_cost: float,
    batch_id: int | None = None,
) -> int | None:
    if batch_id:
        row = conn.execute("SELECT batch_id FROM StockBatches WHERE batch_id = ?", (batch_id,)).fetchone()
        if row:
            conn.execute(
                "UPDATE StockBatches SET remaining_qty = remaining_qty + ? WHERE batch_id = ?",
                (quantity, batch_id),
            )
            return batch_id
    return create_stock_batch(
        conn,
        item_id=item_id,
        warehouse_id=warehouse_id,
        quantity=quantity,
        cost_price=unit_cost,
        batch_number=f"RET-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
    )


def create_stock_movement(
    conn: sqlite3.Connection,
    item_id: int,
    warehouse_id: int,
    batch_id: int | None,
    movement_type: str,
    reference_type: str,
    reference_id: int,
    quantity: float,
    unit_cost: float,
    created_by: int,
    notes: str = "",
):
    balance_after = fetch_value(
        conn,
        "SELECT quantity FROM Stock WHERE item_id = ? AND warehouse_id = ?",
        (item_id, warehouse_id),
        0,
    )
    conn.execute(
        """
        INSERT INTO StockMovements (
            item_id, warehouse_id, batch_id, movement_type, reference_type, reference_id,
            quantity, unit_cost, balance_after, notes, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """,
        (
            item_id,
            warehouse_id,
            batch_id,
            movement_type,
            reference_type,
            reference_id,
            quantity,
            unit_cost,
            balance_after,
            notes,
            created_by,
        ),
    )


def create_journal_entry(
    conn: sqlite3.Connection,
    entry_date: str,
    description: str,
    reference_type: str,
    reference_id: int,
    lines: list[dict[str, Any]],
    created_by: int,
    currency_id: int | None = None,
    exchange_rate: float = 1,
    is_auto: int = 1,
) -> int:
    if not lines:
        raise ValueError("Journal entry requires lines")

    currency_id = currency_id or get_base_currency_id(conn)
    fiscal_year_id = get_current_fiscal_year(conn)
    total_debit = round(sum(float(line.get("debit", 0) or 0) for line in lines), 4)
    total_credit = round(sum(float(line.get("credit", 0) or 0) for line in lines), 4)

    if round(total_debit, 4) != round(total_credit, 4):
        raise ValueError(f"Unbalanced journal entry: {total_debit} != {total_credit}")

    entry_number = next_number(conn, "JournalEntries", "entry_number", "JV")
    cursor = conn.execute(
        """
        INSERT INTO JournalEntries (
            entry_number, entry_date, fiscal_year_id, description, reference_type, reference_id,
            total_debit, total_credit, currency_id, exchange_rate, status, is_auto,
            created_by, created_at, posted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'POSTED', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """,
        (
            entry_number,
            entry_date,
            fiscal_year_id,
            description,
            reference_type,
            reference_id,
            total_debit,
            total_credit,
            currency_id,
            exchange_rate,
            is_auto,
            created_by,
        ),
    )
    entry_id = int(cursor.lastrowid)

    for idx, line in enumerate(lines, start=1):
        conn.execute(
            """
            INSERT INTO JournalEntryLines (entry_id, account_id, debit, credit, description, line_order)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                entry_id,
                line["account_id"],
                line.get("debit", 0),
                line.get("credit", 0),
                line.get("description", description),
                idx,
            ),
        )
    return entry_id


def create_payment_record(
    conn: sqlite3.Connection,
    direction: str,
    reference_type: str,
    reference_id: int,
    amount: float,
    currency_id: int,
    payment_method: str,
    created_by: int,
    customer_id: int | None = None,
    supplier_id: int | None = None,
    notes: str = "",
):
    if amount <= 0:
        return None
    payment_number = next_number(conn, "Payments", "payment_number", "PAY")
    cursor = conn.execute(
        """
        INSERT INTO Payments (
            payment_number, payment_date, payment_direction, reference_type, reference_id,
            customer_id, supplier_id, payment_method, amount, currency_id, exchange_rate,
            notes, created_by
        ) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        """,
        (
            payment_number,
            direction,
            reference_type,
            reference_id,
            customer_id,
            supplier_id,
            payment_method,
            amount,
            currency_id,
            notes,
            created_by,
        ),
    )
    return int(cursor.lastrowid)


def create_purchase_invoice(conn: sqlite3.Connection, payload: dict[str, Any]) -> int:
    created_by = int(payload["created_by"])
    invoice_number = payload.get("invoice_number") or next_number(conn, "PurchaseInvoices", "invoice_number", "PINV")
    invoice_date = payload.get("invoice_date") or current_date()
    branch_id = int(payload["branch_id"])
    warehouse_id = int(payload["warehouse_id"])
    supplier_id = int(payload["supplier_id"])
    payment_type = payload.get("payment_type", "CREDIT")
    currency_id = int(payload.get("currency_id") or get_base_currency_id(conn))
    exchange_rate = float(payload.get("exchange_rate", 1) or 1)
    paid_amount = float(payload.get("paid_amount", 0) or 0)
    discount_amount = float(payload.get("discount_amount", 0) or 0)
    shipping_cost = float(payload.get("shipping_cost", 0) or 0)
    notes = payload.get("notes", "")
    items = payload.get("items", [])

    if not items:
        raise ValueError("فاتورة الشراء يجب أن تحتوي على صنف واحد على الأقل")

    subtotal = 0.0
    total_tax = 0.0
    line_payloads = []

    for line in items:
        item_id = int(line["item_id"])
        item_unit_id = int(line["item_unit_id"])
        quantity = float(line["quantity"])
        unit_cost = float(line["unit_cost"])
        line_discount = float(line.get("discount_amount", 0) or 0)
        line_tax = float(line.get("tax_amount", 0) or 0)
        conversion_factor = float(
            fetch_value(conn, "SELECT conversion_factor FROM ItemUnits WHERE item_unit_id = ?", (item_unit_id,), 1) or 1
        )
        base_qty = quantity * conversion_factor
        line_total = round((quantity * unit_cost) - line_discount + line_tax, 4)
        base_unit_cost = round((line_total / base_qty), 4) if base_qty else 0
        subtotal += round((quantity * unit_cost) - line_discount, 4)
        total_tax += line_tax
        line_payloads.append(
            {
                **line,
                "item_id": item_id,
                "item_unit_id": item_unit_id,
                "quantity": quantity,
                "unit_cost": unit_cost,
                "discount_amount": line_discount,
                "tax_amount": line_tax,
                "line_total": line_total,
                "base_qty": base_qty,
                "base_unit_cost": base_unit_cost,
            }
        )

    total = round(subtotal + total_tax + shipping_cost - discount_amount, 4)
    remaining = round(total - paid_amount, 4)

    cursor = conn.execute(
        """
        INSERT INTO PurchaseInvoices (
            invoice_number, supplier_invoice_no, invoice_date, due_date, branch_id, warehouse_id,
            supplier_id, payment_type, currency_id, exchange_rate, subtotal, discount_amount,
            tax_amount, shipping_cost, total, paid_amount, remaining, status, notes,
            created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'POSTED', ?, ?, CURRENT_TIMESTAMP)
        """,
        (
            invoice_number,
            payload.get("supplier_invoice_no"),
            invoice_date,
            payload.get("due_date"),
            branch_id,
            warehouse_id,
            supplier_id,
            payment_type,
            currency_id,
            exchange_rate,
            round(subtotal, 4),
            round(discount_amount, 4),
            round(total_tax, 4),
            round(shipping_cost, 4),
            total,
            round(paid_amount, 4),
            remaining,
            notes,
            created_by,
        ),
    )
    invoice_id = int(cursor.lastrowid)

    inventory_value = 0.0
    for line in line_payloads:
        cursor = conn.execute(
            """
            INSERT INTO PurchaseInvoiceItems (
                invoice_id, item_id, item_unit_id, quantity, unit_cost, discount_amount,
                tax_amount, line_total, batch_number, production_date, expiry_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                invoice_id,
                line["item_id"],
                line["item_unit_id"],
                line["quantity"],
                line["unit_cost"],
                line["discount_amount"],
                line["tax_amount"],
                line["line_total"],
                line.get("batch_number"),
                line.get("production_date"),
                line.get("expiry_date"),
            ),
        )
        add_stock(conn, line["item_id"], warehouse_id, line["base_qty"], line["base_unit_cost"])
        item_row = conn.execute(
            "SELECT track_batches, has_expiry FROM Items WHERE item_id = ?", (line["item_id"],)
        ).fetchone()
        batch_id = None
        if item_row and (item_row["track_batches"] or item_row["has_expiry"] or line.get("batch_number") or line.get("expiry_date")):
            batch_id = create_stock_batch(
                conn,
                item_id=line["item_id"],
                warehouse_id=warehouse_id,
                quantity=line["base_qty"],
                cost_price=line["base_unit_cost"],
                purchase_invoice_id=invoice_id,
                batch_number=line.get("batch_number"),
                production_date=line.get("production_date"),
                expiry_date=line.get("expiry_date"),
            )
        create_stock_movement(
            conn,
            item_id=line["item_id"],
            warehouse_id=warehouse_id,
            batch_id=batch_id,
            movement_type="IN",
            reference_type="PURCHASE",
            reference_id=invoice_id,
            quantity=line["base_qty"],
            unit_cost=line["base_unit_cost"],
            created_by=created_by,
            notes=f"Purchase invoice {invoice_number}",
        )
        inventory_value += line["line_total"]

    conn.execute(
        "UPDATE Suppliers SET current_balance = COALESCE(current_balance, 0) + ? WHERE supplier_id = ?",
        (remaining, supplier_id),
    )

    lines = [
        {
            "account_id": account_id_by_code(conn, "1300"),
            "debit": round(inventory_value + shipping_cost - discount_amount, 4),
            "credit": 0,
            "description": f"مشتريات {invoice_number}",
        }
    ]
    if paid_amount > 0:
        lines.append(
            {
                "account_id": account_id_by_code(conn, "1110"),
                "debit": 0,
                "credit": round(paid_amount, 4),
                "description": f"دفعة نقدية للمشتريات {invoice_number}",
            }
        )
    if remaining > 0:
        lines.append(
            {
                "account_id": account_id_by_code(conn, "2100"),
                "debit": 0,
                "credit": round(remaining, 4),
                "description": f"ذمم موردين {invoice_number}",
            }
        )
    journal_id = create_journal_entry(
        conn,
        entry_date=invoice_date,
        description=f"قيد تلقائي لفاتورة شراء {invoice_number}",
        reference_type="PURCHASE",
        reference_id=invoice_id,
        lines=lines,
        created_by=created_by,
        currency_id=currency_id,
        exchange_rate=exchange_rate,
    )
    conn.execute("UPDATE PurchaseInvoices SET journal_entry_id = ? WHERE invoice_id = ?", (journal_id, invoice_id))
    create_payment_record(
        conn,
        direction="OUT",
        reference_type="PURCHASE",
        reference_id=invoice_id,
        amount=paid_amount,
        currency_id=currency_id,
        payment_method=payload.get("payment_method", "CASH"),
        created_by=created_by,
        supplier_id=supplier_id,
        notes=f"Payment for {invoice_number}",
    )
    return invoice_id


def create_sales_invoice(conn: sqlite3.Connection, payload: dict[str, Any]) -> int:
    created_by = int(payload["created_by"])
    invoice_number = payload.get("invoice_number") or next_number(conn, "SalesInvoices", "invoice_number", "SINV")
    invoice_date = payload.get("invoice_date") or current_date()
    branch_id = int(payload["branch_id"])
    warehouse_id = int(payload["warehouse_id"])
    customer_id = payload.get("customer_id")
    customer_id = int(customer_id) if customer_id not in (None, "", 0, "0") else None
    payment_type = payload.get("payment_type", "CASH")
    currency_id = int(payload.get("currency_id") or get_base_currency_id(conn))
    exchange_rate = float(payload.get("exchange_rate", 1) or 1)
    discount_value = float(payload.get("discount_value", 0) or 0)
    paid_amount = float(payload.get("paid_amount", 0) or 0)
    notes = payload.get("notes", "")
    items = payload.get("items", [])

    if not items:
        raise ValueError("فاتورة البيع يجب أن تحتوي على صنف واحد على الأقل")

    subtotal = 0.0
    total_tax = 0.0
    total_cost = 0.0
    prepared = []

    for line in items:
        item_id = int(line["item_id"])
        item_unit_id = int(line["item_unit_id"])
        quantity = float(line["quantity"])
        unit_price = float(line["unit_price"])
        discount_amount = float(line.get("discount_amount", 0) or 0)
        tax_rate = float(line.get("tax_rate", 0) or 0)
        conversion_factor = float(
            fetch_value(conn, "SELECT conversion_factor FROM ItemUnits WHERE item_unit_id = ?", (item_unit_id,), 1) or 1
        )
        base_qty = quantity * conversion_factor
        line_net = round((quantity * unit_price) - discount_amount, 4)
        tax_amount = round(line_net * (tax_rate / 100), 4)
        line_total = round(line_net + tax_amount, 4)

        item_flags = conn.execute(
            "SELECT track_batches, is_service FROM Items WHERE item_id = ?",
            (item_id,),
        ).fetchone()
        tracked = int(item_flags["track_batches"] or 0) if item_flags else 0
        is_service = int(item_flags["is_service"] or 0) if item_flags else 0
        if is_service:
            batch_id = None
            cost_total = 0.0
        else:
            available_qty = float(
                fetch_value(
                    conn,
                    "SELECT quantity FROM Stock WHERE item_id = ? AND warehouse_id = ?",
                    (item_id, warehouse_id),
                    0,
                )
                or 0
            )
            if available_qty < base_qty:
                item_name = fetch_value(conn, "SELECT name_ar FROM Items WHERE item_id = ?", (item_id,), "الصنف")
                raise ValueError(f"الرصيد غير كافٍ للصنف {item_name}. المتاح {available_qty} والمطلوب {base_qty}")

            if tracked:
                cost_total, batch_id = consume_batches(conn, item_id, warehouse_id, base_qty)
            else:
                batch_id = None
                avg_cost = float(
                    fetch_value(
                        conn,
                        "SELECT avg_cost FROM Stock WHERE item_id = ? AND warehouse_id = ?",
                        (item_id, warehouse_id),
                        0,
                    )
                    or 0
                )
                cost_total = round(base_qty * avg_cost, 4)
            remove_stock(conn, item_id, warehouse_id, base_qty)
        unit_cost_sale_unit = round(cost_total / quantity, 4) if quantity else 0
        subtotal += line_net
        total_tax += tax_amount
        total_cost += cost_total
        prepared.append(
            {
                "item_id": item_id,
                "item_unit_id": item_unit_id,
                "batch_id": batch_id,
                "quantity": quantity,
                "base_qty": base_qty,
                "unit_price": unit_price,
                "discount_amount": discount_amount,
                "tax_rate": tax_rate,
                "tax_amount": tax_amount,
                "line_total": line_total,
                "cost_price": unit_cost_sale_unit,
                "base_unit_cost": round(cost_total / base_qty, 4) if base_qty else 0,
                "track_stock": 0 if is_service else 1,
            }
        )

    discount_amount_invoice = round(discount_value, 4)
    total = round(subtotal + total_tax - discount_amount_invoice, 4)
    
    # NEW: Handle fully paid flag (common in POS)
    if payload.get("paid_amount_full"):
        paid_amount = total
    
    remaining = round(total - paid_amount, 4)

    cursor = conn.execute(
        """
        INSERT INTO SalesInvoices (
            invoice_number, invoice_date, branch_id, warehouse_id, customer_id, cash_session_id,
            cashier_id, payment_type, currency_id, exchange_rate, subtotal, discount_type,
            discount_value, discount_amount, tax_amount, total, paid_amount, remaining,
            status, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALUE', ?, ?, ?, ?, ?, ?, 'POSTED', ?, CURRENT_TIMESTAMP)
        """,
        (
            invoice_number,
            invoice_date,
            branch_id,
            warehouse_id,
            customer_id,
            payload.get("cash_session_id"),
            created_by,
            payment_type,
            currency_id,
            exchange_rate,
            round(subtotal, 4),
            discount_value,
            discount_amount_invoice,
            round(total_tax, 4),
            total,
            round(paid_amount, 4),
            remaining,
            notes,
        ),
    )
    invoice_id = int(cursor.lastrowid)

    for line in prepared:
        conn.execute(
            """
            INSERT INTO SalesInvoiceItems (
                invoice_id, item_id, item_unit_id, batch_id, quantity, unit_price,
                discount_percent, discount_amount, tax_rate, tax_amount, line_total,
                cost_price, notes
            ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
            """,
            (
                invoice_id,
                line["item_id"],
                line["item_unit_id"],
                line["batch_id"],
                line["quantity"],
                line["unit_price"],
                line["discount_amount"],
                line["tax_rate"],
                line["tax_amount"],
                line["line_total"],
                line["cost_price"],
                f"Sale invoice {invoice_number}",
            ),
        )
        if line["track_stock"]:
            create_stock_movement(
                conn,
                item_id=line["item_id"],
                warehouse_id=warehouse_id,
                batch_id=line["batch_id"],
                movement_type="OUT",
                reference_type="SALE",
                reference_id=invoice_id,
                quantity=-line["base_qty"],
                unit_cost=line["base_unit_cost"],
                created_by=created_by,
                notes=f"Sales invoice {invoice_number}",
            )

    if customer_id:
        conn.execute(
            "UPDATE Customers SET current_balance = COALESCE(current_balance, 0) + ? WHERE customer_id = ?",
            (remaining, customer_id),
        )

    net_sales = round(subtotal, 4)
    lines = []
    if paid_amount > 0:
        lines.append(
            {
                "account_id": account_id_by_code(conn, "1110"),
                "debit": round(paid_amount, 4),
                "credit": 0,
                "description": f"تحصيل نقدي {invoice_number}",
            }
        )
    if remaining > 0:
        lines.append(
            {
                "account_id": account_id_by_code(conn, "1200"),
                "debit": round(remaining, 4),
                "credit": 0,
                "description": f"ذمم عملاء {invoice_number}",
            }
        )
    lines.append(
        {
            "account_id": account_id_by_code(conn, "4100"),
            "debit": 0,
            "credit": net_sales,
            "description": f"إيراد مبيعات {invoice_number}",
        }
    )
    if total_tax > 0:
        lines.append(
            {
                "account_id": account_id_by_code(conn, "2200"),
                "debit": 0,
                "credit": round(total_tax, 4),
                "description": f"ضريبة مبيعات {invoice_number}",
            }
        )
    if total_cost > 0:
        lines.append(
            {
                "account_id": account_id_by_code(conn, "5100"),
                "debit": round(total_cost, 4),
                "credit": 0,
                "description": f"تكلفة بضاعة مباعة {invoice_number}",
            }
        )
        lines.append(
            {
                "account_id": account_id_by_code(conn, "1300"),
                "debit": 0,
                "credit": round(total_cost, 4),
                "description": f"تخفيض مخزون {invoice_number}",
            }
        )
    journal_id = create_journal_entry(
        conn,
        entry_date=invoice_date[:10],
        description=f"قيد تلقائي لفاتورة بيع {invoice_number}",
        reference_type="SALE",
        reference_id=invoice_id,
        lines=lines,
        created_by=created_by,
        currency_id=currency_id,
        exchange_rate=exchange_rate,
    )
    conn.execute("UPDATE SalesInvoices SET journal_entry_id = ? WHERE invoice_id = ?", (journal_id, invoice_id))
    create_payment_record(
        conn,
        direction="IN",
        reference_type="SALE",
        reference_id=invoice_id,
        amount=paid_amount,
        currency_id=currency_id,
        payment_method=payload.get("payment_method", "CASH"),
        created_by=created_by,
        customer_id=customer_id,
        notes=f"Receipt for {invoice_number}",
    )
    return invoice_id


def create_sales_return(conn: sqlite3.Connection, payload: dict[str, Any]) -> int:
    created_by = int(payload["created_by"])
    original_invoice_id = int(payload["original_invoice_id"])
    original_invoice = conn.execute(
        "SELECT * FROM SalesInvoices WHERE invoice_id = ?", (original_invoice_id,)
    ).fetchone()
    if not original_invoice:
        raise ValueError("فاتورة البيع الأصلية غير موجودة")

    return_number = payload.get("return_number") or next_number(conn, "SalesReturns", "return_number", "SRET")
    return_date = payload.get("return_date") or current_date()
    refund_method = payload.get("refund_method", "ACCOUNT")
    items = payload.get("items", [])

    if not items:
        raise ValueError("يجب تحديد بنود مرتجع البيع")

    total_amount = 0.0
    total_tax = 0.0
    total_cost = 0.0
    prepared = []

    for item in items:
        original_line_id = int(item["original_line_id"])
        qty_return = float(item["quantity"])
        orig_line = conn.execute(
            "SELECT * FROM SalesInvoiceItems WHERE line_id = ? AND invoice_id = ?",
            (original_line_id, original_invoice_id),
        ).fetchone()
        if not orig_line:
            raise ValueError("سطر الفاتورة الأصلي غير موجود")
        if qty_return > float(orig_line["quantity"]):
            raise ValueError("كمية المرتجع أكبر من الكمية الأصلية")

        conversion_factor = float(
            fetch_value(conn, "SELECT conversion_factor FROM ItemUnits WHERE item_unit_id = ?", (orig_line["item_unit_id"],), 1) or 1
        )
        qty_base = qty_return * conversion_factor
        unit_net = float(orig_line["unit_price"]) - (float(orig_line["discount_amount"] or 0) / float(orig_line["quantity"]))
        line_net = round(unit_net * qty_return, 4)
        line_tax = round(float(orig_line["tax_rate"] or 0) * line_net / 100, 4)
        line_total = round(line_net + line_tax, 4)
        unit_cost_sale = float(orig_line["cost_price"] or 0)
        base_unit_cost = round((unit_cost_sale * qty_return) / qty_base, 4) if qty_base else 0
        restore_batch(
            conn,
            item_id=int(orig_line["item_id"]),
            warehouse_id=int(original_invoice["warehouse_id"]),
            quantity=qty_base,
            unit_cost=base_unit_cost,
            batch_id=orig_line["batch_id"],
        )
        add_stock(conn, int(orig_line["item_id"]), int(original_invoice["warehouse_id"]), qty_base, base_unit_cost)
        create_stock_movement(
            conn,
            item_id=int(orig_line["item_id"]),
            warehouse_id=int(original_invoice["warehouse_id"]),
            batch_id=orig_line["batch_id"],
            movement_type="RETURN_IN",
            reference_type="SALE_RETURN",
            reference_id=original_invoice_id,
            quantity=qty_base,
            unit_cost=base_unit_cost,
            created_by=created_by,
            notes=f"Sales return against {original_invoice['invoice_number']}",
        )
        total_amount += line_total
        total_tax += line_tax
        total_cost += unit_cost_sale * qty_return
        prepared.append(
            {
                "original_line_id": original_line_id,
                "item_id": int(orig_line["item_id"]),
                "quantity": qty_return,
                "unit_price": float(orig_line["unit_price"]),
                "line_total": line_total,
            }
        )

    cursor = conn.execute(
        """
        INSERT INTO SalesReturns (
            return_number, return_date, original_invoice_id, customer_id, total_amount,
            refund_method, reason, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            return_number,
            return_date,
            original_invoice_id,
            original_invoice["customer_id"],
            round(total_amount, 4),
            refund_method,
            payload.get("reason", ""),
            created_by,
        ),
    )
    return_id = int(cursor.lastrowid)

    for line in prepared:
        conn.execute(
            """
            INSERT INTO SalesReturnItems (
                return_id, original_line_id, item_id, quantity, unit_price, line_total
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                return_id,
                line["original_line_id"],
                line["item_id"],
                line["quantity"],
                line["unit_price"],
                line["line_total"],
            ),
        )

    customer_id = original_invoice["customer_id"]
    if customer_id:
        conn.execute(
            "UPDATE Customers SET current_balance = COALESCE(current_balance, 0) - ? WHERE customer_id = ?",
            (round(total_amount, 4), customer_id),
        )

    lines = [
        {
            "account_id": account_id_by_code(conn, "4190"),
            "debit": round(total_amount - total_tax, 4),
            "credit": 0,
            "description": f"مردودات مبيعات {return_number}",
        }
    ]
    if total_tax > 0:
        lines.append(
            {
                "account_id": account_id_by_code(conn, "2200"),
                "debit": round(total_tax, 4),
                "credit": 0,
                "description": f"عكس ضريبة المبيعات {return_number}",
            }
        )
    refund_account = "1110" if refund_method == "CASH" else "1200"
    lines.append(
        {
            "account_id": account_id_by_code(conn, refund_account),
            "debit": 0,
            "credit": round(total_amount, 4),
            "description": f"تسوية مرتجع بيع {return_number}",
        }
    )
    if total_cost > 0:
        lines.append(
            {
                "account_id": account_id_by_code(conn, "1300"),
                "debit": round(total_cost, 4),
                "credit": 0,
                "description": f"إرجاع للمخزون {return_number}",
            }
        )
        lines.append(
            {
                "account_id": account_id_by_code(conn, "5100"),
                "debit": 0,
                "credit": round(total_cost, 4),
                "description": f"عكس تكلفة المبيعات {return_number}",
            }
        )
    journal_id = create_journal_entry(
        conn,
        entry_date=return_date,
        description=f"قيد تلقائي لمرتجع بيع {return_number}",
        reference_type="SALE_RETURN",
        reference_id=return_id,
        lines=lines,
        created_by=created_by,
        currency_id=int(original_invoice["currency_id"]),
        exchange_rate=float(original_invoice["exchange_rate"] or 1),
    )
    conn.execute("UPDATE SalesReturns SET journal_entry_id = ? WHERE return_id = ?", (journal_id, return_id))
    return return_id


def build_dashboard_metrics(conn: sqlite3.Connection) -> dict[str, Any]:
    return {
        "sales_today": round(float(fetch_value(conn, "SELECT COALESCE(SUM(total), 0) FROM SalesInvoices WHERE DATE(invoice_date) = DATE('now')", default=0) or 0), 2),
        "purchases_today": round(float(fetch_value(conn, "SELECT COALESCE(SUM(total), 0) FROM PurchaseInvoices WHERE DATE(invoice_date) = DATE('now')", default=0) or 0), 2),
        "inventory_items": int(fetch_value(conn, "SELECT COUNT(*) FROM Items WHERE is_active = 1", default=0) or 0),
        "low_stock_count": int(fetch_value(conn, "SELECT COUNT(*) FROM Stock s JOIN Items i ON i.item_id = s.item_id WHERE s.quantity <= COALESCE(i.min_stock, 0)", default=0) or 0),
        "receivables": round(float(fetch_value(conn, "SELECT COALESCE(SUM(current_balance), 0) FROM Customers", default=0) or 0), 2),
        "payables": round(float(fetch_value(conn, "SELECT COALESCE(SUM(current_balance), 0) FROM Suppliers", default=0) or 0), 2),
    }


# ============================================================================
# Purchase Returns (مرتجعات المشتريات)
# ============================================================================

def create_purchase_return(conn: sqlite3.Connection, payload: dict[str, Any]) -> int:
    created_by = int(payload["created_by"])
    original_invoice_id = int(payload["original_invoice_id"])
    original_invoice = conn.execute(
        "SELECT * FROM PurchaseInvoices WHERE invoice_id = ?", (original_invoice_id,)
    ).fetchone()
    if not original_invoice:
        raise ValueError("فاتورة الشراء الأصلية غير موجودة")

    return_number = payload.get("return_number") or next_number(conn, "PurchaseReturns", "return_number", "PRET")
    return_date = payload.get("return_date") or current_date()
    items = payload.get("items", [])

    if not items:
        raise ValueError("يجب تحديد بنود مرتجع الشراء")

    total_amount = 0.0
    prepared = []

    for item in items:
        original_line_id = int(item["original_line_id"])
        qty_return = float(item["quantity"])
        orig_line = conn.execute(
            "SELECT * FROM PurchaseInvoiceItems WHERE line_id = ? AND invoice_id = ?",
            (original_line_id, original_invoice_id),
        ).fetchone()
        if not orig_line:
            raise ValueError("سطر الفاتورة الأصلي غير موجود")
        if qty_return > float(orig_line["quantity"]):
            raise ValueError("كمية المرتجع أكبر من الكمية الأصلية")

        conversion_factor = float(
            fetch_value(conn, "SELECT conversion_factor FROM ItemUnits WHERE item_unit_id = ?", (orig_line["item_unit_id"],), 1) or 1
        )
        qty_base = qty_return * conversion_factor
        unit_cost = float(orig_line["unit_cost"])
        line_total = round(qty_return * unit_cost, 4)

        remove_stock(conn, int(orig_line["item_id"]), int(original_invoice["warehouse_id"]), qty_base)
        create_stock_movement(
            conn,
            item_id=int(orig_line["item_id"]),
            warehouse_id=int(original_invoice["warehouse_id"]),
            batch_id=None,
            movement_type="RETURN_OUT",
            reference_type="PURCHASE_RETURN",
            reference_id=original_invoice_id,
            quantity=-qty_base,
            unit_cost=unit_cost,
            created_by=created_by,
            notes=f"Purchase return against {original_invoice['invoice_number']}",
        )
        total_amount += line_total
        prepared.append({
            "original_line_id": original_line_id,
            "item_id": int(orig_line["item_id"]),
            "quantity": qty_return,
            "unit_cost": unit_cost,
            "line_total": line_total,
        })

    cursor = conn.execute(
        """
        INSERT INTO PurchaseReturns (
            return_number, return_date, original_invoice_id, supplier_id, total_amount,
            reason, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            return_number, return_date, original_invoice_id,
            int(original_invoice["supplier_id"]),
            round(total_amount, 4),
            payload.get("reason", ""),
            created_by,
        ),
    )
    return_id = int(cursor.lastrowid)

    conn.execute(
        "UPDATE Suppliers SET current_balance = COALESCE(current_balance, 0) - ? WHERE supplier_id = ?",
        (round(total_amount, 4), int(original_invoice["supplier_id"])),
    )

    currency_id = int(original_invoice["currency_id"])
    lines = [
        {"account_id": account_id_by_code(conn, "2100"), "debit": round(total_amount, 4), "credit": 0, "description": f"مرتجع مشتريات {return_number}"},
        {"account_id": account_id_by_code(conn, "1300"), "debit": 0, "credit": round(total_amount, 4), "description": f"تخفيض مخزون مرتجع {return_number}"},
    ]
    journal_id = create_journal_entry(
        conn, entry_date=return_date, description=f"قيد تلقائي لمرتجع شراء {return_number}",
        reference_type="PURCHASE_RETURN", reference_id=return_id,
        lines=lines, created_by=created_by, currency_id=currency_id,
    )
    conn.execute("UPDATE PurchaseReturns SET journal_entry_id = ? WHERE return_id = ?", (journal_id, return_id))
    return return_id


# ============================================================================
# Stock Transfers (تحويلات المخزون)
# ============================================================================

def create_stock_transfer(conn: sqlite3.Connection, payload: dict[str, Any]) -> int:
    created_by = int(payload["created_by"])
    transfer_number = next_number(conn, "StockTransfers", "transfer_number", "TRN")
    from_wh = int(payload["from_warehouse_id"])
    to_wh = int(payload["to_warehouse_id"])
    items = payload.get("items", [])
    if not items:
        raise ValueError("يجب إضافة أصناف للتحويل")
    if from_wh == to_wh:
        raise ValueError("لا يمكن التحويل لنفس المستودع")

    cursor = conn.execute(
        """
        INSERT INTO StockTransfers (transfer_number, transfer_date, from_warehouse_id, to_warehouse_id,
            status, notes, created_by, sent_at)
        VALUES (?, ?, ?, ?, 'SENT', ?, ?, CURRENT_TIMESTAMP)
        """,
        (transfer_number, payload.get("transfer_date") or current_date(), from_wh, to_wh,
         payload.get("notes", ""), created_by),
    )
    transfer_id = int(cursor.lastrowid)

    for item in items:
        item_id = int(item["item_id"])
        quantity = float(item["quantity"])
        stock_row = ensure_stock_row(conn, item_id, from_wh)
        cost = float(stock_row["avg_cost"] or 0)
        remove_stock(conn, item_id, from_wh, quantity)
        add_stock(conn, item_id, to_wh, quantity, cost)
        conn.execute(
            "INSERT INTO StockTransferItems (transfer_id, item_id, quantity, received_qty, cost_price) VALUES (?, ?, ?, ?, ?)",
            (transfer_id, item_id, quantity, quantity, cost),
        )
        create_stock_movement(conn, item_id, from_wh, None, "TRANSFER_OUT", "TRANSFER", transfer_id, -quantity, cost, created_by, f"Transfer out {transfer_number}")
        create_stock_movement(conn, item_id, to_wh, None, "TRANSFER_IN", "TRANSFER", transfer_id, quantity, cost, created_by, f"Transfer in {transfer_number}")

    conn.execute("UPDATE StockTransfers SET status = 'RECEIVED', received_at = CURRENT_TIMESTAMP, received_by = ? WHERE transfer_id = ?", (created_by, transfer_id))
    return transfer_id


# ============================================================================
# Stock Counts (الجرد)
# ============================================================================

def create_stock_count(conn: sqlite3.Connection, payload: dict[str, Any]) -> int:
    created_by = int(payload["created_by"])
    count_number = next_number(conn, "StockCounts", "count_number", "CNT")
    warehouse_id = int(payload["warehouse_id"])
    cursor = conn.execute(
        "INSERT INTO StockCounts (count_number, warehouse_id, count_date, status, notes, created_by) VALUES (?, ?, ?, 'DRAFT', ?, ?)",
        (count_number, warehouse_id, payload.get("count_date") or current_date(), payload.get("notes", ""), created_by),
    )
    count_id = int(cursor.lastrowid)
    for item in payload.get("items", []):
        item_id = int(item["item_id"])
        system_qty = float(fetch_value(conn, "SELECT COALESCE(quantity, 0) FROM Stock WHERE item_id = ? AND warehouse_id = ?", (item_id, warehouse_id), 0) or 0)
        counted_qty = float(item["counted_qty"])
        conn.execute(
            "INSERT INTO StockCountItems (count_id, item_id, system_qty, counted_qty, notes) VALUES (?, ?, ?, ?, ?)",
            (count_id, item_id, system_qty, counted_qty, item.get("notes", "")),
        )
    return count_id


def finalize_stock_count(conn: sqlite3.Connection, count_id: int, created_by: int):
    count_row = conn.execute("SELECT * FROM StockCounts WHERE count_id = ?", (count_id,)).fetchone()
    if not count_row:
        raise ValueError("الجرد غير موجود")
    if count_row["status"] != "DRAFT":
        raise ValueError("هذا الجرد تم اعتماده مسبقاً")
    warehouse_id = int(count_row["warehouse_id"])
    items = conn.execute("SELECT * FROM StockCountItems WHERE count_id = ?", (count_id,)).fetchall()
    for item in items:
        variance = float(item["counted_qty"]) - float(item["system_qty"])
        if abs(variance) > 0.0001:
            item_id = int(item["item_id"])
            stock_row = ensure_stock_row(conn, item_id, warehouse_id)
            cost = float(stock_row["avg_cost"] or 0)
            conn.execute("UPDATE Stock SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE item_id = ? AND warehouse_id = ?",
                         (float(item["counted_qty"]), item_id, warehouse_id))
            mv_type = "ADJUST_IN" if variance > 0 else "ADJUST_OUT"
            create_stock_movement(conn, item_id, warehouse_id, None, mv_type, "STOCK_COUNT", count_id, variance, cost, created_by, f"Stock count adjustment {count_row['count_number']}")
    conn.execute("UPDATE StockCounts SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE count_id = ?", (count_id,))


# ============================================================================
# Expenses (المصروفات)
# ============================================================================

def create_expense(conn: sqlite3.Connection, payload: dict[str, Any]) -> int:
    created_by = int(payload["created_by"])
    expense_number = next_number(conn, "Expenses", "expense_number", "EXP")
    amount = float(payload["amount"])
    currency_id = int(payload.get("currency_id") or get_base_currency_id(conn))
    branch_id = int(payload["branch_id"])
    expense_account_id = int(payload["expense_account_id"])

    cursor = conn.execute(
        """
        INSERT INTO Expenses (expense_number, expense_date, branch_id, expense_account_id, amount,
            currency_id, payment_method, beneficiary, description, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """,
        (expense_number, payload.get("expense_date") or current_date(), branch_id, expense_account_id,
         amount, currency_id, payload.get("payment_method", "CASH"),
         payload.get("beneficiary", ""), payload.get("description", ""), created_by),
    )
    expense_id = int(cursor.lastrowid)

    lines = [
        {"account_id": expense_account_id, "debit": round(amount, 4), "credit": 0, "description": f"مصروف {expense_number}"},
        {"account_id": account_id_by_code(conn, "1110"), "debit": 0, "credit": round(amount, 4), "description": f"دفع مصروف {expense_number}"},
    ]
    journal_id = create_journal_entry(
        conn, entry_date=payload.get("expense_date") or current_date(),
        description=f"قيد تلقائي لمصروف {expense_number}",
        reference_type="EXPENSE", reference_id=expense_id,
        lines=lines, created_by=created_by, currency_id=currency_id,
    )
    conn.execute("UPDATE Expenses SET journal_entry_id = ? WHERE expense_id = ?", (journal_id, expense_id))
    return expense_id


# ============================================================================
# Financial Reports (التقارير المالية)
# ============================================================================

def build_trial_balance(conn: sqlite3.Connection, date_from: str | None = None, date_to: str | None = None) -> list[dict]:
    where = ""
    params: list = []
    if date_from:
        where += " AND j.entry_date >= ?"
        params.append(date_from)
    if date_to:
        where += " AND j.entry_date <= ?"
        params.append(date_to)

    sql = f"""
        SELECT a.account_id, a.account_code, a.name_ar, a.account_type, a.account_nature,
               a.is_parent, a.level, a.opening_balance,
               COALESCE(SUM(jl.debit), 0) AS total_debit,
               COALESCE(SUM(jl.credit), 0) AS total_credit
        FROM ChartOfAccounts a
        LEFT JOIN JournalEntryLines jl ON jl.account_id = a.account_id
        LEFT JOIN JournalEntries j ON j.entry_id = jl.entry_id AND j.status = 'POSTED' {where}
        WHERE a.is_active = 1
        GROUP BY a.account_id
        ORDER BY a.account_code
    """
    rows = conn.execute(sql, params).fetchall()
    result = []
    for r in rows:
        opening = float(r["opening_balance"] or 0)
        debit = float(r["total_debit"] or 0)
        credit = float(r["total_credit"] or 0)
        if r["account_nature"] == "DEBIT":
            balance = opening + debit - credit
        else:
            balance = opening + credit - debit
        if abs(debit) > 0.001 or abs(credit) > 0.001 or abs(balance) > 0.001:
            result.append({
                "account_code": r["account_code"], "name_ar": r["name_ar"],
                "account_type": r["account_type"], "level": r["level"],
                "is_parent": r["is_parent"],
                "opening_balance": round(opening, 2),
                "total_debit": round(debit, 2), "total_credit": round(credit, 2),
                "balance": round(balance, 2),
            })
    return result


def build_income_statement(conn: sqlite3.Connection, date_from: str | None = None, date_to: str | None = None) -> dict:
    where = ""
    params: list = []
    if date_from:
        where += " AND j.entry_date >= ?"
        params.append(date_from)
    if date_to:
        where += " AND j.entry_date <= ?"
        params.append(date_to)

    sql = f"""
        SELECT a.account_code, a.name_ar, a.account_type,
               COALESCE(SUM(jl.debit), 0) AS total_debit,
               COALESCE(SUM(jl.credit), 0) AS total_credit
        FROM ChartOfAccounts a
        JOIN JournalEntryLines jl ON jl.account_id = a.account_id
        JOIN JournalEntries j ON j.entry_id = jl.entry_id AND j.status = 'POSTED' {where}
        WHERE a.account_type IN ('REVENUE', 'EXPENSE') AND a.is_active = 1
        GROUP BY a.account_id
        ORDER BY a.account_code
    """
    rows = conn.execute(sql, params).fetchall()
    revenues = []
    expenses = []
    total_revenue = 0.0
    total_expense = 0.0
    for r in rows:
        debit = float(r["total_debit"] or 0)
        credit = float(r["total_credit"] or 0)
        if r["account_type"] == "REVENUE":
            amount = credit - debit
            total_revenue += amount
            revenues.append({"account_code": r["account_code"], "name_ar": r["name_ar"], "amount": round(amount, 2)})
        else:
            amount = debit - credit
            total_expense += amount
            expenses.append({"account_code": r["account_code"], "name_ar": r["name_ar"], "amount": round(amount, 2)})

    return {
        "revenues": revenues, "expenses": expenses,
        "total_revenue": round(total_revenue, 2), "total_expense": round(total_expense, 2),
        "net_income": round(total_revenue - total_expense, 2),
    }


def build_balance_sheet(conn: sqlite3.Connection, as_of_date: str | None = None) -> dict:
    where = ""
    params: list = []
    if as_of_date:
        where = " AND j.entry_date <= ?"
        params.append(as_of_date)

    sql = f"""
        SELECT a.account_code, a.name_ar, a.account_type, a.account_nature, a.opening_balance,
               COALESCE(SUM(jl.debit), 0) AS total_debit,
               COALESCE(SUM(jl.credit), 0) AS total_credit
        FROM ChartOfAccounts a
        LEFT JOIN JournalEntryLines jl ON jl.account_id = a.account_id
        LEFT JOIN JournalEntries j ON j.entry_id = jl.entry_id AND j.status = 'POSTED' {where}
        WHERE a.account_type IN ('ASSET', 'LIABILITY', 'EQUITY') AND a.is_active = 1 AND a.is_parent = 0
        GROUP BY a.account_id
        ORDER BY a.account_code
    """
    rows = conn.execute(sql, params).fetchall()
    assets = []
    liabilities = []
    equity = []
    total_assets = 0.0
    total_liabilities = 0.0
    total_equity = 0.0

    for r in rows:
        opening = float(r["opening_balance"] or 0)
        debit = float(r["total_debit"] or 0)
        credit = float(r["total_credit"] or 0)
        if r["account_nature"] == "DEBIT":
            balance = opening + debit - credit
        else:
            balance = opening + credit - debit
        if abs(balance) < 0.01:
            continue
        entry = {"account_code": r["account_code"], "name_ar": r["name_ar"], "balance": round(balance, 2)}
        if r["account_type"] == "ASSET":
            assets.append(entry)
            total_assets += balance
        elif r["account_type"] == "LIABILITY":
            liabilities.append(entry)
            total_liabilities += balance
        else:
            equity.append(entry)
            total_equity += balance

    return {
        "assets": assets, "liabilities": liabilities, "equity": equity,
        "total_assets": round(total_assets, 2),
        "total_liabilities": round(total_liabilities, 2),
        "total_equity": round(total_equity, 2),
        "total_liabilities_equity": round(total_liabilities + total_equity, 2),
    }


def get_account_statement(conn: sqlite3.Connection, account_id: int, date_from: str | None = None, date_to: str | None = None) -> dict:
    account = conn.execute("SELECT * FROM ChartOfAccounts WHERE account_id = ?", (account_id,)).fetchone()
    if not account:
        raise ValueError("الحساب غير موجود")

    where = "WHERE jl.account_id = ?"
    params: list = [account_id]
    if date_from:
        where += " AND j.entry_date >= ?"
        params.append(date_from)
    if date_to:
        where += " AND j.entry_date <= ?"
        params.append(date_to)

    sql = f"""
        SELECT j.entry_number, j.entry_date, j.description AS entry_desc,
               jl.debit, jl.credit, jl.description AS line_desc
        FROM JournalEntryLines jl
        JOIN JournalEntries j ON j.entry_id = jl.entry_id AND j.status = 'POSTED'
        {where}
        ORDER BY j.entry_date, j.entry_id
    """
    rows = conn.execute(sql, params).fetchall()
    movements = []
    running = float(account["opening_balance"] or 0)
    for r in rows:
        debit = float(r["debit"] or 0)
        credit = float(r["credit"] or 0)
        if account["account_nature"] == "DEBIT":
            running += debit - credit
        else:
            running += credit - debit
        movements.append({
            "entry_number": r["entry_number"], "entry_date": r["entry_date"],
            "description": r["line_desc"] or r["entry_desc"],
            "debit": round(debit, 2), "credit": round(credit, 2),
            "balance": round(running, 2),
        })
    return {
        "account": dict(account),
        "opening_balance": round(float(account["opening_balance"] or 0), 2),
        "movements": movements,
        "closing_balance": round(running, 2),
    }


# ============================================================================
# Checks Management (إدارة الشيكات)
# ============================================================================

def create_check(conn: sqlite3.Connection, payload: dict[str, Any]) -> int:
    currency_id = int(payload.get("currency_id") or get_base_currency_id(conn))
    cursor = conn.execute(
        """
        INSERT INTO Checks (check_number, check_direction, bank_name, drawer_name, beneficiary,
            issue_date, due_date, amount, currency_id, status, customer_id, supplier_id, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, CURRENT_TIMESTAMP)
        """,
        (
            payload["check_number"], payload["check_direction"],
            payload.get("bank_name", ""), payload.get("drawer_name", ""),
            payload.get("beneficiary", ""),
            payload["issue_date"], payload["due_date"],
            float(payload["amount"]), currency_id,
            payload.get("customer_id") or None,
            payload.get("supplier_id") or None,
            payload.get("notes", ""),
        ),
    )
    return int(cursor.lastrowid)


def update_check_status(conn: sqlite3.Connection, check_id: int, new_status: str):
    valid = ("PENDING", "COLLECTED", "DEPOSITED", "RETURNED", "CANCELLED")
    if new_status not in valid:
        raise ValueError(f"حالة غير صالحة: {new_status}")
    conn.execute("UPDATE Checks SET status = ? WHERE check_id = ?", (new_status, check_id))
    if new_status == "COLLECTED":
        conn.execute("UPDATE Checks SET cleared_date = DATE('now') WHERE check_id = ?", (check_id,))


# ============================================================================
# Backup / Restore (النسخ الاحتياطي)
# ============================================================================


def backup_database(db_path: str, backup_dir: str) -> str:
    import time
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    backup_name = f"sas_backup_{timestamp}.sasbackup"
    backup_path = os.path.join(backup_dir, backup_name)
    with zipfile.ZipFile(backup_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(db_path, "sas.db")
    return backup_path


def restore_database(backup_path: str, db_path: str):
    if not os.path.exists(backup_path):
        raise ValueError("ملف النسخة الاحتياطية غير موجود")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    with zipfile.ZipFile(backup_path, "r") as zf:
        if "sas.db" not in zf.namelist():
            raise ValueError("ملف النسخة غير صالح")
        zf.extract("sas.db", os.path.dirname(db_path))


def delete_item(conn: sqlite3.Connection, item_id: int):
    """Delete an item only if it has no transactions or stock."""
    # Check stock
    total_qty = fetch_value(conn, "SELECT SUM(quantity) FROM Stock WHERE item_id = ?", (item_id,), 0) or 0
    if float(total_qty) != 0:
        raise ValueError("لا يمكن حذف الصنف لأنه يحتوي على رصيد مخزني حالي")

    # Check sales
    has_sales = fetch_value(conn, "SELECT COUNT(*) FROM SalesInvoiceItems WHERE item_id = ?", (item_id,), 0)
    if has_sales > 0:
        raise ValueError("لا يمكن حذف الصنف لأنه مرتبط بعمليات بيع سابقة")

    # Check purchases
    has_purchases = fetch_value(conn, "SELECT COUNT(*) FROM PurchaseInvoiceItems WHERE item_id = ?", (item_id,), 0)
    if has_purchases > 0:
        raise ValueError("لا يمكن حذف الصنف لأنه مرتبط بعمليات شراء سابقة")

    # Delete related data first
    conn.execute("DELETE FROM ItemPrices WHERE item_id = ?", (item_id,))
    conn.execute("DELETE FROM ItemUnits WHERE item_id = ?", (item_id,))
    conn.execute("DELETE FROM Stock WHERE item_id = ?", (item_id,))
    conn.execute("DELETE FROM Items WHERE item_id = ?", (item_id,))


def delete_customer(conn: sqlite3.Connection, customer_id: int):
    """Delete a customer only if they have no balance or transactions."""
    cust = fetch_one(conn, "SELECT current_balance FROM Customers WHERE customer_id = ?", (customer_id,))
    if not cust:
        raise ValueError("العميل غير موجود")

    if abs(float(cust["current_balance"] or 0)) > 0.01:
        raise ValueError(f"لا يمكن حذف العميل لأن لديه رصيد مستحق: {cust['current_balance']}")

    # Check invoices
    has_invoices = fetch_value(conn, "SELECT COUNT(*) FROM SalesInvoices WHERE customer_id = ?", (customer_id,), 0)
    if has_invoices > 0:
        raise ValueError("لا يمكن حذف العميل لأنه مرتبط بفواتير مبيعات سابقة")

    # Check quotations
    has_quotations = fetch_value(conn, "SELECT COUNT(*) FROM Quotations WHERE customer_id = ?", (customer_id,), 0)
    if has_quotations > 0:
        raise ValueError("لا يمكن حذف العميل لأنه مرتبط بعروض أسعار سابقة")

    # Check checks
    has_checks = fetch_value(conn, "SELECT COUNT(*) FROM Checks WHERE customer_id = ?", (customer_id,), 0)
    if has_checks > 0:
        raise ValueError("لا يمكن حذف العميل لأنه مرتبط بشيكات مسجلة")

    # Delete
    conn.execute("DELETE FROM Customers WHERE customer_id = ?", (customer_id,))


def delete_supplier(conn: sqlite3.Connection, supplier_id: int):
    """Delete a supplier only if they have no balance or transactions."""
    supp = fetch_one(conn, "SELECT current_balance FROM Suppliers WHERE supplier_id = ?", (supplier_id,))
    if not supp:
        raise ValueError("المورد غير موجود")

    if abs(float(supp["current_balance"] or 0)) > 0.01:
        raise ValueError(f"لا يمكن حذف المورد لأن لديه رصيد مستحق: {supp['current_balance']}")

    # Check invoices
    has_invoices = fetch_value(conn, "SELECT COUNT(*) FROM PurchaseInvoices WHERE supplier_id = ?", (supplier_id,), 0)
    if has_invoices > 0:
        raise ValueError("لا يمكن حذف المورد لأنه مرتبط بفواتير شراء سابقة")

    # Check returns
    has_returns = fetch_value(conn, "SELECT COUNT(*) FROM PurchaseReturns WHERE supplier_id = ?", (supplier_id,), 0)
    if has_returns > 0:
        raise ValueError("لا يمكن حذف المورد لأنه مرتبط بعمليات مرتجع شراء")

    # Check checks
    has_checks = fetch_value(conn, "SELECT COUNT(*) FROM Checks WHERE supplier_id = ?", (supplier_id,), 0)
    if has_checks > 0:
        raise ValueError("لا يمكن حذف المورد لأنه مرتبط بشيكات مسجلة")

    # Check items (default supplier)
    has_items = fetch_value(conn, "SELECT COUNT(*) FROM Items WHERE default_supplier_id = ?", (supplier_id,), 0)
    if has_items > 0:
        raise ValueError("لا يمكن حذف المورد لأنه مسجل كمورد افتراضي لبعض الأصناف")

    # Check payments
    has_payments = fetch_value(conn, "SELECT COUNT(*) FROM Payments WHERE supplier_id = ?", (supplier_id,), 0)
    if has_payments > 0:
        raise ValueError("لا يمكن حذف المورد لأنه مرتبط بعمليات دفع مسجلة")

    # Delete
    conn.execute("DELETE FROM Suppliers WHERE supplier_id = ?", (supplier_id,))


def delete_branch(conn: sqlite3.Connection, branch_id: int):
    """Delete a branch if it has no warehouses or transactions."""
    has_warehouses = fetch_value(conn, "SELECT COUNT(*) FROM Warehouses WHERE branch_id = ?", (branch_id,), 0)
    if has_warehouses > 0:
        raise ValueError("لا يمكن حذف الفرع لأنه يحتوي على مستودعات مرتبطة")
    
    # Check transactions (invoices)
    has_sales = fetch_value(conn, "SELECT COUNT(*) FROM SalesInvoices WHERE branch_id = ?", (branch_id,), 0)
    if has_sales > 0:
        raise ValueError("لا يمكن حذف الفرع لأنه مرتبط بعمليات بيع سابقة")
    
    conn.execute("DELETE FROM Branches WHERE branch_id = ?", (branch_id,))


def delete_warehouse(conn: sqlite3.Connection, warehouse_id: int):
    """Delete a warehouse if it has no stock or transactions."""
    total_qty = fetch_value(conn, "SELECT SUM(quantity) FROM Stock WHERE warehouse_id = ?", (warehouse_id,), 0) or 0
    if float(total_qty) != 0:
        raise ValueError("لا يمكن حذف المستودع لأنه يحتوي على رصيد مخزني")
    
    conn.execute("DELETE FROM Stock WHERE warehouse_id = ?", (warehouse_id,))
    conn.execute("DELETE FROM Warehouses WHERE warehouse_id = ?", (warehouse_id,))


def delete_category(conn: sqlite3.Connection, category_id: int):
    """Delete a category if it has no items."""
    has_items = fetch_value(conn, "SELECT COUNT(*) FROM Items WHERE category_id = ?", (category_id,), 0)
    if has_items > 0:
        raise ValueError("لا يمكن حذف التصنيف لأنه يحتوي على أصناف مرتبطة")
    
    conn.execute("DELETE FROM Categories WHERE category_id = ?", (category_id,))


def delete_unit(conn: sqlite3.Connection, unit_id: int):
    """Delete a unit if it is not used by any item."""
    has_item_units = fetch_value(conn, "SELECT COUNT(*) FROM ItemUnits WHERE unit_id = ?", (unit_id,), 0)
    if has_item_units > 0:
        raise ValueError("لا يمكن حذف الوحدة لأنها مرتبطة بأصناف موجودة")
    
    conn.execute("DELETE FROM Units WHERE unit_id = ?", (unit_id,))
