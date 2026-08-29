#!/usr/bin/env python3
"""Sync approved public PDFs from the canonical application documents."""

from __future__ import annotations

import argparse
import hashlib
import shutil
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
        / "media-as-political-currency.pdf",
        SITE_ROOT / "static" / "pdf" / "media-as-political-currency.pdf",
    ),
    (
        "Who Benefits from Benefits?",
        WORKSPACE_ROOT
        / "0-documents"
        / "application"
        / "writing-sample"
        / "masters-thesis-who-benefits-from-benefits.pdf",
        SITE_ROOT / "static" / "pdf" / "who-benefits-from-benefits.pdf",
    ),
)


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

    return 1 if args.check and drifted else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (FileNotFoundError, ValueError, RuntimeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
