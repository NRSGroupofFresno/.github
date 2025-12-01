-- =============================================================================
-- PROJECTS MANAGEMENT DATABASE SCHEMA
-- NRS Group of Fresno - Project Tracking System
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Project Categories Table
-- Categorizes projects by type
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (parent_category_id) REFERENCES project_categories(id)
);

-- -----------------------------------------------------------------------------
-- Projects Table
-- Core table for tracking all development projects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,

    -- Basic Information
    project_name VARCHAR(255) NOT NULL,
    project_code VARCHAR(50) UNIQUE,
    description TEXT,
    project_category_id INT,

    -- Classification
    project_type ENUM('internal', 'client', 'research', 'maintenance', 'infrastructure') DEFAULT 'internal',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',

    -- Status
    status ENUM('planning', 'in_progress', 'on_hold', 'completed', 'cancelled', 'archived') DEFAULT 'planning',
    status_notes TEXT,
    percent_complete DECIMAL(5, 2) DEFAULT 0,

    -- Timeline
    planned_start_date DATE,
    actual_start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    deadline DATE,

    -- Team
    project_manager_id INT,
    team_lead_id INT,
    department VARCHAR(100),

    -- Client Information (for client projects)
    client_id INT, -- References leads/customers table
    client_contact_name VARCHAR(200),
    client_contact_email VARCHAR(255),
    client_contact_phone VARCHAR(20),

    -- Budget & Resources
    estimated_budget DECIMAL(15, 2),
    actual_budget DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    estimated_hours INT,
    actual_hours INT,

    -- Technical Details
    repository_url VARCHAR(500),
    staging_url VARCHAR(500),
    production_url VARCHAR(500),
    tech_stack TEXT,
    documentation_url VARCHAR(500),

    -- Risk Management
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    risk_notes TEXT,

    -- Metadata
    is_public BOOLEAN DEFAULT FALSE,
    is_billable BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_category_id) REFERENCES project_categories(id),
    INDEX idx_project_status (status),
    INDEX idx_project_category (project_category_id),
    INDEX idx_project_manager (project_manager_id),
    INDEX idx_project_dates (planned_start_date, planned_end_date)
);

-- -----------------------------------------------------------------------------
-- Project Phases Table
-- Break projects into major phases
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_phases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    phase_name VARCHAR(100) NOT NULL,
    phase_order INT NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
    planned_start_date DATE,
    actual_start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    deliverables TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_phase_project (project_id)
);

-- -----------------------------------------------------------------------------
-- Project Milestones Table
-- Track important project milestones
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_milestones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    phase_id INT,
    milestone_name VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_date DATE,
    status ENUM('pending', 'in_progress', 'completed', 'overdue', 'cancelled') DEFAULT 'pending',
    is_critical BOOLEAN DEFAULT FALSE,
    owner_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (phase_id) REFERENCES project_phases(id) ON DELETE SET NULL,
    INDEX idx_milestone_project (project_id),
    INDEX idx_milestone_due (due_date)
);

-- -----------------------------------------------------------------------------
-- Project Tasks Table
-- Individual tasks within projects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    phase_id INT,
    milestone_id INT,
    parent_task_id INT,

    -- Task Details
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_type ENUM('feature', 'bug', 'enhancement', 'documentation', 'testing', 'deployment', 'review', 'other') DEFAULT 'feature',

    -- Status & Priority
    status ENUM('backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'cancelled') DEFAULT 'backlog',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',

    -- Assignment
    assigned_to INT,
    assigned_by INT,
    assigned_at TIMESTAMP,

    -- Time Tracking
    estimated_hours DECIMAL(6, 2),
    actual_hours DECIMAL(6, 2),
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMP,

    -- Additional Fields
    story_points INT,
    labels VARCHAR(255), -- Comma-separated labels
    external_reference VARCHAR(100), -- For external system integration
    blockers TEXT,

    -- Metadata
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (phase_id) REFERENCES project_phases(id) ON DELETE SET NULL,
    FOREIGN KEY (milestone_id) REFERENCES project_milestones(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
    INDEX idx_task_project (project_id),
    INDEX idx_task_status (status),
    INDEX idx_task_assigned (assigned_to),
    INDEX idx_task_due (due_date)
);

-- -----------------------------------------------------------------------------
-- Project Team Members Table
-- Associates team members with projects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_team_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    responsibilities TEXT,
    allocation_percentage DECIMAL(5, 2) DEFAULT 100, -- % of time allocated
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_user (project_id, user_id),
    INDEX idx_team_project (project_id),
    INDEX idx_team_user (user_id)
);

