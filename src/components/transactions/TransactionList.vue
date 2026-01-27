<template>
  <div class="transaction-list bg-white rounded-xl shadow-lg p-6">

    <!-- Header avec titre et actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">💰 Mes Transactions</h2>
        <p class="text-gray-600">
          {{ transactionStore.hasTransactions ? `${transactionStore.pagination.total} transactions` : 'Aucune transaction' }}
        </p>
      </div>

      <!-- Actions rapides -->
      <div class="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
        <button
          @click="refreshData"
          :disabled="transactionStore.isLoading"
          class="btn-secondary"
        >
          <span v-if="transactionStore.isLoading">⏳</span>
          <span v-else>🔄</span>
          Actualiser
        </button>

        <button
          @click="$emit('openForm')"
          class="btn-primary"
        >
          ➕ Nouvelle transaction
        </button>
      </div>
    </div>

    <!-- Filtres rapides -->
    <div class="bg-gray-50 rounded-lg p-4 mb-6">
      <div class="flex flex-wrap gap-4">

        <!-- Filtre par type -->
        <div class="flex-1 min-w-32">
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            v-model="filters.type"
            @change="applyFilters"
            class="form-select"
          >
            <option value="">Tous les types</option>
            <option value="income">💰 Revenus</option>
            <option value="expense">💸 Dépenses</option>
          </select>
        </div>

        <!-- Recherche -->
        <div class="flex-2 min-w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <div class="relative">
            <input
              v-model="filters.search"
              @input="debouncedSearch"
              type="text"
              placeholder="Rechercher une description..."
              class="form-input pl-10"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        <!-- Période -->
        <div class="flex-1 min-w-32">
          <label class="block text-sm font-medium text-gray-700 mb-1">Période</label>
          <select
            v-model="selectedPeriod"
            @change="applyPeriodFilter"
            class="form-select"
          >
            <option value="">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>

        <!-- Reset filtres -->
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="btn-outline text-sm"
          >
            ❌ Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Messages d'état -->
    <div v-if="transactionStore.error" class="alert-error mb-4">
      <span class="font-medium">❌ Erreur:</span> {{ transactionStore.error }}
    </div>

    <!-- Loading state -->
    <div v-if="transactionStore.isLoading && !transactionStore.hasTransactions" class="text-center py-12">
      <div class="inline-flex items-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span class="text-gray-600">Chargement des transactions...</span>
      </div>
    </div>

    <!-- État vide -->
    <div v-else-if="!transactionStore.hasTransactions && !transactionStore.isLoading" class="text-center py-12">
      <div class="mx-auto h-24 w-24 text-6xl mb-4">💰</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune transaction</h3>
      <p class="text-gray-600 mb-6">Commencez par ajouter votre première transaction !</p>
      <button @click="$emit('openForm')" class="btn-primary">
        ➕ Créer ma première transaction
      </button>
    </div>

    <!-- Liste des transactions -->
    <div v-else-if="transactionStore.hasTransactions">

      <!-- En-têtes desktop -->
      <div class="hidden lg:grid lg:grid-cols-12 gap-4 py-3 px-4 bg-gray-50 rounded-lg font-medium text-gray-700 text-sm mb-4">
        <div class="col-span-1">Type</div>
        <div class="col-span-3">Description</div>
        <div class="col-span-2">Montant</div>
        <div class="col-span-2">Catégorie</div>
        <div class="col-span-2">Date</div>
        <div class="col-span-2 text-center">Actions</div>
      </div>

      <!-- Items de transaction -->
      <div class="space-y-3">
        <div
          v-for="transaction in transactionStore.transactions"
          :key="transaction.id"
          class="transaction-item bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
        >

          <!-- Vue desktop -->
          <div class="hidden lg:grid lg:grid-cols-12 gap-4 p-4 items-center">

            <!-- Type avec icône -->
            <div class="col-span-1">
              <span
                :class="[
                  'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                  transaction.type === 'income'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ transaction.type === 'income' ? '↗️' : '↘️' }}
              </span>
            </div>

            <!-- Description -->
            <div class="col-span-3">
              <p class="font-medium text-gray-900 truncate">
                {{ transaction.description || 'Sans description' }}
              </p>
              <p v-if="transaction.reference" class="text-sm text-gray-500">
                Réf: {{ transaction.reference }}
              </p>
            </div>

            <!-- Montant -->
            <div class="col-span-2">
              <span
                :class="[
                  'font-bold text-lg',
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ formatAmount(transaction) }}
              </span>
            </div>

            <!-- Catégorie -->
            <div class="col-span-2">
              <span
                v-if="transaction.category"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ transaction.category.name }}
              </span>
              <span v-else class="text-gray-400 text-sm">Aucune</span>
            </div>

            <!-- Date -->
            <div class="col-span-2">
              <p class="text-sm font-medium text-gray-900">
                {{ formatDate(transaction.transaction_date) }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatTime(transaction.created_at) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="col-span-2 flex justify-center space-x-2">
              <button
                @click="$emit('editTransaction', transaction)"
                class="btn-icon text-blue-600 hover:bg-blue-50"
                title="Modifier"
              >
                ✏️
              </button>
              <button
                @click="confirmDelete(transaction)"
                class="btn-icon text-red-600 hover:bg-red-50"
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- Vue mobile -->
          <div class="lg:hidden p-4">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <span
                  :class="[
                    'inline-flex items-center justify-center w-10 h-10 rounded-full text-lg',
                    transaction.type === 'income'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ transaction.type === 'income' ? '↗️' : '↘️' }}
                </span>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">
                    {{ transaction.description || 'Sans description' }}
                  </p>
                  <p v-if="transaction.category" class="text-sm text-blue-600">
                    {{ transaction.category.name }}
                  </p>
                </div>
              </div>

              <span
                :class="[
                  'font-bold text-lg',
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ formatAmount(transaction) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>{{ formatDate(transaction.transaction_date) }}</span>
              <div class="flex space-x-2">
                <button
                  @click="$emit('editTransaction', transaction)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  ✏️ Modifier
                </button>
                <button
                  @click="confirmDelete(transaction)"
                  class="text-red-600 hover:text-red-800"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="transactionStore.pagination.last_page > 1" class="mt-8 flex flex-col sm:flex-row items-center justify-between">

        <!-- Info pagination -->
        <div class="text-sm text-gray-700 mb-4 sm:mb-0">
          Affichage de {{ transactionStore.pagination.from }} à {{ transactionStore.pagination.to }}
          sur {{ transactionStore.pagination.total }} transactions
        </div>

        <!-- Contrôles pagination -->
        <div class="flex items-center space-x-2">
          <!-- Page précédente -->
          <button
            @click="previousPage"
            :disabled="transactionStore.pagination.current_page === 1"
            class="btn-icon"
            :class="transactionStore.pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : ''"
          >
            ⬅️
          </button>

          <!-- Numéros de page -->
          <div class="flex space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-md',
                page === transactionStore.pagination.current_page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <!-- Page suivante -->
          <button
            @click="nextPage"
            :disabled="!transactionStore.pagination.has_more_pages"
            class="btn-icon"
            :class="!transactionStore.pagination.has_more_pages ? 'opacity-50 cursor-not-allowed' : ''"
          >
            ➡️
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation suppression -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            🗑️ Confirmer la suppression
          </h3>
          <p class="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer cette transaction ?
            <strong class="block mt-2">{{ transactionToDelete?.description }}</strong>
            <span :class="[
              'font-bold',
              transactionToDelete?.type === 'income' ? 'text-green-600' : 'text-red-600'
            ]">
              {{ transactionToDelete ? formatAmount(transactionToDelete) : '' }}
            </span>
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="cancelDelete"
              class="btn-outline"
            >
              Annuler
            </button>
            <button
              @click="executeDelete"
              :disabled="transactionStore.deleting"
              class="btn-danger"
            >
              <span v-if="transactionStore.deleting">⏳ Suppression...</span>
              <span v-else>🗑️ Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction, TransactionFilters } from '@/types/base'

