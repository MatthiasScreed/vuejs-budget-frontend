// vite.config.ts - CONFIGURATION FINALE POUR EXPOSE
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import vueDevtools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          hoistStatic: true,
          cacheHandlers: true
        }
      }
    }),
    vueDevtools(),
    tailwindcss()
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  css: {
    devSourcemap: true,
    transformer: 'postcss'
  },

  optimizeDeps: {
    include: [
      'axios',
      'vue',
      'vue-router',
      'pinia',
      'vue-toastification'
    ],
    force: true
  },

  esbuild: {
    target: 'esnext',
    keepNames: true
  },

  // ==========================================
  // ✅ CONFIGURATION SERVEUR SIMPLIFIÉE
  // ==========================================
  server: {
    port: 3000,
    host: '0.0.0.0',  // ✅ Écoute sur toutes les interfaces
    strictPort: true,

    // ✅ HMR désactivé pour éviter problèmes WebSocket avec Expose
    hmr: false,  // ✅ Plus simple pour Expose

    // ✅ CORS ouvert (dev seulement)
    cors: true,

    // ✅ Headers pour modules ES
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }

    // ❌ PAS DE PROXY - Utilise VITE_API_BASE_URL dans .env.local
  },

  build: {
    target: 'esnext',
    sourcemap: true,
    cssCodeSplit: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'ui-vendor': ['vue-toastification'],
          'api-vendor': ['axios'],
          'store-vendor': ['pinia']
        }
      }
    }
  },

  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: true,
    cors: true
  },

  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  }
})
