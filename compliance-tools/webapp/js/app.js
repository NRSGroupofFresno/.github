/**
 * Fresno Compliance Audit Tool
 * NRS Group of Fresno
 * Main Application JavaScript
 */

// ==========================================
// Data Store
// ==========================================

const AppData = {
    organization: {
        id: 1,
        name: "My Business",
        city: "Fresno",
        state: "CA"
    },
    complianceCategories: [],
    faqCategories: [],
    resources: [],
    deadlines: [],
    weeklyAudits: {},
    complianceStatus: {},
    currentWeek: new Date()
};

// ==========================================
// Initialize Application
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Load data
    await loadData();

    // Setup navigation
    setupNavigation();

    // Setup mobile menu
    setupMobileMenu();

    // Initialize sections
    initializeDashboard();
    initializeComplianceSection();
    initializeWeeklyAudit();
    initializeFAQSection();
    initializeResourcesSection();

    // Setup modals
    setupModals();

    // Load saved state
    loadSavedState();
}

async function loadData() {
    try {
        const response = await fetch('db/data.json');
        const data = await response.json();

        AppData.complianceCategories = data.complianceCategories || [];
        AppData.faqCategories = data.faqCategories || [];
        AppData.resources = data.resources || [];

        console.log('Data loaded successfully');
    } catch (error) {
        console.log('Using default data');
        loadDefaultData();
    }
}

