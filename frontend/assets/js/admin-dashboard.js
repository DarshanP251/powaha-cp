/* =========================
   ADMIN TAB SWITCHING
========================= */

function switchAdminTab(tabName) {
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) selectedTab.classList.add('active');

  if (event && event.target) event.target.classList.add('active');

  if (tabName === 'applications') loadApplications();
  if (tabName === 'incentives') loadIncentivesForApproval();
  if (tabName === 'partners') loadActivePartners();
  if (tabName === 'activity') loadActivityLog();
  if (tabName === 'overview') loadDashboardStats();
}

/* =========================
   DASHBOARD STATS
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
    console.error('Dashboard stats error:', err);
  }
}

/* =========================
   LOAD CP APPLICATIONS
========================= */

async function loadApplications() {
  try {
    const res = await fetch(`${API_BASE}/admin/cp-applications`, {
      headers: authHeaders()
    });

    if (!res.ok) return;

    const data = await res.json();
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
            <button class="btn-small"
              onclick="reviewCpApplication('${app.application_id}')">
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
   REVIEW REDIRECT
========================= */

function reviewCpApplication(applicationId) {
  window.location.href = `/admin/cp-review.html?applicationId=${applicationId}`;
}

/* =========================
   CP REVIEW PAGE LOGIC
========================= */

const urlParams = new URLSearchParams(window.location.search);
const reviewApplicationId = urlParams.get("applicationId");

if (
  reviewApplicationId &&
  window.location.pathname.includes("cp-review.html")
) {
  loadApplicationForReview(reviewApplicationId);
}

async function loadApplicationForReview(applicationId) {
  try {
    const res = await fetch(`${API_BASE}/admin/cp-applications`, {
      headers: authHeaders()
    });

    if (!res.ok) return;

    const apps = await res.json();
    const app = apps.find(a => a.application_id === applicationId);
    if (!app) return;

    document.getElementById("cpDetails").innerHTML = `
      <p><strong>Name:</strong> ${app.cp?.name || "-"}</p>
      <p><strong>Email:</strong> ${app.cp?.email || "-"}</p>
      <p><strong>Mobile:</strong> ${app.cp?.mobile || "-"}</p>
      <p><strong>Status:</strong> ${app.status}</p>
    `;

    renderAOOOptions("aooContainer");

    document.getElementById("approveBtn").onclick =
      () => approveCpFromReview(app.cp_id);

    document.getElementById("rejectBtn").onclick =
      () => rejectCpFromReview(app.cp_id);

  } catch (err) {
    console.error("Load review error:", err);
  }
}

/* =========================
   AOO OPTIONS
========================= */

function renderAOOOptions(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const areas = [
    "Bangalore Urban",
    "Mysuru",
    "Tumakuru",
    "District A",
    "District B"
  ];

  container.innerHTML = "";
  areas.forEach(area => {
    container.innerHTML += `
      <label>
        <input type="checkbox" value="${area}" />
        ${area}
      </label>
    `;
  });
}

/* =========================
   APPROVE / REJECT CP
========================= */

async function approveCpFromReview(cpId) {
  const selectedAOOs = Array.from(
    document.querySelectorAll('#aooContainer input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  try {
    const res = await fetch(`${API_BASE}/admin/cp/${cpId}/approve`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ aoo: selectedAOOs })
    });

    if (!res.ok) throw new Error();

    alert("✅ CP approved");
    window.location.href = "/admin/dashboard.html";

  } catch {
    alert("Approval failed");
  }
}

async function rejectCpFromReview(cpId) {
  if (!confirm("Reject this CP?")) return;

  try {
    const res = await fetch(`${API_BASE}/admin/cp/${cpId}/reject`, {
      method: "POST",
      headers: authHeaders()
    });

    if (!res.ok) throw new Error();

    alert("❌ CP rejected");
    window.location.href = "/admin/dashboard.html";

  } catch {
    alert("Rejection failed");
  }
}

/* =========================
   INCENTIVES
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

    const pending = data.filter(i => i.status === 'PENDING');

    if (!pending.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="empty-message">No pending incentives</td></tr>';
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
            <button class="btn-success"
              onclick="approveIncentive('${inc.incentive_id}')">
              ✅ Approve
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Incentive load error:", err);
  }
}

async function approveIncentive(incentiveId) {
  if (!confirm("Approve incentive?")) return;

  const res = await fetch(
    `${API_BASE}/admin/incentives/${incentiveId}/approve`,
    { method: "POST", headers: authHeaders() }
  );

  if (res.ok) {
    alert("✅ Incentive approved");
    loadIncentivesForApproval();
  }
}

/* =========================
   ACTIVE PARTNERS
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
      tbody.innerHTML =
        '<tr><td colspan="6" class="empty-message">No active partners</td></tr>';
      return;
    }

    active.forEach(app => {
      tbody.innerHTML += `
        <tr>
          <td>${app.cp_id}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td><span class="badge active">ACTIVE</span></td>
          <td>
            <button class="btn-small"
              onclick="viewPartnerDetails('${app.cp_id}')">
              View
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Partners load error:", err);
  }
}

/* =========================
   ACTIVITY LOG
========================= */

function loadActivityLog() {
  document.getElementById('activityItems').innerHTML =
    '<p class="info-text">Activity logs are stored in backend audit logs</p>';
}

/* =========================
   UTIL
========================= */

function viewPartnerDetails(cpId) {
  alert(`Partner profile for ${cpId} coming next`);
}

/* =========================
   PAGE INIT
========================= */

loadDashboardStats();
