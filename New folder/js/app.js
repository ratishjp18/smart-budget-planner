/* ============================================
   Budget Planning System - JavaScript
   B.Com CA Final Year Project
   ============================================ */

// ============================================
// DATA STORAGE (Using LocalStorage)
// ============================================

// Initialize data from localStorage or set defaults
let incomeData = JSON.parse(localStorage.getItem('incomeData')) || [];
let expenseData = JSON.parse(localStorage.getItem('expenseData')) || [];
let budgetGoals = JSON.parse(localStorage.getItem('budgetGoals')) || [];
let savingsGoals = JSON.parse(localStorage.getItem('savingsGoals')) || [];

// Save data to localStorage
function saveData() {
    localStorage.setItem('incomeData', JSON.stringify(incomeData));
    localStorage.setItem('expenseData', JSON.stringify(expenseData));
    localStorage.setItem('budgetGoals', JSON.stringify(budgetGoals));
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format currency
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Get current month in YYYY-MM format
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ============================================
// NAVIGATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    const pages = document.querySelectorAll('.page');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all pages
            pages.forEach(page => page.classList.remove('active'));
            // Show selected page
            const pageId = this.getAttribute('data-page');
            document.getElementById(pageId).classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Set current date
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Set default date for inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;
    document.getElementById('reportMonth').value = getCurrentMonth();
    
    // Initialize the application
    initializeApp();
});

// ============================================
// INITIALIZATION
// ============================================

function initializeApp() {
    updateDashboard();
    renderIncomeTable();
    renderExpenseTable();
    renderBudgetCards();
    renderSavingsGoals();
    initializeCharts();
    setupFormHandlers();
    setupReportHandlers();
}

// ============================================
// DASHBOARD
// ============================================

function updateDashboard() {
    const totalIncome = incomeData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const totalExpenses = expenseData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const balance = totalIncome - totalExpenses;
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + parseFloat(goal.saved || 0), 0);
    
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('balance').textContent = formatCurrency(balance);
    document.getElementById('totalSavings').textContent = formatCurrency(totalSavings);
    
    // Update recent transactions
    renderRecentTransactions();
}

function renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    
    // Combine income and expenses
    const allTransactions = [
        ...incomeData.map(item => ({ ...item, type: 'income' })),
        ...expenseData.map(item => ({ ...item, type: 'expense' }))
    ];
    
    // Sort by date (most recent first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Take only last 10
    const recentTransactions = allTransactions.slice(0, 10);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="no-data">No transactions yet. Add income or expenses to get started!</p>';
        return;
    }
    
    container.innerHTML = recentTransactions.map(trans => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${trans.type}">
                    <i class="fas fa-${trans.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${trans.type === 'income' ? trans.source : trans.category}</h4>
                    <span>${formatDate(trans.date)} ${trans.description ? '• ' + trans.description : ''}</span>
                </div>
            </div>
            <span class="transaction-amount ${trans.type}">
                ${trans.type === 'income' ? '+' : '-'}${formatCurrency(trans.amount)}
            </span>
        </div>
    `).join('');
}

// ============================================
// CHARTS
// ============================================

let expenseChart = null;
let incomeExpenseChart = null;
let reportChart = null;

function initializeCharts() {
    createExpenseChart();
    createIncomeExpenseChart();
}

function createExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    // Group expenses by category
    const expensesByCategory = {};
    expenseData.forEach(expense => {
        if (!expensesByCategory[expense.category]) {
            expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += parseFloat(expense.amount);
    });
    
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    const colors = [
        '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
        '#06d6a0', '#ffd166', '#ef476f', '#118ab2', '#073b4c'
    ];
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories.length > 0 ? categories : ['No Data'],
            datasets: [{
                data: amounts.length > 0 ? amounts : [1],
                backgroundColor: categories.length > 0 ? colors.slice(0, categories.length) : ['#e9ecef'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (categories.length === 0) return 'No expenses';
                            const value = context.raw;
                            const total = amounts.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }
    
    // Get last 6 months data
    const months = [];
    const incomeByMonth = [];
    const expenseByMonth = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        
        months.push(monthLabel);
        
        // Calculate income for this month
        const monthIncome = incomeData
            .filter(item => item.date.startsWith(monthKey))
            .reduce((sum, item) => sum + parseFloat(item.amount), 0);
        incomeByMonth.push(monthIncome);
        
        // Calculate expenses for this month
        const monthExpense = expenseData
            .filter(item => item.date.startsWith(monthKey))
            .reduce((sum, item) => sum + parseFloat(item.amount), 0);
        expenseByMonth.push(monthExpense);
    }
    
    incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeByMonth,
                    backgroundColor: 'rgba(6, 214, 160, 0.8)',
                    borderRadius: 5
                },
                {
                    label: 'Expenses',
                    data: expenseByMonth,
                    backgroundColor: 'rgba(239, 71, 111, 0.8)',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// INCOME MANAGEMENT
// ============================================

function setupFormHandlers() {
    // Income form
    document.getElementById('incomeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const income = {
            id: generateId(),
            source: document.getElementById('incomeSource').value,
            amount: document.getElementById('incomeAmount').value,
            date: document.getElementById('incomeDate').value,
            description: document.getElementById('incomeDescription').value
        };
        
        incomeData.push(income);
        saveData();
        
        this.reset();
        document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
        
        renderIncomeTable();
        updateDashboard();
        createIncomeExpenseChart();
        showToast('Income added successfully!');
    });
    
    // Expense form
    document.getElementById('expenseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const expense = {
            id: generateId(),
            category: document.getElementById('expenseCategory').value,
            amount: document.getElementById('expenseAmount').value,
            date: document.getElementById('expenseDate').value,
            description: document.getElementById('expenseDescription').value
        };
        
        expenseData.push(expense);
        saveData();
        
        this.reset();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        
        renderExpenseTable();
        updateDashboard();
        createExpenseChart();
        createIncomeExpenseChart();
        renderBudgetCards();
        showToast('Expense added successfully!');
    });
    
    // Budget form
    document.getElementById('budgetForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const category = document.getElementById('budgetCategory').value;
        const amount = document.getElementById('budgetAmount').value;
        
        // Check if budget for this category already exists
        const existingIndex = budgetGoals.findIndex(b => b.category === category);
        
        if (existingIndex !== -1) {
            budgetGoals[existingIndex].amount = amount;
        } else {
            budgetGoals.push({
                id: generateId(),
                category: category,
                amount: amount
            });
        }
        
        saveData();
        this.reset();
        renderBudgetCards();
        showToast('Budget goal saved successfully!');
    });
    
    // Savings goal form
    document.getElementById('savingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const goal = {
            id: generateId(),
            name: document.getElementById('savingsName').value,
            target: document.getElementById('savingsTarget').value,
            deadline: document.getElementById('savingsDeadline').value,
            saved: 0
        };
        
        savingsGoals.push(goal);
        saveData();
        
        this.reset();
        renderSavingsGoals();
        updateDashboard();
        showToast('Savings goal created successfully!');
    });
    
    // Add savings contribution form
    document.getElementById('addSavingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const goalId = document.getElementById('selectGoal').value;
        const amount = parseFloat(document.getElementById('savingsContribution').value);
        
        const goalIndex = savingsGoals.findIndex(g => g.id === goalId);
        if (goalIndex !== -1) {
            savingsGoals[goalIndex].saved = (parseFloat(savingsGoals[goalIndex].saved) || 0) + amount;
            saveData();
            renderSavingsGoals();
            updateDashboard();
            showToast('Savings added successfully!');
        }
        
        this.reset();
    });
}

function renderIncomeTable() {
    const tbody = document.getElementById('incomeTableBody');
    
    if (incomeData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No income records yet.</td></tr>';
        return;
    }
    
    // Sort by date (most recent first)
    const sortedIncome = [...incomeData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedIncome.map(income => `
        <tr>
            <td>${formatDate(income.date)}</td>
            <td>${income.source}</td>
            <td>${income.description || '-'}</td>
            <td style="color: var(--success-color); font-weight: 600;">${formatCurrency(income.amount)}</td>
            <td>
                <div class="action-btns">
                    <button class="edit-btn" onclick="editIncome('${income.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteIncome('${income.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteIncome(id) {
    if (confirm('Are you sure you want to delete this income record?')) {
        incomeData = incomeData.filter(item => item.id !== id);
        saveData();
        renderIncomeTable();
        updateDashboard();
        createIncomeExpenseChart();
        showToast('Income deleted successfully!', 'warning');
    }
}

