/**
 * Tracked QR landing: records the scan, then sends the visitor to /donate.
 *
 * WHY A REDIRECT AND NOT A QUERY PARAMETER ON /donate: the redirect is the
 * only place a scan is unambiguous. `/donate?src=flyer` also fires when
 * someone reloads, shares the link, or comes back a week later from history,
 * which would inflate scan counts with things that are not scans.
 *
 * The redirect must stay fast. A printed code cannot be changed once it is on
 * a wall, so this route has to work even when the database does not — the
 * insert is best-effort and a failure still redirects.
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Codes come off printed material; keep them boring and bounded. */
const CODE_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const code = (params.code ?? "").toLowerCase();
  const origin = new URL(request.url).origin;

  // An unrecognised or malformed code still lands the visitor on the donate
  // page. Someone standing in front of a poster should never see an error
  // because we mistyped a slug.
  const isTrackable = CODE_PATTERN.test(code);

  const destination = new URL("/donate", origin);
  if (isTrackable) {
    // Kept for any downstream analytics; the scan itself is already recorded.
    destination.searchParams.set("src", `qr-${code}`);
  }

  if (isTrackable) {
    try {
      const headers = request.headers;
      await getSupabaseAdmin()
        .from("qr_scans")
        .insert({
          code,
          user_agent: headers.get("user-agent")?.slice(0, 500) ?? null,
          referer: headers.get("referer")?.slice(0, 500) ?? null,
          // Netlify sets this; absent locally and on other hosts.
          country: headers.get("x-nf-client-connection-country")?.slice(0, 8) ?? null,
        });
    } catch (error) {
      // Never block the redirect on analytics. A donor who cannot reach the
      // page costs far more than a scan we failed to count.
      console.error("[qr] Could not record scan:", error);
    }
  }

  // 302, not 301: a permanent redirect gets cached by the phone's browser and
  // every later scan from that device would skip this route entirely, which
  // would silently stop counting.
  return NextResponse.redirect(destination, 302);
}
