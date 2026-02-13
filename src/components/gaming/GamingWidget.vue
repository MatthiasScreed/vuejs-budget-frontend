<template>
  <div class="space-y-6">
    <!-- ========================================== -->
    <!-- NIVEAU 1: Encouragement simple -->
    <!-- ========================================== -->
    <div
      v-if="engagementLevel >= 1"
      class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
    >
      <div class="flex items-center gap-3">
        <span class="text-2xl">{{
          dailyEncouragement?.stats_highlight?.type === 'savings' ? '💰' : '👋'
        }}</span>
        <div class="flex-1">
          <p class="text-gray-800">
            {{ dailyEncouragement?.message || 'Bienvenue ! Prêt à suivre vos finances ?' }}
          </p>

          <!-- Stats highlight -->
          <p
            v-if="dailyEncouragement?.stats_highlight"
            class="text-sm text-blue-600 font-medium mt-1"
          >
            {{ formatCurrency(dailyEncouragement.stats_highlight.value) }}
            {{ dailyEncouragement.stats_highlight.label }}
          </p>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- NIVEAU 2+: Progression -->
    <!-- ========================================== -->
    <ProgressBar v-if="shouldShowProgress" :progress="dashboardData?.progress" variant="detailed" />

    <!-- ========================================== -->
    <!-- NIVEAU 1+: Milestones en cours -->
    <!-- ========================================== -->
    <div v-if="pendingMilestones.length > 0" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-gray-900">
          {{ engagementLevel >= 2 ? '🎯 Objectifs en cours' : 'Prochaines étapes' }}
        </h3>
        <router-link
          v-if="engagementLevel >= 2"
          to="/app/achievements"
          class="text-sm text-blue-600 hover:text-blue-700"
        >
          Voir tout →
        </router-link>
      </div>

      <div class="grid gap-3" :class="milestonesGridClass">
        <MilestoneCard
          v-for="m in displayedMilestones"
          :key="m.id"
          :milestone="m"
          :compact="engagementLevel < 2"
          @claimed="handleMilestoneClaimed"
        />
      </div>
    </div>

    <!-- ========================================== -->
    <!-- NIVEAU 3+: Streak -->
    <!-- ========================================== -->
    <div
      v-if="shouldShowStreak && dashboardData?.streak"
      class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="text-3xl">🔥</div>
          <div>
            <p class="font-semibold text-gray-900">
              {{ dashboardData.streak.current }} {{ dashboardData.streak.label }}
            </p>
            <p class="text-sm text-gray-600">Record : {{ dashboardData.streak.best }} jours</p>
          </div>
        </div>

        <!-- Indicateur visuel -->
        <div class="flex gap-1">
          <div
            v-for="i in 7"
            :key="i"
            class="w-2 h-6 rounded-full"
            :class="
              i <= Math.min(7, dashboardData.streak.current) ? 'bg-orange-400' : 'bg-gray-200'
            "
          />
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- NIVEAU 3+: Comparaison anonyme -->
    <!-- ========================================== -->
    <div
      v-if="shouldShowComparison && dashboardData?.comparison"
      class="bg-white rounded-xl p-4 border border-gray-200"
    >
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <span class="text-xl">📊</span>
        </div>
        <div class="flex-1">
          <p class="text-gray-900">{{ dashboardData.comparison.savings_comparison.message }}</p>
          <p class="text-sm text-gray-500 mt-1">
            Votre taux d'épargne : {{ dashboardData.comparison.savings_comparison.user_rate }}%
          </p>
        </div>

        <!-- Percentile badge -->
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">
            Top {{ 100 - dashboardData.comparison.savings_comparison.percentile }}%
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- NIVEAU 4: Gaming complet -->
    <!-- ========================================== -->
    <div v-if="shouldShowFullGaming" class="grid grid-cols-2 gap-4">
      <!-- Leaderboard preview -->
      <router-link
        to="/app/gaming"
        class="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl">🏆</span>
          <div>
            <p class="font-medium text-gray-900">Classement</p>
            <p class="text-sm text-gray-500">
              #{{ dashboardData?.leaderboard_preview?.position ?? '--' }} sur
              {{ dashboardData?.leaderboard_preview?.total_users ?? '--' }}
            </p>
          </div>
        </div>
      </router-link>

      <!-- Challenges -->
      <router-link
        to="/app/challenges"
        class="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚔️</span>
          <div>
            <p class="font-medium text-gray-900">Défis</p>
            <p class="text-sm text-gray-500">
              {{ dashboardData?.active_challenges?.length ?? 0 }} en cours
            </p>
          </div>
        </div>
      </router-link>
    </div>

    <!-- ========================================== -->
    <!-- Préférences Gaming (optionnel) -->
    <!-- ========================================== -->
    <div v-if="showPreferencesLink" class="text-center">
      <button
        @click="showPreferencesModal = true"
        class="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Personnaliser l'affichage
      </button>
    </div>

    <!-- Modal Préférences -->
    <GamingPreferencesModal
      v-if="showPreferencesModal"
      @close="showPreferencesModal = false"
      @saved="handlePreferencesSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProgressiveGaming, ENGAGEMENT_LEVELS } from '@/composables/useProgressiveGaming'
import ProgressBar from '@/components/gaming/ProgressBar.vue'
import MilestoneCard from '@/components/gaming/MilestoneCard.vue'
import GamingPreferencesModal from '@/components/gaming/GamingPreferencesModal.vue'

// ==========================================
// COMPOSABLES
// ==========================================

const { engagementLevel, dashboardData, uiConfig, initialize, refreshDashboard, getMilestones } =
  useProgressiveGaming()

// ==========================================
// STATE
// ==========================================

const showPreferencesModal = ref(false)
const pendingMilestones = ref<any[]>([])

// ==========================================
// COMPUTED
// ==========================================

const dailyEncouragement = computed(() => dashboardData.value?.encouragement)

const shouldShowProgress = computed(
  () => engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS && uiConfig.value.show_xp_bar,
)

const shouldShowStreak = computed(
  () => engagementLevel.value >= ENGAGEMENT_LEVELS.SOCIAL && uiConfig.value.show_streak_counter,
)

const shouldShowComparison = computed(
  () => engagementLevel.value >= ENGAGEMENT_LEVELS.SOCIAL && uiConfig.value.show_comparison_widget,
)

const shouldShowFullGaming = computed(() => engagementLevel.value >= ENGAGEMENT_LEVELS.GAMING)

const showPreferencesLink = computed(() => engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS)

const displayedMilestones = computed(() => {
  // Niveau 1: Max 2 milestones
  // Niveau 2: Max 3 milestones
  // Niveau 3+: Max 4 milestones
  const limit = engagementLevel.value === 1 ? 2 : engagementLevel.value === 2 ? 3 : 4
  return pendingMilestones.value.slice(0, limit)
})

const milestonesGridClass = computed(() => {
  if (engagementLevel.value === 1) return 'grid-cols-1'
  return 'grid-cols-1 md:grid-cols-2'
})

// ==========================================
// MÉTHODES
// ==========================================

async function loadMilestones(): Promise<void> {
  pendingMilestones.value = await getMilestones(undefined, 'pending')
}

function handleMilestoneClaimed(): void {
  loadMilestones()
  refreshDashboard()
}

function handlePreferencesSaved(): void {
  showPreferencesModal.value = false
  refreshDashboard()
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
  await initialize()
  await loadMilestones()
})
</script>
