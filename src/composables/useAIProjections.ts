// src/composables/useAIProjections.ts

import { ref, computed } from 'vue'
import { ProjectionService } from '@/services/projectionService'
import type { FinancialProjection, AIInsight, ProjectionData } from '@/types/projection.types'

/**
 * Composable pour les projections IA
 * École 42: Séparation logique métier / UI
 */
export function useAIProjections() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Données
  const projections = ref<FinancialProjection[]>([])
  const insights = ref<AIInsight[]>([])
  const lastUpdated = ref<string>('')

  /**
   * Charge les projections
   */
  const loadProjections = async (
    monthlyIncome: number,
    monthlyExpenses: number,
    categories: any[],
  ): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Simule un appel API (à remplacer par vraie API)
      await simulateAPICall()

      // Calcule les projections pour chaque période
      projections.value = [
        ProjectionService.calculateProjection(monthlyIncome, monthlyExpenses, '3months'),
        ProjectionService.calculateProjection(monthlyIncome, monthlyExpenses, '6months'),
        ProjectionService.calculateProjection(monthlyIncome, monthlyExpenses, '12months'),
      ]

      // Génère les insights
      const currentSavings = monthlyIncome - monthlyExpenses
      insights.value = ProjectionService.generateInsights(
        projections.value,
        currentSavings,
        categories,
      )

      lastUpdated.value = new Date().toISOString()
    } catch (err) {
      error.value = 'Erreur de chargement des projections'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Insights triés par priorité
   */
  const prioritizedInsights = computed(() => {
    const priority = { high: 0, medium: 1, low: 2 }
    return [...insights.value].sort((a, b) => {
      return priority[a.priority] - priority[b.priority]
    })
  })

  /**
   * Meilleure projection (12 mois)
   */
  const bestProjection = computed(() => {
    return projections.value.find((p) => p.period === '12months')
  })

  /**
   * Simule un appel API
   */
  const simulateAPICall = (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, 800)
    })
  }

  return {
    isLoading,
    error,
    projections,
    insights,
    prioritizedInsights,
    bestProjection,
    lastUpdated,
    loadProjections,
  }
}
