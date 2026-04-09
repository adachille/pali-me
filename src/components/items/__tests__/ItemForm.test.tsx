import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { ItemForm } from "../ItemForm";

describe("ItemForm", () => {
  const defaultProps = {
    onSubmit: jest.fn().mockResolvedValue(undefined),
    submitLabel: "Add Item",
    isSubmitting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<ItemForm {...defaultProps} />);

    expect(screen.getByTestId("pali-input")).toBeTruthy();
    expect(screen.getByTestId("meaning-input")).toBeTruthy();
    expect(screen.getByTestId("item-type-picker")).toBeTruthy();
    expect(screen.getByTestId("notes-input")).toBeTruthy();
  });

  it("renders submit button with correct label", () => {
    render(<ItemForm {...defaultProps} />);

    expect(screen.getByText("Add Item")).toBeTruthy();
  });

  it("shows validation errors for empty required fields", async () => {
    render(<ItemForm {...defaultProps} />);

    fireEvent.press(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(screen.getByText("Pali text is required")).toBeTruthy();
      expect(screen.getByText("Meaning is required")).toBeTruthy();
    });
  });

  it("calls onSubmit with form values when valid", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<ItemForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByTestId("pali-input"), "dhamma");
    fireEvent.changeText(screen.getByTestId("meaning-input"), "teaching");
    fireEvent.press(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        pali: "dhamma",
        meaning: "teaching",
        type: "word",
        notes: null,
      });
    });
  });

  it("shows delete button when onDelete is provided", () => {
    render(<ItemForm {...defaultProps} onDelete={jest.fn()} />);

    expect(screen.getByTestId("delete-button")).toBeTruthy();
  });

  it("does not show delete button when onDelete is not provided", () => {
    render(<ItemForm {...defaultProps} />);

    expect(screen.queryByTestId("delete-button")).toBeNull();
  });

  it("calls onDelete when delete button is pressed", () => {
    const onDelete = jest.fn();
    render(<ItemForm {...defaultProps} onDelete={onDelete} />);

    fireEvent.press(screen.getByTestId("delete-button"));

    expect(onDelete).toHaveBeenCalled();
  });

  it("shows Saving text when isSubmitting is true", () => {
    render(<ItemForm {...defaultProps} isSubmitting={true} />);

    expect(screen.getByText("Saving...")).toBeTruthy();
  });

  it("pre-fills form with initialValues", () => {
    render(
      <ItemForm
        {...defaultProps}
        initialValues={{
          pali: "buddha",
          meaning: "awakened one",
          type: "word",
          notes: "Important term",
        }}
      />
    );

    expect(screen.getByDisplayValue("buddha")).toBeTruthy();
    expect(screen.getByDisplayValue("awakened one")).toBeTruthy();
    expect(screen.getByDisplayValue("Important term")).toBeTruthy();
  });
});
