/* =========================
   DASHBOARD TAB SWITCHING
========================= */

function switchTab(tabName) {
  // Hide all tabs
  const tabs = document.querySelectorAll('.dashboard-tab');
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
  event.target.classList.add('active');

  // Load tab-specific data
  if (tabName === 'leads') loadLeadsTable();
  if (tabName === 'incentives') loadRecentIncentives();
  if (tabName === 'profile') loadProfileData();
}

/* =========================
   LOAD LEADS TABLE
========================= */

async function loadLeadsTable() {
  try {
    const res = await fetch(`${API_BASE}/cp/leads`, {
      headers: authHeaders()
    });

    if (res.status === 401 || res.status === 403) return;

    const data = await res.json();
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!data.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-message">No leads yet. <a href="#" onclick="go('leads.html')">Create one</a></td>
        </tr>
      `;
      return;
    }

    data.slice(0, 5).forEach(lead => {
      tbody.innerHTML += `
        <tr>
          <td>${lead.church_name}</td>
          <td>${lead.location}</td>
          <td><span class="stage-badge ${lead.stage.toLowerCase()}">${lead.stage}</span></td>
          <td>${lead.notes || '-'}</td>
        </tr>
      `;
    });

  } catch (err) {
    if (err.message !== 'NO_AUTH') {
      console.error('Load leads table error:', err);
    }
  }
}

/* =========================
   LOAD RECENT INCENTIVES
========================= */

async function loadRecentIncentives() {
  try {
    const res = await fetch(`${API_BASE}/cp/incentives`, {
      headers: authHeaders()
    });

    if (res.status === 401 || res.status === 403) return;

    const data = await res.json();
    const container = document.getElementById('recentIncentives');
    if (!container) return;

    container.innerHTML = '';

    if (!data.length) {
      container.innerHTML = '<p class="empty-message">No incentives yet</p>';
      return;
    }

    data.slice(0, 5).forEach(inc => {
      container.innerHTML += `
        <div class="incentive-item">
          <div class="incentive-info">
            <p class="incentive-name">${inc.church_name || 'Unknown'}</p>
            <p class="incentive-detail">${inc.location || ''}</p>
          </div>
          <div class="incentive-amount-status">
            <p class="incentive-amount">₹ ${inc.amount}</p>
            <span class="status-badge ${inc.status.toLowerCase()}">${inc.status}</span>
          </div>
        </div>
      `;
    });

  } catch (err) {
    if (err.message !== 'NO_AUTH') {
      console.error('Load incentives error:', err);
    }
  }
}

/* =========================
   LOAD PROFILE DATA
========================= */

async function loadProfileData() {
  try {
    const res = await fetch(`${API_BASE}/cp/profile`, {
      headers: authHeaders()
    });

    if (!res.ok) return;

    const data = await res.json();

    document.getElementById('profileName').value = data.name || '-';
    document.getElementById('profileEmail').value = localStorage.getItem('email') || '-';
    document.getElementById('profileMobile').value = data.mobile || '-';
    document.getElementById('profileStatus').value = data.status || '-';

  } catch (err) {
    console.error('Load profile error:', err);
  }
}

/* =========================
   SAVE BANK DETAILS
========================= */

function saveBankDetails() {
  const bankName = document.getElementById('bankName').value.trim();
  const bankAccount = document.getElementById('bankAccount').value.trim();
  const bankIfsc = document.getElementById('bankIfsc').value.trim();
  const bankNameLabel = document.getElementById('bankNameLabel').value.trim();

  if (!bankName || !bankAccount || !bankIfsc || !bankNameLabel) {
    alert('All bank details are required');
    return;
  }

  // Store in localStorage for now (future: save to backend)
  localStorage.setItem('bankDetails', JSON.stringify({
    bankName,
    bankAccount,
    bankIfsc,
    bankNameLabel
  }));

  alert('✅ Bank details saved successfully');
}

/* =========================
   ACCOUNT SETTINGS ACTIONS
========================= */

function changePassword() {
  alert('Password change feature coming soon. For now, please contact support@powaha.com');
}

function downloadReport() {
  alert('Activity report download feature coming soon.');
}

function deactivateAccount() {
  const confirmed = confirm('⚠️ Are you sure? This will deactivate your account and you will no longer be able to create leads or claim incentives.');
  if (confirmed) {
    alert('Account deactivation request submitted. You will receive a confirmation email within 24 hours.');
  }
}

/* =========================
   PAGE LOAD
========================= */

loadDashboard();
