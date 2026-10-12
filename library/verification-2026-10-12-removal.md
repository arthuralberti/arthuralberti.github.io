# Library removal — October 12, 2026

Arthur requested removing Library from Personal and retaining Favorite Papers.
Removed the Library subsection, sidebar link, content pages, layouts and exclusive
static/generated artifacts. RSS and sitemap no longer contain Library routes.
The shared `library/objects.js` and `objects.css` URLs remain for Favorite Papers.

## Verification

- Hugo build and approved public-document synchronization passed with zero drift.
- Standards audit: zero errors; one existing coauthor-affiliation warning.
- `git diff --check` passed.
- Favorite Papers data, template, renderer source and shared static/build assets
  are byte-unchanged; its generated HTML only loses the Library sidebar link.
- Chromium desktop, WebKit desktop and WebKit iPhone 13 emulation passed:
  no Library navigation, 26 file targets and articles, mouse/touch activation,
  keyboard activation, final-article scroll alignment, no horizontal overflow,
  and no JavaScript errors. Removed index/prototype/room files return local 404.
- Browser artifacts: `/tmp/library-removal-review/`. The test waits for fonts
  and animated scrolling to finish before measuring article alignment.

## Design comparison

Reopened the required André Staltz reference
<https://x.com/andrestaltz/status/2107507231864357323>; the live tool returned
403 Forbidden, so its text was not reread. Compared desktop/mobile screenshots
against the approved academic page and Favorite Papers design: existing spacing,
type roles, cabinet, list and file-to-article behavior remain intact. The removed
subsection leaves no empty separator or placeholder. No Papers design changes
were needed. Mobile verification is emulated, not physical-device certification.

The saved canonical Benefits manuscript synchronized successfully; freshness
against its external research-project source was not checked because that source
is outside the permitted reads for this task.
