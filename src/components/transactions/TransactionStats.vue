<template>
  <div class="transaction-stats bg-white rounded-xl shadow-lg p-6">
    <!-- Header avec titre -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">📊 Statistiques financières</h2>
        <p class="text-gray-600 mt-1">
          Analyse de vos transactions et progression gaming
        </p>
      </div>

      <!-- Sélecteur de période -->
      <div class="flex items-center space-x-3">
        <label class="text-sm font-medium text-gray-700">Période :</label>
        <select
          v-model="selectedPeriod"
          @change="updatePeriod"
          class="form-select-small"
        >
          <option value="week">7 derniers jours</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
          <option value="all">Toutes</option>
        </select>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-flex items-center space-x-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="text-gray-600">Chargement des statistiques...</span>
      </div>
    </div>

    <!-- Contenu principal -->
    <div v-else>

      <!-- Cartes de résumé -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <!-- Total des revenus -->
        <div class="stat-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-green-800">Revenus totaux</p>
              <p class="text-2xl font-bold text-green-900">
                {{ formatCurrency(stats.totalIncome) }}
              </p>
              <p class="text-xs text-green-600">
                {{ stats.incomeCount }} transaction(s)
              </p>
            </div>
          </div>
        </div>

        <!-- Total des dépenses -->
        <div class="stat-card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-red-800">Dépenses totales</p>
              <p class="text-2xl font-bold text-red-900">
                {{ formatCurrency(stats.totalExpenses) }}
              </p>
              <p class="text-xs text-red-600">
                {{ stats.expenseCount }} transaction(s)
              </p>
            </div>
          </div>
        </div>

        <!-- Bilan -->
        <div class="stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-blue-800">Bilan</p>
              <p
                class="text-2xl font-bold"
                :class="stats.balance >= 0 ? 'text-green-900' : 'text-red-900'"
              >
                {{ formatCurrency(stats.balance) }}
              </p>
              <p class="text-xs text-blue-600">
                {{ stats.balance >= 0 ? 'Excédent' : 'Déficit' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Moyenne par transaction -->
        <div class="stat-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-purple-800">Moyenne/transaction</p>
              <p class="text-2xl font-bold text-purple-900">
                {{ formatCurrency(stats.averageTransaction) }}
              </p>
              <p class="text-xs text-purple-600">
                {{ stats.totalTransactions }} au total
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        <!-- Graphique en barres - Évolution mensuelle -->
        <div class="chart-container">
          <h3 class="chart-title">📈 Évolution mensuelle</h3>
          <div class="chart-content">
            <div class="chart-bar-container">
              <div
                v-for="(month, index) in monthlyData"
                :key="index"
                class="chart-bar-group"
              >
                <div class="chart-bar-labels">
                  <span class="chart-bar-label">{{ month.label }}</span>
                </div>
                <div class="chart-bars">
                  <!-- Barre revenus -->
                  <div class="chart-bar-wrapper">
                    <div
                      class="chart-bar chart-bar-income"
                      :style="{ height: getBarHeight(month.income, maxMonthlyAmount) + '%' }"
                      :title="`Revenus: ${formatCurrency(month.income)}`"
                    ></div>
                  </div>
                  <!-- Barre dépenses -->
                  <div class="chart-bar-wrapper">
                    <div
                      class="chart-bar chart-bar-expense"
                      :style="{ height: getBarHeight(month.expenses, maxMonthlyAmount) + '%' }"
                      :title="`Dépenses: ${formatCurrency(month.expenses)}`"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color bg-green-500"></div>
                <span>Revenus</span>
              </div>
              <div class="legend-item">
                <div class="legend-color bg-red-500"></div>
                <span>Dépenses</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Graphique en secteurs - Répartition par catégories -->
        <div class="chart-container">
          <h3 class="chart-title">🎯 Répartition par catégories</h3>
          <div class="chart-content">
            <div class="pie-chart-container">
              <div class="pie-chart">
                <div
                  v-for="(category, index) in categoryData"
                  :key="index"
                  class="pie-slice"
                  :style="getPieSliceStyle(category.percentage, index)"
                  :title="`${category.name}: ${formatCurrency(category.amount)} (${category.percentage.toFixed(1)}%)`"
                ></div>
              </div>
              <div class="pie-chart-center">
                <div class="pie-chart-center-text">
                  <span class="text-sm text-gray-600">Total</span>
                  <span class="text-lg font-bold text-gray-900">
                    {{ formatCurrency(stats.totalExpenses) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="category-legend">
              <div
                v-for="(category, index) in categoryData"
                :key="index"
                class="category-legend-item"
              >
                <div
                  class="category-legend-color"
                  :style="{ backgroundColor: getCategoryColor(index) }"
                ></div>
                <span class="category-legend-text">{{ category.name }}</span>
                <span class="category-legend-amount">{{ formatCurrency(category.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Gaming -->
      <div class="gaming-section bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          🎮 Impact Gaming
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <!-- XP Gagné -->
          <div class="gaming-stat">
            <div class="gaming-stat-icon bg-blue-500">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="gaming-stat-content">
              <p class="gaming-stat-label">XP gagné sur la période</p>
              <p class="gaming-stat-value">+{{ gamingStats.xpEarned }} XP</p>
              <p class="gaming-stat-detail">{{ gamingStats.transactionsAdded }} transaction(s) ajoutée(s)</p>
            </div>
          </div>

          <!-- Achievements -->
          <div class="gaming-stat">
            <div class="gaming-stat-icon bg-yellow-500">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </div>
            <div class="gaming-stat-content">
              <p class="gaming-stat-label">Succès débloqués</p>
              <p class="gaming-stat-value">{{ gamingStats.achievementsUnlocked }}</p>
              <p class="gaming-stat-detail">Nouveaux succès obtenus</p>
            </div>
          </div>

          <!-- Streak -->
          <div class="gaming-stat">
            <div class="gaming-stat-icon bg-green-500">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
              </svg>
            </div>
            <div class="gaming-stat-content">
              <p class="gaming-stat-label">Série actuelle</p>
              <p class="gaming-stat-value">{{ gamingStats.currentStreak }} jours</p>
              <p class="gaming-stat-detail">Transactions quotidiennes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions récentes -->
      <div class="recent-transactions mt-8">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          ⏱️ Transactions récentes
        </h3>

        <div class="space-y-3">
          <div
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="recent-transaction-item"
          >
            <div class="flex items-center space-x-4">
              <div
                class="transaction-icon"
                :class="transaction.type === 'income' ? 'transaction-icon-income' : 'transaction-icon-expense'"
              >
                {{ transaction.type === 'income' ? '💰' : '💸' }}
              </div>
              <div class="flex-1">
                <p class="transaction-description">{{ transaction.description }}</p>
                <p class="transaction-details">
                  {{ formatDate(transaction.transaction_date) }}
                  <span v-if="transaction.category" class="transaction-category">
                    • {{ transaction.category.name }}
                  </span>
                </p>
              </div>
              <div class="transaction-amount">
                <span
                  :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
                  class="font-bold"
                >
                  {{ formatCurrency(transaction.amount, transaction.type) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction } from '@/types/base'

// ==========================================
// STORES & STATE
// ==========================================

const transactionStore = useTransactionStore()

// État local
const loading = ref(false)
const selectedPeriod = ref('month')

// ==========================================
// COMPUTED - STATISTIQUES
// ==========================================

/**
 * Statistiques principales calculées
 */
const stats = computed(() => {
  const transactions = transactionStore.transactions
  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const expenseTransactions = transactions.filter(t => t.type === 'expense')

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses
  const totalTransactions = transactions.length
  const averageTransaction = totalTransactions > 0 ? (totalIncome + totalExpenses) / totalTransactions : 0

  return {
    totalIncome,
    totalExpenses,
    balance,
    totalTransactions,
    averageTransaction,
    incomeCount: incomeTransactions.length,
    expenseCount: expenseTransactions.length
  }
})

/**
 * Données mensuelles pour le graphique en barres
 */
const monthlyData = computed(() => {
  const months = []
  const now = new Date()

  // Générer les 6 derniers mois
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    const monthTransactions = transactionStore.transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date)
      return transactionDate.getFullYear() === date.getFullYear() &&
        transactionDate.getMonth() === date.getMonth()
    })

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    months.push({
      label: date.toLocaleDateString('fr-FR', { month: 'short' }),
      income,
      expenses,
      key: monthKey
    })
  }

  return months
})

/**
 * Montant maximum pour les barres
 */
const maxMonthlyAmount = computed(() => {
  const allAmounts = monthlyData.value.flatMap(m => [m.income, m.expenses])
  return Math.max(...allAmounts, 1) // Éviter division par 0
})

/**
 * Données par catégorie pour le graphique en secteurs
 */
const categoryData = computed(() => {
  const categoryMap = new Map()

  transactionStore.transactions
    .filter(t => t.type === 'expense' && t.category)
    .forEach(t => {
      const categoryName = t.category!.name
      const current = categoryMap.get(categoryName) || 0
      categoryMap.set(categoryName, current + t.amount)
    })

  const total = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0)

  return Array.from(categoryMap.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8) // Top 8 catégories
})

/**
 * Statistiques gaming simulées
 */
const gamingStats = computed(() => {
  const transactionCount = transactionStore.transactions.length

  return {
    xpEarned: transactionCount * 10, // 10 XP par transaction
    achievementsUnlocked: Math.floor(transactionCount / 5), // 1 achievement tous les 5 transactions
    currentStreak: Math.min(transactionCount, 7), // Streak max 7 jours
    transactionsAdded: transactionCount
  }
})

/**
 * Transactions récentes (5 dernières)
 */
const recentTransactions = computed(() => {
  return transactionStore.transactions
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
})

// ==========================================
// METHODS
// ==========================================

/**
 * Mettre à jour la période sélectionnée
 */
async function updatePeriod() {
  loading.value = true

  try {
    // Ici, on pourrait filtrer les transactions selon la période
    // Pour l'instant, on utilise toutes les transactions
    await transactionStore.fetchTransactions()
  } catch (error) {
    console.error('Erreur lors du changement de période:', error)
  } finally {
    loading.value = false
  }
}

/**
 * Calculer la hauteur d'une barre (en pourcentage)
 */
function getBarHeight(amount: number, maxAmount: number): number {
  return maxAmount > 0 ? (amount / maxAmount) * 100 : 0
}

/**
 * Obtenir la couleur d'une catégorie
 */
function getCategoryColor(index: number): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]
  return colors[index % colors.length]
}

/**
 * Obtenir le style d'un secteur du graphique en secteurs
 */
function getPieSliceStyle(percentage: number, index: number) {
  // Implémentation simplifiée - pour un vrai graphique, utiliser une lib comme Chart.js
  return {
    backgroundColor: getCategoryColor(index),
    opacity: 0.8
  }
}

/**
 * Formater une devise
 */
function formatCurrency(amount: number, type: 'income' | 'expense' | null = null): string {
  const sign = type === 'income' ? '+' : type === 'expense' ? '-' : ''
  return `${sign}${amount.toLocaleString('fr-FR')} €`
}

/**
 * Formater une date
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// ==========================================
// WATCHERS
// ==========================================

/**
 * Recharger les stats quand les transactions changent
 */
watch(
  () => transactionStore.transactions,
  () => {
    // Les computed se mettent à jour automatiquement
  },
  { deep: true }
)

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  loading.value = true

  try {
    // Charger les transactions si pas déjà fait
    if (transactionStore.transactions.length === 0) {
      await transactionStore.fetchTransactions()
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ==========================================
   CARTES STATISTIQUES
   ========================================== */
.stat-card {
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid;
  background: white;
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-2px);
}

/* ==========================================
   SÉLECTEUR DE PÉRIODE
   ========================================== */
.form-select-small {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-select-small:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ==========================================
   GRAPHIQUES
   ========================================== */
.chart-container {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

.chart-content {
  height: 300px;
  display: flex;
  flex-direction: column;
}

/* Graphique en barres */
.chart-bar-container {
  display: flex;
  justify-content: space-between;
  align-items: end;
  height: 200px;
  margin-bottom: 1rem;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin: 0 0.25rem;
}

.chart-bar-labels {
  margin-bottom: 0.5rem;
}

.chart-bar-label {
  font-size: 0.75rem;
  color: #5b6270;
  font-weight: 500;
}

.chart-bars {
  display: flex;
  align-items: end;
  height: 160px;
  gap: 0.25rem;
}

.chart-bar-wrapper {
  width: 20px;
}

.chart-bar {
  width: 100%;
  min-height: 4px;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.chart-bar-income {
  background: linear-gradient(to top, #10b981, #34d399);
}

.chart-bar-expense {
  background: linear-gradient(to top, #ef4444, #f87171);
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #5b6270;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* Graphique en secteurs */
.pie-chart-container {
  position: relative;
  height: 200px;
  margin-bottom: 1rem;
}

.pie-chart {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border: 8px solid #f3f4f6;
}

.pie-chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-chart-center-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 120px;
  overflow-y: auto;
}

.category-legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.category-legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.category-legend-text {
  flex: 1;
  color: #374151;
}

.category-legend-amount {
  font-weight: 500;
  color: #111827;
}

/* ==========================================
   SECTION GAMING
   ========================================== */
.gaming-section {
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
}

.gaming-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
}

.gaming-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.gaming-stat-content {
  flex: 1;
}

.gaming-stat-label {
  font-size: 0.875rem;
  color: #5b6270;
  margin-bottom: 0.25rem;
}

.gaming-stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.25rem;
}

.gaming-stat-detail {
  font-size: 0.75rem;
  color: #8c939f;
}

/* ==========================================
   TRANSACTIONS RÉCENTES
   ========================================== */
.recent-transaction-item {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.recent-transaction-item:hover {
  background: #f3f4f6;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.transaction-icon-income {
  background: #dcfce7;
}

.transaction-icon-expense {
  background: #fee2e2;
}

.transaction-description {
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
}

.transaction-details {
  font-size: 0.875rem;
  color: #5b6270;
}

.transaction-category {
  color: #3b82f6;
}

.transaction-amount {
  text-align: right;
  font-size: 1.125rem;
}
</style>
