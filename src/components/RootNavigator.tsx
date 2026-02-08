import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import TabsNavigator from "./TabsNavigator";
import AuthScreen from "../screens/AuthScreen";
import { useAuthStore } from "../store/useAuthStore";
import Loader from "../components/Loader";

export default function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const startAuthListener = useAuthStore((s) => s.startAuthListener);

  useEffect(() => {
    const unsub = startAuthListener();
    return unsub;
  }, [startAuthListener]);

  if (initializing) return <Loader />;

  return <NavigationContainer>{user ? <TabsNavigator /> : <AuthScreen />}</NavigationContainer>;
}
