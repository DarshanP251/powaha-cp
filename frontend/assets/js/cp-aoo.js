/* =========================
   CP AOO DYNAMIC LOGIC
========================= */

let DISTRICTS = [];
let STATES = new Set();
let ALL_AOO = [];
let SELECTED_AOO = new Set();

const stateInput = document.getElementById('state');
const cityInput = document.getElementById('city');
const selectEl = document.getElementById('preferredAoo');

const stateBox = document.getElementById('stateSuggestions');
const districtBox = document.getElementById('districtSuggestions');

// Load districts
fetch('../assets/data/districts.json')
  .then(res => res.json())
  .then(data => {
    DISTRICTS = data.filter(d => d.State && d.District);

    DISTRICTS.forEach(d => STATES.add(d.State));

    ALL_AOO = DISTRICTS.map(d => ({
      value: d.District,
      label: `${d.District}, ${d.State}`,
      state: d.State
    }));
  });

/* =========================
   STATE AUTOCOMPLETE
========================= */

stateInput.addEventListener('input', () => {
  const query = stateInput.value.toLowerCase();
  stateBox.innerHTML = '';

  if (!query) return stateBox.style.display = 'none';

  [...STATES]
    .filter(s => s.toLowerCase().includes(query))
    .slice(0, 10)
    .forEach(state => {
      const div = document.createElement('div');
      div.textContent = state;
      div.onclick = () => {
        stateInput.value = state;
        stateBox.style.display = 'none';
        updateAoo();
      };
      stateBox.appendChild(div);
    });

  stateBox.style.display = 'block';
});

/* =========================
   DISTRICT AUTOCOMPLETE
========================= */

cityInput.addEventListener('input', () => {
  const query = cityInput.value.toLowerCase();
  const state = stateInput.value;

  districtBox.innerHTML = '';
  if (!query || !state) return districtBox.style.display = 'none';

  DISTRICTS
    .filter(d =>
      d.State === state &&
      d.District.toLowerCase().includes(query)
    )
    .slice(0, 10)
    .forEach(d => {
      const div = document.createElement('div');
      div.textContent = d.District;
      div.onclick = () => {
        cityInput.value = d.District;
        districtBox.style.display = 'none';
        updateAoo();
      };
      districtBox.appendChild(div);
    });

  districtBox.style.display = 'block';
});

/* =========================
   AOO FILTER + RENDER
========================= */

selectEl.addEventListener('change', () => {
  Array.from(selectEl.options).forEach(opt => {
    opt.selected
      ? SELECTED_AOO.add(opt.value)
      : SELECTED_AOO.delete(opt.value);
  });
});

function updateAoo() {
  const state = stateInput.value;
  const districtQuery = cityInput.value.toLowerCase();

  const filtered = ALL_AOO.filter(item =>
    (!state || item.state === state) &&
    item.value.toLowerCase().includes(districtQuery)
  );

  renderAooOptions(filtered);
}

function renderAooOptions(list) {
  selectEl.innerHTML = '';

  if (!list.length) {
    const opt = document.createElement('option');
    opt.textContent = 'No matching districts';
    opt.disabled = true;
    selectEl.appendChild(opt);
    return;
  }

  list.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.value;
    opt.textContent = item.label;

    if (SELECTED_AOO.has(item.value)) opt.selected = true;

    selectEl.appendChild(opt);
  });
}

// expose for submit
window.getSelectedAoo = () => Array.from(SELECTED_AOO);
