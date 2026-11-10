// ============================================
// SQLite Database Configuration (sql.js)
// Budget Planning System
// ============================================

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db = null;
let lastInsertId = 0;
const dbPath = path.resolve(process.env.DB_PATH || './database/budget.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
async function initDatabase() {
    const SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
        console.log('✅ Loaded existing SQLite database:', dbPath);
    } else {
        db = new SQL.Database();
        console.log('✅ Created new SQLite database:', dbPath);
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS income (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            source TEXT NOT NULL,
            amount REAL NOT NULL,
            date DATE NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            date DATE NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS budget_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            month TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, category, month)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS savings_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            target_amount REAL NOT NULL,
            saved_amount REAL DEFAULT 0,
            deadline DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS savings_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            savings_goal_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            transaction_date DATE DEFAULT CURRENT_DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (savings_goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE
        )
    `);

    // Save database to file
    saveDatabase();
    
    console.log('✅ Database tables created successfully!');
    return db;
}

// Save database to file
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

// Run SQL (INSERT, UPDATE, DELETE)
function run(sql, params = []) {
    try {
        db.run(sql, params);
        
        // Get last insert ID
        const result = db.exec("SELECT last_insert_rowid() as id");
        const lastId = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : 0;
        
        saveDatabase();
        return { lastInsertRowid: lastId, changes: db.getRowsModified() };
    } catch (error) {
        console.error('SQL Run Error:', error.message);
        throw error;
    }
}

// Get single row
function get(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
            stmt.bind(params);
        }
        
        if (stmt.step()) {
            const columns = stmt.getColumnNames();
            const values = stmt.get();
            const row = {};
            columns.forEach((col, i) => {
                row[col] = values[i];
            });
            stmt.free();
            return row;
        }
        stmt.free();
        return null;
    } catch (error) {
        console.error('SQL Get Error:', error.message);
        throw error;
    }
}

// Get all rows
function all(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
            stmt.bind(params);
        }
        
        const results = [];
        const columns = stmt.getColumnNames();
        
        while (stmt.step()) {
            const values = stmt.get();
            const row = {};
            columns.forEach((col, i) => {
                row[col] = values[i];
            });
            results.push(row);
        }
        stmt.free();
        return results;
    } catch (error) {
        console.error('SQL All Error:', error.message);
        throw error;
    }
}

module.exports = {
    initDatabase,
    run,
    get,
    all,
    saveDatabase
};
