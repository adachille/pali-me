import React from "react";
import { render, screen } from "@testing-library/react-native";
import { StudyProgress } from "../StudyProgress";

describe("StudyProgress", () => {
  it("renders progress indicator", () => {
    render(<StudyProgress current={3} total={12} />);

    expect(screen.getByTestId("study-progress")).toBeTruthy();
  });

  it("displays current/total format", () => {
    render(<StudyProgress current={3} total={12} />);

    expect(screen.getByText("3 / 12")).toBeTruthy();
  });

  it("displays infinity symbol in endless mode", () => {
    render(<StudyProgress current={5} total={10} endlessMode={true} />);

    expect(screen.getByText("5 / ∞")).toBeTruthy();
  });

  it("handles edge case of 1/1", () => {
    render(<StudyProgress current={1} total={1} />);

    expect(screen.getByText("1 / 1")).toBeTruthy();
  });
});
