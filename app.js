// ============================================================
//  GENEALOGY SITE — APP LOGIC
// ============================================================

// ── Session cache ────────────────────────────────────────────
// key: "sheetId::gid" → Promise<rows[]>
// Persists across searches; cleared by user via "Ачысціць кэш".
const SHEET_CACHE = {};

// ── Data fetching ─────────────────────────────────────────────

async function fetchSheetTab(sheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch gid=${gid} (HTTP ${res.status})`);
  return parseCSV(await res.text());
}

// ── CSV parsing ───────────────────────────────────────────────

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false, i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
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
  return rows.slice(1)
    .map(r => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').replace(/^"|"$/g, '').trim(); });
      return obj;
    })
    .filter(row => Object.values(row).some(v => v !== ''));
}

// ── Config resolution helpers ─────────────────────────────────

/** Resolve { sheetId, gid } for a source, supporting tab-ref and legacy formats. */
function resolveSourceMeta(source, config) {
  const tabRef = config.tabs?.[source.tab];
  if (tabRef) {
    return {
      sheetId: config.sheets?.[tabRef.sheet] ?? tabRef.sheet_id ?? source.sheet_id,
      gid: tabRef.gid ?? source.gid,
    };
  }
  return {
    sheetId: source.sheet_id ?? (source.sheet ? config.sheets?.[source.sheet] : null),
    gid: source.gid,
  };
}

/** Resolve the columnMap for a source. */
function resolveColumnMap(source, config) {
  if (source.columnMap) return source.columnMap;
  const colDef = config.columns?.[source.display_columns];
  return (!Array.isArray(colDef) && colDef?.columnMap) || null;
}

/** Resolve the links map for a source (display column → ID column). */
function resolveLinks(source, config) {
  if (source.links) return source.links;
  const colDef = config.columns?.[source.display_columns];
  return (!Array.isArray(colDef) && colDef?.links) || null;
}

/**
 * Resolve display_columns into a flat array of column specs.
 * Handles string references, inline arrays, and columnMap renaming.
 */
function resolveDisplayColumns(source, config) {
  const colMap = resolveColumnMap(source, config);
  let cols = source.display_columns;

  if (typeof cols === 'string') {
    const colDef = config.columns?.[cols];
    cols = Array.isArray(colDef) ? colDef : (colDef?.columns ?? []);
  }

  if (colMap && Array.isArray(cols)) {
    cols = cols.map(col => (typeof col === 'string' && colMap[col]) ? colMap[col] : col);
  }

  return cols || [];
}

/** Apply a column rename map to an array of row objects. */
function applyColumnMap(rows, columnMap) {
  if (!columnMap || Object.keys(columnMap).length === 0) return rows;
  return rows.map(row => {
    const out = {};
    for (const [k, v] of Object.entries(row)) out[columnMap[k] ?? k] = v;
    return out;
  });
}

/** Normalise a cell value for ID comparison. */
function normaliseId(val) {
  return String(val ?? '').trim();
}

/** Returns true only if the value is a valid positive integer ID. */
function isValidId(val) {
  const s = normaliseId(val);
  return s !== '' && /^\d+$/.test(s) && parseInt(s, 10) > 0;
}

/** Get the display label of a column spec. */
function colLabel(colSpec) {
  if (typeof colSpec === 'string') return colSpec;
  // { col: "name", width: "50px" } shorthand
  if (colSpec.col) return colSpec.col;
  return colSpec.label ?? '';
}

/** Get the sheet column key of a column spec (may differ from display label). */
function colKey(colSpec) {
  if (typeof colSpec === 'string') return colSpec;
  if (colSpec.col) return colSpec.col;
  return colSpec.label ?? '';
}

/** Get explicit width if specified, or null. */
function colWidth(colSpec) {
  if (typeof colSpec === 'object' && colSpec !== null) return colSpec.width ?? null;
  return null;
}

/** Get abbreviation if specified, or null. */
function colAbbr(colSpec) {
  if (typeof colSpec === 'object' && colSpec !== null) return colSpec.abbr ?? null;
  return null;
}

// ── Display value formatting ──────────────────────────────────

function formatDisplayValue(row, colSpec) {
  if (typeof colSpec === 'string') return row[colSpec] ?? '';
  // { col: "name", width: "50px" } shorthand — treat like a plain string column
  if (colSpec.col) return row[colSpec.col] ?? '';

  // Multi-column join (e.g. date from day + month)
  if (Array.isArray(colSpec.columns)) {
    const values = colSpec.columns
      .map(c => row[c] ?? '')
      .filter(v => v !== '')
      .map(v => (colSpec.format === 'date' && /^\d+$/.test(String(v)))
        ? String(v).padStart(2, '0') : v);
    return values.length === 0 ? '' : values.join(colSpec.join ?? ' ');
  }

  // Template string (e.g. "хата №{№}")
  if (colSpec.template) {
    return colSpec.template.replace(
      new RegExp(`\\{${colSpec.column}\\}`, 'g'),
      row[colSpec.column] ?? ''
    );
  }

  return '';
}

// ── Matching ──────────────────────────────────────────────────

function matchSource(source, allRows, targetId) {
  const targetStr   = String(targetId);
  const matchedSet  = new Set();
  const matchedRoles = new Map();

  allRows.forEach((row, idx) => {
    for (const { column, role } of source.roles) {
      const cellVal = normaliseId(row[column]);
      if (isValidId(cellVal) && cellVal === targetStr) {
        matchedSet.add(idx);
        matchedRoles.set(idx, role);
        break;
      }
    }
  });

  if (matchedSet.size === 0) return null;

  let displayIndices;
  if (source.household_column) {
    const householdValues = new Set(
      [...matchedSet]
        .map(i => normaliseId(allRows[i][source.household_column]))
        .filter(v => v !== '')
    );
    displayIndices = allRows
      .map((_, i) => i)
      .filter(i => householdValues.has(normaliseId(allRows[i][source.household_column])));
  } else {
    displayIndices = [...matchedSet].sort((a, b) => {
      const yr = r => parseInt(allRows[r]['год'] ?? allRows[r]['year'] ?? 0, 10);
      return yr(a) - yr(b);
    });
  }

  return { displayIndices, matchedSet, matchedRoles };
}

// ── DOM helpers ───────────────────────────────────────────────

function makeElement(tag, { className, textContent, href, target, rel, title } = {}) {
  const el = document.createElement(tag);
  if (className)   el.className   = className;
  if (textContent !== undefined) el.textContent = textContent;
  if (href)        el.href        = href;
  if (target)      el.target      = target;
  if (rel)         el.rel         = rel;
  if (title)       el.title       = title;
  return el;
}

function makeLinkIcon(url) {
  return makeElement('a', {
    href: url, target: '_blank', rel: 'noopener noreferrer',
    className: 'row-link', title: 'Адкрыць у Google Sheets', textContent: '↗',
  });
}

function sheetRowUrl(source, rowIdx, config) {
  const { sheetId, gid } = resolveSourceMeta(source, config);
  if (!sheetId || !gid) return null;
  return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${gid}&range=A${rowIdx + 2}`;
}

