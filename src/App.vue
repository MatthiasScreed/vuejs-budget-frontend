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
          <!-- ✅ FIX: Utiliser l'import ES au lieu du chemin relatif -->
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

    <!-- 🎯 CONTENU PRINCIPAL -->
    <Transition name="fade" mode="out-in">
      <router-view v-if="appInitialized" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// ✅ FIX: Import ES du logo pour que Vite le process correctement
import iconSvg from '@/assets/images/icon/icon.svg'

// URL du logo (sera correctement hashée en production)
const iconUrl = computed(() => iconSvg)

const authStore = useAuthStore()

const appInitialized = ref(false)
const initializationError = ref<string | null>(null)
const initProgress = ref(0)
const loadingMessage = ref('Préparation de ton aventure...')

async function initializeApp(): Promise<void> {
  try {
    console.log("🚀 Initialisation de l'application...")
    initializationError.value = null
    initProgress.value = 10

    // Simuler progression
    const messages = ["Vérification de l'API...", 'Chargement de ton profil...', 'Presque prêt...']

    for (let i = 0; i < messages.length; i++) {
      loadingMessage.value = messages[i]
      initProgress.value = 20 + (i + 1) * 25
      await new Promise((r) => setTimeout(r, 300))
    }

    // Initialiser l'authentification
    await authStore.initAuth()

    initProgress.value = 100
    appInitialized.value = true
    console.log('✅ Application initialisée')
  } catch (error: any) {
    console.error("❌ Erreur lors de l'initialisation:", error)
    initializationError.value = error.message || 'Une erreur est survenue'
  }
}

async function retryInitialization(): Promise<void> {
  initProgress.value = 0
  loadingMessage.value = 'Nouvelle tentative...'
  await initializeApp()
}

onMounted(async () => {
  await initializeApp()
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
