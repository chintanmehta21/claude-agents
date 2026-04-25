// app.js — vanilla JS dashboard client.
'use strict';

const state = {
  projects: [],
  current: null,
  view: 'list',
  q: '',
  type: '',
  observations: [],
  lastRefreshed: null,
  refreshIntervalMs: 30_000, // poll every 30s — well within the 5-10 min freshness target
  refreshing: false,
};

const $ = (s) => document.querySelector(s);

async function api(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(path + ' -> ' + r.status);
  return r.json();
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDay(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso.slice(0, 10);
  return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' });
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ---- projects ----
async function loadProjects() {
  const { projects } = await api('/api/projects');
  // Server returns projects already sorted by last_ts DESC; preserve that order.
  state.projects = projects;
  renderProjects();
  if (!state.current && projects.length) {
    selectProject(projects[0].slug);
  }
}

function renderProjects() {
  const el = $('#project-list');
  el.innerHTML = state.projects.map((p) => `
    <li data-slug="${escapeHtml(p.slug)}" class="${p.slug === state.current ? 'active' : ''}">
      <div style="min-width:0; flex:1;">
        <div class="p-title" title="${escapeHtml(p.cwd || '')}">${escapeHtml(p.title)}</div>
        <span class="p-slug">${escapeHtml(p.slug)}</span>
        <span class="p-time" title="last update">${p.last_ts ? relTime(p.last_ts) : ''}</span>
      </div>
      <span class="p-count">${p.observations}</span>
    </li>
  `).join('') || '<li class="muted">No projects yet</li>';
  el.querySelectorAll('li[data-slug]').forEach((li) => {
    li.addEventListener('click', () => selectProject(li.dataset.slug));
  });
}

function relTime(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms) || ms < 0) return '';
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + 's ago';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  return d + 'd ago';
}

function selectProject(slug) {
  state.current = slug;
  renderProjects();
  loadObservations();
  loadStats();
}

// ---- observations ----
async function loadObservations() {
  if (!state.current) return;
  const params = new URLSearchParams({ project: state.current });
  if (state.q) params.set('q', state.q);
  if (state.type) params.set('type', state.type);
  params.set('limit', '300');
  const { observations } = await api('/api/observations?' + params);
  state.observations = observations;
  $('#count-pill').textContent = `${observations.length} observation${observations.length === 1 ? '' : 's'}`;
  renderFeed();
}

function renderFeed() {
  const feed = $('#feed');
  if (!state.observations.length) {
    feed.innerHTML = '<div class="empty">No observations match.</div>';
    return;
  }
  if (state.view === 'timeline') return renderTimeline(feed);
  feed.innerHTML = state.observations.map(renderObs).join('');
  attachExpandHandlers();
}

function renderTimeline(feed) {
  const groups = new Map();
  for (const o of state.observations) {
    const day = (o.ts || '').slice(0, 10);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day).push(o);
  }
  const html = [];
  for (const [day, items] of groups) {
    html.push(`<div class="day-divider">${escapeHtml(fmtDay(day + 'T00:00:00Z'))}</div>`);
    html.push(items.map(renderObs).join(''));
  }
  feed.innerHTML = html.join('');
  attachExpandHandlers();
}

function renderObs(o) {
  const type = (o.type || 'note').toLowerCase();
  const files = (o.files || []).slice(0, 6).map((f) =>
    `<span class="f">${escapeHtml(f)}</span>`
  ).join('');
  return `
    <div class="obs" data-id="${escapeHtml(o.id)}">
      <div class="obs-head">
        <span class="badge t-${escapeHtml(type)}">${escapeHtml(type)}</span>
        <span class="obs-title">${escapeHtml(o.title || '(untitled)')}</span>
        <span class="obs-ts">${escapeHtml(fmtDate(o.ts))}</span>
      </div>
      ${files ? `<div class="obs-files">${files}</div>` : ''}
      ${o.body ? `<div class="obs-body">${escapeHtml(o.body)}</div>` : ''}
    </div>
  `;
}

function attachExpandHandlers() {
  document.querySelectorAll('.obs').forEach((el) => {
    const head = el.querySelector('.obs-head');
    head.addEventListener('click', () => el.classList.toggle('expanded'));
  });
}