function loadDefaultData() {
    // Default compliance categories
    AppData.complianceCategories = [
        {
            id: 1, name: "IRS Tax Compliance", level: "federal",
            agency: "Internal Revenue Service", website: "https://www.irs.gov",
            items: [
                {id: 101, title: "Payroll Tax Deposits", frequency: "per-schedule", description: "Federal income tax, Social Security, Medicare"},
                {id: 102, title: "Form 941 Quarterly", frequency: "quarterly", description: "Quarterly payroll tax return"},
                {id: 103, title: "Form 940 Annual", frequency: "annually", description: "Annual FUTA return"},
                {id: 104, title: "W-2 Distribution", frequency: "annually", description: "Wage statements to employees"},
                {id: 105, title: "1099-NEC Filing", frequency: "annually", description: "Non-employee compensation"}
            ]
        },
        {
            id: 2, name: "DOL Employment", level: "federal",
            agency: "Department of Labor", website: "https://www.dol.gov",
            items: [
                {id: 201, title: "Minimum Wage Compliance", frequency: "ongoing", description: "Federal minimum wage $7.25/hr"},
                {id: 202, title: "Overtime Compliance", frequency: "ongoing", description: "1.5x over 40 hours/week"},
                {id: 203, title: "Required Posters", frequency: "annually", description: "FLSA, FMLA, USERRA posters"}
            ]
        },
        {
            id: 10, name: "EDD Payroll Taxes", level: "state",
            agency: "Employment Development Department", website: "https://www.edd.ca.gov",
            items: [
                {id: 1001, title: "DE 9/DE 9C Filing", frequency: "quarterly", description: "Quarterly contribution and wage report"},
                {id: 1002, title: "New Hire Reporting", frequency: "per-hire", description: "Report within 20 days of hire"},
                {id: 1003, title: "UI/ETT/SDI Deposits", frequency: "quarterly", description: "State payroll tax deposits"}
            ]
        },
        {
            id: 14, name: "DLSE Labor Law", level: "state",
            agency: "DLSE", website: "https://www.dir.ca.gov/dlse/",
            items: [
                {id: 1401, title: "CA Minimum Wage", frequency: "ongoing", description: "$16.00/hr (2024)"},
                {id: 1402, title: "Meal Break Compliance", frequency: "ongoing", description: "30 min before 5th hour"},
                {id: 1403, title: "Rest Break Compliance", frequency: "ongoing", description: "10 min per 4 hours"},
                {id: 1404, title: "Itemized Pay Stubs", frequency: "per-payroll", description: "All required information"}
            ]
        },
        {
            id: 20, name: "Fresno Business License", level: "local",
            agency: "City of Fresno Finance", website: "https://www.fresno.gov/finance/business-license/",
            items: [
                {id: 2001, title: "Business License", frequency: "annually", description: "Required for all businesses in Fresno"},
                {id: 2002, title: "License Renewal", frequency: "annually", description: "Renew by anniversary date"}
            ]
        },
        {
            id: 22, name: "Fresno Fire", level: "local",
            agency: "Fresno Fire Department", website: "https://www.fresno.gov/fire/",
            items: [
                {id: 2201, title: "Fire Inspection", frequency: "annually", description: "Annual fire safety inspection"},
                {id: 2202, title: "Fire Extinguishers", frequency: "annually", description: "Annual maintenance/inspection"}
            ]
        }
    ];

    // Default FAQ categories
    AppData.faqCategories = [
        {
            id: 1, name: "Starting a Business", icon: "rocket",
            questions: [
                {
                    id: 101,
                    question: "What do I need to start a business in Fresno?",
                    answer: "Generally you need: 1) Choose a business structure (LLC, Corp, etc.), 2) Register with CA Secretary of State, 3) Get EIN from IRS, 4) Obtain Fresno business license, 5) Get seller's permit if selling goods."
                },
                {
                    id: 102,
                    question: "How much does it cost to start a business?",
                    answer: "Common costs: LLC filing $70, Corporation $100, Business license varies, EIN is free, Seller's permit is free, CA minimum franchise tax $800/year."
                }
            ]
        },
        {
            id: 2, name: "Employment & HR", icon: "users",
            questions: [
                {
                    id: 201,
                    question: "What is the minimum wage in California?",
                    answer: "California minimum wage for 2024 is $16.00/hour for all employers. Some industries have higher minimums. Check annually as it typically increases January 1."
                },
                {
                    id: 202,
                    question: "What breaks must I give employees?",
                    answer: "MEAL BREAKS - 30 min unpaid before 5th hour, second meal before 10th hour. REST BREAKS - 10 min paid per 4 hours worked. Penalty: 1 hour pay per missed break."
                }
            ]
        },
        {
            id: 3, name: "Taxes", icon: "calculator",
            questions: [
                {
                    id: 301,
                    question: "Do I need to collect sales tax?",
                    answer: "Generally YES if selling tangible goods in California. Get a seller's permit from CDTFA (free). Exemptions include most food for home consumption and prescription medicine."
                }
            ]
        }
    ];

    // Default resources
    AppData.resources = [
        {id: 1, name: "SCORE Fresno", category: "business", description: "Free business mentoring", url: "https://fresno.score.org", isFree: true},
        {id: 2, name: "Fresno State SBDC", category: "business", description: "Small Business Development Center", url: "https://www.fresnostate.edu/sbdc/", phone: "559-278-2066", isFree: true},
        {id: 3, name: "CA Bar Lawyer Referral", category: "legal", description: "Find an attorney", url: "https://www.calbar.ca.gov", phone: "866-442-2529", isFree: false},
        {id: 4, name: "City of Fresno Business License", category: "government", description: "Business licensing", url: "https://www.fresno.gov/finance/business-license/", phone: "559-621-6880", isFree: true},
        {id: 5, name: "IRS Small Business", category: "tax", description: "Federal tax resources", url: "https://www.irs.gov/businesses", phone: "800-829-4933", isFree: true},
        {id: 6, name: "EDD", category: "tax", description: "State employment taxes", url: "https://www.edd.ca.gov", phone: "888-745-3886", isFree: true}
    ];
}

// ==========================================
// Navigation
// ==========================================

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    // Close mobile menu
    document.querySelector('.nav').classList.remove('open');

    // Scroll to top
    window.scrollTo(0, 0);
}

function setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function() {
            nav.classList.toggle('open');
        });
    }
}

// ==========================================
// Dashboard
// ==========================================

function initializeDashboard() {
    updateStatusCards();
    renderDeadlines();
    renderActivityLog();
}

