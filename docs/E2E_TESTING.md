# End-to-End Testing Guide for Pali-Me

This guide covers E2E testing for the Pali language learning application using Maestro.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests Locally](#running-tests-locally)
- [Writing New Test Flows](#writing-new-test-flows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Pali-Me uses Maestro for end-to-end testing to ensure the application works correctly from a user's perspective across iOS, Android, and Web platforms.

**Current Test Coverage:**
- Application launch and initialization
- Screen navigation and routing
- Basic user interactions (tap, scroll, gestures)

## Prerequisites

Before running E2E tests, ensure you have:

1. **Maestro CLI** - Mobile UI testing framework
2. **Platform Simulators/Emulators:**
   - iOS: Xcode with iOS Simulator (macOS only)
   - Android: Android Studio with AVD emulator
3. **Node.js** (v20 or higher)
4. **pnpm** package manager

## Installation

### Install Maestro CLI

**macOS/Linux:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH:$HOME/.maestro/bin"
```

**Verify installation:**
```bash
maestro --version
```

### Setup Simulators/Emulators

**iOS Simulator (macOS):**
```bash
# List available simulators
xcrun simctl list devices

# Boot a specific simulator
xcrun simctl boot "iPhone 15"
```

**Android Emulator:**
```bash
# List available AVDs
emulator -list-avds

# Start an emulator
emulator -avd Pixel_6_API_34
```

## Running Tests Locally

### Step 1: Start the Expo Development Server

```bash
pnpm start
```

Wait for the QR code and metro bundler to appear.

### Step 2: Launch Simulator/Emulator

Choose your platform:

**iOS:**
```bash
# Press 'i' in the Expo terminal, or:
pnpm run ios
```

**Android:**
```bash
# Press 'a' in the Expo terminal, or:
pnpm run android
```

### Step 3: Run Maestro Tests

In a new terminal window:

```bash
# Run all test flows
pnpm run maestro

# Run specific test flow
maestro test .maestro/01-app-launches.yaml

# Run with JUnit output for CI
pnpm run maestro:ios     # iOS with JUnit format
pnpm run maestro:android # Android with JUnit format
```

## Writing New Test Flows

### File Structure

Place test flows in `.maestro/` directory with descriptive names:

```
.maestro/
├── config.yaml
├── 01-app-launches.yaml
├── 02-navigation-flow.yaml
├── 03-basic-interaction.yaml
└── 04-your-new-flow.yaml
```

### Basic Flow Structure

```yaml
# Flow description and metadata
# Description: What this test validates
# Platform: iOS, Android, Web

---
# Test steps go here
# Note: App is already running when tests start (pre-launched by Expo CLI)
- assertVisible: "Expected text"
- tapOn: "Button"
```

**Important:** The Pali-Me E2E tests assume the app is already running. We don't use `launchApp` or `appId` in the flows because the app is pre-launched via Expo CLI before Maestro tests execute.

### Element Selection Strategies

Maestro offers multiple ways to select elements:

**1. Using testID (Recommended):**
```yaml
- tapOn:
    id: "lesson-button"
- assertVisible:
    id: "lesson-screen"
```

Add testID to React Native components:
```tsx
<TouchableOpacity testID="lesson-button">
  <Text>Start Lesson</Text>
</TouchableOpacity>
```

**2. Using visible text:**
```yaml
- assertVisible: "Welcome to Pali"
- tapOn: "Start Learning"
```

**3. Using accessibility labels:**
```yaml
- tapOn:
    accessibilityLabel: "Navigate to vocabulary"
```

**4. Using point coordinates (last resort):**
```yaml
- tapOn:
    point: "50%,80%"
```

### Common Actions

```yaml
# Navigation
- launchApp
- back
- pressKey: Back

# Assertions
- assertVisible: "Text to find"
- assertNotVisible: "Hidden text"
- assertVisible:
    id: "element-id"

# Interactions
- tapOn: "Button text"
- tapOn:
    id: "button-id"
- longPressOn:
    id: "item-to-long-press"
- swipe:
    direction: LEFT
- scroll
- scrollUntilVisible:
    element:
      id: "target-element"

# Input
- inputText: "Text to type"
- eraseText

# Screenshots
- takeScreenshot: "descriptive-name"

# Wait/Timing
- waitForAnimationToEnd
- wait: 2000  # milliseconds
```

### Handling Platform Differences

Use conditional execution for platform-specific behavior:

```yaml
# iOS-specific action
- runFlow:
    when:
      platform: iOS
    commands:
      - pressKey: Back

# Android-specific action  
- runFlow:
    when:
      platform: Android
    commands:
      - back
```

## Best Practices

### 1. Use Meaningful testIDs

Add `testID` props to all interactive elements and key screens:

```tsx
// Good
<View testID="vocabulary-list-screen">
  <Pressable testID="word-card-001">
    <Text testID="pali-word">Metta</Text>
  </Pressable>
</View>

// Avoid
<View>
  <Pressable>
    <Text>Metta</Text>
  </Pressable>
</View>
```

### 2. Handle Animations and Timing

Always wait for animations to complete:

```yaml
- tapOn: "Show Details"
- waitForAnimationToEnd
- assertVisible: "Detail View"
```

Or use explicit waits:

```yaml
- tapOn: "Load Data"
- wait: 1000
- assertVisible: "Data loaded"
```

### 3. Make Tests Resilient

Use scroll to find elements that might be off-screen:

```yaml
- scrollUntilVisible:
    element:
      id: "target-element"
    direction: DOWN
- tapOn:
    id: "target-element"
```

### 4. Capture Screenshots for Debugging

Take screenshots at critical points:

```yaml
- takeScreenshot: "before-action"
- tapOn: "Critical Button"
- waitForAnimationToEnd
- takeScreenshot: "after-action"
```

### 5. Keep Flows Focused

Each test flow should validate one specific user journey:

- ✅ Good: `vocabulary-browse-and-search.yaml`
- ❌ Avoid: `all-app-features.yaml`

### 6. Use Descriptive Names and Comments

```yaml
# Validate user can complete their first lesson
# Prerequisites: Fresh app install, no user data
# Expected: User sees lesson completion screen

appId: host.exp.Exponent
---
- launchApp
# ... rest of flow
```

## Troubleshooting

### Tests Fail to Launch App

**Problem:** `Unable to launch app with appId: host.exp.Exponent`

**Solutions:**
1. Ensure Expo dev server is running (`pnpm start`)
2. Verify simulator/emulator is booted and visible
3. Check that app is already open in Expo Go
4. Try `maestro test --device <device-id> .maestro`

### Element Not Found Errors

**Problem:** `Element with id 'home-screen' not found`

**Solutions:**
1. Verify `testID` prop is correctly added to component
2. Wait for screen to render: Add `waitForAnimationToEnd`
3. Check element is actually visible (not hidden or off-screen)
4. Use `maestro studio` to inspect the UI hierarchy

### Timing Issues

**Problem:** Tests pass locally but fail in CI

**Solutions:**
1. Increase wait times for slower CI environments
2. Use `waitForAnimationToEnd` instead of fixed waits
3. Add `scrollUntilVisible` for elements that might load async

### Maestro Studio for Debugging

Launch interactive mode to inspect your app:

```bash
maestro studio
```

This opens a UI where you can:
- See the current screen hierarchy
- Test selectors before adding them to flows
- Record interactions to generate flow commands

### Platform-Specific Issues

**iOS Simulator Keyboard:**
If keyboard doesn't appear:
- Toggle simulator keyboard: `Cmd + K`
- Enable software keyboard in simulator settings

**Android Emulator Performance:**
If tests are slow:
- Use hardware acceleration (HAXM/KVM)
- Increase emulator RAM in AVD settings
- Use x86_64 images instead of ARM

## CI/CD Integration

The E2E tests run automatically on every pull request via GitHub Actions.

**Workflow Files:**
- `.github/workflows/maestro-e2e.yml`

**Behavior:**
- Tests run on both iOS (macOS) and Android (Linux) runners
- Tests are **informational only** - they won't block PR merges
- Test results and screenshots are uploaded as artifacts
- Artifacts are retained for 14 days

**Viewing Results:**
1. Go to the PR "Checks" tab
2. Find "E2E Maestro Validation"
3. Click on job (iOS or Android)
4. Download artifacts to view screenshots and JUnit reports

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro with Expo](https://maestro.mobile.dev/platform-support/expo)
- [Maestro Best Practices](https://maestro.mobile.dev/best-practices/best-practices)
- [Maestro API Reference](https://maestro.mobile.dev/api-reference/commands)

## Contributing

When adding new features to Pali-Me:

1. Add `testID` props to new components
2. Create corresponding test flows in `.maestro/`
3. Run tests locally before submitting PR
4. Update this guide if you discover new patterns or solutions
