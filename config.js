// ============================================================
//  GENEALOGY SITE — CONFIG FILE
//  Edit this file to add/remove/modify data sources.
//  You do NOT need to touch index.html, style.css, or app.js.
// ============================================================

const GENEALOGY_CONFIG = {

  sheets: {
    revisions: "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
    churchRecords: "1OE7oQm51VU4m-G4otwEOVC7j0a423T3ndKDBpHVMojY"
  },

  tabs: {
    revision1811: { sheet: "revisions", gid: 1765304438 },
    revision1816: { sheet: "revisions", gid: 1330631543 },
    revision1834: { sheet: "revisions", gid: 1743797303 },
    revision1850: { sheet: "revisions", gid: 1936198662 },
    revision1858: { sheet: "revisions", gid: 2074719809 },
    birthUn:      { sheet: "churchRecords", gid: 572746856 },
    birthPr:      { sheet: "churchRecords", gid: 0 },
    marriageUn:   { sheet: "churchRecords", gid: 1045153146 }
  },

  // ──────────────────────────────────────────────────────────
  // SECTIONS
  // Each section groups related sources into one display block.
  //
  // Per source:
  //   sheet_id         — long ID from the sheet URL (legacy; optional when using config.tabs)
  //   tab              — tab key defined in config.tabs, or the exact tab name for legacy support
  //                      not required when gid is provided, because gid is enough for fetching.
  //   label            — human label shown on the page
  //   household_column — REVISIONS ONLY: column whose value
  //                      groups household members; all rows
  //                      with the same value are displayed
  //                      when any member is matched.
  //                      Must be null for all other sections.
  //   columnMap        — optional object mapping sheet column names to display names
  //                      e.g. { "long_name": "short_name" }
  //                      renamed columns work in roles, display_columns, etc.
  //   roles            — { column, role } pairs; person is
  //                      matched if their ID appears in ANY
  //                      of these columns
  //   display_columns  — ordered list of column headers to
  //                      show; use "_role_" to insert a Role
  //                      badge column. Entries may be strings or
  //                      objects like { label, columns, join } to
  //                      combine multiple fields into one display cell.
  //   household_columns — REVISIONS ONLY: ordered list of column
  //                      headers to show once per household above the table.
  //                      Entries may be strings or objects like
  //                      { template: "text {column}", column: "col" } for custom formatting.
  //                      Must be null for all other sections.
  // ──────────────────────────────────────────────────────────

  sections: [

    // ── REVISIONS ───────────────────────────────────────────
    {
      id:    "revisions",
      label: "Рэвізскіі сказкі",
      icon:  "📜",
      sources: [

        {
          tab:              "revision1811",
          columnMap:        { "имя": "імя" },
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1811 год",
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", { template: "хата №{№}", column: "№" }],
          display_columns: ["родство", "імя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии", "листы"]
        },

        {
          tab:              "revision1816",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1816 год",
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", { template: "хата №{№}", column: "№" }],
          display_columns: ["родство", "имя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии", "листы"]
        },

        {
          tab:              "revision1834",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1834 год",
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", { template: "хата №{№}", column: "№" }],
          display_columns: ["родство", "имя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии", "листы"]
        },

        {
          tab:              "revision1850",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1850 год",
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", { template: "хата №{№}", column: "№" }],
          display_columns: ["родство", "имя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии", "листы"]
        },

        {
          tab:              "revision1858",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1858 год",
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", "№ пред.", { template: "хата №{№}", column: "№" }],
          display_columns: ["родство", "имя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии", "листы"]
        }

      ]
    },

    // ── BIRTH RECORD (the person themselves) ────────────────
    {
      id:    "births",
      label: "Метрычныя кнігі — нараджэнне",
      icon:  "🕯",
      sources: [

        {
          tab:              "birthUn",
          label:            "Вяляцічы, уніацкая царква",
          household_column: null,
          roles: [
            { column: "#ребенка", role: "Child" }
          ],
          display_columns: [ "год",
            { label: "дата рождения", columns: ["день рождения", "месяц рождения"], join: ".", format: "date" },
            { label: "дата крещения", columns: ["день крещения", "месяц крещения"], join: ".", format: "date" },
            "имя ребенка",
            "имя отца",
            "имя матери",
            "фамилия",
            "н. п.",
            "крестный 1",
            "крестный 2"
          ]
        },

        {
          tab:              "birthPr",
          label:            "Вяляцічы, праваслаўная царква",
          household_column: null,
          roles: [
            { column: "#ребенка", role: "Child" }
          ],
          display_columns: [
            "год",
            { label: "дата рождения", columns: ["день рождения", "месяц рождения"], join: "." },
            { label: "дата крещения", columns: ["день крещения", "месяц крещения"], join: "." },
            "имя ребенка",
            "имя отца",
            "отчество отца",
            "имя матери",
            "отчество матери",
            "фамилия",
            "восприемник",
            "восприемница"
          ]
        }

      ]
    },

    // ── MARRIAGES ───────────────────────────────────────────
    {
      id:    "marriages",
      label: "Метрычныя кнігі — шлюбы",
      icon:  "💍",
      sources: [

        {
          tab:              "marriageUn",
          label:            "Вяляцічы, уніацкая царква",
          household_column: null,
          roles: [
            { column: "#жениха",  role: "Groom" },
            { column: "#невесты", role: "Bride" }
          ],
          display_columns: ["_role_","год", "№", "1", "2", "3", "4", "5", "6", "7", "8"]    }

        // Add more marriage sources here…
      ]
    },

    // ── CHILDREN — BIRTH RECORDS ─────────────────────────────
    {
      id:    "children_births",
      label: "Дзеці — метрычныя кнігі нараджэння",
      icon:  "👶",
      sources: [

        {
          tab:              "birthUn",
          label:            "Вяляцічы, уніацкая царква",
          household_column: null,
          roles: [
            { column: "#отца",   role: "Father" },
            { column: "#матери", role: "Mother" }
          ],
          display_columns: [
            "год",
            { label: "дата рождения", columns: ["день рождения", "месяц рождения"], join: "." },
            { label: "дата крещения", columns: ["день крещения", "месяц крещения"], join: "." },
            "имя ребенка",
            "имя отца",
            "отчество отца",
            "имя матери",
            "отчество матери",
            "фамилия",
            "восприемник",
            "восприемница"
          ]        },

        {
          tab:              "birthPr",
          label:            "Вяляцічы, праваслаўная царква",
          household_column: null,
          roles: [
            { column: "#отца",   role: "Father" },
            { column: "#матери", role: "Mother" }
          ],
          display_columns: [
            "год",
            { label: "дата рождения", columns: ["день рождения", "месяц рождения"], join: "." },
            { label: "дата крещения", columns: ["день крещения", "месяц крещения"], join: "." },
            "имя ребенка",
            "имя отца",
            "отчество отца",
            "имя матери",
            "отчество матери",
            "фамилия",
            "восприемник",
            "восприемница"
          ]        }

      ]
    },

    // ── DEATHS ──────────────────────────────────────────────
    {
      id:    "deaths",
      label: "Метрычныя кнігі — смерць",
      icon:  "✝",
      sources: [
        // Add death record sources here when available
      ]
    },

    // ── WITNESS AT BIRTHS ────────────────────────────────────
    {
      id:    "witness_birth",
      label: "Сведкі — нараджэнне",
      icon:  "👁",
      sources: [

        {
          tab:              "birthUn",
          label:            "Вяляцічы, уніацкая царква",
          household_column: null,
          roles: [
            { column: "#крестный 1", role: "Сведка #1" },
            { column: "#крестный 2", role: "Сведка #2" }
          ],
          display_columns: ["год", "день рождения", "месяц рождения", "имя ребенка", "имя отца", "имя матери", "фамилия", "н. п.", "крестный 1", "крестный 2"]
        }

        // Р/Велятичи пр: add when godparent ID column names are known
      ]
    },
        // ── WITNESS AT MARRIAGES ─────────────────────────────────

    {
      id: "witness_marriage",
      label: "Сведкі - шлюбы",
      icon:  "👁",
      sources: [
        {
          tab:              "marriageUn",
          label:            "Вяляцічы, уніацкая царква",
          household_column: null,
          roles: [
            { column: "#свидетель1",  role: "Сведка #1" },
            { column: "#свидетель2",  role: "Сведка #2" },
            { column: "#свидетель3",  role: "Сведка #3" },
          ],
          display_columns: ["_role_","год", "№", "1", "2", "3", "4", "5", "6", "7", "8"]    }
      ]
    }

    

  ] // end sections
};
