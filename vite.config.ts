import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // El túnel espera 5173: si Vite salta a otro puerto, deja de resolver.
    strictPort: true,
    // Hosts desde los que se sirve el dev server a través de cloudflared.
    allowedHosts: ['dev-project-front.bakano.ec', '.trycloudflare.com'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/index.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
  },
})
