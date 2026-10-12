# Collection integration

## Current: Favorite Papers only — October 12, 2026

Arthur requested removal of Library from the site. Its Personal subsection,
sidebar entry, pages, and exclusive deployed assets are removed. Favorite
Papers retains all 26 records, its file cabinet, and its existing shared
`static/library/objects.js` and `objects.css` assets without changes.
The room model sources, catalog data, and prior verification notes below are
historical development records; they are not active pages or published assets.

## Historical: architectural room — October 12, 2026

The room is now a dimensioned 3D model with a fixed orthographic camera. This
supersedes the SVG sketch, search, zoom, panning and Open book controls below.
The title/author readout lives above the room. Pointer hover pulls a book along
its shelf normal; clicking opens the existing details dialog. Touch selects a
book, and a second tap opens it. Arrow keys browse, Enter opens and Escape closes.
The complete server-rendered list remains available below the drawing.

Canonical sources are in `library/room3d/`:

- `model.js`: centimetre dimensions, wall/island routes, shelf bays and catalog
  placement; geometry and checks share the same coordinates.
- `geometry.js`: solid slabs, curved caps, dividers, lounge-chair components,
  furniture and botanically structured Ficus/Monstera illustrations.
- `main.js`: layer assembly, fixed camera, depth-tested picking, readout and dialog.
- `check-model.js`: dimensional, oriented-box collision and floor-bound checks.
- `package.json` / lockfile: pinned Three.js and esbuild development dependencies.

Build from `library/room3d` with `npm ci --ignore-scripts` and `npm run build`.
The result is bundled locally into `static/library/room.js`. No CDN, remote
runtime or account is needed. The public Three.js MIT license is at
`static/library/THREE-LICENSE.txt`. `room.css` provides restrained readout/dialog
motion and reduced-motion behavior. The module draws only on resize or deliberate
selection; no idle animation. Offscreen motion stops.

The floor footprint ends at the shelving wing endpoints. The curved wall cap
is a continuous solid. Each of the 120 real catalog records has the same book
bounding dimensions, fitted into a measured niche with clearance from the back,
next shelf and dividers. No fictitious books or new bibliographic metadata were
introduced. The stylized Eames-inspired model uses independently modeled shells,
padded cushions, piping, arm supports, pedestal and ottoman; it is not an official
manufacturer CAD asset. Plants use modeled stems, curved blades, midribs and
Monstera splits/fenestrations. The room palette is grayscale.

The original dates and physical ownership inventory remain unverified. Placement
does not assign reading/purchase status or certify a 1,000-book capacity. The
existing Goodreads importer remains the path for verified reading dates.

Run `node library/room3d/check-model.js`, then `node library/check-room3d.cjs` with
Playwright available and docs served at `ROOM_BASE_URL` (default localhost:8770).
Browser artifacts stay in `/tmp/library-room3d-review`. The old entrance and SVG
checks remain historical. No-JavaScript users retain the complete list; browsers
without WebGL also see `room-preview.webp`, a still of this exact model.

