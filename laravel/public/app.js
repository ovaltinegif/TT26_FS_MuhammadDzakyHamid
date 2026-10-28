/* ============================================================
   SmartWarehouse — JavaScript Application
   ============================================================ */

const API_BASE = '/api';

// ============================================================
// STATE
// ============================================================
const state = {
  devices: [],
  currentFilter: 'all',
  searchQuery: '',
  editingId: null,
  deletingId: null,
  selectedDeviceId: null,
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadDevices();
  showSection('dashboard');
});

// ============================================================
// NAVIGATION
// ============================================================
function showSection(name) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target section
  const section = document.getElementById(`section-${name}`);
  if (section) section.classList.add('active');

  const navItem = document.getElementById(`nav-${name}`);
  if (navItem) navItem.classList.add('active');

  // Update topbar title
  const titles = {
    dashboard: 'Dashboard',
    devices: 'Perangkat Sensor',
    readings: 'Data Pembacaan',
  };
  document.getElementById('topbarTitle').textContent = titles[name] || name;

  // Load section-specific data
  if (name === 'dashboard') renderDashboard();
  if (name === 'devices') renderDevicesTable();
  if (name === 'readings') renderDeviceSelector();

  // Close mobile sidebar
  closeSidebar();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}

function refreshAll() {
  loadDevices().then(() => {
    const activeSection = document.querySelector('.page-section.active');
    if (!activeSection) return;
    const name = activeSection.id.replace('section-', '');
    if (name === 'dashboard') renderDashboard();
    if (name === 'devices') renderDevicesTable();
    if (name === 'readings') renderDeviceSelector();
    if (state.selectedDeviceId) loadReadings();
  });
  showToast('Data diperbarui', 'success');
}

// ============================================================
// API: FETCH DEVICES
// ============================================================
async function loadDevices() {
  try {
    const res = await fetch(`${API_BASE}/devices`);
    if (!res.ok) throw new Error('Gagal memuat data');
    state.devices = await res.json();
  } catch (err) {
    console.error(err);
    showToast('Gagal terhubung ke server', 'error');
  }
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const devices = state.devices;
  const active = devices.filter(d => d.is_active).length;
  const gudA = devices.filter(d => d.gudang === 'A').length;
  const gudB = devices.filter(d => d.gudang === 'B').length;

  animateValue('stat-total', devices.length);
  animateValue('stat-active', active);
  animateValue('stat-gudA', gudA);
  animateValue('stat-gudB', gudB);

  renderDashboardTable(devices);
}

function animateValue(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 20);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 30);
}

async function renderDashboardTable(devices) {
  const tbody = document.getElementById('dashboard-tbody');

  if (devices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:40px;color:var(--color-text-muted)">Belum ada perangkat. <a href="#" onclick="showSection('devices')" style="color:var(--color-primary)">Tambah sekarang →</a></td></tr>`;
    return;
  }

  // Fetch last reading for each device in parallel
  const rows = await Promise.all(devices.map(async (d) => {
    let lastReading = null;
    try {
      const res = await fetch(`${API_BASE}/devices/${d.id}/readings?limit=1`);
      if (res.ok) {
        const readings = await res.json();
        if (readings.length > 0) lastReading = readings[0];
      }
    } catch {}

    const gudangBadge = d.gudang === 'A'
      ? '<span class="badge badge-gudang-a">Gudang A</span>'
      : '<span class="badge badge-gudang-b">Gudang B</span>';

    const statusBadge = d.is_active
      ? '<span class="badge badge-active">● Aktif</span>'
      : '<span class="badge badge-inactive">○ Nonaktif</span>';

    let suhuCell = '<span class="text-muted">—</span>';
    let lembapCell = '<span class="text-muted">—</span>';
    let kondisi = '<span class="badge badge-warning">Belum ada data</span>';

    if (lastReading) {
      suhuCell = `<span class="sensor-value sensor-temp">${parseFloat(lastReading.suhu).toFixed(2)}°C</span>`;
      lembapCell = `<span class="sensor-value sensor-humid">${parseFloat(lastReading.kelembapan).toFixed(2)}%</span>`;
      kondisi = getKondisiBadge(d.gudang, parseFloat(lastReading.suhu), parseFloat(lastReading.kelembapan));
    }

    return `
      <tr>
        <td><span class="code-cell">${esc(d.kode)}</span></td>
        <td>${esc(d.nama)}</td>
        <td>${gudangBadge}</td>
        <td>${suhuCell}</td>
        <td>${lembapCell}</td>
        <td>${kondisi}</td>
      </tr>`;
  }));

  tbody.innerHTML = rows.join('');
}

