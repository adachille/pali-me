#!/usr/bin/env python3
"""Extract structured vocabulary, grammar, and exercises from a Pali Primer lesson.

Usage:
    python3 extract-lesson.py <lesson_number>
    python3 extract-lesson.py 1          # Extract lesson 1
    python3 extract-lesson.py 1 --dry    # Show raw text without calling API
"""

import json
import os
import sys
from pathlib import Path

import anthropic

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

# Load .env from project root
_env_file = PROJECT_ROOT / ".env"
if _env_file.exists():
    for line in _env_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())
CONFIG_PATH = SCRIPT_DIR / "lesson-config.json"

# PDF font-encoding artifacts → correct Pali diacritics
DIACRITIC_MAP = {
    "±": "ā",
    "²": "ī",
    "³": "ū",
    "ª": "ṅ",
    "μ": "ṭ",
    "¹": "ḍ",
    "º": "ṇ",
    "¼": "ḷ",
    "½": "ṃ",
    "¾": "Ā",
}

MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = """\
You are a precise text extraction assistant. You will be given raw text extracted \
from a PDF of "Pali Primer" by Lily de Silva. The text has PDF extraction artifacts: \
duplicated headers, broken line wraps, and repeated section titles. Your job is to \
extract structured data from a single lesson.

IMPORTANT NOTES ON THE TEXT:
- Lines like "1. Vocabulary" repeated multiple times are PDF artifacts — treat as one heading
- Words like "Singular" or "Plural" repeated multiple times are PDF artifacts
- Pali diacritics have already been corrected to proper Unicode (ā, ī, ū, ṅ, ṭ, ḍ, ṇ, ḷ, ṃ, ñ). Preserve them exactly.
- Vocabulary entries may span multiple lines (e.g., the Pali word on one line, "- definition" on the next)
- Multiple Pali synonyms are separated by "/" (e.g., "Buddha / Tathāgata / Sugata")

Return a single JSON object with this exact schema:
{
  "lesson_number": <int>,
  "title": "<Lesson N>",
  "topic": "<main grammar topic>",
  "vocabulary": [
    {
      "pali": "<pali term(s), slash-separated if synonyms>",
      "english": "<english definition>",
      "type": "<noun|verb|adjective|indeclinable|adverb|prefix|other>",
      "gender": "<m|f|n|null>"
    }
  ],
  "grammar": {
    "explanations": ["<clean prose explanation 1>", "..."],
    "tables": [
      {
        "title": "<e.g., Nominative case singular>",
        "rows": [["<label>", "<form>"], ...]
      }
    ],
    "examples": [
      { "pali": "<example sentence>", "english": "<translation>" }
    ]
  },
  "exercises": {
    "pali_to_english": ["<pali sentence 1>", "..."],
    "english_to_pali": ["<english sentence 1>", "..."]
  }
}

Rules:
- For vocabulary: extract ONLY from the vocabulary section, not from exercises or examples.
- For grammar.explanations: clean up PDF artifacts, produce readable prose.
- For grammar.tables: capture declension/conjugation tables as structured data.
- For grammar.examples: these are the "Examples in Sentence Formation" section, NOT the exercises.
- For exercises: capture the numbered sentences from "Exercise N" sections. Keep Pali sentences in Pali, English sentences in English.
- gender is null for verbs and non-gendered words.
- Preserve all Pali diacritics exactly as they appear in the source text.
- Do NOT include any text outside the JSON object (no markdown fences, no commentary).\
"""


def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def get_lesson_config(config, lesson_num):
    for lesson in config["lessons"]:
        if lesson["lesson"] == lesson_num:
            return lesson
    return None


def fix_diacritics(text):
    """Replace PDF font-encoding artifacts with correct Pali Unicode diacritics."""
    for bad, good in DIACRITIC_MAP.items():
        text = text.replace(bad, good)
    return text


def read_pages(source_dir, start_page, end_page):
    """Read and concatenate text files for the given page range."""
    texts = []
    pad = 3
    for page_num in range(start_page, end_page + 1):
        page_file = source_dir / f"page-{str(page_num).zfill(pad)}.txt"
        if page_file.exists():
            text = page_file.read_text(encoding="utf-8")
            texts.append(f"=== PAGE {page_num} ===\n{text}")
        else:
            print(f"  Warning: {page_file} not found")
    return fix_diacritics("\n\n".join(texts))


