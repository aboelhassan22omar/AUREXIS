import type {
  Metadata,
  Viewport,
} from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import "@/styles/bootstrap.scss";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/components.css";
import "@/styles/sections.css";
import "@/styles/app.css";

import Assistant from "@/components/assistant/Assistant";
import Interactions from "@/components/layout/Interactions";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8090"
  ),
  title: {
    default: "AUREXIS — Powerful software, precisely engineered",
    template: "%s · AUREXIS",
  },
  description:
    "Aurexis designs and builds AI agents, intelligent platforms, automation and security systems for organizations that need technology to perform.",
  applicationName: "AUREXIS",
  keywords: [
    "AUREXIS",
    "AI Agents",
    "AI Chatbots",
    "SIS for Schools",
    "AI Security",
    "Smart Surveillance",
    "Artificial Intelligence",
    "Automation",
    "Software Development",
    "Systems Integration",
  ],
  category: "technology",
  creator: "AUREXIS",
  publisher: "AUREXIS",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/aurexis-mark.svg", type: "image/svg+xml" },
      { url: "/brand/aurexis-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/aurexis-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "AUREXIS",
    title: "AUREXIS — Powerful software, precisely engineered",
    description:
      "AI agents, intelligent platforms, automation and security systems engineered for real-world impact.",
    images: [
      {
        url: "/brand/aurexis-og.png",
        width: 1200,
        height: 630,
        alt: "AUREXIS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AUREXIS — Powerful software, precisely engineered",
    description:
      "AI agents, intelligent platforms, automation and security systems.",
    images: ["/brand/aurexis-og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#05070e",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AUREXIS",
  description:
    "Software and technology company building AI agents, intelligent platforms, automation and security systems.",
  logo: "/brand/aurexis-mark.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>

      <body suppressHydrationWarning>
        <div className="ax-ambient" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <a href="#main" className="ax-skip">
          Skip to content
        </a>
        {children}
        <Assistant />
        <Interactions />
      </body>
    </html>
  );
}
