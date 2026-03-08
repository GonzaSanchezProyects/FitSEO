import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Actualiza la app automáticamente cuando hay una nueva versión
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'], // Archivos estáticos extra
      manifest: {
        name: 'GenFit App',
        short_name: 'GenFit',
        description: 'Tu aplicación para seguimiento de gimnasio, rutinas y dietas.',
        theme_color: '#2563EB', // El color principal (Accent primario que usamos)
        background_color: '#e2e8f0', // El color de fondo de nuestra app
        display: 'standalone', // Hace que se vea como una app nativa (sin barra del navegador)
        orientation: 'portrait', // Fija la app en modo vertical
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Importante para Android
          }
        ]
      }
    })
  ]
})