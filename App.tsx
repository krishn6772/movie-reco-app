import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RootNavigator from "./src/navigation/RootNavigator";
import { ThemeProvider } from "./src/theme/ThemeProvider";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
