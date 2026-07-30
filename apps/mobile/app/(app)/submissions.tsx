import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { colors, radius } from "@savespots/tokens";
import {
  getMySubmissions,
  getMyCheckins,
  type Savebox,
  type Restock,
} from "@savespots/shared";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

const STATUS_LABEL: Record<Savebox["status"], string> = {
  pending: "Pending review",
  active: "Active",
  retired: "Retired",
};

type Checkin = Restock & { savebox_name: string };

function checkinLabel(r: Restock): string {
  if (r.box_gone) {
    return r.replaced === true
      ? "Box was gone — replaced it"
      : r.replaced === false
        ? "Box was gone — NOT replaced"
        : "Box was gone";
  }
  if (r.needs_restock) {
    return r.kits_given != null
      ? `Restocked — ${r.kits_given} savekits given`
      : "Needs restock";
  }
  return "Box OK — no restock needed";
}

export default function Submissions() {
  const { session } = useAuth();
  const [boxes, setBoxes] = useState<Savebox[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [b, c] = await Promise.all([
        getMySubmissions(supabase, session!.user.id),
        getMyCheckins(supabase, session!.user.id),
      ]);
      setBoxes(b);
      setCheckins(c);
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
    <ScrollView
      className="flex-1 bg-cream"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
    >
      <Text className="mb-2 font-display text-lg font-bold text-theme-red-dark">
        SaveBoxes I submitted
      </Text>
      {boxes.length === 0 ? (
        <Text className="mb-4 text-sm text-theme-red-dark/60">
          None yet — submit one from the map with "Log a SaveBox".
        </Text>
      ) : (
        boxes.map((item) => (
          <View
            key={item.id}
            className="mb-3 bg-white p-4"
            style={{ borderRadius: radius.card }}
          >
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
        ))
      )}

      <Text className="mb-2 mt-4 font-display text-lg font-bold text-theme-red-dark">
        My check-ins
      </Text>
      {checkins.length === 0 ? (
        <Text className="text-sm text-theme-red-dark/60">
          No check-ins yet — tap a SaveSpot on the map to check in.
        </Text>
      ) : (
        checkins.map((r) => (
          <View
            key={r.id}
            className="mb-2 bg-white p-3"
            style={{ borderRadius: radius.input }}
          >
            <Text className="text-sm font-semibold text-theme-red-dark">
              {r.savebox_name}
            </Text>
            <Text className="mt-0.5 text-sm text-theme-red-dark/80">
              {checkinLabel(r)}
            </Text>
            <Text className="mt-0.5 text-xs text-theme-red-dark/60">
              {new Date(r.reported_at).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
