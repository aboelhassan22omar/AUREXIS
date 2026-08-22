import type {
  Metadata,
  Viewport,
} from "next";

import "bootstrap/dist/css/bootstrap.min.css";
import "./theme.css";
import "./globals.css";
import "./responsive.css";

import GlobalRobotGuide from "@/components/robot-guide/GlobalRobotGuide";
import ThemeProvider from "@/components/theme/ThemeProvider";

const initialThemeScript = `
(function () {
  try {
    var saved = localStorage.getItem("aurexis-theme");
    var theme =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:8090'
  ),
  title: {
    default:
      "AUREXIS | Intelligence. Software. Solutions.",
    template:
      "%s | AUREXIS",
  },
  description:
    "Aurexis engineers AI agents, chatbots, intelligent software, AI security, smart surveillance and technology solutions built around real-world needs.",
  applicationName:
    "AUREXIS",
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
    "Technology Solutions",
  ],
  category:
    "technology",
  creator:
    "AUREXIS",
  publisher:
    "AUREXIS",
  manifest:
    "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/brand/aurexis-mark.svg",
        type: "image/svg+xml",
      },
      {
        url: "/brand/aurexis-icon-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/brand/aurexis-icon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/brand/aurexis-icon-48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/brand/aurexis-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName:
      "AUREXIS",
    title:
      "AUREXIS | Intelligence. Software. Solutions.",
    description:
      "AI agents, intelligent software, AI security, smart surveillance and technology solutions engineered for real-world impact.",
    images: [
      {
        url: "/brand/aurexis-og.png",
        width: 1200,
        height: 630,
        alt: "AUREXIS — Intelligence, Software, Solutions",
      },
    ],
  },
  twitter: {
    card:
      "summary_large_image",
    title:
      "AUREXIS | Intelligence. Software. Solutions.",
    description:
      "AI agents, intelligent software, AI security, smart surveillance and technology solutions.",
    images: [
      "/brand/aurexis-og.png",
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#f6f8fc",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#020617",
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AUREXIS",
  description:
    "Intelligence, software and technology solutions including AI agents, chatbots, AI security and smart surveillance.",
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
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              initialThemeScript,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              organizationSchema
            ),
          }}
        />
      </head>

      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <GlobalRobotGuide />
        </ThemeProvider>
      </body>
    </html>
  );
}
