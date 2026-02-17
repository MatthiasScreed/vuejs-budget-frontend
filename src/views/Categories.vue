<template>
  <div class="categories-page">
    <!-- Error Boundary -->
    <ErrorBoundary :error="error" @retry="handleRefresh" @dismiss="error = null">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">🏷️ {{ t('categories.title') }}</h1>
            <p class="page-subtitle">{{ t('categories.subtitle') }}</p>
          </div>

          <LoadingButton variant="primary" icon="➕" @click="handleNewCategory()">
            {{ t('categories.new') }}
          </LoadingButton>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <div class="stat-header">
            <span class="stat-emoji">📊</span>
          </div>
          <div class="stat-amount">{{ categoryStats.total }}</div>
          <div class="stat-label">{{ t('categories.activeCategories') }}</div>
        </div>

        <div class="stat-card stat-spending">
          <div class="stat-header">
            <span class="stat-emoji">💸</span>
          </div>
          <div class="stat-amount">{{ formatDisplayCurrency(monthlySpending) }}</div>
          <div class="stat-label">{{ t('categories.spentThisMonth') }}</div>
        </div>

        <div class="stat-card stat-top">
          <div class="stat-header">
            <span class="stat-emoji">{{ mostUsedCategory?.icon || '🎯' }}</span>
          </div>
          <div class="stat-amount stat-name">
            {{ mostUsedCategory?.name || t('categories.none') }}
          </div>
          <div class="stat-label">{{ t('categories.mostSpent') }}</div>
        </div>

        <div class="stat-card stat-usage">
          <div class="stat-header">
            <span class="stat-emoji">📈</span>
          </div>
          <div class="stat-amount">{{ averageBudgetUsage }}%</div>
          <div class="stat-label">{{ t('categories.budgetUsed') }}</div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <LoadingButton variant="success" icon="💰" @click="handleNewCategory('income')">
          {{ t('categories.income') }}
        </LoadingButton>
        <LoadingButton variant="danger" icon="💸" @click="handleNewCategory('expense')">
          {{ t('categories.expense') }}
        </LoadingButton>
        <LoadingButton variant="neutral" icon="📋" @click="handleShowTemplates">
          {{ t('categories.templates') }}
        </LoadingButton>
        <LoadingButton
          variant="neutral"
          icon="🔄"
          :loading="crud.loading.value"
          @click="handleRefresh"
        >
          {{ t('categories.refresh') }}
        </LoadingButton>
      </div>

      <!-- Loading -->
      <div v-if="loading && categories.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ t('common.loading') }}</p>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="isEmpty && !error"
        icon="📂"
        :title="t('categories.noCategory')"
        :description="t('categories.startCreating')"
        show-action
        :action-text="t('categories.createFirst')"
        action-icon="➕"
        @action="handleNewCategory()"
      />

      <!-- Categories List -->
      <div v-else class="gaming-card categories-card">
        <div class="categories-header">
          <h2 class="card-title">{{ t('categories.yourCategories') }}</h2>
          <span class="categories-count">
            {{ categories.length }}
            {{
              categories.length > 1 ? t('categories.categories_plural') : t('categories.category')
            }}
          </span>
        </div>

        <div class="categories-list">
          <div
            v-for="category in displayedCategories"
            :key="category.id"
            class="category-item"
            :class="category.type === 'income' ? 'item-income' : 'item-expense'"
          >
            <!-- Version Mobile -->
            <div class="category-mobile">
              <div class="mobile-main">
                <div class="mobile-info">
                  <div
                    class="category-icon"
                    :style="{ backgroundColor: (category.color || '#5b6270') + '20' }"
                  >
                    <span class="category-emoji">{{ category.icon || '📁' }}</span>
                  </div>

                  <div class="mobile-details">
                    <p class="mobile-name">{{ category.name }}</p>
                    <p v-if="category.description" class="mobile-desc">
                      {{ category.description }}
                    </p>
                    <div class="mobile-meta">
                      <span
                        class="badge-type"
                        :class="category.type === 'income' ? 'badge-income' : 'badge-expense'"
                      >
                        {{
                          category.type === 'income'
                            ? `📈 ${t('categories.revenues')}`
                            : `📉 ${t('categories.expenses')}`
                        }}
                      </span>
                      <span v-if="category.monthly_budget" class="badge-budget">
                        {{
                          t('categories.budgetPerMonth', {
                            amount: formatDisplayCurrency(category.monthly_budget),
                          })
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Budget Progress (Mobile) -->
              <div v-if="category.monthly_budget" class="mobile-budget">
                <div class="budget-amounts">
                  <span class="spent-amount">{{
                    formatDisplayCurrency(getSpentAmount(category))
                  }}</span>
                  <span class="total-amount"
                    >/ {{ formatDisplayCurrency(category.monthly_budget) }}</span
                  >
                </div>
                <div class="budget-bar-wrapper">
                  <div class="budget-bar-track">
                    <div
                      class="budget-bar-fill"
                      :class="isOverBudget(category) ? 'bar-over' : 'bar-normal'"
                      :style="{ width: `${Math.min(getBudgetUsagePercentage(category), 100)}%` }"
                    ></div>
                  </div>
                  <span class="budget-percentage">{{ getBudgetUsagePercentage(category) }}%</span>
                </div>
              </div>

              <!-- Actions Mobile -->
              <div class="mobile-actions">
                <LoadingButton variant="secondary" size="sm" @click="handleEdit(category)">
                  {{ t('categories.modify') }}
                </LoadingButton>
                <LoadingButton variant="danger" size="sm" @click="handleDelete(category)">
                  {{ t('categories.delete') }}
                </LoadingButton>
              </div>
            </div>

            <!-- Version Desktop -->
            <div class="category-desktop">
              <div class="desktop-icon-col">
                <div
                  class="category-icon-desktop"
                  :style="{ backgroundColor: (category.color || '#5b6270') + '20' }"
                >
                  <span class="category-emoji">{{ category.icon || '📁' }}</span>
                </div>
              </div>

              <div class="desktop-info-col">
                <h3 class="desktop-name">{{ category.name }}</h3>
                <p class="desktop-desc">
                  {{ category.description || t('categories.noDescription') }}
                </p>
                <div class="desktop-badges">
                  <span
                    class="badge-type"
                    :class="category.type === 'income' ? 'badge-income' : 'badge-expense'"
                  >
                    {{
                      category.type === 'income'
                        ? `📈 ${t('categories.revenues')}`
                        : `📉 ${t('categories.expenses')}`
                    }}
                  </span>
                  <span v-if="category.monthly_budget" class="badge-budget">
                    {{
                      t('categories.budgetPerMonth', {
                        amount: formatDisplayCurrency(category.monthly_budget),
                      })
                    }}
                  </span>
                </div>
              </div>

              <div class="desktop-stats-col" v-if="category.monthly_budget">
                <div class="desktop-amounts">
                  <div class="amount-spent">
                    {{ formatDisplayCurrency(getSpentAmount(category)) }}
                  </div>
                  <div class="amount-total">
                    / {{ formatDisplayCurrency(category.monthly_budget) }}
                  </div>
                </div>
              </div>

              <div class="desktop-progress-col" v-if="category.monthly_budget">
                <div class="progress-label">{{ getBudgetUsagePercentage(category) }}%</div>
                <div class="budget-bar-track">
                  <div
                    class="budget-bar-fill"
                    :class="isOverBudget(category) ? 'bar-over' : 'bar-normal'"
                    :style="{ width: `${Math.min(getBudgetUsagePercentage(category), 100)}%` }"
                  ></div>
                </div>
              </div>

              <div class="desktop-actions-col">
                <LoadingButton variant="secondary" size="sm" @click="handleEdit(category)">
                  ✏️
                </LoadingButton>
                <LoadingButton variant="danger" size="sm" @click="handleDelete(category)">
                  🗑️
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Templates -->
      <div v-if="showTemplatesSection && templates.length > 0" class="gaming-card templates-card">
        <h3 class="card-title">{{ t('categories.templatesTitle') }}</h3>
        <div class="templates-grid">
          <button
            v-for="template in displayedTemplates"
            :key="template.id"
            @click="handleCreateFromTemplate(template)"
            class="template-item"
          >
            <div class="template-content">
              <span class="template-icon">{{ template.icon }}</span>
              <div class="template-info">
                <h4 class="template-name">{{ template.name }}</h4>
                <p class="template-desc">{{ template.description }}</p>
              </div>
            </div>
          </button>
        </div>
        <button
          v-if="templates.length > 6"
          @click="showAllTemplates = !showAllTemplates"
          class="btn-link"
        >
          {{
            showAllTemplates
              ? t('categories.viewLess')
              : t('categories.viewMore', { n: templates.length - 6 })
          }}
        </button>
      </div>
    </ErrorBoundary>

    <!-- Modal CategoryForm -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="handleCloseModal">
        <div class="modal-content modal-form">
          <div class="modal-header">
            <h2>{{ isEditing ? t('categories.editCategory') : t('categories.newCategory') }}</h2>
            <button @click="handleCloseModal" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <CategoryForm
              :category="editingItem"
              :is-editing="isEditing"
              :default-type="defaultType"
              @save="handleSave"
              @close="handleCloseModal"
              @cancel="handleCloseModal"
            />
          </div>
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
              <h3 class="delete-title">{{ t('categories.confirmDelete') }}</h3>
              <p class="delete-subtitle">{{ t('categories.irreversible') }}</p>
            </div>
          </div>

          <div class="modal-delete-content">
            <p class="delete-text">
              {{ t('categories.deleteQuestion', { name: deletingItem?.name }) }}
            </p>
            <div class="delete-info">
              {{ t('categories.type') }}:
              {{
                deletingItem?.type === 'income'
                  ? t('categories.revenues')
                  : t('categories.expenses')
              }}
            </div>
          </div>

          <div class="modal-delete-actions">
            <LoadingButton variant="secondary" @click="handleCancelDelete">
              {{ t('common.cancel') }}
            </LoadingButton>
            <LoadingButton
              variant="danger"
              :loading="crud.loading.value"
              @click="handleConfirmDelete"
            >
              {{ t('common.delete') }}
            </LoadingButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCrudOperation } from '@/composables/useAsyncOperation'
import CategoryForm from '@/components/forms/CategoryForm.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue'

// ==========================================
// I18N
// ==========================================

const { t } = useI18n()

// ==========================================
// TYPES
// ==========================================

interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  icon?: string
  color?: string
  description?: string
  monthly_budget?: number
}

