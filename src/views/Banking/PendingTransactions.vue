<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              ⏳ Transactions en attente
              <span class="ml-3 bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                {{ pendingTransactions.length }} à traiter
              </span>
            </h1>
            <p class="mt-2 text-gray-600">
              Catégorisez et validez vos transactions importées automatiquement
            </p>
          </div>

          <div class="flex space-x-3">
            <button
              @click="processAllAuto"
              :disabled="processingAll || pendingTransactions.length === 0"
              class="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg v-if="processingAll" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ processingAll ? 'Traitement...' : '🤖 Traiter tout auto' }}
            </button>

            <router-link
              to="/banking"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              ← Retour
            </router-link>
          </div>
        </div>
      </div>

      <!-- Filtres et stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <!-- Stats rapides -->
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              ⏳
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">En attente</p>
              <p class="text-xl font-bold text-orange-600">{{ pendingCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              🎯
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Catégorisées</p>
              <p class="text-xl font-bold text-green-600">{{ categorizedCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              💰
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Montant total</p>
              <p class="text-xl font-bold text-blue-600">{{ formatCurrency(totalAmount) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              🤖
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">Confiance IA</p>
              <p class="text-xl font-bold text-purple-600">{{ Math.round(averageConfidence) }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-lg p-4 mb-6 border border-gray-200">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Filtrer par:</label>
            <select
              v-model="filters.source"
              class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les sources</option>
              <option value="bridge">Bridge API</option>
              <option value="budget_insight">Budget Insight</option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Statut:</label>
            <select
              v-model="filters.status"
              class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="imported">Importé</option>
              <option value="categorized">Catégorisé</option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Confiance:</label>
            <select
              v-model="filters.confidence"
              class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes</option>
              <option value="high">Élevée (>80%)</option>
              <option value="medium">Moyenne (50-80%)</option>
              <option value="low">Faible (<50%)</option>
            </select>
          </div>

          <button
            @click="resetFilters"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Liste des transactions -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div v-if="loading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-600">Chargement des transactions...</p>
        </div>

        <div v-else-if="filteredTransactions.length === 0" class="p-8 text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ pendingTransactions.length === 0 ? 'Aucune transaction en attente' : 'Aucun résultat' }}
          </h3>
          <p class="text-gray-500">
            {{ pendingTransactions.length === 0 ?
            'Toutes vos transactions ont été traitées !' :
            'Essayez de modifier vos filtres.' }}
          </p>
        </div>

        <div v-else class="overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    v-model="selectAll"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie suggérée
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confiance
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="transaction in filteredTransactions"
                :key="transaction.id"
                class="hover:bg-gray-50"
                :class="{ 'bg-blue-50': selectedTransactions.includes(transaction.id) }"
              >
                <!-- Checkbox -->
                <td class="px-6 py-4">
                  <input
                    type="checkbox"
                    :value="transaction.id"
                    v-model="selectedTransactions"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>

                <!-- Description et détails -->
                <td class="px-6 py-4">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ transaction.formatted_description }}
                    </div>
                    <div class="text-xs text-gray-500 flex items-center">
                        <span class="inline-flex items-center mr-2">
                          {{ getProviderIcon(transaction.provider) }}
                          {{ transaction.bank_connection.bank_name }}
                        </span>
                      <span v-if="transaction.merchant_category" class="inline-flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {{ transaction.merchant_category }}
                        </span>
                    </div>
                  </div>
                </td>

                <!-- Montant -->
                <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="text-sm font-semibold"
                      :class="transaction.amount > 0 ? 'text-green-600' : 'text-red-600'"
                    >
                      {{ formatCurrency(Math.abs(transaction.amount)) }}
                    </span>
                  <div class="text-xs text-gray-500">
                    {{ transaction.amount > 0 ? 'Crédit' : 'Débit' }}
                  </div>
                </td>

                <!-- Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(transaction.transaction_date) }}
                </td>

                <!-- Catégorie suggérée -->
                <td class="px-6 py-4">
                  <div v-if="transaction.suggested_category" class="flex items-center">
                    <div
                      class="w-3 h-3 rounded-full mr-2"
                      :style="`background-color: ${transaction.suggested_category.color}`"
                    ></div>
                    <span class="text-sm text-gray-900">{{ transaction.suggested_category.name }}</span>
                  </div>
                  <select
                    v-else
                    v-model="transaction.manual_category_id"
                    class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choisir une catégorie</option>
                    <option
                      v-for="category in availableCategories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </option>
                  </select>
                </td>

                <!-- Confiance IA -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="h-2 rounded-full"
                        :class="getConfidenceColor(transaction.confidence_score)"
                        :style="`width: ${(transaction.confidence_score || 0) * 100}%`"
                      ></div>
                    </div>
                    <span class="text-xs font-medium text-gray-700">
                        {{ Math.round((transaction.confidence_score || 0) * 100) }}%
                      </span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    @click="approveTransaction(transaction)"
                    :disabled="processingTransactions.includes(transaction.id)"
                    class="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                  >
                    ✅ Valider
                  </button>
                  <button
                    @click="showEditModal(transaction)"
                    class="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    @click="ignoreTransaction(transaction)"
                    class="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    🚫 Ignorer
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Actions en lot -->
      <div v-if="selectedTransactions.length > 0" class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-900">
            {{ selectedTransactions.length }} transaction(s) sélectionnée(s)
          </span>
          <div class="flex space-x-2">
            <button
              @click="processBatch('approve')"
              :disabled="processingBatch"
              class="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-600 disabled:opacity-50"
            >
              ✅ Valider tout
            </button>
            <button
              @click="processBatch('ignore')"
              :disabled="processingBatch"
              class="bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-600 disabled:opacity-50"
            >
              🚫 Ignorer tout
            </button>
            <button
              @click="selectedTransactions = []"
              class="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-200"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition -->
    <TransactionEditModal
      v-if="editingTransaction"
      :transaction="editingTransaction"
      :categories="availableCategories"
      @save="handleEditSave"
      @close="editingTransaction = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { bankService } from '@/services/bankService'
import { categoryService } from '@/services/categoryService'

// Composition
const router = useRouter()
const toast = useToast()

// State
const loading = ref(true)
const processingAll = ref(false)
const processingBatch = ref(false)
const processingTransactions = ref<number[]>([])

const pendingTransactions = ref([])
const availableCategories = ref([])
const selectedTransactions = ref<number[]>([])
const selectAll = ref(false)
const editingTransaction = ref(null)

// Filtres
const filters = ref({
  source: '',
  status: '',
  confidence: ''
})

// Computed
const filteredTransactions = computed(() => {
  let filtered = [...pendingTransactions.value]

  if (filters.value.source) {
    filtered = filtered.filter(t => t.provider === filters.value.source)
  }

  if (filters.value.status) {
    filtered = filtered.filter(t => t.processing_status === filters.value.status)
  }

  if (filters.value.confidence) {
    const confidenceMap = {
      'high': (score: number) => score > 0.8,
      'medium': (score: number) => score >= 0.5 && score <= 0.8,
      'low': (score: number) => score < 0.5
    }
    filtered = filtered.filter(t => confidenceMap[filters.value.confidence](t.confidence_score || 0))
  }

  return filtered
})

const pendingCount = computed(() =>
  pendingTransactions.value.filter(t => t.processing_status === 'imported').length
)

const categorizedCount = computed(() =>
  pendingTransactions.value.filter(t => t.processing_status === 'categorized').length
)

const totalAmount = computed(() =>
  pendingTransactions.value.reduce((sum, t) => sum + Math.abs(t.amount), 0)
)

const averageConfidence = computed(() => {
  const scores = pendingTransactions.value.map(t => t.confidence_score || 0)
  return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length * 100 : 0
})

// Lifecycle
onMounted(() => {
  loadData()
})

// Methods
async function loadData() {
  try {
    const [transactionsResponse, categoriesResponse] = await Promise.all([
      bankService.getPendingTransactions(),
      categoryService.getCategories()
    ])

    if (transactionsResponse.success) {
      pendingTransactions.value = transactionsResponse.data.map(t => ({
        ...t,
        manual_category_id: t.suggested_category?.id || ''
      }))
    }

    if (categoriesResponse.success) {
      availableCategories.value = categoriesResponse.data
    }

  } catch (error) {
    console.error('Erreur chargement données:', error)
    toast.error('Erreur lors du chargement')

    // Mock data pour développement
    pendingTransactions.value = []
    availableCategories.value = []
  } finally {
    loading.value = false
  }
}

async function processAllAuto() {
  processingAll.value = true

  try {
    let processed = 0

    for (const transaction of pendingTransactions.value) {
      if (transaction.confidence_score >= 0.75 && transaction.suggested_category) {
        await approveTransaction(transaction)
        processed++
      }
    }

    toast.success(`✅ ${processed} transactions traitées automatiquement !`)

    if (processed > 0) {
      // XP bonus pour traitement automatique
      toast.info(`🎮 +${processed * 5} XP gagné !`)
    }

    await loadData()

  } catch (error) {
    toast.error('Erreur lors du traitement automatique')
  } finally {
    processingAll.value = false
  }
}

async function approveTransaction(transaction: any) {
  processingTransactions.value.push(transaction.id)

  try {
    const categoryId = transaction.manual_category_id || transaction.suggested_category?.id

    if (!categoryId) {
      toast.error('Veuillez sélectionner une catégorie')
      return
    }

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // const response = await bankService.convertTransaction(transaction.id, { category_id: categoryId })

    toast.success(`Transaction "${transaction.formatted_description}" validée !`)

    // Retirer de la liste
    const index = pendingTransactions.value.findIndex(t => t.id === transaction.id)
    if (index !== -1) {
      pendingTransactions.value.splice(index, 1)
    }

  } catch (error) {
    toast.error('Erreur lors de la validation')
  } finally {
    processingTransactions.value = processingTransactions.value.filter(id => id !== transaction.id)
  }
}

async function ignoreTransaction(transaction: any) {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 300))

    toast.info(`Transaction "${transaction.formatted_description}" ignorée`)

    // Retirer de la liste
    const index = pendingTransactions.value.findIndex(t => t.id === transaction.id)
    if (index !== -1) {
      pendingTransactions.value.splice(index, 1)
    }

  } catch (error) {
    toast.error('Erreur lors de l\'action')
  }
}

