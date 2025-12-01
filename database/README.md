# NRS Group of Fresno - Database Schema

This directory contains the SQL database schemas for the NRS Group management system, covering lead management, project tracking, and legal compliance.

## Schema Overview

### 000_users_core.sql - Core System Tables
Foundation tables for user management, authentication, and system configuration.

| Table | Description |
|-------|-------------|
| `users` | User accounts and profiles |
| `roles` | System roles (Admin, Manager, etc.) |
| `permissions` | Granular permission definitions |
| `role_permissions` | Role to permission mappings |
| `user_roles` | User to role assignments |
| `audit_log` | System-wide audit trail |
| `user_sessions` | Active session management |
| `system_settings` | Application configuration |
| `notifications` | User notifications |
| `file_uploads` | File upload tracking |

### 001_leads_enrollments.sql - Lead Management
Comprehensive lead tracking and enrollment management system.

| Table | Description |
|-------|-------------|
| `lead_sources` | Lead origin tracking (website, referral, etc.) |
| `lead_statuses` | Lead lifecycle stages |
| `leads` | Core lead information |
| `lead_activities` | Lead interaction history |
| `enrollments` | Lead conversion to customer |
| `enrollment_documents` | Required documents for enrollment |
| `lead_communications` | Email, SMS, call logs |
| `lead_tags` | Flexible tagging system |
| `lead_tag_assignments` | Tag to lead mappings |

### 002_projects.sql - Project Management
Full project lifecycle tracking.

| Table | Description |
|-------|-------------|
| `project_categories` | Project type classifications |
| `projects` | Core project information |
| `project_phases` | Major project phases |
| `project_milestones` | Key milestone tracking |
| `project_tasks` | Individual task management |
| `project_team_members` | Team assignments |
| `project_time_entries` | Time tracking |
| `project_comments` | Discussion threads |
| `project_documents` | Project documentation |
| `project_change_log` | Change audit trail |
| `project_risks` | Risk identification and mitigation |

### 003_legal_compliance.sql - Legal & Compliance
Regulatory compliance and legal document management.

| Table | Description |
|-------|-------------|
| `compliance_frameworks` | Regulatory frameworks (CCPA, GDPR, etc.) |
| `compliance_requirements` | Specific compliance requirements |
| `compliance_status` | Requirement compliance tracking |
| `legal_documents` | Contracts, agreements, policies |
| `legal_document_versions` | Document version history |
| `compliance_audits` | Internal/external audit tracking |
| `audit_findings` | Audit finding management |
| `compliance_training` | Required training courses |
| `training_completions` | Training completion records |
| `compliance_incidents` | Incident reporting and tracking |
| `policy_documents` | Internal policies and procedures |
| `policy_acknowledgments` | Policy acceptance tracking |
| `compliance_calendar` | Compliance deadline tracking |

## Installation

Run the schemas in numerical order:

```bash
mysql -u username -p database_name < schemas/000_users_core.sql
mysql -u username -p database_name < schemas/001_leads_enrollments.sql
mysql -u username -p database_name < schemas/002_projects.sql
mysql -u username -p database_name < schemas/003_legal_compliance.sql
```

Or as a single combined execution:

```bash
cat schemas/*.sql | mysql -u username -p database_name
```

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USERS & AUTH                               │
│  users ─┬─► roles ─► permissions                                    │
│         └─► audit_log                                                │
└─────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         LEADS & ENROLLMENTS                          │
│  lead_sources ─► leads ─┬─► lead_activities                         │
│  lead_statuses ────────►│   ├─► lead_communications                 │
│                         │   ├─► lead_tags                           │
│                         │   └─► enrollments ─► enrollment_documents │
└─────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            PROJECTS                                  │
│  project_categories ─► projects ─┬─► project_phases                 │
│                                  ├─► project_milestones             │
│                                  ├─► project_tasks                  │
│                                  ├─► project_team_members           │
│                                  ├─► project_time_entries           │
│                                  ├─► project_documents              │
│                                  └─► project_risks                  │
└─────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        LEGAL & COMPLIANCE                            │
│  compliance_frameworks ─┬─► compliance_requirements                 │
│                         │   └─► compliance_status                   │
│                         ├─► compliance_audits ─► audit_findings     │
│                         ├─► compliance_training ─► completions      │
│                         └─► compliance_incidents                    │
│                                                                      │
│  legal_documents ─► legal_document_versions                         │
│  policy_documents ─► policy_acknowledgments                         │
│  compliance_calendar                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Features

### Lead Management
- Complete lead lifecycle from capture to conversion
- Multi-channel communication tracking
- Lead scoring and prioritization
- Marketing consent management (CCPA/GDPR compliant)
- UTM tracking for marketing attribution

### Project Management
- Full project lifecycle management
- Phase and milestone tracking
- Task hierarchy with subtasks
- Time tracking and billing
- Risk management
- Change log for audit trails

### Legal & Compliance
- Multi-framework compliance tracking
- Audit management with findings
- Legal document versioning
- Policy management with acknowledgments
- Training and certification tracking
- Incident response management
- Compliance calendar and reminders

## Default Data

Each schema includes sensible default data:
- **Lead Statuses**: New, Contacted, Qualified, Proposal, Negotiation, Won, Lost, etc.
- **Lead Sources**: Website, Phone, Referral, Google Ads, Facebook, Trade Show, etc.
- **Project Categories**: Web Development, Mobile, API, Data Analytics, etc.
- **Compliance Frameworks**: GDPR, CCPA, HIPAA, PCI-DSS, SOC 2, ISO 27001, etc.
- **User Roles**: Administrator, Manager, Lead Manager, Project Manager, Compliance Officer, etc.

## Notes

- All tables use `InnoDB` engine for transaction support
- Foreign key constraints maintain referential integrity
- Indexes are created on frequently queried columns
- Timestamps use `CURRENT_TIMESTAMP` for automatic tracking
- JSON columns available for flexible metadata storage
