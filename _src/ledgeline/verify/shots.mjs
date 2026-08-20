/* Headless capture + assertions for the Ledgeline concept build.
   The in-app Browser pane runs the page as a hidden tab, which pauses rAF and
   starves IntersectionObserver, so real verification happens here against
   system Chrome with a live compositor. Run: node verify/shots.mjs */
import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = process.env.URL || 'http://localhost:4176/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const problems = [];
const note = (m) => { console.log('  ' + m); };

async function section(page, sel, name, extra = 0) {
  await page.evaluate((s) => {
    document.querySelector(s)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, sel);
  await sleep(900 + extra);
  await page.screenshot({ path: path.join(HERE, name) });
}

/* ---------------- desktop ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(URL, { waitUntil: 'networkidle' });
  await sleep(1800);                       // let the intro door finish

  await page.screenshot({ path: path.join(HERE, 'd-01-hero.png') });

  const facts = await page.evaluate(() => {
    const L = window.LEDGELINE;
    const open = L.openCount();
    return {
      units: document.querySelectorAll('#planSvg .u').length,
      modelUnits: L.UNITS.length,
      open,
      chip: document.querySelector('#openChip')?.textContent.trim(),
      rail: document.querySelector('#railOpen')?.textContent.trim(),
      planCount: document.querySelector('#planCount')?.textContent.trim(),
      curtain: document.querySelector('.curtain')?.classList.contains('done'),
      revealsAbove: [...document.querySelectorAll('.r')]
        .filter((e) => e.getBoundingClientRect().top < innerHeight)
        .every((e) => e.classList.contains('is-open')),
      total: document.querySelector('#cTotal')?.textContent.trim(),
      hScroll: document.documentElement.scrollWidth > innerWidth,
    };
  });
  note(JSON.stringify(facts));

  if (facts.units !== facts.modelUnits) problems.push(`plan drew ${facts.units} of ${facts.modelUnits} units`);
  if (!facts.curtain) problems.push('intro curtain never cleared');
  if (!facts.revealsAbove) problems.push('an above-the-fold reveal stayed clipped');
  if (facts.hScroll) problems.push('page scrolls horizontally');
  if (!/^\d+\s+units open right now$/.test((facts.chip || '').replace(/\u00a0/g, ' '))) problems.push(`hero chip stuck: "${facts.chip}"`);
  if (facts.chip && !facts.chip.startsWith(String(facts.open))) problems.push(`hero chip disagrees with model (${facts.chip} vs ${facts.open})`);
  if (facts.rail !== String(facts.open)) problems.push(`rail count disagrees (${facts.rail} vs ${facts.open})`);

  await section(page, '#units', 'd-02-board.png', 400);

  /* click an open door and check the drawer */
  await page.evaluate(() => {
    const g = document.querySelector('#planSvg .u[data-s="open"]');
    g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await sleep(700);
  await page.screenshot({ path: path.join(HERE, 'd-03-drawer.png') });
  const drawer = await page.evaluate(() => ({
    on: document.querySelector('#drawer')?.classList.contains('on'),
    id: document.querySelector('#drawerId')?.textContent,
    rows: document.querySelectorAll('#drawer .spec tr').length,
    art: !!document.querySelector('#drawer .elev svg'),
  }));
  note('drawer ' + JSON.stringify(drawer));
  if (!drawer.on) problems.push('unit drawer did not open');
  if (!drawer.art) problems.push('drawer is missing its scale drawing');
  await page.keyboard.press('Escape');
  await sleep(500);

  /* filters */
  await page.evaluate(() => document.querySelector('#fSizes .fchip[data-size="10x20"]').click());
  await sleep(400);
  const filtered = await page.evaluate(() => ({
    dim: document.querySelectorAll('#planSvg .u.dim').length,
    count: document.querySelector('#planCount')?.textContent.trim(),
    rows: document.querySelectorAll('#listBody tr').length,
  }));
  note('filter 10x20 → ' + JSON.stringify(filtered));
  if (filtered.dim === 0) problems.push('size filter dimmed nothing');
  if (filtered.rows !== 10) problems.push(`filtered list has ${filtered.rows} rows, expected 10`);
  await page.evaluate(() => document.querySelector('#fReset').click());
  await sleep(300);

  await section(page, '#sizes', 'd-04-sizes.png', 500);
  await section(page, '#cost', 'd-05-cost.png');
  await section(page, '#access', 'd-06-access.png', 2600);
  await section(page, '#find', 'd-07-find.png');
  await section(page, '#answers', 'd-08-answers.png');
  await section(page, '#reserve', 'd-09-reserve.png');

  const gate = await page.evaluate(() => ({
    open: document.querySelector('#gate')?.classList.contains('open'),
    disp: document.querySelector('#gateDisp')?.textContent.trim(),
  }));
  note('gate ' + JSON.stringify(gate));
  if (!gate.open) problems.push('gate never opened');

  /* a real visitor scrolls past everything, so walk the page in viewport steps
     rather than jumping section to section, then assert nothing stayed shut */
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(200);
  const steps = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / (innerHeight * 0.7)));
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((n) => window.scrollTo(0, n * innerHeight * 0.7), i);
    await sleep(190);
  }
  await sleep(900);
  /* Assert the COMPUTED clip, not just the class. A class can be set correctly
     while a more specific rule keeps the block visually shut. */
  const shut = await page.evaluate(() =>
    [...document.querySelectorAll('.r')]
      .filter((e) => !e.classList.contains('is-open') ||
                     !/inset\(0px\)|none/.test(getComputedStyle(e).clipPath))
      .map((e) => `${e.className}#${e.closest('section')?.id || '?'}[${getComputedStyle(e).clipPath}]`));
  if (shut.length) problems.push(`reveal blocks still clipped: ${shut.join(', ')}`);

  if (errors.length) problems.push('console/page errors: ' + errors.join(' | '));
  await ctx.close();
}

/* ---------------- mobile ---------------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await sleep(1800);
  await page.screenshot({ path: path.join(HERE, 'm-01-hero.png') });
  const m = await page.evaluate(() => ({
    hScroll: document.documentElement.scrollWidth > innerWidth,
    sw: document.documentElement.scrollWidth, iw: innerWidth,
    listDefault: !document.querySelector('#listwrap')?.hidden,
  }));
  note('mobile ' + JSON.stringify(m));
  if (m.hScroll) problems.push(`mobile scrolls horizontally (${m.sw} > ${m.iw})`);
  if (!m.listDefault) problems.push('mobile did not default the board to list view');
  await section(page, '#units', 'm-02-board.png', 400);
  await section(page, '#sizes', 'm-03-sizes.png', 500);
  await section(page, '#cost', 'm-04-cost.png');
  await ctx.close();
}

await browser.close();
console.log(problems.length ? '\nPROBLEMS:\n- ' + problems.join('\n- ') : '\nAll checks passed.');
process.exit(problems.length ? 1 : 0);
