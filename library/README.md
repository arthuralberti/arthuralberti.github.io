# Library integration

Published route: `/library/`, linked from the homepage's Personal section alongside Favorite Papers. The Hugo page keeps the site's navigation and introductory typography; its category buttons use the Contact button format, outside a same-origin shelf iframe. The frame is vertically scrollable with hidden scrollbars and a white background. The inner shelf has no header, instructions, category navigation, or footer.

Source: Arthur's `The_Library_Codex_Handoff_2026-10-11.zip`, provided October 11, 2026. `static/library/books.html` derives from `the_library_codex_handoff/index.html`; the initial publication preserved its bytes, while Arthur subsequently requested the minimal UI changes described above. Hugo copies the current source into `docs/library/books.html`. The archive's history, reconstructed CSV/JSON, reference screenshots, and operational instructions are not public assets. The original imported HTML remains in Git history and the supplied archive. The handoff's future roadmap is not part of this integration.

The prototype contains 120 Goodreads-derived books (92 read, 28 to read). Page-based widths, editing/persistence, ownership inventory, and a dedicated desktop composition remain unimplemented. Empty acquisition views do not establish physical ownership; their buttons omit misleading zero counts. Interface labels and empty states are English; original edition titles and authors are preserved. Automated browser checks do not certify physical iPhone Safari behavior.

Native radio/CSS selection and fragment-based details remain the book interaction. External filters set the iframe's radio state, reset book selection, and return it to the top. Without JavaScript, those external controls are hidden and the default Read shelf remains browsable. Stable first/second-click hit targets do not move with the artwork. Hidden view-state radios are removed from the keyboard tab order; book selection and detail links retain native keyboard controls and visible focus.

The iframe URL includes a content-derived SHA-256 version query. GitHub Pages caches assets independently; changing shelf contents therefore changes the iframe URL automatically, preventing a newly loaded outer page from reusing an earlier shelf. The canonical standalone path stays `/library/books.html`.

## Motion references — checked October 11, 2026

[Anatomy](https://github.com/wheresryan22/anatomy) uses articulated objects and calm physical movement; [Hairline](https://github.com/lucasmarkes/hairline), particularly Riffle, uses a selected object with subtle neighboring responses. Our original CSS adapts those ideas as slower eased pulls, small neighboring book tilts, and a restrained cover rotation when details open. Reduced-motion preference removes transitions and cover animation. Neither package nor skill was installed, and no repository code or assets were copied. Book-cover standardization and broader artwork redesign remain future work.

Future edits should target the source HTML, then rebuild Hugo and check shelf selection, second-click detail opening, close, categories, and stacked books on narrow and desktop viewports, including JavaScript-disabled contexts.

## Initial publication validation — October 11, 2026

The handoff's static checker passed. The served Hugo integration passed Chromium checks at 320, 375, 390, 430, 768, and 1440 pixels, with JavaScript both disabled and enabled (12 contexts): no horizontal overflow, first selection, second-click opening, close, stacked-book opening, all five categories, and the homepage link. Desktop/mobile shelf and detail screenshots were inspected. Native iPhone Safari remains for Arthur's review.

Run `python library/check-browser.py --base-url http://127.0.0.1:8768` in an environment with Playwright and Chromium after serving `docs/`. Screenshots/results default to `/tmp/library-browser-review`, outside the public build. Shelf SHA-256: `efd65edccbb060d26b2a3a7a24fbddf42f78f406c80dc7f4b0757954c56ee4b3`; source, archive entry, and built asset match.

Hugo built successfully; the site standards audit returned zero errors and two existing warnings (legacy site.Data and a coauthor-affiliation string). The approved public-document synchronization check passed for the saved CV, both papers, and extracted abstracts. The current canonical Benefits copy was used; freshness against the external research-project source was not rechecked because that folder is outside this task's permitted reads. No private handoff exports or application documents were added to the Library build.

## Minimal shelf update validation — October 11, 2026

The revised integration passed the same six viewport widths with and without JavaScript. Enabled-script contexts exercise all five external category buttons; disabled-script contexts exercise native selection, details, close, and stacked books on the default Read shelf. Checks confirm white background, hidden scrollbars, real vertical scroll range, no horizontal overflow, removed internal chrome, 120 detail records, and the homepage route. Additional mobile/desktop checks confirm keyboard selection/open/close, unchanged hitbox geometry, and cover animation enabled normally but disabled with reduced motion. All 120 edition titles and authors are unchanged. The final shelf/detail screenshots were reviewed; physical iPhone Safari remains unverified.
