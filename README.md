# pali-me

![Tests](https://github.com/adachille/pali-me/actions/workflows/test.yml/badge.svg)
![E2E Tests](https://github.com/adachille/pali-me/actions/workflows/maestro-e2e.yml/badge.svg)

App to learn the Pali language

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm start
   ```

3. Run on specific platforms:

   ```bash
   pnpm run android  # Android emulator/device
   pnpm run ios      # iOS simulator/device
   pnpm run web      # Web browser
   ```

## Testing

This project uses Jest and React Testing Library for testing.

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (useful during development)
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

See `docs/TESTING.md` for detailed testing guidelines and patterns.

## End-to-End Testing

This project uses Maestro for E2E testing to validate user flows across iOS, Android, and Web platforms.

### Prerequisites

- **Maestro CLI**: Install via `curl -Ls "https://get.maestro.mobile.dev" | bash`
- **Simulators/Emulators**:
  - iOS: Xcode with iOS Simulator (macOS only)
  - Android: Android Studio with Android Virtual Device

### Running E2E Tests

```bash
# 1. Start the Expo development server
pnpm start

# 2. In another terminal, launch your platform
pnpm run ios      # For iOS simulator
pnpm run android  # For Android emulator

# 3. Run Maestro tests
pnpm run maestro

# Run with JUnit output for CI integration
pnpm run maestro:ios      # iOS with JUnit format
```

### Debugging E2E Tests

Use Maestro Studio for interactive debugging:

```bash
maestro studio
```

This allows you to:

- Inspect UI element hierarchy
- Test selectors before adding to flows
- Record interactions to generate test commands

For comprehensive E2E testing documentation, see [`E2E_TESTING.md`](docs/E2E_TESTING.md).

### CI/CD Integration

E2E tests run automatically on every pull request via GitHub Actions for iOS. These tests are informational and won't block PR merges. Test results and screenshots are available as workflow artifacts.

## Project Structure

- `app/` - Application screens using Expo Router
- `test-utils/` - Testing utilities and mocks
- `assets/` - Images, fonts, and other static assets

## Development

- **Formatting**: Run `pnpm format` to format code with Prettier
- **Linting**: Run `pnpm lint` to check and fix code style with ESLint
- **TypeScript**: Strict mode enabled for type safety
- **React Compiler**: Enabled for automatic optimizations

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code style, formatting, linting, and the pull request process.
