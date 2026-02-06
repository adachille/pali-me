// Tests for the library screen (app/(tabs)/library.tsx)
import React from "react";
import { render, screen } from "@/test-utils";
import LibraryScreen from "../library";

describe("Library Screen", () => {
  it("displays without errors", () => {
    render(<LibraryScreen />);

    expect(screen.root).toBeTruthy();
  });

  it("shows the library title", () => {
    render(<LibraryScreen />);

    const title = screen.getByText("Library");
    expect(title).toBeTruthy();
  });

  it("has the library-screen testID", () => {
    render(<LibraryScreen />);

    const libraryScreen = screen.getByTestId("library-screen");
    expect(libraryScreen).toBeTruthy();
  });
});
