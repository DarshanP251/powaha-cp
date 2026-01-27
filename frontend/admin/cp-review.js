const params = new URLSearchParams(window.location.search);
const appId = params.get("appId");

if (!appId) {
  alert("Invalid application");
  window.location.href = "/admin/dashboard.html";
}

async function loadApplication() {
  try {
    const res = await fetch(
      `${API_BASE}/admin/cp-applications/${appId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    if (!res.ok) throw new Error("Failed to load");

    const data = await res.json();

    document.getElementById("cpDetails").innerHTML = `
      <p><b>Name:</b> ${data.full_name}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Mobile:</b> ${data.mobile}</p>
      <p><b>City:</b> ${data.city}</p>
      <p><b>Preferred AOO:</b> ${JSON.stringify(data.pref_aoo)}</p>
    `;

  } catch (err) {
    alert("Failed to load CP application");
  }
}

loadApplication();

async function approveCp() {
  await updateStatus("approve");
}

async function rejectCp() {
  await updateStatus("reject");
}

async function updateStatus(action) {
  try {
    const res = await fetch(
      `${API_BASE}/admin/cp-applications/${appId}/${action}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    if (!res.ok) throw new Error();

    alert(`Application ${action}d`);
    window.location.href = "/admin/dashboard.html";

  } catch {
    alert("Action failed");
  }
}
