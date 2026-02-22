<!-- src/components/dashboard/RecentTransactions.vue -->

<template>
  <div class="recent-transactions-card">
    <div class="card-header">
      <h2 class="card-title">📝 Transactions récentes</h2>
      <router-link to="/app/transactions" class="link-view-all"> Voir tout → </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="transactions.length === 0" class="empty-state">
      <span class="empty-icon">💳</span>
      <p class="empty-text">Aucune transaction récente</p>
      <router-link to="/app/transactions" class="btn-add"> Ajouter une transaction </router-link>
    </div>

    <!-- Transactions List -->
    <div v-else class="transactions-list">
      <div
        v-for="transaction in displayedTransactions"
        :key="transaction.id"
        class="transaction-item"
        @click="handleTransactionClick(transaction.id)"
      >
        <div class="transaction-left">
          <div
            class="transaction-icon"
            :style="{ background: transaction.category?.color + '20' || '#e2e8f0' }"
          >
            <span>{{ transaction.category?.icon || '💰' }}</span>
          </div>

          <div class="transaction-info">
            <h4 class="transaction-description">
              {{ transaction.description }}
            </h4>
            <p class="transaction-meta">
              <span class="transaction-category">
                {{ transaction.category?.name || 'Non catégorisé' }}
              </span>
              <span class="transaction-date">
                {{ formatDate(transaction.transaction_date || transaction.date) }}
              </span>
            </p>
          </div>
        </div>

        <div class="transaction-right">
          <span
            class="transaction-amount"
            :class="transaction.type === 'income' ? 'amount-positive' : 'amount-negative'"
          >
            {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
          </span>

          <span
            v-if="transaction.is_recurring"
            class="recurring-badge"
            title="Transaction récurrente"
          >
            🔄
          </span>
        </div>
      </div>

      <!-- Load More -->
      <button v-if="hasMore" class="btn-load-more" @click="loadMore" :disabled="isLoadingMore">
        {{ isLoadingMore ? 'Chargement...' : 'Charger plus' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TransactionApi } from '@/services/api/transactionApi'
import type { TransactionApiResponse } from '@/types/api.types'

/**
 * Composant des transactions récentes
 * École 42: Composant connecté à l'API
 */

interface Props {
  initialLimit?: number
  maxDisplay?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialLimit: 10,
  maxDisplay: 5,
})

const router = useRouter()

// State
const isLoading = ref(true)
const isLoadingMore = ref(false)
const error = ref<string | null>(null)
const transactions = ref<TransactionApiResponse[]>([])
const currentLimit = ref(props.initialLimit)

/**
 * Transactions affichées (limitées)
 */
const displayedTransactions = computed(() => {
  return transactions.value.slice(0, props.maxDisplay)
})

/**
 * Vérifie s'il y a plus de transactions
 */
const hasMore = computed(() => {
  return transactions.value.length > props.maxDisplay
})

/**
 * Charge les transactions
 */
const loadTransactions = async (): Promise<void> => {
  isLoading.value = true
  error.value = null

  try {
    transactions.value = await TransactionApi.getRecentTransactions(currentLimit.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur de chargement'
    console.error('Erreur transactions:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Charge plus de transactions
 */
const loadMore = async (): Promise<void> => {
  isLoadingMore.value = true
  currentLimit.value += 10

  try {
    transactions.value = await TransactionApi.getRecentTransactions(currentLimit.value)
  } catch (err: any) {
    console.error('Erreur load more:', err)
  } finally {
    isLoadingMore.value = false
  }
}

/**
 * Gère le clic sur une transaction
 */
const handleTransactionClick = (transactionId: number): void => {
  router.push(`/app/transactions?id=${transactionId}`)
}

/**
 * Formate une date (avec guard contre les valeurs invalides)
 */
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'

  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

/**
 * Formate un montant
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount || 0))
}

/**
 * Initialisation
 */
onMounted(() => {
  loadTransactions()
})
</script>

<style scoped>
.recent-transactions-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
}

.link-view-all {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.link-view-all:hover {
  color: #5568d3;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  text-align: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-text {
  color: #718096;
  font-size: 0.875rem;
}

.btn-add {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

/* Transactions List */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  background: #f7fafc;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: white;
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.transaction-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.transaction-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-description {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #718096;
}

.transaction-category {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-date {
  white-space: nowrap;
}

.transaction-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.transaction-amount {
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
}

.amount-positive {
  color: #48bb78;
}

.amount-negative {
  color: #4a5568;
}

.recurring-badge {
  font-size: 1.25rem;
  opacity: 0.5;
}

/* Load More Button */
.btn-load-more {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  transition: all 0.2s ease;
}

.btn-load-more:hover:not(:disabled) {
  background: white;
  border-color: #cbd5e0;
}

.btn-load-more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .recent-transactions-card {
    padding: 1.5rem;
  }

  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .transaction-right {
    width: 100%;
    justify-content: space-between;
  }

  .transaction-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
