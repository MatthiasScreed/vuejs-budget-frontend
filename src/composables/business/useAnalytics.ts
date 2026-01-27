import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'

interface AnalyticsFilters {
  period: 'week' | 'month' | 'quarter' | 'year'
  category_ids?: number[]
  transaction_type?: 'income' | 'expense'
  start_date?: string
  end_date?: string
}

interface FinancialMetrics {
  total_income: number
  total_expenses: number
  net_balance: number
  savings_rate: number
  expense_growth: number
  income_growth: number
}

interface CategoryAnalytics {
  category_id: number
  category_name: string
  total_amount: number
  transaction_count: number
  average_amount: number
  trend: 'up' | 'down' | 'stable'
  percentage_of_total: number
}

interface MonthlyTrend {
  month: string
  income: number
  expenses: number
  savings: number
  transactions_count: number
}

interface AIInsight {
  type: 'warning' | 'tip' | 'achievement' | 'prediction'
  title: string
  message: string
  confidence: number
  action_suggested?: string
}

/**
 * Composable pour analytics avancés et insights IA
 * Métriques financières, tendances, prédictions
 */
export function useAnalytics() {
  const { get, post } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()

  // State
  const metrics = ref<FinancialMetrics | null>(null)
  const categoryAnalytics = ref<CategoryAnalytics[]>([])
  const monthlyTrends = ref<MonthlyTrend[]>([])
  const aiInsights = ref<AIInsight[]>([])
  const loading = ref(false)

  /**
   * Charger les métriques financières
   */
  async function loadMetrics(filters: AnalyticsFilters): Promise<void> {
    loading.value = true

    try {
      metrics.value = await remember(
        `metrics_${JSON.stringify(filters)}`,
        async () => {
          const response = await post<FinancialMetrics>('/analytics/metrics', filters)
          return response.data
        },
        5 * 60 * 1000, // 5 minutes
        ['analytics', 'metrics']
      )
    } catch (error: any) {
      await handleApiError(error, 'loadMetrics')
    } finally {
      loading.value = false
    }
  }

  /**
   * Analyser les dépenses par catégorie
   */
  async function analyzeCategorySpending(filters: AnalyticsFilters): Promise<void> {
    try {
      categoryAnalytics.value = await remember(
        `category_analytics_${JSON.stringify(filters)}`,
        async () => {
          const response = await post<CategoryAnalytics[]>('/analytics/categories', filters)
          return response.data || []
        },
        5 * 60 * 1000,
        ['analytics', 'categories']
      )
    } catch (error: any) {
      await handleApiError(error, 'analyzeCategorySpending')
    }
  }

  /**
   * Obtenir les tendances mensuelles
   */
  async function getMonthlyTrends(monthsBack: number = 12): Promise<void> {
    try {
      monthlyTrends.value = await remember(
        `monthly_trends_${monthsBack}`,
        async () => {
          const response = await get<MonthlyTrend[]>(`/analytics/trends?months=${monthsBack}`)
          return response.data || []
        },
        10 * 60 * 1000, // 10 minutes
        ['analytics', 'trends']
      )
    } catch (error: any) {
      await handleApiError(error, 'getMonthlyTrends')
    }
  }

  /**
   * Générer des insights IA personnalisés
   */
  async function generateAIInsights(): Promise<void> {
    try {
      aiInsights.value = await remember(
        'ai_insights',
        async () => {
          const response = await get<AIInsight[]>('/analytics/ai-insights')
          return response.data || []
        },
        15 * 60 * 1000, // 15 minutes
        ['analytics', 'ai']
      )
    } catch (error: any) {
      await handleApiError(error, 'generateAIInsights')
    }
  }

  /**
   * Comparer les performances avec la moyenne
   */
  async function getBenchmarkComparison(): Promise<any> {
    return remember(
      'benchmark_comparison',
      async () => {
        const response = await get('/analytics/benchmark')
        return response.data
      },
      60 * 60 * 1000, // 1 heure
      ['analytics', 'benchmark']
    )
  }

  /**
   * Prédire les dépenses futures
   */
  async function predictFutureSpending(months: number = 3): Promise<any[]> {
    return remember(
      `spending_prediction_${months}`,
      async () => {
        const response = await post('/analytics/predict', { months })
        return response.data || []
      },
      30 * 60 * 1000, // 30 minutes
      ['analytics', 'predictions']
    )
  }

  /**
   * Analyser les habitudes de dépenses
   */
  async function analyzeSpendingHabits(): Promise<any> {
    return remember(
      'spending_habits',
      async () => {
        const response = await get('/analytics/habits')
        return response.data
      },
      20 * 60 * 1000, // 20 minutes
      ['analytics', 'habits']
    )
  }

  /**
   * Calculer le taux d'épargne moyen
   */
  function calculateSavingsRate(): number {
    if (!metrics.value) return 0

    const { total_income, total_expenses } = metrics.value

    if (total_income <= 0) return 0

    const savings = total_income - total_expenses
    return Math.round((savings / total_income) * 100)
  }

  /**
   * Identifier les catégories les plus problématiques
   */
  function getProblematicCategories(): CategoryAnalytics[] {
    return categoryAnalytics.value
      .filter(c => c.trend === 'up')
      .sort((a, b) => b.percentage_of_total - a.percentage_of_total)
      .slice(0, 3)
  }

  /**
   * Obtenir les recommandations d'optimisation
   */
  function getOptimizationTips(): string[] {
    const tips: string[] = []

    if (calculateSavingsRate() < 10) {
      tips.push('Augmentez votre taux d\'épargne (actuellement < 10%)')
    }

    const problematic = getProblematicCategories()
    if (problematic.length > 0) {
      tips.push(`Surveillez la catégorie "${problematic[0].category_name}" (tendance à la hausse)`)
    }

    return tips
  }

  /**
   * Calculer la variance des dépenses
   */
  function calculateExpenseVariance(): number {
    if (monthlyTrends.value.length < 2) return 0

    const expenses = monthlyTrends.value.map(t => t.expenses)
    const avg = expenses.reduce((sum, val) => sum + val, 0) / expenses.length

    const variance = expenses.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / expenses.length

    return Math.sqrt(variance)
  }

  /**
   * Mettre à jour une catégorie dans la liste
   */
  function updateCategoryInList(updatedCategory: Category): void {
    const index = categories.value.findIndex(c => c.id === updatedCategory.id)

    if (index !== -1) {
      categories.value[index] = updatedCategory
    }
  }

  /**
   * Invalider les caches analytics
   */
  function invalidateCategoryCaches(): void {
    invalidateByTag('categories')
    invalidateByTag('analytics')
    invalidateByTag('budgets')
  }

  /**
   * Exporter les données analytics
   */
  async function exportAnalytics(format: 'csv' | 'json' | 'pdf'): Promise<Blob | null> {
    try {
      const response = await post(`/analytics/export`, { format }, {
        headers: { 'Accept': 'application/octet-stream' }
      })

      // Traiter la réponse binaire
      return new Blob([response.data])
    } catch (error: any) {
      await handleApiError(error, 'exportAnalytics')
      return null
    }
  }

  // Computed properties
  const topSpendingCategories = computed(() =>
    categoryAnalytics.value
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 5)
  )

  const savingsRate = computed(() => calculateSavingsRate())

  const expenseVariance = computed(() => calculateExpenseVariance())

  const hasPositiveTrend = computed(() => {
    if (monthlyTrends.value.length < 2) return null

    const lastTwo = monthlyTrends.value.slice(-2)
    return lastTwo[1].savings > lastTwo[0].savings
  })

  const criticalInsights = computed(() =>
    aiInsights.value.filter(i => i.type === 'warning' && i.confidence > 0.8)
  )

  return {
    // State
    metrics,
    categoryAnalytics,
    monthlyTrends,
    aiInsights,
    loading,

    // Computed
    topSpendingCategories,
    savingsRate,
    expenseVariance,
    hasPositiveTrend,
    criticalInsights,

    // Methods
    loadMetrics,
    analyzeCategorySpending,
    getMonthlyTrends,
    generateAIInsights,
    getBenchmarkComparison,
    predictFutureSpending,
    analyzeSpendingHabits,
    exportAnalytics,
    getOptimizationTips,
    getProblematicCategories
  }
}
