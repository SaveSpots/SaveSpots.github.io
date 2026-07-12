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
  restockSchema,
  saveboxSchema,
  type NearbySavebox,
  type NewSaveboxInput,
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
      kits_remaining: input.kitsRemaining,
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
