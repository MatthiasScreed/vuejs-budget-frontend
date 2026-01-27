import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'
import type { FinancialGoal, GoalContribution, ApiResponse } from '@/types'

interface CreateGoalData {
  name: string
  description?: string
  target_amount: number
  target_date: string
  project_template?: string
  auto_contribute?: boolean
  contribution_rule?: {
    type: 'percentage' | 'fixed' | 'surplus'
    percentage?: number
    amount?: number
  }
}

interface GoalStats {
  total_goals: number
  active_goals: number
  completed_goals: number
  total_saved: number
  average_progress: number
}

/**
 * Composable pour la gestion complète des objectifs financiers
 * CRUD, contributions automatiques, suivi progression
 */
export function useGoals() {
  const { get, post, put, delete: del } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()

  // State
  const goals = ref<FinancialGoal[]>([])
  const contributions = ref<GoalContribution[]>([])
  const currentGoal = ref<FinancialGoal | null>(null)
  const loading = ref(false)

  /**
   * Charger tous les objectifs utilisateur
   */
  async function loadGoals(): Promise<void> {
    loading.value = true

    try {
      goals.value = await remember(
        'user_goals',
        async () => {
          const response = await get<FinancialGoal[]>('/goals')
          return response.data || []
        },
        2 * 60 * 1000, // 2 minutes
        ['goals']
      )
    } catch (error: any) {
      await handleApiError(error, 'loadGoals')
    } finally {
      loading.value = false
    }
  }

  /**
   * Créer un nouvel objectif
   */
  async function createGoal(data: CreateGoalData): Promise<ApiResponse<FinancialGoal>> {
    try {
      const response = await post<FinancialGoal>('/goals', data)

      if (response.success && response.data) {
        goals.value.unshift(response.data)
        invalidateGoalCaches()
      }

      return response
    } catch (error: any) {
      await handleApiError(error, 'createGoal')
      return { success: false, message: error.message }
    }
  }

  /**
   * Mettre à jour un objectif
   */
  async function updateGoal(id: number, data: Partial<CreateGoalData>): Promise<boolean> {
    try {
      const response = await put<FinancialGoal>(`/goals/${id}`, data)

      if (response.success && response.data) {
        updateGoalInList(response.data)
        invalidateGoalCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'updateGoal')
      return false
    }
  }

  /**
   * Supprimer un objectif
   */
  async function deleteGoal(id: number): Promise<boolean> {
    try {
      const response = await del(`/goals/${id}`)

      if (response.success) {
        goals.value = goals.value.filter(g => g.id !== id)
        invalidateGoalCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'deleteGoal')
      return false
    }
  }

  /**
   * Ajouter une contribution à un objectif
   */
  async function addContribution(
    goalId: number,
    amount: number,
    description?: string
  ): Promise<boolean> {
    try {
      const response = await post<GoalContribution>(`/goals/${goalId}/contribute`, {
        amount,
        description
      })

      if (response.success && response.data) {
        contributions.value.unshift(response.data)
        updateGoalProgress(goalId, amount)
        invalidateGoalCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'addContribution')
      return false
    }
  }

  /**
   * Charger les contributions d'un objectif
   */
  async function loadContributions(goalId: number): Promise<void> {
    try {
      contributions.value = await remember(
        `goal_contributions_${goalId}`,
        async () => {
          const response = await get<GoalContribution[]>(`/goals/${goalId}/contributions`)
          return response.data || []
        },
        5 * 60 * 1000, // 5 minutes
        ['goals', 'contributions']
      )
    } catch (error: any) {
      await handleApiError(error, 'loadContributions')
    }
  }

  /**
   * Calculer la progression d'un objectif
   */
  function calculateProgress(goal: FinancialGoal): number {
    if (goal.target_amount <= 0) return 0

    const progress = (goal.current_amount / goal.target_amount) * 100
    return Math.min(100, Math.round(progress))
  }

  /**
   * Vérifier si un objectif est en retard
   */
  function isGoalOverdue(goal: FinancialGoal): boolean {
    const targetDate = new Date(goal.target_date)
    const now = new Date()

    return now > targetDate && goal.status !== 'completed'
  }

  /**
   * Obtenir le temps restant pour un objectif
   */
  function getTimeRemaining(goal: FinancialGoal): number {
    const targetDate = new Date(goal.target_date)
    const now = new Date()

    return Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Mettre à jour un objectif dans la liste
   */
  function updateGoalInList(updatedGoal: FinancialGoal): void {
    const index = goals.value.findIndex(g => g.id === updatedGoal.id)

    if (index !== -1) {
      goals.value[index] = updatedGoal
    }
  }

  /**
   * Mettre à jour la progression locale
   */
  function updateGoalProgress(goalId: number, amount: number): void {
    const goal = goals.value.find(g => g.id === goalId)

    if (goal) {
      goal.current_amount += amount

      // Marquer comme terminé si objectif atteint
      if (goal.current_amount >= goal.target_amount) {
        goal.status = 'completed'
      }
    }
  }

  /**
   * Invalider les caches des objectifs
   */
  function invalidateGoalCaches(): void {
    invalidateByTag('goals')
    invalidateByTag('analytics')
    invalidateByTag('gaming')
  }

  /**
   * Obtenir les statistiques des objectifs
   */
  async function getGoalStats(): Promise<GoalStats> {
    return remember(
      'goal_stats',
      async () => {
        const response = await get<GoalStats>('/goals/stats')
        return response.data || {
          total_goals: 0,
          active_goals: 0,
          completed_goals: 0,
          total_saved: 0,
          average_progress: 0
        }
      },
      5 * 60 * 1000, // 5 minutes
      ['goals', 'stats']
    )
  }

  // Computed properties
  const activeGoals = computed(() =>
    goals.value.filter(g => g.status === 'active')
  )

  const completedGoals = computed(() =>
    goals.value.filter(g => g.status === 'completed')
  )

  const overdueGoals = computed(() =>
    activeGoals.value.filter(g => isGoalOverdue(g))
  )

  const totalSaved = computed(() =>
    goals.value.reduce((sum, g) => sum + g.current_amount, 0)
  )

  const totalTarget = computed(() =>
    goals.value.reduce((sum, g) => sum + g.target_amount, 0)
  )

  const overallProgress = computed(() => {
    const total = totalTarget.value
    return total > 0 ? Math.round((totalSaved.value / total) * 100) : 0
  })

  return {
    // State
    goals,
    contributions,
    currentGoal,
    loading,

    // Computed
    activeGoals,
    completedGoals,
    overdueGoals,
    totalSaved,
    totalTarget,
    overallProgress,

    // Methods
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    loadContributions,
    getGoalStats,
    calculateProgress,
    isGoalOverdue,
    getTimeRemaining
  }
}
