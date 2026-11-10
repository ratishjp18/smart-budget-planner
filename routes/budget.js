// ============================================
// Budget Goals Routes - SQLite Version
// /api/budget
// ============================================

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

// GET ALL BUDGET GOALS
router.get('/', (req, res) => {
    try {
        const budgets = all('SELECT * FROM budget_goals WHERE user_id = ? ORDER BY category', [req.session.userId]);
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budget goals' });
    }
});

// GET BUDGET BY MONTH
router.get('/month/:month', (req, res) => {
    try {
        const budgets = all(
            'SELECT * FROM budget_goals WHERE user_id = ? AND month = ? ORDER BY category',
            [req.session.userId, req.params.month]
        );
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching monthly budget goals' });
    }
});

// GET BUDGET STATUS WITH SPENDING
router.get('/status/:month', (req, res) => {
    try {
        const { month } = req.params;

        const budgets = all(
            'SELECT * FROM budget_goals WHERE user_id = ? AND month = ?',
            [req.session.userId, month]
        );

        const expenses = all(
            `SELECT category, COALESCE(SUM(amount), 0) as spent FROM expenses 
             WHERE user_id = ? AND strftime('%Y-%m', date) = ? GROUP BY category`,
            [req.session.userId, month]
        );

        const expenseMap = {};
        expenses.forEach(exp => { expenseMap[exp.category] = exp.spent; });

        const budgetStatus = budgets.map(budget => {
            const spent = expenseMap[budget.category] || 0;
            const budgetAmount = parseFloat(budget.amount);
            const remaining = budgetAmount - spent;
            const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

            return {
                ...budget,
                spent,
                remaining,
                percentage: Math.min(percentage, 100),
                status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe'
            };
        });

        res.json(budgetStatus);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budget status' });
    }
});

// ADD/UPDATE BUDGET GOAL
router.post('/', (req, res) => {
    try {
        const { category, amount, month } = req.body;
        if (!category || !amount || !month) {
            return res.status(400).json({ error: 'Category, amount, and month are required' });
        }

        const existing = get(
            'SELECT id FROM budget_goals WHERE user_id = ? AND category = ? AND month = ?',
            [req.session.userId, category, month]
        );

        let budget;
        if (existing) {
            run('UPDATE budget_goals SET amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [amount, existing.id]);
            budget = get('SELECT * FROM budget_goals WHERE id = ?', [existing.id]);
        } else {
            const result = run(
                'INSERT INTO budget_goals (user_id, category, amount, month) VALUES (?, ?, ?, ?)',
                [req.session.userId, category, amount, month]
            );
            budget = get('SELECT * FROM budget_goals WHERE id = ?', [result.lastInsertRowid]);
        }

        res.status(201).json({ message: 'Budget goal saved successfully', budget });
    } catch (error) {
        res.status(500).json({ error: 'Error saving budget goal' });
    }
});

// DELETE BUDGET GOAL
router.delete('/:id', (req, res) => {
    try {
        const result = run('DELETE FROM budget_goals WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        if (result.changes === 0) return res.status(404).json({ error: 'Budget goal not found' });
        res.json({ message: 'Budget goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting budget goal' });
    }
});

module.exports = router;
