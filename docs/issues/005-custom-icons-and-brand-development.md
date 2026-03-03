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

### Icon Creation Process

1. **Mood Exploration (1-2 hours)**
   - Create 3-5 style variations for ONE icon (e.g., the 📚 books icon)
   - Try different levels of Buddhist symbolism:
     - Subtle: Clean, minimal book icon with serene proportions
     - Light: Book with lotus petal detail or soft glow
   - Select winning style direction

2. **Style Guidelines (30 mins)**
   - Document: Line weight, corner radius, level of detail
   - Define: Icon grid size (24x24 recommended), safe area padding
   - Capture: Buddhist elements to use (lotus, light rays, mandala patterns)
   - Color approach: Start with single color, plan for palette expansion

3. **Generate Full Set in Batches (2-3 hours)**
   - **Batch 1 - Action buttons (priority 1):**
     - Study/Play (▶️) → Right-pointing design (arrow, path, or flow)
     - Edit (✏️) → Pen or brush with Buddhist simplicity

   - **Batch 2 - Empty states (priority 2):**
     - Books (📚) → Stack of texts or palm leaf manuscripts
     - Sparkles (✨) → Soft light, enlightenment glow
     - Party/Success (🎉) → Lotus bloom, peaceful celebration

   - **Batch 3 - Status indicators (priority 3):**
     - Pin (📌) → Bookmark or marker design
     - Checkmark (✓) → Confident, clear approval
     - X mark (✗) → Gentle negative indicator

4. **Optimize SVGs (30 mins per batch)**
   - Run through SVGO or manual cleanup
   - Remove unnecessary attributes (metadata, comments)
   - Ensure consistent viewBox (24 24 recommended)
   - Use relative units, avoid hardcoded colors where possible

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

## Implementation Order

### Phase 1: Proof of Concept (1-2 days)

- [ ] Generate 1-2 icons in different styles (books or play button)
- [ ] Install react-native-svg
- [ ] Create Icon component with SvgXml
- [ ] Replace ONE emoji in ONE component
- [ ] Test on iOS and Android simulators
- [ ] Validate approach and gather feedback

### Phase 2: Priority Icons (2-3 days)

- [ ] Finalize style direction based on Phase 1 feedback
- [ ] Generate action button icons (play, edit)
- [ ] Generate empty state icons (books, sparkles, party)
- [ ] Optimize SVGs
- [ ] Replace emojis in DeckCard.tsx and app/study/[id].tsx
- [ ] Test on both platforms

### Phase 3: Remaining Icons & Polish (1-2 days)

- [ ] Generate status indicator icons (pin, check, x)
- [ ] Replace remaining emojis in StudyCompletion.tsx
- [ ] Update all tests
- [ ] Create icon style guide documentation
- [ ] Document color palette decisions

### Phase 4: Brand Guidelines (1 day - async)

- [ ] Finalize color palette
- [ ] Create design system documentation
- [ ] Export icon source files to version control
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
