<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 flex items-center">
        🏦 Connexions Bancaires
        <span class="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {{ connections.length }} connectée{{ connections.length > 1 ? 's' : '' }}
        </span>
      </h1>
      <p class="mt-2 text-gray-600">
        Synchronise automatiquement tes comptes pour une gestion de budget sans effort !
      </p>
    </div>

    <!-- Actions principales -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Ajouter connexion -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h3 class="text-lg font-semibold mb-2">Connecter un compte</h3>
        <p class="text-blue-100 mb-4">Ajoute tes comptes bancaires en toute sécurité</p>
        <button
          @click="showAddConnectionModal = true"
          class="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          + Ajouter un compte
        </button>
      </div>

      <!-- Sync automatique -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          🔄 Synchronisation Auto
        </h3>
        <p class="text-gray-600 mb-4">{{ autoSyncEnabled ? 'Activée' : 'Désactivée' }}</p>
        <button
          @click="toggleAutoSync"
          :class="
            autoSyncEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'
          "
          class="text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {{ autoSyncEnabled ? 'Désactiver' : 'Activer' }}
        </button>
      </div>

      <!-- Transactions en attente -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          ⏳ En attente
          <span
            class="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full"
          >
            {{ pendingTransactions.length }}
          </span>
        </h3>
        <p class="text-gray-600 mb-4">Transactions à catégoriser</p>
        <button
          @click="showPendingTransactions = true"
          class="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          Traiter
        </button>
      </div>
    </div>

    <!-- Liste des connexions -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Mes Comptes Connectés</h2>
      </div>

      <div v-if="loading" class="p-6">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span class="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>

      <div v-else-if="connections.length === 0" class="p-6 text-center">
        <div class="text-gray-400 text-6xl mb-4">🏦</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun compte connecté</h3>
        <p class="text-gray-600 mb-4">
          Connecte tes comptes bancaires pour automatiser ta gestion de budget
        </p>
        <button
          @click="showAddConnectionModal = true"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Connecter mon premier compte
        </button>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="connection in connections"
          :key="connection.id"
          class="p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <!-- Icône banque -->
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span class="text-2xl">🏦</span>
              </div>

              <!-- Infos connexion -->
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ connection.bank_name }}</h3>
                <div class="flex items-center mt-1 space-x-3">
                  <!-- Badge status -->
                  <span
                    :class="getStatusClass(connection.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ getStatusText(connection.status) }}
                  </span>

                  <!-- Badge initialisation -->
                  <span
                    v-if="initializingConnections.has(connection.id)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse"
                  >
                    ⏳ Initialisation...
                  </span>

                  <span class="text-sm text-gray-500">
                    {{ connection.transactions_count || 0 }} transactions
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  Dernière sync : {{ formatDate(connection.last_sync_at) }}
                </p>

                <!-- Message d'erreur si présent -->
                <p
                  v-if="
                    connection.last_error &&
                    (connection.status === 'error' || connection.status === 'expired')
                  "
                  class="text-xs text-red-600 mt-1"
                >
                  {{ connection.last_error }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-3">
              <!-- ✅ Bouton Reconnecter si expiré/erreur -->
              <button
                v-if="needsReconnect(connection)"
                @click="reconnectBank(connection)"
                class="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                :title="'Reconnecter ' + connection.bank_name"
              >
                🔄 Reconnecter
              </button>

              <!-- ✅ Bouton Sync normal -->
              <button
                v-else
                @click="syncConnection(connection.id)"
                :disabled="!canSync(connection) || syncing"
                :title="getSyncButtonTooltip(connection)"
                class="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :class="{ 'animate-pulse': initializingConnections.has(connection.id) }"
              >
                <span v-if="initializingConnections.has(connection.id)">⏳</span>
                <span v-else-if="syncing">🔄</span>
                <span v-else>Synchroniser</span>
              </button>

              <!-- Menu options -->
              <div class="relative">
                <button
                  @click="toggleOptionsMenu(connection.id)"
                  class="text-gray-400 hover:text-gray-600 p-2"
                >
                  ⋮
                </button>

                <div
                  v-if="showOptionsMenu[connection.id]"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                >
                  <div class="py-1">
                    <button
                      @click="deleteConnection(connection)"
                      class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Indicateur de sync needed -->
          <div
            v-if="connection.needs_sync && connection.status === 'active'"
            class="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
          >
            <p class="text-sm text-yellow-800">
              ⚠️ Synchronisation recommandée - Dernière sync il y a
              {{ getTimeSinceSync(connection.last_sync_at) }}
            </p>
          </div>

          <!-- Message expiration -->
          <div
            v-if="connection.status === 'expired'"
            class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <p class="text-sm text-red-800">
              ⏰ Cette connexion a expiré. Clique sur "Reconnecter" pour la réactiver.
            </p>
          </div>

          <!-- Message erreur -->
          <div
            v-if="connection.status === 'error'"
            class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <p class="text-sm text-red-800">
              ❌ Une erreur s'est produite. Essaie de reconnecter ce compte.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal ajout connexion -->
    <div
      v-if="showAddConnectionModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Connecter un compte bancaire</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Choisir un provider</label>
            <select
              v-model="selectedProvider"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="bridge">Bridge API (Recommandé) 🏆</option>
              <option value="budget_insight" disabled>Budget Insight 💰 (Bientôt)</option>
              <option value="nordigen" disabled>Nordigen 🏛️ (Bientôt)</option>
            </select>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-medium text-blue-900 mb-2">🔒 Sécurité garantie</h4>
            <ul class="text-sm text-blue-800 space-y-1">
              <li>• Connexion chiffrée de bout en bout</li>
              <li>• Aucun stockage de tes identifiants</li>
              <li>• Conformité PSD2 et RGPD</li>
              <li>• Révocation possible à tout moment</li>
            </ul>
          </div>

          <!-- Section développement -->
          <div v-if="isDevelopment" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 class="font-medium text-yellow-900 mb-2">🚧 Mode Développement</h4>
            <p class="text-sm text-yellow-800 mb-3">
              Bridge API nécessite des clés valides. Tu peux simuler une connexion pour tester
              l'interface.
            </p>
            <button
              @click="simulateConnection"
              class="w-full px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
            >
              🧪 Simuler une connexion (dev)
            </button>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showAddConnectionModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="initiateConnection"
            :disabled="connecting"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {{ connecting ? 'Connexion...' : 'Connecter' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal transactions en attente -->
    <PendingTransactionsModal
      v-if="showPendingTransactions"
      :transactions="pendingTransactions"
      @close="showPendingTransactions = false"
      @processed="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import PendingTransactionsModal from '@/components/modals/PendingTransactionsModal.vue'
import { bankService } from '@/services/BankService'

// ==========================================
// TYPES
// ==========================================

interface BankConnection {
  id: number
  bank_name: string
  status: 'active' | 'expired' | 'error' | 'disabled' | 'pending'
  transactions_count: number
  last_sync_at: string | null
  needs_sync: boolean
  last_error?: string
}

interface PendingTransaction {
  id: string
  description: string
  amount: number
  date: string
}

// ==========================================
// COMPOSABLES
// ==========================================

const toast = useToast()

// ==========================================
// STATE
// ==========================================

const loading = ref(true)
const connecting = ref(false)
const syncing = ref(false)
const connections = ref<BankConnection[]>([])
const pendingTransactions = ref<PendingTransaction[]>([])

// ✅ NOUVEAU : Connexions en initialisation
const initializingConnections = ref<Set<number>>(new Set())

// Modals
const showAddConnectionModal = ref(false)
const showPendingTransactions = ref(false)
const showOptionsMenu = reactive<Record<number, boolean>>({})

// Form
const selectedProvider = ref('bridge')
const autoSyncEnabled = ref(true)

// ==========================================
// COMPUTED
// ==========================================

const isDevelopment = computed(() => import.meta.env.DEV)

/**
 * ✅ Vérifier si une connexion nécessite une reconnexion
 */
const needsReconnect = (connection: BankConnection): boolean => {
  return connection.status === 'expired' || connection.status === 'error'
}

/**
 * ✅ Vérifier si une connexion peut être synchronisée
 */
const canSync = (connection: BankConnection): boolean => {
  // Pas si expired ou error
  if (needsReconnect(connection)) {
    return false
  }

  // Pas si en initialisation
  if (initializingConnections.value.has(connection.id)) {
    return false
  }

  // Pas si status !== active
  if (connection.status !== 'active') {
    return false
  }

  // Pas si sync récente (< 30 secondes)
  if (connection.last_sync_at) {
    const lastSync = new Date(connection.last_sync_at)
    const secondsAgo = (Date.now() - lastSync.getTime()) / 1000
    if (secondsAgo < 30) {
      return false
    }
  }

  return true
}

/**
 * ✅ Message tooltip pour le bouton sync
 */
const getSyncButtonTooltip = (connection: BankConnection): string => {
  if (connection.status === 'expired') {
    return '🔄 Connexion expirée - Reconnecter'
  }

  if (connection.status === 'error') {
    return '❌ Erreur - Reconnecter'
  }

  if (initializingConnections.value.has(connection.id)) {
    return "⏳ Connexion en cours d'initialisation..."
  }

  if (connection.status !== 'active') {
    return '⚠️ Connexion inactive'
  }

  if (connection.last_sync_at) {
    const lastSync = new Date(connection.last_sync_at)
    const secondsAgo = (Date.now() - lastSync.getTime()) / 1000
    if (secondsAgo < 30) {
      return `⏱️ Dernière sync il y a ${Math.round(secondsAgo)}s`
    }
  }

  return 'Synchroniser maintenant'
}

// ==========================================
// MÉTHODES DE DONNÉES
// ==========================================

/**
 * Charger les connexions bancaires
 */
const loadConnections = async (): Promise<void> => {
  try {
    loading.value = true

    const response = await bankService.getConnections()
    console.log('📊 Connexions:', response)

    if (response.success && Array.isArray(response.data)) {
      connections.value = response.data
    } else {
      connections.value = []
    }
  } catch (error: any) {
    console.error('❌ Erreur connexions:', error)
    toast.error('Erreur lors du chargement')
    connections.value = []
  } finally {
    loading.value = false
  }
}

/**
 * Charger les transactions en attente
 */
const loadPendingTransactions = async (): Promise<void> => {
  try {
    const response = await bankService.getPendingTransactions()

    if (response.success && Array.isArray(response.data)) {
      pendingTransactions.value = response.data
    } else {
      pendingTransactions.value = []
    }
  } catch (error: any) {
    console.error('❌ Erreur pending:', error)
    pendingTransactions.value = []
  }
}

// ==========================================
// ACTIONS BANCAIRES
// ==========================================

/**
 * Simuler une connexion en mode développement
 */
const simulateConnection = async (): Promise<void> => {
  connecting.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockConnection: BankConnection = {
      id: Date.now(),
      bank_name: 'Crédit Agricole (Simulé)',
      status: 'active',
      transactions_count: 42,
      last_sync_at: new Date().toISOString(),
      needs_sync: false,
    }

    connections.value.push(mockConnection)
    showAddConnectionModal.value = false
    toast.success('🧪 Connexion simulée ajoutée !')
  } catch (error: any) {
    console.error('❌ Erreur simulation:', error)
    toast.error('Erreur lors de la simulation')
  } finally {
    connecting.value = false
  }
}

/**
 * ✅ Initier une nouvelle connexion bancaire (Bridge v3 2025)
 */
const initiateConnection = async (): Promise<void> => {
  connecting.value = true

  try {
    console.log('🔗 Initiation connexion bancaire...')

    // ✅ Construire le return_url vers cette page
    const returnUrl = `${window.location.origin}/app/banking`

    const response = await bankService.initiateConnection({
      provider: selectedProvider.value as 'bridge',
      country: 'FR',
      return_url: returnUrl, // ✅ AJOUTER CECI !
    })

    console.log('📡 Réponse:', response)

    if (response.success && response.data?.connect_url) {
      showAddConnectionModal.value = false
      toast.info('🔐 Redirection vers Bridge...')

      // Redirection complète vers Bridge Connect
      window.location.href = response.data.connect_url
    } else {
      throw new Error(response.message || 'Erreur initiation')
    }
  } catch (error: any) {
    console.error('❌ Erreur initiation:', error)
    toast.error(error.message || "Impossible d'initier la connexion")
  } finally {
    connecting.value = false
  }
}

/**
 * ✅ CORRIGÉ : Synchroniser une connexion avec gestion complète des erreurs
 */
const syncConnection = async (connectionId: number): Promise<void> => {
  syncing.value = true

  try {
    const response = await bankService.syncConnection(connectionId)
    console.log('🔄 Sync:', response)

    if (response.success) {
      const imported = response.data?.imported || 0
      const xpGained = response.data?.xp_gained || 0

      toast.success(`✅ ${imported} transactions importées !`)
      if (xpGained > 0) {
        toast.success(`🎮 +${xpGained} XP !`)
      }

      await refreshData()
    } else {
      // ✅ Gérer les cas spécifiques
      const status = response.status

      if (status === 410 || response.data?.reconnect_required) {
        // Gone - Connexion expirée
        toast.error('🔄 ' + (response.message || 'Connexion expirée - Reconnecter'))
        await refreshData()
      } else if (status === 425) {
        // Too Early - En initialisation
        toast.warning('⏳ ' + (response.message || 'Connexion en initialisation'))
        initializingConnections.value.add(connectionId)

        setTimeout(() => {
          initializingConnections.value.delete(connectionId)
        }, 10000)
      } else if (status === 429) {
        // Too Many Requests
        toast.warning('⏱️ ' + (response.message || 'Sync déjà en cours'))
      } else {
        toast.error(response.message || 'Erreur sync')
      }
    }
  } catch (error: any) {
    console.error('❌ Erreur sync:', error)

    const status = error.response?.status
    const data = error.response?.data

    if (status === 410 || data?.reconnect_required) {
      toast.error('🔄 Connexion expirée. Clique sur "Reconnecter".')
      await refreshData()
    } else if (status === 425) {
      toast.warning("⏳ Connexion en cours d'initialisation...")
      initializingConnections.value.add(connectionId)
    } else if (status === 429) {
      toast.warning('⏱️ Une synchronisation est déjà en cours')
    } else {
      toast.error(error.message || 'Impossible de synchroniser')
    }
  } finally {
    syncing.value = false
  }
}

/**
 * ✅ NOUVEAU : Reconnecter une banque expirée
 */
const reconnectBank = async (connection: BankConnection): Promise<void> => {
  try {
    if (!confirm(`Supprimer et reconnecter ${connection.bank_name} ?`)) {
      return
    }

    // D'abord supprimer l'ancienne connexion
    await deleteConnection(connection)

    // Puis initier une nouvelle connexion
    toast.info('🔄 Reconnexion en cours...')
    await initiateConnection()
  } catch (error) {
    console.error('❌ Erreur reconnexion:', error)
    toast.error('Impossible de reconnecter')
  }
}

/**
 * Activer/désactiver la sync automatique
 */
const toggleAutoSync = async (): Promise<void> => {
  autoSyncEnabled.value = !autoSyncEnabled.value
  toast.success(`Sync auto ${autoSyncEnabled.value ? 'activée' : 'désactivée'}`)
}

// ==========================================
// ACTIONS SUR CONNEXIONS
// ==========================================

/**
 * Supprimer une connexion
 */
const deleteConnection = async (connection: BankConnection): Promise<void> => {
  try {
    const response = await bankService.deleteConnection(connection.id)

    if (response.success) {
      connections.value = connections.value.filter((c) => c.id !== connection.id)
      toast.success('✅ Connexion supprimée')
    } else {
      toast.error(response.message || 'Erreur suppression')
    }
  } catch (error: any) {
    console.error('❌ Erreur suppression:', error)
    toast.error(error.message || 'Erreur')
  }
}

const toggleOptionsMenu = (connectionId: number): void => {
  Object.keys(showOptionsMenu).forEach((id) => {
    const numId = Number(id)
    if (numId !== connectionId) {
      showOptionsMenu[numId] = false
    }
  })
  showOptionsMenu[connectionId] = !showOptionsMenu[connectionId]
}

// ==========================================
// UTILITAIRES
// ==========================================

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    error: 'bg-red-100 text-red-800',
    disabled: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    active: '✅ Actif',
    expired: '⏰ Expiré',
    error: '❌ Erreur',
    disabled: '⏸️ Désactivé',
    pending: '⏳ En attente',
  }
  return texts[status] || status
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Jamais'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getTimeSinceSync = (dateString: string | null): string => {
  if (!dateString) return 'jamais'

  const now = new Date()
  const syncDate = new Date(dateString)
  const hours = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60 * 60))

  if (hours < 1) return "moins d'1h"
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  return `${days}j`
}

