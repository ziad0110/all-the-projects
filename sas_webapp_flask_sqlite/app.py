import json
import os
import sqlite3
import io
import sys
import pandas as pd
import subprocess
from datetime import datetime, date, timedelta
from functools import wraps
from pathlib import Path
from typing import Any

from flask import Flask, flash, g, jsonify, redirect, render_template, request, session, url_for, send_file
from werkzeug.security import check_password_hash

from seed_data import initialize_database
from services import (
    backup_database,
    build_balance_sheet,
    build_dashboard_metrics,
    build_income_statement,
    build_trial_balance,
    create_check,
    create_expense,
    create_purchase_invoice,
    create_purchase_return,
    create_sales_invoice,
    create_sales_return,
    create_stock_count,
    create_stock_transfer,
    finalize_stock_count,
    get_account_statement,
    get_connection,
    restore_database,
    update_check_status,
    get_base_currency_id,
    create_payment_record,
    account_id_by_code,
    create_journal_entry,
    current_date,
)

def get_app_data_path():
    """Get the path to the AppData folder for the application."""
    if os.name == 'nt': # Windows
        base_path = Path(os.environ.get('APPDATA')) / "SmartAccountingSuite"
    else: # Linux/Mac
        base_path = Path.home() / ".smart_accounting_suite"
    
    # Ensure the directory exists
    base_path.mkdir(parents=True, exist_ok=True)
    (base_path / "instance").mkdir(parents=True, exist_ok=True)
    return base_path

# Detect if we are running in a PyInstaller bundle
is_frozen = getattr(sys, 'frozen', False)
if is_frozen:
    APP_DATA_DIR = get_app_data_path()
    DB_PATH = APP_DATA_DIR / "instance" / "sas.db"
    # Schema stays with the binary (in sys._MEIPASS if bundled)
    if hasattr(sys, '_MEIPASS'):
        SCHEMA_PATH = Path(sys._MEIPASS) / "schema.sql"
    else:
        SCHEMA_PATH = Path(sys.executable).parent / "schema.sql"
else:
    BASE_DIR = Path(__file__).resolve().parent
    DB_PATH = BASE_DIR / "instance" / "sas.db"
    SCHEMA_PATH = BASE_DIR / "schema.sql"

UPLOADS_DIR = APP_DATA_DIR / "uploads" if is_frozen else BASE_DIR / "static" / "uploads"
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

app = Flask(__name__)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    from flask import send_from_directory
    return send_from_directory(str(UPLOADS_DIR), filename)

# --- Logging Configuration ---
import logging
from logging.handlers import RotatingFileHandler

if is_frozen:
    log_file = APP_DATA_DIR / "error_log.txt"
    handler = RotatingFileHandler(log_file, maxBytes=1000000, backupCount=5)
    handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Smart Accounting Suite Startup')

app.config["SECRET_KEY"] = os.environ.get("SAS_SECRET_KEY", "sas-dev-secret-key-123")
app.config["DATABASE"] = str(DB_PATH)

# --- Development Tweaks ---
if not is_frozen:
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

    @app.after_request
    def add_header(response):
        """Add headers to both force latest IE rendering engine or prompt to install Google Chrome Frame,
        and also to cache the rendered page for 0 seconds."""
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response
MASTER_CONFIG = {
    "branches": {
        "label": "الفروع",
        "table": "Branches",
        "pk": "branch_id",
        "list_columns": [
            {"name": "branch_code", "label": "الكود"},
            {"name": "name_ar", "label": "اسم الفرع"},
            {"name": "phone", "label": "الهاتف"},
            {"name": "manager_name", "label": "المدير"}
        ],
        "fields": [
            {"name": "branch_code", "label": "كود الفرع", "type": "text", "required": True},
            {"name": "name_ar", "label": "اسم الفرع", "type": "text", "required": True},
            {"name": "phone", "label": "الهاتف", "type": "text"},
            {"name": "manager_name", "label": "المدير", "type": "text"},
            {"name": "address_ar", "label": "العنوان", "type": "textarea"},
            {"name": "is_main", "label": "فرع رئيسي", "type": "checkbox"},
            {"name": "is_active", "label": "نشط", "type": "checkbox", "default": 1},
        ],
    },
    "warehouses": {
        "label": "المستودعات",
        "table": "Warehouses",
        "pk": "warehouse_id",
        "list_columns": [
            {"name": "warehouse_code", "label": "الكود"},
            {"name": "name_ar", "label": "اسم المستودع"},
            {"name": "location", "label": "الموقع"},
            {"name": "is_default", "label": "افتراضي"}
        ],
        "fields": [
            {"name": "branch_id", "label": "الفرع", "type": "select", "source": "branches", "required": True},
            {"name": "warehouse_code", "label": "كود المستودع", "type": "text", "required": True},
            {"name": "name_ar", "label": "اسم المستودع", "type": "text", "required": True},
            {"name": "location", "label": "الموقع", "type": "text"},
            {"name": "is_default", "label": "افتراضي", "type": "checkbox"},
            {"name": "is_active", "label": "نشط", "type": "checkbox", "default": 1},
        ],
    },
    "categories": {
        "label": "التصنيفات",
        "table": "Categories",
        "pk": "category_id",
        "list_columns": [
            {"name": "code", "label": "الكود"},
            {"name": "name_ar", "label": "اسم التصنيف"},
            {"name": "sort_order", "label": "الترتيب"}
        ],
        "fields": [
            {"name": "code", "label": "الكود", "type": "text"},
            {"name": "name_ar", "label": "اسم التصنيف", "type": "text", "required": True},
            {"name": "parent_id", "label": "التصنيف الأب", "type": "select", "source": "categories"},
            {"name": "sort_order", "label": "الترتيب", "type": "number", "step": "1", "default": 0},
            {"name": "is_active", "label": "نشط", "type": "checkbox", "default": 1},
        ],
    },
    "units": {
        "label": "الوحدات",
        "table": "Units",
        "pk": "unit_id",
        "list_columns": [
            {"name": "code", "label": "الكود"},
            {"name": "name_ar", "label": "اسم الوحدة"}
        ],
        "fields": [
            {"name": "code", "label": "الكود", "type": "text", "required": True},
            {"name": "name_ar", "label": "اسم الوحدة", "type": "text", "required": True},
            {"name": "name_en", "label": "الاسم بالإنجليزية", "type": "text"},
        ],
    },
    "customers": {
        "label": "العملاء",
        "table": "Customers",
        "pk": "customer_id",
        "list_columns": [
            {"name": "customer_code", "label": "الكود"},
            {"name": "name_ar", "label": "اسم العميل"},
            {"name": "phone", "label": "الهاتف"},
            {"name": "customer_type", "label": "النوع"}
        ],
        "fields": [
            {"name": "customer_code", "label": "كود العميل", "type": "text", "required": True},
            {"name": "name_ar", "label": "اسم العميل", "type": "text", "required": True},
            {"name": "phone", "label": "الهاتف", "type": "text"},
            {"name": "mobile", "label": "الجوال", "type": "text"},
            {"name": "email", "label": "البريد الإلكتروني", "type": "email"},
            {"name": "city", "label": "المدينة", "type": "text"},
            {"name": "address", "label": "العنوان", "type": "textarea"},
            {"name": "price_level_id", "label": "مستوى السعر", "type": "select", "source": "price_levels"},
            {"name": "credit_limit", "label": "الحد الائتماني", "type": "number", "step": "0.01", "default": 0},
            {"name": "account_id", "label": "حساب العميل", "type": "select", "source": "accounts"},
            {"name": "is_walkin", "label": "عميل نقدي", "type": "checkbox"},
            {"name": "is_active", "label": "نشط", "type": "checkbox", "default": 1},
        ],
    },
    "suppliers": {
        "label": "الموردون",
        "table": "Suppliers",
        "pk": "supplier_id",
        "list_columns": [
            {"name": "supplier_code", "label": "الكود"},
            {"name": "name_ar", "label": "اسم المورد"},
            {"name": "phone", "label": "الهاتف"},
            {"name": "tax_number", "label": "الرقم الضريبي"}
        ],
        "fields": [
            {"name": "supplier_code", "label": "كود المورد", "type": "text", "required": True},
            {"name": "name_ar", "label": "اسم المورد", "type": "text", "required": True},
            {"name": "phone", "label": "الهاتف", "type": "text"},
            {"name": "email", "label": "البريد الإلكتروني", "type": "email"},
            {"name": "tax_number", "label": "الرقم الضريبي", "type": "text"},
            {"name": "contact_person", "label": "الشخص المسؤول", "type": "text"},
            {"name": "payment_terms", "label": "أيام السداد", "type": "number", "step": "1", "default": 0},
            {"name": "account_id", "label": "حساب المورد", "type": "select", "source": "accounts"},
            {"name": "address", "label": "العنوان", "type": "textarea"},
            {"name": "is_active", "label": "نشط", "type": "checkbox", "default": 1},
        ],
    },
    "accounts": {
        "label": "شجرة الحسابات",
        "table": "ChartOfAccounts",
        "pk": "account_id",
        "list_columns": [
            {"name": "account_code", "label": "رقم الحساب"},
            {"name": "name_ar", "label": "اسم الحساب"},
            {"name": "account_type", "label": "النوع"},
            {"name": "account_nature", "label": "الطبيعة"}
        ],
        "fields": [
            {"name": "account_code", "label": "رقم الحساب", "type": "text", "required": True},
            {"name": "name_ar", "label": "اسم الحساب", "type": "text", "required": True},
            {"name": "parent_id", "label": "الحساب الأب", "type": "select", "source": "accounts"},
            {"name": "account_type", "label": "نوع الحساب", "type": "select_static", "required": True, "options": ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]},
            {"name": "account_nature", "label": "الطبيعة", "type": "select_static", "required": True, "options": ["DEBIT", "CREDIT"]},
            {"name": "level", "label": "المستوى", "type": "number", "step": "1", "default": 1},
            {"name": "is_parent", "label": "رئيسي", "type": "checkbox"},
            {"name": "is_active", "label": "نشط", "type": "checkbox", "default": 1},
            {"name": "notes", "label": "ملاحظات", "type": "textarea"},
        ],
    },
    "users": {
        "label": "المستخدمون",
        "table": "Users",
        "pk": "user_id",
        "list_columns": [
            {"name": "username", "label": "اسم المستخدم"},
            {"name": "full_name_ar", "label": "الاسم الكامل"},
            {"name": "role_id", "label": "الدور"}
        ],
        "fields": [
            {"name": "username", "label": "اسم المستخدم", "type": "text", "required": True},
            {"name": "password", "label": "كلمة المرور", "type": "password", "required": False},
            {"name": "full_name_ar", "label": "الاسم الكامل", "type": "text", "required": True},
            {"name": "email", "label": "البريد الإلكتروني", "type": "email"},
            {"name": "phone", "label": "الهاتف", "type": "text"},
            {"name": "role_id", "label": "الدور", "type": "select", "source": "roles", "required": True},
            {"name": "branch_id", "label": "الفرع", "type": "select", "source": "branches"},
            {"name": "is_active", "label": "نشط", "type": "checkbox", "default": 1},
        ],
    },
}
import time as _time
_license_cache = {"valid": None, "checked_at": 0}

@app.before_request
def check_app_license():
    if not request.endpoint or request.endpoint in ['license_page', 'login', 'static']:
        return
    
    now = _time.time()
    if _license_cache["valid"] is not None and (now - _license_cache["checked_at"]) < 300:
        if _license_cache["valid"]: return
        return redirect(url_for('license_page'))
    
    from license_manager import is_licensed
    result = is_licensed()
    _license_cache["valid"] = result
    _license_cache["checked_at"] = now
    if not result:
        return redirect(url_for('license_page'))




# Custom Filters
@app.template_filter('format_currency')
@app.template_filter('currency')
def format_currency(value):
    try:
        return "{:,.2f}".format(float(value or 0))
    except (ValueError, TypeError):
        return "0.00"

@app.before_request
def load_logged_in_user():
    user_id = session.get("user_id")
    g.user = None
    if user_id:
        g.user = query_one(
            """
            SELECT u.*, r.name_ar AS role_name
            FROM Users u
            LEFT JOIN Roles r ON r.role_id = u.role_id
            WHERE u.user_id = ?
            """,
            (user_id,),
        )
    
    # Automatic Daily Backup Logic
    try:
        last_backup_file = BASE_DIR / "instance" / ".last_backup"
        today = date.today().isoformat()
        
        should_backup = False
        if not last_backup_file.exists():
            should_backup = True
        else:
            last_date = last_backup_file.read_text().strip()
            if last_date != today:
                should_backup = True
        
        if should_backup:
            import threading
            from services import backup_database
            
            def run_backup():
                try:
                    backup_dir = BASE_DIR / "backups"
                    backup_database(str(DB_PATH), str(backup_dir))
                    last_backup_file.write_text(today)
                except Exception:
                    pass  # Silent failure for background auto-backup
            
            threading.Thread(target=run_backup, daemon=True).start()
    except Exception:
        pass


def has_permission(perm_code):
    if not g.user:
        return False
    
    # Check role_code using bracket notation for sqlite3.Row
    db = get_db()
    user_role = db.execute("SELECT role_code FROM Roles WHERE role_id = ?", (g.user['role_id'],)).fetchone()
    
    if user_role and user_role['role_code'] == 'ADMIN':
        return True
    
    result = db.execute("""
        SELECT 1 FROM RolePermissions rp
        JOIN Permissions p ON p.permission_id = rp.permission_id
        WHERE rp.role_id = ? AND p.permission_code = ?
    """, (g.user['role_id'], perm_code)).fetchone()
    return result is not None


@app.context_processor
def inject_layout_data():
    notifications = []
    company_name = "SAS Smart Accounting"
    
    try:
        company = query_one("SELECT name_ar FROM Company LIMIT 1")
        if company:
            company_name = company['name_ar']
    except Exception:
        pass

    if g.user:
        try:
            # Check low stock alerts
            low_stock_items = query_all("""
                SELECT i.name_ar, SUM(s.quantity) as total_qty, i.min_stock
                FROM Stock s
                JOIN Items i ON i.item_id = s.item_id
                WHERE i.min_stock > 0
                GROUP BY s.item_id
                HAVING total_qty <= i.min_stock
            """)
            for item in low_stock_items:
                notifications.append({
                    "type": "warning",
                    "title": "تنبيه مخزون",
                    "message": f"الصنف '{item['name_ar']}' وصل للحد الأدنى (المتبقي: {item['total_qty']})",
                    "icon": "bi-box-seam text-warning"
                })
        except Exception:
            pass

    return {
        "current_user": g.user,
        "has_permission": has_permission,
        "notifications": notifications,
        "company_name": company_name,
        "now_date": datetime.now().strftime("%Y-%m-%d %H:%M")
    }



def permission_required(perm_code):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not g.user:
                return redirect(url_for("login"))
            
            if not has_permission(perm_code):
                flash("عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة ⛔", "danger")
                return redirect(url_for("dashboard"))
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = get_connection(app.config["DATABASE"])
    return g.db


def query_all(sql, params=()):
    return get_db().execute(sql, params).fetchall()


def query_one(sql, params=()):
    return get_db().execute(sql, params).fetchone()


def execute(sql, params=()):
    cur = get_db().execute(sql, params)
    get_db().commit()
    return cur


def get_next_code(table, prefix="", column="customer_code"):
    try:
        db = get_db()
        # Find the highest numeric value in the column
        # Using a more compatible way to find numeric strings
        sql = f"SELECT {column} FROM {table} WHERE {column} NOT LIKE '%[^0-9]%' ORDER BY CAST({column} AS INTEGER) DESC LIMIT 1"
        # Since SQLite LIKE doesn't support regex/glob well in all environments, 
        # let's try a different approach: select all and filter in Python or use a simpler GLOB
        sql = f"SELECT {column} FROM {table} WHERE {column} GLOB '[0-9]*' ORDER BY CAST({column} AS INTEGER) DESC LIMIT 1"
        res = db.execute(sql).fetchone()
        
        if not res:
            return "1"
            
        last_code = str(res[0])
        # Clean the string to ensure it's numeric
        import re
        numeric_part = re.sub(r'[^0-9]', '', last_code)
        if numeric_part:
            num = int(numeric_part) + 1
            return str(num)
        return "1"
    except Exception:
        return "1"


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def login_required(view):
    @wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for("login"))
        return view(**kwargs)

    return wrapped_view


def source_options(source_name: str):
    if source_name == "branches":
        return query_all("SELECT branch_id AS id, name_ar AS label FROM Branches WHERE is_active = 1 ORDER BY name_ar")
    if source_name == "categories":
        return query_all("SELECT category_id AS id, name_ar AS label FROM Categories WHERE is_active = 1 ORDER BY name_ar")
    if source_name == "accounts":
        return query_all("SELECT account_id AS id, account_code || ' - ' || name_ar AS label FROM ChartOfAccounts WHERE is_active = 1 ORDER BY account_code")
    if source_name == "roles":
        return query_all("SELECT role_id AS id, name_ar AS label FROM Roles WHERE is_active = 1 ORDER BY role_id")
    if source_name == "price_levels":
        return query_all("SELECT price_level_id AS id, name_ar AS label FROM PriceLevels WHERE is_active = 1 ORDER BY sort_order, price_level_id")
    return []


def build_form_data(config, record=None):
    prepared = []
    for field in config["fields"]:
        item = dict(field)
        item["value"] = None
        if record and field["name"] in record.keys():
            item["value"] = record[field["name"]]
        elif "default" in field:
            item["value"] = field.get("default")
        
        # Pre-fill next code for new records
        if not record:
            if config['table'] == 'Customers' and field['name'] == 'customer_code':
                item['value'] = get_next_code("Customers", "", "customer_code")
            elif config['table'] == 'Suppliers' and field['name'] == 'supplier_code':
                item['value'] = get_next_code("Suppliers", "", "supplier_code")
        if field["type"] == "select":
            item["options"] = source_options(field["source"])
        elif field["type"] == "select_static":
            item["options"] = [{"id": value, "label": value} for value in field["options"]]
        prepared.append(item)
    return prepared


