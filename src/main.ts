// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useCategoryStore } from '@/stores/categoryStore'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './assets/toast-custom.css'

import '@/assets/main.css'

import App from './App.vue'
import router from './router'

// Plugin formatters
import formattersPlugin from './plugins/formatters'

// ==========================================
// CRÉATION DE L'APPLICATION VUE
// ==========================================

const app = createApp(App)
const pinia = createPinia()

// ==========================================
// CONFIGURATION DES PLUGINS
// ==========================================

// Store Pinia
app.use(pinia)

// Initialiser les catégories par défaut
const categoryStore = useCategoryStore()
categoryStore.initializeDefaults()

// Router Vue
app.use(router)

// ✅ Toast notifications - Configuration optimisée
app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 4000, // ✅ 4s au lieu de 5s (plus réactif)
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce', // ✅ Animation bounce
  maxToasts: 5, // ✅ Maximum 5 toasts visibles
  newestOnTop: true, // ✅ Les nouveaux en haut
})

// ✅ PLUGIN FORMATTERS
app.use(formattersPlugin)

// ==========================================
// INITIALISATION ET MONTAGE
// ==========================================

/**
 * Bootstrap complet de l'application
 */
async function bootstrapApp() {
  try {
    console.log('🚀 Démarrage CoinQuest...')

    // 1. Monter l'application Vue
    app.mount('#app')

    // 2. Test de connectivité API (optionnel en dev)
    if (import.meta.env.DEV) {
      console.log('🔍 Test de connectivité API en cours...')

      try {
        // Import dynamique pour éviter les dépendances circulaires
        const { api } = await import('@/services/api')

        // Afficher la config détectée
        const config = api.getEnvironmentConfig()
        console.log('🌍 Environnement détecté:', {
          mode: config.mode,
          apiUrl: config.apiBaseUrl,
          isSecure: config.isSecure,
          isTunneled: config.isTunneled,
        })

        // Tester la connexion
        const { useAuthStore } = await import('@/stores/authStore')
        const authStore = useAuthStore()
        const result = await authStore.testConnection()

        if (result.success) {
          console.log('✅ API accessible')
        } else {
          console.warn('⚠️ API inaccessible:', result.message)
        }
      } catch (error: any) {
        console.warn('⚠️ Test API échoué (normal si serveur éteint):', error.message)
      }
    }

    console.log('🎉 CoinQuest initialisé avec succès!')
  } catch (error: any) {
    console.error('💥 Erreur critique au démarrage:', error)

    // ✅ Fallback d'urgence amélioré avec plus d'infos
    const errorDetails = import.meta.env.DEV
      ? `<pre style="text-align: left; background: #f5f5f5; padding: 15px; border-radius: 6px; margin-top: 20px; font-size: 12px; overflow: auto;">${error.stack || error.message}</pre>`
      : ''

    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
        <div style="text-align: center; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 500px; width: 100%;">
          <!-- Logo/Icon -->
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px;">
            😕
          </div>

          <h1 style="color: #1f2937; margin-bottom: 15px; font-size: 24px; font-weight: 700;">Erreur de chargement</h1>

          <p style="color: #5b6270; margin-bottom: 30px; font-size: 16px; line-height: 1.6;">
            Une erreur est survenue lors du chargement de CoinQuest. Cela peut être temporaire.
          </p>

          ${errorDetails}

          <button
            onclick="window.location.reload()"
            style="
              padding: 14px 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              font-weight: 600;
              transition: transform 0.2s, box-shadow 0.2s;
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.5)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'"
          >
            🔄 Recharger la page
          </button>

          <p style="margin-top: 20px; color: #8c939f; font-size: 14px;">
            Si le problème persiste,
            <a href="mailto:support@coinquest.com" style="color: #667eea; text-decoration: none; font-weight: 600;">
              contacte le support
            </a>
          </p>
        </div>
      </div>
    `
  }
}

// ==========================================
// GESTION D'ERREURS GLOBALES
// ==========================================

// Capturer les erreurs Vue non gérées
app.config.errorHandler = (err, instance, info) => {
  console.error('🔴 Erreur Vue non gérée:', err)
  console.error('Composant:', instance)
  console.error('Info:', info)

  // En production, tu pourrais envoyer à un service de tracking (Sentry, etc.)
  if (import.meta.env.PROD) {
    // TODO: Envoyer à ton service de monitoring
  }
}

// Capturer les warnings Vue (dev uniquement)
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('⚠️ Warning Vue:', msg)
    console.warn('Trace:', trace)
  }
}

// ==========================================
// DÉMARRAGE
// ==========================================

// Démarrer l'application
bootstrapApp()

// ✅ Exposer pour debug en dev
if (import.meta.env.DEV) {
  // @ts-ignore - Pour debug dans la console
  window.__app__ = app
  console.log('🔧 Debug: window.__app__ disponible')
}
