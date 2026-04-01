import { useTheme } from "@/theme";
import type { AppColors } from "@/theme";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function LearnScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container} testID="learn-screen">
      <Text style={styles.placeholder}>Lesson map coming soon</Text>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    placeholder: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
}
