-- =============================================================================
-- LEGAL COMPLIANCE DATABASE SCHEMA
-- NRS Group of Fresno - Legal & Compliance Management System
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Compliance Frameworks Table
-- Different regulatory frameworks the organization must comply with
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    framework_name VARCHAR(200) NOT NULL,
    framework_code VARCHAR(50) UNIQUE,
    description TEXT,
    regulatory_body VARCHAR(200),
    jurisdiction VARCHAR(100), -- Geographic jurisdiction
    framework_type ENUM('federal', 'state', 'local', 'industry', 'internal', 'international') DEFAULT 'industry',
    effective_date DATE,
    version VARCHAR(50),
    documentation_url VARCHAR(500),
    is_mandatory BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Compliance Requirements Table
-- Specific requirements within each framework
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_requirements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    framework_id INT NOT NULL,
    requirement_code VARCHAR(50),
    requirement_title VARCHAR(255) NOT NULL,
    requirement_description TEXT,
    requirement_category VARCHAR(100),
    control_type ENUM('preventive', 'detective', 'corrective', 'directive') DEFAULT 'preventive',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    frequency ENUM('one_time', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'ongoing') DEFAULT 'ongoing',
    evidence_required TEXT,
    implementation_guidance TEXT,
    parent_requirement_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_requirement_id) REFERENCES compliance_requirements(id),
    INDEX idx_req_framework (framework_id)
);

-- -----------------------------------------------------------------------------
-- Compliance Status Table
-- Tracks compliance status for each requirement
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requirement_id INT NOT NULL,
    project_id INT, -- Optional link to specific project
    status ENUM('not_started', 'in_progress', 'compliant', 'non_compliant', 'partially_compliant', 'not_applicable', 'under_review') DEFAULT 'not_started',
    compliance_score DECIMAL(5, 2), -- 0-100
    assessment_date DATE,
    next_review_date DATE,
    responsible_party_id INT,
    evidence_location VARCHAR(500),
    findings TEXT,
    remediation_plan TEXT,
    remediation_deadline DATE,
    notes TEXT,
    assessed_by INT,
    approved_by INT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (requirement_id) REFERENCES compliance_requirements(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_status_requirement (requirement_id),
    INDEX idx_status_project (project_id),
    INDEX idx_status_next_review (next_review_date)
);

-- -----------------------------------------------------------------------------
-- Legal Documents Table
-- Store legal documents, contracts, agreements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,

    -- Document Information
    document_title VARCHAR(255) NOT NULL,
    document_number VARCHAR(100) UNIQUE,
    document_type ENUM('contract', 'agreement', 'policy', 'terms_of_service', 'privacy_policy', 'nda', 'license', 'permit', 'certificate', 'insurance', 'other') NOT NULL,
    document_category VARCHAR(100),
    description TEXT,

    -- Parties Involved
    party_name VARCHAR(255), -- Other party in the document
    party_type ENUM('client', 'vendor', 'partner', 'employee', 'government', 'other'),
    party_contact_name VARCHAR(200),
    party_contact_email VARCHAR(255),

    -- Dates
    effective_date DATE,
    expiration_date DATE,
    execution_date DATE,
    renewal_date DATE,
    termination_date DATE,

    -- Status
    status ENUM('draft', 'pending_review', 'pending_signature', 'active', 'expired', 'terminated', 'renewed', 'archived') DEFAULT 'draft',

    -- Financial
    contract_value DECIMAL(15, 2),
    payment_terms TEXT,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Auto-Renewal
    auto_renews BOOLEAN DEFAULT FALSE,
    renewal_term_months INT,
    notice_period_days INT,

    -- File Information
    file_path VARCHAR(500),
    file_size INT,
    mime_type VARCHAR(100),
    original_filename VARCHAR(255),

    -- Signatures
    requires_signature BOOLEAN DEFAULT FALSE,
    our_signatory VARCHAR(200),
    our_signature_date DATE,
    their_signatory VARCHAR(200),
    their_signature_date DATE,
    is_fully_executed BOOLEAN DEFAULT FALSE,

    -- Ownership
    owner_department VARCHAR(100),
    owner_id INT,
    created_by INT,

    -- Related Items
    project_id INT,
    lead_id INT,
    enrollment_id INT,

    -- Compliance Link
    related_framework_id INT,

    -- Metadata
    confidentiality_level ENUM('public', 'internal', 'confidential', 'restricted') DEFAULT 'confidential',
    retention_period_years INT,
    disposal_date DATE,
    is_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (related_framework_id) REFERENCES compliance_frameworks(id) ON DELETE SET NULL,
    INDEX idx_legaldoc_type (document_type),
    INDEX idx_legaldoc_status (status),
    INDEX idx_legaldoc_expiration (expiration_date),
    INDEX idx_legaldoc_project (project_id)
);

