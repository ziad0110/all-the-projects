-- ============================================================================
-- Smart Accounting Suite (SAS) - Complete Database Schema
-- النظام المحاسبي الذكي - هيكل قاعدة البيانات الكامل
-- ============================================================================
-- Database: SQLite 3
-- Encoding: UTF-8
-- Version: 1.0.0
-- Date: 2026
-- ============================================================================

-- ============================================================================
-- SQLite Configuration (تكوين SQLite)
-- ============================================================================
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA temp_store = MEMORY;
PRAGMA cache_size = -64000;
PRAGMA auto_vacuum = INCREMENTAL;
PRAGMA encoding = 'UTF-8';

-- ============================================================================
-- SECTION 1: SECURITY & USERS (الأمان والمستخدمين)
-- ============================================================================

-- 1.1 Roles (الأدوار)
CREATE TABLE IF NOT EXISTS Roles (
    role_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    role_code       VARCHAR(20)  NOT NULL UNIQUE,
    name_ar         VARCHAR(100) NOT NULL,
    name_en         VARCHAR(100) NOT NULL,
    description     TEXT,
    is_system       BOOLEAN DEFAULT 0,
    is_active       BOOLEAN DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Permissions (الصلاحيات)
CREATE TABLE IF NOT EXISTS Permissions (
    permission_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    permission_code VARCHAR(50) NOT NULL UNIQUE,
    module          VARCHAR(30) NOT NULL,
    name_ar         VARCHAR(150) NOT NULL,
    name_en         VARCHAR(150) NOT NULL
);

-- 1.3 Role Permissions (صلاحيات الأدوار)
CREATE TABLE IF NOT EXISTS RolePermissions (
    role_id         INTEGER NOT NULL,
    permission_id   INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id)       REFERENCES Roles(role_id)             ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES Permissions(permission_id) ON DELETE CASCADE
);

-- 1.4 Users (المستخدمين)
CREATE TABLE IF NOT EXISTS Users (
    user_id             INTEGER PRIMARY KEY AUTOINCREMENT,
    username            VARCHAR(50)  NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    full_name_ar        VARCHAR(150) NOT NULL,
    full_name_en        VARCHAR(150),
    email               VARCHAR(150),
    phone               VARCHAR(30),
    role_id             INTEGER NOT NULL,
    branch_id           INTEGER,
    avatar_path         VARCHAR(500),
    is_active           BOOLEAN  DEFAULT 1,
    failed_attempts     INTEGER  DEFAULT 0,
    locked_until        DATETIME,
    last_login_at       DATETIME,
    password_changed_at DATETIME,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME,
    FOREIGN KEY (role_id)   REFERENCES Roles(role_id)
);

CREATE INDEX IF NOT EXISTS idx_users_username ON Users(username);
CREATE INDEX IF NOT EXISTS idx_users_active   ON Users(is_active);

