# Issue 005: Custom Icons and Brand Development

## Overview

Replace emoji characters (📚, ✨, 🎉, ✓, ✗, 📌, ▶️, ✏️) throughout the app with custom-designed icons that reflect a spiritual/Buddhist aesthetic appropriate for Theravadan Buddhist students studying Pali. Develop a cohesive brand identity alongside icon creation.

## Background

The app currently uses 6 emoji characters for UI elements including action buttons, empty states, and status indicators. While functional, these emojis feel inconsistent and "cheesy" for the target audience who are engaged in serious religious/spiritual study.

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

### Recommended AI Tools

1. **Recraft.ai** (Primary) - Consistent icon sets, style control, vector output
2. **Claude Artifacts + react-svgr** - Quick prototyping, iterating on individual icons
3. **v0.dev by Vercel** - React-ready components, seeing icons in context
4. **Figma AI** - Fine-tuning, creating variations (if you have access)

### Icon Creation Process (Iterative, One-at-a-Time)

**Philosophy:** Replace icons iteratively - design, implement, and test each icon before moving to the next. This allows the style to evolve naturally and ensures each icon works well in context.

**For Each Icon:**

1. **Design 3-5 variations** (20-30 mins per icon)
   - Use AI tools (Recraft, Claude Artifacts, etc.) to generate style options
   - Try different levels of Buddhist symbolism (subtle to light)
   - Consider context: size, surrounding elements, user action

2. **Add to Icon component** (5 mins)
   - Add SVG string to `Icon.tsx` with descriptive name
   - Optimize: Remove metadata, ensure consistent viewBox (24x24)
   - Use relative units, avoid hardcoded colors

3. **Replace emoji in code** (10 mins)
   - Import Icon component
   - Replace emoji with `<Icon name="..." size={N} color={colors.text} />`
   - Adjust size to match or improve upon emoji

4. **Test in app** (10 mins)
   - Rebuild if needed (first time only for react-native-svg)
   - View icon in context on iOS/Android
   - Check at different sizes, with different text

5. **Iterate or approve** (5-10 mins)
   - If icon doesn't feel right, generate new variations
   - Once approved, document any style decisions
   - Move to next icon

**Icon Replacement Order (Priority):**

