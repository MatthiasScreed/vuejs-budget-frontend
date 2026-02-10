// src/composables/useDashboardMetrics.ts

import { ref, computed } from 'vue'
import type { DashboardMetrics, CategoryBreakdown, GoalProgress } from '@/types/dashboard.types'

/**
 * Composable pour calculer les métriques du dashboard
 * École 42: Séparation logique métier / UI
 */
export function useDashboardMetrics() {
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // Données brutes (à charger depuis API)
  const monthlyIncome = ref(0)
  const monthlyExpenses = ref(0)
  const goals = ref<GoalProgress[]>([])
  const categories = ref<CategoryBreakdown[]>([])

  /**
   * Calcule la capacité d'épargne
   * École 42: Max 25 lignes
   */
  const savingsCapacity = computed(() => {
    return monthlyIncome.value - monthlyExpenses.value
  })

  /**
   * Calcule le taux d'épargne
   */
  const savingsRate = computed(() => {
    if (monthlyIncome.value === 0) return 0
    return (savingsCapacity.value / monthlyIncome.value) * 100
  })

  /**
   * Formate un montant en euros
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Formate un pourcentage
   */
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  /**
   * Charge les données du dashboard
   */
  const loadDashboardData = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Remplacer par vraie API
      await simulateAPICall()

      monthlyIncome.value = 2500
      monthlyExpenses.value = 1800

      goals.value = [
        {
          id: 1,
          name: 'Voyage au Japon',
          currentAmount: 5400,
          targetAmount: 15000,
          progressPercentage: 36,
          estimatedCompletionDate: '2026-08-15',
          category: 'travel',
          icon: '🗾',
        },
        {
          id: 2,
          name: "Fonds d'urgence",
          currentAmount: 3200,
          targetAmount: 5000,
          progressPercentage: 64,
          estimatedCompletionDate: '2026-05-20',
          category: 'emergency',
          icon: '🛡️',
        },
      ]

      categories.value = [
        {
          id: 1,
          name: 'Logement',
          amount: 850,
          percentage: 47.2,
          color: '#667eea',
          icon: '🏠',
          trend: 'stable',
          trendPercentage: 0,
        },
        {
          id: 2,
          name: 'Alimentation',
          amount: 420,
          percentage: 23.3,
          color: '#764ba2',
          icon: '🍽️',
          trend: 'down',
          trendPercentage: -8.5,
        },
        {
          id: 3,
          name: 'Transport',
          amount: 180,
          percentage: 10,
          color: '#f093fb',
          icon: '🚗',
          trend: 'up',
          trendPercentage: 12.3,
        },
      ]
    } catch (err) {
      error.value = 'Erreur de chargement'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Simule un appel API
   */
  const simulateAPICall = (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, 500)
    })
  }

  return {
    isLoading,
    error,
    monthlyIncome,
    monthlyExpenses,
    savingsCapacity,
    savingsRate,
    goals,
    categories,
    formatCurrency,
    formatPercentage,
    loadDashboardData,
  }
}
