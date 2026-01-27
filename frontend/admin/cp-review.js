/* =========================
   PARAMS
========================= */

const params = new URLSearchParams(window.location.search);
const applicationId = params.get("applicationId");

if (!applicationId) {
  alert("Invalid application");
  window.location.href = "/admin/dashboard.html";
}

let currentCpId = null;
let preferredAOO = [];

/* =========================
   LOAD APPLICATION
========================= */

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
    preferredAOO = app.pref_aoo || [];

    renderCpDetails(app);
    renderAOO(preferredAOO);

    document.getElementById("approveBtn").onclick = approveCp;
    document.getElementById("rejectBtn").onclick = rejectCp;

  } catch (err) {
    alert("Failed to load CP application");
    goBack();
  }
}

loadApplication();

/* =========================
   RENDER CP INFO
========================= */

function renderCpDetails(app) {
  document.getElementById("cpDetails").innerHTML = `
    <div>
      <label>Name</label>
      <p>${app.cp?.name || "-"}</p>
    </div>
    <div>
      <label>Email</label>
      <p>${app.cp?.email || "-"}</p>
    </div>
    <div>
      <label>Mobile</label>
      <p>${app.cp?.mobile || "-"}</p>
    </div>
    <div>
      <label>Status</label>
      <p><span class="badge pending">${app.status}</span></p>
    </div>
  `;
}

/* =========================
   RENDER ONLY SELECTED AOO
========================= */

function renderAOO(areas) {
  const container = document.getElementById("aooContainer");
  container.innerHTML = "";

  if (!areas.length) {
    container.innerHTML = `<p class="muted-text">No preferred areas selected</p>`;
    return;
  }

  areas.forEach(area => {
    container.innerHTML += `
      <label class="aoo-item">
        <input type="checkbox" value="${area}" checked />
        <span>${area}</span>
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
    document.querySelectorAll('#aooContainer input:checked')
  ).map(cb => cb.value);

  if (!selectedAOOs.length) {
    alert("Please select at least one AOO");
    return;
  }

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
