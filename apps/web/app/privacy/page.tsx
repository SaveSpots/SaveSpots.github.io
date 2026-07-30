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
              collect your email address, your name, and your phone number.
              Authentication is handled by our service provider, Supabase.
            </li>
            <li>
              <strong>Emergency contact.</strong> Volunteers provide an emergency
              contact name and phone number at sign-up. This is used only to
              reach someone on your behalf if you are hurt while volunteering. It
              is never shown to other volunteers.
            </li>
            <li>
              <strong>Waiver record.</strong> When you sign the volunteer waiver
              electronically we store the name you typed as your signature, the
              waiver version, the date and time, your device or browser
              identifier, and your photo/media release choice. This is kept as a
              legal record of your agreement.
            </li>
            <li>
              <strong>Photos.</strong> Every check-in requires a photo of the
              SaveBox, and submitting a new location requires a photo of the
              spot. With your permission the app uses your camera or photo
              library for this. Only the photo you choose is uploaded — we do not
              access the rest of your library. These photos are stored publicly
              so volunteers and coordinators can verify the state of a box, so
              please avoid capturing people or anything identifying.
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
              (name, address, city, hours, coordinates) and check-in reports
              (whether the box was there, whether it was restocked, how many
              SaveKits you left, and any notes) are stored so the network stays
              current.
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
            SaveBox locations, their check-in status, and check-in photos are
            visible to other app users so volunteers can find and maintain them.
            Your email address, phone number, emergency contact, and waiver
            record are not shown to other users — only you and SaveSpots
            administrators can see them. Our service provider (Supabase) stores
            the data on our behalf under their own security and privacy terms.
            When the app estimates travel time to a SaveBox, the coordinates of
            your starting point and the destination are sent to the Google Routes
            API; no account information is included in that request.
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
