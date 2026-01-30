<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
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
// COMPUTED - DONNÉES DASHBOARD
// ==========================================

const isLoading = computed(
  () => dashboardStore.loading || transactionStore.loading || goalStore.loading,
)

const hasError = computed(() => dashboardStore.error || transactionStore.error || goalStore.error)

const stats = computed(() => dashboardStore.stats)
const hasData = computed(() => dashboardStore.hasData)

// ==========================================
// MÉTHODES
// ==========================================

/**
 * Charger toutes les données du dashboard
 * ✅ Protégé : attend que l'auth soit prête
 */
async function loadDashboardData(): Promise<void> {
  console.group('📊 === CHARGEMENT DASHBOARD ===')

  try {
    // ✅ S'assurer que l'auth est prête
    if (!authStore.isAuthenticated) {
      console.warn('⚠️ [Dashboard] Utilisateur non authentifié, annulation du chargement')
      console.groupEnd()
      return
    }

    console.log('👤 User authentifié:', authStore.user?.email)
    console.log('🔄 Début chargement des données...')

    // Charger en parallèle (plus rapide)
    await Promise.allSettled([
      dashboardStore.fetchStats(),
      transactionStore.fetchTransactions().catch((err) => {
        console.warn('⚠️ Erreur transactions (non bloquante):', err.message)
      }),
      goalStore.fetchGoals().catch((err) => {
        console.warn('⚠️ Erreur objectifs (non bloquante):', err.message)
      }),
    ])

    console.log('✅ Chargement dashboard terminé')
  } catch (err: any) {
    console.error('❌ Erreur chargement dashboard:', err)
  } finally {
    console.groupEnd()
  }
}

/**
 * Rafraîchir les données
 */
async function refreshData(): Promise<void> {
  console.log('🔄 Rafraîchissement manuel...')
  await loadDashboardData()
}

// ==========================================
// LIFECYCLE
// ==========================================

/**
 * ✅ CHARGEMENT INITIAL SÉCURISÉ
 */
onMounted(async () => {
  console.log('🎯 Dashboard monté')

  // ✅ Vérifier que l'auth est prête
  if (authStore.isAuthenticated) {
    console.log('✅ Auth prête, chargement des données...')
    await loadDashboardData()
  } else {
    console.warn('⚠️ Auth non prête au montage, attente...')
  }
})

/**
 * ✅ WATCHER : Charger les données quand l'auth devient prête
 */
watch(
  () => authStore.isAuthenticated,
  async (isAuth, wasAuth) => {
    console.log('🔄 Auth state changed:', { wasAuth, isAuth })

    // Charger seulement si on vient de devenir authentifié
    if (isAuth && !wasAuth && !hasData.value) {
      console.log('✅ Authentification détectée, chargement des données...')
      await loadDashboardData()
    }
  },
  { immediate: false },
)
</script>

<template>
  <div class="dashboard-container">
    <!-- ==========================================
         ÉTAT DE CHARGEMENT
         ========================================== -->
    <div v-if="isLoading && !hasData" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement de votre tableau de bord...</p>
    </div>

    <!-- ==========================================
         ERREUR
         ========================================== -->
    <div v-else-if="hasError && !hasData" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Impossible de charger les données</h3>
      <p>{{ hasError }}</p>
      <button @click="refreshData" class="retry-button">🔄 Réessayer</button>
    </div>

    <!-- ==========================================
         CONTENU PRINCIPAL
         ========================================== -->
    <div v-else class="dashboard-content">
      <!-- Header avec bouton refresh -->
      <div class="dashboard-header">
        <h1>📊 Tableau de bord</h1>
        <button @click="refreshData" :disabled="isLoading" class="refresh-button">
          <span v-if="!isLoading">🔄 Actualiser</span>
          <span v-else>⏳ Chargement...</span>
        </button>
      </div>

      <!-- Stats principales -->
      <div v-if="stats" class="stats-grid">
        <div class="stat-card">
          <h3>💰 Solde total</h3>
          <p class="stat-value">
            {{ dashboardStore.formatCurrency(stats.total_balance) }}
          </p>
        </div>

        <div class="stat-card">
          <h3>🎯 Capacité d'épargne</h3>
          <p
            class="stat-value"
            :class="{
              positive: stats.savings_capacity.is_positive,
              negative: !stats.savings_capacity.is_positive,
            }"
          >
            {{ dashboardStore.formatCurrency(stats.savings_capacity.amount) }}
          </p>
        </div>

        <div class="stat-card">
          <h3>📈 Revenus du mois</h3>
          <p class="stat-value positive">
            {{ dashboardStore.formatCurrency(stats.current_month.income) }}
          </p>
        </div>

        <div class="stat-card">
          <h3>📉 Dépenses du mois</h3>
          <p class="stat-value negative">
            {{ dashboardStore.formatCurrency(stats.current_month.expenses) }}
          </p>
        </div>
      </div>

      <!-- Objectifs -->
      <div v-if="stats" class="goals-section">
        <h2>🎯 Vos objectifs</h2>
        <div class="goals-stats">
          <p>
            Objectifs actifs : <strong>{{ stats.goals.active_count }}</strong>
          </p>
          <p>
            Total épargné :
            <strong>{{ dashboardStore.formatCurrency(stats.goals.total_saved) }}</strong>
          </p>
          <p>
            Objectif total :
            <strong>{{ dashboardStore.formatCurrency(stats.goals.total_target) }}</strong>
          </p>
        </div>
      </div>

      <!-- Gaming -->
      <div v-if="stats" class="gaming-section">
        <h2>🎮 Gaming</h2>
        <div class="gaming-stats">
          <p>
            Niveau : <strong>{{ stats.user.level }}</strong>
          </p>
          <p>
            XP : <strong>{{ stats.user.xp }}</strong>
          </p>
          <p>
            Succès : <strong>{{ stats.user.achievements }}</strong>
          </p>
        </div>
      </div>

      <!-- Placeholder si pas de données -->
      <div v-if="!stats" class="no-data">
        <p>Aucune donnée disponible</p>
        <button @click="refreshData" class="retry-button">🔄 Charger les données</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-state,
.error-state {
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

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.retry-button,
.refresh-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.2s;
}

.retry-button:hover,
.refresh-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.stat-value.positive {
  color: #10b981;
}

.stat-value.negative {
  color: #ef4444;
}

.goals-section,
.gaming-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.goals-section h2,
.gaming-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.goals-stats,
.gaming-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.no-data {
  text-align: center;
  padding: 3rem;
}
</style>