// ── Cell rendering ────────────────────────────────────────────

/**
 * Render a cell value into a td element.
 * - Dims /…/ segments.
 * - If linkedId matches currentSearchId: marks cell as current person.
 * - Otherwise: appends a small → nav button.
 */
function renderCellValue(td, val, linkedId = null, currentSearchId = null) {
  const buildText = (container) => {
    if (!val?.includes('/')) {
      container.appendChild(document.createTextNode(val || ''));
      return;
    }
    val.split(/(\/[^/]*\/)/).forEach(part => {
      if (/^\/[^/]*\/$/.test(part)) {
        container.appendChild(makeElement('span', { className: 'cell-dim', textContent: part }));
      } else if (part) {
        container.appendChild(document.createTextNode(part));
      }
    });
  };

  buildText(td);

  if (!linkedId) return;

  if (isValidId(linkedId) && String(linkedId) === String(currentSearchId)) {
    td.classList.add('cell-current-person');
    return;
  }

  // Wrap text + button in a flex container
  const wrap = makeElement('div', { className: 'cell-nav-wrap' });
  const textSpan = makeElement('span', { className: 'cell-text' });
  while (td.firstChild) textSpan.appendChild(td.firstChild);
  wrap.appendChild(textSpan);
  wrap.appendChild(makeElement('a', {
    className: 'cell-nav-btn',
    href: `?id=${linkedId}`,
    title: `Перайсці да асобы #${linkedId}`,
    textContent: '→',
  }));
  td.appendChild(wrap);
}

