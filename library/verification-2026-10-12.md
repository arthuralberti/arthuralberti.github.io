# Library and Favorite Papers verification — October 12, 2026

## Delivered behavior

One stationary 45-degree bookcase without labels replaces the earlier two rotating cases. A single activation performs a zoom toward the frontal catalog. The complete catalog has dark wood, upright books with slight height variation (147–152px), horizontal stacks and a manually movable ladder. The ladder allows book clicks to pass through, and hides while book details are open.

The single paper folder has no count or disclosure. All 26 existing entries stay visible. Activation focuses and aligns the corresponding entry below the responsive fixed identity strip, including the final entry. The list retains only titles, authors, venues and source links.

## Verified

`library/check-objects.py` passed in desktop Chromium and WebKit at 1440px, WebKit with iPhone 13 touch emulation at 390px, and Chromium with a 320px mobile touch viewport. Checks cover fixed orientation, no plaques, projected bounds throughout zoom, complete catalog opening, return, ladder keyboard stops and mouse drag, book detail opening and closing, ladder hiding in details, subtle book heights, stacked books, all 26 anchor destinations, exact header clearance, URL fragments and focus, overflow, reduced motion and no-JavaScript defaults. Chromium mobile also passed a real browser touch-event drag through CDP. Screenshots were inspected for desktop and mobile.

The standards audit passed with zero errors and one existing warning about an affiliation in a legacy coauthor string. `git diff --check` passed. Public-document synchronization reports zero drift. The normal `hugo --destination docs` build succeeds. Its static mount excludes the unused unreadable legacy profile image without deleting that file.

The iOS Simulator check requiring an unlocked host was explicitly waived by Arthur. No native Simulator or physical iPhone result is claimed.

Reference photos are used only in the conversation comparison, not copied into the public site. Existing public book and paper records remain intact.
