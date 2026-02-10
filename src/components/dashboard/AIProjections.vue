<template>
  <div class="ai-projections-card">
    <div class="card-header">
      <div class="header-left">
        <h2 class="card-title">🔮 Prévisions intelligentes</h2>
        <p v-if="lastUpdated" class="last-updated">
          Mis à jour {{ formatRelativeTime(lastUpdated) }}
        </p>
      </div>

      <button class="btn-refresh" @click="handleRefresh" :disabled="isLoading">
        <span class="refresh-icon" :class="{ spinning: isLoading }">🔄</span>
        Actualiser
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Calcul des projections...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else class="projections-content">
      <!-- Section Insights -->
      <div v-if="prioritizedInsights.length > 0" class="insights-section">
        <h3 class="section-title">💡 Insights personnalisés</h3>

        <div class="insights-grid">
          <InsightCard v-for="insight in displayedInsights" :key="insight.id" :insight="insight" />
        </div>

        <button
          v-if="prioritizedInsights.length > maxInsightsDisplay"
          class="btn-show-more"
          @click="toggleShowAllInsights"
        >
          {{
            showAllInsights
              ? 'Voir moins'
              : `Voir ${prioritizedInsights.length - maxInsightsDisplay} de plus`
          }}
        </button>
      </div>

      <!-- Section Projections -->
      <div class="projections-section">
        <h3 class="section-title">📈 Projections financières</h3>

        <div class="projections-grid">
          <ProjectionCard
            v-for="projection in mappedProjections"
            :key="projection.period"
            :projection="projection"
          />
        </div>

        <!-- Note de confiance -->
        <div class="confidence-note">
          <span class="note-icon">ℹ️</span>
          <p class="note-text">
            Les projections sont calculées selon vos habitudes actuelles. La précision diminue avec
            le temps.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ProjectionCard from './ProjectionCard.vue'
import InsightCard from './InsightCard.vue'
import type { ProjectionApiResponse, InsightApiResponse } from '@/types/api.types'

/**
 * Props avec données de l'API
 * École 42: Props typées, max 5 paramètres
 */
interface Props {
  monthlyIncome?: number
  monthlyExpenses?: number
  categories?: any[]
  projections?: ProjectionApiResponse[]
  insights?: InsightApiResponse[]
}

const props = withDefaults(defineProps<Props>(), {
  monthlyIncome: 0,
  monthlyExpenses: 0,
  categories: () => [],
  projections: () => [],
  insights: () => [],
})

// State local
const isLoading = ref(false)
const error = ref<string | null>(null)
const lastUpdated = ref<string>(new Date().toISOString())
const showAllInsights = ref(false)
const maxInsightsDisplay = 3

/**
 * Conversion des projections API vers format local
 */
const mappedProjections = computed(() => {
  if (!props.projections || props.projections.length === 0) {
    return []
  }

  return props.projections.map((p) => ({
    period: p.period,
    periodLabel: p.period_label,
    projectedSavings: p.projected_savings,
    projectedIncome: p.projected_income,
    projectedExpenses: p.projected_expenses,
    confidence: p.confidence,
    variance: {
      min: p.variance_min,
      max: p.variance_max,
    },
    assumptions: p.assumptions,
  }))
})

/**
 * Conversion des insights API vers format local
 */
const mappedInsights = computed(() => {
  if (!props.insights || props.insights.length === 0) {
    return []
  }

  return props.insights.map((i) => ({
    id: i.id,
    type: i.type,
    priority: i.priority,
    title: i.title,
    description: i.description,
    impact: i.impact,
    actionable: i.actionable,
    action: i.action_label
      ? {
          label: i.action_label,
          route: i.action_route,
        }
      : undefined,
    icon: i.icon,
    color: i.color,
  }))
})

/**
 * Insights triés par priorité
 */
const prioritizedInsights = computed(() => {
  const priority = { high: 0, medium: 1, low: 2 }
  return [...mappedInsights.value].sort((a, b) => {
    return priority[a.priority] - priority[b.priority]
  })
})

/**
 * Insights affichés (limités ou tous)
 */
const displayedInsights = computed(() => {
  if (showAllInsights.value) {
    return prioritizedInsights.value
  }
  return prioritizedInsights.value.slice(0, maxInsightsDisplay)
})

/**
 * Toggle affichage de tous les insights
 */
const toggleShowAllInsights = (): void => {
  showAllInsights.value = !showAllInsights.value
}

/**
 * Rafraîchit les projections
 * Note: Dans un vrai cas, cela devrait appeler l'API
 */
const handleRefresh = async (): Promise<void> => {
  isLoading.value = true
  error.value = null

  try {
    // Simuler un délai
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mettre à jour le timestamp
    lastUpdated.value = new Date().toISOString()

    // Émettre un événement pour que le parent recharge les données
    emit('refresh')
  } catch (err: any) {
    error.value = 'Erreur lors du rafraîchissement'
    console.error('Erreur refresh:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Formate un temps relatif
 * École 42: Fonction utilitaire, max 25 lignes
 */
const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffMinutes < 1) return "à l'instant"
  if (diffMinutes < 60) return `il y a ${diffMinutes} min`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `il y a ${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  return `il y a ${diffDays}j`
}

/**
 * Watch pour mettre à jour lastUpdated quand les props changent
 */
watch(
  () => [props.projections, props.insights],
  () => {
    if (props.projections.length > 0 || props.insights.length > 0) {
      lastUpdated.value = new Date().toISOString()
    }
  },
  { deep: true },
)

// Emit pour le parent
const emit = defineEmits<{
  refresh: []
}>()
</script>

<style scoped>
.ai-projections-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  flex: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.last-updated {
  font-size: 0.75rem;
  color: #718096;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  transition: all 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: white;
  border-color: #667eea;
  color: #667eea;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 1rem;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Loading & Error */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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

/* Content */
.projections-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
}

/* Insights */
.insights-section {
  padding-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.insights-grid {
  display: grid;
  gap: 1rem;
}

.btn-show-more {
  margin-top: 1rem;
  width: 100%;
  padding: 0.75rem;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  transition: all 0.2s ease;
}

.btn-show-more:hover {
  background: white;
  border-color: #cbd5e0;
}

/* Projections */
.projections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Note */
.confidence-note {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  border-radius: 8px;
}

.note-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.note-text {
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .ai-projections-card {
    padding: 1.5rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-refresh {
    width: 100%;
    justify-content: center;
  }

  .projections-grid {
    grid-template-columns: 1fr;
  }
}
</style>