// ── Table rendering ───────────────────────────────────────────

function createPersonTable(source, allRows, displayIndices, matchedSet, matchedRoles, config, {
  hasLink = true,
  highlightMatched = false,
  currentSearchId = null,
  householdInfoText = null,
  householdLinkUrl  = null,
} = {}) {
  const allCols    = resolveDisplayColumns(source, config);
  const showRole   = allCols.some(c => c === '_role_');
  const dataCols   = allCols.filter(c => c !== '_role_');
  const links      = resolveLinks(source, config);
  const { gid }    = resolveSourceMeta(source, config);
  const hasGid     = !!gid && hasLink;
  const isRevision = !!source.household_column;

  const totalCols = dataCols.length
    + (hasGid && !isRevision ? 1 : 0)
    + (showRole   ? 1 : 0)
    + (isRevision ? 1 : 0);

  const table = document.createElement('table');
  table.className = 'record-table';

  // ── Colgroup ──
  const colgroup = document.createElement('colgroup');
  const addCol = w => { const c = document.createElement('col'); c.style.width = w; colgroup.appendChild(c); };

  if (hasGid && !isRevision) addCol('36px');
  if (showRole)               addCol('80px');
  if (isRevision)             addCol('36px');

  dataCols.forEach(col => {
    const explicit = colWidth(col);
    if (explicit) { addCol(explicit); return; }
    const name = colLabel(col).toLowerCase();
    if (/возраст|день|месяц|лист/.test(name)) addCol('40px');
    else if (/^№|пред/.test(name))            addCol('40px');
    else if (/тип|пометка/.test(name))        addCol('55px');
    else if (/изменения/.test(name))          addCol('65px');
    else if (/родство/.test(name))            addCol('80px');
    else if (/отчество/.test(name))           addCol('90px');
    else if (/имя|фамили|н\.п/.test(name))    addCol('90px');
    else if (/комментари/.test(name))         addCol('160px');
    else                                      addCol('80px');
  });
  table.appendChild(colgroup);

  // ── Header ──
  const thead = table.createTHead();

  // Household info row (spans all columns, scrolls with table)
  if (householdInfoText) {
    const infoRow = thead.insertRow();
    infoRow.className = 'household-info-row';
    const td = infoRow.insertCell();
    td.colSpan = totalCols;
    td.className = 'household-info';
    td.appendChild(makeElement('span', { textContent: householdInfoText }));
    if (householdLinkUrl) td.appendChild(makeLinkIcon(householdLinkUrl));
  }

  const headerRow = thead.insertRow();
  const addTh = (text, cls, abbr = null) => {
    const th = document.createElement('th');
    if (cls) th.className = cls;
    if (abbr) {
      th.className = (th.className ? th.className + ' ' : '') + 'th-abbr';
      th.setAttribute('data-full', text);
      const abbrSpan = makeElement('span', { className: 'th-abbr-text', textContent: abbr });
      const tooltip  = makeElement('div',  { className: 'th-tooltip',   textContent: text });
      th.appendChild(abbrSpan);
      th.appendChild(tooltip);
    } else {
      th.textContent = text;
    }
    headerRow.appendChild(th);
  };
  if (hasGid && !isRevision) addTh('', 'col-link');
  if (showRole)               addTh('Роля');
  if (isRevision)             addTh('', 'col-link');
  dataCols.forEach(col => addTh(colLabel(col), null, colAbbr(col)));

  // ── Body ──
  const tbody = table.createTBody();
  displayIndices.forEach(rowIdx => {
    const row = allRows[rowIdx];
    const isMatched = matchedSet.has(rowIdx);
    const tr = tbody.insertRow();
    if (isMatched && highlightMatched) tr.className = 'matched-row';

    // Sheet link (non-revision only)
    if (hasGid && !isRevision) {
      const td = tr.insertCell();
      td.className = 'col-link';
      const url = sheetRowUrl(source, rowIdx, config);
      if (url) td.appendChild(makeLinkIcon(url));
    }

    // Role badge
    if (showRole) {
      const td = tr.insertCell();
      if (isMatched) {
        td.appendChild(makeElement('span', {
          className: 'role-badge',
          textContent: matchedRoles.get(rowIdx) ?? '—',
        }));
      }
    }

    // Internal person link (revision only)
    if (isRevision) {
      const td = tr.insertCell();
      td.className = 'col-link';
      let personId = null;
      for (const { column } of source.roles) {
        const val = normaliseId(row[column])
          || normaliseId(row[Object.keys(row).find(k => k.trim() === column.trim()) ?? '']);
        if (isValidId(val)) { personId = val; break; }
      }
      if (personId) {
        td.appendChild(makeElement('a', {
          href: `?id=${personId}`,
          className: 'row-link person-link',
          title: `Перайсці да асобы #${personId}`,
          textContent: '#',
        }));
      }
    }

    // Data cells
    dataCols.forEach(col => {
      const td = tr.insertCell();
      const val = formatDisplayValue(row, col);
      const linkedId = links?.[colKey(col)] ? normaliseId(row[links[colKey(col)]]) : null;
      renderCellValue(td, val, (linkedId && isValidId(linkedId)) ? linkedId : null, currentSearchId);
    });
  });

  return table;
}

