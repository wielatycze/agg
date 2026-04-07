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
async function fetchSheetTab(sheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch gid=${gid} (HTTP ${res.status})`);
  const text = await res.text();
  return parseCSV(text);
}

/**
 * Apply a column map to rename columns in row objects.
 */
function renameColumns(rows, columnMap) {
  if (!columnMap || Object.keys(columnMap).length === 0) return rows;
  return rows.map(row => {
    const newRow = {};
    for (const [key, value] of Object.entries(row)) {
      const newKey = columnMap[key] ?? key;
      newRow[newKey] = value;
    }
    return newRow;
  });
}

/**
 * Resolve source.display_columns, which can be either:
 * - a string: reference to config.columns (e.g. "revisions")
 * - an array: inline column definitions
 * If columnMap is present, apply it to column names in the array.
 */
function resolveDisplayColumns(source, config, colMap = null) {
  let cols = source.display_columns;
  
  // If it's a string, look it up in config.columns
  if (typeof cols === 'string') {
    if (config.columns?.[cols]) {
      const colDef = config.columns[cols];
      cols = Array.isArray(colDef) ? colDef : (colDef.columns ?? []);
    } else {
      cols = [];
    }
  }
  
  // Apply columnMap to column names
  if (colMap && Array.isArray(cols)) {
    cols = cols.map(col => {
      if (typeof col === 'string' && colMap[col]) {
        return colMap[col];
      }
      return col;
    });
  }
  
  return cols || [];
}

/**
 * Resolve source.display_columns to get the columnMap.
 * If display_columns is a string reference, look up the columnMap in that column set.
 */
function resolveColumnMap(source, config) {
  if (source.columnMap) {
    return source.columnMap;
  }
  if (typeof source.display_columns === 'string' && config.columns?.[source.display_columns]) {
    const colDef = config.columns[source.display_columns];
    // columnMap is only available in object format
    return !Array.isArray(colDef) ? (colDef.columnMap ?? null) : null;
  }
  return null;
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

function resolveSourceSheetTab(source, config) {
  let sheetId = source.sheet_id;
  let tab = source.tab;
  let gid = source.gid;

  let tabRef = config.tabs?.[source.tab];
  if (!tabRef && config.tabs) {
    tabRef = Object.values(config.tabs).find(ref => ref.tab === source.tab);
  }
  if (tabRef) {
    sheetId = config.sheets?.[tabRef.sheet] ?? tabRef.sheet_id ?? sheetId;
    tab = tabRef.tab ?? tab;
    gid = tabRef.gid ?? gid;
  } else if (source.sheet && !sheetId) {
    sheetId = config.sheets?.[source.sheet] ?? sheetId;
  }

  return { sheetId, tab, gid };
}

function isDisplayColumnObject(col) {
  return typeof col === 'object' && col !== null && Array.isArray(col.columns);
}

function formatDisplayValue(row, colSpec) {
  if (typeof colSpec === 'string') {
    return row[colSpec] ?? '';
  }
  if (isDisplayColumnObject(colSpec)) {
    const values = colSpec.columns
      .map(column => row[column] ?? '')
      .filter(value => value !== '')
      .map(value => {
        if (colSpec.format === 'date' && /^\d+$/.test(String(value))) {
          return String(value).padStart(2, '0');
        }
        return value;
      });
    return values.length === 0 ? '' : values.join(colSpec.join ?? ' ');
  }
  if (colSpec && typeof colSpec === 'object' && colSpec.template) {
    let text = colSpec.template;
    const column = colSpec.column;
    const value = row[column] ?? '';
    text = text.replace(new RegExp(`\\{${column}\\}`, 'g'), value);
    return text;
  }
  return '';
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
function sheetRowUrl(source, rowIdx, config) {
  const { sheetId, gid } = resolveSourceSheetTab(source, config);
  if (!sheetId || !gid) return null;
  const sheetRow = rowIdx + 2; // +1 header, +1 for 1-based
  return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${gid}&range=A${sheetRow}`;
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

function renderTable(source, allRows, displayIndices, matchedSet, matchedRoles, config) {
  const colMap = resolveColumnMap(source, config);
  const displayCols = resolveDisplayColumns(source, config, colMap).filter(c => c !== '_role_');
  const householdCols = source.household_columns || [];
  const showRole = resolveDisplayColumns(source, config, colMap).includes('_role_');
  const hasGid   = !!resolveSourceSheetTab(source, config).gid;
  const isHousehold = !!source.household_column;

  const wrap = document.createElement('div');
  wrap.className = 'record-table-wrap';

  if (!isHousehold) {
    // Non-household: single table
    const table = createPersonTable(source, allRows, displayIndices, matchedSet, matchedRoles, true, config);
    wrap.appendChild(table);
    return wrap;
  }

  // Household mode: group by household
  const householdGroups = new Map();
  displayIndices.forEach(rowIdx => {
    const row = allRows[rowIdx];
    const hVal = normaliseId(row[source.household_column]);
    if (!householdGroups.has(hVal)) householdGroups.set(hVal, []);
    householdGroups.get(hVal).push(rowIdx);
  });

  // For each household
  for (const [hVal, rowIndices] of householdGroups) {
    const householdDiv = document.createElement('div');
    householdDiv.className = 'household-section';

    // Household info
    if (householdCols.length > 0) {
      const firstRowIdx = rowIndices[0];
      const firstRow = allRows[firstRowIdx];
      const tokens = householdCols
        .map(col => formatDisplayValue(firstRow, col))
        .filter(v => v);

      if (tokens.length > 0) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'household-info';

        const text = document.createElement('span');
        text.textContent = tokens.join(',  ');
        infoDiv.appendChild(text);

        if (hasGid) {
          const url = sheetRowUrl(source, firstRowIdx, config);
          if (url) infoDiv.appendChild(makeLinkIcon(url));
        }

        householdDiv.appendChild(infoDiv);
      }
    }

    // Person table
    const table = createPersonTable(source, allRows, rowIndices, matchedSet, matchedRoles, false, config);
    householdDiv.appendChild(table);

    wrap.appendChild(householdDiv);
  }

  return wrap;
}

