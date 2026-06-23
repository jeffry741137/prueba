<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin — Itachi Zone</title>
<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #08020e;
  color: #f0e0e0;
  font-family: 'Segoe UI', sans-serif;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

/* ── LOGIN ─────────────────────────────────── */
#loginWrap {
  width: 100%;
  max-width: 420px;
  margin-top: 10vh;
}
.login-card {
  background: rgba(16,4,22,.97);
  border: 1px solid rgba(229,9,20,0.3);
  border-radius: 20px;
  padding: 40px 32px;
}
.login-card h1 { font-size: 22px; font-weight: 700; color: #ff6ec7; margin-bottom: 4px; }
.login-card p  { font-size: 12px; color: #a08080; margin-bottom: 28px; }

/* ── MAIN LAYOUT ────────────────────────────── */
#adminWrap {
  display: none;
  width: 100%;
  max-width: 1100px;
  gap: 20px;
  flex-direction: column;
  padding-top: 10px;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.top-bar h1 { font-size: 20px; font-weight: 700; color: #ff6ec7; }
.top-bar .stats { font-size: 12px; color: #a08080; }
.top-bar .stats span { color: #ff6ec7; font-weight: 700; }

/* ── PANELS ─────────────────────────────────── */
.panels {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 780px) {
  .panels { grid-template-columns: 1fr; }
}

.panel {
  background: rgba(16,4,22,.97);
  border: 1px solid rgba(229,9,20,0.2);
  border-radius: 16px;
  padding: 24px 22px;
}
.panel-title {
  font-size: 12px;
  font-weight: 700;
  color: #a08080;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-title .dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #e91e8c;
  flex-shrink: 0;
}

/* ── FORM ───────────────────────────────────── */
label {
  font-size: 11px;
  font-weight: 700;
  color: #a08080;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 6px;
}

input[type="text"], input[type="password"], select, textarea {
  width: 100%;
  padding: 11px 14px;
  background: rgba(12,4,18,.85);
  border: 1.5px solid rgba(229,9,20,0.22);
  border-radius: 10px;
  font-size: 13px;
  color: #f0e0e0;
  outline: none;
  margin-bottom: 14px;
  font-family: 'Segoe UI', sans-serif;
  transition: border-color .2s;
}
input:focus, select:focus, textarea:focus { border-color: #e91e8c; }
select option { background: #1a0a1a; }
textarea { resize: vertical; min-height: 110px; line-height: 1.6; }

.hint {
  font-size: 11px;
  color: #704060;
  margin-top: -10px;
  margin-bottom: 14px;
  line-height: 1.5;
}

/* ── BUTTONS ────────────────────────────────── */
.btn {
  padding: 11px 18px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-full { width: 100%; justify-content: center; }
.btn-pink  { background: linear-gradient(135deg,#8b0050,#e91e8c); color:#fff; }
.btn-pink:hover  { opacity: .88; }
.btn-ghost { background: rgba(229,9,20,.07); border: 1px solid rgba(229,9,20,.28); color: #ff6ec7; }
.btn-ghost:hover { background: rgba(229,9,20,.15); }
.btn-danger { background: rgba(229,9,20,.1); border: 1px solid rgba(229,9,20,.35); color: #ff6ec7; }
.btn-danger:hover { background: rgba(229,9,20,.22); }
.btn-green  { background: rgba(0,229,160,.09); border: 1px solid rgba(0,229,160,.3); color: #00e5a0; }
.btn-green:hover  { background: rgba(0,229,160,.18); }
.btn-sm { padding: 6px 11px; font-size: 11px; border-radius: 7px; }

/* ── MSG ────────────────────────────────────── */
.msg {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 14px;
  display: none;
}
.msg.ok  { background: rgba(0,229,160,.08);  border: 1px solid rgba(0,229,160,.3);  color: #00e5a0; }
.msg.err { background: rgba(229,9,20,.08);   border: 1px solid rgba(229,9,20,.3);   color: #ff6ec7; }

/* ── TABLA CORREOS ──────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.toolbar input[type="text"] {
  flex: 1;
  margin: 0;
  min-width: 140px;
  padding: 8px 12px;
  font-size: 12px;
}
.sel-count {
  font-size: 12px;
  color: #a08080;
  white-space: nowrap;
}
.sel-count span { color: #ff6ec7; font-weight: 700; }

.table-wrap {
  overflow-y: auto;
  max-height: 480px;
  border: 1px solid rgba(229,9,20,0.15);
  border-radius: 10px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
thead th {
  position: sticky;
  top: 0;
  background: rgba(30,4,40,.98);
  padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: #a08080;
  text-transform: uppercase;
  letter-spacing: .8px;
  border-bottom: 1px solid rgba(229,9,20,.15);
  z-index: 2;
}
thead th:first-child { width: 38px; }
tbody tr {
  border-bottom: 1px solid rgba(229,9,20,.07);
  transition: background .15s;
}
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: rgba(233,30,140,.05); }
tbody tr.selected { background: rgba(233,30,140,.1); }
tbody td {
  padding: 9px 14px;
  vertical-align: middle;
}
.td-correo { font-weight: 600; color: #f0e0e0; word-break: break-all; }
.td-svc {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
}
.svc-netflix { color: #e50914; }
.svc-disney  { color: #0063e5; }
.td-fecha { font-size: 11px; color: #705060; white-space: nowrap; }
.td-del   { text-align: center; }

input[type="checkbox"] {
  width: 15px;
  height: 15px;
  accent-color: #e91e8c;
  cursor: pointer;
  margin: 0;
}

.empty-row td {
  text-align: center;
  padding: 32px;
  color: #502040;
  font-size: 13px;
}

/* ── DIVIDER ─────────────────────────────────── */
.divider { height: 1px; background: rgba(229,9,20,.15); margin: 18px 0; }

/* ── BATCH RESULT ────────────────────────────── */
.batch-result {
  background: rgba(12,4,18,.9);
  border: 1px solid rgba(229,9,20,.2);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12px;
  color: #a08080;
  margin-top: 10px;
  display: none;
  line-height: 1.7;
}
.batch-result .ok-line  { color: #00e5a0; }
.batch-result .err-line { color: #ff6ec7; }
</style>
</head>
<body>

<!-- ═══════════ LOGIN ═══════════ -->
<div id="loginWrap">
  <div class="login-card">
    <h1>🔐 Panel Admin</h1>
    <p>Itachi Zone — Acceso restringido</p>
    <div id="loginMsg" class="msg"></div>
    <label>Contraseña</label>
    <input type="password" id="passInput" placeholder="••••••••" />
    <button class="btn btn-pink btn-full" onclick="login()">Entrar</button>
  </div>
</div>

<!-- ═══════════ ADMIN ═══════════ -->
<div id="adminWrap">

  <!-- Top bar -->
  <div class="top-bar">
    <div>
      <h1>⚡ Itachi Zone — Admin</h1>
      <div class="stats">Total registrados: <span id="totalCount">0</span> correos</div>
    </div>
    <button class="btn btn-ghost btn-sm" onclick="cerrarSesion()">Cerrar sesión</button>
  </div>

  <div id="topMsg" class="msg"></div>

  <div class="panels">

    <!-- ── Panel izquierdo: agregar ── -->
    <div>

      <!-- Agregar uno -->
      <div class="panel" style="margin-bottom:16px">
        <div class="panel-title"><span class="dot"></span> Agregar correo</div>

        <label>Correo alias iCloud</label>
        <input type="text" id="correoInput" placeholder="alias@icloud.com" />

        <label>Servicio</label>
        <select id="servicioSelect">
          <option value="netflix">Netflix</option>
          <option value="disney">Disney+</option>
        </select>

        <button class="btn btn-pink btn-full" onclick="agregarUno()">➕ Agregar correo</button>
      </div>

      <!-- Agregar varios (batch) -->
      <div class="panel">
        <div class="panel-title"><span class="dot"></span> Agregar varios a la vez</div>

        <label>Pega los correos (uno por línea)</label>
        <textarea id="batchInput" placeholder="alias1@icloud.com&#10;alias2@icloud.com&#10;alias3@icloud.com"></textarea>
        <p class="hint">Puedes pegar tantos correos como quieras, uno por línea.</p>

        <label>Servicio para todos</label>
        <select id="batchServicio">
          <option value="netflix">Netflix</option>
          <option value="disney">Disney+</option>
        </select>

        <button class="btn btn-pink btn-full" onclick="agregarBatch()">⚡ Agregar todos</button>

        <div class="batch-result" id="batchResult"></div>
      </div>

    </div>

    <!-- ── Panel derecho: lista ── -->
    <div class="panel">
      <div class="panel-title"><span class="dot"></span> Correos registrados</div>

      <!-- Toolbar -->
      <div class="toolbar">
        <input type="text" id="searchInput" placeholder="🔍 Buscar correo..." oninput="renderTabla()" />
        <div class="sel-count">Seleccionados: <span id="selCount">0</span></div>
        <button class="btn btn-green btn-sm"  onclick="copiarSeleccionados()" title="Copiar seleccionados">📋 Copiar</button>
        <button class="btn btn-danger btn-sm" onclick="borrarSeleccionados()" title="Borrar seleccionados">🗑 Borrar</button>
        <button class="btn btn-ghost btn-sm"  onclick="seleccionarTodo()" title="Seleccionar / deseleccionar todo">☑ Todo</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="chkAll" onchange="toggleAll(this.checked)" /></th>
              <th>Correo</th>
              <th>Servicio</th>
              <th>Agregado</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="tablaCuerpo">
            <tr class="empty-row"><td colspan="5">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<script>
const API = '/api/admin';
let token    = '';
let cuentas  = {};   // { correo: { servicio, fecha } }
let selected = new Set();

/* ── UTILS ───────────────────────────────── */
function showMsg(id, tipo, texto, dur = 4000) {
  const el = document.getElementById(id);
  el.className = 'msg ' + tipo;
  el.textContent = texto;
  el.style.display = 'block';
  if (dur > 0) setTimeout(() => { el.style.display = 'none'; }, dur);
}

function fmtFecha(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' })
      + ' ' + d.toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' });
  } catch { return '—'; }
}

/* ── LOGIN ───────────────────────────────── */
async function login() {
  const pass = document.getElementById('passInput').value.trim();
  if (!pass) return;
  try {
    const res = await fetch(API, { headers: { Authorization: 'Bearer ' + pass } });
    if (res.status === 401) { showMsg('loginMsg','err','❌ Contraseña incorrecta.'); return; }
    token = pass;
    document.getElementById('loginWrap').style.display  = 'none';
    document.getElementById('adminWrap').style.display  = 'flex';
    document.getElementById('adminWrap').style.flexDirection = 'column';
    await cargarCuentas();
  } catch(e) { showMsg('loginMsg','err','❌ Error de conexión.'); }
}

document.getElementById('passInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});

function cerrarSesion() {
  token = ''; cuentas = {}; selected.clear();
  document.getElementById('loginWrap').style.display  = '';
  document.getElementById('adminWrap').style.display  = 'none';
  document.getElementById('passInput').value = '';
}

/* ── CARGA ───────────────────────────────── */
async function cargarCuentas() {
  const res  = await fetch(API, { headers: { Authorization: 'Bearer ' + token } });
  const data = await res.json();
  cuentas = data.cuentas || {};
  selected.clear();
  renderTabla();
}

/* ── TABLA ───────────────────────────────── */
function renderTabla() {
  const q     = document.getElementById('searchInput').value.toLowerCase().trim();
  const tbody = document.getElementById('tablaCuerpo');
  const keys  = Object.keys(cuentas).filter(c => !q || c.includes(q));

  document.getElementById('totalCount').textContent = Object.keys(cuentas).length;
  document.getElementById('selCount').textContent   = selected.size;

  if (keys.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">${q ? 'Sin resultados.' : 'No hay correos registrados.'}</td></tr>`;
    return;
  }

  // Ordenar por fecha desc
  keys.sort((a,b) => {
    const fa = cuentas[a].fecha || '';
    const fb = cuentas[b].fecha || '';
    return fb.localeCompare(fa);
  });

  tbody.innerHTML = keys.map(correo => {
    const c   = cuentas[correo];
    const sel = selected.has(correo);
    const svcClass = c.servicio === 'netflix' ? 'svc-netflix' : 'svc-disney';
    return `<tr class="${sel ? 'selected' : ''}" data-correo="${correo}">
      <td><input type="checkbox" ${sel ? 'checked' : ''} onchange="toggleSel('${correo}', this.checked)" /></td>
      <td class="td-correo">${correo}</td>
      <td class="td-svc ${svcClass}">${c.servicio}</td>
      <td class="td-fecha">${fmtFecha(c.fecha)}</td>
      <td class="td-del"><button class="btn btn-danger btn-sm" onclick="borrarUno('${correo}')">🗑</button></td>
    </tr>`;
  }).join('');

  // Estado del checkbox "Todos"
  const chkAll = document.getElementById('chkAll');
  chkAll.indeterminate = selected.size > 0 && selected.size < keys.length;
  chkAll.checked = selected.size > 0 && selected.size === keys.length;
}

/* ── SELECCIÓN ───────────────────────────── */
function toggleSel(correo, checked) {
  if (checked) selected.add(correo); else selected.delete(correo);
  renderTabla();
}

function toggleAll(checked) {
  const q    = document.getElementById('searchInput').value.toLowerCase().trim();
  const keys = Object.keys(cuentas).filter(c => !q || c.includes(q));
  if (checked) keys.forEach(c => selected.add(c));
  else keys.forEach(c => selected.delete(c));
  renderTabla();
}

function seleccionarTodo() {
  const q    = document.getElementById('searchInput').value.toLowerCase().trim();
  const keys = Object.keys(cuentas).filter(c => !q || c.includes(q));
  const allSel = keys.every(c => selected.has(c));
  if (allSel) keys.forEach(c => selected.delete(c));
  else        keys.forEach(c => selected.add(c));
  renderTabla();
}

/* ── COPIAR ──────────────────────────────── */
async function copiarSeleccionados() {
  if (selected.size === 0) { showMsg('topMsg','err','⚠️ Selecciona al menos un correo.'); return; }
  const texto = [...selected].join('\n');
  try {
    await navigator.clipboard.writeText(texto);
    showMsg('topMsg','ok',`✅ ${selected.size} correo(s) copiado(s) al portapapeles.`);
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = texto; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    showMsg('topMsg','ok',`✅ ${selected.size} correo(s) copiado(s).`);
  }
}

/* ── AGREGAR UNO ─────────────────────────── */
async function agregarUno() {
  const correo   = document.getElementById('correoInput').value.trim().toLowerCase();
  const servicio = document.getElementById('servicioSelect').value;
  if (!correo || !correo.includes('@')) { showMsg('topMsg','err','❌ Correo inválido.'); return; }
  const res  = await fetch(API, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, servicio }),
  });
  const data = await res.json();
  if (data.ok) {
    showMsg('topMsg','ok','✅ Correo agregado.');
    document.getElementById('correoInput').value = '';
    cuentas = data.cuentas || cuentas;
    // Si la API no devuelve fecha, la ponemos localmente
    if (cuentas[correo] && !cuentas[correo].fecha)
      cuentas[correo].fecha = new Date().toISOString();
    renderTabla();
  } else {
    showMsg('topMsg','err','❌ ' + (data.error || 'Error.'));
  }
}

/* ── AGREGAR BATCH ───────────────────────── */
async function agregarBatch() {
  const raw      = document.getElementById('batchInput').value;
  const servicio = document.getElementById('batchServicio').value;
  const lineas   = raw.split('\n').map(l => l.trim().toLowerCase()).filter(l => l.includes('@'));
  if (lineas.length === 0) { showMsg('topMsg','err','❌ No hay correos válidos.'); return; }

  const resultEl = document.getElementById('batchResult');
  resultEl.style.display = 'block';
  resultEl.innerHTML = `<span style="color:#a08080">⏳ Agregando ${lineas.length} correos...</span>`;

  let ok = 0, err = 0, lines = [];

  for (const correo of lineas) {
    try {
      const res  = await fetch(API, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, servicio }),
      });
      const data = await res.json();
      if (data.ok) {
        ok++;
        cuentas = data.cuentas || cuentas;
        if (cuentas[correo] && !cuentas[correo].fecha)
          cuentas[correo].fecha = new Date().toISOString();
        lines.push(`<span class="ok-line">✅ ${correo}</span>`);
      } else {
        err++;
        lines.push(`<span class="err-line">❌ ${correo} — ${data.error || 'error'}</span>`);
      }
    } catch {
      err++;
      lines.push(`<span class="err-line">❌ ${correo} — sin conexión</span>`);
    }
    // Actualiza en tiempo real
    resultEl.innerHTML = lines.join('<br>') + `<br><br><strong>Total: ${ok} ok, ${err} errores</strong>`;
    renderTabla();
  }

  document.getElementById('batchInput').value = '';
  showMsg('topMsg', ok > 0 ? 'ok' : 'err', `✅ ${ok} agregados, ❌ ${err} errores`);
}

/* ── BORRAR UNO ──────────────────────────── */
async function borrarUno(correo) {
  if (!confirm(`¿Borrar ${correo}?`)) return;
  const res  = await fetch(API, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo }),
  });
  const data = await res.json();
  if (data.ok) {
    delete cuentas[correo]; selected.delete(correo);
    showMsg('topMsg','ok','✅ Correo eliminado.');
    renderTabla();
  } else {
    showMsg('topMsg','err','❌ ' + (data.error || 'Error.'));
  }
}

/* ── BORRAR SELECCIONADOS ────────────────── */
async function borrarSeleccionados() {
  if (selected.size === 0) { showMsg('topMsg','err','⚠️ Selecciona al menos un correo.'); return; }
  if (!confirm(`¿Borrar ${selected.size} correo(s) seleccionado(s)?`)) return;

  const lista = [...selected];
  let ok = 0, err = 0;
  showMsg('topMsg','ok',`⏳ Borrando ${lista.length}...`, -1);

  for (const correo of lista) {
    try {
      const res  = await fetch(API, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      if (data.ok) { ok++; delete cuentas[correo]; selected.delete(correo); }
      else err++;
    } catch { err++; }
    renderTabla();
  }

  showMsg('topMsg', ok > 0 ? 'ok' : 'err', `✅ ${ok} eliminados, ❌ ${err} errores`);
}
</script>
</body>
</html>
