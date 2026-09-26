#!/usr/bin/env python3
"""Merge a Goodreads library export into data/books.yaml.

Goodreads no longer issues API keys, but it still exports your library:
My Books -> Import and export -> Export Library. Then run:

    python3 scripts/goodreads_import.py ~/Downloads/goodreads_library_export.csv

Only Goodreads-owned fields (author, isbn, pages, year, status, rating,
finished) are updated. Anything you wrote here (summary, topics, pdfs,
links, cover, started) is kept. Books are matched by ISBN, then by title.
Needs PyYAML (`pip install pyyaml`).
"""
import csv
import sys
from datetime import datetime
from pathlib import Path

import yaml

DATA = Path(__file__).resolve().parent.parent / "data" / "books.yaml"
SHELVES = {"currently-reading": "reading", "read": "read", "to-read": "want"}


def clean_isbn(value):
    # Goodreads wraps ISBNs as ="9780596005900".
    return value.strip().lstrip("=").strip('"')


def from_row(row):
    title = row["Title"].split(" (")[0].strip()
    authors = [row["Author"]] + [a.strip() for a in row.get("Additional Authors", "").split(",") if a.strip()]
    book = {
        "title": title,
        "author": ", ".join(authors),
        "status": SHELVES.get(row.get("Exclusive Shelf", ""), "want"),
    }
    isbn = clean_isbn(row.get("ISBN13", "")) or clean_isbn(row.get("ISBN", ""))
    if isbn:
        book["isbn"] = isbn
    if row.get("Number of Pages"):
        book["pages"] = int(row["Number of Pages"])
    year = row.get("Original Publication Year") or row.get("Year Published")
    if year:
        book["year"] = int(year)
    if row.get("My Rating", "0") not in ("", "0"):
        book["rating"] = int(row["My Rating"])
    if row.get("Date Read"):
        book["finished"] = datetime.strptime(row["Date Read"], "%Y/%m/%d").date().isoformat()
    return book


def main(csv_path):
    header = []
    existing = []
    if DATA.exists():
        text = DATA.read_text()
        header = [line for line in text.splitlines() if line.startswith("#")]
        existing = yaml.safe_load(text) or []

    by_isbn = {str(b.get("isbn")): b for b in existing if b.get("isbn")}
    by_title = {b["title"].lower(): b for b in existing}
    added = updated = 0

    with open(csv_path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            incoming = from_row(row)
            match = by_isbn.get(incoming.get("isbn", "")) or by_title.get(incoming["title"].lower())
            if match:
                match.update(incoming)
                updated += 1
            else:
                existing.append(incoming)
                by_title[incoming["title"].lower()] = incoming
                added += 1

    body = yaml.safe_dump(existing, sort_keys=False, allow_unicode=True, width=88)
    DATA.write_text("\n".join(header) + "\n" + body)
    print(f"{added} added, {updated} updated -> {DATA}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
