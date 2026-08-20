/* ============================================================
   Ledgeline Storage — facility inventory model
   ------------------------------------------------------------
   One source of truth. The plan view, the list, the filters, the
   availability counters, the drawer and the move-in calculator all
   read from here, so nothing on the page can contradict anything else.

   Geometry is authored in FEET. The plan view multiplies by FACILITY.scale.
   ============================================================ */
(function (global) {
  'use strict';

  var FACILITY = {
    scale: 3,          // px per foot in the plan view
    w: 320, h: 210,    // yard, feet
    fence: { x: 4, y: 4, w: 312, h: 202 },
    office: { x: 14, y: 170, w: 32, h: 30 },
    gate: { x: 60, y: 206, w: 26 }        // opening in the south fence
  };

  /* Rows are authored as: an origin, one unit footprint, and a count.
     axis 'h' = a drive-up row, units side by side left→right, doors on the
     `door` edge. axis 'v' = an indoor bank fronting a corridor. */
  var BUILDINGS = [
    { id: 'A', label: 'Row A', kind: 'Drive-up', axis: 'h', door: 's',
      x: 44, y: 14, uw: 10, ud: 30, count: 15, rate: 239, doorH: 9,
      feat: ['drive', 'access24', 'wide'] },

    { id: 'B', label: 'Row B', kind: 'Drive-up', axis: 'h', door: 's',
      x: 204, y: 14, uw: 10, ud: 20, count: 10, rate: 179, doorH: 8,
      feat: ['drive', 'access24', 'wide'] },

    { id: 'C', label: 'Row C', kind: 'Drive-up', axis: 'h', door: 's',
      x: 44, y: 64, uw: 10, ud: 15, count: 21, rate: 139, doorH: 8,
      feat: ['drive', 'access24'] },

    { id: 'D', label: 'Row D', kind: 'Drive-up', axis: 'h', door: 'n',
      x: 44, y: 99, uw: 10, ud: 10, count: 21, rate: 109, doorH: 8,
      feat: ['drive', 'access24'] },

    /* Building E — the climate block. Two banks either side of one corridor. */
    { id: 'E', label: 'Bldg E', kind: 'Climate', axis: 'v', door: 'e',
      x: 266, y: 64, uw: 10, ud: 10, count: 6, rate: 129, doorH: 8,
      feat: ['climate', 'power'] },

    { id: 'F', label: 'Bldg E', kind: 'Climate', axis: 'v', door: 'w',
      x: 282, y: 64, uw: 5, ud: 10, count: 8, rate: 79, doorH: 8,
      feat: ['climate'] },

    { id: 'G', label: 'Bldg E', kind: 'Climate', axis: 'v', door: 'w',
      x: 282, y: 104, uw: 5, ud: 5, count: 4, rate: 49, doorH: 8,
      feat: ['climate'] },

    { id: 'R', label: 'Canopy', kind: 'Covered RV', axis: 'h', door: 's',
      x: 128, y: 134, uw: 12, ud: 40, count: 5, rate: 189, doorH: 14,
      feat: ['covered', 'rv', 'access24', 'wide'] },

    { id: 'S', label: 'Yard', kind: 'Open RV', axis: 'h', door: 's',
      x: 188, y: 134, uw: 12, ud: 40, count: 5, rate: 129, doorH: 0,
      feat: ['rv', 'access24', 'wide'] }
  ];

  /* Building E's corridor, drawn under the two banks. */
  var CORRIDOR = { x: 276, y: 62, w: 6, h: 64 };
  var SHELL_E = { x: 264, y: 62, w: 30, h: 64 };

  var FEATURES = {
    drive:    { label: 'Drive-up door',      short: 'Drive-up' },
    climate:  { label: 'Climate controlled', short: 'Climate' },
    access24: { label: '24-hour gate access', short: '24-hr' },
    power:    { label: 'Power outlet inside', short: 'Power' },
    covered:  { label: 'Covered canopy',     short: 'Covered' },
    rv:       { label: 'RV / boat / trailer', short: 'RV' },
    wide:     { label: '40-ft turning aisle', short: 'Wide aisle' }
  };

  /* Size catalogue — the sales-facing view of the same footprints. */
  var SIZES = [
    { key: '5x5', plan: [{x:.4,y:.4,w:2,h:2,l:'BOX'},{x:.4,y:2.6,w:2,h:2,l:'BOX'},{x:2.6,y:.4,w:2,h:4.2,l:'BIKE'}],   w: 5,  d: 5,  name: "5 × 5",   nick: 'Closet',
      fits: ['Seasonal boxes', 'Bike + gear', 'Small dresser'],
      compare: 'About a hall closet.' },
    { key: '5x10', plan: [{x:.4,y:.4,w:2.2,h:4.2,l:'DRESSER'},{x:2.8,y:.4,w:4,h:2,l:'MATTRESS'},{x:2.8,y:2.6,w:4,h:2,l:'BOXES'},{x:7,y:.4,w:2.6,h:4.2,l:'TOTES'}],  w: 5,  d: 10, name: "5 × 10",  nick: 'Walk-in',
      fits: ['Studio apartment', 'Mattress set', 'Twenty file boxes'],
      compare: 'About a walk-in closet.' },
    { key: '10x10', plan: [{x:.5,y:.5,w:3,h:7,l:'COUCH'},{x:4,y:.5,w:5.5,h:4,l:'BED SET'},{x:4,y:5,w:2.5,h:4.5,l:'BOXES'},{x:7,y:5,w:2.5,h:4.5,l:'APPLIANCES'}], w: 10, d: 10, name: "10 × 10", nick: 'One bedroom',
      fits: ['One-bedroom apartment', 'Couch + bed + boxes', 'Appliance set'],
      compare: 'About half a one-car garage.' },
    { key: '10x15', plan: [{x:.5,y:.5,w:3,h:7,l:'SECTIONAL'},{x:4,y:.5,w:3,h:9,l:'DINING'},{x:7.5,y:.5,w:7,h:4,l:'BEDROOM'},{x:7.5,y:5,w:7,h:4.5,l:'BOXES'}], w: 10, d: 15, name: "10 × 15", nick: 'Two bedroom',
      fits: ['Two-bedroom home', 'Full living room set', 'Motorcycle + tools'],
      compare: 'About a one-car garage.' },
    { key: '10x20', plan: [{x:2,y:1.2,w:15,h:6.4,l:'VEHICLE'},{x:2,y:8,w:6,h:1.6,l:'BOXES'}], w: 10, d: 20, name: "10 × 20", nick: 'Three bedroom',
      fits: ['Three-bedroom home', 'Vehicle indoors', 'Job-site inventory'],
      compare: 'A full one-car garage.' },
    { key: '10x30', plan: [{x:.6,y:.6,w:9,h:8.8,l:'LIVING'},{x:10,y:.6,w:9,h:8.8,l:'BEDROOMS'},{x:19.4,y:.6,w:10,h:8.8,l:'GARAGE'}], w: 10, d: 30, name: "10 × 30", nick: 'Whole house',
      fits: ['Four+ bedroom home', 'Contractor stock', 'Two vehicles deep'],
      compare: 'A long one-car garage.' },
    { key: '12x40', plan: [{x:1.5,y:1.2,w:34,h:9.6,l:'CLASS A COACH'}], w: 12, d: 40, name: "12 × 40", nick: 'RV & boat',
      fits: ['Class A motorhome', 'Wake boat + trailer', 'Fifth wheel'],
      compare: 'A parking space built for a coach.' }
  ];

  /* ---------- deterministic occupancy ----------
     A hash, not a random number: the board looks the same on every load and
     in every browser, so a screenshot and the live page never disagree. */
  function hash(str) {
    var x = 2166136261, i;
    for (i = 0; i < str.length; i++) {
      x ^= str.charCodeAt(i);
      /* Math.imul, not `*` — a plain 32-bit multiply overflows double
         precision here and silently shreds the low bits, which clusters
         the output and skews occupancy. */
      x = Math.imul(x, 16777619) >>> 0;
    }
    /* FNV alone avalanches poorly on the last byte, so sequential unit ids
       land in the same bucket and a whole row reads as empty. Finalize. */
    x ^= x >>> 15; x = Math.imul(x, 2246822507) >>> 0;
    x ^= x >>> 13; x = Math.imul(x, 3266489909) >>> 0;
    x ^= x >>> 16;
    return (x >>> 8) / 16777216;
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function build() {
    var units = [], b, i, n, r, u, key;

    for (n = 0; n < BUILDINGS.length; n++) {
      b = BUILDINGS[n];
      for (i = 0; i < b.count; i++) {
        u = {
          id: b.id + '-' + pad(i + 1),
          bldg: b.id,
          label: b.label,
          kind: b.kind,
          w: b.uw,          // frontage, ft
          d: b.ud,          // depth, ft
          rate: b.rate,
          doorH: b.doorH,
          feat: b.feat.slice()
        };
        u.sqft = u.w * u.d;
        u.key = u.w + 'x' + u.d;

        /* plan geometry, feet */
        if (b.axis === 'h') {
          u.x = b.x + i * b.uw; u.y = b.y; u.pw = b.uw; u.ph = b.ud;
          u.doorSide = b.door;               // 'n' | 's'
        } else {
          u.x = b.x; u.y = b.y + i * b.uw; u.pw = b.ud; u.ph = b.uw;
          u.doorSide = b.door;               // 'e' | 'w'
        }

        r = hash('ledgeline/' + u.id);
        u.status = r < 0.185 ? 'open' : (r < 0.255 ? 'held' : 'full');
        units.push(u);
      }
    }

    /* Never let a size class read as dead — if the hash happened to fill one
       out completely, open its first unit. Deterministic, still honest. */
    var byKey = {};
    units.forEach(function (x) { (byKey[x.key] = byKey[x.key] || []).push(x); });
    Object.keys(byKey).forEach(function (k) {
      var list = byKey[k];
      if (!list.some(function (x) { return x.status === 'open'; })) {
        for (var j = 0; j < list.length; j++) {
          if (list[j].status === 'full') { list[j].status = 'open'; break; }
        }
      }
    });

    return units;
  }

  var UNITS = build();

  function openCount(pred) {
    return UNITS.filter(function (u) {
      return u.status === 'open' && (!pred || pred(u));
    }).length;
  }

  /* Cheapest open unit of a given footprint, for "from $" copy. */
  function fromRate(key) {
    var m = UNITS.filter(function (u) { return u.key === key; })
                 .map(function (u) { return u.rate; });
    return m.length ? Math.min.apply(null, m) : null;
  }

  global.LEDGELINE = {
    FACILITY: FACILITY,
    BUILDINGS: BUILDINGS,
    CORRIDOR: CORRIDOR,
    SHELL_E: SHELL_E,
    FEATURES: FEATURES,
    SIZES: SIZES,
    UNITS: UNITS,
    openCount: openCount,
    fromRate: fromRate
  };
})(window);
