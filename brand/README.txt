EZHD BRAND KIT
==============
Ion Blue  #4FC3F7      the accent — keylines, highlights, one word in a headline
Drift Silver #DDE3EA   the mass — type and logo on dark
Void Black   #04060A    the ground

Recoloured from the original Vista artwork. The trace carried 27 near-identical
greens and golds (scan shading, not design); each family was flattened to one
flat colour, which is what makes it read as designed rather than scanned.


WHICH FILE DO I USE?
--------------------
On black / dark      ezhd-*-silver        silver mass, ion keyline   ← default
Bolder, blue-forward ezhd-*-ion           ion mass, silver keyline
On white / print     ezhd-*-light         black mass, ion keyline
One colour only      ezhd-*-mono-white | mono-black | mono-ion
                     (embroidery, vinyl, faxable forms, single-plate print)

Three shapes, same six colourways:
  ezhd-badge-*      square. favicon, avatar, app icon, stamp
  ezhd-lockup-*     badge + wordmark, tight cropped. the default logo
  ezhd-wordmark-*   type only. when the badge already appears nearby
  ezhd-mark-*       original square canvas with the artwork floating in it —
                    kept only for reference; prefer ezhd-lockup-*


FORMATS
-------
SVG   vector, infinite scale, tiny. use anywhere on the web and in print.
      This is the master. Prefer it over PNG whenever the tool accepts it.
PNG   png/ — transparent, rendered with headless Chrome at exact size.
      badge     1024 / 512 / 256 square
      lockup    2048x701, 1024x350
      wordmark  2048x554
favicon/ — apple-touch-icon 180, plus 64 / 32 / 16.


A HONEST NOTE ON SMALL SIZES
----------------------------
The full lockup is unreadable below about 48px — the wordmark collapses. Always
use the badge for favicons, avatars and app icons. Even the badge loses its
monogram detail at 16px and reads as a ring; that is expected of any traced
crest and is why the 16px PNG exists as its own file rather than being scaled.

If the mark ever needs to work hard at very small sizes, the fix is a simplified
badge drawn for that purpose, not a smaller version of this one.


USING IT ON THE SITE
--------------------
index.html references this folder:
  nav badge   brand/ezhd-badge-silver.svg
  favicons    brand/favicon/*
  footer      brand/ezhd-badge-silver.svg
Deploy the brand/ folder alongside index.html or those will 404.

Originals are untouched in ~/Downloads/Vista Logos/.
