# Budget Planning System
## B.Com CA Final Year Project

---

## 🚀 How to Run This Project

### Prerequisites
- **Node.js** (Download from https://nodejs.org - choose LTS version)

### Steps to Run

1. **Open Command Prompt/Terminal** in this folder

2. **Install dependencies** (first time only):
   ```
   npm install
   ```

3. **Start the server**:
   ```
   npm start
   ```

4. **Open browser** and go to:
   ```
   http://localhost:3000
   ```

5. **Create an account** and start using!

### To Stop the Server
Press `Ctrl + C` in the terminal

---

## Features
## B.Com CA Final Year Project
### Full Stack Application with Node.js + PostgreSQL

A comprehensive web-based budget planning and personal finance management system.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | Session-based with bcrypt |

---

## 📁 Project Structure

```
budget-planning-system/
│
├── server.js               # Main server file
├── package.json            # Node.js dependencies
├── .env                    # Environment variables
├── README.md               # Project documentation
│
├── config/
│   └── database.js         # PostgreSQL connection
│
├── middleware/
│   └── auth.js             # Authentication middleware
│
├── routes/
│   ├── auth.js             # Login/Register routes
│   ├── income.js           # Income CRUD routes
│   ├── expenses.js         # Expense CRUD routes
│   ├── budget.js           # Budget goals routes
│   ├── savings.js          # Savings goals routes
│   └── reports.js          # Reports & analytics routes
│
├── database/
│   └── schema.sql          # PostgreSQL database schema
│
└── public/                 # Frontend files
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js          # API service functions
        └── app.js          # Main application logic
```

---

## ✨ Features

### 🔐 Authentication
- User registration with email
- Secure login with hashed passwords
- Session-based authentication
- Logout functionality

### 📊 Dashboard
- Total income, expenses, balance overview
- Expense distribution chart (Pie Chart)
- Income vs Expenses comparison (Bar Chart)
- Recent transactions list

### 💰 Income Management
- Add income from multiple sources
- Track income history
- Edit and delete records

### 💸 Expense Management
- Categorized expense tracking
- Multiple expense categories
- Full CRUD operations

### 🎯 Budget Goals
- Set monthly budget limits per category
- Visual progress tracking
- Over-budget alerts

### 🐷 Savings Goals
- Create savings targets with deadlines
- Track progress with contributions
- Visual progress indicators

### 📈 Reports
- Monthly financial reports
- Income/Expense breakdown
- 6-month trend analysis
- Print-friendly reports

---

## 🚀 Setup Instructions

### Prerequisites
1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)

### Step 1: Install PostgreSQL

1. Download and install PostgreSQL
2. During installation, remember your password for the `postgres` user
3. Open **pgAdmin** or **psql** command line

### Step 2: Create Database

Open psql or pgAdmin and run:

```sql
CREATE DATABASE budget_planning_db;
```

Then run the schema file:
```bash
psql -U postgres -d budget_planning_db -f database/schema.sql
```

Or copy the contents of `database/schema.sql` and run in pgAdmin.

### Step 3: Configure Environment

Edit the `.env` file with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=budget_planning_db
PORT=3000
SESSION_SECRET=your_secret_key_here
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Run the Application

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Step 6: Open in Browser

Go to: **http://localhost:3000**

---

## 📖 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/status` | Check auth status |

### Income
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/income` | Get all income |
| GET | `/api/income/:id` | Get single income |
| POST | `/api/income` | Add income |
| PUT | `/api/income/:id` | Update income |
| DELETE | `/api/income/:id` | Delete income |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses |
| GET | `/api/expenses/:id` | Get single expense |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Budget
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budget` | Get all budget goals |
| GET | `/api/budget/status/:month` | Get budget with spending |
| POST | `/api/budget` | Add/Update budget goal |
| DELETE | `/api/budget/:id` | Delete budget goal |

### Savings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/savings` | Get all savings goals |
| POST | `/api/savings` | Create savings goal |
| POST | `/api/savings/:id/contribute` | Add contribution |
| DELETE | `/api/savings/:id` | Delete savings goal |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/dashboard` | Dashboard summary |
| GET | `/api/reports/monthly/:month` | Monthly report |
| GET | `/api/reports/trend/:months` | Trend data |

---

## 🔒 Security Features

- Password hashing with bcrypt
- Session-based authentication
- SQL injection prevention (parameterized queries)
- Input validation on all endpoints
- Protected API routes

---

## 👨‍💻 Project Information

**Project Title:** Budget Planning System  
**Course:** B.Com CA (Computer Applications)  
**Year:** Final Year Project  
**Technology Stack:** Node.js, Express, PostgreSQL, HTML, CSS, JavaScript

---

## 📄 License

This project is created for educational purposes as part of B.Com CA Final Year curriculum.
