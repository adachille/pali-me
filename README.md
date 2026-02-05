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

### Writing Tests

Tests are located in `__tests__` directories next to the code they test. For example:
- `app/__tests__/index.test.tsx` - Tests for the home screen
- `app/__tests__/_layout.test.tsx` - Tests for the root layout

#### Test Utilities

Import test utilities from `@/test-utils`:

```tsx
import { render, screen, fireEvent } from '@/test-utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
```

#### Mocking Navigation

Use the provided mock utilities for Expo Router:

```tsx
import { createMockRouter } from '@/test-utils';

// In your test
const mockRouter = createMockRouter({
  push: jest.fn(),
});
```

See `TESTING.md` for more detailed testing guidelines and patterns.

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
pnpm run maestro:android  # Android with JUnit format
```

### Test Flows

Current E2E test coverage includes:

- **Application Launch** (`01-app-launches.yaml`) - Validates app initialization and home screen rendering
- **Navigation** (`02-navigation-flow.yaml`) - Tests screen transitions and routing
- **User Interactions** (`03-basic-interaction.yaml`) - Validates gestures, taps, and scrolling

### Debugging E2E Tests

Use Maestro Studio for interactive debugging:

```bash
maestro studio
```

This allows you to:
- Inspect UI element hierarchy
- Test selectors before adding to flows
- Record interactions to generate test commands

For comprehensive E2E testing documentation, see [`E2E_TESTING.md`](./E2E_TESTING.md).

### CI/CD Integration

E2E tests run automatically on every pull request via GitHub Actions on both iOS and Android platforms. These tests are informational and won't block PR merges. Test results and screenshots are available as workflow artifacts.

## Project Structure

- `app/` - Application screens using Expo Router
- `test-utils/` - Testing utilities and mocks
- `assets/` - Images, fonts, and other static assets

## Development

- **Linting**: Run `pnpm run lint` to check code style
- **TypeScript**: Strict mode enabled for type safety
- **React Compiler**: Enabled for automatic optimizations

