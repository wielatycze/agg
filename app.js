// ============================================================
//  GENEALOGY SITE — APP LOGIC
//  Do not edit unless you want to change behaviour.
// ============================================================

// ── Helpers ─────────────────────────────────────────────────

/**
 * Fetch a Google Sheet tab as an array of row-objects.
 * Requires the sheet to be published / "anyone with link can view".
 * Uses the gviz CSV endpoint — no API key needed.
 */
async function fetchSheetTab(sheetId, tabName) {
  const url = `https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch "${tabName}" (HTTP ${res.status})`);
  const text = await res.text();
  return parseCSV(text);
}

/**
 * Minimal but robust CSV parser that handles quoted fields and embedded commas/newlines.
 * Returns array of objects keyed by the first row (headers).
 */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; } // escaped quote
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    }

    if (ch === '"')  { inQuotes = true; i++; continue; }
    if (ch === ',')  { row.push(field.trim()); field = ''; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') {
      row.push(field.trim()); field = '';
      rows.push(row); row = []; i++; continue;
    }
    field += ch; i++;
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }

  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.replace(/^"|"$/g, '').trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').replace(/^"|"$/g, '').trim(); });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ''));
}

/**
 * Normalise a cell value: strip whitespace, treat as string for comparison.
 */
function normaliseId(val) {
  return String(val ?? '').trim();
}

/**
 * Match rows from a source against a target person ID.
 * Returns { matchedRows, tableRows } where tableRows includes full household if configured.
 */
function matchSource(source, allRows, targetId) {
  const targetStr = String(targetId);

  // Find which rows contain the person in any role column
  const matchedSet = new Set();
  const matchedRoles = new Map(); // rowIndex -> role label

  allRows.forEach((row, idx) => {
    for (const { column, role } of source.roles) {
      const cellVal = normaliseId(row[column]);
      if (cellVal === targetStr) {
        matchedSet.add(idx);
        matchedRoles.set(idx, role);
        break;
      }
    }
  });

  if (matchedSet.size === 0) return null;

  // Expand to household if household_column is set
  let displayIndices;
  if (source.household_column) {
    const householdValues = new Set(
      [...matchedSet].map(i => normaliseId(allRows[i][source.household_column]))
        .filter(v => v !== '')
    );
    displayIndices = allRows
      .map((_, i) => i)
      .filter(i => householdValues.has(normaliseId(allRows[i][source.household_column])));
  } else {
    displayIndices = [...matchedSet].sort((a, b) => a - b);
  }

  return { displayIndices, matchedSet, matchedRoles };
}

// ── Rendering ────────────────────────────────────────────────

/**
 * Build a Google Sheets deep-link URL.
 * rowIdx is 0-based index into allRows (excluding header).
 * Sheet row = rowIdx + 2 (1 for header row, 1 for 1-based).
 */
function sheetRowUrl(source, rowIdx) {
  if (!source.gid) return null;
  const sheetRow = rowIdx + 2; // +1 header, +1 for 1-based
  return `https://docs.google.com/spreadsheets/d/${source.sheet_id}/edit#gid=${source.gid}&range=A${sheetRow}`;
}

function makeLinkIcon(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'row-link';
  a.title = 'Open in Google Sheets';
  a.textContent = '↗';
  return a;
}

function renderTable(source, allRows, displayIndices, matchedSet, matchedRoles) {
  const dataCols = source.display_columns.filter(c => c !== '_role_');
  const showRole = source.display_columns.includes('_role_');
  const hasGid   = !!source.gid;
  const isHousehold = !!source.household_column;

  // Total extra columns before data: link? | role?
  const extraColCount = (hasGid ? 1 : 0) + (showRole ? 1 : 0);

  const wrap = document.createElement('div');
  wrap.className = 'record-table-wrap';

  const table = document.createElement('table');
  table.className = 'record-table';

  // Header
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  if (hasGid) {
    const th = document.createElement('th');
    th.className = 'col-link';
    th.textContent = '';
    headerRow.appendChild(th);
  }
  if (showRole) {
    const th = document.createElement('th');
    th.textContent = 'Role';
    headerRow.appendChild(th);
  }
  dataCols.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });

  // Body
  const tbody = table.createTBody();
  let prevHouseholdVal = null;
  // For household mode: track the first matched rowIdx per household value
  // so we can put the link only on that block's first matched row.
  const householdLinkEmitted = new Set(); // household values already given a link

  displayIndices.forEach((rowIdx) => {
    const row = allRows[rowIdx];
    const isMatched = matchedSet.has(rowIdx);

    // Household separator
    if (isHousehold) {
      const hVal = normaliseId(row[source.household_column]);
      if (prevHouseholdVal !== null && hVal !== prevHouseholdVal) {
        const sepRow = tbody.insertRow();
        sepRow.className = 'household-gap';
        const td = sepRow.insertCell();
        td.colSpan = dataCols.length + extraColCount;
      }
      prevHouseholdVal = hVal;
    }

    const tr = tbody.insertRow();
    if (isMatched) tr.className = 'matched-row';

    // ── Link cell ──
    if (hasGid) {
      const td = tr.insertCell();
      td.className = 'col-link';

      if (isHousehold) {
        // One link per household block: emit only on the first matched row of each household
        const hVal = normaliseId(row[source.household_column]);
        if (isMatched && !householdLinkEmitted.has(hVal)) {
          householdLinkEmitted.add(hVal);
          const url = sheetRowUrl(source, rowIdx);
          if (url) td.appendChild(makeLinkIcon(url));
        }
      } else {
        // One link per row (non-household sources)
        const url = sheetRowUrl(source, rowIdx);
        if (url) td.appendChild(makeLinkIcon(url));
      }
    }

    // ── Role cell ──
    if (showRole) {
      const td = tr.insertCell();
      if (isMatched) {
        const badge = document.createElement('span');
        badge.className = 'role-badge';
        badge.textContent = matchedRoles.get(rowIdx) ?? '—';
        td.appendChild(badge);
      }
    }

    // ── Data cells ──
    dataCols.forEach(col => {
      const td = tr.insertCell();
      td.textContent = row[col] ?? '';
    });
  });

  wrap.appendChild(table);
  return wrap;
}

