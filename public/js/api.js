// ============================================
// API Service - Handles all server communication
// Budget Planning System
// ============================================

const API_BASE_URL = '/api';

// ============================================
// API HELPER FUNCTIONS
// ============================================

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
    };

    const config = { ...defaultOptions, ...options };

    try {
        showLoading();
        const response = await fetch(url, config);
        const data = await response.json();
        hideLoading();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        hideLoading();
        throw error;
    }
}

// ============================================
// AUTHENTICATION API
// ============================================

const AuthAPI = {
    // Register new user
    register: async (userData) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    // Login user
    login: async (credentials) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    // Logout user
    logout: async () => {
        return apiRequest('/auth/logout', {
            method: 'POST',
        });
    },

    // Get current user
    getCurrentUser: async () => {
        return apiRequest('/auth/me');
    },

    // Check auth status
    checkStatus: async () => {
        return apiRequest('/auth/status');
    },
};

// ============================================
// INCOME API
// ============================================

const IncomeAPI = {
    // Get all income
    getAll: async () => {
        return apiRequest('/income');
    },

    // Get income by month
    getByMonth: async (month) => {
        return apiRequest(`/income/month/${month}`);
    },

    // Get single income
    getById: async (id) => {
        return apiRequest(`/income/${id}`);
    },

    // Add income
    add: async (incomeData) => {
        return apiRequest('/income', {
            method: 'POST',
            body: JSON.stringify(incomeData),
        });
    },

    // Update income
    update: async (id, incomeData) => {
        return apiRequest(`/income/${id}`, {
            method: 'PUT',
            body: JSON.stringify(incomeData),
        });
    },

    // Delete income
    delete: async (id) => {
        return apiRequest(`/income/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// EXPENSES API
// ============================================

const ExpensesAPI = {
    // Get all expenses
    getAll: async () => {
        return apiRequest('/expenses');
    },

    // Get expenses by month
    getByMonth: async (month) => {
        return apiRequest(`/expenses/month/${month}`);
    },

    // Get expenses by category
    getByCategory: async (category) => {
        return apiRequest(`/expenses/category/${category}`);
    },

    // Get single expense
    getById: async (id) => {
        return apiRequest(`/expenses/${id}`);
    },

    // Add expense
    add: async (expenseData) => {
        return apiRequest('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData),
        });
    },

    // Update expense
    update: async (id, expenseData) => {
        return apiRequest(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(expenseData),
        });
    },

    // Delete expense
    delete: async (id) => {
        return apiRequest(`/expenses/${id}`, {
            method: 'DELETE',
        });
    },

    // Get summary by category
    getSummaryByCategory: async (month = null) => {
        const url = month ? `/expenses/summary/by-category?month=${month}` : '/expenses/summary/by-category';
        return apiRequest(url);
    },
};

// ============================================
// BUDGET API
// ============================================

const BudgetAPI = {
    // Get all budget goals
    getAll: async () => {
        return apiRequest('/budget');
    },

    // Get budget goals by month
    getByMonth: async (month) => {
        return apiRequest(`/budget/month/${month}`);
    },

    // Get budget status with spending
    getStatus: async (month) => {
        return apiRequest(`/budget/status/${month}`);
    },

    // Add/Update budget goal
    save: async (budgetData) => {
        return apiRequest('/budget', {
            method: 'POST',
            body: JSON.stringify(budgetData),
        });
    },

    // Update budget goal
    update: async (id, budgetData) => {
        return apiRequest(`/budget/${id}`, {
            method: 'PUT',
            body: JSON.stringify(budgetData),
        });
    },

    // Delete budget goal
    delete: async (id) => {
        return apiRequest(`/budget/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// SAVINGS API
// ============================================

const SavingsAPI = {
    // Get all savings goals
    getAll: async () => {
        return apiRequest('/savings');
    },

    // Get single savings goal
    getById: async (id) => {
        return apiRequest(`/savings/${id}`);
    },

    // Create savings goal
    create: async (savingsData) => {
        return apiRequest('/savings', {
            method: 'POST',
            body: JSON.stringify(savingsData),
        });
    },

    // Add contribution to savings
    addContribution: async (id, amount) => {
        return apiRequest(`/savings/${id}/contribute`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    },

    // Update savings goal
    update: async (id, savingsData) => {
        return apiRequest(`/savings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(savingsData),
        });
    },

    // Delete savings goal
    delete: async (id) => {
        return apiRequest(`/savings/${id}`, {
            method: 'DELETE',
        });
    },

    // Get transactions for a savings goal
    getTransactions: async (id) => {
        return apiRequest(`/savings/${id}/transactions`);
    },
};

// ============================================
// REPORTS API
// ============================================

const ReportsAPI = {
    // Get dashboard summary
    getDashboard: async () => {
        return apiRequest('/reports/dashboard');
    },

    // Get monthly report
    getMonthly: async (month) => {
        return apiRequest(`/reports/monthly/${month}`);
    },

    // Get trend data
    getTrend: async (months = 6) => {
        return apiRequest(`/reports/trend/${months}`);
    },

    // Get expense distribution
    getExpenseDistribution: async (month = null) => {
        const url = month ? `/reports/expense-distribution?month=${month}` : '/reports/expense-distribution';
        return apiRequest(url);
    },

    // Get recent transactions
    getRecentTransactions: async (limit = 10) => {
        return apiRequest(`/reports/recent-transactions?limit=${limit}`);
    },

    // Get yearly summary
    getYearly: async (year) => {
        return apiRequest(`/reports/yearly/${year}`);
    },
};

// ============================================
// LOADING FUNCTIONS
// ============================================

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}
