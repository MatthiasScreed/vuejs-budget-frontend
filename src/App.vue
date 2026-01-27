<template>
  <div id="app" class="min-h-screen">
    <!-- 🔄 ÉCRAN DE CHARGEMENT INITIAL -->
    <div
      v-if="!appInitialized"
      class="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center z-50"
    >
      <div class="text-center">
        <!-- Logo animé -->
        <div class="mb-8 relative">
          <!-- Icône CoinQuest avec animation pulse -->
          <div class="w-32 h-32 mx-auto animate-pulse">
            <img
              src="./assets/images/icon/icon.svg"
              alt="CoinQuest"
              class="w-full h-full drop-shadow-2xl"
            />
          </div>
          <!-- Cercle de progression -->
          <div class="absolute inset-0 flex items-center justify-center">
            <svg class="w-40 h-40 animate-spin-slow" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                stroke-width="3"
                stroke-dasharray="283"
                stroke-dashoffset="70"
                stroke-linecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color: #a855f7" />
                  <stop offset="100%" style="stop-color: #ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-white mb-3">
          {{ initializationError ? '😕 Oups...' : '🎮 Chargement de CoinQuest' }}
        </h2>

        <p class="text-gray-400 mb-6">
          {{ loadingMessage }}
        </p>

        <!-- Barre de progression -->
        <div
          v-if="!initializationError"
          class="w-64 mx-auto bg-gray-700 rounded-full h-2 overflow-hidden"
        >
          <div
            class="bg-gaming-gradient h-full transition-all duration-500"
            :style="{ width: `${initProgress}%` }"
          ></div>
        </div>

        <!-- Erreur avec retry -->
        <div v-if="initializationError" class="mt-6 space-y-4">
          <div class="bg-red-900/30 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto">
            <p class="text-red-200 text-sm">{{ initializationError }}</p>
          </div>
          <button
            @click="retryInitialization"
            class="gaming-button px-6 py-3 mx-auto flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 📡 INDICATEUR OFFLINE -->
    <Transition name="slide-down">
      <div
        v-if="appInitialized && !isOnline"
        class="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-3 text-center text-sm font-medium"
      >
        <span class="inline-flex items-center">
          <svg
            class="w-5 h-5 mr-2 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          📡 Pas de connexion Internet - Reconnexion automatique en cours...
        </span>
      </div>
    </Transition>

    <!-- 🌐 STATUS BAR API (pour développement) -->
    <Transition name="slide-down">
      <div
        v-if="showApiStatus && appInitialized"
        class="fixed top-0 left-0 right-0 z-40 px-4 py-3 text-sm text-center transition-all duration-300"
        :class="apiStatusClasses"
      >
        <span class="inline-flex items-center justify-center flex-wrap">
          <span
            class="w-2 h-2 rounded-full mr-2 flex-shrink-0"
            :class="{
              'bg-green-500': apiHealth.healthColor.value === 'green',
              'bg-red-500': apiHealth.healthColor.value === 'red',
              'bg-yellow-500 animate-pulse': apiHealth.healthColor.value === 'yellow',
            }"
          ></span>
          <span>{{ apiHealth.statusText }}</span>
          <span v-if="apiHealth.health.value.latency" class="ml-2 text-xs opacity-75">
            ({{ apiHealth.health.value.latency }}ms)
          </span>

          <!-- Bouton retry si déconnecté -->
          <button
            v-if="!apiHealth.isConnected.value"
            @click="retryApiConnection"
            :disabled="isRetrying"
            class="ml-3 px-3 py-1 text-xs bg-white/20 rounded hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isRetrying ? '🔄 Connexion...' : '🔌 Réessayer' }}
          </button>

          <!-- Toggle visibility en dev -->
          <button
            v-if="isDevelopment"
            @click="temporaryHideStatus = !temporaryHideStatus"
            class="ml-3 px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 transition-colors"
            :title="temporaryHideStatus ? 'Afficher le status' : 'Masquer le status'"
          >
            {{ temporaryHideStatus ? '👁️' : '🙈' }}
          </button>
        </span>
      </div>
    </Transition>

    <!-- 🎯 CONTENU PRINCIPAL -->
    <Transition name="fade" mode="out-in">
      <router-view v-if="appInitialized" />
    </Transition>

    <!-- 🍞 Toast Container (à configurer avec vue-toastification) -->
    <div id="toast-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useApiHealth, useStoreInitializer } from '@/composables/core/useApiHealth'
