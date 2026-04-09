import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { StackLayout } from "../StackLayout";

const mockBack = jest.fn();

jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    Stack: ({
      children,
      screenOptions,
    }: {
      children: React.ReactNode;
      screenOptions?: { headerLeft?: () => React.ReactNode };
    }) => (
      <View>
        {screenOptions?.headerLeft?.()}
        {children}
      </View>
    ),
    useRouter: () => ({ back: mockBack }),
  };
});

describe("StackLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children", () => {
    render(
      <StackLayout>
        <Text>Test Screen</Text>
      </StackLayout>
    );

    expect(screen.getByText("Test Screen")).toBeTruthy();
  });

  it("renders back button with default testID", () => {
    render(
      <StackLayout>
        <Text>Screen</Text>
      </StackLayout>
    );

    expect(screen.getByTestId("back-button")).toBeTruthy();
  });

  it("renders back button with custom testID", () => {
    render(
      <StackLayout backButtonTestID="study-back-button">
        <Text>Screen</Text>
      </StackLayout>
    );

    expect(screen.getByTestId("study-back-button")).toBeTruthy();
  });

  it("calls router.back when back button is pressed", () => {
    render(
      <StackLayout>
        <Text>Screen</Text>
      </StackLayout>
    );

    fireEvent.press(screen.getByTestId("back-button"));

    expect(mockBack).toHaveBeenCalled();
  });
});
