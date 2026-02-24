# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native application built with Expo for learning the Pali language. The app uses:

- **Expo SDK 54** with the new architecture enabled
- **Expo Router 6** for file-based routing with typed routes
- **React 19.1.0** and React Native 0.81.5
- **React Compiler** (experimental) for automatic optimization
- TypeScript with strict mode enabled

## Development Commands

```bash
# Start development server
pnpm start

# Start on specific platform
pnpm android  # Android emulator/device
pnpm ios      # iOS simulator/device (dev client)
pnpm ios-rebuild  # Rebuild native iOS project
pnpm web      # Web browser

# Testing
pnpm test              # Run tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage

# Linting & Formatting
pnpm lint
pnpm format              # Format with Prettier
pnpm format:check        # Check formatting

# E2E Testing (Maestro)
pnpm maestro             # Run all Maestro flows
pnpm maestro:ios         # Run Maestro on iOS with JUnit output
```

## Architecture

### Routing

The app uses Expo Router with file-based routing. Routes are defined in the `app/` directory:

- `app/_layout.tsx` - Root layout with Stack navigation
- `app/(tabs)/_layout.tsx` - Tab navigation (Home, Library, Settings)
- `app/(tabs)/index.tsx` - Home screen (deck list with search and sort)
- `app/(tabs)/library.tsx` - Library screen (item list with search)
- `app/(tabs)/settings.tsx` - Settings screen (export/import data)
- `app/item/_layout.tsx` - Item stack layout
- `app/item/add.tsx` - Add new item screen
- `app/item/[id].tsx` - Edit/view item screen
- `app/deck/_layout.tsx` - Deck stack layout
- `app/deck/new.tsx` - Create new deck screen
- `app/deck/[id].tsx` - Deck detail screen (view/manage cards in a deck)

The router is configured with:

- Typed routes enabled (`typedRoutes: true`)
- Custom URL scheme: `palime://`

### Database

The app uses SQLite via `expo-sqlite` for local data storage:

- **db/schema.ts** - Database schema definitions with 4 main tables:
  - `items` - Pali learning items (words, prefixes, suffixes)
  - `study_states` - Spaced repetition state per item/direction
  - `decks` - Named collections of items
  - `deck_items` - Many-to-many join table
- **db/database.ts** - Database initialization and migrations
- **db/types.ts** - TypeScript types for database entities
- **db/repositories/itemRepository.ts** - CRUD operations for items (search, create, update, delete)
- **db/repositories/deckRepository.ts** - CRUD for decks and deck-item associations (create, update, delete decks; add/remove cards)
- **db/repositories/exportRepository.ts** - JSON export/import of all database tables (used by Settings screen)
- **db/utils.ts** - Utility for parsing SQLite datetime strings into JS Date objects (handles UTC timezone)
- See `docs/DATABASE.md` for detailed database documentation

### Testing

Jest testing infrastructure with React Native Testing Library:

- Test files colocated in `__tests__/` directories next to source files
- Test utilities in `test-utils/` for mocks and helpers
- E2E tests with Maestro in `.maestro/` directory:
  - `01-launch-app.yaml` - App launch flow (reusable)
  - `02-flashcard-crud.yaml` - Flashcard CRUD operations
  - `03-deck-management.yaml` - Deck create, rename, add items, and delete
- See `docs/TESTING.md` for unit testing guide
- See `docs/E2E_TESTING.md` for Maestro E2E testing guide

**Running Jest tests**: Jest output is very verbose. To minimize context usage, use flags like `--verbose=false` and pipe to `head` or `tail` to limit output:

```bash
# Run specific tests with minimal output
pnpm test --testPathPattern="path/to/tests" --verbose=false 2>&1 | head -80

# Check just pass/fail summary
pnpm test --testPathPattern="path/to/tests" 2>&1 | tail -15
```

### Configuration

- **app.json** - Expo configuration including:
  - New Architecture enabled (`newArchEnabled: true`)
  - React Compiler enabled (`reactCompiler: true`)
  - Platform-specific settings for iOS, Android, and web
  - Custom splash screen and icon assets in `assets/images/`

### TypeScript

- Path alias `@/*` maps to project root for imports
- Strict mode enabled
- Uses Expo's TypeScript base configuration

### Components

Reusable UI components in `components/items/`:

- **ItemCard** - Display card for an item in the library list
- **ItemForm** - Form for creating/editing items (used by add and edit screens)
- **ItemList** - Scrollable list of items with search
- **ItemTypePicker** - Picker for item type (word, prefix, suffix)
- **EmptyState** - Placeholder when no items exist or search returns no results

Reusable UI components in `components/decks/`:

- **DeckCard** - Display card for a deck in the deck list
- **DeckList** - Scrollable list of decks
- **DeckEmptyState** - Placeholder when no decks exist
- **DeckFormModal** - Modal form for creating/editing decks
- **DeckItemList** - List of cards in a deck with swipe-to-remove
- **DeckSortPicker** - Picker for deck sort order
- **AddItemsModal** - Modal for searching and adding items to a deck

## Key Dependencies

- **Navigation**: `expo-router`, `@react-navigation/native`, `@react-navigation/bottom-tabs`
- **UI/Gestures**: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-worklets`
- **Database**: `expo-sqlite` for local SQLite database
- **File/Sharing**: `expo-file-system`, `expo-document-picker`, `expo-sharing` for data export/import
- **Testing**: `jest`, `jest-expo`, `@testing-library/react-native`, `@testing-library/jest-native`
- **Formatting**: `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`
- **Expo modules**: Font, Haptics, Image, Linking, System UI, Web Browser, etc.
- **Package Manager**: pnpm

## Development Notes

- The app uses Expo's new architecture, which enables React Compiler and improved performance
- All navigation is file-based through Expo Router - add new routes by creating files in `app/`
- TypeScript strict mode is enabled - all code must be properly typed