const refreshData = async (): Promise<void> => {
  await Promise.all([loadConnections(), loadPendingTransactions()])
}

/**
 * ✅ Gérer le callback de Bridge (Bridge v3 2025)
 */
const handleBridgeCallback = async (): Promise<void> => {
  const urlParams = new URLSearchParams(window.location.search)

  const itemId = urlParams.get('item_id')
  const success = urlParams.get('success')
  const error = urlParams.get('error')

  // ✅ IMPORTANT: Restaurer la session après redirection Bridge
  if (itemId || success || error) {
    console.log('🔄 Retour de Bridge, restauration session...')

    const authStore = useAuthStore()
    await authStore.restoreSession()

    if (!authStore.isAuthenticated) {
      console.error('❌ Session perdue après Bridge')
      toast.error('Session expirée, veuillez vous reconnecter')
      // Optionnel: rediriger vers login
      // router.push('/login')
      return
    }
  }

  if (error) {
    console.error('❌ Bridge error:', error)
    toast.error(`Erreur Bridge: ${error}`)
    window.history.replaceState({}, '', '/app/banking')
    return
  }

  if (success === 'true' && itemId) {
    console.log('✅ Connexion réussie ! Item ID:', itemId)
    toast.success('🎉 Compte bancaire connecté !')
    toast.info('⏳ Synchronisation en cours...')

    await refreshData()
    window.history.replaceState({}, '', '/app/banking')

  } else if (success === 'false') {
    toast.warning('❌ Connexion annulée')
    window.history.replaceState({}, '', '/app/banking')
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  // Gérer le retour de Bridge
  handleBridgeCallback()

  // Charger les données
  refreshData()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.transition-colors {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}
</style>
