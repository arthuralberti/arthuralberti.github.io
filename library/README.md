# Library integration

Published route: `/library/`, linked from the homepage's Personal section alongside Favorite Papers. The Hugo page keeps the site's navigation and introductory typography; a same-origin iframe preserves the supplied shelf's own design and native CSS interactions. `/library/books.html` opens the same shelf in a full window.

Source: Arthur's `The_Library_Codex_Handoff_2026-10-11.zip`, provided October 11, 2026. `static/library/books.html` is the byte-preserved `the_library_codex_handoff/index.html` entry point, identical to its Books v6 snapshot. Hugo copies it into `docs/library/books.html`. The archive's history, reconstructed CSV/JSON, reference screenshots, and operational instructions are not public assets. Arthur authorized publishing the current shelf as supplied; the handoff's future roadmap is not part of this integration.

The prototype contains 120 Goodreads-derived books (92 read, 28 to read). Page-based widths, editing/persistence, ownership inventory, and a dedicated desktop composition remain unimplemented. Empty acquisition views do not establish physical ownership. Existing Portuguese labels and review text remain as supplied; the new site introduction is English. Automated browser checks do not certify physical iPhone Safari behavior.

Future edits should target the source HTML, then rebuild Hugo and check shelf selection, second-click detail opening, close, categories, and stacked books on narrow and desktop viewports, including JavaScript-disabled contexts.

## Validation — October 11, 2026

The handoff's static checker passed. The served Hugo integration passed Chromium checks at 320, 375, 390, 430, 768, and 1440 pixels, with JavaScript both disabled and enabled (12 contexts): no horizontal overflow, first selection, second-click opening, close, stacked-book opening, all five categories, and the homepage link. Desktop/mobile shelf and detail screenshots were inspected. Native iPhone Safari remains for Arthur's review.

Run `python library/check-browser.py --base-url http://127.0.0.1:8768` in an environment with Playwright and Chromium after serving `docs/`. Screenshots/results default to `/tmp/library-browser-review`, outside the public build. Shelf SHA-256: `efd65edccbb060d26b2a3a7a24fbddf42f78f406c80dc7f4b0757954c56ee4b3`; source, archive entry, and built asset match.

Hugo built successfully; the site standards audit returned zero errors and two existing warnings (legacy site.Data and a coauthor-affiliation string). The approved public-document synchronization check passed for the saved CV, both papers, and extracted abstracts. The current canonical Benefits copy was used; freshness against the external research-project source was not rechecked because that folder is outside this task's permitted reads. No private handoff exports or application documents were added to the Library build.
