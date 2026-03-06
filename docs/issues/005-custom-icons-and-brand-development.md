# Issue 005: Custom Icons and Brand Development

## Overview

Replace emoji characters (📚, ✨, 🎉, ✓, ✗, 📌, ▶️, ✏️) throughout the app with custom-designed icons that reflect a spiritual/Buddhist aesthetic appropriate for Theravadan Buddhist students studying Pali. Develop a cohesive brand identity alongside icon creation.

## Background

The app currently uses 8 emoji characters for UI elements including action buttons, empty states, and status indicators. While functional, these emojis feel inconsistent and "cheesy" for the target audience who are engaged in serious religious/spiritual study.

## Goals

- Create a full custom icon set with AI tools
- Establish a spiritual/Buddhist aesthetic (subtle to light symbolism)
- Develop brand identity (color palette, style guidelines) iteratively
- Maintain or improve UX while replacing emojis
- Keep icons accessible and performant

## Design Approach

### Icon Style Direction

**Aesthetic:** Serious, calm, and mindful - appropriate for religious/spiritual study
**Symbolism Level:** Between subtle feeling and light references to Buddhist themes

- Calm, mindful design with occasional nods to Buddhist themes
- Not heavy-handed with explicit symbols
- Think: lotus petals, soft light, peaceful proportions

### Icon Creation Process (Per Icon)

For each icon, follow this workflow:

1. **Set up comparison view in app** — Claude temporarily modifies the relevant screen to show all candidate icons side by side with labels, so they can be evaluated in context at the correct size and color.

2. **Claude generates SVG variations** — Claude creates 2-3 line-art SVG variations and adds them to `assets/icons/svg/` and the `Icon` component.

3. **Generate variations with other AI tools** — Use external AI tools (Recraft, Google AI Studio, etc.) to generate additional candidates. Drop the `.svg` files into `assets/icons/svg/` and Claude will wire them into the comparison view.

4. **Pick the winner** — Review all candidates in the app comparison view, choose the best icon.

5. **Final implementation** — Claude replaces the comparison view with the final icon in its proper location, removes rejected candidates, and cleans up.

6. **Commit and move to the next icon.**

### Icon Replacement Order (Priority)

