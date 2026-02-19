import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
    },
  },
  optimizeDeps: {
    include: [
      '@solana/web3.js',
      '@solana/spl-token',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-phantom',
      '@solana/wallet-adapter-solflare',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          solana: ['@solana/web3.js', '@solana/spl-token'],
          wallet: ['@solana/wallet-adapter-react', '@solana/wallet-adapter-phantom', '@solana/wallet-adapter-solflare'],
        },
      },
    },
  },
})
