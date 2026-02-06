# Pali Learning App – Product Vision

## Overview

This is a **personal, local-first Pali language learning app** built with React Native (Expo). The app is designed first and foremost as a *learning workbench* for its creator: opinionated, incremental, and optimized for how Pali is actually studied (reading, vocabulary, grammar), not for mass-market language learning.

The guiding principle is simple:

> **Build only what is actively needed, and let the app grow alongside the learner.**

There are no accounts, no gamification requirements, and no pressure to generalize prematurely.

---

## Core Philosophy

* **Personal-first**: Optimized for a single learner, not a broad audience
* **Incremental growth**: Features are added only when they become useful
* **Local-first**: All data stored locally (SQLite), no sync required
* **Opinionated but flexible**: Defaults reflect the author’s learning style, but allow customization
* **Pali-specific**: Designed for reading and analysis, not conversational fluency

---

## Short-Term Vision (MVP): Flashcards System

The immediate focus is a robust, low-friction **flashcard and spaced repetition system** tailored for Pali.

### Learning Scope

* Pali words
* Prefixes
* Suffixes
* Roots
* Particles

These are collectively treated as **Items** in a single learning library.

---

### Flashcards Design

* Each item automatically generates **two study directions**:

  * Pali → Meaning (recognition)
  * Meaning → Pali (recall)
* Each direction is tracked independently for spaced repetition

---

### Library + Decks Model

* **Library**: All items ever added
* **Decks**: Custom, user-defined subsets of the library

  * One default deck: **All**
  * Items can belong to multiple decks

Decks are organizational tools, not ownership containers.

---

### Spaced Repetition (Initial)

* Simple, understandable scheduling (not Anki-level complexity)
* Core actions:

  * Again
  * Good
  * Easy
* Scheduling logic can evolve without breaking the data model

---

### Diacritics Support

Correct Pali orthography is essential.

Initial approach:

* Built-in diacritics helper (toolbar or long-press support)
* No requirement for external keyboards
* IAST used consistently across the app

---

### MVP Success Criteria

The flashcard system is considered successful when:

* New Pali items can be added quickly
* Diacritics are easy to input
* Cards are immediately study-ready
* Daily study can happen entirely within the app

At this point, the app is already *useful* for real Pali study.

---

## Medium-Term Vision

Once flashcards are stable and in daily use, the app can grow organically.

Possible next steps:

### Improved Organization

* Tags
* Auto-generated decks (e.g. prefixes, due today)
* Filtering and search

### Grammar Reference

* Static, searchable grammar notes
* Declension and conjugation tables
* Common sandhi rules

### Study Enhancements

* Per-direction suspension
* Leech detection
* Smarter scheduling logic

---

## Long-Term Vision

These features are explicitly *not required* early, but are compatible with the current design.

### Text Reader

* Read Pali passages or suttas
* Tap words to see definitions
* Word-by-word glossing

### Morphological Analysis

* Roots and affixes linked to words
* Notes on derivation and compounds

### Audio & Pronunciation

* Optional audio references
* Pronunciation notes (not conversational training)

---

## Non-Goals

To keep the project focused, the following are explicitly out of scope unless needs change:

* User accounts or authentication
* Cloud sync (initially)
* Gamification or streak pressure
* Social or sharing features

---

## Summary

This app is not meant to be a polished product from day one. It is a **living tool**, shaped by actual Pali study, growing feature by feature as new needs arise.

The short-term goal is simple and powerful:

> **Make studying Pali vocabulary fast, accurate, and pleasant—every day.**
