<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <div>
        <h1 class="dashboard-title">{{ t('dashboard.greeting', { name: userName }) }} 👋</h1>
        <p class="dashboard-subtitle">{{ encouragementMessage }}</p>
      </div>

      <div class="header-right">
        <ProgressBar v-if="shouldShowMiniProgress" variant="mini" class="hidden md:block" />
        <QuickActions />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('dashboard.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="reload" class="btn-retry">
        {{ t('errors.tryAgain') }}
      </button>
    </div>

    <!-- Main Content -->
    <div v-else class="dashboard-content">
      <!-- Zone principale: Finance (75%) -->
      <main class="finance-main">
        <EncouragementCard
          v-if="showEncouragementCard"
          :message="dailyEncouragement?.message"
          :stats-highlight="dailyEncouragement?.stats_highlight"
          @dismiss="dismissEncouragement"
        />

        <FinancialMetrics
          v-if="metrics"
          :savings-capacity="metrics.savings_capacity"
          :monthly-income="metrics.monthly_income"
          :monthly-expenses="metrics.monthly_expenses"
          :savings-rate="metrics.savings_rate"
        />

        <GoalsProgressCard :goals="mappedGoals" />

        <SpendingChart :categories="categories" />

        <AIProjections
          v-if="metrics"
          :monthly-income="metrics.monthly_income"
          :monthly-expenses="metrics.monthly_expenses"
          :categories="categories"
          :projections="projections"
          :insights="insights"
        />

        <RecentTransactions @transaction-created="handleTransactionCreated" />
      </main>

      <!-- Sidebar: Gaming Progressif -->
      <aside class="gaming-sidebar">
        <GamingSidebar />
      </aside>
    </div>

    <!-- Feedback Toast Global -->
    <FeedbackToast
      v-if="currentFeedback"
      :feedback="currentFeedback"
      :points="currentFeedbackPoints"
      @close="clearCurrentFeedback"
    />

    <!-- Milestone Celebration Modal -->
    <MilestoneCelebration
      v-if="celebratingMilestone"
      :milestone="celebratingMilestone"
      @close="celebratingMilestone = null"
      @claimed="handleMilestoneClaimed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardData } from '@/composables/useDashboardData'
import {
  useProgressiveGaming,
  ENGAGEMENT_LEVELS,
  type Feedback,
  type Milestone,
} from '@/composables/useProgressiveGaming'

// Components - Dashboard
import FinancialMetrics from '@/components/dashboard/FinancialMetrics.vue'
import GoalsProgressCard from '@/components/dashboard/GoalsProgressCard.vue'
import SpendingChart from '@/components/dashboard/SpendingChart.vue'
import AIProjections from '@/components/dashboard/AIProjections.vue'
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'

// Components - Gaming Progressif
import GamingSidebar from '@/components/gaming/GamingSidebar.vue'
import ProgressBar from '@/components/gaming/ProgressBar.vue'
import FeedbackToast from '@/components/gaming/FeedbackToast.vue'
import EncouragementCard from '@/components/gaming/EncouragementCard.vue'
import MilestoneCelebration from '@/components/gaming/MilestoneCelebration.vue'

// ==========================================
// I18N & STORES
// ==========================================

const { t } = useI18n()
const authStore = useAuthStore()

const { isLoading, error, metrics, goals, categories, projections, insights, loadDashboardData } =
  useDashboardData()

const {
  engagementLevel,
  dashboardData,
  uiConfig,
  initialize,
  refreshDashboard,
  processEvent,
  getDailyEncouragement,
  consumePendingFeedback,
} = useProgressiveGaming()

// ==========================================
// STATE
// ==========================================

const currentFeedback = ref<Feedback | null>(null)
const currentFeedbackPoints = ref(0)
const celebratingMilestone = ref<Milestone | null>(null)
const encouragementDismissed = ref(false)
const dailyEncouragement = ref<{
  message: string
  stats_highlight: any
} | null>(null)

// ==========================================
// COMPUTED
// ==========================================

const userName = computed(() => {
  return authStore.user?.name?.split(' ')[0] || t('dashboard.defaultUser')
})

const encouragementMessage = computed(() => {
  if (dailyEncouragement.value?.message) {
    return dailyEncouragement.value.message
  }
  return t('dashboard.defaultSubtitle')
})

const shouldShowMiniProgress = computed(() => {
  return engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS && uiConfig.value.show_xp_bar
})

const showEncouragementCard = computed(() => {
  return (
    engagementLevel.value === ENGAGEMENT_LEVELS.SOFT &&
    !encouragementDismissed.value &&
    dailyEncouragement.value?.stats_highlight
  )
})

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

// ==========================================
// METHODS
// ==========================================

async function reload(): Promise<void> {
  await Promise.all([loadDashboardData(), refreshDashboard()])
}

async function handleTransactionCreated(transaction: any): Promise<void> {
  const result = await processEvent('transaction_created', {
    amount: transaction.amount,
    type: transaction.type,
  })

  if (result.feedback) {
    showFeedback(result.feedback, result.milestones.length > 0 ? 10 : 0)
  }

  if (result.milestones.length > 0) {
    celebratingMilestone.value = result.milestones[0]
  }

  await loadDashboardData()
}

function showFeedback(feedback: Feedback, points: number = 0): void {
  currentFeedback.value = feedback
  currentFeedbackPoints.value = points
}

function clearCurrentFeedback(): void {
  currentFeedback.value = null
  currentFeedbackPoints.value = 0

  const next = consumePendingFeedback()
  if (next) {
    setTimeout(() => showFeedback(next), 300)
  }
}

function dismissEncouragement(): void {
  encouragementDismissed.value = true
}

function handleMilestoneClaimed(_milestone: Milestone): void {
  celebratingMilestone.value = null
  refreshDashboard()
}

async function loadEncouragement(): Promise<void> {
  const data = await getDailyEncouragement()
  if (data) {
    dailyEncouragement.value = data
  }
}

// ==========================================
// WATCHERS
// ==========================================

watch(engagementLevel, (newLvl, oldLvl) => {
  if (newLvl > oldLvl) {
    console.log(`🎮 Engagement level up: ${oldLvl} → ${newLvl}`)
  }
})

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  await Promise.all([initialize(), loadDashboardData()])
  await loadEncouragement()
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

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  max-width: 400px;
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
  transition: background-color 0.2s;
}

.btn-retry:hover {
  background: #5568d3;
}

/* Main Layout - 80/20 Finance/Gaming */
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
}

.finance-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.gaming-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  .gaming-sidebar {
    position: static;
    max-height: none;
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
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  .dashboard-title {
    font-size: 1.5rem;
  }
  .dashboard-subtitle {
    font-size: 0.875rem;
  }
}
</style>
