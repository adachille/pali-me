import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ItemCard } from "../ItemCard";
import type { Item } from "@/db";

const mockItem: Item = {
  id: 1,
  type: "word",
  pali: "dhamma",
  meaning: "teaching, doctrine",
  notes: null,
  createdAt: new Date("2024-01-01"),
};

describe("ItemCard", () => {
  it("renders pali text", () => {
    render(<ItemCard item={mockItem} onPress={jest.fn()} />);

    expect(screen.getByText("dhamma")).toBeTruthy();
  });

  it("renders meaning", () => {
    render(<ItemCard item={mockItem} onPress={jest.fn()} />);

    expect(screen.getByText("teaching, doctrine")).toBeTruthy();
  });

  it("renders type badge", () => {
    render(<ItemCard item={mockItem} onPress={jest.fn()} />);

    expect(screen.getByText("word")).toBeTruthy();
  });

  it("calls onPress with item when pressed", () => {
    const onPress = jest.fn();
    render(<ItemCard item={mockItem} onPress={onPress} />);

    fireEvent.press(screen.getByTestId("item-card-dhamma"));

    expect(onPress).toHaveBeenCalledWith(mockItem);
  });

  it("renders different type badges correctly", () => {
    const prefixItem: Item = { ...mockItem, type: "prefix", pali: "a-" };
    render(<ItemCard item={prefixItem} onPress={jest.fn()} />);

    expect(screen.getByText("prefix")).toBeTruthy();
  });
});