import { useErrorHandler } from '@/composables/core/useErrorHandler'

// ==========================================
// COMPOSABLES
// ==========================================

const router = useRouter()
const authStore = useAuthStore()
const apiHealth = useApiHealth()
const storeInitializer = useStoreInitializer()
const errorHandler = useErrorHandler()

// ==========================================
// STATE
// ==========================================

const appInitialized = ref(false)
const initializationError = ref<string | null>(null)
const temporaryHideStatus = ref(false)
const isRetrying = ref(false)
const initProgress = ref(0)
const loadingMessage = ref('Préparation de ton aventure...')
const isOnline = ref(navigator.onLine)

// ==========================================
// COMPUTED
// ==========================================

const isDevelopment = computed(() => import.meta.env.DEV)

const showApiStatus = computed(
  () =>
    !temporaryHideStatus.value &&
    (!apiHealth.isConnected.value || isDevelopment.value) &&
    isOnline.value, // Ne pas afficher si offline
)

const apiStatusClasses = computed(() => {
  const base = 'font-medium flex items-center justify-center'
  switch (apiHealth.health.value.status) {
    case 'connected':
      return `${base} bg-green-100 text-green-800 border-b border-green-200`
    case 'disconnected':
      return `${base} bg-red-100 text-red-800 border-b border-red-200`
    case 'checking':
      return `${base} bg-yellow-100 text-yellow-800 border-b border-yellow-200`
    default:
      return `${base} bg-gray-100 text-gray-800 border-b border-gray-200`
  }
})

// ==========================================
// PROVIDE pour composants enfants
// ==========================================

provide('showApiStatus', showApiStatus)
provide('isOnline', isOnline)

// ==========================================
// MÉTHODES
// ==========================================

/**
 * Simuler progression du chargement
 */
function simulateProgress(): void {
  const messages = [
    "Vérification de l'API...",
    'Chargement de ton profil...',
    'Synchronisation des données...',
    'Initialisation du système gaming...',
    'Presque prêt...',
  ]

  let step = 0
  const interval = setInterval(() => {
    if (step < messages.length && !appInitialized.value) {
      loadingMessage.value = messages[step]
      initProgress.value = Math.min(((step + 1) / messages.length) * 90, 90)
      step++
    } else {
      clearInterval(interval)
    }
  }, 600)
}

/**
 * Initialisation sécurisée de l'application
 */
async function initializeApp(): Promise<void> {
  try {
    console.log("🚀 Initialisation de l'application...")
    initializationError.value = null
    initProgress.value = 10

    // Démarrer la simulation de progression
    simulateProgress()

    // 1. Vérifier la connexion Internet
    if (!isOnline.value) {
      console.warn('⚠️ Pas de connexion Internet détectée')
      loadingMessage.value = 'Pas de connexion Internet...'
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // Continuer quand même en mode offline
    }

    initProgress.value = 25

    // 2. Vérifier la santé de l'API
    const isApiHealthy = await apiHealth.checkHealth()

    if (!isApiHealthy && isOnline.value) {
      console.warn('⚠️ API non disponible, mode déconnecté activé')
      loadingMessage.value = 'API temporairement indisponible...'
    }

    initProgress.value = 40

    // 3. Démarrer la surveillance de l'API
    apiHealth.startHealthMonitoring(30000)

    initProgress.value = 55

    // 4. Initialiser l'authentification
    loadingMessage.value = 'Chargement de ton profil...'
    await authStore.initAuth()

    initProgress.value = 70

    // 5. Si authentifié, charger les stores gaming
    if (authStore.isAuthenticated) {
      console.log('👤 Utilisateur authentifié, chargement des données gaming...')
      loadingMessage.value = 'Synchronisation des données gaming...'

      await storeInitializer.initializeGamingStores()

      const hasErrors = Object.keys(storeInitializer.initializationErrors.value).length > 0

      if (hasErrors) {
        console.warn(
          "⚠️ Erreurs lors de l'initialisation des stores:",
          storeInitializer.initializationErrors.value,
        )
      }
    }

    initProgress.value = 95

    loadingMessage.value = 'Finalisation...'
    await new Promise((resolve) => setTimeout(resolve, 300))

    initProgress.value = 100
    appInitialized.value = true

    console.log('✅ Application initialisée avec succès')
  } catch (error: any) {
    console.error("❌ Erreur lors de l'initialisation:", error)

    // Messages d'erreur user-friendly
    if (!isOnline.value) {
      initializationError.value = '📡 Pas de connexion Internet. Vérifie ta connexion et réessaye.'
    } else if (!apiHealth.isConnected.value) {
      initializationError.value =
        '🔌 Impossible de se connecter au serveur. Le service est peut-être temporairement indisponible.'
    } else {
      initializationError.value =
        error.message || '😕 Une erreur inattendue est survenue. Réessaye dans quelques instants.'
    }

    await errorHandler.handleSystemError(error, 'app_initialization')
  }
}

