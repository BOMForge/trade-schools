#!/usr/bin/env python3
"""
Download favicons for school websites and save them under src/assets/favicons/.

Sources scanned:
 - schools/matchmaking_index.csv (Website)
 - schools/trade_schools_curated.csv (website)

Usage:
  python scripts/fetch-favicons.py

Requires: requests (see scripts/requirements.txt)
"""

import csv
import os
import sys
import time
import urllib.parse
from typing import Iterable, Set

import requests


REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_DIR = os.path.join(REPO_ROOT, "src", "assets", "favicons")

SOURCES = [
    os.path.join(REPO_ROOT, "data", "production", "trade_schools_geocoded_fixed.csv"),
    os.path.join(REPO_ROOT, "data", "production", "matchmaking_index.csv"),
    os.path.join(REPO_ROOT, "schools", "matchmaking_index.csv"),
    os.path.join(REPO_ROOT, "schools", "trade_schools_curated.csv"),
]


def normalize_website(value: str) -> str:
    if not value:
        return ""
    url = value.strip()
    if not url:
        return ""
    # Add scheme if missing
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    # Trim whitespace and stray characters
    return url.strip()


def extract_domain(url: str) -> str:
    try:
        parsed = urllib.parse.urlparse(url)
        hostname = parsed.hostname or ""
        return hostname.lower()
    except Exception:
        return ""


def iter_websites_from_csv(path: str) -> Iterable[str]:
    if not os.path.exists(path):
        return []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        # Heuristics for website columns
        website_cols = [
            c for c in reader.fieldnames or []
            if c and "website" in c.lower()
        ]
        if not website_cols:
            return []
        for row in reader:
            for col in website_cols:
                val = (row.get(col) or "").strip()
                if val:
                    yield val


def download_favicon(domain: str, out_path: str) -> bool:
    # Use Google's favicon service (PNG)
    url = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200 and resp.content:
            with open(out_path, "wb") as f:
                f.write(resp.content)
            return True
        return False
    except Exception:
        return False


def main() -> int:
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    websites: Set[str] = set()
    for src in SOURCES:
        for w in iter_websites_from_csv(src):
            w_norm = normalize_website(w)
            if w_norm:
                websites.add(w_norm)

    if not websites:
        print("No websites found to fetch favicons for.")
        return 0

    domains: Set[str] = set()
    for w in websites:
        d = extract_domain(w)
        if d:
            domains.add(d)

    if not domains:
        print("No valid domains extracted.")
        return 0

    downloaded = 0
    skipped = 0

    for i, domain in enumerate(sorted(domains)):
        out_file = os.path.join(OUTPUT_DIR, f"{domain}.png")
        if os.path.exists(out_file) and os.path.getsize(out_file) > 0:
            skipped += 1
            continue
        ok = download_favicon(domain, out_file)
        if ok:
            downloaded += 1
        else:
            # Remove empty/failed file if created
            if os.path.exists(out_file) and os.path.getsize(out_file) == 0:
                try:
                    os.remove(out_file)
                except Exception:
                    pass
        # Be gentle to the service
        time.sleep(0.05)

    print(f"Favicons done. Downloaded: {downloaded}, Skipped existing: {skipped}, Total domains: {len(domains)}")
    print(f"Saved under: {OUTPUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())