function renderTable(source, allRows, displayIndices, matchedSet, matchedRoles, config, highlightMatched, currentSearchId) {
  const wrap = makeElement('div', { className: 'record-table-wrap' });

  if (!source.household_column) {
    wrap.appendChild(createPersonTable(source, allRows, displayIndices, matchedSet, matchedRoles, config, {
      highlightMatched, currentSearchId,
    }));
    return wrap;
  }

  // Group rows by household value
  const householdGroups = new Map();
  displayIndices.forEach(rowIdx => {
    const hVal = normaliseId(allRows[rowIdx][source.household_column]);
    if (!householdGroups.has(hVal)) householdGroups.set(hVal, []);
    householdGroups.get(hVal).push(rowIdx);
  });

  const { gid } = resolveSourceMeta(source, config);

  for (const [, rowIndices] of householdGroups) {
    const householdCols = source.household_columns ?? [];
    let householdInfoText = null;
    let householdLinkUrl  = null;

    if (householdCols.length > 0) {
      const firstRow = allRows[rowIndices[0]];
      const tokens = householdCols.map(col => formatDisplayValue(firstRow, col)).filter(v => v);
      if (tokens.length > 0) {
        householdInfoText = tokens.join(',  ');
        if (gid) householdLinkUrl = sheetRowUrl(source, rowIndices[0], config);
      }
    }

    const table = createPersonTable(source, allRows, rowIndices, matchedSet, matchedRoles, config, {
      highlightMatched, currentSearchId, householdInfoText, householdLinkUrl,
    });
    wrap.appendChild(table);
  }

  return wrap;
}

// ── Section rendering ─────────────────────────────────────────

