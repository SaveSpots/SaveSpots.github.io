import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { Link, useRouter } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, type MapPressEvent, type MarkerPressEvent } from "react-native-maps";
import { colors, radius } from "@savespots/tokens";
import { getNearbySaveboxes, type NearbySavebox } from "@savespots/shared";
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
      setOrigin(coords);
      const rows = await getNearbySaveboxes(supabase, coords.lat, coords.lng, MAP_RADIUS_M);
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

  /** Tap anywhere (or a marker): show the 3 closest boxes to that point. */
  const selectAt = useCallback(
    (point: LatLng) => {
      const ranked = boxes
        .map((b) => ({ ...b, distance_m: haversineM(point, { lat: b.lat, lng: b.lng }) }))
        .sort((a, b) => a.distance_m - b.distance_m)
        .slice(0, 3);
      setClosest(ranked);
    },
    [boxes],
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
            pinColor={colors.themeRed.DEFAULT}
            onPress={onMarkerPress}
          />
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

      {/* Bottom panel: 3 closest boxes to the tapped point */}
      {closest.length > 0 ? (
        <View
          className="absolute bottom-4 left-4 right-4 bg-white p-3"
          style={{
            borderRadius: radius.card,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 6,
          }}
        >
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-display text-base font-bold text-theme-red-dark">
              Closest SaveBoxes
            </Text>
            <Pressable onPress={() => setClosest([])} hitSlop={10}>
              <Text className="text-sm font-semibold text-theme-red-dark/50">Close</Text>
            </Pressable>
          </View>
          {closest.map((b) => (
            <View
              key={b.id}
              className="mt-2 flex-row items-center justify-between border-t border-theme-red-dark/10 pt-2"
            >
              <Pressable
                className="flex-1 pr-3 active:opacity-70"
                onPress={() => router.push(`/(app)/box/${b.id}`)}
              >
                <Text className="font-semibold text-theme-red-dark" numberOfLines={1}>
                  {b.name}
                </Text>
                <Text className="text-xs text-theme-red-dark/60" numberOfLines={1}>
                  {(b.distance_m / 1000).toFixed(1)} km · {b.address}, {b.city}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => openDirections(b)}
                className="items-center bg-theme-red active:bg-theme-red-light"
                style={{ borderRadius: radius.button, paddingVertical: 8, paddingHorizontal: 14 }}
              >
                <Text className="text-xs font-semibold text-white">Directions</Text>
              </Pressable>
            </View>
          ))}
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
