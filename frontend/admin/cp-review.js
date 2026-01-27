/* =========================
   PARAMS
========================= */

const params = new URLSearchParams(window.location.search);
const applicationId = params.get("applicationId");

if (!applicationId) {
  alert("Invalid application");
  window.location.href = "/admin/dashboard.html";
}

/* =========================
   LOAD APPLICATION
========================= */

let currentCpId = null;

async function loadApplication() {
  try {
    const res = await fetch(`${API_BASE}/admin/cp-applications`, {
      headers: authHeaders()
    });

    if (!res.ok) throw new Error();

    const applications = await res.json();
    const app = applications.find(a => a.application_id === applicationId);

    if (!app) {
      alert("Application not found");
      return goBack();
    }

    currentCpId = app.cp_id;

    document.getElementById("cpDetails").innerHTML = `
      <p><strong>Name:</strong> ${app.cp?.name || "-"}</p>
      <p><strong>Email:</strong> ${app.cp?.email || "-"}</p>
      <p><strong>Mobile:</strong> ${app.cp?.mobile || "-"}</p>
      <p><strong>Status:</strong> ${app.status}</p>
    `;

    renderAOOOptions();

    document.getElementById("approveBtn").onclick = approveCp;
    document.getElementById("rejectBtn").onclick = rejectCp;

  } catch (err) {
    alert("Failed to load CP application");
    goBack();
  }
}

loadApplication();

/* =========================
   AOO RENDER
========================= */

function renderAOOOptions() {
  const container = document.getElementById("aooContainer");

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
   APPROVE / REJECT
========================= */

async function approveCp() {
  if (!currentCpId) return;

  const selectedAOOs = Array.from(
    document.querySelectorAll('#aooContainer input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  try {
    const res = await fetch(
      `${API_BASE}/admin/cp/${currentCpId}/approve`,
      {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ aoo: selectedAOOs })
      }
    );

    if (!res.ok) throw new Error();

    alert("✅ CP approved");
    window.location.href = "/admin/dashboard.html";

  } catch {
    alert("Approval failed");
  }
}

async function rejectCp() {
  if (!currentCpId) return;
  if (!confirm("Reject this CP application?")) return;

  try {
    const res = await fetch(
      `${API_BASE}/admin/cp/${currentCpId}/reject`,
      {
        method: "POST",
        headers: authHeaders()
      }
    );

    if (!res.ok) throw new Error();

    alert("❌ CP rejected");
    window.location.href = "/admin/dashboard.html";

  } catch {
    alert("Rejection failed");
  }
}

/* =========================
   NAV
========================= */

function goBack() {
  window.location.href = "/admin/dashboard.html";
}