function getKondisiBadge(gudang, suhu, kelembapan) {
  let suhuOk, lembapOk;

  if (gudang === 'A') {
    suhuOk = suhu >= -25 && suhu <= -15;
    lembapOk = kelembapan >= 40 && kelembapan <= 80;
  } else {
    suhuOk = suhu >= 0 && suhu <= 8;
    lembapOk = kelembapan >= 40 && kelembapan <= 80;
  }

  if (suhuOk && lembapOk) return '<span class="badge badge-safe">✓ Aman</span>';
  if (!suhuOk && !lembapOk) return '<span class="badge badge-danger">✗ Suhu & Lembap Abnormal</span>';
  if (!suhuOk) return '<span class="badge badge-danger">✗ Suhu Abnormal</span>';
  return '<span class="badge badge-warning">⚠ Kelembapan Abnormal</span>';
}

// ============================================================
// DEVICES TABLE
// ============================================================
function renderDevicesTable() {
  const filtered = getFilteredDevices();
  const tbody = document.getElementById('devices-tbody');

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:40px;color:var(--color-text-muted)">Tidak ada perangkat ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(d => {
    const gudangBadge = d.gudang === 'A'
      ? '<span class="badge badge-gudang-a">Gudang A</span>'
      : '<span class="badge badge-gudang-b">Gudang B</span>';

    const statusBadge = d.is_active
      ? '<span class="badge badge-active">● Aktif</span>'
      : '<span class="badge badge-inactive">○ Nonaktif</span>';

    return `
      <tr>
        <td><span class="code-cell">${esc(d.kode)}</span></td>
        <td>${esc(d.nama)}</td>
        <td>${gudangBadge}</td>
        <td>${statusBadge}</td>
        <td>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn-icon-action btn-view" onclick="viewReadings(${d.id})" title="Lihat pembacaan">
              <svg viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="btn-icon-action btn-edit" onclick="openModal('edit', ${d.id})" title="Edit">
              <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="btn-icon-action btn-delete" onclick="openConfirm(${d.id}, '${esc(d.kode)}')" title="Hapus">
              <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function getFilteredDevices() {
  let devices = [...state.devices];
  const q = state.searchQuery.toLowerCase();
  const filter = state.currentFilter;

  if (q) {
    devices = devices.filter(d =>
      d.kode.toLowerCase().includes(q) ||
      d.nama.toLowerCase().includes(q)
    );
  }

  if (filter === 'A') devices = devices.filter(d => d.gudang === 'A');
  else if (filter === 'B') devices = devices.filter(d => d.gudang === 'B');
  else if (filter === 'active') devices = devices.filter(d => d.is_active);
  else if (filter === 'inactive') devices = devices.filter(d => !d.is_active);

  return devices;
}

function filterDevices() {
  state.searchQuery = document.getElementById('search-input').value;
  renderDevicesTable();
}

function setFilter(filter, btn) {
  state.currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderDevicesTable();
}

function viewReadings(deviceId) {
  state.selectedDeviceId = deviceId;
  showSection('readings');
  loadReadings();

  // Highlight selected device
  document.querySelectorAll('.device-selector-item').forEach(item => {
    item.classList.remove('selected');
    if (parseInt(item.dataset.id) === deviceId) item.classList.add('selected');
  });
}

// ============================================================
// MODAL: ADD / EDIT DEVICE
// ============================================================
function openModal(mode, id = null) {
  clearFormErrors();
  state.editingId = null;

  document.getElementById('modal-overlay').classList.add('visible');
  document.getElementById('modal-device').classList.add('visible');

  if (mode === 'add') {
    document.getElementById('modal-title').textContent = 'Tambah Perangkat Baru';
    document.getElementById('btn-submit-text').textContent = 'Tambah';
    document.getElementById('field-kode').value = '';
    document.getElementById('field-nama').value = '';
    document.getElementById('field-gudang').value = '';
    document.getElementById('field-kode').disabled = false;
    document.getElementById('field-kode').focus();
  } else {
    const device = state.devices.find(d => d.id === id);
    if (!device) return;
    state.editingId = id;
    document.getElementById('modal-title').textContent = 'Edit Perangkat';
    document.getElementById('btn-submit-text').textContent = 'Simpan Perubahan';
    document.getElementById('field-kode').value = device.kode;
    document.getElementById('field-nama').value = device.nama;
    document.getElementById('field-gudang').value = device.gudang;
    document.getElementById('field-nama').focus();
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('visible');
  document.getElementById('modal-device').classList.remove('visible');
  clearFormErrors();
}

function clearFormErrors() {
  ['kode', 'nama', 'gudang'].forEach(f => {
    const errEl = document.getElementById(`error-${f}`);
    const inputEl = document.getElementById(`field-${f}`);
    if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
    if (inputEl) inputEl.classList.remove('error');
  });
}

function showFormError(field, message) {
  const errEl = document.getElementById(`error-${field}`);
  const inputEl = document.getElementById(`field-${field}`);
  if (errEl) { errEl.textContent = message; errEl.classList.add('visible'); }
  if (inputEl) inputEl.classList.add('error');
}

async function submitDevice(event) {
  event.preventDefault();
  clearFormErrors();

  const kode = document.getElementById('field-kode').value.trim();
  const nama = document.getElementById('field-nama').value.trim();
  const gudang = document.getElementById('field-gudang').value;

  // Client-side pre-validation
  let hasError = false;
  if (!kode) { showFormError('kode', 'Kode perangkat wajib diisi.'); hasError = true; }
  if (!nama) { showFormError('nama', 'Nama perangkat wajib diisi.'); hasError = true; }
  if (!gudang) { showFormError('gudang', 'Gudang wajib dipilih.'); hasError = true; }
  if (hasError) return;

  // Show loading
  const btnText = document.getElementById('btn-submit-text');
  const spinner = document.getElementById('btn-spinner');
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';
  document.getElementById('btn-submit').disabled = true;

  const body = { kode, nama, gudang };
  const isEdit = state.editingId !== null;
  const url = isEdit ? `${API_BASE}/devices/${state.editingId}` : `${API_BASE}/devices`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      // Handle validation errors
      if (res.status === 400 || res.status === 422) {
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, messages]) => {
            showFormError(field, Array.isArray(messages) ? messages[0] : messages);
          });
        } else if (data.message) {
          showToast(data.message, 'error');
        }
      } else if (res.status === 409) {
        showFormError('kode', data.message || 'Kode perangkat sudah digunakan.');
      } else {
        showToast(data.message || 'Terjadi kesalahan.', 'error');
      }
      return;
    }

    // Success
    await loadDevices();
    closeModal();
    renderDevicesTable();
    renderDashboard();

    showToast(
      isEdit ? `Perangkat ${data.kode} berhasil diperbarui.` : `Perangkat ${data.kode} berhasil ditambahkan!`,
      'success'
    );

  } catch (err) {
    showToast('Gagal terhubung ke server.', 'error');
  } finally {
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
    document.getElementById('btn-submit').disabled = false;
  }
}

// ============================================================
// CONFIRM DELETE
// ============================================================
function openConfirm(id, kode) {
  state.deletingId = id;
  document.getElementById('confirm-msg').textContent =
    `Perangkat "${kode}" dan semua data pembacaannya akan terhapus permanen. Tindakan ini tidak dapat dibatalkan.`;
  document.getElementById('confirm-overlay').classList.add('visible');
  document.getElementById('confirm-modal').classList.add('visible');
}

function closeConfirm() {
  state.deletingId = null;
  document.getElementById('confirm-overlay').classList.remove('visible');
  document.getElementById('confirm-modal').classList.remove('visible');
}

async function confirmDelete() {
  if (!state.deletingId) return;

  const btn = document.getElementById('btn-confirm-delete');
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner-sm"></div> Menghapus...`;

  try {
    const res = await fetch(`${API_BASE}/devices/${state.deletingId}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    if (res.status === 204) {
      // Removed from state
      state.devices = state.devices.filter(d => d.id !== state.deletingId);
      if (state.selectedDeviceId === state.deletingId) state.selectedDeviceId = null;

      closeConfirm();
      renderDevicesTable();
      renderDashboard();
      showToast('Perangkat berhasil dihapus.', 'success');
    } else {
      const data = await res.json();
      showToast(data.message || 'Gagal menghapus perangkat.', 'error');
      closeConfirm();
    }
  } catch {
    showToast('Gagal terhubung ke server.', 'error');
    closeConfirm();
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Hapus`;
  }
}

// ============================================================
// READINGS
// ============================================================
function renderDeviceSelector() {
  const container = document.getElementById('device-selector-list');

  if (state.devices.length === 0) {
    container.innerHTML = `<div style="padding:24px;text-align:center;color:var(--color-text-muted);font-size:13px">Belum ada perangkat.</div>`;
    return;
  }

  container.innerHTML = state.devices.map(d => {
    const dotColor = d.is_active ? 'var(--color-success)' : 'var(--color-text-muted)';
    const isSelected = d.id === state.selectedDeviceId;
    return `
      <div class="device-selector-item ${isSelected ? 'selected' : ''}" data-id="${d.id}" onclick="selectDevice(${d.id})">
        <div class="device-selector-dot" style="background:${dotColor}"></div>
        <div class="device-selector-info">
          <div class="device-selector-code">${esc(d.kode)}</div>
          <div class="device-selector-name">${esc(d.nama)} · Gudang ${esc(d.gudang)}</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" style="width:14px;height:14px;color:var(--color-text-muted)"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`;
  }).join('');
}

function selectDevice(id) {
  state.selectedDeviceId = id;

  // Update selected state in UI
  document.querySelectorAll('.device-selector-item').forEach(item => {
    item.classList.toggle('selected', parseInt(item.dataset.id) === id);
  });

  loadReadings();
}

async function loadReadings() {
  if (!state.selectedDeviceId) return;

  const device = state.devices.find(d => d.id === state.selectedDeviceId);
  if (!device) return;

  const limit = document.getElementById('readings-limit').value;

  document.getElementById('readings-title').textContent = `${device.kode} — ${device.nama}`;
  document.getElementById('readings-empty').style.display = 'none';
  document.getElementById('readings-table-wrapper').style.display = 'none';

  const tbody = document.getElementById('readings-tbody');
  tbody.innerHTML = `<tr><td colspan="5" class="text-center loading-row"><div class="spinner"></div> Memuat data...</td></tr>`;
  document.getElementById('readings-table-wrapper').style.display = 'block';

  try {
    const res = await fetch(`${API_BASE}/devices/${state.selectedDeviceId}/readings?limit=${limit}`);
    if (!res.ok) throw new Error('Gagal memuat pembacaan');
    const readings = await res.json();

    if (readings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:40px;color:var(--color-text-muted)">Belum ada data pembacaan untuk perangkat ini.</td></tr>`;
      return;
    }

    tbody.innerHTML = readings.map((r, idx) => {
      const suhu = parseFloat(r.suhu);
      const lembap = parseFloat(r.kelembapan);
      const kondisi = getKondisiBadge(device.gudang, suhu, lembap);
      const waktu = formatDateTime(r.created_at);

      return `
        <tr>
          <td style="color:var(--color-text-muted);font-size:12px">${idx + 1}</td>
          <td style="font-size:13px;color:var(--color-text-secondary)">${waktu}</td>
          <td><span class="sensor-value sensor-temp">${suhu.toFixed(2)}°C</span></td>
          <td><span class="sensor-value sensor-humid">${lembap.toFixed(2)}%</span></td>
          <td>${kondisi}</td>
        </tr>`;
    }).join('');

  } catch {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:40px;color:var(--color-danger)">Gagal memuat data pembacaan.</td></tr>`;
  }
}

// ============================================================
// HELPERS
// ============================================================
function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  } catch {
    return dateStr;
  }
}

// ============================================================
// TOAST
// ============================================================
function showToast(message, type = 'info') {
  const icons = {
    success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;

  const container = document.getElementById('toast-container');
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
