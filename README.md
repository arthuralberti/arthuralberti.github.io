# Arthur Alberti Personal Page

Hugo version of Arthur Alberti's personal academic page, inspired by Gautam
Rao's website.

## Local Preview

```sh
hugo server
```

Then open the local URL printed by Hugo, usually `http://localhost:1313/`.

## Editing

- Main sidebar/header information: `config.toml`
- Bio: `content/sections/aboutme.md`
- Attribution footer: `content/sections/attribution.md`
- Working papers: `data/working_papers/list.yaml`
- Work in progress: `data/work_in_progress/list.yaml`
- CV PDF: `static/pdf/CV_ArthurAlberti.pdf`
- Thesis PDF: `static/pdf/who-benefits-from-benefits.pdf`
- Media as Political Currency PDF: `static/pdf/media-as-political-currency.pdf`
- Profile photo: `content/profile_ArthurAlberti.jpg`

The public CV and working-paper PDFs are generated copies of the canonical
documents under `../0-documents/application/`. Before every build, synchronize
them while keeping their public filenames stable:

```sh
python3 scripts/sync_public_documents.py
hugo --destination docs
python3 scripts/sync_public_documents.py --check
```

After committing and pushing the refreshed `static/` and generated `docs/`
files, the existing public links serve the new versions.

The sync allowlist currently contains only the CV, `Who Benefits from
Benefits?`, and `Media as Political Currency`. Add another document only after
explicit publication approval.

## GitHub Pages

This template builds into `docs/`.

```sh
hugo --destination docs
```

In GitHub, set `Settings -> Pages -> Source` to the main branch and `/docs`.

## Archive

The `archive/` directory contains old prototypes, generated output that is not
used, and template leftovers. It is ignored by git and should not be published.
