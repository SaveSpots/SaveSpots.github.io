import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, FlatList, Alert } from "react-native";
import { colors, radius } from "@savespots/tokens";
import {
  getActiveVolunteerSession,
  getVolunteerSessions,
  startVolunteerSession,
  stopVolunteerSession,
  type VolunteerSession,
} from "@savespots/shared";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

function fmtDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function sessionMs(s: VolunteerSession): number {
  const end = s.ended_at ? new Date(s.ended_at).getTime() : Date.now();
  return end - new Date(s.started_at).getTime();
}

export default function VolunteerPortal() {
  const { session } = useAuth();
  const [active, setActive] = useState<VolunteerSession | null>(null);
  const [history, setHistory] = useState<VolunteerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    try {
      const [a, h] = await Promise.all([
        getActiveVolunteerSession(supabase, session!.user.id),
        getVolunteerSessions(supabase, session!.user.id),
      ]);
      setActive(a);
      setHistory(h);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  // Tick every second while the timer runs so the elapsed display updates.
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  async function toggle() {
    setBusy(true);
    try {
      if (active) {
        await stopVolunteerSession(supabase, active.id);
        setActive(null);
      } else {
        setActive(await startVolunteerSession(supabase, session!.user.id));
      }
      await load();
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? "Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.themeRed.DEFAULT} />
      </View>
    );
  }

  const totalMs = history.reduce((acc, s) => acc + (s.ended_at ? sessionMs(s) : 0), 0);
  const past = history.filter((s) => s.ended_at);

  return (
    <FlatList
      className="flex-1 bg-cream"
      data={past}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <>
          <View
            className="items-center bg-white p-6"
            style={{ borderRadius: radius.card }}
          >
            <Text className="text-xs font-semibold uppercase text-theme-red-dark/50">
              {active ? "Volunteering for" : "Volunteer timer"}
            </Text>
            <Text className="mt-2 font-display text-5xl font-extrabold text-theme-red-dark">
              {active ? fmtDuration(sessionMs(active)) : "0:00:00"}
            </Text>
            <Pressable
              onPress={toggle}
              disabled={busy}
              className={
                active
                  ? "mt-5 w-full items-center border-2 border-theme-red bg-white active:opacity-70"
                  : "mt-5 w-full items-center bg-theme-red active:bg-theme-red-light"
              }
              style={{ borderRadius: radius.button, paddingVertical: 14, opacity: busy ? 0.6 : 1 }}
            >
              <Text
                className={
                  active ? "font-semibold text-theme-red" : "font-semibold text-white"
                }
              >
                {busy ? "..." : active ? "Stop timer" : "Start volunteering"}
              </Text>
            </Pressable>
          </View>

          <View
            className="mt-4 flex-row items-center justify-between bg-white p-4"
            style={{ borderRadius: radius.input }}
          >
            <Text className="text-sm font-semibold text-theme-red-dark">
              Total time volunteered
            </Text>
            <Text className="font-display text-lg font-bold text-theme-red">
              {fmtDuration(totalMs)}
            </Text>
          </View>

          {past.length > 0 ? (
            <Text className="mb-2 mt-6 font-display text-lg font-bold text-theme-red-dark">
              Past sessions
            </Text>
          ) : null}
        </>
      }
      renderItem={({ item }) => (
        <View
          className="mb-2 flex-row items-center justify-between bg-white p-3"
          style={{ borderRadius: radius.input }}
        >
          <Text className="text-sm text-theme-red-dark">
            {new Date(item.started_at).toLocaleDateString()}{" "}
            {new Date(item.started_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>
          <Text className="text-sm font-semibold text-theme-red">
            {fmtDuration(sessionMs(item))}
          </Text>
        </View>
      )}
    />
  );
}
