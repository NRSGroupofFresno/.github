# GitHub Projects Compliance Checklist

> **NRSGroupofFresno - Virtual Enterprises**
> Prioritized compliance requirements for all GitHub projects

---

## Priority Legend

| Priority | Description | Timeline |
|----------|-------------|----------|
| **CRITICAL** | Must be implemented immediately - Security/Legal requirements | Immediate |
| **HIGH** | Should be implemented soon - Core functionality | Next Sprint |
| **MEDIUM** | Important for quality - Best practices | Within Month |
| **LOW** | Nice to have - Enhancements | As Resources Allow |

---

## CRITICAL Priority Items (Must Comply First)

### Security Requirements

- [ ] **Branch Protection Rules Enabled**
  - Require pull request reviews before merging
  - Require status checks to pass before merging
  - Require signed commits (if applicable)
  - Do not allow force pushes to main/master branch

- [ ] **No Secrets in Code**
  - No API keys, passwords, or tokens committed
  - GitHub Secrets enabled for sensitive data
  - `.gitignore` properly configured
  - Secret scanning alerts enabled

- [ ] **Dependabot Security Alerts Enabled**
  - Automated security vulnerability scanning
  - Dependabot alerts configured
  - Security advisories reviewed

- [ ] **Access Control Configured**
  - Appropriate team permissions set
  - No unnecessary admin access
  - Two-factor authentication (2FA) enforced for all members

### Legal/Compliance

- [ ] **LICENSE File Present**
  - Appropriate open source license selected (if public)
  - Proprietary license for private projects
  - License compatible with dependencies

- [ ] **SECURITY.md File Present**
  - Security vulnerability reporting process defined
  - Contact information for security issues
  - Disclosure timeline documented

---

## HIGH Priority Items

### Repository Essentials

- [ ] **README.md Complete**
  - Project description and purpose
  - Installation/setup instructions
  - Usage examples
  - Contact/support information

- [ ] **CODEOWNERS File Configured**
  - Define code owners for critical files/directories
  - Ensure reviews from appropriate team members
  - Location: `.github/CODEOWNERS`

- [ ] **Issue Templates Created**
  - Bug report template
  - Feature request template
  - Located in `.github/ISSUE_TEMPLATE/`

- [ ] **Pull Request Template Created**
  - Checklist for PR requirements
  - Testing verification
  - Located in `.github/PULL_REQUEST_TEMPLATE.md`

### Code Quality

- [ ] **CI/CD Pipeline Configured**
  - GitHub Actions workflows defined
  - Automated testing on pull requests
  - Build verification on push

- [ ] **Code Review Required**
  - Minimum 1 reviewer for all PRs
  - Review from code owner required
  - No self-merging for critical branches

---

## MEDIUM Priority Items

### Documentation

- [ ] **CONTRIBUTING.md Present**
  - Contribution guidelines
  - Code style guidelines
  - Development setup instructions
  - PR process documentation

- [ ] **CHANGELOG.md Maintained**
  - Version history documented
  - Breaking changes highlighted
  - Release notes included

- [ ] **API Documentation (if applicable)**
  - Endpoint documentation
  - Request/response examples
  - Authentication requirements

### Workflow Standards

- [ ] **Consistent Branching Strategy**
  - Defined branch naming convention
  - Main/develop/feature branch model
  - Release branch process

- [ ] **Commit Message Standards**
  - Conventional commits format
  - Clear, descriptive messages
  - Reference issues when applicable

- [ ] **Automated Linting/Formatting**
  - Pre-commit hooks configured
  - Linting in CI pipeline
  - Consistent code formatting

---

## LOW Priority Items

### Enhancements

- [ ] **GitHub Pages/Wiki (if applicable)**
  - Project documentation site
  - Wiki for extended documentation

- [ ] **Project Boards Configured**
  - Issue tracking organized
  - Sprint/milestone planning
  - Progress visibility

- [ ] **Release Automation**
  - Semantic versioning
  - Automated release notes
  - Package publishing workflow

- [ ] **Code Coverage Reporting**
  - Coverage badges in README
  - Minimum coverage thresholds
  - Coverage trend tracking

- [ ] **Community Health Files**
  - CODE_OF_CONDUCT.md
  - SUPPORT.md
  - FUNDING.yml (if applicable)

---

## Compliance Tracking Matrix

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security | 4 | 0 | 0 | 0 | 4 |
| Legal | 2 | 0 | 0 | 0 | 2 |
| Repository Essentials | 0 | 4 | 0 | 0 | 4 |
| Code Quality | 0 | 2 | 0 | 0 | 2 |
| Documentation | 0 | 0 | 3 | 0 | 3 |
| Workflow | 0 | 0 | 3 | 0 | 3 |
| Enhancements | 0 | 0 | 0 | 5 | 5 |
| **TOTAL** | **6** | **6** | **6** | **5** | **23** |

---

## Implementation Order (Recommended)

### Phase 1: Foundation (Critical)
1. Enable branch protection on main/master
2. Set up secret scanning and remove any exposed secrets
3. Add LICENSE file
4. Add SECURITY.md file
5. Enable Dependabot alerts
6. Configure access controls and 2FA

### Phase 2: Core Structure (High)
1. Complete README.md documentation
2. Create CODEOWNERS file
3. Set up issue and PR templates
4. Configure CI/CD pipeline
5. Enforce code review requirements

### Phase 3: Quality & Standards (Medium)
1. Add CONTRIBUTING.md
2. Start maintaining CHANGELOG.md
3. Establish branching strategy
4. Implement commit message standards
5. Add automated linting

### Phase 4: Polish (Low)
1. Set up project boards
2. Configure GitHub Pages/Wiki
3. Add code coverage reporting
4. Create community health files
5. Automate release process

---

## Quick Reference Templates

### Minimum SECURITY.md Template
```markdown
# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities to: [security@yourorg.com]

Do NOT create public GitHub issues for security vulnerabilities.
```

### Minimum CODEOWNERS Template
```
# Default owners for everything
* @NRSGroupofFresno/maintainers

# Critical files need admin review
/.github/ @NRSGroupofFresno/admins
```

---

## Review Schedule

- **Weekly**: Check for new Dependabot alerts
- **Monthly**: Review access controls and permissions
- **Quarterly**: Full compliance audit against this checklist
- **Annually**: Review and update this checklist

---

*Last Updated: 2024*
*Maintainer: NRSGroupofFresno Organization*
