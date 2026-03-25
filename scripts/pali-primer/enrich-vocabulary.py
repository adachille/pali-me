#!/usr/bin/env python3
"""Enrich vocabulary TSV files with definitions from SuttaCentral.

For each word in a lesson's vocabulary.tsv, fetches the definition from
SuttaCentral's dictionary API and writes a vocabulary-enriched.tsv with
an added 'notes' column.

Usage:
    python3 enrich-vocabulary.py 1            # Enrich lesson 1
    python3 enrich-vocabulary.py --all        # Enrich all lessons
    python3 enrich-vocabulary.py 1 --dry-run  # Preview without writing
    python3 enrich-vocabulary.py --all --no-cache  # Force fresh lookups
"""

import argparse
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
LESSONS_DIR = PROJECT_ROOT / "docs" / "pali-lessons" / "pali-primer-extracted-lesson-content"
CACHE_PATH = SCRIPT_DIR / ".sc-cache.json"

API_BASE = "https://suttacentral.net/api/dictionary_full"
USER_AGENT = "PaliMe-Enricher/1.0 (github.com/adachille/pali-me)"


def load_cache():
    """Load cached API responses from disk."""
    if CACHE_PATH.exists():
        with open(CACHE_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache):
    """Save cached API responses to disk."""
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
        f.write("\n")


def fetch_from_suttacentral(word):
    """Fetch dictionary entries for a Pali word from SuttaCentral API."""
    encoded = urllib.parse.quote(word, safe="")
    url = f"{API_BASE}/{encoded}?lang=en"

    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data if isinstance(data, list) else []
    except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, OSError) as e:
        print(f"    Warning: Failed to fetch '{word}': {e}")
        return []


def extract_definition(entries):
    """Extract definition and gender from API response entries.

    Prefers ncped dictionary, falls back to dpd.
    Returns (definition, gender) tuple.
    """
    # Try ncped first (cleanest data)
    for entry in entries:
        if entry.get("dictname") == "ncped":
            defn = entry.get("definition", "")
            if isinstance(defn, list):
                defn = "; ".join(defn)
            grammar = entry.get("grammar", "")
            return defn, grammar

    # Fallback to dpd
    for entry in entries:
        if entry.get("dictname") == "dpd":
            defn = entry.get("definition", "")
            if isinstance(defn, list):
                # dpd definitions look like "buddha 1: masc. Buddha; Awakened One [√budh + ta]"
                # Take the first one and extract the part after ": "
                parts = []
                for d in defn:
                    if ": " in d:
                        parts.append(d.split(": ", 1)[1])
                    else:
                        parts.append(d)
                defn = "; ".join(parts)
            grammar = entry.get("grammar", "")
            return defn, grammar

    return "", ""


def format_notes(definition, grammar):
    """Format the notes column value."""
    if not definition:
        return "[not found on SuttaCentral]"

    # Sanitize for TSV: remove tabs and newlines
    definition = definition.replace("\t", " ").replace("\n", "; ").replace("\r", "")

    parts = [definition]
    if grammar:
        parts.append(f"({grammar})")
    parts.append("— Definition from SuttaCentral")
    return " ".join(parts)


def lookup_word(word, cache, delay, use_cache=True):
    """Look up a single Pali word, using cache if available.

    The SuttaCentral API is case-sensitive. If the original casing returns
    no results, retries with lowercase.
    """
    cache_key = word.lower()

    if use_cache and cache_key in cache:
        entries = cache[cache_key]
    else:
        entries = fetch_from_suttacentral(word)
        # Retry with lowercase if original casing returned nothing
        if not entries and word != word.lower():
            entries = fetch_from_suttacentral(word.lower())
        cache[cache_key] = entries
        time.sleep(delay)

    return extract_definition(entries)


def read_vocabulary_tsv(path):
    """Read a vocabulary TSV file and return list of row dicts."""
    rows = []
    with open(path, encoding="utf-8") as f:
        lines = f.read().strip().split("\n")
    if len(lines) <= 1:
        return rows  # Empty file (header only)

    headers = lines[0].split("\t")
    for line in lines[1:]:
        fields = line.split("\t")
        row = {}
        for i, h in enumerate(headers):
            row[h] = fields[i] if i < len(fields) else ""
        rows.append(row)
    return rows


