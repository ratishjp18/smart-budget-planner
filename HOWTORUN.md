# How to Run BudgetPro

## Prerequisites

- **Node.js** v14 or higher — [Download](https://nodejs.org) (choose LTS)
- That's it. No database installation required — SQLite is bundled.

---

## Steps

### 1. Clone the repository
```
git clone <your-repo-url>
cd smart-budget-planner
```

### 2. Install dependencies
```
npm install
```
Only needed once. This installs Express, SQLite, bcryptjs, and other packages.

### 3. Set up environment (optional)
The `.env` file is git-ignored. Create one in the root folder:
```
PORT=3000
DB_PATH=./database/budget.db
SESSION_SECRET=your_secret_key_here
```
Default values work fine if you skip this step.

### 4. Start the server

**Development mode** (auto-restarts on file changes — recommended):
```
npm run dev
```

**Production mode:**
```
npm start
```

### 5. Open in browser
```
http://localhost:3000
```

---

## First Time Setup

1. Click **"Don't have an account? Create one"** on the login screen
2. Fill in your Full Name, Email, Username, and Password (min 6 characters)
3. You'll be redirected to the dashboard automatically

---

## Stop the Server

Press `Ctrl + C` in the terminal.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find module 'express'` | Run `npm install` |
| `Port 3000 already in use` | Add `PORT=3001` to `.env` |
| Database errors on first run | Delete `database/budget.db` and restart — it auto-recreates |
| Login not working | Make sure you registered first — the DB starts empty |

---

## Project runs on

- Backend: `http://localhost:3000`
- All API routes: `http://localhost:3000/api/...`
- Frontend: served from `/public` at the root URL
