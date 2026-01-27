<template>
  <div class="dashboard-container">

    <!-- Header simplifié -->
    <DashboardHeader
      :user="authStore.user"
      :level="userLevel"
      :xp="userXp"
    />

    <!-- Chargement global -->
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner size="large" />
      <p>Chargement de ton tableau de bord...</p>
    </div>

    <!-- Contenu principal -->
    <div v-else-if="dashboardStore.hasData" class="dashboard-content">

      <!-- 💰 SECTION FINANCIÈRE - PRIORITÉ ABSOLUE -->
      <section class="financial-section">
        <h2>📊 Vue financière</h2>
        <p class="period-label">{{ dashboardStore.period.label }}</p>

        <div class="financial-grid">

          <!-- Solde bancaire -->
          <FinancialCard
            title="Solde bancaire"
            :value="formatCurrency(dashboardStore.totalBalance)"
            icon="💰"
            subtitle="Total disponible"
            color="primary"
            size="large"
          />

          <!-- Revenus du mois -->
          <FinancialCard
            title="Revenus ce mois"
            :value="formatCurrency(dashboardStore.monthlyIncome)"
            icon="💵"
            :subtitle="`${dashboardStore.transactionCount} transactions`"
            color="success"
          />

          <!-- Dépenses du mois -->
          <FinancialCard
            title="Dépenses ce mois"
            :value="formatCurrency(dashboardStore.monthlyExpenses)"
            icon="💸"
            :subtitle="expenseSubtitle"
            color="warning"
          />

          <!-- ✅ Capacité d'épargne -->
          <SavingsCapacityCard
            :capacity="dashboardStore.savingsCapacity"
            :is-positive="dashboardStore.isPositive"
            :capacity-status="dashboardStore.capacityStatus"
            :goals-count="dashboardStore.activeGoalsCount"
            :total-monthly-targets="dashboardStore.totalMonthlyTargets"
            :trend="dashboardStore.trend"
            :change-percent="dashboardStore.changePercent"
            :period="dashboardStore.period.label"
          />

        </div>
      </section>

      <!-- 📊 GRID PRINCIPAL : Objectifs + Transactions -->
      <div class="main-grid">

        <!-- 🎯 OBJECTIFS ACTIFS -->
        <section class="goals-section">
          <div class="section-header">
            <div class="section-title-group">
              <h2>🎯 Tes objectifs</h2>
              <span class="count-badge">{{ goalStore.activeGoals.length }}</span>
            </div>
            <router-link to="/goals" class="view-all-link">
              Voir tous →
            </router-link>
          </div>

          <p class="section-subtitle" v-if="dashboardStore.goalsWithTarget > 0">
            {{ dashboardStore.goalsWithTarget }} avec contribution mensuelle définie
          </p>

          <!-- Status de capacité -->
          <div v-if="dashboardStore.capacityStatus.status !== 'not_configured'"
               class="capacity-banner"
               :class="`capacity-${dashboardStore.capacityStatus.status}`">
            <span class="banner-icon">
              {{ dashboardStore.capacityStatus.status === 'excellent' ? '✅' :
              dashboardStore.capacityStatus.status === 'warning' ? '⚠️' : '❌' }}
            </span>
            <div class="banner-content">
              <p class="banner-message">{{ dashboardStore.capacityStatus.message }}</p>
              <p class="banner-details" v-if="dashboardStore.capacityStatus.surplus">
                Surplus : {{ formatCurrency(dashboardStore.capacityStatus.surplus) }}
              </p>
              <p class="banner-details" v-if="dashboardStore.capacityStatus.deficit">
                Déficit : {{ formatCurrency(dashboardStore.capacityStatus.deficit) }}
              </p>
            </div>
          </div>

          <!-- Chargement objectifs -->
          <div v-if="goalStore.loading" class="content-loading">
            <LoadingSpinner />
            <p>Chargement des objectifs...</p>
          </div>

          <!-- Erreur -->
          <div v-else-if="goalStore.error" class="content-error">
            <p>❌ {{ goalStore.error }}</p>
            <button @click="refreshGoals" class="retry-button">
              Réessayer
            </button>
          </div>

          <!-- Aucun objectif - MESSAGE ENCOURAGEANT -->
          <div v-else-if="goalStore.activeGoals.length === 0" class="no-content">
            <div class="empty-icon">🚀</div>
            <h3>Prêt à démarrer ton premier objectif ?</h3>
            <p>Voyage, voiture, fonds d'urgence... Définis un objectif et on calcule comment l'atteindre ensemble !</p>
            <router-link to="/objectifs/nouveau" class="action-button">
              + Créer mon premier objectif
            </router-link>
            <div class="helper-text">
              💡 Astuce : Commence petit avec un objectif de 100-200€
            </div>
          </div>

          <!-- Liste objectifs (5 premiers) -->
          <div v-else class="goals-list">
            <GoalCard
              v-for="goal in topFiveGoals"
              :key="goal.id"
              :goal="goal"
              @click="goToGoal(goal.id)"
            />
          </div>

          <!-- Voir plus si nécessaire -->
          <div v-if="goalStore.activeGoals.length > 5" class="show-more">
            <router-link to="/objectifs" class="show-more-link">
              Voir tous les objectifs ({{ goalStore.activeGoals.length }}) →
            </router-link>
          </div>
        </section>

        <!-- 💸 DERNIÈRES DÉPENSES -->
        <section class="transactions-section">
          <div class="section-header">
            <div class="section-title-group">
              <h2>💸 Dernières dépenses</h2>
            </div>
            <router-link to="/transactions" class="view-all-link">
              Voir tout →
            </router-link>
          </div>

          <!-- Chargement transactions -->
          <div v-if="transactionStore.isLoading" class="content-loading">
            <LoadingSpinner size="small" />
            <p>Chargement...</p>
          </div>

          <!-- Erreur -->
          <div v-else-if="transactionStore.error" class="content-error">
            <p>❌ Erreur de chargement</p>
            <button @click="refreshTransactions" class="retry-button-small">
              Réessayer
            </button>
          </div>

          <!-- Aucune transaction - MESSAGE ENCOURAGEANT -->
          <div v-else-if="recentExpenses.length === 0" class="no-content-small">
            <div class="empty-icon-small">🏦</div>
            <p class="empty-title">Connecte ta banque !</p>
            <p class="empty-description">
              Tes transactions s'importeront automatiquement et on analysera tes dépenses.
            </p>
            <router-link to="/banking" class="action-link-primary">
              🏦 Connecter ma banque →
            </router-link>
          </div>

          <!-- Liste des 4 dernières dépenses -->
          <div v-else class="transactions-list">
            <div
              v-for="transaction in recentExpenses"
              :key="transaction.id"
              class="transaction-item"
              @click="goToTransaction(transaction.id)"
            >
              <div class="transaction-icon">
                {{ getCategoryIcon(transaction.category) }}
              </div>

              <div class="transaction-info">
                <h4 class="transaction-description">
                  {{ transaction.description || 'Sans description' }}
                </h4>
                <div class="transaction-meta">
                  <span class="transaction-date">{{ formatDate(transaction.transaction_date) }}</span>
                  <span v-if="transaction.category" class="transaction-category">
                    • {{ transaction.category.name }}
                  </span>
                </div>
              </div>

              <div class="transaction-amount expense">
                -{{ formatCurrency(Math.abs(transaction.amount)) }}
              </div>
            </div>
          </div>
        </section>

      </div>

      <!-- ⭐ PROGRESSION (Gaming discret et optionnel) -->
      <section class="progression-section">
        <div class="progression-header">
          <div class="progression-title-group">
            <h3>⭐ Ta progression</h3>
            <span class="optional-badge">Optionnel</span>
            <button
              class="info-button"
              @click="showProgressionInfo"
              title="Comment ça marche ?"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
          <router-link to="/app/gaming" class="view-details-link">
            Voir détails →
          </router-link>
        </div>

        <div class="progression-grid">
          <div class="progression-card">
            <div class="progression-value">{{ userLevel }}</div>
            <div class="progression-label">Palier actuel</div>
            <div class="progression-hint">Continue pour débloquer plus</div>
          </div>

          <div class="progression-card">
            <div class="progression-value">{{ userXp }}</div>
            <div class="progression-label">Points gagnés</div>
            <div class="progression-hint">Chaque action compte</div>
          </div>

          <div class="progression-card">
            <div class="progression-value">{{ currentStreak }}</div>
            <div class="progression-label">Jours de suite</div>
            <div class="progression-hint" v-if="currentStreak >= 7">🔥 Super série !</div>
            <div class="progression-hint" v-else>Reviens demain</div>
          </div>
        </div>

        <!-- Dernier badge débloqué -->
        <div v-if="latestBadge" class="latest-badge">
          <div class="badge-icon">{{ latestBadge.icon }}</div>
          <div class="badge-info">
            <div class="badge-name">{{ latestBadge.name }}</div>
            <div class="badge-time">Débloqué {{ latestBadge.unlocked_ago }}</div>
          </div>
          <div class="badge-action">
            <router-link to="/app/gaming/achievements" class="badge-link">
              Voir tous les badges →
            </router-link>
          </div>
        </div>

        <!-- Message informatif -->
        <div class="progression-info">
          <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <p>
            Les points et paliers mesurent ta progression. <strong>C'est 100% optionnel</strong> —
            tu peux les ignorer si tu préfères te concentrer sur tes finances !
          </p>
        </div>
      </section>

    </div>

    <!-- Pas de données - MESSAGE ENCOURAGEANT -->
    <div v-else class="no-data">
      <div class="no-data-icon">🚀</div>
      <h2 class="no-data-title">Bienvenue sur CoinQuest !</h2>
      <p class="no-data-message">
        Pour commencer, connecte ta banque et on analysera automatiquement
        tes finances pour te proposer des objectifs personnalisés.
      </p>
      <div class="no-data-actions">
        <router-link to="/banking" class="primary-action">
          🏦 Connecter ma banque
        </router-link>
        <router-link to="/goals/new" class="secondary-action">
          🎯 Créer un objectif manuel
        </router-link>
      </div>
      <div class="no-data-security">
        <svg class="security-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>Connexion 100% sécurisée · Lecture seule · Conforme PSD2</span>
      </div>
    </div>

    <!-- Modal d'onboarding -->
    <OnboardingModal
      :show="showOnboarding"
      @close="closeOnboarding"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useGoalStore } from '@/stores/goalStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAuthStore } from '@/stores/authStore'

