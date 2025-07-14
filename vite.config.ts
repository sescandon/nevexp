import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { PWAmanifest } from "./src/pwa/manifest";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src/pwa",
      filename: "sw.ts",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
        type: "module",
      },
      registerType: "autoUpdate",
      manifest: PWAmanifest,
    }),
  ],
  server: {
    port: 8081,
    open: true,
  },
});
