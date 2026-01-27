<template>
  <div>
    <!-- Gaming Dashboard -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <div v-if="stats" class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {{ stats.level }}
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">Niveau</div>
              <div class="text-2xl font-bold text-gray-900">{{ stats.level }}</div>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${levelProgress}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ stats.current_level_xp }} / {{ stats.next_level_xp }} XP
            </div>
          </div>
        </div>

        <div v-if="stats" class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                🏆
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">Succès</div>
              <div class="text-2xl font-bold text-gray-900">{{ achievementStats.unlocked }}</div>
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-gray-500">
              {{ achievementStats.percentage }}% completé
            </span>
          </div>
        </div>
      </div>

      <!-- Achievements récents -->
      <div v-if="recentAchievements.length > 0" class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">🏆 Succès récents</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="achievement in recentAchievements"
            :key="achievement.achievement_id"
            class="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                🏆
              </div>
              <div class="ml-3 flex-1">
                <div class="font-medium text-gray-900">{{ getAchievementName(achievement.achievement_id) }}</div>
                <div class="text-sm text-gray-500">
                  Débloqué {{ formatDate(achievement.unlocked_at!) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">🏆 Classement</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="(entry, index) in leaderboard" :key="entry.user_id">
              <div
                :class="entry.user_id === authStore.user?.id ?
                  'bg-purple-50 border border-purple-200' : 'bg-gray-50'"
                class="flex items-center p-4 rounded-lg"
              >
                <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold">
                  {{ index + 1 }}
                </div>
                <div class="ml-3 flex-1">
                  <div class="font-medium text-gray-900">{{ entry.user_name }}</div>
                  <div class="text-sm text-gray-500">Level {{ entry.level }} • {{ formatXP(entry.total_xp) }} XP</div>
                </div>
                <div v-if="entry.user_id === authStore.user?.id" class="text-purple-600 font-medium text-sm">
                  Vous
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// ✅ CORRECTION: Utiliser achievementStore au lieu de gamingStore
import { useAchievementStore } from '@/stores/achievementStore'
import { useAuthStore } from '@/stores/authStore'
import type { Achievement } from '@/types/entities/gaming'

// Stores
const achievementStore = useAchievementStore()
const authStore = useAuthStore()

// State local
const loading = ref(false)
const error = ref<string | null>(null)

// Mock leaderboard (remplacer par vraie API)
const leaderboard = ref([
  { user_id: 1, user_name: 'Alice', level: 5, total_xp: 2450, position: 1 },
  { user_id: 2, user_name: 'Bob', level: 4, total_xp: 1890, position: 2 },
  { user_id: 3, user_name: 'Charlie', level: 3, total_xp: 1200, position: 3 }
])

// ✅ CORRECTION: Utiliser les computed du bon store
const recentAchievements = computed(() => achievementStore.recentAchievements)
const achievementStats = computed(() => achievementStore.achievementStats)

// Stats mockées (en attendant le vrai store)
const stats = computed(() => {
  const user = authStore.user
  if (!user?.level) {
    return {
      level: 1,
      current_level_xp: 0,
      next_level_xp: 100,
      total_xp: 0
    }
  }

  return {
    level: user.level.level || 1,
    current_level_xp: user.level.current_level_xp || 0,
    next_level_xp: user.level.next_level_xp || 100,
    total_xp: user.level.total_xp || 0
  }
})

const levelProgress = computed(() => {
  const current = stats.value.current_level_xp
  const needed = stats.value.next_level_xp
  return needed > 0 ? Math.round((current / needed) * 100) : 0
})

// Methods
const formatXP = (xp: number): string => {
  return new Intl.NumberFormat('fr-FR').format(xp)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

const getAchievementName = (achievementId: number): string => {
  const achievement = achievementStore.achievements.find(a => a.id === achievementId)
  return achievement?.name || 'Achievement'
}

// ✅ CORRECTION: Utiliser les bonnes méthodes du store
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      achievementStore.fetchAchievements(),
      achievementStore.fetchUserAchievements()
    ])
  } catch (err: any) {
    error.value = err.message
    console.error('Erreur lors du chargement des données gaming:', err)
  } finally {
    loading.value = false
  }
})
</script>