// ==========================================
// STORES & COMPOSABLES
// ==========================================

const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const crud = useCrudOperation()

// ==========================================
// STATE
// ==========================================

const loading = computed(() => categoryStore.loading)
const error = ref<Error | null>(null)

const categories = computed(() => categoryStore.categories)
const templates = computed(() => categoryStore.templates)

const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const editingItem = ref<Category | null>(null)
const deletingItem = ref<Category | null>(null)
const defaultType = ref<'income' | 'expense'>('expense')
const showTemplatesSection = ref(false)
const showAllTemplates = ref(false)

// ==========================================
// COMPUTED
// ==========================================

const displayedCategories = computed(() => categories.value || [])

const displayedTemplates = computed(() => {
  if (showAllTemplates.value) {
    return templates.value || []
  }
  return (templates.value || []).slice(0, 6)
})

const isEmpty = computed(() => displayedCategories.value.length === 0)

const categoryStats = computed(() => {
  const cats = displayedCategories.value
  return {
    total: cats.length,
    income: cats.filter((c) => c.type === 'income').length,
    expense: cats.filter((c) => c.type === 'expense').length,
  }
})

const monthlySpending = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const txs = transactionStore.transactions || []

  const monthlyTransactions = txs.filter((t) => {
    if (t.type !== 'expense') return false
    const date = new Date(t.transaction_date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  return monthlyTransactions.reduce((sum, t) => {
    return sum + (Number(t.amount) || 0)
  }, 0)
})

const mostUsedCategory = computed(() => {
  const txs = transactionStore.transactions || []
  const categoryCounts: Record<number, number> = {}

  txs.forEach((t) => {
    if (t.category_id) {
      categoryCounts[t.category_id] = (categoryCounts[t.category_id] || 0) + 1
    }
  })

  const mostUsedId = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0]

  if (!mostUsedId) return displayedCategories.value[0]

  return (
    displayedCategories.value.find((c) => c.id === Number(mostUsedId)) ||
    displayedCategories.value[0]
  )
})