// ==========================================
// PROPS & EMITS
// ==========================================

defineEmits<{
  openForm: []
  editTransaction: [transaction: Transaction]
}>()

// ==========================================
// STORES & STATE
// ==========================================

const transactionStore = useTransactionStore()

// Filtres locaux
const filters = ref<TransactionFilters>({
  type: '',
  search: '',
  per_page: 15
})

const selectedPeriod = ref('')

// Modal de suppression
const showDeleteModal = ref(false)
const transactionToDelete = ref<Transaction | null>(null)

// Debounce pour la recherche
let searchTimeout: NodeJS.Timeout | null = null

// ==========================================
// COMPUTED
// ==========================================

/**
 * Pages visibles dans la pagination
 */
const visiblePages = computed(() => {
  const current = transactionStore.pagination.current_page
  const last = transactionStore.pagination.last_page
  const pages: number[] = []

  // Logique pour afficher au maximum 5 pages
  let start = Math.max(1, current - 2)
  let end = Math.min(last, current + 2)

  // Ajuster si on est près du début ou de la fin
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(last, start + 4)
    } else {
      start = Math.max(1, end - 4)
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// ==========================================
// METHODS
// ==========================================

/**
 * Charger les données initiales
 */
async function loadData() {
  await transactionStore.fetchTransactions()
}

/**
 * Actualiser les données
 */
async function refreshData() {
  await transactionStore.refresh()
}

/**
 * Appliquer les filtres
 */
async function applyFilters() {
  const filterData: TransactionFilters = {
    ...filters.value,
    page: 1 // Reset à la première page
  }

  // Nettoyer les filtres vides
  Object.keys(filterData).forEach(key => {
    if (filterData[key as keyof TransactionFilters] === '') {
      delete filterData[key as keyof TransactionFilters]
    }
  })

  await transactionStore.applyFilters(filterData)
}

/**
 * Recherche avec debounce
 */
function debouncedSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

/**
 * Appliquer filtre par période
 */
function applyPeriodFilter() {
  const now = new Date()
  let dateFrom = ''
  let dateTo = ''

  switch (selectedPeriod.value) {
    case 'today':
      dateFrom = dateTo = now.toISOString().split('T')[0]
      break
    case 'week':
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      dateFrom = weekStart.toISOString().split('T')[0]
      dateTo = new Date().toISOString().split('T')[0]
      break
    case 'month':
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      dateTo = new Date().toISOString().split('T')[0]
      break
    case 'year':
      dateFrom = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      dateTo = new Date().toISOString().split('T')[0]
      break
  }

  filters.value.date_from = dateFrom
  filters.value.date_to = dateTo
  applyFilters()
}

/**
 * Réinitialiser les filtres
 */
async function resetFilters() {
  filters.value = {
    type: '',
    search: '',
    per_page: 15
  }
  selectedPeriod.value = ''
  await transactionStore.resetFilters()
}

/**
 * Navigation pagination
 */
async function previousPage() {
  if (transactionStore.pagination.current_page > 1) {
    await transactionStore.changePage(transactionStore.pagination.current_page - 1)
  }
}

async function nextPage() {
  if (transactionStore.pagination.has_more_pages) {
    await transactionStore.changePage(transactionStore.pagination.current_page + 1)
  }
}

async function goToPage(page: number) {
  await transactionStore.changePage(page)
}

/**
 * Gestion suppression
 */
function confirmDelete(transaction: Transaction) {
  transactionToDelete.value = transaction
  showDeleteModal.value = true
}

function cancelDelete() {
  transactionToDelete.value = null
  showDeleteModal.value = false
}

async function executeDelete() {
  if (transactionToDelete.value) {
    const success = await transactionStore.deleteTransaction(transactionToDelete.value.id)
    if (success) {
      cancelDelete()
    }
  }
}

/**
 * Formatage
 */
function formatAmount(transaction: Transaction): string {
  const sign = transaction.type === 'income' ? '+' : '-'
  return `${sign}${transaction.amount.toLocaleString('fr-FR')} €`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  loadData()
})
</script>

<style scoped>
@import "tailwindcss/theme" reference;
/* ==========================================
   BOUTONS RÉUTILISABLES
   ========================================== */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200;
}

