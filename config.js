// ============================================================
//  GENEALOGY SITE — CONFIG FILE
//  Edit this file to add/remove/modify data sources.
//  You do NOT need to touch index.html, style.css, or app.js.
// ============================================================

const GENEALOGY_CONFIG = {

  // ──────────────────────────────────────────────────────────
  // SECTIONS
  // Each section groups related sources into one display block.
  // Supported section IDs (controls icon + colour accent):
  //   revisions | births | marriages | deaths |
  //   witness_birth | witness_marriage | other
  // ──────────────────────────────────────────────────────────
  sections: [

    // ── REVISIONS ───────────────────────────────────────────
    {
      id:    "revisions",
      label: "Рэвізскіі сказкі",
      icon:  "📜",
      sources: [

        // --------------------------------------------------
        // Each source = one tab in one Google Sheet.
        // Fields:
        //   sheet_id        — the long ID from the sheet URL
        //   tab             — exact tab name (case-sensitive)
        //   label           — human label shown on the page
        //
        //   gid             — numeric tab ID for deep-linking.
        //                      Find it in the URL when the tab
        //                      is open: ...edit#gid=1234567890
        //                      Set to null to disable row links.
        //
        //   household_column — column name whose value is used
        //                      to find all household members.
        //                      When a person is matched, ALL
        //                      rows sharing the same value in
        //                      this column are displayed.
        //                      Set to null to show only the
        //                      matched row(s).
        //
        //   roles           — array of { column, role } pairs.
        //                      'column' is the column header
        //                      in the sheet that holds person
        //                      IDs. 'role' is a display label.
        //                      A person is matched if their ID
        //                      appears in ANY of these columns.
        //
        //   display_columns — ordered list of column headers
        //                      to show in the table. Use the
        //                      exact header as it appears in
        //                      row 1 of the sheet. The special
        //                      value "_role_" inserts a Role
        //                      column showing which role
        //                      matched.
        // --------------------------------------------------

        {
          sheet_id: "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
          tab:      "1811 (НИАБ 333-9-201)",
          label:    "Рэвізская сказка, маёнтак Вяляцічы, 1811 год",
          gid:      1765304438,              
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          display_columns: ["тип",	"н.п.",	"№", "родство", "имя", "отчество","фамилия","пометка","возраст на прошлую",	"изменения", "возраст сейчас",	"комментарии",	"листы"]
        },

        {
          sheet_id: "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
          tab:      "1816 (НИАБ 333-9-83)",
          label:    "Рэвізская сказка, маёнтак Вяляцічы, 1816 год",
          gid:      1330631543,
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          display_columns: ["тип",	"н.п.",	"№", "родство", "имя", "отчество","фамилия","пометка","возраст на прошлую",	"изменения", "возраст сейчас",	"комментарии",	"листы"]
        },

        {
          sheet_id: "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
          tab:      "1834 (НИАБ 333-9-542)",
          label:    "Рэвізская сказка, маёнтак Вяляцічы, 1834 год",
          gid:      1743797303,
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          display_columns: ["тип",	"н.п.",	"№", "родство", "имя", "отчество","фамилия","пометка","возраст на прошлую",	"изменения", "возраст сейчас",	"комментарии",	"листы"]
        },

        {
          sheet_id: "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
          tab:      "1850 (НИАБ 333-9-408)",
          label:    "Рэвізская сказка, маёнтак Вяляцічы, 1850 год",
          gid:      1936198662,
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          display_columns: ["тип",	"н.п.",	"№", "родство", "имя", "отчество","фамилия","пометка","возраст на прошлую",	"изменения", "возраст сейчас",	"комментарии",	"листы"]
        },

        {
          sheet_id: "1AsAQfxHkO-q-X9wKGyuuK330LcrpZi5vfnv5--6jbLM",
          tab:      "1858 (НИАБ 333-9-1090)",
          label:    "Рэвізская сказка, маёнтак Вяляцічы, 1858 год",
          gid:      2074719809,
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          display_columns: ["тип",	"н.п.",	"№ пред.", "№", "родство", "имя", "отчество","фамилия","пометка","возраст на прошлую",	"изменения", "возраст сейчас",	"комментарии",	"листы"]
        }

      ]
    },

    // ── BIRTHS ──────────────────────────────────────────────
    {
      id:    "births",
      label: "Метрычныя кнігі - нараджэнне",
      icon:  "🕯",
      sources: [

        {
          sheet_id: "1OE7oQm51VU4m-G4otwEOVC7j0a423T3ndKDBpHVMojY",
          tab:      "Р/Велятичи ун",
          label:    "Вяляцічы, уніацкая царква",
          gid:      572746856,
          household_column: null,
          roles: [
            { column: "#ребенка",  role: "Child" },
            { column: "#отца",     role: "Father" },
            { column: "#матери",    role: "Mother" }
          ],
          display_columns: ["год", "день рождения",	"месяц рождения", "день крещения", "месяц крещения",	"имя ребенка",	"имя отца", "имя матери",	"фамилия",	"н. п.", 	"крестный 1",	"крестный 2"]
        },
         {
          sheet_id: "1OE7oQm51VU4m-G4otwEOVC7j0a423T3ndKDBpHVMojY",
          tab:      "Р/Велятичи пр",
          label:    "Вяляцічы, праваслаўная царква",
          gid:      0,
          household_column: null,
          roles: [
            { column: "#ребенка",  role: "Child" },
            { column: "#отца",     role: "Father" },
            { column: "#матери",    role: "Mother" }
          ],
          display_columns: ["год", "№", "день рождения",	"месяц рождения", "день крещения", "месяц крещения",	"имя ребенка",	"имя отца", "отчество отца", "имя матери",	
                            "отчество отца", "фамилия",	"восприемник",	"восприемница"]
        }
      ]
    },

    // ── MARRIAGES ───────────────────────────────────────────
    {
      id:    "marriages",
      label: "Метрычныя кнігі - шлюбы",
      icon:  "💍",
      sources: [

        {
          sheet_id: "1OE7oQm51VU4m-G4otwEOVC7j0a423T3ndKDBpHVMojY",
          tab:      "Б/Велятичи ун",
          label:    "Вяляцічы, уніацкая царква",
          gid:      null,
          household_column: null,
          roles: [
            { column: "#жениха",   role: "Groom" },
            { column: "#невесты",   role: "Bride" },

          ],
          display_columns: ["год", "№", "dd", "mm", "parafia", "1", "2", "3", "4", "5", "6", "7", "8"]
        }

      ]
    },

    // ── DEATHS ──────────────────────────────────────────────
    {
      id:    "deaths",
      label: "Deaths (Метрики — смерть)",
      icon:  "✝",
      sources: [

        {
          sheet_id: "REPLACE_WITH_YOUR_SHEET_ID",
          tab:      "Deaths_ParishA",
          label:    "Parish A — Deaths",
          gid:      null,
          household_column: null,
          roles: [
            { column: "id_osoby",  role: "Deceased" },
            { column: "id_ojca",   role: "Father" },
            { column: "id_matki",  role: "Mother" }
          ],
          display_columns: ["rok", "data", "imie", "nazwisko", "wiek", "przyczyna", "parafia", "_role_"]
        }

      ]
    },

    // ── WITNESS AT BIRTH ────────────────────────────────────
    {
      id:    "witness_birth",
      label: "Witness at Births",
      icon:  "👁",
      sources: [

        {
          sheet_id: "REPLACE_WITH_YOUR_SHEET_ID",
          tab:      "Births_ParishA",
          label:    "Parish A — Births",
          gid:      null,
          household_column: null,
          roles: [
            { column: "id_swiadka1", role: "Witness 1" },
            { column: "id_swiadka2", role: "Witness 2" }
          ],
          display_columns: ["rok", "data", "imie_dziecka", "ojciec", "matka", "parafia", "_role_"]
        }

      ]
    },

    // ── WITNESS AT MARRIAGE ─────────────────────────────────
    {
      id:    "witness_marriage",
      label: "Witness at Marriages",
      icon:  "👁",
      sources: [

        {
          sheet_id: "REPLACE_WITH_YOUR_SHEET_ID",
          tab:      "Marriages_ParishA",
          label:    "Parish A — Marriages",
          gid:      null,
          household_column: null,
          roles: [
            { column: "id_swiadka1", role: "Witness 1" },
            { column: "id_swiadka2", role: "Witness 2" }
          ],
          display_columns: ["rok", "data", "pan_mlody", "panna_mloda", "parafia", "_role_"]
        }

      ]
    }

  ] // end sections
};
