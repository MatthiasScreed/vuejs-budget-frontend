<template>
  <div id="app" class="min-h-screen">
    <!-- ÉCRAN DE CHARGEMENT INITIAL -->
    <div
      v-if="!appInitialized"
      class="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div class="mb-8 relative">
          <div class="w-32 h-32 mx-auto animate-pulse">
            <img :src="iconUrl" alt="CoinQuest" class="w-full h-full drop-shadow-2xl" />
          </div>
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

        <p class="text-gray-400 mb-6">{{ loadingMessage }}</p>

        <div
          v-if="!initializationError"
          class="w-64 mx-auto bg-gray-700 rounded-full h-2 overflow-hidden"
        >
          <div
            class="bg-gaming-gradient h-full transition-all duration-500"
            :style="{ width: `${initProgress}%` }"
          />
        </div>

        <div v-if="initializationError" class="mt-6 space-y-4">
          <div class="bg-red-900/30 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto">
            <p class="text-red-200 text-sm">{{ initializationError }}</p>
          </div>
          <button
            @click="retryInitialization"
            class="gaming-button px-6 py-3 mx-auto flex items-center space-x-2"
          >
            <span>🔄 Réessayer</span>
          </button>
        </div>
      </div>
    </div>

    <!-- CONTENU PRINCIPAL -->
    <router-view v-if="appInitialized" v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { initializeApiCallbacks } from '@/services/api'
import iconSvg from '@/assets/images/icon/icon.svg'

// ==========================================
// STORES & COMPOSABLES
// ==========================================

const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()
const { locale } = useI18n()

const iconUrl = computed(() => iconSvg)

// ==========================================
// STATE
// ==========================================

const appInitialized = ref(false)
const initializationError = ref<string | null>(null)
const initProgress = ref(0)
const loadingMessage = ref('Préparation de ton aventure...')

// ==========================================
// INITIALISATION API CALLBACKS
// FIX: évite window.location.href sur erreur 401
// ==========================================

function setupApiCallbacks(): void {
  initializeApiCallbacks(
    // Callback 401 — déconnexion sans rechargement de page
    () => {
      authStore.logout()
      router.push({ name: 'Login' })
    },
    // Callback toast
    (message: string, type: 'error' | 'success' | 'warning') => {
      toastStore[type]?.(message)
    },
  )
}

// ==========================================
// INITIALISATION APP
// ==========================================

async function initializeApp(): Promise<void> {
  try {
    initializationError.value = null
    initProgress.value = 10
    loadingMessage.value = "Vérification de l'API..."

    await new Promise((r) => setTimeout(r, 300))
    initProgress.value = 30

    loadingMessage.value = 'Chargement de ton profil...'
    await authStore.initAuth()

    initProgress.value = 70

    loadingMessage.value = 'Presque prêt...'
    await new Promise((r) => setTimeout(r, 300))
    initProgress.value = 90

    initProgress.value = 100
    loadingMessage.value = 'Prêt ! 🎮'

    await new Promise((r) => setTimeout(r, 200))
    appInitialized.value = true
  } catch (error: any) {
    initializationError.value = error.message || 'Une erreur est survenue lors du chargement'

    // Session locale présente malgré erreur réseau → mode dégradé
    if (authStore.user && error.message?.includes('réseau')) {
      await new Promise((r) => setTimeout(r, 1000))
      appInitialized.value = true
    }
  }
}

async function retryInitialization(): Promise<void> {
  initProgress.value = 0
  loadingMessage.value = 'Nouvelle tentative...'
  await initializeApp()
}

// ==========================================
// LIFECYCLE
// ==========================================

// FIX: setupApiCallbacks avant initApp pour que les intercepteurs
// soient prêts dès la première requête (initAuth)
onBeforeMount(async () => {
  setupApiCallbacks()
  await initializeApp()
})

// ==========================================
// WATCHERS
// ==========================================

watch(locale, (newLocale) => {
  document.documentElement.lang = newLocale
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
</style>
