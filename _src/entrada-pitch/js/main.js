/* ============================================================
   ENTRADA AT SNOW CANYON — interaction layer
   Lenis smooth scroll + GSAP ScrollTrigger choreography
   ============================================================ */
(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Smooth scroll ---------------- */
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else {
      const el = typeof target === 'string' ? $(target) : target;
      window.scrollTo({ top: el ? el.getBoundingClientRect().top + window.scrollY : 0, behavior: 'smooth' });
    }
  };

  /* ---------------- Text splitting ---------------- */
  const splitChars = (el) => {
    const frag = document.createDocumentFragment();
    [...el.textContent].forEach((ch) => {
      if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
      const s = document.createElement('span');
      s.className = 'w-char';
      s.textContent = ch;
      frag.appendChild(s);
    });
    el.textContent = '';
    el.appendChild(frag);
    return $$('.w-char', el);
  };

  const splitWords = (el, masked) => {
    const nodes = [...el.childNodes];
    el.textContent = '';
    nodes.forEach((node) => {
      if (node.nodeType === 3) {
        node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
          const w = document.createElement('span');
          w.className = 'w-word';
          w.textContent = word;
          if (masked) {
            const line = document.createElement('span');
            line.className = 'w-line';
            line.appendChild(w);
            el.appendChild(line);
          } else {
            el.appendChild(w);
          }
          el.appendChild(document.createTextNode(' '));
        });
      } else {
        el.appendChild(node); // keep <br> etc.
      }
    });
    return $$('.w-word', el);
  };

  /* ---------------- Preloader + hero intro ---------------- */
  const loader = $('#loader');
  const heroImg = $('.hero-media img');
  const heroChars = $$('.hero-title [data-chars]').map((line) => splitChars(line));

  const heroIntro = () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo('#heroMedia', { scale: 1.18 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 0)
      .fromTo('.hero-eyebrow', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.25)
      .fromTo(heroChars[0], { yPercent: 112 }, { yPercent: 0, duration: 1.25, stagger: 0.028 }, 0.35)
      .fromTo(heroChars[1], { yPercent: 112 }, { yPercent: 0, duration: 1.25, stagger: 0.03 }, 0.5)
      .fromTo('.hero-sub', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.85)
      .fromTo('.hero-cta .btn', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.09 }, 1)
      .fromTo('.hero-foot', { opacity: 0 }, { opacity: 1, duration: 1 }, 1.2)
      .fromTo('.nav', { y: -28, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 1.05);
    return tl;
  };

  if (reduced) {
    loader.style.display = 'none';
  } else {
    if (lenis) lenis.stop();
    document.documentElement.style.overflow = 'hidden';
    const count = { v: 0 };
    /* decode() can stall in background tabs — never let it hold the door */
    const decoded = Promise.race([
      heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve(),
      new Promise((r) => setTimeout(r, 4000)),
    ]);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.mark-spiral', { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0)
      .to('.mark-rays line', { opacity: 1, duration: 0.35, stagger: 0.05 }, 0.7)
      .fromTo('.loader-word span', { yPercent: 120 }, { yPercent: 0, duration: 1.1, stagger: 0.05, ease: 'expo.out' }, 0.35)
      .to('.loader-sub', { opacity: 1, duration: 0.8 }, 1.0)
      .to(count, {
        v: 100, duration: 1.7, ease: 'power2.inOut',
        onUpdate: () => { $('#loadCount').textContent = Math.round(count.v); },
      }, 0.15);
    /* rAF (and so GSAP) freezes in hidden tabs — force-finish on a wall clock
       so the site is never stuck behind the loader when the tab is foregrounded */
    setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, 7000);
    Promise.all([tl.then(), decoded]).then(() => {
      const out = gsap.timeline();
      out.to('.loader-inner, .loader-count', { opacity: 0, duration: 0.45, ease: 'power2.in' }, 0)
        .to('.loader-panel--b', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 0.15)
        .to('.loader-panel--a', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 0.28)
        .add(() => {
          document.documentElement.style.overflow = '';
          if (lenis) lenis.start();
          heroIntro();
        }, 0.42)
        .set(loader, { display: 'none' });
    });
  }

  /* ---------------- Nav behavior ---------------- */
  const nav = $('#nav');
  let lastY = 0;
  const onScrollY = (y) => {
    nav.classList.toggle('is-scrolled', y > 60);
    if (y > 700 && y > lastY + 4 && !menuOpen) nav.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 700) nav.classList.remove('is-hidden');
    lastY = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScrollY(scroll));
  else window.addEventListener('scroll', () => onScrollY(window.scrollY), { passive: true });

  /* ---------------- Fullscreen menu ---------------- */
  const menu = $('#menu');
  const burger = $('#burger');
  let menuOpen = false;
  const MENU_PARTS = ['.menu-bg', '.menu-links a > *', '.menu-media', '.menu-media img', '.menu-foot'];

  const setMenu = (open) => {
    if (open === menuOpen) return;
    menuOpen = open;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    gsap.killTweensOf(MENU_PARTS.map((s) => $$(s)).flat());
    if (open) {
      if (lenis) lenis.stop();
      menu.classList.add('is-open');
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .fromTo('.menu-bg', { yPercent: -100 }, { yPercent: 0, duration: 0.85, ease: 'expo.inOut' }, 0)
        .fromTo('.menu-links a > *', { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.045 }, 0.35)
        .fromTo('.menu-media', { opacity: 0 }, { opacity: 1, duration: 1 }, 0.45)
        .fromTo('.menu-media img', { scale: 1.14 }, { scale: 1, duration: 1.6 }, 0.35)
        .fromTo('.menu-foot', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.55);
    } else {
      if (menu.contains(document.activeElement)) burger.focus();
      gsap.timeline({ defaults: { ease: 'power2.in' } })
        .to('.menu-links a > *', { y: -44, opacity: 0, duration: 0.3, stagger: 0.02 }, 0)
        .to(['.menu-media', '.menu-foot'], { opacity: 0, duration: 0.28 }, 0)
        .to('.menu-bg', { yPercent: -100, duration: 0.6, ease: 'expo.inOut' }, 0.16)
        .add(() => menu.classList.remove('is-open'));
      if (lenis) lenis.start();
    }
  };
  burger.addEventListener('click', () => setMenu(!menuOpen));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------------- Anchor scrolling ---------------- */
  $$('[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href');
      if (!hash || !hash.startsWith('#')) return;
      e.preventDefault();
      if (menuOpen) { setMenu(false); setTimeout(() => scrollTo(hash), 450); }
      else scrollTo(hash);
    });
  });
  $('#scrollCue')?.addEventListener('click', () => scrollTo('#club'));

  /* ---------------- Scroll progress ---------------- */
  gsap.to('.progress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

  /* ---------------- Generic reveals ---------------- */
  if (!reduced) {
    /* One-shot reveals via IntersectionObserver — immune to instant
       scroll jumps and browser scroll restoration. */
    const playReveal = (el, i) => gsap.to(el, {
      opacity: 1, y: 0, duration: 1.1, delay: i * 0.08, ease: 'power3.out', overwrite: true, clearProps: 'transform',
    });
    const revealIO = new IntersectionObserver((entries) => {
      entries.filter((en) => en.isIntersecting).forEach((en, i) => {
        revealIO.unobserve(en.target);
        playReveal(en.target, i);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach((el) => { gsap.set(el, { opacity: 0, y: 34 }); revealIO.observe(el); });

    const wordsIO = new IntersectionObserver((entries) => {
      entries.filter((en) => en.isIntersecting).forEach((en) => {
        wordsIO.unobserve(en.target);
        gsap.to(en.target._words, { yPercent: 0, duration: 1.2, stagger: 0.05, ease: 'expo.out', overwrite: true });
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('[data-words]').forEach((el) => {
      el._words = splitWords(el, true);
      gsap.set(el._words, { yPercent: 115 });
      wordsIO.observe(el);
    });

    /* Manifesto — word-by-word scrub */
    const mText = $('#manifestoText');
    if (mText) {
      const words = splitWords(mText, false);
      gsap.to(words, {
        opacity: 1, stagger: 0.35, ease: 'none',
        scrollTrigger: { trigger: mText, start: 'top 80%', end: 'bottom 45%', scrub: 0.4 },
      });
    }

    /* Parallax images — scale gives headroom so edges never show */
    $$('[data-parallax]').forEach((wrap) => {
      const img = $('img', wrap);
      const strength = parseFloat(wrap.dataset.parallax) || 12;
      const zoom = wrap.classList.contains('pimg') ? 1.16 : 1;
      gsap.fromTo(img, { yPercent: -strength / 2, scale: zoom }, {
        yPercent: strength / 2, scale: zoom, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    /* Hero scroll parallax (container, so slide crossfade owns the imgs) */
    gsap.to('#heroMedia', {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero-inner', {
      yPercent: -14, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '75% top', scrub: true },
    });
  }

  /* ---------------- Counters ---------------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.filter((en) => en.isIntersecting).forEach((en) => {
      countIO.unobserve(en.target);
      en.target._play && en.target._play();
    });
  }, { rootMargin: '0px 0px -5% 0px' });
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const pad = parseInt(el.dataset.pad || '0', 10);
    const fmt = (v) => {
      let s = Math.round(v).toLocaleString('en-US');
      if (pad) s = String(Math.round(v)).padStart(pad, '0');
      return s;
    };
    if (reduced) { el.textContent = fmt(end); return; }
    const obj = { v: 0 };
    el._play = () => gsap.to(obj, {
      v: end, duration: 2, ease: 'power3.out',
      onUpdate: () => { el.textContent = fmt(obj.v); },
    });
    countIO.observe(el);
  });

  /* ---------------- Hero slide dissolve (desktop) ---------------- */
  if (!reduced && window.matchMedia('(min-width: 900px)').matches) {
    const slides = $$('.hero-media img');
    if (slides.length > 1) {
      let cur = 0;
      const HOLD = 6.5, FADE = 1.8;
      const kenburns = (img, zoomIn) =>
        gsap.fromTo(img, { scale: zoomIn ? 1 : 1.07 }, { scale: zoomIn ? 1.07 : 1, duration: HOLD + FADE, ease: 'none', overwrite: 'auto' });
      const advance = () => {
        const nxt = (cur + 1) % slides.length;
        gsap.set(slides[nxt], { zIndex: 2 });
        gsap.set(slides[cur], { zIndex: 1 });
        kenburns(slides[nxt], nxt % 2 === 0);
        gsap.fromTo(slides[nxt], { opacity: 0 }, {
          opacity: 1, duration: FADE, ease: 'power1.inOut',
          onComplete: () => { gsap.set(slides[cur], { opacity: 0 }); cur = nxt; },
        });
        gsap.delayedCall(HOLD, advance);
      };
      const hydrate = (im) => {
        if (!im.dataset.src) return;
        if (im.dataset.srcset) im.srcset = im.dataset.srcset;
        if (im.dataset.sizes) im.sizes = im.dataset.sizes;
        im.src = im.dataset.src;
      };
      window.addEventListener('load', () => {
        slides.slice(1).forEach(hydrate);
        Promise.all(slides.slice(1).map((im) => (im.decode ? im.decode().catch(() => {}) : Promise.resolve())))
          .then(() => gsap.delayedCall(HOLD, advance));
      });
    }
  }

  /* ---------------- Signature holes scrollytelling ---------------- */
  const holeImgs = $$('.hole-img');
  const frameNum = $('#holesFrameNum');
  const mapPins = $$('.map-pin');
  const setHole = (i, num) => {
    holeImgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    mapPins.forEach((p) => p.classList.toggle('is-active', +p.dataset.hole === i));
    if (frameNum.textContent !== num) {
      frameNum.textContent = num;
      if (!reduced) gsap.fromTo(frameNum, { yPercent: 24, opacity: 0 }, { yPercent: 0, opacity: 0.9, duration: 0.7, ease: 'expo.out' });
    }
  };
  mapPins.forEach((p) => {
    p.setAttribute('tabindex', '0');
    p.setAttribute('role', 'button');
    p.setAttribute('aria-label', 'View hole ' + (15 + (+p.dataset.hole)));
    const go = () => {
      const h = $$('.hole')[+p.dataset.hole];
      if (h) scrollTo(h);
    };
    p.addEventListener('click', go);
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  $$('.hole').forEach((h, i) => {
    const num = $('.hole-no', h).textContent;
    ScrollTrigger.create({
      trigger: h, start: 'top 62%', end: 'bottom 30%',
      onToggle: (self) => { if (self.isActive) setHole(i, num); },
    });
  });

  /* ---------------- Horizontal gallery ---------------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    if (reduced) return;
    const track = $('#galleryTrack');
    const pin = $('#galleryPin');
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: pin, start: 'top top', end: () => '+=' + dist(),
        scrub: 0.6, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    return () => tween.scrollTrigger && tween.scrollTrigger.kill();
  });

  /* ---------------- Marquee w/ scroll velocity ---------------- */
  if (!reduced) {
    const track = $('#marqueeTrack');
    const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 30, repeat: -1 });
    let speed = 1, target = 1;
    if (lenis) lenis.on('scroll', ({ velocity }) => { target = gsap.utils.clamp(1, 4, 1 + Math.abs(velocity) / 22); });
    gsap.ticker.add(() => {
      speed += (target - speed) * 0.06;
      target += (1 - target) * 0.04;
      loop.timeScale(speed);
    });
  }

  /* ---------------- Custom cursor ---------------- */
  if (finePointer && !reduced) {
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    const label = $('.cursor-label');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
    let shown = false;
    window.addEventListener('pointermove', (e) => {
      if (!shown) { gsap.to([dot, ring], { opacity: 1, duration: 0.4 }); shown = true; }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseleave', () => { gsap.to([dot, ring], { opacity: 0, duration: 0.3 }); shown = false; });
    const hoverables = 'a, button, [data-cursor], .gpanel';
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest(hoverables);
      if (!t) { ring.classList.remove('is-hover', 'is-label'); label.textContent = ''; return; }
      const custom = t.closest('[data-cursor]');
      if (custom) { ring.classList.add('is-label'); ring.classList.remove('is-hover'); label.textContent = custom.dataset.cursor; }
      else { ring.classList.add('is-hover'); ring.classList.remove('is-label'); label.textContent = ''; }
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (finePointer && !reduced) {
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.28);
        yTo((e.clientY - r.top - r.height / 2) * 0.34);
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      });
    });
  }

  /* ---------------- Tilt cards ---------------- */
  if (finePointer && !reduced) {
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--gx', `${px * 100}%`);
        card.style.setProperty('--gy', `${py * 100}%`);
        gsap.to(card, {
          rotateY: (px - 0.5) * 9, rotateX: (0.5 - py) * 8,
          transformPerspective: 950, duration: 0.5, ease: 'power2.out',
        });
      });
      card.addEventListener('pointerleave', () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  /* ---------------- Hero mouse drift ---------------- */
  if (finePointer && !reduced) {
    const media = $('#heroMedia');
    const mx = gsap.quickTo(media, 'x', { duration: 1.2, ease: 'power2.out' });
    const my = gsap.quickTo(media, 'y', { duration: 1.2, ease: 'power2.out' });
    $('.hero').addEventListener('pointermove', (e) => {
      mx((e.clientX / window.innerWidth - 0.5) * -18);
      my((e.clientY / window.innerHeight - 0.5) * -12);
    });
  }

  /* ---------------- Form ---------------- */
  $$('.field input, .field textarea, .field select').forEach((f) => {
    const sync = () => f.classList.toggle('has-val', !!f.value);
    f.addEventListener('input', sync); f.addEventListener('change', sync); sync();
  });
  const form = $('#inquireForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const success = $('#formSuccess');
    success.hidden = false;
    gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' });
    gsap.to(form, { opacity: 0, duration: 0.4 });
  });

  /* ---------------- Mobile sticky CTA ---------------- */
  const mcta = $('.mcta');
  if (mcta) {
    ScrollTrigger.create({
      start: () => window.innerHeight * 0.9, end: 'max',
      onToggle: (s) => mcta.classList.toggle('is-on', s.isActive),
    });
    ScrollTrigger.create({
      trigger: '#inquire', start: 'top 85%', end: 'bottom top',
      onToggle: (s) => mcta.classList.toggle('is-hide', s.isActive),
    });
  }

  /* ---------------- Ambient details ---------------- */
  const timeEl = $('#localTime');
  const tickClock = () => {
    if (!timeEl) return;
    timeEl.textContent = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: '2-digit', timeZone: 'America/Denver',
    }).format(new Date());
  };
  tickClock(); setInterval(tickClock, 30000);
  $('#year').textContent = new Date().getFullYear();

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