function renderSection(section, results, config, currentSearchId) {
  const hasAny = results.some(r => r !== null);

  const div = makeElement('div', { className: 'result-section' });
  div.id = `section-${section.id}`;

  const header = makeElement('div', { className: 'section-header' });
  header.appendChild(makeElement('span', { className: 'section-title', textContent: `${section.icon}  ${section.label}` }));
  const n = results.filter(r => r !== null).length;
  header.appendChild(makeElement('span', {
    className: 'section-count',
    textContent: hasAny ? `${n} крыніц(а) з запісамі` : 'запісаў не знойдзена',
  }));
  div.appendChild(header);

  if (!hasAny) {
    div.appendChild(makeElement('p', { className: 'section-empty', textContent: 'Запісаў у гэтым раздзеле не знойдзена.' }));
    return div;
  }

  const body = makeElement('div', { className: 'result-section-body' });
  results.forEach((result, idx) => {
    if (!result) return;
    const source = section.sources[idx];
    const group  = makeElement('div', { className: 'source-group' });
    group.appendChild(makeElement('div', { className: 'source-label', textContent: source.label }));
    const { displayIndices, matchedSet, matchedRoles, allRows } = result;
    group.appendChild(renderTable(source, allRows, displayIndices, matchedSet, matchedRoles, config, section.highlight_matched ?? false, currentSearchId));
    body.appendChild(group);
  });

  div.appendChild(body);
  return div;
}

/**
 * Extract the person's full name from revision results.
 * Uses the latest revision that has a matched row.
 * Returns "Surname Name Patronymic", stripping /…/ wrappers from each part.
 */
function extractPersonName(allSectionResults, personId) {
  const revisionResult = allSectionResults.find(({ section }) => section.id === 'revisions');
  if (!revisionResult) return null;

  // Find the last source (latest revision) that has a match
  let matchedRow = null;
  for (let i = revisionResult.sectionResults.length - 1; i >= 0; i--) {
    const result = revisionResult.sectionResults[i];
    if (!result) continue;
    // Find the matched row for this person specifically
    const rowIdx = [...result.matchedSet][0];
    if (rowIdx !== undefined) { matchedRow = result.allRows[rowIdx]; break; }
  }
  if (!matchedRow) return null;

  const stripSlashes = val => {
    if (!val) return '';
    const s = val.trim();
    // Remove surrounding /…/ but keep the content
    return /^\/.*\/$/.test(s) ? s.slice(1, -1).trim() : s;
  };

  // Try both Russian and renamed (Belarusian via columnMap) key variants
  const get = (...keys) => {
    for (const k of keys) { const v = matchedRow[k]; if (v) return v; }
    return '';
  };

  const surname    = stripSlashes(get('фамилия', 'фамілія', 'фамiлiя'));
  const name       = stripSlashes(get('имя', 'імя'));
  const patronymic = stripSlashes(get('отчество', 'отчаство', 'отчасьво'));

  return [surname, name, patronymic].filter(Boolean).join(' ') || null;
}

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
  document.getElementById('error-section').classList.remove('hidden');
  document.getElementById('error-message').textContent = msg;
}

// ── Main search ───────────────────────────────────────────────