// ---- stats ----
async function loadStats() {
  if (!state.current) return;
  try {
    const s = await api('/api/stats?project=' + encodeURIComponent(state.current));
    renderStats(s);
  } catch (e) {
    $('#stats').innerHTML = '<div class="muted">No stats available</div>';
  }
}

function renderStats(s) {
  const max = Math.max(1, ...s.byType.map((t) => t.n));
  const types = s.byType.map((t) => `
    <div class="type-bar">
      <span class="badge t-${escapeHtml(t.type)}" style="text-align:center;">${escapeHtml(t.type)}</span>
      <div class="bar"><span style="width:${(t.n / max * 100).toFixed(1)}%; background: var(--t-${escapeHtml(t.type)}, var(--accent));"></span></div>
      <span class="n">${t.n}</span>
    </div>
  `).join('');

  const dowMax = Math.max(1, ...s.dow);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const heat = s.dow.map((n, i) => {
    const a = 0.10 + 0.85 * (n / dowMax);
    return `<div class="cell" title="${days[i]}: ${n}" style="background: rgba(217,119,87,${a.toFixed(3)});"><span class="lbl">${days[i]}</span></div>`;
  }).join('');

  $('#stats').innerHTML = `
    <div class="stat-row"><span class="label">Total</span><span class="val">${s.total}</span></div>
    <div class="stat-row"><span class="label">Sessions</span><span class="val">${s.sessions}</span></div>
    <div class="stat-row"><span class="label">Chapters</span><span class="val">${s.chapters}</span></div>
    <div class="stat-row"><span class="label">Active days</span><span class="val">${s.byDay.length}</span></div>
    <div class="panel-title" style="margin-top:6px;">By type</div>
    <div class="type-bars">${types || '<div class="muted">none</div>'}</div>
    <div class="panel-title" style="margin-top:6px;">By day-of-week</div>
    <div class="heatmap">${heat}</div>
  `;
}

// ---- events ----
let searchTimer = null;
$('#search').addEventListener('input', (e) => {
  state.q = e.target.value.trim();
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadObservations, 120);
});
$('#type-filter').addEventListener('change', (e) => {
  state.type = e.target.value;
  loadObservations();
});
document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    state.view = t.dataset.view;
    renderFeed();
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== $('#search')) {
    e.preventDefault();
    $('#search').focus();
    $('#search').select();
  }
});

// ---- live refresh (poll every 30s; user can pause via the Live indicator) ----
async function refreshAll({ silent = true } = {}) {
  if (state.refreshing) return;
  state.refreshing = true;
  setLiveStatus('refreshing');
  try {
    // Remember current selection so we don't blow it away
    const keepCurrent = state.current;
    const { projects } = await api('/api/projects');
    state.projects = projects;
    renderProjects();
    if (keepCurrent && projects.find((p) => p.slug === keepCurrent)) {
      state.current = keepCurrent;
    } else if (projects.length) {
      state.current = projects[0].slug;
    }
    if (state.current) {
      await Promise.all([loadObservations(), loadStats()]);
    }
    state.lastRefreshed = new Date();
    setLiveStatus('live');
  } catch (err) {
    if (!silent) console.error('refresh failed', err);
    setLiveStatus('error');
  } finally {
    state.refreshing = false;
  }
}

function setLiveStatus(kind) {
  const el = $('#live-status');
  if (!el) return;
  const ts = state.lastRefreshed ? state.lastRefreshed.toLocaleTimeString() : '—';
  const dot = { live: '🟢', refreshing: '🟡', error: '🔴', paused: '⚪' }[kind] || '🟢';
  el.textContent = `${dot} Live · last update ${ts}`;
  el.dataset.status = kind;
}

let refreshTimer = null;
function startLiveRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => refreshAll(), state.refreshIntervalMs);
}
function stopLiveRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = null;
  setLiveStatus('paused');
}

// Pause polling when tab is hidden; resume + immediate refresh when visible.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopLiveRefresh();
  } else {
    refreshAll();
    startLiveRefresh();
  }
});

// Manual refresh on click of the live status indicator
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'live-status') refreshAll({ silent: false });
});

// ---- boot ----
loadProjects().then(() => {
  state.lastRefreshed = new Date();
  setLiveStatus('live');
  startLiveRefresh();
}).catch((err) => {
  $('#feed').innerHTML = '<div class="empty">Failed to load: ' + escapeHtml(err.message) + '</div>';
  setLiveStatus('error');
});
