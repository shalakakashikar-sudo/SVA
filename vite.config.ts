import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/SVA/',     // 👈 IMPORTANT for GitHub Pages
  plugins: [react()],
})
