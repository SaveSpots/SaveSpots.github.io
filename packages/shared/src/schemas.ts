/**
 * Portal contracts — shared by web and mobile.
 *
 * These zod schemas are the single source of truth for savebox/restock/user
 * shapes. They mirror packages/shared/supabase/schema.sql. Rows come back from
 * Supabase in snake_case; parse them here so the rest of the app sees typed data.
 */
import { z } from "zod";

export const saveboxStatus = z.enum(["pending", "active", "retired"]);
export type SaveboxStatus = z.infer<typeof saveboxStatus>;

/** A hosted SaveBox at a location (row shape from `saveboxes`). */
export const saveboxSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  hours: z.string().nullable(),
  status: saveboxStatus,
  host_id: z.string().uuid().nullable(),
  submitted_by: z.string().uuid().nullable(),
  created_at: z.string(),
});
export type Savebox = z.infer<typeof saveboxSchema>;

/** Row shape returned by the nearby_saveboxes() RPC (adds distance_m). */
export const nearbySaveboxSchema = saveboxSchema
  .omit({ host_id: true, submitted_by: true, created_at: true })
  .extend({ distance_m: z.number() });
export type NearbySavebox = z.infer<typeof nearbySaveboxSchema>;

/** What a volunteer submits to log a NEW box for review. */
export const newSaveboxInputSchema = z.object({
  name: z.string().min(1, "Name required"),
  address: z.string().min(1, "Address required"),
  city: z.string().min(1, "City required"),
  lat: z.number(),
  lng: z.number(),
  hours: z.string().optional(),
});
export type NewSaveboxInput = z.infer<typeof newSaveboxInputSchema>;

/** A restock report row (`restocks`). */
export const restockSchema = z.object({
  id: z.string().uuid(),
  savebox_id: z.string().uuid(),
  kits_remaining: z.number().int().min(0),
  needs_restock: z.boolean(),
  note: z.string().nullable(),
  reported_by: z.string().uuid().nullable(),
  reported_at: z.string(),
});
export type Restock = z.infer<typeof restockSchema>;

/** What a volunteer submits when reporting a restock. */
export const restockInputSchema = z.object({
  saveboxId: z.string().uuid(),
  kitsRemaining: z.number().int().min(0),
  needsRestock: z.boolean(),
  note: z.string().max(500).optional(),
});
export type RestockInput = z.infer<typeof restockInputSchema>;

/** A portal user profile (`profiles`). */
export const profileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  role: z.enum(["host", "volunteer", "admin"]),
  created_at: z.string(),
});
export type Profile = z.infer<typeof profileSchema>;