def save_master(entity, record_id=None):
    config = MASTER_CONFIG[entity]
    table = config["table"]
    pk = config["pk"]
    fields = []
    values = []
    placeholders = []

    for field in config["fields"]:
        name = field["name"]
        if entity == "users" and name == "password":
            continue
        if field["type"] == "checkbox":
            value = 1 if request.form.get(name) == "on" else 0
        else:
            value = request.form.get(name)
            if value == "":
                value = None
        fields.append(name)
        values.append(value)
        placeholders.append("?")

    # Auto-generate code for customers/suppliers if empty
    if not record_id:
        if entity == "customers" and "customer_code" in fields:
            idx = fields.index("customer_code")
            if not values[idx]:
                values[idx] = get_next_code("Customers", "", "customer_code")
        elif entity == "suppliers" and "supplier_code" in fields:
            idx = fields.index("supplier_code")
            if not values[idx]:
                values[idx] = get_next_code("Suppliers", "", "supplier_code")

    db = get_db()
    if entity == "users":
        from werkzeug.security import generate_password_hash

        password = request.form.get("password")
        if record_id:
            set_clause = ", ".join(f"{field} = ?" for field in fields)
            db.execute(f"UPDATE {table} SET {set_clause} WHERE {pk} = ?", (*values, record_id))
            if password:
                db.execute(
                    "UPDATE Users SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP WHERE user_id = ?",
                    (generate_password_hash(password), record_id),
                )
        else:
            if not password:
                raise ValueError("كلمة المرور مطلوبة عند إنشاء مستخدم جديد")
            fields.insert(1, "password_hash")
            values.insert(1, generate_password_hash(password))
            placeholders.insert(1, "?")
            db.execute(
                f"INSERT INTO {table} ({', '.join(fields)}) VALUES ({', '.join(placeholders)})",
                values,
            )
    else:
        if record_id:
            set_clause = ", ".join(f"{field} = ?" for field in fields)
            db.execute(f"UPDATE {table} SET {set_clause} WHERE {pk} = ?", (*values, record_id))
        else:
            db.execute(
                f"INSERT INTO {table} ({', '.join(fields)}) VALUES ({', '.join(placeholders)})",
                values,
            )
    db.commit()


@app.route("/")
@login_required
def dashboard():
    metrics = build_dashboard_metrics(get_db())
    sales_chart = [dict(row) for row in query_all(
        """
        SELECT DATE(invoice_date) AS day, ROUND(SUM(total), 2) AS total
        FROM SalesInvoices
        WHERE DATE(invoice_date) >= DATE('now', '-6 day')
        GROUP BY DATE(invoice_date)
        ORDER BY DATE(invoice_date)
        """
    )]
    top_items = query_all(
        """
        SELECT i.name_ar, ROUND(SUM(sii.quantity), 2) AS qty, ROUND(SUM(sii.line_total), 2) AS total
        FROM SalesInvoiceItems sii
        JOIN Items i ON i.item_id = sii.item_id
        GROUP BY sii.item_id
        ORDER BY total DESC
        LIMIT 5
        """
    )
    low_stock = query_all(
        """
        SELECT i.name_ar, w.name_ar AS warehouse_name, s.quantity, i.min_stock
        FROM Stock s
        JOIN Items i ON i.item_id = s.item_id
        JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
        WHERE s.quantity <= COALESCE(i.min_stock, 0)
        ORDER BY s.quantity ASC
        LIMIT 5
        """
    )
    top_customers = query_all(
        """
        SELECT COALESCE(c.name_ar, 'عميل نقدي') as name, ROUND(SUM(s.total), 2) as total
        FROM SalesInvoices s
        LEFT JOIN Customers c ON c.customer_id = s.customer_id
        GROUP BY s.customer_id
        ORDER BY total DESC LIMIT 5
        """
    )
    expense_breakdown = query_all(
        """
        SELECT a.name_ar as account, ROUND(SUM(e.amount), 2) as total
        FROM Expenses e
        JOIN ChartOfAccounts a ON a.account_id = e.expense_account_id
        GROUP BY e.expense_account_id
        ORDER BY total DESC
        """
    )
    return render_template(
        "dashboard.html",
        title="لوحة التحكم",
        metrics=metrics,
        sales_chart=sales_chart,
        top_items=top_items,
        low_stock=low_stock,
        top_customers=[dict(r) for r in top_customers],
        expense_breakdown=[dict(r) for r in expense_breakdown]
    )


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        user = query_one(
            """
            SELECT u.*, r.name_ar AS role_name
            FROM Users u LEFT JOIN Roles r ON r.role_id = u.role_id
            WHERE u.username = ? AND u.is_active = 1
            """,
            (username,),
        )
        if user and check_password_hash(user["password_hash"], password):
            session.clear()
            session["user_id"] = user["user_id"]
            return redirect(url_for("dashboard"))
        flash("بيانات الدخول غير صحيحة", "danger")
    return render_template("login.html", title="تسجيل الدخول")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

# --- API Endpoints for POS ---
@app.route("/api/customers/search")
@login_required
def api_customers_search():
    query = request.args.get("q", "").strip()
    if not query:
        # Return newest customers first
        customers = query_all("SELECT customer_id, name_ar, phone FROM Customers WHERE is_active = 1 ORDER BY customer_id DESC LIMIT 50")
    else:
        # Search by name or phone, newest first
        customers = query_all(
            """
            SELECT customer_id, name_ar, phone 
            FROM Customers 
            WHERE is_active = 1 
            AND (name_ar LIKE ? OR phone LIKE ? OR customer_code LIKE ?)
            ORDER BY customer_id DESC
            LIMIT 50
            """,
            (f"%{query}%", f"%{query}%", f"%{query}%")
        )
    
    return jsonify([
        {"id": c["customer_id"], "name": c["name_ar"], "phone": c["phone"] or ""}
        for c in customers
    ])

@app.route("/api/customers/next_code")
@login_required
def api_customers_next_code():
    try:
        code = get_next_code("Customers", "", "customer_code")
        return jsonify({"next_code": code})
    except Exception as e:
        app.logger.error(f"Error in api_customers_next_code: {e}")
        return jsonify({"next_code": "1"})

@app.route("/api/suppliers/next_code")
@login_required
def api_suppliers_next_code():
    try:
        code = get_next_code("Suppliers", "", "supplier_code")
        return jsonify({"next_code": code})
    except Exception as e:
        app.logger.error(f"Error in api_suppliers_next_code: {e}")
        return jsonify({"next_code": "1"})

@app.route("/api/customers/add", methods=["POST"])
@login_required
def api_customers_add():
    name = request.form.get("name", "").strip()
    phone = request.form.get("phone", "").strip()
    if not name:
        return jsonify({"error": "اسم العميل مطلوب"}), 400
    
    # Check for duplicate name (Basic normalization for Arabic)
    def norm_ar(t):
        return t.replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ة','ه').replace('ى','ي').strip()
    
    # Check if the exact name (after basic normalization) exists
    existing = query_one("SELECT customer_id FROM Customers WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name_ar, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ة', 'ه'), 'ى', 'ي') = ?", (norm_ar(name),))
    if existing:
        return jsonify({"error": "هذا العميل موجود مسبقاً بنفس الاسم تماماً"}), 400

    try:
        # Generate sequential code
        code = get_next_code("Customers")
        db = get_db()
        cursor = db.execute(
            "INSERT INTO Customers (customer_code, name_ar, phone, is_active) VALUES (?, ?, ?, 1)",
            (code, name, phone)
        )
        db.commit()
        customer_id = cursor.lastrowid
        return jsonify({"id": customer_id, "name": name, "phone": phone, "code": code})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/items/add", methods=["POST"])
