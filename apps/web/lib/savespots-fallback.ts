/**
 * A SaveSpot as the public map and stats consume it.
 */
export type SaveSpotLocation = {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  hours?: string | null;
  notes?: string;
};

/**
 * Hand-kept snapshot of SaveSpots, used ONLY when the live list can't be
 * loaded (Supabase paused or unreachable, env vars missing) so the map and the
 * "Active SaveSpots" count are never blank. The real source is the `saveboxes`
 * table: marking a box active in the admin dashboard updates both, no code
 * change needed.
 */
export const FALLBACK_SAVESPOTS: SaveSpotLocation[] = [
  {
    name: "Al-Tayyab Zabiha Halal Meat and Grocery",
    address: "2753 W Devon Ave, Chicago, IL 60659",
    lat: 41.99750978607458,
    lng: -87.69927603410231,
    hours: "11 AM - 8 PM Wed-Mon, 1:30 PM - 8 PM Tues",
    notes: "Front counter",
  },
  {
    name: "Casey's Corner",
    address: "2733 W Devon Ave, Chicago, IL 60659",
    lat: 41.99753141291217,
    lng: -87.69857193993684,
    hours: "3 PM - 1 AM Tues-Sat (Closed Mon)",
    notes: "Left Counter (or ask bartender)",
  },
  {
    name: "3000 W 63rd St",
    address: "3000 W 63rd St, Chicago, IL",
    lat: 41.7785,
    lng: -87.7,
    hours: "24/7",
  },
  {
    name: "1741 S Ruble St",
    address: "1741 S Ruble St, Chicago, IL",
    lat: 41.852,
    lng: -87.662,
    hours: "24/7",
  },
  {
    name: "500 W 34th St",
    address: "500 W 34th St, Steger, IL",
    lat: 41.47,
    lng: -87.636,
    hours: "24/7",
  },
  {
    name: "3400 Union Ave",
    address: "3400 Union Ave, Steger, IL",
    lat: 41.472,
    lng: -87.638,
    hours: "24/7",
  },
  {
    name: "7348 South Stony Island",
    address: "7348 South Stony Island, Chicago, IL",
    lat: 41.761,
    lng: -87.585,
    hours: "24/7",
  },
  {
    name: "5458 S Wells St",
    address: "5458 S Wells St, Chicago, IL",
    lat: 41.792,
    lng: -87.632,
    hours: "24/7",
  },
  {
    name: "7859 S State St",
    address: "7859 S State St, Chicago, IL",
    lat: 41.751,
    lng: -87.622,
    hours: "24/7",
  },
  {
    name: "R&S Beverages",
    address: "308 E 75th St, Chicago, IL 60619",
    lat: 41.7585743,
    lng: -87.6177796,
    hours: "Sun 11AM–11PM, Mon–Wed 9AM–11PM, Thu–Sat 9AM–12AM",
    notes: "Liquor Store",
  },
  {
    name: "Brick's Nightclub",
    address: "4422 W Madison St, Chicago, IL 60624",
    lat: 41.8811101,
    lng: -87.7364876,
    hours: "Sun–Fri 12PM–2AM, Sat 12PM–3AM",
    notes: "Nightclub",
  },
  {
    name: "Grove Market",
    address: "6656 S Cottage Grove Ave, Chicago, IL 60637",
    lat: 41.773325,
    lng: -87.6061206,
    hours: "Hours not confirmed",
    notes: "Grocery Store",
  },
  {
    name: "7 Seas Food & Meat Mart",
    address: "6501 S Cottage Grove Ave, Chicago, IL 60637",
    lat: 41.776656,
    lng: -87.605736,
    hours: "8AM–10PM daily",
    notes: "Grocery Store",
  },
  {
    name: "JB One Restaurant",
    address: "6359 S Cottage Grove Ave, Chicago, IL 60637",
    lat: 41.7791749,
    lng: -87.6057919,
    hours: "Hours not confirmed",
    notes: "Restaurant",
  },
  {
    name: "Morgan Mini Mart",
    address: "6600 S Morgan St, Chicago, IL 60621",
    lat: 41.7740902,
    lng: -87.6498459,
    hours: "Hours not confirmed",
    notes: "Convenience Store",
  },
  {
    name: "Top of the Line Hair Studio",
    address: "18 S Kostner Ave, Chicago, IL 60624",
    lat: 41.8798545,
    lng: -87.7356506,
    hours: "Hours not confirmed",
    notes: "Hair Studio",
  },
  {
    name: "Exxon Mobil",
    address: "10 N Kilbourn Ave, Chicago, IL 60624",
    lat: 41.8809642,
    lng: -87.7381631,
    hours: "24/7",
    notes: "Gas Station",
  },
  {
    name: "Delta Tau Delta Fraternity House",
    address: "839 N 11th St, Milwaukee, WI 53233",
    lat: 43.0411328,
    lng: -87.926167,
    hours: "Hours not confirmed",
    notes: "Fraternity House (Marquette University)",
  },
  {
    name: "Phi Delta Theta Fraternity House",
    address: "200 25th Avenue S, Nashville, TN 37212",
    lat: 36.1458905,
    lng: -86.8069019,
    hours: "Hours not confirmed",
    notes: "Fraternity House (Vanderbilt University)",
  },
  {
    name: "Pi Kappa Alpha Fraternity House",
    address: "2402 Vanderbilt Pl, Nashville, TN 37212",
    lat: 36.1458037,
    lng: -86.8054409,
    hours: "Hours not confirmed",
    notes: "Fraternity House (Vanderbilt University)",
  },
];
