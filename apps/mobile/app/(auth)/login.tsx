import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { radius } from "@savespots/tokens";
import { onboardingInputSchema, saveOnboarding } from "@savespots/shared";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [busy, setBusy] = useState(false);
  // Set once sign-up succeeds but the account still needs email confirmation.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  async function resend() {
    if (!pendingEmail) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
        options: {
          emailRedirectTo: `${
            process.env.EXPO_PUBLIC_ETA_BASE_URL ?? "https://savespots.org"
          }/auth/confirmed`,
        },
      });
      if (error) throw error;
      Alert.alert("Sent", `Another confirmation email is on its way to ${pendingEmail}.`);
    } catch (e: any) {
      Alert.alert("Couldn't resend", e?.message ?? "Try again in a minute.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (mode === "up") {
      if (!fullName.trim()) {
        Alert.alert("Name required", "Enter your full name.");
        return;
      }
      const parsed = onboardingInputSchema.safeParse({
        phone: phone.trim(),
        emergencyContactName: emergencyName.trim(),
        emergencyContactPhone: emergencyPhone.trim(),
      });
      if (!parsed.success) {
        Alert.alert("Check fields", parsed.error.issues[0]?.message ?? "Invalid input.");
        return;
      }
      setBusy(true);
      try {
        const needsConfirmation = await signUp(
          email.trim(),
          password,
          fullName.trim(),
          parsed.data,
        );
        if (needsConfirmation) {
          // No session yet — the account exists but can't sign in until the
          // emailed link is clicked. Say so, instead of silently dropping the
          // user back on a sign-in form that will reject them as unverified.
          setPendingEmail(email.trim());
        }
      } catch (e: any) {
        Alert.alert("Sign-up failed", e?.message ?? "Try again.");
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      const msg: string = e?.message ?? "Try again.";
      // Supabase reports this as "Email not confirmed" / "unverified", which
      // doesn't tell the user what to do about it.
      if (/not confirmed|unverified/i.test(msg)) {
        setPendingEmail(email.trim());
      } else {
        Alert.alert("Login failed", msg);
      }
    } finally {
      setBusy(false);
    }
  }

  // Account created, awaiting email confirmation. Without this the user lands
  // back on the sign-in form and is told "unverified" with no explanation.
  if (pendingEmail) {
    return (
      <View className="flex-1 justify-center bg-theme-red px-7">
        <Text className="font-display text-3xl font-extrabold text-white">
          Check your email
        </Text>
        <Text className="mt-3 text-base leading-6 text-white/90">
          We sent a confirmation link to{" "}
          <Text className="font-semibold text-white">{pendingEmail}</Text>. Tap it to
          activate your account, then come back and sign in.
        </Text>
        <Text className="mt-3 text-sm text-white/70">
          It can take a minute to arrive. Check your spam folder too.
        </Text>

        <Pressable
          onPress={resend}
          disabled={busy}
          className="mt-8 items-center border border-white/50 active:opacity-70"
          style={{ borderRadius: radius.button, paddingVertical: 14, opacity: busy ? 0.6 : 1 }}
        >
          <Text className="font-semibold text-white">
            {busy ? "..." : "Resend confirmation email"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setPendingEmail(null);
            setMode("in");
            setPassword("");
          }}
          className="mt-4 items-center bg-white active:opacity-80"
          style={{ borderRadius: radius.button, paddingVertical: 14 }}
        >
          <Text className="text-base font-semibold text-theme-red">
            I've confirmed — sign in
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-theme-red"
    >
      <View className="flex-1 justify-center px-7">
        <Text className="font-display text-4xl font-extrabold text-white">
          SaveSpots
        </Text>
        <Text className="mt-2 text-base text-white/80">
          Volunteer portal — {mode === "in" ? "sign in" : "create account"}
        </Text>

        {mode === "up" && (
          <>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full name"
              placeholderTextColor="#ffffff99"
              className="mt-6 bg-white/10 px-4 py-3 text-white"
              style={{ borderRadius: radius.input }}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor="#ffffff99"
              keyboardType="phone-pad"
              className="mt-4 bg-white/10 px-4 py-3 text-white"
              style={{ borderRadius: radius.input }}
            />
            <TextInput
              value={emergencyName}
              onChangeText={setEmergencyName}
              placeholder="Emergency contact name"
              placeholderTextColor="#ffffff99"
              className="mt-4 bg-white/10 px-4 py-3 text-white"
              style={{ borderRadius: radius.input }}
            />
            <TextInput
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              placeholder="Emergency contact phone"
              placeholderTextColor="#ffffff99"
              keyboardType="phone-pad"
              className="mt-4 bg-white/10 px-4 py-3 text-white"
              style={{ borderRadius: radius.input }}
            />
          </>
        )}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#ffffff99"
          autoCapitalize="none"
          keyboardType="email-address"
          className="mt-4 bg-white/10 px-4 py-3 text-white"
          style={{ borderRadius: radius.input }}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#ffffff99"
          secureTextEntry
          className="mt-4 bg-white/10 px-4 py-3 text-white"
          style={{ borderRadius: radius.input }}
        />

        <Pressable
          onPress={submit}
          disabled={busy}
          className="mt-6 items-center bg-white active:opacity-80"
          style={{ borderRadius: radius.button, paddingVertical: 15, opacity: busy ? 0.6 : 1 }}
        >
          <Text className="text-base font-semibold text-theme-red">
            {busy ? "..." : mode === "in" ? "Sign in" : "Create account"}
          </Text>
        </Pressable>

        <Pressable onPress={() => setMode(mode === "in" ? "up" : "in")} className="mt-5">
          <Text className="text-center text-sm text-white/80">
            {mode === "in"
              ? "No account? Create one"
              : "Have an account? Sign in"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
