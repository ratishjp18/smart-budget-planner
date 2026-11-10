// ============================================
// Expense Routes - SQLite Version
// /api/expenses
// ============================================

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

// GET ALL EXPENSES
router.get('/', (req, res) => {
    try {
        const expenses = all(
            'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC',
            [req.session.userId]
        );
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching expenses data' });
    }
});

// GET EXPENSES BY MONTH
router.get('/month/:month', (req, res) => {
    try {
        const expenses = all(
            `SELECT * FROM expenses WHERE user_id = ? AND strftime('%Y-%m', date) = ? ORDER BY date DESC`,
            [req.session.userId, req.params.month]
        );
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching monthly expenses' });
    }
});

// GET EXPENSES BY CATEGORY
router.get('/category/:category', (req, res) => {
    try {
        const expenses = all(
            'SELECT * FROM expenses WHERE user_id = ? AND category = ? ORDER BY date DESC',
            [req.session.userId, req.params.category]
        );
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching expenses by category' });
    }
});

// GET SINGLE EXPENSE
router.get('/:id', (req, res) => {
    try {
        const expense = get(
            'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
            [req.params.id, req.session.userId]
        );
        if (!expense) return res.status(404).json({ error: 'Expense record not found' });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching expense record' });
    }
});

// ADD EXPENSE
router.post('/', (req, res) => {
    try {
        const { category, amount, date, description } = req.body;
        if (!category || !amount || !date) {
            return res.status(400).json({ error: 'Category, amount, and date are required' });
        }

        const result = run(
            'INSERT INTO expenses (user_id, category, amount, date, description) VALUES (?, ?, ?, ?, ?)',
            [req.session.userId, category, amount, date, description || null]
        );

        const newExpense = get('SELECT * FROM expenses WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        res.status(500).json({ error: 'Error adding expense' });
    }
});

// UPDATE EXPENSE
router.put('/:id', (req, res) => {
    try {
        const { category, amount, date, description } = req.body;
        const existing = get('SELECT id FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        if (!existing) return res.status(404).json({ error: 'Expense record not found' });

        run(
            'UPDATE expenses SET category = ?, amount = ?, date = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [category, amount, date, description, req.params.id]
        );

        const updated = get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
        res.json({ message: 'Expense updated successfully', expense: updated });
    } catch (error) {
        res.status(500).json({ error: 'Error updating expense' });
    }
});

// DELETE EXPENSE
router.delete('/:id', (req, res) => {
    try {
        const result = run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        if (result.changes === 0) return res.status(404).json({ error: 'Expense record not found' });
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting expense' });
    }
});

module.exports = router;
