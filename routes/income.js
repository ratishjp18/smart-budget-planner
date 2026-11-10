// ============================================
// Income Routes - SQLite Version
// /api/income
// ============================================

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

// GET ALL INCOME
router.get('/', (req, res) => {
    try {
        const income = all(
            'SELECT * FROM income WHERE user_id = ? ORDER BY date DESC, created_at DESC',
            [req.session.userId]
        );
        res.json(income);
    } catch (error) {
        console.error('Get income error:', error);
        res.status(500).json({ error: 'Error fetching income data' });
    }
});

// GET INCOME BY MONTH
router.get('/month/:month', (req, res) => {
    try {
        const { month } = req.params;
        const income = all(
            `SELECT * FROM income WHERE user_id = ? AND strftime('%Y-%m', date) = ? ORDER BY date DESC`,
            [req.session.userId, month]
        );
        res.json(income);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching monthly income' });
    }
});

// GET SINGLE INCOME
router.get('/:id', (req, res) => {
    try {
        const income = get(
            'SELECT * FROM income WHERE id = ? AND user_id = ?',
            [req.params.id, req.session.userId]
        );
        if (!income) return res.status(404).json({ error: 'Income record not found' });
        res.json(income);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching income record' });
    }
});

// ADD INCOME
router.post('/', (req, res) => {
    try {
        const { source, amount, date, description } = req.body;
        if (!source || !amount || !date) {
            return res.status(400).json({ error: 'Source, amount, and date are required' });
        }

        const result = run(
            'INSERT INTO income (user_id, source, amount, date, description) VALUES (?, ?, ?, ?, ?)',
            [req.session.userId, source, amount, date, description || null]
        );

        const newIncome = get('SELECT * FROM income WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json({ message: 'Income added successfully', income: newIncome });
    } catch (error) {
        res.status(500).json({ error: 'Error adding income' });
    }
});

// UPDATE INCOME
router.put('/:id', (req, res) => {
    try {
        const { source, amount, date, description } = req.body;
        const existing = get('SELECT id FROM income WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        if (!existing) return res.status(404).json({ error: 'Income record not found' });

        run(
            'UPDATE income SET source = ?, amount = ?, date = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [source, amount, date, description, req.params.id]
        );

        const updated = get('SELECT * FROM income WHERE id = ?', [req.params.id]);
        res.json({ message: 'Income updated successfully', income: updated });
    } catch (error) {
        res.status(500).json({ error: 'Error updating income' });
    }
});

// DELETE INCOME
router.delete('/:id', (req, res) => {
    try {
        const result = run('DELETE FROM income WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        if (result.changes === 0) return res.status(404).json({ error: 'Income record not found' });
        res.json({ message: 'Income deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting income' });
    }
});

module.exports = router;
