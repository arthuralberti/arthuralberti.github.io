# Library design study — October 11, 2026

Arthur requested alternative object-based category selectors inspired by Hairline and Anatomy, plus a consistent, more realistic book model without fabric texture. The comparison lives at `/library/design-study/`; the current `/library/` page and shelf asset are preserved. No concept is selected as the final product.

## Five selector concepts

1. Wall library: six stacked compartments in one architectural object.
2. Reading cabinet: six compartments in a two-column cabinet.
3. Floating shelves: six open plates on two supporting uprights.
4. Stepped library: three ascending pairs of compartments, forming a staircase.
5. Archive trays: six staggered shallow trays with flat volumes, shown as an exploded perspective stack.

Each has six labeled categories: Read, Reading, To read, Owned, Wishlist, All. Hover/focus reveals a name; clicking, touching, Enter, or Space selects it and displays the sample below. Reading/ownership/wishlist have no fabricated records. The six sample titles, primary authors, reading flags, and colors are taken from the current public catalog; the sample is not the complete collection.

## Shared book contract

- Spine object: 26 × 184 CSS pixels, identical for every sample. Horizontal layout uses the same element rotated +90 degrees inside a 184 × 26 container, without rescaling.
- Cover proportion: 2:3, consistent for all samples. Artwork occupies y=7–51%; title y=54–82%; author y=84–96%. Common left/right margins are 14%/10% to accommodate the binding.
- Smooth solid color with restrained lighting, hinge, page edge, and shadow; no repeating grain, noise, or fabric texture.
- All covers use the same title font size within each viewport and the same author font size; fitting uses the most demanding sample rather than separate per-book typography. The long Quantum title is included deliberately. Show layout guides reveals fixed boundaries.
- Spine uses the main title before a colon and the author's surname. Full titles and authors remain on covers and accessible tooltips; bibliographic records are not changed.
- The six original line illustrations are design samples, not approved final book artwork or reproductions of commercial editions.

References checked October 11: [Hairline](https://github.com/lucasmarkes/hairline) (object-based pointer/focus responses), [Anatomy](https://github.com/wheresryan22/anatomy) (articulated physical objects and calm movement). These are design inspirations; their packages, skills, code, and assets were not installed or copied. The selector is original SVG/CSS/JavaScript. Reduced motion removes transitions. The final full-catalog model and category taxonomy remain decisions for Arthur after comparing the studies.

## Validation

Browser checks passed at 320, 390, 768, and 1440 pixels: all 30 concept/category selections per viewport, correct sample filtering and unknown-state messages, keyboard selection, no horizontal overflow, identical title sizes, no overflowing cover titles, and rotated spine bounds of 184 × 26 compared with upright 26 × 184. All 30 pointer targets also passed at 390 pixels; moving SVG artwork does not intercept the fixed hit areas. Desktop/mobile figures and cover-grid screenshots were inspected. Hugo built successfully; the shared site audit returned zero errors and its two existing warnings. The current Library now links prominently to this comparison; the bookshelf source is unchanged. Real device testing and final catalog-wide typography/artwork remain future validation.
