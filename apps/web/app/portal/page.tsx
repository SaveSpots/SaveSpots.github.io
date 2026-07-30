"use client";

/**
 * Volunteer portal (web) — same features as the mobile app so volunteers
 * without a phone can participate: sign in/up with onboarding, waiver e-sign,
 * nearby boxes with check-ins, volunteer timer, submissions, account.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import {
  estimateTravel,
  fetchTravelTimes,
  formatMiles,
  formatRadiusMiles,
  type TravelEstimate,
  getNearbySaveboxes,
  getProfile,
  getMySubmissions,
  getMyCheckins,
  getActiveVolunteerSession,
  getVolunteerSessions,
  startVolunteerSession,
  stopVolunteerSession,
  reportRestock,
  submitNewSavebox,
  signWaiver,
  saveOnboarding,
  onboardingInputSchema,
  WAIVER_INTRO,
  WAIVER_SECTIONS,
  WAIVER_TITLE,
  type NearbySavebox,
  type Profile,
  type Restock,
  type Savebox,
  type VolunteerSession,
} from "@savespots/shared";
import { getSupabase } from "@/lib/supabase-browser";

const FALLBACK = { lat: 41.8781, lng: -87.6298 }; // Chicago
const MAP_RADIUS_M = 50000;

// Leaflet touches `window` at import time, so it cannot be server-rendered.
const NearbyMap = dynamic(() => import("@/components/nearby-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] w-full animate-pulse rounded-2xl bg-theme-red-dark/5" />
  ),
});


/** Upload a browser File to the checkin-photos bucket; returns public URL. */
async function uploadPhotoFile(userId: string, file: File): Promise<string> {
  const db = getSupabase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await db.storage.from("checkin-photos").upload(path, file);
  if (error) throw error;
  return db.storage.from("checkin-photos").getPublicUrl(path).data.publicUrl;
}

function checkinLabel(r: Restock): string {
  if (r.box_gone) {
    return r.replaced === true
      ? "Box was gone — replaced it"
      : r.replaced === false
        ? "Box was gone — NOT replaced"
        : "Box was gone";
  }
  if (r.needs_restock) {
    return r.kits_given != null
      ? `Restocked — ${r.kits_given} savekits given`
      : "Needs restock";
  }
  return "Box OK — no restock needed";
}

function fmtDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function sessionMs(s: VolunteerSession): number {
  const end = s.ended_at ? new Date(s.ended_at).getTime() : Date.now();
  return end - new Date(s.started_at).getTime();
}

const card = "rounded-2xl bg-white p-5 shadow-sm";
const btn =
  "rounded-full bg-theme-red px-5 py-2.5 font-semibold text-white transition hover:bg-theme-red-light disabled:opacity-50";
const btnOutline =
  "rounded-full border border-theme-red px-5 py-2.5 font-semibold text-theme-red transition hover:bg-theme-red/5 disabled:opacity-50";
const input =
  "w-full rounded-xl border border-theme-red-dark/15 bg-white px-4 py-2.5 text-theme-red-dark placeholder:text-theme-red-dark/40 focus:outline-none focus:ring-2 focus:ring-theme-red/40";