function editIncome(id) {
    const income = incomeData.find(item => item.id === id);
    if (income) {
        document.getElementById('incomeSource').value = income.source;
        document.getElementById('incomeAmount').value = income.amount;
        document.getElementById('incomeDate').value = income.date;
        document.getElementById('incomeDescription').value = income.description;
        
        // Delete the old record
        incomeData = incomeData.filter(item => item.id !== id);
        saveData();
        renderIncomeTable();
        
        // Scroll to form
        document.querySelector('#income .form-section').scrollIntoView({ behavior: 'smooth' });
        showToast('Edit the form and submit to update', 'warning');
    }
}

// ============================================
// EXPENSE MANAGEMENT
// ============================================

function renderExpenseTable() {
    const tbody = document.getElementById('expenseTableBody');
    
    if (expenseData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No expense records yet.</td></tr>';
        return;
    }
    
    // Sort by date (most recent first)
    const sortedExpenses = [...expenseData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedExpenses.map(expense => `
        <tr>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.category}</td>
            <td>${expense.description || '-'}</td>
            <td style="color: var(--danger-color); font-weight: 600;">${formatCurrency(expense.amount)}</td>
            <td>
                <div class="action-btns">
                    <button class="edit-btn" onclick="editExpense('${expense.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteExpense('${expense.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense record?')) {
        expenseData = expenseData.filter(item => item.id !== id);
        saveData();
        renderExpenseTable();
        updateDashboard();
        createExpenseChart();
        createIncomeExpenseChart();
        renderBudgetCards();
        showToast('Expense deleted successfully!', 'warning');
    }
}

function editExpense(id) {
    const expense = expenseData.find(item => item.id === id);
    if (expense) {
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseDate').value = expense.date;
        document.getElementById('expenseDescription').value = expense.description;
        
        // Delete the old record
        expenseData = expenseData.filter(item => item.id !== id);
        saveData();
        renderExpenseTable();
        
        // Scroll to form
        document.querySelector('#expenses .form-section').scrollIntoView({ behavior: 'smooth' });
        showToast('Edit the form and submit to update', 'warning');
    }
}

// ============================================
// BUDGET MANAGEMENT
// ============================================

function renderBudgetCards() {
    const container = document.getElementById('budgetCards');
    
    if (budgetGoals.length === 0) {
        container.innerHTML = '<p class="no-data">No budget goals set. Create your first budget goal above!</p>';
        return;
    }
    
    // Get current month expenses by category
    const currentMonth = getCurrentMonth();
    const currentMonthExpenses = expenseData.filter(e => e.date.startsWith(currentMonth));
    
    container.innerHTML = budgetGoals.map(budget => {
        const spent = currentMonthExpenses
            .filter(e => e.category === budget.category)
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        const budgetAmount = parseFloat(budget.amount);
        const remaining = budgetAmount - spent;
        const percentage = Math.min((spent / budgetAmount) * 100, 100);
        
        let progressClass = 'safe';
        if (percentage >= 90) progressClass = 'danger';
        else if (percentage >= 70) progressClass = 'warning';
        
        return `
            <div class="budget-card">
                <div class="budget-card-header">
                    <h4>${budget.category}</h4>
                    <span class="budget-limit">Limit: ${formatCurrency(budgetAmount)}</span>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar ${progressClass}" style="width: ${percentage}%"></div>
                </div>
                <div class="budget-stats">
                    <span class="spent">Spent: ${formatCurrency(spent)}</span>
                    <span class="remaining ${remaining >= 0 ? 'positive' : 'negative'}">
                        ${remaining >= 0 ? 'Remaining' : 'Over budget'}: ${formatCurrency(Math.abs(remaining))}
                    </span>
                </div>
                <button class="btn btn-sm btn-danger" style="margin-top: 15px;" onclick="deleteBudget('${budget.id}')">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
    }).join('');
}

