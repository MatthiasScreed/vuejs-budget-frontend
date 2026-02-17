<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">🎯 {{ t('challenges.title') }}</h1>
          <p class="text-gray-600 mt-2">{{ t('challenges.subtitle') }}</p>
        </div>

        <button
          @click="refreshChallenges"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? `🔄 ${t('challenges.refreshing')}` : `🔄 ${t('challenges.refresh')}` }}
        </button>
      </div>
    </div>

    <!-- Onglets -->
    <div class="mb-8">
      <nav class="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
          :class="
            activeTab === tab.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          "
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Mes défis actifs -->
    <div v-if="activeTab === 'active'" class="space-y-6">
      <!-- Stats rapides -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ myStats.activeChallenges }}</div>
            <div class="text-sm text-gray-600">{{ t('challenges.activeChallenges') }}</div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ myStats.completedChallenges }}</div>
            <div class="text-sm text-gray-600">{{ t('challenges.completed') }}</div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">#{{ myStats.bestRank }}</div>
            <div class="text-sm text-gray-600">{{ t('challenges.bestRank') }}</div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-600">{{ myStats.totalXP }}</div>
            <div class="text-sm text-gray-600">{{ t('challenges.totalXP') }}</div>
          </div>
        </div>
      </div>

      <!-- Mes défis en cours -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">
          🔥 {{ t('challenges.inProgress') }}
        </h3>

        <div v-if="myChallenges.length === 0" class="text-center py-8">
          <div class="text-4xl mb-4">🎯</div>
          <p class="text-gray-600 mb-4">{{ t('challenges.noChallenge') }}</p>
          <button
            @click="activeTab = 'available'"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {{ t('challenges.discover') }}
          </button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="challenge in myChallenges"
            :key="challenge.id"
            class="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-start gap-4">
                <span class="text-3xl">{{ challenge.icon }}</span>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">{{ challenge.name }}</h4>
                  <p class="text-gray-600 text-sm mt-1">{{ challenge.description }}</p>

                  <div class="flex items-center gap-4 mt-2 text-sm">
                    <span :class="getDifficultyClasses(challenge.difficulty)">
                      {{ getDifficultyLabel(challenge.difficulty) }}
                    </span>
                    <span class="text-gray-500">
                      {{ t('challenges.endsOn', { date: formatDate(challenge.end_date) }) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">#{{ challenge.my_rank || '--' }}</div>
                <div class="text-sm text-gray-600">{{ t('challenges.yourRank') }}</div>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>{{ t('challenges.progression') }}</span>
                <span>{{ challenge.my_progress || 0 }}/{{ challenge.target_value }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="bg-blue-600 h-3 rounded-full transition-all relative overflow-hidden"
                  :style="{ width: getChallengeProgress(challenge) + '%' }"
                >
                  <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="text-sm text-green-600 font-medium">
                +{{ challenge.xp_reward }} {{ t('gaming.xp') }} {{ t('challenges.toWin') }}
              </div>
              <button
                @click="viewLeaderboard(challenge)"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {{ t('challenges.viewLeaderboard') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Défis disponibles -->
    <div v-if="activeTab === 'available'" class="space-y-6">
      <!-- Filtres -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🎯 {{ t('challenges.filters') }}</h3>

        <div class="flex flex-wrap gap-3">
          <button
            v-for="filter in difficultyFilters"
            :key="filter.value"
            @click="selectedDifficulty = filter.value"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              selectedDifficulty === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
          >
            {{ filter.icon }} {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Liste des défis disponibles -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">
          🌟 {{ t('challenges.availableChallenges') }}
        </h3>

        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">{{ t('common.loading') }}</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="challenge in filteredAvailableChallenges"
            :key="challenge.id"
            class="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all"
          >
            <div class="flex items-start gap-4 mb-4">
              <span class="text-3xl">{{ challenge.icon }}</span>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">{{ challenge.name }}</h4>
                <p class="text-gray-600 text-sm mt-1">{{ challenge.description }}</p>

                <div class="flex items-center gap-4 mt-3 text-sm">
                  <span :class="getDifficultyClasses(challenge.difficulty)">
                    {{ getDifficultyLabel(challenge.difficulty) }}
                  </span>
                  <span class="text-gray-500">
                    {{ challenge.participants_count }} {{ t('challenges.participants') }}
                  </span>
                  <span class="text-gray-500">
                    {{ getRemainingTime(challenge.end_date) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-3 mb-4">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">{{ t('challenges.rewards') }} :</span>
                <span class="font-medium text-green-600"
                  >+{{ challenge.xp_reward }} {{ t('gaming.xp') }}</span
                >
              </div>
            </div>

            <button
              @click="joinChallenge(challenge)"
              :disabled="joiningChallenge === challenge.id"
              class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {{
                joiningChallenge === challenge.id
                  ? `🔄 ${t('challenges.participating')}`
                  : `🚀 ${t('challenges.participate')}`
              }}
            </button>
          </div>
        </div>

        <div v-if="!loading && filteredAvailableChallenges.length === 0" class="text-center py-8">
          <div class="text-4xl mb-4">🔍</div>
          <p class="text-gray-600">{{ t('challenges.noChallengeFound') }}</p>
        </div>
      </div>
    </div>

    <!-- Classements -->
    <div v-if="activeTab === 'leaderboard'" class="space-y-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">
          🏆 {{ t('challenges.globalLeaderboard') }}
        </h3>

        <div class="mb-6">
          <select
            v-model="selectedPeriod"
            class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">{{ t('challenges.thisWeek') }}</option>
            <option value="month">{{ t('challenges.thisMonth') }}</option>
            <option value="all">{{ t('challenges.allTime') }}</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">#</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  {{ t('challenges.player') }}
                </th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  {{ t('challenges.challengesCompleted') }}
                </th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  {{ t('gaming.xp') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(player, index) in leaderboard"
                :key="player.id"
                class="hover:bg-gray-50 transition-colors"
                :class="{ 'bg-blue-50': player.is_current_user }"
              >
                <td class="px-4 py-3">
                  <span
                    class="font-bold"
                    :class="{
                      'text-yellow-600': index === 0,
                      'text-gray-400': index === 1,
                      'text-amber-600': index === 2,
                      'text-gray-600': index > 2,
                    }"
                  >
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ player.name }}</span>
                    <span
                      v-if="player.is_current_user"
                      class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {{ t('challenges.you') }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-900">{{ player.challenges_completed }}</td>
                <td class="px-4 py-3 text-green-600 font-medium">{{ player.xp_earned }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Leaderboard -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showLeaderboardModal && selectedChallengeForLeaderboard"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click.self="showLeaderboardModal = false"
        >
          <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">🏆 {{ selectedChallengeForLeaderboard.name }}</h3>
              <button
                @click="showLeaderboardModal = false"
                class="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p class="text-gray-600 text-center py-8">{{ t('challenges.leaderboardComing') }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

// ==========================================
// I18N
// ==========================================

const { t } = useI18n()

// ==========================================
// STATE
// ==========================================

const toast = useToast()
const loading = ref(true)
const activeTab = ref('active')
const joiningChallenge = ref<number | null>(null)
const selectedDifficulty = ref('all')
const selectedPeriod = ref('week')
const showLeaderboardModal = ref(false)
const selectedChallengeForLeaderboard = ref<any>(null)

const myChallenges = ref<any[]>([])
const availableChallenges = ref<any[]>([])
const leaderboard = ref<any[]>([])

// ==========================================
// OPTIONS
// ==========================================

const tabs = computed(() => [
  { value: 'active', label: t('challenges.myChallenges'), icon: '🔥' },
  { value: 'available', label: t('challenges.available'), icon: '🌟' },
  { value: 'leaderboard', label: t('challenges.leaderboards'), icon: '🏆' },
])

const difficultyFilters = computed(() => [
  { value: 'all', label: t('challenges.all'), icon: '🎯' },
  { value: 'easy', label: t('challenges.easy'), icon: '🟢' },
  { value: 'medium', label: t('challenges.medium'), icon: '🟡' },
  { value: 'hard', label: t('challenges.hard'), icon: '🔴' },
])

// ==========================================
// COMPUTED
// ==========================================

const myStats = computed(() => ({
  activeChallenges: myChallenges.value.length,
  completedChallenges: 12,
  bestRank: 3,
  totalXP: 850,
}))

const filteredAvailableChallenges = computed(() => {
  if (selectedDifficulty.value === 'all') return availableChallenges.value
  return availableChallenges.value.filter((c) => c.difficulty === selectedDifficulty.value)
})

// ==========================================
// MÉTHODES
// ==========================================

function getDifficultyClasses(difficulty: string): string {
  const classes: Record<string, string> = {
    easy: 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    medium: 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
    hard: 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full',
  }
  return classes[difficulty] || classes.easy
}

function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: t('challenges.difficultyEasy'),
    medium: t('challenges.difficultyMedium'),
    hard: t('challenges.difficultyHard'),
  }
  return labels[difficulty] || t('challenges.difficultyEasy')
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

function getChallengeProgress(challenge: any): number {
  if (!challenge.my_progress || !challenge.target_value) return 0
  return Math.min(100, Math.round((challenge.my_progress / challenge.target_value) * 100))
}

function getRemainingTime(endDate: string): string {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days <= 0) return t('challenges.finished')
  if (days === 1) return t('challenges.oneDay')
  return t('challenges.remaining', { n: days })
}

async function joinChallenge(challenge: any): Promise<void> {
  joiningChallenge.value = challenge.id

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success(t('challenges.joined', { name: challenge.name }))

    myChallenges.value.push({
      ...challenge,
      my_rank: Math.floor(Math.random() * 50) + 1,
      my_progress: 0,
    })

    availableChallenges.value = availableChallenges.value.filter((c) => c.id !== challenge.id)
  } catch (error) {
    toast.error(t('challenges.error'))
  } finally {
    joiningChallenge.value = null
  }
}

function viewLeaderboard(challenge: any): void {
  selectedChallengeForLeaderboard.value = challenge
  showLeaderboardModal.value = true
}

async function refreshChallenges(): Promise<void> {
  await loadData()
  toast.success(t('challenges.refreshed'))
}

async function loadData(): Promise<void> {
  loading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    myChallenges.value = [
      {
        id: 1,
        name: 'Économe de la semaine',
        description: 'Économisez 500€ cette semaine',
        icon: '💰',
        difficulty: 'medium',
        target_value: 500,
        my_progress: 350,
        my_rank: 5,
        xp_reward: 75,
        end_date: '2024-01-20',
      },
    ]

    availableChallenges.value = [
      {
        id: 2,
        name: 'Maître des transactions',
        description: 'Enregistrez 50 transactions ce mois',
        icon: '📊',
        difficulty: 'easy',
        target_value: 50,
        participants_count: 234,
        xp_reward: 100,
        end_date: '2024-01-31',
      },
      {
        id: 3,
        name: 'Investisseur du futur',
        description: 'Investissez 2000€ dans vos objectifs',
        icon: '🚀',
        difficulty: 'hard',
        target_value: 2000,
        participants_count: 89,
        xp_reward: 200,
        end_date: '2024-02-15',
      },
    ]

    leaderboard.value = [
      {
        id: 1,
        name: 'Marie L.',
        challenges_completed: 15,
        xp_earned: 1250,
        is_current_user: false,
      },
      { id: 2, name: 'Vous', challenges_completed: 12, xp_earned: 850, is_current_user: true },
      { id: 3, name: 'Alex T.', challenges_completed: 10, xp_earned: 720, is_current_user: false },
    ]
  } catch (error) {
    toast.error(t('challenges.error'))
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
