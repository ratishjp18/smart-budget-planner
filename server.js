// ============================================
// Budget Planning System - Main Server
// B.Com CA Final Year Project
// Node.js + Express + SQLite
// ============================================

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'budget_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// INITIALIZE DATABASE AND START SERVER
// ============================================

const { initDatabase } = require('./config/database');

async function startServer() {
    try {
        // Initialize database
        await initDatabase();

        // Import routes AFTER database is initialized
        const authRoutes = require('./routes/auth');
        const incomeRoutes = require('./routes/income');
        const expenseRoutes = require('./routes/expenses');
        const budgetRoutes = require('./routes/budget');
        const savingsRoutes = require('./routes/savings');
        const reportRoutes = require('./routes/reports');

        // API Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/income', incomeRoutes);
        app.use('/api/expenses', expenseRoutes);
        app.use('/api/budget', budgetRoutes);
        app.use('/api/savings', savingsRoutes);
        app.use('/api/reports', reportRoutes);

        // Serve frontend
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        // Error handling
        app.use((err, req, res, next) => {
            console.error('Server Error:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        });

        // Start server
        app.listen(PORT, () => {
            console.log('\n============================================');
            console.log('   Budget Planning System');
            console.log('   B.Com CA Final Year Project');
            console.log('============================================');
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log('============================================\n');
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
