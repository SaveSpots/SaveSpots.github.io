/**
 * Thin Square API client.
 *
 * Exists so the access token, the base URL and the pinned API version are
 * decided in exactly one place. Everything that talks to Square goes through
 * squareFetch; nothing else should read SQUARE_ACCESS_TOKEN.
 *
 * Server-only. Importing this from a client component would be a token leak,
 * so the module throws if it is ever evaluated in a browser.
 */

if (typeof window !== "undefined") {
  throw new Error("lib/square.ts is server-only and must never be imported by a client component.");
}

/**
 * Pinned rather than floating: Square treats the version header as an API
 * contract, and an unpinned request silently follows breaking changes.
 */
export const SQUARE_VERSION = "2026-09-16";

export class SquareError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: unknown
  ) {
    super(message);
    this.name = "SquareError";
  }
}

export function squareBaseUrl(): string {
  // Anything other than an explicit "production" stays on sandbox, so a
  // misconfigured deploy fails safe into test money rather than real money.
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

/** Throws if Square is not configured, so callers fail before they build a request. */
export function requireSquareConfig(): { accessToken: string; locationId: string } {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!accessToken || !locationId) {
    throw new SquareError(
      "SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID is not set.",
      503,
      null
    );
  }
  return { accessToken, locationId };
}

export async function squareFetch<T = any>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown } = { method: "GET" }
): Promise<T> {
  const { accessToken } = requireSquareConfig();

  const response = await fetch(`${squareBaseUrl()}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    // Catalog reads must not be served from a stale Next.js fetch cache —
    // a plan variation created seconds ago has to be visible immediately.
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new SquareError(
      `Square ${init.method} ${path} failed with ${response.status}`,
      response.status,
      json?.errors ?? null
    );
  }

  return json as T;
}