-- -----------------------------------------------------------------------------
-- Legal Document Versions Table
-- Version history for legal documents
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_document_versions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    version_date DATE NOT NULL,
    change_description TEXT,
    file_path VARCHAR(500),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (document_id) REFERENCES legal_documents(id) ON DELETE CASCADE,
    INDEX idx_docver_document (document_id)
);

-- -----------------------------------------------------------------------------
-- Compliance Audits Table
-- Track internal and external audits
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_audits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    audit_name VARCHAR(255) NOT NULL,
    audit_type ENUM('internal', 'external', 'regulatory', 'self_assessment', 'certification') NOT NULL,
    audit_scope TEXT,
    framework_id INT,

    -- Audit Details
    auditor_name VARCHAR(200),
    auditor_organization VARCHAR(200),
    audit_lead_id INT, -- Internal audit lead

    -- Timeline
    planned_start_date DATE,
    actual_start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    report_due_date DATE,

    -- Status
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed') DEFAULT 'scheduled',

    -- Results
    overall_rating ENUM('satisfactory', 'needs_improvement', 'unsatisfactory', 'not_rated'),
    findings_count INT DEFAULT 0,
    critical_findings INT DEFAULT 0,
    high_findings INT DEFAULT 0,
    medium_findings INT DEFAULT 0,
    low_findings INT DEFAULT 0,

    -- Documentation
    audit_report_path VARCHAR(500),
    management_response TEXT,

    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id) ON DELETE SET NULL,
    INDEX idx_audit_framework (framework_id),
    INDEX idx_audit_status (status),
    INDEX idx_audit_dates (planned_start_date, planned_end_date)
);

-- -----------------------------------------------------------------------------
-- Audit Findings Table
-- Individual findings from audits
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_findings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    audit_id INT NOT NULL,
    requirement_id INT,

    -- Finding Details
    finding_code VARCHAR(50),
    finding_title VARCHAR(255) NOT NULL,
    finding_description TEXT NOT NULL,
    finding_type ENUM('observation', 'non_conformity', 'opportunity', 'strength') DEFAULT 'observation',
    severity ENUM('critical', 'high', 'medium', 'low', 'informational') DEFAULT 'medium',

    -- Root Cause
    root_cause TEXT,
    affected_area VARCHAR(200),

    -- Evidence
    evidence_description TEXT,
    evidence_file_path VARCHAR(500),

    -- Remediation
    recommended_action TEXT,
    assigned_to INT,
    due_date DATE,

    -- Status
    status ENUM('open', 'in_progress', 'remediated', 'verified', 'closed', 'accepted_risk') DEFAULT 'open',
    remediation_date DATE,
    verification_date DATE,
    verified_by INT,

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (audit_id) REFERENCES compliance_audits(id) ON DELETE CASCADE,
    FOREIGN KEY (requirement_id) REFERENCES compliance_requirements(id) ON DELETE SET NULL,
    INDEX idx_finding_audit (audit_id),
    INDEX idx_finding_status (status),
    INDEX idx_finding_severity (severity)
);

