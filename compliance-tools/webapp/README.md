# Fresno Compliance Audit Tool - Web Application

**NRS Group of Fresno**
Interactive Compliance Tracking System

---

## Overview

This web application provides an interactive interface for the Fresno Compliance Audit Tool, helping businesses track federal, state, and local regulatory compliance.

## Features

### Dashboard
- Real-time compliance status overview
- Progress tracking for Federal, State (CA), and Local (Fresno) compliance
- Deadline management with reminders
- Activity logging

### Compliance Checklists
- Interactive checklists for all compliance categories
- Filter by jurisdiction (Federal, State, Local)
- Track completion status
- Links to official agency websites

### Weekly Audit Tracker
- Day-by-day compliance review schedule
- Monday: Federal focus
- Tuesday: State focus
- Wednesday: Local focus
- Thursday: Documentation
- Friday: Planning
- Export weekly reports

### Business Advocacy Q&A
- Searchable FAQ database
- Common business questions answered
- Non-attorney advocacy resources
- Professional referral links

### Resources Directory
- Government agency contacts
- Business support organizations
- Legal referral services
- Tax assistance resources

---

## Getting Started

### Option 1: Open Directly
Simply open `index.html` in a modern web browser.

### Option 2: Local Server (Recommended)
For full functionality, serve the files using a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

---

## File Structure

```
webapp/
├── index.html          # Main application page
├── css/
│   └── styles.css      # Application styles
├── js/
│   └── app.js          # Application JavaScript
├── db/
│   ├── schema.sql      # SQLite database schema
│   └── data.json       # Default data (JSON)
└── README.md           # This file
```

---

## Data Storage

The application uses browser `localStorage` to persist:
- Compliance checklist status
- Deadline entries
- Weekly audit progress
- Activity history

Data remains in your browser and is not transmitted anywhere.

### Clearing Data
To reset all data, open browser Developer Tools (F12) and run:
```javascript
localStorage.clear();
location.reload();
```

---

## Database

The `db/schema.sql` file contains a complete SQLite schema for extended use. This can be used to:
- Set up a backend database
- Import into a database management system
- Extend the application with server-side functionality

---

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

## Customization

### Adding Compliance Items
Edit `db/data.json` to add new compliance categories or items.

### Styling
Modify `css/styles.css` to change colors, fonts, or layout.

### Functionality
Extend `js/app.js` to add new features.

---

## Important Disclaimer

**NON-ATTORNEY ADVOCACY NOTICE**

This application is provided for educational and informational purposes only.

- Does NOT constitute legal advice
- Does NOT replace professional consultation
- Consult licensed attorneys, CPAs, or other professionals for specific questions

---

## Support

### Resources
- [City of Fresno](https://www.fresno.gov)
- [Fresno County](https://www.co.fresno.ca.us)
- [CA Secretary of State](https://www.sos.ca.gov)
- [IRS Small Business](https://www.irs.gov/businesses)

### Professional Help
- CA Bar Lawyer Referral: 866-442-2529
- SCORE Fresno: https://fresno.score.org
- Fresno State SBDC: 559-278-2066

---

*NRS Group of Fresno - Serving Our Community*
