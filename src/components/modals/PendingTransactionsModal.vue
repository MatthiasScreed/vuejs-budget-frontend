<template>
  <div
    v-if="visible"
    class="modal-overlay"
    @click="handleOverlayClick"
  >
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">
            <span class="title-icon">⏳</span>
            Transactions en attente
            <span class="transaction-count">{{ filteredTransactions.length }}</span>
          </h2>
          <p class="modal-subtitle">
            Catégorisez vos transactions importées automatiquement
          </p>
        </div>

        <button
          @click="handleClose"
          class="close-button"
          aria-label="Fermer"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Filters & Actions -->
      <div class="modal-filters">
        <div class="filter-group">
          <select
            v-model="filterType"
            class="filter-select"
          >
            <option value="all">Toutes les transactions</option>
            <option value="income">Revenus uniquement</option>
            <option value="expense">Dépenses uniquement</option>
          </select>

          <select
            v-model="sortBy"
            class="filter-select"
          >
            <option value="date">Trier par date</option>
            <option value="amount">Trier par montant</option>
            <option value="description">Trier par description</option>
          </select>
        </div>

        <div class="action-group">
          <button
            @click="selectAll"
            class="action-button secondary"
            :disabled="processing"
          >
            Tout sélectionner
          </button>

          <button
            @click="processSelected"
            class="action-button primary"
            :disabled="selectedTransactions.length === 0 || processing"
          >
            <span v-if="processing">Traitement...</span>
            <span v-else>Traiter sélection ({{ selectedTransactions.length }})</span>
          </button>
        </div>
      </div>

      <!-- Transaction List -->
      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p class="loading-text">Chargement des transactions...</p>
        </div>

        <div v-else-if="filteredTransactions.length === 0" class="empty-state">
          <div class="empty-icon">✨</div>
          <h3 class="empty-title">Aucune transaction en attente</h3>
          <p class="empty-text">
            Toutes vos transactions ont été traitées !
          </p>
        </div>

        <div v-else class="transaction-list">
          <div
            v-for="transaction in paginatedTransactions"
            :key="transaction.id"
            class="transaction-item"
            :class="{ 'selected': isSelected(transaction.id) }"
          >
            <!-- Selection checkbox -->
            <div class="transaction-checkbox">
              <input
                type="checkbox"
                :id="`tx-${transaction.id}`"
                v-model="selectedTransactions"
                :value="transaction.id"
                class="checkbox"
              />
            </div>

            <!-- Transaction info -->
            <div class="transaction-info">
              <div class="transaction-main">
                <div class="transaction-details">
                  <h4 class="transaction-description">{{ transaction.description }}</h4>
                  <div class="transaction-meta">
                    <span class="transaction-date">{{ formatDate(transaction.date) }}</span>
                    <span class="transaction-source">{{ getSourceLabel(transaction.source) }}</span>
                  </div>
                </div>

                <div class="transaction-amount" :class="getAmountClass(transaction.amount)">
                  {{ formatAmount(transaction.amount) }}
                </div>
              </div>

              <!-- Category Selection -->
              <div class="transaction-category">
                <label :for="`category-${transaction.id}`" class="category-label">
                  Catégorie :
                </label>
                <select
                  :id="`category-${transaction.id}`"
                  v-model="transaction.suggested_category_id"
                  class="category-select"
                  :class="{ 'has-suggestion': transaction.ai_suggestion }"
                >
                  <option value="">Choisir une catégorie...</option>
                  <optgroup label="Suggestions IA" v-if="transaction.ai_suggestion">
                    <option
                      :value="transaction.ai_suggestion.category_id"
                      class="ai-suggestion"
                    >
                      {{ transaction.ai_suggestion.category_name }}
                      ({{ Math.round(transaction.ai_suggestion.confidence * 100) }}%)
                    </option>
                  </optgroup>
                  <optgroup label="Toutes les catégories">
                    <option
                      v-for="category in availableCategories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.icon }} {{ category.name }}
                    </option>
                  </optgroup>
                </select>
              </div>

              <!-- Actions -->
              <div class="transaction-actions">
                <button
                  @click="processTransaction(transaction)"
                  :disabled="!transaction.suggested_category_id || processing"
                  class="process-button"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Traiter
                </button>

                <button
                  @click="ignoreTransaction(transaction)"
                  class="ignore-button"
                  :disabled="processing"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Ignorer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="modal-pagination">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-button"
        >
          Précédent
        </button>

        <span class="pagination-info">
          Page {{ currentPage }} sur {{ totalPages }}
          ({{ filteredTransactions.length }} transactions)
        </span>

        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-button"
        >
          Suivant
        </button>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <div class="footer-stats">
          <span class="stat-item">
            <span class="stat-icon">📊</span>
            {{ filteredTransactions.length }} transactions
          </span>

          <span class="stat-item">
            <span class="stat-icon">✅</span>
            {{ selectedTransactions.length }} sélectionnées
          </span>
        </div>

        <div class="footer-actions">
          <button
            @click="handleClose"
            class="footer-button secondary"
            :disabled="processing"
          >
            Fermer
          </button>

          <button
            @click="processAll"
            class="footer-button primary"
            :disabled="filteredTransactions.length === 0 || processing"
          >
            Traiter tout automatiquement
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'

