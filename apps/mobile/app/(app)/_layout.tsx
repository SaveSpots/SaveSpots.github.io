import { useCallback, useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Text, View, ActivityIndicator } from "react-native";
import { colors } from "@savespots/tokens";
import { getProfile, type Profile } from "@savespots/shared";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { WaiverScreen } from "../../lib/waiver";

function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{glyph}</Text>;
}

export default function AppLayout() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!session) return;
    try {
      setProfile(await getProfile(supabase, session.user.id));
    } finally {
      setChecking(false);
    }
  }, [session]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.themeRed.DEFAULT} />
      </View>
    );
  }

  // One-time waiver gate: no app access until the waiver is signed.
  if (session && profile && !profile.waiver_signed_at) {
    return (
      <WaiverScreen
        userId={session.user.id}
        fullName={profile.full_name}
        onSigned={() => {
          // Dismiss immediately; the refetch below just confirms.
          setProfile((p) =>
            p ? { ...p, waiver_signed_at: new Date().toISOString() } : p,
          );
          loadProfile();
        }}
      />
    );
  }

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
