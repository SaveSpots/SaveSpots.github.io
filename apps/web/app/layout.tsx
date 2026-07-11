import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SaveSpots",
  description:
    "SaveSpots is a nonprofit preventing overdose deaths by placing naloxone and fentanyl test strips in everyday community locations. A data-driven, community-centered harm reduction model that complements direct outreach.",
  keywords: [
    "SaveSpots",
    "opioid overdose prevention",
    "Narcan distribution",
    "opioid crisis Chicago",
    "overdose reversal",
    "SaveBox locations",
    "Narcan SaveBox",
    "harm reduction",
    "community health",
    "opioid safety",
    "life-saving medication",
    "Narcan access",
    "nonprofit overdose prevention",
    "Chicago harm reduction",
    "opioid overdose response",
    "volunteer opioid prevention",
    "opioid crisis nonprofit",
    "public health Chicago",
    "opioid awareness",
    "SaveSpots nonprofit",
    "opioid epidemic solution",
  ],

  authors: [{ name: "SaveSpots", url: "https://savespots.org" }],
  robots: "index, follow",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    title: "SaveSpots",
  },
  openGraph: {
    title: "SaveSpots - Reversing Overdose, One SaveBox at a Time",
    description:
      "SaveSpots is a Chicago-based nonprofit working to end opioid overdoses by placing Narcan SaveBoxes in high-risk community locations.",
    url: "https://savespots.org",
    siteName: "SaveSpots",
    images: [
      {
        url: "https://savespots.org/assets/SaveSpotsLogo.png",
        width: 1000,
        height: 1000,
        alt: "SaveSpots Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaveSpots - Reversing Overdose, One SaveBox at a Time",
    description:
      "SaveSpots works to end the opioid overdose crisis in Chicago by distributing life-saving Narcan through community SaveBoxes.",
    images: ["https://savespots.org/assets/SaveSpotsLogo.png"],
  },
  alternates: {
    canonical: "https://savespots.org",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
