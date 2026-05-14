import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' 
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Album Panini Collector",
        short_name: "Panini",
        description: "Gestor de álbum Panini con búsqueda rápida y sincronización en Firebase.",
        theme_color: "#0f172a",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(firestore|firebaseapp|googleapis|gstatic)\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "firebase-runtime-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    })
  ]
})