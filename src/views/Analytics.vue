<template>
  <div class="analytics-page">
    <!-- Debug Panel -->
    <div v-if="debugMode" class="debug-panel">
      <h3>🔍 Debug Panel - Analytics</h3>
      <div class="debug-content">
        <div class="debug-section">
          <strong>Store State:</strong>
          <pre>{{
            {
              loading: loading,
              period: selectedPeriod,
              statsAvailable: !!stats,
            }
          }}</pre>
        </div>
        <div class="debug-section">
          <strong>Stats:</strong>
          <pre>{{ stats }}</pre>
        </div>
        <div class="debug-section">
          <strong>Category Breakdown:</strong>
          <pre>{{ categoryBreakdown }}</pre>
        </div>
      </div>
    </div>
    <button @click="testToasts">🧪 Tester les toasts</button>
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">📊 Analytics</h1>
          <p class="page-subtitle">Analysez vos finances</p>
        </div>

        <!-- Period Selector -->
        <div class="period-selector">
          <select v-model="selectedPeriod" @change="handlePeriodChange" class="period-input">
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
            <option value="all">Tout</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Chargement des analytics...</p>
    </div>

    <!-- Content -->
    <div v-else class="analytics-content">
      <!-- Summary Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-income">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <p class="stat-label">Revenus totaux</p>
            <p class="stat-value">{{ formatDisplayCurrency(stats.totalIncome) }}</p>
            <p class="stat-change positive">{{ stats.incomeChange }} vs période précédente</p>
          </div>
        </div>

        <div class="stat-card stat-expense">
          <div class="stat-icon">📉</div>
          <div class="stat-info">
            <p class="stat-label">Dépenses totales</p>
            <p class="stat-value">{{ formatDisplayCurrency(stats.totalExpenses) }}</p>
            <p class="stat-change negative">{{ stats.expenseChange }} vs période précédente</p>
          </div>
        </div>

        <div class="stat-card stat-balance">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <p class="stat-label">Solde net</p>
            <p class="stat-value">{{ formatDisplayCurrency(stats.netBalance) }}</p>
            <p class="stat-change" :class="stats.netBalance >= 0 ? 'positive' : 'negative'">
              {{ stats.balanceChange }} vs période précédente
            </p>
          </div>
        </div>

        <div class="stat-card stat-transactions">
          <div class="stat-icon">🔄</div>
          <div class="stat-info">
            <p class="stat-label">Transactions</p>
            <p class="stat-value">{{ stats.transactionCount }}</p>
            <p class="stat-change neutral">{{ stats.transactionChange }} vs période précédente</p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Category Breakdown -->
        <div class="gaming-card category-breakdown">
          <h3 class="card-title">🏷️ Répartition par catégorie</h3>

          <div v-if="categoryBreakdown.length === 0" class="empty-chart">
            <p>Aucune donnée pour cette période</p>
          </div>

          <div v-else class="category-list">
            <div v-for="category in categoryBreakdown" :key="category.id" class="category-item">
              <div class="category-header">
                <div class="category-info">
                  <div
                    class="category-color"
                    :style="{ backgroundColor: category.color || getRandomColor() }"
                  ></div>
                  <span class="category-name">{{ category.icon }} {{ category.name }}</span>
                </div>
                <div class="category-stats">
                  <span class="category-amount">{{ formatDisplayCurrency(category.total) }}</span>
                  <span class="category-percentage"
                    >{{ calculatePercentage(category.total) }}%</span
                  >
                </div>
              </div>
              <div class="category-bar">
                <div
                  class="category-bar-fill"
                  :style="{
                    width: `${calculatePercentage(category.total)}%`,
                    backgroundColor: category.color || getRandomColor(),
                  }"
                ></div>
              </div>
              <div class="category-details">
                <span class="category-count"
                  >{{ category.count }} transaction{{ category.count > 1 ? 's' : '' }}</span
                >
                <span class="category-average"
                  >Moy: {{ formatDisplayCurrency(category.average) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Top Categories -->
        <div class="gaming-card top-categories">
          <h3 class="card-title">🏆 Top catégories</h3>

          <div v-if="topCategories.length === 0" class="empty-chart">
            <p>Aucune donnée</p>
          </div>

          <div v-else class="top-list">
            <div v-for="(category, index) in topCategories" :key="category.id" class="top-item">
              <div class="top-rank">
                <span class="rank-number" :class="`rank-${index + 1}`">
                  {{ index + 1 }}
                </span>
              </div>
              <div class="top-info">
                <div class="top-name">{{ category.icon }} {{ category.name }}</div>
                <div class="top-amount">{{ formatDisplayCurrency(category.total) }}</div>
              </div>
              <div class="top-badge">{{ category.count }} tx</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trends Section -->
      <div class="gaming-card trends-section">
        <h3 class="card-title">📈 Tendances</h3>
        <div class="trends-grid">
          <div class="trend-item trend-up">
            <div class="trend-label">Revenus</div>
            <div class="trend-value">{{ formatDisplayCurrency(stats.totalIncome) }}</div>
            <div class="trend-change">+12% ↗</div>
          </div>

          <div class="trend-item trend-down">
            <div class="trend-label">Dépenses</div>
            <div class="trend-value">{{ formatDisplayCurrency(stats.totalExpenses) }}</div>
            <div class="trend-change">+8% ↗</div>
          </div>

          <div class="trend-item trend-neutral">
            <div class="trend-label">Épargne</div>
            <div class="trend-value">{{ formatDisplayCurrency(stats.netBalance) }}</div>
            <div class="trend-change">
              {{ stats.netBalance >= 0 ? '+' : '-' }}{{ Math.abs(calculateSavingsRate()) }}% →
            </div>
          </div>

          <div class="trend-item trend-info">
            <div class="trend-label">Taux d'épargne</div>
            <div class="trend-value">{{ calculateSavingsRate() }}%</div>
            <div class="trend-change">{{ getSavingsRateStatus() }}</div>
          </div>
        </div>
      </div>

      <!-- Insights Section -->
      <div class="gaming-card insights-section">
        <h3 class="card-title">💡 Insights & Conseils</h3>
        <div class="insights-grid">
          <div
            v-for="insight in insights"
            :key="insight.type"
            class="insight-card"
            :class="`insight-${insight.type}`"
          >
            <div class="insight-icon">{{ insight.icon }}</div>
            <div class="insight-content">
              <div class="insight-title">{{ insight.title }}</div>
              <div class="insight-text">{{ insight.message }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Comparison -->
      <div class="gaming-card monthly-comparison">
        <h3 class="card-title">📅 Comparaison mensuelle</h3>
        <div class="comparison-table">
          <div class="comparison-header">
            <div class="comparison-col">Catégorie</div>
            <div class="comparison-col">Ce mois</div>
            <div class="comparison-col">Mois dernier</div>
            <div class="comparison-col">Évolution</div>
          </div>
          <div v-for="category in monthlyComparison" :key="category.id" class="comparison-row">
            <div class="comparison-col comparison-name">
              {{ category.icon }} {{ category.name }}
            </div>
            <div class="comparison-col">
              {{ formatDisplayCurrency(category.current) }}
            </div>
            <div class="comparison-col">
              {{ formatDisplayCurrency(category.previous) }}
            </div>
            <div class="comparison-col">
              <span
                class="comparison-change"
                :class="category.evolution >= 0 ? 'positive' : 'negative'"
              >
                {{ category.evolution >= 0 ? '+' : '' }}{{ category.evolution }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <button @click="handleExportPDF" class="action-btn action-primary">
          📄 Exporter en PDF
        </button>
        <button @click="handleExportCSV" class="action-btn action-secondary">
          📊 Exporter en CSV
        </button>
        <button @click="handleRefresh" class="action-btn action-neutral">🔄 Actualiser</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Teste les différents types
const testToasts = () => {
  toast.success('✅ Transaction ajoutée avec succès !')

  setTimeout(() => {
    toast.info('ℹ️ Synchronisation en cours...')
  }, 500)

  setTimeout(() => {
    toast.warning('⚠️ Connexion instable')
  }, 1000)

  setTimeout(() => {
    toast.error('❌ Erreur lors de la sauvegarde')
  }, 1500)
}

// ==========================================
// STORES
// ==========================================

const transactionStore = useTransactionStore()

// ==========================================
// STATE
// ==========================================

const debugMode = ref(false)
const selectedPeriod = ref('month')
const loading = computed(() => transactionStore.loading)

// ==========================================
// COMPUTED - STATS
// ==========================================

const stats = computed(() => {
  const storeStats = transactionStore.stats

  if (!storeStats) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      transactionCount: 0,
      incomeChange: '+0%',
      expenseChange: '+0%',
      balanceChange: '+0%',
      transactionChange: '+0',
    }
  }

  const totalIncome = Number(storeStats.total_income) || 0
  const totalExpenses = Number(storeStats.total_expenses) || 0
  const netBalance = totalIncome - totalExpenses

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    transactionCount: storeStats.total_transactions || 0,
    incomeChange: '+12%',
    expenseChange: '+8%',
    balanceChange: netBalance >= 0 ? '+4%' : '-4%',
    transactionChange: '+15',
  }
})

const categoryBreakdown = computed(() => {
  const storeStats = transactionStore.stats
  if (!storeStats || !storeStats.top_categories) return []

  return storeStats.top_categories.map((cat: any) => ({
    id: cat.category?.id || 0,
    name: cat.category?.name || 'Sans catégorie',
    icon: cat.category?.icon || '📁',
    color: cat.category?.color || getRandomColor(),
    total: Number(cat.total) || 0,
    count: Number(cat.count) || 0,
    average: (Number(cat.total) || 0) / (Number(cat.count) || 1),
  }))
})

const topCategories = computed(() => {
  return categoryBreakdown.value.sort((a, b) => b.total - a.total).slice(0, 5)
})

const monthlyComparison = computed(() => {
  return categoryBreakdown.value.slice(0, 5).map((cat) => ({
    ...cat,
    current: cat.total,
    previous: cat.total * 0.85, // Simulation
    evolution: Math.round(((cat.total - cat.total * 0.85) / (cat.total * 0.85)) * 100),
  }))
})

const insights = computed(() => {
  const insights = []

  // Insight sur les dépenses
  if (stats.value.totalExpenses > stats.value.totalIncome * 0.8) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Attention',
      message: 'Vos dépenses représentent plus de 80% de vos revenus',
    })
  }

  // Insight sur l'épargne
  const savingsRate = calculateSavingsRate()
  if (savingsRate > 20) {
    insights.push({
      type: 'success',
      icon: '🎯',
      title: 'Excellent',
      message: `Vous épargnez ${savingsRate}% de vos revenus, continuez !`,
    })
  }

  // Insight sur la catégorie principale
  if (topCategories.value.length > 0) {
    const top = topCategories.value[0]
    insights.push({
      type: 'info',
      icon: '💡',
      title: 'Info',
      message: `${top.name} est votre catégorie principale avec ${formatDisplayCurrency(top.total)}`,
    })
  }

  return insights
})

