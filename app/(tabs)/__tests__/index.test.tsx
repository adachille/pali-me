// Tests for the home screen (app/(tabs)/index.tsx)
import React from "react";
import { render, screen } from "@/test-utils";
import HomeScreen from "../index";

describe("Home Screen", () => {
  it("displays without errors", () => {
    render(<HomeScreen />);

    // Verify the screen renders
    expect(screen.root).toBeTruthy();
  });

  it("shows the app title", () => {
    render(<HomeScreen />);

    const title = screen.getByText("Pali Learning App");
    expect(title).toBeTruthy();
  });

  it("has the home-screen testID", () => {
    render(<HomeScreen />);

    const homeScreen = screen.getByTestId("home-screen");
    expect(homeScreen).toBeTruthy();
  });
});