function updateStatusCards() {
    const levels = ['federal', 'state', 'local'];

    levels.forEach(level => {
        const card = document.querySelector(`.status-card.${level}`);
        if (!card) return;

        const categories = AppData.complianceCategories.filter(c => c.level === level);
        let totalItems = 0;
        let completedItems = 0;

        categories.forEach(cat => {
            if (cat.items) {
                cat.items.forEach(item => {
                    totalItems++;
                    if (AppData.complianceStatus[item.id]) {
                        completedItems++;
                    }
                });
            }
        });

        const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        // Update progress bar
        const progressFill = card.querySelector('.progress-fill');
        const progressText = card.querySelector('.progress-text');
        if (progressFill) progressFill.style.width = percentage + '%';
        if (progressText) progressText.textContent = percentage + '% Complete';

        // Update badge
        const badge = card.querySelector('.status-badge');
        if (badge) {
            badge.className = 'status-badge';
            if (percentage >= 80) {
                badge.classList.add('good');
                badge.textContent = 'Good Standing';
            } else if (percentage >= 50) {
                badge.classList.add('warning');
                badge.textContent = 'Needs Attention';
            } else {
                badge.classList.add('pending');
                badge.textContent = 'Review Needed';
            }
        }
    });
}

function renderDeadlines() {
    const container = document.getElementById('deadlines-list');
    if (!container) return;

    // Load deadlines from localStorage
    const savedDeadlines = localStorage.getItem('fresnoCompliance_deadlines');
    if (savedDeadlines) {
        AppData.deadlines = JSON.parse(savedDeadlines);
    }

    if (AppData.deadlines.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No deadlines added yet.</p>
                <button class="btn-secondary" onclick="showDeadlineModal()">Add Your First Deadline</button>
            </div>
        `;
        return;
    }

    // Sort by date
    const sortedDeadlines = [...AppData.deadlines].sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = sortedDeadlines.slice(0, 5).map(deadline => {
        const date = new Date(deadline.date);
        const today = new Date();
        const daysUntil = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

        let urgency = 'ok';
        if (daysUntil < 0) urgency = 'urgent';
        else if (daysUntil <= 7) urgency = 'soon';

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return `
            <div class="deadline-item ${urgency}">
                <div class="deadline-date">
                    <span class="day">${date.getDate()}</span>
                    <span class="month">${months[date.getMonth()]}</span>
                </div>
                <div class="deadline-info">
                    <h4>${escapeHtml(deadline.title)}</h4>
                    <p>${escapeHtml(deadline.category)} - ${escapeHtml(deadline.level)}</p>
                </div>
                <span class="deadline-badge status-badge ${urgency === 'urgent' ? 'danger' : urgency === 'soon' ? 'warning' : 'good'}">
                    ${daysUntil < 0 ? 'Overdue' : daysUntil === 0 ? 'Today' : daysUntil + ' days'}
                </span>
                <button class="btn-icon" onclick="deleteDeadline(${deadline.id})" title="Delete">&times;</button>
            </div>
        `;
    }).join('');
}

function showDeadlines() {
    showSection('dashboard');
    setTimeout(() => {
        document.querySelector('.deadlines-section')?.scrollIntoView({behavior: 'smooth'});
    }, 100);
}

function renderActivityLog() {
    const container = document.getElementById('activity-list');
    if (!container) return;

    const savedActivity = localStorage.getItem('fresnoCompliance_activity');
    let activity = savedActivity ? JSON.parse(savedActivity) : [];

    if (activity.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No recent activity. Start tracking your compliance!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = activity.slice(0, 5).map(item => `
        <div class="activity-item">
            <span>${escapeHtml(item.action)}</span>
            <small>${formatDate(item.timestamp)}</small>
        </div>
    `).join('');
}

function logActivity(action) {
    const savedActivity = localStorage.getItem('fresnoCompliance_activity');
    let activity = savedActivity ? JSON.parse(savedActivity) : [];

    activity.unshift({
        action: action,
        timestamp: new Date().toISOString()
    });

    // Keep only last 50 items
    activity = activity.slice(0, 50);

    localStorage.setItem('fresnoCompliance_activity', JSON.stringify(activity));
    renderActivityLog();
}

// ==========================================
// Compliance Section
// ==========================================

function initializeComplianceSection() {
    renderComplianceCategories();
    setupComplianceFilters();
}

function renderComplianceCategories(filter = 'all') {
    const container = document.getElementById('compliance-categories');
    if (!container) return;

    let categories = AppData.complianceCategories;

    if (filter !== 'all') {
        categories = categories.filter(cat => cat.level === filter);
    }

    container.innerHTML = categories.map(category => {
        const levelClass = category.level;
        const itemsHtml = category.items ? category.items.map(item => {
            const isChecked = AppData.complianceStatus[item.id] ? 'checked' : '';
            return `
                <div class="compliance-item">
                    <input type="checkbox" id="item-${item.id}" ${isChecked}
                           onchange="toggleComplianceItem(${item.id}, this.checked)">
                    <label for="item-${item.id}">
                        <span class="item-title">${escapeHtml(item.title)}</span>
                        <span class="item-description">${escapeHtml(item.description || '')}</span>
                    </label>
                </div>
            `;
        }).join('') : '';

        return `
            <div class="compliance-category" data-level="${category.level}">
                <div class="category-header ${levelClass}" onclick="toggleCategory(this)">
                    <div class="category-info">
                        <h4>${escapeHtml(category.name)}</h4>
                        <span>${escapeHtml(category.agency)}</span>
                    </div>
                    <div class="category-status">
                        <a href="${category.website}" target="_blank" onclick="event.stopPropagation()">Website</a>
                        <span class="category-toggle">&#9660;</span>
                    </div>
                </div>
                <div class="category-items">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }).join('');
}

