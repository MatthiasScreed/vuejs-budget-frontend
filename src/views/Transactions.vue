<template>
  <div class="transactions-page">
    <!-- Debug Panel -->
    <div v-if="debugMode" class="debug-panel">
      <h3>🔍 Debug Panel</h3>
      <div class="debug-content">
        <div class="debug-section">
          <strong>Store State:</strong>
          <pre>{{
            {
              transactionsCount: transactions?.length || 0,
              loading: loading,
              syncing: syncing,
              pendingCount: pendingTransactions?.length || 0,
            }
          }}</pre>
        </div>
        <div class="debug-section">
          <strong>First Transaction:</strong>
          <pre>{{ transactions?.[0] || 'None' }}</pre>
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
          <h1 class="page-title">💰 {{ t('transactions.title') }}</h1>
          <p class="page-subtitle">{{ t('transactions.subtitle') }}</p>
        </div>
        <div class="header-actions">
          <button @click="handleSync" :disabled="syncing" class="btn btn-sync">
            <span>{{ syncing ? '⏳' : '🔄' }}</span>
            {{ syncing ? t('transactions.syncing') : t('transactions.sync') }}
          </button>
          <button @click="handleNewTransaction('expense')" class="btn btn-primary">
            ➕ {{ t('transactions.new') }}
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
            <h3 class="pending-title">{{ t('transactions.pendingTitle') }}</h3>
            <p class="pending-subtitle">
              {{ pendingCount }} {{ t('transactions.title').toLowerCase() }}
            </p>
          </div>
        </div>
        <button @click="handleAutoCategorize" :disabled="syncing" class="btn btn-auto">
          🤖 {{ t('transactions.autoCategorize') }}
        </button>
      </div>
      <div class="pending-list">
        <div v-for="tx in displayedPending" :key="tx.id" class="pending-item">
          <div class="pending-item-content">
            <div class="pending-item-info">
              <p class="pending-item-desc">
                {{ tx.description || t('transactions.noDescription') }}
              </p>
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
                <option value="">{{ t('transactions.chooseCat') }}</option>
                <option v-for="cat in getCategoriesForType(tx.type)" :key="cat.id" :value="cat.id">
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
        <div class="stat-label">{{ t('transactions.incomeThisMonth') }}</div>
      </div>
      <div class="stat-card stat-expense">
        <div class="stat-header">
          <span class="stat-emoji">❤️</span>
          <span class="stat-badge badge-danger">{{ stats.expenseChange }}</span>
        </div>
        <div class="stat-amount">{{ formatDisplayCurrency(stats.totalExpenses) }}</div>
        <div class="stat-label">{{ t('transactions.expensesThisMonth') }}</div>
      </div>
      <div class="stat-card stat-balance">
        <div class="stat-header">
          <span class="stat-emoji">💙</span>
          <span class="stat-badge badge-info">{{ stats.balanceStatus }}</span>
        </div>
        <div class="stat-amount">{{ formatDisplayCurrency(stats.balance) }}</div>
        <div class="stat-label">{{ t('transactions.balance') }}</div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="gaming-card filters-card">
      <h3 class="card-title">🔍 {{ t('transactions.filters') }}</h3>
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">{{ t('transactions.filterType') }}</label>
          <select v-model="localFilters.type" @change="handleApplyFilters" class="filter-input">
            <option value="">{{ t('transactions.filterAllTypes') }}</option>
            <option value="income">💚 {{ t('transactions.income') }}</option>
            <option value="expense">❤️ {{ t('transactions.expense') }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">{{ t('transactions.filterCategory') }}</label>
          <select
            v-model="localFilters.category_id"
            @change="handleApplyFilters"
            class="filter-input"
          >
            <option value="">{{ t('transactions.filterAllCategories') }}</option>
            <option v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
              {{ cat.icon || '📁' }} {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">{{ t('transactions.filterDateFrom') }}</label>
          <input
            v-model="localFilters.date_from"
            @change="handleApplyFilters"
            type="date"
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">{{ t('transactions.filterDateTo') }}</label>
          <input
            v-model="localFilters.date_to"
            @change="handleApplyFilters"
            type="date"
            class="filter-input"
          />
        </div>
      </div>
      <div class="filters-actions">
        <button @click="handleApplyFilters" class="btn btn-primary">
          {{ t('common.apply') }}
        </button>
        <button @click="handleResetFilters" class="btn-link">
          {{ t('common.reset') }}
        </button>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="quick-actions">
      <button @click="handleNewTransaction('income')" class="action-btn action-income">
        💰 {{ t('transactions.income') }}
      </button>
      <button @click="handleNewTransaction('expense')" class="action-btn action-expense">
        💸 {{ t('transactions.expense') }}
      </button>
      <button @click="handleExport" class="action-btn action-neutral">
        📊 {{ t('common.export') }}
      </button>
      <button @click="handleImport" class="action-btn action-info">
        📥 {{ t('common.import') }}
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ t('transactions.loadingTransactions') }}</p>
    </div>

    <!-- Liste des transactions -->
    <div v-else class="gaming-card transactions-card">
      <div class="transactions-header">
        <h2 class="card-title">{{ t('transactions.recentTitle') }}</h2>
        <div class="transactions-controls">
          <span class="transactions-count">
            {{ displayCount }} transaction{{ displayCount > 1 ? 's' : '' }}
          </span>
          <select
            v-model="localFilters.per_page"
            @change="handleApplyFilters"
            class="per-page-select"
          >
            <option :value="15">{{ t('common.perPage', { n: 15 }) }}</option>
            <option :value="30">{{ t('common.perPage', { n: 30 }) }}</option>
            <option :value="50">{{ t('common.perPage', { n: 50 }) }}</option>
          </select>
        </div>
      </div>

      <!-- Liste vide -->
      <div v-if="isEmpty" class="empty-state">
        <div class="empty-icon">🔭</div>
        <h3 class="empty-title">{{ t('transactions.noTransactions') }}</h3>
        <p class="empty-text">
          {{
            hasFilters ? t('transactions.noFilterResults') : t('transactions.noTransactionsDesc')
          }}
        </p>
        <button @click="handleNewTransaction('expense')" class="btn btn-primary">
          {{ t('transactions.createFirst') }}
        </button>
      </div>

      <!-- Transactions existantes -->
      <div v-else class="transactions-list">
        <div class="transaction-header-row">
          <div>Type</div>
          <div class="col-span-3">{{ t('transactions.description') }}</div>
          <div class="col-span-2">{{ t('transactions.amount') }}</div>
          <div class="col-span-2">{{ t('transactions.category') }}</div>
          <div class="col-span-2">{{ t('transactions.date') }}</div>
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
                    <p class="mobile-desc">
                      {{ tx.description || t('transactions.noDescription') }}
                    </p>
                    <p v-if="tx.category" class="mobile-category">
                      {{ tx.category.icon || '📁' }} {{ tx.category.name }}
                    </p>
                    <div class="mobile-meta">
                      <span class="mobile-date">
                        {{ formatDisplayDate(tx.transaction_date) }}
                      </span>
                      <span v-if="tx.is_recurring" class="badge-recurring">
                        {{ t('transactions.recurring') }}
                      </span>
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
                  <button @click="handleEdit(tx)" class="action-link link-edit">
                    {{ t('common.edit') }}
                  </button>
                  <button @click="handleDuplicate(tx)" class="action-link link-duplicate">
                    {{ t('common.duplicate') }}
                  </button>
                  <button @click="handleDelete(tx)" class="action-link link-delete">
                    {{ t('common.delete') }}
                  </button>
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
                <p class="desktop-desc">
                  {{ tx.description || t('transactions.noDescription') }}
                </p>
                <div class="desktop-badges">
                  <span v-if="tx.is_recurring" class="badge-recurring">
                    {{ t('transactions.recurring') }}
                  </span>
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
                <span v-else class="desktop-uncategorized">
                  {{ t('transactions.uncategorized') }}
                </span>
              </div>
              <div class="col-span-2">
                <span class="desktop-date">{{ formatDisplayDate(tx.transaction_date) }}</span>
                <div class="desktop-time">{{ formatDisplayRelative(tx.created_at) }}</div>
              </div>
              <div class="col-span-2">
                <div class="desktop-actions">
                  <button @click="handleEdit(tx)" class="icon-btn" :title="t('common.edit')">
                    ✏️
                  </button>
                  <button
                    @click="handleDuplicate(tx)"
                    class="icon-btn"
                    :title="t('common.duplicate')"
                  >
                    📋
                  </button>
                  <button @click="handleDelete(tx)" class="icon-btn" :title="t('common.delete')">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <nav v-if="showPagination" class="pagination">
          <div class="pagination-info">
            {{
              t('common.showing', {
                from: paginationInfo.from,
                to: paginationInfo.to,
                total: paginationInfo.total,
              })
            }}
          </div>
          <div class="pagination-controls">
            <button @click="handlePrevPage" :disabled="!canGoPrev" class="pagination-btn">
              {{ t('common.previous') }}
            </button>
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
            <button @click="handleNextPage" :disabled="!canGoNext" class="pagination-btn">
              {{ t('common.next') }}
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- Modal Transaction -->
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
              <h3 class="delete-title">{{ t('transactions.deleteConfirmTitle') }}</h3>
              <p class="delete-subtitle">{{ t('transactions.deleteIrreversible') }}</p>
            </div>
          </div>
          <div class="modal-delete-content">
            <p class="delete-text">
              {{ t('transactions.deleteConfirmText', { name: deletingItem?.description }) }}
            </p>
            <div class="delete-amount">
              {{ t('transactions.amount') }}:
              {{ deletingItem ? formatDisplayAmount(deletingItem) : '' }}
            </div>
          </div>
          <div class="modal-delete-actions">
            <button @click="handleCancelDelete" class="btn btn-secondary">
              {{ t('common.cancel') }}
            </button>
            <button @click="handleConfirmDelete" :disabled="isDeleting" class="btn btn-danger">
              {{ isDeleting ? t('transactions.deleting') : t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Input file caché -->
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import TransactionForm from '@/components/transactions/TransactionForm.vue'

// ==========================================
// I18N
// ==========================================

const { t, locale } = useI18n()

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
const fileInput = ref<HTMLInputElement>()
const defaultTransactionType = ref<'income' | 'expense'>('expense')

const localFilters = ref({
  type: '',
  category_id: '',
  date_from: '',
  date_to: '',
  per_page: 15,
  page: 1,
})

// ==========================================
// COMPUTED
// ==========================================

const displayedTransactions = computed(() => {
  return transactions.value || []
})

const displayedPending = computed(() => {
  return (pendingTransactions.value || []).slice(0, 5)
})

const pendingCount = computed(() => (pendingTransactions.value || []).length)
const showPending = computed(() => pendingCount.value > 0)
const displayCount = computed(() => pagination.value?.total || displayedTransactions.value.length)
const isEmpty = computed(() => displayedTransactions.value.length === 0)

const hasFilters = computed(() => {
  return !!(
    localFilters.value.type ||
    localFilters.value.category_id ||
    localFilters.value.date_from ||
    localFilters.value.date_to
  )
})

const stats = computed(() => {
  if (!displayedTransactions.value?.length) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      incomeChange: '0%',
      expenseChange: '0%',
      balanceStatus: t('transactions.neutral'),
    }
  }

  const now = new Date()
  const curMonth = now.getMonth()
  const curYear = now.getFullYear()

  const thisMonth = displayedTransactions.value.filter((tx) => {
    if (!tx.transaction_date) return false
    const d = new Date(tx.transaction_date)
    return d.getMonth() === curMonth && d.getFullYear() === curYear
  })

  const income = thisMonth
    .filter((tx) => tx.type === 'income')
    .reduce((s, tx) => s + (Number(tx.amount) || 0), 0)

  const expenses = thisMonth
    .filter((tx) => tx.type === 'expense')
    .reduce((s, tx) => s + (Number(tx.amount) || 0), 0)

  const balance = income - expenses

  let status = t('transactions.neutral')
  if (balance > 0) status = t('transactions.positive')
  if (balance < 0) status = t('transactions.negative')

  return {
    totalIncome: income,
    totalExpenses: expenses,
    balance,
    incomeChange: income > 0 ? '+12.5%' : '0%',
    expenseChange: expenses > 0 ? '-8.3%' : '0%',
    balanceStatus: status,
  }
})

