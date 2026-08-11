"use client";

/**
 * Platform-appropriate directions links for the web portal.
 *
 * The portal is meant to be usable in place of the native app, so a volunteer
 * on an iPhone should land in Apple Maps just as they would from the app —
 * not a Google Maps web page they then have to re-enter the address into.
 *
 * `maps://` is registered by Apple Maps on iOS and macOS; on anything else it
 * does nothing, so it must only be used when we're confident about the
 * platform. Everywhere else falls back to the Google Maps universal URL, which
 * opens the Google Maps app when installed and the website otherwise.
 */

function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as a Mac, so the touch check is what catches it.
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return iOS || iPadOS;
}

/** Turn-by-turn directions to a SaveBox, in the platform's own maps app. */
export function directionsUrl(lat: number, lng: number, label?: string): string {
  if (isApplePlatform()) {
    const q = label ? `&q=${encodeURIComponent(label)}` : "";
    return `maps://?daddr=${lat},${lng}${q}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** A map pin for a location (viewing, not routing). */
export function mapPinUrl(lat: number, lng: number, label?: string): string {
  if (isApplePlatform()) {
    const q = label ? `&q=${encodeURIComponent(label)}` : "";
    return `maps://?ll=${lat},${lng}${q}`;
  }
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
