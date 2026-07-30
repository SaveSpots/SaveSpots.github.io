import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { colors, radius } from "@savespots/tokens";
import {
  newSaveboxInputSchema,
  submitNewSavebox,
  uploadCheckinPhoto,
} from "@savespots/shared";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

type Candidate = { address: string; city: string };

/** Format one reverse-geocode result as a street address. */
function formatCandidate(g: Location.LocationGeocodedAddress): Candidate | null {
  const street = g.street ?? g.name;
  if (!street) return null;
  const address = g.streetNumber && !street.startsWith(g.streetNumber)
    ? `${g.streetNumber} ${street}`
    : street;
  return { address, city: g.city ?? g.subregion ?? "" };
}

export default function NewBox() {
  const router = useRouter();
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [hours, setHours] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [confirming, setConfirming] = useState(false); // "is this it?" card visible
  const [showList, setShowList] = useState(false); // nearby addresses list visible
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function useMyLocation() {
    setLocating(true);
    setShowList(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Enable location to tag this SaveBox.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCoords(c);
      const results = await Location.reverseGeocodeAsync({
        latitude: c.lat,
        longitude: c.lng,
      });
      const found = results
        .map(formatCandidate)
        .filter((x): x is Candidate => x !== null)
        // dedupe by address text
        .filter((x, i, arr) => arr.findIndex((y) => y.address === x.address) === i);
      setCandidates(found);
      if (found[0]) {
        setAddress(found[0].address);
        setCity(found[0].city);
        setConfirming(true);
      } else {
        Alert.alert(
          "No address found",
          "Couldn't look up an address here — type it in manually.",
        );
      }
    } catch (e: any) {
      Alert.alert("Location failed", e?.message ?? "Try again.");
    } finally {
      setLocating(false);
    }
  }

  function pickCandidate(c: Candidate) {
    setAddress(c.address);
    setCity(c.city);
    setConfirming(false);
    setShowList(false);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera needed", "Allow camera access to photograph the spot.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  }

  async function submit() {
    if (!coords) {
      Alert.alert("Location required", "Tap 'Use my current location' first.");
      return;
    }
    if (!photoUri) {
      Alert.alert("Photo required", "Take a picture of the spot before submitting.");
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
      const photoUrl = await uploadCheckinPhoto(supabase, session!.user.id, photoUri);
      await submitNewSavebox(supabase, session!.user.id, { ...parsed.data, photoUrl });
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

      <Pressable
        onPress={useMyLocation}
        disabled={locating}
        className="mt-4 items-center border border-theme-red bg-white active:opacity-70"
        style={{ borderRadius: radius.button, paddingVertical: 12 }}
      >
        {locating ? (
          <ActivityIndicator color={colors.themeRed.DEFAULT} />
        ) : (
          <Text className="font-semibold text-theme-red">
            {coords ? "Location tagged ✓ — locate again" : "Use my current location"}
          </Text>
        )}
      </Pressable>

      {/* "Is this the address?" confirmation */}
      {confirming ? (
        <View
          className="mt-3 border border-theme-red/30 bg-white p-4"
          style={{ borderRadius: radius.card }}
        >
          <Text className="text-sm font-semibold text-theme-red-dark">
            Is this the address?
          </Text>
          <Text className="mt-1 text-base text-theme-red-dark">
            {address}{city ? `, ${city}` : ""}
          </Text>
          <View className="mt-3 flex-row gap-2">
            <Pressable
              onPress={() => {
                setConfirming(false);
                setShowList(false);
              }}
              className="flex-1 items-center bg-theme-red active:bg-theme-red-light"
              style={{ borderRadius: radius.button, paddingVertical: 10 }}
            >
              <Text className="font-semibold text-white">Yes, that's it</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                candidates.length > 1 ? setShowList(true) : useMyLocation()
              }
              className="flex-1 items-center border border-theme-red bg-white active:opacity-70"
              style={{ borderRadius: radius.button, paddingVertical: 10 }}
            >
              <Text className="font-semibold text-theme-red">
                {candidates.length > 1 ? "No — show nearby" : "No — retry"}
              </Text>
            </Pressable>
          </View>

          {showList ? (
            <View className="mt-3 border-t border-theme-red-dark/10 pt-2">
              <Text className="mb-1 text-xs font-semibold uppercase text-theme-red-dark/50">
                Addresses near you
              </Text>
              {candidates.map((c) => (
                <Pressable
                  key={c.address}
                  onPress={() => pickCandidate(c)}
                  className="border-b border-theme-red-dark/5 py-2 active:opacity-60"
                >
                  <Text className="text-sm text-theme-red-dark">
                    {c.address}{c.city ? `, ${c.city}` : ""}
                  </Text>
                </Pressable>
              ))}
              <Pressable onPress={useMyLocation} className="py-2 active:opacity-60">
                <Text className="text-sm font-semibold text-theme-red">
                  None of these — locate again
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      <TextInput value={address} onChangeText={setAddress} placeholder="Street address" placeholderTextColor={ph} className={field} style={{ borderRadius: radius.input }} />
      <TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={ph} className={field} style={{ borderRadius: radius.input }} />
      <TextInput value={hours} onChangeText={setHours} placeholder="Hours (optional)" placeholderTextColor={ph} className={field} style={{ borderRadius: radius.input }} />

      {/* Required photo */}
      <Text className="mb-1 mt-5 text-sm font-semibold text-theme-red-dark">
        Photo of the spot (required)
      </Text>
      {photoUri ? (
        <View>
          <Image
            source={{ uri: photoUri }}
            style={{ width: "100%", height: 200, borderRadius: radius.input }}
            resizeMode="cover"
          />
          <Pressable onPress={() => setPhotoUri(null)} hitSlop={10} className="mt-2">
            <Text className="text-center text-xs font-semibold text-theme-red-dark/50">
              Remove photo
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="mt-1 flex-row gap-2">
          <Pressable
            onPress={takePhoto}
            className="flex-1 items-center border border-theme-red-dark/20 bg-white active:opacity-70"
            style={{ borderRadius: radius.button, paddingVertical: 11 }}
          >
            <Text className="font-semibold text-theme-red-dark/70">Take photo</Text>
          </Pressable>
          <Pressable
            onPress={pickPhoto}
            className="flex-1 items-center border border-theme-red-dark/20 bg-white active:opacity-70"
            style={{ borderRadius: radius.button, paddingVertical: 11 }}
          >
            <Text className="font-semibold text-theme-red-dark/70">Choose from library</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={submit}
        disabled={busy}
        className="mt-5 items-center bg-theme-red active:bg-theme-red-light"
        style={{ borderRadius: radius.button, paddingVertical: 14, opacity: busy ? 0.6 : 1 }}
      >
        <Text className="font-semibold text-white">{busy ? "..." : "Submit for review"}</Text>
      </Pressable>
    </ScrollView>
  );
}
