<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useGoalStore } from '@/stores/goalStore'
import { useAuthStore } from '@/stores/authStore'

// ==========================================
// STORES
// ==========================================

const dashboardStore = useDashboardStore()
const transactionStore = useTransactionStore()
const goalStore = useGoalStore()
const authStore = useAuthStore()

// ==========================================
// DEBUG STATE
// ==========================================

const showDebug = ref(false)
const rawApiResponse = ref<any>(null)

// ==========================================
// COMPUTED
// ==========================================

const isLoading = computed(
  () => dashboardStore.loading || transactionStore.loading || goalStore.loading,
)

const stats = computed(() => dashboardStore.stats)
const hasData = computed(() => dashboardStore.hasData)

// ✅ COMPUTED SÉCURISÉS pour les valeurs gaming
const userLevel = computed(() => {
  const user = stats.value?.user
  if (!user) return 1
  // Si c'est un objet avec .level, extraire la valeur
  if (typeof user.level === 'object' && user.level !== null) {
    return user.level.level ?? 1
  }
  return user.level ?? 1
})

const userXp = computed(() => {
  const user = stats.value?.user
  if (!user) return 0
  // Si c'est un objet avec .level qui contient total_xp
  if (typeof user.level === 'object' && user.level !== null) {
    return user.level.total_xp ?? 0
  }
  return user.xp ?? user.total_xp ?? 0
})

const userAchievements = computed(() => {
  const user = stats.value?.user
  if (!user) return 0
  // Si c'est un array, retourner la longueur
  if (Array.isArray(user.achievements)) {
    return user.achievements.length
  }
  return user.achievements ?? 0
})

const streakDays = computed(() => {
  const streak = stats.value?.streak
  if (!streak) return 0
  return streak.days ?? streak.current_count ?? 0
})

// ==========================================
// MÉTHODES
// ==========================================

async function loadDashboardData(): Promise<void> {
  console.group('📊 === CHARGEMENT DASHBOARD ===')

  try {
    if (!authStore.isAuthenticated) {
      console.warn('⚠️ Non authentifié')
      console.groupEnd()
      return
    }

    console.log('🔄 Chargement des stats...')
    await dashboardStore.fetchStats()

    rawApiResponse.value = {
      stats: dashboardStore.stats,
      hasData: dashboardStore.hasData,
      error: dashboardStore.error,
    }

    console.log('📦 Données reçues:', rawApiResponse.value)

    await Promise.allSettled([
      transactionStore.fetchTransactions().catch((err) => {
        console.warn('⚠️ Erreur transactions:', err.message)
      }),
      goalStore.fetchGoals().catch((err) => {
        console.warn('⚠️ Erreur objectifs:', err.message)
      }),
    ])

    console.log('✅ Chargement terminé')
  } catch (err: any) {
    console.error('❌ Erreur:', err)
  } finally {
    console.groupEnd()
  }
}

async function refreshData(): Promise<void> {
  await loadDashboardData()
}

function toggleDebug(): void {
  showDebug.value = !showDebug.value
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  console.log('🎯 Dashboard monté')

  if (authStore.isAuthenticated) {
    await loadDashboardData()
  }
})
</script>