function setupComplianceFilters() {
    const filterTabs = document.querySelectorAll('.filter-tabs .filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            renderComplianceCategories(filter);
        });
    });
}

function toggleCategory(header) {
    const items = header.nextElementSibling;
    const toggle = header.querySelector('.category-toggle');

    items.classList.toggle('open');
    toggle.classList.toggle('open');
}

function toggleComplianceItem(itemId, isChecked) {
    AppData.complianceStatus[itemId] = isChecked;
    saveState();
    updateStatusCards();

    // Find item name for activity log
    let itemName = '';
    AppData.complianceCategories.forEach(cat => {
        if (cat.items) {
            const item = cat.items.find(i => i.id === itemId);
            if (item) itemName = item.title;
        }
    });

    if (isChecked) {
        logActivity(`Completed: ${itemName}`);
    }
}

// ==========================================
// Weekly Audit
// ==========================================

function initializeWeeklyAudit() {
    updateWeekDisplay();
    setupWeekNavigation();
    setupTaskCheckboxes();
    loadWeeklyAuditState();
}

function updateWeekDisplay() {
    const display = document.getElementById('current-week');
    if (!display) return;

    const start = getWeekStart(AppData.currentWeek);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    display.textContent = `Week of ${start.toLocaleDateString('en-US', options)}`;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function setupWeekNavigation() {
    const prevBtn = document.getElementById('prev-week');
    const nextBtn = document.getElementById('next-week');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            AppData.currentWeek.setDate(AppData.currentWeek.getDate() - 7);
            updateWeekDisplay();
            loadWeeklyAuditState();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            AppData.currentWeek.setDate(AppData.currentWeek.getDate() + 7);
            updateWeekDisplay();
            loadWeeklyAuditState();
        });
    }
}

function setupTaskCheckboxes() {
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateWeeklySummary);
    });
}

function updateWeeklySummary() {
    const checkboxes = document.querySelectorAll('.task-checkbox');
    const total = checkboxes.length;
    const completed = document.querySelectorAll('.task-checkbox:checked').length;
    const remaining = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const completedEl = document.getElementById('tasks-completed');
    const remainingEl = document.getElementById('tasks-remaining');
    const rateEl = document.getElementById('completion-rate');

    if (completedEl) completedEl.textContent = completed;
    if (remainingEl) remainingEl.textContent = remaining;
    if (rateEl) rateEl.textContent = rate + '%';
}

