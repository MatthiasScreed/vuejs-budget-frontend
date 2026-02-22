// src/stores/goalStore.ts - VERSION FINALE
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

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
// STORE
// ==========================================

export const useGoalStore = defineStore('goal', () => {

  // ==========================================
  // STATE
  // ==========================================

  const goals       = ref<FinancialGoal[]>([])
  const currentGoal = ref<FinancialGoal | null>(null)
  const contributions = ref<GoalContribution[]>([])
  const loading     = ref(false)
  const creating    = ref(false)
  const updating    = ref(false)
  const deleting    = ref(false)
  const error       = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]>>({})

  // ==========================================
  // AUTH GUARD
  // ==========================================

  async function ensureAuthenticated(): Promise<boolean> {
    const authStore = useAuthStore()

    if (!authStore.isInitialized) {
      let attempts = 0
      while (!authStore.isInitialized && attempts < 30) {
        await new Promise((r) => setTimeout(r, 100))
        attempts++
      }
      if (!authStore.isInitialized) return false
    }

    return authStore.isAuthenticated
  }

  // ==========================================
  // HELPERS
  // ==========================================

  /**
   * Normalise les montants (Laravel retourne des strings pour les decimals)
   */
  function normalizeGoal(goal: any): FinancialGoal {
    return {
      ...goal,
      current_amount: parseFloat(goal.current_amount) || 0,
      target_amount:  parseFloat(goal.target_amount)  || 0,
      monthly_target: parseFloat(goal.monthly_target) || 0,
    }
  }

  /**
   * api.ts unwrap déjà response.data → on reçoit directement { success, data, message }
   * Cette fonction extrait de façon sécurisée le payload
   */
  function extractPayload(response: any) {
    // api.ts retourne déjà response.data (unwrappé)
    // Donc response = { success: bool, data: {...}, message: string }
    return {
      success: response?.success ?? false,
      data:    response?.data ?? null,
      message: response?.message ?? null,
      errors:  response?.errors ?? null,
    }
  }

  // ==========================================
  // GETTERS
  // ==========================================

  const activeGoals    = computed(() => goals.value.filter((g) => g.status === 'active'))
  const completedGoals = computed(() => goals.value.filter((g) => g.status === 'completed'))
  const pausedGoals    = computed(() => goals.value.filter((g) => g.status === 'paused'))

  const totalSaved  = computed(() => goals.value.reduce((s, g) => s + g.current_amount, 0))
  const totalTarget = computed(() => goals.value.reduce((s, g) => s + g.target_amount, 0))

  const overallProgress = computed(() => {
    const t = totalTarget.value
    return t > 0 ? Math.round((totalSaved.value / t) * 100) : 0
  })

  const goalsOnTrack = computed(() =>
    activeGoals.value.filter((goal) => {
      const progress = (goal.current_amount / goal.target_amount) * 100
      const days = Math.ceil(
        (new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
      const expected = days > 0 ? 100 - (days / 365) * 100 : 100
      return progress >= expected * 0.8
    }).length,
  )

  const stats = computed(() => ({
    active:          activeGoals.value.length,
    completed:       completedGoals.value.length,
    paused:          pausedGoals.value.length,
    totalSaved:      totalSaved.value,
    totalTarget:     totalTarget.value,
    overallProgress: overallProgress.value,
    onTrack:         goalsOnTrack.value,
  }))

  // ==========================================
  // CALCULS
  // ==========================================

  function calculateProgress(goal: FinancialGoal): number {
    if (!goal || goal.target_amount <= 0) return 0
    return Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
  }

  function calculateRemaining(goal: FinancialGoal): number {
    if (!goal) return 0
    return Math.max(0, goal.target_amount - goal.current_amount)
  }

  function calculateMonthlyTarget(goal: FinancialGoal): number {
    if (!goal || goal.status === 'completed') return 0
    const remaining = calculateRemaining(goal)
    if (remaining <= 0) return 0
    const months = (new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44)
    return months <= 0 ? remaining : Math.round(remaining / months)
  }

  function calculateDaysRemaining(goal: FinancialGoal): number {
    if (!goal?.target_date) return 0
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const target = new Date(goal.target_date); target.setHours(0, 0, 0, 0)
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  // ==========================================
  // ACTIONS
  // ==========================================

  async function fetchGoals(): Promise<void> {
    if (!await ensureAuthenticated()) { error.value = 'Authentification requise'; return }
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      // api.get retourne déjà { success, data, message } (unwrappé par api.ts)
      const response = await api.get<any>('/financial-goals')
      const { success, data } = extractPayload(response)

      if (success && data) {
        const raw = Array.isArray(data) ? data : data.data || []
        goals.value = raw.map(normalizeGoal)
        console.log('✅ [Goals] Objectifs chargés:', goals.value.length)
      } else {
        goals.value = []
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement'
      goals.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchGoal(goalId: number): Promise<FinancialGoal | null> {
    if (!await ensureAuthenticated()) return null

    try {
      const response = await api.get<FinancialGoal>(`/financial-goals/${goalId}`)
      const { success, data } = extractPayload(response)
      if (success && data) { currentGoal.value = data; return data }
      return null
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  async function createGoal(data: CreateGoalData): Promise<boolean> {
    if (creating.value) return false

    creating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      // api.post retourne déjà { success, data, message } (unwrappé par api.ts)
      const response = await api.post('/financial-goals', data)
      const { success, data: payload, message } = extractPayload(response)

      if (success) {
        const raw = payload?.goal ?? payload
        if (raw) goals.value.push(normalizeGoal(raw))
        return true
      }

      throw new Error(message || 'Erreur lors de la création')
    } catch (err: any) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors || {}
        error.value = Object.values(validationErrors.value).flat().join(', ')
      } else {
        error.value = err.response?.data?.message || err.message || 'Erreur lors de la création'
      }
      return false
    } finally {
      creating.value = false
    }
  }

  async function updateGoal(goalId: number, data: UpdateGoalData): Promise<boolean> {
    if (!await ensureAuthenticated()) { error.value = 'Authentification requise'; return false }

    updating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      // api.put retourne déjà { success, data, message } (unwrappé par api.ts)
      const response = await api.put<FinancialGoal>(`/financial-goals/${goalId}`, data)
      const { success, data: payload, message, errors } = extractPayload(response)

      if (success && payload) {
        const normalized = normalizeGoal(payload)
        const idx = goals.value.findIndex((g) => g.id === goalId)
        if (idx !== -1) goals.value[idx] = normalized
        if (currentGoal.value?.id === goalId) currentGoal.value = normalized
        return true
      }

      if (errors) validationErrors.value = errors
      error.value = message || 'Erreur lors de la mise à jour'
      return false
    } catch (err: any) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors || {}
        error.value = 'Erreur de validation'
      } else {
        error.value = err.message || 'Erreur lors de la mise à jour'
      }
      return false
    } finally {
      updating.value = false
    }
  }

  async function deleteGoal(goalId: number): Promise<boolean> {
    if (!await ensureAuthenticated()) { error.value = 'Authentification requise'; return false }

    deleting.value = true
    error.value = null

    try {
      // api.delete retourne déjà { success, message } (unwrappé par api.ts)
      const response = await api.delete(`/financial-goals/${goalId}`)
      const { success, message } = extractPayload(response)

      if (success) {
        goals.value = goals.value.filter((g) => g.id !== goalId)
        if (currentGoal.value?.id === goalId) currentGoal.value = null
        return true
      }

      error.value = message || 'Erreur lors de la suppression'
      return false
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression'
      return false
    } finally {
      deleting.value = false
    }
  }

  async function addContribution(goalId: number, amount: number, description?: string): Promise<boolean> {
    try {
      // api.post retourne déjà { success, data, message } (unwrappé par api.ts)
      const response = await api.post(`/financial-goals/${goalId}/contributions`, {
        amount: Number(amount),
        description,
      })
      const { success, data, message } = extractPayload(response)

      if (success) {
        const updatedGoal = data?.goal
        const idx = goals.value.findIndex((g) => g.id === goalId)
        if (idx !== -1) {
          if (updatedGoal) {
            goals.value[idx] = normalizeGoal(updatedGoal)
          } else {
            // Fallback local si l'API ne renvoie pas le goal mis à jour
            const goal = { ...goals.value[idx] }
            goal.current_amount = (parseFloat(String(goal.current_amount)) || 0) + amount
            if (goal.current_amount >= goal.target_amount) goal.status = 'completed'
            goals.value[idx] = normalizeGoal(goal)
          }
        }
        return true
      }

      throw new Error(message || "Erreur lors de l'ajout de la contribution")
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || "Erreur lors de l'ajout"
      return false
    }
  }

  async function fetchContributions(goalId: number): Promise<void> {
    if (!await ensureAuthenticated()) return

    try {
      const response = await api.get<GoalContribution[]>(`/financial-goals/${goalId}/contributions`)
      const { success, data } = extractPayload(response)
      contributions.value = success && Array.isArray(data) ? data : []
    } catch {
      contributions.value = []
    }
  }

  async function deleteDuplicates(): Promise<{ deletedCount: number } | false> {
    try {
      const response = await api.delete('/financial-goals/duplicates')
      const { success, data } = extractPayload(response)
      if (success) {
        if (data?.deleted_count > 0) await fetchGoals()
        return { deletedCount: data?.deleted_count ?? 0 }
      }
      return false
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du nettoyage des doublons'
      return false
    }
  }

  async function changeStatus(goalId: number, status: 'active' | 'completed' | 'paused'): Promise<boolean> {
    return updateGoal(goalId, { status })
  }

  const completeGoal = (id: number) => changeStatus(id, 'completed')
  const pauseGoal    = (id: number) => changeStatus(id, 'paused')
  const resumeGoal   = (id: number) => changeStatus(id, 'active')

  function clearErrors(): void {
    error.value = null
    validationErrors.value = {}
  }

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
  // RETURN
  // ==========================================

  return {
    // State
    goals, currentGoal, contributions,
    loading, creating, updating, deleting,
    error, validationErrors,
    // Getters
    activeGoals, completedGoals, pausedGoals,
    totalSaved, totalTarget, overallProgress, goalsOnTrack, stats,
    // Actions
    fetchGoals, fetchGoal,
    createGoal, updateGoal, deleteGoal,
    addContribution, fetchContributions,
    changeStatus, completeGoal, pauseGoal, resumeGoal,
    deleteDuplicates,
    calculateProgress, calculateRemaining, calculateMonthlyTarget, calculateDaysRemaining,
    clearErrors, $reset,
  }
})

export default useGoalStore
