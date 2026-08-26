import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { features } from './src/product-flags.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        cranford: resolve(import.meta.dirname, 'cranford-july-7-2026.html'),
        inCuffsTee: resolve(import.meta.dirname, 'products/bongholeo-in-cuffs-tee.html'),
        ...(features.inCuffsHoodie
          ? { inCuffsHoodie: resolve(import.meta.dirname, 'products/bongholeo-in-cuffs-hoodie.html') }
          : {}),
      },
    },
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    host: true,
  },
})
