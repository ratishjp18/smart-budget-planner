// ============================================
// Authentication Routes - SQLite Version
// /api/auth
// ============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { run, get, all } = require('../config/database');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

// ============================================
// REGISTER - POST /api/auth/register
// ============================================
router.post('/register', isNotAuthenticated, async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

        // Validation
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if username or email already exists
        const existingUser = get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const result = run(
            'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, fullName]
        );

        const newUser = get('SELECT id, username, email, full_name FROM users WHERE id = ?', [result.lastInsertRowid]);

        // Set session
        req.session.userId = newUser.id;
        req.session.username = newUser.username;

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.full_name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// ============================================
// LOGIN - POST /api/auth/login
// ============================================
router.post('/login', isNotAuthenticated, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const user = get(
            'SELECT id, username, email, password, full_name FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// ============================================
// LOGOUT - POST /api/auth/logout
// ============================================
router.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// ============================================
// GET CURRENT USER - GET /api/auth/me
// ============================================
router.get('/me', isAuthenticated, (req, res) => {
    try {
        const user = get(
            'SELECT id, username, email, full_name, created_at FROM users WHERE id = ?',
            [req.session.userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// CHECK AUTH STATUS - GET /api/auth/status
// ============================================
router.get('/status', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ 
            isAuthenticated: true, 
            userId: req.session.userId,
            username: req.session.username 
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

module.exports = router;