def extract_with_api(raw_text, lesson_num, topic):
    """Send text to Claude API and get structured extraction."""
    client = anthropic.Anthropic()

    user_prompt = (
        f"Extract structured data from Lesson {lesson_num} of the Pali Primer.\n"
        f"The topic of this lesson is: {topic}\n\n"
        f"Here is the raw extracted text:\n\n{raw_text}"
    )

    message = client.messages.create(
        model=MODEL,
        max_tokens=8192,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    response_text = message.content[0].text

    # Parse JSON from response
    try:
        data = json.loads(response_text)
    except json.JSONDecodeError:
        # Try to find JSON in the response
        start = response_text.find("{")
        end = response_text.rfind("}") + 1
        if start >= 0 and end > start:
            data = json.loads(response_text[start:end])
        else:
            raise ValueError(f"Could not parse JSON from response:\n{response_text[:500]}")

    return data, message.usage


def write_vocabulary_tsv(vocab_list, output_path):
    """Write vocabulary to TSV file."""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("pali\tenglish\ttype\tgender\n")
        for entry in vocab_list:
            pali = entry["pali"]
            english = entry["english"]
            word_type = entry.get("type", "")
            gender = entry.get("gender") or ""
            f.write(f"{pali}\t{english}\t{word_type}\t{gender}\n")


def write_lesson_json(data, output_path):
    """Write the full lesson data (grammar + exercises) to JSON."""
    lesson_data = {
        "lesson_number": data["lesson_number"],
        "title": data["title"],
        "topic": data["topic"],
        "grammar": data["grammar"],
        "exercises": data["exercises"],
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(lesson_data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def validate_output(data):
    """Basic validation of the extracted data."""
    issues = []

    vocab = data.get("vocabulary", [])
    if not vocab:
        issues.append("No vocabulary entries found")
    for i, entry in enumerate(vocab):
        if not entry.get("pali"):
            issues.append(f"Vocabulary entry {i} missing pali field")
        if not entry.get("english"):
            issues.append(f"Vocabulary entry {i} missing english field")

    grammar = data.get("grammar", {})
    if not grammar.get("explanations"):
        issues.append("No grammar explanations found")

    exercises = data.get("exercises", {})
    p2e = exercises.get("pali_to_english", [])
    e2p = exercises.get("english_to_pali", [])
    if not p2e and not e2p:
        issues.append("No exercises found")

    return issues


def print_summary(data):
    """Print a human-readable summary of the extraction."""
    vocab = data.get("vocabulary", [])
    grammar = data.get("grammar", {})
    exercises = data.get("exercises", {})

    print(f"\n{'=' * 60}")
    print(f"  Lesson {data['lesson_number']}: {data['topic']}")
    print(f"{'=' * 60}")

    print(f"\n  Vocabulary: {len(vocab)} entries")
    for entry in vocab[:5]:
        gender = f" ({entry['gender']})" if entry.get("gender") else ""
        print(f"    {entry['pali']:<30} {entry['english']}{gender}")
    if len(vocab) > 5:
        print(f"    ... and {len(vocab) - 5} more")

    print(f"\n  Grammar explanations: {len(grammar.get('explanations', []))}")
    for exp in grammar.get("explanations", [])[:2]:
        preview = exp[:80] + "..." if len(exp) > 80 else exp
        print(f"    - {preview}")

    tables = grammar.get("tables", [])
    if tables:
        print(f"\n  Declension/conjugation tables: {len(tables)}")
        for t in tables:
            print(f"    - {t['title']} ({len(t['rows'])} rows)")

    examples = grammar.get("examples", [])
    if examples:
        print(f"\n  Grammar examples: {len(examples)}")

    p2e = exercises.get("pali_to_english", [])
    e2p = exercises.get("english_to_pali", [])
    print(f"\n  Exercises: {len(p2e)} Pali->English, {len(e2p)} English->Pali")

    print()


def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <lesson_number> [--dry]")
        sys.exit(1)

    lesson_num = int(sys.argv[1])
    dry_run = "--dry" in sys.argv

    config = load_config()
    lesson_config = get_lesson_config(config, lesson_num)
    if not lesson_config:
        print(f"Error: Lesson {lesson_num} not found in config")
        sys.exit(1)

    source_dir = PROJECT_ROOT / config["source_dir"]
    output_dir = PROJECT_ROOT / config["output_dir"] / f"lesson-{str(lesson_num).zfill(2)}"

    start_page, end_page = lesson_config["pages"]
    topic = lesson_config["topic"]

    print(f"Lesson {lesson_num}: {topic}")
    print(f"Pages: {start_page}-{end_page}")

    raw_text = read_pages(source_dir, start_page, end_page)
    print(f"Raw text: {len(raw_text)} characters")

    if dry_run:
        print("\n--- DRY RUN: Raw text ---")
        print(raw_text)
        return

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)

    print(f"Calling {MODEL}...")
    data, usage = extract_with_api(raw_text, lesson_num, topic)
    print(f"API usage: {usage.input_tokens} input, {usage.output_tokens} output tokens")

    # Validate
    issues = validate_output(data)
    if issues:
        print("\nValidation warnings:")
        for issue in issues:
            print(f"  ! {issue}")

    # Write outputs
    output_dir.mkdir(parents=True, exist_ok=True)

    tsv_path = output_dir / "vocabulary.tsv"
    write_vocabulary_tsv(data["vocabulary"], tsv_path)
    print(f"Wrote {tsv_path}")

    json_path = output_dir / "lesson.json"
    write_lesson_json(data, json_path)
    print(f"Wrote {json_path}")

    # Summary
    print_summary(data)


if __name__ == "__main__":
    main()
