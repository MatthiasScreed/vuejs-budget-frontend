<template>
  <footer class="bg-white border-t border-gray-200 py-6">
    <div class="max-w-7xl mx-auto px-4 lg:px-6">
      <div class="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">

        <!-- Left: Logo + Copyright -->
        <div class="flex items-center space-x-3">
          <img src="@/assets/images/icon/icon.svg" class="w-8" alt="">
          <div>
            <p class="text-sm font-semibold text-gray-900">Budget Gaming</p>
            <p class="text-xs text-gray-500">© 2025 - Tous droits réservés</p>
          </div>
        </div>

        <!-- Center: Gaming Stats rapides -->
        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2">
            <TrophyIcon class="w-5 h-5 text-yellow-500" />
            <div class="text-center">
              <p class="text-sm font-semibold text-gray-900">{{ totalAchievements }}</p>
              <p class="text-xs text-gray-500">Succès</p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <FireIcon class="w-5 h-5 text-orange-500" />
            <div class="text-center">
              <p class="text-sm font-semibold text-gray-900">{{ currentStreak }}</p>
              <p class="text-xs text-gray-500">Jours</p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <StarIcon class="w-5 h-5 text-purple-500" />
            <div class="text-center">
              <p class="text-sm font-semibold text-gray-900">{{ playerLevel }}</p>
              <p class="text-xs text-gray-500">Niveau</p>
            </div>
          </div>
        </div>

        <!-- Right: Links -->
        <div class="flex items-center space-x-6">
          <nav class="flex items-center space-x-4">
            <router-link
              to="/help"
              class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Aide
            </router-link>
            <router-link
              to="/privacy"
              class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Confidentialité
            </router-link>
            <a
              href="https://github.com/budget-gaming"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
            >
              <CodeBracketIcon class="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </nav>
        </div>
      </div>

      <!-- Version et status API (mode dev seulement) -->
      <div v-if="isDevelopment" class="mt-4 pt-4 border-t border-gray-100">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center space-x-4">
            <span>Version: {{ appVersion }}</span>
            <span class="flex items-center space-x-1">
              <div
                class="w-2 h-2 rounded-full"
                :class="apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'"
              ></div>
              <span>API: {{ apiStatus }}</span>
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <span>Env: {{ environment }}</span>
            <button
              @click="clearCache"
              class="text-blue-600 hover:text-blue-700 underline"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamingStore } from '@/stores/gamingStore'
import { useSystemStore } from '@/stores/systemStore'
import {
  CurrencyDollarIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  CodeBracketIcon
} from '@heroicons/vue/24/outline'

// Stores
const gamingStore = useGamingStore()
const systemStore = useSystemStore()

// Computed gaming data
const totalAchievements = computed(() => gamingStore.achievements?.length || 0)
const currentStreak = computed(() => gamingStore.currentStreak || 0)
const playerLevel = computed(() => gamingStore.playerLevel || 1)

// System info
const isDevelopment = computed(() => import.meta.env.DEV)
const appVersion = computed(() => import.meta.env.VITE_APP_VERSION || '1.0.0')
const environment = computed(() => import.meta.env.MODE)
const apiStatus = computed(() => systemStore.apiStatus || 'disconnected')

// Methods
const clearCache = (): void => {
  // Vider le cache du navigateur pour le dev
  localStorage.clear()
  sessionStorage.clear()
  location.reload()
}
</script>

<style scoped>
/* Effet gaming sur les stats */
.gaming-stat {
  transition: all 0.2s ease;
}

.gaming-stat:hover {
  transform: translateY(-1px);
}

/* Animation pour le status API */
@keyframes pulse-api {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.api-pulse {
  animation: pulse-api 2s ease-in-out infinite;
}
</style>
