import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";

function normalizeBase(raw: string | undefined): string {
  const b = (raw ?? "/").trim() || "/";
  if (b === "/") return "/";
  const withSlash = b.endsWith("/") ? b : `${b}/`;
  return withSlash;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = normalizeBase(env.VITE_BASE_PATH);
  const devApiProxy = env.VITE_DEV_API_PROXY || "http://localhost:8080";
  const pwaName = "1С: Корпоративная структура";
  const rootDir = process.cwd();
  const manualCertPath = path.resolve(rootDir, "cert.crt");
  const manualKeyPath = path.resolve(rootDir, "cert.key");
  const useManualHttpsCerts =
    mode === "development" &&
    fs.existsSync(manualCertPath) &&
    fs.existsSync(manualKeyPath);

  return {
    base,
    plugins: [
      react(),
      mode === "development" && !useManualHttpsCerts ? mkcert() : null,
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["pwa-192.png", "pwa-512.png", "vite.svg"],
        manifest: {
          name: pwaName,
          short_name: "1С Структура",
          description: "Каталог подразделений и заявки",
          start_url: base,
          scope: base,
          display: "standalone",
          background_color: "#f6f7f7",
          theme_color: "#c55f4d",
          orientation: "any",
          lang: "ru",
          icons: [
            { src: "pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,mp4,webm,wasm}"],
          maximumFileSizeToCacheInBytes: 35 * 1024 * 1024,
        },
        devOptions: {
          enabled: mode === "development",
        },
      }),
    ].filter(Boolean),
    server: {
      ...(useManualHttpsCerts
        ? {
            https: {
              cert: fs.readFileSync(manualCertPath),
              key: fs.readFileSync(manualKeyPath),
            },
          }
        : {}),
      proxy: {
        "/api": {
          target: devApiProxy,
          changeOrigin: true,
        },
      },
      watch: {
        usePolling: true,
      },
      host: true,
      strictPort: true,
      port: 3000,
    },
  };
});
