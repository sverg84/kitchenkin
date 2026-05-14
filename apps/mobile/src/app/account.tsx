import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useGoogleSignIn } from "@/lib/auth/google";
import { session, useSession } from "@/lib/auth/session";

export default function AccountScreen() {
  const state = useSession();
  const google = useGoogleSignIn();

  useEffect(() => {
    // Restore any persisted session on first mount.
    if (state.status === "loading") {
      void session.hydrate();
    }
  }, [state.status]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Account
        </ThemedText>

        {state.status === "loading" ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : state.status === "authenticated" ? (
          <SignedInPanel />
        ) : (
          <SignedOutPanel
            status={google.status}
            error={google.error}
            onSignIn={google.signIn}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function SignedInPanel() {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="subtitle">You&apos;re signed in</ThemedText>
      <ThemedText type="small">
        Your mobile session is active. Future authenticated queries will include
        your bearer token automatically.
      </ThemedText>
      <Pressable
        onPress={() => {
          void session.signOut();
        }}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <ThemedText type="link">Sign out</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

interface SignedOutPanelProps {
  status: ReturnType<typeof useGoogleSignIn>["status"];
  error: string | null;
  onSignIn: () => Promise<void>;
}

function SignedOutPanel({ status, error, onSignIn }: SignedOutPanelProps) {
  const busy = status === "prompting" || status === "exchanging";
  const disabled =
    busy || status === "configuring" || status === "unconfigured";

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="subtitle">Sign in</ThemedText>
      <ThemedText type="small">
        Sign in with Google to sync your KitchenKin recipes across devices.
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => {
          void onSignIn();
        }}
        style={({ pressed }) => [
          styles.button,
          (pressed || busy) && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {busy ? (
          <ActivityIndicator />
        ) : (
          <ThemedText type="link">
            {status === "unconfigured"
              ? "Google sign-in unavailable"
              : "Continue with Google"}
          </ThemedText>
        )}
      </Pressable>

      {error ? (
        <ThemedText type="small" themeColor="textSecondary">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    width: "100%",
  },
  title: {
    textAlign: "center",
    paddingVertical: Spacing.three,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
