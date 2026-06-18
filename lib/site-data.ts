/**
 * SaveSpots site content.
 *
 * This is the single source of truth for everything that is "content" rather
 * than "layout". Fill in real bios, headshots, links, and numbers here and the
 * sections update automatically.
 *
 * CONFIRM = Sameer to verify / correct (real people, real numbers).
 * TODO ASSET = drop a real image at the given path in /public.
 */

import type { IconType } from "react-icons";
import {
  FaInstagram,
  FaLinkedin,
  FaBuilding,
  FaMapMarkerAlt,
  FaBoxOpen,
} from "react-icons/fa";

/* ----------------------------------------------------------------------------
 * Mission
 * ------------------------------------------------------------------------- */

export const mission = {
  eyebrow: "Our mission",
  // One-line essence, used in the hero and meta.
  tagline: "Reversing overdose, one SaveBox at a time.",
  // Full statement, expanded from Sameer's brief.
  statement:
    "SaveSpots exists to prevent overdose deaths by making naloxone and fentanyl test strips part of everyday public space. We propose a supplementary harm reduction model that complements direct outreach to impacted communities, using data-driven placement to put life-saving supplies exactly where they are needed most.",
  // The "what makes us different" thesis.
  model:
    "Most harm reduction reaches people through direct outreach. We add a second layer: a community-centered network where local business owners host supplies in the places people already pass through every day. By pairing geographic, data-informed placement with the trust of neighborhood businesses, we widen access without replacing the outreach that already works.",
} as const;

/* ----------------------------------------------------------------------------
 * Impact stats (REAL numbers only)
 * ------------------------------------------------------------------------- */

export interface Stat {
  metric: string;
  label: string;
  icon: IconType;
}

export const stats: Stat[] = [
  { metric: "2025", label: "Founded", icon: FaBuilding },
  { metric: "21", label: "Active SaveSpots", icon: FaMapMarkerAlt },
  // CONFIRM + add as they become real:
  // { metric: "—", label: "SaveKits distributed", icon: FaBoxOpen },
  // { metric: "—", label: "Partner locations", icon: FaBuilding },
];

/* ----------------------------------------------------------------------------
 * What we make: SaveKit -> SaveBox -> SaveSpot
 * ------------------------------------------------------------------------- */

export interface ProcessLayer {
  id: string;
  name: string;
  short: string;
  description: string;
  image: string; // TODO ASSET
  imageAlt: string;
}

export const whatWeMake: ProcessLayer[] = [
  {
    id: "savekit",
    name: "The SaveKit",
    short: "Pocket-sized harm reduction",
    description:
      "A compact cardboard kit holding naloxone (Narcan) and fentanyl test strips. Small enough to keep in a purse, backpack, or car, so help is on hand the moment it is needed.",
    image: "/assets/gallery/savekit.jpg", // TODO ASSET: photo of an open SaveKit
    imageAlt: "An open SaveKit showing naloxone and fentanyl test strips",
  },
  {
    id: "savebox",
    name: "The SaveBox",
    short: "A stocked station for kits",
    description:
      "A countertop box that holds a supply of SaveKits. Hosted at a partner location, it lets anyone take what they need, no questions asked, and signals that this is a safe place to find help.",
    image: "/assets/gallery/savebox.jpg", // TODO ASSET: photo of a SaveBox on a counter
    imageAlt: "A SaveBox stocked with SaveKits on a counter",
  },
  {
    id: "savespot",
    name: "The SaveSpot",
    short: "A trusted location in the community",
    description:
      "A local business or community space that hosts a SaveBox. We choose SaveSpots using public overdose and access data, so every placement reaches the blocks that need it most.",
    image: "/assets/gallery/savespot.jpg", // TODO ASSET: storefront / location photo
    imageAlt: "A neighborhood business hosting a SaveSpot",
  },
];

/* ----------------------------------------------------------------------------
 * How it works (the operating model)
 * ------------------------------------------------------------------------- */

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export const howItWorks: ProcessStep[] = [
  {
    step: "01",
    title: "Pinpoint areas of need",
    description:
      "We use public governmental and reliable non-governmental data to identify the blocks where naloxone access can save the most lives.",
  },
  {
    step: "02",
    title: "Engage local hosts",
    description:
      "Our network of students and volunteers reaches out to businesses and community centers to host SaveBoxes in high-traffic, easy-to-reach spots.",
  },
  {
    step: "03",
    title: "Stock, support, and learn",
    description:
      "We keep each SaveSpot supplied, stay in touch with every host, and study what works to make the next placement smarter than the last.",
  },
];

