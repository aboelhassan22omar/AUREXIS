import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AUREXIS",
    short_name: "AUREXIS",
    description:
      "Aurexis engineers intelligent software, AI automation, security and technology solutions.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/brand/aurexis-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/aurexis-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/brand/aurexis-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
