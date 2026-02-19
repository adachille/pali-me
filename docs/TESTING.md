# Testing Guide for pali-me

This guide covers testing philosophy, best practices, and common patterns for the pali-me Expo application.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Mocking Patterns](#mocking-patterns)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## Overview

We use the following testing tools:

- **Jest** - Test runner and assertion library
- **React Testing Library** - Testing utilities for React components
- **jest-expo** - Expo preset for Jest configuration

### Testing Philosophy

- Write tests that resemble how users interact with your app
- Focus on testing behavior, not implementation details
- Avoid testing third-party libraries
- Keep tests simple and readable
- Test one thing at a time

## Test Structure

Tests are organized using the `__tests__` directory pattern, colocated with the code they test:

```
app/
├── (tabs)/
│   └── __tests__/
│       ├── index.test.tsx          # Home screen tests
│       └── library.test.tsx        # Library screen tests
├── item/
│   └── __tests__/
│       ├── [id].test.tsx           # Edit item screen tests
│       └── add.test.tsx            # Add item screen tests
components/
└── items/
    └── __tests__/
        ├── EmptyState.test.tsx
        ├── ItemCard.test.tsx
        ├── ItemForm.test.tsx
        └── ItemTypePicker.test.tsx
db/
└── repositories/
    └── __tests__/
        └── itemRepository.test.ts  # Repository unit tests
test-utils/
├── index.ts                        # Exports all test utilities
├── mocks.ts                        # Mock factories
├── render.tsx                      # Custom render with providers
└── setup.ts                        # Global test setup
```

### File Naming Conventions

- Unit tests: `ComponentName.test.tsx`
- Repository tests: `repositoryName.test.ts`
- Integration tests: `feature.integration.test.tsx`
- Test utilities: `test-utils/`

## Writing Tests

### Basic Component Test

```tsx
import { render, screen } from "@/test-utils";
import MyComponent from "../MyComponent";

describe("MyComponent", () => {
  it("displays the correct text", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeTruthy();
  });
});
```

### Testing User Interactions

```tsx
import { render, fireEvent } from "@/test-utils";
import Button from "../Button";

describe("Button", () => {
  it("calls handler when pressed", () => {
    const handlePress = jest.fn();
    const { getByText } = render(<Button onPress={handlePress} title="Click Me" />);

    fireEvent.press(getByText("Click Me"));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Async Behavior

```tsx
import { render, waitFor } from "@/test-utils";
import AsyncComponent from "../AsyncComponent";

describe("AsyncComponent", () => {
  it("loads data asynchronously", async () => {
    const { getByText } = render(<AsyncComponent />);

    await waitFor(() => {
      expect(getByText("Loaded Data")).toBeTruthy();
    });
  });
});
```

## Mocking Patterns

### Mocking Expo Router

For components that use Expo Router hooks:

```tsx
// At the top of your test file
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    id: "123",
  }),
}));
```

Or use the provided utility:

```tsx
import { createMockRouter } from "@/test-utils";

const mockRouter = createMockRouter({
  push: jest.fn(),
});
```

### Mocking SQLite

For components and repositories that use the database:

```tsx
import { createMockSQLiteContext } from "@/test-utils";

// Create a mock with default empty responses
const mockDb = createMockSQLiteContext();

// Create with specific overrides
const mockDb = createMockSQLiteContext({
  getAllAsync: jest.fn().mockResolvedValue([
    {
      id: 1,
      type: "word",
      pali: "dhamma",
      meaning: "teaching",
      notes: null,
      created_at: "2024-01-01T00:00:00.000Z",
    },
  ]),
});

// Mock the expo-sqlite module
jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDb,
}));
```

### Mocking Expo Modules

#### expo-image

```tsx
jest.mock("expo-image", () => ({
  Image: "Image",
}));
```

#### @expo/vector-icons

```tsx
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
}));
```

#### react-native-reanimated

```tsx
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});
```

## Best Practices

### Do's ✅

- **Test behavior, not implementation**

  ```tsx
  // Good
  expect(screen.getByText("Welcome")).toBeTruthy();

  // Avoid
  expect(component.state.isLoaded).toBe(true);
  ```

- **Use accessible queries**

  ```tsx
  // Good - accessible and resilient
  screen.getByLabelText("Username");
  screen.getByRole("button", { name: "Submit" });

  // Less ideal - brittle
  screen.getByTestId("username-input");
  ```

- **Clean up after tests**
  ```tsx
  afterEach(() => {
    jest.clearAllMocks();
  });
  ```

### Don'ts ❌

- Don't test third-party libraries
- Don't test implementation details
- Don't use snapshot tests for complex components
- Don't mock everything - only what's necessary

## Common Patterns

### Testing Navigation Flows

```tsx
import { render, fireEvent } from "@/test-utils";
import NavigationScreen from "../NavigationScreen";