function createPersonTable(source, allRows, displayIndices, matchedSet, matchedRoles, hasLink = true, config) {
  const colMap = resolveColumnMap(source, config);
  const displayCols = resolveDisplayColumns(source, config, colMap).filter(c => c !== '_role_');
  const showRole = resolveDisplayColumns(source, config, colMap).includes('_role_');
  const hasGid   = !!resolveSourceSheetTab(source, config).gid && hasLink;

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
  displayCols.forEach(col => {
    const th = document.createElement('th');
    th.textContent = typeof col === 'string' ? col : col.label;
    headerRow.appendChild(th);
  });

  // Body
  const tbody = table.createTBody();
  displayIndices.forEach((rowIdx) => {
    const row = allRows[rowIdx];
    const isMatched = matchedSet.has(rowIdx);

    const tr = tbody.insertRow();
    if (isMatched) tr.className = 'matched-row';

    // ── Link cell ──
    if (hasGid) {
      const td = tr.insertCell();
      td.className = 'col-link';
      const url = sheetRowUrl(source, rowIdx, config);
      if (url) td.appendChild(makeLinkIcon(url));
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
    displayCols.forEach(col => {
      const td = tr.insertCell();
      td.textContent = formatDisplayValue(row, col);
    });
  });

  return table;
}

function renderSection(section, results, config) {
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

  const body = document.createElement('div');
  body.className = 'result-section-body';

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
    const tableWrap = renderTable(source, allRows, displayIndices, matchedSet, matchedRoles, config);
    group.appendChild(tableWrap);

    body.appendChild(group);
  });

  div.appendChild(body);

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

  // Fetch all tabs (deduplicated by sheetId+gid)
  const fetchCache = {}; // key -> promise -> rows

  const allSectionResults = [];

  for (const section of config.sections) {
    const sectionResults = [];

    for (const source of section.sources) {
      const { sheetId, gid } = resolveSourceSheetTab(source, config);
      const cacheKey = `${sheetId}::${gid}`;
      if (!fetchCache[cacheKey]) {
        fetchCache[cacheKey] = fetchSheetTab(sheetId, gid)
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
      const { sheetId, gid } = resolveSourceSheetTab(source, config);
      const cacheKey = `${sheetId}::${gid}`;
      let allRows = await fetchCache[cacheKey];
      done++;
      setLoading(`Searching… (${done} / ${totalSources} sources)`);

      if (allRows.length === 0) {
        sectionResults.push(null);
        continue;
      }

      // Apply column mapping if defined
      const colMap = resolveColumnMap(source, config);
      if (colMap) {
        allRows = renameColumns(allRows, colMap);
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

    const sectionEl = renderSection(section, sectionResults, config);
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