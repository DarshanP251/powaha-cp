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
   STATE
========================= */

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

    if (!res.ok) throw new Error("Fetch failed");

    const applications = await res.json();
    const app = applications.find(
      a => a.application_id === applicationId
    );

    if (!app) {
      alert("Application not found");
      return goBack();
    }

    currentCpId = app.cp_id;

    // ✅ CORRECT SOURCE
    preferredAOO =
      app.application_data?.preferred_aoo || [];

    renderCpDetails(app);
    renderAOO(preferredAOO);

    document.getElementById("approveBtn").onclick = approveCp;
    document.getElementById("rejectBtn").onclick = rejectCp;

  } catch (err) {
    console.error(err);
    alert("Failed to load CP application");
    goBack();
  }
}

loadApplication();

/* =========================
   RENDER CP INFO
========================= */

function renderCpDetails(app) {
  const data = app.application_data || {};

  document.getElementById("cpDetails").innerHTML = `
    <div>
      <label>Name</label>
      <p>${data.name || app.cp?.name || "-"}</p>
    </div>
    <div>
      <label>Email</label>
      <p>${data.email || app.cp?.email || "-"}</p>
    </div>
    <div>
      <label>Mobile</label>
      <p>${data.mobile || app.cp?.mobile || "-"}</p>
    </div>
    <div>
      <label>Status</label>
      <p><span class="badge pending">${app.status}</span></p>
    </div>
  `;
}

/* =========================
   RENDER DYNAMIC AOO (CP SELECTED)
========================= */

function renderAOO(areas) {
  const container = document.getElementById("aooContainer");
  container.innerHTML = "";

  if (!Array.isArray(areas) || !areas.length) {
    container.innerHTML =
      `<p class="muted-text">No AOO selected by CP</p>`;
    return;
  }

  areas.forEach(area => {
    container.innerHTML += `
      <div class="aoo-item">
        <label class="aoo-checkbox">
          <input type="checkbox" value="${area}" checked />
          <span class="checkmark"></span>
        </label>
        <div class="aoo-label">${area}</div>
      </div>
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

  } catch (err) {
    console.error(err);
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

  } catch (err) {
    console.error(err);
    alert("Rejection failed");
  }
}

/* =========================
   NAV
========================= */

function goBack() {
  window.location.href = "/admin/dashboard.html";
}