const averageBudgetUsage = computed(() => {
  const expenseCategories = displayedCategories.value.filter(
    (c) => c.type === 'expense' && c.monthly_budget,
  )

  if (expenseCategories.length === 0) return 0

  const totalUsage = expenseCategories.reduce((sum, cat) => {
    return sum + getBudgetUsagePercentage(cat)
  }, 0)

  return Math.round(totalUsage / expenseCategories.length)
})

// ==========================================
// METHODS - FORMATTING
// ==========================================

function formatDisplayCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount || 0)
}

function getSpentAmount(category: Category): number {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const txs = transactionStore.transactions || []

  const categoryTransactions = txs.filter((t) => {
    if (t.category_id !== category.id) return false
    const date = new Date(t.transaction_date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  return categoryTransactions.reduce((sum, t) => {
    return sum + (Number(t.amount) || 0)
  }, 0)
}

function getBudgetUsagePercentage(category: Category): number {
  if (!category.monthly_budget) return 0
  const spent = getSpentAmount(category)
  return Math.round((spent / category.monthly_budget) * 100)
}

function isOverBudget(category: Category): boolean {
  return getBudgetUsagePercentage(category) > 100
}

// ==========================================
// METHODS - ACTIONS
// ==========================================

function handleNewCategory(type: 'income' | 'expense' = 'expense') {
  isEditing.value = false
  editingItem.value = null
  defaultType.value = type
  showModal.value = true
}

function handleEdit(category: Category) {
  isEditing.value = true
  editingItem.value = category
  defaultType.value = category.type
  showModal.value = true
}

function handleDelete(category: Category) {
  deletingItem.value = category
  showDeleteConfirm.value = true
}

async function handleConfirmDelete() {
  if (!deletingItem.value) return

  const result = await crud.remove(
    () => categoryStore.deleteCategory(deletingItem.value!.id),
    t('categories.category'),
    deletingItem.value.name,
  )

  if (result) {
    handleCancelDelete()
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

async function handleSave(categoryData: any) {
  let result

  if (isEditing.value && editingItem.value) {
    result = await crud.update(
      () => categoryStore.updateCategory(editingItem.value!.id, categoryData),
      t('categories.category'),
    )
  } else {
    result = await crud.create(
      () => categoryStore.createCategory(categoryData),
      t('categories.category'),
    )
  }

  if (result) {
    handleCloseModal()
    await categoryStore.fetchCategories()
    console.log('✅ Catégories rafraîchies:', categoryStore.categories.length)
  }
}

async function handleCreateFromTemplate(template: Category) {
  await crud.create(() => categoryStore.createFromTemplate(template.id), t('categories.category'))
}

function handleShowTemplates() {
  showTemplatesSection.value = !showTemplatesSection.value
  if (showTemplatesSection.value) {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    })
  }
}

async function handleRefresh() {
  const results = await Promise.all([
    crud.fetch(() => categoryStore.fetchCategories(), t('categories.categories_plural')),
    crud.fetch(() => categoryStore.fetchTemplates(), t('categories.templates')),
    crud.fetch(() => transactionStore.fetchTransactions(), t('transactions.title')),
  ])

  if (results.some((r) => !r)) {
    error.value = new Error(t('errors.generic'))
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  console.log('🚀 [MOUNT] Mounting Categories.vue')

  try {
    await Promise.all([
      categoryStore.fetchCategories(),
      categoryStore.fetchTemplates(),
      transactionStore.fetchTransactions(),
    ])
    console.log(`✅ [MOUNT] ${categories.value?.length || 0} catégories chargées`)
  } catch (err: any) {
    console.error('❌ [MOUNT] Erreur montage:', err)
    error.value = err
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

:root {
  --color-income: #059669;
  --color-expense: #dc2626;
  --color-primary: #8b5cf6;
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
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.debug-panel h3 {
  color: #fbbf24;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 700;
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
  overflow-x: auto;
}

/* ========================================== */
/* LAYOUT */
/* ========================================== */

.categories-page {
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
  color: #5b6270;
  margin: 0.5rem 0 0 0;
  font-size: 0.9375rem;
}

/* ========================================== */
/* SUCCESS BANNER */
/* ========================================== */

.success-banner {
  background: linear-gradient(to right, #d1fae5, #a7f3d0);
  border-left: 4px solid #059669;
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.success-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.success-icon {
  font-size: 1.5rem;
}

.success-text {
  color: #065f46;
  font-weight: 500;
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
  color: #5b6270;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem;
  min-height: 44px;
  margin-top: 1rem;
  width: 100%;
}

.btn-link:hover {
  color: #1f2937;
}

/* ========================================== */
/* STATS GRID */
/* ========================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
}

.stat-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  text-align: center;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.stat-header {
  margin-bottom: 0.5rem;
}

.stat-emoji {
  font-size: 2rem;
}

.stat-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat-amount.stat-name {
  font-size: 1.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-label {
  font-size: 0.875rem;
  color: #5b6270;
}

@media (max-width: 640px) {
  .stat-card {
    padding: 1rem;
  }

  .stat-amount {
    font-size: 1.25rem;
  }

  .stat-emoji {
    font-size: 1.5rem;
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
  border-top-color: #8b5cf6;
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
  color: #5b6270;
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
/* CATEGORIES CARD */
/* ========================================== */

.categories-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.categories-count {
  font-size: 0.875rem;
  color: #5b6270;
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
  color: #5b6270;
  margin: 0 0 1.5rem 0;
}

/* ========================================== */
/* CATEGORIES LIST */
/* ========================================== */

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-item {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
}

.category-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.item-income {
  border-left: 4px solid #22c55e;
}

.item-expense {
  border-left: 4px solid #ef4444;
}

/* ========================================== */
/* CATEGORY MOBILE */
/* ========================================== */

.category-mobile {
  display: block;
}

@media (min-width: 1024px) {
  .category-mobile {
    display: none;
  }
}

.mobile-main {
  margin-bottom: 1rem;
}

.mobile-info {
  display: flex;
  align-items: start;
  gap: 0.75rem;
}

.category-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-emoji {
  font-size: 1.5rem;
}

.mobile-details {
  flex: 1;
  min-width: 0;
}

.mobile-name {
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.mobile-desc {
  font-size: 0.875rem;
  color: #5b6270;
  margin: 0 0 0.5rem 0;
}

.mobile-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge-type {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
}

.badge-income {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-expense {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-budget {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
  background-color: #dbeafe;
  color: #1e40af;
}

/* Budget Progress Mobile */
.mobile-budget {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.budget-amounts {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.spent-amount {
  font-weight: 600;
  color: #111827;
}

.total-amount {
  color: #5b6270;
}

.budget-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.budget-bar-track {
  flex: 1;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.budget-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: all 0.3s;
}

.bar-normal {
  background-color: #22c55e;
}

.bar-over {
  background-color: #ef4444;
}

.budget-percentage {
  font-size: 0.75rem;
  font-weight: 600;
  color: #5b6270;
  min-width: 2.5rem;
  text-align: right;
}

/* Mobile Actions */
.mobile-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.action-link {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 0;
  min-height: 44px;
  font-size: 0.875rem;
}

.link-edit {
  color: #2563eb;
}

.link-edit:hover {
  color: #1e40af;
}

.link-delete {
  color: #dc2626;
}

.link-delete:hover {
  color: #b91c1c;
}

/* ========================================== */
/* CATEGORY DESKTOP */
/* ========================================== */

.category-desktop {
  display: none;
  grid-template-columns: auto 1fr auto auto auto;
  gap: 1.5rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .category-desktop {
    display: grid;
  }
}

.desktop-icon-col {
  flex-shrink: 0;
}

.category-icon-desktop {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.desktop-info-col {
  flex: 1;
  min-width: 0;
}

.desktop-name {
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.desktop-desc {
  font-size: 0.875rem;
  color: #5b6270;
  margin: 0 0 0.5rem 0;
}

.desktop-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.desktop-stats-col {
  text-align: right;
  min-width: 120px;
}

.desktop-amounts {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.amount-spent {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.amount-total {
  font-size: 0.75rem;
  color: #5b6270;
}

.desktop-progress-col {
  width: 100px;
}

.progress-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #5b6270;
  margin-bottom: 0.25rem;
  text-align: center;
}

.desktop-actions-col {
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
  font-size: 1.125rem;
}

.icon-btn:hover {
  background-color: #f3f4f6;
}

/* ========================================== */
/* TEMPLATES */
/* ========================================== */

.templates-card {
  margin-top: 2rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .templates-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .templates-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.template-item {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.template-item:hover {
  background-color: #f9fafb;
  border-color: #8b5cf6;
}

.template-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.template-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
}

.template-desc {
  font-size: 0.75rem;
  color: #5b6270;
  margin: 0;
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
}

.modal-content {
  width: 100%;
  max-width: 42rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #5b6270;
  padding: 0.5rem;
  min-height: 44px;
  min-width: 44px;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
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
  color: #5b6270;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

.modal-delete-content {
  margin-bottom: 1.5rem;
}

.delete-text {
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.delete-info {
  font-size: 0.875rem;
  color: #5b6270;
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
  .categories-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .gaming-card {
    padding: 1rem;
  }

  .category-item {
    padding: 0.875rem;
  }
}

/* ========================================== */
/* SAFE AREAS (iPhone) */
/* ========================================== */

@supports (padding: env(safe-area-inset-bottom)) {
  .categories-page {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}
</style>
