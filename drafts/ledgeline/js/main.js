/* ============================================================
   Ledgeline Storage — behaviour
   No GSAP, no ScrollTrigger, no Lenis, no smooth-scroll library.
   Reveals are CSS clip transitions armed by IntersectionObserver;
   the two timed sequences (intro door, gate keypad) are WAAPI.
   ============================================================ */
(function () {
  'use strict';

  var L = window.LEDGELINE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SC = L.FACILITY.scale;
  var fx = function (v) { return +(v * SC).toFixed(2); };

  var money = function (n) {
    return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  var money0 = function (n) { return '$' + Math.round(n); };
  var multiRate = function (key) {
    var lo = Infinity, hi = -Infinity;
    L.UNITS.forEach(function (u) {
      if (u.key !== key) return;
      if (u.rate < lo) lo = u.rate;
      if (u.rate > hi) hi = u.rate;
    });
    return hi > lo;
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  var sizeOf = function (key) {
    for (var i = 0; i < L.SIZES.length; i++) if (L.SIZES[i].key === key) return L.SIZES[i];
    return null;
  };
  var dims = function (u) { return u.w + ' × ' + u.d; };

  /* ============================================================
     Intro — a row of doors rolls up off the page
     ============================================================ */
  var curtain = $('.curtain');
  function raise() {
    if (!curtain) return;
    if (REDUCED) { curtain.classList.add('done'); return; }
    var slats = $$('.curtain__slat', curtain), last = null;
    slats.forEach(function (s, i) {
      last = s.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-101%)' }],
        { duration: 540, delay: 60 + i * 42, easing: 'cubic-bezier(.62,0,.28,1)', fill: 'forwards' }
      );
    });
    if (last) last.finished.then(function () { curtain.classList.add('done'); })
                          .catch(function () { curtain.classList.add('done'); });
  }

  /* ============================================================
     Reveals — one shared clip observer
     ============================================================ */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-open');
      revealIO.unobserve(e.target);
    });
    /* threshold 0: a closed block only exposes its 3px door rail, so any
       ratio-based threshold would never be reached. */
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });

  function armReveals(root) {
    var vh = window.innerHeight || 800;
    $$('.r', root || document).forEach(function (el) {
      if (el.classList.contains('is-open')) return;
      /* Anything already on screen opens synchronously. IntersectionObserver
         delivers nothing while the page is unrendered (a background tab, a
         print/screenshot pass), which would otherwise leave the whole page
         clipped shut behind a reveal that never fires. */
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) el.classList.add('is-open');
      else revealIO.observe(el);
    });
  }

  /* ============================================================
     Live gate clock — the rail and the hero chip read the same source
     ============================================================ */
  var GATE_OPEN = 6, GATE_SHUT = 22;
  function gateNow() {
    var h = new Date().getHours();
    return h >= GATE_OPEN && h < GATE_SHUT;
  }
  function paintGate() {
    var on = gateNow();
    [$('#railLed'), $('#gateLed')].forEach(function (el) {
      if (el) el.classList.toggle('on', on);
    });
    var rs = $('#railState'); if (rs) rs.textContent = on ? 'Gate open' : 'Gate closed';
    var gc = $('#gateChip');
    if (gc) gc.textContent = on ? 'Gate open until 10p' : 'Gate closed, opens 6a';
  }

  /* ============================================================
     Counters — a mechanical tick, never an eased fade
     ============================================================ */
  function tick(el, to, opts) {
    opts = opts || {};
    var pre = opts.pre || '', post = opts.post || '', dp = opts.dp || 0, dur = opts.dur || 620;
    if (REDUCED) { el.textContent = pre + to.toFixed(dp) + post; return; }
    var from = 0, t0 = null, done = false;
    function finish() {
      if (done) return;
      done = true;
      el.textContent = pre + to.toFixed(dp) + post;
    }
    function step(t) {
      if (done) return;
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var q = Math.round((from + (to - from) * (1 - Math.pow(1 - p, 3))) * Math.pow(10, dp)) / Math.pow(10, dp);
      el.textContent = pre + q.toFixed(dp) + post;
      if (p < 1) requestAnimationFrame(step); else finish();
    }
    requestAnimationFrame(step);
    /* rAF is paused in a background tab, so a counter started there freezes
       part way and shows a number that is simply wrong — and these are the
       headline figures. A wall clock does not pause: land the true value. */
    window.setTimeout(finish, dur + 140);
  }

  /* ============================================================
     Hero board strip
     ============================================================ */
  function buildStrip() {
    var host = $('#stripRows'); if (!host) return;
    var html = '';
    L.SIZES.forEach(function (s) {
      var open = L.openCount(function (u) { return u.key === s.key; });
      var rate = L.fromRate(s.key);
      if (rate === null) return;
      /* a size class can span two rates (drive-up vs climate, covered vs
         open RV) — say "from" instead of letting a bigger unit look mispriced */
      html += '<button class="brow" type="button" data-size="' + s.key + '">' +
        '<span class="brow__n">' + s.name + '<small>' + esc(s.nick) + '</small></span>' +
        '<span class="brow__a ' + (open ? '' : 'none') + '">' +
          (open ? open + ' open' : 'waitlist') + '</span>' +
        '<span class="brow__p">' + (multiRate(s.key) ? '<em>from</em> ' : '') +
          money0(rate) + '<small>/mo</small></span>' +
      '</button>';
    });
    host.innerHTML = html;

    var stamp = $('#stripStamp');
    if (stamp) {
      var d = new Date();
      stamp.innerHTML = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
        ' · <b>' + L.openCount() + '</b> open';
    }

    var note = $('#heroNote');
    if (note) note.textContent = L.UNITS.length + ' units · ' + L.SIZES.length +
      ' sizes · drive-up, climate & covered RV';

    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-size]'); if (!b) return;
      setSizeFilter(b.getAttribute('data-size'));
      document.getElementById('units').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }

  function paintOpenChip() {
    var chip = $('#openChip'), rail = $('#railOpen'), n = L.openCount();
    if (chip) {
      chip.innerHTML = '<span class="num" id="openN">0</span>&nbsp;units open right now';
      tick($('#openN', chip), n);
    }
    if (rail) tick(rail, n);
  }

  /* ============================================================
     01 — THE BOARD
     ============================================================ */
  var state = {
    sizes: [],            // empty = all
    feats: [],
    maxRate: 239,
    openOnly: false,
    view: 'map',
    sel: null
  };

  function matches(u) {
    if (state.openOnly && u.status !== 'open') return false;
    if (state.sizes.length && state.sizes.indexOf(u.key) < 0) return false;
    if (u.rate > state.maxRate) return false;
    for (var i = 0; i < state.feats.length; i++) {
      if (u.feat.indexOf(state.feats[i]) < 0) return false;
    }
    return true;
  }

  /* ---------- the plan view ---------- */
  function drawPlan() {
    var F = L.FACILITY, W = fx(F.w), H = fx(F.h), s = '';
    s += '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Scale plan of the Ledgeline yard. An accessible list of the same units is available from the List view.">';

    /* perimeter + surface */
    s += '<rect x="' + fx(F.fence.x) + '" y="' + fx(F.fence.y) + '" width="' + fx(F.fence.w) +
         '" height="' + fx(F.fence.h) + '" class="shell" />';

    /* drive aisles, called out the way a plan does — all in feet via fx() */
    [54, 89, 121].forEach(function (yft) {
      s += '<line class="aisle" x1="' + fx(40) + '" y1="' + fx(yft) +
           '" x2="' + fx(302) + '" y2="' + fx(yft) + '"/>';
    });
    s += '<text class="plan-note" x="' + fx(44) + '" y="' + fx(52) + '">DRIVE AISLE · 40 FT</text>';
    s += '<text class="plan-note" x="' + fx(52) + '" y="' + fx(156) + '">TURNAROUND</text>';

    /* building E shell + corridor */
    s += '<rect class="shell-fill" x="' + fx(L.SHELL_E.x) + '" y="' + fx(L.SHELL_E.y) +
         '" width="' + fx(L.SHELL_E.w) + '" height="' + fx(L.SHELL_E.h) + '"/>';
    s += '<rect class="shell" x="' + fx(L.SHELL_E.x) + '" y="' + fx(L.SHELL_E.y) +
         '" width="' + fx(L.SHELL_E.w) + '" height="' + fx(L.SHELL_E.h) + '"/>';
    s += '<rect x="' + fx(L.CORRIDOR.x) + '" y="' + fx(L.CORRIDOR.y) + '" width="' + fx(L.CORRIDOR.w) +
         '" height="' + fx(L.CORRIDOR.h) + '" fill="#2B3236"/>';

    /* office + gate */
    var o = F.office;
    s += '<rect class="shell-fill" x="' + fx(o.x) + '" y="' + fx(o.y) + '" width="' + fx(o.w) + '" height="' + fx(o.h) + '"/>';
    s += '<rect class="shell" x="' + fx(o.x) + '" y="' + fx(o.y) + '" width="' + fx(o.w) + '" height="' + fx(o.h) + '"/>';
    s += '<text class="blabel" x="' + fx(o.x + 4) + '" y="' + fx(o.y + 17) + '">OFFICE</text>';

    s += '<line x1="' + fx(F.gate.x) + '" y1="' + fx(206) + '" x2="' + fx(F.gate.x + F.gate.w) +
         '" y2="' + fx(206) + '" stroke="#E0512A" stroke-width="2.6"/>';
    s += '<text class="plan-note" x="' + fx(F.gate.x) + '" y="' + fx(203) + '" fill="#E0512A">GATE IN</text>';
    s += '<path d="M' + fx(F.gate.x + 12) + ' ' + fx(204) + 'l0 -8 m-3 3 l3 -3 l3 3" stroke="#E0512A" stroke-width="1.2" fill="none"/>';

    /* north arrow */
    s += '<g transform="translate(' + fx(300) + ',' + fx(186) + ')">' +
         '<path d="M0 12 L0 -6 M-4 -1 L0 -6 L4 -1" stroke="#6E787E" stroke-width="1.2" fill="none"/>' +
         '<text class="plan-note" x="-3" y="21">N</text></g>';

    /* row labels */
    L.BUILDINGS.forEach(function (b) {
      if (b.id === 'F' || b.id === 'G') return;
      var lx, ly;
      if (b.axis === 'h') { lx = fx(b.x); ly = fx(b.y) - 5; }
      else { lx = fx(L.SHELL_E.x); ly = fx(L.SHELL_E.y) - 5; }
      s += '<text class="blabel" x="' + lx + '" y="' + ly + '">' + b.label + ' · ' + b.kind.toUpperCase() + '</text>';
    });

    /* units */
    L.UNITS.forEach(function (u) {
      var x = fx(u.x), y = fx(u.y), w = fx(u.pw), h = fx(u.ph), dt = 3.4, d;
      if (u.doorSide === 's') d = { x: x, y: y + h - dt, w: w, h: dt };
      else if (u.doorSide === 'n') d = { x: x, y: y, w: w, h: dt };
      else if (u.doorSide === 'e') d = { x: x + w - dt, y: y, w: dt, h: h };
      else d = { x: x, y: y, w: dt, h: h };

      var st = u.status === 'open' ? 'Open' : (u.status === 'held' ? 'On hold' : 'Rented');
      s += '<g class="u" data-id="' + u.id + '" data-s="' + u.status + '"' +
           (u.status === 'open' ? ' tabindex="0" role="button"' : ' aria-hidden="true"') +
           '><title>' + u.id + ' · ' + dims(u) + ' · ' + st + ' · ' + money0(u.rate) + '/mo</title>' +
           '<rect class="cell" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>' +
           '<rect class="door" x="' + d.x + '" y="' + d.y + '" width="' + d.w + '" height="' + d.h + '"/>' +
           '</g>';
    });

    /* crosshair, drawn last so it sits over the units */
    s += '<line class="xhair" id="xh" x1="0" y1="0" x2="' + W + '" y2="0"/>';
    s += '<line class="xhair" id="xv" x1="0" y1="0" x2="0" y2="' + H + '"/>';
    s += '</svg>';

    $('#planSvg').innerHTML = s;
  }

  /* ---------- the list view ---------- */
  function drawList(list) {
    var body = $('#listBody');
    if (!list.length) {
      body.innerHTML = '<tr><td colspan="7"><p class="empty">No units match that filter</p></td></tr>';
      return;
    }
    body.innerHTML = list.map(function (u) {
      var st = u.status === 'open' ? 'Open' : (u.status === 'held' ? 'Held' : 'Rented');
      return '<tr><td class="num">' + u.id + '</td>' +
        '<td class="nw">' + dims(u) + '</td>' +
        '<td class="num hide-m">' + u.sqft + '</td>' +
        '<td class="hide-m">' + esc(u.kind) + '</td>' +
        '<td class="num">' + money0(u.rate) + '</td>' +
        '<td><span class="tagd ' + u.status + '">' + st + '</span></td>' +
        '<td style="text-align:right"><button class="btn btn--ghost btn--sm" type="button" data-open="' + u.id + '">' +
          (u.status === 'open' ? 'Details' : 'Waitlist') + '</button></td></tr>';
    }).join('');
  }

  function apply() {
    var list = L.UNITS.filter(matches);
    var ids = {}; list.forEach(function (u) { ids[u.id] = 1; });

    $$('#planSvg .u').forEach(function (g) {
      g.classList.toggle('dim', !ids[g.getAttribute('data-id')]);
    });

    drawList(list);

    var open = list.filter(function (u) { return u.status === 'open'; }).length;
    var c = $('#planCount');
    if (c) {
      c.textContent = state.sizes.length || state.feats.length || state.openOnly || state.maxRate < 239
        ? open + ' open of ' + list.length + ' matching · ' + L.UNITS.length + ' units in the yard'
        : L.openCount() + ' of ' + L.UNITS.length + ' units open right now';
    }

    /* grey out size chips whose whole class is filtered out by the others */
    $$('#fSizes .fchip').forEach(function (chip) {
      var k = chip.getAttribute('data-size');
      var any = L.UNITS.some(function (u) {
        if (u.key !== k) return false;
        var save = state.sizes; state.sizes = [];
        var ok = matches(u); state.sizes = save;
        return ok;
      });
      chip.setAttribute('data-empty', any ? '0' : '1');
    });
  }

  function setSizeFilter(key) {
    state.sizes = [key];
    $$('#fSizes .fchip').forEach(function (c) {
      c.setAttribute('aria-pressed', String(c.getAttribute('data-size') === key));
    });
    apply();
  }

  function buildFilters() {
    var sizes = $('#fSizes');
    sizes.innerHTML = L.SIZES.filter(function (s) { return L.fromRate(s.key) !== null; })
      .map(function (s) {
        return '<button class="fchip" type="button" data-size="' + s.key + '" aria-pressed="false">' +
               s.name + '</button>';
      }).join('');
    sizes.addEventListener('click', function (e) {
      var b = e.target.closest('.fchip'); if (!b) return;
      var k = b.getAttribute('data-size'), i = state.sizes.indexOf(k);
      if (i < 0) state.sizes.push(k); else state.sizes.splice(i, 1);
      b.setAttribute('aria-pressed', String(i < 0));
      apply();
    });

    var feats = $('#fFeats');
    feats.innerHTML = Object.keys(L.FEATURES).map(function (k) {
      return '<button class="fswitch" type="button" data-feat="' + k + '" aria-pressed="false">' +
             '<span class="fswitch__box" aria-hidden="true"></span><span>' +
             esc(L.FEATURES[k].label) + '</span></button>';
    }).join('');
    feats.addEventListener('click', function (e) {
      var b = e.target.closest('.fswitch'); if (!b) return;
      var k = b.getAttribute('data-feat'), i = state.feats.indexOf(k);
      if (i < 0) state.feats.push(k); else state.feats.splice(i, 1);
      b.setAttribute('aria-pressed', String(i < 0));
      apply();
    });

    var price = $('#fPrice');
    price.addEventListener('input', function () {
      state.maxRate = +price.value;
      $('#fPriceVal').textContent = '$' + price.value + (price.value >= 239 ? ' max' : ' or less');
      apply();
    });

    var openOnly = $('#fOpen');
    openOnly.setAttribute('aria-pressed', 'false');
    openOnly.addEventListener('click', function () {
      state.openOnly = !state.openOnly;
      openOnly.setAttribute('aria-pressed', String(state.openOnly));
      apply();
    });

    $('#fReset').addEventListener('click', function () {
      state.sizes = []; state.feats = []; state.maxRate = 239; state.openOnly = false;
      $$('#fSizes .fchip, #fFeats .fswitch').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      openOnly.setAttribute('aria-pressed', 'false');
      price.value = 239; $('#fPriceVal').textContent = '$239 max';
      apply();
    });

    $('#filters').addEventListener('submit', function (e) { e.preventDefault(); });
  }

  /* ---------- hover readout + crosshair ---------- */
  function wirePlan() {
    var wrap = $('#planwrap'), out = $('#readout');

    function show(g) {
      var u = unitById(g.getAttribute('data-id')); if (!u) return;
      var st = u.status === 'open' ? 'Open' : (u.status === 'held' ? 'On hold' : 'Rented');
      out.innerHTML = '<b>' + u.id + '</b> · ' + dims(u) + ' · ' + money0(u.rate) + '/mo' +
                      '<i>' + esc(u.kind) + ' · ' + st + '</i>';
      var r = g.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      out.style.left = (r.left - w.left + r.width / 2) + 'px';
      out.style.top = (r.top - w.top) + 'px';
      out.classList.add('on');
      wrap.classList.add('hot');

      var cx = fx(u.x + u.pw / 2), cy = fx(u.y + u.ph / 2);
      var xh = $('#xh'), xv = $('#xv');
      if (xh) { xh.setAttribute('y1', cy); xh.setAttribute('y2', cy); }
      if (xv) { xv.setAttribute('x1', cx); xv.setAttribute('x2', cx); }
    }
    function hide() { out.classList.remove('on'); wrap.classList.remove('hot'); }

    wrap.addEventListener('mouseover', function (e) {
      var g = e.target.closest('.u'); if (g && !g.classList.contains('dim')) show(g);
    });
    wrap.addEventListener('mouseleave', hide);
    wrap.addEventListener('focusin', function (e) {
      var g = e.target.closest('.u'); if (g) show(g);
    });
    wrap.addEventListener('focusout', hide);

    wrap.addEventListener('click', function (e) {
      var g = e.target.closest('.u'); if (!g || g.classList.contains('dim')) return;
      openDrawer(g.getAttribute('data-id'));
    });
    wrap.addEventListener('keydown', function (e) {
      var g = e.target.closest('.u'); if (!g) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(g.getAttribute('data-id')); }
    });

    $('#listBody').addEventListener('click', function (e) {
      var b = e.target.closest('[data-open]'); if (!b) return;
      openDrawer(b.getAttribute('data-open'));
    });

    var vm = $('#vMap'), vl = $('#vList');
    function view(v) {
      state.view = v;
      vm.setAttribute('aria-pressed', String(v === 'map'));
      vl.setAttribute('aria-pressed', String(v === 'list'));
      $('#planwrap').hidden = v !== 'map';
      $('#listwrap').hidden = v !== 'list';
    }
    vm.addEventListener('click', function () { view('map'); });
    vl.addEventListener('click', function () { view('list'); });

    /* a phone can't hover a 12-px door — start those on the list */
    if (window.matchMedia('(max-width: 700px)').matches) view('list');
  }

  function unitById(id) {
    for (var i = 0; i < L.UNITS.length; i++) if (L.UNITS[i].id === id) return L.UNITS[i];
    return null;
  }

  /* ============================================================
     Scale drawings — one function, used by the size grid and the drawer
     ============================================================ */
  function sizeArt(size, opts) {
    opts = opts || {};
    /* asymmetric padding — the right margin has to carry the width dimension
       text, the top the depth text, or they render outside the viewBox */
    var VW = 160, VH = 100, pL = 14, pR = 26, pT = 16, pB = 8;
    var k = Math.min((VW - pL - pR) / size.d, (VH - pT - pB) / size.w);
    var w = size.d * k, h = size.w * k;
    var ox = pL + ((VW - pL - pR) - w) / 2;
    var oy = pT + ((VH - pT - pB) - h) / 2;
    var X = function (ft) { return +(ox + ft * k).toFixed(2); };
    var Y = function (ft) { return +(oy + ft * k).toFixed(2); };
    var len = Math.round(2 * (w + h));

    var s = '<svg viewBox="0 0 ' + VW + ' ' + VH + '" role="img" aria-label="Plan view of a ' +
            size.name + ' foot unit drawn to scale, door on the left.">';

    /* contents first, so the outline draws over them */
    (size.plan || []).forEach(function (b, i) {
      var bx = X(b.x), by = Y(b.y), bw = b.w * k, bh = b.h * k;
      s += '<rect class="dr-fill" x="' + bx + '" y="' + by + '" width="' + bw.toFixed(2) + '" height="' + bh.toFixed(2) + '"/>';
      s += '<rect class="dr-thin" x="' + bx + '" y="' + by + '" width="' + bw.toFixed(2) + '" height="' + bh.toFixed(2) + '"/>';
      /* 5px mono glyphs run ~3.1px wide; skip the label rather than let it
         bleed across the neighbouring block */
      if (bw > b.l.length * 3.1 + 6 && bh > 8) {
        s += '<text class="dtxt" fill="#69737C" x="' + (bx + 3) + '" y="' + (by + 7.5) + '">' + esc(b.l) + '</text>';
      }
    });

    /* the unit itself — this is the stroke that draws in */
    s += '<rect class="dr ink" style="--len:' + len + ';--d:' + (opts.delay || 0) + 'ms" x="' + ox.toFixed(2) +
         '" y="' + oy.toFixed(2) + '" width="' + w.toFixed(2) + '" height="' + h.toFixed(2) + '"/>';

    /* roll-up door on the left edge, shown part way open */
    s += '<line class="dr-sig" x1="' + ox.toFixed(2) + '" y1="' + (oy + 2).toFixed(2) +
         '" x2="' + ox.toFixed(2) + '" y2="' + (oy + h - 2).toFixed(2) + '"/>';
    s += '<path class="dr-dim" d="M' + (ox - 6).toFixed(2) + ' ' + (oy + h / 2).toFixed(2) +
         'h5 m-2 -2 l2 2 l-2 2"/>';

    /* dimension lines, the way a spec sheet marks them */
    s += '<path class="dr-dim" d="M' + ox.toFixed(2) + ' ' + (oy - 6).toFixed(2) + 'h' + w.toFixed(2) +
         'M' + ox.toFixed(2) + ' ' + (oy - 8.5).toFixed(2) + 'v5 M' + (ox + w).toFixed(2) + ' ' + (oy - 8.5).toFixed(2) + 'v5"/>';
    s += '<text class="dtxt" x="' + (ox + w / 2).toFixed(2) + '" y="' + (oy - 9).toFixed(2) +
         '" text-anchor="middle">' + size.d + "'</text>";
    s += '<path class="dr-dim" d="M' + (ox + w + 6).toFixed(2) + ' ' + oy.toFixed(2) + 'v' + h.toFixed(2) +
         'M' + (ox + w + 3.5).toFixed(2) + ' ' + oy.toFixed(2) + 'h5 M' + (ox + w + 3.5).toFixed(2) + ' ' + (oy + h).toFixed(2) + 'h5"/>';
    s += '<text class="dtxt" x="' + (ox + w + 9).toFixed(2) + '" y="' + (oy + h / 2 + 2).toFixed(2) + '">' + size.w + "'</text>";

    s += '</svg>';
    return s;
  }

  /* ============================================================
     02 — size grid
     ============================================================ */
  function buildSizes() {
    var host = $('#sizeGrid'); if (!host) return;
    host.innerHTML = L.SIZES.map(function (s, i) {
      var rate = L.fromRate(s.key);
      if (rate === null) return '';
      var open = L.openCount(function (u) { return u.key === s.key; });
      return '<article class="size r" style="--d:' + (i % 3) * 70 + 'ms">' +
        '<div class="size__hd">' +
          '<h3 class="size__n">' + s.name + '<small>' + esc(s.nick) + '</small></h3>' +
          '<p class="size__p">' + (multiRate(s.key) ? '<em>from</em> ' : '') + money0(rate) +
            '<small>per month</small></p>' +
        '</div>' +
        '<div class="size__art">' + sizeArt(s, { delay: 120 }) + '</div>' +
        '<p class="dim" style="font-size:.86rem">' + esc(s.compare) + '</p>' +
        '<ul class="size__fits">' + s.fits.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
        '<div class="size__ft">' +
          '<span class="size__av ' + (open ? '' : 'none') + '">' +
            (open ? open + ' open now' : 'Waitlist only') + '</span>' +
          '<button class="btn btn--ghost btn--sm" type="button" data-size="' + s.key + '">See on the board</button>' +
        '</div>' +
      '</article>';
    }).join('');

    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-size]'); if (!b) return;
      setSizeFilter(b.getAttribute('data-size'));
      document.getElementById('units').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }

  /* ============================================================
     Unit drawer
     ============================================================ */
  var drawer = $('#drawer'), scrim = $('#scrim'), lastFocus = null;

  function moveInFor(u, prot) {
    var d = new Date(), dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    var left = dim - d.getDate() + 1;
    return (u.rate + (prot || 0)) * left / dim;
  }

  function openDrawer(id) {
    var u = unitById(id); if (!u) return;
    var size = sizeOf(u.key);
    state.sel = id;
    $$('#planSvg .u').forEach(function (g) { g.classList.toggle('sel', g.getAttribute('data-id') === id); });

    var st = u.status === 'open' ? 'Open' : (u.status === 'held' ? 'On hold' : 'Rented');
    $('#drawerId').textContent = u.id;
    $('#drawerSub').textContent = u.kind + ' · ' + u.label + ' · ' + st;

    var body = '';
    if (size) body += '<div class="elev">' + sizeArt(size) + '</div>';

    body += '<div class="price-big"><b>' + money0(u.rate) + '</b><span>per month</span></div>';

    body += '<table class="spec"><tbody>' +
      '<tr><th scope="row">Footprint</th><td>' + dims(u) + " ft</td></tr>" +
      '<tr><th scope="row">Floor area</th><td>' + u.sqft + ' ft²</td></tr>' +
      (u.doorH ? '<tr><th scope="row">Door height</th><td>' + u.doorH + " ft</td></tr>" : '') +
      '<tr><th scope="row">Building</th><td>' + esc(u.label) + '</td></tr>' +
      '<tr><th scope="row">Move in today</th><td>' + money(moveInFor(u, 0)) + '</td></tr>' +
      '</tbody></table>';

    body += '<div class="feats">' + u.feat.map(function (f) {
      return '<span class="feat">' + esc(L.FEATURES[f] ? L.FEATURES[f].short : f) + '</span>';
    }).join('') + '</div>';

    if (size) {
      body += '<div><p class="mono" style="color:var(--steel);margin-bottom:8px">Typically holds</p>' +
        '<ul class="size__fits" style="color:#C9CFCB">' +
        size.fits.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div>';
    }

    $('#drawerBody').innerHTML = body;

    $('#drawerFt').innerHTML = u.status === 'open'
      ? '<button class="btn btn--sig" type="button" data-reserve="' + u.id + '">Hold ' + u.id + ' for 48 hours</button>' +
        '<p class="mono" style="color:var(--steel);text-align:center">No card needed to reserve</p>'
      : '<button class="btn btn--ghost" type="button" data-reserve="' + u.id + '" style="--fg:#E7E9E6;border-color:#3A4247">Join the waitlist for ' + u.id + '</button>' +
        '<p class="mono" style="color:var(--steel);text-align:center">We’ll call the moment it opens</p>';

    lastFocus = document.activeElement;
    drawer.hidden = false; scrim.hidden = false;
    void drawer.offsetWidth;
    drawer.classList.add('on'); scrim.classList.add('on');
    document.body.classList.add('is-locked');
    $('#drawerX').focus();
  }

  function closeDrawer() {
    drawer.classList.remove('on'); scrim.classList.remove('on');
    document.body.classList.remove('is-locked');
    $$('#planSvg .u').forEach(function (g) { g.classList.remove('sel'); });
    window.setTimeout(function () {
      if (!drawer.classList.contains('on')) { drawer.hidden = true; scrim.hidden = true; }
    }, 420);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function wireDrawer() {
    $('#drawerX').addEventListener('click', closeDrawer);
    scrim.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('on')) closeDrawer();
      if (e.key !== 'Tab' || !drawer.classList.contains('on')) return;
      var f = $$('button, [href], select, input, textarea', drawer)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    drawer.addEventListener('click', function (e) {
      var b = e.target.closest('[data-reserve]'); if (!b) return;
      var id = b.getAttribute('data-reserve');
      closeDrawer();
      var sel = $('#rUnit');
      if (sel) sel.value = id;
      document.getElementById('reserve').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
      window.setTimeout(function () { var n = $('#rName'); if (n) n.focus(); }, REDUCED ? 0 : 620);
    });
  }

  /* ============================================================
     03 — move-in math
     ============================================================ */
  var PROT = [
    { v: 0, l: 'None', s: 'My own policy covers it', p: 0 },
    { v: 2000, l: '$2,000 of cover', s: 'Boxes, tools, patio furniture', p: 11 },
    { v: 5000, l: '$5,000 of cover', s: 'A full household', p: 18 },
    { v: 10000, l: '$10,000 of cover', s: 'Vehicles, instruments, inventory', p: 26 }
  ];

  function unitOptions() {
    var open = L.UNITS.filter(function (u) { return u.status === 'open'; })
      .sort(function (a, b) { return a.sqft - b.sqft || a.id.localeCompare(b.id); });
    return open.map(function (u) {
      return '<option value="' + u.id + '">' + u.id + ' · ' + dims(u) + ' · ' +
             esc(u.kind) + ' · ' + money0(u.rate) + '/mo</option>';
    }).join('');
  }

  function buildCalc() {
    var sel = $('#cUnit'); if (!sel) return;
    sel.innerHTML = unitOptions();

    var rsel = $('#rUnit');
    if (rsel) rsel.innerHTML = '<option value="">Not sure yet — help me pick</option>' + unitOptions();

    var d = new Date(), iso = function (x) {
      return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
    };
    var date = $('#cDate');
    date.value = iso(d); date.min = iso(d);

    $('#cProt').innerHTML = PROT.map(function (p, i) {
      return '<label class="opt"><input type="radio" name="prot" value="' + p.p + '"' + (i === 1 ? ' checked' : '') + '>' +
        '<span class="opt__dot" aria-hidden="true"></span>' +
        '<span class="opt__l">' + p.l + '<small>' + esc(p.s) + '</small></span>' +
        '<span class="opt__p">' + (p.p ? '$' + p.p : '$0') + '</span></label>';
    }).join('');

    $('#cUnit').addEventListener('change', recalc);
    $('#cDate').addEventListener('change', recalc);
    $('.calc__in').addEventListener('change', function (e) {
      if (e.target.name === 'prot' || e.target.name === 'lock') recalc();
    });
    recalc();
  }

  function recalc() {
    var u = unitById($('#cUnit').value); if (!u) return;
    var parts = ($('#cDate').value || '').split('-');
    /* split by hand — new Date('2026-08-20') is parsed as UTC and slips a day west of Greenwich */
    var y = +parts[0], m = +parts[1] - 1, day = +parts[2];
    if (!y || isNaN(m) || !day) { var t = new Date(); y = t.getFullYear(); m = t.getMonth(); day = t.getDate(); }

    var dim = new Date(y, m + 1, 0).getDate();
    var left = Math.max(1, dim - day + 1);
    var prot = +(document.querySelector('input[name="prot"]:checked') || { value: 0 }).value;
    var lock = +(document.querySelector('input[name="lock"]:checked') || { value: 0 }).value;

    var rent = u.rate * left / dim;
    var cover = prot * left / dim;
    var total = rent + cover + lock;

    var mName = new Date(y, m, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    var mEnd = new Date(y, m, dim).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    var rows = [
      { l: 'Rent, prorated', s: mName + ' → ' + mEnd + ' · ' + left + ' of ' + dim + ' days', v: rent },
      { l: 'Protection plan', s: prot ? money0(prot) + '/mo, prorated' : 'Declined', v: cover },
      { l: 'Disc lock', s: lock ? 'Yours to keep' : 'Bringing my own', v: lock },
      { l: 'Administration fee', s: 'We don’t charge one', v: 0, zero: true }
    ];

    $('#cBill').innerHTML = rows.map(function (r) {
      return '<div class="bill__row' + (r.zero ? ' zero' : '') + '"><span>' + r.l +
        '<small>' + esc(r.s) + '</small></span><b>' + money(r.v) + '</b></div>';
    }).join('');

    tick($('#cTotal'), total, { pre: '$', dp: 2, dur: 420 });
    $('#cThen').textContent = 'Then ' + money(u.rate + prot) + ' on the 1st, month to month.';
  }

  /* ============================================================
     04 — access specs + the gate
     ============================================================ */
  var SPECS = [
    ['01', 'Gate hours', 'Seven days, including holidays.', '6:00a – 10:00p'],
    ['02', '24-hour access', 'Add it to any unit in Rows A or B and your code stops caring what time it is.', '+$10/mo'],
    ['03', 'Cameras', 'Every aisle, both gates, the office door. Footage held thirty days.', '34 cameras'],
    ['04', 'Lighting', 'LED on dusk-to-dawn sensors, aisle by aisle. Nothing on this lot is dark.', 'Dusk – dawn'],
    ['05', 'Perimeter', 'Six-foot wrought iron the whole way round. One way in, one way out.', '1 gate'],
    ['06', 'Your code', 'Unique to you, not shared with the facility. Every open is logged against it.', 'Per tenant'],
    ['07', 'Aisles', 'Wide enough to turn a 26-foot truck without a spotter.', '40 ft'],
    ['08', 'Surface', 'Asphalt throughout, graded to drain. No gravel, no ruts after a monsoon.', 'Paved']
  ];

  function buildSpecs() {
    var host = $('#specs'); if (!host) return;
    host.innerHTML = SPECS.map(function (s) {
      return '<div class="spec-row"><span class="spec-row__k">' + s[0] + '</span>' +
        '<span class="spec-row__t">' + esc(s[1]) + '<small>' + esc(s[2]) + '</small></span>' +
        '<span class="spec-row__v">' + esc(s[3]) + '</span></div>';
    }).join('');
  }

  var CODE = ['4', '9', '2', '7', '#'];
  var gateBusy = false;
  function runGate() {
    var gate = $('#gate'), disp = $('#gateDisp'), state$ = $('#gateState');
    if (!gate || gateBusy) return;
    gateBusy = true;
    gate.classList.remove('open');
    disp.classList.remove('err');
    disp.textContent = '— — — —';
    state$.textContent = 'Standby';

    var keys = $$('#keypad .key');
    var byChar = {};
    keys.forEach(function (k) { byChar[k.textContent] = k; });

    if (REDUCED) {
      disp.textContent = 'ACCEPTED';
      gate.classList.add('open');
      state$.textContent = 'Gate open';
      gateBusy = false;
      return;
    }

    var shown = '';
    CODE.forEach(function (ch, i) {
      window.setTimeout(function () {
        var k = byChar[ch];
        if (k) { k.classList.add('lit'); window.setTimeout(function () { k.classList.remove('lit'); }, 150); }
        if (ch !== '#') { shown += '• '; disp.textContent = shown.trim(); }
      }, 260 + i * 300);
    });

    window.setTimeout(function () {
      disp.textContent = 'ACCEPTED';
      state$.textContent = 'Opening';
      $('#gate').classList.add('open');
      window.setTimeout(function () { state$.textContent = 'Gate open'; gateBusy = false; }, 850);
    }, 260 + CODE.length * 300);
  }

  /* ============================================================
     05 — schematic map
     ============================================================ */
  function buildMap() {
    var host = $('#mapBox'); if (!host) return;
    host.innerHTML =
      '<svg viewBox="0 0 400 250" role="img" aria-label="Schematic map. Ledgeline sits off the Washington Parkway exit of Interstate 15, between St. George and Hurricane.">' +
      '<path class="mroad" d="M24 232 C 120 196, 190 150, 264 96 S 344 44, 376 30"/>' +
      '<path class="mroad-i" d="M206 118 C 250 140, 282 154, 322 150"/>' +
      '<path class="mroad-i" d="M322 150 C 344 140, 352 122, 356 104"/>' +

      '<g class="mtown">' +
      '<circle cx="96" cy="196" r="3.6"/><circle cx="168" cy="150" r="3.6"/>' +
      '<circle cx="322" cy="150" r="3.6"/><circle cx="356" cy="104" r="3.6"/>' +
      '<circle cx="52" cy="180" r="3"/><circle cx="34" cy="160" r="3"/>' +
      '</g>' +

      '<text class="mtxt" x="104" y="199">St. George</text>' +
      '<text class="mtxt" x="176" y="153">Washington</text>' +
      '<text class="mtxt" x="300" y="166">Hurricane</text>' +
      '<text class="mtxt" x="330" y="98">La Verkin</text>' +
      '<text class="mtxt-d" x="60" y="183">Santa Clara</text>' +
      '<text class="mtxt-d" x="6" y="153">Ivins</text>' +
      '<text class="mtxt-d" x="40" y="226" transform="rotate(-22 40 226)">I-15</text>' +
      '<text class="mtxt-d" x="244" y="146">SR-9</text>' +
      '<text class="mtxt-d" x="394" y="84" text-anchor="end">→ Zion, 38 min</text>' +

      /* the pin */
      '<g transform="translate(206,118)">' +
      '<path d="M0 0 v-15" stroke="#E0512A" stroke-width="1.6"/>' +
      '<rect x="-24" y="-30" width="48" height="15" fill="#E0512A"/>' +
      '<text x="0" y="-19.5" text-anchor="middle" font-family="Plex Mono, monospace" font-size="7" letter-spacing=".08em" fill="#fff">LEDGELINE</text>' +
      '<circle cx="0" cy="0" r="4" fill="#E0512A"/><circle cx="0" cy="0" r="8" fill="none" stroke="#E0512A" stroke-width="1" opacity=".45"/>' +
      '</g>' +

      '<text class="mtxt-d" x="8" y="18">SCHEMATIC · NOT TO SCALE</text>' +
      '<g transform="translate(378,224)"><path d="M0 12 L0 -4 M-4 1 L0 -4 L4 1" stroke="#69737C" stroke-width="1.2" fill="none"/>' +
      '<text class="mtxt-d" x="-3" y="22">N</text></g>' +
      '</svg>';
  }

  /* ============================================================
     Reserve form — a concept build that says so out loud
     ============================================================ */
  function wireForm() {
    var f = $('#resForm'), msg = $('#resMsg'); if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var missing = [];
      if (!$('#rName').value.trim()) missing.push('your name');
      if (!$('#rPhone').value.trim()) missing.push('a phone number');
      var em = $('#rEmail').value.trim();
      if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) missing.push('a valid email address');

      if (missing.length) {
        msg.classList.remove('ok');
        msg.innerHTML = '<b>Not sent</b>We still need ' + missing.join(', ') + '.';
        msg.hidden = false; msg.setAttribute('tabindex', '-1'); msg.focus();
        return;
      }
      msg.classList.add('ok');
      msg.innerHTML = '<b>Concept build — nothing was submitted</b>' +
        'This form is not wired to anything, so no reservation was created and nobody was ' +
        'notified. On a live Ledgeline site this writes straight into the facility’s management ' +
        'software, holds the door for 48 hours and texts the customer their gate code.';
      msg.hidden = false; msg.setAttribute('tabindex', '-1'); msg.focus();
    });
  }

  /* ============================================================
     Nav, rail marks, sticky bar
     ============================================================ */
  function wireChrome() {
    var nav = $('#nav'), mstick = $('#mstick'), hero = $('#top');

    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        nav.classList.toggle('stuck', !e.isIntersecting);
        if (mstick) mstick.classList.toggle('on', !e.isIntersecting);
      });
    }, { rootMargin: '-70px 0px 0px 0px', threshold: 0 });
    if (hero) navIO.observe(hero);

    var ids = ['units', 'sizes', 'cost', 'access', 'find', 'answers', 'reserve'];
    var current = null;
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        current = e.target.id;
        $$('.rail__mark').forEach(function (a) {
          a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + current));
        });
        $$('.nav__links a').forEach(function (a) {
          a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + current));
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    ids.forEach(function (id) { var el = document.getElementById(id); if (el) secIO.observe(el); });
  }

  /* ============================================================
     Boot
     ============================================================ */
  function init() {
    raise();
    paintGate();
    window.setInterval(paintGate, 60000);

    buildStrip();
    paintOpenChip();

    drawPlan();
    buildFilters();
    wirePlan();
    wireDrawer();
    apply();

    buildSizes();
    buildCalc();
    buildSpecs();
    buildMap();
    wireForm();
    wireChrome();

    /* the gate runs itself the first time it comes into view */
    var gate = $('#gate');
    if (gate) {
      var gio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          gio.disconnect();
          window.setTimeout(runGate, REDUCED ? 0 : 520);
        });
        /* the gate is a reveal block too, so it can only offer its door rail
           until it opens — trigger on entry, then let the reveal land first */
      }, { rootMargin: '0px 0px -22% 0px', threshold: 0 });
      gio.observe(gate);
      $('#gateRun').addEventListener('click', runGate);
    }

    /* reveals wait for the intro door so nothing opens behind it */
    window.setTimeout(function () { armReveals(); }, REDUCED ? 0 : 640);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
