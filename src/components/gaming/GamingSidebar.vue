<template>
  <div class="gaming-sidebar-container">
    <!-- Loading -->
    <div v-if="loading" class="sidebar-loading">
      <div class="spinner-small"></div>
      <span>Chargement...</span>
    </div>

    <template v-else>
      <!-- ========================================== -->
      <!-- HEADER avec Progression (Niveau 2+) -->
      <!-- ========================================== -->
      <div v-if="shouldShowProgress" class="sidebar-section">
        <ProgressBar variant="card" />
      </div>

      <!-- ========================================== -->
      <!-- ENCOURAGEMENT SIMPLE (Niveau 1) -->
      <!-- ========================================== -->
      <div v-else class="sidebar-section encouragement-card">
        <div class="flex items-center gap-3">
          <span class="text-2xl">✨</span>
          <div>
            <p class="font-medium text-gray-900">{{ encouragementTitle }}</p>
            <p class="text-sm text-gray-600">{{ encouragementSubtitle }}</p>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MILESTONES EN COURS -->
      <!-- ========================================== -->
      <div class="sidebar-section">
        <div class="section-header">
          <h3 class="section-title">
            {{ engagementLevel >= 2 ? '🎯 Objectifs' : 'Prochaines étapes' }}
          </h3>
          <router-link v-if="engagementLevel >= 2" to="/app/achievements" class="section-link">
            Tout voir
          </router-link>
        </div>

        <!-- Liste des milestones -->
        <div v-if="pendingMilestones.length > 0" class="milestones-list">
          <MilestoneCard
            v-for="milestone in displayedMilestones"
            :key="milestone.id"
            :milestone="milestone"
            compact
            @click="handleMilestoneClick(milestone)"
            @claimed="handleMilestoneClaimed"
          />
        </div>

        <!-- État vide -->
        <div v-else class="empty-state">
          <span class="text-3xl">🎉</span>
          <p class="text-sm text-gray-600">Tous vos objectifs sont atteints !</p>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STREAK (Niveau 3+) -->
      <!-- ========================================== -->
      <div v-if="shouldShowStreak && streak" class="sidebar-section streak-card">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🔥</span>
            <div>
              <p class="font-semibold text-gray-900">{{ streak.current }} jours</p>
              <p class="text-xs text-gray-500">Record: {{ streak.best }}</p>
            </div>
          </div>

          <!-- Mini visualisation -->
          <div class="streak-dots">
            <div
              v-for="i in 7"
              :key="i"
              class="streak-dot"
              :class="i <= Math.min(7, streak.current) ? 'active' : ''"
            />
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- COMPARAISON ANONYME (Niveau 3+) -->
      <!-- ========================================== -->
      <div v-if="shouldShowComparison && comparison" class="sidebar-section comparison-card">
        <div class="flex items-center gap-3">
          <div class="comparison-badge">
            <span class="text-lg font-bold">{{ comparison.percentile }}%</span>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-900">{{ comparison.message }}</p>
            <p class="text-xs text-gray-500 mt-1">Taux d'épargne: {{ comparison.user_rate }}%</p>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- SUCCÈS RÉCENTS (Niveau 2+) -->
      <!-- ========================================== -->
      <div v-if="shouldShowAchievements && recentAchievements.length > 0" class="sidebar-section">
        <div class="section-header">
          <h3 class="section-title">🏆 Récemment débloqués</h3>
        </div>

        <div class="achievements-list">
          <div
            v-for="achievement in recentAchievements"
            :key="achievement.name"
            class="achievement-item"
          >
            <span class="text-xl">{{ achievement.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ achievement.name }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(achievement.unlocked_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- LIENS GAMING (Niveau 4) -->
      <!-- ========================================== -->
      <div v-if="shouldShowGamingLinks" class="sidebar-section gaming-links">
        <router-link to="/app/gaming" class="gaming-link">
          <span class="text-xl">🏆</span>
          <span>Classement</span>
          <span class="link-arrow">→</span>
        </router-link>

        <router-link to="/app/challenges" class="gaming-link">
          <span class="text-xl">⚔️</span>
          <span>Défis</span>
          <span v-if="activeChallengesCount > 0" class="challenge-badge">
            {{ activeChallengesCount }}
          </span>
          <span class="link-arrow">→</span>
        </router-link>

        <router-link to="/app/achievements" class="gaming-link">
          <span class="text-xl">🎯</span>
          <span>Tous les succès</span>
          <span class="link-arrow">→</span>
        </router-link>
      </div>

      <!-- ========================================== -->
      <!-- PRÉFÉRENCES -->
      <!-- ========================================== -->
      <div v-if="engagementLevel >= 2" class="sidebar-footer">
        <button @click="showPreferences = true" class="preferences-btn">⚙️ Personnaliser</button>
      </div>
    </template>

    <!-- Modal Préférences -->
    <GamingPreferencesModal
      v-if="showPreferences"
      @close="showPreferences = false"
      @saved="handlePreferencesSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  useProgressiveGaming,
  ENGAGEMENT_LEVELS,
  type Milestone,
} from '@/composables/useProgressiveGaming'

// Components
import ProgressBar from '@/components/gaming/ProgressBar.vue'
import MilestoneCard from '@/components/gaming/MilestoneCard.vue'
import GamingPreferencesModal from '@/components/gaming/GamingPreferencesModal.vue'

// ==========================================
// COMPOSABLES
// ==========================================

const {
  engagementLevel,
  dashboardData,
  uiConfig,
  loading,
  getMilestones,
  refreshDashboard,
  recordInteraction,
} = useProgressiveGaming()

// ==========================================
// STATE
// ==========================================

const showPreferences = ref(false)
const pendingMilestones = ref<Milestone[]>([])

// ==========================================
// COMPUTED - Données
// ==========================================

const streak = computed(() => dashboardData.value?.streak)

const comparison = computed(() => {
  const data = dashboardData.value?.comparison?.savings_comparison
  return data
    ? {
        percentile: data.percentile,
        message: data.message,
        user_rate: data.user_rate,
      }
    : null
})

const recentAchievements = computed(() => dashboardData.value?.recent_achievements ?? [])

const activeChallengesCount = computed(() => dashboardData.value?.active_challenges?.length ?? 0)

const displayedMilestones = computed(() => {
  const limit = engagementLevel.value >= 3 ? 4 : 3
  return pendingMilestones.value.slice(0, limit)
})

const encouragementTitle = computed(() => {
  const stats = dashboardData.value?.encouragement?.stats_highlight
  if (stats?.type === 'savings') {
    return `${formatCurrency(stats.value)} économisés`
  }
  return 'Bienvenue !'
})

const encouragementSubtitle = computed(
  () => dashboardData.value?.encouragement?.message ?? 'Suivez vos finances au quotidien',
)

// ==========================================
// COMPUTED - Affichage conditionnel
// ==========================================

const shouldShowProgress = computed(
  () => engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS && uiConfig.value.show_xp_bar,
)

const shouldShowStreak = computed(
  () => engagementLevel.value >= ENGAGEMENT_LEVELS.SOCIAL && uiConfig.value.show_streak_counter,
)

const shouldShowComparison = computed(
  () => engagementLevel.value >= ENGAGEMENT_LEVELS.SOCIAL && uiConfig.value.show_comparison_widget,
)

const shouldShowAchievements = computed(
  () =>
    engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS && uiConfig.value.show_achievements_count,
)

const shouldShowGamingLinks = computed(() => engagementLevel.value >= ENGAGEMENT_LEVELS.GAMING)

// ==========================================
// MÉTHODES
// ==========================================

async function loadMilestones(): Promise<void> {
  pendingMilestones.value = await getMilestones(undefined, 'pending')
}

function handleMilestoneClick(milestone: Milestone): void {
  recordInteraction('clicked_milestone', 'milestone', milestone.id)
}

function handleMilestoneClaimed(): void {
  loadMilestones()
  refreshDashboard()
}

function handlePreferencesSaved(): void {
  showPreferences.value = false
  refreshDashboard()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  await loadMilestones()
})
</script>

