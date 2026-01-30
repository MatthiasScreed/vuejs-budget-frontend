// vite.config.ts - VERSION FINALE (Expose Dev + Forge Production)
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import vueDevtools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement selon le mode
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  console.log(`🔧 Vite mode: ${mode}, isProd: ${isProd}`)

  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            hoistStatic: true,
            cacheHandlers: true,
          },
        },
      }),
      // DevTools uniquement en dev
      ...(!isProd ? [vueDevtools()] : []),
      tailwindcss(),
    ],

    // ✅ FIX PRODUCTION: Base URL pour les assets
    base: '/',

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    css: {
      devSourcemap: !isProd,
      transformer: 'postcss',
    },

    optimizeDeps: {
      include: ['axios', 'vue', 'vue-router', 'pinia', 'vue-toastification'],
      force: true,
    },

    esbuild: {
      target: 'esnext',
      keepNames: true,
    },

    // ==========================================
    // SERVEUR DE DÉVELOPPEMENT (pour Expose)
    // ==========================================
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      hmr: false, // Désactivé pour Expose
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },

    // ==========================================
    // ✅ BUILD PRODUCTION (pour Forge)
    // ==========================================
    build: {
      target: 'esnext',
      outDir: 'dist',

      // Sourcemaps uniquement en dev
      sourcemap: !isProd,

      // Organisation des assets
      assetsDir: 'assets',
      assetsInlineLimit: 4096,

      cssCodeSplit: false,
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          // ✅ Nommage explicite pour éviter les problèmes de cache
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || ''
            // Images (PNG, JPG, SVG, etc.)
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
              return 'assets/images/[name]-[hash][extname]'
            }
            // Fonts
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            // CSS
            if (/\.css$/i.test(name)) {
              return 'assets/css/[name]-[hash][extname]'
            }
            // Autres
            return 'assets/[name]-[hash][extname]'
          },
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
            'ui-vendor': ['vue-toastification'],
            'api-vendor': ['axios'],
            'store-vendor': ['pinia'],
          },
        },
      },
    },

    preview: {
      port: 4173,
      host: '0.0.0.0',
      strictPort: true,
      cors: true,
    },

    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
  }
})