1. **Books (📚)** — Empty deck state — ✅ Done
2. **Play/Study (▶️)** — Study button — [components/decks/DeckCard.tsx:90](components/decks/DeckCard.tsx#L90)
3. **Edit (✏️)** — Edit button — [components/decks/DeckCard.tsx:103](components/decks/DeckCard.tsx#L103)
4. **Sparkles (✨)** — All caught up state — ✅ Done
5. **Party (🎉)** — Session complete — ✅ Done
6. **Pin (📌)** — Default deck marker — ✅ Done
7. **Check (✓)** — Correct answer — Keeping as-is
8. **X (✗)** — Incorrect answer — Keeping as-is

### Style Guidelines (Develop as you go)

After first 2-3 icons, document emerging patterns:

- Line weight consistency
- Corner radius preference
- Level of detail and Buddhist symbolism
- Icon grid size and padding
- Color usage approach

## Brand Identity Development (Parallel Track)

### Color Palette Discovery

Extract colors from winning icon style. Buddhist-inspired palette ideas:

- Saffron/orange (monk robes) + deep navy/charcoal
- Soft gold + forest green (nature, peace)
- Warm terracotta + cream (ancient texts)

Define: Primary, secondary, accent, and neutral colors
Test: Color contrast ratios for accessibility (WCAG AA minimum: 4.5:1 for text, 3:1 for UI)

### Documentation to Create

- `/docs/design/ICON_STYLE_GUIDE.md` - Icon dimensions, Buddhist motifs, color rules, composition
- `/docs/design/MOOD_BOARD.md` - Inspiration images, app references (Insight Timer, Plum Village, Headspace)

## Technical Implementation

### Architecture

SVG icons are imported as React components via `react-native-svg-transformer`. This was chosen over inline SVG strings because AI-generated icons have complex paths that would clutter TSX files.

**Key files:**

- `metro.config.js` — Configures metro to transform `.svg` files
- `declarations.d.ts` — TypeScript declaration for `.svg` imports (`React.FC<SvgProps>`)
- `components/common/Icon.tsx` — Wrapper component mapping icon names to SVG imports
- `assets/icons/svg/*.svg` — SVG source files (use `currentColor` for dynamic coloring)

### Adding a New Icon

1. Drop the `.svg` file in `assets/icons/svg/` (use `currentColor` for fill/stroke)
2. Import it in `Icon.tsx`: `import MyIcon from "@/assets/icons/svg/my-icon.svg"`
3. Add to the `SVG_ICONS` map: `"my-icon": MyIcon`
4. Use it: `<Icon name="my-icon" size={48} color={colors.text} />`

### Dependencies

```bash
# Already installed
pnpm add react-native-svg
pnpm add -D react-native-svg-transformer
```

### Folder Structure

```
/assets
  /icons
    /svg              # SVG source files (cleaned, using currentColor)
      books-open.svg
      cards-stacked-bare.svg
      svg-ai-*.svg    # Raw AI-generated originals (reference)

/components
  /common
    Icon.tsx          # Wrapper component importing SVG files
```

### Files to Modify (Per Icon)

1. **components/decks/DeckCard.tsx** (lines 63, 90, 103)
   - ~~Replace `📌` with `<Icon name="pin-simple" size={18} />`~~ ✅ Done
   - ~~Replace `▶️` with `<Icon name="cards-stacked-bare" />`~~ ✅ Done
   - ~~Replace `✏️` with `<Icon name="edit-pencil-soft" />`~~ ✅ Done

2. **app/study/[id].tsx** (lines 345, 366)
   - ~~Replace `📚` with `<Icon name="books-open" />`~~ ✅ Done
   - ~~Replace `✨` with `<Icon name="sparkle-lotus-light" size={128} />`~~ ✅ Done

3. **app/(tabs)/\_layout.tsx** (line 33)
   - ~~Replace Ionicons `home` with `<Icon name="lotus" />`~~ ✅ Done

4. **components/study/StudyCompletion.tsx** (lines 23, 41)
   - ~~Replace `🎉` with `<Icon name="celebrate-sunrise-2" size={128} />`~~ ✅ Done
   - ~~`✓` — Keeping as-is~~
   - ~~`✗` — Keeping as-is~~

## Progress

### Icon 1: Books (📚) — Empty Deck State ✅ COMPLETE

- [x] Set up comparison view with candidates
- [x] Claude generated variations (palm leaf, stacked, standing, open book)
- [x] Generated variations with Google AI Studio and Recraft
- [x] Picked winner: AI-generated open book icon (`books-open.svg`)
- [x] Implemented in `app/study/[id].tsx` empty deck state
- [x] Set up SVG transformer infrastructure (metro config, declarations, Icon component)
- [x] Cleaned up rejected candidates

### Icon 2: Play/Study (▶️) — Study Button

- [x] Set up comparison view in DeckCard
- [x] Claude generates SVG variations (`play-traingle`, `audio-on`)
- [x] Generate variations with other AI tools
- [x] Pick winner (`cards-stacked-bare`)
- [x] Final implementation (replaced `▶️` in `DeckCard` study action)
- [x] Commit

### Icon 3: Edit (✏️) — Edit Button

- [x] Set up comparison view in DeckCard
- [x] Claude generates SVG variations (`edit-pencil-soft`)
- [x] Generate variations with other AI tools
- [x] Pick winner (`edit-pencil-soft`)
- [x] Final implementation (replaced `✏️` in `DeckCard` edit action)
- [x] Commit

### Icon 4: Sparkles (✨) — All Caught Up ✅ COMPLETE

- [x] Set up comparison view in study screen
- [x] Claude generates SVG variations (`sparkle-three-stars`, `sparkle-radiant`, `sparkle-lotus-light`)
- [x] Generate variations with other AI tools
- [x] Pick winner (`sparkle-lotus-light`) — lotus-inspired petal rays radiating from center
- [x] Final implementation (replaced `✨` in `app/study/[id].tsx` all caught up state)
- [x] Commit

### Icon 5: Party (🎉) — Session Complete ✅ COMPLETE

- [x] Set up comparison view in StudyCompletion
- [x] Claude generates SVG variations (`celebrate-lotus-bloom`, `celebrate-sunrise`, `celebrate-bodhi-leaf`)
- [x] Additional variations (`celebrate-bodhi-leaf-heart`, `celebrate-sunrise-2`)
- [x] Pick winner (`celebrate-sunrise-2`) — rising sun with evenly spaced rays at 35° intervals
- [x] Final implementation (replaced `🎉` in `StudyCompletion.tsx`)
- [x] Commit

### Icon 6: Pin (📌) — Default Deck Marker ✅ COMPLETE

- [x] Set up comparison view in DeckCard
- [x] Claude generates SVG variations (`pin-simple`, `pin-lotus`, `pin-bodhi-leaf`)
- [x] AI-generated variation (`svg-ai-pin`)
- [x] Pick winner (`pin-simple`) — AI-generated pushpin icon, rendered in dark grey
- [x] Final implementation (replaced `📌` in `DeckCard.tsx` all-deck marker)
- [x] Cleaned up rejected candidates
- [x] Commit

### Icon 7 & 8: Check (✓) and X (✗) — Skipped

Keeping existing text characters — they work well as-is.

### Lotus — Home Tab Icon ✅ COMPLETE

- [x] Replaced Ionicons `home` with `<Icon name="lotus" />` in `app/(tabs)/_layout.tsx`
- [x] Updated `lotus.svg` to use `currentColor` instead of hardcoded `rgb(0,0,0)`

### Polish & Documentation ✅ COMPLETE

- [x] Update DeckCard.test.tsx to recognize Icon components
- [x] Run full test suite: `pnpm test` (239 tests passing)
- [x] Create `/docs/design/ICON_STYLE_GUIDE.md`
- [x] Document color palette in style guide
- [x] Finalize brand color palette