<template>
  <div class="dashboard-container">
    <!-- HEADER -->
    <div class="dashboard-header">
      <h1>📊 Tableau de bord</h1>
      <div class="header-actions">
        <button @click="toggleDebug" class="debug-button" :class="{ active: showDebug }">
          🛠 Debug
        </button>
        <button @click="refreshData" :disabled="isLoading" class="refresh-button">
          <span v-if="!isLoading">🔄 Actualiser</span>
          <span v-else>⏳ Chargement...</span>
        </button>
      </div>
    </div>

    <!-- DEBUG PANEL -->
    <div v-if="showDebug" class="debug-panel">
      <h3>🛠 Debug Panel</h3>

      <div class="debug-section">
        <h4>📡 État Auth</h4>
        <pre>{{
          {
            isAuthenticated: authStore.isAuthenticated,
            isInitialized: authStore.isInitialized,
            user: authStore.user?.email,
          }
        }}</pre>
      </div>

      <div class="debug-section">
        <h4>📦 Réponse API Brute</h4>
        <pre>{{ rawApiResponse }}</pre>
      </div>

      <div class="debug-section">
        <h4>🎮 Valeurs Gaming Computed</h4>
        <pre>{{
          {
            userLevel: userLevel,
            userXp: userXp,
            userAchievements: userAchievements,
            streakDays: streakDays,
          }
        }}</pre>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="isLoading && !hasData" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement de votre tableau de bord...</p>
    </div>

    <!-- CONTENU PRINCIPAL -->
    <div v-else class="dashboard-content">
      <!-- Stats principales -->
      <div v-if="stats" class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <h3>Solde total</h3>
          <p class="stat-value">
            {{ dashboardStore.formatCurrency(stats.total_balance) }}
          </p>
          <p class="stat-detail">Balance de tous vos comptes</p>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <h3>Capacité d'épargne</h3>
          <p
            class="stat-value"
            :class="{
              positive: stats.savings_capacity?.is_positive,
              negative: !stats.savings_capacity?.is_positive,
            }"
          >
            {{ dashboardStore.formatCurrency(stats.savings_capacity?.amount || 0) }}
          </p>
          <p class="stat-detail">
            {{ stats.savings_capacity?.calculation?.formula || 'Revenus - Dépenses' }}
          </p>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <h3>Revenus du mois</h3>
          <p class="stat-value positive">
            {{ dashboardStore.formatCurrency(stats.current_month?.income || 0) }}
          </p>
          <p class="stat-detail">{{ stats.current_month?.transactions_count || 0 }} transactions</p>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📉</div>
          <h3>Dépenses du mois</h3>
          <p class="stat-value negative">
            {{ dashboardStore.formatCurrency(stats.current_month?.expenses || 0) }}
          </p>
          <p class="stat-detail">
            Net: {{ dashboardStore.formatCurrency(stats.current_month?.net || 0) }}
          </p>
        </div>
      </div>

      <!-- Comparaison -->
      <div v-if="stats?.comparison" class="comparison-card">
        <h2>📊 Évolution vs mois dernier</h2>
        <div class="comparison-content">
          <div class="comparison-item">
            <span class="label">Tendance</span>
            <span class="value" :class="`trend-${stats.comparison.trend}`">
              {{
                stats.comparison.trend === 'up'
                  ? '📈'
                  : stats.comparison.trend === 'down'
                    ? '📉'
                    : '➡️'
              }}
              {{ dashboardStore.formatPercent(stats.comparison.change_percent) }}
            </span>
          </div>
          <div class="comparison-item">
            <span class="label">Mois dernier</span>
            <span class="value">
              {{ dashboardStore.formatCurrency(stats.comparison.last_month_capacity) }}
            </span>
          </div>
          <div class="comparison-item">
            <span class="label">Ce mois</span>
            <span class="value">
              {{ dashboardStore.formatCurrency(stats.comparison.current_month_capacity) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Objectifs -->
      <div v-if="stats?.goals" class="goals-card">
        <h2>🎯 Vos objectifs</h2>
        <div class="goals-content">
          <div class="goal-stat">
            <span class="goal-label">Objectifs actifs</span>
            <span class="goal-value">{{ stats.goals.active_count }}</span>
          </div>
          <div class="goal-stat">
            <span class="goal-label">Avec contributions</span>
            <span class="goal-value">{{ stats.goals.goals_with_target }}</span>
          </div>
          <div class="goal-stat">
            <span class="goal-label">Total épargné</span>
            <span class="goal-value">
              {{ dashboardStore.formatCurrency(stats.goals.total_saved) }}
            </span>
          </div>
          <div class="goal-stat">
            <span class="goal-label">Objectif total</span>
            <span class="goal-value">
              {{ dashboardStore.formatCurrency(stats.goals.total_target) }}
            </span>
          </div>
        </div>

        <div
          v-if="stats.goals.capacity_status"
          class="capacity-status"
          :class="`status-${stats.goals.capacity_status.status}`"
        >
          <div class="status-icon">
            {{
              stats.goals.capacity_status.status === 'excellent'
                ? '✅'
                : stats.goals.capacity_status.status === 'warning'
                  ? '⚠️'
                  : '❌'
            }}
          </div>
          <div class="status-message">
            {{ stats.goals.capacity_status.message }}
          </div>
        </div>
      </div>

      <!-- ✅ Gaming avec valeurs SCALAIRES -->
      <div v-if="stats?.user" class="gaming-card">
        <h2>🎮 Progression Gaming</h2>
        <div class="gaming-content">
          <div class="gaming-stat">
            <span class="gaming-icon">🏆</span>
            <div>
              <span class="gaming-label">Niveau</span>
              <!-- ✅ Utiliser le computed sécurisé -->
              <span class="gaming-value">{{ userLevel }}</span>
            </div>
          </div>
          <div class="gaming-stat">
            <span class="gaming-icon">⭐</span>
            <div>
              <span class="gaming-label">XP</span>
              <!-- ✅ Utiliser le computed sécurisé -->
              <span class="gaming-value">{{ userXp }}</span>
            </div>
          </div>
          <div class="gaming-stat">
            <span class="gaming-icon">🎯</span>
            <div>
              <span class="gaming-label">Succès</span>
              <!-- ✅ Utiliser le computed sécurisé -->
              <span class="gaming-value">{{ userAchievements }}</span>
            </div>
          </div>
        </div>

        <!-- Streak -->
        <div v-if="stats.streak && streakDays > 0" class="streak-info">
          <span class="streak-icon">🔥</span>
          <span class="streak-text"> Série active : {{ streakDays }} jours </span>
        </div>
      </div>

      <!-- Période -->
      <div v-if="stats?.period" class="period-info">
        <p>📅 Période : {{ stats.period.label }}</p>
        <p class="period-dates">
          Du {{ new Date(stats.period.start).toLocaleDateString('fr-FR') }} au
          {{ new Date(stats.period.end).toLocaleDateString('fr-FR') }}
        </p>
      </div>

      <!-- Message si aucune donnée -->
      <div v-if="!stats && !isLoading" class="no-data">
        <div class="no-data-icon">📊</div>
        <h3>Aucune donnée disponible</h3>
        <p>Commencez par ajouter des transactions ou créer des objectifs</p>
        <button @click="refreshData" class="retry-button">🔄 Recharger</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles identiques au Dashboard.vue original */
.dashboard-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}
.header-actions {
  display: flex;
  gap: 1rem;
}

.debug-button,
.refresh-button,
.retry-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}
.debug-button {
  background: #f3f4f6;
  color: #6b7280;
}
.debug-button.active {
  background: #fbbf24;
  color: #111827;
}
.refresh-button,
.retry-button {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  color: white;
}
.refresh-button:hover:not(:disabled),
.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
}
.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.debug-panel {
  background: #1f2937;
  color: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  max-height: 600px;
  overflow-y: auto;
}
.debug-panel h3 {
  margin-bottom: 1rem;
  color: #fbbf24;
}
.debug-section {
  margin-bottom: 1.5rem;
}
.debug-section h4 {
  color: #a855f7;
  margin-bottom: 0.5rem;
}
.debug-section pre {
  background: #111827;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #a855f7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.stat-card h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}
.stat-value.positive {
  color: #10b981;
}
.stat-value.negative {
  color: #ef4444;
}
.stat-detail {
  font-size: 0.75rem;
  color: #9ca3af;
}

.comparison-card,
.goals-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}
.comparison-card h2,
.goals-card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.comparison-content,
.goals-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
.comparison-item,
.goal-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.comparison-item .label,
.goal-label {
  font-size: 0.875rem;
  color: #6b7280;
}
.comparison-item .value,
.goal-value {
  font-size: 1.25rem;
  font-weight: 600;
}
.trend-up {
  color: #10b981;
}
.trend-down {
  color: #ef4444;
}
.trend-stable {
  color: #6b7280;
}

.capacity-status {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.status-excellent {
  background: #d1fae5;
  border: 1px solid #10b981;
}
.status-warning {
  background: #fef3c7;
  border: 1px solid #f59e0b;
}
.status-deficit,
.status-insufficient {
  background: #fee2e2;
  border: 1px solid #ef4444;
}
.status-icon {
  font-size: 1.5rem;
}
.status-message {
  font-size: 0.875rem;
  font-weight: 600;
}

.gaming-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}
.gaming-card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.gaming-content {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.gaming-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.gaming-icon {
  font-size: 2rem;
}
.gaming-label {
  display: block;
  font-size: 0.75rem;
  opacity: 0.9;
}
.gaming-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}
.streak-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 8px;
}
.streak-icon {
  font-size: 1.5rem;
}

.period-info {
  text-align: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #6b7280;
}
.period-dates {
  margin-top: 0.5rem;
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.no-data-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}
.no-data h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #111827;
}
.no-data p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}
</style>
