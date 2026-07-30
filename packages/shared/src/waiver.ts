/**
 * Official SaveSpots volunteer waiver — single source of truth for web and
 * mobile. Bump WAIVER_VERSION in schemas.ts whenever this wording changes so
 * acceptances stay tied to the exact text that was signed.
 */

export const WAIVER_TITLE =
  "Volunteer Waiver, Release of Liability, and Assumption of Risk Agreement";

export const WAIVER_INTRO = `This Volunteer Waiver, Release of Liability, and Assumption of Risk Agreement ("Agreement") is entered into between SaveSpots ("the Organization") and the undersigned volunteer ("Volunteer") in connection with the Volunteer's participation in Organization activities, including but not limited to community outreach, and the restocking, placement, and maintenance of naloxone (Narcan) and SaveSpots "SaveKits" at community locations ("the Activities").`;

export const WAIVER_SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Description of Activities",
    body: `As a Volunteer, I understand that the Activities may include, without limitation:

• Traveling to and from community sites, public locations, and partner organizations to restock or inspect naloxone and SaveKit supplies;
• Handling, transporting, and storing naloxone (Narcan), harm-reduction supplies, and related materials;
• Interacting with members of the public, including individuals who may be in vulnerable situations, under the influence of substances, or in medical distress;
• Entering public and semi-public spaces (e.g., businesses, community centers, transit areas, outdoor locations) that may present unpredictable conditions; and
• Potentially witnessing or responding to a suspected overdose or medical emergency.`,
  },
  {
    title: "2. Assumption of Risk",
    body: `I understand that participation in the Activities carries inherent risks, including but not limited to: physical injury, exposure to communicable illness, exposure to controlled substances or drug paraphernalia, verbal or physical altercations with members of the public, motor vehicle or traffic-related risks while traveling between sites, and risks associated with responding to or witnessing a drug overdose or other medical emergency. I voluntarily and knowingly assume all such risks, whether known or unknown, and understand that they may result in injury, illness, or death to myself or others.`,
  },
  {
    title: "3. Release and Waiver of Liability",
    body: `To the fullest extent permitted by law, I, on behalf of myself, my heirs, executors, administrators, and assigns, hereby release, waive, discharge, and covenant not to sue SaveSpots, its directors, officers, employees, agents, and other volunteers (collectively, the "Released Parties") from any and all liability, claims, demands, actions, or causes of action arising out of or related to any loss, damage, injury, or death that may be sustained by me, or any property belonging to me, while participating in the Activities, whether caused by the negligence of the Released Parties or otherwise, except in cases of gross negligence, willful misconduct, or intentional wrongdoing by the Organization.`,
  },
  {
    title: "4. Indemnification",
    body: `I agree to indemnify and hold harmless the Released Parties from any loss, liability, damage, or costs, including court costs and attorneys' fees, that they may incur due to my participation in the Activities, to the extent caused by my own acts or omissions.`,
  },
  {
    title: "5. Naloxone Administration and Good Samaritan Acknowledgment",
    body: `I understand that Illinois law (including the Illinois Drug Overdose Prevention Program Law and the Emergency Medical Services Access Law, commonly known as the "Good Samaritan Law") provides certain protections from civil and criminal liability for individuals who, in good faith, administer naloxone or seek emergency assistance for a suspected overdose. I understand that these legal protections generally do not extend to acts of gross negligence or willful and wanton misconduct, and that this waiver does not replace, and is in addition to, any protections afforded under applicable law. I agree to only administer naloxone in a manner consistent with the training provided by the Organization.`,
  },
  {
    title: "6. Medical Treatment Authorization",
    body: `In the event I am injured or become ill while participating in the Activities and am unable to communicate my wishes, I authorize the Organization's representatives to secure emergency medical treatment on my behalf. I understand that I am responsible for any costs associated with such treatment, and I release the Released Parties from liability for decisions made in good faith regarding emergency care.`,
  },
  {
    title: "7. Training and Compliance",
    body: `I agree to complete any training required by the Organization prior to participating in the Activities, including training on naloxone administration, harm-reduction best practices, and personal safety protocols, and to follow all Organization guidelines and applicable laws while volunteering.`,
  },
  {
    title: "8. Photo/Media Release (Optional)",
    body: `I grant the Organization permission to photograph or record me during the Activities and to use such images for the Organization's promotional, educational, or fundraising purposes. I understand I may decline this section without affecting my ability to volunteer, by selecting my choice below.`,
  },
  {
    title: "9. Emergency Contact",
    body: `The emergency contact provided during sign-up is incorporated into this Agreement. Keep it up to date in your account.`,
  },
  {
    title: "10. Governing Law",
    body: `This Agreement shall be governed by the laws of the State of Illinois. If any provision of this Agreement is found unenforceable, the remaining provisions shall remain in full force and effect.`,
  },
  {
    title: "11. Acknowledgment",
    body: `I have read this Agreement in its entirety, understand its terms, and understand that I am giving up substantial legal rights by signing it, including my right to sue the Released Parties. I sign this Agreement freely and voluntarily, without any inducement.

By typing my full legal name below and confirming, I am signing this Agreement electronically, and I intend my electronic signature to be legally binding to the same extent as a handwritten signature. Volunteers under 18 years of age must instead complete the paper form with a parent or guardian signature.`,
  },
];