// Components
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import FinancialCard from '@/components/dashboard/FinancialCard.vue'
import SavingsCapacityCard from '@/components/dashboard/SavingsCapacityCard.vue'
import GoalCard from '@/components/goals/GoalCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import OnboardingModal from '@/components/onboarding/OnboardingModal.vue'

const showOnboarding = ref(false)
const router = useRouter()
const dashboardStore = useDashboardStore()
const goalStore = useGoalStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

const isLoading = ref(true)

const userLevel = computed(() => {
  const level = dashboardStore.user.level
  return typeof level === 'number' ? level : 1
})

const userXp = computed(() => {
  const xp = dashboardStore.user.xp
  return typeof xp === 'number' ? xp : 0
})

const currentStreak = computed(() => {
  return dashboardStore.activeStreak?.days || 0
})

const latestBadge = computed(() => {
  // TODO: Récupérer le dernier badge depuis le store gaming
  return null
})

const topFiveGoals = computed(() => {
  return goalStore.activeGoals.slice(0, 5)
})

const recentExpenses = computed(() => {
  if (!transactionStore.transactions || !Array.isArray(transactionStore.transactions)) {
    return []
  }

  return transactionStore.transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => {
      const dateA = new Date(a.transaction_date).getTime()
      const dateB = new Date(b.transaction_date).getTime()
      return dateB - dateA
    })
    .slice(0, 4)
})

