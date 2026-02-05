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
npm start

# Start on specific platform
npm run android  # Android emulator/device
npm run ios      # iOS simulator/device
npm run web      # Web browser

# Linting
npm run lint
```

## Architecture

### Routing

The app uses Expo Router with file-based routing. Routes are defined in the `app/` directory:

- `app/_layout.tsx` - Root layout component using Stack navigation
- `app/index.tsx` - Home screen

The router is configured with:

- Typed routes enabled (`typedRoutes: true`)
- Custom URL scheme: `palime://`

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
- **Expo modules**: Font, Haptics, Image, Linking, System UI, Web Browser, etc.

## Development Notes

- The app uses Expo's new architecture, which enables React Compiler and improved performance
- All navigation is file-based through Expo Router - add new routes by creating files in `app/`
- TypeScript strict mode is enabled - all code must be properly typed
