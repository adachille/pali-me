import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { AnswerInput } from "../AnswerInput";

describe("AnswerInput", () => {
  it("renders text input and submit button", () => {
    render(<AnswerInput onSubmit={jest.fn()} disabled={false} />);

    expect(screen.getByTestId("answer-input")).toBeTruthy();
    expect(screen.getByTestId("answer-submit")).toBeTruthy();
  });

  it("calls onSubmit with answer when button pressed", () => {
    const onSubmit = jest.fn();
    render(<AnswerInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.changeText(screen.getByTestId("answer-input"), "teaching");
    fireEvent.press(screen.getByTestId("answer-submit"));

    expect(onSubmit).toHaveBeenCalledWith("teaching");
  });

  it("does not call onSubmit when answer is empty", () => {
    const onSubmit = jest.fn();
    render(<AnswerInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.press(screen.getByTestId("answer-submit"));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not call onSubmit when answer is only whitespace", () => {
    const onSubmit = jest.fn();
    render(<AnswerInput onSubmit={onSubmit} disabled={false} />);

    fireEvent.changeText(screen.getByTestId("answer-input"), "   ");
    fireEvent.press(screen.getByTestId("answer-submit"));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables input when disabled prop is true", () => {
    render(<AnswerInput onSubmit={jest.fn()} disabled={true} />);

    expect(screen.getByTestId("answer-input").props.editable).toBe(false);
  });
});
