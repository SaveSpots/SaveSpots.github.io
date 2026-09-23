"use client";

/**
 * QR scan analytics for the admin dashboard.
 *
 * Reads public.qr_scans directly with the browser client — the
 * "qr_scans admin read" RLS policy is what authorises it, so a non-admin
 * session gets an empty result rather than a leak. There is no insert policy,
 * so nothing here can forge scans.
 */

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

interface Scan {
  code: string;
  scanned_at: string;
  country: string | null;
}

/** How far back the summary counts. */
const WINDOW_DAYS = 30;

function startOfWindow(): Date {
  const d = new Date();
  d.setDate(d.getDate() - WINDOW_DAYS);
  return d;
}

export function QrScanAnalytics({ db }: { db: SupabaseClient }) {
  const [scans, setScans] = useState<Scan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await db
        .from("qr_scans")
        .select("code, scanned_at, country")
        .gte("scanned_at", startOfWindow().toISOString())
        .order("scanned_at", { ascending: false })
        // A cap, not a page: the summary below is what matters, and pulling
        // an unbounded table into a phone browser is how dashboards die.
        .limit(5000);
      if (cancelled) return;
      if (error) setError(error.message);
      else setScans((data ?? []) as Scan[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [db]);

  const summary = useMemo(() => {
    if (!scans) return null;
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const byCode = new Map<
      string,
      { total: number; week: number; day: number; last: string }
    >();

    for (const scan of scans) {
      const t = new Date(scan.scanned_at).getTime();
      const row =
        byCode.get(scan.code) ??
        { total: 0, week: 0, day: 0, last: scan.scanned_at };
      row.total += 1;
      if (t >= weekAgo) row.week += 1;
      if (t >= dayAgo) row.day += 1;
      // Rows arrive newest-first, so the first one seen is the latest.
      byCode.set(scan.code, row);
    }

    return {
      total: scans.length,
      day: scans.filter((s) => new Date(s.scanned_at).getTime() >= dayAgo).length,
      week: scans.filter((s) => new Date(s.scanned_at).getTime() >= weekAgo).length,
      codes: [...byCode.entries()].sort((a, b) => b[1].total - a[1].total),
    };
  }, [scans]);

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold text-theme-red-dark">
        QR scans{" "}
        <span className="text-sm font-medium text-theme-red-dark/50">
          last {WINDOW_DAYS} days
        </span>
      </h2>

      {error ? (
        <p className="mt-2 text-sm text-theme-red">Could not load scans: {error}</p>
      ) : !summary ? (
        <p className="mt-2 text-sm text-theme-red-dark/60">Loading…</p>
      ) : summary.total === 0 ? (
        <p className="mt-2 text-sm text-theme-red-dark/60">
          No scans yet. Codes are live at savespots.org/qr/&lt;code&gt;.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { label: "Last 24h", value: summary.day },
              { label: "Last 7 days", value: summary.week },
              { label: `Last ${WINDOW_DAYS} days`, value: summary.total },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-display text-2xl font-extrabold text-theme-red-dark">
                  {value.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs font-medium text-theme-red-dark/60">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 overflow-x-auto rounded-2xl bg-white p-5 shadow-sm">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-theme-red-dark/50">
                  <th className="pb-2">Code</th>
                  <th className="pb-2 text-right">24h</th>
                  <th className="pb-2 text-right">7d</th>
                  <th className="pb-2 text-right">Total</th>
                  <th className="pb-2 text-right">Last scan</th>
                </tr>
              </thead>
              <tbody>
                {summary.codes.map(([code, row]) => (
                  <tr key={code} className="border-t border-theme-red-dark/5">
                    <td className="py-2 font-semibold text-theme-red-dark">{code}</td>
                    <td className="py-2 text-right tabular-nums text-theme-red-dark/80">
                      {row.day}
                    </td>
                    <td className="py-2 text-right tabular-nums text-theme-red-dark/80">
                      {row.week}
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums text-theme-red-dark">
                      {row.total}
                    </td>
                    <td className="py-2 text-right text-xs text-theme-red-dark/50">
                      {new Date(row.last).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-2 text-xs uppercase tracking-wider text-theme-red-dark/50">
              Most recent scans
            </p>
            <ul className="flex flex-col gap-1.5">
              {scans!.slice(0, 15).map((scan, i) => (
                <li
                  key={`${scan.scanned_at}-${i}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="font-semibold text-theme-red-dark">{scan.code}</span>
                  <span className="text-xs text-theme-red-dark/50">
                    {new Date(scan.scanned_at).toLocaleString()}
                    {scan.country ? ` · ${scan.country}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
