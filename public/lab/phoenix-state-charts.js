/* ── Engine simulation ──────────────────────────────────────────────── */
var STATE = {
  hypotheses: { nominal: 0.80, thermal_drift: 0.10, source_aging: 0.10 },
  correction: 1.05,
  tolerance: 2.0,
  cycles: 0,
  activeNode: 0,
};

var COLORS = { nominal: '#22c55e', thermal_drift: '#f59e0b', source_aging: '#ef4444' };
var NAMES  = { nominal: 'Nominal', thermal_drift: 'Thermal Drift', source_aging: 'Source Aging' };

/* ── Render gauges ──────────────────────────────────────────────────── */
function renderGauges() {
  var wrap = document.getElementById('gauges');
  wrap.innerHTML = '';
  var keys = Object.keys(STATE.hypotheses);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = STATE.hypotheses[key];
    var pct = (val * 100).toFixed(1);
    var row = document.createElement('div');
    row.className = 'gauge-row';
    row.innerHTML =
      '<div class="gauge-name">' + NAMES[key] + '</div>' +
      '<div class="gauge-track">' +
        '<div class="gauge-fill" style="width:' + pct + '%;background:' + COLORS[key] + '"></div>' +
        '<div class="gauge-val">' + pct + '%</div>' +
      '</div>';
    wrap.appendChild(row);
  }
}

/* ── Update KPIs ────────────────────────────────────────────────────── */
function updateKPIs() {
  document.getElementById('kpiCorrection').textContent = STATE.correction.toFixed(3);
  document.getElementById('kpiTolerance').innerHTML = STATE.tolerance.toFixed(1) + '<span class="kpi-unit">%</span>';
  document.getElementById('kpiCycles').textContent = STATE.cycles;
}

/* ── Highlight active node ──────────────────────────────────────────── */
function highlightNode(idx) {
  var nodes = document.querySelectorAll('.node');
  for (var i = 0; i < nodes.length; i++) {
    var isActive = i === idx;
    nodes[i].classList.toggle('node-active', isActive);
    nodes[i].querySelector('.node-rect').style.strokeWidth = isActive ? '2.5' : '1.5';
  }
}

/* ── Flow particles visibility ──────────────────────────────────────── */
function showParticles() {
  var particles = document.querySelectorAll('.flow-particle');
  for (var i = 0; i < particles.length; i++) {
    particles[i].style.opacity = 0.9;
  }
}

/* ── Event log ──────────────────────────────────────────────────────── */
var LOG_MSGS = [
  { cls: 'log-ok',   msg: 'Sensor packet received — 4 photodiodes nominal' },
  { cls: 'log-shift', msg: 'Hypothesis weights updated — MHT iteration complete' },
  { cls: 'log-ok',   msg: 'State selected: nominal (p={p})' },
  { cls: 'log-warn', msg: 'Correction factor adjusted → {c}' },
  { cls: 'log-ok',   msg: 'Drive signal dispatched — dose within tolerance' },
  { cls: 'log-warn', msg: 'Thermal drift probability rising: {td}%' },
  { cls: 'log-shift', msg: 'Source aging weight shifted: {sa}%' },
  { cls: 'log-ok',   msg: 'Gating check passed — all hypotheses within bounds' },
];

function addLog(template) {
  var list = document.getElementById('logList');
  var now = new Date().toLocaleTimeString('en-US', { hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
  var msg = template.msg
    .replace('{p}', (STATE.hypotheses.nominal * 100).toFixed(1) + '%')
    .replace('{c}', STATE.correction.toFixed(3))
    .replace('{td}', (STATE.hypotheses.thermal_drift * 100).toFixed(1))
    .replace('{sa}', (STATE.hypotheses.source_aging * 100).toFixed(1));
  var el = document.createElement('div');
  el.innerHTML = '<span class="log-time">' + now + '</span><span class="' + template.cls + '">' + msg + '</span>';
  list.prepend(el);
  while (list.children.length > 40) list.removeChild(list.lastChild);
}

/* ── Simulation step ────────────────────────────────────────────────── */
function simStep() {
  var drift = (Math.random() - 0.48) * 0.04;
  var aging = (Math.random() - 0.48) * 0.02;

  var td = Math.max(0.02, Math.min(0.45, STATE.hypotheses.thermal_drift + drift));
  var sa = Math.max(0.02, Math.min(0.30, STATE.hypotheses.source_aging + aging));
  var nom = Math.max(0.20, 1 - td - sa);

  var total = nom + td + sa;
  STATE.hypotheses.nominal = nom / total;
  STATE.hypotheses.thermal_drift = td / total;
  STATE.hypotheses.source_aging = sa / total;

  STATE.correction = 1.0 + (STATE.hypotheses.thermal_drift * 0.15) + (STATE.hypotheses.source_aging * 0.25);
  STATE.tolerance = 2.0 + (1 - STATE.hypotheses.nominal) * 3.0;

  STATE.cycles++;

  STATE.activeNode = (STATE.activeNode + 1) % 5;
  highlightNode(STATE.activeNode);

  var logIdx = STATE.cycles % LOG_MSGS.length;
  addLog(LOG_MSGS[logIdx]);

  renderGauges();
  updateKPIs();
}

/* ── Init ───────────────────────────────────────────────────────────── */
renderGauges();
updateKPIs();
highlightNode(0);
showParticles();

addLog({ cls: 'log-ok', msg: 'Phoenix Engine initialized — Adaptive Gating Active' });
addLog({ cls: 'log-shift', msg: 'Loaded hypothesis priors: nominal=80%, thermal=10%, aging=10%' });

setInterval(simStep, 2200);