// ==========================================
// TYPES
// ==========================================

interface PendingTransaction {
  id: string
  description: string
  amount: number
  date: string
  source: 'bank_import' | 'api' | 'csv'
  type: 'income' | 'expense'
  suggested_category_id?: string
  ai_suggestion?: {
    category_id: string
    category_name: string
    confidence: number
  }
}

interface Category {
  id: string
  name: string
  icon: string
  type: 'income' | 'expense' | 'both'
}

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  visible?: boolean
  transactions: PendingTransaction[]
}

interface Emits {
  (e: 'close'): void
  (e: 'processed', processedIds: string[]): void
  (e: 'ignored', ignoredIds: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  transactions: () => []
})

const emit = defineEmits<Emits>()

// ==========================================
// COMPOSABLES
// ==========================================

const toast = useToast()

// ==========================================
// STATE
// ==========================================

const loading = ref(false)
const processing = ref(false)

// Filters
const filterType = ref<'all' | 'income' | 'expense'>('all')
const sortBy = ref<'date' | 'amount' | 'description'>('date')

// Selection
const selectedTransactions = ref<string[]>([])

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Categories (mock data - à remplacer par un appel API)
const availableCategories = ref<Category[]>([
  { id: '1', name: 'Alimentation', icon: '🍕', type: 'expense' },
  { id: '2', name: 'Transport', icon: '🚗', type: 'expense' },
  { id: '3', name: 'Logement', icon: '🏠', type: 'expense' },
  { id: '4', name: 'Loisirs', icon: '🎬', type: 'expense' },
  { id: '5', name: 'Salaire', icon: '💼', type: 'income' },
  { id: '6', name: 'Freelance', icon: '💻', type: 'income' }
])

// ==========================================
// COMPUTED
// ==========================================

/**
 * Transactions filtrées selon le type sélectionné
 */
const filteredTransactions = computed(() => {
  let filtered = props.transactions

  // Filter by type
  if (filterType.value !== 'all') {
    filtered = filtered.filter(tx => tx.type === filterType.value)
  }

  // Sort
  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'amount':
        return Math.abs(b.amount) - Math.abs(a.amount)
      case 'description':
        return a.description.localeCompare(b.description)
      default:
        return 0
    }
  })
})

/**
 * Transactions paginées
 */
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTransactions.value.slice(start, end)
})

/**
 * Nombre total de pages
 */
const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage)
})

// ==========================================
// METHODS
// ==========================================

/**
 * Vérifier si une transaction est sélectionnée
 */
const isSelected = (id: string): boolean => {
  return selectedTransactions.value.includes(id)
}

/**
 * Formater une date
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Formater un montant
 */
