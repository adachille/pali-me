import React from "react";
import { render, screen } from "@testing-library/react-native";
import { StudyCard } from "../StudyCard";
import type { StudyCard as StudyCardType } from "@/db/types";

const mockCard: StudyCardType = {
  studyStateId: 1,
  itemId: 10,
  direction: "pali_to_meaning",
  pali: "dhamma",
  meaning: "teaching",
  type: "word",
  interval: 1,
  ease: 2.5,
  due: new Date("2024-01-01"),
};

describe("StudyCard", () => {
  it("renders the card container", () => {
    render(<StudyCard card={mockCard} showAnswer={false} />);

    expect(screen.getByTestId("study-card")).toBeTruthy();
  });

  it("displays type badge", () => {
    render(<StudyCard card={mockCard} showAnswer={false} />);

    expect(screen.getByText("word")).toBeTruthy();
  });

  it("shows pali as prompt for pali_to_meaning direction", () => {
    render(<StudyCard card={mockCard} showAnswer={false} />);

    expect(screen.getByTestId("study-card-prompt")).toHaveTextContent("dhamma");
    expect(screen.getByText("What is the meaning?")).toBeTruthy();
  });

  it("shows meaning as prompt for meaning_to_pali direction", () => {
    const meaningFirstCard: StudyCardType = {
      ...mockCard,
      direction: "meaning_to_pali",
    };
    render(<StudyCard card={meaningFirstCard} showAnswer={false} />);

    expect(screen.getByTestId("study-card-prompt")).toHaveTextContent("teaching");
    expect(screen.getByText("What is the Pali?")).toBeTruthy();
  });

  it("hides answer when showAnswer is false", () => {
    render(<StudyCard card={mockCard} showAnswer={false} />);

    expect(screen.queryByTestId("study-card-answer")).toBeNull();
  });

  it("shows answer when showAnswer is true", () => {
    render(<StudyCard card={mockCard} showAnswer={true} />);

    expect(screen.getByTestId("study-card-answer")).toHaveTextContent("teaching");
  });

  it("shows pali as answer for meaning_to_pali direction", () => {
    const meaningFirstCard: StudyCardType = {
      ...mockCard,
      direction: "meaning_to_pali",
    };
    render(<StudyCard card={meaningFirstCard} showAnswer={true} />);

    expect(screen.getByTestId("study-card-answer")).toHaveTextContent("dhamma");
  });
});
