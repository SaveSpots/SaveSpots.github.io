import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@savespots/tokens";

function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{glyph}</Text>;
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.themeRed.DEFAULT },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
        sceneStyle: { backgroundColor: colors.cream.DEFAULT },
        tabBarActiveTintColor: colors.themeRed.DEFAULT,
        tabBarInactiveTintColor: colors.themeRed.dark + "66",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "SaveSpots",
          tabBarLabel: "Map",
          tabBarIcon: ({ color }) => <TabIcon glyph="🗺" color={color} />,
        }}
      />
      <Tabs.Screen
        name="volunteer"
        options={{
          title: "Volunteer Portal",
          tabBarLabel: "Volunteer",
          tabBarIcon: ({ color }) => <TabIcon glyph="⏱" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarLabel: "Account",
          tabBarIcon: ({ color }) => <TabIcon glyph="👤" color={color} />,
        }}
      />
      {/* Screens reachable by navigation but hidden from the tab bar */}
      <Tabs.Screen name="new" options={{ href: null, title: "Log a SaveBox" }} />
      <Tabs.Screen name="submissions" options={{ href: null, title: "My submissions" }} />
      <Tabs.Screen name="box/[id]" options={{ href: null, title: "SaveBox" }} />
    </Tabs>
  );
}