function saveWeeklyAudit() {
    const weekKey = getWeekKey(AppData.currentWeek);
    const auditData = {
        tasks: {},
        notes: {}
    };

    // Save task states
    document.querySelectorAll('.day-card').forEach(dayCard => {
        const day = dayCard.getAttribute('data-day');
        const checkboxes = dayCard.querySelectorAll('.task-checkbox');
        const noteTextarea = dayCard.querySelector('textarea');

        auditData.tasks[day] = [];
        checkboxes.forEach((cb, index) => {
            auditData.tasks[day][index] = cb.checked;
        });

        if (noteTextarea) {
            auditData.notes[day] = noteTextarea.value;
        }
    });

    AppData.weeklyAudits[weekKey] = auditData;
    localStorage.setItem('fresnoCompliance_weeklyAudits', JSON.stringify(AppData.weeklyAudits));

    logActivity(`Saved weekly audit for ${weekKey}`);
    alert('Weekly audit saved successfully!');
}

function loadWeeklyAuditState() {
    const saved = localStorage.getItem('fresnoCompliance_weeklyAudits');
    if (saved) {
        AppData.weeklyAudits = JSON.parse(saved);
    }

    const weekKey = getWeekKey(AppData.currentWeek);
    const auditData = AppData.weeklyAudits[weekKey];

    // Reset all checkboxes and notes
    document.querySelectorAll('.task-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.day-notes textarea').forEach(ta => ta.value = '');

    if (auditData) {
        // Restore task states
        document.querySelectorAll('.day-card').forEach(dayCard => {
            const day = dayCard.getAttribute('data-day');
            const checkboxes = dayCard.querySelectorAll('.task-checkbox');
            const noteTextarea = dayCard.querySelector('textarea');

            if (auditData.tasks && auditData.tasks[day]) {
                checkboxes.forEach((cb, index) => {
                    cb.checked = auditData.tasks[day][index] || false;
                });
            }

            if (auditData.notes && auditData.notes[day] && noteTextarea) {
                noteTextarea.value = auditData.notes[day];
            }
        });
    }

    updateWeeklySummary();
}

function getWeekKey(date) {
    const start = getWeekStart(date);
    return start.toISOString().split('T')[0];
}

