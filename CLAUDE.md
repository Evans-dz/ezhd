# EZHD

The agency's own site. Zero-build static — a single `index.html` with inline
`<style>` and `<script>`. Dev server: `.claude/launch.json` → **port 5070**
(the other configs in that file are the client sites under `_src/`).

**Read `DESIGN.md` before changing markup or CSS.** It is the design contract:
motion language, the three-colour rule, the tokenised small-type scale, and the
ES5-only constraint on the page script. `HANDOFF.md` is the operational
record — deploy, repo layout, the contact form, the canvas renderers, traps.

Conventions and verify harnesses live in the lab at
`/Users/dylanevans/Downloads/ezhd-lab` — the `ezhd-build` and `ezhd-motion`
skills load them automatically.

Verify with `/ezhd-verify` before deploying. Never copy the harnesses in here.

**This site's motion language does not travel.** "Drawn, then broadcast" is
EZHD's own; a client build derives its own from that client's trade.
