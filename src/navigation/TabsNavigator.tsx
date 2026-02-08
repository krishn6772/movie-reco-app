import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { TabsParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import WatchlistScreen from "../screens/WatchlistScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { useTheme } from "../theme/useTheme";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator<TabsParamList>();

export default function TabsNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: "home",
            Search: "search",
            Watchlist: "bookmark",
            Profile: "person",
          };
          const name = map[route.name] ?? "ellipse";
          return <Ionicons name={name} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
