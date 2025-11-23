import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/SVA/',    // <<--- add this
  plugins: [react()],
})
