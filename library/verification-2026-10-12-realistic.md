# Realistic Library revision — October 12, 2026

## Requested result

Arthur authorized the realistic zoom design, requested a continuous outside wall in Hairline, removal of the round ladder handle and protruding support feet, and ordinary page scrolling through the full shelf. All existing book and Papers metadata must be preserved.

## Implementation

- The fixed Hairline entrance has a solid painted side wall that occludes the interior. Support feet and the circular grip are removed; the ladder's rails/rungs are the direct drag target, retaining keyboard controls.
- Replaced the fixed-height iframe with inline shelf partials: eight wooden bays containing 96 upright books and 24 stacked volumes. All 120 are in document flow; there is no independent shelf scrollbar or constrained catalog viewport.
- Preserved every supplied title, author, rating and cloth/foil palette. Original SVG grain, binding gradients, recessed backs, shelf edges and directional shadows model the physical object. Upright heights remain 147–152px. Only titles appear on resting spines.
- Selected books use original CSS 3D geometry for cover, spine, page edges and articulated cover opening. A volume flies from its slot into an inline reading area after that bay and returns to its slot on close. The flight uses document coordinates, so it moves with page scrolling. Only intentional interactions animate.
- Stable frontal spines avoid an edge-on rendering failure observed in mobile WebKit. New selection and viewport changes cancel transient animation artwork. Reduced motion skips flights and transitions. Without JavaScript, all shelf volumes remain visible and link to the corresponding complete list entry.
- The original standalone `static/library/books.html` remains in place as historical source material. Papers list markup/styles and the complete 120-book list remain unchanged.

## Mandatory design comparison

Reread [André Staltz's post](https://x.com/andrestaltz/status/2107507231864357323) live before publication. Compared the current desktop/mobile renders with Arthur's latest Hairline screenshot, the approved Papers composition and supplied wooden-library photographs. The review removed the extraneous handle/support geometry, sealed the side wall, replaced the separately scrolling viewport, and corrected WebKit material visibility. The scene remains centered in the content column, with the approved diagonal outside and a complete frontal catalog inside. No instructions, counters, category controls or extra metadata were added. Claude Design and Mobbin were not used.

## Verification

The browser regression suite covers desktop Chromium, desktop WebKit, iPhone 13 touch emulation in WebKit and a 320px Chromium touch viewport. Checks include fixed entrance and zoom bounds, direct ladder keyboard/pointer/touch movement, 120 visible shelf volumes, 24 stacked books, solid side and no circle, visible material surfaces, slight height variation, page-only scrolling, normal opening/return of first/middle/last and stacked books, all 120 titles/authors under reduced motion, rapid-selection cancellation, flight alignment during document scrolling, all 26 Papers anchors and no-JavaScript fallback.

Mobile WebKit does not implement the mouse-wheel automation command, so its document-scroll check uses browser scrolling; real pointer-wheel scrolling is checked in desktop engines, and actual ladder touch dragging in mobile Chromium. Native iOS Simulator testing remains waived by Arthur; this report does not certify a physical iPhone.

All 120 original records and palette fields were checked against their supplied source; no missing year or review was invented. The generated shelf labels and list match. Hugo, public-document synchronization and the standards audit pass; the audit retains one pre-existing coauthor-affiliation warning. External Benefits-source freshness remains outside permitted reads; approved canonical workspace/public copies match.
