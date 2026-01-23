# Admin Dashboard Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (Frontend)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          ADMIN DASHBOARD (dashboard.html)            │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │         Header (Logo + Logout)                 │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  │                                                      │   │
│  │  ┌──────────────┬────────────────────────────────┐  │   │
│  │  │   SIDEBAR    │      MAIN CONTENT AREA        │  │   │
│  │  │              │                                │  │   │
│  │  │ ┌──────────┐ │  ┌──────────────────────────┐ │  │   │
│  │  │ │Overview  │ │  │  Overview Tab (Default)  │ │  │   │
│  │  │ └──────────┘ │  │  - Stats Grid (4 cards)  │ │  │   │
│  │  │              │  │  - Quick Actions         │ │  │   │
│  │  │ ┌──────────┐ │  └──────────────────────────┘ │  │   │
│  │  │ │Applicat. │ │  OR                           │  │   │
│  │  │ └──────────┘ │  ┌──────────────────────────┐ │  │   │
│  │  │              │  │ Applications Tab         │ │  │   │
│  │  │ ┌──────────┐ │  │ - Search Box             │ │  │   │
│  │  │ │Incentves │ │  │ - Applications Table     │ │  │   │
│  │  │ └──────────┘ │  │ - Review Buttons        │ │  │   │
│  │  │              │  └──────────────────────────┘ │  │   │
│  │  │ ┌──────────┐ │  AND Modal:                   │  │   │
│  │  │ │Partners  │ │  ┌──────────────────────────┐ │  │   │
│  │  │ └──────────┘ │  │ Application Modal       │ │  │   │
│  │  │              │  │ - CP Details             │ │  │   │
│  │  │ ┌──────────┐ │  │ - AOO Checkboxes        │ │  │   │
│  │  │ │Settings  │ │  │ - Approve/Reject Btns  │ │  │   │
│  │  │ └──────────┘ │  └──────────────────────────┘ │  │   │
│  │  │              │                                │  │   │
│  │  │ ┌──────────┐ │                                │  │   │
│  │  │ │Activity  │ │                                │  │   │
│  │  │ └──────────┘ │                                │  │   │
│  │  │              │                                │  │   │
│  │  └──────────────┴────────────────────────────────┘  │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓ (API Calls)                      │
│                   [admin-dashboard.js]                      │
│              (Tab switching, API calls, DOM updates)        │
│                          ↓                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │            Admin Routes (admin.routes.js)          │    │
│  │                                                    │    │
│  │  GET  /admin/dashboard                            │    │
│  │  GET  /admin/cp-applications                      │    │
│  │  POST /admin/cp/:cp_id/approve                    │    │
│  │  POST /admin/cp/:cp_id/reject                     │    │
│  │  GET  /admin/incentives                           │    │
│  │  POST /admin/incentives/:id/approve               │    │
│  │  GET  /admin/incentive-config                     │    │
│  │  PUT  /admin/incentive-config                     │    │
│  │                                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │      Admin Controller (admin.controller.js)        │    │
│  │                                                    │    │
│  │  getDashboard()           → Fetch stats          │    │
│  │  getCpApplications()      → List pending CPs      │    │
│  │  approveCp()              → Approve CP (AOO)      │    │
│  │  rejectCp()               → Reject CP             │    │
│  │  getIncentives()          → List pending incentives
│  │  approveIncentive()       → Approve payment      │    │
│  │  getIncentiveConfig()     → Config data          │    │
│  │  updateIncentiveConfig()  → Update amount        │    │
│  │                                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │        Prisma ORM (Database Access Layer)         │    │
│  │                                                    │    │
│  │  findMany(cp_applications)                        │    │
│  │  findMany(community_partners)                     │    │
│  │  findMany(incentives)                            │    │
│  │  update(community_partners)                       │    │
│  │  update(cp_applications)                         │    │
│  │                                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↓                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                DATABASE (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Tables:                                                     │
│  ├── community_partners                                      │
│  │   ├── cp_id (PK)                                         │
│  │   ├── name, email, mobile                               │
│  │   ├── status (SUBMITTED, ACTIVE, REJECTED)              │
│  │   └── aoo (Area of Operation array)                     │
│  │                                                          │
│  ├── cp_applications                                        │
│  │   ├── application_id (PK)                               │
│  │   ├── cp_id (FK)                                        │
│  │   ├── status (SUBMITTED, APPROVED, REJECTED)            │
│  │   └── created_at, updated_at                            │
│  │                                                          │
│  ├── incentives                                             │
│  │   ├── incentive_id (PK)                                 │
│  │   ├── lead_id, cp_id (FK)                               │
│  │   ├── amount (decimal)                                  │
│  │   ├── status (PENDING, APPROVED, REJECTED)              │
│  │   └── created_at, updated_at                            │
│  │                                                          │
│  └── audit_log (stored in backend/logs/audit.log)          │
│      ├── timestamp                                          │
│      ├── action (CP_APPROVED, INCENTIVE_APPROVED, etc)     │
│      └── details (json)                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
User Interaction
    ↓
Tab Click → switchAdminTab(tabName)
    ↓
Hide all tabs, Show selected tab
    ↓
Call tab-specific load function
    ├─ Overview: loadDashboardStats()
    ├─ Applications: loadApplications()
    ├─ Incentives: loadIncentivesForApproval()
    ├─ Partners: loadActivePartners()
    ├─ Activity: loadActivityLog()
    └─ Settings: (no auto-load)
    ↓
Fetch from API (authHeaders + JWT)
    ↓
Parse JSON response
    ↓
Update DOM (populate tables, update stats)
    ↓
Display to user

---

Application Approval Flow
    ↓
Admin clicks "Review" button
    ↓
openApplicationModal(cpId) called
    ↓
Load CP details via loadCpApplicationDetails()
    ↓
Display modal with:
    - CP info
    - AOO checkboxes
    - Approve/Reject buttons
    ↓
User selects AOO and clicks "Approve"
    ↓
approveCpApplication() called
    ↓
POST /admin/cp/:cp_id/approve with AOO array
    ↓
Backend updates:
    - community_partners status → ACTIVE
    - cp_applications status → APPROVED
    - Records audit log entry
    ↓
Frontend closes modal and reloads table
    ↓
Updated row shows in Applications list
```

## Data Flow Diagram

```
Frontend State
├── Token (localStorage)
├── Tab state (DOM)
├── Table data (DOM)
└── Form data (inputs)

↓ (on action)

API Request
├── Method: GET/POST/PUT
├── URL: /admin/...
├── Headers: Authorization Bearer {token}
└── Body: JSON data

↓ (network)

Backend Processing
├── Auth Middleware: Verify JWT token
├── Route Handler: Match endpoint
├── Controller: Business logic
├── Prisma: Database query
└── Audit Service: Log action

↓ (response)

API Response
├── Status: 200/400/500
├── Body: JSON (data or error)
└── Headers: Content-Type

↓ (on success)

Frontend Update
├── Parse response JSON
├── Update DOM elements
├── Show success message
└── Refresh tables if needed
```

## Authentication Flow

```
┌─────────────────┐
│  Login Page     │
└────────┬────────┘
         ↓
    POST /auth/login
    (email + password)
         ↓
    ✅ Success
         ↓
    Response: { token: "jwt..." }
         ↓
    localStorage.setItem('token', jwt)
         ↓
    Redirect to /admin/dashboard.html
         ↓
┌─────────────────────────┐
│  Admin Dashboard        │
└────────┬────────────────┘
         ↓
    Each API call:
    authHeaders() → {
        Authorization: "Bearer {jwt}",
        Content-Type: "application/json"
    }
         ↓
    Backend verifies token
    ├─ ✅ Valid → Process request
    └─ ❌ Invalid → 401 Unauthorized
         ↓
    Logout button:
    localStorage.removeItem('token')
    Redirect to login.html
```

## Modal Workflow

```
┌──────────────────┐
│  Applications    │
│  Table           │
└────────┬─────────┘
         │ Click "Review"
         ↓
    openApplicationModal(cpId)
         ↓
    ┌─────────────────────────────────┐
    │     Application Modal           │
    │ ┌─────────────────────────────┐ │
    │ │ CP Details (name, email)    │ │
    │ └─────────────────────────────┘ │
    │ ┌─────────────────────────────┐ │
    │ │ AOO Selection (checkboxes)  │ │
    │ │ □ Bangalore Urban           │ │
    │ │ □ Mysuru                    │ │
    │ │ □ Tumakuru                  │ │
    │ └─────────────────────────────┘ │
    │ ┌──────────┬──────────┐        │
    │ │ Approve  │  Reject  │        │
    │ └──────────┴──────────┘        │
    │  [X] Close                      │
    └─────────────────────────────────┘
         ↓
    User selects AOO and action
         ↓
    approveCpApplication() or rejectCpApplication()
         ↓
    API POST request
         ↓
    Backend processes
         ↓
    closeApplicationModal()
         ↓
    loadApplications() → Refresh table
         ↓
    Back to Applications Table
```

## CSS Grid System

```
┌─────────────────────────────────────────────────┐
│             Admin Header (full width)            │
├─────────────────────────────────────────────────┤
│          │                                       │
│ Sidebar  │              Main Content             │
│  280px   │        (flex: 1)                      │
│          │                                       │
│  ├─────┐ │  ┌──────────────────────────────┐   │
│  │Nav  │ │  │    Tabs + Content Area      │   │
│  │Btn  │ │  │                              │   │
│  ├─────┤ │  │  ┌─ Stats Grid (4 cols) ───┐│   │
│  │Nav  │ │  │  │                          ││   │
│  │Btn  │ │  │  │ ┌─────┬─────┬─────┬─────┤│   │
│  ├─────┤ │  │  │ │Card │Card │Card │Card ││   │
│  │...  │ │  │  │ └─────┴─────┴─────┴─────┘│   │
│  │     │ │  │  │                          ││   │
│  └─────┘ │  │  ├─ Table (auto width) ─────┐│   │
│          │  │  │ ┌──────────────────────┐ ││   │
│          │  │  │ │ Header │ Header │... │ ││   │
│          │  │  │ ├──────────────────────┤ ││   │
│          │  │  │ │ Data   │ Data   │... │ ││   │
│          │  │  │ └──────────────────────┘ ││   │
│          │  │  └──────────────────────────┘│   │
│          │  └──────────────────────────────┘   │
│          │                                       │
└─────────────────────────────────────────────────┘

Mobile View (stacked):
┌─────────────────────────────────┐
│      Admin Header               │
├─────────────────────────────────┤
│ ┌─ Sidebar (horizontal) ──────┐ │
│ │[Ovrvw][Apps][Incentiv][...] │ │
│ └─────────────────────────────┘ │
│ ┌─ Main Content (full width) ─┐ │
│ │                              │ │
│ │ ┌─ Stats (1 col) ────────┐  │ │
│ │ │ Card │ Card │ Card ... │  │ │
│ │ └──────────────────────────┘  │ │
│ │                              │ │
│ │ ┌─ Table (scrollable) ─────┐ │ │
│ │ │ ...content...            │ │ │
│ │ └──────────────────────────┘ │ │
│ │                              │ │
│ └──────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## File Dependencies

```
admin/dashboard.html
├── api.js (API_BASE, authHeaders)
├── auth.js (logout function)
├── admin.js (shared utilities)
├── admin-dashboard.js (main controller)
│   └── Depends on: API_BASE, authHeaders()
├── admin.css (styling)
│   └── Contains: responsive grid system
└── Browser localStorage (JWT token)

admin-dashboard.js
├── authHeaders() from admin.js
├── API_BASE from api.js
├── DOM IDs from dashboard.html
└── Fetch API (native browser)

admin.css
├── No dependencies
├── Resets browser defaults
└── Custom properties/classes
```

---

**Diagram Last Updated**: 2025-01-21
**Status**: Complete and Accurate
