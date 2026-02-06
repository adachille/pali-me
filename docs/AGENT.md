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
pnpm ios      # iOS simulator/device
pnpm web      # Web browser

# Testing
pnpm test              # Run tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage

# Linting
pnpm lint
```

## Architecture

### Routing

The app uses Expo Router with file-based routing. Routes are defined in the `app/` directory:

- `app/_layout.tsx` - Root layout component using Stack navigation
- `app/index.tsx` - Home screen

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
- See `docs/DATABASE.md` for detailed database documentation

### Testing

Jest testing infrastructure with React Native Testing Library:

- Test files in `app/__tests__/` directory
- Test utilities in `test-utils/` for mocks and helpers
- See `docs/TESTING.md` for detailed testing guide

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

## Key Dependencies

- **Navigation**: `expo-router`, `@react-navigation/native`, `@react-navigation/bottom-tabs`
- **UI/Gestures**: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-worklets`
- **Database**: `expo-sqlite` for local SQLite database
- **Testing**: `jest`, `jest-expo`, `@testing-library/react-native`, `@testing-library/jest-native`
- **Expo modules**: Font, Haptics, Image, Linking, System UI, Web Browser, etc.
- **Package Manager**: pnpm

## Development Notes

- The app uses Expo's new architecture, which enables React Compiler and improved performance
- All navigation is file-based through Expo Router - add new routes by creating files in `app/`
- TypeScript strict mode is enabled - all code must be properly typed