function deleteBudget(id) {
    if (confirm('Are you sure you want to delete this budget goal?')) {
        budgetGoals = budgetGoals.filter(b => b.id !== id);
        saveData();
        renderBudgetCards();
        showToast('Budget goal deleted!', 'warning');
    }
}

// ============================================
// SAVINGS MANAGEMENT
// ============================================

function renderSavingsGoals() {
    const container = document.getElementById('savingsGoals');
    const addSection = document.getElementById('addSavingsSection');
    const selectGoal = document.getElementById('selectGoal');
    
    if (savingsGoals.length === 0) {
        container.innerHTML = '<p class="no-data">No savings goals yet. Create your first goal above!</p>';
        addSection.style.display = 'none';
        return;
    }
    
    addSection.style.display = 'block';
    
    // Update select dropdown
    selectGoal.innerHTML = '<option value="">Select a goal</option>' +
        savingsGoals.map(goal => `<option value="${goal.id}">${goal.name}</option>`).join('');
    
    container.innerHTML = savingsGoals.map(goal => {
        const target = parseFloat(goal.target);
        const saved = parseFloat(goal.saved) || 0;
        const percentage = Math.min((saved / target) * 100, 100);
        const remaining = target - saved;
        
        // Calculate days remaining
        const deadline = new Date(goal.deadline);
        const today = new Date();
        const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="goal-card">
                <h4>${goal.name}</h4>
                <div class="goal-target">${formatCurrency(target)}</div>
                <div class="goal-progress">
                    <div class="goal-progress-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="goal-stats">
                    <span>Saved: ${formatCurrency(saved)}</span>
                    <span>${percentage.toFixed(1)}% complete</span>
                </div>
                <div class="goal-deadline">
                    <i class="fas fa-calendar"></i> 
                    ${daysRemaining > 0 ? daysRemaining + ' days remaining' : 'Deadline passed'}
                    <br>
                    <small>Target: ${formatDate(goal.deadline)}</small>
                </div>
                <div class="goal-actions">
                    <button class="add-btn" onclick="quickAddSavings('${goal.id}')">
                        <i class="fas fa-plus"></i> Add Funds
                    </button>
                    <button class="delete-btn" onclick="deleteSavingsGoal('${goal.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function quickAddSavings(goalId) {
    const amount = prompt('Enter amount to add:');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        const goalIndex = savingsGoals.findIndex(g => g.id === goalId);
        if (goalIndex !== -1) {
            savingsGoals[goalIndex].saved = (parseFloat(savingsGoals[goalIndex].saved) || 0) + parseFloat(amount);
            saveData();
            renderSavingsGoals();
            updateDashboard();
            showToast(`Added ${formatCurrency(amount)} to savings!`);
        }
    }
}

function deleteSavingsGoal(id) {
    if (confirm('Are you sure you want to delete this savings goal?')) {
        savingsGoals = savingsGoals.filter(g => g.id !== id);
        saveData();
        renderSavingsGoals();
        updateDashboard();
        showToast('Savings goal deleted!', 'warning');
    }
}

// ============================================
// REPORTS
// ============================================

function setupReportHandlers() {
    document.getElementById('generateReport').addEventListener('click', generateReport);
    document.getElementById('printReport').addEventListener('click', function() {
        window.print();
    });
    
    // Generate initial report
    generateReport();
}

function generateReport() {
    const selectedMonth = document.getElementById('reportMonth').value;
    
    // Filter data for selected month
    const monthIncome = incomeData.filter(i => i.date.startsWith(selectedMonth));
    const monthExpenses = expenseData.filter(e => e.date.startsWith(selectedMonth));
    
    // Calculate totals
    const totalIncome = monthIncome.reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;
    
    // Update summary
    document.getElementById('reportIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('reportExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('reportSavings').textContent = formatCurrency(netSavings);
    document.getElementById('reportSavingsRate').textContent = savingsRate + '%';
    
    // Income breakdown
    const incomeBySource = {};
    monthIncome.forEach(i => {
        if (!incomeBySource[i.source]) incomeBySource[i.source] = 0;
        incomeBySource[i.source] += parseFloat(i.amount);
    });
    
    document.getElementById('incomeBreakdown').innerHTML = Object.keys(incomeBySource).length > 0
        ? Object.entries(incomeBySource).map(([source, amount]) => `
            <div class="breakdown-item">
                <span>${source}</span>
                <span>${formatCurrency(amount)}</span>
            </div>
        `).join('')
        : '<p class="no-data">No income for this month</p>';
    
    // Expense breakdown
    const expenseByCategory = {};
    monthExpenses.forEach(e => {
        if (!expenseByCategory[e.category]) expenseByCategory[e.category] = 0;
        expenseByCategory[e.category] += parseFloat(e.amount);
    });
    
    document.getElementById('expenseBreakdown').innerHTML = Object.keys(expenseByCategory).length > 0
        ? Object.entries(expenseByCategory).map(([category, amount]) => `
            <div class="breakdown-item">
                <span>${category}</span>
                <span>${formatCurrency(amount)}</span>
            </div>
        `).join('')
        : '<p class="no-data">No expenses for this month</p>';
    
    // Update report chart
    createReportChart(selectedMonth);
}

function createReportChart(selectedMonth) {
    const ctx = document.getElementById('reportChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (reportChart) {
        reportChart.destroy();
    }
    
    // Get data for 6 months ending with selected month
    const [year, month] = selectedMonth.split('-').map(Number);
    const months = [];
    const incomeByMonth = [];
    const expenseByMonth = [];
    const savingsByMonth = [];
    
    for (let i = 5; i >= 0; i--) {
        let m = month - i;
        let y = year;
        while (m < 1) {
            m += 12;
            y--;
        }
        
        const monthKey = `${y}-${String(m).padStart(2, '0')}`;
        const date = new Date(y, m - 1, 1);
        const monthLabel = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        
        months.push(monthLabel);
        
        const monthIncome = incomeData
            .filter(item => item.date.startsWith(monthKey))
            .reduce((sum, item) => sum + parseFloat(item.amount), 0);
        incomeByMonth.push(monthIncome);
        
        const monthExpense = expenseData
            .filter(item => item.date.startsWith(monthKey))
            .reduce((sum, item) => sum + parseFloat(item.amount), 0);
        expenseByMonth.push(monthExpense);
        
        savingsByMonth.push(monthIncome - monthExpense);
    }
    
    reportChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeByMonth,
                    borderColor: '#06d6a0',
                    backgroundColor: 'rgba(6, 214, 160, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseByMonth,
                    borderColor: '#ef476f',
                    backgroundColor: 'rgba(239, 71, 111, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Net Savings',
                    data: savingsByMonth,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// DATA EXPORT/IMPORT (Bonus Feature)
// ============================================

function exportData() {
    const data = {
        incomeData,
        expenseData,
        budgetGoals,
        savingsGoals,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.incomeData) incomeData = data.incomeData;
            if (data.expenseData) expenseData = data.expenseData;
            if (data.budgetGoals) budgetGoals = data.budgetGoals;
            if (data.savingsGoals) savingsGoals = data.savingsGoals;
            
            saveData();
            initializeApp();
            showToast('Data imported successfully!');
        } catch (error) {
            showToast('Error importing data. Invalid file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// Clear all data (for testing)
function clearAllData() {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
        incomeData = [];
        expenseData = [];
        budgetGoals = [];
        savingsGoals = [];
        saveData();
        initializeApp();
        showToast('All data cleared!', 'warning');
    }
}

// Make functions available globally
window.deleteIncome = deleteIncome;
window.editIncome = editIncome;
window.deleteExpense = deleteExpense;
window.editExpense = editExpense;
window.deleteBudget = deleteBudget;
window.deleteSavingsGoal = deleteSavingsGoal;
window.quickAddSavings = quickAddSavings;
window.exportData = exportData;
window.importData = importData;
window.clearAllData = clearAllData;
