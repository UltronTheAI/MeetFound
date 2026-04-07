import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://meetfound.local"),
  applicationName: "MeetFound",
  title: {
    default: "MeetFound",
    template: "%s | MeetFound",
  },
  description:
    "MeetFound is a client-only Founder Memory CRM for saving people, notes, profile photos, business cards, and location details directly in your browser.",
  keywords: [
    "MeetFound",
    "Founder CRM",
    "memory CRM",
    "networking app",
    "contact manager",
    "business card organizer",
    "offline CRM",
    "founder networking",
  ],
  authors: [{ name: "MeetFound" }],
  creator: "MeetFound",
  publisher: "MeetFound",
  category: "productivity",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "MeetFound",
    description:
      "Remember the people you meet with a fast, browser-based Founder Memory CRM.",
    siteName: "MeetFound",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeetFound",
    description:
      "A client-only Founder Memory CRM for storing people, notes, profile photos, and business cards.",
  },
  appleWebApp: {
    capable: true,
    title: "MeetFound",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