Design sources: [Hairline](https://github.com/lucasmarkes/hairline),
[Anatomy](https://github.com/wheresryan22/anatomy),
[Transitions.dev](https://transitions.dev/),
[Herman Miller product sheet](https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/eames_lounge_chair_and_ottoman_product_sheet.pdf),
and [RHS Monstera profile](https://www.rhs.org.uk/plants/11192/monstera-deliciosa-f/details).
Transitions.dev informs restrained text changes and dialog motion; no Pro code
or animation agent was acquired. Papers retains its existing Hairline module.

## Historical implementations


The October 12 gesture correction gives the Hairline ladder its full useful travel and renders its motion as a separate affine SVG layer, throttled to animation frames. The stationary cabinet is not rebuilt during dragging. Pointer release, cancellation, capture loss, window blur and viewport changes end the gesture; vertical touch panning remains enabled on the ladder itself. Favorite Papers prints the highlighted file's full title in its projected face at a common 6-world-unit size, wrapping by measured width; the publication year is always printed in the alternating top tab. Object clicks have no blue focus border or touch highlight. Keyboard navigation still selects the file and its title.

Book cards and the reading area support a verified `read_month` display value (English month and year). The available imported HTML/JSON has no reading dates; the original CSV/ZIP was not found among available workspace sources. No date is reconstructed from ratings or publication years. Populate only from Arthur's original CSV once its location is supplied. Current book order is the supplied catalog order, not verified reading chronology. Run `python3 scripts/import_goodreads_dates.py /authorized/path/goodreads_export.csv` to preview exact title/author matches, then `--apply` to save verified `read_date` and English `read_month` fields and stably order by completion date ascending. Undated records stay last in their supplied relative order. Ambiguous or conflicting dates stop the import; no bibliographic fields or IDs are replaced. The private CSV is never copied into the public site.

The current Library entrance is one fixed Hairline bookcase, without labels, centered in the main content column. Its visible shelf edges rise rightward, like the approved paper folder. The external side is a continuous solid wall that masks the interior book geometry. The round ladder handle and protruding support feet have been removed. The ladder is dragged directly by its rails/rungs and retains keyboard controls. One click zooms toward a frontal view and reveals the complete detailed catalog; a small return arrow restores the entrance.

The detailed catalog is rendered directly into the page through `layouts/partials/realistic-bookshelf.html` and `book-volume.html`. All 120 volumes appear across eight wooden bays: 96 upright and 24 in horizontal stacks. There is no iframe, fixed-height viewport or independent scrolling; the whole cabinet follows ordinary document scrolling. Wood grain is original SVG; original supplied cloth/foil palettes are preserved in `data/books.json`. Slight height variation (147–152px), rounded binding edges, recessed backs and directional shading suggest physical materials. Stable frontal spines avoid WebKit culling an exactly edge-on 3D element; true CSS 3D volumes are used for the selected book's flight, cover hinge and return. No ambient animation or internal ladder.

One activation takes a volume from its slot and opens an inline reading area after that bay. The cover turns and opens, with title, author and supplied metadata alongside. Closing folds the cover and returns it to the same slot. Rapid selection cancels previous flights, resizing cleans up transient artwork, and reduced motion skips the flight and transitions. The reading area also remains in normal page flow.

All 120 books are always listed below the illustration using exactly the Papers card stylesheet, shared through `layouts/partials/collection-list-styles.html`. `data/books.json` preserves the supplied titles, authors and 92 ratings; none of the supplied records has a written review or publication year. Null metadata is omitted rather than invented. The template supports verified years and reviews when supplied. Without JavaScript, all shelf volumes remain visible and link to their corresponding list records. No count, explanatory text, category grouping or disclosure was added.

Favorite Papers has one folder for all 26 records. The complete list is always visible below it, with title, authors, venue and source link only. File activation scrolls and focuses the corresponding list entry below the fixed mobile identity strip. Enough trailing scroll range is provided to align the final record as well. There is no count, disclosure or duplicate readout. The renderer is `library/objects.ts`, its styles are `static/library/objects.css`, and its public bundle is `static/library/objects.js`. See [attribution and rebuild instructions](hairline/README.md).

Source: Arthur's `The_Library_Codex_Handoff_2026-10-11.zip`, provided October 11, 2026. `static/library/books.html` derives from `the_library_codex_handoff/index.html`; the initial publication preserved its bytes, while Arthur subsequently requested the minimal UI changes described above. Hugo copies the current source into `docs/library/books.html`. The archive's history, reconstructed CSV/JSON, reference screenshots, and operational instructions are not public assets. The original imported HTML remains in Git history and the supplied archive. The handoff's future roadmap is not part of this integration.

The prototype contains 120 Goodreads-derived books (92 read, 28 to read). Page-based widths, editing/persistence, ownership inventory, and a dedicated desktop composition remain unimplemented. Empty acquisition views do not establish physical ownership; their buttons omit misleading zero counts. Interface labels and empty states are English; original edition titles and authors are preserved. Automated browser checks do not certify physical iPhone Safari behavior.

The earlier radio/CSS standalone catalog at `static/library/books.html` is preserved in place, but the current `/library/` page no longer embeds it. That original HTML remains a historical palette and bibliographic source. Current rendering uses `data/books.json`, the two shelf partials and the local `realistic.css`/`realistic.js` assets. Stylesheet and script URLs are versioned with content-derived SHA-256 queries.

## Motion references — checked October 11, 2026

[Anatomy](https://github.com/wheresryan22/anatomy) uses articulated objects and calm physical movement; [Hairline](https://github.com/lucasmarkes/hairline), particularly Riffle, uses a selected object with subtle neighboring responses. Our original CSS adapts those ideas as slower eased pulls, small neighboring book tilts, and a restrained cover rotation when details open. Reduced-motion preference removes transitions and cover animation. The earlier shelf motion was original CSS. The subsequent file-box implementation vendors Hairline’s MIT geometry with full license attribution; see `hairline/README.md`. Book-cover standardization and broader artwork redesign remain future work.

Future edits should target the source HTML, then rebuild Hugo and check shelf selection, second-click detail opening, close, categories, and stacked books on narrow and desktop viewports, including JavaScript-disabled contexts.

## Initial publication validation — October 11, 2026

The handoff's static checker passed. The served Hugo integration passed Chromium checks at 320, 375, 390, 430, 768, and 1440 pixels, with JavaScript both disabled and enabled (12 contexts): no horizontal overflow, first selection, second-click opening, close, stacked-book opening, all five categories, and the homepage link. Desktop/mobile shelf and detail screenshots were inspected. Native iPhone Safari remains for Arthur's review.

Run `python library/check-browser.py --base-url http://127.0.0.1:8768` in an environment with Playwright and Chromium after serving `docs/`. Screenshots/results default to `/tmp/library-browser-review`, outside the public build. Shelf SHA-256: `efd65edccbb060d26b2a3a7a24fbddf42f78f406c80dc7f4b0757954c56ee4b3`; source, archive entry, and built asset match.

Hugo built successfully; the site standards audit returned zero errors and two existing warnings (legacy site.Data and a coauthor-affiliation string). The approved public-document synchronization check passed for the saved CV, both papers, and extracted abstracts. The current canonical Benefits copy was used; freshness against the external research-project source was not rechecked because that folder is outside this task's permitted reads. No private handoff exports or application documents were added to the Library build.

## Minimal shelf update validation — October 11, 2026

The revised integration passed the same six viewport widths with and without JavaScript. Enabled-script contexts exercise all five external category buttons; disabled-script contexts exercise native selection, details, close, and stacked books on the default Read shelf. Checks confirm white background, hidden scrollbars, real vertical scroll range, no horizontal overflow, removed internal chrome, 120 detail records, and the homepage route. Additional mobile/desktop checks confirm keyboard selection/open/close, unchanged hitbox geometry, and cover animation enabled normally but disabled with reduced motion. All 120 edition titles and authors are unchanged. The final shelf/detail screenshots were reviewed; physical iPhone Safari remains unverified.


## Rotating selectors and file boxes — October 11, 2026

The first five selector drawings are preserved in Git history and superseded by the double-sided model at Arthur’s request. Main titles replace long subtitles in the book pilot; underlying bibliographic records are unchanged. The public module includes the upstream MIT license, is versioned together with its CSS, and requires no runtime CDN. New selector tests cover four widths, keyboard, reverse faces, actual pointer dragging, 26 file clicks, journal grouping, and reduced motion. The existing shelf remains checked with and without JavaScript.

Hugo’s direct build encountered `operation not permitted` when reading the existing `static/profile_ArthurAlberti_3.jpeg`. The successful build used a temporary copy of the current site sources, recovering only that unchanged photo from its Git blob and verifying it matches the existing generated photo byte-for-byte. No source photo was overwritten. Approved public-document synchronization still passes. Benefits freshness against its external research-project folder remains outside the task’s permitted reads. Physical iPhone Safari and the final full-catalog book model remain unverified.

Historical October 11 revision: the preceding two-case, rotating entrance was superseded by the fixed single-case design above.

## Animation regression checks

`python3 library/check-objects.py` runs the Node Playwright suite. Install Playwright and its Chromium/WebKit browsers, or point `NODE_PATH` and `PLAYWRIGHT_BROWSERS_PATH` to an existing runtime. Options: `--base-url` and `--artifacts`.

The suite checks desktop Chromium and WebKit, WebKit with iPhone touch emulation, and a 320px touch viewport. It checks the stationary entrance, bounded zoom, Hairline ladder keyboard/mouse/touch movement, content-column centering, titles-only internal spines and all 120 book cards, book opening and closing, slight height variation and horizontal stacks, the always-visible list, all 26 file-to-article destinations, mobile header clearance, reduced motion, no-JavaScript fallbacks and overflow. Screenshots stay outside the public build. Browser emulation does not certify native iOS Simulator or physical iPhone behavior; Arthur explicitly waived the native Simulator check for this revision.

The normal `hugo --destination docs` build excludes the unused legacy `static/profile_ArthurAlberti_3.jpeg`, which cannot be read on this host. The file is preserved in place and no current site reference uses it.

## Design review before publication

Every completed version must reread [André Staltz’s reference post](https://x.com/andrestaltz/status/2107507231864357323), compare desktop/mobile renders against Arthur's approved examples, adjust and reverify before push. The normative gate lives in `../0-guidelines/standards/personal-page-design.md` at workspace level and is linked from this project's AGENTS.md. Review evidence for this version is recorded in `verification-2026-10-12-books.md`.