// Pagination
const currentPageNumber = computed(
  () => pagination.value?.current_page || localFilters.value.page || 1,
)
const totalPages = computed(() => pagination.value?.last_page || 1)
const canGoPrev = computed(() => currentPageNumber.value > 1)
const canGoNext = computed(() => currentPageNumber.value < totalPages.value)

const visiblePageNumbers = computed(() => {
  const cur = currentPageNumber.value
  const total = totalPages.value
  const pages: number[] = []
  const start = Math.max(1, cur - 2)
  const end = Math.min(total, cur + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const showPagination = computed(() => totalPages.value > 1)

const paginationInfo = computed(() => {
  const pp = localFilters.value.per_page
  const cur = currentPageNumber.value
  const total = displayCount.value
  if (!total) return { from: 0, to: 0, total: 0 }
  const from = (cur - 1) * pp + 1
  const to = Math.min(cur * pp, total)
  return { from, to, total }
})

// ==========================================
// FORMATTING (locale-aware)
// ==========================================

function formatDisplayCurrency(amount: number): string {
  const loc = locale.value === 'en' ? 'en-GB' : 'fr-FR'
  return new Intl.NumberFormat(loc, {
    style: 'currency',
    currency: 'EUR',
  }).format(amount || 0)
}

function formatDisplayAmount(tx: Transaction): string {
  const sign = tx.type === 'income' ? '+' : '-'
  const amt = Math.abs(Number(tx.amount) || 0)
  return `${sign}${formatDisplayCurrency(amt)}`
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const loc = locale.value === 'en' ? 'en-GB' : 'fr-FR'
    return new Date(dateStr).toLocaleDateString(loc, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatDisplayRelative(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (diff === 0) return t('time.today')
    if (diff === 1) return t('time.yesterday')
    if (diff < 7) return t('time.daysAgo', { n: diff })
    if (diff < 30) {
      return t('time.weeksAgo', {
        n: Math.floor(diff / 7),
      })
    }
    return t('time.monthsAgo', {
      n: Math.floor(diff / 30),
    })
  } catch {
    return '-'
  }
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
    await transactionStore.syncAllBankConnections()
  } catch (error) {
    console.error('❌ Sync error:', error)
  }
}

async function handleAutoCategorize() {
  try {
    await transactionStore.autoCategorize()
  } catch (error) {
    console.error('❌ Auto-categorize error:', error)
  }
}

async function handleQuickCategorize(tx: Transaction, event: Event) {
  const target = event.target as HTMLSelectElement
  const catId = Number(target.value)
  if (!catId) return
  try {
    await transactionStore.categorizeTransaction(tx.id, catId)
  } catch (error) {
    console.error('❌ Quick categorize error:', error)
  }
}

function handleNewTransaction(type: 'income' | 'expense' = 'expense') {
  isEditing.value = false
  editingItem.value = null
  defaultTransactionType.value = type
  showModal.value = true
}

function handleEdit(tx: Transaction) {
  isEditing.value = true
  editingItem.value = { ...tx }
  defaultTransactionType.value = tx.type
  showModal.value = true
}

async function handleSaveTransaction(data: any) {
  try {
    if (isEditing.value && editingItem.value?.id) {
      await transactionStore.updateTransaction(editingItem.value.id, data)
    } else {
      await transactionStore.createTransaction(data)
    }
    handleCloseModal()
    await transactionStore.fetchTransactions()
    await transactionStore.fetchPendingTransactions()
  } catch (error) {
    console.error('❌ Save error:', error)
    alert(t('transactions.errorSave'))
  }
}

async function handleDuplicate(tx: Transaction) {
  try {
    const dup = {
      ...tx,
      description: `${tx.description} (${t('common.duplicate').toLowerCase()})`,
      transaction_date: new Date().toISOString().split('T')[0],
    }
    delete (dup as any).id
    delete (dup as any).created_at
    delete (dup as any).updated_at
    await transactionStore.createTransaction(dup)
    await transactionStore.fetchTransactions()
  } catch (error) {
    console.error('❌ Duplicate error:', error)
  }
}

function handleDelete(tx: Transaction) {
  deletingItem.value = tx
  showDeleteConfirm.value = true
}

async function handleConfirmDelete() {
  if (!deletingItem.value) return
  isDeleting.value = true
  try {
    await transactionStore.deleteTransaction(deletingItem.value.id)
    handleCancelDelete()
    await transactionStore.fetchTransactions()
  } catch (error) {
    console.error('❌ Delete error:', error)
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
  try {
    await transactionStore.applyFilters(localFilters.value)
  } catch (error) {
    console.error('❌ Filter error:', error)
  }
}

function handleResetFilters() {
  localFilters.value = {
    type: '',
    category_id: '',
    date_from: '',
    date_to: '',
    per_page: 15,
    page: 1,
  }
  handleApplyFilters()
}

async function handleGoToPage(page: number) {
  localFilters.value.page = page
  try {
    await transactionStore.changePage(page)
  } catch (error) {
    console.error('❌ Page error:', error)
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handlePrevPage() {
  if (canGoPrev.value) {
    handleGoToPage(currentPageNumber.value - 1)
  }
}

function handleNextPage() {
  if (canGoNext.value) {
    handleGoToPage(currentPageNumber.value + 1)
  }
}

function handleExport() {
  window.open('/api/transactions/export-csv', '_blank')
}

function handleImport() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    alert(`Import CSV: ${file.name}`)
  }
  if (fileInput.value) fileInput.value.value = ''
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  try {
    await categoryStore.fetchCategories()
    await transactionStore.fetchTransactions()
    await transactionStore.fetchPendingTransactions()
    await transactionStore.fetchStats()
  } catch (error) {
    console.error('❌ Mount error:', error)
  }
})
</script>

<style scoped>
/* ========================================== */
/* BASE */
/* ========================================== */
* {
  box-sizing: border-box;
}

/* ========================================== */
/* DEBUG PANEL */
/* ========================================== */
.debug-panel {
  background: linear-gradient(135deg, #1e293b, #334155);
  border: 2px solid #10b981;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Monaco', 'Courier New', monospace;
}
.debug-panel h3 {
  color: #fbbf24;
  margin: 0 0 1rem 0;
}
.debug-content {
  display: grid;
  gap: 1rem;
}
.debug-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
}
.debug-section strong {
  display: block;
  color: #60a5fa;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}
.debug-section pre {
  color: #10b981;
  margin: 0;
  font-size: 0.75rem;
  white-space: pre-wrap;
}

/* ========================================== */
/* LAYOUT */
/* ========================================== */
.transactions-page {
  max-width: 1152px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
  overflow-x: hidden;
}

/* ========================================== */
/* HEADER */
/* ========================================== */
.page-header {
  margin-bottom: 2rem;
}
.header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (min-width: 640px) {
  .header-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.header-text {
  flex: 1;
  min-width: 0;
}
.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.page-subtitle {
  color: #4b5563;
  margin: 0.5rem 0 0 0;
  font-size: 0.9375rem;
}
.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* ========================================== */
/* BUTTONS */
/* ========================================== */
.btn {
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  font-size: 0.9375rem;
}
.btn-primary {
  background: linear-gradient(to right, #8b5cf6, #ec4899);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.btn-sync {
  background-color: #3b82f6;
  color: white;
}
.btn-sync:hover:not(:disabled) {
  background-color: #2563eb;
}
.btn-sync:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-auto {
  background-color: #f59e0b;
  color: white;
}
.btn-auto:hover:not(:disabled) {
  background-color: #d97706;
}
.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}
.btn-secondary:hover {
  background-color: #e5e7eb;
}
.btn-danger {
  background-color: #dc2626;
  color: white;
}
.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-link {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem;
  min-height: 44px;
}
.btn-link:hover {
  color: #1f2937;
}

/* ========================================== */
/* PENDING SECTION */
/* ========================================== */
.pending-section {
  background: linear-gradient(to right, #fffbeb, #fef3c7);
  border-left: 4px solid #f59e0b;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.pending-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}
@media (min-width: 640px) {
  .pending-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.pending-info {
  display: flex;
  align-items: start;
  gap: 1rem;
  flex: 1;
}
.pending-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}
.pending-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}
.pending-subtitle {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0.25rem 0 0 0;
}
.pending-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.pending-item {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.pending-item-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (min-width: 640px) {
  .pending-item-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.pending-item-info {
  flex: 1;
  min-width: 0;
}
.pending-item-desc {
  font-weight: 500;
  color: #111827;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pending-item-date {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0.25rem 0 0 0;
}
.pending-item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
@media (min-width: 640px) {
  .pending-item-actions {
    flex-direction: row;
    align-items: center;
  }
}
.pending-item-amount {
  font-size: 1.125rem;
  font-weight: 700;
}
.category-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #111827;
  font-size: 0.875rem;
  width: 100%;
  min-width: 150px;
}
@media (min-width: 640px) {
  .category-select {
    width: auto;
  }
}

/* ========================================== */
/* STATS GRID — ✅ FIX COULEURS */
/* ========================================== */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.stat-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.stat-emoji {
  font-size: 2rem;
}
.stat-badge {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}
.badge-success {
  background-color: #d1fae5;
  color: #059669;
}
.badge-danger {
  background-color: #fee2e2;
  color: #dc2626;
}
.badge-info {
  background-color: #dbeafe;
  color: #2563eb;
}

/* ✅ Couleurs en dur — pas de var() qui peut échouer en scoped */
.stat-amount {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}
.stat-income .stat-amount {
  color: #059669;
}
.stat-expense .stat-amount {
  color: #dc2626;
}
.stat-balance .stat-amount {
  color: #2563eb;
}

.stat-label {
  font-size: 0.875rem;
  color: #4b5563;
  margin-top: 0.25rem;
}

/* ========================================== */
/* GAMING CARD */
/* ========================================== */
.gaming-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

/* ========================================== */
/* FILTERS — ✅ FIX PLACEHOLDERS */
/* ========================================== */
.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 640px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .filters-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
.filter-group {
  display: flex;
  flex-direction: column;
}
.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}
.filter-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  outline: none;
  transition: all 0.2s;
  font-size: 1rem;
  color: #111827;
  background-color: white;
}
.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.filter-input::placeholder {
  color: #6b7280;
  opacity: 1;
}
.filters-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}
@media (min-width: 640px) {
  .filters-actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

/* ========================================== */
/* QUICK ACTIONS */
/* ========================================== */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
@media (min-width: 640px) {
  .quick-actions {
    grid-template-columns: repeat(4, 1fr);
  }
}
.action-btn {
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  font-size: 0.875rem;
}
.action-income {
  background-color: #059669;
  color: white;
}
.action-income:hover {
  background-color: #047857;
}
.action-expense {
  background-color: #dc2626;
  color: white;
}
.action-expense:hover {
  background-color: #b91c1c;
}
.action-neutral {
  background-color: #f3f4f6;
  color: #374151;
}
.action-neutral:hover {
  background-color: #e5e7eb;
}
.action-info {
  background-color: #dbeafe;
  color: #1d4ed8;
}
.action-info:hover {
  background-color: #bfdbfe;
}

/* ========================================== */
/* LOADING */
/* ========================================== */
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
}
.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.loading-text {
  margin-top: 1rem;
  color: #6b7280;
}

/* ========================================== */
/* TRANSACTIONS CARD */
/* ========================================== */
.transactions-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
@media (min-width: 640px) {
  .transactions-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.transactions-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.transactions-count {
  font-size: 0.875rem;
  color: #6b7280;
}
.per-page-select {
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  color: #111827;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

/* ========================================== */
/* EMPTY STATE */
/* ========================================== */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.empty-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.5rem 0;
}
.empty-text {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

/* ========================================== */
/* TRANSACTIONS LIST */
/* ========================================== */
.transaction-header-row {
  display: none;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
@media (min-width: 1024px) {
  .transaction-header-row {
    display: grid;
  }
}
.col-span-2 {
  grid-column: span 2;
}
.col-span-3 {
  grid-column: span 3;
}
.transactions-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.transaction-item {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
}
.transaction-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.transaction-item:active {
  transform: scale(0.98);
}
.item-income {
  border-left: 4px solid #22c55e;
}
.item-expense {
  border-left: 4px solid #ef4444;
}

/* ========================================== */
/* MOBILE TRANSACTION */
/* ========================================== */
.transaction-mobile {
  display: block;
}
@media (min-width: 1024px) {
  .transaction-mobile {
    display: none;
  }
}
.mobile-main {
  display: flex;
  align-items: start;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}
.mobile-info {
  display: flex;
  align-items: start;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}
.transaction-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}
.icon-income {
  background-color: #dcfce7;
  color: #059669;
}
.icon-expense {
  background-color: #fee2e2;
  color: #dc2626;
}
.mobile-details {
  flex: 1;
  min-width: 0;
}
.mobile-desc {
  font-weight: 500;
  color: #111827;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mobile-category {
  font-size: 0.875rem;
  color: #2563eb;
  margin: 0.25rem 0 0 0;
}
.mobile-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}
.mobile-date {
  font-size: 0.75rem;
  color: #4b5563;
}
.badge-recurring {
  font-size: 0.75rem;
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}
.transaction-amount {
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}
.amount-income {
  color: #059669;
}
.amount-expense {
  color: #dc2626;
}
.mobile-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
  gap: 1rem;
}
.action-links {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.action-link {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 0;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.link-edit {
  color: #2563eb;
}
.link-edit:hover {
  color: #1e40af;
}
.link-duplicate {
  color: #059669;
}
.link-duplicate:hover {
  color: #047857;
}
.link-delete {
  color: #dc2626;
}
.link-delete:hover {
  color: #b91c1c;
}
.mobile-time {
  font-size: 0.75rem;
  color: #4b5563;
}

/* ========================================== */
/* DESKTOP TRANSACTION */
/* ========================================== */
.transaction-desktop {
  display: none;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
  align-items: center;
}
@media (min-width: 1024px) {
  .transaction-desktop {
    display: grid;
  }
}
.transaction-icon-small {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}
.desktop-desc {
  font-weight: 500;
  color: #111827;
  margin: 0;
}
.desktop-badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
.desktop-amount {
  font-weight: 700;
}
.desktop-category {
  font-size: 0.875rem;
  color: #2563eb;
}
.desktop-uncategorized {
  font-size: 0.875rem;
  color: #6b7280;
}
.desktop-date {
  font-size: 0.875rem;
  color: #4b5563;
}
.desktop-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
.desktop-actions {
  display: flex;
  gap: 0.25rem;
}
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover {
  background-color: #f3f4f6;
}

/* ========================================== */
/* PAGINATION */
/* ========================================== */
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}
@media (min-width: 640px) {
  .pagination {
    flex-direction: row;
    justify-content: space-between;
  }
}
.pagination-info {
  font-size: 0.875rem;
  color: #374151;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.pagination-numbers {
  display: flex;
  gap: 0.25rem;
}
.pagination-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  min-width: 44px;
}
.pagination-btn:hover:not(:disabled):not(.active) {
  background-color: #f9fafb;
}
.pagination-btn.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========================================== */
/* MODALS */
/* ========================================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  overflow-y: auto;
}
.modal-form-container {
  width: 100%;
  max-width: 42rem;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-delete {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
}
.modal-delete-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.delete-icon-wrapper {
  width: 3rem;
  height: 3rem;
  background-color: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.delete-icon {
  color: #dc2626;
  font-size: 1.5rem;
}
.delete-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}
.delete-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}
.modal-delete-content {
  margin-bottom: 1.5rem;
}
.delete-text {
  color: #374151;
  margin: 0;
}
.delete-amount {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}
.modal-delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* ========================================== */
/* MOBILE RESPONSIVE */
/* ========================================== */
@media (max-width: 640px) {
  .transactions-page {
    padding: 1rem;
  }
  .page-title {
    font-size: 1.5rem;
  }
  .pending-section,
  .gaming-card {
    padding: 1rem;
  }
  .stat-card {
    padding: 1rem;
  }
  .transaction-item {
    padding: 0.875rem;
  }
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
