"use client";

/**
 * Admin dashboard: approve/reject pending SaveBox submissions, manage box
 * status, and watch the latest check-ins. Access requires profiles.role =
 * 'admin' (enforced by RLS server-side; the UI also gates).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import {
  adminGetSaveboxes,
  adminGetRecentCheckins,
  adminGetVolunteers,
  adminSetSaveboxStatus,
  getProfile,
  timeAgo,
  type AdminVolunteer,
  type Profile,
  type Restock,
  type Savebox,
} from "@savespots/shared";
import { getSupabase } from "@/lib/supabase-browser";

const card = "rounded-2xl bg-white p-5 shadow-sm";
const btn =
  "rounded-full bg-theme-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-theme-red-light disabled:opacity-50";
const btnOutline =
  "rounded-full border border-theme-red px-4 py-2 text-sm font-semibold text-theme-red transition hover:bg-theme-red/5 disabled:opacity-50";

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
  return "Box OK";
}

export default function AdminPage() {
  const db = useMemo(() => getSupabase(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [boxes, setBoxes] = useState<Savebox[]>([]);
  const [checkins, setCheckins] = useState<(Restock & { savebox_name: string })[]>([]);
  const [volunteers, setVolunteers] = useState<AdminVolunteer[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Emergency contacts are only shown on request — they shouldn't sit on screen
  // in a shared or screen-shared window by default.
  const [showContacts, setShowContacts] = useState(false);

  useEffect(() => {
    db.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) {
        setProfile(await getProfile(db, data.session.user.id));
      }
      setLoading(false);
    });
  }, [db]);

  const load = useCallback(async () => {
    const [b, c, v] = await Promise.all([
      adminGetSaveboxes(db),
      adminGetRecentCheckins(db, 30),
      adminGetVolunteers(db),
    ]);
    setBoxes(b);
    setCheckins(c);
    setVolunteers(v);
  }, [db]);

  useEffect(() => {
    if (profile?.role === "admin") load();
  }, [profile, load]);

  async function setStatus(id: string, status: "active" | "retired" | "pending") {
    setBusyId(id);
    try {
      await adminSetSaveboxStatus(db, id, status);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream p-8 text-center text-theme-red-dark/60">
        Loading…
      </main>
    );
  }

  if (!session || profile?.role !== "admin") {
    return (
      <main className="min-h-screen bg-cream p-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
          <h1 className="font-display text-xl font-extrabold text-theme-red-dark">
            Admins only
          </h1>
          <p className="mt-2 text-sm text-theme-red-dark/70">
            {session
              ? "Your account doesn't have admin access."
              : "Sign in through the volunteer portal first."}
          </p>
          <Link href="/portal" className={`${btn} mt-4 inline-block`}>
            Go to the portal
          </Link>
        </div>
      </main>
    );
  }

  const pending = boxes.filter((b) => b.status === "pending");
  const others = boxes.filter((b) => b.status !== "pending");

  /** Resolve a submitted_by / reported_by id to a display name. */
  const volunteerName = (id: string | null) =>
    (id && volunteers.find((v) => v.profile.id === id)?.profile.full_name) || "—";

  return (
    <main className="min-h-screen bg-cream px-4 pb-16 pt-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/portal" className="text-sm font-semibold text-theme-red hover:underline">
              ← Volunteer portal
            </Link>
            <h1 className="font-display text-3xl font-extrabold text-theme-red-dark">
              Admin dashboard
            </h1>
          </div>
          <span className="rounded-full bg-theme-red/10 px-4 py-1.5 text-sm font-semibold text-theme-red">
            {pending.length} pending review
          </span>
        </header>

        {/* Pending approvals */}
        <section className="mt-6">
          <h2 className="font-display text-xl font-bold text-theme-red-dark">
            Pending submissions
          </h2>
          {pending.length === 0 ? (
            <p className="mt-2 text-sm text-theme-red-dark/60">Nothing waiting for review.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {pending.map((b) => (
                <div key={b.id} className={card}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-theme-red-dark">{b.name}</h3>
                      <p className="text-sm text-theme-red-dark/70">{b.address}, {b.city}</p>
                      {b.hours ? (
                        <p className="text-sm text-theme-red-dark/70">Hours: {b.hours}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-theme-red-dark/50">
                        Submitted {new Date(b.created_at).toLocaleString()} by{" "}
                        {volunteerName(b.submitted_by)}
                      </p>
                      <a
                        className="mt-1 inline-block text-xs font-semibold text-theme-red hover:underline"
                        href={`https://www.google.com/maps?q=${b.lat},${b.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on map ↗
                      </a>
                    </div>
                    {b.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.photo_url}
                        alt={`Photo of ${b.name}`}
                        className="h-28 w-40 rounded-xl object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className={btn}
                      disabled={busyId === b.id}
                      onClick={() => setStatus(b.id, "active")}
                    >
                      Approve — make active
                    </button>
                    <button
                      className={btnOutline}
                      disabled={busyId === b.id}
                      onClick={() => setStatus(b.id, "retired")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* All boxes */}
        <section className="mt-8">
          <h2 className="font-display text-xl font-bold text-theme-red-dark">All SaveBoxes</h2>
          <div className={`${card} mt-3 overflow-x-auto p-0`}>
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-theme-red-dark/10 text-xs uppercase text-theme-red-dark/50">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Submitted by</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-red-dark/5">
                {others.map((b) => (
                  <tr key={b.id}>
                    <td className="px-5 py-3 font-semibold text-theme-red-dark">{b.name}</td>
                    <td className="px-5 py-3 text-theme-red-dark/70">{b.city}</td>
                    <td className="px-5 py-3 text-theme-red-dark/70">
                      {volunteerName(b.submitted_by)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          b.status === "active"
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                            : "rounded-full bg-theme-red-dark/10 px-2.5 py-1 text-xs font-semibold text-theme-red-dark/60"
                        }
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {b.status === "active" ? (
                        <button
                          className="text-xs font-semibold text-theme-red hover:underline"
                          disabled={busyId === b.id}
                          onClick={() => setStatus(b.id, "retired")}
                        >
                          Retire
                        </button>
                      ) : (
                        <button
                          className="text-xs font-semibold text-theme-red hover:underline"
                          disabled={busyId === b.id}
                          onClick={() => setStatus(b.id, "active")}
                        >
                          Re-activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Volunteers */}
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-theme-red-dark">
              Volunteers{" "}
              <span className="text-base font-normal text-theme-red-dark/50">
                ({volunteers.length})
              </span>
            </h2>
            <button
              className="text-sm font-semibold text-theme-red hover:underline"
              onClick={() => setShowContacts((s) => !s)}
            >
              {showContacts ? "Hide emergency contacts" : "Show emergency contacts"}
            </button>
          </div>

          <div className={`${card} mt-3 overflow-x-auto p-0`}>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-theme-red-dark/10 text-xs uppercase text-theme-red-dark/50">
                  <th className="px-5 py-3">Volunteer</th>
                  <th className="px-5 py-3">Last activity</th>
                  <th className="px-5 py-3">Check-ins</th>
                  <th className="px-5 py-3">Submissions</th>
                  <th className="px-5 py-3">
                    {showContacts ? "Emergency contact" : "Joined"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-red-dark/5">
                {volunteers.map((v) => (
                  <tr key={v.profile.id}>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-theme-red-dark">
                        {v.profile.full_name || "—"}
                        {v.profile.role === "admin" ? (
                          <span className="ml-2 rounded-full bg-theme-red/10 px-2 py-0.5 text-xs font-semibold text-theme-red">
                            admin
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-theme-red-dark/60">
                        {v.profile.phone ?? "no phone"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {v.lastActivityAt ? (
                        <>
                          <div className="text-theme-red-dark">
                            {timeAgo(v.lastActivityAt)}
                          </div>
                          <div className="text-xs text-theme-red-dark/60">
                            {v.lastActivityKind}
                          </div>
                        </>
                      ) : (
                        <span className="text-theme-red-dark/40">never active</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-theme-red-dark">{v.checkinCount}</td>
                    <td className="px-5 py-3 text-theme-red-dark">
                      {v.submissionCount}
                    </td>
                    <td className="px-5 py-3">
                      {showContacts ? (
                        v.profile.emergency_contact_name ? (
                          <>
                            <div className="text-theme-red-dark">
                              {v.profile.emergency_contact_name}
                            </div>
                            <div className="text-xs text-theme-red-dark/60">
                              {v.profile.emergency_contact_phone ?? "no phone"}
                            </div>
                          </>
                        ) : (
                          <span className="text-theme-red-dark/40">not provided</span>
                        )
                      ) : (
                        <span className="text-theme-red-dark/70">
                          {new Date(v.profile.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showContacts ? (
            <p className="mt-2 text-xs text-theme-red-dark/50">
              Emergency contacts are personal data. Use them only to reach someone on a
              volunteer&apos;s behalf.
            </p>
          ) : null}
        </section>

        {/* Recent check-ins */}
        <section className="mt-8">
          <h2 className="font-display text-xl font-bold text-theme-red-dark">Recent check-ins</h2>
          {checkins.length === 0 ? (
            <p className="mt-2 text-sm text-theme-red-dark/60">No check-ins yet.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {checkins.map((r) => (
                <div key={r.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-theme-red-dark">{r.savebox_name}</span>
                      <span className="ml-2 text-sm text-theme-red-dark/80">{checkinLabel(r)}</span>
                      {r.needs_restock ? (
                        <span className="ml-2 rounded-full bg-theme-red/10 px-2 py-0.5 text-xs font-semibold text-theme-red">
                          needs restock
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-theme-red-dark/50">
                      {new Date(r.reported_at).toLocaleString()}
                    </span>
                  </div>
                  {r.note ? (
                    <p className="mt-1 text-sm text-theme-red-dark/70">{r.note}</p>
                  ) : null}
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photo_url}
                      alt="Check-in photo"
                      className="mt-2 h-32 rounded-lg object-cover"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
