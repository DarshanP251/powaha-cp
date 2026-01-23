# Admin Dashboard - Quick Reference Guide

## 📊 Dashboard Overview

The new admin dashboard provides complete control over Community Partner (CP) management, incentive approvals, and system configuration.

## 🎯 Accessing the Dashboard

1. Navigate to: `http://localhost:3000/frontend/admin/dashboard.html` (after login)
2. Login with: `admin@powaha.com` / `admin123`

## 📑 Tab Descriptions

### 📊 Overview Tab (Default)
**Purpose**: Quick view of key metrics and quick actions

**Components**:
- **Pending Applications** - Count of CPs awaiting approval
- **Active CPs** - Number of approved community partners
- **Pending Incentives** - Count of incentive approvals needed
- **Total CPs** - Total registered CPs
- **Quick Actions** - Rapid access buttons to applications, incentives, partners, settings

### 📋 Applications Tab
**Purpose**: Review and approve/reject CP applications

**Features**:
- Search box to find applications by CP name or email
- Table showing:
  - CP ID
  - Email address
  - Mobile number
  - Application date
  - Review button (opens approval modal)

**Approval Workflow**:
1. Click "Review" button on an application
2. Modal opens showing CP details
3. Select Areas of Operation (AOO) - checkboxes
4. Click "Approve" to assign AOO and approve CP, or "Reject" to deny
5. CP status updates to APPROVED or REJECTED

### 💰 Incentives Tab
**Purpose**: Review and approve pending incentive payments

**Features**:
- Search box to find incentives by CP name
- Table showing:
  - Church/Lead name
  - CP name/ID
  - Amount in rupees (₹)
  - Lead stage
  - Status (PENDING, APPROVED, REJECTED)
  - Action buttons (✅ Approve, ❌ Reject)

**Approval Actions**:
- Click green "✅ Approve" to approve and mark incentive as paid
- Click red "❌ Reject" to reject the incentive

### 🤝 Partners Tab
**Purpose**: View active community partners and their operations

**Features**:
- Search box to filter partners
- Table showing:
  - CP ID/Name
  - Email address
  - Area of Operation (AOO) assigned
  - Created date
  - Status badge (ACTIVE)
  - View button for partner details

**Actions**:
- "View" button opens detailed partner information

### ⚙️ Settings Tab
**Purpose**: Configure system parameters and manage settings

**Sections**:

1. **Incentive Configuration**
   - Set default incentive amount (₹)
   - Apply to all new incentive calculations
   - Save changes

2. **Email Configuration**
   - SMTP server settings
   - Email template configuration
   - Test email functionality

3. **System Settings**
   - General application settings
   - Notification preferences
   - Data retention policies

4. **Advanced Actions**
   - Export Data - Download CP/incentive data as CSV/Excel
   - Clear Logs - Remove old audit logs (irreversible)

### 📊 Activity Tab
**Purpose**: View audit trail of all admin actions

**Features**:
- Complete log of:
  - CP approvals/rejections
  - Incentive approvals
  - Configuration changes
  - User logins
- Timestamps for each action
- Filter dropdown to search by action type
- Activity icon indicators

**Log Sources**: Data comes from `backend/logs/audit.log`

---

## 🔐 Security Features

✅ **JWT Authentication** - All requests require valid admin token
✅ **Role-based Access** - Only ADMIN users can access this dashboard
✅ **Audit Logging** - All actions are logged to audit trail
✅ **Session Management** - Logout clears token from localStorage

---

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, mobile
- **Smooth Animations** - Tab transitions fade in smoothly
- **Color Coding** - Status badges use colors (green=active, yellow=pending, red=rejected)
- **Hover Effects** - Interactive elements have clear hover states
- **Clear Typography** - High contrast, readable fonts
- **Icon Indicators** - Emoji icons for visual quick scanning

---

## 📱 Responsive Breakpoints

- **Desktop (> 1024px)**: Full sidebar + multi-column grids
- **Tablet (768px - 1024px)**: Narrower sidebar, 2-column grids
- **Mobile (< 768px)**: Horizontal nav, stacked layout, full-width elements

---

## 🐛 Troubleshooting

### "No pending applications"
- ✓ Check if CPs have submitted applications via CP portal
- ✓ Verify CP status in database is 'SUBMITTED'

### "Table not loading"
- ✓ Ensure admin is logged in and has valid JWT token
- ✓ Check browser console (F12) for API errors
- ✓ Verify backend is running on correct port

### "Approve button not working"
- ✓ Select at least one AOO (Area of Operation)
- ✓ Check network tab in DevTools for failed requests
- ✓ Verify backend endpoint `/admin/cp/:cp_id/approve` exists

### "Modal won't close"
- ✓ Click the X button in top-right corner
- ✓ Click outside the modal area
- ✓ Press Escape key (if implemented)

---

## 📊 Data Flow

```
Admin Dashboard
    ↓
JWT Authentication (authHeaders())
    ↓
API Endpoints (/admin/...)
    ↓
Backend Controllers (admin.controller.js)
    ↓
Database (Prisma queries)
    ↓
Audit Log (audit.service.js)
```

---

## 🚀 Performance Tips

- Searches are client-side (instant filtering)
- Lazy loading tables on tab switch (avoid loading unused data)
- Pagination recommended for large datasets (to be implemented)
- Caching used for district/AOO reference data

---

## 📞 Support

For issues or features requests:
1. Check audit logs for error patterns
2. Review browser DevTools console (F12)
3. Check backend logs in `backend/logs/`
4. Verify database connectivity

---

## 🎓 Developer Notes

### JavaScript Structure
- `admin-dashboard.js` - Main controller (400 lines)
- `admin.js` - Shared utilities (authHeaders, logout, etc.)
- `api.js` - API base configuration

### CSS Architecture
- `admin.css` - Admin-specific styles
- Grid system for responsive layouts
- Flexbox for component layouts
- Custom properties for colors/spacing

### Key Functions to Know
```javascript
switchAdminTab(tabName)           // Tab navigation
loadApplications()                // Fetch pending applications
approveCpApplication()            // Approve with AOO
loadIncentivesForApproval()       // Fetch incentives
approveIncentive(id)              // Approve incentive
```

---

## 📈 Future Roadmap

- [ ] Bulk actions (approve multiple applications)
- [ ] Advanced filtering and sorting
- [ ] Real-time notifications
- [ ] Partnership with payment gateways
- [ ] Analytics dashboards
- [ ] Scheduled reports
- [ ] Role-based sub-admins
- [ ] API rate limiting and quotas

