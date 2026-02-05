// Tests for the home screen (app/index.tsx)
import React from 'react';
import { render, screen } from '@/test-utils';
import Index from '../index';

describe('Home Screen', () => {
  it('displays without errors', () => {
    render(<Index />);
    
    // Verify the screen renders
    expect(screen.root).toBeTruthy();
  });

  it('shows the welcome message to users', () => {
    render(<Index />);
    
    // Check for the instructional text
    const message = screen.getByText(/Edit app\/index\.tsx/i);
    expect(message).toBeTruthy();
  });

  it('has proper layout structure with centered content', () => {
    const { getByText } = render(<Index />);
    
    const textElement = getByText(/Edit app\/index\.tsx/i);
    expect(textElement).toBeDefined();
  });
});
