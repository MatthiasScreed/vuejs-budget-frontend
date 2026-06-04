<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header compact mobile -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">👤 Profil</h1>
      <button
        @click="editMode ? saveProfile() : (editMode = true)"
        class="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
        :class="
          editMode ? 'bg-green-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        "
      >
        {{ editMode ? '💾 Enregistrer' : '✏️ Modifier' }}
      </button>
    </div>

    <!-- Onglets scroll horizontal mobile -->
    <div class="mb-6 overflow-x-auto">
      <nav class="flex gap-1 bg-gray-100 rounded-lg p-1 min-w-max">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all"
          :class="activeTab === tab.value ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- ===== PROFIL ===== -->
    <div v-if="activeTab === 'profile'" class="space-y-4">
      <!-- Avatar + infos principales -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center gap-4 mb-5">
          <div class="relative flex-shrink-0">
            <div
              class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            >
              {{ getInitials(authStore.user?.name ?? '?') }}
            </div>
            <div
              class="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold"
            >
              {{ userLevel }}
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div v-if="editMode">
              <input
                v-model="editForm.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Nom"
              />
            </div>
            <p v-else class="font-bold text-gray-900 text-lg truncate">
              {{ authStore.user?.name }}
            </p>
            <p class="text-gray-500 text-sm truncate">{{ authStore.user?.email }}</p>
            <p class="text-xs text-gray-400 mt-1">
              Membre depuis {{ formatDate(authStore.user?.created_at) }}
            </p>
          </div>
        </div>

        <!-- XP Progress -->
        <div>
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>Niveau {{ userLevel }}</span>
            <span>{{ userXP }} / {{ userNextXP }} XP</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
              :style="{ width: xpProgress + '%' }"
            />
          </div>
          <p class="text-xs text-gray-400 mt-1">
            {{ userNextXP - userXP }} XP pour le niveau {{ userLevel + 1 }}
          </p>
        </div>
      </div>

      <!-- Préférences -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="font-semibold text-gray-900 mb-4">⚙️ Préférences</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Monnaie</label>
            <select
              v-if="editMode"
              v-model="editForm.currency"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
              <option value="GBP">Livre (£)</option>
            </select>
            <p v-else class="text-sm text-gray-900">{{ authStore.user?.currency ?? 'EUR' }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Langue</label>
            <select
              v-if="editMode"
              v-model="editForm.language"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
            <p v-else class="text-sm text-gray-900">
              {{ authStore.user?.language === 'en' ? 'English' : 'Français' }}
            </p>
          </div>
        </div>

        <div v-if="editMode" class="mt-4">
          <button
            @click="saveProfile"
            :disabled="saving"
            class="w-full py-3 bg-green-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50"
          >
            {{ saving ? 'Enregistrement...' : '💾 Sauvegarder les modifications' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== GAMING ===== -->
    <div v-if="activeTab === 'gaming'" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-blue-50 rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ userLevel }}</div>
          <div class="text-xs text-gray-500 mt-1">Niveau</div>
        </div>
        <div class="bg-purple-50 rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ userTotalXP }}</div>
          <div class="text-xs text-gray-500 mt-1">XP Total</div>
        </div>
        <div class="bg-yellow-50 rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ achievementsCount }}</div>
          <div class="text-xs text-gray-500 mt-1">Succès</div>
        </div>
        <div class="bg-orange-50 rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-orange-600">{{ currentStreak }}</div>
          <div class="text-xs text-gray-500 mt-1">🔥 Série</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="font-semibold text-gray-900 mb-3">🏆 Succès récents</h3>
        <div v-if="recentAchievements.length > 0" class="space-y-2">
          <div
            v-for="ach in recentAchievements"
            :key="ach.id"
            class="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
          >
            <span class="text-xl">🏆</span>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 text-sm truncate">{{ ach.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ ach.description }}</p>
            </div>
            <span class="text-xs font-bold text-yellow-600 flex-shrink-0"
              >+{{ ach.points }} XP</span
            >
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm">Aucun succès débloqué pour l'instant.</p>
      </div>
    </div>

    <!-- ===== HISTORIQUE ===== -->
    <div v-if="activeTab === 'history'">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-gray-500 text-sm">Disponible prochainement.</p>
      </div>
    </div>

    <!-- ===== SÉCURITÉ ===== -->
    <div v-if="activeTab === 'security'" class="space-y-4">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="font-semibold text-gray-900 mb-4">🔐 Changer le mot de passe</h3>
        <div class="space-y-3">
          <input
            v-model="passwordForm.current"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Mot de passe actuel"
          />
          <input
            v-model="passwordForm.new"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Nouveau mot de passe"
          />
          <input
            v-model="passwordForm.confirm"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="Confirmer le nouveau mot de passe"
          />
          <p v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</p>
          <button
            @click="changePassword"
            :disabled="!canChangePassword || changingPassword"
            class="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50"
          >
            {{ changingPassword ? '...' : '🔐 Changer le mot de passe' }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-red-200 p-5">
        <h3 class="font-semibold text-red-600 mb-2">⚠️ Zone dangereuse</h3>
        <button
          @click="logout"
          class="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium"
        >
          Se déconnecter
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

const authStore = useAuthStore()
const gamingStore = useGamingStore()
const toastStore = useToastStore()
const router = useRouter()

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

const achievementsCount = computed(() => gamingStore.achievements?.length ?? 0)

const recentAchievements = computed(() => (gamingStore.unlockedAchievements ?? []).slice(0, 5))

const canChangePassword = computed(
  () =>
    passwordForm.value.current &&
    passwordForm.value.new &&
    passwordForm.value.confirm &&
    passwordForm.value.new === passwordForm.value.confirm &&
    passwordForm.value.new.length >= 8,
)

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
      toastStore.error(result.message ?? 'Erreur')
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
    toastStore.success('Mot de passe modifié')
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (e: any) {
    passwordError.value = e.response?.data?.message ?? 'Erreur'
  } finally {
    changingPassword.value = false
  }
}

async function logout(): Promise<void> {
  await authStore.logout()
  router.push({ name: 'Login' })
}

onMounted(async () => {
  await authStore.loadUser?.()
  editForm.value = {
    name: authStore.user?.name ?? '',
    currency: authStore.user?.currency ?? 'EUR',
    language: authStore.user?.language ?? 'fr',
  }
  if (!gamingStore.isInitialized) await gamingStore.initializeGaming()
})
</script>
