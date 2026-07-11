import { View, Text, Pressable } from "react-native";
import { radius } from "@savespots/tokens";
import { stockReportInputSchema } from "@savespots/shared/schemas";

/**
 * Host portal — home. Placeholder proving the shared brand + contracts wire up:
 *  - NativeWind classes use the same theme-red/cream tokens as the website.
 *  - @savespots/shared zod schemas are importable here (portal contracts).
 * Replace with real auth + SaveBox management screens.
 */
export default function Home() {
  // Proof the shared schema is usable on mobile (validates a sample report).
  const sample = stockReportInputSchema.safeParse({
    saveSpotId: "00000000-0000-0000-0000-000000000000",
    kitsRemaining: 4,
    needsRestock: true,
  });

  return (
    <View className="flex-1 bg-cream px-6 pt-10">
      <Text className="font-display text-3xl font-extrabold text-theme-red-dark">
        Host Portal
      </Text>
      <Text className="mt-3 text-base leading-relaxed text-theme-red-dark/70">
        Reversing overdose, one SaveBox at a time. Manage your SaveSpot, report
        stock, and request a restock.
      </Text>

      <Pressable
        className="mt-8 items-center bg-theme-red active:bg-theme-red-light"
        style={{ borderRadius: radius.button, paddingVertical: 16 }}
      >
        <Text className="text-base font-semibold text-white">
          Report SaveBox stock
        </Text>
      </Pressable>

      <Text className="mt-6 text-xs text-theme-red-dark/50">
        shared schema check: {sample.success ? "valid ✓" : "invalid ✗"}
      </Text>
    </View>
  );
}
