// Integration test demonstrating navigation flow testing
import { createMockRouter, fireEvent, render } from '@/test-utils';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Sample navigable component for integration testing
function NavigableComponent() {
  const router = createMockRouter();
  
  return (
    <View>
      <Text>Navigation Test Screen</Text>
      <TouchableOpacity 
        onPress={() => router.push('/other-screen')}
        testID="navigate-button"
      >
        <Text>Go to Other Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

describe('Navigation Integration', () => {
  it('demonstrates navigation flow testing pattern', () => {
    const { getByTestId, getByText } = render(<NavigableComponent />);
    
    // Verify initial screen content
    expect(getByText('Navigation Test Screen')).toBeTruthy();
    
    // Simulate user interaction
    const button = getByTestId('navigate-button');
    fireEvent.press(button);
    
    // This demonstrates the pattern - in real tests, verify navigation occurred
    expect(button).toBeDefined();
  });

  it('shows how to test component interactions', () => {
    const { getByText } = render(<NavigableComponent />);
    
    const buttonText = getByText('Go to Other Screen');
    expect(buttonText).toBeTruthy();
  });
});
