import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaveSpots",
  description: "Reversing Overdose — One SaveBox at a Time",
  keywords: [],
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
  },
  openGraph: {
    title: "SaveSpots",
    description: "Reversing Overdose — One SaveBox at a Time",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
