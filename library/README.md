# Library integration

The current Library entrance is one fixed Hairline bookcase, without labels, centered in the main content column. Its visible shelf edges rise rightward, like the approved paper folder. One click zooms toward a frontal view and reveals the detailed complete 120-book catalog; a small return arrow restores the entrance. The movable ladder belongs only to this Hairline illustration and supports pointer/touch dragging and keyboard arrows. The internal dark-wood shelves have no ladder and show only book titles on unzoomed spines. Upright book heights vary only between 147 and 152px, with occasional horizontal stacks.

All 120 books are always listed below the illustration using exactly the Papers card stylesheet, shared through `layouts/partials/collection-list-styles.html`. `data/books.json` preserves the supplied titles, authors and 92 ratings; none of the supplied records has a written review or publication year. Null metadata is omitted rather than invented. The template is ready to display verified years and reviews when supplied. No count, explanatory text, journal/category grouping or disclosure was added. The full catalog and book list remain directly available without JavaScript.

Favorite Papers has one folder for all 26 records. The complete list is always visible below it, with title, authors, venue and source link only. File activation scrolls and focuses the corresponding list entry below the fixed mobile identity strip. Enough trailing scroll range is provided to align the final record as well. There is no count, disclosure or duplicate readout. The renderer is `library/objects.ts`, its styles are `static/library/objects.css`, and its public bundle is `static/library/objects.js`. See [attribution and rebuild instructions](hairline/README.md).

Source: Arthur's `The_Library_Codex_Handoff_2026-10-11.zip`, provided October 11, 2026. `static/library/books.html` derives from `the_library_codex_handoff/index.html`; the initial publication preserved its bytes, while Arthur subsequently requested the minimal UI changes described above. Hugo copies the current source into `docs/library/books.html`. The archive's history, reconstructed CSV/JSON, reference screenshots, and operational instructions are not public assets. The original imported HTML remains in Git history and the supplied archive. The handoff's future roadmap is not part of this integration.

The prototype contains 120 Goodreads-derived books (92 read, 28 to read). Page-based widths, editing/persistence, ownership inventory, and a dedicated desktop composition remain unimplemented. Empty acquisition views do not establish physical ownership; their buttons omit misleading zero counts. Interface labels and empty states are English; original edition titles and authors are preserved. Automated browser checks do not certify physical iPhone Safari behavior.

Native radio/CSS selection and fragment-based details remain the book interaction. Opening the catalog selects its All radio state, resets book selection, and returns it to the top. The category controls have been superseded; without JavaScript the complete catalog remains browsable. Stable first/second-click hit targets do not move with the artwork. Hidden view-state radios are removed from the keyboard tab order; book selection and detail links retain native keyboard controls and visible focus.

The iframe URL includes a content-derived SHA-256 version query. GitHub Pages caches assets independently; changing shelf contents therefore changes the iframe URL automatically, preventing a newly loaded outer page from reusing an earlier shelf. The canonical standalone path stays `/library/books.html`.

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
