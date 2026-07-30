/**
 * Portal data-access — shared query/mutation helpers.
 *
 * Every function takes a SupabaseClient so web and mobile pass their own
 * (each built from its own env). Results are validated with the zod schemas so
 * a shape drift in the DB surfaces as a parse error, not a silent bug.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  nearbySaveboxSchema,
  profileSchema,
  restockSchema,
  saveboxSchema,
  WAIVER_VERSION,
  type NearbySavebox,
  type NewSaveboxInput,
  type OnboardingInput,
  type Profile,
  type Restock,
  type RestockInput,
  type Savebox,
} from "./schemas";

/** Active SaveBoxes near a point, nearest first (calls the SQL RPC). */
export async function getNearbySaveboxes(
  db: SupabaseClient,
  lat: number,
  lng: number,
  radiusMeters = 8000,
): Promise<NearbySavebox[]> {
  const { data, error } = await db.rpc("nearby_saveboxes", {
    in_lat: lat,
    in_lng: lng,
    radius_m: radiusMeters,
  });
  if (error) throw error;
  return nearbySaveboxSchema.array().parse(data ?? []);
}

/** A single SaveBox by id. */
export async function getSavebox(
  db: SupabaseClient,
  id: string,
): Promise<Savebox | null> {
  const { data, error } = await db
    .from("saveboxes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? saveboxSchema.parse(data) : null;
}

/** Restock history for a box, newest first. */
export async function getRestocks(
  db: SupabaseClient,
  saveboxId: string,
): Promise<Restock[]> {
  const { data, error } = await db
    .from("restocks")
    .select("*")
    .eq("savebox_id", saveboxId)
    .order("reported_at", { ascending: false });
  if (error) throw error;
  return restockSchema.array().parse(data ?? []);
}

/** File a restock report for a box (reporter = current auth user). */
export async function reportRestock(
  db: SupabaseClient,
  userId: string,
  input: RestockInput,
): Promise<Restock> {
  const { data, error } = await db
    .from("restocks")
    .insert({
      savebox_id: input.saveboxId,
      box_gone: input.boxGone,
      replaced: input.boxGone ? (input.replaced ?? null) : null,
      kits_given: input.kitsGiven ?? null,
      kits_remaining: input.kitsRemaining ?? null,
      photo_url: input.photoUrl ?? null,
      needs_restock: input.needsRestock,
      note: input.note ?? null,
      reported_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return restockSchema.parse(data);
}

/** Submit a NEW box for admin review (lands as status='pending'). */
export async function submitNewSavebox(
  db: SupabaseClient,
  userId: string,
  input: NewSaveboxInput,
): Promise<Savebox> {
  const { data, error } = await db
    .from("saveboxes")
    .insert({
      name: input.name,
      address: input.address,
      city: input.city,
      lat: input.lat,
      lng: input.lng,
      hours: input.hours ?? null,
      photo_url: input.photoUrl ?? null,
      status: "pending",
      submitted_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return saveboxSchema.parse(data);
}

/** Boxes the current user submitted (any status) — track review progress. */
export async function getMySubmissions(
  db: SupabaseClient,
  userId: string,
): Promise<Savebox[]> {
  const { data, error } = await db
    .from("saveboxes")
    .select("*")
    .eq("submitted_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return saveboxSchema.array().parse(data ?? []);
}

/** The current user's profile row. */
export async function getProfile(
  db: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? profileSchema.parse(data) : null;
}

/** Check-ins the current user filed, newest first (with the box name). */
export async function getMyCheckins(
  db: SupabaseClient,
  userId: string,
): Promise<(Restock & { savebox_name: string })[]> {
  const { data, error } = await db
    .from("restocks")
    .select("*, saveboxes(name)")
    .eq("reported_by", userId)
    .order("reported_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...restockSchema.parse({ ...row, saveboxes: undefined }),
    savebox_name: row.saveboxes?.name ?? "Unknown box",
  }));
}

/** Upload a check-in photo; returns its public URL. */
export async function uploadCheckinPhoto(
  db: SupabaseClient,
  userId: string,
  localUri: string,
): Promise<string> {
  const ext = localUri.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const res = await fetch(localUri);
  const body = await res.arrayBuffer();
  const { error } = await db.storage
    .from("checkin-photos")
    .upload(path, body, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}` });
  if (error) throw error;
  return db.storage.from("checkin-photos").getPublicUrl(path).data.publicUrl;
}

/** Save onboarding contact details on the caller's profile. */
export async function saveOnboarding(
  db: SupabaseClient,
  userId: string,
  input: OnboardingInput,
): Promise<void> {
  const { error } = await db
    .from("profiles")
    .update({
      phone: input.phone,
      emergency_contact_name: input.emergencyContactName,
      emergency_contact_phone: input.emergencyContactPhone,
    })
    .eq("id", userId);
  if (error) throw error;
}

/** Record a waiver e-signature (audit row + timestamp on the profile). */
export async function signWaiver(
  db: SupabaseClient,
  userId: string,
  signatureName: string,
  userAgent?: string,
  mediaConsent?: boolean,
): Promise<void> {
  const { error } = await db.from("waiver_acceptances").insert({
    user_id: userId,
    waiver_version: WAIVER_VERSION,
    signature_name: signatureName,
    user_agent: userAgent ?? null,
    media_consent: mediaConsent ?? null,
  });
  if (error) throw error;
  const { error: e2 } = await db
    .from("profiles")
    .update({ waiver_signed_at: new Date().toISOString() })
    .eq("id", userId);
  if (e2) throw e2;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

/** All boxes (admin sees every status). */
export async function adminGetSaveboxes(db: SupabaseClient): Promise<Savebox[]> {
  const { data, error } = await db
    .from("saveboxes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return saveboxSchema.array().parse(data ?? []);
}

/** Approve / retire / re-activate a box. */
export async function adminSetSaveboxStatus(
  db: SupabaseClient,
  id: string,
  status: "pending" | "active" | "retired",
): Promise<void> {
  const { error } = await db.from("saveboxes").update({ status }).eq("id", id);
  if (error) throw error;
}

/** Latest check-ins across all boxes (admin). */
export async function adminGetRecentCheckins(
  db: SupabaseClient,
  limit = 50,
): Promise<(Restock & { savebox_name: string })[]> {
  const { data, error } = await db
    .from("restocks")
    .select("*, saveboxes(name)")
    .order("reported_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...restockSchema.parse({ ...row, saveboxes: undefined }),
    savebox_name: row.saveboxes?.name ?? "Unknown box",
  }));
}
