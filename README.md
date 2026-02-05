# pali-me

![Tests](https://github.com/adachille/pali-me/actions/workflows/test.yml/badge.svg)

App to learn the Pali language

## Getting Started

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on specific platforms:
   ```bash
   npm run android  # Android emulator/device
   npm run ios      # iOS simulator/device
   npm run web      # Web browser
   ```

## Testing

This project uses Jest and React Testing Library for testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Generate coverage report
npm run test:coverage
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

## Project Structure

- `app/` - Application screens using Expo Router
- `test-utils/` - Testing utilities and mocks
- `assets/` - Images, fonts, and other static assets

## Development

- **Linting**: Run `npm run lint` to check code style
- **TypeScript**: Strict mode enabled for type safety
- **React Compiler**: Enabled for automatic optimizations

