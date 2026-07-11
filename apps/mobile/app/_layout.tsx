import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@savespots/tokens";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.themeRed.DEFAULT },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.cream.DEFAULT },
        }}
      >
        <Stack.Screen name="index" options={{ title: "SaveSpots" }} />
      </Stack>
    </>
  );
}
