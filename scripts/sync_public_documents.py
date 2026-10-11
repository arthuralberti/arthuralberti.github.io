#!/usr/bin/env python3
"""Sync approved public PDFs from the canonical application documents."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = SITE_ROOT.parent

PUBLIC_DOCUMENTS = (
    (
        "Curriculum vitae",
        WORKSPACE_ROOT
        / "0-documents"
        / "application"
        / "curriculum-vitae"
        / "curriculum-vitae.pdf",
        SITE_ROOT / "static" / "pdf" / "CV_ArthurAlberti.pdf",
    ),
    (
        "Media as Political Currency",
        WORKSPACE_ROOT
        / "0-documents"
        / "application"
        / "writing-sample"
        / "media-as-political-currency-2026.pdf",
        SITE_ROOT / "static" / "pdf" / "media-as-political-currency.pdf",
    ),
    (
        "Who Benefits from Benefits?",
        WORKSPACE_ROOT
        / "0-documents"
        / "application"
        / "writing-sample"
        / "who-benefits-from-benefits-short.pdf",
        SITE_ROOT / "static" / "pdf" / "who-benefits-from-benefits.pdf",
    ),
)

GENERATED_ABSTRACTS = SITE_ROOT / "data" / "generated_paper_abstracts.json"
ABSTRACT_DOCUMENTS = {
    "who-benefits-from-benefits": WORKSPACE_ROOT
    / "0-documents"
    / "application"
    / "writing-sample"
    / "who-benefits-from-benefits-short.pdf",
    "media-as-political-currency": WORKSPACE_ROOT
    / "0-documents"
    / "application"
    / "writing-sample"
    / "media-as-political-currency-2026.pdf",
}


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def validate_pdf(path: Path) -> None:
    if not path.is_file():
        raise FileNotFoundError(f"Missing canonical PDF: {path}")
    if path.stat().st_size == 0:
        raise ValueError(f"Canonical PDF is empty: {path}")
    with path.open("rb") as stream:
        if stream.read(5) != b"%PDF-":
            raise ValueError(f"Canonical file is not a PDF: {path}")


def extract_abstract(path: Path) -> str:
    """Extract and normalize the Abstract section from the opening PDF pages."""
    try:
        result = subprocess.run(
            [
                "pdftotext",
                "-f",
                "1",
                "-l",
                "3",
                "-layout",
                str(path),
                "-",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError as error:
        raise RuntimeError(
            "pdftotext is required to synchronize paper abstracts."
        ) from error
    except subprocess.CalledProcessError as error:
        raise RuntimeError(f"Could not extract text from {path}") from error

    match = re.search(
        r"(?ms)^\s*Abstract\s*$\n(?P<body>.*?)(?=^\s*Keywords\s*:)",
        result.stdout,
    )
    if not match:
        raise ValueError(f"Could not locate Abstract and Keywords in {path}")

    abstract = match.group("body")
    abstract = re.sub(r"(?<=\w)-\s*\n\s*(?=\w)", "", abstract)
    abstract = " ".join(abstract.split())
    for ligature, replacement in {
        "ﬀ": "ff",
        "ﬁ": "fi",
        "ﬂ": "fl",
        "ﬃ": "ffi",
        "ﬄ": "ffl",
    }.items():
        abstract = abstract.replace(ligature, replacement)

    if len(abstract) < 100:
        raise ValueError(f"Extracted abstract is unexpectedly short: {path}")
    return abstract


def render_abstract_data() -> str:
    data = {}
    for key, source in ABSTRACT_DOCUMENTS.items():
        validate_pdf(source)
        data[key] = {
            "source_filename": source.name,
            "source_sha256": digest(source),
            "abstract": extract_abstract(source),
        }
    return json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Report drift without copying files.",
    )
    args = parser.parse_args()

    drifted = False
    for label, source, destination in PUBLIC_DOCUMENTS:
        validate_pdf(source)
        in_sync = destination.is_file() and digest(source) == digest(destination)
        if in_sync:
            print(f"OK: {label}")
            continue

        drifted = True
        if args.check:
            print(f"DRIFT: {label}")
            continue

        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        if digest(source) != digest(destination):
            raise RuntimeError(f"Copy verification failed: {destination}")
        print(f"SYNCED: {label}")

    rendered_abstracts = render_abstract_data()
    abstracts_in_sync = (
        GENERATED_ABSTRACTS.is_file()
        and GENERATED_ABSTRACTS.read_text(encoding="utf-8") == rendered_abstracts
    )
    if abstracts_in_sync:
        print("OK: Paper abstracts")
    elif args.check:
        print("DRIFT: Paper abstracts")
        drifted = True
    else:
        GENERATED_ABSTRACTS.parent.mkdir(parents=True, exist_ok=True)
        GENERATED_ABSTRACTS.write_text(rendered_abstracts, encoding="utf-8")
        print("SYNCED: Paper abstracts")

    return 1 if args.check and drifted else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (FileNotFoundError, ValueError, RuntimeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
