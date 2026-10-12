# Library design study — October 11, 2026

Arthur approved the smooth hardcover model and rejected the five initial selector drawings. Those are preserved in Git history. The current study at `/library/design-study/` has two double-sided shelf objects, also used as the actual `/library/` entrance.

## Double-sided selectors

- First shelf: Read / Reading.
- Second shelf: All / Wishlist.
- Each object holds two identically sized covers facing opposite aisles. Their 50 × 75 world-unit faces preserve the 2:3 book proportion.
- Drag to turn through a full circle; releasing settles on a face. Keyboard arrows turn by 45 degrees, and the explicit turn control rotates by 180 degrees. Enter/Space selects the visible face. Reduced motion jumps directly to explicit rotation/selection states.
- The design study displays the six-book pilot on Read/All. The actual Library opens the existing 120-book shelf. Reading/Wishlist show honest unrecorded states, without assigning fabricated statuses to sample books.

## Approved book model

Spines are 26 × 184 CSS pixels; horizontal samples rotate the same element by +90 degrees into 184 × 26 bounds. Covers share a 2:3 proportion, artwork y=7–51%, title y=54–82%, author y=84–96%, and 14%/10% binding-aware side margins. Matte solid colors have restrained lighting, hinge, page edge and shadow; no repeating texture. A shared font size is used per viewport. Covers and captions use the main title before a colon, e.g. Quantum, preserving full edition titles in the catalog and tooltips. Covers keep author names; spines use initials and surnames/particles. Upright/rotated demonstrations contain only a centered title. Artwork remains illustrative, not an approved full-catalog set.

## Favorite Papers

The existing 26 records supply every title, author, year, venue, note, and source link. Three collection boxes hold 10, 10, and 6 files; By journal groups exact recorded venues. Each file is selectable with pointer, touch, or keyboard; its identifier and detail appear immediately below its own box. The complete list remains available in a disclosure, open when JavaScript is disabled.

## Source and provenance

Hairline reference checked October 11: https://github.com/lucasmarkes/hairline, revision a221785, version 0.5.0. Riffle is the diagonal tray of cards; Cabinet is a server rack. The actual Riffle tray/card geometry and orthographic projection are vendored under the MIT license; its capacity is changed from eight to ten. The licensed source and rebuild contract are in `hairline/`. Shelf modeling, rotation, catalog integration, captions and data routing are original additions. Anatomy remains a motion reference; no Anatomy code was copied. Shared compiled assets are served locally and content-versioned together.

## Verification

The double-sided studies and file boxes pass at 320, 390, 768, and 1440 pixels: front/reverse selection, keyboard, title simplification, title-only orientation samples, 26 accessible files and journal grouping, no horizontal overflow, JavaScript-disabled paper list, and reduced motion. All 26 actual file click targets and a pointer-drag reversal also pass. Desktop/mobile captures were inspected. The current shelf’s scroll, selection, detail close, and stacked volumes are checked separately. See README for the photo-read restriction and verified temporary-build workaround. Native iPhone Safari and final catalog-wide book typography/artwork remain future checks.
