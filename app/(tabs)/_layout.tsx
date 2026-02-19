import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarButtonTestID: "tab-home",
          tabBarAccessibilityLabel: "tab-home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
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
    </Tabs>
  );
}
