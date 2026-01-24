/* =========================
   ADMIN TAB SWITCHING
========================= */

function switchAdminTab(tabName) {
  // Hide all tabs
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Hide all nav buttons active state
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  // Show selected tab
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Mark nav button as active
  if (event && event.target) {
    event.target.classList.add('active');
  }

  // Load tab-specific data
  if (tabName === 'applications') loadApplications();
  if (tabName === 'incentives') loadIncentivesForApproval();
  if (tabName === 'partners') loadActivePartners();
  if (tabName === 'activity') loadActivityLog();
  if (tabName === 'overview') loadDashboardStats();
}

/* =========================
   LOAD DASHBOARD STATS
========================= */

async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: authHeaders()
    });

    if (!res.ok) return;

    const data = await res.json();

    document.getElementById('pendingApps').innerText = data.pendingApplications || 0;
    document.getElementById('activeCps').innerText = data.activeCps || 0;
    document.getElementById('pendingIncentives').innerText = data.pendingIncentives || 0;
    document.getElementById('totalCps').innerText = data.totalCps || 0;

  } catch (err) {
    console.error('Load dashboard stats error:', err);
  }
}

/* =========================
   LOAD APPLICATIONS
========================= */

async function loadApplications() {
  try {
    const res = await fetch(`${API_BASE}/admin/cp-applications`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      console.error("Failed to fetch CP applications");
      return;
    }

      const data = await res.json();
      // Store all applications globally for modal lookup
      window.allApplications = data;

      const tbody = document.getElementById("applicationsTable");
      tbody.innerHTML = "";

      const pending = data.filter(app => app.status === "SUBMITTED");

      if (!pending.length) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="empty-message">No pending applications</td></tr>';
        return;
      }

      pending.forEach(app => {
        const cp = app.cp || {};

        tbody.innerHTML += `
          <tr>
            <td><strong>${cp.name || "-"}</strong></td>
            <td>${cp.email || "-"}</td>
            <td>${cp.mobile || "-"}</td>
            <td>${new Date(app.created_at).toLocaleDateString()}</td>
            <td>
              <button class="btn-small" onclick="openApplicationModal('${app.application_id}')">
                Review
              </button>
            </td>
          </tr>
        `;
      });
  } catch (err) {
    console.error("Load applications error:", err);
  }
}


/* =========================
   LOAD INCENTIVES FOR APPROVAL
========================= */

