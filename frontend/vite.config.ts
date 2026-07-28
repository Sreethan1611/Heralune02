import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Heralune AI Journal',
        short_name: 'Heralune',
        description: 'An emotionally intelligent AI journaling companion.',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        icons: [
          {
            src: 'https://api.dicebear.com/7.x/shapes/svg?seed=heralune',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'https://api.dicebear.com/7.x/shapes/svg?seed=heralune',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
