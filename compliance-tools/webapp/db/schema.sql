-- Fresno Compliance Audit Tool Database Schema
-- SQLite Compatible

-- ============================================
-- USERS & ORGANIZATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    business_type TEXT,
    ein TEXT,
    address TEXT,
    city TEXT DEFAULT 'Fresno',
    state TEXT DEFAULT 'CA',
    zip TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    employee_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- admin, manager, user
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ============================================
-- COMPLIANCE CATEGORIES & ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS compliance_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level TEXT NOT NULL, -- federal, state, local
    description TEXT,
    agency TEXT,
    website TEXT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS compliance_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT, -- daily, weekly, monthly, quarterly, annually, as-needed
    due_day INTEGER, -- day of month if applicable
    due_month INTEGER, -- month if annual
    penalty_info TEXT,
    resource_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES compliance_categories(id)
);

-- ============================================
-- COMPLIANCE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS compliance_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, not_applicable, overdue
    due_date DATE,
    completed_date DATE,
    completed_by INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (item_id) REFERENCES compliance_items(id),
    FOREIGN KEY (completed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS compliance_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    item_id INTEGER,
    filename TEXT NOT NULL,
    file_path TEXT,
    file_type TEXT,
    uploaded_by INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (item_id) REFERENCES compliance_items(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- ============================================
-- WEEKLY AUDIT TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS weekly_audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    federal_status TEXT DEFAULT 'pending', -- green, yellow, red
    state_status TEXT DEFAULT 'pending',
    local_status TEXT DEFAULT 'pending',
    overall_score INTEGER,
    notes TEXT,
    completed_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (completed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id INTEGER NOT NULL,
    day_of_week TEXT NOT NULL, -- monday, tuesday, wednesday, thursday, friday
    task_description TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    completed_at DATETIME,
    notes TEXT,
    FOREIGN KEY (audit_id) REFERENCES weekly_audits(id)
);

-- ============================================
-- LICENSES & PERMITS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS licenses_permits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- license, permit, certification
    name TEXT NOT NULL,
    issuing_agency TEXT,
    license_number TEXT,
    issue_date DATE,
    expiration_date DATE,
    renewal_fee REAL,
    status TEXT DEFAULT 'active', -- active, expiring, expired, pending
    reminder_days INTEGER DEFAULT 30,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ============================================
-- DEADLINES & REMINDERS
-- ============================================

CREATE TABLE IF NOT EXISTS deadlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    category TEXT, -- tax, license, permit, filing, other
    level TEXT, -- federal, state, local
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    status TEXT DEFAULT 'upcoming', -- upcoming, due_soon, overdue, completed
    reminder_sent INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ============================================
-- BUSINESS ADVOCACY Q&A
-- ============================================

CREATE TABLE IF NOT EXISTS faq_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faq_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT, -- comma-separated for search
    helpful_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES faq_categories(id)
);

CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- legal, tax, business, government, community
    url TEXT,
    phone TEXT,
    address TEXT,
    is_free INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ACTIVITY LOG
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_compliance_status_org ON compliance_status(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_status_item ON compliance_status(item_id);
CREATE INDEX IF NOT EXISTS idx_compliance_status_status ON compliance_status(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_due ON deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_org ON deadlines(organization_id);
CREATE INDEX IF NOT EXISTS idx_licenses_expiration ON licenses_permits(expiration_date);
CREATE INDEX IF NOT EXISTS idx_weekly_audits_week ON weekly_audits(week_start);
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq_items(category_id);

-- ============================================
-- DEFAULT DATA: COMPLIANCE CATEGORIES
-- ============================================

INSERT INTO compliance_categories (name, level, description, agency, website, sort_order) VALUES
-- Federal
('IRS Tax Compliance', 'federal', 'Federal tax obligations', 'Internal Revenue Service', 'https://www.irs.gov', 1),
('DOL Employment', 'federal', 'Federal employment laws', 'Department of Labor', 'https://www.dol.gov', 2),
('OSHA Safety', 'federal', 'Workplace safety standards', 'OSHA', 'https://www.osha.gov', 3),
('Immigration (I-9)', 'federal', 'Employment eligibility', 'USCIS', 'https://www.uscis.gov', 4),
('ADA Compliance', 'federal', 'Disability accommodations', 'DOJ/EEOC', 'https://www.ada.gov', 5),
('EEOC', 'federal', 'Equal employment opportunity', 'EEOC', 'https://www.eeoc.gov', 6),
-- State
('EDD Payroll', 'state', 'California payroll taxes', 'Employment Development Department', 'https://www.edd.ca.gov', 10),
('FTB Income Tax', 'state', 'California income/franchise tax', 'Franchise Tax Board', 'https://www.ftb.ca.gov', 11),
('CDTFA Sales Tax', 'state', 'California sales and use tax', 'CDTFA', 'https://www.cdtfa.ca.gov', 12),
('Cal/OSHA', 'state', 'California workplace safety', 'Cal/OSHA', 'https://www.dir.ca.gov/dosh/', 13),
('DLSE Labor', 'state', 'California wage and hour', 'DLSE', 'https://www.dir.ca.gov/dlse/', 14),
('Workers Comp', 'state', 'California workers compensation', 'DIR', 'https://www.dir.ca.gov/dwc/', 15),
-- Local
('Fresno Business License', 'local', 'City of Fresno business license', 'City Finance', 'https://www.fresno.gov/finance/', 20),
('Fresno Permits', 'local', 'Building and zoning permits', 'City Planning', 'https://www.fresno.gov/darm/', 21),
('Fresno Fire', 'local', 'Fire safety permits', 'Fresno Fire', 'https://www.fresno.gov/fire/', 22),
('County Health', 'local', 'Health permits', 'Fresno County Health', 'https://www.co.fresno.ca.us/departments/public-health', 23),
('Air Quality', 'local', 'Air quality permits', 'SJVAPCD', 'https://www.valleyair.org', 24);

-- ============================================
-- DEFAULT DATA: FAQ CATEGORIES
-- ============================================

INSERT INTO faq_categories (name, description, icon, sort_order) VALUES
('Starting a Business', 'Questions about business formation and setup', 'rocket', 1),
('Employment & HR', 'Hiring, wages, and employee management', 'users', 2),
('Taxes', 'Federal, state, and local tax questions', 'calculator', 3),
('Licenses & Permits', 'Business licensing and permit requirements', 'file-text', 4),
('Compliance', 'Regulatory compliance questions', 'check-square', 5),
('Legal Resources', 'Finding legal help and resources', 'scale', 6);

-- ============================================
-- DEFAULT DATA: RESOURCES
-- ============================================

INSERT INTO resources (name, description, category, url, phone, is_free) VALUES
('SCORE Fresno', 'Free business mentoring and workshops', 'business', 'https://fresno.score.org', NULL, 1),
('Fresno State SBDC', 'Small Business Development Center', 'business', 'https://www.fresnostate.edu/sbdc/', '559-278-2066', 1),
('CA Bar Lawyer Referral', 'Find a licensed attorney', 'legal', 'https://www.calbar.ca.gov', '866-442-2529', 0),
('Fresno County Bar', 'Local lawyer referral service', 'legal', 'https://www.fresnocountybar.org', NULL, 0),
('Central CA Legal Services', 'Low-income legal assistance', 'legal', 'https://www.centralcallegal.org', '559-570-1200', 1),
('IRS Small Business', 'Federal tax resources', 'tax', 'https://www.irs.gov/businesses', '800-829-4933', 1),
('CA Franchise Tax Board', 'State tax information', 'tax', 'https://www.ftb.ca.gov', '800-852-5711', 1),
('City of Fresno', 'City government services', 'government', 'https://www.fresno.gov', '559-621-8400', 1),
('Fresno Chamber', 'Business networking and advocacy', 'business', 'https://fresnochamber.com', NULL, 0),
('VITA Tax Help', 'Free tax preparation assistance', 'tax', 'https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers', NULL, 1);
