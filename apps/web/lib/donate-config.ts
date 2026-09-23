/**
 * Donation page configuration.
 *
 * Split out from site-data.ts because the legal/compliance strings here are
 * not "content" — the IRS substantiation language and the EIN have to be
 * accurate, and they are reused verbatim on the donate page, the thank-you
 * page, and (later) the emailed receipt.
 *
 * CONFIRM = Sameer to verify against the IRS determination letter and the
 * Illinois AG charitable registration before this ships publicly.
 */

/** Suggested gift amounts, in whole US dollars. */
export interface GiftTier {
  amount: number;
  /** Short impact line. Keep it literally true — see IMPACT_CLAIMS note below. */
  impact: string;
  /** Pre-selected when the page loads. Exactly one tier should set this. */
  featured?: boolean;
}

/**
 * IMPACT_CLAIMS: every line below is a representation to a donor about what
 * their money does. Until unit costs are confirmed these are written as
 * directional ("helps stock", "covers") rather than exact counts, and the
 * page carries the unrestricted-gift disclaimer required to keep them honest.
 * CONFIRM real per-unit costs, then tighten the copy.
 */
export const giftTiers: GiftTier[] = [
  { amount: 25, impact: "Helps stock a SaveBox with naloxone" },
  { amount: 50, impact: "Covers fentanyl test strips for a site", featured: true },
  { amount: 100, impact: "Helps place a new SaveBox in the community" },
  { amount: 250, impact: "Supports a full neighborhood restock cycle" },
];

export const MIN_GIFT_USD = 1;
/** Ceiling is a typo guard, not a policy. Large gifts: route to email. */
export const MAX_GIFT_USD = 10_000;

export const org = {
  /** Legal name exactly as it appears on the IRS determination letter. CONFIRM. */
  legalName: "SaveSpots NFP",
  /** CONFIRM — replace with the real EIN. Donors need this to claim the deduction. */
  ein: "00-0000000",
  /** CONFIRM — registered address on the Form 990 / state registration. */
  address: "Chicago, Illinois",
  email: "savespotsinfo@gmail.com",
} as const;

/**
 * IRS Pub. 1771: a written acknowledgment for a gift of $250 or more must
 * state that no goods or services were provided in exchange. We show it for
 * every gift so the on-screen confirmation doubles as a valid receipt.
 */
export const NO_GOODS_OR_SERVICES =
  "No goods or services were provided in exchange for this contribution.";

export const TAX_DEDUCTIBLE_NOTICE = `${org.legalName} is a tax-exempt organization under Section 501(c)(3) of the Internal Revenue Code (EIN ${org.ein}). Contributions are tax-deductible to the extent allowed by law.`;

/** Keeps the tier impact lines legally safe: gifts are not earmarked. */
export const UNRESTRICTED_NOTICE =
  "Gifts are unrestricted and support the SaveSpots mission where the need is greatest.";
