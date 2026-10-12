# Arthur Alberti Personal Page

The [Library](https://arthuralberti.github.io/library/) is linked from Personal and uses the site's page shell, like Favorite Papers. The complete 120-book shelf is rendered inline with ordinary page scrolling and CSS 3D book interaction. The original Books v6 prototype remains in `static/library/books.html`; see [integration and checks](library/README.md).

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

The current canonical source for *Media as Political Currency* is
`../0-documents/application/writing-sample/media-as-political-currency-2026.pdf`;
the public URL remains `/pdf/media-as-political-currency.pdf`.

The synchronization script uses `pdftotext` to extract the `Abstract` section
from the current Benefits and Media PDFs and writes
`data/generated_paper_abstracts.json`. The homepage reads those generated
abstracts through each paper's `abstract_key`; do not maintain duplicate manual
abstracts in `data/working_papers/list.yaml`.

First refresh the selected Benefits manuscript using the source and variant
record in `../0-guidelines/standards/personal-page-design.md`. The current
selection is the short version, stored as
`../0-documents/application/writing-sample/who-benefits-from-benefits-short.pdf`.

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
