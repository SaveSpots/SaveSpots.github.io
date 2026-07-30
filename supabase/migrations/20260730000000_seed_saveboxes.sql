-- Seed the saveboxes table with the locations already published on the
-- website map (apps/web/components/sections/chicago-narcan-map.tsx), so the
-- mobile portal shows the same boxes. Idempotent: skips rows whose address
-- already exists.

with seed (name, address, city, lat, lng, hours) as (
  values
    ('Al-Tayyab Zabiha Halal Meat and Grocery', '2753 W Devon Ave, Chicago, IL 60659', 'Chicago', 41.99750978607458, -87.69927603410231, '11 AM - 8 PM Wed-Mon, 1:30 PM - 8 PM Tues — Front counter'),
    ('Casey''s Corner', '2733 W Devon Ave, Chicago, IL 60659', 'Chicago', 41.99753141291217, -87.69857193993684, '3 PM - 1 AM Tues-Sat (Closed Mon) — Left Counter (or ask bartender)'),
    ('3000 W 63rd St', '3000 W 63rd St, Chicago, IL', 'Chicago', 41.7785, -87.7, '24/7'),
    ('1741 S Ruble St', '1741 S Ruble St, Chicago, IL', 'Chicago', 41.852, -87.662, '24/7'),
    ('500 W 34th St', '500 W 34th St, Steger, IL', 'Steger', 41.47, -87.636, '24/7'),
    ('3400 Union Ave', '3400 Union Ave, Steger, IL', 'Steger', 41.472, -87.638, '24/7'),
    ('7348 South Stony Island', '7348 South Stony Island, Chicago, IL', 'Chicago', 41.761, -87.585, '24/7'),
    ('5458 S Wells St', '5458 S Wells St, Chicago, IL', 'Chicago', 41.792, -87.632, '24/7'),
    ('7859 S State St', '7859 S State St, Chicago, IL', 'Chicago', 41.751, -87.622, '24/7'),
    ('R&S Beverages', '308 E 75th St, Chicago, IL 60619', 'Chicago', 41.7585743, -87.6177796, 'Sun 11AM–11PM, Mon–Wed 9AM–11PM, Thu–Sat 9AM–12AM — Liquor Store'),
    ('Brick''s Nightclub', '4422 W Madison St, Chicago, IL 60624', 'Chicago', 41.8811101, -87.7364876, 'Sun–Fri 12PM–2AM, Sat 12PM–3AM — Nightclub'),
    ('Grove Market', '6656 S Cottage Grove Ave, Chicago, IL 60637', 'Chicago', 41.773325, -87.6061206, 'Hours not confirmed — Grocery Store'),
    ('7 Seas Food & Meat Mart', '6501 S Cottage Grove Ave, Chicago, IL 60637', 'Chicago', 41.776656, -87.605736, '8AM–10PM daily — Grocery Store'),
    ('JB One Restaurant', '6359 S Cottage Grove Ave, Chicago, IL 60637', 'Chicago', 41.7791749, -87.6057919, 'Hours not confirmed — Restaurant'),
    ('Morgan Mini Mart', '6600 S Morgan St, Chicago, IL 60621', 'Chicago', 41.7740902, -87.6498459, 'Hours not confirmed — Convenience Store'),
    ('Top of the Line Hair Studio', '18 S Kostner Ave, Chicago, IL 60624', 'Chicago', 41.8798545, -87.7356506, 'Hours not confirmed — Hair Studio'),
    ('Exxon Mobil', '10 N Kilbourn Ave, Chicago, IL 60624', 'Chicago', 41.8809642, -87.7381631, '24/7 — Gas Station'),
    ('Delta Tau Delta Fraternity House', '839 N 11th St, Milwaukee, WI 53233', 'Milwaukee', 43.0411328, -87.926167, 'Hours not confirmed — Fraternity House (Marquette University)'),
    ('Phi Delta Theta Fraternity House', '200 25th Avenue S, Nashville, TN 37212', 'Nashville', 36.1458905, -86.8069019, 'Hours not confirmed — Fraternity House (Vanderbilt University)'),
    ('Pi Kappa Alpha Fraternity House', '2402 Vanderbilt Pl, Nashville, TN 37212', 'Nashville', 36.1458037, -86.8054409, 'Hours not confirmed — Fraternity House (Vanderbilt University)')
)
insert into public.saveboxes (name, address, city, lat, lng, hours, status)
select s.name, s.address, s.city, s.lat, s.lng, s.hours, 'active'
from seed s
where not exists (
  select 1 from public.saveboxes b where b.address = s.address
);
