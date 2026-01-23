/* =========================
   AUTH HELPERS
========================= */

if (typeof API_BASE === 'undefined') {
  console.error('API_BASE is not defined. Check api.js loading order.');
}

function authHeaders() {
  const token = localStorage.getItem('token');

  // 🔐 Redirect ONLY for protected CP pages
  if (!token) {
    window.location.href = '/cp/index.html';
    throw new Error('NO_AUTH');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('lastAppliedEmail');
  window.location.href = '../admin/login.html';
}

function go(page) {
  window.location.href = `/cp/${page}`;
}

/* =========================
   GLOBAL STATE
========================= */

let CP_AOO = [];

/* =========================
   DASHBOARD (SOURCE OF TRUTH)
========================= */

async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/cp/dashboard`, {
      headers: authHeaders()
    });

    if (!res.ok) return;

    const data = await res.json();

    // Update header
    const cpNameEl = document.getElementById('cpName');
    const cpStatusEl = document.getElementById('cpStatus');
    const cpStatusValueEl = document.getElementById('cpStatusValue');
    const cpAooEl = document.getElementById('cpAoo');
    const leadTotalEl = document.getElementById('leadTotal');
    const leadClosedEl = document.getElementById('leadClosed');
    const incTotalEl = document.getElementById('incTotal');
    const leadStagesEl = document.getElementById('leadStages');
    const incPendingEl = document.getElementById('incPending');
    const incApprovedEl = document.getElementById('incApproved');
    const incPaidEl = document.getElementById('incPaid');

    if (cpNameEl) cpNameEl.innerText = data.cp?.name || 'Welcome';
    if (cpStatusValueEl) cpStatusValueEl.innerText = data.cp?.status || '-';
    if (cpAooEl) cpAooEl.innerText = (data.aoo || []).length > 0 ? (data.aoo || []).join(', ') : 'Not assigned';

    // Update leads
    const totalLeads = data.leads?.total || 0;
    if (leadTotalEl) leadTotalEl.innerText = totalLeads;
    
    // Calculate closed leads
    const stages = data.leads?.by_stage || {};
    const closedLeads = stages['CLOSED'] || 0;
    if (leadClosedEl) leadClosedEl.innerText = closedLeads;

    // Update incentives total
    const incTotal = (data.incentives?.pending || 0) + (data.incentives?.approved || 0);
    if (incTotalEl) incTotalEl.innerText = incTotal;

    // Render lead stages
    if (leadStagesEl) {
      leadStagesEl.innerHTML = '';

      if (Object.keys(stages).length === 0) {
        leadStagesEl.innerHTML = '<li style="grid-column: 1/-1; text-align: center; color: #9ca3af;">No leads yet</li>';
      } else {
        const stageOrder = ['NEW', 'CONTACTED', 'DEMO', 'CLOSED'];
        stageOrder.forEach(stage => {
          if (stages[stage] !== undefined) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${stages[stage]}</strong><span>${stage}</span>`;
            leadStagesEl.appendChild(li);
          }
        });
      }
    }

    // Update incentives
    if (incPendingEl) incPendingEl.innerText = data.incentives?.pending || 0;
    if (incApprovedEl) incApprovedEl.innerText = data.incentives?.approved || 0;
    if (incPaidEl) incPaidEl.innerText = '0'; // Placeholder - update when payout tracking implemented

    CP_AOO = data.aoo || [];
    populateLocationDropdown();

  } catch (err) {
    console.error('Dashboard error', err);
  }
}

/* =========================
   AOO DROPDOWN
========================= */

function populateLocationDropdown() {
  const select = document.getElementById('location');
  if (!select) return;

  select.innerHTML = `<option value="">Select Location (AOO)</option>`;

  if (!CP_AOO.length) {
    select.innerHTML += `<option disabled>No AOO assigned</option>`;
    return;
  }

  CP_AOO.forEach(area => {
    const opt = document.createElement('option');
    opt.value = area;
    opt.textContent = area;
    select.appendChild(opt);
  });
}



