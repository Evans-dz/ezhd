# EZHD

The agency's own site. Zero-build static — a single `index.html` with inline
`<style>` and `<script>`. Dev server: `.claude/launch.json` → **port 5070**
(the other configs in that file are the client sites under `_src/`).

**Read `DESIGN.md` before changing markup or CSS.** It is the design contract:
motion language, the three-colour rule, the tokenised small-type scale, and the
ES5-only constraint on the page script. `HANDOFF.md` is the operational
record — deploy, repo layout, the contact form, the canvas renderers, traps.

Conventions and verify harnesses live in the lab at
`/Users/dylanevans/Projects/EZHD/ezhd-lab` — the `ezhd-build` and `ezhd-motion`
skills load them automatically.

Verify with `/ezhd-verify` before deploying. Never copy the harnesses in here.

**Professional polish is a hard rule** (set 2026-09-25): no em dashes anywhere
(copy, titles, meta, alt, JSON-LD), no pill buttons, no animation gimmicks, keep
the 404 / privacy / terms / llms.txt pages current. Standard:
`ezhd-lab/reference/professional-polish.md`; the audit's `— polish —` sections
check it. Run the audit against https://ez-hd.co after every push.

**Dev server:** `node _src/serve.js` (port 5070, or `PORT=5079 node _src/serve.js`).
Old servers started from the pre-move path `~/Downloads/EZHD` can still hold 5070
and 5071 and answer 404 for everything; use another port or stop them.

**This site's motion language does not travel.** "Drawn, then broadcast" is
EZHD's own; a client build derives its own from that client's trade.

## Latest changes (2026-09-25)

Commits `852f928` and `902aeb9`, live. Full record in `HANDOFF.md` ("Page structure" rows for
`hero`, `why`, `proof`, `drafts`, `airtime`, and "Professional-polish pass (2026-09-25)"):
hero is the first screen (title card cut, ring field behind it, call button in the nav), new
unnumbered `#why` section, "05 · Live sites" with five client sites, Drafts 01 to 05, photo stills
in `work/shots/`, 198 em dashes rewritten, `404.html`, `privacy/`, `terms/`, `llms.txt`,
BreadcrumbList on sub-pages. `.vercelignore` now also hides DESIGN.md, CLAUDE.md and
verify-baseline.txt (they were publicly served). Business-level context (Instagram, Meta,
social folder): `../CLAUDE.md`.
