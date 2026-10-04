#!/usr/bin/env python3
"""Merge my Letterboxd ratings and reviews into data/films.yaml, and sync
my watchlist into data/watchlist.yaml.

The public RSS feed has the latest ~50 diary entries, with posters:

    python3 scripts/letterboxd_import.py

For the full history, add the data export (Settings -> Import & Export ->
Export your data), as the .zip or its unzipped folder:

    python3 scripts/letterboxd_import.py ~/Downloads/letterboxd-pissedavocado-*.zip

The export has no posters, so those are looked up on each film's page once
and kept. Only Letterboxd-owned fields are updated; anything you add by hand
(pitch, tags, poster overrides) is kept. Films are matched by title and year.

The watchlist is read from its public pages and replaced on every run, so
films you've watched drop off; posters and notes you added are kept.
Needs PyYAML (`pip install pyyaml`).
"""
import csv
import html
import io
import json
import re
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

import yaml

USER = "pissedavocado"
DATA = Path(__file__).resolve().parent.parent / "data" / "films.yaml"
WATCHLIST = DATA.with_name("watchlist.yaml")
NS = {"lb": "https://letterboxd.com", "tmdb": "https://themoviedb.org"}
UA = {"User-Agent": "Mozilla/5.0 (words.yudocaa.in film import)"}
SPOILERS = "<p><em>This review may contain spoilers.</em></p>"

HEADER = """\
# Films I've rated on Letterboxd, ranked on /films/ by rating.
#
# Refresh with:
#   python3 scripts/letterboxd_import.py [letterboxd-export.zip]
# The import only updates Letterboxd-owned fields and keeps everything else.
#
# title, year          the film
# rating               0.5-5 in halves
# liked                the heart on Letterboxd
# watched              YYYY-MM-DD, the latest diary entry
# review               Markdown or inline HTML
# spoilers             true hides the review behind a click
# poster               image URL, fetched and resized at build time
# url                  my review (or the film) on Letterboxd
# pitch                one line on who to recommend it to; yours, never imported
"""


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.geturl(), r.read().decode("utf-8", "replace")


def key(title, year):
    return f"{title.strip().lower()} ({year})"


def clean_review(body):
    """RSS review HTML -> Markdown paragraphs, keeping inline tags."""
    spoilers = SPOILERS in body
    body = body.replace(SPOILERS, "")
    body = re.sub(r"<p>\s*<img[^>]*>\s*</p>", "", body)
    paras = [p.strip() for p in re.findall(r"<p>(.*?)</p>", body, re.S)]
    paras = [re.sub(r"<br\s*/?>\s*", "\n", p) for p in paras if p]
    text = html.unescape("\n\n".join(paras)).strip()
    # Entries without a review only say when they were watched.
    if re.fullmatch(r"Watched on \w+ \w+ \d+, \d{4}\.", text):
        text = ""
    return text, spoilers


def from_rss():
    _, xml = fetch(f"https://letterboxd.com/{USER}/rss/")
    films = []
    for item in ET.fromstring(xml).iter("item"):
        title = item.findtext("lb:filmTitle", namespaces=NS)
        if not title:  # lists also show up in the feed
            continue
        desc = item.findtext("description") or ""
        review, spoilers = clean_review(desc)
        film = {"title": title, "year": int(item.findtext("lb:filmYear", namespaces=NS))}
        rating = item.findtext("lb:memberRating", namespaces=NS)
        if rating:
            film["rating"] = float(rating)
        film["liked"] = item.findtext("lb:memberLike", namespaces=NS) == "Yes"
        watched = item.findtext("lb:watchedDate", namespaces=NS)
        if watched:
            film["watched"] = watched
        if review:
            film["review"] = review
            film["spoilers"] = spoilers
        poster = re.search(r'<img src="([^"]+)"', desc)
        if poster:
            film["poster"] = poster.group(1)
        film["url"] = item.findtext("link")
        tmdb = item.findtext("tmdb:movieId", namespaces=NS)
        if tmdb:
            film["tmdb"] = int(tmdb)
        films.append(film)
    return films


def export_files(path):
    """The export's CSVs by name, from a .zip or an unzipped folder."""
    path = Path(path).expanduser()
    if path.is_dir():
        return {p.relative_to(path).as_posix(): p.read_text(encoding="utf-8") for p in path.rglob("*.csv")}
    with zipfile.ZipFile(path) as z:
        return {n: z.read(n).decode("utf-8") for n in z.namelist() if n.endswith(".csv")}


def from_export(path):
    files = export_files(path)
    rows = lambda name: list(csv.DictReader(io.StringIO(files.get(name, ""))))
    films = {}

    def film(row):
        k = key(row["Name"], row["Year"])
        return films.setdefault(k, {"title": row["Name"], "year": int(row["Year"]), "url": row["Letterboxd URI"]})

    for row in rows("ratings.csv"):
        film(row)["rating"] = float(row["Rating"])
    for row in rows("likes/films.csv"):
        film(row)["liked"] = True
    # Oldest first, so the latest diary entry and review win.
    for row in sorted(rows("reviews.csv"), key=lambda r: r.get("Watched Date") or r["Date"]):
        f = film(row)
        f["url"] = row["Letterboxd URI"]
        if row.get("Rating"):
            f["rating"] = float(row["Rating"])
        if row.get("Watched Date"):
            f["watched"] = row["Watched Date"]
        if row.get("Review", "").strip():
            f["review"] = row["Review"].strip()
            f["spoilers"] = "spoilers" in (row.get("Tags") or "").lower()
    for row in rows("diary.csv"):
        f = films.get(key(row["Name"], row["Year"]))
        if f and row.get("Watched Date") and row["Watched Date"] > f.get("watched", ""):
            f["watched"] = row["Watched Date"]
    return list(films.values())