const expenseSubtitle = computed(() => {
  const capacity = dashboardStore.savingsCapacity
  const income = dashboardStore.monthlyIncome

  if (capacity < 0) {
    return '⚠️ Dépenses > solde disponible'
  }

  if (income === 0) {
    return 'Aucun revenu ce mois'
  }

  const rate = dashboardStore.savingsRate

  if (rate < 10) return '💪 À optimiser'
  if (rate < 30) return '✅ Bon équilibre'
  return '🎉 Excellent !'
})

async function loadDashboard(): Promise<void> {
  isLoading.value = true

  try {
    await Promise.all([
      dashboardStore.fetchAll(),
      goalStore.fetchGoals(),
      transactionStore.fetchTransactions()
    ])
  } catch (error) {
    console.error('❌ Erreur dashboard:', error)
  } finally {
    isLoading.value = false
  }
}

async function refreshGoals(): Promise<void> {
  await goalStore.fetchGoals()
}

async function refreshTransactions(): Promise<void> {
  await transactionStore.fetchTransactions()
}

function showProgressionInfo(): void {
  alert('💡 Les points et paliers mesurent ta progression financière. Chaque action (économie, objectif atteint, régularité) te rapporte des points. C\'est 100% optionnel et ludique !')
  // TODO: Remplacer par un vrai modal
}