.btn-outline {
  @apply border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200;
}

.btn-danger {
  @apply bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
}

.btn-icon {
  @apply p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200;
}

/* ==========================================
   FORMULAIRES
   ========================================== */
.form-select {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
}

.form-input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
}

/* ==========================================
   ALERTES
   ========================================== */
.alert-error {
  @apply bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg;
}

/* ==========================================
   MODAL
   ========================================== */
.modal-overlay {
  @apply fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}

/* ==========================================
   ANIMATIONS ET HOVER EFFECTS
   ========================================== */
.transaction-item:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease-in-out;
}

/* ==========================================
   RESPONSIVE HELPERS
   ========================================== */
.desktop-only {
  @apply hidden lg:block;
}

.mobile-only {
  @apply block lg:hidden;
}

/* ==========================================
   GRID LAYOUT PERSONNALISÉ
   ========================================== */
.table-header {
  @apply hidden lg:grid lg:grid-cols-12 gap-4 py-3 px-4 bg-gray-50 rounded-lg font-medium text-gray-700 text-sm mb-4;
}

.transaction-row {
  @apply hidden lg:grid lg:grid-cols-12 gap-4 p-4 items-center;
}

/* ==========================================
   COLONNES DU TABLEAU
   ========================================== */
.col-type {
  @apply col-span-1;
}

