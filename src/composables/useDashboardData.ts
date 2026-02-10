// src/composables/useDashboardData.ts

import { ref, computed } from 'vue'
import { DashboardApi } from '@/services/api/dashboardApi'
import { TransactionApi } from '@/services/api/transactionApi'
import { GoalApi } from '@/services/api/goalApi'
import { ProjectionApi } from '@/services/api/projectionApi'
import type {
  DashboardMetricsResponse,
  GoalApiResponse,
  CategoryBreakdownResponse,
  TransactionApiResponse,
  ProjectionApiResponse,
  InsightApiResponse,
} from '@/types/api.types'

/**
 * Composable pour charger toutes les données du dashboard
 * École 42: Composable avec vraie API
 */
export function useDashboardData() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Données
  const metrics = ref<DashboardMetricsResponse | null>(null)
  const goals = ref<GoalApiResponse[]>([])
  const categories = ref<CategoryBreakdownResponse[]>([])
  const recentTransactions = ref<TransactionApiResponse[]>([])
  const projections = ref<ProjectionApiResponse[]>([])
  const insights = ref<InsightApiResponse[]>([])

  /**
   * Charge toutes les données du dashboard
   */
  const loadDashboardData = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Option 1: Endpoint unique qui retourne tout
      const dashboardData = await DashboardApi.getDashboardData()

      metrics.value = dashboardData.metrics
      goals.value = dashboardData.goals
      categories.value = dashboardData.categories
      recentTransactions.value = dashboardData.recent_transactions
      projections.value = dashboardData.projections

      // Charger les insights séparément
      insights.value = await ProjectionApi.getInsights()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur de chargement'
      console.error('Erreur dashboard:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Charge les données séparément (Option 2)
   */
  const loadDashboardDataSeparately = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Charger en parallèle
      const [metricsData, goalsData, transactionsData, projectionsData, insightsData] =
        await Promise.all([
          DashboardApi.getMetrics(),
          GoalApi.getActiveGoals(),
          TransactionApi.getRecentTransactions(10),
          ProjectionApi.getProjections(),
          ProjectionApi.getInsights(),
        ])

      metrics.value = metricsData
      goals.value = goalsData
      recentTransactions.value = transactionsData
      projections.value = projectionsData
      insights.value = insightsData
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur de chargement'
      console.error('Erreur dashboard:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Rafraîchit uniquement les métriques
   */
  const refreshMetrics = async (): Promise<void> => {
    try {
      metrics.value = await DashboardApi.refreshMetrics()
    } catch (err: any) {
      console.error('Erreur refresh metrics:', err)
    }
  }

  /**
   * Rafraîchit uniquement les projections
   */
  const refreshProjections = async (): Promise<void> => {
    try {
      projections.value = await ProjectionApi.refreshProjections()
      insights.value = await ProjectionApi.getInsights()
    } catch (err: any) {
      console.error('Erreur refresh projections:', err)
    }
  }

  return {
    isLoading,
    error,
    metrics,
    goals,
    categories,
    recentTransactions,
    projections,
    insights,
    loadDashboardData,
    loadDashboardDataSeparately,
    refreshMetrics,
    refreshProjections,
  }
}