async function processBatch(action: 'approve' | 'ignore') {
  processingBatch.value = true

  try {
    for (const transactionId of selectedTransactions.value) {
      const transaction = pendingTransactions.value.find(t => t.id === transactionId)
      if (transaction) {
        if (action === 'approve') {
          await approveTransaction(transaction)
        } else {
          await ignoreTransaction(transaction)
        }
      }
    }

    toast.success(`${selectedTransactions.value.length} transactions traitées !`)
    selectedTransactions.value = []
    selectAll.value = false

  } catch (error) {
    toast.error('Erreur lors du traitement en lot')
  } finally {
    processingBatch.value = false
  }
}

function showEditModal(transaction: any) {
  editingTransaction.value = { ...transaction }
}

async function handleEditSave(updatedTransaction: any) {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mettre à jour dans la liste
    const index = pendingTransactions.value.findIndex(t => t.id === updatedTransaction.id)
    if (index !== -1) {
      pendingTransactions.value[index] = updatedTransaction
    }

    toast.success('Transaction mise à jour !')
    editingTransaction.value = null

  } catch (error) {
    toast.error('Erreur lors de la mise à jour')
  }
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedTransactions.value = filteredTransactions.value.map(t => t.id)
  } else {
    selectedTransactions.value = []
  }
}

function resetFilters() {
  filters.value = {
    source: '',
    status: '',
    confidence: ''
  }
}

// Utilitaires
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

function getProviderIcon(provider: string): string {
  const icons = {
    'bridge': '🌉',
    'budget_insight': '💡',
    'nordigen': '🏛️'
  }
  return icons[provider] || '🏦'
}

function getConfidenceColor(score: number): string {
  if (score >= 0.8) return 'bg-green-500'
  if (score >= 0.5) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>

<style scoped>
/* Animations personnalisées pour les actions */
.transaction-row-enter-active, .transaction-row-leave-active {
  transition: all 0.3s ease;
}

.transaction-row-enter-from, .transaction-row-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.transaction-row-leave-to {
  transform: translateX(20px);
}
</style>