.col-description {
  @apply col-span-3;
}

.col-amount {
  @apply col-span-2;
}

.col-category {
  @apply col-span-2;
}

.col-date {
  @apply col-span-2;
}

.col-actions {
  @apply col-span-2 flex justify-center space-x-2;
}

/* ==========================================
   BADGES ET ÉTIQUETTES
   ========================================== */
.type-badge {
  @apply inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium;
}

.type-income {
  @apply bg-green-100 text-green-800;
}

.type-expense {
  @apply bg-red-100 text-red-800;
}

.category-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800;
}

/* ==========================================
   TEXTE ET TYPOGRAPHIE
   ========================================== */
.description-text {
  @apply font-medium text-gray-900 truncate;
}

.reference-text {
  @apply text-sm text-gray-500;
}

.amount-text {
  @apply font-bold text-lg;
}

.amount-income {
  @apply text-green-600;
}

.amount-expense {
  @apply text-red-600;
}

.date-text {
  @apply text-sm font-medium text-gray-900;
}

.time-text {
  @apply text-xs text-gray-500;
}

.no-category {
  @apply text-gray-400 text-sm;
}

/* ==========================================
   PAGINATION
   ========================================== */
.pagination {
  @apply flex flex-col sm:flex-row items-center justify-between mt-8 gap-4;
}

.pagination-info {
  @apply text-sm text-gray-700;
}

.pagination-controls {
  @apply flex items-center space-x-2;
}

.page-numbers {
  @apply flex space-x-1;
}

.page-btn {
  @apply px-3 py-2 text-sm font-medium rounded-md transition-colors;
}

.page-btn:not(.active) {
  @apply text-gray-700 hover:bg-gray-100;
}

.page-btn.active {
  @apply bg-blue-600 text-white;
}

.pagination-btn {
  @apply p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200;
}

.pagination-btn.disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* ==========================================
   ÉTATS SPÉCIAUX
   ========================================== */
.loading-state {
  @apply text-center py-12;
}

.loading-content {
  @apply inline-flex items-center space-x-2;
}

.spinner {
  @apply animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600;
}

.loading-text {
  @apply text-gray-600;
}

.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-6xl mb-4;
}

.empty-title {
  @apply text-lg font-medium text-gray-900 mb-2;
}

.empty-text {
  @apply text-gray-600 mb-6;
}

/* ==========================================
   MOBILE LAYOUT
   ========================================== */
.transaction-mobile {
  @apply lg:hidden p-4;
}

.mobile-header {
  @apply flex items-start justify-between mb-3;
}

.mobile-info {
  @apply flex items-center space-x-3 flex-1;
}

.mobile-details {
  @apply flex-1;
}

.mobile-footer {
  @apply flex items-center justify-between text-sm text-gray-500;
}

.mobile-actions {
  @apply flex space-x-2;
}

.btn-text {
  @apply text-sm hover:underline transition-colors;
}

.btn-edit {
  @apply text-blue-600 hover:text-blue-800;
}

.btn-delete {
  @apply text-red-600 hover:text-red-800;
}

/* ==========================================
   MODAL SPÉCIFIQUE
   ========================================== */
.modal-body {
  @apply p-6;
}

.modal-title {
  @apply text-lg font-medium text-gray-900 mb-4;
}

.modal-text {
  @apply text-gray-600 mb-6;
}

.transaction-preview {
  @apply bg-gray-50 p-3 rounded-lg mb-6;
}

.transaction-preview strong {
  @apply block mb-2;
}

.modal-actions {
  @apply flex justify-end space-x-3;
}
</style>
