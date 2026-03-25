# Issue 007: Synonym-Aware Answer Checking

## Overview

Add token-level synonym matching to the study/exercise flow so that multiple valid Pali translations are accepted without enumerating every combination in the exercise data.

## Background

Many Pali words have synonyms taught in the same lesson (e.g., Buddha/Tathāgata/Sugata, nara/purisa/manussa, kukkura/sunakha/soṇa). When a user translates "The man sees the sun" they might write `Naro suriyaṃ passati.` or `Puriso suriyaṃ passati.` — both are correct. The vocabulary TSVs already encode these synonym groups with `/` separators, but the exercise TSVs store only one canonical Pali sentence per row.

Pre-enumerating all valid sentences doesn't scale: a sentence with two synonym groups of 3 words each produces 9 combinations, and it only grows with more complex sentences.

## Goals

- Accept any valid synonym substitution as a correct answer
- Use the synonym groups already defined in `vocabulary.tsv` — no duplicate data
- Support typo tolerance for diacritics (e.g., `a` vs `ā`, `n` vs `ṇ`)
- Keep exercise TSVs clean with one canonical sentence per row

## Design

### Synonym Map

Build a synonym lookup from `vocabulary.tsv` files at app startup (or build time via the existing `scripts/parse-lesson-tsvs.ts` pipeline). The vocabulary already uses `/` to separate synonyms:

```
Buddha / Tathāgata / Sugata    the Buddha    noun    m
nara / purisa                   man, person   noun    m
kukkura / sunakha / soṇa       dog           noun    m
```

This produces a map where each word points to its synonym set. The map must also cover inflected forms — since all lesson 1–2 vocabulary follows regular `-a` masculine declension, the inflection rules are predictable (nominative -o/-ā, accusative -ṃ/-e).

### Answer Checking Algorithm

```
checkAnswer(expected: string, userInput: string, synonymMap, lessonNumber):
  1. Normalize both strings (lowercase, trim, strip trailing period)
  2. Tokenize into words
  3. If token counts differ → wrong
  4. For each token pair (expected[i], user[i]):
     a. Exact match → continue
     b. Check if both tokens belong to the same synonym group
        (accounting for inflected forms) → continue
     c. Optional: Levenshtein distance ≤ 1 for diacritics → "typo" match
     d. Otherwise → wrong
  5. Return: correct | typo (with note) | wrong
```

### Inflection Handling

Synonym matching needs to work across inflected forms. Two approaches (choose during implementation):

1. **Stem-based**: Strip known case endings to recover the base, then check synonym groups on bases. Simple and sufficient for the regular `-a` declension in early lessons.
2. **Pre-expanded**: At build time, generate all inflected forms for each synonym group and store them in the map. More robust for irregular forms in later lessons.

Option 1 is simpler to start; option 2 can be added when irregular nouns appear.

### Typo Tolerance (Diacritics)

Pali diacritics are a common source of input errors. A lightweight approach:

- Normalize diacritics for comparison (`ā→a`, `ṃ→m`, `ṇ→n`, `ñ→n`, `ṭ→t`, `ḍ→d`, `ī→i`, `ū→u`)
- If the normalized forms match but original forms don't → accept with "check your diacritics" feedback
- This is separate from synonym matching and stacks with it

## Scope

### In Scope

- `SynonymMap` type and builder from vocabulary TSV data
- `checkAnswer()` utility function with synonym + diacritics support
- Integration with the study session answer evaluation (currently in study screen / `FeedbackDisplay`)
- Unit tests for the matching logic

### Out of Scope

- Free-form translation evaluation (this is word-substitution only, not semantic equivalence)
- Synonym support for non-noun/non-verb words
- Changes to the exercise TSV format

## Depends On

- **Issue 006** (Lesson Experience) — the study flow and lesson data pipeline need to exist first

## New/Modified Files

| Action | File                                                                       |
| ------ | -------------------------------------------------------------------------- |
| New    | `utils/synonymMap.ts` (build synonym lookup from vocab data)               |
| New    | `utils/answerChecker.ts` (token-level matching with synonyms + diacritics) |
| New    | `utils/__tests__/answerChecker.test.ts`                                    |
| Modify | Study answer evaluation logic (exact file depends on 006 implementation)   |

## Testing

1. Unit tests for `checkAnswer()` covering:
   - Exact match
   - Synonym substitution (single and multiple per sentence)
   - Diacritics typo tolerance
   - Wrong answers
   - Mismatched token counts
2. Manual: complete a lesson exercise using synonym words not in the canonical answer
