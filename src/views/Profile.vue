<template>
  <div class="max-w-6xl mx-auto">
    <!-- 🧪 DEBUG: Indicateur que le composant se charge -->
    <div v-if="isDevelopment" class="mb-6 bg-purple-100 border border-purple-300 rounded-lg p-4">
      <p class="text-purple-800 font-medium">
        👤 Composant Profile.vue chargé avec succès !
      </p>
      <p class="text-purple-600 text-sm">
        Route: {{ $route.name }} | Path: {{ $route.path }}
      </p>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">👤 Profil</h1>
          <p class="text-gray-600 mt-2">Gérez votre profil et consultez vos statistiques</p>
        </div>

        <!-- Actions header -->
        <div class="flex items-center gap-4">
          <button
            @click="editMode = !editMode"
            class="gaming-button"
          >
            {{ editMode ? '💾 Sauvegarder' : '✏️ Modifier' }}
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

    <!-- Profil général -->
    <div v-if="activeTab === 'profile'" class="space-y-6">
      <!-- Informations principales -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">👤 Informations personnelles</h3>

        <div class="flex items-start gap-8">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div class="relative">
              <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {{ userProfile.avatar || getInitials(userProfile.name) }}
              </div>

              <!-- Badge de niveau -->
              <div class="absolute -bottom-2 -right-2">
                <div class="level-badge w-8 h-8 text-xs">
                  {{ userProfile.level }}
                </div>
              </div>
            </div>

            <button v-if="editMode" class="mt-2 text-sm text-blue-600 hover:text-blue-800">
              Changer l'avatar
            </button>
          </div>

          <!-- Informations -->
          <div class="flex-1 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  v-if="editMode"
                  v-model="userProfile.name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-else class="text-gray-900">{{ userProfile.name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-if="editMode"
                  v-model="userProfile.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-else class="text-gray-900">{{ userProfile.email }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Membre depuis</label>
                <p class="text-gray-900">{{ formatDate(userProfile.created_at) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dernière connexion</label>
                <p class="text-gray-900">{{ formatDate(userProfile.last_login) }}</p>
              </div>
            </div>

            <!-- Barre d'XP -->
            <div class="mt-6">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>Niveau {{ userProfile.level }}</span>
                <span>{{ userProfile.current_xp }}/{{ userProfile.next_level_xp }} XP</span>
              </div>
              <div class="xp-bar">
                <div
                  class="xp-bar-fill"
                  :style="{ width: getXPProgress() + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ userProfile.next_level_xp - userProfile.current_xp }} XP pour le niveau {{ userProfile.level + 1 }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Préférences -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">⚙️ Préférences</h3>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Monnaie</label>
              <select
                v-model="userProfile.currency"
                :disabled="!editMode"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar ($)</option>
                <option value="GBP">Livre (£)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Langue</label>
              <select
                v-model="userProfile.language"
                :disabled="!editMode"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          <!-- Options gaming -->
          <div class="border-t border-gray-200 pt-4">
            <h4 class="font-medium text-gray-900 mb-3">🎮 Options Gaming</h4>

            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="userProfile.gaming_notifications"
                  :disabled="!editMode"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span class="ml-2 text-sm text-gray-900">Notifications de succès</span>
              </label>

              <label class="flex items-center">
                <input
                  v-model="userProfile.leaderboard_visible"
                  :disabled="!editMode"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span class="ml-2 text-sm text-gray-900">Visible dans les classements</span>
              </label>

              <label class="flex items-center">
                <input
                  v-model="userProfile.challenge_invitations"
                  :disabled="!editMode"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span class="ml-2 text-sm text-gray-900">Invitations aux défis</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques Gaming -->
    <div v-if="activeTab === 'gaming'" class="space-y-6">
      <!-- Résumé gaming -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="stat-card p-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ gamingStats.level }}</div>
            <div class="text-sm text-gray-600">Niveau actuel</div>
          </div>
        </div>

        <div class="stat-card p-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ gamingStats.totalXP }}</div>
            <div class="text-sm text-gray-600">XP Total</div>
          </div>
        </div>

        <div class="stat-card p-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{{ gamingStats.achievements }}</div>
            <div class="text-sm text-gray-600">Succès débloqués</div>
          </div>
        </div>

        <div class="stat-card p-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600">{{ gamingStats.streaks }}</div>
            <div class="text-sm text-gray-600">Série actuelle</div>
          </div>
        </div>
      </div>

      <!-- Progression détaillée -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">📈 Progression détaillée</h3>

        <div class="space-y-6">
          <!-- Graphique XP par mois -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">XP gagnés par mois</h4>
            <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p class="text-gray-500">Graphique XP - TODO: Intégrer Chart.js</p>
            </div>
          </div>

          <!-- Répartition des activités -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-gray-900 mb-3">Répartition des sources XP</h4>
              <div class="space-y-2">
                <div v-for="source in xpSources" :key="source.name" class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">{{ source.name }}</span>
                  <span class="text-sm font-medium text-gray-900">{{ source.xp }} XP</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-medium text-gray-900 mb-3">Activité récente</h4>
              <div class="space-y-2">
                <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center gap-3 text-sm">
                  <span class="text-lg">{{ activity.icon }}</span>
                  <span class="flex-1 text-gray-900">{{ activity.description }}</span>
                  <span class="text-green-600 font-medium">+{{ activity.xp }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Classement personnel -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">🏆 Votre classement</h3>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <div class="text-2xl font-bold text-yellow-600 mb-1">#{{ rankings.global }}</div>
            <div class="text-sm text-yellow-800">Classement global</div>
          </div>

          <div class="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div class="text-2xl font-bold text-blue-600 mb-1">#{{ rankings.monthly }}</div>
            <div class="text-sm text-blue-800">Ce mois-ci</div>
          </div>

          <div class="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <div class="text-2xl font-bold text-green-600 mb-1">#{{ rankings.weekly }}</div>
            <div class="text-sm text-green-800">Cette semaine</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Historique -->
    <div v-if="activeTab === 'history'" class="space-y-6">
      <!-- Filtres -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 Filtres</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type d'activité</label>
            <select v-model="historyFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">Toutes</option>
              <option value="xp">Gains XP</option>
              <option value="achievements">Succès</option>
              <option value="challenges">Défis</option>
              <option value="levels">Niveaux</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date début</label>
            <input
              v-model="historyDateFrom"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
            <input
              v-model="historyDateTo"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Timeline d'historique -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">📜 Historique des activités</h3>

        <div class="space-y-4">
          <div
            v-for="event in filteredHistory"
            :key="event.id"
            class="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 smooth-transition"
          >
            <div class="flex-shrink-0">
              <span class="text-2xl">{{ event.icon }}</span>
            </div>

            <div class="flex-1">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">{{ event.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ event.description }}</p>
                </div>

                <div class="text-right">
                  <div v-if="event.xp" class="text-green-600 font-medium text-sm">+{{ event.xp }} XP</div>
                  <div class="text-xs text-gray-500">{{ formatDate(event.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="history.length > 10" class="mt-6 text-center">
          <button class="gaming-button">
            Charger plus d'historique
          </button>
        </div>
      </div>
    </div>

    <!-- Sécurité -->
    <div v-if="activeTab === 'security'" class="space-y-6">
      <!-- Changement de mot de passe -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">🔐 Sécurité</h3>

        <div class="space-y-6">
          <div>
            <h4 class="font-medium text-gray-900 mb-4">Changer le mot de passe</h4>

            <div class="space-y-4 max-w-md">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                <input
                  v-model="passwordForm.current"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input
                  v-model="passwordForm.new"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  v-model="passwordForm.confirm"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                @click="changePassword"
                :disabled="!canChangePassword"
                class="gaming-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔐 Changer le mot de passe
              </button>
            </div>
          </div>

          <!-- Sessions actives -->
          <div class="border-t border-gray-200 pt-6">
            <h4 class="font-medium text-gray-900 mb-4">Sessions actives</h4>

            <div class="space-y-3">
              <div v-for="session in activeSessions" :key="session.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ session.device }}</p>
                  <p class="text-xs text-gray-500">{{ session.location }} • {{ session.last_activity }}</p>
                </div>

                <button
                  v-if="!session.current"
                  @click="revokeSession(session.id)"
                  class="text-xs text-red-600 hover:text-red-800"
                >
                  Révoquer
                </button>
                <span v-else class="text-xs text-green-600 font-medium">Session actuelle</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

// State
const route = useRoute()
const toast = useToast()

const editMode = ref(false)
const activeTab = ref('profile')
const historyFilter = ref('all')
const historyDateFrom = ref('')
const historyDateTo = ref('')

const userProfile = ref({
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null,
  level: 5,
  current_xp: 1250,
  next_level_xp: 2000,
  total_xp: 8750,
  currency: 'EUR',
  language: 'fr',
  gaming_notifications: true,
  leaderboard_visible: true,
  challenge_invitations: true,
  created_at: '2023-06-15',
  last_login: '2024-01-15'
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

// Mock data
const gamingStats = ref({
  level: 5,
  totalXP: 8750,
  achievements: 23,
  streaks: 12
})

const rankings = ref({
  global: 456,
  monthly: 23,
  weekly: 8
})

const xpSources = ref([
  { name: 'Transactions', xp: 3200 },
  { name: 'Objectifs atteints', xp: 2800 },
  { name: 'Défis complétés', xp: 1750 },
  { name: 'Succès débloqués', xp: 1000 }
])

const recentActivity = ref([
  { id: 1, icon: '🏆', description: 'Succès "Épargnant" débloqué', xp: 50 },
  { id: 2, icon: '💰', description: 'Transaction enregistrée', xp: 5 },
  { id: 3, icon: '🎯', description: 'Objectif "Vacances" complété', xp: 100 }
])

const history = ref([
  {
    id: 1,
    type: 'achievement',
    icon: '🏆',
    title: 'Succès débloqué',
    description: 'Vous avez débloqué le succès "Épargnant"',
    xp: 50,
    created_at: '2024-01-15'
  },
  {
    id: 2,
    type: 'level',
    icon: '⬆️',
    title: 'Niveau supérieur',
    description: 'Félicitations ! Vous êtes passé niveau 5',
    xp: 0,
    created_at: '2024-01-10'
  }
])

const activeSessions = ref([
  {
    id: 1,
    device: 'Chrome sur Windows',
    location: 'Paris, France',
    last_activity: 'Il y a 5 minutes',
    current: true
  },
  {
    id: 2,
    device: 'Safari sur iPhone',
    location: 'Paris, France',
    last_activity: 'Il y a 2 heures',
    current: false
  }
])

// Computed
const isDevelopment = computed(() => import.meta.env.DEV)

const tabs = [
  { value: 'profile', label: 'Profil', icon: '👤' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'history', label: 'Historique', icon: '📜' },
  { value: 'security', label: 'Sécurité', icon: '🔐' }
]

const filteredHistory = computed(() => {
  let filtered = history.value

  if (historyFilter.value !== 'all') {
    filtered = filtered.filter(h => h.type === historyFilter.value)
  }

  if (historyDateFrom.value) {
    filtered = filtered.filter(h => h.created_at >= historyDateFrom.value)
  }

  if (historyDateTo.value) {
    filtered = filtered.filter(h => h.created_at <= historyDateTo.value)
  }

  return filtered
})

const canChangePassword = computed(() => {
  return passwordForm.value.current &&
    passwordForm.value.new &&
    passwordForm.value.confirm &&
    passwordForm.value.new === passwordForm.value.confirm
})

// Methods
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function getXPProgress() {
  const currentLevelXP = userProfile.value.current_xp % 1000 // Approximation
  const nextLevelXP = 1000 // Approximation
  return Math.round((currentLevelXP / nextLevelXP) * 100)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

async function changePassword() {
  try {
    // TODO: Appeler l'API pour changer le mot de passe
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('Mot de passe mis à jour avec succès')

    // Réinitialiser le formulaire
    passwordForm.value = {
      current: '',
      new: '',
      confirm: ''
    }
  } catch (error) {
    toast.error('Erreur lors du changement de mot de passe')
  }
}

async function revokeSession(sessionId) {
  try {
    // TODO: Appeler l'API pour révoquer la session
    await new Promise(resolve => setTimeout(resolve, 1000))

    activeSessions.value = activeSessions.value.filter(s => s.id !== sessionId)
    toast.success('Session révoquée')
  } catch (error) {
    toast.error('Erreur lors de la révocation de la session')
  }
}

// Lifecycle
onMounted(() => {
  // Charger les données du profil
})
</script>

<style scoped>
/* Animations pour l'avatar */
.level-badge {
  animation: levelBadgePulse 2s ease-in-out infinite;
}

@keyframes levelBadgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
