// Mock utilities for Expo Router, SQLite, and common modules in pali-me

// ============================================================================
// SQLite Mocks
// ============================================================================

/**
 * Creates a mock SQLite database context for testing
 * Matches the interface returned by useSQLiteContext from expo-sqlite
 */
export function createMockSQLiteContext(overrides = {}) {
  return {
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ changes: 0, lastInsertRowId: 0 }),
    execAsync: jest.fn().mockResolvedValue(undefined),
    withTransactionAsync: jest.fn().mockImplementation(async (callback: () => Promise<void>) => {
      await callback();
    }),
    ...overrides,
  };
}

/**
 * Default mock SQLite context instance for use in tests
 */
export const mockSQLiteContext = createMockSQLiteContext();

// ============================================================================
// Expo Router Mocks
// ============================================================================

/**
 * Creates a mock router object for Expo Router testing
 * Use this in tests that need to simulate navigation
 */
export function createMockRouter(overrides = {}) {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    setParams: jest.fn(),
    ...overrides,
  };
}

/**
 * Creates mock search params for route testing
 */
export function createMockSearchParams(params: Record<string, string> = {}) {
  return params;
}

/**
 * Helpers for async testing with proper waiting
 */
export const waitForAsync = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Common test data fixtures
 */
export const testFixtures = {
  sampleText: "Test content for pali-me",
  navigationPaths: {
    home: "/",
  },
};
