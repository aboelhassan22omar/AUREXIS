import type {
  Metadata,
  Viewport,
} from "next";

import "./globals.css";


export const metadata: Metadata = {
  title: {
    default:
      "AXION | Intelligent Solutions. Real Impact.",

    template:
      "%s | AXION",
  },

  description:
    "AXION engineers artificial intelligence, cybersecurity, automation and custom software solutions for modern businesses.",

  applicationName:
    "AXION",

  keywords: [
    "AXION",
    "Artificial Intelligence",
    "AI Solutions",
    "AI Development",
    "AI Chatbots",
    "Cybersecurity",
    "Automation",
    "Business Automation",
    "Software Development",
    "Custom Software",
    "AI Integration",
  ],

  category:
    "technology",

  creator:
    "AXION",

  publisher:
    "AXION",

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
      "AXION",

    title:
      "AXION | Intelligent Solutions. Real Impact.",

    description:
      "Artificial intelligence, cybersecurity, automation and custom software engineered around real business problems.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "AXION | Intelligent Solutions. Real Impact.",

    description:
      "Artificial intelligence, cybersecurity, automation and custom software engineered around real business problems.",
  },
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,

  colorScheme: "dark",

  themeColor: "#050507",
};


export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body suppressHydrationWarning>
        {children}
      </body>

    </html>
  );
}