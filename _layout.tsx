import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00D4FF",
        tabBarInactiveTintColor: "#666666",
        tabBarStyle: {
          backgroundColor: "#050B18",
          borderTopWidth: 0,
          height: Platform.OS === "android" ? 60 : 80,
          paddingBottom: Platform.OS === "android" ? 10 : 25,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Shield",
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
