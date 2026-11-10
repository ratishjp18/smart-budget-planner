// ============================================
// Savings Goals Routes - SQLite Version
// /api/savings
// ============================================

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

// GET ALL SAVINGS GOALS
router.get('/', (req, res) => {
    try {
        const savings = all(`
            SELECT *, CASE WHEN target_amount > 0 
                THEN ROUND((COALESCE(saved_amount, 0) * 100.0 / target_amount), 2) ELSE 0 END as percentage
            FROM savings_goals WHERE user_id = ? ORDER BY deadline
        `, [req.session.userId]);
        res.json(savings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching savings goals' });
    }
});

// GET SINGLE SAVINGS GOAL
router.get('/:id', (req, res) => {
    try {
        const savings = get(`
            SELECT *, CASE WHEN target_amount > 0 
                THEN ROUND((COALESCE(saved_amount, 0) * 100.0 / target_amount), 2) ELSE 0 END as percentage
            FROM savings_goals WHERE id = ? AND user_id = ?
        `, [req.params.id, req.session.userId]);
        if (!savings) return res.status(404).json({ error: 'Savings goal not found' });
        res.json(savings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching savings goal' });
    }
});

// CREATE SAVINGS GOAL
router.post('/', (req, res) => {
    try {
        const { name, targetAmount, deadline } = req.body;
        if (!name || !targetAmount || !deadline) {
            return res.status(400).json({ error: 'Name, target amount, and deadline are required' });
        }

        const result = run(
            'INSERT INTO savings_goals (user_id, name, target_amount, deadline, saved_amount) VALUES (?, ?, ?, ?, 0)',
            [req.session.userId, name, targetAmount, deadline]
        );

        const newSavings = get('SELECT * FROM savings_goals WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json({ message: 'Savings goal created successfully', savings: newSavings });
    } catch (error) {
        res.status(500).json({ error: 'Error creating savings goal' });
    }
});

// ADD CONTRIBUTION
router.post('/:id/contribute', (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        const goal = get('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        if (!goal) return res.status(404).json({ error: 'Savings goal not found' });

        run(
            'UPDATE savings_goals SET saved_amount = COALESCE(saved_amount, 0) + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [amount, req.params.id]
        );

        run('INSERT INTO savings_transactions (savings_goal_id, amount) VALUES (?, ?)', [req.params.id, amount]);

        const updated = get('SELECT * FROM savings_goals WHERE id = ?', [req.params.id]);
        res.json({ message: 'Contribution added successfully', savings: updated });
    } catch (error) {
        res.status(500).json({ error: 'Error adding contribution' });
    }
});

// UPDATE SAVINGS GOAL
router.put('/:id', (req, res) => {
    try {
        const { name, targetAmount, deadline } = req.body;
        const result = run(
            'UPDATE savings_goals SET name = ?, target_amount = ?, deadline = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [name, targetAmount, deadline, req.params.id, req.session.userId]
        );
        if (result.changes === 0) return res.status(404).json({ error: 'Savings goal not found' });

        const updated = get('SELECT * FROM savings_goals WHERE id = ?', [req.params.id]);
        res.json({ message: 'Savings goal updated successfully', savings: updated });
    } catch (error) {
        res.status(500).json({ error: 'Error updating savings goal' });
    }
});

// DELETE SAVINGS GOAL
router.delete('/:id', (req, res) => {
    try {
        const result = run('DELETE FROM savings_goals WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        if (result.changes === 0) return res.status(404).json({ error: 'Savings goal not found' });
        res.json({ message: 'Savings goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting savings goal' });
    }
});

module.exports = router;
