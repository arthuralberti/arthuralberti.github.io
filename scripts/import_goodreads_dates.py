#!/usr/bin/env python3
"""Reconcile verified completion dates; retain bibliographic data and stable IDs."""
import argparse
import csv
from datetime import datetime
import json
from pathlib import Path
import unicodedata


MONTHS = ("January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December")

def key(value):
    return ' '.join(unicodedata.normalize('NFKC', value).casefold().split())


def reconcile(catalog, rows):
    dates = {}
    for row in rows:
        raw = row['Date Read'].strip()
        if not raw:
            continue
        date = datetime.strptime(raw.replace('/', '-'), '%Y-%m-%d').date()
        identifier = (key(row['Title']), key(row['Author']))
        if identifier in dates and dates[identifier] != date:
            raise ValueError(f'Conflicting completion dates for {row["Title"]}')
        dates[identifier] = date
    seen = set()
    changed = 0
    for book in catalog['books']:
        identifier = (key(book['title']), key(book['author']))
        if identifier in seen and identifier in dates:
            raise ValueError(f'Ambiguous edition match for {book["title"]}')
        seen.add(identifier)
        if identifier in dates:
            date = dates[identifier]
            if book.get('read_date') and book['read_date'] != date.isoformat():
                raise ValueError(f'Existing date conflicts for {book["title"]}')
            book['read_date'] = date.isoformat()
            book['read_month'] = f'{MONTHS[date.month - 1]} {date.year}'
            changed += 1
    # Python's stable sort keeps undated records in their supplied order.
    catalog['books'].sort(key=lambda book: (not bool(book.get('read_date')), book.get('read_date') or ''))
    return changed, len(dates.keys() - seen)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('csv', type=Path)
    parser.add_argument('--apply', action='store_true', help='Write verified dates and chronological ordering')
    args = parser.parse_args()
    target = Path(__file__).resolve().parents[1] / 'data/books.json'
    catalog = json.loads(target.read_text())
    with args.csv.open(encoding='utf-8-sig', newline='') as file:
        reader = csv.DictReader(file)
        required = {'Title', 'Author', 'Date Read'}
        if not required.issubset(reader.fieldnames or []):
            raise ValueError('Original Goodreads export must contain Title, Author and Date Read')
        matched, unmatched = reconcile(catalog, reader)
    if args.apply:
        target.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    print(f'{matched} completion dates matched; {unmatched} dated export records outside this catalog; ' + ('saved' if args.apply else 'dry run'))


if __name__ == '__main__':
    main()
