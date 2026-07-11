/**
 * App-level Supabase client. Uses the shared factory + Expo public env vars.
 * Set these in apps/mobile/.env:
 *   EXPO_PUBLIC_SUPABASE_URL=...
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
 */
import { createSavespotsClient } from "@savespots/shared/supabase";

export const supabase = createSavespotsClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
});
