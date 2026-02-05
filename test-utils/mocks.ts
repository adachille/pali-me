// Mock utilities for Expo Router and common modules in pali-me

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
export const waitForAsync = (ms = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Common test data fixtures
 */
export const testFixtures = {
  sampleText: 'Test content for pali-me',
  navigationPaths: {
    home: '/',
  },
};

