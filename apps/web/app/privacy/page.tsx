import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SaveSpots",
  description:
    "How the SaveSpots volunteer app collects, uses, and protects your information.",
};

// Plain, honest privacy policy for the SaveSpots volunteer mobile app.
// Update the EFFECTIVE date and the contact email before publishing.
const EFFECTIVE = "July 12, 2026";
const CONTACT = "hello@savespots.org"; // TODO: confirm the real contact address

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-theme-red-dark">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-theme-red-dark/60">
        Effective {EFFECTIVE}
      </p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-theme-red-dark/80">
        <p>
          SaveSpots (&ldquo;we,&rdquo; &ldquo;us&rdquo;) operates the SaveSpots
          volunteer mobile app. We are a nonprofit that places naloxone (Narcan)
          and fentanyl test strips in community locations to prevent overdose
          deaths. This policy explains what the app collects and how we use it.
          We collect the minimum needed to run the app.
        </p>

        <section>
          <h2 className="font-display text-2xl font-bold text-theme-red-dark">
            Information we collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Account information.</strong> When you create an account we
              collect your email address and the name you provide. Authentication
              is handled by our service provider, Supabase.
            </li>
            <li>
              <strong>Location.</strong> With your permission, the app uses your
              device location to show SaveBoxes near you and to tag the location
              of a new SaveBox you submit. You can deny or revoke this permission
              in your device settings; the app then falls back to a default city
              area and you can still submit locations manually.
            </li>
            <li>
              <strong>Content you submit.</strong> SaveBox details you log
              (name, address, city, hours, coordinates) and restock reports (kit
              counts, notes) are stored so the network stays current.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-theme-red-dark">
            How we use it
          </h2>
          <p className="mt-3">
            We use this information to operate the app: to sign you in, show
            nearby SaveBoxes, let you report restocks, and review new SaveBox
            submissions. We do not sell your personal information. We do not use
            it for advertising.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-theme-red-dark">
            Who can see it
          </h2>
          <p className="mt-3">
            SaveBox locations and their restock status are visible to other app
            users so volunteers can find and maintain them. Your email address
            and account details are not shown to other users. Our service
            provider (Supabase) stores the data on our behalf under their own
            security and privacy terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-theme-red-dark">
            Data retention and deletion
          </h2>
          <p className="mt-3">
            We keep your account and submitted content while your account is
            active. To delete your account and associated personal data, email us
            at{" "}
            <a className="underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>{" "}
            and we will remove it. Aggregated SaveBox location data may be
            retained to keep the public network accurate.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-theme-red-dark">
            Children
          </h2>
          <p className="mt-3">
            The app is intended for volunteers aged 13 and older. We do not
            knowingly collect information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-theme-red-dark">
            Changes and contact
          </h2>
          <p className="mt-3">
            We may update this policy; we will revise the effective date above.
            Questions or requests:{" "}
            <a className="underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
