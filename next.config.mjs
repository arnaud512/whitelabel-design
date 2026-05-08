import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // Dev-only: inject `data-source` attributes on workspace JSX so the
    // inspector can recover source info in any browser. Loader runs before
    // SWC, doesn't disable it (so next/font and friends keep working).
    if (dev) {
      config.module.rules.unshift({
        test: /\.(tsx|jsx)$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: [
          {
            loader: path.resolve(__dirname, "loader-data-source.js"),
          },
        ],
      });
    }
    return config;
  },
};

export default nextConfig;
