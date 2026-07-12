import { Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { colors } from "@savespots/tokens";
import { useAuth } from "../../lib/auth";

export default function AppLayout() {
  const { signOut } = useAuth();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.themeRed.DEFAULT },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.cream.DEFAULT },
        headerRight: () => (
          <Pressable onPress={signOut} hitSlop={10}>
            <Text style={{ color: colors.white, fontWeight: "600" }}>Sign out</Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Nearby SaveBoxes" }} />
      <Stack.Screen name="new" options={{ title: "Log a SaveBox" }} />
      <Stack.Screen name="submissions" options={{ title: "My submissions" }} />
      <Stack.Screen name="box/[id]" options={{ title: "SaveBox" }} />
    </Stack>
  );
}