-- -----------------------------------------------------------------------------
-- Compliance Training Table
-- Track compliance-related training
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_training (
    id INT PRIMARY KEY AUTO_INCREMENT,
    training_name VARCHAR(255) NOT NULL,
    training_code VARCHAR(50),
    description TEXT,
    framework_id INT,
    training_type ENUM('online', 'classroom', 'self_study', 'workshop', 'webinar') DEFAULT 'online',
    duration_hours DECIMAL(5, 2),
    is_mandatory BOOLEAN DEFAULT FALSE,
    passing_score DECIMAL(5, 2),
    validity_period_months INT,
    content_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id) ON DELETE SET NULL,
    INDEX idx_training_framework (framework_id)
);

-- -----------------------------------------------------------------------------
-- Training Completions Table
-- Track individual training completions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training_completions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    training_id INT NOT NULL,
    user_id INT NOT NULL,
    completion_date DATE,
    expiration_date DATE,
    score DECIMAL(5, 2),
    passed BOOLEAN,
    attempts INT DEFAULT 1,
    certificate_path VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (training_id) REFERENCES compliance_training(id) ON DELETE CASCADE,
    INDEX idx_completion_training (training_id),
    INDEX idx_completion_user (user_id),
    INDEX idx_completion_expiration (expiration_date)
);

-- -----------------------------------------------------------------------------
-- Compliance Incidents Table
-- Track compliance incidents and violations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_incidents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_number VARCHAR(50) UNIQUE,
    incident_title VARCHAR(255) NOT NULL,
    incident_description TEXT NOT NULL,
    incident_type ENUM('data_breach', 'policy_violation', 'regulatory_violation', 'security_incident', 'privacy_violation', 'other') NOT NULL,
    severity ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',

    -- Discovery
    discovered_date DATETIME NOT NULL,
    discovered_by INT,
    discovery_method VARCHAR(200),

    -- Impact
    affected_systems TEXT,
    affected_data_types TEXT,
    affected_individuals_count INT,
    potential_impact TEXT,

    -- Related Items
    framework_id INT,
    project_id INT,

    -- Response
    status ENUM('reported', 'investigating', 'contained', 'remediated', 'closed') DEFAULT 'reported',
    incident_lead_id INT,
    containment_actions TEXT,
    remediation_actions TEXT,
    preventive_measures TEXT,

    -- Timeline
    contained_at DATETIME,
    remediated_at DATETIME,
    closed_at DATETIME,

    -- Reporting
    requires_notification BOOLEAN DEFAULT FALSE,
    notification_deadline DATETIME,
    notifications_sent BOOLEAN DEFAULT FALSE,
    regulatory_report_filed BOOLEAN DEFAULT FALSE,
    regulatory_report_date DATE,

    -- Documentation
    root_cause TEXT,
    lessons_learned TEXT,
    report_path VARCHAR(500),

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_incident_status (status),
    INDEX idx_incident_severity (severity),
    INDEX idx_incident_date (discovered_date)
);

-- -----------------------------------------------------------------------------
-- Policy Documents Table
-- Internal policies and procedures
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    policy_name VARCHAR(255) NOT NULL,
    policy_code VARCHAR(50) UNIQUE,
    policy_type ENUM('policy', 'procedure', 'standard', 'guideline', 'handbook') DEFAULT 'policy',
    description TEXT,
    policy_content LONGTEXT,
    version VARCHAR(20),

    -- Ownership
    owner_department VARCHAR(100),
    owner_id INT,

    -- Approval
    approved_by INT,
    approval_date DATE,

    -- Lifecycle
    effective_date DATE,
    review_date DATE,
    expiration_date DATE,
    status ENUM('draft', 'pending_approval', 'active', 'under_review', 'superseded', 'retired') DEFAULT 'draft',
    superseded_by_id INT,

    -- Related Compliance
    framework_id INT,

    -- Distribution
    audience VARCHAR(255), -- Who should read this
    acknowledgment_required BOOLEAN DEFAULT FALSE,

    -- Files
    file_path VARCHAR(500),

    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id) ON DELETE SET NULL,
    FOREIGN KEY (superseded_by_id) REFERENCES policy_documents(id),
    INDEX idx_policy_status (status),
    INDEX idx_policy_type (policy_type),
    INDEX idx_policy_review (review_date)
);

