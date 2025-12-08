-- =============================================================================
-- LEADS AND ENROLLMENTS DATABASE SCHEMA
-- NRS Group of Fresno - Lead Management System
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Lead Sources Table
-- Tracks where leads originate from (website, referral, advertising, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_sources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    source_name VARCHAR(100) NOT NULL,
    source_type ENUM('online', 'offline', 'referral', 'advertising', 'event', 'other') NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Lead Statuses Table
-- Defines the lifecycle stages of a lead
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    status_order INT NOT NULL,
    description TEXT,
    color_code VARCHAR(7), -- Hex color for UI display
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Leads Table
-- Core table for storing lead information
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id INT PRIMARY KEY AUTO_INCREMENT,

    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),

    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',

    -- Company Information (if B2B)
    company_name VARCHAR(255),
    job_title VARCHAR(100),

    -- Lead Classification
    lead_source_id INT,
    lead_status_id INT,
    lead_score INT DEFAULT 0,
    lead_priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    lead_type ENUM('individual', 'business', 'organization') DEFAULT 'individual',

    -- Assignment
    assigned_to INT, -- References users table
    assigned_at TIMESTAMP,

    -- Interest & Notes
    interested_services TEXT,
    notes TEXT,

    -- Communication Preferences
    preferred_contact_method ENUM('email', 'phone', 'text', 'mail') DEFAULT 'email',
    best_time_to_contact VARCHAR(100),
    do_not_contact BOOLEAN DEFAULT FALSE,

    -- Marketing Consent
    email_opt_in BOOLEAN DEFAULT FALSE,
    sms_opt_in BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP,
    consent_ip_address VARCHAR(45),

    -- Tracking
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    referral_code VARCHAR(50),

    -- Metadata
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of_id INT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (lead_source_id) REFERENCES lead_sources(id),
    FOREIGN KEY (lead_status_id) REFERENCES lead_statuses(id),
    FOREIGN KEY (duplicate_of_id) REFERENCES leads(id),

    -- Indexes
    INDEX idx_lead_email (email),
    INDEX idx_lead_phone (phone),
    INDEX idx_lead_status (lead_status_id),
    INDEX idx_lead_source (lead_source_id),
    INDEX idx_lead_assigned (assigned_to),
    INDEX idx_lead_created (created_at)
);

-- -----------------------------------------------------------------------------
-- Lead Activities Table
-- Tracks all interactions and activities related to a lead
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    activity_type ENUM('call', 'email', 'meeting', 'note', 'task', 'status_change', 'document', 'other') NOT NULL,
    activity_subject VARCHAR(255),
    activity_description TEXT,
    activity_outcome VARCHAR(255),
    performed_by INT, -- References users table
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INT,
    is_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_activity_lead (lead_id),
    INDEX idx_activity_date (activity_date)
);

-- -----------------------------------------------------------------------------
-- Enrollments Table
-- Tracks enrollment status when leads convert to customers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,

    -- Enrollment Details
    enrollment_number VARCHAR(50) UNIQUE,
    enrollment_date DATE NOT NULL,
    enrollment_type VARCHAR(100),

    -- Program/Service Information
    program_id INT, -- References projects/programs table
    service_type VARCHAR(100),

    -- Status
    enrollment_status ENUM('pending', 'active', 'on_hold', 'completed', 'cancelled', 'withdrawn') DEFAULT 'pending',
    status_reason TEXT,
    status_changed_at TIMESTAMP,

    -- Financial
    enrollment_fee DECIMAL(10, 2),
    payment_status ENUM('pending', 'partial', 'paid', 'refunded', 'waived') DEFAULT 'pending',
    payment_method VARCHAR(50),

    -- Dates
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,

    -- Documents
    contract_signed BOOLEAN DEFAULT FALSE,
    contract_signed_date DATE,
    documents_submitted BOOLEAN DEFAULT FALSE,

    -- Processed By
    processed_by INT, -- References users table
    approved_by INT, -- References users table
    approved_at TIMESTAMP,

    -- Notes
    special_requirements TEXT,
    internal_notes TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (lead_id) REFERENCES leads(id),
    INDEX idx_enrollment_lead (lead_id),
    INDEX idx_enrollment_status (enrollment_status),
    INDEX idx_enrollment_date (enrollment_date)
);

-- -----------------------------------------------------------------------------
-- Enrollment Documents Table
-- Tracks documents associated with enrollments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollment_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_path VARCHAR(500),
    file_size INT,
    mime_type VARCHAR(100),
    is_required BOOLEAN DEFAULT FALSE,
    is_received BOOLEAN DEFAULT FALSE,
    received_date DATE,
    verified_by INT,
    verified_at TIMESTAMP,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    INDEX idx_doc_enrollment (enrollment_id)
);

-- -----------------------------------------------------------------------------
-- Lead Communications Log
-- Tracks all communications sent to/from leads
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_communications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    communication_type ENUM('email', 'sms', 'phone', 'mail', 'in_person') NOT NULL,
    direction ENUM('inbound', 'outbound') NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    sent_by INT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMP,
    opened BOOLEAN DEFAULT FALSE,
    opened_at TIMESTAMP,
    clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMP,
    bounced BOOLEAN DEFAULT FALSE,
    bounce_reason VARCHAR(255),
    unsubscribed BOOLEAN DEFAULT FALSE,
    external_id VARCHAR(255), -- For email service provider tracking

    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_comm_lead (lead_id),
    INDEX idx_comm_sent (sent_at)
);

-- -----------------------------------------------------------------------------
-- Lead Tags Table
-- Flexible tagging system for leads
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) NOT NULL UNIQUE,
    tag_color VARCHAR(7),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lead_tag_assignments (
    lead_id INT NOT NULL,
    tag_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,

    PRIMARY KEY (lead_id, tag_id),
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES lead_tags(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Default Data Inserts
-- -----------------------------------------------------------------------------

-- Insert default lead statuses
INSERT INTO lead_statuses (status_name, status_order, description, color_code) VALUES
('New', 1, 'Newly captured lead, not yet contacted', '#3498db'),
('Contacted', 2, 'Initial contact has been made', '#9b59b6'),
('Qualified', 3, 'Lead has been qualified as a potential customer', '#1abc9c'),
('Proposal', 4, 'Proposal or quote has been sent', '#f39c12'),
('Negotiation', 5, 'In active negotiation', '#e67e22'),
('Won', 6, 'Successfully converted to customer', '#27ae60'),
('Lost', 7, 'Lead did not convert', '#e74c3c'),
('On Hold', 8, 'Lead temporarily on hold', '#95a5a6'),
('Disqualified', 9, 'Lead does not meet criteria', '#7f8c8d');

-- Insert default lead sources
INSERT INTO lead_sources (source_name, source_type, description) VALUES
('Website Form', 'online', 'Lead captured through website contact form'),
('Phone Call', 'offline', 'Direct phone inquiry'),
('Referral', 'referral', 'Referred by existing customer or partner'),
('Google Ads', 'advertising', 'Google advertising campaign'),
('Facebook Ads', 'advertising', 'Facebook/Meta advertising campaign'),
('Trade Show', 'event', 'Lead captured at trade show or event'),
('Walk-in', 'offline', 'Walk-in customer'),
('Email Campaign', 'online', 'Marketing email campaign response'),
('LinkedIn', 'online', 'LinkedIn platform lead');
