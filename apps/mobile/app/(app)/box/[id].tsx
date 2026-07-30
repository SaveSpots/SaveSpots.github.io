import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { colors, radius } from "@savespots/tokens";
import {
  getSavebox,
  getRestocks,
  reportRestock,
  uploadCheckinPhoto,
  type Savebox,
  type Restock,
} from "@savespots/shared";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/auth";

/** Yes / No segmented control. */
function YesNo({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {[
        { label: "Yes", v: true },
        { label: "No", v: false },
      ].map(({ label, v }) => {
        const selected = value === v;
        return (
          <Pressable
            key={label}
            onPress={() => onChange(v)}
            className={
              selected
                ? "flex-1 items-center bg-theme-red"
                : "flex-1 items-center border border-theme-red-dark/20 bg-white"
            }
            style={{ borderRadius: radius.button, paddingVertical: 10 }}
          >
            <Text
              className={
                selected ? "font-semibold text-white" : "font-semibold text-theme-red-dark/70"
              }
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** One-line description of a past check-in. */
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
  if (r.kits_remaining != null) return `${r.kits_remaining} kits`;
  return "Box OK — no restock needed";
}

export default function BoxDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [box, setBox] = useState<Savebox | null>(null);
  const [restocks, setRestocks] = useState<Restock[]>([]);
  const [loading, setLoading] = useState(true);

  // Check-in form
  const [gone, setGone] = useState<boolean | null>(null);
  const [replaced, setReplaced] = useState<boolean | null>(null);
  const [needsRestock, setNeedsRestock] = useState<boolean | null>(null);
  const [kitsGiven, setKitsGiven] = useState("");
  const [note, setNote] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera needed", "Allow camera access to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  }

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
    if (gone === null) {
      Alert.alert("Quick question", "Is the box gone? Tap Yes or No.");
      return;
    }
    if (gone && replaced === null) {
      Alert.alert("One more", "Did you replace the box? Tap Yes or No.");
      return;
    }
    if (!gone && needsRestock === null) {
      Alert.alert("One more", "Is a restock necessary? Tap Yes or No.");
      return;
    }
    let kits: number | undefined;
    if (!gone && needsRestock) {
      kits = parseInt(kitsGiven, 10);
      if (Number.isNaN(kits) || kits < 0) {
        Alert.alert("How many savekits?", "Enter how many savekits you gave (0 or more).");
        return;
      }
    }
    setBusy(true);
    try {
      let photoUrl: string | undefined;
      if (photoUri) {
        photoUrl = await uploadCheckinPhoto(supabase, session!.user.id, photoUri);
      }
      await reportRestock(supabase, session!.user.id, {
        saveboxId: id!,
        boxGone: gone,
        replaced: gone ? replaced! : undefined,
        needsRestock: !gone && needsRestock === true,
        kitsGiven: kits,
        photoUrl,
        note: note.trim() || undefined,
      });
      setGone(null);
      setReplaced(null);
      setNeedsRestock(null);
      setKitsGiven("");
      setNote("");
      setPhotoUri(null);
      await load();
      Alert.alert("Thanks!", "Your check-in was logged.");
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

  const latest = restocks[0];

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
        {latest ? (
          <Text className="mt-3 text-xs font-semibold text-theme-red">
            Last check-in {new Date(latest.reported_at).toLocaleDateString()} ·{" "}
            {checkinLabel(latest)}
            {latest.needs_restock ? " · needs restock soon" : ""}
          </Text>
        ) : (
          <Text className="mt-3 text-xs text-theme-red-dark/50">No check-ins yet.</Text>
        )}
      </View>

      {/* Check in */}
      <View className="mt-5 bg-white p-4" style={{ borderRadius: radius.card }}>
        <Text className="font-display text-lg font-bold text-theme-red-dark">Check in</Text>

        <Text className="mb-2 mt-4 text-sm font-semibold text-theme-red-dark">
          Is the box gone?
        </Text>
        <YesNo
          value={gone}
          onChange={(v) => {
            setGone(v);
            if (v) {
              setNeedsRestock(null);
              setKitsGiven("");
            } else {
              setReplaced(null);
            }
          }}
        />

        {gone === true ? (
          <>
            <Text className="mb-2 mt-4 text-sm font-semibold text-theme-red-dark">
              Did you replace the box?
            </Text>
            <YesNo value={replaced} onChange={setReplaced} />
          </>
        ) : null}

        {gone === false ? (
          <>
            <Text className="mb-2 mt-4 text-sm font-semibold text-theme-red-dark">
              Is a restock necessary?
            </Text>
            <YesNo value={needsRestock} onChange={setNeedsRestock} />
          </>
        ) : null}

        {gone === false && needsRestock === true ? (
          <>
            <Text className="mb-2 mt-4 text-sm font-semibold text-theme-red-dark">
              How many savekits given?
            </Text>
            <TextInput
              value={kitsGiven}
              onChangeText={setKitsGiven}
              placeholder="e.g. 5"
              placeholderTextColor={colors.themeRed.dark + "80"}
              keyboardType="number-pad"
              className="border border-theme-red-dark/15 px-4 py-3 text-theme-red-dark"
              style={{ borderRadius: radius.input }}
            />
          </>
        ) : null}

        {/* Photo */}
        <Text className="mb-2 mt-4 text-sm font-semibold text-theme-red-dark">
          Add a photo (optional)
        </Text>
        {photoUri ? (
          <View>
            <Image
              source={{ uri: photoUri }}
              style={{ width: "100%", height: 180, borderRadius: radius.input }}
              resizeMode="cover"
            />
            <Pressable onPress={() => setPhotoUri(null)} hitSlop={10} className="mt-2">
              <Text className="text-center text-xs font-semibold text-theme-red-dark/50">
                Remove photo
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row gap-2">
            <Pressable
              onPress={takePhoto}
              className="flex-1 items-center border border-theme-red-dark/20 bg-white active:opacity-70"
              style={{ borderRadius: radius.button, paddingVertical: 10 }}
            >
              <Text className="font-semibold text-theme-red-dark/70">Take photo</Text>
            </Pressable>
            <Pressable
              onPress={pickPhoto}
              className="flex-1 items-center border border-theme-red-dark/20 bg-white active:opacity-70"
              style={{ borderRadius: radius.button, paddingVertical: 10 }}
            >
              <Text className="font-semibold text-theme-red-dark/70">Choose from library</Text>
            </Pressable>
          </View>
        )}

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Note (optional)"
          placeholderTextColor={colors.themeRed.dark + "80"}
          multiline
          className="mt-4 border border-theme-red-dark/15 px-4 py-3 text-theme-red-dark"
          style={{ borderRadius: radius.input, minHeight: 60 }}
        />
        <Pressable
          onPress={submit}
          disabled={busy}
          className="mt-4 items-center bg-theme-red active:bg-theme-red-light"
          style={{ borderRadius: radius.button, paddingVertical: 13, opacity: busy ? 0.6 : 1 }}
        >
          <Text className="font-semibold text-white">
            {busy ? "..." : "Submit check-in"}
          </Text>
        </Pressable>
      </View>

      {/* History */}
      <Text className="mb-2 mt-6 font-display text-lg font-bold text-theme-red-dark">
        Check-in history
      </Text>
      {restocks.map((r) => (
        <View key={r.id} className="mb-2 bg-white p-3" style={{ borderRadius: radius.input }}>
          <Text className="text-sm font-semibold text-theme-red-dark">
            {checkinLabel(r)}
            {r.needs_restock ? " · needs restock soon" : ""}
          </Text>
          <Text className="text-xs text-theme-red-dark/60">
            {new Date(r.reported_at).toLocaleString()}
          </Text>
          {r.note ? (
            <Text className="mt-1 text-xs text-theme-red-dark/70">{r.note}</Text>
          ) : null}
          {r.photo_url ? (
            <Image
              source={{ uri: r.photo_url }}
              style={{
                width: "100%",
                height: 160,
                borderRadius: radius.input,
                marginTop: 8,
              }}
              resizeMode="cover"
            />
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}