<style scoped>
.gaming-sidebar-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Loading */
.sidebar-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #718096;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Sections */
.sidebar-section {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1a202c;
}

.section-link {
  font-size: 0.75rem;
  color: #667eea;
  text-decoration: none;
}

.section-link:hover {
  text-decoration: underline;
}

/* Encouragement Card */
.encouragement-card {
  background: linear-gradient(135deg, #ebf4ff 0%, #e0e7ff 100%);
  border-color: #c7d2fe;
}

/* Milestones */
.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 1.5rem;
}

/* Streak Card */
.streak-card {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fcd34d;
}

.streak-dots {
  display: flex;
  gap: 3px;
}

.streak-dot {
  width: 6px;
  height: 20px;
  border-radius: 3px;
  background: #e5e7eb;
  transition: background-color 0.2s;
}

.streak-dot.active {
  background: #f59e0b;
}

/* Comparison Card */
.comparison-card {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-color: #c4b5fd;
}

.comparison-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Achievements */
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 0.5rem;
}

/* Gaming Links */
.gaming-links {
  padding: 0.5rem;
}

.gaming-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #1a202c;
  transition: background-color 0.2s;
}

.gaming-link:hover {
  background: #f7fafc;
}

.gaming-link span:nth-child(2) {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.link-arrow {
  color: #a0aec0;
  font-size: 0.875rem;
}

.challenge-badge {
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
}

/* Footer */
.sidebar-footer {
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.preferences-btn {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.75rem;
  color: #718096;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.preferences-btn:hover {
  color: #4a5568;
}
</style>
