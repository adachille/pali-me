import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { StudyCompletion } from "../StudyCompletion";

describe("StudyCompletion", () => {
  const defaultProps = {
    totalCards: 10,
    correctCount: 8,
    onBackToHome: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders completion screen", () => {
    render(<StudyCompletion {...defaultProps} />);

    expect(screen.getByTestId("study-completion")).toBeTruthy();
  });

  it("displays congratulatory message", () => {
    render(<StudyCompletion {...defaultProps} />);

    expect(screen.getByText("Great job!")).toBeTruthy();
  });

  it("displays total cards studied", () => {
    render(<StudyCompletion {...defaultProps} />);

    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("Cards Studied")).toBeTruthy();
  });

  it("calculates and displays accuracy percentage", () => {
    render(<StudyCompletion {...defaultProps} />);

    expect(screen.getByText("80%")).toBeTruthy();
    expect(screen.getByText("Accuracy")).toBeTruthy();
  });

  it("handles 100% accuracy", () => {
    render(<StudyCompletion {...defaultProps} correctCount={10} />);

    expect(screen.getByText("100%")).toBeTruthy();
  });

  it("handles 0% accuracy", () => {
    render(<StudyCompletion {...defaultProps} correctCount={0} />);

    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("handles zero total cards without division error", () => {
    render(<StudyCompletion totalCards={0} correctCount={0} onBackToHome={jest.fn()} />);

    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("calls onBackToHome when button pressed", () => {
    const onBackToHome = jest.fn();
    render(<StudyCompletion {...defaultProps} onBackToHome={onBackToHome} />);

    fireEvent.press(screen.getByTestId("completion-back-home"));

    expect(onBackToHome).toHaveBeenCalled();
  });

  it("displays breakdown of correct and incorrect", () => {
    render(<StudyCompletion {...defaultProps} />);

    expect(screen.getByText(/✓ 8 correct/)).toBeTruthy();
    expect(screen.getByText(/✗ 2 incorrect/)).toBeTruthy();
  });
});
