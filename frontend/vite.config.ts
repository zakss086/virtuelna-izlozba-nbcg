import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  // `pnpm dev:api`: the app calls /api and Vite forwards it to the backend (`poetry run start` in backend/).
  server: { proxy: { '/api': 'http://localhost:8000' } },
})
