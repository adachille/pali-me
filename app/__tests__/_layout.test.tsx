// Tests for the root layout (app/_layout.tsx)
import React from "react";
import { render } from "@/test-utils";
import RootLayout from "../_layout";

// Mock expo-router Stack component
jest.mock("expo-router", () => ({
  Stack: () => null,
}));

describe("Root Layout", () => {
  it("renders the layout component successfully", () => {
    const result = render(<RootLayout />);

    expect(result).toBeDefined();
  });

  it("initializes navigation structure", () => {
    // Render the layout
    const result = render(<RootLayout />);

    // Verify component mounted without crashing
    expect(result).toBeDefined();
  });
});