-- 1.5 Sessions (الجلسات)
CREATE TABLE IF NOT EXISTS Sessions (
    session_id      VARCHAR(64) PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    ip_address      VARCHAR(45),
    machine_name    VARCHAR(100),
    started_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity   DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at        DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 1.6 Audit Log (سجل التدقيق)
CREATE TABLE IF NOT EXISTS AuditLog (
    audit_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER,
    action_type     VARCHAR(20) NOT NULL,
    entity_name     VARCHAR(50) NOT NULL,
    entity_id       INTEGER,
    old_values      TEXT,
    new_values      TEXT,
    ip_address      VARCHAR(45),
    machine_name    VARCHAR(100),
    notes           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_audit_user   ON AuditLog(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON AuditLog(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_date   ON AuditLog(created_at);

-- ============================================================================
-- SECTION 2: COMPANY & SETTINGS (الشركة والإعدادات)
-- ============================================================================

-- 2.1 Currencies (العملات)
CREATE TABLE IF NOT EXISTS Currencies (
    currency_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    code            VARCHAR(5)   NOT NULL UNIQUE,
    name_ar         VARCHAR(50)  NOT NULL,
    name_en         VARCHAR(50)  NOT NULL,
    symbol          VARCHAR(10),
    decimal_places  INTEGER DEFAULT 2,
    is_base         BOOLEAN DEFAULT 0,
    is_active       BOOLEAN DEFAULT 1
);

-- 2.2 Company (الشركة)
CREATE TABLE IF NOT EXISTS Company (
    company_id              INTEGER PRIMARY KEY CHECK (company_id = 1),
    name_ar                 VARCHAR(200) NOT NULL,
    name_en                 VARCHAR(200),
    legal_name              VARCHAR(250),
    tax_number              VARCHAR(50),
    commercial_reg          VARCHAR(50),
    logo_path               VARCHAR(500),
    address_ar              TEXT,
    address_en              TEXT,
    phone                   VARCHAR(30),
    email                   VARCHAR(150),
    website                 VARCHAR(200),
    base_currency_id        INTEGER NOT NULL,
    fiscal_year_start_month INTEGER DEFAULT 1,
    license_key             VARCHAR(255),
    license_expiry          DATE,
    FOREIGN KEY (base_currency_id) REFERENCES Currencies(currency_id)
);

-- 2.3 Branches (الفروع)
CREATE TABLE IF NOT EXISTS Branches (
    branch_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_code     VARCHAR(20)  NOT NULL UNIQUE,
    name_ar         VARCHAR(150) NOT NULL,
    name_en         VARCHAR(150),
    address_ar      TEXT,
    address_en      TEXT,
    phone           VARCHAR(30),
    manager_name    VARCHAR(150),
    is_main         BOOLEAN DEFAULT 0,
    is_active       BOOLEAN DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 Warehouses (المستودعات)
CREATE TABLE IF NOT EXISTS Warehouses (
    warehouse_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id       INTEGER NOT NULL,
    warehouse_code  VARCHAR(20)  NOT NULL,
    name_ar         VARCHAR(150) NOT NULL,
    name_en         VARCHAR(150),
    location        VARCHAR(250),
    is_default      BOOLEAN DEFAULT 0,
    is_active       BOOLEAN DEFAULT 1,
    UNIQUE (branch_id, warehouse_code),
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id)
);

-- 2.5 Exchange Rates (أسعار الصرف)
CREATE TABLE IF NOT EXISTS ExchangeRates (
    rate_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    currency_id     INTEGER NOT NULL,
    rate_date       DATE    NOT NULL,
    rate_value      DECIMAL(18,6) NOT NULL,
    notes           VARCHAR(250),
    created_by      INTEGER,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (currency_id, rate_date),
    FOREIGN KEY (currency_id) REFERENCES Currencies(currency_id),
    FOREIGN KEY (created_by)  REFERENCES Users(user_id)
);

-- 2.6 Fiscal Years (السنوات المالية)
CREATE TABLE IF NOT EXISTS FiscalYears (
    fiscal_year_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    year_name       VARCHAR(20)  NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    is_closed       BOOLEAN DEFAULT 0,
    is_current      BOOLEAN DEFAULT 0,
    closed_at       DATETIME,
    closed_by       INTEGER,
    FOREIGN KEY (closed_by) REFERENCES Users(user_id)
);

-- 2.7 Settings (الإعدادات)
CREATE TABLE IF NOT EXISTS Settings (
    setting_key     VARCHAR(100) PRIMARY KEY,
    setting_value   TEXT,
    data_type       VARCHAR(20) DEFAULT 'STRING',
    category        VARCHAR(50),
    description     VARCHAR(250),
    updated_at      DATETIME,
    updated_by      INTEGER,
    FOREIGN KEY (updated_by) REFERENCES Users(user_id)
);

-- ============================================================================
-- SECTION 3: INVENTORY (المخزون)
-- ============================================================================

-- 3.1 Categories (التصنيفات)
CREATE TABLE IF NOT EXISTS Categories (
    category_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id       INTEGER,
    code            VARCHAR(20) UNIQUE,
    name_ar         VARCHAR(150) NOT NULL,
    name_en         VARCHAR(150),
    icon_path       VARCHAR(500),
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT 1,
    FOREIGN KEY (parent_id) REFERENCES Categories(category_id)
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON Categories(parent_id);

-- 3.2 Units (الوحدات)
CREATE TABLE IF NOT EXISTS Units (
    unit_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    name_ar         VARCHAR(50)  NOT NULL,
    name_en         VARCHAR(50)
);

-- 3.3 Suppliers (الموردين) - تم نقله هنا للترتيب المرجعي
CREATE TABLE IF NOT EXISTS Suppliers (
    supplier_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_code   VARCHAR(30) UNIQUE NOT NULL,
    name_ar         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    tax_number      VARCHAR(50),
    contact_person  VARCHAR(150),
    phone           VARCHAR(30),
    email           VARCHAR(150),
    address         TEXT,
    payment_terms   INTEGER DEFAULT 0,
    current_balance DECIMAL(18,4) DEFAULT 0,
    account_id      INTEGER,
    notes           TEXT,
    is_active       BOOLEAN DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3.4 Items (الأصناف)
CREATE TABLE IF NOT EXISTS Items (
    item_id             INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code           VARCHAR(50) NOT NULL UNIQUE,
    name_ar             VARCHAR(250) NOT NULL,
    name_en             VARCHAR(250),
    category_id         INTEGER,
    base_unit_id        INTEGER NOT NULL,
    default_supplier_id INTEGER,
    cost_price          DECIMAL(18,4) DEFAULT 0,
    min_stock           DECIMAL(18,4) DEFAULT 0,
    max_stock           DECIMAL(18,4) DEFAULT 0,
    has_expiry          BOOLEAN DEFAULT 0,
    track_batches       BOOLEAN DEFAULT 0,
    is_bundle           BOOLEAN DEFAULT 0,
    is_service          BOOLEAN DEFAULT 0,
    tax_rate            DECIMAL(5,2) DEFAULT 0,
    description         TEXT,
    notes               TEXT,
    is_active           BOOLEAN DEFAULT 1,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME,
    FOREIGN KEY (category_id)         REFERENCES Categories(category_id),
    FOREIGN KEY (base_unit_id)        REFERENCES Units(unit_id),
    FOREIGN KEY (default_supplier_id) REFERENCES Suppliers(supplier_id)
);

CREATE INDEX IF NOT EXISTS idx_items_code     ON Items(item_code);
CREATE INDEX IF NOT EXISTS idx_items_name_ar  ON Items(name_ar);
CREATE INDEX IF NOT EXISTS idx_items_category ON Items(category_id);

-- 3.5 Item Units (وحدات الصنف)
CREATE TABLE IF NOT EXISTS ItemUnits (
    item_unit_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id           INTEGER NOT NULL,
    unit_id           INTEGER NOT NULL,
    conversion_factor DECIMAL(18,6) NOT NULL,
    barcode           VARCHAR(50),
    is_default_sale   BOOLEAN DEFAULT 0,
    UNIQUE (item_id, unit_id),
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES Units(unit_id)
);

-- 3.6 Item Barcodes (الباركودات)
CREATE TABLE IF NOT EXISTS ItemBarcodes (
    barcode_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id         INTEGER NOT NULL,
    item_unit_id    INTEGER,
    barcode_value   VARCHAR(100) NOT NULL UNIQUE,
    barcode_type    VARCHAR(20)  DEFAULT 'EAN13',
    is_primary      BOOLEAN DEFAULT 0,
    FOREIGN KEY (item_id)      REFERENCES Items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (item_unit_id) REFERENCES ItemUnits(item_unit_id)
);

CREATE INDEX IF NOT EXISTS idx_barcode_value ON ItemBarcodes(barcode_value);

-- 3.7 Price Levels (مستويات الأسعار)
CREATE TABLE IF NOT EXISTS PriceLevels (
    price_level_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    code            VARCHAR(20) UNIQUE,
    name_ar         VARCHAR(100) NOT NULL,
    name_en         VARCHAR(100),
    is_default      BOOLEAN DEFAULT 0,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT 1
);

-- 3.8 Item Prices (أسعار الأصناف)
CREATE TABLE IF NOT EXISTS ItemPrices (
    item_price_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id         INTEGER NOT NULL,
    item_unit_id    INTEGER NOT NULL,
    price_level_id  INTEGER NOT NULL,
    price           DECIMAL(18,4) NOT NULL,
    currency_id     INTEGER NOT NULL,
    effective_from  DATE,
    UNIQUE (item_id, item_unit_id, price_level_id, currency_id),
    FOREIGN KEY (item_id)        REFERENCES Items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (item_unit_id)   REFERENCES ItemUnits(item_unit_id),
    FOREIGN KEY (price_level_id) REFERENCES PriceLevels(price_level_id),
    FOREIGN KEY (currency_id)    REFERENCES Currencies(currency_id)
);

-- 3.9 Item Images (صور الأصناف)
CREATE TABLE IF NOT EXISTS ItemImages (
    image_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id         INTEGER NOT NULL,
    image_path      VARCHAR(500) NOT NULL,
    is_primary      BOOLEAN DEFAULT 0,
    sort_order      INTEGER DEFAULT 0,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);

-- 3.10 Stock (المخزون الحالي)
CREATE TABLE IF NOT EXISTS Stock (
    stock_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id         INTEGER NOT NULL,
    warehouse_id    INTEGER NOT NULL,
    quantity        DECIMAL(18,4) DEFAULT 0,
    reserved_qty    DECIMAL(18,4) DEFAULT 0,
    avg_cost        DECIMAL(18,4) DEFAULT 0,
    last_updated    DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (item_id, warehouse_id),
    FOREIGN KEY (item_id)      REFERENCES Items(item_id),
    FOREIGN KEY (warehouse_id) REFERENCES Warehouses(warehouse_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_item ON Stock(item_id);

-- 3.11 Stock Batches (دفعات المخزون - الصلاحيات)
CREATE TABLE IF NOT EXISTS StockBatches (
    batch_id            INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id             INTEGER NOT NULL,
    warehouse_id        INTEGER NOT NULL,
    batch_number        VARCHAR(50),
    production_date     DATE,
    expiry_date         DATE,
    quantity            DECIMAL(18,4) NOT NULL,
    remaining_qty       DECIMAL(18,4) NOT NULL,
    cost_price          DECIMAL(18,4) NOT NULL,
    purchase_invoice_id INTEGER,
    received_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id)      REFERENCES Items(item_id),
    FOREIGN KEY (warehouse_id) REFERENCES Warehouses(warehouse_id)
);

CREATE INDEX IF NOT EXISTS idx_batch_expiry ON StockBatches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_batch_item   ON StockBatches(item_id, remaining_qty);

-- 3.12 Stock Movements (حركات المخزون)
CREATE TABLE IF NOT EXISTS StockMovements (
    movement_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id         INTEGER NOT NULL,
    warehouse_id    INTEGER NOT NULL,
    batch_id        INTEGER,
    movement_type   VARCHAR(20) NOT NULL,
    reference_type  VARCHAR(30),
    reference_id    INTEGER,
    quantity        DECIMAL(18,4) NOT NULL,
    unit_cost       DECIMAL(18,4),
    balance_after   DECIMAL(18,4),
    notes           VARCHAR(500),
    created_by      INTEGER,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id)      REFERENCES Items(item_id),
    FOREIGN KEY (warehouse_id) REFERENCES Warehouses(warehouse_id),
    FOREIGN KEY (batch_id)     REFERENCES StockBatches(batch_id),
    FOREIGN KEY (created_by)   REFERENCES Users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_movement_item ON StockMovements(item_id, created_at);
CREATE INDEX IF NOT EXISTS idx_movement_ref  ON StockMovements(reference_type, reference_id);

-- 3.13 Bundle Components (مكونات الأصناف المركبة)
CREATE TABLE IF NOT EXISTS BundleComponents (
    component_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    bundle_item_id    INTEGER NOT NULL,
    component_item_id INTEGER NOT NULL,
    quantity          DECIMAL(18,4) NOT NULL,
    unit_id           INTEGER NOT NULL,
    UNIQUE (bundle_item_id, component_item_id),
    FOREIGN KEY (bundle_item_id)    REFERENCES Items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (component_item_id) REFERENCES Items(item_id),
    FOREIGN KEY (unit_id)           REFERENCES Units(unit_id)
);

-- 3.14 Stock Counts (الجرد)
CREATE TABLE IF NOT EXISTS StockCounts (
    count_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    count_number    VARCHAR(30) UNIQUE NOT NULL,
    warehouse_id    INTEGER NOT NULL,
    count_date      DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'DRAFT',
    notes           TEXT,
    created_by      INTEGER,
    completed_at    DATETIME,
    FOREIGN KEY (warehouse_id) REFERENCES Warehouses(warehouse_id),
    FOREIGN KEY (created_by)   REFERENCES Users(user_id)
);

-- 3.15 Stock Count Items (تفاصيل الجرد)
CREATE TABLE IF NOT EXISTS StockCountItems (
    line_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    count_id        INTEGER NOT NULL,
    item_id         INTEGER NOT NULL,
    system_qty      DECIMAL(18,4) NOT NULL,
    counted_qty     DECIMAL(18,4) NOT NULL,
    variance        DECIMAL(18,4) GENERATED ALWAYS AS (counted_qty - system_qty) STORED,
    notes           VARCHAR(250),
    FOREIGN KEY (count_id) REFERENCES StockCounts(count_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id)  REFERENCES Items(item_id)
);

-- ============================================================================
-- SECTION 4: ACCOUNTING (المحاسبة)
-- ============================================================================

-- 4.1 Chart of Accounts (دليل الحسابات)
CREATE TABLE IF NOT EXISTS ChartOfAccounts (
    account_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    account_code    VARCHAR(30) UNIQUE NOT NULL,
    parent_id       INTEGER,
    name_ar         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    account_type    VARCHAR(20) NOT NULL,
    account_nature  VARCHAR(10) NOT NULL,
    level           INTEGER DEFAULT 1,
    is_parent       BOOLEAN DEFAULT 0,
    is_system       BOOLEAN DEFAULT 0,
    opening_balance DECIMAL(18,4) DEFAULT 0,
    current_balance DECIMAL(18,4) DEFAULT 0,
    currency_id     INTEGER,
    is_active       BOOLEAN DEFAULT 1,
    notes           TEXT,
    FOREIGN KEY (parent_id)   REFERENCES ChartOfAccounts(account_id),
    FOREIGN KEY (currency_id) REFERENCES Currencies(currency_id)
);

CREATE INDEX IF NOT EXISTS idx_coa_parent ON ChartOfAccounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_coa_type   ON ChartOfAccounts(account_type);

-- 4.2 Journal Entries (القيود اليومية)
CREATE TABLE IF NOT EXISTS JournalEntries (
    entry_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_number    VARCHAR(30) UNIQUE NOT NULL,
    entry_date      DATE NOT NULL,
    fiscal_year_id  INTEGER NOT NULL,
    description     TEXT,
    reference_type  VARCHAR(30),
    reference_id    INTEGER,
    total_debit     DECIMAL(18,4) NOT NULL,
    total_credit    DECIMAL(18,4) NOT NULL,
    currency_id     INTEGER NOT NULL,
    exchange_rate   DECIMAL(18,6) DEFAULT 1,
    status          VARCHAR(20) DEFAULT 'POSTED',
    is_auto         BOOLEAN DEFAULT 0,
    reversed_by     INTEGER,
    created_by      INTEGER,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    posted_at       DATETIME,
    CHECK (total_debit = total_credit),
    FOREIGN KEY (fiscal_year_id) REFERENCES FiscalYears(fiscal_year_id),
    FOREIGN KEY (currency_id)    REFERENCES Currencies(currency_id),
    FOREIGN KEY (reversed_by)    REFERENCES JournalEntries(entry_id),
    FOREIGN KEY (created_by)     REFERENCES Users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_je_date ON JournalEntries(entry_date);
CREATE INDEX IF NOT EXISTS idx_je_ref  ON JournalEntries(reference_type, reference_id);

-- 4.3 Journal Entry Lines (سطور القيود)
CREATE TABLE IF NOT EXISTS JournalEntryLines (
    line_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id        INTEGER NOT NULL,
    account_id      INTEGER NOT NULL,
    debit           DECIMAL(18,4) DEFAULT 0,
    credit          DECIMAL(18,4) DEFAULT 0,
    description     VARCHAR(500),
    cost_center_id  INTEGER,
    line_order      INTEGER DEFAULT 0,
    CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)),
    FOREIGN KEY (entry_id)   REFERENCES JournalEntries(entry_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES ChartOfAccounts(account_id)
);

CREATE INDEX IF NOT EXISTS idx_jel_account ON JournalEntryLines(account_id);

-- 4.4 Expenses (المصروفات)
CREATE TABLE IF NOT EXISTS Expenses (
    expense_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_number      VARCHAR(30) UNIQUE NOT NULL,
    expense_date        DATE NOT NULL,
    branch_id           INTEGER NOT NULL,
    expense_account_id  INTEGER NOT NULL,
    amount              DECIMAL(18,4) NOT NULL,
    currency_id         INTEGER NOT NULL,
    payment_method      VARCHAR(20) NOT NULL,
    beneficiary         VARCHAR(200),
    description         TEXT,
    receipt_path        VARCHAR(500),
    journal_entry_id    INTEGER,
    created_by          INTEGER,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id)          REFERENCES Branches(branch_id),
    FOREIGN KEY (expense_account_id) REFERENCES ChartOfAccounts(account_id),
    FOREIGN KEY (currency_id)        REFERENCES Currencies(currency_id),
    FOREIGN KEY (journal_entry_id)   REFERENCES JournalEntries(entry_id),
    FOREIGN KEY (created_by)         REFERENCES Users(user_id)
);

-- 4.5 Checks (الشيكات)
CREATE TABLE IF NOT EXISTS Checks (
    check_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    check_number    VARCHAR(50) NOT NULL,
    check_direction VARCHAR(10) NOT NULL,
    bank_name       VARCHAR(150),
    drawer_name     VARCHAR(200),
    beneficiary     VARCHAR(200),
    issue_date      DATE NOT NULL,
    due_date        DATE NOT NULL,
    amount          DECIMAL(18,4) NOT NULL,
    currency_id     INTEGER NOT NULL,
    status          VARCHAR(20) DEFAULT 'PENDING',
    customer_id     INTEGER,
    supplier_id     INTEGER,
    cleared_date    DATE,
    notes           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (currency_id)  REFERENCES Currencies(currency_id),
    FOREIGN KEY (customer_id)  REFERENCES Customers(customer_id),
    FOREIGN KEY (supplier_id)  REFERENCES Suppliers(supplier_id)
);

CREATE INDEX IF NOT EXISTS idx_checks_due    ON Checks(due_date);
CREATE INDEX IF NOT EXISTS idx_checks_status ON Checks(status);

-- ============================================================================
-- SECTION 5: SALES & POS (المبيعات ونقاط البيع)
-- ============================================================================

-- 5.1 Customers (العملاء)
CREATE TABLE IF NOT EXISTS Customers (
    customer_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_code   VARCHAR(30) UNIQUE NOT NULL,
    name_ar         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200),
    customer_type   VARCHAR(20) DEFAULT 'INDIVIDUAL',
    tax_number      VARCHAR(50),
    phone           VARCHAR(30),
    mobile          VARCHAR(30),
    email           VARCHAR(150),
    address         TEXT,
    city            VARCHAR(100),
    price_level_id  INTEGER,
    credit_limit    DECIMAL(18,4) DEFAULT 0,
    current_balance DECIMAL(18,4) DEFAULT 0,
    account_id      INTEGER,
    is_walkin       BOOLEAN DEFAULT 0,
    notes           TEXT,
    is_active       BOOLEAN DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (price_level_id) REFERENCES PriceLevels(price_level_id),
    FOREIGN KEY (account_id)     REFERENCES ChartOfAccounts(account_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_phone ON Customers(phone);
CREATE INDEX IF NOT EXISTS idx_customer_name  ON Customers(name_ar);

-- 5.2 Cash Sessions (جلسات الكاش)
CREATE TABLE IF NOT EXISTS CashSessions (
    session_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_number      VARCHAR(30) UNIQUE NOT NULL,
    branch_id           INTEGER NOT NULL,
    user_id             INTEGER NOT NULL,
    opening_balance     DECIMAL(18,4) NOT NULL,
    closing_balance     DECIMAL(18,4),
    expected_balance    DECIMAL(18,4),
    variance            DECIMAL(18,4),
    total_sales         DECIMAL(18,4) DEFAULT 0,
    total_cash          DECIMAL(18,4) DEFAULT 0,
    total_card          DECIMAL(18,4) DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'OPEN',
    opened_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at           DATETIME,
    notes               TEXT,
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id),
    FOREIGN KEY (user_id)   REFERENCES Users(user_id)
);

-- 5.3 Sales Invoices (فواتير المبيعات)
CREATE TABLE IF NOT EXISTS SalesInvoices (
    invoice_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number      VARCHAR(30) UNIQUE NOT NULL,
    invoice_date        DATETIME DEFAULT CURRENT_TIMESTAMP,
    branch_id           INTEGER NOT NULL,
    warehouse_id        INTEGER NOT NULL,
    customer_id         INTEGER,
    cash_session_id     INTEGER,
    cashier_id          INTEGER NOT NULL,
    payment_type        VARCHAR(20) NOT NULL,
    currency_id         INTEGER NOT NULL,
    exchange_rate       DECIMAL(18,6) DEFAULT 1,
    subtotal            DECIMAL(18,4) NOT NULL,
    discount_type       VARCHAR(10),
    discount_value      DECIMAL(18,4) DEFAULT 0,
    discount_amount     DECIMAL(18,4) DEFAULT 0,
    tax_amount          DECIMAL(18,4) DEFAULT 0,
    total               DECIMAL(18,4) NOT NULL,
    paid_amount         DECIMAL(18,4) DEFAULT 0,
    remaining           DECIMAL(18,4) DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'POSTED',
    journal_entry_id    INTEGER,
    notes               TEXT,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id)        REFERENCES Branches(branch_id),
    FOREIGN KEY (warehouse_id)     REFERENCES Warehouses(warehouse_id),
    FOREIGN KEY (customer_id)      REFERENCES Customers(customer_id),
    FOREIGN KEY (cash_session_id)  REFERENCES CashSessions(session_id),
    FOREIGN KEY (cashier_id)       REFERENCES Users(user_id),
    FOREIGN KEY (currency_id)      REFERENCES Currencies(currency_id),
    FOREIGN KEY (journal_entry_id) REFERENCES JournalEntries(entry_id)
);

CREATE INDEX IF NOT EXISTS idx_sales_date     ON SalesInvoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON SalesInvoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_status   ON SalesInvoices(status);

-- 5.4 Sales Invoice Items (تفاصيل فواتير البيع)
CREATE TABLE IF NOT EXISTS SalesInvoiceItems (
    line_id             INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id          INTEGER NOT NULL,
    item_id             INTEGER NOT NULL,
    item_unit_id        INTEGER NOT NULL,
    batch_id            INTEGER,
    quantity            DECIMAL(18,4) NOT NULL,
    unit_price          DECIMAL(18,4) NOT NULL,
    discount_percent    DECIMAL(5,2) DEFAULT 0,
    discount_amount     DECIMAL(18,4) DEFAULT 0,
    tax_rate            DECIMAL(5,2) DEFAULT 0,
    tax_amount          DECIMAL(18,4) DEFAULT 0,
    line_total          DECIMAL(18,4) NOT NULL,
    cost_price          DECIMAL(18,4),
    notes               VARCHAR(250),
    FOREIGN KEY (invoice_id)   REFERENCES SalesInvoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id)      REFERENCES Items(item_id),
    FOREIGN KEY (item_unit_id) REFERENCES ItemUnits(item_unit_id),
    FOREIGN KEY (batch_id)     REFERENCES StockBatches(batch_id)
);

-- 5.5 Payments (الدفعات)
CREATE TABLE IF NOT EXISTS Payments (
    payment_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_number      VARCHAR(30) UNIQUE,
    payment_date        DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_direction   VARCHAR(10) NOT NULL,
    reference_type      VARCHAR(30),
    reference_id        INTEGER,
    customer_id         INTEGER,
    supplier_id         INTEGER,
    payment_method      VARCHAR(20) NOT NULL,
    amount              DECIMAL(18,4) NOT NULL,
    currency_id         INTEGER NOT NULL,
    exchange_rate       DECIMAL(18,6) DEFAULT 1,
    check_id            INTEGER,
    notes               TEXT,
    journal_entry_id    INTEGER,
    created_by          INTEGER,
    FOREIGN KEY (customer_id)      REFERENCES Customers(customer_id),
    FOREIGN KEY (supplier_id)      REFERENCES Suppliers(supplier_id),
    FOREIGN KEY (currency_id)      REFERENCES Currencies(currency_id),
    FOREIGN KEY (check_id)         REFERENCES Checks(check_id),
    FOREIGN KEY (journal_entry_id) REFERENCES JournalEntries(entry_id),
    FOREIGN KEY (created_by)       REFERENCES Users(user_id)
);

-- 5.6 Sales Returns (مرتجعات المبيعات)
CREATE TABLE IF NOT EXISTS SalesReturns (
    return_id               INTEGER PRIMARY KEY AUTOINCREMENT,
    return_number           VARCHAR(30) UNIQUE NOT NULL,
    return_date             DATETIME DEFAULT CURRENT_TIMESTAMP,
    original_invoice_id     INTEGER NOT NULL,
    customer_id             INTEGER,
    total_amount            DECIMAL(18,4) NOT NULL,
    refund_method           VARCHAR(20),
    reason                  TEXT,
    journal_entry_id        INTEGER,
    created_by              INTEGER,
    FOREIGN KEY (original_invoice_id) REFERENCES SalesInvoices(invoice_id),
    FOREIGN KEY (customer_id)         REFERENCES Customers(customer_id),
    FOREIGN KEY (journal_entry_id)    REFERENCES JournalEntries(entry_id),
    FOREIGN KEY (created_by)          REFERENCES Users(user_id)
);

-- 5.7 Sales Return Items (تفاصيل المرتجعات)
CREATE TABLE IF NOT EXISTS SalesReturnItems (
    line_id             INTEGER PRIMARY KEY AUTOINCREMENT,
    return_id           INTEGER NOT NULL,
    original_line_id    INTEGER,
    item_id             INTEGER NOT NULL,
    quantity            DECIMAL(18,4) NOT NULL,
    unit_price          DECIMAL(18,4) NOT NULL,
    line_total          DECIMAL(18,4) NOT NULL,
    FOREIGN KEY (return_id)        REFERENCES SalesReturns(return_id) ON DELETE CASCADE,
    FOREIGN KEY (original_line_id) REFERENCES SalesInvoiceItems(line_id),
    FOREIGN KEY (item_id)          REFERENCES Items(item_id)
);

-- 5.8 Held Invoices (الفواتير المعلقة)
CREATE TABLE IF NOT EXISTS HeldInvoices (
    held_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    hold_label      VARCHAR(100),
    cashier_id      INTEGER NOT NULL,
    branch_id       INTEGER NOT NULL,
    invoice_data    TEXT NOT NULL,
    total_amount    DECIMAL(18,4),
    held_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cashier_id) REFERENCES Users(user_id),
    FOREIGN KEY (branch_id)  REFERENCES Branches(branch_id)
);

-- ============================================================================
-- SECTION 6: PURCHASES (المشتريات)
-- ============================================================================

-- 6.1 Purchase Invoices (فواتير المشتريات)
CREATE TABLE IF NOT EXISTS PurchaseInvoices (
    invoice_id              INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number          VARCHAR(30) UNIQUE NOT NULL,
    supplier_invoice_no     VARCHAR(50),
    invoice_date            DATE NOT NULL,
    due_date                DATE,
    branch_id               INTEGER NOT NULL,
    warehouse_id            INTEGER NOT NULL,
    supplier_id             INTEGER NOT NULL,
    payment_type            VARCHAR(20) NOT NULL,
    currency_id             INTEGER NOT NULL,
    exchange_rate           DECIMAL(18,6) DEFAULT 1,
    subtotal                DECIMAL(18,4) NOT NULL,
    discount_amount         DECIMAL(18,4) DEFAULT 0,
    tax_amount              DECIMAL(18,4) DEFAULT 0,
    shipping_cost           DECIMAL(18,4) DEFAULT 0,
    total                   DECIMAL(18,4) NOT NULL,
    paid_amount             DECIMAL(18,4) DEFAULT 0,
    remaining               DECIMAL(18,4) DEFAULT 0,
    status                  VARCHAR(20) DEFAULT 'POSTED',
    journal_entry_id        INTEGER,
    notes                   TEXT,
    created_by              INTEGER,
    created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id)        REFERENCES Branches(branch_id),
    FOREIGN KEY (warehouse_id)     REFERENCES Warehouses(warehouse_id),
    FOREIGN KEY (supplier_id)      REFERENCES Suppliers(supplier_id),
    FOREIGN KEY (currency_id)      REFERENCES Currencies(currency_id),
    FOREIGN KEY (journal_entry_id) REFERENCES JournalEntries(entry_id),
    FOREIGN KEY (created_by)       REFERENCES Users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_purchase_supplier ON PurchaseInvoices(supplier_id, invoice_date);

-- 6.2 Purchase Invoice Items (تفاصيل فواتير الشراء)
CREATE TABLE IF NOT EXISTS PurchaseInvoiceItems (
    line_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id      INTEGER NOT NULL,
    item_id         INTEGER NOT NULL,
    item_unit_id    INTEGER NOT NULL,
    quantity        DECIMAL(18,4) NOT NULL,
    unit_cost       DECIMAL(18,4) NOT NULL,
    discount_amount DECIMAL(18,4) DEFAULT 0,
    tax_amount      DECIMAL(18,4) DEFAULT 0,
    line_total      DECIMAL(18,4) NOT NULL,
    batch_number    VARCHAR(50),
    production_date DATE,
    expiry_date     DATE,
    FOREIGN KEY (invoice_id)   REFERENCES PurchaseInvoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id)      REFERENCES Items(item_id),
    FOREIGN KEY (item_unit_id) REFERENCES ItemUnits(item_unit_id)
);

-- 6.3 Stock Transfers (تحويلات المخزون)
CREATE TABLE IF NOT EXISTS StockTransfers (
    transfer_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    transfer_number     VARCHAR(30) UNIQUE NOT NULL,
    transfer_date       DATE NOT NULL,
    from_warehouse_id   INTEGER NOT NULL,
    to_warehouse_id     INTEGER NOT NULL,
    to_branch_code      VARCHAR(20),
    status              VARCHAR(20) DEFAULT 'DRAFT',
    notes               TEXT,
    created_by          INTEGER,
    received_by         INTEGER,
    sent_at             DATETIME,
    received_at         DATETIME,
    FOREIGN KEY (from_warehouse_id) REFERENCES Warehouses(warehouse_id),
    FOREIGN KEY (to_warehouse_id)   REFERENCES Warehouses(warehouse_id),
    FOREIGN KEY (created_by)        REFERENCES Users(user_id),
    FOREIGN KEY (received_by)       REFERENCES Users(user_id)
);

-- 6.4 Stock Transfer Items (تفاصيل التحويل)
CREATE TABLE IF NOT EXISTS StockTransferItems (
    line_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    transfer_id     INTEGER NOT NULL,
    item_id         INTEGER NOT NULL,
    quantity        DECIMAL(18,4) NOT NULL,
    received_qty    DECIMAL(18,4),
    cost_price      DECIMAL(18,4),
    FOREIGN KEY (transfer_id) REFERENCES StockTransfers(transfer_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id)     REFERENCES Items(item_id)
);

-- 6.5 Purchase Returns (مرتجعات المشتريات)
CREATE TABLE IF NOT EXISTS PurchaseReturns (
    return_id               INTEGER PRIMARY KEY AUTOINCREMENT,
    return_number           VARCHAR(30) UNIQUE NOT NULL,
    return_date             DATE NOT NULL,
    original_invoice_id     INTEGER NOT NULL,
    supplier_id             INTEGER NOT NULL,
    total_amount            DECIMAL(18,4) NOT NULL,
    reason                  TEXT,
    journal_entry_id        INTEGER,
    created_by              INTEGER,
    FOREIGN KEY (original_invoice_id) REFERENCES PurchaseInvoices(invoice_id),
    FOREIGN KEY (supplier_id)         REFERENCES Suppliers(supplier_id),
    FOREIGN KEY (journal_entry_id)    REFERENCES JournalEntries(entry_id),
    FOREIGN KEY (created_by)          REFERENCES Users(user_id)
);



-- ============================================================================
-- SECTION 7: TRIGGERS (المُحفّزات الذكية)
-- ============================================================================

-- 7.1 منع حذف الحسابات النظامية
CREATE TRIGGER IF NOT EXISTS trg_prevent_system_account_delete
BEFORE DELETE ON ChartOfAccounts
WHEN OLD.is_system = 1
BEGIN
    SELECT RAISE(ABORT, 'لا يمكن حذف حساب نظامي');
END;

-- 7.2 تحديث الرصيد التراكمي للحساب (مع مراعاة طبيعة الحساب)
CREATE TRIGGER IF NOT EXISTS trg_update_account_balance
AFTER INSERT ON JournalEntryLines
BEGIN
    UPDATE ChartOfAccounts
    SET current_balance = current_balance +
        CASE WHEN account_nature = 'DEBIT'
             THEN NEW.debit - NEW.credit
             ELSE NEW.credit - NEW.debit
        END
    WHERE account_id = NEW.account_id;
END;

-- 7.3 منع حذف الأدوار النظامية
CREATE TRIGGER IF NOT EXISTS trg_prevent_system_role_delete
BEFORE DELETE ON Roles
WHEN OLD.is_system = 1
BEGIN
    SELECT RAISE(ABORT, 'لا يمكن حذف دور نظامي');
END;

-- 7.4 تحديث تاريخ تعديل الصنف
CREATE TRIGGER IF NOT EXISTS trg_update_item_timestamp
AFTER UPDATE ON Items
BEGIN
    UPDATE Items SET updated_at = CURRENT_TIMESTAMP WHERE item_id = NEW.item_id;
END;

-- 7.5 تحديث تاريخ تعديل المستخدم
CREATE TRIGGER IF NOT EXISTS trg_update_user_timestamp
AFTER UPDATE ON Users
BEGIN
    UPDATE Users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
END;

-- ============================================================================
-- SECTION 8: ADDITIONAL INDEXES (فهارس إضافية للأداء)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_items_search    ON Items(name_ar, item_code, is_active);
CREATE INDEX IF NOT EXISTS idx_expiry_alert    ON StockBatches(expiry_date, remaining_qty);
CREATE INDEX IF NOT EXISTS idx_customer_invoices ON SalesInvoices(customer_id, invoice_date);

-- ============================================================================
-- SECTION 9: QUOTATIONS (عروض الأسعار)
-- ============================================================================

-- 9.1 Quotations (عروض الأسعار)
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
);

CREATE INDEX IF NOT EXISTS idx_quotation_date     ON Quotations(quotation_date);
CREATE INDEX IF NOT EXISTS idx_quotation_customer ON Quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_status   ON Quotations(status);

-- 9.2 Quotation Items (بنود عرض السعر)
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
);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
