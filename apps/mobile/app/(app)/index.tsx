import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Link, useRouter } from "expo-router";
import * as Location from "expo-location";
import { colors, radius } from "@savespots/tokens";
import { getNearbySaveboxes, type NearbySavebox } from "@savespots/shared";
import { supabase } from "../../lib/supabase";

// Chicago fallback if location permission denied (brand's home city).
const FALLBACK = { lat: 41.8781, lng: -87.6298 };

export default function Nearby() {
  const router = useRouter();
  const [boxes, setBoxes] = useState<NearbySavebox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      let coords = FALLBACK;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
      const rows = await getNearbySaveboxes(supabase, coords.lat, coords.lng);
      setBoxes(rows);
    } catch (e: any) {
      setError(e?.message ?? "Could not load SaveBoxes.");
    } finally {
      setLoading(false);
    }
  }, []);

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
    <View className="flex-1 bg-cream">
      <FlatList
        data={boxes}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        ListHeaderComponent={
          <View className="mb-3 flex-row gap-3">
            <Link href="/(app)/new" asChild>
              <Pressable
                className="flex-1 items-center bg-theme-red active:bg-theme-red-light"
                style={{ borderRadius: radius.button, paddingVertical: 12 }}
              >
                <Text className="font-semibold text-white">Log a SaveBox</Text>
              </Pressable>
            </Link>
            <Link href="/(app)/submissions" asChild>
              <Pressable
                className="flex-1 items-center border border-theme-red active:opacity-70"
                style={{ borderRadius: radius.button, paddingVertical: 12 }}
              >
                <Text className="font-semibold text-theme-red">My submissions</Text>
              </Pressable>
            </Link>
          </View>
        }
        ListEmptyComponent={
          <Text className="mt-10 text-center text-theme-red-dark/60">
            {error ?? "No active SaveBoxes nearby yet."}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(app)/box/${item.id}`)}
            className="mb-3 bg-white p-4 active:opacity-80"
            style={{ borderRadius: radius.card }}
          >
            <Text className="font-display text-lg font-bold text-theme-red-dark">
              {item.name}
            </Text>
            <Text className="mt-1 text-sm text-theme-red-dark/70">
              {item.address}, {item.city}
            </Text>
            <Text className="mt-2 text-xs font-semibold text-theme-red">
              {(item.distance_m / 1000).toFixed(1)} km away
              {item.hours ? ` · ${item.hours}` : ""}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