async function addLead() {
  const churchInput = document.getElementById('church');
  const locationSelect = document.getElementById('location');
  const contactInput = document.getElementById('contact');
  const mobileInput = document.getElementById('mobile');

  const body = {
    church_name: churchInput.value.trim(),
    location: locationSelect.value,
    contact_person: contactInput.value.trim(),
    contact_mobile: mobileInput.value.trim()
  };

  if (!body.church_name || !body.location || !body.contact_mobile) {
    alert('All required fields must be filled');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cp/leads`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || 'Failed to create lead');
      return;
    }

    churchInput.value = '';
    contactInput.value = '';
    mobileInput.value = '';
    locationSelect.value = '';

    loadLeads();

  } catch (err) {
    if (err.message !== 'NO_AUTH') {
      console.error('Add lead error:', err);
    }
  }
}

async function loadLeads() {
  try {
    const res = await fetch(`${API_BASE}/cp/leads`, {
      headers: authHeaders()
    });

    if (res.status === 401 || res.status === 403) return;

    const data = await res.json();
    const tbody = document.getElementById('leads');
    if (!tbody) return;

    tbody.innerHTML = '';

    data.forEach(l => {
      tbody.innerHTML += `
        <tr>
          <td>${l.church_name}</td>
          <td>${l.location}</td>
          <td>${l.stage}</td>
          <td>
            <select
              onchange="updateStage('${l.lead_id}', this.value)"
              ${l.stage === 'CLOSED' ? 'disabled' : ''}
            >
              ${['NEW', 'CONTACTED', 'DEMO', 'CLOSED']
                .map(s =>
                  `<option ${l.stage === s ? 'selected' : ''}>${s}</option>`
                ).join('')}
            </select>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    if (err.message !== 'NO_AUTH') {
      console.error('Load leads error:', err);
    }
  }
}

async function updateStage(leadId, stage) {
  try {
    const res = await fetch(`${API_BASE}/cp/leads/${leadId}/stage`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ stage })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || 'Failed to update stage');
      return;
    }

    loadLeads();

  } catch (err) {
    if (err.message !== 'NO_AUTH') {
      console.error('Update stage error:', err);
    }
  }
}

/* =========================
   CP INCENTIVES
========================= */

async function loadIncentives() {
  try {
    const res = await fetch(`${API_BASE}/cp/incentives`, {
      headers: authHeaders()
    });

    if (res.status === 401 || res.status === 403) return;

    const data = await res.json();
    const tbody = document.getElementById('incentivesBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!data.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="muted">No incentives yet</td>
        </tr>
      `;
      return;
    }

    data.forEach(i => {
      tbody.innerHTML += `
        <tr>
          <td>${i.church_name || 'Unknown'}</td>
          <td>${i.location || '-'}</td>
          <td>₹ ${i.amount}</td>
          <td>
            <span class="status ${i.status.toLowerCase()}">${i.status}</span>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    if (err.message !== 'NO_AUTH') {
      console.error('Incentives error:', err);
    }
  }
}

/* =========================
   CP APPLICATION STATUS
========================= */

async function loadCpStatus() {
  try {
    const res = await fetch(`${API_BASE}/cp/dashboard`, {
      headers: authHeaders()
    });

    if (!res.ok) return;

    const data = await res.json();
    document.getElementById('status').innerText =
      `Your application status: ${data.status}`;

  } catch {
    document.getElementById('status').innerText =
      'Unable to load status';
  }
}



/* =========================
   CP APPLY
========================= */

async function applyCp() {
  localStorage.removeItem('token');
  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    mobile: document.getElementById('mobile').value.trim(),
    city: document.getElementById('city').value.trim(),
    state: document.getElementById('state').value.trim(),
    country: document.getElementById('country').value,
    background: document.getElementById('background').value.trim(),
    experience: document.getElementById('experience').value.trim(),
    preferred_aoo: window.getSelectedAoo(),
    password: document.getElementById('password').value,
    declaration: document.getElementById('declaration').checked
  };

  if (!payload.declaration) {
    alert('You must accept the declaration');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/cp/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Application failed');
      return;
    }

    localStorage.setItem('lastAppliedEmail', payload.email);
    alert('Application submitted successfully. Await admin approval.');
    window.location.href = '/cp/status.html';

  } catch (err) {
    console.error('CP Apply error:', err);
    alert('Something went wrong. Try again.');
  }
}

window.applyCp = applyCp;


/* =========================
   AUTO INIT (PAGE AWARE)
========================= */

if (document.getElementById('location')) {
  loadDashboard();
  loadLeads();
}

if (document.getElementById('incentivesBody')) {
  loadIncentives();
}

if (
  document.getElementById('status') &&
  !document.getElementById('location')
) {
  loadDashboard();
}

/* =========================
   EXPOSE FOR INLINE HTML
========================= */

window.addLead = addLead;
window.updateStage = updateStage;
window.logout = logout;
window.go = go;
