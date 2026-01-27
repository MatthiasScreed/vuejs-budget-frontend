<template>
  <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
    <!-- En-tête avec infos principales -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <!-- Icône banque -->
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
          <span class="text-white text-xl font-bold">{{ getBankInitials(connection.bank_name) }}</span>
        </div>

        <!-- Infos connexion -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ connection.bank_name }}</h3>
          <div class="flex items-center mt-1">
            <span
              :class="getStatusClass(connection.status)"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            >
              {{ getStatusText(connection.status) }}
            </span>
            <span class="ml-3 text-sm text-gray-500">
              {{ connection.transactions_count }} transactions
            </span>
          </div>
        </div>
      </div>

      <!-- Menu actions -->
      <div class="relative">
        <button
          @click="showOptionsMenu = !showOptionsMenu"
          class="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </button>

        <div
          v-if="showOptionsMenu"
          class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
        >
          <div class="py-1">
            <button
              @click="$emit('sync', connection.id)"
              :disabled="syncing"
              class="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ syncing ? 'Synchronisation...' : 'Synchroniser' }}
            </button>

            <button
              @click="$emit('configure', connection)"
              class="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Configurer
            </button>

            <button
              @click="$emit('viewTransactions', connection)"
              class="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Voir transactions
            </button>

            <div class="border-t border-gray-100"></div>

            <button
              @click="$emit('delete', connection)"
              class="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Détails de connexion -->
    <div class="space-y-3 mb-4">
      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Dernière sync : {{ formatDate(connection.last_sync) }}</span>
      </div>

      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
        <span>Provider : {{ connection.provider }}</span>
      </div>

      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Sync auto : {{ connection.auto_sync_enabled ? 'Activée' : 'Désactivée' }}</span>
      </div>
    </div>

    <!-- Alertes et actions -->
    <div v-if="connection.needs_sync" class="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
        </svg>
        <span class="text-sm text-yellow-800">
          Synchronisation recommandée - {{ getTimeSinceSync(connection.last_sync) }}
        </span>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="flex space-x-3">
      <button
        @click="$emit('sync', connection.id)"
        :disabled="syncing || connection.status !== 'active'"
        class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span v-if="syncing">Synchronisation...</span>
        <span v-else>Synchroniser</span>
      </button>

      <button
        @click="$emit('viewTransactions', connection)"
        class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        Transactions
      </button>
    </div>

    <!-- Métriques gaming -->
    <div v-if="connection.xp_earned" class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">XP gagné avec ce compte :</span>
        <span class="font-semibold text-blue-600">+{{ connection.xp_earned }} XP</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { BankConnection } from '@/services/BankService'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  connection: BankConnection
  syncing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  syncing: false
})

const emit = defineEmits<{
  sync: [connectionId: string]
  configure: [connection: BankConnection]
  viewTransactions: [connection: BankConnection]
  delete: [connection: BankConnection]
}>()

// ==========================================
// STATE
// ==========================================

const showOptionsMenu = ref(false)

// ==========================================
// METHODS
// ==========================================

/**
 * Obtenir les initiales de la banque
 */
const getBankInitials = (bankName: string): string => {
  return bankName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Classes CSS pour le statut
 */
const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    'active': 'bg-green-100 text-green-800',
    'expired': 'bg-red-100 text-red-800',
    'error': 'bg-red-100 text-red-800',
    'disabled': 'bg-gray-100 text-gray-800',
    'pending': 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Texte du statut
 */
const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    'active': '✅ Actif',
    'expired': '⏰ Expiré',
    'error': '⚠️ Erreur',
    'disabled': '⸴ Désactivé',
    'pending': '🔄 En cours'
  }
  return texts[status] || status
}

/**
 * Formater une date
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Jamais'

  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Temps depuis la dernière sync
 */
const getTimeSinceSync = (dateString: string | null): string => {
  if (!dateString) return 'jamais synchronisé'

  const now = new Date()
  const syncDate = new Date(dateString)
  const hours = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60 * 60))

  if (hours < 1) return 'il y a moins d\'1h'
  if (hours < 24) return `il y a ${hours}h`

  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Fermer le menu si on clique ailleurs
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showOptionsMenu.value = false
  }
})
</script>

<style scoped>
/* Transitions pour les animations */
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.transition-shadow {
  transition: box-shadow 0.2s ease;
}
</style>
