# Icon Style Guide

## Aesthetic

Calm, mindful, and understated — appropriate for Theravadan Buddhist students engaged in serious Pali language study. Icons use subtle nods to Buddhist themes (lotus petals, sunrise, soft light) without heavy-handed symbolism.

## Icon Inventory

| Name                  | Usage               | Source                 | Size (in use)  |
| --------------------- | ------------------- | ---------------------- | -------------- |
| `books-open`          | Empty deck state    | AI-generated (Recraft) | 128px          |
| `celebrate-sunrise`   | Session complete    | Claude SVG             | 128px          |
| `edit-pencil-soft`    | Edit button         | Claude SVG             | 30px           |
| `lotus`               | Home tab icon       | AI-generated           | 28px (tab bar) |
| `pin-simple`          | Default deck marker | AI-generated           | 24px           |
| `sparkle-lotus-light` | All caught up state | Claude SVG             | 128px          |

## SVG Specifications

### Grid and ViewBox

- **Small icons** (action buttons): `viewBox="0 0 24 24"`, rendered at 24-30px
- **Large icons** (empty states, celebrations): `viewBox="0 0 24 24"` or `viewBox="0 0 2048 2048"`, rendered at 128px
- All SVGs include `width="256" height="256"` as a default intrinsic size; actual size is controlled by the `Icon` component's `size` prop

### Coloring

- All icons use `currentColor` for fill and/or stroke — never hardcoded colors
- Color is passed dynamically via the `Icon` component's `color` prop
- Typical usage: `colors.primary` (#4CAF50) for interactive elements, `colors.text` (#333/#F0F0F0) for informational icons

### Line Style

- **Stroke width**: 1.3-2.0 (varies by icon complexity)
  - Action icons (edit, cards): 1.8-2.0 — bolder for small render sizes
  - Decorative icons (sparkle, sunrise): 1.3-1.5 — lighter for large render sizes
- **Stroke caps**: `round` — consistent across all icons
- **Stroke joins**: `round` — maintains soft, approachable feel
- **No sharp corners** — rounded terminals throughout

### Fill vs Stroke

- Small action icons: stroke-based line art (edit-pencil-soft, cards-stacked-bare)
- Large decorative icons: stroke-based with occasional filled accents (sparkle center dot)
- AI-generated icons (books-open, pin-simple): filled paths — acceptable when paths use `currentColor`

### Buddhist Motifs

Motifs are subtle and non-literal:

- **Lotus petals**: Used as radiating shapes in sparkle icon (not a full lotus flower)
- **Sunrise/horizon**: Rising sun with rays for session completion (symbolizes awakening)
- **No explicit religious symbols**: No Dharma wheels, Buddha figures

## Brand Color Palette

### Primary — Sage Green

Represents growth, nature, and the calm of forest monasteries.

| Token            | Light     | Dark      | Usage                                     |
| ---------------- | --------- | --------- | ----------------------------------------- |
| `primary`        | `#4CAF50` | `#4CAF50` | Interactive elements, icon color, buttons |
| `primaryDark`    | `#388E3C` | `#388E3C` | Pressed states                            |
| `primaryLight`   | `#A5D6A7` | `#A5D6A7` | Subtle highlights                         |
| `primarySurface` | `#E8F5E9` | `#1B3A1F` | Background tints                          |

### Secondary — Blue

Used sparingly for links and secondary actions.

| Token           | Light     | Dark      |
| --------------- | --------- | --------- |
| `secondary`     | `#2196F3` | `#42A5F5` |
| `secondaryDark` | `#1976D2` | `#1E88E5` |

### Neutrals

| Token           | Light     | Dark      | Usage                      |
| --------------- | --------- | --------- | -------------------------- |
| `background`    | `#FFFFFF` | `#121212` | Page background            |
| `surface`       | `#F5F5F5` | `#1E1E1E` | Cards, elevated surfaces   |
| `text`          | `#333333` | `#F0F0F0` | Primary text, icon default |
| `textSecondary` | `#666666` | `#AAAAAA` | Supporting text            |
| `textTertiary`  | `#999999` | `#666666` | Metadata, timestamps       |
| `border`        | `#E0E0E0` | `#333333` | Dividers                   |

### Semantic

| Token          | Light     | Dark      | Usage                                  |
| -------------- | --------- | --------- | -------------------------------------- |
| `error`        | `#F44336` | `#EF5350` | Incorrect answers, destructive actions |
| `errorSurface` | `#FFEBEE` | `#3B1515` | Error backgrounds                      |

## Adding New Icons

1. Place the `.svg` file in `assets/icons/svg/`
2. Ensure all colors use `currentColor` (no hardcoded hex values)
3. Use `stroke-linecap="round"` and `stroke-linejoin="round"`
4. Import in `components/common/Icon.tsx` and add to the `SVG_ICONS` map
5. Use via `<Icon name="my-icon" size={24} color={colors.primary} />`

See the issue doc for the full icon creation workflow: `docs/issues/005-custom-icons-and-brand-development.md`

## Technical Reference

- SVGs are transformed into React components by `react-native-svg-transformer` (configured in `metro.config.js`)
- TypeScript declaration for `.svg` imports is in `declarations.d.ts`
- Icon component wrapper: `components/common/Icon.tsx`
- Theme colors: `theme/index.tsx`
