/**
 * Monthly giving: resolving a dollar amount to a Square subscription plan
 * variation id.
 *
 * Square does not let a payment link charge an arbitrary recurring amount.
 * A donor subscribes to a *plan variation*, and a variation carries a fixed
 * price. So every distinct monthly amount needs its own catalog variation.
 *
 * Rather than pre-creating a variation per suggested tier and refusing custom
 * amounts, this module creates variations lazily and reuses them: the first
 * donor to give $37/month creates "SaveSpots Monthly Giving — $37", and every
 * later $37 donor reuses it. The catalog therefore grows with the number of
 * *distinct amounts*, not the number of donors, which keeps it small.
 *
 * Server-only — it imports lib/square.ts.
 */

import { squareFetch } from "@/lib/square";

const PLAN_NAME = "SaveSpots Monthly Giving";

/** Variation names are the lookup key, so the format must stay stable. */
function variationName(amountCents: number): string {
  return `${PLAN_NAME} — $${(amountCents / 100).toFixed(2)}`;
}

/**
 * Process-local memo. Saves a catalog round-trip on repeat amounts within one
 * server instance; a cold start just re-reads from Square, so it is a cache,
 * never a source of truth.
 */
const variationIdCache = new Map<number, string>();
let planIdCache: string | null = null;

interface CatalogObject {
  type: string;
  id: string;
  subscription_plan_data?: { name?: string };
  subscription_plan_variation_data?: { name?: string; subscription_plan_id?: string };
}

async function listCatalogObjects(types: string): Promise<CatalogObject[]> {
  const objects: CatalogObject[] = [];
  let cursor: string | undefined;

  // The donation catalog is small, but paginate anyway — a truncated first
  // page would silently create a duplicate plan on every request.
  do {
    const query = new URLSearchParams({ types });
    if (cursor) query.set("cursor", cursor);
    const page = await squareFetch<{ objects?: CatalogObject[]; cursor?: string }>(
      `/v2/catalog/list?${query.toString()}`
    );
    objects.push(...(page.objects ?? []));
    cursor = page.cursor;
  } while (cursor);

  return objects;
}

async function ensurePlanId(): Promise<string> {
  if (planIdCache) return planIdCache;

  const existing = (await listCatalogObjects("SUBSCRIPTION_PLAN")).find(
    (object) => object.subscription_plan_data?.name === PLAN_NAME
  );
  if (existing) {
    planIdCache = existing.id;
    return existing.id;
  }

  const created = await squareFetch<{ catalog_object: CatalogObject }>(
    "/v2/catalog/object",
    {
      method: "POST",
      body: {
        idempotency_key: crypto.randomUUID(),
        object: {
          type: "SUBSCRIPTION_PLAN",
          // A "#"-prefixed id is Square's placeholder syntax for a new object.
          id: "#savespots-monthly-giving",
          subscription_plan_data: { name: PLAN_NAME },
        },
      },
    }
  );

  planIdCache = created.catalog_object.id;
  return planIdCache;
}

/**
 * Returns the plan variation id that bills `amountCents` every month,
 * creating it if this is the first gift at that amount.
 */
export async function ensureMonthlyVariationId(amountCents: number): Promise<string> {
  const cached = variationIdCache.get(amountCents);
  if (cached) return cached;

  const planId = await ensurePlanId();
  const name = variationName(amountCents);

  const existing = (await listCatalogObjects("SUBSCRIPTION_PLAN_VARIATION")).find(
    (object) =>
      object.subscription_plan_variation_data?.name === name &&
      object.subscription_plan_variation_data?.subscription_plan_id === planId
  );
  if (existing) {
    variationIdCache.set(amountCents, existing.id);
    return existing.id;
  }

  const created = await squareFetch<{ catalog_object: CatalogObject }>(
    "/v2/catalog/object",
    {
      method: "POST",
      body: {
        idempotency_key: crypto.randomUUID(),
        object: {
          type: "SUBSCRIPTION_PLAN_VARIATION",
          id: `#savespots-monthly-${amountCents}`,
          subscription_plan_variation_data: {
            name,
            subscription_plan_id: planId,
            phases: [
              {
                cadence: "MONTHLY",
                ordinal: 0,
                // No `periods`: omitting it bills indefinitely, which is what
                // a recurring donation is. Setting periods would silently end
                // the donor's giving after N months.
                pricing: {
                  type: "STATIC",
                  price_money: { amount: amountCents, currency: "USD" },
                },
              },
            ],
          },
        },
      },
    }
  );

  const id = created.catalog_object.id;
  variationIdCache.set(amountCents, id);
  return id;
}