function exportWeeklyAudit() {
    const weekKey = getWeekKey(AppData.currentWeek);
    let report = `WEEKLY COMPLIANCE AUDIT REPORT\n`;
    report += `Week of: ${weekKey}\n`;
    report += `Organization: ${AppData.organization.name}\n`;
    report += `Location: ${AppData.organization.city}, ${AppData.organization.state}\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `\n${'='.repeat(50)}\n\n`;

    document.querySelectorAll('.day-card').forEach(dayCard => {
        const day = dayCard.getAttribute('data-day');
        const focus = dayCard.querySelector('.day-focus').textContent;
        const checkboxes = dayCard.querySelectorAll('.task-checkbox');
        const noteTextarea = dayCard.querySelector('textarea');

        report += `${day.toUpperCase()} - ${focus}\n`;
        report += `${'-'.repeat(30)}\n`;

        checkboxes.forEach(cb => {
            const label = cb.parentElement.querySelector('span').textContent;
            const status = cb.checked ? '[X]' : '[ ]';
            report += `${status} ${label}\n`;
        });

        if (noteTextarea && noteTextarea.value) {
            report += `\nNotes: ${noteTextarea.value}\n`;
        }

        report += `\n`;
    });

    // Summary
    const completed = document.querySelectorAll('.task-checkbox:checked').length;
    const total = document.querySelectorAll('.task-checkbox').length;

    report += `${'='.repeat(50)}\n`;
    report += `SUMMARY\n`;
    report += `Tasks Completed: ${completed}/${total} (${Math.round(completed/total*100)}%)\n`;
    report += `\n${'='.repeat(50)}\n`;
    report += `NON-ATTORNEY ADVOCACY RESOURCE\n`;
    report += `For educational purposes only. Not legal advice.\n`;

    // Download
    const blob = new Blob([report], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-audit-${weekKey}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    logActivity(`Exported weekly audit report for ${weekKey}`);
}

// ==========================================
// FAQ Section
// ==========================================

function initializeFAQSection() {
    renderFAQCategories();
    setupFAQSearch();
}

function renderFAQCategories() {
    const container = document.getElementById('faq-categories');
    if (!container) return;

    const icons = {
        'rocket': '&#128640;',
        'users': '&#128101;',
        'calculator': '&#128200;',
        'file-text': '&#128196;',
        'check-square': '&#9745;',
        'scale': '&#9878;'
    };

    container.innerHTML = AppData.faqCategories.map(category => {
        const questionsHtml = category.questions ? category.questions.map(q => `
            <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQAnswer(this)">
                    <span>${escapeHtml(q.question)}</span>
                    <span>&#9660;</span>
                </div>
                <div class="faq-answer">
                    ${escapeHtml(q.answer)}
                </div>
            </div>
        `).join('') : '';

        return `
            <div class="faq-category">
                <div class="faq-category-header" onclick="toggleFAQCategory(this)">
                    <span class="faq-icon">${icons[category.icon] || '&#10067;'}</span>
                    <h4>${escapeHtml(category.name)}</h4>
                    <span>&#9660;</span>
                </div>
                <div class="faq-questions">
                    ${questionsHtml}
                </div>
            </div>
        `;
    }).join('');
}

function toggleFAQCategory(header) {
    const questions = header.nextElementSibling;
    questions.classList.toggle('open');
}

function toggleFAQAnswer(questionEl) {
    const answer = questionEl.nextElementSibling;
    answer.classList.toggle('open');
}

function setupFAQSearch() {
    const searchInput = document.getElementById('faq-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchFAQ();
            }
        });
    }
}

function searchFAQ() {
    const searchInput = document.getElementById('faq-search');
    const resultsContainer = document.getElementById('search-results');
    const categoriesContainer = document.getElementById('faq-categories');

    if (!searchInput || !resultsContainer) return;

    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        resultsContainer.style.display = 'none';
        categoriesContainer.style.display = 'grid';
        return;
    }

    const results = [];

    AppData.faqCategories.forEach(category => {
        if (category.questions) {
            category.questions.forEach(q => {
                const matchesQuestion = q.question.toLowerCase().includes(query);
                const matchesAnswer = q.answer.toLowerCase().includes(query);
                const matchesKeywords = q.keywords && q.keywords.toLowerCase().includes(query);

                if (matchesQuestion || matchesAnswer || matchesKeywords) {
                    results.push({
                        category: category.name,
                        question: q.question,
                        answer: q.answer
                    });
                }
            });
        }
    });

    categoriesContainer.style.display = 'none';
    resultsContainer.style.display = 'block';

    const resultsList = resultsContainer.querySelector('.results-list');

    if (results.length === 0) {
        resultsList.innerHTML = `
            <div class="empty-state">
                <p>No results found for "${escapeHtml(query)}"</p>
                <p>Try different keywords or browse the categories below.</p>
                <button class="btn-secondary" onclick="clearFAQSearch()">Clear Search</button>
            </div>
        `;
    } else {
        resultsList.innerHTML = results.map(r => `
            <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQAnswer(this)">
                    <span>${escapeHtml(r.question)}</span>
                    <small>${escapeHtml(r.category)}</small>
                </div>
                <div class="faq-answer open">
                    ${escapeHtml(r.answer)}
                </div>
            </div>
        `).join('');
    }
}

function clearFAQSearch() {
    const searchInput = document.getElementById('faq-search');
    const resultsContainer = document.getElementById('search-results');
    const categoriesContainer = document.getElementById('faq-categories');

    if (searchInput) searchInput.value = '';
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (categoriesContainer) categoriesContainer.style.display = 'grid';
}

// ==========================================
// Resources Section
// ==========================================

function initializeResourcesSection() {
    renderResources();
    setupResourceFilters();
}

function renderResources(filter = 'all') {
    const container = document.getElementById('resources-grid');
    if (!container) return;

    let resources = AppData.resources;

    if (filter !== 'all') {
        resources = resources.filter(r => r.category === filter);
    }

    container.innerHTML = resources.map(resource => `
        <div class="resource-card" data-category="${resource.category}">
            <h4>${escapeHtml(resource.name)}</h4>
            <p>${escapeHtml(resource.description)}</p>
            <div class="resource-meta">
                ${resource.isFree ? '<span class="free-badge">FREE</span>' : ''}
                ${resource.phone ? `<span>&#128222; ${escapeHtml(resource.phone)}</span>` : ''}
            </div>
            <a href="${resource.url}" target="_blank">Visit Website &rarr;</a>
        </div>
    `).join('');
}

function setupResourceFilters() {
    const filterBtns = document.querySelectorAll('.resource-filter .filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            renderResources(category);
        });
    });
}

// ==========================================
// Modals
// ==========================================

function setupModals() {
    // Deadline form
    const deadlineForm = document.getElementById('deadline-form');
    if (deadlineForm) {
        deadlineForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addDeadline();
        });
    }

    // Close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

function showDeadlineModal() {
    const modal = document.getElementById('deadline-modal');
    if (modal) {
        modal.classList.add('open');
        // Set default date to today
        const dateInput = document.getElementById('deadline-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
    }
}

function addDeadline() {
    const title = document.getElementById('deadline-title').value;
    const date = document.getElementById('deadline-date').value;
    const category = document.getElementById('deadline-category').value;
    const level = document.getElementById('deadline-level').value;
    const notes = document.getElementById('deadline-notes').value;

    const newDeadline = {
        id: Date.now(),
        title,
        date,
        category,
        level,
        notes
    };

    AppData.deadlines.push(newDeadline);
    localStorage.setItem('fresnoCompliance_deadlines', JSON.stringify(AppData.deadlines));

    closeModal('deadline-modal');
    renderDeadlines();
    logActivity(`Added deadline: ${title}`);

    // Reset form
    document.getElementById('deadline-form').reset();
}

function deleteDeadline(id) {
    if (confirm('Delete this deadline?')) {
        AppData.deadlines = AppData.deadlines.filter(d => d.id !== id);
        localStorage.setItem('fresnoCompliance_deadlines', JSON.stringify(AppData.deadlines));
        renderDeadlines();
        logActivity('Deleted a deadline');
    }
}

// ==========================================
// State Management
// ==========================================

function saveState() {
    localStorage.setItem('fresnoCompliance_status', JSON.stringify(AppData.complianceStatus));
}

function loadSavedState() {
    // Load compliance status
    const savedStatus = localStorage.getItem('fresnoCompliance_status');
    if (savedStatus) {
        AppData.complianceStatus = JSON.parse(savedStatus);

        // Update checkboxes
        Object.keys(AppData.complianceStatus).forEach(itemId => {
            const checkbox = document.getElementById(`item-${itemId}`);
            if (checkbox) {
                checkbox.checked = AppData.complianceStatus[itemId];
            }
        });
    }

    // Load deadlines
    const savedDeadlines = localStorage.getItem('fresnoCompliance_deadlines');
    if (savedDeadlines) {
        AppData.deadlines = JSON.parse(savedDeadlines);
    }

    // Update displays
    updateStatusCards();
    renderDeadlines();
}

// ==========================================
// Utility Functions
// ==========================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';

    return date.toLocaleDateString();
}

// ==========================================
// Export for global access
// ==========================================

window.showSection = showSection;
window.showDeadlineModal = showDeadlineModal;
window.showDeadlines = showDeadlines;
window.closeModal = closeModal;
window.toggleCategory = toggleCategory;
window.toggleComplianceItem = toggleComplianceItem;
window.toggleFAQCategory = toggleFAQCategory;
window.toggleFAQAnswer = toggleFAQAnswer;
window.searchFAQ = searchFAQ;
window.clearFAQSearch = clearFAQSearch;
window.saveWeeklyAudit = saveWeeklyAudit;
window.exportWeeklyAudit = exportWeeklyAudit;
window.deleteDeadline = deleteDeadline;
