/**
 * Waiver gate: full-screen e-sign flow shown after sign-up until the user has
 * signed the current waiver. Records an audit row (version, typed signature,
 * media consent, timestamp, user agent) via signWaiver().
 */
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { colors, radius } from "@savespots/tokens";
import {
  signWaiver,
  WAIVER_INTRO,
  WAIVER_SECTIONS,
  WAIVER_TITLE,
} from "@savespots/shared";
import { supabase } from "./supabase";

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={
        selected
          ? "flex-1 items-center bg-theme-red"
          : "flex-1 items-center border border-theme-red-dark/20 bg-white"
      }
      style={{ borderRadius: radius.button, paddingVertical: 10 }}
    >
      <Text
        className={
          selected ? "text-center font-semibold text-white" : "text-center font-semibold text-theme-red-dark/70"
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CheckRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: string;
}) {
  return (
    <Pressable onPress={onToggle} className="mt-4 flex-row items-center gap-3" hitSlop={6}>
      <View
        className={
          checked
            ? "h-6 w-6 items-center justify-center bg-theme-red"
            : "h-6 w-6 border-2 border-theme-red-dark/30 bg-white"
        }
        style={{ borderRadius: 6 }}
      >
        {checked ? <Text className="text-xs font-bold text-white">✓</Text> : null}
      </View>
      <Text className="flex-1 text-sm text-theme-red-dark">{children}</Text>
    </Pressable>
  );
}

export function WaiverScreen({
  userId,
  fullName,
  onSigned,
}: {
  userId: string;
  fullName: string;
  onSigned: () => void;
}) {
  const [signature, setSignature] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [mediaConsent, setMediaConsent] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  async function sign() {
    if (!isAdult) {
      Alert.alert(
        "Age confirmation",
        "Confirm you are 18 or older. Volunteers under 18 must complete the paper form with a parent or guardian.",
      );
      return;
    }
    if (mediaConsent === null) {
      Alert.alert("Photo/media release", "Choose whether you consent to photo/media use (section 8).");
      return;
    }
    if (signature.trim().length < 2) {
      Alert.alert("Signature required", "Type your full legal name to sign.");
      return;
    }
    if (!agreed) {
      Alert.alert("Agreement required", "Tap the checkbox to confirm you agree.");
      return;
    }
    setBusy(true);
    try {
      await signWaiver(
        supabase,
        userId,
        signature.trim(),
        `mobile/${Platform.OS} ${Platform.Version}`,
        mediaConsent,
      );
      onSigned();
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="flex-1 bg-cream">
      <View className="bg-theme-red px-5 pb-4 pt-16">
        <Text className="text-xs font-bold uppercase tracking-widest text-white/70">
          SaveSpots · Harm Reduction & Community Outreach
        </Text>
        <Text className="mt-1 font-display text-xl font-extrabold leading-7 text-white">
          {WAIVER_TITLE}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        <View className="bg-white p-5" style={{ borderRadius: radius.card }}>
          <Text className="text-sm leading-5 text-theme-red-dark/90">{WAIVER_INTRO}</Text>
          {WAIVER_SECTIONS.map((s) => (
            <View key={s.title} className="mt-5">
              <Text className="font-display text-base font-bold text-theme-red-dark">
                {s.title}
              </Text>
              <Text className="mt-1.5 text-sm leading-5 text-theme-red-dark/90">{s.body}</Text>
            </View>
          ))}
        </View>

        {/* Section 8 choice */}
        <Text className="mb-2 mt-6 text-sm font-semibold text-theme-red-dark">
          Photo/media release (section 8) — optional
        </Text>
        <View className="flex-row gap-2">
          <Choice
            label="I consent"
            selected={mediaConsent === true}
            onPress={() => setMediaConsent(true)}
          />
          <Choice
            label="I do NOT consent"
            selected={mediaConsent === false}
            onPress={() => setMediaConsent(false)}
          />
        </View>

        <CheckRow checked={isAdult} onToggle={() => setIsAdult(!isAdult)}>
          I confirm I am 18 years of age or older.
        </CheckRow>

        <Text className="mb-2 mt-6 text-sm font-semibold text-theme-red-dark">
          Type your full legal name to sign
        </Text>
        <TextInput
          value={signature}
          onChangeText={setSignature}
          placeholder={fullName || "Full legal name"}
          placeholderTextColor={colors.themeRed.dark + "60"}
          autoCapitalize="words"
          className="border border-theme-red-dark/15 bg-white px-4 py-3 text-theme-red-dark"
          style={{ borderRadius: radius.input }}
        />

        <CheckRow checked={agreed} onToggle={() => setAgreed(!agreed)}>
          I have read this Agreement in its entirety, understand that I am giving up
          substantial legal rights, and agree to sign it electronically.
        </CheckRow>

        <Pressable
          onPress={sign}
          disabled={busy}
          className="mb-12 mt-6 items-center bg-theme-red active:bg-theme-red-light"
          style={{ borderRadius: radius.button, paddingVertical: 15, opacity: busy ? 0.6 : 1 }}
        >
          <Text className="font-semibold text-white">
            {busy ? "..." : "I agree — sign waiver"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