// ---------------------------------------------------------------------------
// Auth screen
// ---------------------------------------------------------------------------
function AuthScreen() {
  const db = getSupabase();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const parsed = onboardingInputSchema.safeParse({
          phone: phone.trim(),
          emergencyContactName: emergencyName.trim(),
          emergencyContactPhone: emergencyPhone.trim(),
        });
        if (!fullName.trim()) throw new Error("Full name required");
        if (!parsed.success)
          throw new Error(parsed.error.issues[0]?.message ?? "Check the fields");
        const { error, data } = await db.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (error) throw error;
        if (data.user) await saveOnboarding(db, data.user.id, parsed.data);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className={card}>
        <h2 className="font-display text-2xl font-extrabold text-theme-red-dark">
          {mode === "in" ? "Sign in" : "Create your account"}
        </h2>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          {mode === "up" && (
            <>
              <input className={input} placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input className={input} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className={input} placeholder="Emergency contact name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
              <input className={input} placeholder="Emergency contact phone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
            </>
          )}
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error ? <p className="text-sm font-semibold text-theme-red">{error}</p> : null}
          <button className={btn} disabled={busy} type="submit">
            {busy ? "..." : mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          className="mt-4 w-full text-center text-sm text-theme-red-dark/70 hover:text-theme-red"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
        >
          {mode === "in" ? "No account? Create one" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Waiver gate
// ---------------------------------------------------------------------------
function WaiverGate({ userId, onSigned }: { userId: string; onSigned: () => void }) {
  const [signature, setSignature] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [mediaConsent, setMediaConsent] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sign() {
    setError(null);
    if (!isAdult)
      return setError(
        "Confirm you are 18 or older. Volunteers under 18 must complete the paper form with a parent or guardian.",
      );
    if (mediaConsent === null)
      return setError("Choose whether you consent to photo/media use (section 8).");
    if (signature.trim().length < 2) return setError("Type your full legal name to sign.");
    if (!agreed) return setError("Check the box to confirm you agree.");
    setBusy(true);
    try {
      await signWaiver(getSupabase(), userId, signature.trim(), navigator.userAgent, mediaConsent);
      onSigned();
    } catch (e: any) {
      setError(e?.message ?? "Failed — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div className={card}>
        <p className="text-xs font-bold uppercase tracking-widest text-theme-red">
          SaveSpots · Harm Reduction &amp; Community Outreach
        </p>
        <h2 className="mt-1 font-display text-2xl font-extrabold leading-8 text-theme-red-dark">
          {WAIVER_TITLE}
        </h2>
        <p className="mt-1 text-sm text-theme-red-dark/70">
          One-time step — read and sign to start volunteering.
        </p>

        <div className="mt-4 max-h-96 overflow-y-auto rounded-xl bg-cream p-5">
          <p className="text-sm leading-6 text-theme-red-dark/90">{WAIVER_INTRO}</p>
          {WAIVER_SECTIONS.map((s) => (
            <div key={s.title} className="mt-5">
              <h3 className="font-display text-base font-bold text-theme-red-dark">{s.title}</h3>
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-theme-red-dark/90">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm font-semibold text-theme-red-dark">
          Photo/media release (section 8) — optional
        </p>
        <div className="mt-2 flex gap-2">
          {[
            { l: "I consent", v: true },
            { l: "I do NOT consent", v: false },
          ].map(({ l, v }) => (
            <button
              key={l}
              type="button"
              onClick={() => setMediaConsent(v)}
              className={
                mediaConsent === v
                  ? "flex-1 rounded-full bg-theme-red py-2 text-sm font-semibold text-white"
                  : "flex-1 rounded-full border border-theme-red-dark/20 py-2 text-sm font-semibold text-theme-red-dark/70 hover:border-theme-red"
              }
            >
              {l}
            </button>
          ))}
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-theme-red-dark">
          <input type="checkbox" checked={isAdult} onChange={(e) => setIsAdult(e.target.checked)} className="h-5 w-5 accent-[#B03A2E]" />
          I confirm I am 18 years of age or older.
        </label>

        <label className="mt-4 block text-sm font-semibold text-theme-red-dark">
          Type your full legal name to sign
        </label>
        <input className={`${input} mt-2`} value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Full legal name" />

        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-theme-red-dark">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#B03A2E]" />
          I have read this Agreement in its entirety, understand that I am giving up
          substantial legal rights, and agree to sign it electronically.
        </label>

        {error ? <p className="mt-3 text-sm font-semibold text-theme-red">{error}</p> : null}
        <button className={`${btn} mt-5 w-full`} onClick={sign} disabled={busy}>
          {busy ? "..." : "I agree — sign waiver"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Check-in form (inline, per box)
// ---------------------------------------------------------------------------
function CheckinForm({
  box,
  userId,
  onDone,
}: {
  box: NearbySavebox;
  userId: string;
  onDone: () => void;
}) {
  const [gone, setGone] = useState<boolean | null>(null);
  const [replaced, setReplaced] = useState<boolean | null>(null);
  const [needsRestock, setNeedsRestock] = useState<boolean | null>(null);
  const [kitsGiven, setKitsGiven] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
    return (
      <div className="flex gap-2">
        {[{ l: "Yes", v: true }, { l: "No", v: false }].map(({ l, v }) => (
          <button
            key={l}
            type="button"
            onClick={() => onChange(v)}
            className={
              value === v
                ? "flex-1 rounded-full bg-theme-red py-2 text-sm font-semibold text-white"
                : "flex-1 rounded-full border border-theme-red-dark/20 py-2 text-sm font-semibold text-theme-red-dark/70 hover:border-theme-red"
            }
          >
            {l}
          </button>
        ))}
      </div>
    );
  }

  async function submit() {
    setError(null);
    if (gone === null) return setError("Answer: is the box gone?");
    if (gone && replaced === null) return setError("Answer: did you replace the box?");
    if (!gone && needsRestock === null) return setError("Answer: is a restock necessary?");
    let kits: number | undefined;
    if (!gone && needsRestock) {
      kits = parseInt(kitsGiven, 10);
      if (Number.isNaN(kits) || kits < 0) return setError("Enter how many savekits you gave.");
    }
    setBusy(true);
    try {
      let photoUrl: string | undefined;
      if (photo) photoUrl = await uploadPhotoFile(userId, photo);
      await reportRestock(getSupabase(), userId, {
        saveboxId: box.id,
        boxGone: gone,
        replaced: gone ? replaced! : undefined,
        needsRestock: !gone && needsRestock === true,
        kitsGiven: kits,
        photoUrl,
        note: note.trim() || undefined,
      });
      onDone();
    } catch (e: any) {
      setError(e?.message ?? "Failed — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl bg-cream p-4">
      <p className="text-sm font-semibold text-theme-red-dark">Is the box gone?</p>
      <div className="mt-2">
        <YesNo
          value={gone}
          onChange={(v) => {
            setGone(v);
            if (v) { setNeedsRestock(null); setKitsGiven(""); } else setReplaced(null);
          }}
        />
      </div>
      {gone === true && (
        <>
          <p className="mt-3 text-sm font-semibold text-theme-red-dark">Did you replace the box?</p>
          <div className="mt-2"><YesNo value={replaced} onChange={setReplaced} /></div>
        </>
      )}
      {gone === false && (
        <>
          <p className="mt-3 text-sm font-semibold text-theme-red-dark">Is a restock necessary?</p>
          <div className="mt-2"><YesNo value={needsRestock} onChange={setNeedsRestock} /></div>
        </>
      )}
      {gone === false && needsRestock === true && (
        <>
          <p className="mt-3 text-sm font-semibold text-theme-red-dark">How many savekits given?</p>
          <input className={`${input} mt-2`} inputMode="numeric" placeholder="e.g. 5" value={kitsGiven} onChange={(e) => setKitsGiven(e.target.value)} />
        </>
      )}
      <p className="mt-3 text-sm font-semibold text-theme-red-dark">Photo (optional)</p>
      <input type="file" accept="image/*" className="mt-1 text-sm text-theme-red-dark/70" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
      <textarea className={`${input} mt-3`} rows={2} placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      {error ? <p className="mt-2 text-sm font-semibold text-theme-red">{error}</p> : null}
      <button className={`${btn} mt-3 w-full`} onClick={submit} disabled={busy}>
        {busy ? "..." : "Submit check-in"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Boxes tab
// ---------------------------------------------------------------------------
function BoxesTab({ userId }: { userId: string }) {
  const [boxes, setBoxes] = useState<NearbySavebox[]>([]);
  const [origin, setOrigin] = useState(FALLBACK);
  const [travel, setTravel] = useState<Record<string, TravelEstimate>>({});
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const go = (lat: number, lng: number) => {
      setOrigin({ lat, lng });
      return getNearbySaveboxes(getSupabase(), lat, lng, MAP_RADIUS_M)
        .then(async (rows) => {
          setBoxes(rows);
          // Routed times for the boxes actually shown. Same-origin, so baseUrl "".
          // Only the nearest few — every destination is a billed matrix element.
          const shown = rows.slice(0, 10);
          const times = await fetchTravelTimes(
            "",
            { lat, lng },
            shown.map((b) => ({ lat: b.lat, lng: b.lng })),
            shown.map((b) => b.distance_m),
          );
          setTravel(Object.fromEntries(shown.map((b, i) => [b.id, times[i]])));
        })
        .finally(() => setLoading(false));
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => go(pos.coords.latitude, pos.coords.longitude),
        () => go(FALLBACK.lat, FALLBACK.lng),
        { timeout: 8000 },
      );
    } else {
      go(FALLBACK.lat, FALLBACK.lng);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-theme-red-dark/60">Loading nearby SaveSpots…</p>;

  return (
    <div className="flex flex-col gap-3">
      {msg ? (
        <p className="rounded-xl bg-theme-red/10 p-3 text-sm font-semibold text-theme-red">{msg}</p>
      ) : null}
      {boxes.length > 0 ? (
        <NearbyMap
          boxes={boxes}
          origin={origin}
          onSelect={(b) => {
            setOpenId(b.id);
            document.getElementById(`box-${b.id}`)?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}
        />
      ) : null}
      {boxes.length === 0 ? (
        <p className="text-theme-red-dark/60">
          No active SaveSpots within {formatRadiusMiles(MAP_RADIUS_M)}.
        </p>
      ) : null}
      {boxes.map((b) => (
        <div key={b.id} id={`box-${b.id}`} className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-theme-red-dark">{b.name}</h3>
              <p className="text-sm text-theme-red-dark/70">{b.address}, {b.city}</p>
              {(() => {
                const t = travel[b.id] ?? estimateTravel(b.distance_m);
                return (
                  <p className="mt-1 text-sm font-bold text-theme-red">
                    {formatMiles(t.meters)} away · {t.estimated ? "~" : ""}
                    {t.label}
                    {b.hours ? ` · ${b.hours}` : ""}
                  </p>
                );
              })()}
            </div>
            <div className="flex gap-2">
              <a
                className={btnOutline}
                href={`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Directions
              </a>
              <button className={btn} onClick={() => setOpenId(openId === b.id ? null : b.id)}>
                {openId === b.id ? "Close" : "Check in"}
              </button>
            </div>
          </div>
          {openId === b.id ? (
            <CheckinForm
              box={b}
              userId={userId}
              onDone={() => {
                setOpenId(null);
                setMsg(`Check-in logged for ${b.name}. Thanks!`);
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timer tab
// ---------------------------------------------------------------------------
function TimerTab({ userId }: { userId: string }) {
  const db = getSupabase();
  const [active, setActive] = useState<VolunteerSession | null>(null);
  const [history, setHistory] = useState<VolunteerSession[]>([]);
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    const [a, h] = await Promise.all([
      getActiveVolunteerSession(db, userId),
      getVolunteerSessions(db, userId),
    ]);
    setActive(a);
    setHistory(h);
  }, [db, userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  async function toggle() {
    setBusy(true);
    try {
      if (active) {
        await stopVolunteerSession(db, active.id);
        setActive(null);
      } else {
        setActive(await startVolunteerSession(db, userId));
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  const totalMs = history.reduce((acc, s) => acc + (s.ended_at ? sessionMs(s) : 0), 0);
  const past = history.filter((s) => s.ended_at);

  return (
    <div className="flex flex-col gap-4">
      <div className={`${card} text-center`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-theme-red-dark/50">
          {active ? "Volunteering for" : "Volunteer timer"}
        </p>
        <p className="mt-2 font-display text-6xl font-extrabold text-theme-red-dark">
          {active ? fmtDuration(sessionMs(active)) : "0:00:00"}
        </p>
        <button className={`${active ? btnOutline : btn} mt-5 w-full`} onClick={toggle} disabled={busy}>
          {busy ? "..." : active ? "Stop timer" : "Start volunteering"}
        </button>
      </div>
      <div className={`${card} flex items-center justify-between`}>
        <span className="font-semibold text-theme-red-dark">Total time volunteered</span>
        <span className="font-display text-xl font-bold text-theme-red">{fmtDuration(totalMs)}</span>
      </div>
      {past.length > 0 ? (
        <div className={card}>
          <h3 className="font-display text-lg font-bold text-theme-red-dark">Past sessions</h3>
          <ul className="mt-2 divide-y divide-theme-red-dark/10">
            {past.map((s) => (
              <li key={s.id} className="flex justify-between py-2 text-sm">
                <span className="text-theme-red-dark/80">
                  {new Date(s.started_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </span>
                <span className="font-semibold text-theme-red">{fmtDuration(sessionMs(s))}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Submissions tab (incl. "log a SaveBox" form for web users)
// ---------------------------------------------------------------------------
function SubmissionsTab({ userId }: { userId: string }) {
  const db = getSupabase();
  const [boxes, setBoxes] = useState<Savebox[]>([]);
  const [checkins, setCheckins] = useState<(Restock & { savebox_name: string })[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [hours, setHours] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [b, c] = await Promise.all([getMySubmissions(db, userId), getMyCheckins(db, userId)]);
    setBoxes(b);
    setCheckins(c);
  }, [db, userId]);

  useEffect(() => {
    load();
  }, [load]);

  function tagLocation() {
    if (!navigator.geolocation) return setError("Geolocation not supported by this browser.");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Couldn't get your location — allow location access and retry."),
    );
  }

  async function submit() {
    setError(null);
    if (!coords) return setError("Tag your current location first.");
    if (!photo) return setError("A photo of the spot is required.");
    if (!name.trim() || !address.trim() || !city.trim())
      return setError("Name, address, and city are required.");
    setBusy(true);
    try {
      const photoUrl = await uploadPhotoFile(userId, photo);
      await submitNewSavebox(db, userId, {
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        lat: coords.lat,
        lng: coords.lng,
        hours: hours.trim() || undefined,
        photoUrl,
      });
      setShowForm(false);
      setName(""); setAddress(""); setCity(""); setHours(""); setPhoto(null); setCoords(null);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-theme-red-dark">SaveBoxes I submitted</h3>
          <button className={btnOutline} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Log a SaveBox"}
          </button>
        </div>
        {showForm ? (
          <div className="mt-4 flex flex-col gap-3 rounded-xl bg-cream p-4">
            <input className={input} placeholder="Location name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={input} placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <input className={input} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <input className={input} placeholder="Hours (optional)" value={hours} onChange={(e) => setHours(e.target.value)} />
            <button className={btnOutline} type="button" onClick={tagLocation}>
              {coords ? "Location tagged ✓ — retag" : "Use my current location"}
            </button>
            <label className="text-sm font-semibold text-theme-red-dark">
              Photo of the spot (required)
              <input type="file" accept="image/*" className="mt-1 block w-full text-sm font-normal text-theme-red-dark/70" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
            </label>
            {error ? <p className="text-sm font-semibold text-theme-red">{error}</p> : null}
            <button className={btn} onClick={submit} disabled={busy}>
              {busy ? "..." : "Submit for review"}
            </button>
          </div>
        ) : null}
        {boxes.length === 0 ? (
          <p className="mt-3 text-sm text-theme-red-dark/60">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-theme-red-dark/10">
            {boxes.map((b) => (
              <li key={b.id} className="py-3">
                <p className="font-semibold text-theme-red-dark">{b.name}</p>
                <p className="text-sm text-theme-red-dark/70">{b.address}, {b.city}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-theme-red">{b.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={card}>
        <h3 className="font-display text-lg font-bold text-theme-red-dark">My check-ins</h3>
        {checkins.length === 0 ? (
          <p className="mt-3 text-sm text-theme-red-dark/60">No check-ins yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-theme-red-dark/10">
            {checkins.map((r) => (
              <li key={r.id} className="py-3">
                <p className="font-semibold text-theme-red-dark">{r.savebox_name}</p>
                <p className="text-sm text-theme-red-dark/80">{checkinLabel(r)}</p>
                <p className="text-xs text-theme-red-dark/60">
                  {new Date(r.reported_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Account tab
// ---------------------------------------------------------------------------
function AccountTab({ profile, email }: { profile: Profile; email: string }) {
  const rows: [string, string][] = [
    ["Name", profile.full_name || "—"],
    ["Email", email],
    ["Phone", profile.phone ?? "—"],
    ["Emergency contact", profile.emergency_contact_name
      ? `${profile.emergency_contact_name} (${profile.emergency_contact_phone ?? "no phone"})`
      : "—"],
    ["Role", profile.role],
    ["Waiver signed", profile.waiver_signed_at
      ? new Date(profile.waiver_signed_at).toLocaleDateString()
      : "Not signed"],
    ["Member since", new Date(profile.created_at).toLocaleDateString()],
  ];
  return (
    <div className={card}>
      <h3 className="font-display text-lg font-bold text-theme-red-dark">Account</h3>
      <dl className="mt-3 divide-y divide-theme-red-dark/10">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2.5 text-sm">
            <dt className="font-semibold text-theme-red-dark/60">{k}</dt>
            <dd className="text-theme-red-dark">{v}</dd>
          </div>
        ))}
      </dl>
      <button className={`${btnOutline} mt-4 w-full`} onClick={() => getSupabase().auth.signOut()}>
        Sign out
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PortalPage() {
  const db = useMemo(() => getSupabase(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<"boxes" | "timer" | "submissions" | "account">("boxes");

  useEffect(() => {
    db.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: sub } = db.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [db]);

  const loadProfile = useCallback(async () => {
    if (!session) return setProfile(null);
    setProfile(await getProfile(db, session.user.id));
  }, [db, session]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const tabs = [
    { key: "boxes", label: "SaveSpots" },
    { key: "timer", label: "Volunteer timer" },
    { key: "submissions", label: "My submissions" },
    { key: "account", label: "Account" },
  ] as const;

  return (
    <main className="min-h-screen bg-cream px-4 pb-16 pt-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/" className="text-sm font-semibold text-theme-red hover:underline">
              ← savespots.org
            </Link>
            <h1 className="font-display text-3xl font-extrabold text-theme-red-dark">
              Volunteer Portal
            </h1>
          </div>
          {profile?.role === "admin" ? (
            <Link href="/portal/admin" className={btnOutline}>
              Admin dashboard
            </Link>
          ) : null}
        </header>

        {authLoading ? (
          <p className="mt-10 text-center text-theme-red-dark/60">Loading…</p>
        ) : !session ? (
          <AuthScreen />
        ) : profile && !profile.waiver_signed_at ? (
          <WaiverGate userId={session.user.id} onSigned={loadProfile} />
        ) : profile ? (
          <>
            <nav className="mt-6 flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={
                    tab === t.key
                      ? "rounded-full bg-theme-red px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-full bg-white px-4 py-2 text-sm font-semibold text-theme-red-dark/70 hover:text-theme-red"
                  }
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="mt-6">
              {tab === "boxes" ? <BoxesTab userId={session.user.id} /> : null}
              {tab === "timer" ? <TimerTab userId={session.user.id} /> : null}
              {tab === "submissions" ? <SubmissionsTab userId={session.user.id} /> : null}
              {tab === "account" ? (
                <AccountTab profile={profile} email={session.user.email ?? "—"} />
              ) : null}
            </div>
          </>
        ) : (
          <p className="mt-10 text-center text-theme-red-dark/60">Loading profile…</p>
        )}
      </div>
    </main>
  );
}
