# File labels and ladder gestures — October 12, 2026

## Scope and source boundaries

Arthur requested title/year lettering on the paper files, smooth reversible ladder dragging, normal page scrolling after touch, reading-month metadata from the original CSV and careful border alignment. Existing titles, authors, ratings, source URLs and shelf palettes remain intact. The available 120-book HTML/JSON contains no reading dates; the original CSV/ZIP was not found in accessible project files. Reading-month presentation is ready in both cards and open-book details, but dates remain absent pending that source.

## Changes

- Titles and existing publication years are wrapped on the highlighted file's own affine plane. Other file faces retain their minimal ruled appearance. No extra controls or instructions.
- Ladder travel increased from 80 to 116 world units, reaching both ends of the usable case. A separate SVG layer translates on animation frames; the stationary bookcase geometry is untouched during dragging.
- Pointer release, cancellation, lost capture, window blur, visibility changes and resizing terminate the gesture. `touch-action: pan-y` preserves document scrolling, including gestures beginning on the ladder.
- The approved card borders, shelf wall, diagonal, book arrangement and page-flow cabinet are preserved.

## Design comparison gate

Reread André Staltz's [October 6 post](https://x.com/andrestaltz/status/2107507231864357323) live through the browser before publication. Applied its reference-comparison and simplification principle against Arthur's two latest screenshots and approved shelf photographs. Desktop and mobile review checks lettering within file margins, cabinet centering relative to the sidebar, continuous side wall and roof edges, stable borders and unobstructed page scrolling. No Claude Design or Mobbin use is claimed.

## Verification

The regression suite tests desktop Chromium/WebKit, WebKit iPhone 13 emulation and 320px Chromium touch. New checks cover full projected travel, reverse dragging, unchanged stationary geometry, gesture cleanup, actual touch dragging followed by a vertical swipe over the rails, complete title/year text and selected-file margins. Existing coverage includes 120 shelf/list records, book flights and returns, 26 aligned paper anchors, reduced motion and no-JavaScript fallback.

Native iOS Simulator remains waived by Arthur; emulation does not certify a physical iPhone. Public PDFs match the approved canonical workspace copies; freshness against the external Benefits research source is outside permitted reads. Hugo and the standards audit are required before push; the baseline coauthor-affiliation warning is unrelated.

Final result: all four browser configurations passed, including the real CDP touch swipe over the rails after a horizontal drag. A separate narrow-screen check confirms face margins for all 26 labels. Desktop and iPhone screenshots were inspected. Hugo, PDF synchronization and `git diff --check` pass; the standards audit reports zero errors and the one existing coauthor-affiliation warning. Artifacts are outside the public repository at `/tmp/library-label-final-qa/`.
