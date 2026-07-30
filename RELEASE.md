# SaveSpots — release runbook

Everything that can be automated is done. What's left needs a browser login
(Apple 2FA, Netlify dashboard, Supabase dashboard) — those can't be scripted.

## 1. iOS build + submit

```bash
cd apps/mobile
npx eas-cli build --platform ios --profile production   # asks Apple ID + 2FA
npx eas-cli submit --platform ios --profile production
```

EAS generates the Distribution Certificate and Provisioning Profile — say yes.
Build ~20 min. Already configured: EAS project `7a243f14-82fb-471d-9028-a5510d20cc39`,
bundle `org.savespots.app`, version `1.0.0`, camera/photo/location permission strings,
`ITSAppUsesNonExemptEncryption: false` (skips the export-compliance prompt).

### Shipping JS fixes without another review

`expo-updates` is configured, so bug fixes to JS don't need App Store review:

```bash
npx eas-cli update --branch production --message "fix X"
```

Native changes (new permissions, SDK bumps) still need a full build + review.

## 2. App Store Connect

Create the app record for `org.savespots.app`, then fill in:

- **Screenshots** — 6.7" iPhone required (1290×2796). Map screen, check-in flow,
  box detail.
- **Description / keywords / support URL**
- **Privacy policy URL** — `https://savespots.org/privacy`
- **Demo account** (required — the app is fully login-gated, Apple rejects
  without one):

  ```
  appreview@savespots.org
  AppReview2026!Demo
  ```

  Already created, onboarding filled, waiver pre-cleared so review isn't blocked
  behind a legal signature screen.

- **App Privacy questionnaire** — the app collects: name, email, phone,
  emergency contact, precise location, photos. All linked to identity. Declare
  these or the build gets held.
- **Review notes** — worth pre-empting guideline 1.4.1 (physical harm):
  > SaveSpots directs volunteers to publicly-available naloxone (Narcan) supply
  > boxes maintained by community partners. It provides no medical advice,
  > diagnosis, or dosing instructions, and dispenses nothing itself.

## 3. Netlify (do before submitting — the app calls this API)

`netlify.toml` is committed and `@netlify/plugin-nextjs` is installed. The prod
site was serving a stale static build, so `/portal` and `/api/eta` 404'd.

In the Netlify dashboard for savespots.org:

1. **Build settings** — clear any base/publish overrides set in the UI, so
   `netlify.toml` wins.
2. **Environment variables** — add all three:
   ```
   NEXT_PUBLIC_SUPABASE_URL       https://xbfihrolwvafkcwyxwzk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY  <from apps/web/.env>
   GOOGLE_MAPS_API_KEY            <from apps/web/.env.local>   # server-only, no NEXT_PUBLIC_
   ```
   Without `GOOGLE_MAPS_API_KEY`, `/api/eta` returns 503 and both apps fall back
   to straight-line time estimates (degraded, not broken).
3. **Trigger deploy**, then verify:
   ```bash
   curl -o /dev/null -w "%{http_code}\n" https://savespots.org/portal        # expect 200
   curl -X POST https://savespots.org/api/eta -H 'Content-Type: application/json' \
     -d '{"origin":{"lat":41.87,"lng":-87.62},"destinations":[{"lat":41.85,"lng":-87.66}]}'
   ```

## 4. Supabase — email verification (still off)

Anyone can currently sign up with any address, real or not.

1. Dashboard → Authentication → **SMTP Settings**:
   ```
   Host: smtp.resend.com    Port: 587
   Username: resend
   Password: <Resend API key>
   Sender: noreply@savespots.org
   ```
   savespots.org is already verified in Resend (test send confirmed).
2. Then Authentication → Providers → Email → **Confirm email: ON**.

Order matters. Flipping confirmations on before SMTP is configured breaks
signups — Supabase's built-in sender is rate-limited to a few per hour.

## 5. Security follow-ups

- **Rotate the admin password.** `admin@savespots.org` / `SaveSpotsHoodTakeover12!`
  was shared in a chat transcript.
- **Restrict the Google Maps key** in Cloud Console — Routes API only, plus an
  HTTP-referrer or IP restriction. It's server-side now, but it has been exposed
  in conversation.
- `minimum_password_length = 6` in `supabase/config.toml` is low; 10+ is better.

## Already handled

- Role-escalation vulnerability (any volunteer could PATCH themselves to admin)
  — fixed via trigger, applied to prod, verified returns 403.
- Check-in photos are mandatory at the DB level (`restocks.photo_url NOT NULL`).