def find_poster(film):
    """The poster from the film page's JSON-LD; boxd.it links redirect there."""
    url, page = fetch(film["url"])
    slug = re.search(r"/film/([^/]+)/", url)
    if slug and not url.startswith(f"https://letterboxd.com/film/"):
        url, page = fetch(f"https://letterboxd.com/film/{slug.group(1)}/")
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page, re.S):
        # Letterboxd wraps the JSON in /* <![CDATA[ */ comments.
        block = re.sub(r"/\*.*?\*/", "", block, flags=re.S)
        image = json.loads(block).get("image")
        if image:
            return image
    return None


WATCHLIST_HEADER = """\
# Films on my Letterboxd watchlist, shown on /films/ after the ratings.
#
# Synced by scripts/letterboxd_import.py in Letterboxd's order (newest first).
# Films leave when they leave the watchlist; anything you add here is kept
# while they stay on it.
#
# title, year          the film
# url                  the film on Letterboxd
# poster               image URL, fetched and resized at build time
# why                  who recommended it, or why it's here; yours, never imported
"""


def from_watchlist():
    films, page = [], 1
    while True:
        _, body = fetch(f"https://letterboxd.com/{USER}/watchlist/page/{page}/")
        items = re.findall(r'data-item-name="([^"]+)"[^>]*?data-item-link="([^"]+)"', body)
        if not items:
            return films
        for name, link in items:
            name = html.unescape(name)
            m = re.fullmatch(r"(.*) \((\d{4})\)", name)
            title, year = (m.group(1), int(m.group(2))) if m else (name, None)
            films.append({"title": title, "year": year, "url": f"https://letterboxd.com{link}"})
        page += 1


def fill_posters(films):
    for film in films:
        if not film.get("poster") and film.get("url"):
            try:
                film["poster"] = find_poster(film)
                time.sleep(0.5)
            except Exception as e:  # a missing poster falls back to a title card
                print(f"no poster for {film['title']}: {e}", file=sys.stderr)


def sync_watchlist():
    old = yaml.safe_load(WATCHLIST.read_text()) or [] if WATCHLIST.exists() else []
    old = {f["url"]: f for f in old}
    films = [{**old.get(f["url"], {}), **f} for f in from_watchlist()]
    # A blocked or changed page reads as an empty watchlist; don't wipe it.
    if old and not films:
        sys.exit("Read 0 watchlist films; leaving data/watchlist.yaml as it is.")
    gone = [f["title"] for u, f in old.items() if u not in {f["url"] for f in films}]
    new = [f["title"] for f in films if f["url"] not in old]
    print(f"{len(films)} films on the watchlist")
    for title in new:
        print(f"  added   {title}")
    for title in gone:
        print(f"  removed {title}")
    fill_posters(films)
    body = yaml.safe_dump(films, sort_keys=False, allow_unicode=True, width=88)
    WATCHLIST.write_text(WATCHLIST_HEADER + body)
    print(f"-> {WATCHLIST}")


def main(export=None):
    existing = yaml.safe_load(DATA.read_text()) or [] if DATA.exists() else []
    index = {key(f["title"], f["year"]): f for f in existing}
    added = updated = 0

    # The export first, then the feed: it is newer and has posters.
    exported = from_export(export) if export else []
    feed = from_rss()
    print(f"{len(feed)} films in the RSS feed" + (f", {len(exported)} in the export" if export else ""))
    if not feed and not exported:
        sys.exit(f"Nothing to import: is https://letterboxd.com/{USER}/ public, with rated films?")
    for film in exported + feed:
        match = index.get(key(film["title"], film["year"]))
        stars = f"{film['rating']:g}★" if film.get("rating") else "unrated"
        print(f"  {'updated' if match else 'added  '} {film['title']} ({film['year']}) {stars}"
              + (" ♥" if film.get("liked") else "") + (" +review" if film.get("review") else ""))
        if match:
            # A feed entry without a review shouldn't wipe an older one.
            if "review" not in film:
                film.pop("spoilers", None)
            match.update(film)
            updated += 1
        else:
            existing.append(film)
            index[key(film["title"], film["year"])] = film
            added += 1

    fill_posters(existing)

    existing.sort(key=lambda f: (-(f.get("rating") or 0), f["title"].lower()))
    body = yaml.safe_dump(existing, sort_keys=False, allow_unicode=True, width=88)
    DATA.write_text(HEADER + body)
    print(f"{added} added, {updated} updated -> {DATA}\n")
    sync_watchlist()


if __name__ == "__main__":
    if len(sys.argv) > 2:
        sys.exit(__doc__)
    main(*sys.argv[1:])
