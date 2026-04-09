import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ItemTypePicker } from "../ItemTypePicker";

describe("ItemTypePicker", () => {
  it("renders all type options", () => {
    render(<ItemTypePicker value="word" onChange={jest.fn()} />);

    expect(screen.getByText("Word")).toBeTruthy();
    expect(screen.getByText("Prefix")).toBeTruthy();
    expect(screen.getByText("Suffix")).toBeTruthy();
    expect(screen.getByText("Root")).toBeTruthy();
    expect(screen.getByText("Particle")).toBeTruthy();
  });

  it("renders Type label", () => {
    render(<ItemTypePicker value="word" onChange={jest.fn()} />);

    expect(screen.getByText("Type")).toBeTruthy();
  });

  it("calls onChange when option is pressed", () => {
    const onChange = jest.fn();
    render(<ItemTypePicker value="word" onChange={onChange} />);

    fireEvent.press(screen.getByTestId("type-option-prefix"));

    expect(onChange).toHaveBeenCalledWith("prefix");
  });

  it("has correct testID", () => {
    render(<ItemTypePicker value="word" onChange={jest.fn()} />);

    expect(screen.getByTestId("item-type-picker")).toBeTruthy();
  });
});
