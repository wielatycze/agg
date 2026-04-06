// ============================================================
//  GENEALOGY SITE — CONFIG FILE
//  Edit this file to add/remove/modify data sources.
//  You do NOT need to touch index.html, style.css, or app.js.
// ============================================================

const GENEALOGY_CONFIG = {

  // ──────────────────────────────────────────────────────────
  // SECTIONS
  // Each section groups related sources into one display block.
  //
  // Per source:
  //   sheet_id         — long ID from the sheet URL
  //   tab              — exact tab name (case-sensitive)
  //                      required even if gid is set — used
  //                      for the CSV fetch URL
  //   label            — human label shown on the page
  //   gid              — numeric tab ID for deep-linking
  //                      (from ...edit#gid=XXXXXXX in URL)
  //                      set to null to disable row links
  //   household_column — REVISIONS ONLY: column whose value
  //                      groups household members; all rows
  //                      with the same value are displayed
  //                      when any member is matched.
  //                      Must be null for all other sections.
  //   roles            — { column, role } pairs; person is
  //                      matched if their ID appears in ANY
  //                      of these columns
  //   display_columns  — ordered list of column headers to
  //                      show; use "_role_" to insert a Role
  //                      badge column. Entries may be strings or
  //                      objects like { label, columns, join } to
  //                      combine multiple fields into one display cell.
  //   household_columns — REVISIONS ONLY: ordered list of column
  //                      headers to show once per household in a
  //                      header row. Entries may be strings or
  //                      objects like { label, columns, join }.
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
          sheet_id:         "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
          tab:              "1811 (НИАБ 333-9-201)",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1811 год",
          gid:              1765304438,
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", "№"],
          display_columns: ["родство", "имя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии", "листы"]
        },

        {
          sheet_id:         "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
          tab:              "1816 (НИАБ 333-9-83)",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1816 год",
          gid:              1330631543,
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", "№"],
          display_columns: ["родство", "имя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии", "листы"]
        },

        {
          sheet_id:         "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
          tab:              "1834 (НИАБ 333-9-542)",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1834 год",
          gid:              1743797303,
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", "№"],
          display_columns: ["родство", "имя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии", "листы"]
        },

        {
          sheet_id:         "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
          tab:              "1850 (НИАБ 333-9-408)",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1850 год",
          gid:              1936198662,
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", "№"],
          display_columns: ["родство", "имя", "отчество", "фамилия", "пометка", "возраст на прошлую", "изменения", "возраст сейчас", "комментарии", "листы"]
        },

        {
          sheet_id:         "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
          tab:              "1858 (НИАБ 333-9-1090)",
          label:            "Рэвізская сказка, маёнтак Вяляцічы, 1858 год",
          gid:              2074719809,
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          household_columns: ["тип", "н.п.", "№ пред.", "№"],
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
          sheet_id:         "1OE7oQm51VU4m-G4otwEOVC7j0a423T3ndKDBpHVMojY",
          tab:              "Р/Велятичи ун",
          label:            "Вяляцічы, уніацкая царква",
          gid:              572746856,
          household_column: null,
          roles: [
            { column: "#ребенка", role: "Child" }
          ],
          display_columns: [
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
          sheet_id:         "1OE7oQm51VU4m-G4otwEOVC7j0a423T3ndKDBpHVMojY",
          tab:              "Р/Велятичи пр",
          label:            "Вяляцічы, праваслаўная царква",
          gid:              0,
          household_column: null,
          roles: [
            { column: "#ребенка", role: "Child" }
          ],
          display_columns: [
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
          sheet_id:         "1OE7oQm51VU4m-G4otwEOVC7j0a423T3ndKDBpHVMojY",
          tab:              "Б/Велятичи ун",
          label:            "Вяляцічы, уніацкая царква",
          gid:              1045153146,
          household_column: null,
          roles: [
            { column: "#жениха",  role: "Groom" },
            { column: "#невесты", role: "Bride" }
          ],
          display_columns: ["_role_","год", "№", "1", "2"]    }

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
          sheet_id:         "1OE7oQm51VU4m-G4otwEOVC7j0a423T3ndKDBpHVMojY",
          tab:              "Р/Велятичи ун",
          label:            "Вяляцічы, уніацкая царква",
          gid:              572746856,
          household_column: null,
          roles: [
            { column: "#отца",   role: "Father" },
            { column: "#матери", role: "Mother" }
          ],
          display_columns: [
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
          sheet_id:         "1OE7oQm51VU4m-G4otwEOVC7j0a423T3ndKDBpHVMojY",
          tab:              "Р/Велятичи пр",
          label:            "Вяляцічы, праваслаўная царква",
          gid:              0,
          household_column: null,
          roles: [
            { column: "#отца",   role: "Father" },
            { column: "#матери", role: "Mother" }
          ],
          display_columns: [
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
          sheet_id:         "1OE7oQm51VU4m-G4otwEOVC7j0a423T3ndKDBpHVMojY",
          tab:              "Р/Велятичи ун",
          label:            "Вяляцічы, уніацкая царква",
          gid:              572746856,
          household_column: null,
          roles: [
            { column: "#крестный 1", role: "Witness 1" },
            { column: "#крестный 2", role: "Witness 2" }
          ],
          display_columns: ["год", "день рождения", "месяц рождения", "имя ребенка", "имя отца", "имя матери", "фамилия", "н. п.", "крестный 1", "крестный 2"]
        }

        // Р/Велятичи пр: add when godparent ID column names are known
      ]
    }

    // ── WITNESS AT MARRIAGES ─────────────────────────────────
    

  ] // end sections
};
