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
          sheet_id: "2PACX-1vQQOPRo28IKaerQQQzoA5lebigBZQRl8Fg8_1cEd1EgVeT5Qe2B61FftEVzq96uoVrRDaA0pVRGfKkm",
          tab:      "1811 (НИАБ 333-9-201)",
          label:    "Рэвізская сказка, маёнтак Вяляцічы, 1811 год",
          gid:      1765304438,               // replace null with e.g. "0" or "1234567890"
          household_column: "house_id",
          roles: [
            { column: "#", role: "Person" }
          ],
          display_columns: ["тип",	"н.п.",	"№", "родство", "имя", "отчество","фамилия","пометка","возраст на прошлую",	"изменения", "возраст сейчас",	"комментарии",	"листы"]
        },

        {
          sheet_id: "REPLACE_WITH_YOUR_SHEET_ID",
          tab:      "1816",
          label:    "Revision 1816",
          gid:      null,
          household_column: "nr_domu",
          roles: [
            { column: "id_osoby", role: "Person" }
          ],
          display_columns: ["nr_domu", "imie", "nazwisko", "wiek", "uwagi"]
        },

        {
          sheet_id: "REPLACE_WITH_YOUR_SHEET_ID",
          tab:      "1834",
          label:    "Revision 1834",
          gid:      null,
          household_column: "nr_domu",
          roles: [
            { column: "id_osoby", role: "Person" }
          ],
          display_columns: ["nr_domu", "imie", "nazwisko", "wiek", "uwagi"]
        },

        {
          sheet_id: "REPLACE_WITH_YOUR_SHEET_ID",
          tab:      "1850",
          label:    "Revision 1850",
          gid:      null,
          household_column: "nr_domu",
          roles: [
            { column: "id_osoby", role: "Person" }
          ],
          display_columns: ["nr_domu", "imie", "nazwisko", "wiek", "uwagi"]
        },

        {
          sheet_id: "REPLACE_WITH_YOUR_SHEET_ID",
          tab:      "1858",
          label:    "Revision 1858",
          gid:      null,
          household_column: "nr_domu",
          roles: [
            { column: "id_osoby", role: "Person" }
          ],
          display_columns: ["nr_domu", "imie", "nazwisko", "wiek", "uwagi"]
        }

      ]
    },

    // ── BIRTHS ──────────────────────────────────────────────
    {
      id:    "births",
      label: "Births (Метрики — рождение)",
      icon:  "🕯",
      sources: [

        {
          sheet_id: "REPLACE_WITH_YOUR_SHEET_ID",
          tab:      "Births_ParishA",
          label:    "Parish A — Births",
          gid:      null,
          household_column: null,
          roles: [
            { column: "id_dziecka",  role: "Child" },
            { column: "id_ojca",     role: "Father" },
            { column: "id_matki",    role: "Mother" }
          ],
          display_columns: ["rok", "data", "imie_dziecka", "ojciec", "matka", "parafia", "_role_"]
        }

        // Add more birth sources here…
      ]
    },

    // ── MARRIAGES ───────────────────────────────────────────
    {
      id:    "marriages",
      label: "Marriages (Метрики — бракосочетание)",
      icon:  "💍",
      sources: [

        {
          sheet_id: "REPLACE_WITH_YOUR_SHEET_ID",
          tab:      "Marriages_ParishA",
          label:    "Parish A — Marriages",
          gid:      null,
          household_column: null,
          roles: [
            { column: "id_pana_mlodego",   role: "Groom" },
            { column: "id_panny_mlodej",   role: "Bride" },
            { column: "id_ojca_pana",      role: "Groom's Father" },
            { column: "id_matki_pana",     role: "Groom's Mother" },
            { column: "id_ojca_panny",     role: "Bride's Father" },
            { column: "id_matki_panny",    role: "Bride's Mother" }
          ],
          display_columns: ["rok", "data", "pan_mlody", "panna_mloda", "parafia", "_role_"]
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