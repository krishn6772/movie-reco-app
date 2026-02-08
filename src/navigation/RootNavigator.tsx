import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";

import TabsNavigator from "./TabsNavigator";
import MovieDetailsScreen from "../screens/MovieDetailsScreen";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

import { useTheme } from "../theme/useTheme";
import { useAuthStore } from "../store/useAuthStore";

import Screen from "../components/Screen";
import Loader from "../components/Loader";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { theme } = useTheme();

  const initAuthListener = useAuthStore((s) => s.initAuthListener);
  const user = useAuthStore((s) => s.user);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  // React Navigation theme (so it matches dark mode)
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  };

  // 🔥 Wait until Firebase confirms login state
  if (!isAuthReady) {
    return (
      <NavigationContainer theme={navTheme}>
        <Screen>
          <Loader />
        </Screen>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {/* ✅ AUTH FLOW */}
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            {/* ✅ MAIN APP */}
            <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="MovieDetails"
              component={MovieDetailsScreen}
              options={{ title: "Details" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
