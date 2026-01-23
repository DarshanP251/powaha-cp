# POWAHA CP Project - Complete Analysis

## 📋 Project Overview

**Project Name:** POWAHA CP (Community Partners Management System)

**Purpose:** A platform to manage Community Partners (CP) applications, lead tracking, and incentive distribution with admin oversight.

**Tech Stack:**
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (with Prisma ORM)
- **Frontend:** HTML5 + Vanilla JavaScript (jQuery-free)
- **Authentication:** JWT (Bearer Tokens)
- **Security:** bcrypt for password hashing, CORS enabled

---

## 🏗️ Folder Structure

```
powaha-cp/
├── 📄 Documentation Files (ADMIN_DASHBOARD_*.md)
├── package.json                           # Root dependencies (axios, react-router-dom)
│
├── backend/                               # ⭐ Express.js Server
│   ├── package.json                       # Backend dependencies
│   ├── README.md
│   ├── createAdmin.js                     # Script to create admin user
│   ├── setupTestData.js                   # Test data initialization
│   │
│   ├── prisma/
│   │   ├── schema.prisma                  # Database schema definition
│   │   └── migrations/                    # Database migrations folder
│   │
│   ├── scripts/
│   │   └── createAdmin.js
│   │
│   └── src/
│       ├── server.js                      # Express server entry point
│       ├── app.js                         # Express app configuration & routes
│       │
│       ├── config/
│       │   ├── db.js                      # Database connection
│       │   └── env.js                     # Environment variables
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.js         # 🔐 JWT validation & role checking
│       │   ├── audit.middleware.js        # Activity logging
│       │   ├── role.middleware.js         # Role-based access control
│       │   └── tenant.middleware.js       # Multi-tenant support
│       │
│       ├── modules/                       # Feature modules
│       │   │
│       │   ├── admin/
│       │   │   ├── admin.controller.js    # Admin dashboard endpoints
│       │   │   ├── admin.routes.js        # Admin API routes
│       │   │   └── admin.service.js       # Business logic (empty)
│       │   │
│       │   ├── auth/
│       │   │   ├── auth.controller.js     # Login & CP application
│       │   │   └── auth.routes.js         # Auth endpoints
│       │   │
│       │   ├── cp/
│       │   │   ├── cp.controller.js       # CP dashboard & operations
│       │   │   └── cp.routes.js           # CP routes
│       │   │
│       │   ├── churches/
│       │   ├── incentives/
│       │   ├── leads/
│       │   └── targets/
│       │
│       └── utils/
│           ├── constants.js               # App-wide constants
│           ├── email.js                   # Email service
│           ├── hash.js                    # Password hashing utilities
│           ├── logger.js                  # Logging utility
│           └── response.js                # Standard response formatter
│
├── frontend/                              # ⭐ Vanilla JS Frontend
│   ├── README.md
│   ├── server.js                          # Frontend static server
│   │
│   ├── admin/                             # Admin dashboard pages
│   │   ├── login.html                     # 🔐 Role-based login
│   │   ├── dashboard.html                 # Main admin dashboard
│   │   ├── cp-applications.html           # CP applications review
│   │   ├── cp-management.html             # CP partner management
│   │   ├── admin-incentives.html          # Incentive management
│   │   └── index.html
│   │
│   ├── cp/                                # CP (Community Partner) pages
│   │   ├── index.html                     # CP home/landing
│   │   ├── apply.html                     # CP application form
│   │   ├── dashboard.html                 # CP dashboard
│   │   ├── leads.html                     # Lead management
│   │   ├── incentives.html                # Incentive tracking
│   │   └── status.html                    # Application status
│   │
│   └── assets/
│       ├── css/
│       │   ├── auth.css                   # Login page styles
│       │   ├── admin.css                  # Admin dashboard styles
│       │   └── style.css                  # General styles
│       │
│       ├── js/
│       │   ├── auth.js                    # 🔐 Login handler
│       │   ├── api.js                     # 📡 API client wrapper
│       │   ├── admin-dashboard.js         # Admin dashboard logic
│       │   ├── admin-incentives.js        # Admin incentives logic
│       │   ├── admin.js                   # General admin utilities
│       │   ├── cp-dashboard.js            # CP dashboard logic
│       │   ├── cp.js                      # CP utilities
│       │   ├── dashboard.js               # Generic dashboard logic
│       │   └── admin-dashboard.js         # Tab switching & API calls
│       │
│       └── data/
│           └── districts.json             # District lookup data
│
├── docs/                                  # 📚 Documentation
│   ├── api.md                             # API documentation
│   ├── db.md                              # Database documentation
│   └── flows.md                           # Business flow documentation
│
└── frontend-react/                        # ⚠️ (IGNORED - Not Active)
    └── (React-based frontend alternative)
```

