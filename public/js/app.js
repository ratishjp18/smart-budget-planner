// ============================================
// Budget Planning System - Enterprise UI
// ============================================

// Utility Functions
function formatCurrency(amount) {
    return '₹' + parseFloat(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-message').textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Auth
let currentUser = null;

async function checkAuth() {
    try {
        const response = await AuthAPI.checkStatus();
        if (response.isAuthenticated) {
            const userResponse = await AuthAPI.getCurrentUser();
            currentUser = userResponse.user;
            showApp();
        } else {
            showAuthScreen();
        }
    } catch (error) {
        showAuthScreen();
    }
}

function showAuthScreen() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
}

function showApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser?.fullName || 'User';
    document.getElementById('userAvatar').textContent = (currentUser?.fullName || 'U').charAt(0).toUpperCase();
    initializeApp();
}

function setupAuthHandlers() {
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await AuthAPI.login({
                username: document.getElementById('loginUsername').value,
                password: document.getElementById('loginPassword').value
            });
            currentUser = response.user;
            showToast('Login successful!');
            showApp();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await AuthAPI.register({
                fullName: document.getElementById('regFullName').value,
                email: document.getElementById('regEmail').value,
                username: document.getElementById('regUsername').value,
                password: document.getElementById('regPassword').value
            });
            currentUser = response.user;
            showToast('Registration successful!');
            showApp();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await AuthAPI.logout();
            showToast('Logged out');
            showAuthScreen();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const pages = document.querySelectorAll('.page');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            pages.forEach(page => page.classList.remove('active'));
            
            const pageId = this.getAttribute('data-page');
            document.getElementById(pageId).classList.add('active');
            document.getElementById('currentPageTitle').textContent = this.querySelector('a').textContent.trim();
            
            loadPageData(pageId);
            
            if (window.innerWidth <= 768) sidebar.classList.remove('active');
        });
    });

    menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));

    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

function loadPageData(pageId) {
    switch(pageId) {
        case 'dashboard': loadDashboard(); break;
        case 'income': loadIncomeData(); break;
        case 'expenses': loadExpenseData(); break;
        case 'budget': loadBudgetData(); break;
        case 'savings': loadSavingsData(); break;
        case 'reports': generateReport(); break;
    }
}

// Initialize
async function initializeApp() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = getCurrentMonth();
    
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;
    document.getElementById('budgetMonth').value = currentMonth;
    document.getElementById('reportMonth').value = currentMonth;
    document.getElementById('currentBudgetMonth').textContent = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    setupFormHandlers();
    setupReportHandlers();
    await loadDashboard();
}

