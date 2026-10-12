# Library and Favorite Papers verification — October 11, 2026

Historical checkpoint, superseded by [the October 12 verification](verification-2026-10-12.md). The newer user instruction replaces the two-case interface and waives the native Simulator check.

## Scope

Arthur requested wider, full bookcases with correctly ordered surfaces, face-specific plaques, smoother selection and return, varied catalog book heights, a more compact paper folder, and verification in a web browser and an iPhone simulator. His three supplied photographs are the visual references.

## Completed checks

The local build was tested in Chromium desktop (1440px), WebKit desktop (1440px), WebKit with iPhone 13 touch emulation (390px, device scale 3), and Chromium with a narrow touch viewport (320px).

All four configurations passed automatic rotation; twelve angles around the complete pair plus twelve angles around an isolated case; projected SVG bounds; persistent keyboard focus; selection and return; collection opening; all 26 paper records; horizontal overflow; JavaScript error checks; and reduced motion. Touch configurations also passed case selection and all paper selections by tap. Without JavaScript, book selection, detail opening, detail closing and the complete paper fallback list passed in all four configurations.

Desktop and mobile screenshots were inspected, including front/back views, the isolated case, the wood catalog and the selected paper readout. Temporary images are in `/tmp/bookshelf-qa/`. The repeatable suite is `library/check-objects.py`, backed by `library/check-objects.cjs` and local Node Playwright.

The standards audit returned zero errors and one existing warning about affiliations in a legacy coauthor string. Public-document synchronization reports zero drift. `git diff --check` passed.

The build used an additional temporary Hugo mount configuration excluding the unused `static/profile_ArthurAlberti_3.jpeg`, whose file read is denied by macOS. The normal build still encounters this existing permission problem. Existing files were preserved.

## Required outstanding check

The Xcode iPhone 18 Pro simulator with iOS 27.0 is booted. Native visual control is blocked because the host Mac is locked. Actual Simulator Safari touch, horizontal drag, face selection, return, catalog detail animation and paper animation have not been verified. Browser touch emulation is a separate completed check and does not establish Simulator verification.

Publication is deferred until this requested Simulator check is completed. Local source and generated output are preserved.
