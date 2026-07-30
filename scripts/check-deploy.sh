#!/usr/bin/env bash
# Is the live site actually serving the current code?
#
# WHY THIS EXISTS: a hosted build that fails does not take the site down — it
# leaves the previous deploy published. From the outside that is invisible.
# savespots.org sat frozen for 19 days and 30 commits because of exactly this.
#
# This asserts that routes which exist in the repo also exist in production.
# Run it after a push, or on a schedule.
#
#   ./scripts/check-deploy.sh                      # checks savespots.org
#   ./scripts/check-deploy.sh https://foo.app      # checks somewhere else
#
# Exit 0 = live site has all expected routes. Exit 1 = deploy is stale/broken.

set -uo pipefail

HOST="${1:-https://savespots.org}"

# Routes that must exist. Add to this list as the app grows — anything here is
# a route whose absence in production means the deploy is behind the repo.
ROUTES=(/ /privacy /portal /portal/admin)

echo "Checking deploy freshness: $HOST"
echo

fail=0
for route in "${ROUTES[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "${HOST}${route}")
  if [ "$code" = "200" ]; then
    printf '  ok    %-16s %s\n' "$route" "$code"
  else
    printf '  FAIL  %-16s %s\n' "$route" "$code"
    fail=1
  fi
done

# /api/eta is a server route. If the host deployed the app as static files it
# will 404 here even when the pages render — that distinction matters, because
# it silently degrades the mobile app's drive-time estimates.
eta=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 -X POST "${HOST}/api/eta" \
  -H 'Content-Type: application/json' \
  -d '{"origin":{"lat":41.88,"lng":-87.63},"destinations":[{"lat":41.85,"lng":-87.66}]}')
case "$eta" in
  200) printf '  ok    %-16s %s\n' "/api/eta" "$eta" ;;
  503) printf '  WARN  %-16s %s (route live, GOOGLE_MAPS_API_KEY missing)\n' "/api/eta" "$eta" ;;
  *)   printf '  FAIL  %-16s %s (server routes not deployed?)\n' "/api/eta" "$eta"; fail=1 ;;
esac

echo
if [ "$fail" -eq 0 ]; then
  echo "Deploy looks current."
else
  echo "Deploy is STALE or BROKEN — the host is serving older code than this repo."
  echo "Check the host's deploy log; a failed build leaves the previous deploy published."
fi
exit "$fail"