function goToGoal(goalId: number): void {
  router.push(`/objectifs/${goalId}`)
}

function goToTransaction(transactionId: number): void {
  router.push(`/transactions/${transactionId}`)
}

function getCategoryIcon(category: any): string {
  if (!category) return '📦'
  return category.icon || '💰'
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(async () => {
  // Afficher onboarding avant de charger le dashboard
  const completed = localStorage.getItem('onboarding_completed')
  if (!completed) {
    showOnboarding.value = true
  }

  await loadDashboard()
})

const closeOnboarding = () => {
  showOnboarding.value = false
}
</script>

<style scoped>
/* ========================================
   MOBILE FIX - Empêcher overflow horizontal
   ======================================== */

* {
  box-sizing: border-box;
}

html,
body {
  overflow-x: hidden;
  max-width: 100%;
}

/* ========================================
   BASE & CONTAINER
   ======================================== */

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-background);
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ========================================
   SECTIONS PRINCIPALES
   ======================================== */

.financial-section,
.goals-section,
.transactions-section {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.financial-section h2,
.goals-section h2,
.transactions-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
}

.period-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem 0;
}

.financial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

/* ========================================
   GRID PRINCIPAL (Objectifs + Transactions)
   ======================================== */

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* ========================================
   SECTION HEADERS
   ======================================== */

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: var(--color-primary);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.section-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem 0;
}

.view-all-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.view-all-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* ========================================
   CAPACITY BANNER
   ======================================== */

.capacity-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.capacity-excellent {
  background: #10b98110;
  border: 1px solid #10b981;
}

.capacity-warning {
  background: #f59e0b10;
  border: 1px solid #f59e0b;
}

.capacity-deficit,
.capacity-insufficient {
  background: #ef444410;
  border: 1px solid #ef4444;
}

.banner-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
  min-width: 0;
}

.banner-message {
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem 0;
  font-size: 0.9375rem;
}

.banner-details {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* ========================================
   GOALS LIST
   ======================================== */

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.show-more {
  margin-top: 1rem;
  text-align: center;
}

.show-more-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  transition: all 0.2s;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.show-more-link:hover {
  background: var(--color-primary);
  color: white;
}

/* ========================================
   TRANSACTIONS LIST
   ======================================== */

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 64px;
}

.transaction-item:hover {
  border-color: var(--color-primary);
  background: var(--color-background);
}

.transaction-item:active {
  transform: scale(0.98);
}

