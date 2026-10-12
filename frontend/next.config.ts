import path from "node:path";

import type {
  NextConfig,
} from "next";

const bootstrapScss = path.join(process.cwd(), "node_modules", "bootstrap", "scss");


const nextConfig: NextConfig = {
  reactStrictMode: true,

  poweredByHeader: false,

  // Let `npm run dev` work from both http://localhost and http://127.0.0.1.
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  output: "standalone",

  transpilePackages: [
    "three",
  ],

  images: {
    formats: [
      "image/avif",
      "image/webp",
    ],
  },

  // `npm run dev`: forward API calls to the Docker stack (nginx on :8090),
  // so local development works without exposing the backend port.
  // Production never reaches this — nginx routes /api before Next.js.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    const target = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8090";

    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },

  // Bootstrap is compiled from source with the Aurexis grid, breakpoints and
  // spacing. Its legacy Sass API is silenced so builds stay readable.
  sassOptions: {
    loadPaths: [bootstrapScss],
    includePaths: [bootstrapScss],
    quietDeps: true,
    silenceDeprecations: [
      "import",
      "global-builtin",
      "color-functions",
      "legacy-js-api",
      "if-function",
    ],
  },
};


export default nextConfig;
