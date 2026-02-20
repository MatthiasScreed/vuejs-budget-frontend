// src/stores/goalStore.ts - VERSION CORRIGÉE AVEC AUTH GUARD
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
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
// STORE DEFINITION - VERSION SÉCURISÉE ✅
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
  // 🔐 AUTH GUARD HELPER
  // ==========================================

  /**
   * Vérifier que l'utilisateur est authentifié avant un appel API
   */
  async function ensureAuthenticated(): Promise<boolean> {
    const authStore = useAuthStore()

    // 1️⃣ Attendre l'initialisation de l'auth
    if (!authStore.isInitialized) {
      console.log('⏳ [Goals] Attente initialisation auth...')

      let attempts = 0
      const maxAttempts = 30 // 3 secondes max

      while (!authStore.isInitialized && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 100))
        attempts++
      }

      if (!authStore.isInitialized) {
        console.error('❌ [Goals] Auth non initialisée après timeout')
        return false
      }
    }

    // 2️⃣ Vérifier l'authentification
    if (!authStore.isAuthenticated) {
      console.warn('⚠️ [Goals] Utilisateur non authentifié')
      return false
    }

    return true
  }

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * Objectifs actifs
   */
  const activeGoals = computed(() => {
    return goals.value.filter((goal) => goal.status === 'active')
  })

  /**
   * Objectifs terminés
   */
  const completedGoals = computed(() => {
    return goals.value.filter((goal) => goal.status === 'completed')
  })

  /**
   * Objectifs en pause
   */
  const pausedGoals = computed(() => {
    return goals.value.filter((goal) => goal.status === 'paused')
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
    return activeGoals.value.filter((goal) => {
      const progress = (goal.current_amount / goal.target_amount) * 100
      const daysRemaining = Math.ceil(
        (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      )
      const expectedProgress = daysRemaining > 0 ? 100 - (daysRemaining / 365) * 100 : 100

      return progress >= expectedProgress * 0.8
    }).length
  })

  /**
   * Statistiques globales
   */
  const stats = computed(() => {
    return {
      active: activeGoals.value.length,
      completed: completedGoals.value.length,
      paused: pausedGoals.value.length,
      totalSaved: totalSaved.value,
      totalTarget: totalTarget.value,
      overallProgress: overallProgress.value,
      onTrack: goalsOnTrack.value,
    }
  })

  // ==========================================
  // CALCULS
  // ==========================================

  /**
   * Calculer la progression d'un objectif
   */
  function calculateProgress(goal: FinancialGoal): number {
    if (!goal || goal.target_amount <= 0) return 0
    return Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
  }

  /**
   * Calculer le montant restant
   */
  function calculateRemaining(goal: FinancialGoal): number {
    if (!goal) return 0
    return Math.max(0, goal.target_amount - goal.current_amount)
  }

  /**
   * Calculer l'objectif mensuel suggéré
   */
  function calculateMonthlyTarget(goal: FinancialGoal): number {
    if (!goal || goal.status === 'completed') return 0

    const remaining = calculateRemaining(goal)
    if (remaining <= 0) return 0

    const now = new Date()
    const target = new Date(goal.target_date)
    const diffTime = target.getTime() - now.getTime()
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44)

    if (diffMonths <= 0) return remaining
    return Math.round(remaining / diffMonths)
  }

  /**
   * Calculer les jours restants
   */
  function calculateDaysRemaining(goal: FinancialGoal): number {
    if (!goal || !goal.target_date) return 0
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(goal.target_date)
    target.setHours(0, 0, 0, 0)
    const diffTime = target.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // ==========================================
  // ACTIONS - AVEC AUTH GUARD
  // ==========================================

  /**
   * Récupérer tous les objectifs
   * 🔐 Protégé par auth guard
   */
  async function fetchGoals(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Goals] fetchGoals annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return
    }

    if (loading.value) {
      console.log('⏳ [Goals] Chargement déjà en cours, ignoré')
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('🎯 [Goals] Chargement des objectifs...')

      const response = await api.get<any>('/financial-goals')

      if (!response) {
        console.warn("⚠️ [Goals] Aucune réponse de l'API")
        goals.value = []
        return
      }

      if (response.success && response.data) {
        // Gérer les deux formats possibles
        const goalsData = Array.isArray(response.data) ? response.data : response.data.data || []

        goals.value = goalsData
        console.log('✅ [Goals] Objectifs chargés:', goals.value.length)
      } else {
        console.warn('⚠️ [Goals] API returned no data')
        goals.value = []
      }
    } catch (err: any) {
      console.error('❌ [Goals] Erreur chargement objectifs:', err)
      error.value = err.message || 'Erreur lors du chargement des objectifs'
      goals.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer un objectif par son ID
   * 🔐 Protégé par auth guard
   */
  async function fetchGoal(goalId: number): Promise<FinancialGoal | null> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Goals] fetchGoal annulé - utilisateur non authentifié')
      return null
    }

    try {
      console.log('🎯 [Goals] Chargement objectif:', goalId)

      const response = await api.get<FinancialGoal>(`/financial-goals/${goalId}`)

      if (!response) {
        throw new Error("Aucune réponse de l'API")
      }

      if (response.success && response.data) {
        currentGoal.value = response.data
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('❌ [Goals] Erreur chargement objectif:', err)
      error.value = err.message
      return null
    }
  }

  /**
   * Créer un nouvel objectif
   * 🔐 Protégé par auth guard
   */
  async function createGoal(data: CreateGoalData): Promise<boolean> {
    // ✅ Empêche les appels simultanés
    if (creating.value) {
      console.warn('⚠️ createGoal déjà en cours, appel ignoré')
      return false
    }

    creating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const response = await api.post('/financial-goals', data)

      if (response.data.success) {
        // L'API retourne { data: { goal: {...}, engagement: {...} } }
        const goal = response.data.data?.goal ?? response.data.data
        if (goal) goals.value.push(goal)
        return true
      } else {
        throw new Error(response.data.message || 'Erreur lors de la création')
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors || {}
        error.value = Object.values(validationErrors.value).flat().join(', ')
      } else {
        error.value = err.response?.data?.message || err.message || 'Erreur lors de la création'
      }
      console.error('Erreur createGoal:', err)
      return false
    } finally {
      creating.value = false
    }
  }

  /**
   * Mettre à jour un objectif
   * 🔐 Protégé par auth guard
   */
  async function updateGoal(goalId: number, data: UpdateGoalData): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Goals] updateGoal annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return false
    }

    updating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      console.log('✏️ [Goals] Mise à jour objectif:', goalId, data)

      const response = await api.put<FinancialGoal>(`/financial-goals/${goalId}`, data)

      if (!response) {
        throw new Error("Aucune réponse de l'API")
      }

      if (response.success && response.data) {
        const index = goals.value.findIndex((g) => g.id === goalId)
        if (index !== -1) {
          goals.value[index] = response.data
        }

        if (currentGoal.value?.id === goalId) {
          currentGoal.value = response.data
        }

        console.log('✅ [Goals] Objectif mis à jour')
        return true
      }

      if (response.errors) {
        validationErrors.value = response.errors
      }

      error.value = response.message || 'Erreur lors de la mise à jour'
      return false
    } catch (err: any) {
      console.error('❌ [Goals] Erreur mise à jour objectif:', err)

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
   * 🔐 Protégé par auth guard
   */
  async function deleteGoal(goalId: number): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Goals] deleteGoal annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return false
    }

    deleting.value = true
    error.value = null

    try {
      console.log('🗑️ [Goals] Suppression objectif:', goalId)

      const response = await api.delete(`/financial-goals/${goalId}`)

      if (!response) {
        throw new Error("Aucune réponse de l'API")
      }

      if (response.success) {
        goals.value = goals.value.filter((g) => g.id !== goalId)

        if (currentGoal.value?.id === goalId) {
          currentGoal.value = null
        }

        console.log('✅ [Goals] Objectif supprimé')
        return true
      }

      error.value = response.message || 'Erreur lors de la suppression'
      return false
    } catch (err: any) {
      console.error('❌ [Goals] Erreur suppression objectif:', err)
      error.value = err.message || 'Erreur lors de la suppression'
      return false
    } finally {
      deleting.value = false
    }
  }

  /**
   * Ajouter une contribution à un objectif
   * 🔐 Protégé par auth guard
   */
  async function addContribution(
    goalId: number,
    data: { amount: number; description?: string },
  ): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Goals] addContribution annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return false
    }

    try {
      console.log('💰 [Goals] Ajout contribution:', { goalId, ...data })

      const response = await api.post(`/financial-goals/${goalId}/contributions`, data)

      if (!response) {
        throw new Error("Aucune réponse de l'API")
      }

      if (response.success) {
        // Recharger les objectifs pour avoir les montants à jour
        await fetchGoals()
        console.log('✅ [Goals] Contribution ajoutée')
        return true
      }

      error.value = response.message || "Erreur lors de l'ajout"
      return false
    } catch (err: any) {
      console.error('❌ [Goals] Erreur ajout contribution:', err)
      error.value = err.message || "Erreur lors de l'ajout de la contribution"
      return false
    }
  }

  /**
   * Récupérer les contributions d'un objectif
   * 🔐 Protégé par auth guard
   */
  async function fetchContributions(goalId: number): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Goals] fetchContributions annulé - utilisateur non authentifié')
      return
    }

    try {
      console.log('💰 [Goals] Chargement contributions:', goalId)

      const response = await api.get<GoalContribution[]>(`/financial-goals/${goalId}/contributions`)

      if (!response) {
        throw new Error("Aucune réponse de l'API")
      }

      if (response.success && response.data) {
        contributions.value = Array.isArray(response.data) ? response.data : []
        console.log('✅ [Goals] Contributions chargées:', contributions.value.length)
      } else {
        contributions.value = []
      }
    } catch (err: any) {
      console.error('❌ [Goals] Erreur chargement contributions:', err)
      contributions.value = []
    }
  }

  /**
   * Supprime les doublons d'objectifs côté API
   * et recharge la liste propre
   */
  async function deleteDuplicates(): Promise<{ deletedCount: number } | false> {
    try {
      const response = await api.delete('/financial-goals/duplicates')

      if (response.data.success) {
        const { deleted_count } = response.data.data

        // Recharger les objectifs si des doublons ont été supprimés
        if (deleted_count > 0) {
          await fetchGoals()
        }

        return { deletedCount: deleted_count }
      }

      return false
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du nettoyage des doublons'
      console.error('Erreur deleteDuplicates:', err)
      return false
    }
  }

  /**
   * Changer le statut d'un objectif
   */
  async function changeStatus(
    goalId: number,
    status: 'active' | 'completed' | 'paused',
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
    console.log('🔄 [Goals] Store réinitialisé')
  }

  // ==========================================
  // RETURN
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
    stats,

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
    deleteDuplicates,
    resumeGoal,
    calculateProgress,
    calculateRemaining,
    calculateMonthlyTarget,
    calculateDaysRemaining,
    $reset,
  }
})

export default useGoalStore
