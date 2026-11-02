# 🐛 BugTracker — Mini Jira (Interview POC)

A fully functional **Bug Tracking System** built with React, Node.js, Express, and PostgreSQL. 
This is a clean, beginner-friendly, interview-ready full-stack application.

---

## 🏗️ Architecture Overview

```
Client (React + Vite)          Server (Node.js + Express)        Database (PostgreSQL)
┌─────────────────────┐        ┌──────────────────────────┐      ┌──────────────────┐
│  Pages              │  HTTP  │  Routes                  │      │  users           │
│  - Login/Register   │ ──────▶│  - /api/auth             │─────▶│  projects        │
│  - Dashboard        │  JSON  │  - /api/projects         │      │  tickets         │
│  - Projects         │◀───────│  - /api/tickets          │      └──────────────────┘
│  - Tickets          │        │                          │
│                     │        │  Controllers → Services → Models (Sequelize ORM)
│  Context (Auth)     │        │                          │
│  Axios (API calls)  │        │  Middlewares:            │
└─────────────────────┘        │  - JWT Auth              │
                               │  - Validation            │
                               │  - Error Handler         │
                               └──────────────────────────┘
```

**Request Flow:** `React Page → Axios → Express Route → Controller → Service → Sequelize Model → PostgreSQL`

---

## 🗄️ Database ER Diagram

```
users                    projects                  tickets
─────────────────        ─────────────────────     ────────────────────────────
id (PK)                  id (PK)                   id (PK)
name                     name                      title
email (unique)           description               description
password (hashed)        created_by ─────────────▶ status (ENUM)
role (ENUM)              created_at       users     priority (ENUM)
created_at               updated_at                project_id ────────▶ projects
updated_at               │                         assigned_to ───────▶ users
│                        │                         created_by ────────▶ users
│                        │                         created_at
└────────────────────────┘                         updated_at
```

**Relationships:**
- User `has many` Projects (created_by)
- User `has many` Tickets (created_by, assigned_to)
- Project `has many` Tickets (project_id)

---

## 🚀 Local Setup (Step-by-Step)

### Prerequisites
- Node.js v16+ installed
- PostgreSQL installed and running
- Git (optional)

### 1. Install all dependencies

```bash
npm run install:all
```

Or manually:
```bash
npm install                    # root (installs concurrently)
npm install --prefix server    # backend
npm install --prefix client    # frontend
```

### 2. Set up PostgreSQL database

**Option A: Using psql command line**
```sql
psql -U postgres -c "CREATE DATABASE bug_tracker;"
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name it: `bug_tracker`

### 3. Configure environment variables

```bash
# Copy the example env file
copy server\.env.example server\.env
```

Edit `server/.env` with your PostgreSQL credentials:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bug_tracker
DB_USER=postgres
DB_PASSWORD=your_postgres_password   # ← Change this!
JWT_SECRET=bug_tracker_secret_key_2024_interview_poc
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 4. Run database migrations

```bash
npm run migrate
```

This creates the `users`, `projects`, and `tickets` tables in PostgreSQL.

### 5. Seed sample data (optional but recommended)

```bash
npm run seed
```

This creates:
- 3 sample users
- 3 sample projects  
- 9 sample tickets with various statuses

### 6. Start the application

```bash
npm run dev
```

This starts:
- 🖥️ Frontend: http://localhost:5173
- 🔌 Backend: http://localhost:5000

---

## 👤 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bugtracker.com | admin123 |
| Developer | john@bugtracker.com | dev123 |
| Tester | jane@bugtracker.com | tester123 |

---

## 📡 API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/auth/users` | Get all users (for assign dropdown) | Yes |

**Login Request:**
```json
POST /api/auth/login
{
  "email": "admin@bugtracker.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "Admin User", "email": "...", "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Projects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/projects` | Get all projects | Yes |
| POST | `/projects` | Create project | Yes |
| GET | `/projects/:id` | Get project details + tickets | Yes |
| PUT | `/projects/:id` | Update project | Yes |
| DELETE | `/projects/:id` | Delete project (cascades tickets) | Yes |

### Tickets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tickets` | Get all tickets (with filters) | Yes |
| POST | `/tickets` | Create ticket | Yes |
| GET | `/tickets/:id` | Get ticket details | Yes |
| PUT | `/tickets/:id` | Update ticket | Yes |
| DELETE | `/tickets/:id` | Delete ticket | Yes |
| GET | `/tickets/stats/dashboard` | Get dashboard stats | Yes |

**Ticket Filters (query params):**
```
GET /api/tickets?search=login&status=OPEN&priority=HIGH&project_id=1
```

**All protected endpoints require:**
```
Authorization: Bearer <jwt_token>
```

---

## 📁 Project Structure

