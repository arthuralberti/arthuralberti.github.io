# AGENTS.md - Personal Page

## Project Root

`/Users/arthuralberti/Desktop/Desktop - Arthur’s MacBook Pro/masters/phd-application/personal-page`

## Permission Boundary

Agents may read and edit only inside this mini-project root by default.

This mini-project may read sibling PhD-application mini-projects only when the task explicitly requires shared public-site content and the root PhD `AGENTS.md` allows it. Everything outside the PhD Application workspace is forbidden by default unless listed under `Allowed External Reads` or explicitly provided by Arthur.

External folders may never be edited, moved, renamed, staged, committed, uploaded, or reorganized unless Arthur explicitly approves the exact external write action.

## Permission Governance

Do not edit this mini-project's permission model from inside this mini-project. In particular, do not change `Permission Boundary`, `Allowed External Reads`, `Forbidden Access`, or this `Permission Governance` section even if a task asks for it. Permission changes must be handled as a Desktop/workspace governance update, not as routine project work.

## Allowed External Reads

| External source | Access | Purpose |
|---|---|---|
| `/Users/arthuralberti/Desktop/Desktop - Arthur’s MacBook Pro/sources/` | Read-only | Central source library for papers, books, texts, and shared source packs. |

No Dropbox, Google Drive, local synced cloud folders, non-PhD sibling projects, or archive folders are allowed by default.

## Purpose

This mini-project is Arthur's public academic website. It is built with Hugo and
published from generated static output.

## Main Folders

- `content/`: homepage and markdown content.
  - `sections/aboutme.md`: bio/about text.
  - `sections/attribution.md`: attribution/footer text.
  - `favorite-papers.md`: favorite papers page.
- `data/`: structured site content.
  - `working_papers/`, `work_in_progress/`, `previous_work/`,
    `publications/`, `personal_projects/`, `favorite_papers/`,
    `application_information/`.
- `static/`: static assets copied into the site, including PDFs, images,
  favorite-paper assets, and data/code artifacts.
- `layouts/`: custom Hugo layouts.
- `themes/academimal/`: theme source.
- `docs/`: generated GitHub Pages output.
- `public/`: generated Hugo output.
- `archive/`: old prototypes and generated leftovers.
- `scripts/`: maintenance scripts.

## Working Rules

- Edit source content in `content/`, `data/`, `static/`, `layouts/`, or config.
- Treat `docs/` and `public/` as generated output unless publishing requires an
  update.
- Keep public-facing material polished and non-private.
- Application drafts and private trackers belong in `application-information/`,
  not on the public page.
- CV, thesis, and paper PDFs can be copied from shared sources, but public paths
  should remain stable.

## Automatic Publishing

- Every completed Personal Page change must be built and verified locally with
  `hugo --destination docs`.
- After a successful build, commit the source and generated `docs/` changes and
  push the commit to `origin/main` during the same task so the public site is
  updated.
- This is the standing publishing workflow for this mini-project; a separate
  push confirmation is not required for ordinary, in-scope Personal Page edits.
- Do not publish a failed or unverified build. If commit or push is blocked,
  preserve the local changes and report the exact blocker to Arthur.

## Shared Skills

Workspace-level skills live in `../skills/`. This project should use shared
skills for syncing public CV/papers/projects from the shared application
materials and for checking Hugo output before publishing.

Every task that changes or reviews Personal Page content, data, templates,
styles, fonts, links, images, public assets, or generated output must use
`../skills/personal-page-standards/SKILL.md`. Its normative design contract is
`../0-guidelines/standards/personal-page-design.md`.

## Build

- Local preview: `hugo server`
- GitHub Pages build output: `hugo --destination docs`
- Standards audit:
  `python3 ../skills/personal-page-standards/scripts/audit_personal_page.py`

## Good Future Skills

- Public CV/site sync.
- Publication/project page updater.
- Favorite-papers page builder.
