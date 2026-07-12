import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { colors, radius } from "@savespots/tokens";
import { newSaveboxInputSchema, submitNewSavebox } from "@savespots/shared";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

export default function NewBox() {
  const router = useRouter();
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [hours, setHours] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function useMyLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Enable location to tag this SaveBox.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } finally {
      setLocating(false);
    }
  }

  async function submit() {
    if (!coords) {
      Alert.alert("Location required", "Tap 'Use my current location' first.");
      return;
    }
    const parsed = newSaveboxInputSchema.safeParse({
      name,
      address,
      city,
      lat: coords.lat,
      lng: coords.lng,
      hours: hours.trim() || undefined,
    });
    if (!parsed.success) {
      Alert.alert("Check fields", parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }
    setBusy(true);
    try {
      await submitNewSavebox(supabase, session!.user.id, parsed.data);
      Alert.alert("Submitted", "Your SaveBox was sent for review.", [
        { text: "OK", onPress: () => router.replace("/(app)/submissions") },
      ]);
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? "Try again.");
    } finally {
      setBusy(false);
    }
  }

  const field = "mt-3 border border-theme-red-dark/15 bg-white px-4 py-3 text-theme-red-dark";
  const ph = colors.themeRed.dark + "80";

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-sm text-theme-red-dark/70">
        Found a spot that should host a SaveBox? Submit it for the team to review.
      </Text>
      <TextInput value={name} onChangeText={setName} placeholder="Location name" placeholderTextColor={ph} className={field} style={{ borderRadius: radius.input }} />
      <TextInput value={address} onChangeText={setAddress} placeholder="Street address" placeholderTextColor={ph} className={field} style={{ borderRadius: radius.input }} />
      <TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={ph} className={field} style={{ borderRadius: radius.input }} />
      <TextInput value={hours} onChangeText={setHours} placeholder="Hours (optional)" placeholderTextColor={ph} className={field} style={{ borderRadius: radius.input }} />

      <Pressable
        onPress={useMyLocation}
        disabled={locating}
        className="mt-4 items-center border border-theme-red active:opacity-70"
        style={{ borderRadius: radius.button, paddingVertical: 12 }}
      >
        {locating ? (
          <ActivityIndicator color={colors.themeRed.DEFAULT} />
        ) : (
          <Text className="font-semibold text-theme-red">
            {coords ? "Location tagged ✓ — retag" : "Use my current location"}
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={submit}
        disabled={busy}
        className="mt-4 items-center bg-theme-red active:bg-theme-red-light"
        style={{ borderRadius: radius.button, paddingVertical: 14, opacity: busy ? 0.6 : 1 }}
      >
        <Text className="font-semibold text-white">{busy ? "..." : "Submit for review"}</Text>
      </Pressable>
    </ScrollView>
  );
}
