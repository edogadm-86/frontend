import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      injectManifest: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "eDog",
        short_name: "eDog",
        description: "Digital pet passport",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#005da7",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'leaflet'],
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
  },
  server: {
    host: true,        // same as 0.0.0.0
    port: 5174,
    strictPort: true,
  },
  base: "/",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
});