/* ----------------------------------------------------------------------------
 * Team / Board
 * CONFIRM every name, spelling, and title with Sameer.
 * TODO ASSET: square headshots, ideally 800x800, in /public/assets/team/
 * ------------------------------------------------------------------------- */

export interface Person {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
}

export const team: Person[] = [
  {
    name: "Sameer Ilyas",
    role: "Founder",
    bio: "Add a short bio.", // CONFIRM: Sameer's bio
    image: "/assets/team/sameer.jpg", // TODO ASSET
    linkedin: "", // TODO
  },
  {
    name: "Zuhayr Gaffoor",
    role: "Co-Founder",
    bio: "Co-founder of SaveSpots and an incoming senior studying biomedical sciences.",
    image: "/assets/team/zuhayr.jpg", // TODO ASSET
    linkedin: "",
  },
  {
    name: "Hammad Ansari",
    role: "Co-Founder",
    bio: "Co-founder of SaveSpots and an incoming sophomore at the University of Illinois Chicago.",
    image: "/assets/team/hammad.jpg", // TODO ASSET (none yet)
    linkedin: "",
  },
  {
    name: "Ali Ilyas",
    role: "Director of Research",
    bio: "UT Dallas BS in Biology, 2023. An AEMT who leads the SaveSpots research department, studying harm reduction strategy across Dallas County.",
    image: "/assets/team/ali.jpg", // TODO ASSET
    linkedin: "",
  },
  {
    name: "Ishaan", // CONFIRM full name
    role: "Financial Operations Manager",
    bio: "Add a short bio.", // CONFIRM
    image: "/assets/team/ishaan.jpg", // TODO ASSET
    linkedin: "",
  },
];

/* ----------------------------------------------------------------------------
 * Research Department
 * Each researcher owns a city and studies harm reduction strategy there.
 * CONFIRM names + cities. TODO ASSET headshots in /public/assets/researchers/
 * These are placeholder slots; replace/add as the team grows.
 * ------------------------------------------------------------------------- */

export interface Researcher {
  name: string;
  city: string;
  bio: string;
  image: string;
  linkedin?: string;
}

export const researchers: Researcher[] = [
  {
    name: "Ali Ilyas",
    city: "Dallas County, TX",
    bio: "UT Dallas BS in Biology, 2023. An AEMT and Director of Research at SaveSpots, studying harm reduction strategy across Dallas County.",
    image: "/assets/researchers/ali-ilyas.jpg", // TODO ASSET
    linkedin: "",
  },
  {
    name: "Imaad Khan",
    city: "Baltimore, MD",
    bio: "Graduated Fall 2025 from the University of Illinois Chicago with a BS in Biochemistry. Studies harm reduction policy and strategy in Baltimore.",
    image: "/assets/researchers/imaad-khan.jpg", // TODO ASSET
    linkedin: "",
  },
  {
    name: "Faisal Anwar",
    city: "Philadelphia, PA",
    bio: "Georgia Tech BS in Neuroscience, 2024. A healthcare consultant at ZS Associates studying harm reduction policy in Philadelphia.",
    image: "/assets/researchers/faisal-anwar.jpg", // TODO ASSET
    linkedin: "",
  },
  {
    name: "Ibrahim Syed",
    city: "Houston, TX",
    bio: "Neuroscience student at UT Dallas and a volunteer with EPIC Medical Clinic. Studies harm reduction strategy in Houston.",
    image: "/assets/researchers/ibrahim-syed.jpg", // TODO ASSET
    linkedin: "",
  },
  {
    name: "Abdallah Sakallah",
    city: "New York City & Long Island, NY",
    bio: "Kinesiology freshman at the University of Florida and a volunteer with Young Muslims and the MSA. Studies harm reduction in New York City and Long Island.",
    image: "/assets/researchers/abdallah-sakallah.jpg", // TODO ASSET
    linkedin: "",
  },
  {
    name: "Tawfic A. Elghor",
    city: "St. Louis, MO",
    bio: "Benedictine University BS in Health Science, 2025. A dental assistant studying harm reduction strategy in St. Louis.",
    image: "/assets/researchers/tawfic-elghor.jpg", // TODO ASSET
    linkedin: "",
  },
  {
    name: "Maaz Suglatwala",
    city: "Chicago, IL",
    bio: "Neuroscience freshman at Lake Forest College and a Young Muslims volunteer. Studies harm reduction policy in his home city of Chicago.",
    image: "/assets/researchers/maaz-suglatwala.jpg", // TODO ASSET
    linkedin: "",
  },
  {
    name: "Rizwan Mansoor",
    city: "Dallas, TX", // CONFIRM research city (bio was cut off)
    bio: "BS in Public Health from Nova Southeastern, 2025, and a Qalam Seminary graduate in Classical Arabic. Works as a free-clinic MA studying harm reduction strategy.",
    image: "/assets/researchers/rizwan-mansoor.jpg", // TODO ASSET
    linkedin: "",
  },
];

