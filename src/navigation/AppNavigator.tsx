import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabsNavigator from "./TabsNavigator";
import MovieDetailsScreen from "../screens/MovieDetailsScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} options={{ title: "" }} />
    </Stack.Navigator>
  );
}
