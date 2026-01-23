/* =========================
   AUTH HELPERS
========================= */

function authHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return {};
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
   DISTRICTS CACHE
========================= */

let DISTRICTS = [];

async function loadDistricts() {
  if (DISTRICTS.length) return;
  const res = await fetch('../assets/data/districts.json');
  DISTRICTS = await res.json();
}

/* =========================
   CP APPLICATIONS
========================= */

async function loadCpApplications() {
  await loadDistricts();

  const res = await fetch(`${API_BASE}/admin/cp-applications`, {
    headers: authHeaders()
  });

  if (!res.ok) return logout();

  const apps = await res.json();
  const tbody = document.getElementById('appsBody');
  tbody.innerHTML = '';

  apps.forEach(app => {
    const cp = app.cp;
    const statusClass = app.status.toLowerCase();

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cp.name}</td>
      <td>${cp.email}</td>
      <td>${cp.mobile}</td>

      <td>
        <span class="status ${statusClass}">
          ${app.status}
        </span>
      </td>

      <td>
        ${
          app.status === 'SUBMITTED'
            ? renderAooDropdown(app.cp_id)
            : '-'
        }
      </td>

      <td class="actions-cell">
        ${
          app.status === 'SUBMITTED'
            ? `
              <button id="approve-${app.cp_id}" disabled
                onclick="approveAndAssign('${app.cp_id}')">
                Approve
              </button>
              <button class="outline danger"
                onclick="rejectCp('${app.cp_id}')">
                Reject
              </button>
            `
            : '-'
        }
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/* =========================
   AOO DROPDOWN
========================= */

function renderAooDropdown(cpId) {
  return `
    <div class="aoo-dropdown" data-cp="${cpId}">
      <div class="aoo-selected">
        <span>Select districts</span>
      </div>

      <div class="aoo-options">
        <div class="aoo-search">
          <input type="text" placeholder="Search districts..."
            onkeyup="filterAooOptions(this)">
        </div>

        ${DISTRICTS.map(d => {
          if (!d.District) return '';
          return `
            <label>
              <input type="checkbox" value="${d.District}">
              ${d.District} (${d.State})
            </label>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* =========================
   DROPDOWN INTERACTION
========================= */

document.addEventListener('click', (e) => {
  const dropdown = e.target.closest('.aoo-dropdown');

  document.querySelectorAll('.aoo-options').forEach(opt => {
    if (!dropdown || !opt.parentElement.contains(e.target)) {
      opt.style.display = 'none';
    }
  });

  if (e.target.closest('.aoo-selected')) {
    const options = dropdown.querySelector('.aoo-options');
    options.style.display =
      options.style.display === 'block' ? 'none' : 'block';
  }
});

document.addEventListener('change', (e) => {
  if (e.target.type !== 'checkbox') return;

  const dropdown = e.target.closest('.aoo-dropdown');
  const cpId = dropdown.dataset.cp;
  const approveBtn = document.getElementById(`approve-${cpId}`);

  const selected = [...dropdown.querySelectorAll('input:checked')]
    .map(cb => cb.value);

  dropdown.querySelector('.aoo-selected span').innerText =
    selected.length
      ? `${selected.length} selected`
      : 'Select districts';

  if (approveBtn) approveBtn.disabled = selected.length === 0;
});

function filterAooOptions(input) {
  const query = input.value.toLowerCase();
  input.closest('.aoo-options')
    .querySelectorAll('label')
    .forEach(label => {
      label.style.display =
        label.innerText.toLowerCase().includes(query)
          ? 'flex'
          : 'none';
    });
}

/* =========================
   APPROVE / REJECT CP
========================= */

async function approveAndAssign(cpId) {
  const dropdown = document.querySelector(`.aoo-dropdown[data-cp="${cpId}"]`);
  const aoo = [...dropdown.querySelectorAll('input:checked')]
    .map(cb => cb.value);

  if (!aoo.length) {
    alert('Select at least one Area of Operation');
    return;
  }

  await fetch(`${API_BASE}/admin/cp/${cpId}/assign-aoo`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ aoo })
  });

  await fetch(`${API_BASE}/admin/cp/${cpId}/approve`, {
    method: 'POST',
    headers: authHeaders()
  });

  loadCpApplications();
}

async function rejectCp(cpId) {
  if (!confirm('Are you sure you want to reject this CP?')) return;

  await fetch(`${API_BASE}/admin/cp/${cpId}/reject`, {
    method: 'POST',
    headers: authHeaders()
  });

  loadCpApplications();
}

/* =========================
   ADMIN INCENTIVES
========================= */

async function loadIncentives() {
  const res = await fetch(`${API_BASE}/admin/incentives`, {
    headers: authHeaders()
  });

  if (!res.ok) return logout();

  const data = await res.json();
  const tbody = document.getElementById('incentivesBody');
  tbody.innerHTML = '';

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="6">No incentives found</td></tr>`;
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
  const res = await fetch(`${API_BASE}/admin/incentive-config`, {
    headers: authHeaders()
  });

  if (!res.ok) return;

  const data = await res.json();
  document.getElementById('incentiveAmount').value = data.value;
}

async function updateIncentive() {
  const value = Number(document.getElementById('incentiveAmount').value);

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
   ADMIN DASHBOARD
========================= */

async function loadAdminDashboard() {
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: authHeaders()
  });

  if (!res.ok) return logout();

  const d = await res.json();

  document.getElementById('totalCps').innerText = d.totalCps;
  document.getElementById('pendingApps').innerText = d.pendingApplications;
  document.getElementById('activeCps').innerText = d.activeCps;
  document.getElementById('pendingIncentives').innerText = d.pendingIncentives;
}

/* =========================
   AUTO INIT
========================= */

// Simple CP Applications loader
async function loadCpApplications() {
  try {
    const res = await fetch(`${API_BASE}/admin/cp-applications`, {
      headers: authHeaders()
    });

    const data = await res.json();
    const tbody = document.getElementById('applicationsBody');
    tbody.innerHTML = '';

    data.forEach(app => {
      const cp = app.application_data || {};
      const status = app.status;

      tbody.innerHTML += `
        <tr>
          <td>${cp.name || '-'}</td>
          <td>${cp.email || '-'}</td>
          <td>${cp.mobile || '-'}</td>
          <td>${status}</td>
          <td>
            ${
              status === 'SUBMITTED'
                ? `<button onclick="approvePrompt('${app.cp_id}')">Approve</button>
                   <button onclick="rejectCp('${app.cp_id}')">Reject</button>`
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

function approvePrompt(cpId) {
  const aoo = prompt(
    'Enter AOO districts (comma separated):\nExample: Bengaluru Urban, Bengaluru Rural'
  );

  if (!aoo) return;

  approveCp(cpId, aoo.split(',').map(a => a.trim()));
}

async function approveCp(cpId, aoo) {
  const res = await fetch(`${API_BASE}/admin/cp/${cpId}/approve`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ aoo })
  });

  if (res.ok) {
    alert('CP approved');
    loadCpApplications();
  } else {
    alert('Approval failed');
  }
}

async function rejectCp(cpId) {
  if (!confirm('Reject this CP application?')) return;

  const res = await fetch(`${API_BASE}/admin/cp/${cpId}/reject`, {
    method: 'POST',
    headers: authHeaders()
  });

  if (res.ok) {
    alert('CP rejected');
    loadCpApplications();
  }
}

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
