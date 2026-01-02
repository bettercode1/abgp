import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    // Help with Windows/OneDrive file locking issues
    watch: {
      usePolling: false,
    },
  },
  // Reduce cache issues on Windows
  cacheDir: 'node_modules/.vite',
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
})

