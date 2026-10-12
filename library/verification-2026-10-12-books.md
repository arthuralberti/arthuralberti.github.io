# Books revision — October 12, 2026

## Required pre-push design review

Reread [André Staltz's post](https://x.com/andrestaltz/status/2107507231864357323) live in the in-app browser after implementation and before publication. The post advocates comparing against strong examples, applying judgment and simplifying the interface. Claude Design and Mobbin were not used.

Compared the desktop and iPhone-emulated renders with Arthur's approved Favorite Papers screenshot and supplied library photographs. Changes from that comparison:

- Enlarged and centered the entrance within the content column, accounting for the desktop sidebar.
- Reversed the bookcase camera to match the folder's apparent rising-right diagonal; the illustration remains stationary.
- Reused the approved Papers card stylesheet, with all 120 books always listed below the illustration. Removed the Library introductory sentence.
- Kept the manually movable ladder exclusively in Hairline. Corrected the transformation so rails and rungs move together; dragging does not open the catalog.
- Added restrained horizontal stacks to the Hairline drawing and preserved the detailed shelf's upright and stacked volumes, with only slight height variation.
- Removed authors from unzoomed spines while retaining them in details and the list.

Inspected desktop and mobile entrance/list and detailed-shelf screenshots after the adjustments. No count, instructions, category selector or disclosure was introduced. The approved Papers list markup and stylesheet declarations were compared against the previous commit and remain unchanged.

## Content provenance

`data/books.json` extracts only already-public titles, authors and ratings from the supplied catalog. All 120 titles/authors match both the original detail records and generated list. There are 92 supplied ratings, no written reviews and no publication years. Missing metadata is null and omitted in the UI. Years are not inferred from reading dates or guessed editions; reviews are not invented. The template supports verified publication years and supplied reviews when available.

## Verification

The browser suite covers desktop Chromium, desktop WebKit, WebKit with iPhone 13 touch emulation and Chromium at 320px with touch. It verifies content-column centering, a fixed entrance, bounded zoom, Hairline ladder keyboard/pointer movement and real touch dragging in Chromium, return behavior, 120 visible book cards, 92 ratings, title-only internal spines, no internal ladder, book details, horizontal stacks and slight height variation. It preserves the existing checks for all 26 paper anchors, fixed-header clearance, reduced motion, no-JavaScript fallback and overflow.

The Hugo build and approved-document synchronization checks pass. The standards audit has zero errors and one existing warning about affiliations in a coauthor string. Arthur waived native iOS Simulator testing; browser emulation does not certify physical iPhone behavior. Freshness against the external Benefits research-project source remains unverified because that folder is outside the task's permitted reads; the allowlisted canonical workspace/public copies match.

## Optional next design study

Arthur proposed an Anatomy-inspired opening into partitions: journals for papers and categories for books. [Anatomy's upstream README](https://github.com/wheresryan22/anatomy), checked October 12, describes interactive isometric objects and an exploded assembly example. A suitable future interpretation is a short, reversible, click-triggered separation of the existing object into compartments, preserving the complete list and keeping idle motion disabled. Journals already have source metadata; book categories require an explicit taxonomy and verified assignments. This version does not introduce partitions or change the approved Papers interaction.