const formatAmount = (amount: number): string => {
  const sign = amount >= 0 ? '+' : ''
  return `${sign}${amount.toFixed(2)}€`
}

/**
 * Obtenir la classe CSS pour un montant
 */
const getAmountClass = (amount: number): string => {
  return amount >= 0 ? 'amount-positive' : 'amount-negative'
}

/**
 * Obtenir le label pour une source
 */
const getSourceLabel = (source: string): string => {
  const labels: Record<string, string> = {
    'bank_import': '🏦 Import bancaire',
    'api': '🔗 API',
    'csv': '📄 CSV'
  }
  return labels[source] || source
}

/**
 * Fermer le modal
 */
const handleClose = (): void => {
  emit('close')
}

/**
 * Gérer le clic sur l'overlay
 */
const handleOverlayClick = (): void => {
  handleClose()
}

/**
 * Sélectionner toutes les transactions
 */
const selectAll = (): void => {
  selectedTransactions.value = filteredTransactions.value.map(tx => tx.id)
}

/**
 * Traiter une transaction individuelle
 */
const processTransaction = async (transaction: PendingTransaction): Promise<void> => {
  if (!transaction.suggested_category_id) {
    toast.error('Veuillez sélectionner une catégorie')
    return
  }

  processing.value = true

  try {
    // TODO: Appel API pour traiter la transaction
    console.log('Processing transaction:', transaction)

    // Simulation delay
    await new Promise(resolve => setTimeout(resolve, 500))

    toast.success(`Transaction "${transaction.description}" traitée !`)
    emit('processed', [transaction.id])
  } catch (error) {
    console.error('Erreur traitement transaction:', error)
    toast.error('Erreur lors du traitement')
  } finally {
    processing.value = false
  }
}

/**
 * Ignorer une transaction
 */
const ignoreTransaction = async (transaction: PendingTransaction): Promise<void> => {
  processing.value = true

  try {
    // TODO: Appel API pour ignorer la transaction
    console.log('Ignoring transaction:', transaction)

    // Simulation delay
    await new Promise(resolve => setTimeout(resolve, 300))

    toast.info(`Transaction "${transaction.description}" ignorée`)
    emit('ignored', [transaction.id])
  } catch (error) {
    console.error('Erreur ignore transaction:', error)
    toast.error('Erreur lors de l\'opération')
  } finally {
    processing.value = false
  }
}

/**
 * Traiter les transactions sélectionnées
 */
const processSelected = async (): Promise<void> => {
  if (selectedTransactions.value.length === 0) {
    toast.warning('Aucune transaction sélectionnée')
    return
  }

  const toProcess = filteredTransactions.value.filter(tx =>
    selectedTransactions.value.includes(tx.id) && tx.suggested_category_id
  )

  if (toProcess.length === 0) {
    toast.warning('Aucune transaction sélectionnée n\'a de catégorie assignée')
    return
  }

  processing.value = true

  try {
    // TODO: Appel API batch pour traiter multiple transactions
    console.log('Processing selected transactions:', toProcess)

    // Simulation delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success(`${toProcess.length} transactions traitées !`)
    emit('processed', toProcess.map(tx => tx.id))

    // Reset selection
    selectedTransactions.value = []
  } catch (error) {
    console.error('Erreur traitement batch:', error)
    toast.error('Erreur lors du traitement en lot')
  } finally {
    processing.value = false
  }
}

/**
 * Traiter toutes les transactions automatiquement
 */
const processAll = async (): Promise<void> => {
  const withSuggestions = filteredTransactions.value.filter(tx =>
    tx.ai_suggestion || tx.suggested_category_id
  )

  if (withSuggestions.length === 0) {
    toast.warning('Aucune transaction n\'a de suggestion IA disponible')
    return
  }

  processing.value = true

  try {
    // Assigner automatiquement les suggestions IA
    withSuggestions.forEach(tx => {
      if (tx.ai_suggestion && !tx.suggested_category_id) {
        tx.suggested_category_id = tx.ai_suggestion.category_id
      }
    })

    // TODO: Appel API pour traiter toutes les transactions
    console.log('Processing all with AI suggestions:', withSuggestions)

    // Simulation delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success(`${withSuggestions.length} transactions traitées automatiquement !`)
    emit('processed', withSuggestions.map(tx => tx.id))
  } catch (error) {
    console.error('Erreur traitement automatique:', error)
    toast.error('Erreur lors du traitement automatique')
  } finally {
    processing.value = false
  }
}

