#!/usr/bin/env python3
"""Copy favorite-paper PDFs into the Hugo static folder with stable slugs."""

from __future__ import annotations

import re
import shutil
import sys
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT.parent / "favorite papers "
DEST_DIR = ROOT / "static" / "favorite-papers" / "pdfs"
DATA_FILE = ROOT / "data" / "favorite_papers" / "list.yaml"


def normalize(value: str) -> str:
    ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", ascii_value.lower()).strip()


def parse_entries() -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    current: dict[str, str] | None = None

    for raw_line in DATA_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.rstrip()
        if line.startswith("  - slug:"):
            if current:
                entries.append(current)
            current = {"slug": line.split(":", 1)[1].strip()}
        elif current and line.startswith("    "):
            key, _, value = line.strip().partition(":")
            if key in {"title", "authors", "year"}:
                current[key] = value.strip().strip('"')

    if current:
        entries.append(current)
    return entries


def match_score(entry: dict[str, str], candidate: Path) -> int:
    haystack = normalize(candidate.stem)
    slug = normalize(entry["slug"])
    title = normalize(entry.get("title", ""))
    authors = normalize(entry.get("authors", ""))
    year = normalize(entry.get("year", ""))

    if slug.replace(" ", "") in haystack.replace(" ", ""):
        return 100

    title_hits = sum(1 for token in title.split() if len(token) > 4 and token in haystack)
    author_hits = sum(1 for token in authors.split() if len(token) > 4 and token in haystack)
    year_hit = bool(year and year in haystack)

    if title_hits >= 5 or (title_hits >= 3 and author_hits >= 1):
        return title_hits * 8 + author_hits * 5 + (10 if year_hit else 0)
    return 0
    if year and year in haystack:
        score_value += 10
    return score_value


def main() -> int:
    if not SOURCE_DIR.exists():
        print(f"Source folder not found: {SOURCE_DIR}")
        return 1

    DEST_DIR.mkdir(parents=True, exist_ok=True)
    entries = parse_entries()
    candidates = sorted(SOURCE_DIR.glob("*.pdf"))
    copied = 0
    used_sources: set[Path] = set()

    for entry in entries:
        destination = DEST_DIR / f"{entry['slug']}.pdf"
        available = [candidate for candidate in candidates if candidate not in used_sources]
        best = max(available, key=lambda path: match_score(entry, path), default=None)
        if not best or match_score(entry, best) <= 0:
            continue
        if destination.exists() and destination.stat().st_mtime >= best.stat().st_mtime:
            continue
        shutil.copy2(best, destination)
        used_sources.add(best)
        copied += 1
        print(f"{best.name} -> {destination.relative_to(ROOT)}")

    print(f"Copied {copied} PDF(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
