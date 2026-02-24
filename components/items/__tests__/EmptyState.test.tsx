import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  describe("when not searching", () => {
    it("renders empty state message", () => {
      render(<EmptyState onAddPress={jest.fn()} />);

      expect(screen.getByText("No flash cards yet")).toBeTruthy();
    });

    it("renders subtitle text", () => {
      render(<EmptyState onAddPress={jest.fn()} />);

      expect(screen.getByText(/Start building your Pali vocabulary/)).toBeTruthy();
    });

    it("renders add button", () => {
      render(<EmptyState onAddPress={jest.fn()} />);

      expect(screen.getByText("Add your first flash card")).toBeTruthy();
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

  describe("when searching", () => {
    it("renders no results message", () => {
      render(<EmptyState onAddPress={jest.fn()} isSearching />);

      expect(screen.getByText("No flash cards found")).toBeTruthy();
    });

    it("renders search subtitle text", () => {
      render(<EmptyState onAddPress={jest.fn()} isSearching />);

      expect(screen.getByText(/Try a different search term/)).toBeTruthy();
    });

    it("does not render add button", () => {
      render(<EmptyState onAddPress={jest.fn()} isSearching />);

      expect(screen.queryByTestId("add-first-item-button")).toBeNull();
    });

    it("has correct testID", () => {
      render(<EmptyState onAddPress={jest.fn()} isSearching />);

      expect(screen.getByTestId("empty-state")).toBeTruthy();
    });
  });
});
