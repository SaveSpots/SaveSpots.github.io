import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { colors, radius } from "@savespots/tokens";
import { getMySubmissions, type Savebox } from "@savespots/shared";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

const STATUS_LABEL: Record<Savebox["status"], string> = {
  pending: "Pending review",
  active: "Active",
  retired: "Retired",
};

export default function Submissions() {
  const { session } = useAuth();
  const [rows, setRows] = useState<Savebox[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setRows(await getMySubmissions(supabase, session!.user.id));
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
    <FlatList
      className="flex-1 bg-cream"
      data={rows}
      keyExtractor={(b) => b.id}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <Text className="mt-10 text-center text-theme-red-dark/60">
          You haven't submitted any SaveBoxes yet.
        </Text>
      }
      renderItem={({ item }) => (
        <View className="mb-3 bg-white p-4" style={{ borderRadius: radius.card }}>
          <Text className="font-display text-lg font-bold text-theme-red-dark">
            {item.name}
          </Text>
          <Text className="mt-1 text-sm text-theme-red-dark/70">
            {item.address}, {item.city}
          </Text>
          <Text
            className="mt-2 text-xs font-semibold"
            style={{
              color:
                item.status === "active"
                  ? colors.themeRed.DEFAULT
                  : colors.themeRed.dark + "99",
            }}
          >
            {STATUS_LABEL[item.status]}
          </Text>
        </View>
      )}
    />
  );
}
