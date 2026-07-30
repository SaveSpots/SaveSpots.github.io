import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { Link, useRouter } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, type MapPressEvent, type MarkerPressEvent } from "react-native-maps";
import { colors, radius } from "@savespots/tokens";
import {
  estimateTravel,
  fetchTravelTimes,
  formatMiles,
  getNearbySaveboxes,
  lastCheckinSummary,
  stalenessRank,
  timeAgo,
  type NearbySavebox,
  type TravelEstimate,
} from "@savespots/shared";

// Where /api/eta lives. The Routes API key is server-side there, never in this app.
const ETA_BASE = process.env.EXPO_PUBLIC_ETA_BASE_URL ?? "https://savespots.org";
import { supabase } from "../../lib/supabase";

// Chicago fallback if location permission denied (brand's home city).
const FALLBACK = { lat: 41.8781, lng: -87.6298 };
// Wide radius so the map has markers even outside the immediate area.
const MAP_RADIUS_M = 50000;

type LatLng = { lat: number; lng: number };

/** Great-circle distance in meters between two points. */
function haversineM(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Open turn-by-turn directions in the platform's maps app. */
function openDirections(box: NearbySavebox) {
  const label = encodeURIComponent(box.name);
  const url = Platform.select({
    ios: `maps://app?daddr=${box.lat},${box.lng}&q=${label}`,
    android: `google.navigation:q=${box.lat},${box.lng}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${box.lat},${box.lng}`,
  });
  Linking.openURL(url).catch(() =>
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${box.lat},${box.lng}`,
    ),
  );
}

export default function MapHome() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [boxes, setBoxes] = useState<NearbySavebox[]>([]);
  const [origin, setOrigin] = useState<LatLng>(FALLBACK);
  const [closest, setClosest] = useState<NearbySavebox[]>([]);
  // Routed times keyed by box id. Starts as the straight-line estimate and is
  // replaced when /api/eta answers, so the panel never waits on the network.
  const [travel, setTravel] = useState<Record<string, TravelEstimate>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [sortMode, setSortMode] = useState<"nearest" | "stale">("nearest");

  // What the bottom panel shows: nearest 3 to the user/tapped point, or the 3
  // most overdue boxes (never-checked first, then oldest check-in).
  const displayed = useMemo(() => {
    if (sortMode === "stale") {
      return [...boxes]
        .sort((a, b) => stalenessRank(a.last_checked_at) - stalenessRank(b.last_checked_at))
        .slice(0, 3);
    }
    return closest;
  }, [sortMode, boxes, closest]);

  /** Ask /api/eta for routed times for the shown boxes; falls back internally. */
  const refreshTravel = useCallback(async (from: LatLng, list: NearbySavebox[]) => {
    if (list.length === 0) return;
    const times = await fetchTravelTimes(
      ETA_BASE,
      from,
      list.map((b) => ({ lat: b.lat, lng: b.lng })),
      list.map((b) => b.distance_m),
    );
    setTravel((prev) => {
      const next = { ...prev };
      list.forEach((b, i) => {
        if (times[i]) next[b.id] = times[i];
      });
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      let coords = FALLBACK;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationDenied(false);
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } else {
        setLocationDenied(true);
      }
      setOrigin(coords);
      const rows = await getNearbySaveboxes(supabase, coords.lat, coords.lng, MAP_RADIUS_M);
      setBoxes(rows);
      // Show the 3 closest boxes to the user right away (RPC returns nearest first).
      const nearest = rows.slice(0, 3);
      setClosest(nearest);
      refreshTravel(coords, nearest);
      // Zoom to the user and their nearest boxes (not every pin in the region).
      const focus = [
        { latitude: coords.lat, longitude: coords.lng },
        ...nearest.map((b) => ({ latitude: b.lat, longitude: b.lng })),
      ];
      requestAnimationFrame(() => {
        mapRef.current?.fitToCoordinates(focus, {
          edgePadding: { top: 120, right: 80, bottom: 260, left: 80 },
          animated: true,
        });
      });
    } catch (e: any) {
      setError(e?.message ?? "Could not load SaveBoxes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Keep routed times fresh for whatever the panel currently shows.
  useEffect(() => {
    if (displayed.length) refreshTravel(origin, displayed);
  }, [displayed, origin, refreshTravel]);

  /** Tap anywhere (or a marker): show the 3 closest boxes to that point. */
  const selectAt = useCallback(
    (point: LatLng) => {
      const ranked = boxes
        .map((b) => ({ ...b, distance_m: haversineM(point, { lat: b.lat, lng: b.lng }) }))
        .sort((a, b) => a.distance_m - b.distance_m)
        .slice(0, 3);
      setClosest(ranked);
      // Times are from the tapped point, not the user, so they must be re-fetched.
      refreshTravel(point, ranked);
    },
    [boxes, refreshTravel],
  );

  const onMapPress = useCallback(
    (e: MapPressEvent) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      selectAt({ lat: latitude, lng: longitude });
    },
    [selectAt],
  );

  const onMarkerPress = useCallback(
    (e: MarkerPressEvent) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      selectAt({ lat: latitude, lng: longitude });
    },
    [selectAt],
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.themeRed.DEFAULT} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: origin.lat,
          longitude: origin.lng,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation
        onPress={onMapPress}
      >
        {boxes.map((b) => (
          <Marker
            key={b.id}
            coordinate={{ latitude: b.lat, longitude: b.lng }}
            title={b.name}
            description={`${b.address}, ${b.city}`}
            onPress={onMarkerPress}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            {/* Custom view instead of the default pin: Apple Maps hides
                colliding default pins as you zoom; custom views stay visible. */}
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.themeRed.DEFAULT,
                borderWidth: 3,
                borderColor: colors.white,
              }}
            />
          </Marker>
        ))}
      </MapView>

      {/* Top action buttons overlaid on the map */}
      <View
        className="absolute left-4 right-4 flex-row gap-3"
        style={{ top: 12 }}
        pointerEvents="box-none"
      >
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
            className="flex-1 items-center border border-theme-red bg-white active:opacity-70"
            style={{ borderRadius: radius.button, paddingVertical: 12 }}
          >
            <Text className="font-semibold text-theme-red">My submissions</Text>
          </Pressable>
        </Link>
      </View>

      {/* Location permission notice */}
      {locationDenied ? (
        <View
          className="absolute left-4 right-4 bg-white/95 p-3"
          style={{ top: 64, borderRadius: radius.input }}
          pointerEvents="none"
        >
          <Text className="text-center text-xs font-semibold text-theme-red">
            Location is off — showing Chicago. Enable it in Settings › Expo Go › Location
            to see SaveSpots near you.
          </Text>
        </View>
      ) : null}

      {/* Bottom panel: 3 closest boxes to the tapped point.
          Sized deliberately large — this is the screen's primary answer ("where do I
          go, and how far is it"), and the map behind it is context. fitToCoordinates
          above reserves 260px of bottom padding so pins never hide under it. */}
      {displayed.length > 0 ? (
        <View
          className="absolute bottom-5 left-3 right-3 bg-white px-4 pb-4 pt-3"
          style={{
            borderRadius: radius.card,
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: 10,
          }}
        >
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-display text-xl font-bold text-theme-red-dark">
              {sortMode === "stale" ? "Needs a check-in" : "Closest SaveSpots to you"}
            </Text>
            <Pressable onPress={() => setClosest([])} hitSlop={16}>
              <Text className="text-sm font-semibold text-theme-red-dark/50">Close</Text>
            </Pressable>
          </View>

          {/* Sort toggle */}
          <View
            className="mb-1 flex-row overflow-hidden"
            style={{ borderRadius: radius.button, borderWidth: 1, borderColor: colors.themeRed.DEFAULT }}
          >
            {(["nearest", "stale"] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => setSortMode(m)}
                className={sortMode === m ? "flex-1 items-center bg-theme-red" : "flex-1 items-center bg-white"}
                style={{ paddingVertical: 8 }}
              >
                <Text
                  className={
                    sortMode === m
                      ? "text-xs font-semibold text-white"
                      : "text-xs font-semibold text-theme-red"
                  }
                >
                  {m === "nearest" ? "Nearest" : "Longest since checked"}
                </Text>
              </Pressable>
            ))}
          </View>

          {displayed.map((b) => {
            const t = travel[b.id] ?? estimateTravel(b.distance_m);
            return (
              <View
                key={b.id}
                className="mt-3 flex-row items-center border-t border-theme-red-dark/10 pt-3"
              >
                {/* Last check-in photo thumbnail — tap opens full history */}
                <Pressable onPress={() => router.push(`/(app)/box/${b.id}`)}>
                  {b.last_photo_url ? (
                    <Image
                      source={{ uri: b.last_photo_url }}
                      style={{ width: 48, height: 48, borderRadius: 8, marginRight: 10 }}
                    />
                  ) : (
                    <View
                      className="items-center justify-center bg-cream"
                      style={{ width: 48, height: 48, borderRadius: 8, marginRight: 10 }}
                    >
                      <Text className="text-[10px] text-theme-red-dark/40">no photo</Text>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  className="flex-1 pr-3 active:opacity-70"
                  onPress={() => router.push(`/(app)/box/${b.id}`)}
                >
                  <Text
                    className="text-base font-semibold text-theme-red-dark"
                    numberOfLines={1}
                  >
                    {b.name}
                  </Text>
                  <Text className="mt-0.5 text-sm font-bold text-theme-red">
                    {formatMiles(t.meters)} · {t.estimated ? "~" : ""}
                    {t.label}
                  </Text>
                  {/* Last check-in: when + what happened */}
                  <Text
                    className={
                      b.last_needs_restock
                        ? "mt-0.5 text-xs font-semibold text-theme-red"
                        : "mt-0.5 text-xs text-theme-red-dark/60"
                    }
                    numberOfLines={1}
                  >
                    {timeAgo(b.last_checked_at)} · {lastCheckinSummary(b)}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => openDirections(b)}
                  className="items-center bg-theme-red active:bg-theme-red-light"
                  style={{
                    borderRadius: radius.button,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text className="text-sm font-semibold text-white">Go</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : (
        <View
          className="absolute bottom-4 left-4 right-4 items-center bg-white/95 p-3"
          style={{ borderRadius: radius.card }}
          pointerEvents="none"
        >
          <Text className="text-xs text-theme-red-dark/60">
            {error ??
              (boxes.length === 0
                ? "No active SaveBoxes in this area yet."
                : "Tap the map or a pin to see the 3 closest SaveBoxes.")}
          </Text>
        </View>
      )}
    </View>
  );
}
