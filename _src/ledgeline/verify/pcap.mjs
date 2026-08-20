import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true });
const problems = [];

// 1) EZHD drafts section shows the new card
{
  const p = await (await b.newContext({ viewport:{width:1440,height:960}, deviceScaleFactor:2 })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('http://localhost:5070/#drafts', { waitUntil:'networkidle' });
  await new Promise(r=>setTimeout(r,2500));
  await p.evaluate(()=>document.querySelector('img[src="work/draft-ledgeline.jpg"]').closest('.wk__card').scrollIntoView({block:'center'}));
  await new Promise(r=>setTimeout(r,1600));
  const f = await p.evaluate(()=>{
    const img=document.querySelector('img[src="work/draft-ledgeline.jpg"]');
    const next=document.querySelector('#drafts .wk__nextIx');
    return { imgLoaded: img.complete && img.naturalWidth===2000,
             cards: document.querySelectorAll('#drafts .wk__card').length,
             nextIx: next?.textContent.trim() };
  });
  if (!f.imgLoaded) problems.push('work image did not load at 2000w');
  if (f.cards !== 5) problems.push(`drafts grid has ${f.cards} cards, expected 5`);
  if (f.nextIx !== '05') problems.push(`on-the-board index is ${f.nextIx}, expected 05`);
  await p.screenshot({ path:'verify/z-ezhd-card.png' });
  if (errs.length) problems.push('EZHD page errors: '+errs.join(' | '));
  await p.close();
}

// 2) draft page: chrome present, site still works, ribbon clear of the rail
{
  const p = await (await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('http://localhost:5070/drafts/ledgeline/', { waitUntil:'networkidle' });
  await new Promise(r=>setTimeout(r,2000));
  const f = await p.evaluate(()=>{
    const rb=document.querySelector('.draft-ribbon');
    const r=rb.getBoundingClientRect();
    return { title: document.title,
             robots: document.querySelector('meta[name="robots"]')?.content,
             ribbon: !!rb, ribbonLeft: Math.round(r.left),
             units: document.querySelectorAll('#planSvg .u').length,
             open: window.LEDGELINE.openCount(),
             claim: !!document.querySelector('.foot__ez a[href="/#drafts"]') };
  });
  if (!/EZHD concept draft/.test(f.title)) problems.push('draft title missing');
  if (!/noindex/.test(f.robots||'')) problems.push('draft not noindexed');
  if (!f.ribbon) problems.push('ribbon missing');
  if (f.ribbonLeft < 60) problems.push(`ribbon overlaps the rail (left=${f.ribbonLeft})`);
  if (f.units !== 95) problems.push(`draft page drew ${f.units} units`);
  if (!f.claim) problems.push('footer claim link missing');
  await p.screenshot({ path:'verify/z-draft-page.png' });
  if (errs.length) problems.push('draft page errors: '+errs.join(' | '));
  await p.close();
}

// 3) phone: ribbon lifts above the sticky bar
{
  const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:3, isMobile:true, hasTouch:true });
  const p = await ctx.newPage();
  await p.goto('http://localhost:5070/drafts/ledgeline/', { waitUntil:'networkidle' });
  await new Promise(r=>setTimeout(r,1800));
  await p.evaluate(()=>document.querySelector('#sizes').scrollIntoView({block:'start',behavior:'instant'}));
  await new Promise(r=>setTimeout(r,900));
  const f = await p.evaluate(()=>{
    const rb=document.querySelector('.draft-ribbon').getBoundingClientRect();
    const ms=document.querySelector('#mstick').getBoundingClientRect();
    return { stickOn: document.querySelector('#mstick').classList.contains('on'),
             overlap: rb.bottom > ms.top && document.querySelector('#mstick').classList.contains('on') };
  });
  if (f.stickOn && f.overlap) problems.push('ribbon overlaps mobile sticky bar');
  await p.screenshot({ path:'verify/z-draft-mobile.png' });
  await ctx.close();
}

await b.close();
console.log(problems.length ? 'PROBLEMS:\n- '+problems.join('\n- ') : 'Draft wiring checks passed.');
process.exit(problems.length?1:0);
