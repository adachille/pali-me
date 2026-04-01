// Tests for the learn screen (app/(tabs)/index.tsx)
import React from "react";
import { render, screen } from "@testing-library/react-native";
import LearnScreen from "../index";

describe("Learn Screen", () => {
  it("displays without errors", () => {
    render(<LearnScreen />);
    expect(screen.getByTestId("learn-screen")).toBeTruthy();
  });

  it("shows placeholder text", () => {
    render(<LearnScreen />);
    expect(screen.getByText("Lesson map coming soon")).toBeTruthy();
  });
});
