<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <div>
        <h1 class="dashboard-title">Bonjour {{ userName }} 👋</h1>
        <p class="dashboard-subtitle">Voici votre situation financière</p>
      </div>

      <QuickActions />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement de vos données...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="reload" class="btn-retry">Réessayer</button>
    </div>

    <!-- Main Content -->
    <div v-else class="dashboard-content">
      <!-- Zone principale: Finance (75%) -->
      <main class="finance-main">
        <!-- Métriques principales -->
        <FinancialMetrics
          v-if="metrics"
          :savings-capacity="metrics.savings_capacity"
          :monthly-income="metrics.monthly_income"
          :monthly-expenses="metrics.monthly_expenses"
          :savings-rate="metrics.savings_rate"
        />

        <!-- Objectifs en cours -->
        <GoalsProgressCard :goals="mappedGoals" />

        <!-- Graphique de dépenses -->
        <SpendingChart :categories="categories" />

        <!-- Projections IA -->
        <AIProjections
          v-if="metrics"
          :monthly-income="metrics.monthly_income"
          :monthly-expenses="metrics.monthly_expenses"
          :categories="categories"
          :projections="projections"
          :insights="insights"
        />

        <!-- Transactions récentes -->
        <RecentTransactions />
      </main>

      <!-- Sidebar: Gaming (25%) -->
      <aside class="gaming-sidebar">
        <GamingSidebar v-if="gamingEnabled" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardData } from '@/composables/useDashboardData'

// Components
import FinancialMetrics from '@/components/dashboard/FinancialMetrics.vue'
import GoalsProgressCard from '@/components/dashboard/GoalsProgressCard.vue'
import SpendingChart from '@/components/dashboard/SpendingChart.vue'
import AIProjections from '@/components/dashboard/AIProjections.vue'
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue'
import GamingSidebar from '@/components/dashboard/GamingSidebar.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'

/**
 * Dashboard principal - Version avec API
 * École 42: Composition claire, API réelle
 */

const authStore = useAuthStore()
const gamingEnabled = ref(true)

const userName = computed(() => authStore.user?.name || 'Utilisateur')

// Chargement des données via API
const { isLoading, error, metrics, goals, categories, projections, insights, loadDashboardData } =
  useDashboardData()

/**
 * Mappe les goals de l'API au format du composant
 */
const mappedGoals = computed(() => {
  return goals.value.map((goal) => ({
    id: goal.id,
    name: goal.name,
    currentAmount: goal.current_amount,
    targetAmount: goal.target_amount,
    progressPercentage: goal.progress_percentage,
    estimatedCompletionDate: goal.estimated_completion_date || goal.deadline || '',
    category: goal.category,
    icon: goal.icon,
  }))
})

/**
 * Recharge les données
 */
const reload = async (): Promise<void> => {
  await loadDashboardData()
}

/**
 * Initialisation
 */
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.dashboard-subtitle {
  font-size: 1rem;
  color: #718096;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-retry:hover {
  background: #5568d3;
}

/* Main Layout */
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 350px; /* 75% / 25% */
  gap: 2rem;
}

.finance-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.gaming-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr; /* Gaming passe en bas */
  }

  .gaming-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }
}
</style>
