import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'
import { useGamingNotifications } from '@/composables/ui'

interface BudgetConfig {
  monthly_income_target: number
  monthly_expense_limit: number
  savings_target: number
  emergency_fund_target: number
  currency: string
}

interface BudgetPeriod {
  month: string
  income: number
  expenses: number
  savings: number
  budget_respect: boolean
  categories_breakdown: CategoryBudgetBreakdown[]
}

interface CategoryBudgetBreakdown {
  category_id: number
  category_name: string
  budgeted: number
  actual: number
  variance: number
  status: 'under' | 'on_track' | 'over'
}

interface BudgetAlert {
  type: 'overspend' | 'underspend' | 'savings_opportunity' | 'goal_risk'
  category?: string
  amount: number
  message: string
  urgency: 'low' | 'medium' | 'high'
}

/**
 * Composable pour gestion intelligente du budget mensuel
 * Suivi, alertes, optimisations et recommandations IA
 */
export function useBudget() {
  const { get, post, put } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()
  const { notifyBudgetAlert } = useGamingNotifications()

  // State
  const config = ref<BudgetConfig | null>(null)
  const currentPeriod = ref<BudgetPeriod | null>(null)
  const alerts = ref<BudgetAlert[]>([])
  const recommendations = ref<string[]>([])
  const loading = ref(false)

  /**
   * Initialiser la configuration budget
   */
  async function initBudget(): Promise<void> {
    loading.value = true

    try {
      await Promise.all([
        loadBudgetConfig(),
        loadCurrentPeriod(),
        checkBudgetAlerts()
      ])
    } catch (error: any) {
      await handleApiError(error, 'initBudget')
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger la configuration budget
   */
  async function loadBudgetConfig(): Promise<void> {
    config.value = await remember(
      'budget_config',
      async () => {
        const response = await get<BudgetConfig>('/budget/config')
        return response.data
      },
      10 * 60 * 1000, // 10 minutes
      ['budget', 'config']
    )
  }

  /**
   * Mettre à jour la configuration budget
   */
  async function updateBudgetConfig(newConfig: Partial<BudgetConfig>): Promise<boolean> {
    try {
      const response = await put<BudgetConfig>('/budget/config', newConfig)

      if (response.success && response.data) {
        config.value = response.data
        invalidateBudgetCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'updateBudgetConfig')
      return false
    }
  }

  /**
   * Charger la période budget actuelle
   */
  async function loadCurrentPeriod(): Promise<void> {
    currentPeriod.value = await remember(
      `budget_period_${getCurrentMonth()}`,
      async () => {
        const response = await get<BudgetPeriod>('/budget/current')
        return response.data
      },
      5 * 60 * 1000, // 5 minutes
      ['budget', 'period']
    )
  }

  /**
   * Vérifier les alertes budget
   */
  async function checkBudgetAlerts(): Promise<void> {
    try {
      const newAlerts = await remember(
        `budget_alerts_${getCurrentMonth()}`,
        async () => {
          const response = await get<BudgetAlert[]>('/budget/alerts')
          return response.data || []
        },
        2 * 60 * 1000, // 2 minutes
        ['budget', 'alerts']
      )

      // Notifier les nouvelles alertes critiques
      for (const alert of newAlerts) {
        if (alert.urgency === 'high' && !isAlertKnown(alert)) {
          await notifyBudgetAlert(alert.type as any, {
            categoryName: alert.category,
            overspend: alert.amount,
            savings: alert.amount
          })
        }
      }

      alerts.value = newAlerts
    } catch (error: any) {
      await handleApiError(error, 'checkBudgetAlerts')
    }
  }

  /**
   * Calculer le budget restant pour une catégorie
   */
  function getRemainingBudget(categoryId: number): number {
    if (!currentPeriod.value) return 0

    const breakdown = currentPeriod.value.categories_breakdown
      .find(c => c.category_id === categoryId)

    return breakdown ? Math.max(0, breakdown.budgeted - breakdown.actual) : 0
  }

  /**
   * Obtenir le statut budget d'une catégorie
   */
  function getCategoryBudgetStatus(categoryId: number): 'under' | 'on_track' | 'over' {
    if (!currentPeriod.value) return 'on_track'

    const breakdown = currentPeriod.value.categories_breakdown
      .find(c => c.category_id === categoryId)

    return breakdown?.status || 'on_track'
  }

  /**
   * Prédire le budget fin de mois
   */
  function predictMonthEndBudget(): { income: number; expenses: number; savings: number } {
    if (!currentPeriod.value || !config.value) {
      return { income: 0, expenses: 0, savings: 0 }
    }

    const daysInMonth = new Date().getDate()
    const totalDaysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const ratio = totalDaysInMonth / daysInMonth

    const predictedIncome = currentPeriod.value.income * ratio
    const predictedExpenses = currentPeriod.value.expenses * ratio

    return {
      income: Math.round(predictedIncome),
      expenses: Math.round(predictedExpenses),
      savings: Math.round(predictedIncome - predictedExpenses)
    }
  }

  /**
   * Générer recommandations d'optimisation
   */
  async function generateOptimizationTips(): Promise<void> {
    try {
      recommendations.value = await remember(
        'budget_recommendations',
        async () => {
          const response = await get<string[]>('/budget/recommendations')
          return response.data || []
        },
        15 * 60 * 1000, // 15 minutes
        ['budget', 'recommendations']
      )
    } catch (error: any) {
      await handleApiError(error, 'generateOptimizationTips')
    }
  }

  /**
   * Vérifier si le budget est respecté ce mois
   */
  function isBudgetRespected(): boolean {
    if (!currentPeriod.value || !config.value) return true

    return currentPeriod.value.expenses <= config.value.monthly_expense_limit
  }

  /**
   * Calculer le pourcentage d'utilisation du budget
   */
  function getBudgetUsagePercent(): number {
    if (!currentPeriod.value || !config.value) return 0

    const usage = (currentPeriod.value.expenses / config.value.monthly_expense_limit) * 100
    return Math.round(usage)
  }

  /**
   * Obtenir les jours restants dans le mois
   */
  function getDaysRemainingInMonth(): number {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return lastDay.getDate() - now.getDate()
  }

  /**
   * Calculer le budget quotidien disponible
   */
  function getDailyBudgetRemaining(): number {
    if (!config.value || !currentPeriod.value) return 0

    const remaining = config.value.monthly_expense_limit - currentPeriod.value.expenses
    const daysLeft = getDaysRemainingInMonth()

    return daysLeft > 0 ? Math.round(remaining / daysLeft) : 0
  }

  /**
   * Vérifier si une alerte est déjà connue
   */
  function isAlertKnown(alert: BudgetAlert): boolean {
    return alerts.value.some(a =>
      a.type === alert.type &&
      a.category === alert.category &&
      Math.abs(a.amount - alert.amount) < 10
    )
  }

  /**
   * Obtenir le mois actuel au format string
   */
  function getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7) // YYYY-MM
  }

  /**
   * Invalider les caches budget
   */
  function invalidateBudgetCaches(): void {
    invalidateByTag('budget')
    invalidateByTag('analytics')
  }

  // Computed properties
  const budgetHealthScore = computed(() => {
    if (!currentPeriod.value || !config.value) return 0

    let score = 100

    // Pénalité si budget dépassé
    if (currentPeriod.value.expenses > config.value.monthly_expense_limit) {
      score -= 30
    }

    // Pénalité selon le taux d'épargne
    const savingsRate = calculateSavingsRate()
    if (savingsRate < 10) score -= 20
    if (savingsRate < 5) score -= 20

    // Bonus si objectifs atteints
    if (currentPeriod.value.budget_respect) score += 10

    return Math.max(0, score)
  })

  const isOverBudget = computed(() => getBudgetUsagePercent() > 100)

  const criticalAlerts = computed(() =>
    alerts.value.filter(a => a.urgency === 'high')
  )

  const dailyBudgetAvailable = computed(() => getDailyBudgetRemaining())

  return {
    // State
    config,
    currentPeriod,
    alerts,
    recommendations,
    loading,

    // Computed
    budgetHealthScore,
    isOverBudget,
    criticalAlerts,
    dailyBudgetAvailable,

    // Methods
    initBudget,
    updateBudgetConfig,
    loadCurrentPeriod,
    checkBudgetAlerts,
    generateOptimizationTips,
    getRemainingBudget,
    getCategoryBudgetStatus,
    predictMonthEndBudget,
    isBudgetRespected,
    getBudgetUsagePercent,
    getDaysRemainingInMonth,
    calculateSavingsRate
  }
}
