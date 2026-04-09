import { Icon } from "@/src/components/common/Icon";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "@/src/theme";

export default function TabLayout() {
  const { colors, colorScheme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        headerShadowVisible: colorScheme === "light",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Learn",
          tabBarButtonTestID: "tab-learn",
          tabBarAccessibilityLabel: "tab-learn",
          tabBarIcon: ({ color, size }) => <Icon name="lotus" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-decks"
        options={{
          title: "My Decks",
          tabBarButtonTestID: "tab-my-decks",
          tabBarAccessibilityLabel: "tab-my-decks",
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarButtonTestID: "tab-library",
          tabBarAccessibilityLabel: "tab-library",
          tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarButtonTestID: "tab-settings",
          tabBarAccessibilityLabel: "tab-settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
