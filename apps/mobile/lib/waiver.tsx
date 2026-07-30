/**
 * Waiver gate: full-screen e-sign flow shown after sign-up until the user has
 * signed the current waiver. Records an audit row (version, typed signature,
 * timestamp, user agent) via signWaiver().
 *
 * NOTE: replace WAIVER_TEXT with the real waiver wording (from the PDF) before
 * launch — bump WAIVER_VERSION in @savespots/shared when the wording changes.
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
import { signWaiver, WAIVER_VERSION } from "@savespots/shared";
import { supabase } from "./supabase";

const WAIVER_TEXT = `SAVESPOTS VOLUNTEER WAIVER AND RELEASE OF LIABILITY (${WAIVER_VERSION})

PLACEHOLDER — replace with the wording from the official SaveSpots waiver PDF.

In consideration of being permitted to volunteer with SaveSpots, I acknowledge
and agree to the following:

1. I understand the nature of volunteer activities, including traveling to and
   restocking SaveBox naloxone stations, and I voluntarily accept the risks.

2. I release and hold harmless SaveSpots, its officers, and volunteers from
   liability for injury or loss arising from my participation, to the fullest
   extent permitted by law.

3. I confirm I am 18 or older, or have a guardian's consent.

4. I agree to handle naloxone kits responsibly and follow all training and
   applicable laws.

By typing my full legal name below and tapping "I agree — sign waiver", I am
signing this agreement electronically and intend it to be legally binding, the
same as a handwritten signature.`;

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
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function sign() {
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
        <Text className="font-display text-2xl font-extrabold text-white">
          Volunteer waiver
        </Text>
        <Text className="mt-1 text-sm text-white/80">
          One-time step — read and sign to start volunteering.
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        <View className="bg-white p-4" style={{ borderRadius: radius.card }}>
          <Text className="text-sm leading-5 text-theme-red-dark">{WAIVER_TEXT}</Text>
        </View>

        <Text className="mb-2 mt-5 text-sm font-semibold text-theme-red-dark">
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

        <Pressable
          onPress={() => setAgreed(!agreed)}
          className="mt-4 flex-row items-center gap-3"
          hitSlop={6}
        >
          <View
            className={
              agreed
                ? "h-6 w-6 items-center justify-center bg-theme-red"
                : "h-6 w-6 border-2 border-theme-red-dark/30 bg-white"
            }
            style={{ borderRadius: 6 }}
          >
            {agreed ? <Text className="text-xs font-bold text-white">✓</Text> : null}
          </View>
          <Text className="flex-1 text-sm text-theme-red-dark">
            I have read the waiver and agree to sign it electronically.
          </Text>
        </Pressable>

        <Pressable
          onPress={sign}
          disabled={busy}
          className="mb-10 mt-6 items-center bg-theme-red active:bg-theme-red-light"
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
