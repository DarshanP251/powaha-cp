/* =========================
   AUTH HELPERS
========================= */

function authHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    throw new Error('NO_AUTH');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

function go(page) {
  window.location.href = page;
}

/* =========================
   ADMIN DASHBOARD STATS
========================= */

async function loadAdminDashboard() {
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error();

    const d = await res.json();

    if (document.getElementById('totalCps'))
      document.getElementById('totalCps').innerText = d.totalCps;

    if (document.getElementById('pendingApps'))
      document.getElementById('pendingApps').innerText = d.pendingApplications;

    if (document.getElementById('activeCps'))
      document.getElementById('activeCps').innerText = d.activeCps;

    if (document.getElementById('pendingIncentives'))
      document.getElementById('pendingIncentives').innerText = d.pendingIncentives;

  } catch {
    logout();
  }
}

/* =========================
   CP APPLICATION LIST (READ-ONLY)
========================= */

async function loadCpApplications() {
  try {
    const res = await fetch(`${API_BASE}/admin/cp-applications`, {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error();

    const apps = await res.json();
    const tbody = document.getElementById('applicationsBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    apps.forEach(app => {
      const data = app.application_data || {};
      const status = app.status;

      tbody.innerHTML += `
        <tr>
          <td>${data.name || '-'}</td>
          <td>${data.email || '-'}</td>
          <td>${data.mobile || '-'}</td>
          <td>
            <span class="status ${status.toLowerCase()}">${status}</span>
          </td>
          <td>
            ${
              status === 'SUBMITTED'
                ? `<button onclick="openCpReview('${app.application_id}')">
                     Review
                   </button>`
                : '-'
            }
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error('Load CP applications failed', err);
  }
}

function openCpReview(applicationId) {
  window.location.href =
    `/admin/cp-review.html?applicationId=${applicationId}`;
}

/* =========================
   ADMIN INCENTIVES
========================= */

async function loadIncentives() {
  try {
    const res = await fetch(`${API_BASE}/admin/incentives`, {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    const tbody = document.getElementById('incentivesBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!data.length) {
      tbody.innerHTML =
        `<tr><td colspan="6">No incentives found</td></tr>`;
      return;
    }

    data.forEach(i => {
      tbody.innerHTML += `
        <tr>
          <td>
            <strong>${i.cp_name}</strong><br>
            <span class="muted">${i.cp_email}</span>
          </td>
          <td>${i.church_name}</td>
          <td>${i.location}</td>
          <td>₹ ${i.amount}</td>
          <td>
            <span class="status ${i.status.toLowerCase()}">
              ${i.status}
            </span>
          </td>
          <td>
            ${
              i.status === 'PENDING'
                ? `<button onclick="approveIncentive('${i.incentive_id}')">
                     Approve
                   </button>`
                : '-'
            }
          </td>
        </tr>
      `;
    });

  } catch {
    logout();
  }
}

async function approveIncentive(id) {
  await fetch(`${API_BASE}/admin/incentives/${id}/approve`, {
    method: 'POST',
    headers: authHeaders()
  });

  loadIncentives();
}

/* =========================
   INCENTIVE CONFIG
========================= */

async function loadIncentiveConfig() {
  const el = document.getElementById('incentiveAmount');
  if (!el) return;

  const res = await fetch(`${API_BASE}/admin/incentive-config`, {
    headers: authHeaders()
  });

  if (!res.ok) return;

  const data = await res.json();
  el.value = data.value;
}

async function updateIncentive() {
  const el = document.getElementById('incentiveAmount');
  if (!el) return;

  const value = Number(el.value);
  if (value < 0) {
    alert('Invalid incentive amount');
    return;
  }

  await fetch(`${API_BASE}/admin/incentive-config`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ value })
  });

  alert('Incentive amount updated');
}

/* =========================
   AUTO INIT (SAFE)
========================= */

if (document.getElementById('applicationsBody')) {
  loadCpApplications();
}

if (document.getElementById('incentivesBody')) {
  loadIncentives();
}

if (document.getElementById('totalCps')) {
  loadAdminDashboard();
  loadIncentiveConfig();
}

/* =========================
   EXPOSE
========================= */

window.logout = logout;
window.go = go;
