// ============================================
// Reports Routes - SQLite Version
// /api/reports
// ============================================

const express = require('express');
const router = express.Router();
const { get, all } = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

// DASHBOARD SUMMARY
router.get('/dashboard', (req, res) => {
    try {
        const userId = req.session.userId;

        const incomeResult = get('SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ?', [userId]);
        const expenseResult = get('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?', [userId]);
        const savingsResult = get('SELECT COALESCE(SUM(saved_amount), 0) as total FROM savings_goals WHERE user_id = ?', [userId]);

        const totalIncome = incomeResult?.total || 0;
        const totalExpenses = expenseResult?.total || 0;
        const totalSavings = savingsResult?.total || 0;

        res.json({
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            totalSavings
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dashboard summary' });
    }
});

// MONTHLY REPORT
router.get('/monthly/:month', (req, res) => {
    try {
        const { month } = req.params;
        const userId = req.session.userId;

        const incomeResult = get(
            `SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND strftime('%Y-%m', date) = ?`,
            [userId, month]
        );

        const expenseResult = get(
            `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ? AND strftime('%Y-%m', date) = ?`,
            [userId, month]
        );

        const incomeBySource = all(
            `SELECT source, COALESCE(SUM(amount), 0) as total FROM income 
             WHERE user_id = ? AND strftime('%Y-%m', date) = ? GROUP BY source ORDER BY total DESC`,
            [userId, month]
        );

        const expenseByCategory = all(
            `SELECT category, COALESCE(SUM(amount), 0) as total FROM expenses 
             WHERE user_id = ? AND strftime('%Y-%m', date) = ? GROUP BY category ORDER BY total DESC`,
            [userId, month]
        );

        const totalIncome = incomeResult?.total || 0;
        const totalExpenses = expenseResult?.total || 0;
        const netSavings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(2) : 0;

        res.json({
            month,
            totalIncome,
            totalExpenses,
            netSavings,
            savingsRate: parseFloat(savingsRate),
            incomeBySource,
            expenseByCategory
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching monthly report' });
    }
});

// TREND DATA
router.get('/trend/:months', (req, res) => {
    try {
        const months = parseInt(req.params.months) || 6;
        const userId = req.session.userId;
        const trend = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

            const incomeResult = get(
                `SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND strftime('%Y-%m', date) = ?`,
                [userId, monthKey]
            );

            const expenseResult = get(
                `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ? AND strftime('%Y-%m', date) = ?`,
                [userId, monthKey]
            );

            const income = incomeResult?.total || 0;
            const expense = expenseResult?.total || 0;

            trend.push({ month: monthKey, label: monthLabel, income, expense, savings: income - expense });
        }

        res.json(trend);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching trend data' });
    }
});

// EXPENSE DISTRIBUTION
router.get('/expense-distribution', (req, res) => {
    try {
        const { month } = req.query;
        const userId = req.session.userId;

        let expenses;
        if (month) {
            expenses = all(
                `SELECT category, COALESCE(SUM(amount), 0) as total FROM expenses 
                 WHERE user_id = ? AND strftime('%Y-%m', date) = ? GROUP BY category ORDER BY total DESC`,
                [userId, month]
            );
        } else {
            expenses = all(
                `SELECT category, COALESCE(SUM(amount), 0) as total FROM expenses 
                 WHERE user_id = ? GROUP BY category ORDER BY total DESC`,
                [userId]
            );
        }

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching expense distribution' });
    }
});

// RECENT TRANSACTIONS
router.get('/recent-transactions', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.session.userId;

        const transactions = all(`
            SELECT * FROM (
                SELECT id, source as category, amount, date, description, 'income' as type FROM income WHERE user_id = ?
                UNION ALL
                SELECT id, category, amount, date, description, 'expense' as type FROM expenses WHERE user_id = ?
            ) ORDER BY date DESC LIMIT ?
        `, [userId, userId, limit]);

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching recent transactions' });
    }
});

module.exports = router;
