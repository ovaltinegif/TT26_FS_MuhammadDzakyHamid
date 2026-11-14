/* SmartWarehouse — Frontend (HTML + CSS + JavaScript murni, Fetch API)
   Sesuai PRD §13: semua data dari API, render dengan textContent/createElement (anti-XSS),
   satu fungsi request(), tombol dinonaktifkan saat request, waktu WIB lokal. */
(() => {
  'use strict';

  const API = '/api';
  const TZ = 'Asia/Jakarta';
  const LIMITS = { A: { min: -25, max: -15, name: 'Produk Beku' }, B: { min: 0, max: 8, name: 'Produk Segar' } };
  const HUM = { min: 40, max: 80 };
  const COLORS = ['#007aff', '#ff9500', '#34c759', '#af52de', '#ff2d55', '#5ac8fa'];

  const state = { devices: [], readings: [], stats: null, sortSuhu: null, chartG: 'A', drawerId: null, loaded: false };

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  /* ---------- DOM helper (tanpa innerHTML dari data) ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'data') for (const [dk, dv] of Object.entries(v)) el.dataset[dk] = dv;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
    return el;
  }
  const clear = (el) => { el.replaceChildren(); return el; };

  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    wave: '<path d="M2 12h4l3-8 4 16 3-8h6"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z"/><path d="M20 17v4H6.5A2.5 2.5 0 014 18.5"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>',
    refresh: '<path d="M21 12a9 9 0 01-15.5 6.2L3 16"/><path d="M3 12A9 9 0 0118.5 5.8L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    warn: '<path d="M12 3L2 20h20z"/><path d="M12 10v5M12 18h.01"/>',
    device: '<rect x="9" y="2" width="6" height="14" rx="3"/><circle cx="12" cy="19" r="3"/>',
    layers: '<path d="M12 2L2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
    drop: '<path d="M12 2.5s7 7.2 7 12a7 7 0 01-14 0c0-4.8 7-12 7-12z"/>',
  };
  function icon(name) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'ico'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICONS[name] || ''; // konstanta internal, bukan data pengguna
    return s;
  }
  function hydrateIcons(root = document) { $$('[data-icon]', root).forEach(el => { if (!el.firstChild) el.append(icon(el.dataset.icon)); }); }

  /* ---------- request() — PRD §13.3 ---------- */
  async function request(path, { method = 'GET', body } = {}) {
    const res = await fetch(API + path, {
      method,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) throw { status: res.status, message: data?.message || `HTTP ${res.status}`, errors: data?.errors || {} };
    return data;
  }

  /* ---------- Format ---------- */
  const fmtTime = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).replace('.', ':');
  const fmtDT = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', timeZone: TZ }) + ' ' + fmtTime(dt);
  };
  const fmtN = (n, d = 1) => Number(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
  const safeTemp = (g, t) => t >= LIMITS[g].min && t <= LIMITS[g].max;
  const safeHum = (x) => x >= HUM.min && x <= HUM.max;
  const latestOf = (id) => state.readings.find(r => r.device_id === id);
  const gLabel = (g) => `Gudang ${g} (${LIMITS[g]?.name || ''})`;

  /* ---------- Toast ---------- */
  function toast(msg, type = 'success') {
    const t = h('div', { class: `toast ${type}`, role: 'status' }, icon(type === 'error' ? 'warn' : 'check'), h('span', { text: msg }));
    $('#toasts').append(t);
    setTimeout(() => { t.classList.add('out'); t.addEventListener('animationend', () => t.remove()); }, 3200);
  }

  /* ---------- Clock + Theme + Nav ---------- */
  function startClock() {
    const tEl = $('#clockTime'), dEl = $('#clockDate');
    const tick = () => {
      const n = new Date();
      tEl.textContent = n.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: TZ }).replace(/\./g, ':');
      dEl.textContent = n.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
    };
    tick(); setInterval(tick, 1000);
  }
  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem('sw-theme');
    if (saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches) root.dataset.theme = 'dark';
    $('#themeToggle').addEventListener('click', () => {
      const dark = root.dataset.theme !== 'dark';
      if (dark) root.dataset.theme = 'dark'; else delete root.dataset.theme;
      localStorage.setItem('sw-theme', dark ? 'dark' : 'light');
      if ($('#view-dashboard').classList.contains('active')) renderChart();
    });
  }
  const TITLES = {
    dashboard: ['Dashboard', 'Ringkasan instan transmisi sensor aktif PT Dingin Segar Logistik'],
    devices: ['Perangkat Sensor', 'Manajemen CRUD sensor ESP32 + DHT22 dan inspeksi status live'],
    streams: ['Data Streams', 'Riwayat pembacaan sensor berurutan dari waktu paling baru (WIB)'],
    docs: ['Dokumentasi API', 'Dokumentasi teknis 6 endpoint, format status HTTP, dan kriteria penerimaan'],
  };
  function switchView(v) {
    $$('.view').forEach(x => x.classList.toggle('active', x.id === 'view-' + v));
    $$('.nav-item').forEach(x => x.classList.toggle('active', x.dataset.view === v));
    $('#pageTitle').textContent = TITLES[v][0]; $('#pageSub').textContent = TITLES[v][1];
    document.body.classList.remove('nav-open');
    history.replaceState(null, '', '#' + v);
    if (v === 'dashboard') renderDashboard();
    if (v === 'devices') renderDevices();
    if (v === 'streams') renderStreams();
    if (v === 'docs') renderDocs();
    scrollTo({ top: 0 });
  }

  /* ---------- Data ---------- */
  async function loadAll() {
    const [devices, readings, stats] = await Promise.all([
      request('/devices'),
      request('/readings?limit=500'),
      request('/stats').catch(() => null),
    ]);
    state.devices = devices; state.readings = readings; state.stats = stats; state.loaded = true;
  }
  async function refresh() {
    try { await loadAll(); renderCurrent(); }
    catch (e) { toast('Gagal memuat data: ' + e.message, 'error'); renderCurrent(e); }
  }
  const currentView = () => $('.view.active').id.replace('view-', '');
  function renderCurrent(err) {
    const v = currentView();
    if (v === 'dashboard') renderDashboard(err);
    if (v === 'devices') renderDevices(err);
    if (v === 'streams') renderStreams(err);
    if (state.drawerId) { const d = state.devices.find(x => x.id === state.drawerId); if (d) loadDrawerReadings(d.id); }
  }
  const stateBox = (msg, kind, sub) => h('div', { class: 'state' + (kind === 'error' ? ' error' : '') },
    kind === 'loading' ? h('div', { class: 'loader' }) : null, h('strong', { text: msg }), sub ? h('span', { text: sub }) : null);

  /* ---------- Dashboard ---------- */
  function deviceAlerts() {
    return state.devices.map(d => {
      const r = latestOf(d.id);
      if (!r) return { d, r: null, bad: false, none: true };
      const tOk = safeTemp(d.gudang, Number(r.suhu)), hOk = safeHum(Number(r.kelembapan));
      return { d, r, bad: !(tOk && hOk), tOk, hOk };
    });
  }
  function kpi(label, val, note, ico, tone) {
    return h('div', { class: 'kpi' },
      h('div', { class: 'kpi-top' }, h('span', { class: 'kpi-dot ' + tone }, icon(ico)), label),
      h('div', { class: 'kpi-val', text: String(val) }),
      h('div', { class: 'kpi-note', text: note }));
  }
  function renderDashboard(err) {
    const k = $('#kpis');
    if (err) { clear(k).append(stateBox('Gagal memuat data', 'error', err.message)); return; }
    if (!state.loaded) { clear(k).append(stateBox('Memuat data…', 'loading')); return; }
    const alerts = deviceAlerts();
    const bad = alerts.filter(a => a.bad).length;
    const online = state.devices.filter(d => d.is_active).length;
    const total = state.stats?.totalReadings ?? state.readings.length;
    clear(k).append(
      kpi('Total Devices', state.devices.length, `A: ${state.devices.filter(d => d.gudang === 'A').length} · B: ${state.devices.filter(d => d.gudang === 'B').length}`, 'chip', 'blue'),
      kpi('Online Devices', online, `${state.devices.length - online} offline`, 'check', 'green'),
      kpi('Total Pembacaan', total, 'Tersimpan di tabel readings', 'wave', 'teal'),
      kpi('Alert', bad, bad ? 'Suhu di luar batas aman!' : 'Batas aman terjaga (BR-01)', 'warn', bad ? 'red' : 'green'));

    // Alert list
    const al = clear($('#alertList'));
    if (!alerts.length) al.append(stateBox('Belum ada perangkat'));
    alerts.forEach(a => {
      const cls = a.none ? 'ok' : a.bad ? 'bad' : 'ok';
      const title = a.none ? `${a.d.kode} · belum ada data` : a.bad ? `${a.d.kode} · di luar batas` : `${a.d.kode} · normal`;
      const body = a.none ? 'Belum ada pembacaan' : `${fmtN(a.r.suhu)}°C · ${fmtN(a.r.kelembapan)}% — ${a.bad ? 'periksa perangkat segera' : 'dalam rentang aman'}`;
      al.append(h('div', { class: 'alert-item ' + cls }, icon(a.bad ? 'warn' : 'check'), h('div', null, h('strong', { text: title }), h('span', { text: body }))));
    });

    // Gudang cards
    const gc = clear($('#gudangCards'));
    ['A', 'B'].forEach(g => {
      const devs = state.devices.filter(d => d.gudang === g);
      const rs = devs.map(d => latestOf(d.id)).filter(Boolean);
      const avgT = rs.length ? rs.reduce((s, r) => s + Number(r.suhu), 0) / rs.length : null;
      const avgH = rs.length ? rs.reduce((s, r) => s + Number(r.kelembapan), 0) / rs.length : null;
      const ok = rs.every(r => safeTemp(g, Number(r.suhu)) && safeHum(Number(r.kelembapan)));
      gc.append(h('div', { class: 'panel g-card' },
        h('h2', null, gLabel(g), ' ', h('span', { class: 'pill nodot ' + (ok ? 'ok' : 'bad'), text: ok ? 'Aman' : 'Di Luar Batas' })),
        h('div', { class: 'limits' },
          h('div', null, h('small', { text: 'Batas Suhu Aman' }), h('b', { text: `${LIMITS[g].min}°C s/d ${LIMITS[g].max}°C` })),
          h('div', null, h('small', { text: 'Kelembapan' }), h('b', { text: `${HUM.min}% – ${HUM.max}%` }))),
        h('div', { class: 'stat-row' }, h('span', { text: 'Suhu Rata-rata Terkini:' }), h('b', { text: avgT == null ? '—' : fmtN(avgT) + '°C' })),
        h('div', { class: 'stat-row' }, h('span', { text: 'Kelembapan Rata-rata:' }), h('b', { text: avgH == null ? '—' : fmtN(avgH) + '%' })),
        h('div', { class: 'stat-row' }, h('span', { text: 'Interval' }), h('b', { text: 'Interval 5 Menit' })),
        h('p', { class: 'sensors', text: devs.length ? 'Sensor terpasang: ' + devs.map(d => `${d.kode} (${d.nama})`).join(', ') : 'Belum ada sensor terpasang.' })));
    });

    // Table
    const wrap = clear($('#dashTable'));
    if (!state.devices.length) wrap.append(stateBox('Belum ada perangkat'));
    else wrap.append(deviceTable(state.devices, { actions: false }));
    renderChart();
  }

  function renderChart() {
    const g = state.chartG;
    $$('#chartGudang .seg').forEach(b => b.classList.toggle('active', b.dataset.g === g));
    const box = clear($('#chart')), legend = clear($('#chartLegend'));
    if (!state.loaded) return;
    const devs = state.devices.filter(d => d.gudang === g);
    const series = devs.map((d, i) => ({ d, color: COLORS[i % COLORS.length], pts: state.readings.filter(r => r.device_id === d.id).slice(0, 10).reverse() })).filter(s => s.pts.length);
    if (!series.length) { box.append(stateBox('Belum ada pembacaan', null, 'Kirim data lewat simulator pada halaman Perangkat.')); return; }
    const W = 640, H = 270, L = 44, R = 12, T = 12, B = 30, lim = LIMITS[g];
    const vals = series.flatMap(s => s.pts.map(p => Number(p.suhu))).concat([lim.min, lim.max]);
    let lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1);
    if (hi - lo < 6) hi = lo + 6;
    const maxN = Math.max(...series.map(s => s.pts.length));
    const x = (i) => L + (maxN === 1 ? (W - L - R) / 2 : i * (W - L - R) / (maxN - 1));
    const y = (v) => T + (hi - v) * (H - T - B) / (hi - lo);
    const NS = 'http://www.w3.org/2000/svg';
    const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Grafik suhu Gudang ${g}` });
    const step = Math.max(1, Math.round((hi - lo) / 5));
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      svg.append(el('line', { class: 'grid', x1: L, x2: W - R, y1: y(v), y2: y(v) }));
      const t = el('text', { class: 'axis', x: L - 8, y: y(v) + 4, 'text-anchor': 'end' }); t.textContent = v + '°'; svg.append(t);
    }
    svg.append(el('rect', { class: 'band', x: L, y: y(lim.max), width: W - L - R, height: y(lim.min) - y(lim.max) }));
    [lim.min, lim.max].forEach(v => svg.append(el('line', { class: 'limit', x1: L, x2: W - R, y1: y(v), y2: y(v) })));
    const longest = series.reduce((a, s) => s.pts.length > a.pts.length ? s : a);
    longest.pts.forEach((p, i) => { if (i % 2 === 0 || longest.pts.length < 6) { const t = el('text', { class: 'axis', x: x(i), y: H - 8, 'text-anchor': 'middle' }); t.textContent = fmtTime(p.created_at); svg.append(t); } });
    series.forEach(s => {
      svg.append(el('path', { d: s.pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(Number(p.suhu)).toFixed(1)).join(' '), fill: 'none', stroke: s.color, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      s.pts.forEach((p, i) => {
        const c = el('circle', { class: 'pt', cx: x(i), cy: y(Number(p.suhu)), r: 4.5, fill: s.color });
        const t = el('title', {}); t.textContent = `${s.d.kode} · ${fmtDT(p.created_at)} · ${fmtN(p.suhu)}°C`; c.append(t); svg.append(c);
      });
    });
    box.append(svg);
    series.forEach(s => legend.append(h('span', null, h('i', { style: `background:${s.color}` }), `${s.d.kode} — ${s.d.nama}`)));
    legend.append(h('span', null, h('i', { class: 'band-key' }), `Batas aman ${lim.min}°C s/d ${lim.max}°C`));
  }

  /* ---------- Device table ---------- */
  function deviceTable(devs, { actions = true } = {}) {
    const head = h('tr', null,
      h('th', { text: 'Perangkat' }), h('th', { text: 'Lokasi (Gudang)' }), h('th', { text: 'Status' }),
      h('th', actions ? { class: 'sortable', title: 'Urutkan suhu', onclick: () => { state.sortSuhu = state.sortSuhu === 'asc' ? 'desc' : state.sortSuhu === 'desc' ? null : 'asc'; renderDevices(); } } : null,
        'Suhu Terkini' + (actions ? (state.sortSuhu === 'asc' ? ' ↑' : state.sortSuhu === 'desc' ? ' ↓' : ' ↕') : '')),
      h('th', { text: 'Kelembapan' }), h('th', { text: 'Waktu Terakhir' }), actions ? h('th', { class: 'right', text: 'Aksi' }) : null);
    const body = h('tbody');
    devs.forEach(d => {
      const r = latestOf(d.id), t = r ? Number(r.suhu) : null, hum = r ? Number(r.kelembapan) : null;
      const badT = r && !safeTemp(d.gudang, t), badH = r && !safeHum(hum);
      const statusCell = actions
        ? h('label', { class: 'status-cell', title: 'Klik untuk mengubah status aktif' },
            h('span', { class: 'switch sm' }, h('input', { type: 'checkbox', checked: d.is_active, 'aria-label': `Status aktif ${d.kode}`, onchange: (e) => toggleActive(d, e.target) }), h('i')),
            h('span', { class: d.is_active ? '' : 'muted', text: d.is_active ? 'Online' : 'Offline' }))
        : h('span', { class: 'pill ' + (d.is_active ? 'ok' : 'muted'), text: d.is_active ? 'Online' : 'Offline' });
      body.append(h('tr', null,
        h('td', null, h('div', { class: 'dev-cell' },
          h('span', { class: 'dev-ico ' + d.gudang }, icon('device')),
          h('div', { class: 'dev-meta' }, h('span', { class: 'code', text: d.kode }), h('small', { text: `#${d.id} · ${d.nama}` })))),
        h('td', null, h('span', { class: 'pill ' + d.gudang, text: gLabel(d.gudang) })),
        h('td', null, statusCell),
        h('td', null, r ? h('span', { class: 'temp' + (badT ? ' bad' : ''), title: badT ? 'Suhu di luar batas aman!' : '' }, fmtN(t) + '°C') : h('span', { class: 'muted', text: '—' })),
        h('td', null, r ? h('span', { class: badH ? 'temp bad' : '' }, fmtN(hum) + '%') : h('span', { class: 'muted', text: '—' })),
        h('td', { class: 'muted', text: r ? fmtDT(r.created_at) : 'Belum ada' }),
        actions ? h('td', null, h('div', { class: 'row-actions' },
          h('button', { class: 'btn sm', title: 'Lihat 10 Pembacaan Terakhir (Detail)', onclick: () => openDrawer(d.id) }, 'Detail'),
          h('button', { class: 'icon-btn', title: 'Ubah Data Perangkat (Edit)', 'aria-label': `Ubah ${d.kode}`, onclick: () => openForm(d) }, icon('edit')),
          h('button', { class: 'icon-btn del', title: 'Hapus Perangkat (Delete)', 'aria-label': `Hapus ${d.kode}`, onclick: () => askDelete(d) }, icon('trash')))) : null));
    });
    return h('table', null, h('thead', null, head), body);
  }

  function filteredDevices() {
    const q = $('#search').value.trim().toLowerCase(), g = $('#filterGudang').value, s = $('#filterStatus').value;
    let list = state.devices.filter(d => (!q || d.kode.toLowerCase().includes(q) || d.nama.toLowerCase().includes(q)) && (!g || d.gudang === g) && (s === '' || String(d.is_active ? 1 : 0) === s));
    if (state.sortSuhu) {
      const val = (d) => { const r = latestOf(d.id); return r ? Number(r.suhu) : Infinity; };
      list = [...list].sort((a, b) => state.sortSuhu === 'asc' ? val(a) - val(b) : val(b) - val(a));
    }
    return list;
  }
  function renderDevices(err) {
    const wrap = clear($('#deviceTable')), foot = clear($('#deviceFoot'));
    if (err) { wrap.append(stateBox('Gagal memuat data', 'error', err.message)); return; }
    if (!state.loaded) { wrap.append(stateBox('Memuat data perangkat sensor...', 'loading')); return; }
    const list = filteredDevices();
    if (!list.length) {
      const filtering = $('#search').value || $('#filterGudang').value || $('#filterStatus').value;
      wrap.append(h('div', { class: 'state' }, h('strong', { text: 'Tidak ada perangkat ditemukan' }),
        h('span', { text: filtering ? 'Coba ganti kata kunci pencarian Anda.' : 'Belum ada perangkat terdaftar. Tambahkan perangkat baru sekarang.' }),
        filtering ? null : h('button', { class: 'btn primary', onclick: () => openForm() }, '+ Tambah Perangkat Pertama')));
    } else wrap.append(deviceTable(list));
    foot.textContent = `Menampilkan ${list.length} dari ${state.devices.length} perangkat. Peringatan ditandai merah bila suhu di luar batas aman.`;
  }
  async function toggleActive(d, input) {
    input.disabled = true;
    try {
      await request(`/devices/${d.id}`, { method: 'PUT', body: { kode: d.kode, nama: d.nama, gudang: d.gudang, is_active: input.checked } });
      toast(`${d.kode} sekarang ${input.checked ? 'Online' : 'Offline'}.`);
      await refresh();
    } catch (e) { input.checked = !input.checked; input.disabled = false; toast(e.message, 'error'); }
  }

  /* ---------- Streams ---------- */
  function renderStreams(err) {
    const wrap = clear($('#streamTable')), k = clear($('#streamKpis'));
    const sel = $('#streamDevice'), keep = sel.value;
    if (err) { wrap.append(stateBox('Gagal memuat data', 'error', err.message)); return; }
    if (!state.loaded) { wrap.append(stateBox('Memuat data…', 'loading')); return; }
    clear(sel).append(h('option', { value: '', text: 'Semua Perangkat' }), ...state.devices.map(d => h('option', { value: d.id, text: `${d.kode} — ${d.nama}` })));
    sel.value = state.devices.some(d => String(d.id) === keep) ? keep : '';
    const rows = state.readings.filter(r => !sel.value || String(r.device_id) === sel.value);
    const hot = rows.filter(r => { const d = state.devices.find(x => x.id === r.device_id); return d && !(safeTemp(d.gudang, Number(r.suhu)) && safeHum(Number(r.kelembapan))); }).length;
    k.append(kpi('Total Log Diterima:', state.stats?.totalReadings ?? state.readings.length, 'Frekuensi & volume log transmisi sensor masuk', 'wave', 'teal'),
      kpi('Di Luar Batas', hot, `dari ${rows.length} log ditampilkan`, 'warn', hot ? 'red' : 'green'),
      kpi('Status Transmisi', 'Interval 5 Menit', 'Status transmisi sensor siap', 'check', 'green'));
    $$('.kpi-val', k).forEach((e, i) => { if (i === 2) e.style.fontSize = '20px'; });
    if (!rows.length) { wrap.append(stateBox('Belum ada pembacaan')); return; }
    const body = h('tbody');
    rows.slice(0, 100).forEach(r => {
      const d = state.devices.find(x => x.id === r.device_id);
      const ok = d ? safeTemp(d.gudang, Number(r.suhu)) && safeHum(Number(r.kelembapan)) : true;
      body.append(h('tr', null, h('td', { class: 'muted', text: '#' + r.id }), h('td', { text: fmtDT(r.created_at) }),
        h('td', null, h('span', { class: 'code', text: d?.kode || 'ID ' + r.device_id })),
        h('td', null, d ? h('span', { class: 'pill ' + d.gudang, text: 'Gudang ' + d.gudang }) : '—'),
        h('td', { class: 'temp' + (ok ? '' : ' bad'), text: fmtN(r.suhu) + '°C' }), h('td', { text: fmtN(r.kelembapan) + '%' }),
        h('td', null, h('span', { class: 'pill ' + (ok ? 'ok' : 'bad'), text: ok ? 'Aman' : 'Di Luar Batas' }))));
    });
    wrap.append(h('table', null, h('thead', null, h('tr', null, ['Log ID', 'Waktu Transmisi', 'Device', 'Lokasi', 'Suhu (°C)', 'Kelembapan (%)', 'Status Kondisi'].map(t => h('th', { text: t })))), body));
  }
  async function resetSeed(btn) {
    if (!confirm('Reset database ke kondisi seeder default (3 perangkat, 30 pembacaan)? Semua perubahan data akan hilang.')) return;
    btn.disabled = true; btn.classList.add('spin');
    try { const r = await request('/seed/reset', { method: 'POST' }); toast(r.message || 'Seeder di-reset.'); closeDrawer(); await refresh(); }
    catch (e) { toast(e.message, 'error'); }
    btn.disabled = false; btn.classList.remove('spin');
  }

  /* ---------- Drawer detail + simulator ---------- */
  const drawer = () => $('#drawer');
  function openDrawer(id) {
    const d = state.devices.find(x => x.id === id); if (!d) return;
    state.drawerId = id;
    const lim = LIMITS[d.gudang];
    clear($('#drawerHead')).append(
      h('div', { class: 'tags' }, h('span', { class: 'pill nodot ' + d.gudang, text: `Gudang ${d.gudang} · ${lim.name}` }), h('span', { class: 'pill ' + (d.is_active ? 'ok' : 'muted'), text: d.is_active ? 'Online' : 'Offline' })),
      h('h2', { id: 'drawerTitle', text: `${d.kode} — ${d.nama}` }),
      h('p', { text: `Batas Aman: ${lim.min}°C s/d ${lim.max}°C · Kelembapan: 40% – 80% (Inklusif)` }));
    $('#simForm').hidden = true; $('#simToggle').lastChild.textContent = 'Kirim Data (Simulasi ESP32)';
    const mid = (lim.min + lim.max) / 2;
    clear($('#simPresets')).append('Preset simulasi cepat:',
      h('button', { type: 'button', class: 'chip', onclick: () => setSim(mid, 60) }, `Normal (${fmtN(mid)}°C)`),
      h('button', { type: 'button', class: 'chip', onclick: () => setSim(lim.min + 1, 45) }, 'Dingin batas'),
      h('button', { type: 'button', class: 'chip hot', onclick: () => setSim(lim.max + 4, 70) }, `Alert Panas (${lim.max + 4}°C)`));
    setSim(mid, 60); $('#simError').textContent = '';
    drawer().classList.add('open'); drawer().setAttribute('aria-hidden', 'false'); $('#drawerOverlay').classList.add('open');
    loadDrawerReadings(id);
  }
  function setSim(t, hum) { $('#simSuhu').value = Number(t).toFixed(1); $('#simHum').value = Number(hum).toFixed(1); }
  function closeDrawer() { state.drawerId = null; drawer().classList.remove('open'); drawer().setAttribute('aria-hidden', 'true'); $('#drawerOverlay').classList.remove('open'); }
  async function loadDrawerReadings(id) {
    const body = clear($('#drawerBody'));
    if (!body.dataset.id || body.dataset.id !== String(id)) body.append(stateBox('Memuat 10 pembacaan terbaru...', 'loading'));
    body.dataset.id = id;
    try {
      const list = await request(`/devices/${id}/readings?limit=10`);
      if (state.drawerId !== id) return;
      const d = state.devices.find(x => x.id === id);
      clear(body);
      if (!list.length) { body.append(h('div', { class: 'state' }, h('strong', { text: 'Belum ada pembacaan' }), h('span', { text: 'Gunakan simulator di atas untuk mengirimkan log pembacaan sensor pertama.' }))); return; }
      const tb = h('tbody');
      list.forEach((r, i) => {
        const ok = safeTemp(d.gudang, Number(r.suhu)) && safeHum(Number(r.kelembapan));
        tb.append(h('tr', null, h('td', { class: 'muted', text: String(i + 1) }), h('td', { text: fmtDT(r.created_at) }),
          h('td', { class: 'temp' + (safeTemp(d.gudang, Number(r.suhu)) ? '' : ' bad'), text: fmtN(r.suhu) + '°C' }), h('td', { text: fmtN(r.kelembapan) + '%' }),
          h('td', { class: 'right' }, h('span', { class: 'pill ' + (ok ? 'ok' : 'bad'), text: ok ? 'Normal' : 'Di Luar Batas' }))));
      });
      body.append(h('table', null, h('thead', null, h('tr', null, h('th', { text: 'No' }), h('th', { text: 'Waktu (WIB)' }), h('th', { text: 'Suhu (°C)' }), h('th', { text: 'Kelembapan (%)' }), h('th', { class: 'right', text: 'Status Kondisi' }))), tb),
        h('p', { class: 'table-foot', text: 'Menampilkan maksimal 10 pembacaan teranyar.' }));
    } catch (e) { clear(body).append(stateBox('Gagal memuat pembacaan', 'error', e.message)); }
  }
  async function submitSim(ev) {
    ev.preventDefault();
    const btn = $('#simSubmit'), err = $('#simError');
    err.textContent = ''; btn.disabled = true; btn.textContent = 'Mengirim...';
    try {
      await request('/readings', { method: 'POST', body: { device_id: state.drawerId, suhu: Number($('#simSuhu').value), kelembapan: Number($('#simHum').value) } });
      toast('Data Berhasil Terkirim (HTTP 201 Created)!'); await refresh();
    } catch (e) {
      const f = Object.values(e.errors || {}).flat();
      err.textContent = f.length ? f.join(' ') : e.message;
    }
    btn.disabled = false; btn.textContent = 'Simpan Pembacaan';
  }

  /* ---------- Form tambah / ubah ---------- */
  let editing = null;
  const FIELDS = { kode: ['#fKode', '#eKode'], nama: ['#fNama', '#eNama'], gudang: ['#fGudang', '#eGudang'] };
  function resetErrors() { Object.values(FIELDS).forEach(([i, e]) => { $(i).classList.remove('invalid'); $(e).textContent = ''; }); $('#eGeneral').textContent = ''; }
  function openForm(d = null) {
    editing = d; resetErrors();
    $('#formTitle').textContent = d ? 'Ubah Data Perangkat' : 'Tambah Perangkat Baru';
    $('#fKode').value = d?.kode || ''; $('#fNama').value = d?.nama || ''; $('#fGudang').value = d?.gudang || ''; $('#fActive').checked = d ? !!d.is_active : true;
    $('#formOverlay').classList.add('open'); setTimeout(() => $(d ? '#fNama' : '#fKode').focus(), 80);
  }
  const closeForm = () => { $('#formOverlay').classList.remove('open'); editing = null; };
  function fieldError(name, msg) { const [i, e] = FIELDS[name] || []; if (!i) return false; $(i).classList.add('invalid'); $(e).textContent = msg; return true; }
  async function submitForm(ev) {
    ev.preventDefault(); resetErrors();
    const btn = $('#formSubmit'); btn.disabled = true; btn.textContent = 'Menyimpan...';
    const body = { kode: $('#fKode').value.trim().toUpperCase(), nama: $('#fNama').value.trim(), gudang: $('#fGudang').value, is_active: $('#fActive').checked };
    try {
      if (editing) await request(`/devices/${editing.id}`, { method: 'PUT', body });
      else await request('/devices', { method: 'POST', body });
      toast(editing ? 'Perangkat berhasil diperbarui.' : 'Perangkat berhasil ditambahkan.');
      closeForm(); await refresh();
    } catch (e) {
      let shown = false;
      for (const [f, m] of Object.entries(e.errors || {})) shown = fieldError(f, [].concat(m)[0]) || shown;
      if (e.status === 409) shown = fieldError('kode', e.message);
      if (!shown) $('#eGeneral').textContent = e.message;
    }
    btn.disabled = false; btn.textContent = 'Simpan';
  }

  /* ---------- Hapus ---------- */
  let delTarget = null;
  function askDelete(d) {
    delTarget = d;
    $('#confirmMsg').textContent = `Hapus perangkat ${d.kode} beserta seluruh pembacaannya?`;
    $('#confirmNote').textContent = 'Perhatian (Cascade Delete): seluruh log pembacaan perangkat ini ikut terhapus permanen.';
    $('#confirmOverlay').classList.add('open');
  }
  const closeConfirm = () => { $('#confirmOverlay').classList.remove('open'); delTarget = null; };
  async function doDelete() {
    if (!delTarget) return;
    const btn = $('#confirmOk'), d = delTarget; btn.disabled = true; btn.textContent = 'Menghapus...';
    try {
      await request(`/devices/${d.id}`, { method: 'DELETE' });
      if (state.drawerId === d.id) closeDrawer();
      toast(`Perangkat ${d.kode} berhasil dihapus.`); closeConfirm(); await refresh();
    } catch (e) { toast(e.message, 'error'); }
    btn.disabled = false; btn.textContent = 'Ya, Hapus Perangkat';
  }

  /* ---------- Docs + matriks AC ---------- */
  const ENDPOINTS = [
    ['GET', '/api/devices', 'Daftar semua perangkat', '200 + array perangkat', 'curl http://127.0.0.1:8000/api/devices'],
    ['POST', '/api/devices', 'Tambah perangkat', '201 + perangkat baru · 400 validasi · 409 kode duplikat', `curl -X POST http://127.0.0.1:8000/api/devices \\\n  -H "Content-Type: application/json" -H "Accept: application/json" \\\n  -d '{"kode":"SNS-A03","nama":"Sensor Freezer 3","gudang":"A"}'`],
    ['PUT', '/api/devices/:id', 'Ubah perangkat', '200 · 404 tidak ada · 409 kode bentrok', `curl -X PUT http://127.0.0.1:8000/api/devices/1 \\\n  -H "Content-Type: application/json" -H "Accept: application/json" \\\n  -d '{"kode":"SNS-A01","nama":"Sensor Freezer 1","gudang":"A"}'`],
    ['DELETE', '/api/devices/:id', 'Hapus perangkat (cascade readings)', '204 No Content · 404', 'curl -X DELETE http://127.0.0.1:8000/api/devices/1 -H "Accept: application/json"'],
    ['POST', '/api/readings', 'Ingest pembacaan sensor ESP32', '201 · 400 (kelembapan di luar 0-100) · 404 (device tidak ada)', `curl -X POST http://127.0.0.1:8000/api/readings \\\n  -H "Content-Type: application/json" -H "Accept: application/json" \\\n  -d '{"device_id":1,"suhu":-18.5,"kelembapan":65}'`],
    ['GET', '/api/devices/:id/readings?limit=10', '10 pembacaan terakhir (terbaru di atas)', '200 · 404 · 400 limit tidak valid', 'curl "http://127.0.0.1:8000/api/devices/1/readings?limit=10"'],
  ];
  const AC = [
    ['AC-01', 'GET /api/devices setelah seeding', '200, array 3 perangkat (SNS-A01, SNS-A02, SNS-B01)', async (c) => { const r = await call('/devices'); return r.status === 200 && Array.isArray(r.data) && r.data.length >= 3; }],
    ['AC-02', 'POST /api/devices data valid', '201 + perangkat baru; muncul di tabel antarmuka', async (c) => { const r = await call('/devices', 'POST', { kode: 'SNS-B98', nama: 'Uji AC-02', gudang: 'B' }); if (r.data?.id) c.ids.push(r.data.id); c.dup = r.status === 201; return r.status === 201; }],
    ['AC-03', "POST /api/devices kode 'ABC', gudang 'C'", '400, pesan error per field', async () => { const r = await call('/devices', 'POST', { kode: 'ABC', nama: '', gudang: 'C' }); return r.status === 400 && !!r.data?.errors; }],
    ['AC-04', 'POST /api/devices kode sudah ada', '409, "Kode perangkat sudah digunakan"', async (c) => { const r = await call('/devices', 'POST', { kode: 'SNS-B98', nama: 'Duplikat', gudang: 'B' }); return r.status === 409 && /sudah digunakan/i.test(r.data?.message || ''); }],
    ['AC-05', 'POST /api/devices nama 51 karakter', '400', async () => (await call('/devices', 'POST', { kode: 'SNS-B97', nama: 'x'.repeat(51), gudang: 'B' })).status === 400],
    ['AC-06', 'PUT /api/devices/:id valid, 404, 409', '200; 404 jika id tiada; 409 jika kode bentrok', async (c) => {
      const id = c.ids[0]; if (!id) return false;
      const a = await call(`/devices/${id}`, 'PUT', { kode: 'SNS-B98', nama: 'Uji AC-06', gudang: 'B' });
      const b = await call('/devices/999999', 'PUT', { kode: 'SNS-B96', nama: 'x', gudang: 'B' });
      const other = state.devices.find(d => d.id !== id);
      const cc = other ? await call(`/devices/${id}`, 'PUT', { kode: other.kode, nama: 'x', gudang: other.gudang }) : { status: 409 };
      return a.status === 200 && b.status === 404 && cc.status === 409;
    }],
    ['AC-07', 'DELETE /api/devices/:id valid, 404', '204 No Content dan cascade delete readings; 404', async (c) => {
      const id = c.ids[0]; if (!id) return false;
      await call('/readings', 'POST', { device_id: id, suhu: 5, kelembapan: 50 });
      const a = await call(`/devices/${id}`, 'DELETE'); const b = await call(`/devices/${id}`, 'DELETE');
      const ok = a.status === 204 && b.status === 404; if (ok) c.ids.length = 0; return ok;
    }],
    ['AC-08', 'POST /api/readings data valid', '201 + data pembacaan baru', async () => { const d = state.devices[0]; if (!d) return false; const r = await call('/readings', 'POST', { device_id: d.id, suhu: LIMITS[d.gudang].max - 2, kelembapan: 60 }); return r.status === 201; }],
    ['AC-09', 'POST /api/readings kelembapan > 100, device 999', '400 (kelembapan di luar 0-100); 404 (device tidak ada)', async () => {
      const d = state.devices[0]; if (!d) return false;
      const a = await call('/readings', 'POST', { device_id: d.id, suhu: 1, kelembapan: 101 });
      const b = await call('/readings', 'POST', { device_id: d.id, suhu: 'abc', kelembapan: 50 });
      const c = await call('/readings', 'POST', { device_id: 999999, suhu: 1, kelembapan: 50 });
      return a.status === 400 && b.status === 400 && c.status === 404;
    }],
    ['AC-10', 'GET /api/devices/:id/readings?limit=10', '200, 10 item urut terbaru di atas (created_at DESC)', async () => {
      const d = state.devices[0]; if (!d) return false; const r = await call(`/devices/${d.id}/readings?limit=10`);
      return r.status === 200 && r.data.length <= 10 && r.data.every((x, i, a) => !i || new Date(a[i - 1].created_at) >= new Date(x.created_at));
    }],
    ['AC-11', 'Frontend: tambah, ubah, hapus', 'Tabel langsung ter-update tanpa reload manual; data dari API', null],
    ['AC-12', 'Frontend: tombol hapus', 'Konfirmasi muncul; batal = tidak ada perubahan', null],
    ['AC-13', 'Clone baru, ikuti README', 'Berjalan tanpa langkah tambahan; migrate:fresh --seed bersih', null],
    ['AC-14', 'Repository publik', 'Nama repo TT26_FS_MuhammadDzakyHamid; ada Postman & screenshot di README', null],
  ];
  async function call(path, method = 'GET', body) {
    const res = await fetch(API + path, { method, headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    return { status: res.status, data: res.status === 204 ? null : await res.json().catch(() => null) };
  }
  function renderDocs() {
    const list = $('#endpointList');
    if (!list.children.length) ENDPOINTS.forEach(([verb, path, title, res, curl]) => list.append(h('details', { class: 'ep' },
      h('summary', null, h('span', { class: 'verb ' + verb, text: verb }), h('span', { class: 'ep-path', text: path }), h('span', { class: 't', text: title })),
      h('div', { class: 'ep-body' }, h('div', null, h('strong', { text: 'Respons: ' }), res), h('pre', { text: curl })))));
    const wrap = $('#acTable');
    if (wrap.children.length) return;
    const body = h('tbody');
    AC.forEach(([id, sc, exp, fn]) => body.append(h('tr', { data: { ac: id } }, h('td', null, h('strong', { text: id })), h('td', { text: sc }), h('td', { class: 'muted', text: exp }),
      h('td', { class: 'ac-result' }, h('span', { class: 'pill nodot ' + (fn ? 'muted' : 'warn'), text: fn ? 'Belum diuji' : 'Uji manual' })))));
    wrap.append(h('table', null, h('thead', null, h('tr', null, ['No', 'Skenario Uji', 'Hasil yang Diharapkan', 'Status'].map(t => h('th', { text: t })))), body));
  }
  async function runAC(btn) {
    btn.disabled = true; btn.classList.add('spin');
    const ctx = { ids: [] };
    for (const [id, , , fn] of AC) {
      if (!fn) continue;
      const cell = $(`tr[data-ac="${id}"] .ac-result`); clear(cell).append(h('span', { class: 'pill muted nodot', text: 'Menguji…' }));
      let ok = false; try { ok = await fn(ctx); } catch { ok = false; }
      clear(cell).append(h('span', { class: 'pill nodot ' + (ok ? 'ok' : 'bad'), text: ok ? 'LULUS ✓' : 'GAGAL ✗' }));
    }
    for (const id of ctx.ids) await call(`/devices/${id}`, 'DELETE').catch(() => {});
    btn.disabled = false; btn.classList.remove('spin'); toast('Uji API selesai. Data uji sudah dibersihkan.'); await refresh();
  }

  /* ---------- Init ---------- */
  function init() {
    hydrateIcons(); startClock(); initTheme();
    $$('.nav-item').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));
    $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    $('#navScrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
    $('#goDevices').addEventListener('click', () => switchView('devices'));
    $$('#chartGudang .seg').forEach(b => b.addEventListener('click', () => { state.chartG = b.dataset.g; renderChart(); }));
    ['#search', '#filterGudang', '#filterStatus'].forEach(s => $(s).addEventListener('input', () => renderDevices()));
    $('#streamDevice').addEventListener('change', () => renderStreams());
    $('#resetSeed').addEventListener('click', (e) => resetSeed(e.currentTarget));
    $('#runAC').addEventListener('click', (e) => runAC(e.currentTarget));
    $('#addDevice').addEventListener('click', () => openForm());
    $('#formClose').addEventListener('click', closeForm); $('#formCancel').addEventListener('click', closeForm);
    $('#deviceForm').addEventListener('submit', submitForm);
    $('#confirmCancel').addEventListener('click', closeConfirm); $('#confirmOk').addEventListener('click', doDelete);
    $('#drawerClose').addEventListener('click', closeDrawer); $('#drawerOverlay').addEventListener('click', closeDrawer);
    $('#simToggle').addEventListener('click', () => { const f = $('#simForm'); f.hidden = !f.hidden; $('#simToggle').lastChild.textContent = f.hidden ? 'Kirim Data (Simulasi ESP32)' : 'Tutup Simulator'; });
    $('#simForm').addEventListener('submit', submitSim);
    ['#formOverlay', '#confirmOverlay'].forEach(s => $(s).addEventListener('mousedown', (e) => { if (e.target.id === s.slice(1)) { closeForm(); closeConfirm(); } }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeForm(); closeConfirm(); closeDrawer(); } });
    const start = location.hash.slice(1); switchView(TITLES[start] ? start : 'dashboard');
    refresh();
    setInterval(() => { if (!document.hidden && !$('#formOverlay').classList.contains('open')) loadAll().then(renderCurrent).catch(() => {}); }, 30000);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
