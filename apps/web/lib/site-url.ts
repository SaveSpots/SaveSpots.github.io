/**
 * The canonical public origin.
 *
 * WHY NOT `new URL(request.url).origin`: on Netlify that resolves to the
 * internal deploy host (main--savespots.netlify.app), not the domain people
 * typed. Two places that matters:
 *
 *  - A printed QR code sends someone to savespots.org/qr/<code>. If the
 *    redirect then bounces them to main--savespots.netlify.app, a person
 *    standing in front of a poster watches the address bar turn into
 *    something that looks like a phishing page. The print cannot be recalled.
 *  - Square's post-payment redirect_url is baked into the payment link. A
 *    donor finishing a gift should come back to the domain they trusted with
 *    their card.
 *
 * Localhost still needs the request's own origin, so dev is handled by
 * letting the caller pass it as a fallback.
 */

const CANONICAL = "https://savespots.org";

export function siteOrigin(requestUrl: string): string {
  // Explicit override first: useful for a staging domain or a preview deploy
  // that genuinely should link to itself.
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;

  const origin = new URL(requestUrl).origin;
  // Local development: keep everything on localhost or nothing works.
  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
    return origin;
  }

  return CANONICAL;
}