// Dashboard
async function loadDashboard() {
    try {
        const summary = await ReportsAPI.getDashboard();
        document.getElementById('totalIncome').textContent = formatCurrency(summary.totalIncome);
        document.getElementById('totalExpenses').textContent = formatCurrency(summary.totalExpenses);
        document.getElementById('balance').textContent = formatCurrency(summary.balance);
        document.getElementById('totalSavings').textContent = formatCurrency(summary.totalSavings);

        await loadExpenseChart();
        await loadIncomeExpenseChart();
        await loadRecentTransactions();
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

async function loadRecentTransactions() {
    try {
        const transactions = await ReportsAPI.getRecentTransactions(10);
        const tbody = document.getElementById('recentTransactions');

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No transactions yet</td></tr>';
            return;
        }

        tbody.innerHTML = transactions.map(t => `
            <tr>
                <td>${formatDate(t.date)}</td>
                <td>${t.category}</td>
                <td>${t.description || '-'}</td>
                <td>${t.type === 'income' ? 'Income' : 'Expense'}</td>
                <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
                    ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Transactions error:', error);
    }
}

// Charts
let expenseChart = null;
let incomeExpenseChart = null;
let reportChart = null;

async function loadExpenseChart() {
    try {
        const data = await ReportsAPI.getExpenseDistribution();
        const ctx = document.getElementById('expenseChart').getContext('2d');
        if (expenseChart) expenseChart.destroy();

        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e'];

        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.length ? data.map(d => d.category) : ['No Data'],
                datasets: [{
                    data: data.length ? data.map(d => d.total) : [1],
                    backgroundColor: data.length ? colors.slice(0, data.length) : ['#e5e7eb'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } } }
            }
        });
    } catch (error) {
        console.error('Expense chart error:', error);
    }
}

async function loadIncomeExpenseChart() {
    try {
        const trend = await ReportsAPI.getTrend(6);
        const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
        if (incomeExpenseChart) incomeExpenseChart.destroy();

        incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: trend.map(t => t.label),
                datasets: [
                    { label: 'Income', data: trend.map(t => t.income), backgroundColor: '#10b981', borderRadius: 4 },
                    { label: 'Expenses', data: trend.map(t => t.expense), backgroundColor: '#ef4444', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } } },
                scales: { y: { beginAtZero: true, ticks: { callback: v => '₹' + v.toLocaleString() } } }
            }
        });
    } catch (error) {
        console.error('Income/Expense chart error:', error);
    }
}

// Forms
function setupFormHandlers() {
    // Income
    document.getElementById('incomeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await IncomeAPI.add({
                source: document.getElementById('incomeSource').value,
                amount: document.getElementById('incomeAmount').value,
                date: document.getElementById('incomeDate').value,
                description: document.getElementById('incomeDescription').value
            });
            e.target.reset();
            document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
            showToast('Income added!');
            await loadIncomeData();
            await loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Expense
    document.getElementById('expenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await ExpensesAPI.add({
                category: document.getElementById('expenseCategory').value,
                amount: document.getElementById('expenseAmount').value,
                date: document.getElementById('expenseDate').value,
                description: document.getElementById('expenseDescription').value
            });
            e.target.reset();
            document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
            showToast('Expense added!');
            await loadExpenseData();
            await loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Budget
    document.getElementById('budgetForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await BudgetAPI.save({
                category: document.getElementById('budgetCategory').value,
                amount: document.getElementById('budgetAmount').value,
                month: document.getElementById('budgetMonth').value
            });
            e.target.reset();
            document.getElementById('budgetMonth').value = getCurrentMonth();
            showToast('Budget goal saved!');
            await loadBudgetData();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Savings
    document.getElementById('savingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await SavingsAPI.create({
                name: document.getElementById('savingsName').value,
                targetAmount: document.getElementById('savingsTarget').value,
                deadline: document.getElementById('savingsDeadline').value
            });
            e.target.reset();
            showToast('Savings goal created!');
            await loadSavingsData();
            await loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

// Income Data
async function loadIncomeData() {
    try {
        const incomeList = await IncomeAPI.getAll();
        const tbody = document.getElementById('incomeTableBody');

        if (incomeList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No income records</td></tr>';
            return;
        }

        tbody.innerHTML = incomeList.map(i => `
            <tr>
                <td>${formatDate(i.date)}</td>
                <td>${i.source}</td>
                <td>${i.description || '-'}</td>
                <td class="amount-income">${formatCurrency(i.amount)}</td>
                <td>
                    <button class="action-btn delete" onclick="deleteIncome(${i.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast('Error loading income', 'error');
    }
}

async function deleteIncome(id) {
    if (confirm('Delete this income record?')) {
        try {
            await IncomeAPI.delete(id);
            showToast('Deleted!', 'warning');
            await loadIncomeData();
            await loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

// Expense Data
async function loadExpenseData() {
    try {
        const expenseList = await ExpensesAPI.getAll();
        const tbody = document.getElementById('expenseTableBody');

        if (expenseList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No expense records</td></tr>';
            return;
        }

        tbody.innerHTML = expenseList.map(e => `
            <tr>
                <td>${formatDate(e.date)}</td>
                <td>${e.category}</td>
                <td>${e.description || '-'}</td>
                <td class="amount-expense">${formatCurrency(e.amount)}</td>
                <td>
                    <button class="action-btn delete" onclick="deleteExpense(${e.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast('Error loading expenses', 'error');
    }
}

async function deleteExpense(id) {
    if (confirm('Delete this expense record?')) {
        try {
            await ExpensesAPI.delete(id);
            showToast('Deleted!', 'warning');
            await loadExpenseData();
            await loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

// Budget Data
async function loadBudgetData() {
    try {
        const month = getCurrentMonth();
        const budgetStatus = await BudgetAPI.getStatus(month);
        const container = document.getElementById('budgetCards');

        if (budgetStatus.length === 0) {
            container.innerHTML = '<p class="no-data">No budget goals set yet.</p>';
            return;
        }

        container.innerHTML = budgetStatus.map(b => {
            let progressClass = 'safe';
            if (b.percentage >= 90) progressClass = 'danger';
            else if (b.percentage >= 70) progressClass = 'warning';

            return `
                <div class="budget-item">
                    <div class="budget-item-header">
                        <h4>${b.category}</h4>
                        <span>Limit: ${formatCurrency(b.amount)}</span>
                    </div>
                    <div class="budget-progress">
                        <div class="budget-progress-bar ${progressClass}" style="width: ${b.percentage}%"></div>
                    </div>
                    <div class="budget-stats">
                        <span>Spent: ${formatCurrency(b.spent)}</span>
                        <span class="remaining ${b.remaining >= 0 ? 'positive' : 'negative'}">
                            ${b.remaining >= 0 ? 'Left' : 'Over'}: ${formatCurrency(Math.abs(b.remaining))}
                        </span>
                    </div>
                    <button class="btn btn-sm btn-danger" style="margin-top: 12px;" onclick="deleteBudget(${b.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
        }).join('');
    } catch (error) {
        showToast('Error loading budget', 'error');
    }
}

async function deleteBudget(id) {
    if (confirm('Delete this budget goal?')) {
        try {
            await BudgetAPI.delete(id);
            showToast('Deleted!', 'warning');
            await loadBudgetData();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

// Savings Data
async function loadSavingsData() {
    try {
        const savingsList = await SavingsAPI.getAll();
        const container = document.getElementById('savingsGoals');

        if (savingsList.length === 0) {
            container.innerHTML = '<p class="no-data">No savings goals yet.</p>';
            return;
        }

        container.innerHTML = savingsList.map(g => {
            const deadline = new Date(g.deadline);
            const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

            return `
                <div class="goal-card">
                    <h4>${g.name}</h4>
                    <div class="goal-amount">${formatCurrency(g.target_amount)}</div>
                    <div class="goal-progress">
                        <div class="goal-progress-bar" style="width: ${g.percentage || 0}%"></div>
                    </div>
                    <div class="goal-stats">
                        <span>Saved: ${formatCurrency(g.saved_amount)}</span>
                        <span>${(g.percentage || 0).toFixed(1)}%</span>
                    </div>
                    <div class="goal-deadline">
                        <i class="fas fa-calendar"></i> ${daysLeft > 0 ? daysLeft + ' days left' : 'Deadline passed'}
                    </div>
                    <div class="goal-actions">
                        <button class="add-btn" onclick="addToSavings(${g.id})">
                            <i class="fas fa-plus"></i> Add
                        </button>
                        <button class="delete-btn" onclick="deleteSavings(${g.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        showToast('Error loading savings', 'error');
    }
}

async function addToSavings(id) {
    const amount = prompt('Enter amount to add:');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        try {
            await SavingsAPI.addContribution(id, parseFloat(amount));
            showToast(`Added ${formatCurrency(amount)}!`);
            await loadSavingsData();
            await loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

async function deleteSavings(id) {
    if (confirm('Delete this savings goal?')) {
        try {
            await SavingsAPI.delete(id);
            showToast('Deleted!', 'warning');
            await loadSavingsData();
            await loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

// Reports
function setupReportHandlers() {
    document.getElementById('generateReport').addEventListener('click', generateReport);
    document.getElementById('printReport').addEventListener('click', () => window.print());
}

async function generateReport() {
    try {
        const month = document.getElementById('reportMonth').value;
        const report = await ReportsAPI.getMonthly(month);

        document.getElementById('reportIncome').textContent = formatCurrency(report.totalIncome);
        document.getElementById('reportExpenses').textContent = formatCurrency(report.totalExpenses);
        document.getElementById('reportSavings').textContent = formatCurrency(report.netSavings);
        document.getElementById('reportSavingsRate').textContent = report.savingsRate + '%';

        document.getElementById('incomeBreakdown').innerHTML = report.incomeBySource.length
            ? report.incomeBySource.map(i => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;"><span>${i.source}</span><span>${formatCurrency(i.total)}</span></div>`).join('')
            : '<p class="no-data">No income</p>';

        document.getElementById('expenseBreakdown').innerHTML = report.expenseByCategory.length
            ? report.expenseByCategory.map(e => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;"><span>${e.category}</span><span>${formatCurrency(e.total)}</span></div>`).join('')
            : '<p class="no-data">No expenses</p>';

        await loadReportChart();
    } catch (error) {
        showToast('Error generating report', 'error');
    }
}

async function loadReportChart() {
    try {
        const trend = await ReportsAPI.getTrend(6);
        const ctx = document.getElementById('reportChart').getContext('2d');
        if (reportChart) reportChart.destroy();

        reportChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trend.map(t => t.label),
                datasets: [
                    { label: 'Income', data: trend.map(t => t.income), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
                    { label: 'Expenses', data: trend.map(t => t.expense), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
                    { label: 'Savings', data: trend.map(t => t.savings), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, ticks: { callback: v => '₹' + v.toLocaleString() } } }
            }
        });
    } catch (error) {
        console.error('Report chart error:', error);
    }
}

// Global functions
window.deleteIncome = deleteIncome;
window.deleteExpense = deleteExpense;
window.deleteBudget = deleteBudget;
window.deleteSavings = deleteSavings;
window.addToSavings = addToSavings;

// Init
document.addEventListener('DOMContentLoaded', () => {
    setupAuthHandlers();
    setupNavigation();
    checkAuth();
});
