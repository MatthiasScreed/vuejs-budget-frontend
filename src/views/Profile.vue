<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">👤 Profil</h1>
          <p class="text-gray-600 mt-2">Gérez votre profil et consultez vos statistiques</p>
        </div>
        <button @click="editMode = !editMode" class="gaming-button">
          {{ editMode ? '💾 Sauvegarder' : '✏️ Modifier' }}
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
          class="flex-1 px-4 py-2 text-sm font-medium rounded-md smooth-transition"
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

    <!-- ===== PROFIL ===== -->
    <div v-if="activeTab === 'profile'" class="space-y-6">
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">👤 Informations personnelles</h3>

        <div class="flex items-start gap-8">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div class="relative">
              <div
                class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              >
                {{ getInitials(authStore.user?.name ?? '?') }}
              </div>
              <div class="absolute -bottom-2 -right-2">
                <div
                  class="level-badge w-8 h-8 text-xs flex items-center justify-center bg-yellow-400 text-white rounded-full font-bold"
                >
                  {{ userLevel }}
                </div>
              </div>
            </div>
          </div>

          <!-- Infos -->
          <div class="flex-1 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  v-if="editMode"
                  v-model="editForm.name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p v-else class="text-gray-900 font-medium">{{ authStore.user?.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p class="text-gray-900">{{ authStore.user?.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Membre depuis</label>
                <p class="text-gray-900">{{ formatDate(authStore.user?.created_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Dernière connexion</label
                >
                <p class="text-gray-900">
                  {{ formatDate(authStore.user?.last_login_at ?? authStore.user?.updated_at) }}
                </p>
              </div>
            </div>

            <!-- XP Progress -->
            <div>
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Niveau {{ userLevel }}</span>
                <span>{{ userXP }} / {{ userNextXP }} XP</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                  :style="{ width: xpProgress + '%' }"
                />
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ userNextXP - userXP }} XP pour le niveau {{ userLevel + 1 }}
              </p>
            </div>

            <!-- Bouton sauvegarder -->
            <div v-if="editMode">
              <button
                @click="saveProfile"
                :disabled="saving"
                class="gaming-button disabled:opacity-50"
              >
                {{ saving ? 'Sauvegarde...' : '💾 Enregistrer les modifications' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Préférences -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">⚙️ Préférences</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Monnaie</label>
            <select
              v-if="editMode"
              v-model="editForm.currency"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
              <option value="GBP">Livre (£)</option>
            </select>
            <p v-else class="text-gray-900">{{ authStore.user?.currency ?? 'EUR' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Langue</label>
            <select
              v-if="editMode"
              v-model="editForm.language"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
            <p v-else class="text-gray-900">
              {{ authStore.user?.language === 'en' ? 'English' : 'Français' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== GAMING ===== -->
    <div v-if="activeTab === 'gaming'" class="space-y-6">
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">🎮 Statistiques Gaming</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ userLevel }}</div>
            <div class="text-sm text-gray-600">Niveau</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ userTotalXP }}</div>
            <div class="text-sm text-gray-600">XP Total</div>
          </div>
          <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">
              {{ gamingStore.achievements?.length ?? 0 }}
            </div>
            <div class="text-sm text-gray-600">Succès</div>
          </div>
          <div class="text-center p-4 bg-orange-50 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">{{ currentStreak }}</div>
            <div class="text-sm text-gray-600">🔥 Série</div>
          </div>
        </div>
      </div>

      <!-- Succès récents -->
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🏆 Succès récents</h3>
        <div v-if="gamingStore.unlockedAchievements?.length > 0" class="space-y-3">
          <div
            v-for="ach in gamingStore.unlockedAchievements.slice(0, 5)"
            :key="ach.id"
            class="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
          >
            <span class="text-2xl">🏆</span>
            <div>
              <p class="font-medium text-gray-900">{{ ach.name }}</p>
              <p class="text-sm text-gray-500">{{ ach.description }}</p>
            </div>
            <span class="ml-auto text-sm font-bold text-yellow-600">+{{ ach.points }} XP</span>
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm">Aucun succès débloqué pour l'instant.</p>
      </div>
    </div>

    <!-- ===== HISTORIQUE ===== -->
    <div v-if="activeTab === 'history'" class="space-y-6">
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📜 Historique d'activité</h3>
        <p class="text-gray-500 text-sm">Fonctionnalité disponible prochainement.</p>
      </div>
    </div>

    <!-- ===== SÉCURITÉ ===== -->
    <div v-if="activeTab === 'security'" class="space-y-6">
      <div class="gaming-card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">🔐 Changer le mot de passe</h3>
        <div class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input
              v-model="passwordForm.current"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input
              v-model="passwordForm.new"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Confirmer le nouveau mot de passe</label
            >
            <input
              v-model="passwordForm.confirm"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</div>

          <button
            @click="changePassword"
            :disabled="!canChangePassword || changingPassword"
            class="gaming-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ changingPassword ? '...' : '🔐 Changer le mot de passe' }}
          </button>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="gaming-card border border-red-200">
        <h3 class="text-lg font-semibold text-red-600 mb-2">⚠️ Zone dangereuse</h3>
        <p class="text-gray-600 text-sm mb-4">Ces actions sont irréversibles.</p>
        <button
          @click="logout"
          class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Se déconnecter de tous les appareils
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useGamingStore } from '@/stores/gamingStore'
import { useToastStore } from '@/stores/toastStore'
import { api } from '@/services/api'

// ==========================================
// STORES
// ==========================================

const authStore = useAuthStore()
const gamingStore = useGamingStore()
const toastStore = useToastStore()
const router = useRouter()

// ==========================================
// STATE
// ==========================================

const editMode = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const passwordError = ref('')
const activeTab = ref('profile')

const editForm = ref({
  name: authStore.user?.name ?? '',
  currency: authStore.user?.currency ?? 'EUR',
  language: authStore.user?.language ?? 'fr',
})

const passwordForm = ref({ current: '', new: '', confirm: '' })

const tabs = [
  { value: 'profile', label: 'Profil', icon: '👤' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'history', label: 'Historique', icon: '📜' },
  { value: 'security', label: 'Sécurité', icon: '🔐' },
]

// ==========================================
// COMPUTED — données réelles
// ==========================================

const userLevel = computed(
  () => gamingStore.currentLevel?.level ?? authStore.user?.level?.level ?? 1,
)

const userXP = computed(() => gamingStore.totalXP ?? authStore.user?.level?.current_level_xp ?? 0)

const userTotalXP = computed(() => gamingStore.totalXP ?? authStore.user?.level?.total_xp ?? 0)

const userNextXP = computed(
  () => gamingStore.currentLevel?.max_xp ?? authStore.user?.level?.next_level_xp ?? 200,
)

const xpProgress = computed(() => {
  const minXP = gamingStore.currentLevel?.min_xp ?? 0
  const cur = userXP.value - minXP
  const max = userNextXP.value - minXP || 200
  return Math.min(100, Math.round((cur / max) * 100))
})

const currentStreak = computed(() => {
  const streaks = Array.isArray(gamingStore.streaks) ? gamingStore.streaks : []
  return streaks.find((s: any) => s.type === 'daily')?.current_count ?? 0
})

const canChangePassword = computed(
  () =>
    passwordForm.value.current &&
    passwordForm.value.new &&
    passwordForm.value.confirm &&
    passwordForm.value.new === passwordForm.value.confirm &&
    passwordForm.value.new.length >= 8,
)

// ==========================================
// MÉTHODES
// ==========================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function saveProfile(): Promise<void> {
  saving.value = true
  try {
    const result = await authStore.updateProfile(editForm.value)
    if (result.success) {
      toastStore.success('Profil mis à jour')
      editMode.value = false
    } else {
      toastStore.error(result.message ?? 'Erreur lors de la mise à jour')
    }
  } catch {
    toastStore.error('Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

async function changePassword(): Promise<void> {
  passwordError.value = ''
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordError.value = 'Les mots de passe ne correspondent pas'
    return
  }

  changingPassword.value = true
  try {
    await api.put('/auth/password', {
      current_password: passwordForm.value.current,
      new_password: passwordForm.value.new,
      new_password_confirmation: passwordForm.value.confirm,
    })
    toastStore.success('Mot de passe modifié avec succès')
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (e: any) {
    passwordError.value = e.response?.data?.message ?? 'Erreur lors du changement de mot de passe'
  } finally {
    changingPassword.value = false
  }
}

async function logout(): Promise<void> {
  await authStore.logout()
  router.push({ name: 'Login' })
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Rafraîchir les données utilisateur
  await authStore.loadUser?.()

  // Sync form avec les vraies données
  editForm.value = {
    name: authStore.user?.name ?? '',
    currency: authStore.user?.currency ?? 'EUR',
    language: authStore.user?.language ?? 'fr',
  }

  // Charger gaming si pas encore fait
  if (!gamingStore.isInitialized) {
    await gamingStore.initializeGaming()
  }
})
</script>

<style scoped>
.level-badge {
  animation: levelBadgePulse 2s ease-in-out infinite;
}

@keyframes levelBadgePulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
