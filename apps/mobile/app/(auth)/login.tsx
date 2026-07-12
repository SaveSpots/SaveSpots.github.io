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
import { useAuth } from "../../lib/auth";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (mode === "in") await signIn(email.trim(), password);
      else await signUp(email.trim(), password, fullName.trim());
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Try again.");
    } finally {
      setBusy(false);
    }
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
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full name"
            placeholderTextColor="#ffffff99"
            className="mt-6 bg-white/10 px-4 py-3 text-white"
            style={{ borderRadius: radius.input }}
          />
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
