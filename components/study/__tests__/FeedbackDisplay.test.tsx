import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { FeedbackDisplay } from "../FeedbackDisplay";

describe("FeedbackDisplay", () => {
  const defaultProps = {
    userAnswer: "teaching",
    correctAnswer: "teaching",
    isCorrect: true,
    onMarkCorrect: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders feedback container", () => {
    render(<FeedbackDisplay {...defaultProps} />);

    expect(screen.getByTestId("feedback-display")).toBeTruthy();
  });

  it("shows correct indicator when answer is correct", () => {
    render(<FeedbackDisplay {...defaultProps} />);

    expect(screen.getByText("Correct!")).toBeTruthy();
    expect(screen.getByText("✓")).toBeTruthy();
  });

  it("shows incorrect indicator when answer is wrong", () => {
    render(<FeedbackDisplay {...defaultProps} isCorrect={false} userAnswer="wrong" />);

    expect(screen.getByText("Incorrect")).toBeTruthy();
    expect(screen.getByText("✗")).toBeTruthy();
  });

  it("displays user answer", () => {
    render(<FeedbackDisplay {...defaultProps} userAnswer="my answer" />);

    expect(screen.getByTestId("feedback-user-answer")).toHaveTextContent("my answer");
  });

  it("shows correct answer when incorrect", () => {
    render(
      <FeedbackDisplay
        {...defaultProps}
        isCorrect={false}
        userAnswer="wrong"
        correctAnswer="right"
      />
    );

    expect(screen.getByTestId("feedback-correct-answer")).toHaveTextContent("right");
  });

  it("hides correct answer section when correct", () => {
    render(<FeedbackDisplay {...defaultProps} />);

    expect(screen.queryByTestId("feedback-correct-answer")).toBeNull();
  });

  it("shows Mark as Correct button when incorrect", () => {
    render(<FeedbackDisplay {...defaultProps} isCorrect={false} />);

    expect(screen.getByTestId("feedback-mark-correct")).toBeTruthy();
  });

  it("hides Mark as Correct button when correct", () => {
    render(<FeedbackDisplay {...defaultProps} />);

    expect(screen.queryByTestId("feedback-mark-correct")).toBeNull();
  });

  it("calls onMarkCorrect when button pressed", () => {
    const onMarkCorrect = jest.fn();
    render(<FeedbackDisplay {...defaultProps} isCorrect={false} onMarkCorrect={onMarkCorrect} />);

    fireEvent.press(screen.getByTestId("feedback-mark-correct"));

    expect(onMarkCorrect).toHaveBeenCalled();
  });

  it("calls onNext when Next Card button pressed", () => {
    const onNext = jest.fn();
    render(<FeedbackDisplay {...defaultProps} onNext={onNext} />);

    fireEvent.press(screen.getByTestId("feedback-next"));

    expect(onNext).toHaveBeenCalled();
  });
});