async function loadIncentivesForApproval() {
  try {
    const res = await fetch(`${API_BASE}/admin/incentives`, {
      headers: authHeaders()
    });

    if (!res.ok) return;

    const data = await res.json();
    const tbody = document.getElementById('incentivesTable');
    tbody.innerHTML = '';

    const pending = data.filter(inc => inc.status === 'PENDING');

    if (!pending.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No pending incentives</td></tr>';
      return;
    }

    pending.forEach(inc => {
      tbody.innerHTML += `
        <tr>
          <td>${inc.lead_id || '-'}</td>
          <td>${inc.cp_id || '-'}</td>
          <td>₹ ${inc.amount}</td>
          <td><span class="badge pending">${inc.status}</span></td>
          <td>
            <button class="btn-success" onclick="approveIncentive('${inc.incentive_id}')">✅ Approve</button>
            <button class="btn-danger" onclick="rejectIncentive('${inc.incentive_id}')">❌ Reject</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error('Load incentives error:', err);
  }
}

/* =========================
   LOAD ACTIVE PARTNERS
========================= */

async function loadActivePartners() {
  try {
    const res = await fetch(`${API_BASE}/admin/cp-applications`, {
      headers: authHeaders()
    });

    if (!res.ok) return;

    const data = await res.json();
    const tbody = document.getElementById('partnersTable');
    tbody.innerHTML = '';

    const active = data.filter(app => app.status === 'APPROVED');

    if (!active.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No active partners</td></tr>';
      return;
    }

    active.forEach(app => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${app.cp_id || '-'}</strong></td>
          <td>Not available</td>
          <td>Not assigned</td>
          <td>-</td>
          <td><span class="badge active">ACTIVE</span></td>
          <td>
            <button class="btn-small" onclick="viewPartnerDetails('${app.cp_id}')">View</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error('Load partners error:', err);
  }
}

/* =========================
   LOAD ACTIVITY LOG
========================= */

async function loadActivityLog() {
  try {
    const activityItems = document.getElementById('activityItems');
    activityItems.innerHTML = '<p class="info-text">Activity logs are stored in backend/logs/audit.log</p>';
    
  } catch (err) {
    console.error('Load activity log error:', err);
  }
}
// Render Area of Operation (AOO) options as checkboxes (null-safe)
function renderAOOOptions(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error("AOO container not found:", containerId);
    return;
  }

  const aooOptions = [
    "Bangalore Urban",
    "Mysuru",
    "Tumakuru",
    "District A",
    "District B",
  ];

  container.innerHTML = "";

  aooOptions.forEach(area => {
    container.innerHTML += `
      <label>
        <input type="checkbox" value="${area}" />
        ${area}
      </label>
    `;
  });
}

/* =========================
   APPROVE/REJECT APPLICATIONS
========================= */

let currentCpId = null;

let currentApplicationId = null;
function openApplicationModal(applicationId) {
  currentApplicationId = applicationId;
  const modal = document.getElementById("reviewModal");
  if (!modal) {
    console.error("Review modal not found");
    return;
  }
  modal.classList.add("show");
  renderAOOOptions("aooContainer");
}

function closeReviewModal() {
  document.getElementById("reviewModal").classList.remove("show");
  currentApplicationId = null;
}

function closeApplicationModal() {
  document.getElementById('applicationModal').style.display = 'none';
  currentCpId = null;
}

async function loadCpApplicationDetails(cpId) {
  try {
    const res = await fetch(`${API_BASE}/admin/cp-applications`, {
      headers: authHeaders()
    });

    const data = await res.json();
    const app = data.find(a => a.cp_id === cpId);

    if (!app) return;

    document.getElementById('appDetails').innerHTML = `
      <div class="app-details">
        <p><strong>CP ID:</strong> ${app.cp_id}</p>
        <p><strong>Status:</strong> ${app.status}</p>
      </div>
    `;
    // AOO checkboxes are now rendered by renderAOOOptions in openApplicationModal
  } catch (err) {
    console.error('Load CP details error:', err);
  }
}

async function approveApplication() {
  try {
    if (!currentApplicationId) {
      alert("No application selected");
      return;
    }

    const selectedAOOs = Array.from(
      document.querySelectorAll('input[name="aoo"]:checked')
    ).map(cb => cb.value);

    const res = await fetch(`${API_BASE}/admin/cp-applications/approve`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        applicationId: currentApplicationId,
        aoo: selectedAOOs
      })
    });

    if (!res.ok) throw new Error("Approval failed");

    alert("Approved successfully");
    closeReviewModal();
    loadApplications();

  } catch (err) {
    console.error(err);
    alert("Approval failed");
  }
}

async function rejectCpApplication() {
  if (!confirm('Are you sure you want to reject this application?')) return;

  try {
    const res = await fetch(`${API_BASE}/admin/cp/${currentCpId}/reject`, {
      method: 'POST',
      headers: authHeaders()
    });

    if (!res.ok) {
      alert('Rejection failed');
      return;
    }

    alert('❌ CP rejected');
    closeApplicationModal();
    loadApplications();

  } catch (err) {
    console.error('Reject error:', err);
    alert('Error rejecting application');
  }
}

/* =========================
   INCENTIVE ACTIONS
========================= */

async function approveIncentive(incentiveId) {
  if (!confirm('Approve this incentive?')) return;

  try {
    const res = await fetch(`${API_BASE}/admin/incentives/${incentiveId}/approve`, {
      method: 'POST',
      headers: authHeaders()
    });

    if (!res.ok) {
      alert('Approval failed');
      return;
    }

    alert('✅ Incentive approved');
    loadIncentivesForApproval();

  } catch (err) {
    console.error('Approve incentive error:', err);
  }
}

function rejectIncentive(incentiveId) {
  alert('Incentive rejection feature coming soon');
}

/* =========================
   SETTINGS
========================= */

async function updateIncentiveConfig() {
  const amount = document.getElementById('incentiveAmount').value;

  if (!amount || amount < 0) {
    alert('Please enter a valid amount');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/admin/incentive-config`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ value: parseInt(amount) })
    });

    if (!res.ok) {
      alert('Update failed');
      return;
    }

    alert('✅ Incentive configuration updated');

  } catch (err) {
    console.error('Update config error:', err);
  }
}

function saveEmailConfig() {
  alert('Email configuration saved (feature in progress)');
}

function saveSystemSettings() {
  alert('System settings saved (feature in progress)');
}

function exportData() {
  alert('Data export feature coming soon');
}

function clearLogs() {
  if (confirm('Are you sure? This action cannot be undone.')) {
    alert('Logs cleared (feature in progress)');
  }
}

function viewPartnerDetails(cpId) {
  alert(`Partner details for ${cpId} (feature coming soon)`);
}

/* =========================
   PAGE LOAD
========================= */

loadDashboardStats();

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('applicationModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};
