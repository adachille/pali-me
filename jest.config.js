// Custom Jest configuration for pali-me Expo app
module.exports = {
  preset: "jest-expo",

  // TypeScript and module transformation
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  // Module resolution matching tsconfig paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Test file patterns
  testMatch: ["**/__tests__/**/*.(test|spec).[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],

  // Files to collect coverage from
  collectCoverageFrom: ["app/**/*.{ts,tsx}", "!app/**/*.d.ts", "!app/**/__tests__/**"],

  // Coverage thresholds (start low, increase over time)
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },

  // Test environment setup
  setupFilesAfterEnv: ["<rootDir>/test-utils/setup.ts"],

  // Ignore patterns
  testPathIgnorePatterns: ["/node_modules/", "/.expo/"],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  // Timeout for async tests
  testTimeout: 10000,
};
