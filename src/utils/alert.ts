import { Alert, Platform } from "react-native";

/**
 * Cross-platform alert that uses window.alert on web and Alert.alert on native.
 */
export function showAlert(title: string, message?: string) {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Cross-platform confirm dialog that uses window.confirm on web and Alert.alert on native.
 * On native, resolves when the user taps confirm; rejects/resolves-false on cancel.
 */
export function showConfirm(
  title: string,
  message: string,
  confirmText = "OK",
  confirmStyle: "default" | "destructive" = "default"
): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: confirmText, style: confirmStyle, onPress: () => resolve(true) },
    ]);
  });
}
