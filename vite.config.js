import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Check if building for static distribution
const isStaticBuild = process.env.STATIC_BUILD === 'true'

export default defineConfig({
  plugins: [react()],
  // Use relative paths for static build, default for dev/regular build
  base: isStaticBuild ? './' : '/',
  build: {
    // Output to different directory for static builds
    outDir: isStaticBuild ? 'dist-static' : 'dist',
  },
  server: {
    port: 3000,
    open: true
  }
})