1. **Books (📚)** - Empty deck state - [app/study/[id].tsx:345](app/study/[id].tsx#L345) ✅ *Phase 1 POC done*
2. **Play/Study (▶️)** - Study button - [components/decks/DeckCard.tsx:90](components/decks/DeckCard.tsx#L90)
3. **Edit (✏️)** - Edit button - [components/decks/DeckCard.tsx:103](components/decks/DeckCard.tsx#L103)
4. **Sparkles (✨)** - All caught up state - [app/study/[id].tsx:363](app/study/[id].tsx#L363)
5. **Party (🎉)** - Session complete - [components/study/StudyCompletion.tsx:23](components/study/StudyCompletion.tsx#L23)
6. **Pin (📌)** - Default deck marker - [components/decks/DeckCard.tsx:63](components/decks/DeckCard.tsx#L63)
7. **Check (✓)** - Correct answer - [components/study/StudyCompletion.tsx:41](components/study/StudyCompletion.tsx#L41)
8. **X (✗)** - Incorrect answer - [components/study/StudyCompletion.tsx:41](components/study/StudyCompletion.tsx#L41)

**Style Guidelines (Develop as you go):**

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

### Installation

```bash
# Install react-native-svg
pnpm add react-native-svg

# Rebuild native apps
pnpm ios-rebuild  # For iOS
pnpm android      # For Android (may need clean build)
```

### Folder Structure

Create new directories:

```
/assets
  /icons
    /svg              # Raw SVG files from AI tools
      books.svg
      sparkles.svg
      party.svg
      play.svg
      edit.svg
      pin.svg
      check.svg
      x.svg
    /optimized        # SVGO-processed versions (optional)

/components
  /common
    Icon.tsx          # Wrapper component for custom SVG icons
```

### Icon Component

Create `/components/common/Icon.tsx`:

```typescript
import { SvgXml } from 'react-native-svg';

const SVG_ICONS = {
  books: `<svg viewBox="0 0 24 24">...</svg>`,
  sparkles: `<svg viewBox="0 0 24 24">...</svg>`,
  // ... other icons
} as const;

type IconName = keyof typeof SVG_ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon = ({ name, size = 24, color = '#000' }: IconProps) => {
  return (
    <SvgXml
      xml={SVG_ICONS[name]}
      width={size}
      height={size}
      color={color}
    />
  );
};
```

### Files to Modify

1. **components/decks/DeckCard.tsx** (lines 63, 90, 103)
   - Replace `📌` with `<Icon name="pin" size={16} />`
   - Replace `▶️` with `<Icon name="play" size={16} />`
   - Replace `✏️` with `<Icon name="edit" size={16} />`

2. **app/study/[id].tsx** (lines 345, 363)
   - Replace `📚` with `<Icon name="books" size={48} />`
   - Replace `✨` with `<Icon name="sparkles" size={48} />`

3. **components/study/StudyCompletion.tsx** (lines 23, 41)
   - Replace `🎉` with `<Icon name="party" size={64} />`
   - Replace `✓` with `<Icon name="check" size={20} />`
   - Replace `✗` with `<Icon name="x" size={20} />`

4. **components/decks/**tests**/DeckCard.test.tsx**
   - Update test assertions to look for Icon component instead of emoji text
   - May need to add test-id props to Icon component

## Implementation Order (Iterative Approach)

### Phase 1: Proof of Concept ✅ COMPLETE

- [x] Generate 5 icon style variations for books icon
- [x] Install react-native-svg
- [x] Create Icon component with SvgXml
- [x] Replace books emoji in empty deck state
- [x] Test on iOS simulator
- [x] Validate approach and select style direction

### Phase 2: Action Buttons (One at a time)

**Icon 2: Play/Study Button**

- [ ] Generate 3-5 variations for play/study icon (▶️ → arrow, path, or flow)
- [ ] Add winning variation to Icon component
- [ ] Replace emoji in DeckCard.tsx:90
- [ ] Test in app (view deck list, click study button)
- [ ] Refine if needed

**Icon 3: Edit Button**

- [ ] Generate 3-5 variations for edit icon (✏️ → pen, brush, or pencil)
- [ ] Add winning variation to Icon component
- [ ] Replace emoji in DeckCard.tsx:103
- [ ] Test in app (view deck list, click edit button)
- [ ] Refine if needed

### Phase 3: Empty States (One at a time)

**Icon 4: Sparkles (All Caught Up)**

- [ ] Generate 3-5 variations for sparkles icon (✨ → light, enlightenment glow)
- [ ] Add winning variation to Icon component
- [ ] Replace emoji in app/study/[id].tsx:363
- [ ] Test in app (complete all cards in a deck)
- [ ] Refine if needed

**Icon 5: Party (Session Complete)**

- [ ] Generate 3-5 variations for celebration icon (🎉 → lotus bloom, peaceful celebration)
- [ ] Add winning variation to Icon component
- [ ] Replace emoji in StudyCompletion.tsx:23
- [ ] Test in app (complete a study session)
- [ ] Refine if needed

### Phase 4: Status Indicators (One at a time)

**Icon 6: Pin (Default Deck)**

- [ ] Generate 3-5 variations for pin/bookmark icon (📌)
- [ ] Add winning variation to Icon component
- [ ] Replace emoji in DeckCard.tsx:63
- [ ] Test in app (view deck list with "All" deck)
- [ ] Refine if needed

**Icon 7: Checkmark (Correct Answer)**

- [ ] Generate 3-5 variations for check icon (✓)
- [ ] Add winning variation to Icon component
- [ ] Replace emoji in StudyCompletion.tsx:41
- [ ] Test in app (complete session, view stats)
- [ ] Refine if needed

**Icon 8: X Mark (Incorrect Answer)**

- [ ] Generate 3-5 variations for X icon (✗)
- [ ] Add winning variation to Icon component
- [ ] Replace emoji in StudyCompletion.tsx:41
- [ ] Test in app (complete session, view stats)
- [ ] Refine if needed

### Phase 5: Polish & Documentation

- [ ] Update DeckCard.test.tsx to recognize Icon components
- [ ] Run full test suite: `pnpm test`
- [ ] Create `/docs/design/ICON_STYLE_GUIDE.md` documenting:
  - Line weight, corner radius, level of detail
  - Buddhist symbolism usage guidelines
  - Icon grid size and padding rules
  - Color usage approach
- [ ] Document color palette in style guide
- [ ] Finalize brand color palette
- [ ] Export all icon SVG source files
- [ ] Consider: Update app icon to match new style (future)

## Testing & Verification

### Visual Testing

- [ ] Build and run on iOS simulator
- [ ] Build and run on Android emulator
- [ ] Check each icon at different screen sizes
- [ ] Verify colors match or improve upon emojis
- [ ] Test dark mode (if applicable)

### Functional Testing

- [ ] Verify all buttons with new icons are clickable
- [ ] Run test suite: `pnpm test`
- [ ] Update failing tests to recognize Icon components
- [ ] Verify no console warnings about SVG markup

### Accessibility Testing

- [ ] Ensure WCAG AA color contrast (4.5:1 for text, 3:1 for UI)
- [ ] Consider adding accessibility labels to Icon component
- [ ] Test with screen reader if possible

### Performance Testing

- [ ] Check app bundle size before/after
- [ ] Monitor render performance with React DevTools
- [ ] Verify smooth scrolling in lists with many icons

## Success Criteria

- [ ] All 6 emojis replaced with custom icons
- [ ] Icons render correctly on iOS and Android
- [ ] Icons match established spiritual/Buddhist aesthetic
- [ ] Icon style guide documented
- [ ] Brand color palette defined
- [ ] All tests passing
- [ ] No performance degradation
- [ ] Icons feel cohesive and purposeful for the target audience

## Future Considerations

If the icon set grows beyond ~15-20 icons, migrate to **SVG Transformer**:

- Install `react-native-svg-transformer`
- Configure metro.config.js
- Import SVGs as components: `import BookIcon from '@/assets/icons/svg/books.svg'`
- Better TypeScript checking and tree-shaking

## Estimated Effort

- **Icon Design (AI-assisted):** 4-6 hours
- **Technical Implementation:** 3-4 hours
- **Testing & Refinement:** 2-3 hours
- **Brand Documentation:** 1-2 hours

**Total: 10-15 hours** spread across ~1-2 weeks for thoughtful iteration
