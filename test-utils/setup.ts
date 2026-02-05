// Test environment setup for pali-me
import '@testing-library/react-native/extend-expect';

// Silence console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    const message = args[0];
    
    // Filter known non-critical warnings
    if (
      typeof message === 'string' &&
      (message.includes('React.createFactory') ||
       message.includes('componentWillReceiveProps'))
    ) {
      return;
    }
    
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    const message = args[0];
    
    // Filter known non-critical errors
    if (
      typeof message === 'string' &&
      (message.includes('Not implemented: HTMLFormElement.prototype.submit') ||
       message.includes('Warning: ReactDOM.render'))
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
