/* ═══════════════════════════════════════════════════════════════
   EZHD — THE FACTS
   ───────────────────────────────────────────────────────────────
   Everything a person would ever want to change lives here. You
   should not need to open index.html to change an address, an
   email, or the form's delivery key.

   ES5 only, per DESIGN.md §7 — var and function, nothing newer.
   Loaded BEFORE the page script; every read in index.html falls
   back to its previous literal, so a 404 on this file degrades to
   the old behaviour rather than breaking the form.
   ═══════════════════════════════════════════════════════════════ */

var EZ_CONFIG = {

  business: {
    name:   'EZHD',
    city:   'St. George',
    state:  'Utah',
    region: 'St. George and all of Washington County'
  },

  contact: {
    email: 'ezhdco@gmail.com'
  },

  /* ── FORM DELIVERY ───────────────────────────────────────────
     Web3Forms access key. Public by design: it ships in the HTML
     and only permits submitting to this form, never reading what
     was submitted. Rotate it at web3forms.com.

     If the key is empty or still a <placeholder>, the form falls
     back to a mailto: handoff rather than failing silently.       */
  form: {
    accessKey: 'a785fe44-2b8c-4e40-8dfd-db35478bb123',
    endpoint:  'https://api.web3forms.com/submit'
  },

  /* Title-block labels (project / drawn by / checked by) live in the markup —
     a config entry nothing reads is a fact file lying about its own reach. */
};