/**
 * Réessayer l'initialisation
 */
async function retryInitialization(): Promise<void> {
  initProgress.value = 0
  loadingMessage.value = 'Nouvelle tentative...'
  await initializeApp()
}

/**
 * Réessayer la connexion API
 */
async function retryApiConnection(): Promise<void> {
  if (isRetrying.value) return

  isRetrying.value = true
  loadingMessage.value = "Reconnexion à l'API..."

  try {
    const isHealthy = await apiHealth.checkHealth()

    if (isHealthy && authStore.isAuthenticated) {
      await storeInitializer.initializeGamingStores()
    }
  } finally {
    isRetrying.value = false
  }
}

/**
 * Gérer les changements d'état online/offline
 */
function updateOnlineStatus(): void {
  isOnline.value = navigator.onLine

  if (isOnline.value) {
    console.log('🌐 Connexion Internet restaurée')
    // Réessayer de se connecter à l'API
    if (appInitialized.value) {
      retryApiConnection()
    }
  } else {
    console.log('📡 Connexion Internet perdue')
  }
}

/**
 * Gestion des changements d'authentification
 */
watch(
  () => authStore.isAuthenticated,
  async (isAuth) => {
    if (isAuth && appInitialized.value) {
      console.log('👤 Utilisateur connecté, rechargement des données...')
      await storeInitializer.initializeGamingStores()
    }
  },
  { immediate: false },
)

/**
 * Gestion de la reconnexion API
 */
watch(
  () => apiHealth.isConnected.value,
  async (isConnected) => {
    if (isConnected && authStore.isAuthenticated && appInitialized.value) {
      console.log('🔌 API reconnectée, synchronisation des données...')
      await storeInitializer.initializeGamingStores()
    }
  },
)

/**
 * Debug keyboard shortcuts
 */
const handleKeyboard = (event: KeyboardEvent): void => {
  if (isDevelopment.value) {
    // Ctrl/Cmd + Shift + A pour toggle API status
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
      event.preventDefault()
      temporaryHideStatus.value = !temporaryHideStatus.value
      console.log('🔧 API Status visibility:', !temporaryHideStatus.value)
    }

    // Ctrl/Cmd + Shift + R pour forcer reload des stores
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
      event.preventDefault()
      console.log('🔄 Force reload stores...')
      storeInitializer.initializeGamingStores()
    }
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Event listeners pour online/offline
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  // Event listeners pour debug
  if (isDevelopment.value) {
    document.addEventListener('keydown', handleKeyboard)
  }

  // Initialiser l'app
  await initializeApp()
})

onUnmounted(() => {
  apiHealth.cleanup()
  errorHandler.clearAllErrors?.()

  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)

  if (isDevelopment.value) {
    document.removeEventListener('keydown', handleKeyboard)
  }
})

// ==========================================
// ERROR HANDLERS GLOBAUX
// ==========================================

window.addEventListener('error', (event) => {
  console.error('Erreur JavaScript globale:', event.error)
  errorHandler.handleSystemError(event.error, 'global_js_error')
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejetée non gérée:', event.reason)
  errorHandler.handleSystemError(event.reason, 'unhandled_promise_rejection')
})

// ==========================================
// DEBUG INFO
// ==========================================

if (isDevelopment.value) {
  console.log('🔧 App.vue Debug Info:')
  console.log('• Raccourcis:')
  console.log('  - Ctrl+Shift+A : Toggle API status')
  console.log('  - Ctrl+Shift+R : Force reload stores')
  console.log('• Status API visible:', showApiStatus.value)
  console.log('• API connectée:', apiHealth.isConnected.value)
  console.log('• En ligne:', isOnline.value)
}
</script>

<style scoped>
/* ==========================================
   ANIMATIONS
   ========================================== */

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Spin lent pour le cercle de progression */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

/* ==========================================
   GLOBAL STYLES
   ========================================== */

#app {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background-color: #f9fafb;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Focus styles pour l'accessibilité */
*:focus-visible {
  outline: 2px solid #a855f7;
  outline-offset: 2px;
}
</style>
