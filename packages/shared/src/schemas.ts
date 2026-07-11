/**
 * Portal contracts — shared by web and mobile.
 *
 * These zod schemas are the single source of truth for host/SaveBox/stock
 * shapes. Both the Next.js portal and the Expo app import them, so a change to
 * a field validates identically everywhere. Derive TS types from the schemas
 * (never hand-write a parallel interface that can drift).
 */
import { z } from "zod";

/** A partner location that hosts a SaveBox. */
export const saveSpotSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  active: z.boolean().default(true),
  hostUserId: z.string().uuid().nullable(),
  createdAt: z.string(), // ISO timestamp
});
export type SaveSpot = z.infer<typeof saveSpotSchema>;

/** A host's report of how many SaveKits remain in their box. */
export const stockReportSchema = z.object({
  id: z.string().uuid(),
  saveSpotId: z.string().uuid(),
  kitsRemaining: z.number().int().min(0),
  needsRestock: z.boolean(),
  note: z.string().max(500).optional(),
  reportedAt: z.string(), // ISO timestamp
  reportedBy: z.string().uuid(),
});
export type StockReport = z.infer<typeof stockReportSchema>;

/** Input a host submits from the app to file a stock report. */
export const stockReportInputSchema = stockReportSchema.pick({
  saveSpotId: true,
  kitsRemaining: true,
  needsRestock: true,
  note: true,
});
export type StockReportInput = z.infer<typeof stockReportInputSchema>;

/** A portal user (host or volunteer). */
export const portalUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.enum(["host", "volunteer", "admin"]),
});
export type PortalUser = z.infer<typeof portalUserSchema>;
