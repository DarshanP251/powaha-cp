/* =========================
   LOGIN – ROLE BASED
========================= */

let selectedRole = null;

/* =========================
   ROLE SELECTION
========================= */
document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.role-btn')
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');
    selectedRole = btn.dataset.role;
  });
});

/* =========================
   LOGIN HANDLER
========================= */
async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const error = document.getElementById('error');

  error.innerText = '';

  if (!email || !password) {
    error.innerText = 'Email and password are required';
    return;
  }

  if (!selectedRole) {
    error.innerText = 'Please select a role (Admin or CP)';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        role: selectedRole
      })
    });

    const data = await res.json();

    if (!res.ok) {
      error.innerText = data.message || 'Login failed';
      return;
    }

    /* =========================
       STORE TOKEN
    ========================= */
    localStorage.setItem('token', data.token);

    /* =========================
       ROLE-BASED REDIRECT
    ========================= */
    if (data.role === 'ADMIN') {
      window.location.href = '/admin/dashboard.html';
    } else if (data.role === 'CP') {
      window.location.href = '/cp/dashboard.html';
    } else {
      localStorage.removeItem('token');
      error.innerText = 'Invalid role';
    }

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    error.innerText = 'Server error. Please try again.';
  }
}
