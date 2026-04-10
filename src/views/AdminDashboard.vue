<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">🛡️ Dashboard Admin</h1>
      <p class="text-gray-600 mt-2">Vue d'ensemble de CoinQuest</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Utilisateurs"
          :value="stats.users?.total_users || 0"
          :subtitle="`${stats.users?.active_users_7d || 0} actifs (7j)`"
          icon="👥"
          color="blue"
        />
        <StatsCard
          title="Transactions"
          :value="stats.financial?.total_transactions || 0"
          :subtitle="`Volume: ${stats.financial?.total_volume || 0}€`"
          icon="💳"
          color="green"
        />
        <StatsCard
          title="Objectifs"
          :value="stats.financial?.total_goals || 0"
          :subtitle="`${stats.financial?.completed_goals || 0} complétés`"
          icon="🎯"
          color="purple"
        />
        <StatsCard
          title="XP Total"
          :value="formatNumber(Number(stats.gaming?.total_xp_distributed || 0))"
          :subtitle="`Niveau moyen: ${stats.users?.avg_level || 1}`"
          icon="⭐"
          color="yellow"
        />
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Nouveaux (7j)"
          :value="stats.users?.new_users_7d || 0"
          icon="🆕"
          color="teal"
          small
        />
        <StatsCard
          title="Insights"
          :value="stats.insights?.total || 0"
          :subtitle="`${stats.insights?.unread || 0} non lus`"
          icon="💡"
          color="orange"
          small
        />
        <StatsCard
          title="Achievements"
          :value="stats.gaming?.total_achievements || 0"
          icon="🏆"
          color="amber"
          small
        />
        <StatsCard
          title="Streaks actifs"
          :value="stats.gaming?.active_streaks || 0"
          icon="🔥"
          color="red"
          small
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Users List -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">👥 Utilisateurs</h2>
            <input
              v-model="userSearch"
              type="text"
              placeholder="Rechercher..."
              class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              @input="debouncedSearchUsers"
            />
          </div>

          <div v-if="usersLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>

          <div v-else class="space-y-3 max-h-96 overflow-y-auto">
            <div
              v-for="user in users"
              :key="user.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  :class="user.is_admin ? 'bg-purple-500' : 'bg-blue-500'"
                >
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-medium text-gray-900 flex items-center gap-2">
                    {{ user.name }}
                    <span
                      v-if="user.is_admin"
                      class="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full"
                      >Admin</span
                    >
                  </div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
              <div class="text-right">
                <!-- ✅ FIX: level est un objet {level, total_xp...}, on accède à .level -->
                <div class="text-sm font-medium text-gray-900">
                  Niv. {{ user.level?.level || '-' }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatNumber(user.level?.total_xp || 0) }} XP
                </div>
              </div>
            </div>
          </div>

          <div v-if="usersPagination.last_page > 1" class="flex justify-center gap-2 mt-4">
            <button
              @click="loadUsers(usersPagination.current_page - 1)"
              :disabled="usersPagination.current_page === 1"
              class="px-3 py-1 text-sm bg-gray-100 rounded-lg disabled:opacity-50"
            >
              ←
            </button>
            <span class="px-3 py-1 text-sm"
              >{{ usersPagination.current_page }} / {{ usersPagination.last_page }}</span
            >
            <button
              @click="loadUsers(usersPagination.current_page + 1)"
              :disabled="usersPagination.current_page === usersPagination.last_page"
              class="px-3 py-1 text-sm bg-gray-100 rounded-lg disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>

        <!-- Activity Logs -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">📋 Activité récente</h2>

          <div v-if="logsLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>

          <div v-else class="space-y-3 max-h-96 overflow-y-auto">
            <div
              v-for="(log, index) in activityLogs"
              :key="index"
              class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                :class="getLogColor(log.type)"
              >
                {{ getLogIcon(log.type) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">{{ log.action }}</div>
                <div class="text-xs text-gray-500">
                  {{ log.user }} • {{ formatTimeAgo(log.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Broadcast Notification -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">📢 Envoyer une notification</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
              v-model="notification.title"
              type="text"
              placeholder="Titre de la notification"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              v-model="notification.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="info">Info</option>
              <option value="success">Succès</option>
              <option value="warning">Attention</option>
              <option value="error">Erreur</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              v-model="notification.message"
              rows="3"
              placeholder="Contenu du message..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div class="md:col-span-2">
            <button
              @click="sendNotification"
              :disabled="!notification.title || !notification.message || sendingNotification"
              class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="sendingNotification">Envoi en cours...</span>
              <span v-else>📤 Envoyer à tous les utilisateurs</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useApi } from '@/composables/core/useApi'
import StatsCard from '@/components/admin/StatsCard.vue'

const { get, post } = useApi()

const loading = ref(true)
const usersLoading = ref(false)
const logsLoading = ref(false)
const sendingNotification = ref(false)

const stats = ref<any>({})
const users = ref<any[]>([])
const userSearch = ref('')
const usersPagination = ref({ current_page: 1, last_page: 1 })
const activityLogs = ref<any[]>([])

const notification = reactive({ title: '', message: '', type: 'info' })

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return Number(num).toLocaleString('fr-FR')
}

function formatTimeAgo(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins}min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR')
}

function getLogIcon(type: string): string {
  return (
    ({ transaction: '💳', goal: '🎯', achievement: '🏆', user: '👤' } as Record<string, string>)[
      type
    ] || '📝'
  )
}

function getLogColor(type: string): string {
  return (
    (
      {
        transaction: 'bg-green-500',
        goal: 'bg-purple-500',
        achievement: 'bg-yellow-500',
        user: 'bg-blue-500',
      } as Record<string, string>
    )[type] || 'bg-gray-500'
  )
}

let searchTimeout: ReturnType<typeof setTimeout>
function debouncedSearchUsers(): void {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadUsers(1), 300)
}

async function loadDashboard(): Promise<void> {
  loading.value = true
  try {
    const response = await get<any>('/admin/dashboard')
    if (response.success && response.data) stats.value = response.data
  } catch (error) {
    console.error('Erreur chargement dashboard:', error)
  } finally {
    loading.value = false
  }
}

async function loadUsers(page = 1): Promise<void> {
  usersLoading.value = true
  try {
    const response = await get<any>('/admin/users', {
      params: { page, per_page: 10, search: userSearch.value || undefined },
    })
    if (response.success && response.data) {
      users.value = response.data.data || []
      usersPagination.value = {
        current_page: response.data.current_page || 1,
        last_page: response.data.last_page || 1,
      }
    }
  } catch (error) {
    console.error('Erreur chargement users:', error)
  } finally {
    usersLoading.value = false
  }
}

async function loadActivityLogs(): Promise<void> {
  logsLoading.value = true
  try {
    const response = await get<any[]>('/admin/activity-logs', { params: { limit: 20 } })
    if (response.success && response.data) activityLogs.value = response.data
  } catch (error) {
    console.error('Erreur chargement logs:', error)
  } finally {
    logsLoading.value = false
  }
}

async function sendNotification(): Promise<void> {
  if (!notification.title || !notification.message) return
  sendingNotification.value = true
  try {
    const response = await post<any>('/admin/broadcast-notification', { ...notification })
    if (response.success) {
      alert(`✅ ${response.message}`)
      notification.title = ''
      notification.message = ''
      notification.type = 'info'
    }
  } catch (error) {
    alert("❌ Erreur lors de l'envoi")
  } finally {
    sendingNotification.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadDashboard(), loadUsers(), loadActivityLogs()])
})
</script>
