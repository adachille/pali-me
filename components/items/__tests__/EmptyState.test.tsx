import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders empty state message", () => {
    render(<EmptyState onAddPress={jest.fn()} />);

    expect(screen.getByText("No items yet")).toBeTruthy();
  });

  it("renders subtitle text", () => {
    render(<EmptyState onAddPress={jest.fn()} />);

    expect(screen.getByText(/Start building your Pali vocabulary/)).toBeTruthy();
  });

  it("renders add button", () => {
    render(<EmptyState onAddPress={jest.fn()} />);

    expect(screen.getByText("Add your first item")).toBeTruthy();
  });

  it("calls onAddPress when button is pressed", () => {
    const onAddPress = jest.fn();
    render(<EmptyState onAddPress={onAddPress} />);

    fireEvent.press(screen.getByTestId("add-first-item-button"));

    expect(onAddPress).toHaveBeenCalled();
  });

  it("has correct testID", () => {
    render(<EmptyState onAddPress={jest.fn()} />);

    expect(screen.getByTestId("empty-state")).toBeTruthy();
  });
});