---

## 🔄 Application Flow

### 1️⃣ Authentication Flow

```
User
  ↓
[Login Page: /frontend/admin/login.html OR /frontend/cp/index.html]
  ↓
[Select Role: ADMIN or CP]
  ↓
[POST /auth/login]
  ├─→ backend/auth.controller.js
  │   └─→ Verify credentials from users table
  │   └─→ Generate JWT token
  │   └─→ Return token + role
  ↓
[localStorage.setItem('token')]
  ↓
[Role-Based Redirect]
  ├─→ ADMIN → /frontend/admin/dashboard.html
  └─→ CP   → /frontend/cp/dashboard.html
```

### 2️⃣ Admin Dashboard Flow

```
Admin User Login
  ↓
[Dashboard.html] - Main admin page
  ├─→ Sidebar Navigation
  │   ├─ Overview
  │   ├─ CP Applications
  │   ├─ Incentives
  │   ├─ Partners Management
  │   ├─ Settings
  │   └─ Activity Log
  ↓
Tab Switching (admin-dashboard.js)
  ↓
API Calls (with Bearer token)
  ├─→ [GET /admin/cp-applications]
  │   └─→ admin.controller.getCpApplications()
  │   └─→ Fetch from cp_applications + community_partners
  ↓
Review Application Modal
  ├─→ Display CP details & AOO checkboxes
  ├─→ [POST /admin/cp/:cp_id/approve] OR [POST /admin/cp/:cp_id/reject]
  │   └─→ admin.controller.approveCp() / rejectCp()
  │   └─→ Update cp_applications status
  │   └─→ Update community_partners AOO data
  ↓
[GET /admin/incentives]
  └─→ admin.controller.getIncentives()
  └─→ List pending incentive payments
  └─→ [POST /admin/incentives/:id/approve]
      └─→ Update incentive status
```

### 3️⃣ CP (Community Partner) Flow

```
CP User Login
  ↓
[CP Dashboard: cp/dashboard.html]
  ├─→ GET /cp/dashboard (cp.controller.getDashboard)
  ├─→ Display stats & quick actions
  ↓
CP Can:
  ├─ View & Manage Leads
  │  ├─→ [GET /cp/leads] → List all leads
  │  ├─→ [POST /cp/leads] → Create new lead
  │  └─→ [PATCH /cp/leads/:leadId/stage] → Update lead stage
  │
  ├─ View Incentives
  │  └─→ [GET /cp/incentives] → List earned incentives
  │
  ├─ View Profile
  │  └─→ [GET /cp/profile] → CP details
  │
  └─ Apply for CP (Initial)
     └─→ [POST /auth/cp/apply] → Submit application
         └─→ auth.controller.applyCp()
         └─→ Create cp_applications record
         └─→ Pending admin review
```

### 4️⃣ Database Transaction Flow

```
User Action
  ↓
Express Route → Middleware (auth check)
  ↓
Controller Function
  ↓
Prisma Client Query
  ├─ findMany() → Fetch records
  ├─ create() → Insert records
  ├─ update() → Modify records
  └─ delete() → Remove records
  ↓
PostgreSQL Database
  ↓
Response → Frontend
  ↓
JavaScript handles response & updates DOM
```

---

## 📊 Database Schema

### Core Models:

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **community_partners** | CP company info | cp_id, name, email, mobile, status (APPLIED/ACTIVE/REJECTED), aoo (JSON) |
| **cp_applications** | CP application submissions | application_id, cp_id, application_data (JSON), status (SUBMITTED/APPROVED/REJECTED) |
| **users** | Login credentials | user_id, email, password, role (ADMIN/CP), cp_id |
| **cp_leads** | Church leads managed by CP | lead_id, cp_id, church_name, location, stage, notes |
| **incentives** | Payment incentives | incentive_id, cp_id, lead_id, amount, status |
| **incentive_config** | Admin settings | key, value (stored amounts) |

---

## 🔐 Security Features

1. **JWT Authentication**
   - Tokens stored in localStorage
   - `Bearer` token in Authorization header
   - Secret: `process.env.LOGIN_SECRET`

2. **Role-Based Access Control (RBAC)**
   - Auth middleware checks roles
   - Routes protected: `/admin/*` (ADMIN only), `/cp/*` (CP only)
   - Invalid tokens → Auto-logout & redirect to login

3. **Password Security**
   - bcrypt hashing for passwords
   - bcryptjs available for compatibility

4. **CORS Enabled**
   - Frontend & backend can communicate

---

## 🛣️ API Routes Summary

### Auth Routes (`/auth`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | User login (email + password + role) |
| POST | `/auth/cp/apply` | CP application submission |

