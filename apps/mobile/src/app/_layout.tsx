import { ApolloProvider } from "@apollo/client/react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { apolloClient } from "@/lib/apollo-client";
import { session } from "@/lib/auth/session";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Restore persisted mobile session once at app start so authenticated
  // GraphQL requests work even before the user visits the Account tab.
  useEffect(() => {
    void session.hydrate();
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </ApolloProvider>
  );
}
