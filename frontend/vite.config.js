import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',          // output moderno — sem polyfills desnecessários
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('recharts'))        return 'vendor-charts'
          if (id.includes('framer-motion'))   return 'vendor-motion'
          if (id.includes('react-router'))    return 'vendor-router'
          if (id.includes('@tanstack'))       return 'vendor-query'
          if (id.includes('react-dom'))       return 'vendor-react'
          if (id.includes('lucide-react'))    return 'vendor-icons'
          return 'vendor'
        },
      },
    },
  },
})
