import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { StudySettingsModal } from "../StudySettingsModal";

describe("StudySettingsModal", () => {
  const defaultProps = {
    visible: true,
    direction: "random" as const,
    endlessMode: false,
    onDirectionChange: jest.fn(),
    onEndlessModeChange: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal when visible", () => {
    render(<StudySettingsModal {...defaultProps} />);

    expect(screen.getByTestId("study-settings-modal")).toBeTruthy();
  });

  it("displays study direction options", () => {
    render(<StudySettingsModal {...defaultProps} />);

    expect(screen.getByText("Pali First")).toBeTruthy();
    expect(screen.getByText("Meaning First")).toBeTruthy();
    expect(screen.getByText("Random")).toBeTruthy();
  });

  it("calls onDirectionChange when option selected", () => {
    const onDirectionChange = jest.fn();
    render(<StudySettingsModal {...defaultProps} onDirectionChange={onDirectionChange} />);

    fireEvent.press(screen.getByTestId("direction-pali_first"));

    expect(onDirectionChange).toHaveBeenCalledWith("pali_first");
  });

  it("displays endless mode toggle", () => {
    render(<StudySettingsModal {...defaultProps} />);

    expect(screen.getByText("Endless Mode")).toBeTruthy();
    expect(screen.getByTestId("endless-mode-toggle")).toBeTruthy();
  });

  it("calls onEndlessModeChange when toggle changed", () => {
    const onEndlessModeChange = jest.fn();
    render(<StudySettingsModal {...defaultProps} onEndlessModeChange={onEndlessModeChange} />);

    fireEvent(screen.getByTestId("endless-mode-toggle"), "valueChange", true);

    expect(onEndlessModeChange).toHaveBeenCalledWith(true);
  });

  it("calls onClose when Done button pressed", () => {
    const onClose = jest.fn();
    render(<StudySettingsModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("settings-close"));

    expect(onClose).toHaveBeenCalled();
  });
});
