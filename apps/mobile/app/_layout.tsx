import "../global.css";
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@savespots/tokens";
import { AuthProvider, useAuth } from "../lib/auth";

// Redirect between the auth stack and the app stack based on session.
function Gate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";
  // True while the rendered group disagrees with the session — e.g. the app
  // group is still mounted a moment after sign-out, or the login screen is
  // still mounted right after sign-in.
  const redirecting = !loading && (!session ? !inAuthGroup : inAuthGroup);

  useEffect(() => {
    if (loading) return;
    if (!session && !inAuthGroup) router.replace("/(auth)/login");
    else if (session && inAuthGroup) router.replace("/(app)");
  }, [session, loading, inAuthGroup]);

  // Hold the loader until the route matches the session. The redirect above
  // runs in an effect, i.e. AFTER render, so without this the app screens get
  // one render with session === null and crash on session.user.id.
  if (loading || redirecting) {
    return (
      <View className="flex-1 items-center justify-center bg-theme-red">
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Gate />
    </AuthProvider>
  );
}
