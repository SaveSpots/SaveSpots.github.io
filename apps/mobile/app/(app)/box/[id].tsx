import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors, radius } from "@savespots/tokens";
import {
  getSavebox,
  getRestocks,
  reportRestock,
  type Savebox,
  type Restock,
} from "@savespots/shared";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/auth";

export default function BoxDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [box, setBox] = useState<Savebox | null>(null);
  const [restocks, setRestocks] = useState<Restock[]>([]);
  const [loading, setLoading] = useState(true);

  // Report form
  const [kits, setKits] = useState("");
  const [needs, setNeeds] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [b, r] = await Promise.all([
        getSavebox(supabase, id),
        getRestocks(supabase, id),
      ]);
      setBox(b);
      setRestocks(r);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    const n = parseInt(kits, 10);
    if (Number.isNaN(n) || n < 0) {
      Alert.alert("Enter kit count", "How many kits are left? (0 or more)");
      return;
    }
    setBusy(true);
    try {
      await reportRestock(supabase, session!.user.id, {
        saveboxId: id!,
        kitsRemaining: n,
        needsRestock: needs,
        note: note.trim() || undefined,
      });
      setKits("");
      setNote("");
      setNeeds(false);
      await load();
      Alert.alert("Reported", "Thanks — the restock was logged.");
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
  if (!box) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <Text className="text-theme-red-dark/60">SaveBox not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 16 }}>
      <View className="bg-white p-4" style={{ borderRadius: radius.card }}>
        <Text className="font-display text-2xl font-extrabold text-theme-red-dark">
          {box.name}
        </Text>
        <Text className="mt-1 text-sm text-theme-red-dark/70">
          {box.address}, {box.city}
        </Text>
        {box.hours ? (
          <Text className="mt-2 text-sm text-theme-red-dark/70">Hours: {box.hours}</Text>
        ) : null}
        {restocks[0] ? (
          <Text className="mt-3 text-xs font-semibold text-theme-red">
            Last restock {new Date(restocks[0].reported_at).toLocaleDateString()} ·{" "}
            {restocks[0].kits_remaining} kits
          </Text>
        ) : (
          <Text className="mt-3 text-xs text-theme-red-dark/50">No restocks logged yet.</Text>
        )}
      </View>

      {/* Report restock */}
      <View className="mt-5 bg-white p-4" style={{ borderRadius: radius.card }}>
        <Text className="font-display text-lg font-bold text-theme-red-dark">
          Report a restock
        </Text>
        <TextInput
          value={kits}
          onChangeText={setKits}
          placeholder="Kits remaining"
          placeholderTextColor={colors.themeRed.dark + "80"}
          keyboardType="number-pad"
          className="mt-3 border border-theme-red-dark/15 px-4 py-3 text-theme-red-dark"
          style={{ borderRadius: radius.input }}
        />
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-sm text-theme-red-dark/80">Needs restock soon</Text>
          <Switch
            value={needs}
            onValueChange={setNeeds}
            trackColor={{ true: colors.themeRed.DEFAULT }}
          />
        </View>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Note (optional)"
          placeholderTextColor={colors.themeRed.dark + "80"}
          multiline
          className="mt-3 border border-theme-red-dark/15 px-4 py-3 text-theme-red-dark"
          style={{ borderRadius: radius.input, minHeight: 60 }}
        />
        <Pressable
          onPress={submit}
          disabled={busy}
          className="mt-4 items-center bg-theme-red active:bg-theme-red-light"
          style={{ borderRadius: radius.button, paddingVertical: 13, opacity: busy ? 0.6 : 1 }}
        >
          <Text className="font-semibold text-white">{busy ? "..." : "Submit report"}</Text>
        </Pressable>
      </View>

      {/* History */}
      <Text className="mb-2 mt-6 font-display text-lg font-bold text-theme-red-dark">
        Restock history
      </Text>
      {restocks.map((r) => (
        <View key={r.id} className="mb-2 bg-white p-3" style={{ borderRadius: radius.input }}>
          <Text className="text-sm font-semibold text-theme-red-dark">
            {r.kits_remaining} kits{r.needs_restock ? " · needs restock" : ""}
          </Text>
          <Text className="text-xs text-theme-red-dark/60">
            {new Date(r.reported_at).toLocaleString()}
          </Text>
          {r.note ? (
            <Text className="mt-1 text-xs text-theme-red-dark/70">{r.note}</Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}