-- -----------------------------------------------------------------------------
-- Policy Acknowledgments Table
-- Track who has acknowledged policies
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_acknowledgments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    policy_id INT NOT NULL,
    user_id INT NOT NULL,
    acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,

    FOREIGN KEY (policy_id) REFERENCES policy_documents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_policy_user (policy_id, user_id),
    INDEX idx_ack_policy (policy_id),
    INDEX idx_ack_user (user_id)
);

-- -----------------------------------------------------------------------------
-- Compliance Calendar Table
-- Track compliance deadlines and recurring tasks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_calendar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT,
    event_type ENUM('deadline', 'review', 'audit', 'filing', 'renewal', 'training', 'other') DEFAULT 'deadline',
    framework_id INT,
    requirement_id INT,
    document_id INT,

    -- Schedule
    due_date DATE NOT NULL,
    reminder_days_before INT DEFAULT 30,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annually'),

    -- Status
    status ENUM('upcoming', 'in_progress', 'completed', 'overdue', 'cancelled') DEFAULT 'upcoming',
    completed_date DATE,
    completed_by INT,

    -- Assignment
    responsible_party_id INT,

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id) ON DELETE SET NULL,
    FOREIGN KEY (requirement_id) REFERENCES compliance_requirements(id) ON DELETE SET NULL,
    FOREIGN KEY (document_id) REFERENCES legal_documents(id) ON DELETE SET NULL,
    INDEX idx_calendar_due (due_date),
    INDEX idx_calendar_status (status)
);

-- -----------------------------------------------------------------------------
-- Default Data Inserts
-- -----------------------------------------------------------------------------

-- Insert common compliance frameworks
INSERT INTO compliance_frameworks (framework_name, framework_code, description, framework_type) VALUES
('General Data Protection Regulation', 'GDPR', 'EU data protection and privacy regulation', 'international'),
('California Consumer Privacy Act', 'CCPA', 'California state consumer privacy law', 'state'),
('Health Insurance Portability and Accountability Act', 'HIPAA', 'US healthcare data protection regulation', 'federal'),
('Payment Card Industry Data Security Standard', 'PCI-DSS', 'Payment card security standards', 'industry'),
('SOC 2 Type II', 'SOC2', 'Service Organization Control 2 certification', 'industry'),
('ISO 27001', 'ISO27001', 'Information security management system standard', 'international'),
('Americans with Disabilities Act', 'ADA', 'Accessibility requirements for digital services', 'federal'),
('California Business License Requirements', 'CA-BIZ', 'State of California business licensing', 'state'),
('Internal Data Handling Policy', 'INT-DATA', 'Internal company data handling procedures', 'internal'),
('Occupational Safety and Health Administration', 'OSHA', 'Workplace safety regulations', 'federal');

-- Insert sample compliance requirements for CCPA
INSERT INTO compliance_requirements (framework_id, requirement_code, requirement_title, requirement_description, requirement_category, priority) VALUES
((SELECT id FROM compliance_frameworks WHERE framework_code = 'CCPA'), 'CCPA-1', 'Privacy Notice', 'Provide consumers with a clear privacy notice at or before the point of data collection', 'Notice', 'high'),
((SELECT id FROM compliance_frameworks WHERE framework_code = 'CCPA'), 'CCPA-2', 'Right to Know', 'Allow consumers to request what personal information has been collected about them', 'Consumer Rights', 'high'),
((SELECT id FROM compliance_frameworks WHERE framework_code = 'CCPA'), 'CCPA-3', 'Right to Delete', 'Allow consumers to request deletion of their personal information', 'Consumer Rights', 'high'),
((SELECT id FROM compliance_frameworks WHERE framework_code = 'CCPA'), 'CCPA-4', 'Right to Opt-Out', 'Allow consumers to opt-out of the sale of their personal information', 'Consumer Rights', 'high'),
((SELECT id FROM compliance_frameworks WHERE framework_code = 'CCPA'), 'CCPA-5', 'Non-Discrimination', 'Not discriminate against consumers who exercise their privacy rights', 'Consumer Rights', 'medium');
