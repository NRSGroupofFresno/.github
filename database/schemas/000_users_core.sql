-- =============================================================================
-- CORE USERS AND SYSTEM TABLES
-- NRS Group of Fresno - Core System Tables
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Users Table
-- Core user management for the system
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,

    -- Authentication
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    -- Profile
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),

    -- Organization
    department VARCHAR(100),
    job_title VARCHAR(100),
    manager_id INT,
    employee_id VARCHAR(50),
    hire_date DATE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,

    -- Settings
    timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
    locale VARCHAR(10) DEFAULT 'en-US',
    notification_preferences JSON,

    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(100),
    password_changed_at TIMESTAMP,
    must_change_password BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (manager_id) REFERENCES users(id),
    INDEX idx_user_email (email),
    INDEX idx_user_department (department),
    INDEX idx_user_active (is_active)
);

-- -----------------------------------------------------------------------------
-- Roles Table
-- Define system roles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE, -- Cannot be deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Permissions Table
-- Define granular permissions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    permission_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    module VARCHAR(50), -- leads, projects, compliance, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Role Permissions Table
-- Link roles to permissions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- User Roles Table
-- Assign roles to users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,

    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Audit Log Table
-- System-wide audit trail
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, etc.
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    additional_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_date (created_at)
);

-- -----------------------------------------------------------------------------
-- Sessions Table
-- User session management
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_user (user_id),
    INDEX idx_session_expires (expires_at)
);

-- -----------------------------------------------------------------------------
-- System Settings Table
-- Application configuration
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- -----------------------------------------------------------------------------
-- Notifications Table
-- System notifications for users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_read (is_read)
);

-- -----------------------------------------------------------------------------
-- File Uploads Table
-- Track all file uploads in the system
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS file_uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_hash VARCHAR(64), -- SHA-256 hash for deduplication
    entity_type VARCHAR(50), -- Related entity type
    entity_id INT, -- Related entity ID
    uploaded_by INT,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_upload_entity (entity_type, entity_id),
    INDEX idx_upload_user (uploaded_by)
);

-- -----------------------------------------------------------------------------
-- Default Data Inserts
-- -----------------------------------------------------------------------------

-- Insert default roles
INSERT INTO roles (role_name, role_description, is_system_role) VALUES
('Administrator', 'Full system access', TRUE),
('Manager', 'Department management access', TRUE),
('Lead Manager', 'Lead and enrollment management', FALSE),
('Project Manager', 'Project management access', FALSE),
('Compliance Officer', 'Legal and compliance management', FALSE),
('Sales Representative', 'Lead handling and sales', FALSE),
('Viewer', 'Read-only access', TRUE);

-- Insert default permissions
INSERT INTO permissions (permission_name, permission_code, module) VALUES
-- Lead Permissions
('View Leads', 'leads.view', 'leads'),
('Create Leads', 'leads.create', 'leads'),
('Edit Leads', 'leads.edit', 'leads'),
('Delete Leads', 'leads.delete', 'leads'),
('Export Leads', 'leads.export', 'leads'),
('Assign Leads', 'leads.assign', 'leads'),

-- Enrollment Permissions
('View Enrollments', 'enrollments.view', 'enrollments'),
('Create Enrollments', 'enrollments.create', 'enrollments'),
('Edit Enrollments', 'enrollments.edit', 'enrollments'),
('Approve Enrollments', 'enrollments.approve', 'enrollments'),

-- Project Permissions
('View Projects', 'projects.view', 'projects'),
('Create Projects', 'projects.create', 'projects'),
('Edit Projects', 'projects.edit', 'projects'),
('Delete Projects', 'projects.delete', 'projects'),
('Manage Project Team', 'projects.team', 'projects'),

-- Compliance Permissions
('View Compliance', 'compliance.view', 'compliance'),
('Manage Compliance', 'compliance.manage', 'compliance'),
('View Legal Documents', 'legal.view', 'compliance'),
('Manage Legal Documents', 'legal.manage', 'compliance'),
('Manage Audits', 'audits.manage', 'compliance'),

-- System Permissions
('Manage Users', 'users.manage', 'system'),
('Manage Roles', 'roles.manage', 'system'),
('View Audit Log', 'audit.view', 'system'),
('Manage Settings', 'settings.manage', 'system');
