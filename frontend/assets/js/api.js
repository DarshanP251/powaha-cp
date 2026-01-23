/* =========================
   API CONFIG
========================= */

const API_BASE = 'http://localhost:5000';

/* =========================
   AUTH HEADERS
========================= */
function authHeaders() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('NO_AUTH');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/* =========================
   API FETCH WRAPPER
========================= */
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options.headers || {})
      }
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error('UNAUTHORIZED');
    }

    return await res.json();

  } catch (err) {
    if (err.message === 'NO_AUTH' || err.message === 'UNAUTHORIZED') {
      localStorage.removeItem('token');

      // Safe fallback redirect
      const path = window.location.pathname;
      if (path.includes('/admin/')) {
        window.location.href = '/frontend/admin/login.html';
      } else {
        window.location.href = '/frontend/cp/index.html';
      }
      return;
    }

    throw err;
  }
}

/* =========================
   NAVIGATION HELPERS
========================= */
function logout() {
  localStorage.removeItem('token');

  const path = window.location.pathname;
  if (path.includes('/admin/')) {
    window.location.href = '/frontend/admin/login.html';
  } else {
    window.location.href = '/frontend/cp/index.html';
  }
}

function go(page) {
  if (page.startsWith('/')) {
    window.location.href = page;
  } else {
    window.location.href = `/frontend/cp/${page}`;
  }
}
