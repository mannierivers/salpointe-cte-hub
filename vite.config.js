import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Salpointe CTE Hub',
        short_name: 'CTE Hub',
        description: 'Request equipment and services from Salpointe CTE.',
        theme_color: '#0f172a', // Updated to match your new dark theme
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: "/",
  build: {
    chunkSizeWarningLimit: 1600, // Increases the warning threshold to 1.6MB
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Splits giant libraries into their own files to keep the main app fast
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            return 'vendor'; // All other libraries
          }
        }
      }
    }
  }
})