# Architectural Library review — October 12, 2026

## Request and references

Arthur requested a constructed architectural scene instead of the SVG sketch:
measured layers, depth-correct shelf/book fit, a recognizable curved lounge
chair, more detailed plants, continuous cap, and floor edges aligned with shelf
endpoints. He removed search, zoom and Open book, and moved title/author above
the scene. These instructions supersede the previous room controls.

Primary references checked: Hairline's repository and cabinet/projection source;
Anatomy's repository and geometry/craft documentation; the official Herman Miller
Eames Lounge Chair product sheet; RHS Monstera profile; and Transitions.dev.
The whole Transitions.dev site was registered in the workspace source registry.
The homepage was reachable; the supplied Gooey plus menu detail URL was not.
The modal/readout motion is original and restrained; no restricted code was copied.

The required André Staltz post was reopened and returned HTTP 403. Its live text
could not be reread. The actual design comparison used Arthur's approved room
concept, the existing Papers object, and the primary construction references.

## Construction and corrections

The model uses centimetre coordinates and six groups: floor, walls, shelves,
furniture, plants and books. The camera is fixed and orthographic. The curved
wall and island are extruded solids, including a continuous cap; shelf levels,
dividers and books derive from the same routes and dimensions. Depth testing
removes hidden surfaces and ray picking cannot select through other solids.
The 480 cm square floor terminates at both shelving endpoints.

Every supplied record appears once; no bibliographic data changed. Books are
24 cm high, 3.8 cm wide and 17.5 cm deep. Niches and clearances are checked at
rest and at four intermediate/full pull positions. The island's back clearance
was increased and groups moved to physically visible bays. The room still does
not assert physical ownership, read dates or a certified 1,000-book capacity.

The original chair model now has separate shaped shells, curved padded cushions,
welt, buttons, arm supports, pedestal and ottoman. It is a stylized interpretation,
not manufacturer CAD. Ficus/Monstera models have curved stems/blades, midribs,
and Monstera margin splits and fenestrations. The palette is grayscale. The
illustration is intentionally simplified; visual fidelity remains open to
Arthur's review.

Book pieces were consolidated to reduce draws from 1,302 to 582. The scene only
renders on resize or selection, stops offscreen and respects reduced motion.
The local bundle is about 535 KB, with pinned Three.js/esbuild dependencies and
the complete MIT license. No runtime CDN is used. `room-preview.webp` is a still
rendered from the exact model for WebGL-unavailable browsers, not generated art.

## Verification

- `node library/room3d/check-model.js`: 120 unique book placements; vertical,
  divider and floor clearance; oriented book/divider and book/book intersection
  checks at rest and four pull distances passed.
- Browser matrices passed: Chromium desktop, WebKit desktop, WebKit iPhone 13
  emulation and Chromium touch at 320 pixels. Desktop/mobile screenshots and
  hover/detail states were inspected.
- All 120 spine-center rays identify their own book at rest in both engines;
  no book is obscured at its selectable center in the fixed composition.
- Representative direct book selection on both wings and island, pull motion,
  readout/content match, opening/closing, arrow/Enter/Escape navigation, removed
  controls, overflow, reduced motion, Papers destination, and native Chromium
  touch page scrolling passed.
- Coarse mobile coordinates can resolve to an adjacent spine (about one screen
  pixel wide). The test checks the nearest visible neighbor, the displayed title,
  and that the second tap opens exactly that selected record. Physical iPhone
  behavior is not certified by emulation. The complete list remains available.
- No-JavaScript list and WebGL-unavailable still/list fallback passed.
- Hugo build, public-document reconciliation and diff whitespace checks passed.
  The standards audit has zero errors and its existing coauthor-affiliation warning.

Public PDFs match the saved canonical allowlist. The external Benefits research
source remains outside permitted reads, so its latest freshness was not rechecked.
Browser images stay in `/tmp/library-room3d-review`, outside the public site.