@login_required
def api_items_add():
    db = get_db()
    name = request.form.get("name")
    code = request.form.get("code")
    cat_id = request.form.get("category_id")
    unit_id = request.form.get("unit_id")
    price = request.form.get("sale_price") or 0
    price_level_id = request.form.get("price_level_id")

    if not name or not unit_id:
        return jsonify({"error": "الاسم والوحدة مطلوبان"}), 400

    try:
        # 1. Create Item
        cursor = db.execute(
            "INSERT INTO Items (item_code, name_ar, category_id, base_unit_id, is_active) VALUES (?, ?, ?, ?, 1)",
            (code, name, cat_id or None, unit_id)
        )
        item_id = cursor.lastrowid

        # 2. Create ItemUnit (Base)
        cursor = db.execute(
            "INSERT INTO ItemUnits (item_id, unit_id, conversion_factor, is_default_sale) VALUES (?, ?, 1, 1)",
            (item_id, unit_id)
        )
        item_unit_id = cursor.lastrowid

        # 3. Create Price
        currency_row = query_one("SELECT currency_id FROM Currencies WHERE is_base = 1 LIMIT 1")
        currency_id = currency_row[0] if currency_row else 1
        
        # If no price level provided, use the default one
        if not price_level_id:
            pl_row = query_one("SELECT price_level_id FROM PriceLevels WHERE is_default = 1 LIMIT 1")
            price_level_id = pl_row[0] if pl_row else 1

        db.execute(
            "INSERT INTO ItemPrices (item_id, item_unit_id, price_level_id, currency_id, price) VALUES (?, ?, ?, ?, ?)",
            (item_id, item_unit_id, price_level_id, currency_id, price)
        )
        db.commit()
        return jsonify({"id": item_id, "name": name, "code": code, "unit_price": float(price)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/pos/last-invoice")
@login_required
def api_pos_last_invoice():
    row = query_one("SELECT invoice_id FROM SalesInvoices ORDER BY invoice_id DESC LIMIT 1")
    if row:
        return jsonify({"invoice_id": row["invoice_id"]})
    return jsonify({"error": "No invoices found"}), 404


@app.route("/masters/<entity>")
@login_required
def master_list(entity):
    if entity not in MASTER_CONFIG:
        return redirect(url_for("dashboard"))
    
    # Permission check
    if entity == "users" and not has_permission("manage_users"):
        flash("عذراً، ليس لديك صلاحية للوصول إلى إدارة المستخدمين", "danger")
        return redirect(url_for("dashboard"))
    elif entity in ["branches", "warehouses"] and not has_permission("manage_settings"):
        flash("عذراً، ليس لديك صلاحية للوصول إلى الإعدادات", "danger")
        return redirect(url_for("dashboard"))

    config = MASTER_CONFIG[entity]
    rows = query_all(f"SELECT * FROM {config['table']} ORDER BY {config['pk']} DESC LIMIT 300")
    return render_template(
        "table.html",
        title=config["label"],
        entity=entity,
        config=config,
        rows=rows,
    )

@app.route("/coa")
@login_required
def coa_tree():
    # Fetch all accounts ordered by code
    accounts = query_all("SELECT * FROM ChartOfAccounts ORDER BY account_code ASC")
    
    # Build a dictionary to hold the tree structure
    coa = []
    lookup = {}
    
    for acc in accounts:
        # Initialize children list for each account
        acc_dict = dict(acc)
        acc_dict['children'] = []
        lookup[acc['account_id']] = acc_dict
        
        if not acc['parent_id']:
            coa.append(acc_dict)
        else:
            parent = lookup.get(acc['parent_id'])
            if parent:
                parent['children'].append(acc_dict)
            else:
                # Fallback if parent not found or not in order (unlikely with code ordering)
                coa.append(acc_dict)
                
    return render_template("coa_tree.html", title="شجرة الحسابات", coa=coa)

@app.route("/masters/<entity>/new", methods=["GET", "POST"])
@app.route("/masters/<entity>/<int:record_id>/edit", methods=["GET", "POST"])
@login_required
def master_form(entity, record_id=None):
    if entity not in MASTER_CONFIG:
        return redirect(url_for("dashboard"))
    
    # Permission check
    if entity == "users" and not has_permission("manage_users"):
        flash("عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة", "danger")
        return redirect(url_for("dashboard"))
    elif entity in ["branches", "warehouses"] and not has_permission("manage_settings"):
        flash("عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة", "danger")
        return redirect(url_for("dashboard"))

    config = MASTER_CONFIG[entity]
    record = None
    if record_id:
        record = query_one(
            f"SELECT * FROM {config['table']} WHERE {config['pk']} = ?", (record_id,)
        )
    if request.method == "POST":
        try:
            save_master(entity, record_id)
            flash("تم حفظ البيانات بنجاح", "success")
            return redirect(url_for("master_list", entity=entity))
        except Exception as exc:
            flash(str(exc), "danger")
    return render_template(
        "master_form.html",
        title=config["label"],
        entity=entity,
        config=config,
        fields=build_form_data(config, record),
        record=record,
    )


@app.route("/items")
@login_required
def items_list():
    rows = query_all(
        """
        SELECT i.*, c.name_ar AS category_name, u.name_ar AS unit_name, s.name_ar AS supplier_name
        FROM Items i
        LEFT JOIN Categories c ON c.category_id = i.category_id
        LEFT JOIN Units u ON u.unit_id = i.base_unit_id
        LEFT JOIN Suppliers s ON s.supplier_id = i.default_supplier_id
        ORDER BY i.item_id DESC
        """
    )
    categories = query_all("SELECT * FROM Categories ORDER BY name_ar")
    return render_template("items_list.html", title="الأصناف", rows=rows, categories=categories)


@app.route("/items/new", methods=["GET", "POST"])
@app.route("/items/<int:item_id>/edit", methods=["GET", "POST"])
@login_required
def item_form(item_id=None):
    db = get_db()
    item = None
    if item_id:
        item = query_one("SELECT * FROM Items WHERE item_id = ?", (item_id,))

    if request.method == "POST":
        try:
            fields = [
                "item_code", "name_ar", "name_en", "category_id", "base_unit_id", "default_supplier_id",
                "cost_price", "min_stock", "max_stock", "has_expiry", "track_batches", "is_bundle",
                "is_service", "tax_rate", "description", "notes", "is_active"
            ]
            values = [
                request.form.get("item_code"),
                request.form.get("name_ar"),
                request.form.get("name_en") or None,
                request.form.get("category_id") or None,
                request.form.get("base_unit_id") or None,
                request.form.get("default_supplier_id") or None,
                request.form.get("cost_price") or 0,
                request.form.get("min_stock") or 0,
                request.form.get("max_stock") or 0,
                1 if request.form.get("has_expiry") == "on" else 0,
                1 if request.form.get("track_batches") == "on" else 0,
                1 if request.form.get("is_bundle") == "on" else 0,
                1 if request.form.get("is_service") == "on" else 0,
                request.form.get("tax_rate") or 0,
                request.form.get("description") or None,
                request.form.get("notes") or None,
                1 if request.form.get("is_active") == "on" else 0,
            ]
            if item_id:
                set_clause = ", ".join(f"{field} = ?" for field in fields)
                db.execute(f"UPDATE Items SET {set_clause} WHERE item_id = ?", (*values, item_id))
                current_item_id = item_id
            else:
                cursor = db.execute(
                    f"INSERT INTO Items ({', '.join(fields)}) VALUES ({', '.join(['?'] * len(fields))})",
                    values,
                )
                current_item_id = int(cursor.lastrowid)

            raw_base_unit = request.form.get("base_unit_id")
            if not raw_base_unit:
                raise ValueError("يجب اختيار الوحدة الأساسية")
            base_unit_id = int(raw_base_unit)
            exists = db.execute(
                "SELECT item_unit_id FROM ItemUnits WHERE item_id = ? AND unit_id = ?",
                (current_item_id, base_unit_id),
            ).fetchone()
            if exists:
                db.execute(
                    "UPDATE ItemUnits SET conversion_factor = 1, is_default_sale = 1, barcode = ? WHERE item_unit_id = ?",
                    (request.form.get("barcode") or None, exists[0]),
                )
                item_unit_id = exists[0]
            else:
                cursor = db.execute(
                    """
                    INSERT INTO ItemUnits (item_id, unit_id, conversion_factor, barcode, is_default_sale)
                    VALUES (?, ?, 1, ?, 1)
                    """,
                    (current_item_id, base_unit_id, request.form.get("barcode") or None),
                )
                item_unit_id = int(cursor.lastrowid)

            price_level_id = request.form.get("price_level_id") or None
            sale_price = request.form.get("sale_price") or None
            currency_row = query_one("SELECT currency_id FROM Currencies WHERE is_base = 1 LIMIT 1")
            currency_id = currency_row[0] if currency_row else 1
            if price_level_id and sale_price:
                existing_price = db.execute(
                    "SELECT item_price_id FROM ItemPrices WHERE item_id = ? AND item_unit_id = ? AND price_level_id = ? AND currency_id = ?",
                    (current_item_id, item_unit_id, price_level_id, currency_id),
                ).fetchone()
                if existing_price:
                    db.execute(
                        "UPDATE ItemPrices SET price = ?, effective_from = DATE('now') WHERE item_price_id = ?",
                        (sale_price, existing_price[0]),
                    )
                else:
                    db.execute(
                        """
                        INSERT INTO ItemPrices (item_id, item_unit_id, price_level_id, price, currency_id, effective_from)
                        VALUES (?, ?, ?, ?, ?, DATE('now'))
                        """,
                        (current_item_id, item_unit_id, price_level_id, sale_price, currency_id),
                    )
            db.commit()
            flash("تم حفظ الصنف بنجاح", "success")
            return redirect(url_for("items_list"))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")

    categories = query_all("SELECT category_id, name_ar FROM Categories WHERE is_active = 1 ORDER BY name_ar")
    units = query_all("SELECT unit_id, name_ar FROM Units ORDER BY name_ar")
    suppliers = query_all("SELECT supplier_id, name_ar FROM Suppliers WHERE is_active = 1 ORDER BY name_ar")
    price_levels = query_all("SELECT price_level_id, name_ar FROM PriceLevels WHERE is_active = 1 ORDER BY sort_order, price_level_id")
    item_price = None
    if item_id:
        item_price = query_one(
            """
            SELECT ip.*, iu.unit_id FROM ItemPrices ip
            JOIN ItemUnits iu ON iu.item_unit_id = ip.item_unit_id
            WHERE ip.item_id = ? ORDER BY ip.item_price_id DESC LIMIT 1
            """,
            (item_id,),
        )
    return render_template(
        "item_form.html",
        title="الصنف",
        item=item,
        categories=categories,
        units=units,
        suppliers=suppliers,
        price_levels=price_levels,
        item_price=item_price,
    )


@app.route("/settings/company", methods=["GET", "POST"])
@login_required
@permission_required('manage_settings')
def company_settings():
    db = get_db()
    company = query_one("SELECT * FROM Company WHERE company_id = 1")
    currencies = query_all("SELECT currency_id, code, name_ar FROM Currencies ORDER BY currency_id")
    if request.method == "POST":
        fields = [
            request.form.get("name_ar"),
            request.form.get("name_en") or None,
            request.form.get("legal_name") or None,
            request.form.get("tax_number") or None,
            request.form.get("commercial_reg") or None,
            request.form.get("address_ar") or None,
            request.form.get("phone") or None,
            request.form.get("email") or None,
            request.form.get("website") or None,
            request.form.get("base_currency_id"),
            request.form.get("fiscal_year_start_month") or 1,
        ]
        if company:
            db.execute(
                """
                UPDATE Company SET name_ar=?, name_en=?, legal_name=?, tax_number=?, commercial_reg=?,
                address_ar=?, phone=?, email=?, website=?, base_currency_id=?, fiscal_year_start_month=?
                WHERE company_id = 1
                """,
                fields,
            )
        else:
            db.execute(
                """
                INSERT INTO Company (company_id, name_ar, name_en, legal_name, tax_number, commercial_reg,
                address_ar, phone, email, website, base_currency_id, fiscal_year_start_month)
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                fields,
            )
        db.execute(
            """
            INSERT OR REPLACE INTO Settings (setting_key, setting_value, data_type, category) 
            VALUES ('receipt_header', ?, 'TEXT', 'receipt')
            """, (request.form.get("receipt_header") or "",)
        )
        db.execute(
            """
            INSERT OR REPLACE INTO Settings (setting_key, setting_value, data_type, category) 
            VALUES ('receipt_footer', ?, 'TEXT', 'receipt')
            """, (request.form.get("receipt_footer") or "شكراً لزيارتكم\nThank you for your visit",)
        )
        
        logo_file = request.files.get("receipt_logo")
        if logo_file and logo_file.filename:
            import os
            from werkzeug.utils import secure_filename
            logo_ext = logo_file.filename.split('.')[-1].lower()
            if logo_ext in ['png', 'jpg', 'jpeg', 'gif']:
                filename = f"receipt_logo.{logo_ext}"
                upload_dir = str(UPLOADS_DIR)
                os.makedirs(upload_dir, exist_ok=True)
                logo_file.save(os.path.join(upload_dir, filename))
                db.execute("INSERT OR REPLACE INTO Settings (setting_key, setting_value, data_type, category) VALUES ('receipt_logo', ?, 'TEXT', 'receipt')", (filename,))
        
        if request.form.get("remove_logo"):
            db.execute("DELETE FROM Settings WHERE setting_key = 'receipt_logo'")
            
        db.commit()
        flash("تم حفظ بيانات الشركة والإعدادات بنجاح", "success")
        return redirect(url_for("company_settings"))
        
    receipt_header = query_one("SELECT setting_value FROM Settings WHERE setting_key = 'receipt_header'")
    receipt_header_val = receipt_header['setting_value'] if receipt_header else ""
    
    receipt_footer = query_one("SELECT setting_value FROM Settings WHERE setting_key = 'receipt_footer'")
    receipt_footer_val = receipt_footer['setting_value'] if receipt_footer else "شكراً لزيارتكم\nThank you for your visit"
    
    receipt_logo = query_one("SELECT setting_value FROM Settings WHERE setting_key = 'receipt_logo'")
    receipt_logo_val = receipt_logo['setting_value'] if receipt_logo else None

    return render_template("company_form.html", title="بيانات الشركة", company=company, currencies=currencies, receipt_header=receipt_header_val, receipt_footer=receipt_footer_val, receipt_logo=receipt_logo_val)


@app.route("/inventory/barcode")
@login_required
@permission_required('manage_inventory')
def barcode_print():
    # Fetch all items that have a barcode/item_code and join with prices if available
    items = query_all("""
        SELECT i.item_id, i.item_code, i.name_ar, 
               COALESCE((SELECT price FROM ItemPrices ip WHERE ip.item_id = i.item_id LIMIT 1), 0) as sale_price
        FROM Items i 
        WHERE i.item_code IS NOT NULL AND i.item_code != '' 
        ORDER BY i.name_ar
    """)
    return render_template("barcode_print.html", title="طباعة الباركود", items=items)

@app.route("/inventory/stock/print")
@login_required
@permission_required('manage_inventory')
def stock_print():
    rows = query_all(
        """
        SELECT s.*, i.item_code, i.name_ar AS item_name, w.name_ar AS warehouse_name,
               i.min_stock, i.max_stock
        FROM Stock s
        JOIN Items i ON i.item_id = s.item_id
        JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
        ORDER BY i.name_ar, w.name_ar
        """
    )
    return render_template("print_stock.html", title="تقرير المخزون الحالي", rows=rows)

@app.route("/inventory/stock")

@login_required
@permission_required('manage_inventory')
def stock_view():
    rows = query_all(
        """
        SELECT s.*, i.item_code, i.name_ar AS item_name, w.name_ar AS warehouse_name,
               i.min_stock, i.max_stock
        FROM Stock s
        JOIN Items i ON i.item_id = s.item_id
        JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
        ORDER BY i.name_ar, w.name_ar
        """
    )
    return render_template("stock.html", title="المخزون الحالي", rows=rows)


@app.route("/inventory/alerts")
@login_required
def alerts_view():
    low_stock = query_all(
        """
        SELECT i.item_code, i.name_ar AS item_name, w.name_ar AS warehouse_name,
               s.quantity, i.min_stock
        FROM Stock s
        JOIN Items i ON i.item_id = s.item_id
        JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
        WHERE s.quantity > 0 AND s.quantity <= COALESCE(i.min_stock, 0) AND i.min_stock > 0
        ORDER BY s.quantity ASC
        """
    )
    out_of_stock = query_all(
        """
        SELECT i.item_code, i.name_ar AS item_name, w.name_ar AS warehouse_name,
               i.min_stock
        FROM Stock s
        JOIN Items i ON i.item_id = s.item_id
        JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
        WHERE s.quantity <= 0 AND i.is_active = 1
        ORDER BY i.name_ar
        """
    )
    expiry_raw = query_all(
        """
        SELECT b.batch_number, i.name_ar AS item_name, w.name_ar AS warehouse_name,
               b.expiry_date, b.remaining_qty,
               CAST(julianday(b.expiry_date) - julianday('now') AS INTEGER) AS days_left
        FROM StockBatches b
        JOIN Items i ON i.item_id = b.item_id
        JOIN Warehouses w ON w.warehouse_id = b.warehouse_id
        WHERE b.expiry_date IS NOT NULL
          AND DATE(b.expiry_date) <= DATE('now', '+30 day')
          AND b.remaining_qty > 0
        ORDER BY b.expiry_date
        """
    )
    expiry = []
    for row in expiry_raw:
        d = dict(row)
        d['is_expired'] = (d['days_left'] or 0) < 0
        d['days_left'] = max(d['days_left'] or 0, 0)
        expiry.append(d)
    return render_template("alerts.html", title="التنبيهات",
                           low_stock=low_stock, out_of_stock=out_of_stock, expiry=expiry)


def build_item_units_payload():
    rows = query_all(
        """
        SELECT i.item_id, i.item_code, i.name_ar AS item_name, i.tax_rate, iu.item_unit_id,
               u.name_ar AS unit_name, iu.conversion_factor, iu.barcode,
               COALESCE(ip.price, 0) AS sale_price
        FROM Items i
        JOIN ItemUnits iu ON iu.item_id = i.item_id
        JOIN Units u ON u.unit_id = iu.unit_id
        LEFT JOIN ItemPrices ip ON ip.item_unit_id = iu.item_unit_id
        WHERE i.is_active = 1
        ORDER BY i.name_ar, iu.item_unit_id
        """
    )
    payload = {}
    barcode_map = {}
    for row in rows:
        entry = {
            "item_unit_id": row["item_unit_id"],
            "label": row["unit_name"],
            "conversion_factor": float(row["conversion_factor"] or 1),
            "sale_price": float(row["sale_price"] or 0),
            "tax_rate": float(row["tax_rate"] or 0),
            "barcode": row["barcode"] or "",
        }
        payload.setdefault(str(row["item_id"]), []).append(entry)
        if row["barcode"]:
            barcode_map[row["barcode"]] = {
                "item_id": row["item_id"],
                "item_code": row["item_code"],
                "name_ar": row["item_name"],
                "item_unit_id": row["item_unit_id"],
                "sale_price": float(row["sale_price"] or 0),
                "tax_rate": float(row["tax_rate"] or 0),
            }
    # Also map item_code as a scannable value
    for row in rows:
        code = row["item_code"]
        if code and code not in barcode_map:
            barcode_map[code] = {
                "item_id": row["item_id"],
                "item_code": code,
                "name_ar": row["item_name"],
                "item_unit_id": row["item_unit_id"],
                "sale_price": float(row["sale_price"] or 0),
                "tax_rate": float(row["tax_rate"] or 0),
            }
    return payload, barcode_map


@app.route("/purchases/invoices")
@login_required
def purchases_list():
    date_from = request.args.get("date_from", "")
    date_to = request.args.get("date_to", "")
    supplier_id = request.args.get("customer_id", "") # transactions_list uses 'customer_id' name for both
    search_q = request.args.get("q", "").strip()

    def norm(c): return f"REPLACE(REPLACE(REPLACE(REPLACE(REPLACE({c}, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ة', 'ه'), 'ى', 'ي')"

    where_clauses = []
    params = []
    if date_from:
        where_clauses.append("DATE(p.invoice_date) >= ?")
        params.append(date_from)
    if date_to:
        where_clauses.append("DATE(p.invoice_date) <= ?")
        params.append(date_to)
    if supplier_id:
        where_clauses.append("p.supplier_id = ?")
        params.append(int(supplier_id))
    if search_q:
        q_norm = search_q.replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ة','ه').replace('ى','ي')
        where_clauses.append(f"(p.invoice_number LIKE ? OR {norm('s.name_ar')} LIKE ?)")
        params.extend([f"%{search_q}%", f"%{q_norm}%"])

    where = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    rows = query_all(f"""
        SELECT p.*, s.name_ar AS supplier_name, w.name_ar AS warehouse_name
        FROM PurchaseInvoices p
        JOIN Suppliers s ON s.supplier_id = p.supplier_id
        JOIN Warehouses w ON w.warehouse_id = p.warehouse_id
        {where}
        ORDER BY p.invoice_id DESC
        LIMIT 200
    """, params)
    
    suppliers = query_all("SELECT supplier_id AS customer_id, name_ar FROM Suppliers WHERE is_active = 1 ORDER BY name_ar")
    return render_template("transactions_list.html", title="فواتير الشراء", rows=rows, kind="purchase",
                           customers=suppliers, search_q=search_q, date_from=date_from, date_to=date_to, customer_id=supplier_id)


@app.route("/purchases/invoices/new", methods=["GET", "POST"])
@login_required
def purchase_create():
    db = get_db()
    if request.method == "POST":
        try:
            lines = []
            item_ids = request.form.getlist("item_id[]")
            for idx, item_id in enumerate(item_ids):
                if not item_id:
                    continue
                lines.append(
                    {
                        "item_id": item_id,
                        "item_unit_id": request.form.getlist("item_unit_id[]")[idx],
                        "quantity": request.form.getlist("quantity[]")[idx],
                        "unit_cost": request.form.getlist("unit_cost[]")[idx],
                        "discount_amount": request.form.getlist("discount_amount[]")[idx] or 0,
                        "tax_amount": request.form.getlist("tax_amount[]")[idx] or 0,
                        "batch_number": request.form.getlist("batch_number[]")[idx] or None,
                        "production_date": request.form.getlist("production_date[]")[idx] or None,
                        "expiry_date": request.form.getlist("expiry_date[]")[idx] or None,
                    }
                )
            invoice_id = create_purchase_invoice(
                db,
                {
                    "invoice_date": request.form.get("invoice_date"),
                    "branch_id": request.form.get("branch_id"),
                    "warehouse_id": request.form.get("warehouse_id"),
                    "supplier_id": request.form.get("supplier_id"),
                    "payment_type": request.form.get("payment_type"),
                    "paid_amount": request.form.get("paid_amount") or 0,
                    "discount_amount": request.form.get("discount_amount") or 0,
                    "shipping_cost": request.form.get("shipping_cost") or 0,
                    "supplier_invoice_no": request.form.get("supplier_invoice_no") or None,
                    "notes": request.form.get("notes") or None,
                    "payment_method": request.form.get("payment_method") or "CASH",
                    "created_by": g.user["user_id"],
                    "items": lines,
                },
            )
            db.commit()
            flash("تم إنشاء فاتورة الشراء وترحيلها بنجاح", "success")
            return redirect(url_for("purchase_view", invoice_id=invoice_id))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")

    return render_template(
        "purchase_form.html",
        title="فاتورة شراء جديدة",
        branches=query_all("SELECT branch_id, name_ar FROM Branches WHERE is_active = 1 ORDER BY name_ar"),
        warehouses=query_all("SELECT warehouse_id, branch_id, name_ar FROM Warehouses WHERE is_active = 1 ORDER BY name_ar"),
        suppliers=query_all("SELECT supplier_id, name_ar FROM Suppliers WHERE is_active = 1 ORDER BY name_ar"),
        items=query_all("SELECT item_id, item_code, name_ar FROM Items WHERE is_active = 1 ORDER BY name_ar"),
        item_units_map=build_item_units_payload()[0],
    )


@app.route("/purchases/invoices/<int:invoice_id>")
@login_required
def purchase_view(invoice_id):
    header = query_one(
        """
        SELECT p.*, s.name_ar AS supplier_name, b.name_ar AS branch_name, w.name_ar AS warehouse_name
        FROM PurchaseInvoices p
        JOIN Suppliers s ON s.supplier_id = p.supplier_id
        JOIN Branches b ON b.branch_id = p.branch_id
        JOIN Warehouses w ON w.warehouse_id = p.warehouse_id
        WHERE p.invoice_id = ?
        """,
        (invoice_id,),
    )
    lines = query_all(
        """
        SELECT l.*, i.name_ar AS item_name, u.name_ar AS unit_name
        FROM PurchaseInvoiceItems l
        JOIN Items i ON i.item_id = l.item_id
        JOIN ItemUnits iu ON iu.item_unit_id = l.item_unit_id
        JOIN Units u ON u.unit_id = iu.unit_id
        WHERE l.invoice_id = ?
        ORDER BY l.line_id
        """,
        (invoice_id,),
    )
    return render_template("invoice_view.html", title="عرض فاتورة الشراء", header=header, lines=lines, kind="purchase")


@app.route("/sales/invoices")
@login_required
def sales_list():
    date_from = request.args.get("date_from", "")
    date_to = request.args.get("date_to", "")
    customer_id = request.args.get("customer_id", "")
    search_q = request.args.get("q", "").strip()

    where_clauses = []
    params = []
    if date_from:
        where_clauses.append("DATE(s.invoice_date) >= ?")
        params.append(date_from)
    if date_to:
        where_clauses.append("DATE(s.invoice_date) <= ?")
        params.append(date_to)
    if customer_id:
        where_clauses.append("s.customer_id = ?")
        params.append(int(customer_id))
    if search_q:
        def norm(c): return f"REPLACE(REPLACE(REPLACE(REPLACE(REPLACE({c}, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ة', 'ه'), 'ى', 'ي')"
        q_norm = search_q.replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ة','ه').replace('ى','ي')
        where_clauses.append(f"(s.invoice_number LIKE ? OR {norm('c.name_ar')} LIKE ?)")
        params.extend([f"%{search_q}%", f"%{q_norm}%"])

    where = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    rows = query_all(f"""
        SELECT s.*, c.name_ar AS customer_name, w.name_ar AS warehouse_name
        FROM SalesInvoices s
        LEFT JOIN Customers c ON c.customer_id = s.customer_id
        JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
        {where}
        ORDER BY s.invoice_id DESC
        LIMIT 300
    """, params)

    customers = query_all("SELECT customer_id, name_ar FROM Customers WHERE is_active = 1 ORDER BY name_ar")
    return render_template("transactions_list.html", title="فواتير المبيعات", rows=rows, kind="sale",
                           customers=customers, date_from=date_from, date_to=date_to,
                           customer_id=customer_id, search_q=search_q)


@app.route("/sales/invoices/new", methods=["GET", "POST"])
@login_required
def sales_create():
    db = get_db()
    if request.method == "POST":
        try:
            lines = []
            item_ids = request.form.getlist("item_id[]")
            for idx, item_id in enumerate(item_ids):
                if not item_id:
                    continue
                lines.append(
                    {
                        "item_id": item_id,
                        "item_unit_id": request.form.getlist("item_unit_id[]")[idx],
                        "quantity": request.form.getlist("quantity[]")[idx],
                        "unit_price": request.form.getlist("unit_price[]")[idx],
                        "discount_amount": request.form.getlist("discount_amount[]")[idx] or 0,
                        "tax_rate": request.form.getlist("tax_rate[]")[idx] or 0,
                    }
                )
            invoice_id = create_sales_invoice(
                db,
                {
                    "invoice_date": request.form.get("invoice_date"),
                    "branch_id": request.form.get("branch_id"),
                    "warehouse_id": request.form.get("warehouse_id"),
                    "customer_id": request.form.get("customer_id") or None,
                    "payment_type": request.form.get("payment_type"),
                    "paid_amount": request.form.get("paid_amount") or 0,
                    "notes": request.form.get("notes") or None,
                    "payment_method": request.form.get("payment_method") or "CASH",
                    "created_by": g.user["user_id"],
                    "items": lines,
                },
            )
            db.commit()
            # If from POS, redirect to receipt for auto-print
            if request.form.get("payment_type") == "CASH" and "/pos" in (request.referrer or ""):
                return redirect(url_for("sales_receipt", invoice_id=invoice_id, auto=1))
            flash("تم إنشاء فاتورة البيع وترحيلها بنجاح", "success")
            return redirect(url_for("sales_view", invoice_id=invoice_id))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")

    return render_template(
        "sales_form.html",
        title="فاتورة بيع جديدة",
        branches=query_all("SELECT branch_id, name_ar FROM Branches WHERE is_active = 1 ORDER BY name_ar"),
        warehouses=query_all("SELECT warehouse_id, branch_id, name_ar FROM Warehouses WHERE is_active = 1 ORDER BY name_ar"),
        customers=query_all("SELECT customer_id, name_ar, phone, current_balance FROM Customers WHERE is_active = 1 ORDER BY name_ar"),
        items=query_all("SELECT item_id, item_code, name_ar FROM Items WHERE is_active = 1 ORDER BY name_ar"),
        item_units_map=build_item_units_payload()[0],
    )


@app.route("/sales/invoices/<int:invoice_id>")
@login_required
def sales_view(invoice_id):
    header = query_one(
        """
        SELECT s.*, c.name_ar AS customer_name, b.name_ar AS branch_name, w.name_ar AS warehouse_name
        FROM SalesInvoices s
        LEFT JOIN Customers c ON c.customer_id = s.customer_id
        JOIN Branches b ON b.branch_id = s.branch_id
        JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
        WHERE s.invoice_id = ?
        """,
        (invoice_id,),
    )
    lines = query_all(
        """
        SELECT l.*, i.name_ar AS item_name, u.name_ar AS unit_name
        FROM SalesInvoiceItems l
        JOIN Items i ON i.item_id = l.item_id
        JOIN ItemUnits iu ON iu.item_unit_id = l.item_unit_id
        JOIN Units u ON u.unit_id = iu.unit_id
        WHERE l.invoice_id = ?
        ORDER BY l.line_id
        """,
        (invoice_id,),
    )
    return render_template("invoice_view.html", title="عرض فاتورة البيع", header=header, lines=lines, kind="sale")


# --- Company helper ---
def get_company_info():
    comp = query_one("SELECT * FROM Company LIMIT 1")
    if not comp:
        comp = {}
    else:
        comp = dict(comp)
    
    # Add receipt settings
    r_head = query_one("SELECT setting_value FROM Settings WHERE setting_key = 'receipt_header'")
    r_foot = query_one("SELECT setting_value FROM Settings WHERE setting_key = 'receipt_footer'")
    r_logo = query_one("SELECT setting_value FROM Settings WHERE setting_key = 'receipt_logo'")
    
    comp['receipt_header'] = r_head['setting_value'] if r_head and r_head['setting_value'] else None
    comp['receipt_footer'] = r_foot['setting_value'] if r_foot and r_foot['setting_value'] else "شكراً لزيارتكم"
    comp['receipt_logo'] = r_logo['setting_value'] if r_logo and r_logo['setting_value'] else None
    
    return comp


# ============================================================================
# RECEIPT & PRINT (الطباعة)
# ============================================================================

@app.route("/sales/invoices/<int:invoice_id>/receipt")
@login_required
def sales_receipt(invoice_id):
    header = query_one(
        """SELECT s.*, c.name_ar AS customer_name, b.name_ar AS branch_name,
                  w.name_ar AS warehouse_name, u.full_name_ar AS cashier_name
           FROM SalesInvoices s
           LEFT JOIN Customers c ON c.customer_id = s.customer_id
           JOIN Branches b ON b.branch_id = s.branch_id
           JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
           LEFT JOIN Users u ON u.user_id = s.cashier_id
           WHERE s.invoice_id = ?""", (invoice_id,))
    lines = query_all(
        """SELECT l.*, i.name_ar AS item_name
           FROM SalesInvoiceItems l JOIN Items i ON i.item_id = l.item_id
           WHERE l.invoice_id = ? ORDER BY l.line_id""", (invoice_id,))
    auto_print = request.args.get("auto", "0") == "1"
    return render_template("receipt.html", header=header, lines=lines,
                           company=get_company_info(), auto_print=auto_print)


@app.route("/sales/invoices/<int:invoice_id>/print")
@login_required
def sales_print(invoice_id):
    header = query_one(
        """SELECT s.*, c.name_ar AS customer_name, b.name_ar AS branch_name,
                  w.name_ar AS warehouse_name
           FROM SalesInvoices s
           LEFT JOIN Customers c ON c.customer_id = s.customer_id
           JOIN Branches b ON b.branch_id = s.branch_id
           JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
           WHERE s.invoice_id = ?""", (invoice_id,))
    lines = query_all(
        """SELECT l.*, i.name_ar AS item_name, u2.name_ar AS unit_name
           FROM SalesInvoiceItems l
           JOIN Items i ON i.item_id = l.item_id
           JOIN ItemUnits iu ON iu.item_unit_id = l.item_unit_id
           JOIN Units u2 ON u2.unit_id = iu.unit_id
           WHERE l.invoice_id = ? ORDER BY l.line_id""", (invoice_id,))
    return render_template("invoice_print.html", header=header, lines=lines,
                           company=get_company_info(), kind="sale")


@app.route("/purchases/invoices/<int:invoice_id>/print")
@login_required
def purchase_print(invoice_id):
    header = query_one(
        """SELECT p.*, s.name_ar AS supplier_name, b.name_ar AS branch_name,
                  w.name_ar AS warehouse_name
           FROM PurchaseInvoices p
           LEFT JOIN Suppliers s ON s.supplier_id = p.supplier_id
           JOIN Branches b ON b.branch_id = p.branch_id
           JOIN Warehouses w ON w.warehouse_id = p.warehouse_id
           WHERE p.invoice_id = ?""", (invoice_id,))
    lines = query_all(
        """SELECT l.*, i.name_ar AS item_name, u2.name_ar AS unit_name
           FROM PurchaseInvoiceItems l
           JOIN Items i ON i.item_id = l.item_id
           JOIN ItemUnits iu ON iu.item_unit_id = l.item_unit_id
           JOIN Units u2 ON u2.unit_id = iu.unit_id
           WHERE l.invoice_id = ? ORDER BY l.line_id""", (invoice_id,))
    return render_template("invoice_print.html", header=header, lines=lines,
                           company=get_company_info(), kind="purchase")


# ============================================================================
# CASH SESSIONS (جلسات الكاشير)
# ============================================================================

@app.route("/pos/open-session", methods=["POST"])
@login_required
def pos_open_session():
    db = get_db()
    active = query_one("SELECT session_id FROM CashSessions WHERE user_id = ? AND status = 'OPEN'",
                       (g.user["user_id"],))
    if active:
        flash("لديك وردية مفتوحة بالفعل", "warning")
        return redirect(url_for("pos_interface"))
    opening = float(request.form.get("opening_balance", 0))
    branch_id = request.form.get("branch_id", 1)
    from services import next_number
    session_number = next_number(db, "CashSessions", "session_number", "CS")
    db.execute(
        """INSERT INTO CashSessions (session_number, user_id, branch_id, opening_balance, opened_at, status)
           VALUES (?, ?, ?, ?, DATETIME('now','localtime'), 'OPEN')""",
        (session_number, g.user["user_id"], branch_id, opening))
    db.commit()
    flash("تم فتح الوردية بنجاح", "success")
    return redirect(url_for("pos_interface"))


@app.route("/pos/close-session", methods=["POST"])
@login_required
def pos_close_session():
    db = get_db()
    session = query_one("SELECT * FROM CashSessions WHERE user_id = ? AND status = 'OPEN'",
                        (g.user["user_id"],))
    if not session:
        flash("لا توجد وردية مفتوحة", "warning")
        return redirect(url_for("pos_interface"))
    closing = float(request.form.get("closing_balance", 0))
    notes = request.form.get("notes", "")
    # Calculate totals for this session by payment type (use cash_session_id for accuracy)
    totals = query_one(
        """SELECT COALESCE(SUM(total), 0) AS total_sales,
                  COALESCE(SUM(CASE WHEN payment_type='CASH' THEN total ELSE 0 END), 0) AS total_cash,
                  COALESCE(SUM(CASE WHEN payment_type='CARD' THEN total ELSE 0 END), 0) AS total_card
           FROM SalesInvoices
           WHERE cash_session_id = ?""",
        (session["session_id"],))
    total_sales = float(totals["total_sales"])
    total_cash = float(totals["total_cash"])
    total_card = float(totals["total_card"])
    expected = float(session["opening_balance"] or 0) + total_cash
    variance = round(closing - expected, 4)
    db.execute(
        """UPDATE CashSessions SET closing_balance = ?, closed_at = DATETIME('now','localtime'),
           total_sales = ?, total_cash = ?, total_card = ?,
           expected_balance = ?, variance = ?,
           notes = ?, status = 'CLOSED' WHERE session_id = ?""",
        (closing, total_sales, total_cash, total_card, expected, variance, notes, session["session_id"]))
    db.commit()
    flash("تم إغلاق الوردية بنجاح", "success")
    return redirect(url_for("pos_z_report", session_id=session["session_id"]))


@app.route("/pos/z-report")
@app.route("/pos/z-report/<int:session_id>")
@login_required
def pos_z_report(session_id=None):
    if session_id:
        session_data = query_one(
            """SELECT cs.*, u.full_name_ar AS cashier_name, b.name_ar AS branch_name
               FROM CashSessions cs
               JOIN Users u ON u.user_id = cs.user_id
               JOIN Branches b ON b.branch_id = cs.branch_id
               WHERE cs.session_id = ?""", (session_id,))
    else:
        session_data = query_one(
            """SELECT cs.*, u.full_name_ar AS cashier_name, b.name_ar AS branch_name
               FROM CashSessions cs
               JOIN Users u ON u.user_id = cs.user_id
               JOIN Branches b ON b.branch_id = cs.branch_id
               WHERE cs.user_id = ? ORDER BY cs.session_id DESC LIMIT 1""",
            (g.user["user_id"],))
    if not session_data:
        flash("لا توجد بيانات وردية", "warning")
        return redirect(url_for("pos_interface"))
    sales = query_all(
        """SELECT s.invoice_number, s.invoice_date, s.total, s.payment_type,
                  c.name_ar AS customer_name
           FROM SalesInvoices s
           LEFT JOIN Customers c ON c.customer_id = s.customer_id
           WHERE s.cash_session_id = ?
           ORDER BY s.invoice_date""",
        (session_data["session_id"],))
    summary = query_one(
        """SELECT COUNT(*) AS count, COALESCE(SUM(total),0) AS total,
                  COALESCE(SUM(CASE WHEN payment_type='CASH' THEN total ELSE 0 END),0) AS cash_total,
                  COALESCE(SUM(CASE WHEN payment_type='CARD' THEN total ELSE 0 END),0) AS card_total,
                  COALESCE(SUM(CASE WHEN payment_type='BANK' THEN total ELSE 0 END),0) AS bank_total
           FROM SalesInvoices WHERE cash_session_id = ?""",
        (session_data["session_id"],))
    return render_template("z_report.html", title="تقرير نهاية الوردية (Z-Report)",
                           session=session_data, sales=sales, summary=summary,
                           company=get_company_info())


# ============================================================================
# HELD INVOICES (الفواتير المعلقة)
# ============================================================================

@app.route("/pos/hold", methods=["POST"])
@login_required
def pos_hold_invoice():
    db = get_db()
    cart_data = request.form.get("cart_data", "[]")
    customer_id = request.form.get("customer_id") or None
    branch_id = request.form.get("branch_id") or query_one("SELECT branch_id FROM Branches WHERE is_active = 1 LIMIT 1")["branch_id"]
    # Calculate total from cart
    import json as _json
    try:
        cart_items = _json.loads(cart_data)
        total_amount = sum(float(c.get("unit_price", 0)) * float(c.get("quantity", 0)) for c in cart_items)
    except Exception:
        total_amount = 0
    # Build hold_label
    hold_label = f"عميل نقدي"
    if customer_id:
        cust = query_one("SELECT name_ar FROM Customers WHERE customer_id = ?", (customer_id,))
        if cust:
            hold_label = cust["name_ar"]
    db.execute(
        """INSERT INTO HeldInvoices (cashier_id, branch_id, invoice_data, total_amount, hold_label, held_at)
           VALUES (?, ?, ?, ?, ?, DATETIME('now','localtime'))""",
        (g.user["user_id"], branch_id, cart_data, round(total_amount, 4), hold_label))
    db.commit()
    return jsonify({"status": "ok", "message": "تم تعليق الفاتورة"})


@app.route("/pos/held")
@login_required
def pos_held_list():
    rows = query_all(
        """SELECT h.held_id, h.hold_label, h.total_amount, h.held_at,
                  u.full_name_ar AS user_name
           FROM HeldInvoices h
           JOIN Users u ON u.user_id = h.cashier_id
           ORDER BY h.held_at DESC LIMIT 50""")
    return jsonify([dict(r) for r in rows])


@app.route("/pos/recall/<int:held_id>", methods=["POST"])
@login_required
def pos_recall_invoice(held_id):
    db = get_db()
    held = query_one("SELECT * FROM HeldInvoices WHERE held_id = ?", (held_id,))
    if not held:
        return jsonify({"status": "error", "message": "غير موجودة"}), 404
    db.execute("DELETE FROM HeldInvoices WHERE held_id = ?", (held_id,))
    db.commit()
    return jsonify({"status": "ok", "cart_data": held["invoice_data"],
                    "customer_id": None})


# ============================================================================
# POS CHECKOUT API (واجهة الدفع من نقطة البيع)
# ============================================================================

@app.route("/pos/checkout", methods=["POST"])
@login_required
def pos_checkout():
    """AJAX endpoint for POS payment — returns JSON instead of HTML."""
    db = get_db()
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"status": "error", "message": "بيانات غير صالحة"}), 400

        cart = data.get("cart", [])
        if not cart:
            return jsonify({"status": "error", "message": "السلة فارغة!"}), 400

        lines = []
        for item in cart:
            lines.append({
                "item_id": item["item_id"],
                "item_unit_id": item["item_unit_id"],
                "quantity": item["quantity"],
                "unit_price": item["unit_price"],
                "discount_amount": item.get("discount_amount", 0),
                "tax_rate": item.get("tax_rate", 0),
            })

        # Get active cash session ID if any
        active_session = query_one(
            "SELECT session_id FROM CashSessions WHERE user_id = ? AND status = 'OPEN'",
            (g.user["user_id"],))
        cash_session_id = active_session["session_id"] if active_session else None

        invoice_id = create_sales_invoice(
            db,
            {
                "invoice_date": data.get("invoice_date") or None,
                "branch_id": data.get("branch_id"),
                "warehouse_id": data.get("warehouse_id"),
                "customer_id": data.get("customer_id") or None,
                "payment_type": data.get("payment_type", "CASH"),
                "paid_amount_full": data.get("payment_type", "CASH") in ("CASH", "CARD", "BANK"),
                "notes": data.get("notes") or None,
                "cash_session_id": cash_session_id,
                "created_by": g.user["user_id"],
                "items": lines,
            },
        )
        db.commit()
        receipt_url = url_for("sales_receipt", invoice_id=invoice_id, auto=1)
        return jsonify({"status": "ok", "invoice_id": invoice_id, "receipt_url": receipt_url})
    except Exception as exc:
        db.rollback()
        return jsonify({"status": "error", "message": str(exc)}), 400


# ============================================================================
# PAYMENT VOUCHERS (سندات القبض والصرف)
# ============================================================================

@app.route("/vouchers")
@login_required
def vouchers_list():
    rows = query_all(
        """SELECT p.*, c.name_ar AS customer_name, s.name_ar AS supplier_name
           FROM Payments p
           LEFT JOIN Customers c ON c.customer_id = p.customer_id
           LEFT JOIN Suppliers s ON s.supplier_id = p.supplier_id
           WHERE p.reference_type IN ('RECEIPT_VOUCHER', 'PAYMENT_VOUCHER')
           ORDER BY p.payment_id DESC LIMIT 200""")
    return render_template("vouchers_list.html", title="سندات استلام وصرف كاش", rows=rows)


@app.route("/vouchers/new", methods=["GET", "POST"])
@login_required
def voucher_create():
    db = get_db()
    if request.method == "POST":
        try:
            from services import create_journal_entry, account_id_by_code, get_base_currency_id
            voucher_type = request.form.get("voucher_type")  # RECEIPT or PAYMENT
            amount = float(request.form.get("amount", 0))
            customer_id = request.form.get("customer_id") or None
            supplier_id = request.form.get("supplier_id") or None
            payment_method = request.form.get("payment_method", "CASH")
            description = request.form.get("description", "")
            payment_date = request.form.get("payment_date")

            if amount <= 0:
                raise ValueError("المبلغ يجب أن يكون أكبر من صفر")

            currency_id = get_base_currency_id(db)
            cash_account = account_id_by_code(db, "1110")

            if voucher_type == "RECEIPT":
                # سند قبض: مدين الصندوق، دائن الذمم المدينة
                if not customer_id:
                    raise ValueError("يجب اختيار العميل لسند القبض")
                receivables_account = account_id_by_code(db, "1200")
                je_id = create_journal_entry(
                    db,
                    entry_date=payment_date,
                    description=f"سند قبض - {description}",
                    reference_type="RECEIPT_VOUCHER",
                    reference_id=customer_id,
                    lines=[
                        {"account_id": cash_account, "debit": amount, "credit": 0, "description": f"سند قبض - {description}"},
                        {"account_id": receivables_account, "debit": 0, "credit": amount, "description": f"سند قبض - {description}"},
                    ],
                    created_by=g.user["user_id"],
                    is_auto=0,
                )
                payment_direction = "IN"
                # Update customer balance
                db.execute("UPDATE Customers SET current_balance = current_balance - ? WHERE customer_id = ?",
                           (amount, customer_id))
            else:
                # سند صرف: مدين الذمم الدائنة، دائن الصندوق
                if not supplier_id:
                    raise ValueError("يجب اختيار المورد لسند الصرف")
                payables_account = account_id_by_code(db, "2100")
                je_id = create_journal_entry(
                    db,
                    entry_date=payment_date,
                    description=f"سند صرف - {description}",
                    reference_type="PAYMENT_VOUCHER",
                    reference_id=supplier_id,
                    lines=[
                        {"account_id": payables_account, "debit": amount, "credit": 0, "description": f"سند صرف - {description}"},
                        {"account_id": cash_account, "debit": 0, "credit": amount, "description": f"سند صرف - {description}"},
                    ],
                    created_by=g.user["user_id"],
                    is_auto=0,
                )
                payment_direction = "OUT"
                # Update supplier balance
                db.execute("UPDATE Suppliers SET current_balance = current_balance - ? WHERE supplier_id = ?",
                           (amount, supplier_id))

            # Record payment
            from services import next_number as _next_number
            payment_number = _next_number(db, "Payments", "payment_number", "PAY")
            db.execute(
                """INSERT INTO Payments (payment_number, payment_date, payment_direction, amount,
                   payment_method, currency_id, reference_type, reference_id,
                   customer_id, supplier_id, journal_entry_id, notes, created_by)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (payment_number, payment_date, payment_direction, amount, payment_method,
                 currency_id, voucher_type + '_VOUCHER', je_id,
                 customer_id, supplier_id, je_id, description, g.user["user_id"]))
            db.commit()
            flash(f"تم إنشاء {'سند القبض' if voucher_type == 'RECEIPT' else 'سند الصرف'} بنجاح", "success")
            return redirect(url_for("vouchers_list"))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")

    return render_template("voucher_form.html", title="سند قبض / صرف جديد",
        customers=query_all("SELECT customer_id, name_ar FROM Customers WHERE is_active = 1 ORDER BY name_ar"),
        suppliers=query_all("SELECT supplier_id, name_ar FROM Suppliers WHERE is_active = 1 ORDER BY name_ar"))


@app.route("/api/invoice/<query>")
@login_required
def api_get_invoice(query):
    """Fetch invoice details by ID or Number."""
    db = get_db()
    invoice = query_one(
        "SELECT invoice_id, invoice_number, invoice_date FROM SalesInvoices WHERE invoice_id = ? OR invoice_number = ?",
        (query, query)
    )
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404
    
    lines = query_all(
        """
        SELECT l.line_id, l.quantity, l.unit_price, l.tax_rate, i.name_ar AS item_name
        FROM SalesInvoiceItems l
        JOIN Items i ON i.item_id = l.item_id
        WHERE l.invoice_id = ?
        ORDER BY l.line_id
        """,
        (invoice["invoice_id"],)
    )
    return jsonify({
        "invoice": dict(invoice),
        "lines": [dict(x) for x in lines]
    })


@app.route("/sales/returns/new", methods=["GET", "POST"])
@login_required
def sales_return_create():
    db = get_db()
    if request.method == "POST":
        try:
            items = []
            line_ids = request.form.getlist("original_line_id[]")
            for idx, line_id in enumerate(line_ids):
                if not line_id:
                    continue
                qty = request.form.getlist("quantity[]")[idx]
                if float(qty or 0) <= 0:
                    continue
                items.append({"original_line_id": line_id, "quantity": qty})
            return_id = create_sales_return(
                db,
                {
                    "original_invoice_id": request.form.get("original_invoice_id"),
                    "return_date": request.form.get("return_date"),
                    "refund_method": request.form.get("refund_method") or "ACCOUNT",
                    "reason": request.form.get("reason") or None,
                    "created_by": g.user["user_id"],
                    "items": items,
                },
            )
            db.commit()
            flash(f"تم إنشاء مرتجع البيع رقم {return_id}", "success")
            return redirect(url_for("sales_list"))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")

    invoices = query_all(
        """
        SELECT s.invoice_id, s.invoice_number, s.invoice_date, c.name_ar AS customer_name, s.total
        FROM SalesInvoices s
        LEFT JOIN Customers c ON c.customer_id = s.customer_id
        ORDER BY s.invoice_id DESC
        LIMIT 100
        """
    )
    invoice_lines = {}
    for row in invoices:
        lines = query_all(
            """
            SELECT l.line_id, l.quantity, l.unit_price, l.tax_rate, i.name_ar AS item_name
            FROM SalesInvoiceItems l
            JOIN Items i ON i.item_id = l.item_id
            WHERE l.invoice_id = ?
            ORDER BY l.line_id
            """,
            (row["invoice_id"],),
        )
        invoice_lines[str(row["invoice_id"])] = [dict(x) for x in lines]
    return render_template(
        "sales_return_form.html",
        title="مرتجع مبيعات",
        invoices=invoices,
        invoice_lines=invoice_lines,
    )


@app.route("/accounting/journals")
@login_required
def journals_list():
    rows = query_all(
        """
        SELECT j.*, COUNT(l.line_id) AS lines_count
        FROM JournalEntries j
        LEFT JOIN JournalEntryLines l ON l.entry_id = j.entry_id
        GROUP BY j.entry_id
        ORDER BY j.entry_id DESC
        LIMIT 300
        """
    )
    return render_template("journals.html", title="القيود اليومية", rows=rows)


@app.route("/reports")
@login_required
@permission_required('view_reports')
def reports():
    date_from = request.args.get("date_from", "")
    date_to = request.args.get("date_to", "")

    where = ""
    params = []
    if date_from:
        where += " AND DATE(invoice_date) >= ?"
        params.append(date_from)
    if date_to:
        where += " AND DATE(invoice_date) <= ?"
        params.append(date_to)

    if not where:
        # Default to last 30 days if no filter
        where = " AND DATE(invoice_date) >= DATE('now', '-30 day')"

    sales_summary = query_all(
        f"""
        SELECT DATE(invoice_date) AS day, ROUND(SUM(total), 2) AS total, COUNT(*) AS invoices
        FROM SalesInvoices
        WHERE status = 'POSTED' {where}
        GROUP BY DATE(invoice_date)
        ORDER BY DATE(invoice_date) DESC
        LIMIT 30
        """, params
    )
    stock_valuation = query_all(
        """
        SELECT i.name_ar AS item_name, w.name_ar AS warehouse_name,
               ROUND(s.quantity, 2) AS quantity,
               ROUND(s.avg_cost, 2) AS avg_cost,
               ROUND(s.quantity * s.avg_cost, 2) AS value
        FROM Stock s
        JOIN Items i ON i.item_id = s.item_id
        JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
        ORDER BY value DESC
        LIMIT 20
        """
    )
    receivables = query_all(
        "SELECT customer_code, name_ar, ROUND(current_balance, 2) AS current_balance FROM Customers WHERE current_balance > 0 ORDER BY current_balance DESC LIMIT 20"
    )
    payables = query_all(
        "SELECT supplier_code, name_ar, ROUND(current_balance, 2) AS current_balance FROM Suppliers WHERE current_balance > 0 ORDER BY current_balance DESC LIMIT 20"
    )
    return render_template(
        "reports.html",
        title="التقارير",
        sales_summary=sales_summary,
        stock_valuation=stock_valuation,
        receivables=receivables,
        payables=payables,
        date_from=date_from,
        date_to=date_to
    )


# ============================================================================
# Expenses (المصروفات)
# ============================================================================

@app.route("/expenses")
@login_required
def expenses_list():
    rows = query_all("""
        SELECT e.*, a.name_ar AS account_name, b.name_ar AS branch_name
        FROM Expenses e
        JOIN ChartOfAccounts a ON a.account_id = e.expense_account_id
        JOIN Branches b ON b.branch_id = e.branch_id
        ORDER BY e.expense_id DESC LIMIT 200
    """)
    return render_template("expenses_list.html", title="المصروفات", rows=rows)


@app.route("/expenses/new", methods=["GET", "POST"])
@login_required
def expense_create():
    db = get_db()
    if request.method == "POST":
        try:
            create_expense(db, {
                "expense_date": request.form.get("expense_date"),
                "branch_id": request.form.get("branch_id"),
                "expense_account_id": request.form.get("expense_account_id"),
                "amount": request.form.get("amount"),
                "payment_method": request.form.get("payment_method") or "CASH",
                "beneficiary": request.form.get("beneficiary") or "",
                "description": request.form.get("description") or "",
                "created_by": g.user["user_id"],
            })
            db.commit()
            flash("تم إضافة المصروف بنجاح", "success")
            return redirect(url_for("expenses_list"))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")
    branches = query_all("SELECT branch_id, name_ar FROM Branches WHERE is_active = 1")
    expense_accounts = query_all("SELECT account_id, account_code || ' - ' || name_ar AS label FROM ChartOfAccounts WHERE account_type = 'EXPENSE' AND is_active = 1 AND is_parent = 0 ORDER BY account_code")
    return render_template("expense_form.html", title="مصروف جديد", branches=branches, expense_accounts=expense_accounts)


# ============================================================================
# Purchase Returns (مرتجعات المشتريات)
# ============================================================================

@app.route("/purchases/returns/new", methods=["GET", "POST"])
@login_required
def purchase_return_create():
    db = get_db()
    if request.method == "POST":
        try:
            items = []
            line_ids = request.form.getlist("original_line_id[]")
            for idx, line_id in enumerate(line_ids):
                if not line_id:
                    continue
                qty = request.form.getlist("quantity[]")[idx]
                if float(qty or 0) <= 0:
                    continue
                items.append({"original_line_id": line_id, "quantity": qty})
            create_purchase_return(db, {
                "original_invoice_id": request.form.get("original_invoice_id"),
                "return_date": request.form.get("return_date"),
                "reason": request.form.get("reason") or None,
                "created_by": g.user["user_id"],
                "items": items,
            })
            db.commit()
            flash("تم إنشاء مرتجع الشراء بنجاح", "success")
            return redirect(url_for("purchases_list"))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")
    invoices = query_all("""
        SELECT p.invoice_id, p.invoice_number, p.invoice_date, s.name_ar AS supplier_name, p.total
        FROM PurchaseInvoices p JOIN Suppliers s ON s.supplier_id = p.supplier_id
        ORDER BY p.invoice_id DESC LIMIT 100
    """)
    invoice_lines = {}
    for row in invoices:
        lines = query_all("""
            SELECT l.line_id, l.quantity, l.unit_cost, i.name_ar AS item_name
            FROM PurchaseInvoiceItems l JOIN Items i ON i.item_id = l.item_id
            WHERE l.invoice_id = ? ORDER BY l.line_id
        """, (row["invoice_id"],))
        invoice_lines[str(row["invoice_id"])] = [dict(x) for x in lines]
    return render_template("purchase_return_form.html", title="مرتجع مشتريات", invoices=invoices, invoice_lines=invoice_lines)


# ============================================================================
# Stock Transfers (تحويلات المخزون)
# ============================================================================

@app.route("/inventory/transfers")
@login_required
def transfers_list():
    rows = query_all("""
        SELECT t.*, fw.name_ar AS from_warehouse, tw.name_ar AS to_warehouse
        FROM StockTransfers t
        JOIN Warehouses fw ON fw.warehouse_id = t.from_warehouse_id
        JOIN Warehouses tw ON tw.warehouse_id = t.to_warehouse_id
        ORDER BY t.transfer_id DESC LIMIT 200
    """)
    return render_template("transfers_list.html", title="تحويلات المخزون", rows=rows)


@app.route("/inventory/transfers/new", methods=["GET", "POST"])
@login_required
def transfer_create():
    db = get_db()
    if request.method == "POST":
        try:
            items = []
            item_ids = request.form.getlist("item_id[]")
            for idx, item_id in enumerate(item_ids):
                if not item_id:
                    continue
                items.append({"item_id": item_id, "quantity": request.form.getlist("quantity[]")[idx]})
            create_stock_transfer(db, {
                "transfer_date": request.form.get("transfer_date"),
                "from_warehouse_id": request.form.get("from_warehouse_id"),
                "to_warehouse_id": request.form.get("to_warehouse_id"),
                "notes": request.form.get("notes") or "",
                "created_by": g.user["user_id"],
                "items": items,
            })
            db.commit()
            flash("تم تحويل المخزون بنجاح", "success")
            return redirect(url_for("transfers_list"))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")
    warehouses = query_all("SELECT warehouse_id, name_ar FROM Warehouses WHERE is_active = 1 ORDER BY name_ar")
    items = [dict(r) for r in query_all("SELECT item_id, item_code, name_ar FROM Items WHERE is_active = 1 AND is_service = 0 ORDER BY name_ar")]
    return render_template("transfer_form.html", title="تحويل مخزون جديد", warehouses=warehouses, items=items)


# ============================================================================
# Stock Counts (الجرد)
# ============================================================================

@app.route("/inventory/counts")
@login_required
def counts_list():
    rows = query_all("""
        SELECT sc.*, w.name_ar AS warehouse_name, COUNT(sci.line_id) AS items_count
        FROM StockCounts sc
        JOIN Warehouses w ON w.warehouse_id = sc.warehouse_id
        LEFT JOIN StockCountItems sci ON sci.count_id = sc.count_id
        GROUP BY sc.count_id ORDER BY sc.count_id DESC
    """)
    return render_template("counts_list.html", title="الجرد", rows=rows)


@app.route("/inventory/counts/new", methods=["GET", "POST"])
@login_required
def count_create():
    db = get_db()
    if request.method == "POST":
        try:
            items = []
            item_ids = request.form.getlist("item_id[]")
            for idx, item_id in enumerate(item_ids):
                if not item_id:
                    continue
                items.append({"item_id": item_id, "counted_qty": request.form.getlist("counted_qty[]")[idx], "notes": ""})
            count_id = create_stock_count(db, {
                "warehouse_id": request.form.get("warehouse_id"),
                "count_date": request.form.get("count_date"),
                "notes": request.form.get("notes") or "",
                "created_by": g.user["user_id"],
                "items": items,
            })
            db.commit()
            flash(f"تم إنشاء الجرد رقم {count_id}", "success")
            return redirect(url_for("counts_list"))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")
    warehouses = query_all("SELECT warehouse_id, name_ar FROM Warehouses WHERE is_active = 1")
    items = [dict(r) for r in query_all("SELECT item_id, item_code, name_ar FROM Items WHERE is_active = 1 AND is_service = 0 ORDER BY name_ar")]
    return render_template("count_form.html", title="جرد جديد", warehouses=warehouses, items=items)


@app.route("/inventory/counts/<int:count_id>/finalize", methods=["POST"])
@login_required
def count_finalize(count_id):
    db = get_db()
    try:
        finalize_stock_count(db, count_id, g.user["user_id"])
        db.commit()
        flash("تم اعتماد الجرد وتعديل المخزون", "success")
    except Exception as exc:
        db.rollback()
        flash(str(exc), "danger")
    return redirect(url_for("counts_list"))


# ============================================================================
# Checks (الشيكات)
# ============================================================================

@app.route("/checks")
@login_required
def checks_list():
    rows = query_all("SELECT * FROM Checks ORDER BY check_id DESC LIMIT 200")
    return render_template("checks_list.html", title="الشيكات", rows=rows)


@app.route("/checks/new", methods=["GET", "POST"])
@login_required
def check_create():
    db = get_db()
    if request.method == "POST":
        try:
            create_check(db, {
                "check_number": request.form.get("check_number"),
                "check_direction": request.form.get("check_direction"),
                "bank_name": request.form.get("bank_name") or "",
                "drawer_name": request.form.get("drawer_name") or "",
                "beneficiary": request.form.get("beneficiary") or "",
                "issue_date": request.form.get("issue_date"),
                "due_date": request.form.get("due_date"),
                "amount": request.form.get("amount"),
                "customer_id": request.form.get("customer_id") or None,
                "supplier_id": request.form.get("supplier_id") or None,
                "notes": request.form.get("notes") or "",
            })
            db.commit()
            flash("تم إضافة الشيك بنجاح", "success")
            return redirect(url_for("checks_list"))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")
    customers = query_all("SELECT customer_id, name_ar FROM Customers WHERE is_active = 1")
    suppliers = query_all("SELECT supplier_id, name_ar FROM Suppliers WHERE is_active = 1")
    return render_template("check_form.html", title="شيك جديد", customers=customers, suppliers=suppliers)


@app.route("/checks/<int:check_id>/status", methods=["POST"])
@login_required
def check_status_update(check_id):
    db = get_db()
    try:
        update_check_status(db, check_id, request.form.get("status"))
        db.commit()
        flash("تم تحديث حالة الشيك", "success")
    except Exception as exc:
        db.rollback()
        flash(str(exc), "danger")
    return redirect(url_for("checks_list"))


# ============================================================================
# Manual Journal Entries (القيود اليدوية)
# ============================================================================

@app.route("/accounting/journals/new", methods=["GET", "POST"])
@login_required
def journal_create():
    db = get_db()
    if request.method == "POST":
        try:
            from services import create_journal_entry, get_base_currency_id, get_current_fiscal_year
            lines = []
            account_ids = request.form.getlist("account_id[]")
            for idx, acc_id in enumerate(account_ids):
                if not acc_id:
                    continue
                debit = float(request.form.getlist("debit[]")[idx] or 0)
                credit = float(request.form.getlist("credit[]")[idx] or 0)
                desc = request.form.getlist("line_desc[]")[idx] if idx < len(request.form.getlist("line_desc[]")) else ""
                if debit > 0 or credit > 0:
                    lines.append({"account_id": int(acc_id), "debit": debit, "credit": credit, "description": desc})
            create_journal_entry(
                db,
                entry_date=request.form.get("entry_date"),
                description=request.form.get("description") or "",
                reference_type="MANUAL",
                reference_id=0,
                lines=lines,
                created_by=g.user["user_id"],
                is_auto=0,
            )
            db.commit()
            flash("تم إنشاء القيد اليدوي بنجاح", "success")
            return redirect(url_for("journals_list"))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")
    accounts = [dict(r) for r in query_all("SELECT account_id, account_code || ' - ' || name_ar AS label FROM ChartOfAccounts WHERE is_active = 1 AND is_parent = 0 ORDER BY account_code")]
    return render_template("journal_form.html", title="قيد يدوي جديد", accounts=accounts)


# ============================================================================
# Financial Reports (التقارير المالية)
# ============================================================================

@app.route("/accounting/trial-balance")
@login_required
def trial_balance():
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    data = build_trial_balance(get_db(), date_from, date_to)
    return render_template("trial_balance.html", title="ميزان المراجعة", data=data, date_from=date_from, date_to=date_to)


@app.route("/accounting/income-statement")
@login_required
def income_statement():
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    data = build_income_statement(get_db(), date_from, date_to)
    return render_template("income_statement.html", title="قائمة الدخل", data=data, date_from=date_from, date_to=date_to)


@app.route("/accounting/balance-sheet")
@login_required
@permission_required('view_reports')
def balance_sheet():
    as_of = request.args.get("as_of_date")
    data = build_balance_sheet(get_db(), as_of)
    return render_template("balance_sheet.html", title="الميزانية العمومية", data=data, as_of_date=as_of)


@app.route("/accounting/account-statement")
@login_required
def account_statement():
    account_id = request.args.get("account_id", type=int)
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    data = None
    if account_id:
        try:
            data = get_account_statement(get_db(), account_id, date_from, date_to)
        except Exception as exc:
            flash(str(exc), "danger")
    accounts = query_all("SELECT account_id, account_code || ' - ' || name_ar AS label FROM ChartOfAccounts WHERE is_active = 1 ORDER BY account_code")
    return render_template("account_statement.html", title="كشف حساب", accounts=accounts, data=data, account_id=account_id, date_from=date_from, date_to=date_to)


@app.route("/reports/debts")
@login_required
def debts_report():
    """Report showing customers and suppliers with search support."""
    db = get_db()
    q = request.args.get('q', '').strip()
    
    query_filter = ""
    params = []
    if q:
        def norm(c): return f"REPLACE(REPLACE(REPLACE(REPLACE(REPLACE({c}, 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا'), 'ة', 'ه'), 'ى', 'ي')"
        q_norm = q.replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ة','ه').replace('ى','ي')
        query_filter = f" AND ({norm('name_ar')} LIKE ? OR phone LIKE ? OR customer_code LIKE ? OR supplier_code LIKE ?)"
        params = [f'%{q_norm}%', f'%{q}%', f'%{q}%', f'%{q}%']
    
    # Debtors
    debtors = query_all(f"""
        SELECT customer_id, customer_code, name_ar, phone, current_balance, account_id 
        FROM Customers 
        WHERE current_balance != 0 AND is_active = 1 {query_filter.replace('supplier_code', 'customer_code')}
        ORDER BY current_balance DESC
    """, params if q else [])
    
    # Creditors
    creditors = query_all(f"""
        SELECT supplier_id, supplier_code, name_ar, phone, current_balance, account_id 
        FROM Suppliers 
        WHERE current_balance != 0 AND is_active = 1 {query_filter.replace('customer_code', 'supplier_code')}
        ORDER BY current_balance DESC
    """, params if q else [])
    # Calculate Totals
    total_debtors = sum(d['current_balance'] for d in debtors)
    total_creditors = sum(c['current_balance'] for c in creditors)
    
    return render_template("debts_report.html", title="تقرير المديونيات", 
                           debtors=debtors, creditors=creditors,
                           total_debtors=total_debtors, total_creditors=total_creditors)


@app.route("/reports/quick-pay", methods=["POST"])
@login_required
def quick_pay():
    """Quickly record a payment for a customer or supplier."""
    data = request.get_json()
    entity_id = data.get("id")
    entity_type = data.get("type") # 'customer' or 'supplier'
    amount = float(data.get("amount", 0))
    notes = data.get("notes", "")

    if amount <= 0:
        return jsonify({"status": "error", "message": "المبلغ يجب أن يكون أكبر من صفر"})

    db = get_db()
    try:
        currency_id = get_base_currency_id(db)
        if entity_type == 'customer':
            customer = query_one("SELECT customer_id, account_id, name_ar FROM Customers WHERE customer_id = ?", (entity_id,))
            if not customer:
                return jsonify({"status": "error", "message": "العميل غير موجود"})
            # Use customer's account_id or default receivables account
            cust_account_id = customer["account_id"] or account_id_by_code(db, "1200")
            # Create journal entry first to get its ID
            lines = [
                {"account_id": account_id_by_code(db, "1110"), "debit": amount, "credit": 0, "description": f"تحصيل من {customer['name_ar']}: {notes}"},
                {"account_id": cust_account_id, "debit": 0, "credit": amount, "description": f"سداد مديونية {customer['name_ar']}"}
            ]
            je_id = create_journal_entry(db, current_date(), f"تحصيل سريع من {customer['name_ar']}", "RECEIPT", int(entity_id), lines, g.user["user_id"], is_auto=0)
            create_payment_record(db, "IN", "RECEIPT", int(entity_id), amount, currency_id, "CASH", g.user["user_id"], customer_id=entity_id, notes=notes)
            db.execute("UPDATE Customers SET current_balance = current_balance - ? WHERE customer_id = ?", (amount, entity_id))
        else:
            supplier = query_one("SELECT supplier_id, account_id, name_ar FROM Suppliers WHERE supplier_id = ?", (entity_id,))
            if not supplier:
                return jsonify({"status": "error", "message": "المورد غير موجود"})
            # Use supplier's account_id or default payables account
            sup_account_id = supplier["account_id"] or account_id_by_code(db, "2100")
            # Create journal entry first to get its ID
            lines = [
                {"account_id": sup_account_id, "debit": amount, "credit": 0, "description": f"سداد للمورد {supplier['name_ar']}: {notes}"},
                {"account_id": account_id_by_code(db, "1110"), "debit": 0, "credit": amount, "description": f"دفع نقد للمورد {supplier['name_ar']}"}
            ]
            je_id = create_journal_entry(db, current_date(), f"سداد سريع للمورد {supplier['name_ar']}", "PAYMENT", int(entity_id), lines, g.user["user_id"], is_auto=0)
            create_payment_record(db, "OUT", "PAYMENT", int(entity_id), amount, currency_id, "CASH", g.user["user_id"], supplier_id=entity_id, notes=notes)
            db.execute("UPDATE Suppliers SET current_balance = current_balance - ? WHERE supplier_id = ?", (amount, entity_id))
        
        db.commit()
        return jsonify({"status": "ok"})
    except Exception as e:
        db.rollback()
        return jsonify({"status": "error", "message": str(e)})


# ============================================================================
# Audit Log (سجل التدقيق)
# ============================================================================

@app.route("/audit-log")
@login_required
def audit_log():
    rows = query_all("""
        SELECT a.*, u.full_name_ar AS user_name
        FROM AuditLog a LEFT JOIN Users u ON u.user_id = a.user_id
        ORDER BY a.audit_id DESC LIMIT 300
    """)
    return render_template("audit_log.html", title="سجل التدقيق", rows=rows)


# ============================================================================
# Backup / Restore (النسخ الاحتياطي)
# ============================================================================

@app.route("/backup", methods=["GET", "POST"])
@login_required
@permission_required('manage_settings')
def backup_page():
    root_dir = APP_DATA_DIR if is_frozen else BASE_DIR
    import os as _os
    from datetime import datetime
    
    backups_data = []
    
    # Check both manual and auto backup directories
    dirs_to_check = [
        {"path": root_dir / "backups", "type": "يدوي / يومي"},
        {"path": root_dir / "backups_auto", "type": "تلقائي (عند التشغيل)"}
    ]
    
    for dinfo in dirs_to_check:
        dpath = str(dinfo["path"])
        if _os.path.exists(dpath):
            files = [f for f in _os.listdir(dpath) if f.endswith(".sasbackup")]
            for f in files:
                f_full_path = _os.path.join(dpath, f)
                size_mb = round(_os.path.getsize(f_full_path) / (1024 * 1024), 2)
                mtime = _os.path.getmtime(f_full_path)
                dt_obj = datetime.fromtimestamp(mtime)
                
                backups_data.append({
                    "filename": f,
                    "full_path": f_full_path,
                    "date": dt_obj.strftime("%Y/%m/%d %I:%M:%S %p"),
                    "mtime": mtime,
                    "size": size_mb,
                    "type": dinfo["type"]
                })

    # Sort all backups by modification time (newest first)
    backups_data.sort(key=lambda x: x["mtime"], reverse=True)

    if request.method == "POST":
        action = request.form.get("action")
        backup_dir = str(root_dir / "backups")
        if action == "backup":
            try:
                close_db()
                path = backup_database(str(DB_PATH), backup_dir)
                flash(f"تم إنشاء النسخة الاحتياطية: {_os.path.basename(path)}", "success")
            except Exception as exc:
                flash(str(exc), "danger")
        elif action == "restore":
            filename = request.form.get("filename")
            # Find the full path for the selected filename
            selected = next((b for b in backups_data if b["filename"] == filename), None)
            if selected:
                try:
                    close_db()
                    restore_database(selected["full_path"], str(DB_PATH))
                    flash("تم استعادة النسخة الاحتياطية بنجاح", "success")
                except Exception as exc:
                    flash(str(exc), "danger")
        elif action == "delete":
            filenames = request.form.getlist("filenames")
            if not filenames:
                # Fallback for single delete if needed
                filenames = [request.form.get("filename")]
            
            deleted_count = 0
            for filename in filenames:
                if not filename: continue
                selected = next((b for b in backups_data if b["filename"] == filename), None)
                if selected:
                    try:
                        _os.remove(selected["full_path"])
                        deleted_count += 1
                    except Exception as exc:
                        flash(f"فشل حذف {filename}: {str(exc)}", "danger")
            
            if deleted_count > 0:
                flash(f"تم حذف {deleted_count} نسخة احتياطية بنجاح", "info")
        return redirect(url_for("backup_page"))
    return render_template("backup.html", title="النسخ الاحتياطي", backups=backups_data)


# ============================================================================
# Exchange Rates (أسعار الصرف)
# ============================================================================

@app.route("/settings/exchange-rates", methods=["GET", "POST"])
@login_required
@permission_required('manage_settings')
def exchange_rates():
    db = get_db()
    if request.method == "POST":
        action = request.form.get("action", "save")
        if action == "save":
            try:
                db.execute(
                    "INSERT OR REPLACE INTO ExchangeRates (currency_id, rate_date, rate_value, created_by) VALUES (?, ?, ?, ?)",
                    (request.form.get("currency_id"), request.form.get("rate_date"), request.form.get("rate_value"), g.user["user_id"]),
                )
                db.commit()
                flash("تم حفظ سعر الصرف", "success")
            except Exception as exc:
                db.rollback()
                flash(str(exc), "danger")
        elif action == "delete":
            rate_id = request.form.get("rate_id")
            if rate_id:
                try:
                    db.execute("DELETE FROM ExchangeRates WHERE rate_id = ?", (rate_id,))
                    db.commit()
                    flash("تم حذف سجل سعر الصرف", "info")
                except Exception as exc:
                    db.rollback()
                    flash(str(exc), "danger")
        return redirect(url_for("exchange_rates"))
    
    currencies = query_all("SELECT * FROM Currencies WHERE is_base = 0 AND is_active = 1")
    all_rates = query_all("SELECT er.*, c.code, c.name_ar AS currency_name FROM ExchangeRates er JOIN Currencies c ON c.currency_id = er.currency_id ORDER BY er.rate_date DESC, er.rate_id DESC LIMIT 100")
    
    # Calculate Latest Rates & Trends
    latest_rates = []
    for cur in currencies:
        # Get last 2 rates to see trend
        cur_rates = [r for r in all_rates if r["currency_id"] == cur["currency_id"]]
        if cur_rates:
            latest = cur_rates[0]
            trend = "stable"
            if len(cur_rates) > 1:
                prev = cur_rates[1]
                if latest["rate_value"] > prev["rate_value"]: trend = "up"
                elif latest["rate_value"] < prev["rate_value"]: trend = "down"
            
            latest_rates.append({
                "currency_name": cur["name_ar"],
                "code": cur["code"],
                "value": latest["rate_value"],
                "date": latest["rate_date"],
                "trend": trend
            })
            
    return render_template("exchange_rates.html", title="أسعار الصرف", currencies=currencies, rates=all_rates, latest_rates=latest_rates)


# ============================================================================
# POS Interface (نقطة البيع)
# ============================================================================

# ============================================================================
# DATA EXPORT (تصدير البيانات)
# ============================================================================

@app.route("/export/<entity>")
@login_required
def export_excel(entity):
    """Export various data tables to Excel format."""
    db = get_db()
    queries = {
        "sales": "SELECT s.invoice_number, s.invoice_date, c.name_ar AS customer, s.total FROM SalesInvoices s LEFT JOIN Customers c ON c.customer_id = s.customer_id",
        "purchases": "SELECT p.invoice_number, p.invoice_date, s.name_ar AS supplier, p.total FROM PurchaseInvoices p LEFT JOIN Suppliers s ON s.supplier_id = p.supplier_id",
        "inventory": "SELECT i.item_code, i.name_ar, w.name_ar AS warehouse, s.quantity FROM Stock s JOIN Items i ON i.item_id = s.item_id JOIN Warehouses w ON w.warehouse_id = s.warehouse_id",
        "customers": "SELECT customer_code, name_ar, phone, current_balance FROM Customers",
        "suppliers": "SELECT supplier_code, name_ar, phone, current_balance FROM Suppliers"
    }
    
    if entity not in queries:
        return "Invalid entity", 400
        
    try:
        df = pd.read_sql_query(queries[entity], db)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Sheet1')
        
        output.seek(0)
        filename = f"{entity}_{datetime.now().strftime('%Y%m%d')}.xlsx"
        from flask import send_file
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return str(e), 500

@app.route("/pos")
@login_required
def pos_interface():
    warehouses = query_all("SELECT warehouse_id, branch_id, name_ar FROM Warehouses WHERE is_active = 1")
    customers = query_all("SELECT customer_id, name_ar, phone FROM Customers WHERE is_active = 1 ORDER BY name_ar")
    branches = query_all("SELECT branch_id, name_ar FROM Branches WHERE is_active = 1")
    
    # Items with total stock levels for UI warnings
    items_sql = """
        SELECT i.item_id, i.item_code, i.name_ar, 
               IFNULL((SELECT SUM(quantity) FROM Stock WHERE item_id = i.item_id), 0) as total_stock
        FROM Items i 
        WHERE i.is_active = 1 
        ORDER BY i.name_ar
    """
    items = [dict(r) for r in query_all(items_sql)]
    
    item_units_map, barcode_map = build_item_units_payload()
    active_session = query_one("SELECT * FROM CashSessions WHERE user_id = ? AND status = 'OPEN'",
                               (g.user["user_id"],))
    held_count = query_one("SELECT COUNT(*) AS cnt FROM HeldInvoices")
    
    # Data for quick-add and currency support
    currencies_data = [dict(r) for r in query_all("SELECT * FROM Currencies WHERE is_active = 1")]
    base_currency = dict(query_one("SELECT * FROM Currencies WHERE is_base = 1") or {})
    rates_data = [dict(r) for r in query_all("SELECT * FROM ExchangeRates")]
    categories_data = [dict(r) for r in query_all("SELECT category_id, name_ar FROM Categories WHERE is_active = 1")]
    units_data = [dict(r) for r in query_all("SELECT unit_id, name_ar FROM Units")]
    price_levels_data = [dict(r) for r in query_all("SELECT price_level_id, name_ar FROM PriceLevels WHERE is_active = 1")]

    return render_template("pos.html", title="نقطة البيع",
        warehouses=warehouses, customers=customers, branches=branches,
        items=items, item_units_map=item_units_map, barcode_map=barcode_map,
        active_session=active_session, held_count=held_count["cnt"] if held_count else 0,
        currencies=currencies_data, base_currency=base_currency, exchange_rates_data=rates_data,
        categories=categories_data, units=units_data, price_levels=price_levels_data)


# ============================================================================

@app.route("/init-demo")
@login_required
def init_demo():
    # التحقق من أن المستخدم مدير نظام (ADMIN)
    db = get_db()
    user_role = db.execute("SELECT role_code FROM Roles WHERE role_id = ?", (g.user['role_id'],)).fetchone()
    if not user_role or user_role['role_code'] != 'ADMIN':
        flash("عذراً، هذه العملية مخصصة لمدير النظام فقط ⛔", "danger")
        return redirect(url_for("dashboard"))

    confirm = request.args.get("confirm")
    if confirm != "YES_DELETE_EVERYTHING":
        return f"""
        <div style='text-align:center; padding:50px; font-family:"Tajawal", sans-serif; direction:rtl; background:#f8fafc; height:100vh; display:flex; align-items:center; justify-content:center;'>
            <div style='max-width:550px; width:90%; background:white; padding:50px; border-radius:30px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.15); border-top: 8px solid #ef4444;'>
                <div style='background:#fee2e2; width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 25px;'>
                    <span style='font-size:40px;'>⚠️</span>
                </div>
                <h1 style='color:#1e293b; font-size:2.2rem; font-weight:800; margin-bottom:15px;'>تصفير النظام بالكامل</h1>
                <p style='font-size:1.15rem; line-height:1.8; color:#64748b; margin-bottom:30px;'>
                    سيتم <b>حذف كافة البيانات المسجلة</b> (الفواتير، الأصناف، والعملاء).<br>
                    استخدم هذا الخيار فقط إذا كنت ترغب في <b>البدء من الصفر</b> ببياناتك الحقيقية.
                </p>
                
                <div style='background:#f1f5f9; padding:15px; border-radius:15px; margin-bottom:30px; font-size:0.95rem; color:#ef4444; font-weight:bold;'>
                    🚨 تنبيه: لا يمكن استعادة البيانات بعد الحذف أبداً!
                </div>

                <a href='/init-demo?confirm=YES_DELETE_EVERYTHING' 
                   style='display:block; background:#ef4444; color:white; padding:18px; text-decoration:none; border-radius:15px; font-weight:800; font-size:1.2rem; transition:all 0.3s; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);'>
                   نعم، احذف كل شيء وابدأ من جديد
                </a>
                
                <a href='{url_for("dashboard")}' style='display:block; color:#94a3b8; text-decoration:none; font-size:1.1rem; margin-top:25px; font-weight:600;'>
                   إلغاء العملية والعودة للرئيسية
                </a>
            </div>
        </div>
        """, 403

    close_db()
    # Now we initialize WITHOUT demo data
    initialize_database(str(DB_PATH), str(SCHEMA_PATH), with_demo=False, force=True)
    session.clear()
    flash("تم تصفير قاعدة البيانات بالكامل بنجاح 🧹", "success")
    return redirect(url_for("login"))
# ============================================================================
# PROFITABILITY REPORT (تقرير الربحية)
# ============================================================================

@app.route("/reports/profitability")
@login_required
def profitability_report():
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    category_id = request.args.get("category_id", "")

    where = ""
    params = []
    if date_from:
        where += " AND DATE(s.invoice_date) >= ?"
        params.append(date_from)
    if date_to:
        where += " AND DATE(s.invoice_date) <= ?"
        params.append(date_to)
    if category_id:
        where += " AND i.category_id = ?"
        params.append(int(category_id))

    rows = query_all(f"""
        SELECT i.item_code, i.name_ar AS item_name,
               ROUND(SUM(si.quantity), 2) AS total_qty,
               ROUND(SUM(si.line_total), 2) AS total_revenue,
               ROUND(SUM(si.cost_price * si.quantity), 2) AS total_cost
        FROM SalesInvoiceItems si
        JOIN SalesInvoices s ON s.invoice_id = si.invoice_id
        JOIN Items i ON i.item_id = si.item_id
        WHERE s.status = 'POSTED' {where}
        GROUP BY si.item_id
        ORDER BY (SUM(si.line_total) - SUM(si.cost_price * si.quantity)) DESC
    """, params)

    items = []
    total_revenue = 0
    total_cost = 0
    for row in rows:
        rev = float(row["total_revenue"] or 0)
        cost = float(row["total_cost"] or 0)
        profit = round(rev - cost, 2)
        margin = round((profit / rev * 100), 1) if rev > 0 else 0
        total_revenue += rev
        total_cost += cost
        items.append({
            "item_code": row["item_code"],
            "item_name": row["item_name"],
            "total_qty": row["total_qty"],
            "total_revenue": rev,
            "total_cost": cost,
            "profit": profit,
            "margin": margin,
        })

    total_profit = round(total_revenue - total_cost, 2)
    profit_margin = round((total_profit / total_revenue * 100), 1) if total_revenue > 0 else 0

    categories = query_all("SELECT category_id, name_ar FROM Categories WHERE is_active = 1 ORDER BY name_ar")

    return render_template("profitability_report.html", title="تقرير الربحية",
                           items=items, total_revenue=total_revenue, total_cost=total_cost,
                           total_profit=total_profit, profit_margin=profit_margin,
                           date_from=date_from, date_to=date_to, category_id=category_id,
                           categories=categories)


# ============================================================================
# EXCEL IMPORT (استيراد البيانات)
# ============================================================================

@app.route("/import-data", methods=["GET", "POST"])
@login_required
def import_data():
    result = None
    if request.method == "POST":
        entity = request.form.get("entity", "items")
        skip_duplicates = request.form.get("skip_duplicates") == "on"
        file = request.files.get("file")
        if not file or not file.filename:
            flash("يرجى اختيار ملف", "danger")
            return redirect(url_for("import_data"))

        try:
            import pandas as pd
            df = pd.read_excel(file, engine="openpyxl")
            df.columns = [c.strip().lower() for c in df.columns]
            db = get_db()

            imported = 0
            skipped = 0
            errors = []

            if entity == "items":
                required = ["item_code", "name_ar"]
                missing = [c for c in required if c not in df.columns]
                if missing:
                    flash(f"الملف المرفوع لا يحتوي على الأعمدة المطلوبة للأصناف: {', '.join(missing)}", "danger")
                    return redirect(url_for("import_data"))
                
                # Get or create default unit
                default_unit = query_one("SELECT unit_id FROM Units LIMIT 1")
                if not default_unit:
                    db.execute("INSERT INTO Units (code, name_ar, name_en) VALUES ('PCS', 'قطعة', 'Piece')")
                    db.commit()
                    default_unit = query_one("SELECT unit_id FROM Units LIMIT 1")
                unit_id = default_unit["unit_id"]


                # Get default warehouse
                default_wh = query_one("SELECT warehouse_id FROM Warehouses WHERE is_default = 1 LIMIT 1")
                if not default_wh:
                    default_wh = query_one("SELECT warehouse_id FROM Warehouses LIMIT 1")
                wh_id = default_wh["warehouse_id"] if default_wh else None

                # Get base currency
                base_curr = query_one("SELECT currency_id FROM Currencies WHERE is_base = 1 LIMIT 1")
                currency_id = base_curr["currency_id"] if base_curr else 1

                # Get default price level
                default_pl = query_one("SELECT price_level_id FROM PriceLevels WHERE is_default = 1 LIMIT 1")
                if not default_pl:
                    default_pl = query_one("SELECT price_level_id FROM PriceLevels LIMIT 1")
                pl_id = default_pl["price_level_id"] if default_pl else None

                for idx, row in df.iterrows():
                    try:
                        code = str(row.get("item_code", "")).strip()
                        name = str(row.get("name_ar", "")).strip()
                        if not code or not name:
                            errors.append({"row": idx + 2, "message": "كود أو اسم الصنف فارغ"})
                            continue
                        # Check duplicate
                        existing = query_one("SELECT item_id FROM Items WHERE item_code = ?", (code,))
                        if existing:
                            if skip_duplicates:
                                skipped += 1
                                continue
                            else:
                                errors.append({"row": idx + 2, "message": f"كود مكرر: {code}"})
                                continue

                        # Find or create category
                        cat_id = None
                        cat_name = str(row.get("category", "")).strip()
                        if cat_name:
                            cat_row = query_one("SELECT category_id FROM Categories WHERE name_ar = ?", (cat_name,))
                            if cat_row:
                                cat_id = cat_row["category_id"]
                            else:
                                cur = db.execute("INSERT INTO Categories (name_ar) VALUES (?)", (cat_name,))
                                cat_id = cur.lastrowid

                        cost_price = float(row.get("cost_price", 0) or 0)
                        sale_price = float(row.get("sale_price", 0) or 0)
                        min_stock = float(row.get("min_stock", 0) or 0)
                        initial_stock = float(row.get("initial_stock", 0) or 0)

                        cur = db.execute("""
                            INSERT INTO Items (item_code, name_ar, category_id, base_unit_id, cost_price,
                                min_stock, is_active, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
                        """, (code, name, cat_id, unit_id, cost_price, min_stock))
                        item_id = cur.lastrowid

                        # Create default ItemUnit
                        cur2 = db.execute("""
                            INSERT INTO ItemUnits (item_id, unit_id, conversion_factor, is_default_sale)
                            VALUES (?, ?, 1, 1)
                        """, (item_id, unit_id))
                        item_unit_id = cur2.lastrowid

                        # Create sale price if provided
                        if sale_price > 0 and pl_id:
                            db.execute("""
                                INSERT INTO ItemPrices (item_id, item_unit_id, price_level_id, price, currency_id)
                                VALUES (?, ?, ?, ?, ?)
                            """, (item_id, item_unit_id, pl_id, sale_price, currency_id))

                        # Add initial stock if provided
                        if initial_stock > 0 and wh_id:
                            from services import add_stock, create_stock_movement
                            add_stock(db, item_id, wh_id, initial_stock, cost_price)
                            create_stock_movement(db, item_id, wh_id, None, "ADJUST_IN", "IMPORT", item_id,
                                                  initial_stock, cost_price, g.user["user_id"], "استيراد افتتاحي")

                        imported += 1
                    except Exception as e:
                        errors.append({"row": idx + 2, "message": str(e)})

            elif entity == "customers":
                required = ["customer_code", "name_ar"]
                missing = [c for c in required if c not in df.columns]
                if missing:
                    flash(f"الملف المرفوع لا يحتوي على الأعمدة المطلوبة للعملاء: {', '.join(missing)}", "danger")
                    return redirect(url_for("import_data"))

                for idx, row in df.iterrows():
                    try:
                        code = str(row.get("customer_code", "")).strip()
                        name = str(row.get("name_ar", "")).strip()
                        if not code or not name:
                            errors.append({"row": idx + 2, "message": "كود أو اسم العميل فارغ"})
                            continue
                        existing = query_one("SELECT customer_id FROM Customers WHERE customer_code = ?", (code,))
                        if existing:
                            if skip_duplicates:
                                skipped += 1
                                continue
                            else:
                                errors.append({"row": idx + 2, "message": f"كود مكرر: {code}"})
                                continue
                        balance = float(row.get("opening_balance", 0) or 0)
                        db.execute("""
                            INSERT INTO Customers (customer_code, name_ar, phone, address, current_balance, is_active)
                            VALUES (?, ?, ?, ?, ?, 1)
                        """, (code, name, str(row.get("phone", "") or ""), str(row.get("address", "") or ""), balance))
                        imported += 1
                    except Exception as e:
                        errors.append({"row": idx + 2, "message": str(e)})

            elif entity == "suppliers":
                required = ["supplier_code", "name_ar"]
                missing = [c for c in required if c not in df.columns]
                if missing:
                    flash(f"الملف المرفوع لا يحتوي على الأعمدة المطلوبة للموردين: {', '.join(missing)}", "danger")
                    return redirect(url_for("import_data"))

                for idx, row in df.iterrows():
                    try:
                        code = str(row.get("supplier_code", "")).strip()
                        name = str(row.get("name_ar", "")).strip()
                        if not code or not name:
                            errors.append({"row": idx + 2, "message": "كود أو اسم المورد فارغ"})
                            continue
                        existing = query_one("SELECT supplier_id FROM Suppliers WHERE supplier_code = ?", (code,))
                        if existing:
                            if skip_duplicates:
                                skipped += 1
                                continue
                            else:
                                errors.append({"row": idx + 2, "message": f"كود مكرر: {code}"})
                                continue
                        balance = float(row.get("opening_balance", 0) or 0)
                        db.execute("""
                            INSERT INTO Suppliers (supplier_code, name_ar, phone, address, current_balance, is_active)
                        VALUES (?, ?, ?, ?, ?, 1)
                        """, (code, name, str(row.get("phone", "") or ""), str(row.get("address", "") or ""), balance))
                        imported += 1
                    except Exception as e:
                        errors.append({"row": idx + 2, "message": str(e)})

            db.commit()
            result = {"success": len(errors) == 0, "imported": imported, "skipped": skipped, "errors": errors}
        except Exception as e:
            flash(f"خطأ في قراءة الملف: {e}", "danger")
            return redirect(url_for("import_data"))

    return render_template("import_data.html", title="استيراد البيانات", result=result)


@app.route("/import-template/<entity>")
@login_required
def import_template(entity):
    import pandas as pd
    templates = {
        "items": {"item_code": [], "name_ar": [], "cost_price": [], "sale_price": [],
                  "category": [], "min_stock": [], "initial_stock": []},
        "customers": {"customer_code": [], "name_ar": [], "phone": [], "address": [], "opening_balance": []},
        "suppliers": {"supplier_code": [], "name_ar": [], "phone": [], "address": [], "opening_balance": []},
    }
    if entity not in templates:
        return "Invalid", 400
    df = pd.DataFrame(templates[entity])
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Sheet1')
    output.seek(0)
    from flask import send_file
    return send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     as_attachment=True, download_name=f"template_{entity}.xlsx")


# ============================================================================
# QUOTATIONS (عروض الأسعار)
# ============================================================================

@app.route("/quotations")
@login_required
def quotations_list():
    rows = query_all("""
        SELECT q.*, c.name_ar AS customer_name
        FROM Quotations q
        LEFT JOIN Customers c ON c.customer_id = q.customer_id
        ORDER BY q.quotation_id DESC LIMIT 200
    """)
    return render_template("quotations_list.html", title="عروض الأسعار", rows=rows)


@app.route("/quotations/new", methods=["GET", "POST"])
@login_required
def quotation_create():
    db = get_db()
    if request.method == "POST":
        try:
            from services import next_number, get_base_currency_id
            quotation_number = next_number(db, "Quotations", "quotation_number", "QTN")
            currency_id = get_base_currency_id(db)
            customer_id = request.form.get("customer_id") or None
            if customer_id:
                customer_id = int(customer_id)
            branch = query_one("SELECT branch_id FROM Branches WHERE is_active = 1 LIMIT 1")
            warehouse = query_one("SELECT warehouse_id FROM Warehouses WHERE is_active = 1 LIMIT 1")

            item_ids = request.form.getlist("item_id[]")
            unit_ids = request.form.getlist("item_unit_id[]")
            quantities = request.form.getlist("quantity[]")
            prices = request.form.getlist("unit_price[]")
            discounts = request.form.getlist("discount[]")

            subtotal = 0
            lines_data = []
            for i in range(len(item_ids)):
                if not item_ids[i]:
                    continue
                qty = float(quantities[i] or 0)
                price = float(prices[i] or 0)
                disc = float(discounts[i] or 0)
                if qty <= 0:
                    continue
                line_total = round((qty * price) - disc, 4)
                subtotal += line_total
                lines_data.append({
                    "item_id": int(item_ids[i]),
                    "item_unit_id": int(unit_ids[i]),
                    "quantity": qty,
                    "unit_price": price,
                    "discount_amount": disc,
                    "line_total": line_total,
                })

            if not lines_data:
                flash("يجب إضافة صنف واحد على الأقل", "danger")
                return redirect(url_for("quotation_create"))

            discount_value = float(request.form.get("discount_value", 0) or 0)
            total = round(subtotal - discount_value, 4)

            cur = db.execute("""
                INSERT INTO Quotations (quotation_number, quotation_date, valid_until, customer_id,
                    branch_id, warehouse_id, currency_id, subtotal, discount_amount, total,
                    status, notes, created_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, CURRENT_TIMESTAMP)
            """, (quotation_number, request.form.get("quotation_date"),
                  request.form.get("valid_until") or None, customer_id,
                  branch["branch_id"], warehouse["warehouse_id"], currency_id,
                  round(subtotal, 4), round(discount_value, 4), total,
                  request.form.get("notes", ""), g.user["user_id"]))
            quotation_id = cur.lastrowid

            for line in lines_data:
                db.execute("""
                    INSERT INTO QuotationItems (quotation_id, item_id, item_unit_id, quantity,
                        unit_price, discount_amount, line_total)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (quotation_id, line["item_id"], line["item_unit_id"], line["quantity"],
                      line["unit_price"], line["discount_amount"], line["line_total"]))

            db.commit()
            flash("تم حفظ عرض السعر بنجاح ✅", "success")
            return redirect(url_for("quotation_view", quotation_id=quotation_id))
        except Exception as exc:
            db.rollback()
            flash(str(exc), "danger")

    customers = query_all("SELECT customer_id, name_ar FROM Customers WHERE is_active = 1 ORDER BY name_ar")
    items = [dict(r) for r in query_all("SELECT item_id, item_code, name_ar FROM Items WHERE is_active = 1 ORDER BY name_ar")]
    item_units_map, _ = build_item_units_payload()
    from datetime import timedelta
    today = datetime.now().strftime("%Y-%m-%d")
    valid_until = (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d")
    return render_template("quotation_form.html", title="عرض سعر جديد",
                           customers=customers, items=items, item_units_map=item_units_map,
                           today=today, valid_until=valid_until)


@app.route("/quotations/<int:quotation_id>")
@login_required
def quotation_view(quotation_id):
    q = query_one("""
        SELECT q.*, c.name_ar AS customer_name, c.phone AS customer_phone, c.address AS customer_address
        FROM Quotations q LEFT JOIN Customers c ON c.customer_id = q.customer_id
        WHERE q.quotation_id = ?
    """, (quotation_id,))
    if not q:
        flash("عرض السعر غير موجود", "danger")
        return redirect(url_for("quotations_list"))
    lines = query_all("""
        SELECT qi.*, i.name_ar AS item_name, u.name_ar AS unit_name
        FROM QuotationItems qi
        JOIN Items i ON i.item_id = qi.item_id
        JOIN ItemUnits iu ON iu.item_unit_id = qi.item_unit_id
        JOIN Units u ON u.unit_id = iu.unit_id
        WHERE qi.quotation_id = ?
    """, (quotation_id,))
    return render_template("quotation_view.html", title=f"عرض سعر {q['quotation_number']}",
                           q=q, lines=lines)


@app.route("/quotations/<int:quotation_id>/print")
@login_required
def quotation_print(quotation_id):
    q = query_one("""
        SELECT q.*, c.name_ar AS customer_name, c.phone AS customer_phone, c.address AS customer_address
        FROM Quotations q LEFT JOIN Customers c ON c.customer_id = q.customer_id
        WHERE q.quotation_id = ?
    """, (quotation_id,))
    if not q:
        return "عرض السعر غير موجود", 404
    lines = query_all("""
        SELECT qi.*, i.name_ar AS item_name, u.name_ar AS unit_name
        FROM QuotationItems qi
        JOIN Items i ON i.item_id = qi.item_id
        JOIN ItemUnits iu ON iu.item_unit_id = qi.item_unit_id
        JOIN Units u ON u.unit_id = iu.unit_id
        WHERE qi.quotation_id = ?
    """, (quotation_id,))
    company = get_company_info()
    return render_template("quotation_print.html", q=q, lines=lines,
                           company=dict(company) if company else {})


@app.route("/quotations/<int:quotation_id>/convert")
@login_required
def quotation_convert(quotation_id):
    """Convert a quotation to a sales invoice."""
    db = get_db()
    try:
        q = query_one("SELECT * FROM Quotations WHERE quotation_id = ?", (quotation_id,))
        if not q:
            flash("عرض السعر غير موجود", "danger")
            return redirect(url_for("quotations_list"))
        if q["status"] not in ("DRAFT", "SENT"):
            flash("لا يمكن تحويل هذا العرض - حالته غير مناسبة", "warning")
            return redirect(url_for("quotations_list"))

        lines = query_all("SELECT * FROM QuotationItems WHERE quotation_id = ?", (quotation_id,))
        items_payload = []
        for line in lines:
            items_payload.append({
                "item_id": line["item_id"],
                "item_unit_id": line["item_unit_id"],
                "quantity": float(line["quantity"]),
                "unit_price": float(line["unit_price"]),
                "discount_amount": float(line["discount_amount"] or 0),
                "tax_rate": float(line["tax_rate"] or 0),
            })

        from services import create_sales_invoice
        invoice_id = create_sales_invoice(db, {
            "branch_id": q["branch_id"],
            "warehouse_id": q["warehouse_id"],
            "customer_id": q["customer_id"],
            "payment_type": "CREDIT" if q["customer_id"] else "CASH",
            "currency_id": q["currency_id"],
            "exchange_rate": q["exchange_rate"] or 1,
            "discount_value": float(q["discount_amount"] or 0),
            "paid_amount": 0 if q["customer_id"] else float(q["total"]),
            "notes": f"تحويل من عرض سعر {q['quotation_number']}",
            "items": items_payload,
            "created_by": g.user["user_id"],
        })

        db.execute("UPDATE Quotations SET status = 'CONVERTED', converted_invoice_id = ? WHERE quotation_id = ?",
                    (invoice_id, quotation_id))
        db.commit()
        flash(f"تم تحويل عرض السعر إلى فاتورة بيع بنجاح ✅", "success")
        return redirect(url_for("sales_receipt", invoice_id=invoice_id))
    except Exception as exc:
        db.rollback()
        flash(f"خطأ: {exc}", "danger")
        return redirect(url_for("quotation_view", quotation_id=quotation_id))


# ============================================================================
# LICENSE MANAGEMENT (إدارة الترخيص)
# ============================================================================

@app.route("/license", methods=["GET", "POST"])
def license_page():
    from license_manager import get_license_info, get_machine_id, validate_license_key, save_license
    import time as time_module
    
    if request.method == "POST":
        key = request.form.get("license_key", "").strip()
        
        mid = get_machine_id()
        valid, expiry_days = validate_license_key(key, mid)
        
        if valid:
            success, msg = save_license(key, expiry_days)
            if success:
                _license_cache["valid"] = True
                _license_cache["checked_at"] = time_module.time()
                flash("تم تفعيل الترخيص بنجاح! 🎉", "success")
                return redirect(url_for("dashboard"))
            else:
                flash(msg, "danger")
        else:
            flash("مفتاح الترخيص غير صالح لهذا الجهاز", "danger")
        return redirect(url_for("license_page"))
    
    license_info = get_license_info()
    return render_template("license.html", title="تفعيل الترخيص",
                           machine_id=get_machine_id(), license_info=license_info)


# ============================================================================
# THERMAL PRINTING (الطباعة الحرارية)
# ============================================================================

@app.route("/sales/invoices/<int:invoice_id>/thermal-print")
@login_required
def thermal_print(invoice_id):
    """Print receipt to thermal printer."""
    from thermal_printer import format_receipt_text, print_to_default_printer
    
    header = query_one(
        """SELECT s.*, c.name_ar AS customer_name, b.name_ar AS branch_name,
                  w.name_ar AS warehouse_name, u.full_name_ar AS cashier_name
           FROM SalesInvoices s
           LEFT JOIN Customers c ON c.customer_id = s.customer_id
           JOIN Branches b ON b.branch_id = s.branch_id
           JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
           LEFT JOIN Users u ON u.user_id = s.cashier_id
           WHERE s.invoice_id = ?""", (invoice_id,))
    
    if not header:
        return jsonify({"status": "error", "message": "الفاتورة غير موجودة"}), 404
    
    lines = query_all(
        """SELECT l.*, i.name_ar AS item_name
           FROM SalesInvoiceItems l JOIN Items i ON i.item_id = l.item_id
           WHERE l.invoice_id = ? ORDER BY l.line_id""", (invoice_id,))
    
    company = get_company_info()
    
    receipt_text = format_receipt_text(
        company=dict(company) if company else {},
        header=dict(header),
        lines=[dict(l) for l in lines]
    )
    
    success = print_to_default_printer(receipt_text)
    
    if request.args.get("json"):
        return jsonify({"status": "ok" if success else "error",
                       "message": "تمت الطباعة بنجاح" if success else "فشلت الطباعة"})
    
    if success:
        flash("تمت الطباعة بنجاح 🖨️", "success")
    else:
        flash("فشلت الطباعة — تأكد من تشغيل الطابعة", "danger")
    
    return redirect(url_for("sales_receipt", invoice_id=invoice_id))


@app.route("/stock/thermal-print")
@login_required
def stock_thermal_print():
    """Print current stock levels to thermal printer."""
    from thermal_printer import format_stock_receipt, print_to_default_printer
    
    rows = query_all(
        """SELECT i.name_ar AS item_name, i.item_code, w.name_ar AS warehouse_name, 
                  SUM(s.quantity) AS quantity
           FROM Stock s
           JOIN Items i ON i.item_id = s.item_id
           JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
           GROUP BY i.item_id, w.warehouse_id
           HAVING quantity > 0
           ORDER BY w.name_ar, i.name_ar""")
    
    company = get_company_info()
    receipt_text = format_stock_receipt(
        company=dict(company) if company else {},
        rows=[dict(r) for r in rows]
    )
    
    success = print_to_default_printer(receipt_text)
    
    if success:
        flash("تم إرسال الجرد للطابعة الحرارية بنجاح 🖨️", "success")
    else:
        flash("فشلت الطباعة — تأكد من تشغيل الطابعة وتعيينها كافتراضية", "danger")
    
    return redirect(url_for("stock_view"))


@app.route("/stock/thermal-preview")
@login_required
def stock_thermal_preview():
    """Preview stock inventory as plain text."""
    from thermal_printer import format_stock_receipt
    
    rows = query_all(
        """SELECT i.name_ar AS item_name, i.item_code, w.name_ar AS warehouse_name, 
                  SUM(s.quantity) AS quantity
           FROM Stock s
           JOIN Items i ON i.item_id = s.item_id
           JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
           GROUP BY i.item_id, w.warehouse_id
           HAVING quantity > 0
           ORDER BY w.name_ar, i.name_ar""")
    
    company = get_company_info()
    text = format_stock_receipt(
        company=dict(company) if company else {},
        rows=[dict(r) for r in rows]
    )
    
    return f"""
    <div style='background:#f1f5f9; min-height:100vh; padding:20px; font-family:sans-serif;'>
        <div style='max-width:400px; margin:auto;'>
            <div style='background:white; padding:20px; border-radius:10px; shadow:0 4px 6px rgba(0,0,0,0.1);'>
                <h4 style='text-align:center; color:#1e293b; margin-top:0;'>معاينة الطباعة الحرارية</h4>
                <hr style='border:none; border-top:1px dashed #cbd5e1; margin:15px 0;'>
                <pre dir='rtl' style='font-family:monospace; font-size:14px; white-space:pre-wrap; background:#fff; color:#000;'>{text}</pre>
                <hr style='border:none; border-top:1px dashed #cbd5e1; margin:15px 0;'>
                <div style='text-align:center; font-size:12px; color:#64748b;'>
                    تأكد من ضبط الطابعة الحرارية كطابعة افتراضية في الويندوز قبل الضغط على طباعة.
                </div>
            </div>
            <div style='text-align:center; margin-top:20px;'>
                <a href='{url_for("stock_thermal_print")}' style='background:#3b82f6; color:white; padding:10px 25px; border-radius:30px; text-decoration:none; font-weight:bold; display:inline-block;'>طباعة الآن 🖨️</a>
                <br><br>
                <a href='{url_for("stock_view")}' style='color:#64748b; text-decoration:none;'>العودة للمخزون</a>
            </div>
        </div>
    </div>
    """


@app.route("/accounting/fiscal-years")
@login_required
def fiscal_years_list():
    years = query_all("SELECT * FROM FiscalYears ORDER BY start_date DESC")
    return render_template("fiscal_years.html", title="السنوات المالية والإقفال", years=years)

@app.route("/accounting/fiscal-years/new", methods=["POST"])
@login_required
def fiscal_year_create():
    if not has_permission("manage_settings"):
        flash("ليس لديك صلاحية لإدارة السنوات المالية", "danger")
        return redirect(url_for("fiscal_years_list"))
    year_name = request.form.get("year_name")
    start_date = request.form.get("start_date")
    end_date = request.form.get("end_date")
    try:
        db = get_db()
        db.execute("INSERT INTO FiscalYears (year_name, start_date, end_date, is_current) VALUES (?, ?, ?, 0)",
                   (year_name, start_date, end_date))
        db.commit()
        flash(f"تم إنشاء السنة المالية {year_name} بنجاح", "success")
    except Exception as e:
        flash(f"خطأ: {str(e)}", "danger")
    return redirect(url_for("fiscal_years_list"))

@app.route("/accounting/fiscal-years/<int:year_id>/close", methods=["POST"])
@login_required
def fiscal_year_close(year_id):
    if not has_permission("manage_settings"):
        flash("ليس لديك صلاحية لإقفال السنة المالية", "danger")
        return redirect(url_for("fiscal_years_list"))
    year = query_one("SELECT * FROM FiscalYears WHERE fiscal_year_id = ?", (year_id,))
    if not year or year['is_closed']:
        flash("السنة مغلقة بالفعل أو غير موجودة", "warning")
        return redirect(url_for("fiscal_years_list"))
    try:
        db = get_db()
        revenue_total = query_one("SELECT SUM(current_balance) as total FROM ChartOfAccounts WHERE account_type = 'REVENUE'")['total'] or 0
        expense_total = query_one("SELECT SUM(current_balance) as total FROM ChartOfAccounts WHERE account_type = 'EXPENSE'")['total'] or 0
        net_result = revenue_total - expense_total
        pl_account = query_one("SELECT account_id FROM ChartOfAccounts WHERE account_code LIKE '399%' OR name_ar LIKE '%أرباح%' LIMIT 1")
        if not pl_account:
            flash("لم يتم العثور على حساب 'الأرباح والخسائر' (كود يبدأ بـ 399). يرجى إنشاؤه أولاً.", "danger")
            return redirect(url_for("fiscal_years_list"))
        entry_num = f"CL-{year['year_name']}"
        db.execute("INSERT INTO JournalEntries (entry_number, entry_date, fiscal_year_id, description, total_debit, total_credit, currency_id, status, is_auto) VALUES (?, ?, ?, ?, ?, ?, ?, 'POSTED', 1)",
                   (entry_num, year['end_date'], year_id, f"قيد إقفال السنة المالية {year['year_name']}", abs(net_result), abs(net_result), 1))
        entry_id = db.lastrowid
        accounts = query_all("SELECT * FROM ChartOfAccounts WHERE account_type IN ('REVENUE', 'EXPENSE') AND current_balance != 0")
        for acc in accounts:
            debit = acc['current_balance'] if acc['account_nature'] == 'CREDIT' else 0
            credit = acc['current_balance'] if acc['account_nature'] == 'DEBIT' else 0
            db.execute("INSERT INTO JournalEntryLines (entry_id, account_id, debit, credit, description) VALUES (?, ?, ?, ?, ?)",
                       (entry_id, acc['account_id'], debit, credit, "إقفال رصيد الحساب للسنة المالية"))
            db.execute("UPDATE ChartOfAccounts SET current_balance = 0 WHERE account_id = ?", (acc['account_id'],))
        p_debit = 0; p_credit = 0
        if net_result > 0: p_credit = net_result
        else: p_debit = abs(net_result)
        db.execute("INSERT INTO JournalEntryLines (entry_id, account_id, debit, credit, description) VALUES (?, ?, ?, ?, ?)",
                   (entry_id, pl_account['account_id'], p_debit, p_credit, "إثبات صافي نتيجة السنة"))
        db.execute("UPDATE FiscalYears SET is_closed = 1, is_current = 0, closed_at = CURRENT_TIMESTAMP WHERE fiscal_year_id = ?", (year_id,))
        db.commit()
        flash(f"تم إقفال السنة المالية {year['year_name']} وتصفير الحسابات بنجاح.", "success")
    except Exception as e:
        db.rollback()
        flash(f"فشل الإقفال: {str(e)}", "danger")
    return redirect(url_for("fiscal_years_list"))


@app.route("/api/thermal-print-preview/<int:invoice_id>")
@login_required
def thermal_print_preview(invoice_id):
    """Preview thermal receipt as plain text."""
    from thermal_printer import format_receipt_text
    
    header = query_one(
        """SELECT s.*, c.name_ar AS customer_name, b.name_ar AS branch_name,
                  w.name_ar AS warehouse_name, u.full_name_ar AS cashier_name
           FROM SalesInvoices s
           LEFT JOIN Customers c ON c.customer_id = s.customer_id
           JOIN Branches b ON b.branch_id = s.branch_id
           JOIN Warehouses w ON w.warehouse_id = s.warehouse_id
           LEFT JOIN Users u ON u.user_id = s.cashier_id
           WHERE s.invoice_id = ?""", (invoice_id,))
    
    lines = query_all(
        """SELECT l.*, i.name_ar AS item_name
           FROM SalesInvoiceItems l JOIN Items i ON i.item_id = l.item_id
           WHERE l.invoice_id = ? ORDER BY l.line_id""", (invoice_id,))
    
    company = get_company_info()
    text = format_receipt_text(
        company=dict(company) if company else {},
        header=dict(header),
        lines=[dict(l) for l in lines]
    )
    
    return f"<pre dir='rtl' style='font-family:monospace;font-size:14px;background:#fff;padding:20px;max-width:400px;margin:auto;'>{text}</pre>"


# ============================================================================
# DELETE ENTITIES (حذف الأصناف والعملاء)
# ============================================================================

@app.route("/items/<int:item_id>/delete", methods=["POST"])
@login_required
@permission_required('manage_items')
def item_delete(item_id):
    """Delete an item."""
    try:
        db = get_db()
        from services import delete_item as svc_delete_item
        svc_delete_item(db, item_id)
        db.commit()
        return jsonify({"status": "ok", "message": "تم حذف الصنف بنجاح"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/customers/<int:customer_id>/delete", methods=["POST"])
@login_required
@permission_required('manage_customers')
def customer_delete(customer_id):
    """Delete a customer."""
    try:
        db = get_db()
        from services import delete_customer as svc_delete_customer
        svc_delete_customer(db, customer_id)
        db.commit()
        return jsonify({"status": "ok", "message": "تم حذف العميل بنجاح"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
        

@app.route("/suppliers/<int:supplier_id>/delete", methods=["POST"])
@login_required
@permission_required('manage_suppliers')
def supplier_delete(supplier_id):
    """Delete a supplier."""
    try:
        db = get_db()
        from services import delete_supplier as svc_delete_supplier
        svc_delete_supplier(db, supplier_id)
        db.commit()
        return jsonify({"status": "ok", "message": "تم حذف المورد بنجاح"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/branches/<int:branch_id>/delete", methods=["POST"])
@login_required
@permission_required('manage_settings')
def branch_delete(branch_id):
    try:
        db = get_db()
        from services import delete_branch
        delete_branch(db, branch_id)
        db.commit()
        return jsonify({"status": "ok", "message": "تم حذف الفرع بنجاح"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/warehouses/<int:warehouse_id>/delete", methods=["POST"])
@login_required
@permission_required('manage_settings')
def warehouse_delete(warehouse_id):
    try:
        db = get_db()
        from services import delete_warehouse
        delete_warehouse(db, warehouse_id)
        db.commit()
        return jsonify({"status": "ok", "message": "تم حذف المستودع بنجاح"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/categories/<int:category_id>/delete", methods=["POST"])
@login_required
@permission_required('manage_items')
def category_delete(category_id):
    try:
        db = get_db()
        from services import delete_category
        delete_category(db, category_id)
        db.commit()
        return jsonify({"status": "ok", "message": "تم حذف التصنيف بنجاح"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/units/<int:unit_id>/delete", methods=["POST"])
@login_required
@permission_required('manage_items')
def unit_delete(unit_id):
    try:
        db = get_db()
        from services import delete_unit
        delete_unit(db, unit_id)
        db.commit()
        return jsonify({"status": "ok", "message": "تم حذف الوحدة بنجاح"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


# ============================================================================

@app.errorhandler(500)
def internal_error(error):
    import traceback
    err_trace = traceback.format_exc()
    app.logger.error(f"Server Error: {error}")
    app.logger.error(err_trace)
    # Return the full error to the screen for easier debugging
    return f"<h1>Internal Server Error (Debug Mode)</h1><pre>{err_trace}</pre>", 500

if __name__ == "__main__":
    # Ensure port 5000 for Electron and cleanup old instances
    port = 5000
    
    if os.name == 'nt':
        try:
            # Kill any process on port 5000 before starting
            output = subprocess.check_output(['netstat', '-ano', '-p', 'TCP'], shell=True).decode()
            for line in output.splitlines():
                if f':{port} ' in line and 'LISTENING' in line:
                    pid = line.strip().split()[-1]
                    if pid != '0':
                        print(f"Cleaning up old process on port {port} (PID: {pid})...")
                        subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True, shell=True)
        except Exception:
            pass

    initialize_database(str(DB_PATH), str(SCHEMA_PATH), with_demo=True, force=False)
    
    # --- Auto Local Backup on Startup ---
    try:
        if is_frozen:
            auto_backup_dir = APP_DATA_DIR / "backups_auto"
        else:
            auto_backup_dir = BASE_DIR / "backups_auto"
        auto_backup_dir.mkdir(parents=True, exist_ok=True)
        backup_database(str(DB_PATH), str(auto_backup_dir))
    except Exception as e:
        app.logger.error(f"Auto backup failed: {e}")
    # ------------------------------------
    
    # Run server (debug=False in production to prevent multiple processes)
    debug_mode = not is_frozen
    app.run(debug=debug_mode, host="0.0.0.0", port=port)