function renderSection(section, results) {
  const hasAny = results.some(r => r !== null);

  const div = document.createElement('div');
  div.className = 'result-section';

  const header = document.createElement('div');
  header.className = 'section-header';

  const title = document.createElement('span');
  title.className = 'section-title';
  title.textContent = `${section.icon}  ${section.label}`;

  const count = document.createElement('span');
  count.className = 'section-count';

  if (!hasAny) {
    count.textContent = 'no records found';
  } else {
    const n = results.filter(r => r !== null).length;
    count.textContent = `${n} source${n !== 1 ? 's' : ''} with records`;
  }

  header.appendChild(title);
  header.appendChild(count);
  div.appendChild(header);

  if (!hasAny) {
    const empty = document.createElement('p');
    empty.className = 'section-empty';
    empty.textContent = 'No records found in this section.';
    div.appendChild(empty);
    return div;
  }

  section.sources.forEach((source, idx) => {
    const result = results[idx];
    if (!result) return;

    const group = document.createElement('div');
    group.className = 'source-group';

    const label = document.createElement('div');
    label.className = 'source-label';
    label.textContent = source.label;
    group.appendChild(label);

    const { displayIndices, matchedSet, matchedRoles, allRows } = result;
    const table = renderTable(source, allRows, displayIndices, matchedSet, matchedRoles);
    group.appendChild(table);

    div.appendChild(group);
  });

  return div;
}

// ── Main search ──────────────────────────────────────────────

function setLoading(msg) {
  document.getElementById('loading-section').classList.remove('hidden');
  document.getElementById('loading-message').textContent = msg;
  document.getElementById('results').classList.add('hidden');
  document.getElementById('error-section').classList.add('hidden');
}

function hideLoading() {
  document.getElementById('loading-section').classList.add('hidden');
}

function showError(msg) {
  hideLoading();
  const sec = document.getElementById('error-section');
  sec.classList.remove('hidden');
  document.getElementById('error-message').textContent = msg;
}

async function runSearch(personId) {
  if (!personId || isNaN(personId) || personId <= 0) {
    showError('Please enter a valid positive integer ID.');
    return;
  }

  setLoading('Searching all sources…');

  const config = GENEALOGY_CONFIG;
  const resultsBody = document.getElementById('results-body');
  resultsBody.innerHTML = '';

  // Fetch all tabs (deduplicated by sheetId+tab)
  const fetchCache = {}; // key -> promise -> rows

  const allSectionResults = [];

  for (const section of config.sections) {
    const sectionResults = [];

    for (const source of section.sources) {
      const cacheKey = `${source.sheet_id}::${source.tab}`;
      if (!fetchCache[cacheKey]) {
        fetchCache[cacheKey] = fetchSheetTab(source.sheet_id, source.tab)
          .catch(err => { console.warn(`Error fetching ${cacheKey}:`, err); return []; });
      }
    }

    allSectionResults.push({ section, sectionResults, sources: section.sources });
  }

  // Now resolve all fetches (they are all in flight simultaneously)
  const totalSources = config.sections.reduce((n, s) => n + s.sources.length, 0);
  let done = 0;

  for (const { section, sectionResults, sources } of allSectionResults) {
    for (const source of sources) {
      const cacheKey = `${source.sheet_id}::${source.tab}`;
      const allRows = await fetchCache[cacheKey];
      done++;
      setLoading(`Searching… (${done} / ${totalSources} sources)`);

      if (allRows.length === 0) {
        sectionResults.push(null);
        continue;
      }

      const match = matchSource(source, allRows, personId);
      if (match) {
        sectionResults.push({ ...match, allRows });
      } else {
        sectionResults.push(null);
      }
    }
  }

  hideLoading();

  // Build summary pills + render sections
  const summaryEl = document.getElementById('results-summary');
  summaryEl.innerHTML = '';

  let totalFound = 0;

  for (const { section, sectionResults } of allSectionResults) {
    const hasData = sectionResults.some(r => r !== null);
    if (hasData) totalFound++;

    const pill = document.createElement('span');
    pill.className = 'summary-pill' + (hasData ? ' has-data' : '');
    pill.textContent = `${section.icon} ${section.label}`;
    summaryEl.appendChild(pill);

    const sectionEl = renderSection(section, sectionResults);
    resultsBody.appendChild(sectionEl);
  }

  document.getElementById('results-id').textContent = `#${personId}`;
  document.getElementById('results').classList.remove('hidden');

  if (totalFound === 0) {
    resultsBody.innerHTML = `<p class="section-empty" style="padding:1rem 0">No records found for person ID <strong>${personId}</strong> in any source.</p>`;
  }
}

// ── Event wiring ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const btn   = document.getElementById('search-btn');
  const input = document.getElementById('person-id');

  btn.addEventListener('click', () => {
    runSearch(parseInt(input.value, 10));
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') runSearch(parseInt(input.value, 10));
  });

  // Support ?id=1234 in the URL on load
  const params = new URLSearchParams(window.location.search);
  const urlId  = parseInt(params.get('id'), 10);
  if (urlId > 0) {
    input.value = urlId;
    runSearch(urlId);
  }
});
