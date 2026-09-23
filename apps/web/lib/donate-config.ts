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
  /** What the gift buys. The headline of the tier. */
  funds: string;
  /** Approximate reach, shown in parentheses. See IMPACT_CLAIMS below. */
  lives: string;
  /** Pre-selected when the page loads. Exactly one tier should set this. */
  featured?: boolean;
}

/**
 * IMPACT_CLAIMS: every line below is a representation to a donor about what
 * their money does, and the "lives saved" figures are the strongest claim on
 * the page. They are SaveSpots' own approximate coverage estimates, not
 * measured outcomes, so:
 *   - the page labels them approximate wherever they appear, and
 *   - UNRESTRICTED_NOTICE keeps them from reading as an earmark.
 * Do not tighten this wording into a guarantee without outcome data behind it.
 */
export const giftTiers: GiftTier[] = [
  { amount: 25, funds: "1 SaveKit", lives: "~1 life saved" },
  // The in-between rungs are derived from the $25-per-kit unit rather than
  // invented, so a donor who does the arithmetic finds it holds: three kits is
  // half a box, and $300 is a box plus one full restock of six more kits.
  { amount: 75, funds: "3 SaveKits — half a SaveBox", lives: "~3 lives saved" },
  { amount: 150, funds: "1 SaveBox", lives: "~6 lives saved", featured: true },
  { amount: 300, funds: "1 SaveBox plus a full restock", lives: "~12 lives saved" },
  { amount: 500, funds: "1 SaveBox stocked for three months", lives: "20+ lives saved" },
];

export const MIN_GIFT_USD = 1;
/** Ceiling is a typo guard, not a policy. Large gifts: route to email. */
export const MAX_GIFT_USD = 10_000;

export const org = {
  /** Matches the IRS determination letter and the Square location name. */
  legalName: "SaveSpots NFP",
  ein: "39-3700157",
  /** CONFIRM — registered address on the Form 990 / state registration. */
  address: "Chicago, Illinois",
  email: "sameer@savespots.org",
} as const;

/**
 * IRS Pub. 1771: a written acknowledgment for a gift of $250 or more must
 * state that no goods or services were provided in exchange. We show it for
 * every gift so the on-screen confirmation doubles as a valid receipt.
 */
export const NO_GOODS_OR_SERVICES =
  "No goods or services were provided in exchange for this contribution.";

export const TAX_DEDUCTIBLE_NOTICE = `${org.legalName} is a tax-exempt organization under Section 501(c)(3) of the Internal Revenue Code (EIN ${org.ein}). Contributions are tax-deductible to the extent allowed by law.`;

/**
 * Keeps the tier impact lines legally safe: the amounts above are coverage
 * estimates, not restricted gifts we are obligated to spend that exact way.
 */
export const UNRESTRICTED_NOTICE =
  "Amounts shown are approximate coverage estimates. Gifts are unrestricted and support the SaveSpots mission where the need is greatest.";
