/**
 * Landing page for the email-confirmation link.
 *
 * Supabase redirects here after verifying the token. Previously it redirected
 * to site_url — the marketing homepage — which gave no indication the account
 * had been activated, so people assumed the link was broken.
 *
 * The verification itself is already done by the time Supabase redirects. This
 * page's only job is to say so, and to get the person back where they came
 * from: the app on mobile, or the portal on desktop.
 */
import Link from "next/link";

export const metadata = {
  title: "Email confirmed — SaveSpots",
};

export default function ConfirmedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-theme-red">
          <span className="text-3xl text-white" aria-hidden="true">
            ✓
          </span>
        </div>

        <h1 className="mt-5 font-display text-2xl font-extrabold text-theme-red-dark">
          Email confirmed
        </h1>
        <p className="mt-3 text-theme-red-dark/80">
          Your SaveSpots account is active. Head back to the app and sign in.
        </p>

        {/* Deep link into the native app. Harmless on desktop — if the scheme
            isn't registered the browser simply does nothing, and the portal
            link below is right there. */}
        <a
          href="savespots://"
          className="mt-6 block w-full rounded-full bg-theme-red px-5 py-3 font-semibold text-white transition hover:bg-theme-red-light"
        >
          Open the SaveSpots app
        </a>

        <Link
          href="/portal"
          className="mt-3 block w-full rounded-full border border-theme-red px-5 py-3 font-semibold text-theme-red transition hover:bg-theme-red/5"
        >
          Or use the web portal
        </Link>

        <p className="mt-6 text-sm text-theme-red-dark/60">
          On your phone? You can close this tab and return to the app.
        </p>
      </div>
    </main>
  );
}
