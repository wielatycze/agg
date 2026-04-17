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
    marriageUn:   { sheet: "churchRecords", gid: 1045153146 },
    marriageOrth: { sheet: "churchRecords", gid: 229265291 }
  },

  columns: {
    revisions: {
      columns: ["родство", "имя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии", "листы"],
      columnMap: { "имя": "імя" }
    },
    birthsUn: {
      columns: [ "год",
        { label: "дата рождения", columns: ["день рождения", "месяц рождения"], join: ".", format: "date" },
        { label: "дата крещения", columns: ["день крещения", "месяц крещения"], join: ".", format: "date" },
        "имя ребенка",
        "имя отца",
        "имя матери",
        "фамилия",
        "н. п.",
        "крестный 1",
        "крестный 2"
      ],
      links: {
        "имя ребенка": "#ребенка",
        "имя отца":    "#отца",
        "имя матери":  "#матери",
        "крестный 1":  "#крестный 1",
        "крестный 2":  "#крестный 2"
      }
    },
    birthsPr: {
      columns: [
        "год",
        { label: "дата рождения", columns: ["день рождения", "месяц рождения"], join: ".", format: "date" },
        { label: "дата крещения", columns: ["день крещения", "месяц крещения"], join: ".", format: "date" },
        "имя ребенка",
        "имя отца",
        "отчество отца",
        "имя матери",
        "отчество матери",
        "фамилия",
        "восприемник",
        "восприемница"
      ],
      links: {
        "имя ребенка":  "#ребенка",
        "имя отца":     "#отца",
        "имя матери":   "#матери",
        "восприемник":  "#крестный 1",
        "восприемница": "#крестный 2"
      }
    },
    marriagesUn: {
      columns: ["_role_","год", "№", "1", "2", "3", "4", "5", "6", "7", "8"]
    },
    marriagesOrth: {
      columns: ["_role_", "№",
        { label: "дата шлюба", columns: ["dd", "mm"], join: ".", format: "date" }, "year",
        "m_pl", "m_name", "m_patr", "m_surn", "m_age", "f_pl", "f_patr", "f_surn", "f_age"]
    }
  },

  sections: [

    // ── REVISIONS ───────────────────────────────────────────
    {
      id:    "revisions",
      label: "Рэвізскіі сказкі",
      icon:  "📜",
      highlight_matched: true,
      sources: [

        {
          tab:              "revision1811",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1811 год",
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", { template: "хата №{№}", column: "№" }],
          display_columns: ["родство", "имя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии"]
        },

        {
          tab:              "revision1816",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1816 год",
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", { template: "хата №{№}", column: "№" }],
          display_columns: "revisions"
        },

        {
          tab:              "revision1834",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1834 год",
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", { template: "хата №{№}", column: "№" }],
          display_columns: "revisions"
        },

        {
          tab:              "revision1850",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1850 год",
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", { template: "хата №{№}", column: "№" }],
          display_columns: "revisions"
        },

        {
          tab:              "revision1858",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1858 год",
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", "№ пред.", { template: "хата №{№}", column: "№" }],
          display_columns: "revisions"
        }

      ]
    },

    // ── BIRTH RECORD (the person themselves) ────────────────
    {
      id:    "births",
      highlight_matched: false,
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
          display_columns: "birthsUn"
        },

        {
          tab:              "birthPr",
          label:            "Вяляцічы, праваслаўная царква",
          household_column: null,
          roles: [
            { column: "#ребенка", role: "Child" }
          ],
          display_columns: "birthsPr"
        }

      ]
    },

    // ── MARRIAGES ───────────────────────────────────────────
    {
      id:    "marriages",
      highlight_matched: false,
      label: "Метрычныя кнігі — шлюбы",
      icon:  "💍",
      sources: [

        {
          tab:              "marriageUn",
          label:            "Вяляцічы, уніацкая царква",
          household_column: null,
          roles: [
            { column: "#жениха",  role: "Жаніх" },
            { column: "#невесты", role: "Нявеста" }
          ],
          display_columns: "marriagesUn"
        },

        {
          tab:              "marriageOrth",
          label:            "Вяляцічы, праваслаўная царква",
          household_column: null,
          roles: [
            { column: "#жаніха",  role: "Жаніх" },
            { column: "#нявесты", role: "Нявеста" }
          ],
          display_columns: "marriagesOrth"
        }

      ]
    },

    // ── CHILDREN — BIRTH RECORDS ─────────────────────────────
    {
      id:    "children_births",
      highlight_matched: false,
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
          display_columns: "birthsUn"
        },

        {
          tab:              "birthPr",
          label:            "Вяляцічы, праваслаўная царква",
          household_column: null,
          roles: [
            { column: "#отца",   role: "Father" },
            { column: "#матери", role: "Mother" }
          ],
          display_columns: "birthsPr"
        }

      ]
    },

    // ── DEATHS ──────────────────────────────────────────────
    {
      id:    "deaths",
      highlight_matched: false,
      label: "Метрычныя кнігі — смерць",
      icon:  "✝",
      sources: [
        // Add death record sources here when available
      ]
    },

    // ── WITNESS AT BIRTHS ────────────────────────────────────
    {
      id:    "witness_birth",
      highlight_matched: false,
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
          display_columns: "birthsUn"
        }

      ]
    },

    // ── WITNESS AT MARRIAGES ─────────────────────────────────
    {
      id:    "witness_marriage",
      highlight_matched: false,
      label: "Сведкі — шлюбы",
      icon:  "👁",
      sources: [
        {
          tab:              "marriageUn",
          label:            "Вяляцічы, уніацкая царква",
          household_column: null,
          roles: [
            { column: "#свидетель1", role: "Сведка #1" },
            { column: "#свидетель2", role: "Сведка #2" },
            { column: "#свидетель3", role: "Сведка #3" }
          ],
          display_columns: "marriagesUn"
        }
      ]
    }

  ] // end sections
};