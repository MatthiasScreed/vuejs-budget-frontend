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
          <div class="w-32 h-32 mx-auto animate-pulse">
            <img :src="iconUrl" alt="CoinQuest" class="w-full h-full drop-shadow-2xl" />
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

        <p class="text-gray-400 mb-6">{{ loadingMessage }}</p>

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
            <span>🔄 Réessayer</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 🎯 CONTENU PRINCIPAL - Affiché seulement après init complète -->
    <Transition name="fade" mode="out-in">
      <router-view v-if="appInitialized" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

// Import du logo
import iconSvg from '@/assets/images/icon/icon.svg'

const iconUrl = computed(() => iconSvg)
const authStore = useAuthStore()
const router = useRouter()

const appInitialized = ref(false)
const initializationError = ref<string | null>(null)
const initProgress = ref(0)
const loadingMessage = ref('Préparation de ton aventure...')

/**
 * 🔐 Initialiser l'application AVANT le premier rendu
 * Cela garantit que authStore.isInitialized = true avant que le router guard ne s'exécute
 */
async function initializeApp(): Promise<void> {
  console.group('🚀 === APP INITIALIZATION ===')

  try {
    initializationError.value = null
    initProgress.value = 10
    loadingMessage.value = "Vérification de l'API..."

    // 1️⃣ Test de connexion API (optionnel mais recommandé)
    await new Promise((r) => setTimeout(r, 300))
    initProgress.value = 30

    // 2️⃣ Initialiser l'authentification (CRITIQUE)
    loadingMessage.value = 'Chargement de ton profil...'
    console.log('📍 Début initAuth()')

    const authResult = await authStore.initAuth()

    console.log('📍 initAuth() terminée:', authResult)
    console.log('📍 isAuthenticated:', authStore.isAuthenticated)
    console.log('📍 user:', authStore.user?.email || 'null')

    initProgress.value = 70

    // 3️⃣ Autres initialisations (stores, config, etc.)
    loadingMessage.value = 'Presque prêt...'
    await new Promise((r) => setTimeout(r, 300))
    initProgress.value = 90

    // 4️⃣ Finalisation
    initProgress.value = 100
    loadingMessage.value = 'Prêt ! 🎮'

    // Petit délai pour que l'utilisateur voit le 100%
    await new Promise((r) => setTimeout(r, 200))

    appInitialized.value = true

    console.log('✅ Application initialisée avec succès')
    console.groupEnd()
  } catch (error: any) {
    console.error("❌ Erreur lors de l'initialisation:", error)
    console.groupEnd()

    initializationError.value = error.message || 'Une erreur est survenue lors du chargement'

    // En cas d'erreur réseau mais avec token local, on peut quand même laisser l'app démarrer
    if (authStore.user && error.message?.includes('réseau')) {
      console.warn('⚠️ Erreur réseau mais session locale présente, démarrage en mode dégradé')
      await new Promise((r) => setTimeout(r, 1000))
      appInitialized.value = true
    }
  }
}

/**
 * 🔄 Réessayer l'initialisation en cas d'erreur
 */
async function retryInitialization(): Promise<void> {
  initProgress.value = 0
  loadingMessage.value = 'Nouvelle tentative...'
  await initializeApp()
}

/**
 * 🎯 IMPORTANT: Utiliser onBeforeMount au lieu de onMounted
 * Cela garantit que l'init se fait AVANT que le router ne tente la première navigation
 */
onBeforeMount(async () => {
  console.log('📍 App.vue - BEFORE MOUNT')
  await initializeApp()
  console.log('📍 App.vue - Initialization complete, ready for navigation')
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
