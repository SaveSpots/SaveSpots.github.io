/**
 * Route segment config for /portal and /portal/admin.
 *
 * These pages are entirely client-rendered and every byte they show is fetched
 * from Supabase for the signed-in user — there is nothing meaningful to
 * prerender. Worse, prerendering actively breaks the build: the page components
 * call getSupabase() during render, so a build environment without
 * NEXT_PUBLIC_SUPABASE_URL fails with "supabaseUrl is required" while
 * generating static pages.
 *
 * force-dynamic keeps them out of static generation, so the build no longer
 * depends on runtime secrets being present. The vars are still required at
 * runtime — see RELEASE.md.
 *
 * This must live in a server component; route segment config exported from a
 * "use client" file is ignored.
 */
export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
