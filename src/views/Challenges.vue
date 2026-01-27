<template>
  <div class="max-w-6xl mx-auto">
    <!-- 🧪 DEBUG: Indicateur que le composant se charge -->
    <div v-if="isDevelopment" class="mb-6 bg-purple-100 border border-purple-300 rounded-lg p-4">
      <p class="text-purple-800 font-medium">
        🎯 Composant Challenges.vue chargé avec succès !
      </p>
      <p class="text-purple-600 text-sm">
        Route: {{ $route.name }} | Path: {{ $route.path }}
      </p>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">🎯 Défis</h1>
          <p class="text-gray-600 mt-2">Participez aux défis communautaires et grimpez dans les classements</p>
        </div>

        <!-- Actions header -->
        <div class="flex items-center gap-4">
          <button
            @click="refreshChallenges"
            class="gaming-button"
            :disabled="loading"
          >
            {{ loading ? '🔄 Chargement...' : '🔄 Actualiser' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="mb-8">
      <nav class="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="flex-1 px-4 py-2 text-sm font-medium rounded-md smooth-transition"
          :class="activeTab === tab.value
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Mes défis actifs -->
    <div v-if="activeTab === 'active'" class="space-y-6">
      <!-- Stats rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="stat-card p-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ myStats.activeChallenges }}</div>
            <div class="text-sm text-gray-600">Défis actifs</div>
          </div>
        </div>

        <div class="stat-card p-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ myStats.completedChallenges }}</div>
            <div class="text-sm text-gray-600">Complétés</div>
          </div>
        </div>

        <div class="stat-card p-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{{ myStats.bestRank }}</div>
            <div class="text-sm text-gray-600">Meilleur rang</div>
          </div>
        </div>

        <div class="stat-card p-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-600">{{ myStats.totalXP }}</div>
            <div class="text-sm text-gray-600">XP gagnés</div>
          </div>
        </div>
      </div>

      <!-- Mes défis en cours -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">🔥 Mes défis en cours</h3>

        <div v-if="myChallenges.length === 0" class="text-center py-8">
          <div class="text-4xl mb-4">🎯</div>
          <p class="text-gray-600 mb-4">Vous ne participez à aucun défi pour le moment</p>
          <button @click="activeTab = 'available'" class="gaming-button">
            Découvrir les défis
          </button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="challenge in myChallenges"
            :key="challenge.id"
            class="p-6 border border-gray-200 rounded-lg hover:shadow-md smooth-transition"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-start gap-4">
                <span class="text-3xl">{{ challenge.icon }}</span>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">{{ challenge.name }}</h4>
                  <p class="text-gray-600 text-sm mt-1">{{ challenge.description }}</p>

                  <!-- Difficulté et timing -->
                  <div class="flex items-center gap-4 mt-2 text-sm">
                    <span :class="getDifficultyClasses(challenge.difficulty)">
                      {{ getDifficultyLabel(challenge.difficulty) }}
                    </span>
                    <span class="text-gray-500">
                      Se termine le {{ formatDate(challenge.end_date) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Rang actuel -->
              <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">#{{ challenge.my_rank || '--' }}</div>
                <div class="text-sm text-gray-600">Votre rang</div>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progression</span>
                <span>{{ challenge.my_progress || 0 }}/{{ challenge.target_value }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="bg-blue-600 h-3 rounded-full smooth-transition relative overflow-hidden"
                  :style="{ width: getChallengeProgress(challenge) + '%' }"
                >
                  <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between">
              <div class="text-sm text-green-600 font-medium">
                +{{ challenge.xp_reward }} XP à gagner
              </div>
              <button
                @click="viewLeaderboard(challenge)"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 smooth-transition"
              >
                🏆 Voir le classement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Défis disponibles -->
    <div v-if="activeTab === 'available'" class="space-y-6">
      <!-- Filtres -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🎯 Filtres</h3>

        <div class="flex flex-wrap gap-4">
          <button
            v-for="filter in difficultyFilters"
            :key="filter.value"
            @click="selectedDifficulty = filter.value"
            class="px-4 py-2 rounded-lg text-sm font-medium smooth-transition"
            :class="selectedDifficulty === filter.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ filter.icon }} {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Liste des défis disponibles -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">🌟 Défis disponibles</h3>

        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Chargement des défis...</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="challenge in filteredAvailableChallenges"
            :key="challenge.id"
            class="p-6 border border-gray-200 rounded-lg hover:shadow-md smooth-transition"
          >
            <div class="flex items-start gap-4 mb-4">
              <span class="text-3xl">{{ challenge.icon }}</span>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">{{ challenge.name }}</h4>
                <p class="text-gray-600 text-sm mt-1">{{ challenge.description }}</p>

                <!-- Métadonnées -->
                <div class="flex items-center gap-4 mt-3 text-sm">
                  <span :class="getDifficultyClasses(challenge.difficulty)">
                    {{ getDifficultyLabel(challenge.difficulty) }}
                  </span>
                  <span class="text-gray-500">
                    {{ challenge.participants_count }} participants
                  </span>
                  <span class="text-gray-500">
                    {{ getRemainingTime(challenge.end_date) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Récompenses -->
            <div class="bg-gray-50 rounded-lg p-3 mb-4">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Récompenses :</span>
                <span class="font-medium text-green-600">+{{ challenge.xp_reward }} XP</span>
              </div>
            </div>

            <!-- Action -->
            <button
              @click="joinChallenge(challenge)"
              :disabled="joiningChallenge === challenge.id"
              class="w-full gaming-button"
            >
              {{ joiningChallenge === challenge.id ? '🔄 Participation...' : '🚀 Participer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Classements -->
    <div v-if="activeTab === 'leaderboard'" class="space-y-6">
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">🏆 Classements globaux</h3>

        <!-- Sélecteur de période -->
        <div class="mb-6">
          <select
            v-model="selectedPeriod"
            class="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="all">Tous temps</option>
          </select>
        </div>

        <!-- Tableau classement -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">#</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Joueur</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Défis complétés</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">XP gagnés</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Moyenne</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(player, index) in leaderboard"
              :key="player.id"
              class="hover:bg-gray-50 smooth-transition"
              :class="{ 'bg-blue-50': player.is_current_user }"
            >
              <td class="px-4 py-3">
                  <span class="font-bold" :class="{
                    'text-yellow-600': index === 0,
                    'text-gray-400': index === 1,
                    'text-amber-600': index === 2,
                    'text-blue-600': player.is_current_user && index > 2
                  }">
                    {{ index + 1 }}
                  </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ player.name }}</span>
                  <span v-if="player.is_current_user" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Vous
                    </span>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-900">{{ player.challenges_completed }}</td>
              <td class="px-4 py-3 text-green-600 font-medium">{{ player.xp_earned }}</td>
              <td class="px-4 py-3 text-gray-600">{{ player.avg_score }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal pour classement spécifique -->
    <ChallengeLeaderboardModal
      v-if="showLeaderboardModal"
      :challenge="selectedChallengeForLeaderboard"
      @close="showLeaderboardModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

// State
const route = useRoute()
const toast = useToast()

const loading = ref(true)
const activeTab = ref('active')
const joiningChallenge = ref(null)
const selectedDifficulty = ref('all')
const selectedPeriod = ref('week')
const showLeaderboardModal = ref(false)
const selectedChallengeForLeaderboard = ref(null)

const myChallenges = ref([])
const availableChallenges = ref([])
const leaderboard = ref([])

// Computed
const isDevelopment = computed(() => import.meta.env.DEV)

const tabs = [
  { value: 'active', label: 'Mes défis', icon: '🔥' },
  { value: 'available', label: 'Disponibles', icon: '🌟' },
  { value: 'leaderboard', label: 'Classements', icon: '🏆' }
]

const difficultyFilters = [
  { value: 'all', label: 'Toutes', icon: '🎯' },
  { value: 'easy', label: 'Facile', icon: '🟢' },
  { value: 'medium', label: 'Moyen', icon: '🟡' },
  { value: 'hard', label: 'Difficile', icon: '🔴' }
]

const myStats = computed(() => ({
  activeChallenges: myChallenges.value.length,
  completedChallenges: 12, // TODO: Calculer depuis les données
  bestRank: 3, // TODO: Calculer depuis l'historique
  totalXP: 850 // TODO: Calculer depuis les défis complétés
}))

const filteredAvailableChallenges = computed(() => {
  if (selectedDifficulty.value === 'all') return availableChallenges.value
  return availableChallenges.value.filter(c => c.difficulty === selectedDifficulty.value)
})

// Methods
function getDifficultyClasses(difficulty) {
  const classes = {
    easy: 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    medium: 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
    hard: 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
  }
  return classes[difficulty] || classes.easy
}

function getDifficultyLabel(difficulty) {
  const labels = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile'
  }
  return labels[difficulty] || 'Facile'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

function getChallengeProgress(challenge) {
  if (!challenge.my_progress || !challenge.target_value) return 0
  return Math.min(100, Math.round((challenge.my_progress / challenge.target_value) * 100))
}

function getRemainingTime(endDate) {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days <= 0) return 'Terminé'
  if (days === 1) return '1 jour restant'
  return `${days} jours restants`
}

async function joinChallenge(challenge) {
  joiningChallenge.value = challenge.id

  try {
    // TODO: Appeler l'API pour rejoindre le défi
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success(`Vous participez maintenant au défi "${challenge.name}" !`)

    // Déplacer le défi vers mes défis
    myChallenges.value.push({
      ...challenge,
      my_rank: Math.floor(Math.random() * 50) + 1,
      my_progress: 0
    })

    // Retirer des défis disponibles
    availableChallenges.value = availableChallenges.value.filter(c => c.id !== challenge.id)

  } catch (error) {
    toast.error('Erreur lors de la participation au défi')
  } finally {
    joiningChallenge.value = null
  }
}

function viewLeaderboard(challenge) {
  selectedChallengeForLeaderboard.value = challenge
  showLeaderboardModal.value = true
}

async function refreshChallenges() {
  await loadData()
  toast.success('Défis actualisés !')
}

async function loadData() {
  loading.value = true

  try {
    // TODO: Remplacer par de vraies données API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Données factices
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
        end_date: '2024-01-20'
      }
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
        end_date: '2024-01-31'
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
        end_date: '2024-02-15'
      }
    ]

    leaderboard.value = [
      {
        id: 1,
        name: 'Marie L.',
        challenges_completed: 15,
        xp_earned: 1250,
        avg_score: 83.3,
        is_current_user: false
      },
      {
        id: 2,
        name: 'Vous',
        challenges_completed: 12,
        xp_earned: 850,
        avg_score: 70.8,
        is_current_user: true
      }
    ]

  } catch (error) {
    toast.error('Erreur lors du chargement des défis')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Animations pour la progress bar des défis */
.challenge-progress {
  position: relative;
  overflow: hidden;
}

.challenge-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
</style>