async function runSearch(personId) {
  if (!personId || isNaN(personId) || personId <= 0) {
    showError('Калі ласка, увядзіце дадатны цэлы нумар.');
    return;
  }

  history.pushState(null, '', `?id=${personId}`);
  setLoading('Пошук ва ўсіх крыніцах…');
  document.getElementById('results-body').innerHTML = '';

  const config = GENEALOGY_CONFIG;

  // Deduplicate sources by sheetId::gid and fire all fetches in parallel
  const uniqueKeys = new Set(
    config.sections.flatMap(s => s.sources).map(source => {
      const { sheetId, gid } = resolveSourceMeta(source, config);
      return `${sheetId}::${gid}`;
    })
  );

  for (const key of uniqueKeys) {
    if (!SHEET_CACHE[key]) {
      const [sheetId, gid] = key.split('::');
      SHEET_CACHE[key] = fetchSheetTab(sheetId, gid)
        .catch(err => { console.warn(`Error fetching ${key}:`, err); return []; });
    }
  }

  setLoading(`Загрузка ${uniqueKeys.size} крыніц…`);
  await Promise.all([...uniqueKeys].map(k => SHEET_CACHE[k]));

  // Match each source against the person ID
  const totalSources = config.sections.reduce((n, s) => n + s.sources.length, 0);
  let done = 0;
  const allSectionResults = [];

  for (const section of config.sections) {
    const sectionResults = [];
    for (const source of section.sources) {
      const { sheetId, gid } = resolveSourceMeta(source, config);
      setLoading(`Пошук… (${++done} / ${totalSources})`);

      let allRows = await SHEET_CACHE[`${sheetId}::${gid}`];
      if (allRows.length === 0) { sectionResults.push(null); continue; }

      const colMap = resolveColumnMap(source, config);
      if (colMap) allRows = applyColumnMap(allRows, colMap);

      const match = matchSource(source, allRows, personId);
      sectionResults.push(match ? { ...match, allRows } : null);
    }
    allSectionResults.push({ section, sectionResults });
  }

  hideLoading();

  // Render summary pills and section cards
  const summaryEl  = document.getElementById('results-summary');
  const resultsBody = document.getElementById('results-body');
  summaryEl.innerHTML = '';
  let totalFound = 0;

  for (const { section, sectionResults } of allSectionResults) {
    const hasData = sectionResults.some(r => r !== null);
    if (hasData) totalFound++;

    // hide_if_empty: true — skip pill and card entirely when no records found
    if (!hasData && section.hide_if_empty) continue;

    summaryEl.appendChild(makeElement('a', {
      className: 'summary-pill' + (hasData ? ' has-data' : ''),
      textContent: `${section.icon} ${section.label}`,
      href: `#section-${section.id}`,
    }));
    resultsBody.appendChild(renderSection(section, sectionResults, config, personId));
  }

  document.getElementById('results-id').textContent = `#${personId}`;
  const personName = extractPersonName(allSectionResults, personId);
  document.getElementById('results-name').textContent = personName ?? '';
  document.getElementById('results').classList.remove('hidden');

  if (totalFound === 0) {
    resultsBody.innerHTML = `<p class="section-empty" style="padding:1rem 0">Запісаў для асобы <strong>${personId}</strong> не знойдзена ні ў адной крыніцы.</p>`;
  }

  // Update cache status line
  const statusEl = document.getElementById('cache-status');
  if (statusEl) {
    const n = Object.keys(SHEET_CACHE).length;
    statusEl.innerHTML = `${n} крыніц(а) захавана ў памяці — наступны пошук будзе імгненным. <a id="clear-cache">Ачысціць кэш</a>`;
    document.getElementById('clear-cache')?.addEventListener('click', () => {
      Object.keys(SHEET_CACHE).forEach(k => delete SHEET_CACHE[k]);
      statusEl.textContent = 'Кэш ачышчаны — наступны пошук загрузіць усе крыніцы нанова.';
    });
  }
}

// ── Event wiring ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('person-id');

  document.getElementById('search-btn').addEventListener('click', () => {
    runSearch(parseInt(input.value, 10));
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') runSearch(parseInt(input.value, 10));
  });

  // Tap to show abbreviated header tooltips (touch devices)
  document.addEventListener('click', e => {
    const th = e.target.closest('th.th-abbr');
    // Close any open tooltip that isn't this one
    document.querySelectorAll('th.th-abbr.tooltip-open').forEach(el => {
      if (el !== th) el.classList.remove('tooltip-open');
    });
    if (th) th.classList.toggle('tooltip-open');
  });

  // Intercept all internal ?id= link clicks — use in-page search to preserve the cache
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="?id="]');
    if (!a) return;
    e.preventDefault();
    const id = parseInt(new URLSearchParams(a.getAttribute('href').slice(1)).get('id'), 10);
    if (id > 0) {
      input.value = id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      runSearch(id);
    }
  });

  // Re-run search on browser back/forward
  window.addEventListener('popstate', () => {
    const id = parseInt(new URLSearchParams(window.location.search).get('id'), 10);
    if (id > 0) { input.value = id; runSearch(id); }
  });

  // Scroll-to-top button
  const scrollBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => scrollBtn.classList.toggle('visible', window.scrollY > 400));
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Auto-search from URL on page load
  const urlId = parseInt(new URLSearchParams(window.location.search).get('id'), 10);
  if (urlId > 0) { input.value = urlId; runSearch(urlId); }
});