```
bug-tracking-system/
├── package.json                  # Root - runs both with concurrently
│
├── client/                       # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Left navigation
│   │   │   ├── Topbar.jsx        # Top header
│   │   │   ├── ProtectedRoute.jsx# JWT route guard
│   │   │   ├── Badges.jsx        # Status/Priority badges
│   │   │   └── ConfirmDialog.jsx # Delete confirmation modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state (React Context)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx     # Login with demo creds
│   │   │   ├── RegisterPage.jsx  # User registration
│   │   │   ├── DashboardPage.jsx # Stats overview
│   │   │   ├── ProjectsPage.jsx  # Project CRUD (card grid)
│   │   │   ├── ProjectDetailPage.jsx # Project + tickets
│   │   │   ├── TicketsPage.jsx   # Tickets + search/filter
│   │   │   └── TicketDetailPage.jsx  # Single ticket view
│   │   ├── services/
│   │   │   └── api.js            # Axios instance + interceptors
│   │   ├── App.jsx               # Routes + layout
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Design system (dark theme)
│   ├── index.html
│   └── package.json
│
├── server/                       # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Sequelize config (dev + prod)
│   │   ├── models/
│   │   │   ├── index.js          # Initialize Sequelize + associations
│   │   │   ├── user.js           # User model (bcrypt hooks)
│   │   │   ├── project.js        # Project model
│   │   │   └── ticket.js         # Ticket model (ENUM fields)
│   │   ├── migrations/
│   │   │   ├── ...-create-users.js
│   │   │   ├── ...-create-projects.js
│   │   │   └── ...-create-tickets.js
│   │   ├── seeders/
│   │   │   └── ...-demo-data.js  # 3 users, 3 projects, 9 tickets
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   └── ticketController.js
│   │   ├── services/
│   │   │   ├── authService.js    # JWT + bcrypt logic
│   │   │   ├── projectService.js # Project CRUD
│   │   │   └── ticketService.js  # Ticket CRUD + filters + stats
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   └── ticketRoutes.js
│   │   ├── middlewares/
│   │   │   ├── auth.js           # JWT verify middleware
│   │   │   ├── validate.js       # express-validator runner
│   │   │   └── errorHandler.js   # Global error handler
│   │   └── app.js                # Express app entry point
│   ├── .env                      # Environment variables
│   ├── .env.example              # Template for new developers
│   ├── .sequelizerc              # Sequelize CLI paths
│   └── package.json
│
└── README.md
```

---

## ☁️ Deployment Guide (Free Platforms)

### Backend → Railway or Render

**Railway (recommended - easiest):**
1. Go to [railway.app](https://railway.app) → New Project
2. Deploy from GitHub repo
3. Add a **PostgreSQL** plugin (free tier)
4. Copy the `DATABASE_URL` from the plugin into environment variables
5. Set `NODE_ENV=production`
6. Railway auto-detects Node.js and runs `npm start`

**Environment variables for production:**
```
NODE_ENV=production
DATABASE_URL=<provided by Railway PostgreSQL plugin>
JWT_SECRET=<your-strong-secret>
CLIENT_URL=<your-vercel-frontend-url>
```

**Render:**
1. New Web Service → connect GitHub
2. Build command: `npm install --prefix server`
3. Start command: `npm start --prefix server`
4. Add PostgreSQL database (free tier)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo
3. Set **Root Directory** to `client`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-backend.railway.app/api
   ```
5. Deploy!

### Database Migration in Production

After deploying backend, run migrations once:
- Railway: Use "Railway CLI" or add a one-time job
- Render: Use the Shell tab in the dashboard

```bash
cd server && npm run migrate && npm run seed
```

### Neon (Free PostgreSQL alternative)

1. Go to [neon.tech](https://neon.tech) - free PostgreSQL in cloud
2. Create project → copy connection string
3. Set `DATABASE_URL=<neon-connection-string>` in your hosting platform

---

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend together |
| `npm run server` | Start backend only |
| `npm run client` | Start frontend only |
| `npm run install:all` | Install all dependencies |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed sample data |

---

## 🎯 Key Interview Talking Points

### JWT Authentication Flow
1. User logs in → backend verifies password with bcrypt
2. Backend generates JWT token (signed with secret, expires in 7 days)
3. Token stored in localStorage
4. Every API request includes `Authorization: Bearer <token>`
5. Auth middleware verifies token on every protected route

### Why Sequelize ORM?
- Avoids raw SQL (safer, cleaner)
- Model-level validation before hitting the DB
- Migrations ensure consistent DB schema across environments
- Easy to switch databases (PostgreSQL → MySQL) by changing dialect

### Search & Filter Architecture
- Filters are sent as query parameters: `GET /api/tickets?status=OPEN&priority=HIGH`
- Backend builds a dynamic WHERE clause using Sequelize `Op.iLike` for case-insensitive search
- Frontend syncs filters to URL so users can share filtered views

### Service Layer Pattern
- Routes → Controllers → Services → Models
- Services contain all business logic (not controllers)
- Controllers just receive HTTP requests and send responses
- This makes the code testable and maintainable
