<template>
  <div class="transactions-page">
    <!-- Debug Panel -->
    <div v-if="debugMode" class="debug-panel">
      <h3>🔍 Debug Panel</h3>
      <div class="debug-content">
        <div class="debug-section">
          <strong>Store State:</strong>
          <pre>{{ {
            transactionsCount: transactions?.length || 0,
            loading: loading,
            syncing: syncing,
            pendingCount: pendingTransactions?.length || 0
          } }}</pre>
        </div>
        <div class="debug-section">
          <strong>First Transaction:</strong>
          <pre>{{ transactions?.[0] || 'Aucune' }}</pre>
        </div>
        <div class="debug-section">
          <strong>Stats Computed:</strong>
          <pre>{{ stats }}</pre>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">💰 Transactions</h1>
          <p class="page-subtitle">Gérez vos revenus et dépenses</p>
        </div>
        <div class="header-actions">
          <button @click="handleSync" :disabled="syncing" class="btn btn-sync">
            <span>{{ syncing ? '⏳' : '🔄' }}</span>
            {{ syncing ? 'Synchronisation...' : 'Synchroniser' }}
          </button>
          <button @click="handleNewTransaction('expense')" class="btn btn-primary">
            ➕ Nouvelle
          </button>
        </div>
      </div>
    </div>

    <!-- Transactions en attente -->
    <div v-if="showPending" class="pending-section">
      <div class="pending-header">
        <div class="pending-info">
          <span class="pending-icon">⏳</span>
          <div>
            <h3 class="pending-title">À catégoriser</h3>
            <p class="pending-subtitle">
              {{ pendingCount }} transaction{{ pendingCount > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
        <button @click="handleAutoCategorize" :disabled="syncing" class="btn btn-auto">
          🤖 Auto
        </button>
      </div>
      <div class="pending-list">
        <div v-for="tx in displayedPending" :key="tx.id" class="pending-item">
          <div class="pending-item-content">
            <div class="pending-item-info">
              <p class="pending-item-desc">{{ tx.description || 'Sans description' }}</p>
              <p class="pending-item-date">{{ formatDisplayDate(tx.transaction_date) }}</p>
            </div>
            <div class="pending-item-actions">
              <span
                class="pending-item-amount"
                :class="tx.type === 'income' ? 'amount-income' : 'amount-expense'"
              >
                {{ formatDisplayAmount(tx) }}
              </span>
              <select @change="handleQuickCategorize(tx, $event)" class="category-select">
                <option value="">Choisir...</option>
                <option
                  v-for="cat in getCategoriesForType(tx.type)"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.icon || '📁' }} {{ cat.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats rapides -->
    <div class="stats-grid">
      <div class="stat-card stat-income">
        <div class="stat-header">
          <span class="stat-emoji">💚</span>
          <span class="stat-badge badge-success">{{ stats.incomeChange }}</span>
        </div>
        <div class="stat-amount">{{ formatDisplayCurrency(stats.totalIncome) }}</div>
        <div class="stat-label">Revenus ce mois</div>
      </div>
      <div class="stat-card stat-expense">
        <div class="stat-header">
          <span class="stat-emoji">❤️</span>
          <span class="stat-badge badge-danger">{{ stats.expenseChange }}</span>
        </div>
        <div class="stat-amount">{{ formatDisplayCurrency(stats.totalExpenses) }}</div>
        <div class="stat-label">Dépenses ce mois</div>
      </div>
      <div class="stat-card stat-balance">
        <div class="stat-header">
          <span class="stat-emoji">💙</span>
          <span class="stat-badge badge-info">{{ stats.balanceStatus }}</span>
        </div>
        <div class="stat-amount">{{ formatDisplayCurrency(stats.balance) }}</div>
        <div class="stat-label">Balance</div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="gaming-card filters-card">
      <h3 class="card-title">🔍 Filtres</h3>
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">Type</label>
          <select v-model="localFilters.type" @change="handleApplyFilters" class="filter-input">
            <option value="">Tous</option>
            <option value="income">💚 Revenus</option>
            <option value="expense">❤️ Dépenses</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Catégorie</label>
          <select v-model="localFilters.category_id" @change="handleApplyFilters" class="filter-input">
            <option value="">Toutes</option>
            <option v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
              {{ cat.icon || '📁' }} {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Date début</label>
          <input v-model="localFilters.date_from" @change="handleApplyFilters" type="date" class="filter-input" />
        </div>
        <div class="filter-group">
          <label class="filter-label">Date fin</label>
          <input v-model="localFilters.date_to" @change="handleApplyFilters" type="date" class="filter-input" />
        </div>
      </div>
      <div class="filters-actions">
        <button @click="handleApplyFilters" class="btn btn-primary">Appliquer</button>
        <button @click="handleResetFilters" class="btn-link">Réinitialiser</button>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="quick-actions">
      <button @click="handleNewTransaction('income')" class="action-btn action-income">💰 Revenu</button>
      <button @click="handleNewTransaction('expense')" class="action-btn action-expense">💸 Dépense</button>
      <button @click="handleExport" class="action-btn action-neutral">📊 Export</button>
      <button @click="handleImport" class="action-btn action-info">📥 Import</button>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Chargement des transactions...</p>
    </div>

    <!-- Liste des transactions -->
    <div v-else class="gaming-card transactions-card">
      <div class="transactions-header">
        <h2 class="card-title">Transactions récentes</h2>
        <div class="transactions-controls">
          <span class="transactions-count">
            {{ displayCount }} transaction{{ displayCount > 1 ? 's' : '' }}
          </span>
          <select v-model="localFilters.per_page" @change="handleApplyFilters" class="per-page-select">
            <option :value="15">15 par page</option>
            <option :value="30">30 par page</option>
            <option :value="50">50 par page</option>
          </select>
        </div>
      </div>

      <!-- Liste vide -->
      <div v-if="isEmpty" class="empty-state">
        <div class="empty-icon">🔭</div>
        <h3 class="empty-title">Aucune transaction</h3>
        <p class="empty-text">
          {{ hasFilters ? 'Aucun résultat pour ces filtres' : 'Commencez par créer votre première transaction' }}
        </p>
        <button @click="handleNewTransaction('expense')" class="btn btn-primary">
          Créer ma première transaction
        </button>
      </div>

      <!-- Transactions existantes -->
      <div v-else class="transactions-list">
        <div class="transaction-header-row">
          <div>Type</div>
          <div class="col-span-3">Description</div>
          <div class="col-span-2">Montant</div>
          <div class="col-span-2">Catégorie</div>
          <div class="col-span-2">Date</div>
          <div class="col-span-2">Actions</div>
        </div>

        <div class="transactions-items">
          <div
            v-for="tx in displayedTransactions"
            :key="tx.id"
            class="transaction-item"
            :class="tx.type === 'income' ? 'item-income' : 'item-expense'"
          >
            <!-- Version mobile -->
            <div class="transaction-mobile">
              <div class="mobile-main">
                <div class="mobile-info">
                  <span
                    class="transaction-icon"
                    :class="tx.type === 'income' ? 'icon-income' : 'icon-expense'"
                  >
                    {{ tx.type === 'income' ? '↗' : '↘' }}
                  </span>
                  <div class="mobile-details">
                    <p class="mobile-desc">{{ tx.description || 'Sans description' }}</p>
                    <p v-if="tx.category" class="mobile-category">
                      {{ tx.category.icon || '📁' }} {{ tx.category.name }}
                    </p>
                    <div class="mobile-meta">
                      <span class="mobile-date">{{ formatDisplayDate(tx.transaction_date) }}</span>
                      <span v-if="tx.is_recurring" class="badge-recurring">Récurrente</span>
                    </div>
                  </div>
                </div>
                <span
                  class="transaction-amount"
                  :class="tx.type === 'income' ? 'amount-income' : 'amount-expense'"
                >
                  {{ formatDisplayAmount(tx) }}
                </span>
              </div>
              <div class="mobile-actions">
                <div class="action-links">
                  <button @click="handleEdit(tx)" class="action-link link-edit">Modifier</button>
                  <button @click="handleDuplicate(tx)" class="action-link link-duplicate">Dupliquer</button>
                  <button @click="handleDelete(tx)" class="action-link link-delete">Supprimer</button>
                </div>
                <span class="mobile-time">{{ formatDisplayRelative(tx.created_at) }}</span>
              </div>
            </div>

            <!-- Version desktop -->
            <div class="transaction-desktop">
              <div>
                <span
                  class="transaction-icon-small"
                  :class="tx.type === 'income' ? 'icon-income' : 'icon-expense'"
                >
                  {{ tx.type === 'income' ? '↗' : '↘' }}
                </span>
              </div>
              <div class="col-span-3">
                <p class="desktop-desc">{{ tx.description || 'Sans description' }}</p>
                <div class="desktop-badges">
                  <span v-if="tx.is_recurring" class="badge-recurring">Récurrente</span>
                </div>
              </div>
              <div class="col-span-2">
                <span
                  class="desktop-amount"
                  :class="tx.type === 'income' ? 'amount-income' : 'amount-expense'"
                >
                  {{ formatDisplayAmount(tx) }}
                </span>
              </div>
              <div class="col-span-2">
                <span v-if="tx.category" class="desktop-category">
                  {{ tx.category.icon || '📁' }} {{ tx.category.name }}
                </span>
                <span v-else class="desktop-uncategorized">Non catégorisée</span>
              </div>
              <div class="col-span-2">
                <span class="desktop-date">{{ formatDisplayDate(tx.transaction_date) }}</span>
                <div class="desktop-time">{{ formatDisplayRelative(tx.created_at) }}</div>
              </div>
              <div class="col-span-2">
                <div class="desktop-actions">
                  <button @click="handleEdit(tx)" class="icon-btn" title="Modifier">✏️</button>
                  <button @click="handleDuplicate(tx)" class="icon-btn" title="Dupliquer">📋</button>
                  <button @click="handleDelete(tx)" class="icon-btn" title="Supprimer">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <nav v-if="showPagination" class="pagination">
          <div class="pagination-info">
            Affichage de {{ paginationInfo.from }} à {{ paginationInfo.to }} sur {{ paginationInfo.total }}
          </div>
          <div class="pagination-controls">
            <button @click="handlePrevPage" :disabled="!canGoPrev" class="pagination-btn">Précédent</button>
            <div class="pagination-numbers">
              <button
                v-for="page in visiblePageNumbers"
                :key="page"
                @click="handleGoToPage(page)"
                class="pagination-btn"
                :class="{ active: page === currentPageNumber }"
              >
                {{ page }}
              </button>
            </div>
            <button @click="handleNextPage" :disabled="!canGoNext" class="pagination-btn">Suivant</button>
          </div>
        </nav>
      </div>
    </div>

    <!-- ✅ MODAL TRANSACTION CORRIGÉ -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="handleCloseModal">
        <div class="modal-form-container">
          <TransactionForm
            :transaction="editingItem"
            :type="defaultTransactionType"
            :categories="availableCategories"
            @save="handleSaveTransaction"
            @cancel="handleCloseModal"
            @close="handleCloseModal"
          />
        </div>
      </div>
    </Teleport>

    <!-- Modal Suppression -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="handleCancelDelete">
        <div class="modal-delete">
          <div class="modal-delete-header">
            <div class="delete-icon-wrapper">
              <span class="delete-icon">🗑️</span>
            </div>
            <div>
              <h3 class="delete-title">Confirmer la suppression</h3>
              <p class="delete-subtitle">Cette action est irréversible</p>
            </div>
          </div>
          <div class="modal-delete-content">
            <p class="delete-text">
              Supprimer <strong>"{{ deletingItem?.description }}"</strong> ?
            </p>
            <div class="delete-amount">
              Montant: {{ deletingItem ? formatDisplayAmount(deletingItem) : '' }}
            </div>
          </div>
          <div class="modal-delete-actions">
            <button @click="handleCancelDelete" class="btn btn-secondary">Annuler</button>
            <button @click="handleConfirmDelete" :disabled="isDeleting" class="btn btn-danger">
              {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Input file caché -->
    <input ref="fileInput" type="file" accept=".csv" style="display: none" @change="handleFileChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import TransactionForm from '@/components/transactions/TransactionForm.vue'

// ==========================================
// TYPES
// ==========================================

interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  transaction_date: string
  created_at: string
  category?: {
    id: number
    name: string
    icon?: string
  }
  category_id?: number | null
  is_recurring?: boolean
  notes?: string
}

interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  icon?: string
}

// ==========================================
// STORES
// ==========================================

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()

const transactions = computed(() => transactionStore.transactions)
const pendingTransactions = computed(() => transactionStore.pendingTransactions)
const pagination = computed(() => transactionStore.pagination)
const loading = computed(() => transactionStore.loading)
const syncing = computed(() => transactionStore.syncing)
const availableCategories = computed(() => categoryStore.categories)

// ==========================================
// STATE
// ==========================================

const debugMode = ref(false)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const isDeleting = ref(false)
const editingItem = ref<Transaction | null>(null)
const deletingItem = ref<Transaction | null>(null)
const defaultTransactionType = ref<'income' | 'expense'>('expense')
const fileInput = ref<HTMLInputElement>()

const localFilters = ref({
  type: '',
  category_id: '',
  date_from: '',
  date_to: '',
  per_page: 15,
  page: 1
})

// ==========================================
// COMPUTED
// ==========================================

const displayedTransactions = computed(() => {
  const txs = transactions.value || []
  console.log('📦 [COMPUTED] displayedTransactions:', txs.length, 'items')
  return txs
})

const displayedPending = computed(() => {
  const pending = pendingTransactions.value || []
  return pending.slice(0, 5)
})

const pendingCount = computed(() => (pendingTransactions.value || []).length)
const showPending = computed(() => pendingCount.value > 0)
const displayCount = computed(() => pagination.value?.total || displayedTransactions.value.length)
const isEmpty = computed(() => displayedTransactions.value.length === 0)

const hasFilters = computed(() => {
  return !!(localFilters.value.type || localFilters.value.category_id ||
    localFilters.value.date_from || localFilters.value.date_to)
})

const stats = computed(() => {
  if (!displayedTransactions.value?.length) {
    return {
      totalIncome: 0, totalExpenses: 0, balance: 0,
      incomeChange: '0%', expenseChange: '0%', balanceStatus: 'Nul'
    }
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const thisMonth = displayedTransactions.value.filter(t => {
    if (!t.transaction_date) return false
    const date = new Date(t.transaction_date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const income = thisMonth
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const expenses = thisMonth
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const balance = income - expenses

  return {
    totalIncome: income,
    totalExpenses: expenses,
    balance: balance,
    incomeChange: income > 0 ? '+12.5%' : '0%',
    expenseChange: expenses > 0 ? '-8.3%' : '0%',
    balanceStatus: balance > 0 ? 'Positif' : balance < 0 ? 'Négatif' : 'Nul'
  }
})

// Pagination
const currentPageNumber = computed(() => pagination.value?.current_page || localFilters.value.page || 1)
const totalPages = computed(() => pagination.value?.last_page || 1)
const canGoPrev = computed(() => currentPageNumber.value > 1)
const canGoNext = computed(() => currentPageNumber.value < totalPages.value)

const visiblePageNumbers = computed(() => {
  const current = currentPageNumber.value
  const total = totalPages.value
  const pages: number[] = []
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showPagination = computed(() => totalPages.value > 1)

const paginationInfo = computed(() => {
  const perPage = localFilters.value.per_page
  const current = currentPageNumber.value
  const total = displayCount.value
  if (!total) return { from: 0, to: 0, total: 0 }
  const from = ((current - 1) * perPage) + 1
  const to = Math.min(current * perPage, total)
  return { from, to, total }
})

// ==========================================
// FORMATTING METHODS
// ==========================================

function formatDisplayCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0)
}

function formatDisplayAmount(tx: Transaction): string {
  const sign = tx.type === 'income' ? '+' : '-'
  const amount = Math.abs(Number(tx.amount) || 0)
  return `${sign}${formatDisplayCurrency(amount)}`
}

function formatDisplayDate(dateString: string): string {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return dateString }
}

function formatDisplayRelative(dateString: string): string {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
    return `Il y a ${Math.floor(diffDays / 30)} mois`
  } catch { return '-' }
}

function getCategoriesForType(type: string): Category[] {
  if (!availableCategories.value) return []
  return availableCategories.value.filter((c: Category) => c.type === type)
}

// ==========================================
// ACTIONS HANDLERS
// ==========================================

async function handleSync() {
  try {
    console.log('🔄 Synchronisation...')
    await transactionStore.syncAllBankConnections()
    console.log('✅ Synchronisation OK')
  } catch (error) {
    console.error('❌ Erreur sync:', error)
  }
}

async function handleAutoCategorize() {
  try {
    console.log('🤖 Auto-catégorisation...')
    await transactionStore.autoCategorize()
    console.log('✅ Catégorisation OK')
  } catch (error) {
    console.error('❌ Erreur catégorisation:', error)
  }
}

async function handleQuickCategorize(tx: Transaction, event: Event) {
  const target = event.target as HTMLSelectElement
  const categoryId = Number(target.value)
  if (!categoryId) return
  try {
    console.log(`📝 Catégorisation de ${tx.id} vers ${categoryId}`)
    await transactionStore.categorizeTransaction(tx.id, categoryId)
    console.log('✅ Catégorisé')
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

// ✅ CORRIGÉ: Ouvrir le modal avec le bon type
function handleNewTransaction(type: 'income' | 'expense' = 'expense') {
  console.log(`➕ Nouvelle transaction type: ${type}`)
  isEditing.value = false
  editingItem.value = null
  defaultTransactionType.value = type
  showModal.value = true
}

// ✅ CORRIGÉ: Édition avec le bon type
function handleEdit(tx: Transaction) {
  console.log(`✏️ Édition transaction ${tx.id}`)
  isEditing.value = true
  editingItem.value = { ...tx }
  defaultTransactionType.value = tx.type
  showModal.value = true
}

// ✅ NOUVEAU: Handler pour sauvegarder la transaction
async function handleSaveTransaction(transactionData: any) {
  console.log('💾 Sauvegarde transaction:', transactionData)

  try {
    if (isEditing.value && editingItem.value?.id) {
      // Mise à jour
      await transactionStore.updateTransaction(editingItem.value.id, transactionData)
      console.log('✅ Transaction mise à jour')
    } else {
      // Création
      await transactionStore.createTransaction(transactionData)
      console.log('✅ Transaction créée')
    }

    handleCloseModal()

    // Rafraîchir la liste
    await transactionStore.fetchTransactions()
    await transactionStore.fetchPendingTransactions()
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error)
    alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
  }
}

async function handleDuplicate(tx: Transaction) {
  try {
    console.log(`📋 Duplication transaction ${tx.id}`)
    const duplicated = {
      ...tx,
      description: `${tx.description} (copie)`,
      transaction_date: new Date().toISOString().split('T')[0]
    }
    delete (duplicated as any).id
    delete (duplicated as any).created_at
    delete (duplicated as any).updated_at
    await transactionStore.createTransaction(duplicated)
    await transactionStore.fetchTransactions()
    console.log('✅ Dupliqué')
  } catch (error) {
    console.error('❌ Erreur duplication:', error)
  }
}

function handleDelete(tx: Transaction) {
  console.log(`🗑️ Demande suppression ${tx.id}`)
  deletingItem.value = tx
  showDeleteConfirm.value = true
}

async function handleConfirmDelete() {
  if (!deletingItem.value) return
  isDeleting.value = true
  try {
    console.log(`🗑️ Suppression ${deletingItem.value.id}`)
    await transactionStore.deleteTransaction(deletingItem.value.id)
    handleCancelDelete()
    await transactionStore.fetchTransactions()
    console.log('✅ Supprimé')
  } catch (error) {
    console.error('❌ Erreur suppression:', error)
  } finally {
    isDeleting.value = false
  }
}

function handleCancelDelete() {
  showDeleteConfirm.value = false
  deletingItem.value = null
}

function handleCloseModal() {
  showModal.value = false
  editingItem.value = null
  isEditing.value = false
}

async function handleApplyFilters() {
  console.log('🔍 Application filtres:', localFilters.value)
  try {
    await transactionStore.applyFilters(localFilters.value)
  } catch (error) {
    console.error('❌ Erreur filtres:', error)
  }
}

function handleResetFilters() {
  console.log('🔄 Reset filtres')
  localFilters.value = { type: '', category_id: '', date_from: '', date_to: '', per_page: 15, page: 1 }
  handleApplyFilters()
}

async function handleGoToPage(page: number) {
  console.log(`📄 Page ${page}`)
  localFilters.value.page = page
  try {
    await transactionStore.changePage(page)
  } catch (error) {
    console.error('❌ Erreur pagination:', error)
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handlePrevPage() {
  if (canGoPrev.value) handleGoToPage(currentPageNumber.value - 1)
}

function handleNextPage() {
  if (canGoNext.value) handleGoToPage(currentPageNumber.value + 1)
}

function handleExport() {
  console.log('📊 Export CSV')
  window.open('/api/transactions/export-csv', '_blank')
}

function handleImport() {
  console.log('📥 Import CSV')
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    console.log('📄 Fichier sélectionné:', file.name)
    alert(`Import CSV: ${file.name} - Fonctionnalité à implémenter`)
  }
  if (fileInput.value) fileInput.value.value = ''
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  console.log('🚀 [MOUNT] Mounting Transactions.vue')
  try {
    console.log('📡 [MOUNT] Chargement catégories...')
    await categoryStore.fetchCategories()
    console.log(`✅ [MOUNT] ${availableCategories.value?.length || 0} catégories chargées`)

    console.log('📡 [MOUNT] Chargement transactions...')
    await transactionStore.fetchTransactions()
    console.log(`✅ [MOUNT] ${displayedTransactions.value.length} transactions chargées`)

    console.log('📡 [MOUNT] Chargement pending...')
    await transactionStore.fetchPendingTransactions()
    console.log(`✅ [MOUNT] ${pendingCount.value} pending chargées`)

    console.log('📡 [MOUNT] Chargement stats...')
    await transactionStore.fetchStats()
    console.log('✅ [MOUNT] Stats chargées')

    console.log('✅ [MOUNT] Transactions.vue prêt')
  } catch (error) {
    console.error('❌ [MOUNT] Erreur montage:', error)
  }
})
</script>

<style scoped>
/* ========================================== */
/* BASE */
/* ========================================== */
* { box-sizing: border-box; }
:root {
  --color-income: #059669;
  --color-expense: #dc2626;
  --color-balance: #2563eb;
  --color-pending: #f59e0b;
}

/* ========================================== */
/* DEBUG PANEL */
/* ========================================== */
.debug-panel {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 2px solid #10b981;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Monaco', 'Courier New', monospace;
}
.debug-panel h3 { color: #fbbf24; margin: 0 0 1rem 0; }
.debug-content { display: grid; gap: 1rem; }
.debug-section { background: rgba(0, 0, 0, 0.3); border-radius: 0.5rem; padding: 1rem; }
.debug-section strong { display: block; color: #60a5fa; margin-bottom: 0.5rem; font-size: 0.875rem; }
.debug-section pre { color: #10b981; margin: 0; font-size: 0.75rem; white-space: pre-wrap; }

/* ========================================== */
/* LAYOUT */
/* ========================================== */
.transactions-page { max-width: 1152px; margin: 0 auto; padding: 2rem 1rem; width: 100%; overflow-x: hidden; }

/* ========================================== */
/* HEADER */
/* ========================================== */
.page-header { margin-bottom: 2rem; }
.header-content { display: flex; flex-direction: column; gap: 1rem; }
@media (min-width: 640px) { .header-content { flex-direction: row; align-items: center; justify-content: space-between; } }
.header-text { flex: 1; min-width: 0; }
.page-title { font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0; }
.page-subtitle { color: #4b5563; margin: 0.5rem 0 0 0; font-size: 0.9375rem; }
.header-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }

/* ========================================== */
/* BUTTONS */
/* ========================================== */
.btn { padding: 0.625rem 1rem; border-radius: 0.5rem; font-weight: 500; border: none; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 44px; font-size: 0.9375rem; }
.btn-primary { background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.btn-sync { background-color: #3b82f6; color: white; }
.btn-sync:hover:not(:disabled) { background-color: #2563eb; }
.btn-sync:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-auto { background-color: #f59e0b; color: white; }
.btn-auto:hover:not(:disabled) { background-color: #d97706; }
.btn-secondary { background-color: #f3f4f6; color: #374151; }
.btn-secondary:hover { background-color: #e5e7eb; }
.btn-danger { background-color: #dc2626; color: white; }
.btn-danger:hover:not(:disabled) { background-color: #b91c1c; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-link { background: none; border: none; color: #5b6270; cursor: pointer; font-weight: 500; transition: color 0.2s; padding: 0.5rem; min-height: 44px; }
.btn-link:hover { color: #1f2937; }

/* ========================================== */
/* PENDING SECTION */
/* ========================================== */
.pending-section { background: linear-gradient(to right, #fffbeb, #fef3c7); border-left: 4px solid #f59e0b; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); width: 100%; }
.pending-header { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }
@media (min-width: 640px) { .pending-header { flex-direction: row; align-items: center; justify-content: space-between; } }
.pending-info { display: flex; align-items: start; gap: 1rem; flex: 1; }
.pending-icon { font-size: 2.5rem; flex-shrink: 0; }
.pending-title { font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0; }
.pending-subtitle { font-size: 0.875rem; color: #4b5563; margin: 0.25rem 0 0 0; }
.pending-list { display: flex; flex-direction: column; gap: 0.5rem; }
.pending-item { background-color: white; border-radius: 0.5rem; padding: 1rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.pending-item-content { display: flex; flex-direction: column; gap: 1rem; }
@media (min-width: 640px) { .pending-item-content { flex-direction: row; align-items: center; justify-content: space-between; } }
.pending-item-info { flex: 1; min-width: 0; }
.pending-item-desc { font-weight: 500; color: #111827; margin: 0; overflow: hidden; text-overflow: ellipsis; }
.pending-item-date { font-size: 0.875rem; color: #4b5563; margin: 0.25rem 0 0 0; }
.pending-item-actions { display: flex; flex-direction: column; gap: 0.75rem; }
@media (min-width: 640px) { .pending-item-actions { flex-direction: row; align-items: center; } }
.pending-item-amount { font-size: 1.125rem; font-weight: 700; }
.category-select { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; width: 100%; min-width: 150px; }
@media (min-width: 640px) { .category-select { width: auto; } }

/* ========================================== */
/* STATS GRID */
/* ========================================== */
.stats-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
@media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
.stat-card { background-color: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; transition: all 0.2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.stat-emoji { font-size: 2rem; }
.stat-badge { font-size: 0.875rem; font-weight: 500; padding: 0.25rem 0.5rem; border-radius: 9999px; }
.badge-success { background-color: #d1fae5; color: #059669; }
.badge-danger { background-color: #fee2e2; color: #dc2626; }
.badge-info { background-color: #dbeafe; color: #2563eb; }
.stat-amount { font-size: 1.875rem; font-weight: 700; }
.stat-income .stat-amount { color: var(--color-income); }
.stat-expense .stat-amount { color: var(--color-expense); }
.stat-balance .stat-amount { color: var(--color-balance); }
.stat-label { font-size: 0.875rem; color: #4b5563; margin-top: 0.25rem; }

/* ========================================== */
/* GAMING CARD */
/* ========================================== */
.gaming-card { background-color: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
.card-title { font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0 0 1rem 0; }

/* ========================================== */
/* FILTERS */
/* ========================================== */
.filters-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 1rem; }
@media (min-width: 640px) { .filters-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .filters-grid { grid-template-columns: repeat(4, 1fr); } }
.filter-group { display: flex; flex-direction: column; }
.filter-label { font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
.filter-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; outline: none; transition: all 0.2s; font-size: 1rem; }
.filter-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.filters-actions { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
@media (min-width: 640px) { .filters-actions { flex-direction: row; align-items: center; justify-content: space-between; } }

/* ========================================== */
/* QUICK ACTIONS */
/* ========================================== */
.quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
@media (min-width: 640px) { .quick-actions { grid-template-columns: repeat(4, 1fr); } }
.action-btn { padding: 0.75rem; border-radius: 0.5rem; font-weight: 500; border: none; cursor: pointer; transition: all 0.2s; min-height: 44px; font-size: 0.875rem; }
.action-income { background-color: #059669; color: white; }
.action-income:hover { background-color: #047857; }
.action-expense { background-color: #dc2626; color: white; }
.action-expense:hover { background-color: #b91c1c; }
.action-neutral { background-color: #f3f4f6; color: #374151; }
.action-neutral:hover { background-color: #e5e7eb; }
.action-info { background-color: #dbeafe; color: #1d4ed8; }
.action-info:hover { background-color: #bfdbfe; }

/* ========================================== */
/* LOADING */
/* ========================================== */
.loading-state { text-align: center; padding: 3rem 1rem; }
.loading-spinner { width: 3rem; height: 3rem; border: 2px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { margin-top: 1rem; color: #5b6270; }

/* ========================================== */
/* TRANSACTIONS CARD */
/* ========================================== */
.transactions-header { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
@media (min-width: 640px) { .transactions-header { flex-direction: row; align-items: center; justify-content: space-between; } }
.transactions-controls { display: flex; align-items: center; gap: 0.75rem; }
.transactions-count { font-size: 0.875rem; color: #5b6270; }
.per-page-select { padding: 0.375rem 0.5rem; font-size: 0.875rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }

/* ========================================== */
/* EMPTY STATE */
/* ========================================== */
.empty-state { text-align: center; padding: 3rem 1rem; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-title { font-size: 1.125rem; font-weight: 500; color: #111827; margin: 0 0 0.5rem 0; }
.empty-text { color: #5b6270; margin: 0 0 1.5rem 0; }

/* ========================================== */
/* TRANSACTIONS LIST */
/* ========================================== */
.transaction-header-row { display: none; grid-template-columns: repeat(12, 1fr); gap: 1rem; padding: 0.75rem 1rem; background-color: #f9fafb; border-radius: 0.5rem; font-weight: 500; color: #374151; font-size: 0.875rem; margin-bottom: 1rem; }
@media (min-width: 1024px) { .transaction-header-row { display: grid; } }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.transactions-items { display: flex; flex-direction: column; gap: 1rem; }
.transaction-item { background-color: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; transition: all 0.2s; }
.transaction-item:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.transaction-item:active { transform: scale(0.98); }
.item-income { border-left: 4px solid #22c55e; }
.item-expense { border-left: 4px solid #ef4444; }

/* ========================================== */
/* MOBILE TRANSACTION */
/* ========================================== */
.transaction-mobile { display: block; }
@media (min-width: 1024px) { .transaction-mobile { display: none; } }
.mobile-main { display: flex; align-items: start; justify-content: space-between; margin-bottom: 1rem; gap: 1rem; }
.mobile-info { display: flex; align-items: start; gap: 0.75rem; flex: 1; min-width: 0; }
.transaction-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
.icon-income { background-color: #dcfce7; color: #059669; }
.icon-expense { background-color: #fee2e2; color: #dc2626; }
.mobile-details { flex: 1; min-width: 0; }
.mobile-desc { font-weight: 500; color: #111827; margin: 0; overflow: hidden; text-overflow: ellipsis; }
.mobile-category { font-size: 0.875rem; color: #2563eb; margin: 0.25rem 0 0 0; }
.mobile-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; flex-wrap: wrap; }
.mobile-date { font-size: 0.75rem; color: #4b5563; }
.badge-recurring { font-size: 0.75rem; background-color: #dbeafe; color: #1e40af; padding: 0.125rem 0.5rem; border-radius: 9999px; }
.transaction-amount { font-weight: 700; font-size: 1.125rem; flex-shrink: 0; }
.amount-income { color: var(--color-income); }
.amount-expense { color: var(--color-expense); }
.mobile-actions { display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; padding-top: 0.75rem; border-top: 1px solid #f3f4f6; gap: 1rem; }
.action-links { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.action-link { background: none; border: none; cursor: pointer; font-weight: 500; transition: color 0.2s; padding: 0.5rem 0; min-height: 44px; display: inline-flex; align-items: center; }
.link-edit { color: #2563eb; }
.link-edit:hover { color: #1e40af; }
.link-duplicate { color: #059669; }
.link-duplicate:hover { color: #047857; }
.link-delete { color: #dc2626; }
.link-delete:hover { color: #b91c1c; }
.mobile-time { font-size: 0.75rem; color: #4b5563; }

/* ========================================== */
/* DESKTOP TRANSACTION */
/* ========================================== */
.transaction-desktop { display: none; grid-template-columns: repeat(12, 1fr); gap: 1rem; align-items: center; }
@media (min-width: 1024px) { .transaction-desktop { display: grid; } }
.transaction-icon-small { width: 2rem; height: 2rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; }
.desktop-desc { font-weight: 500; color: #111827; margin: 0; }
.desktop-badges { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
.desktop-amount { font-weight: 700; }
.desktop-category { font-size: 0.875rem; color: #2563eb; }
.desktop-uncategorized { font-size: 0.875rem; color: #5b6270; }
.desktop-date { font-size: 0.875rem; color: #4b5563; }
.desktop-time { font-size: 0.75rem; color: #5b6270; margin-top: 0.25rem; }
.desktop-actions { display: flex; gap: 0.25rem; }
.icon-btn { background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; transition: background-color 0.2s; min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: center; }
.icon-btn:hover { background-color: #f3f4f6; }

/* ========================================== */
/* PAGINATION */
/* ========================================== */
.pagination { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-top: 2rem; }
@media (min-width: 640px) { .pagination { flex-direction: row; justify-content: space-between; } }
.pagination-info { font-size: 0.875rem; color: #374151; }
.pagination-controls { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.pagination-numbers { display: flex; gap: 0.25rem; }
.pagination-btn { padding: 0.5rem 0.75rem; font-size: 0.875rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background-color: white; cursor: pointer; transition: all 0.2s; min-height: 44px; min-width: 44px; }
.pagination-btn:hover:not(:disabled):not(.active) { background-color: #f9fafb; }
.pagination-btn.active { background-color: #2563eb; color: white; border-color: #2563eb; }
.pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ========================================== */
/* MODALS */
/* ========================================== */
.modal-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.5); padding: 1rem; overflow-y: auto; }

/* ✅ NOUVEAU: Container pour le formulaire */
.modal-form-container { width: 100%; max-width: 42rem; max-height: 90vh; overflow-y: auto; }

.modal-delete { background-color: white; border-radius: 0.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); padding: 1.5rem; width: 100%; max-width: 28rem; }
.modal-delete-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.delete-icon-wrapper { width: 3rem; height: 3rem; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.delete-icon { color: #dc2626; font-size: 1.5rem; }
.delete-title { font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0; }
.delete-subtitle { color: #5b6270; font-size: 0.875rem; margin: 0.25rem 0 0 0; }
.modal-delete-content { margin-bottom: 1.5rem; }
.delete-text { color: #374151; margin: 0; }
.delete-amount { margin-top: 0.5rem; font-size: 0.875rem; color: #5b6270; }
.modal-delete-actions { display: flex; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap; }

/* ========================================== */
/* MOBILE RESPONSIVE */
/* ========================================== */
@media (max-width: 640px) {
  .transactions-page { padding: 1rem; }
  .page-title { font-size: 1.5rem; }
  .pending-section, .gaming-card { padding: 1rem; }
  .stat-card { padding: 1rem; }
  .transaction-item { padding: 0.875rem; }
}

/* ========================================== */
/* SAFE AREAS (iPhone) */
/* ========================================== */
@supports (padding: env(safe-area-inset-bottom)) {
  .transactions-page {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}
</style>
