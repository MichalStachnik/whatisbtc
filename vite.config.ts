import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['three'],
  },
  // Bundle CJS-only packages into the SSR output so Node ESM can import them
  ...(isSsrBuild && {
    ssr: {
      noExternal: ['react-helmet-async', 'react-router-dom', 'react-dom'],
    },
  }),
  build: {
    // SSR build outputs to dist/server/
    ...(isSsrBuild && {
      outDir: 'dist/server',
      ssr: true,
    }),
    rollupOptions: {
      // Client build: split large chunks for better caching
      ...(!isSsrBuild && {
        output: {
          manualChunks: {
            three: ['three', '@react-three/fiber', '@react-three/drei'],
            vendor: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            zustand: ['zustand'],
          },
        },
      }),
    },
  },
}))
