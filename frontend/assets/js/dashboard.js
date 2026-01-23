async function loadApplications() {
  const res = await fetch(`${API_BASE}/admin/cp-applications`, {
    headers: authHeaders()
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  const data = await res.json();
  const tbody = document.querySelector('#applications tbody');
  tbody.innerHTML = '';

  data.forEach(app => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${app.application_data.name}</td>
      <td>${app.application_data.email}</td>
      <td>${app.status}</td>
      <td>
        ${app.status === 'SUBMITTED'
          ? `<button onclick="approve('${app.cp_id}')">Approve</button>`
          : '-'}
      </td>
    `;

    tbody.appendChild(tr);
  });
}

async function approve(cpId) {
  await fetch(`${API_BASE}/admin/cp/${cpId}/approve`, {
    method: 'POST',
    headers: authHeaders()
  });

  loadApplications();
}

loadApplications();