def write_enriched_tsv(rows, path):
    """Write enriched vocabulary TSV with notes column."""
    with open(path, "w", encoding="utf-8") as f:
        f.write("pali\tenglish\ttype\tgender\tnotes\n")
        for row in rows:
            pali = row["pali"]
            english = row["english"]
            word_type = row.get("type", "")
            gender = row.get("gender", "")
            notes = row.get("notes", "")
            f.write(f"{pali}\t{english}\t{word_type}\t{gender}\t{notes}\n")


def enrich_row(row, cache, delay, use_cache=True):
    """Enrich a single vocabulary row with SuttaCentral data."""
    pali_field = row["pali"]
    words = [w.strip() for w in pali_field.split("/")]

    notes_parts = []
    for word in words:
        definition, grammar = lookup_word(word, cache, delay, use_cache)
        notes_parts.append(format_notes(definition, grammar))

    row["notes"] = " | ".join(notes_parts) if len(words) > 1 else notes_parts[0]
    return row


def process_lesson(lesson_num, cache, delay, use_cache=True, dry_run=False):
    """Process one lesson's vocabulary.tsv."""
    lesson_dir = LESSONS_DIR / f"lesson-{str(lesson_num).zfill(2)}"
    tsv_path = lesson_dir / "vocabulary.tsv"

    if not tsv_path.exists():
        print(f"  Lesson {lesson_num}: vocabulary.tsv not found, skipping")
        return 0, 0

    rows = read_vocabulary_tsv(tsv_path)
    if not rows:
        print(f"  Lesson {lesson_num}: empty vocabulary, skipping")
        return 0, 0

    print(f"  Lesson {lesson_num}: {len(rows)} entries")

    found = 0
    not_found = 0
    for row in rows:
        enrich_row(row, cache, delay, use_cache)
        if "[not found" not in row["notes"]:
            found += 1
        else:
            not_found += 1

    if dry_run:
        print(f"    [dry-run] Would write vocabulary-enriched.tsv")
        for row in rows[:3]:
            print(f"    {row['pali'][:30]:<32} {row['notes'][:80]}")
        if len(rows) > 3:
            print(f"    ... and {len(rows) - 3} more")
    else:
        output_path = lesson_dir / "vocabulary-enriched.tsv"
        write_enriched_tsv(rows, output_path)
        print(f"    Wrote {output_path.relative_to(PROJECT_ROOT)}")

    print(f"    Found: {found}, Not found: {not_found}")
    return found, not_found


def main():
    parser = argparse.ArgumentParser(description="Enrich Pali vocabulary with SuttaCentral definitions")
    parser.add_argument("lesson", nargs="?", type=int, help="Lesson number to process")
    parser.add_argument("--all", action="store_true", help="Process all lessons")
    parser.add_argument("--delay", type=float, default=0.5, help="Delay between API requests (seconds)")
    parser.add_argument("--no-cache", action="store_true", help="Ignore cached responses")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing files")

    args = parser.parse_args()

    if not args.lesson and not args.all:
        parser.error("Specify a lesson number or --all")

    use_cache = not args.no_cache
    cache = load_cache() if use_cache else {}
    cache_size_before = len(cache)

    print(f"SuttaCentral vocabulary enrichment")
    print(f"  Delay: {args.delay}s | Cache: {'on' if use_cache else 'off'} ({len(cache)} entries)")
    if args.dry_run:
        print(f"  DRY RUN — no files will be written")
    print()

    total_found = 0
    total_not_found = 0

    if args.all:
        for i in range(1, 33):
            found, not_found = process_lesson(i, cache, args.delay, use_cache, args.dry_run)
            total_found += found
            total_not_found += not_found
    else:
        found, not_found = process_lesson(args.lesson, cache, args.delay, use_cache, args.dry_run)
        total_found += found
        total_not_found += not_found

    # Save cache
    new_entries = len(cache) - cache_size_before
    if new_entries > 0 and use_cache:
        save_cache(cache)
        print(f"\nCache: {new_entries} new entries added ({len(cache)} total)")

    print(f"\nDone. Found: {total_found}, Not found: {total_not_found}")


if __name__ == "__main__":
    main()