jest.mock("expo-router");

describe("Navigation Flow", () => {
  it("navigates to details on button press", () => {
    const mockRouter = { push: jest.fn() };
    require("expo-router").useRouter = () => mockRouter;

    const { getByText } = render(<NavigationScreen />);
    fireEvent.press(getByText("View Details"));

    expect(mockRouter.push).toHaveBeenCalledWith("/details");
  });
});
```

### Testing Forms

```tsx
import { render, fireEvent } from "@/test-utils";
import LoginForm from "../LoginForm";

describe("LoginForm", () => {
  it("submits form with valid data", () => {
    const handleSubmit = jest.fn();
    const { getByPlaceholderText, getByText } = render(<LoginForm onSubmit={handleSubmit} />);

    fireEvent.changeText(getByPlaceholderText("Email"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.press(getByText("Login"));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });
});
```

### Testing Lists

```tsx
import { render } from "@/test-utils";
import ItemList from "../ItemList";

describe("ItemList", () => {
  const items = [
    { id: "1", title: "Item 1" },
    { id: "2", title: "Item 2" },
  ];

  it("renders all items", () => {
    const { getByText } = render(<ItemList items={items} />);

    items.forEach((item) => {
      expect(getByText(item.title)).toBeTruthy();
    });
  });
});
```

### Testing Repositories

Repository tests use `createMockSQLiteContext` to mock the database and verify SQL queries:

```tsx
import { createMockSQLiteContext } from "@/test-utils";
import * as itemRepository from "../itemRepository";

describe("itemRepository", () => {
  let mockDb: ReturnType<typeof createMockSQLiteContext>;

  beforeEach(() => {
    mockDb = createMockSQLiteContext();
    jest.clearAllMocks();
  });

  it("creates item with study states and deck assignment", async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1,
      type: "word",
      pali: "dhamma",
      meaning: "teaching",
      notes: null,
      created_at: "2024-01-01T00:00:00.000Z",
    });

    const result = await itemRepository.create(mockDb, {
      type: "word",
      pali: "dhamma",
      meaning: "teaching",
    });

    // Verify item insert, study state creation, and deck assignment
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO items"),
      expect.any(Array)
    );
    expect(result.pali).toBe("dhamma");
  });
});
```

### Testing Screens with Navigation

Screens that use `useFocusEffect` need a `NavigationContainer` wrapper:

```tsx
import { NavigationContainer } from "@react-navigation/native";

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <NavigationContainer>{children}</NavigationContainer>;
}

render(<LibraryScreen />, { wrapper: TestWrapper });
```

## Test Utilities

The `test-utils/` directory provides:

- **render**: Custom render function with providers
- **createMockRouter**: Mock router factory for navigation tests
- **createMockSQLiteContext**: Mock SQLite database context factory
- **waitForAsync**: Helper for async operations
- **testFixtures**: Common test data

Example:

```tsx
import { render, createMockRouter, testFixtures } from "@/test-utils";
```

## Coverage Goals

While we don't enforce strict coverage percentages, aim for:

- **Critical paths**: 80%+ coverage
- **UI components**: Basic smoke tests (renders without crashing)
- **Utilities/helpers**: High coverage (90%+)
- **Edge cases**: Test error boundaries and failure states

Run `pnpm run test:coverage` to see current coverage.

## Debugging Tests

### Running Specific Tests

```bash
# Run tests matching a pattern
pnpm test -- index.test

# Run tests in a specific file
pnpm test -- app/__tests__/index.test.tsx

# Run tests in watch mode
pnpm run test:watch
```

### Console Logging

```tsx
import { debug } from "@/test-utils";

it("debugs component output", () => {
  const { debug } = render(<MyComponent />);
  debug(); // Prints the rendered component tree
});
```

## Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)
- [Testing Expo Router](https://docs.expo.dev/router/reference/testing/)