### Admin Routes (`/admin`) - 🔐 ADMIN only
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/cp-applications` | List all CP applications |
| POST | `/admin/cp/:cp_id/approve` | Approve CP application |
| POST | `/admin/cp/:cp_id/reject` | Reject CP application |
| GET | `/admin/incentives` | List pending incentives |
| POST | `/admin/incentives/:id/approve` | Approve incentive payment |
| GET | `/admin/incentive-config` | Get config settings |
| POST | `/admin/incentive-config` | Update config settings |

### CP Routes (`/cp`) - 🔐 CP only
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/cp/dashboard` | CP dashboard data & stats |
| POST | `/cp/leads` | Create new lead |
| GET | `/cp/leads` | List leads for this CP |
| PATCH | `/cp/leads/:leadId/stage` | Update lead progress stage |
| GET | `/cp/incentives` | List earned incentives |
| GET | `/cp/profile` | CP profile information |

---

## 🎯 Key Features

### For ADMIN:
- ✅ Dashboard with stats
- ✅ Review & approve/reject CP applications
- ✅ Manage CP partners
- ✅ Manage incentive payments
- ✅ Configure incentive amounts
- ✅ Activity audit log

### For CP:
- ✅ Apply to become CP
- ✅ Manage church leads
- ✅ Track lead progress (stages)
- ✅ View earned incentives
- ✅ View profile & status

---

## 🚀 Development Environment

**Backend Start:**
```bash
cd backend
npm install
npm run dev        # Uses nodemon for hot-reload
```

**Frontend Start:**
```bash
cd frontend
npm install
npm run dev        # Serve static files
```

**Environment Variables (`.env`):**
```
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/db
LOGIN_SECRET=powaha_super_secret_key_2026
```

---

## 📝 File Dependencies

```
Frontend Pages → assets/js/auth.js → assets/js/api.js → Backend API
                                  ↓
                            Bearer Token
                                  ↓
                         auth.middleware.js
                                  ↓
                         Route Controllers
                                  ↓
                          Prisma ORM
                                  ↓
                          PostgreSQL
```

---

## 🔄 Data Flow Examples

### Example 1: Admin Approves CP Application
```
1. Admin clicks "Approve" on application
2. JavaScript calls: POST /admin/cp/123/approve
3. auth.middleware validates token & role (ADMIN)
4. admin.controller.approveCp() processes
5. Prisma updates cp_applications.status = 'APPROVED'
6. Prisma updates community_partners.aoo = selected checkboxes
7. Response sent back
8. Frontend updates UI with success message
```

### Example 2: CP Creates a Lead
```
1. CP fills lead form (church name, location, stage)
2. JavaScript calls: POST /cp/leads (with Bearer token)
3. auth.middleware validates token & role (CP)
4. cp.controller.createLead() processes
5. Prisma creates cp_leads record
6. Response includes new lead_id
7. Frontend adds lead to table
```

---

## 📦 Dependencies Summary

**Backend (`backend/package.json`):**
- `@prisma/client` - ORM
- `express` - Web framework
- `jsonwebtoken` - JWT auth
- `bcrypt`, `bcryptjs` - Password hashing
- `dotenv` - Environment config
- `cors` - Cross-origin requests
- `uuid` - ID generation
- `nodemon` - Dev hot-reload

**Frontend (`frontend/`):**
- Vanilla JavaScript (no framework)
- jQuery-free
- Fetch API for HTTP requests
- localStorage for tokens

---

## ⚠️ Notes

1. **admin.service.js is empty** - Business logic should be moved here
2. **frontend-react/** is not active - Legacy alternative implementation
3. **Prisma migrations** - Located in `backend/prisma/migrations/`
4. **API_BASE** - Set to `http://localhost:5000` in `frontend/assets/js/api.js`
5. **JWT Secret** - Default is `powaha_super_secret_key_2026` (should be changed in production)

---

## 🔗 Key Integration Points

| Component | Integrates With | Purpose |
|-----------|-----------------|---------|
| auth.middleware.js | All routes | Token validation & role enforcement |
| api.js | All frontend JS | API calls with Bearer token |
| Prisma schema.prisma | All controllers | Database queries |
| auth.js | login.html | User authentication UI |
| admin-dashboard.js | dashboard.html | Tab switching & data loading |
| cp-dashboard.js | cp/dashboard.html | CP dashboard functionality |

---

## Summary

This is a **full-stack web application** for managing Community Partners with:
- **Role-based authentication** (Admin vs CP)
- **CRUD operations** on partners, applications, leads, and incentives
- **Audit trail** via audit middleware
- **Multi-tenant** ready (tenant middleware present)
- **RESTful API** with standardized responses
- **JWT-based security**
- **PostgreSQL** for persistent storage
- **Simple vanilla JS frontend** (no heavy frameworks)

The architecture follows **MVC pattern** with routes → controllers → services → database layer.