// ==========================================
// WATCHERS
// ==========================================

/**
 * Reset pagination when filters change
 */
watch([filterType, sortBy], () => {
  currentPage.value = 1
})

/**
 * Reset selection when transactions change
 */
watch(() => props.transactions, () => {
  selectedTransactions.value = []
  currentPage.value = 1
})

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  console.log('PendingTransactionsModal mounted with', props.transactions.length, 'transactions')
})
</script>

<style scoped>
/* ==========================================
   MODAL BASE
   ========================================== */

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ==========================================
   MODAL HEADER
   ========================================== */

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%);
}

.header-content {
  flex: 1;
}

.modal-title {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.title-icon {
  margin-right: 0.75rem;
  font-size: 1.75rem;
}

.transaction-count {
  margin-left: 0.75rem;
  background: #3b82f6;
  color: white;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
}

.modal-subtitle {
  color: #5b6270;
  margin: 0;
  font-size: 0.875rem;
}

.close-button {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #5b6270;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

/* ==========================================
   FILTERS
   ========================================== */

.modal-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group,
.action-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.action-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-button.secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* ==========================================
   MODAL BODY
   ========================================== */

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  min-height: 300px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #5b6270;
  font-medium: 500;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  color: #5b6270;
  margin: 0;
}

/* ==========================================
   TRANSACTION LIST
   ========================================== */

.transaction-list {
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s;
  gap: 1rem;
}

.transaction-item:hover {
  background: #f9fafb;
}

.transaction-item.selected {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.transaction-checkbox {
  display: flex;
  align-items: flex-start;
  padding-top: 0.25rem;
}

.checkbox {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: #3b82f6;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.transaction-details {
  flex: 1;
}

.transaction-description {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.transaction-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.transaction-date,
.transaction-source {
  font-size: 0.875rem;
  color: #5b6270;
}

.transaction-amount {
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
}

.amount-positive {
  color: #059669;
}

.amount-negative {
  color: #dc2626;
}

/* Category Selection */
.transaction-category {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.category-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.category-select {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s;
}

.category-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.category-select.has-suggestion {
  border-color: #10b981;
  background: #f0fdf4;
}

.ai-suggestion {
  background: #dcfce7;
  font-weight: 600;
}

/* Transaction Actions */
.transaction-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.process-button,
.ignore-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.process-button {
  background: #10b981;
  color: white;
}

.process-button:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.ignore-button {
  background: #f3f4f6;
  color: #5b6270;
  border: 1px solid #d1d5db;
}

.ignore-button:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.process-button:disabled,
.ignore-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* ==========================================
   PAGINATION
   ========================================== */

.modal-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pagination-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #5b6270;
  font-weight: 500;
}

/* ==========================================
   MODAL FOOTER
   ========================================== */

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #5b6270;
}

.stat-icon {
  font-size: 1rem;
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
}

.footer-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-button.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.footer-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.footer-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.footer-button.secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.footer-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* ==========================================
   RESPONSIVE
   ========================================== */

@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .filter-group,
  .action-group {
    justify-content: stretch;
  }

  .filter-select {
    min-width: auto;
    flex: 1;
  }

  .transaction-item {
    padding: 1rem;
  }

  .transaction-main {
    flex-direction: column;
    gap: 0.75rem;
  }

  .transaction-category {
    flex-direction: column;
    align-items: stretch;
  }

  .category-select {
    min-width: auto;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-stats {
    justify-content: space-around;
  }

  .footer-actions {
    justify-content: stretch;
  }

  .footer-button {
    flex: 1;
  }
}
</style>
