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

async function loadIncentives() {
  const res = await fetch(`${API_BASE}/admin/incentives`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    alert('Access denied');
    return;
  }

  const data = await res.json();
  const tbody = document.getElementById('incentivesBody');
  tbody.innerHTML = '';

  data.forEach(i => {
    tbody.innerHTML += `
      <tr>
        <td>${i.incentive_id}</td>
        <td>${i.cp_id}</td>
        <td>${i.lead_id}</td>
        <td>₹ ${i.amount}</td>
        <td>${i.status}</td>
        <td>
          ${
            i.status === 'PENDING'
              ? `<button onclick="approve('${i.incentive_id}')">Approve</button>`
              : '-'
          }
        </td>
      </tr>
    `;
  });
}

async function approve(id) {
  await fetch(`${API_BASE}/admin/incentives/${id}/approve`, {
    method: 'POST',
    headers: authHeaders()
  });

  loadIncentives();
}

loadIncentives();
