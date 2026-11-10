# BudgetPro — Personal Budget Planning System
### B.Com CA Final Year Project

A full-stack personal finance management web application built with Node.js, Express, and SQLite. Helps users track income, manage expenses, set budget goals, monitor savings, and generate financial reports — all from a clean browser-based UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Chart.js, Font Awesome |
| Backend | Node.js, Express.js |
| Database | SQLite (via sql.js — no installation needed) |
| Auth | Session-based with bcryptjs password hashing |

---

## Features

### Authentication
- User registration (full name, email, username, password)
- Secure login — accepts username or email
- Password hashing with bcrypt (min 6 characters)
- Session-based authentication with 24-hour expiry
- Logout with session destruction

### Dashboard
- Total income, total expenses, balance, and savings summary
- Expense distribution pie chart
- Income vs Expenses bar chart (6-month trend)
- Recent transactions table

### Income Management
- Add income from: Salary, Business, Freelance, Investment, Rental, Other
- Full edit and delete support
- Filter by month
- Income history table

### Expense Management
- Categorized tracking: Food, Transport, Housing, Utilities, Healthcare, Education, Entertainment, Shopping, Insurance, Other
- Full edit and delete support
- Filter by month and by category

### Budget Goals
- Set monthly spend limits per category
- Real-time budget vs actual comparison
- Status indicators: Safe / Warning (80%+) / Exceeded (100%+)
- Visual progress bars per category

### Savings Goals
- Create named goals with target amount and deadline
- Add contributions incrementally
- Track progress with percentage completion
- Savings transaction history

### Reports
- Monthly report: income, expenses, net savings, savings rate
- Income breakdown by source
- Expense breakdown by category
- 6-month trend chart
- Print-friendly report view

---

## Project Structure

```
smart-budget-planner/
│
├── server.js                  # Main Express server, route registration
├── package.json               # Dependencies and scripts
├── .env                       # Environment config (PORT, DB_PATH, SESSION_SECRET)
├── .gitignore                 # Excludes node_modules, .env, budget.db, etc.
├── LICENSE                    # MIT License
├── README.md                  # This file
├── HOWTORUN.md                # Quick start guide
│
├── config/
│   └── database.js            # SQLite init, table creation, run/get/all helpers
│
├── middleware/
│   └── auth.js                # isAuthenticated / isNotAuthenticated guards
│
├── routes/
│   ├── auth.js                # Register, Login, Logout, /me, /status
│   ├── income.js              # Income CRUD + month filter
│   ├── expenses.js            # Expense CRUD + month/category filter
│   ├── budget.js              # Budget goals CRUD + budget status with spending
│   ├── savings.js             # Savings goals CRUD + contributions
│   └── reports.js             # Dashboard, monthly, trend, distribution, recent
│
├── database/
│   ├── schema.sql             # Reference SQL schema (documentation)
│   └── budget.db              # SQLite database file (auto-created, git-ignored)
│
└── public/                    # Static frontend served by Express
    ├── index.html             # Single-page app (auth + all pages)
    ├── css/
    │   └── style.css          # Full UI styling
    └── js/
        ├── api.js             # All fetch() calls to the backend API
        └── app.js             # UI logic, page routing, chart rendering
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create new account |
| POST | `/login` | Login with username or email |
| POST | `/logout` | Destroy session |
| GET | `/me` | Get current user info |
| GET | `/status` | Check if session is active |

### Income — `/api/income`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all income records |
| GET | `/:id` | Get single income record |
| GET | `/month/:month` | Get income for a month (YYYY-MM) |
| POST | `/` | Add new income |
| PUT | `/:id` | Update income record |
| DELETE | `/:id` | Delete income record |

### Expenses — `/api/expenses`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all expenses |
| GET | `/:id` | Get single expense |
| GET | `/month/:month` | Get expenses for a month |
| GET | `/category/:category` | Get expenses by category |
| POST | `/` | Add new expense |
| PUT | `/:id` | Update expense |
| DELETE | `/:id` | Delete expense |

### Budget — `/api/budget`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all budget goals |
| GET | `/month/:month` | Get budget goals for a month |
| GET | `/status/:month` | Get budget vs actual spending |
| POST | `/` | Create or update a budget goal |
| DELETE | `/:id` | Delete budget goal |

### Savings — `/api/savings`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all savings goals |
| GET | `/:id` | Get single savings goal |
| POST | `/` | Create savings goal |
| POST | `/:id/contribute` | Add a contribution |
| PUT | `/:id` | Update savings goal |
| DELETE | `/:id` | Delete savings goal |

### Reports — `/api/reports`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Overall income, expense, balance, savings totals |
| GET | `/monthly/:month` | Full monthly breakdown with savings rate |
| GET | `/trend/:months` | Month-by-month trend for N months |
| GET | `/expense-distribution` | Expense totals grouped by category |
| GET | `/recent-transactions` | Latest combined income + expense records |

---

## Database Tables

| Table | Description |
|---|---|
| `users` | Registered user accounts |
| `income` | Income records per user |
| `expenses` | Expense records per user |
| `budget_goals` | Monthly budget limits per category |
| `savings_goals` | Savings targets with progress tracking |
| `savings_transactions` | Individual contributions to savings goals |

---

## Security

- Passwords hashed with bcrypt (salt rounds: 10)
- Session stored server-side with `express-session`
- All API routes protected by `isAuthenticated` middleware
- Parameterized SQL queries throughout — no raw string interpolation
- `.env` file git-ignored (secrets never committed)

---

## Project Information

**Title:** BudgetPro — Personal Budget Planning System  
**Course:** B.Com CA (Computer Applications)  
**Year:** Final Year Project  
**Currency:** Indian Rupee (₹)

---

## License

MIT License — see [LICENSE](LICENSE) for details.
