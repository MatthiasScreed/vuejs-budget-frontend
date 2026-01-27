// src/stores/goalStore.ts - VERSION COMPLÈTE ET CORRIGÉE
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import type { ApiResponse } from '@/types/base'

// ==========================================
// TYPES
// ==========================================

export interface FinancialGoal {
  id: number
  user_id: number
  name: string
  description?: string
  target_amount: number
  current_amount: number
  target_date: string
  status: 'active' | 'completed' | 'paused'
  icon?: string
  created_at: string
  updated_at: string
}

export interface CreateGoalData {
  name: string
  description?: string
  target_amount: number
  target_date: string
  current_amount?: number
  icon?: string
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  status?: 'active' | 'completed' | 'paused'
}

export interface GoalContribution {
  id: number
  goal_id: number
  amount: number
  description?: string
  created_at: string
}

// ==========================================
// STORE DEFINITION - ✅ EXPORT CORRECT
// ==========================================

export const useGoalStore = defineStore('goal', () => {
  // ==========================================
  // STATE
  // ==========================================

  const goals = ref<FinancialGoal[]>([])
  const currentGoal = ref<FinancialGoal | null>(null)
  const contributions = ref<GoalContribution[]>([])

  // États de chargement
  const loading = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const deleting = ref(false)

  // Erreurs
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]>>({})

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * Objectifs actifs
   */
  const activeGoals = computed(() => {
    return goals.value.filter(goal => goal.status === 'active')
  })

  /**
   * Objectifs terminés
   */
  const completedGoals = computed(() => {
    return goals.value.filter(goal => goal.status === 'completed')
  })

  /**
   * Objectifs en pause
   */
  const pausedGoals = computed(() => {
    return goals.value.filter(goal => goal.status === 'paused')
  })

  /**
   * Montant total épargné
   */
  const totalSaved = computed(() => {
    return goals.value.reduce((sum, goal) => sum + goal.current_amount, 0)
  })

  /**
   * Montant total des objectifs
   */
  const totalTarget = computed(() => {
    return goals.value.reduce((sum, goal) => sum + goal.target_amount, 0)
  })

  /**
   * Progression générale
   */
  const overallProgress = computed(() => {
    const total = totalTarget.value
    const saved = totalSaved.value
    return total > 0 ? Math.round((saved / total) * 100) : 0
  })

  /**
   * Nombre d'objectifs sur la bonne voie
   */
  const goalsOnTrack = computed(() => {
    return activeGoals.value.filter(goal => {
      const progress = (goal.current_amount / goal.target_amount) * 100
      const daysRemaining = Math.ceil(
        (new Date(goal.target_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
      )
      const expectedProgress = daysRemaining > 0
        ? 100 - (daysRemaining / 365) * 100
        : 100

      return progress >= expectedProgress * 0.8
    }).length
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Récupérer tous les objectifs
   */
  async function fetchGoals(): Promise<void> {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      console.log('🎯 Chargement des objectifs...')

      const response = await api.get<any>('/financial-goals')

      // ✅ Vérification complète de la réponse
      if (!response) {
        console.warn('⚠️ Aucune réponse de l\'API')
        goals.value = []
        return
      }

      if (response.success && response.data) {
        // Gérer les deux formats possibles
        const goalsData = Array.isArray(response.data)
          ? response.data
          : response.data.data || []

        goals.value = goalsData
        console.log('✅ Objectifs chargés:', goals.value.length)
      } else {
        console.warn('⚠️ API returned no data')
        goals.value = []
      }

    } catch (err: any) {
      console.error('❌ Erreur chargement objectifs:', err)
      error.value = err.message || 'Erreur lors du chargement des objectifs'
      goals.value = [] // ✅ Toujours initialiser

    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer un objectif par son ID
   */
  async function fetchGoal(goalId: number): Promise<FinancialGoal | null> {
    try {
      console.log('🎯 Chargement objectif:', goalId)

      const response = await api.get<FinancialGoal>(`/financial-goals/${goalId}`)

      if (!response) {
        throw new Error('Aucune réponse de l\'API')
      }

      if (response.success && response.data) {
        currentGoal.value = response.data
        return response.data
      }

      return null

    } catch (err: any) {
      console.error('❌ Erreur chargement objectif:', err)
      error.value = err.message
      return null
    }
  }

  /**
   * Créer un nouvel objectif
   */
  async function createGoal(data: CreateGoalData): Promise<boolean> {
    creating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      console.log('📝 Création objectif:', data)

      const response = await api.post<FinancialGoal>('/financial-goals', data)

      if (!response) {
        throw new Error('Aucune réponse de l\'API')
      }

      if (response.success && response.data) {
        goals.value.push(response.data)
        console.log('✅ Objectif créé:', response.data)
        return true
      }

      if (response.errors) {
        validationErrors.value = response.errors
      }

      error.value = response.message || 'Erreur lors de la création'
      return false

    } catch (err: any) {
      console.error('❌ Erreur création objectif:', err)

      if (err.response?.status === 422 && err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors
        error.value = 'Erreur de validation'
      } else {
        error.value = err.message || 'Erreur lors de la création de l\'objectif'
      }

      return false

    } finally {
      creating.value = false
    }
  }

  /**
   * Mettre à jour un objectif
   */
  async function updateGoal(
    goalId: number,
    data: UpdateGoalData
  ): Promise<boolean> {
    updating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      console.log('✏️ Mise à jour objectif:', goalId, data)

      const response = await api.put<FinancialGoal>(
        `/financial-goals/${goalId}`,
        data
      )

      if (!response) {
        throw new Error('Aucune réponse de l\'API')
      }

      if (response.success && response.data) {
        const index = goals.value.findIndex(g => g.id === goalId)
        if (index !== -1) {
          goals.value[index] = response.data
        }

        if (currentGoal.value?.id === goalId) {
          currentGoal.value = response.data
        }

        console.log('✅ Objectif mis à jour')
        return true
      }

      if (response.errors) {
        validationErrors.value = response.errors
      }

      error.value = response.message || 'Erreur lors de la mise à jour'
      return false

    } catch (err: any) {
      console.error('❌ Erreur mise à jour objectif:', err)

      if (err.response?.status === 422 && err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors
        error.value = 'Erreur de validation'
      } else {
        error.value = err.message || 'Erreur lors de la mise à jour'
      }

      return false

    } finally {
      updating.value = false
    }
  }

  /**
   * Supprimer un objectif
   */
  async function deleteGoal(goalId: number): Promise<boolean> {
    deleting.value = true
    error.value = null

    try {
      console.log('🗑️ Suppression objectif:', goalId)

      const response = await api.delete(`/financial-goals/${goalId}`)

      if (!response) {
        throw new Error('Aucune réponse de l\'API')
      }

      if (response.success) {
        goals.value = goals.value.filter(g => g.id !== goalId)

        if (currentGoal.value?.id === goalId) {
          currentGoal.value = null
        }

        console.log('✅ Objectif supprimé')
        return true
      }

      error.value = response.message || 'Erreur lors de la suppression'
      return false

    } catch (err: any) {
      console.error('❌ Erreur suppression objectif:', err)
      error.value = err.message || 'Erreur lors de la suppression'
      return false

    } finally {
      deleting.value = false
    }
  }

  /**
   * Ajouter une contribution à un objectif
   */
  async function addContribution(
    goalId: number,
    data: { amount: number; description?: string }
  ): Promise<boolean> {
    try {
      console.log('💰 Ajout contribution:', { goalId, ...data })

      const response = await api.post(
        `/financial-goals/${goalId}/contributions`,
        data
      )

      if (!response) {
        throw new Error('Aucune réponse de l\'API')
      }

      if (response.success) {
        // Recharger les objectifs pour avoir les montants à jour
        await fetchGoals()
        console.log('✅ Contribution ajoutée')
        return true
      }

      error.value = response.message || 'Erreur lors de l\'ajout'
      return false

    } catch (err: any) {
      console.error('❌ Erreur ajout contribution:', err)
      error.value = err.message || 'Erreur lors de l\'ajout de la contribution'
      return false
    }
  }

  /**
   * Récupérer les contributions d'un objectif
   */
  async function fetchContributions(goalId: number): Promise<void> {
    try {
      console.log('💰 Chargement contributions:', goalId)

      const response = await api.get<GoalContribution[]>(
        `/financial-goals/${goalId}/contributions`
      )

      if (!response) {
        throw new Error('Aucune réponse de l\'API')
      }

      if (response.success && response.data) {
        contributions.value = Array.isArray(response.data)
          ? response.data
          : []
        console.log('✅ Contributions chargées:', contributions.value.length)
      } else {
        contributions.value = []
      }

    } catch (err: any) {
      console.error('❌ Erreur chargement contributions:', err)
      contributions.value = []
    }
  }

  /**
   * Changer le statut d'un objectif
   */
  async function changeStatus(
    goalId: number,
    status: 'active' | 'completed' | 'paused'
  ): Promise<boolean> {
    return updateGoal(goalId, { status })
  }

  /**
   * Marquer un objectif comme complété
   */
  async function completeGoal(goalId: number): Promise<boolean> {
    return changeStatus(goalId, 'completed')
  }

  /**
   * Mettre un objectif en pause
   */
  async function pauseGoal(goalId: number): Promise<boolean> {
    return changeStatus(goalId, 'paused')
  }

  /**
   * Réactiver un objectif
   */
  async function resumeGoal(goalId: number): Promise<boolean> {
    return changeStatus(goalId, 'active')
  }

  /**
   * Réinitialiser le store
   */
  function $reset(): void {
    goals.value = []
    currentGoal.value = null
    contributions.value = []
    loading.value = false
    creating.value = false
    updating.value = false
    deleting.value = false
    error.value = null
    validationErrors.value = {}
  }

  // ==========================================
  // RETURN - ✅ EXPOSER TOUTES LES VARIABLES
  // ==========================================

  return {
    // State
    goals,
    currentGoal,
    contributions,
    loading,
    creating,
    updating,
    deleting,
    error,
    validationErrors,

    // Getters
    activeGoals,
    completedGoals,
    pausedGoals,
    totalSaved,
    totalTarget,
    overallProgress,
    goalsOnTrack,

    // Actions
    fetchGoals,
    fetchGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    fetchContributions,
    changeStatus,
    completeGoal,
    pauseGoal,
    resumeGoal,
    $reset
  }
})

// ==========================================
// EXPORT DEFAULT - Pour compatibilité
// ==========================================

export default useGoalStore
