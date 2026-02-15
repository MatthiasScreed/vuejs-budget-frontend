<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">🎮 Progression</h1>
      <p class="text-gray-600 mt-2">Suivez votre évolution et débloquez des récompenses</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <template v-else>
      <!-- Stats Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <!-- Niveau -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold"
            >
              {{ userLevel }}
            </div>
            <div>
              <div class="text-sm text-gray-600">{{ terminology.tier }}</div>
              <div class="text-xl font-bold text-gray-900">{{ tierName }}</div>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${progressPercent}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>{{ currentXP }} {{ terminology.points }}</span>
              <span>{{ nextLevelXP }} {{ terminology.points }}</span>
            </div>
          </div>
        </div>

        <!-- Succès -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl"
            >
              🏆
            </div>
            <div>
              <div class="text-sm text-gray-600">Succès</div>
              <div class="text-xl font-bold text-gray-900">{{ achievementStats.unlocked }}</div>
            </div>
          </div>
          <div class="mt-3 text-sm text-gray-500">{{ achievementStats.percentage }}% complétés</div>
        </div>

        <!-- Streak -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white text-xl"
            >
              🔥
            </div>
            <div>
              <div class="text-sm text-gray-600">{{ terminology.streak }}</div>
              <div class="text-xl font-bold text-gray-900">{{ streakDays }} jours</div>
            </div>
          </div>
          <div class="mt-3 text-sm text-gray-500">Record: {{ bestStreak }} jours</div>
        </div>

        <!-- XP Total -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl"
            >
              ⭐
            </div>
            <div>
              <div class="text-sm text-gray-600">{{ terminology.points }} Total</div>
              <div class="text-xl font-bold text-gray-900">{{ formatNumber(totalXP) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <router-link
          to="/app/achievements"
          class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <span class="text-3xl">🏆</span>
            <div>
              <h3 class="font-semibold text-gray-900">Tous les succès</h3>
              <p class="text-sm text-gray-600">
                {{ achievementStats.unlocked }}/{{ achievementStats.total }} débloqués
              </p>
            </div>
            <span class="ml-auto text-gray-500">→</span>
          </div>
        </router-link>

        <router-link
          to="/app/challenges"
          class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <span class="text-3xl">⚔️</span>
            <div>
              <h3 class="font-semibold text-gray-900">Défis actifs</h3>
              <p class="text-sm text-gray-600">{{ activeChallenges }} en cours</p>
            </div>
            <span class="ml-auto text-gray-500">→</span>
          </div>
        </router-link>

        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <span class="text-3xl">📊</span>
            <div>
              <h3 class="font-semibold text-gray-900">Classement</h3>
              <p class="text-sm text-gray-600">#{{ leaderboardPosition }} sur {{ totalUsers }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements récents -->
      <div
        v-if="recentAchievements.length > 0"
        class="bg-white rounded-xl border border-gray-200 p-6 mb-8"
      >
        <h2 class="text-lg font-semibold text-gray-900 mb-4">✨ Succès récents</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            class="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
          >
            <span class="text-2xl">{{ achievement.icon || '🏆' }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ achievement.name }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(achievement.unlocked_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🏆 Classement</h3>
        <div class="space-y-3">
          <div
            v-for="(entry, index) in leaderboard"
            :key="entry.user_id"
            class="flex items-center p-4 rounded-lg"
            :class="entry.is_current_user ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'"
          >
            <div
              class="w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold"
              :class="{
                'bg-yellow-500': index === 0,
                'bg-gray-400': index === 1,
                'bg-amber-600': index === 2,
                'bg-gray-500': index > 2,
              }"
            >
              {{ index + 1 }}
            </div>
            <div class="ml-4 flex-1">
              <div class="font-medium text-gray-900">{{ entry.user_name }}</div>
              <div class="text-sm text-gray-500">
                {{ terminology.tier }} {{ entry.level }} • {{ formatNumber(entry.total_xp) }}
                {{ terminology.points }}
              </div>
            </div>
            <span v-if="entry.is_current_user" class="text-blue-600 font-medium text-sm">Vous</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { useProgressiveGaming, ENGAGEMENT_LEVELS } from '@/composables/useProgressiveGaming'

// ==========================================
// STORES & COMPOSABLES
// ==========================================

const authStore = useAuthStore()
const achievementStore = useAchievementStore()
const { terminology, engagementLevel, initialize, getTierLabel } = useProgressiveGaming()

// ==========================================
// STATE
// ==========================================

const loading = ref(true)
const leaderboard = ref<any[]>([])
const activeChallenges = ref(0)

// ==========================================
// COMPUTED
// ==========================================

const userLevel = computed(() => authStore.user?.level?.level || 1)
const totalXP = computed(() => authStore.user?.level?.total_xp || 0)
const currentXP = computed(() => authStore.user?.level?.current_level_xp || 0)
const nextLevelXP = computed(() => authStore.user?.level?.next_level_xp || 100)
const progressPercent = computed(() => {
  if (nextLevelXP.value <= 0) return 0
  return Math.min(100, Math.round((currentXP.value / nextLevelXP.value) * 100))
})

const tierName = computed(() => getTierLabel(userLevel.value))

const streakDays = computed(() => 7) // TODO: Connecter à l'API
const bestStreak = computed(() => 14) // TODO: Connecter à l'API

const achievementStats = computed(() => {
  const achievements = Array.isArray(achievementStore.achievements) ? achievementStore.achievements : []
  return {
    unlocked: achievements.filter(
      (a) => achievementStore.userProgress[a.id]?.unlocked,
    ).length,
    total: achievements.length,
    percentage:
      achievements.length > 0
        ? Math.round(
            (achievements.filter(
              (a) => achievementStore.userProgress[a.id]?.unlocked,
            ).length /
              achievements.length) *
              100,
          )
        : 0,
  }
})

const recentAchievements = computed(() => (achievementStore.recentAchievements || []).slice(0, 6))

const leaderboardPosition = computed(() => {
  const leaderboardValue = leaderboard.value || []
  const currentUser = leaderboardValue.find((e: any) => e.is_current_user)
  return currentUser ? leaderboardValue.indexOf(currentUser) + 1 : '--'
})

const totalUsers = computed(() => (leaderboard.value || []).length || 100)

// ==========================================
// MÉTHODES
// ==========================================

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return (num || 0).toLocaleString('fr-FR')
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  } catch (e) {
    return ''
  }
}

async function loadData(): Promise<void> {
  loading.value = true

  try {
    await Promise.all([
      initialize(),
      achievementStore.loadAchievementData(),
    ])

    // Mock leaderboard - TODO: Connecter à l'API
    leaderboard.value = [
      { user_id: 1, user_name: 'Alice M.', level: 8, total_xp: 2450, is_current_user: false },
      { user_id: 2, user_name: 'Bob T.', level: 6, total_xp: 1890, is_current_user: false },
      {
        user_id: authStore.user?.id || 3,
        user_name: 'Vous',
        level: userLevel.value,
        total_xp: totalXP.value,
        is_current_user: true,
      },
      { user_id: 4, user_name: 'Charlie L.', level: 4, total_xp: 1200, is_current_user: false },
    ].sort((a, b) => b.total_xp - a.total_xp)
  } catch (error) {
    console.error('Erreur chargement gaming:', error)
  } finally {
    loading.value = false
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  loadData()
})
</script>