// ==========================================
// METHODS
// ==========================================

function formatDisplayCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

function calculatePercentage(amount: number): number {
  const total = stats.value.totalExpenses
  if (total === 0) return 0
  return Math.round((amount / total) * 100)
}

function calculateSavingsRate(): number {
  if (stats.value.totalIncome === 0) return 0
  return Math.round((stats.value.netBalance / stats.value.totalIncome) * 100)
}

function getSavingsRateStatus(): string {
  const rate = calculateSavingsRate()
  if (rate >= 20) return 'Excellent ✨'
  if (rate >= 10) return 'Bien 👍'
  if (rate >= 0) return 'Moyen 😐'
  return 'Attention ⚠️'
}

function getRandomColor(): string {
  const colors = [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
    '#6366f1',
    '#f97316',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

async function handlePeriodChange() {
  try {
    loading.value = true
    await loadAnalytics()
    toast.success('📊 Période mise à jour')
  } catch (error: any) {
    toast.error('Erreur lors du changement de période')
  } finally {
    loading.value = false
  }
}

async function loadAnalytics() {
  try {
    console.log('📡 Chargement analytics...')
    await transactionStore.fetchStats()
    console.log('✅ Analytics chargées')
  } catch (error) {
    console.error('❌ Erreur chargement analytics:', error)
  }
}

const isRefreshing = ref(false)
async function handleRefresh() {
  if (isRefreshing.value) return

  try {
    isRefreshing.value = true
    toast.info('🔄 Actualisation...')
    await loadAnalytics()
    toast.success('✅ Données actualisées')
  } catch (error: any) {
    toast.error('❌ Erreur actualisation', {
      timeout: 0, // Toast persistant
      action: {
        text: 'Réessayer',
        onClick: () => handleRefresh(),
      },
    })
  } finally {
    isRefreshing.value = false
  }
}

function handleExportPDF() {
  console.log('📄 Export PDF')
  alert('Export PDF: Fonctionnalité à implémenter')
}

function handleExportCSV() {
  console.log('📊 Export CSV')
  alert('Export CSV: Fonctionnalité à implémenter')
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  console.log('🚀 [MOUNT] Mounting Analytics.vue')
  await loadAnalytics()
  console.log('✅ [MOUNT] Analytics.vue prêt')
})

// Watch period changes
watch(selectedPeriod, () => {
  loadAnalytics()
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

.analytics-page {
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
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 0.9375rem;
}

.period-selector {
  display: flex;
  gap: 0.5rem;
}

.period-input {
  padding: 0.625rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
  font-size: 0.875rem;
  background-color: white;
}

.period-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
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
  color: #6b7280;
}

/* ========================================== */
/* STATS GRID */
/* ========================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #059669;
}

.stat-change.negative {
  color: #dc2626;
}

.stat-change.neutral {
  color: #6b7280;
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
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.empty-chart {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

/* ========================================== */
/* CHARTS GRID */
/* ========================================== */

.charts-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Category Breakdown */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-item {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
}

.category-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.category-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-amount {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.category-percentage {
  font-size: 0.75rem;
  color: #6b7280;
}

.category-bar {
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.category-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s;
}

.category-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Top Categories */
.top-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.top-rank {
  flex-shrink: 0;
}

.rank-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
}

.rank-1 {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.rank-2 {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.rank-3 {
  background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
}

.rank-number:not(.rank-1):not(.rank-2):not(.rank-3) {
  background-color: #8b5cf6;
}

.top-info {
  flex: 1;
}

.top-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.top-amount {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.top-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 9999px;
}

/* ========================================== */
/* TRENDS */
/* ========================================== */

.trends-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .trends-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.trend-item {
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}

.trend-up {
  background-color: #d1fae5;
}

.trend-down {
  background-color: #fee2e2;
}

.trend-neutral {
  background-color: #dbeafe;
}

.trend-info {
  background-color: #fef3c7;
}

.trend-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.trend-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.trend-change {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

/* ========================================== */
/* INSIGHTS */
/* ========================================== */

.insights-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .insights-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.insight-card {
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  gap: 1rem;
}

.insight-warning {
  background-color: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.insight-success {
  background-color: #d1fae5;
  border-left: 4px solid #059669;
}

.insight-info {
  background-color: #dbeafe;
  border-left: 4px solid #3b82f6;
}

.insight-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.insight-text {
  font-size: 0.75rem;
  color: #6b7280;
}

/* ========================================== */
/* MONTHLY COMPARISON */
/* ========================================== */

.comparison-table {
  overflow-x: auto;
}

.comparison-header,
.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem;
  align-items: center;
}

.comparison-header {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.comparison-row {
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.comparison-row:last-child {
  border-bottom: none;
}

.comparison-col {
  overflow: hidden;
  text-overflow: ellipsis;
}

.comparison-name {
  font-weight: 500;
  color: #111827;
}

.comparison-change {
  font-weight: 600;
}

/* ========================================== */
/* ACTIONS */
/* ========================================== */

.actions-section {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.75rem;
  margin-top: 2rem;
}

@media (min-width: 640px) {
  .actions-section {
    grid-template-columns: repeat(3, 1fr);
  }
}

.action-btn {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  font-size: 0.875rem;
}

.action-primary {
  background: linear-gradient(to right, #8b5cf6, #ec4899);
  color: white;
}

.action-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.action-secondary {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.action-secondary:hover {
  background-color: #bfdbfe;
}

.action-neutral {
  background-color: #f3f4f6;
  color: #374151;
}

.action-neutral:hover {
  background-color: #e5e7eb;
}

/* ========================================== */
/* MOBILE RESPONSIVE */
/* ========================================== */

@media (max-width: 640px) {
  .analytics-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .gaming-card {
    padding: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .comparison-header,
  .comparison-row {
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap: 0.5rem;
    font-size: 0.75rem;
  }
}

/* ========================================== */
/* SAFE AREAS (iPhone) */
/* ========================================== */

@supports (padding: env(safe-area-inset-bottom)) {
  .analytics-page {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}
</style>
