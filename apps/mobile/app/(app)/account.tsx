import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { Link } from "expo-router";
import { colors, radius } from "@savespots/tokens";
import { getProfile, type Profile } from "@savespots/shared";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="mt-3 border-t border-theme-red-dark/10 pt-3">
      <Text className="text-xs font-semibold uppercase text-theme-red-dark/50">{label}</Text>
      <Text className="mt-1 text-base text-theme-red-dark">{value}</Text>
    </View>
  );
}

export default function Account() {
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return; // signed out mid-render; the root gate is redirecting
    try {
      setProfile(await getProfile(supabase, session.user.id));
    } catch {
      // Offline or the request failed. Leave profile null and let the screen
      // render its empty state — an uncaught rejection here would surface as a
      // crash rather than a recoverable error.
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.themeRed.DEFAULT} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 16 }}>
      <View className="bg-white p-4" style={{ borderRadius: radius.card }}>
        <Text className="font-display text-xl font-extrabold text-theme-red-dark">
          {profile?.full_name || "Volunteer"}
        </Text>
        <Row label="Email" value={session?.user.email ?? "—"} />
        <Row label="Role" value={profile?.role ?? "volunteer"} />
        <Row
          label="Member since"
          value={
            profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "—"
          }
        />
      </View>

      <Link href="/(app)/submissions" asChild>
        <Pressable
          className="mt-4 items-center border border-theme-red bg-white active:opacity-70"
          style={{ borderRadius: radius.button, paddingVertical: 13 }}
        >
          <Text className="font-semibold text-theme-red">My submissions</Text>
        </Pressable>
      </Link>

      <Pressable
        onPress={signOut}
        className="mt-3 items-center bg-theme-red active:bg-theme-red-light"
        style={{ borderRadius: radius.button, paddingVertical: 13 }}
      >
        <Text className="font-semibold text-white">Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