.transaction-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border-radius: 10px;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-description {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.transaction-date {
  color: var(--color-text-secondary);
}

.transaction-category {
  color: var(--color-primary);
}

.transaction-amount {
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.transaction-amount.expense {
  color: #ef4444;
}

/* ========================================
   PROGRESSION SECTION (Gaming discret)
   ======================================== */

.progression-section {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.progression-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.progression-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progression-title-group h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.optional-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: white;
  border-radius: 12px;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.info-button {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color 0.2s;
}

.info-button:hover {
  color: var(--color-primary);
}

.info-button svg {
  width: 1rem;
  height: 1rem;
}

.view-details-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.view-details-link:hover {
  text-decoration: underline;
}

.progression-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.progression-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.progression-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.progression-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.progression-hint {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
}

.latest-badge {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.badge-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.badge-info {
  flex: 1;
  min-width: 0;
}

.badge-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.badge-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.badge-action {
  flex-shrink: 0;
}

.badge-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 500;
}

.badge-link:hover {
  text-decoration: underline;
}

.progression-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.info-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

/* ========================================
   LOADING & ERROR STATES
   ======================================== */

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.loading-state p {
  margin-top: 1rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.content-loading,
.content-error,
.no-content,
.no-content-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.no-content {
  min-height: 300px;
}

.no-content-small {
  padding: 1.5rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-icon-small {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.no-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.no-content p,
.no-content-small .empty-description {
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.empty-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem !important;
}

.helper-text {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.action-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-button:hover {
  background: var(--color-primary-dark);
}

.action-link-primary {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9375rem;
}

.action-link-primary:hover {
  text-decoration: underline;
}

.retry-button,
.retry-button-small {
  padding: 0.75rem 1.25rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.875rem;
  min-height: 44px;
}

.retry-button:hover,
.retry-button-small:hover {
  background: var(--color-primary-dark);
}

/* ========================================
   NO DATA STATE (Empty dashboard)
   ======================================== */

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: var(--color-surface);
  border-radius: 16px;
  text-align: center;
  max-width: 600px;
  margin: 2rem auto;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.no-data-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
}

.no-data-message {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 2rem 0;
  max-width: 500px;
}

.no-data-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  margin-bottom: 2rem;
}

.primary-action,
.secondary-action {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-action {
  background: var(--color-primary);
  color: white;
}

.primary-action:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.secondary-action {
  background: white;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.secondary-action:hover {
  background: var(--color-primary);
  color: white;
}

.no-data-security {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #059669;
  font-weight: 500;
}

.security-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

/* ========================================
   RESPONSIVE - TABLET (640px - 1024px)
   ======================================== */

@media (max-width: 1024px) {
  .dashboard-container {
    padding: 1.5rem;
    overflow-x: hidden;
  }

  .main-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .financial-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  .progression-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ========================================
   RESPONSIVE - MOBILE (<640px)
   ======================================== */

@media (max-width: 640px) {
  .dashboard-container {
    padding: 1rem;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .dashboard-content {
    gap: 1.25rem;
    width: 100%;
    overflow-x: hidden;
  }

  .financial-section,
  .goals-section,
  .transactions-section,
  .progression-section {
    padding: 1rem;
    border-radius: 12px;
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .financial-section h2,
  .goals-section h2,
  .transactions-section h2 {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
    word-break: break-word;
  }

  .period-label {
    font-size: 0.8125rem;
    margin-bottom: 1rem;
  }

  .financial-grid {
    grid-template-columns: 1fr !important;
    gap: 1rem;
    width: 100%;
    max-width: 100%;
  }

  .main-grid {
    grid-template-columns: 1fr !important;
    gap: 1.25rem;
  }

  .section-header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .section-title-group {
    flex: 1 1 auto;
    min-width: 0;
  }

  .section-title-group h2 {
    font-size: 1.125rem;
    word-break: break-word;
  }

  .count-badge {
    font-size: 0.6875rem;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
  }

  .view-all-link {
    font-size: 0.8125rem;
  }

  .section-subtitle {
    font-size: 0.8125rem;
    margin-bottom: 1rem;
    word-break: break-word;
  }

  .capacity-banner {
    padding: 0.875rem;
    gap: 0.75rem;
    width: 100%;
    box-sizing: border-box;
  }

  .banner-icon {
    font-size: 1.25rem;
  }

  .banner-message {
    font-size: 0.875rem;
    word-break: break-word;
  }

  .banner-details {
    font-size: 0.8125rem;
    word-break: break-word;
  }

  .goals-list {
    gap: 0.875rem;
    width: 100%;
  }

  .transactions-list {
    gap: 0.625rem;
    width: 100%;
  }

  .transaction-item {
    padding: 0.75rem;
    gap: 0.75rem;
    width: 100%;
    box-sizing: border-box;
  }

  .transaction-icon {
    width: 36px;
    height: 36px;
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  .transaction-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .transaction-description {
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .transaction-meta {
    font-size: 0.75rem;
    flex-wrap: wrap;
  }

  .transaction-amount {
    font-size: 0.9375rem;
    flex-shrink: 0;
  }

  /* Progression section mobile */
  .progression-section {
    padding: 1rem;
  }

  .progression-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .progression-title-group h3 {
    font-size: 0.9375rem;
  }

  .optional-badge {
    font-size: 0.625rem;
  }

  .progression-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .progression-card {
    padding: 0.875rem;
  }

  .progression-value {
    font-size: 1.5rem;
  }

  .progression-label {
    font-size: 0.6875rem;
  }

  .progression-hint {
    font-size: 0.625rem;
  }

  .latest-badge {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .progression-info {
    font-size: 0.75rem;
  }

  /* Empty states */
  .no-content {
    padding: 1.5rem;
    min-height: 250px;
  }

  .no-content-small {
    padding: 1.25rem;
  }

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .empty-icon-small {
    font-size: 1.75rem;
  }

  .no-content h3 {
    font-size: 1rem;
    word-break: break-word;
  }

  .no-content p,
  .no-content-small p {
    font-size: 0.875rem;
    word-break: break-word;
  }

  .helper-text {
    font-size: 0.75rem;
  }

  .action-button,
  .show-more-link,
  .retry-button {
    font-size: 0.875rem;
    padding: 0.875rem 1.25rem;
    width: 100%;
    max-width: 300px;
    box-sizing: border-box;
  }

  /* No data state mobile */
  .no-data {
    padding: 2rem 1rem;
    margin: 1rem 0;
  }

  .no-data-icon {
    font-size: 3rem;
  }

  .no-data-title {
    font-size: 1.5rem;
  }

  .no-data-message {
    font-size: 0.9375rem;
  }

  .no-data-actions {
    max-width: 100%;
  }

  .primary-action,
  .secondary-action {
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
  }

  .no-data-security {
    font-size: 0.75rem;
    padding: 0.625rem 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .loading-state {
    min-height: 50vh;
  }

  .loading-state p {
    font-size: 0.8125rem;
    word-break: break-word;
    padding: 0 1rem;
  }
}

/* ========================================
   RESPONSIVE - VERY SMALL MOBILE (<375px)
   ======================================== */

@media (max-width: 375px) {
  .dashboard-container {
    padding: 0.75rem;
  }

  .financial-section,
  .goals-section,
  .transactions-section,
  .progression-section {
    padding: 1rem;
  }

  .section-header h2 {
    font-size: 1rem;
  }

  .transaction-item {
    padding: 0.75rem;
  }

  .transaction-description {
    font-size: 0.8125rem;
  }

  .transaction-amount {
    font-size: 0.875rem;
  }

  .no-data-icon {
    font-size: 2.5rem;
  }

  .no-data-title {
    font-size: 1.25rem;
  }
}

/* ========================================
   LANDSCAPE MODE (Height < 500px)
   ======================================== */

@media (max-height: 500px) and (orientation: landscape) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-content {
    gap: 1rem;
  }

  .financial-section,
  .goals-section,
  .transactions-section,
  .progression-section {
    padding: 1rem;
  }

  .no-content,
  .loading-state {
    min-height: 200px;
  }
}

/* ========================================
   SAFE AREA INSETS (iPhone X+, notch)
   ======================================== */

@supports (padding: env(safe-area-inset-bottom)) {
  .dashboard-container {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}

/* ========================================
   DARK MODE SUPPORT
   ======================================== */

@media (prefers-color-scheme: dark) {
  .capacity-banner {
    backdrop-filter: blur(10px);
  }

  .transaction-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .progression-section {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  }
}

/* ========================================
   REDUCED MOTION
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