-- -----------------------------------------------------------------------------
-- Project Time Entries Table
-- Track time spent on projects/tasks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_time_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    task_id INT,
    user_id INT NOT NULL,
    entry_date DATE NOT NULL,
    hours_worked DECIMAL(5, 2) NOT NULL,
    description TEXT,
    is_billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2),
    approved BOOLEAN DEFAULT FALSE,
    approved_by INT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
    INDEX idx_time_project (project_id),
    INDEX idx_time_user (user_id),
    INDEX idx_time_date (entry_date)
);

-- -----------------------------------------------------------------------------
-- Project Comments Table
-- Comments and discussions on projects/tasks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    task_id INT,
    parent_comment_id INT,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal vs client-visible
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES project_comments(id) ON DELETE CASCADE,
    INDEX idx_comment_project (project_id),
    INDEX idx_comment_task (task_id)
);

-- -----------------------------------------------------------------------------
-- Project Documents Table
-- Store project-related documents
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    phase_id INT,
    document_name VARCHAR(255) NOT NULL,
    document_type ENUM('specification', 'design', 'contract', 'report', 'meeting_notes', 'deliverable', 'other') DEFAULT 'other',
    file_path VARCHAR(500),
    file_size INT,
    mime_type VARCHAR(100),
    version VARCHAR(20),
    description TEXT,
    uploaded_by INT,
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (phase_id) REFERENCES project_phases(id) ON DELETE SET NULL,
    INDEX idx_doc_project (project_id)
);

-- -----------------------------------------------------------------------------
-- Project Change Log Table
-- Audit trail for project changes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_change_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'task', 'milestone', etc.
    entity_id INT NOT NULL,
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    change_description TEXT,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_changelog_project (project_id),
    INDEX idx_changelog_date (changed_at)
);

-- -----------------------------------------------------------------------------
-- Project Risks Table
-- Risk tracking and management
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_risks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    risk_title VARCHAR(255) NOT NULL,
    risk_description TEXT,
    risk_category ENUM('technical', 'resource', 'schedule', 'budget', 'scope', 'external', 'other') DEFAULT 'other',
    probability ENUM('low', 'medium', 'high', 'very_high') DEFAULT 'medium',
    impact ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    risk_score INT, -- Calculated: probability * impact
    mitigation_strategy TEXT,
    contingency_plan TEXT,
    status ENUM('identified', 'analyzing', 'mitigating', 'resolved', 'occurred', 'closed') DEFAULT 'identified',
    owner_id INT,
    identified_date DATE,
    resolved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_risk_project (project_id),
    INDEX idx_risk_status (status)
);

-- -----------------------------------------------------------------------------
-- Default Data Inserts
-- -----------------------------------------------------------------------------

-- Insert default project categories
INSERT INTO project_categories (category_name, description) VALUES
('Web Development', 'Web application and website development projects'),
('Mobile Development', 'iOS and Android mobile application projects'),
('API Development', 'Backend API and service development'),
('Data & Analytics', 'Data processing and analytics projects'),
('Infrastructure', 'DevOps and infrastructure projects'),
('Design', 'UI/UX design projects'),
('Consulting', 'Consulting and advisory projects'),
('Maintenance', 'Ongoing maintenance and support');
