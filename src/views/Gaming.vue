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

      <!-- ✅ POINTS EXPLAINER -->
      <PointsExplainer class="mb-8" />

      <!-- Quick Links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <router-link
          to="/app/gaming/achievements"
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
          to="/app/gaming/challenges"
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
              <p class="text-sm text-gray-600">#{{ userRank }} sur {{ totalPlayers }}</p>
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

        <!-- Loading -->
        <div v-if="leaderboardLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>

        <!-- Leaderboard vide -->
        <div v-else-if="leaderboard.length === 0" class="text-center py-8 text-gray-500">
          Aucun joueur dans le classement pour le moment.
        </div>

        <!-- Leaderboard list -->
        <div v-else class="space-y-3">
          <div
            v-for="entry in leaderboard"
            :key="entry.user_id"
            class="flex items-center p-4 rounded-lg"
            :class="entry.is_current_user ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'"
          >
            <div
              class="w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold"
              :class="getRankClass(entry.rank)"
            >
              {{ entry.rank }}
            </div>
            <div class="ml-4 flex-1">
              <!-- ✅ Afficher le nom -->
              <div class="font-medium text-gray-900">
                {{ entry.user_name || 'Joueur Anonyme' }}
              </div>
              <div class="text-sm text-gray-500">
                {{ terminology.tier }} {{ entry.level }} • {{ formatNumber(entry.total_xp) }}
                {{ terminology.points }}
              </div>
            </div>
            <span v-if="entry.is_current_user" class="text-blue-600 font-medium text-sm">Vous</span>
          </div>

          <!-- ✅ Afficher l'utilisateur s'il n'est pas dans le top -->
          <div
            v-if="userEntry"
            class="flex items-center p-4 rounded-lg bg-blue-50 border border-blue-200 mt-4"
          >
            <div
              class="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold"
            >
              {{ userEntry.rank }}
            </div>
            <div class="ml-4 flex-1">
              <div class="font-medium text-gray-900">{{ userEntry.user_name }}</div>
              <div class="text-sm text-gray-500">
                {{ terminology.tier }} {{ userEntry.level }} •
                {{ formatNumber(userEntry.total_xp) }}
                {{ terminology.points }}
              </div>
            </div>
            <span class="text-blue-600 font-medium text-sm">Vous</span>
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
import { useProgressiveGaming } from '@/composables/useProgressiveGaming'
import PointsExplainer from '@/components/gaming/PointsExplainer.vue'
import api from '@/services/api'

// ==========================================
// TYPES
// ==========================================

interface LeaderboardEntry {
  rank: number
  user_id: number
  user_name: string
  level: number
  total_xp: number
  title: string
  is_current_user: boolean
}

// ==========================================
// STORES & COMPOSABLES
// ==========================================

const authStore = useAuthStore()
const achievementStore = useAchievementStore()
const { terminology, initialize, getTierLabel } = useProgressiveGaming()

// ==========================================
// STATE
// ==========================================

const loading = ref(true)
const leaderboardLoading = ref(false)
const leaderboard = ref<LeaderboardEntry[]>([])
const userRank = ref(0)
const totalPlayers = ref(0)
const activeChallenges = ref(0)
const streakData = ref({ current: 0, best: 0 })
const userEntry = ref<LeaderboardEntry | null>(null)

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
const streakDays = computed(() => streakData.value.current)
const bestStreak = computed(() => streakData.value.best)

const achievementStats = computed(() => {
  const achievements = Array.isArray(achievementStore.achievements)
    ? achievementStore.achievements
    : []
  const unlocked = achievements.filter((a) => achievementStore.userProgress[a.id]?.unlocked).length
  return {
    unlocked,
    total: achievements.length,
    percentage: achievements.length > 0 ? Math.round((unlocked / achievements.length) * 100) : 0,
  }
})

const recentAchievements = computed(() => (achievementStore.recentAchievements || []).slice(0, 6))

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
  } catch {
    return ''
  }
}

function getRankClass(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-yellow-500'
    case 2:
      return 'bg-gray-400'
    case 3:
      return 'bg-amber-600'
    default:
      return 'bg-gray-500'
  }
}

/**
 * ✅ Charger le leaderboard depuis l'API
 */
async function loadLeaderboard(): Promise<void> {
  leaderboardLoading.value = true
  try {
    const response = await api.get<{
      leaderboard: LeaderboardEntry[]
      user_rank: number
      total_players: number
      user_entry: LeaderboardEntry | null
    }>('/gaming/leaderboard', { params: { limit: 10 } })

    if (response.success && response.data) {
      leaderboard.value = response.data.leaderboard || []
      userRank.value = response.data.user_rank || 0
      totalPlayers.value = response.data.total_players || 0
      userEntry.value = response.data.user_entry || null // ✅ Ajout
    }
  } catch (error) {
    console.error('Erreur chargement leaderboard:', error)
    leaderboard.value = []
  } finally {
    leaderboardLoading.value = false
  }
}

/**
 * ✅ Charger les données de streak
 */
async function loadStreakData(): Promise<void> {
  try {
    const response = await api.get<any[]>('/gaming/streaks')
    if (response.success && Array.isArray(response.data)) {
      const loginStreak = response.data.find((s) => s.type === 'daily_login')
      if (loginStreak) {
        streakData.value = {
          current: loginStreak.current_count || 0,
          best: loginStreak.best_count || 0,
        }
      }
    }
  } catch (error) {
    console.warn('Erreur chargement streaks:', error)
  }
}

/**
 * ✅ Charger toutes les données
 */
async function loadData(): Promise<void> {
  loading.value = true
  try {
    await Promise.all([
      initialize(),
      achievementStore.loadAchievementData(),
      loadLeaderboard(),
      loadStreakData(),
    ])
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
