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
- Previous work: `data/previous_work/list.yaml`
- CV PDF: `static/pdf/CV_ArthurAlberti.pdf`
- Thesis PDF: `static/pdf/who-benefits-from-benefits.pdf`
- Undergraduate thesis PDF: `static/pdf/undergraduate-thesis_ArthurAlberti.pdf`
- Profile photo: `content/profile_ArthurAlberti.jpg`

To update the public CV or paper later, replace the file at the same path and
keep the filename unchanged. After committing and pushing to GitHub, the public
link updates automatically.

If `Media as Political Currency` gets a public PDF, add it to `static/pdf/` and
then add `pdflink` or a `links` entry in `data/working_papers/list.yaml`.

## GitHub Pages

This template builds into `docs/`.

```sh
hugo --destination docs
```

In GitHub, set `Settings -> Pages -> Source` to the main branch and `/docs`.

## Archive

The `archive/` directory contains old prototypes, generated output that is not
used, and template leftovers. It is ignored by git and should not be published.
