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
import i18n from './i18n'
import formattersPlugin from './plugins/formatters'

// ==========================================
// CRÉATION DE L'APPLICATION VUE
// ==========================================

const app = createApp(App)
const pinia = createPinia()

// ==========================================
// CONFIGURATION DES PLUGINS
// ==========================================

// Store Pinia (doit être avant les stores)
app.use(pinia)

// Initialiser les catégories par défaut
const categoryStore = useCategoryStore()
categoryStore.initializeDefaults()

// Router Vue
app.use(router)

// ✅ Internationalisation (FR/EN)
app.use(i18n)

// ✅ Toast notifications
app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 4000,
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
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true,
})

// ✅ Plugin formatters
app.use(formattersPlugin)

// ==========================================
// INITIALISATION ET MONTAGE
// ==========================================

async function bootstrapApp() {
  try {
    console.log('🚀 Démarrage CoinQuest...')

    // 1. Monter l'application Vue
    app.mount('#app')

    // 2. Test de connectivité API (dev only)
    if (import.meta.env.DEV) {
      await testApiConnectivity()
    }

    console.log('🎉 CoinQuest initialisé avec succès!')
  } catch (error: any) {
    console.error('💥 Erreur critique au démarrage:', error)
    showCriticalError(error)
  }
}

/**
 * Test de connectivité API (dev uniquement)
 */
async function testApiConnectivity() {
  console.log('🔍 Test de connectivité API...')

  try {
    const { api } = await import('@/services/api')
    const config = api.getEnvironmentConfig()

    console.log('🌐 Environnement détecté:', {
      mode: config.mode,
      apiUrl: config.apiBaseUrl,
      isSecure: config.isSecure,
      isTunneled: config.isTunneled,
    })

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

/**
 * Affiche une erreur critique en fallback
 */
function showCriticalError(error: any) {
  // Utilise i18n si disponible, sinon fallback FR
  const t = i18n.global.t

  const errorDetails = import.meta.env.DEV
    ? `<pre style="text-align:left;background:#f5f5f5;
        padding:15px;border-radius:6px;margin-top:20px;
        font-size:12px;overflow:auto;">
        ${error.stack || error.message}</pre>`
    : ''

  document.body.innerHTML = `
    <div style="display:flex;justify-content:center;
      align-items:center;min-height:100vh;
      font-family:'Inter',-apple-system,sans-serif;
      background:linear-gradient(135deg,#667eea,#764ba2);
      padding:20px;">
      <div style="text-align:center;background:white;
        padding:40px;border-radius:16px;
        box-shadow:0 20px 60px rgba(0,0,0,0.3);
        max-width:500px;width:100%;">
        <div style="width:80px;height:80px;
          background:linear-gradient(135deg,#f093fb,#f5576c);
          border-radius:50%;display:flex;
          align-items:center;justify-content:center;
          margin:0 auto 20px;font-size:40px;">😕</div>
        <h1 style="color:#1f2937;margin-bottom:15px;
          font-size:24px;font-weight:700;">
          ${t('errors.loadingError')}
        </h1>
        <p style="color:#5b6270;margin-bottom:30px;
          font-size:16px;line-height:1.6;">
          ${t('errors.loadingErrorDesc')}
        </p>
        ${errorDetails}
        <button onclick="window.location.reload()"
          style="padding:14px 32px;
            background:linear-gradient(135deg,#667eea,#764ba2);
            color:white;border:none;border-radius:8px;
            cursor:pointer;font-size:16px;font-weight:600;
            box-shadow:0 4px 12px rgba(102,126,234,0.4);">
          🔄 ${t('errors.reload')}
        </button>
        <p style="margin-top:20px;color:#8c939f;
          font-size:14px;">
          ${t('errors.persistContact')} —
          <a href="mailto:support@coinquest.com"
            style="color:#667eea;text-decoration:none;
            font-weight:600;">support</a>
        </p>
      </div>
    </div>`
}

// ==========================================
// GESTION D'ERREURS GLOBALES
// ==========================================

app.config.errorHandler = (err, instance, info) => {
  console.error('🔴 Erreur Vue non gérée:', err)
  console.error('Composant:', instance)
  console.error('Info:', info)

  if (import.meta.env.PROD) {
    // TODO: Sentry ou service de monitoring
  }
}

if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, _instance, trace) => {
    console.warn('⚠️ Warning Vue:', msg)
    console.warn('Trace:', trace)
  }
}

// ==========================================
// DÉMARRAGE
// ==========================================

bootstrapApp()

if (import.meta.env.DEV) {
  // @ts-ignore
  window.__app__ = app
  console.log('🔧 Debug: window.__app__ disponible')
}
