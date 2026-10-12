# File tabs, title sizes and reading chronology — October 12, 2026

## Authorized scope

Place each paper's verified publication year on its alternating top tab. Use one title font size, matching the existing Hayek file, and wrap complete titles within the face. Remove blue borders on object clicks in Library and Favorite Papers. Determine why reading months are absent and prepare chronological book ordering from actual Goodreads completion dates.

## Source checks and remaining input

`data/books.json` and the supplied handoff's `data/goodreads-reconstructed-partial.csv` contain no reading dates. The handoff's data README explicitly states that the richer original CSV was supplied in an earlier conversation but dates were lost in intermediate prototypes. The workspace has no original Goodreads export. Current books retain imported catalog order; Papers retain descending publication-year order. Arthur was asked for the original CSV path. No month or chronology was fabricated.

`scripts/import_goodreads_dates.py` matches exact normalized title/primary-author pairs, reads only Date Read for completion chronology, stores ISO dates and English month/year labels, and sorts oldest to newest with undated books stably last. Dry run is the default. Conflicting dates/ambiguous editions fail without writing. Synthetic verification checks chronology, month rendering, ID/rating preservation and conflict rejection. The importer is prepared, but actual dates and reading order cannot be applied before the original CSV is provided.

## Design comparison

The mandatory live reread of https://x.com/andrestaltz/status/2107507231864357323 returned HTTP 403 on October 12. The live post could not be reread; no Claude Design or Mobbin use is claimed. Comparison uses Arthur's approved Hairline file model and requested Hayek typography, preserving the folder geometry and current site shell. Top-tab labels follow the same card plane, title sizes stay at 6 world units, and title wrapping uses actual Montserrat text measurement. Moving the year to the tab removes duplicate face metadata. Title margins preserve the prior upper inset. Mouse/touch focus borders are removed; keyboard file selection remains operational.

## Verification

Desktop/mobile Chromium checks cover all 26 tab years, identical title size, complete title bounds, real clicks without object outlines, and ladder focus without blue stroke. The existing regression suite covers geometry, gestures, paper anchors, book opening/return, reduced motion and no-JavaScript use. Final desktop/mobile object captures are inspected outside the public repository. Hugo, public-PDF synchronization, standards audit and Git whitespace checks precede publication. Original dates remain pending; native physical iPhone testing remains outside this revision.

Final result: Chromium desktop, WebKit desktop, WebKit iPhone emulation and 320px Chromium touch all passed the existing regression suite. Focused checks also confirm 26 tab years, common title size, all title bounds and click outlines. Hugo and PDF synchronization pass; the standards audit has zero errors and the existing coauthor-affiliation warning. Actual Goodreads completion dates remain pending Arthur’s original export.