/* ----------------------------------------------------------------------------
 * Partner institutions
 * CONFIRM relationship descriptions. Logos already in /public/assets/logos/
 * ------------------------------------------------------------------------- */

export interface Partner {
  name: string;
  logo: string;
  blurb: string; // how the partnership works
  url?: string;
}

export const partners: Partner[] = [
  {
    name: "Illinois Department of Public Health",
    logo: "/assets/logos/idph.png",
    blurb:
      "Add how IDPH supports SaveSpots (e.g. naloxone supply, guidance, data).", // CONFIRM
    url: "",
  },
  {
    name: "Narcan Direct",
    logo: "/assets/logos/narcandirectreallogo.png",
    blurb: "Add how Narcan Direct supports SaveSpots.", // CONFIRM
    url: "",
  },
  {
    name: "City of Chicago",
    logo: "/assets/logos/cityofchicagofr.png",
    blurb: "Add how the City of Chicago partnership works.", // CONFIRM
    url: "",
  },
  {
    name: "State of Illinois",
    logo: "/assets/logos/seal.png",
    blurb: "Add how this partnership works.", // CONFIRM
    url: "",
  },
];

/* ----------------------------------------------------------------------------
 * Gallery (process + placements)
 * TODO ASSET: real photos in /public/assets/gallery/
 * ------------------------------------------------------------------------- */

export interface GalleryItem {
  image: string;
  caption: string;
}

export const gallery: GalleryItem[] = [
  { image: "/assets/gallery/g1.jpg", caption: "Assembling SaveKits" }, // TODO ASSET
  { image: "/assets/gallery/g2.jpg", caption: "A stocked SaveBox" }, // TODO ASSET
  { image: "/assets/gallery/g3.jpg", caption: "Placing a SaveSpot" }, // TODO ASSET
  { image: "/assets/gallery/g4.jpg", caption: "On the ground in Chicago" }, // TODO ASSET
  { image: "/assets/gallery/g5.jpg", caption: "Community partners" }, // TODO ASSET
  { image: "/assets/gallery/g6.jpg", caption: "The team" }, // TODO ASSET
];

/* ----------------------------------------------------------------------------
 * Social
 * CONFIRM handles + URLs.
 * ------------------------------------------------------------------------- */

export interface SocialLink {
  name: string;
  handle: string;
  url: string;
  icon: IconType;
}

export const socials: SocialLink[] = [
  {
    name: "Instagram",
    handle: "@savespots", // CONFIRM
    url: "https://instagram.com/savespots", // CONFIRM
    icon: FaInstagram,
  },
  {
    name: "LinkedIn",
    handle: "SaveSpots", // CONFIRM
    url: "https://www.linkedin.com/company/savespots", // CONFIRM
    icon: FaLinkedin,
  },
];

/* ----------------------------------------------------------------------------
 * Calls to action (kept centralized so labels stay consistent everywhere)
 * ------------------------------------------------------------------------- */

export const cta = {
  volunteer: {
    label: "Join our research team",
    href: "https://savespots.fillout.com/volunteer",
  },
  host: {
    label: "Host a SaveBox",
    href: "https://savespots.fillout.com/savebox",
  },
} as const;
