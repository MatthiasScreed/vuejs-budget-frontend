import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserLevel, XPEvent, LevelReward } from '@/types/entities/gaming'
import api from '@/services/api'

// ==========================================
// INTERFACES
// ==========================================

interface LevelUpResult {
  leveledUp: boolean
  oldLevel: number
  newLevel: number
  xpGained: number
  rewards?: LevelReward[]
}

interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ==========================================
// XP SOURCES COINQUEST
// ==========================================

export const XP_SOURCES = {
  // 💰 Actions financières de base
  TRANSACTION_CREATED: { amount: 10, label: 'Transaction enregistrée' },
  TRANSACTION_CATEGORIZED: { amount: 5, label: 'Transaction catégorisée' },
  BUDGET_RESPECTED: { amount: 50, label: 'Budget mensuel respecté' },

  // 🎯 Objectifs d'épargne
  GOAL_CREATED: { amount: 25, label: 'Objectif créé' },
  GOAL_CONTRIBUTION: { amount: 20, label: 'Contribution à un objectif' },
  GOAL_COMPLETED: { amount: 200, label: 'Objectif atteint' },
  SAVINGS_MILESTONE: { amount: 100, label: 'Palier d\'épargne atteint' },

  // 📊 Progression
  STREAK_MAINTAINED: { amount: 15, label: 'Série maintenue' },
  WEEKLY_SUMMARY: { amount: 30, label: 'Résumé hebdomadaire consulté' },
  SPENDING_REDUCED: { amount: 40, label: 'Dépenses réduites' },

  // 🎮 Gamification
  ACHIEVEMENT_UNLOCKED: { amount: 75, label: 'Succès débloqué' },
  CHALLENGE_COMPLETED: { amount: 100, label: 'Défi complété' },
  DAILY_LOGIN: { amount: 5, label: 'Connexion quotidienne' }
} as const

// ==========================================
// STORE
// ==========================================

export const useLevelStore = defineStore('level', () => {
  // ==========================================
  // STATE
  // ==========================================

  const userLevel = ref<UserLevel | null>(null)
  const xpEvents = ref<XPEvent[]>([])
  const levelRewards = ref<LevelReward[]>([])

  const loading = ref(false)
  const updatingXP = ref(false)
  const error = ref<string | null>(null)

  const levelConfig = ref({
    baseXP: 100,
    multiplier: 1.5,
    maxLevel: 100
  })

  // ==========================================
  // GETTERS
  // ==========================================

  const currentLevel = computed(() => userLevel.value?.level || 1)
  const totalXP = computed(() => userLevel.value?.total_xp || 0)
  const currentLevelXP = computed(() => userLevel.value?.current_level_xp || 0)

  const nextLevelXP = computed(() => {
    return userLevel.value?.next_level_xp || calculateXPForLevel(currentLevel.value + 1)
  })

  const levelProgress = computed(() => {
    const current = currentLevelXP.value
    const needed = nextLevelXP.value
    return needed > 0 ? Math.round((current / needed) * 100) : 0
  })

  const estimatedTimeToNextLevel = computed(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentEvents = xpEvents.value.filter(event =>
      new Date(event.created_at) > weekAgo
    )

    if (recentEvents.length === 0) return null

    const totalXPLastWeek = recentEvents.reduce((sum, event) => sum + event.xp_amount, 0)
    const averageXPPerDay = totalXPLastWeek / 7
    const xpNeeded = nextLevelXP.value - currentLevelXP.value

    return averageXPPerDay > 0 ? Math.ceil(xpNeeded / averageXPPerDay) : null
  })

  const userRank = computed(() => {
    const level = currentLevel.value

    if (level >= 50) return { name: 'Grand Maître', color: '#FFD700', icon: '👑' }
    if (level >= 40) return { name: 'Maître', color: '#FFA500', icon: '🏆' }
    if (level >= 30) return { name: 'Expert', color: '#9932CC', icon: '🥇' }
    if (level >= 20) return { name: 'Avancé', color: '#1E90FF', icon: '🥈' }
    if (level >= 10) return { name: 'Intermédiaire', color: '#32CD32', icon: '🥉' }
    if (level >= 5) return { name: 'Apprenti', color: '#FF6347', icon: '📚' }
    return { name: 'Débutant', color: '#696969', icon: '🌱' }
  })

  const recentXPEvents = computed(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return xpEvents.value
      .filter(event => new Date(event.created_at) > weekAgo)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
  })

  const todayXP = computed(() => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    return xpEvents.value
      .filter(event => new Date(event.created_at) >= startOfDay)
      .reduce((sum, event) => sum + event.xp_amount, 0)
  })

  const weekXP = computed(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return xpEvents.value
      .filter(event => new Date(event.created_at) > weekAgo)
      .reduce((sum, event) => sum + event.xp_amount, 0)
  })

  // ==========================================
  // ACTIONS - API CALLS
  // ==========================================

    /**
    * Charger le niveau de l'utilisateur
    * ✅ Gère le cas où le niveau n'existe pas encore
    */
  async function fetchUserLevel(): Promise<void> {
    // Éviter les appels multiples simultanés
    if (loading.value) {
      console.log('⏳ fetchUserLevel déjà en cours...')
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await api.get('/gaming/level')

      // ✅ Gestion flexible de la structure de réponse
      const data = response.data?.data || response.data

      if (data) {
        userLevel.value = data
        console.log('✅ Niveau chargé:', data)
      } else if (response.data?.success === false) {
        // Pas de niveau = créer un niveau par défaut
        console.log('ℹ️ Pas de niveau trouvé, création du niveau 1 par défaut')
        userLevel.value = createDefaultLevel()
      } else {
        throw new Error('Structure de réponse invalide')
      }
    } catch (err: any) {
      // ✅ NE PAS considérer 404 comme une erreur fatale
      if (err.response?.status === 404 || err.message?.includes('not found')) {
        console.log('ℹ️ Niveau non trouvé (nouvel utilisateur), création par défaut')
        userLevel.value = createDefaultLevel()
        error.value = null // Pas d'erreur pour l'utilisateur
      } else {
        error.value = err.message || 'Erreur lors du chargement du niveau'
        console.error('❌ Erreur fetchUserLevel:', err)

        // ✅ Fallback vers niveau par défaut même en cas d'erreur
        if (!userLevel.value) {
          userLevel.value = createDefaultLevel()
        }
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Créer un niveau par défaut pour nouvel utilisateur
   */
  function createDefaultLevel(): UserLevel {
    return {
      id: 0,
      user_id: 0,
      level: 1,
      current_level_xp: 0,
      total_xp: 0,
      next_level_xp: 100,
      title: 'Débutant',
      rank: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }


  async function fetchXPEvents(limit: number = 50): Promise<void> {
    try {
      const response = await api.get<ApiResponse<XPEvent[]>>(
        `/gaming/xp-events?limit=${limit}`
      )

      if (response?.data?.success) {
        xpEvents.value = response.data.data
      } else {
        throw new Error(response?.data?.message || 'Erreur chargement événements XP')
      }
    } catch (err) {
      handleError(err, 'fetchXPEvents')
    }
  }

  async function fetchLevelRewards(): Promise<void> {
    try {
      const response = await api.get<ApiResponse<LevelReward[]>>('/gaming/level-rewards')

      if (response?.data?.success) {
        levelRewards.value = response.data.data
      } else {
        throw new Error(response?.data?.message || 'Erreur chargement récompenses')
      }
    } catch (err) {
      handleError(err, 'fetchLevelRewards')
    }
  }

  async function addXP(
    amount: number,
    source: string,
    description?: string
  ): Promise<LevelUpResult> {
    updatingXP.value = true
    error.value = null

    try {
      const response = await api.post<ApiResponse<{
        userLevel: UserLevel
        leveledUp: boolean
        rewards?: LevelReward[]
      }>>('/gaming/add-xp', { amount, source, description })

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Erreur ajout XP')
      }

      const result = response.data.data
      const oldLevel = userLevel.value?.level || 1

      userLevel.value = result.userLevel

      // Ajouter l'événement localement
      xpEvents.value.unshift({
        id: Date.now().toString(),
        user_id: result.userLevel.user_id,
        event_type: source,
        xp_amount: amount,
        description: description || `XP gagné via ${source}`,
        created_at: new Date().toISOString()
      })

      return {
        leveledUp: result.leveledUp,
        oldLevel,
        newLevel: result.userLevel.level,
        xpGained: amount,
        rewards: result.rewards
      }
    } catch (err) {
      handleError(err, 'addXP')
      return {
        leveledUp: false,
        oldLevel: currentLevel.value,
        newLevel: currentLevel.value,
        xpGained: 0
      }
    } finally {
      updatingXP.value = false
    }
  }

  async function claimLevelRewards(level: number): Promise<boolean> {
    try {
      const response = await api.post<ApiResponse<boolean>>(
        `/gaming/claim-level-rewards/${level}`
      )

      if (response?.data?.success) {
        levelRewards.value = levelRewards.value.map(reward =>
          reward.level === level ? { ...reward, claimed: true } : reward
        )
        return true
      }

      throw new Error(response?.data?.message || 'Erreur réclamation récompenses')
    } catch (err) {
      handleError(err, 'claimLevelRewards')
      return false
    }
  }

  // ==========================================
  // ACTIONS - COINQUEST SPECIFIC
  // ==========================================

  /**
   * 🎯 Ajoute de l'XP pour une contribution à un objectif
   */
  async function rewardGoalContribution(
    goalName: string,
    amount: number
  ): Promise<LevelUpResult> {
    const xpSource = XP_SOURCES.GOAL_CONTRIBUTION
    const description = `💰 ${amount}€ économisés pour "${goalName}"`

    return addXP(xpSource.amount, 'goal_contribution', description)
  }

  /**
   * 🎯 Ajoute de l'XP pour un objectif complété
   */
  async function rewardGoalCompleted(
    goalName: string,
    totalAmount: number
  ): Promise<LevelUpResult> {
    const xpSource = XP_SOURCES.GOAL_COMPLETED
    const description = `🎉 Objectif "${goalName}" atteint ! (${totalAmount}€)`

    return addXP(xpSource.amount, 'goal_completed', description)
  }

  /**
   * 💰 Ajoute de l'XP pour le respect du budget
   */
  async function rewardBudgetRespected(month: string): Promise<LevelUpResult> {
    const xpSource = XP_SOURCES.BUDGET_RESPECTED
    const description = `📊 Budget ${month} respecté !`

    return addXP(xpSource.amount, 'budget_respected', description)
  }

  /**
   * 📈 Ajoute de l'XP pour une réduction des dépenses
   */
  async function rewardSpendingReduced(
    percentage: number
  ): Promise<LevelUpResult> {
    const xpSource = XP_SOURCES.SPENDING_REDUCED
    const description = `📉 Dépenses réduites de ${percentage}% !`

    return addXP(xpSource.amount, 'spending_reduced', description)
  }

  /**
   * 🔥 Ajoute de l'XP pour une série maintenue
   */
  async function rewardStreakMaintained(days: number): Promise<LevelUpResult> {
    const xpSource = XP_SOURCES.STREAK_MAINTAINED
    const bonus = Math.floor(days / 7) * 5 // +5 XP par semaine
    const description = `🔥 Série de ${days} jours !`

    return addXP(xpSource.amount + bonus, 'streak_maintained', description)
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  function calculateXPForLevel(level: number): number {
    const { baseXP, multiplier } = levelConfig.value
    return Math.floor(baseXP * Math.pow(level, multiplier))
  }

  function calculateTotalXPForLevel(level: number): number {
    let totalXP = 0
    for (let i = 1; i < level; i++) {
      totalXP += calculateXPForLevel(i)
    }
    return totalXP
  }

  function getLevelFromTotalXP(totalXP: number): number {
    let level = 1
    let xpForCurrentLevel = 0
    const { maxLevel } = levelConfig.value

    while (xpForCurrentLevel <= totalXP && level < maxLevel) {
      level++
      xpForCurrentLevel += calculateXPForLevel(level)
    }

    return level - 1
  }

  function getRewardsForLevel(level: number): LevelReward[] {
    return levelRewards.value.filter(reward => reward.level === level)
  }

  function hasUnclaimedRewards(): boolean {
    return levelRewards.value.some(reward =>
      reward.level <= currentLevel.value && !reward.claimed
    )
  }

  /**
   * Gestion centralisée des erreurs
   */
  function handleError(err: any, context: string): void {
    console.error(`[levelStore.${context}]`, err)

    if (err.response) {
      error.value = `Erreur ${err.response.status}: ${err.response.statusText}`
    } else if (err.request) {
      error.value = 'Impossible de contacter le serveur'
    } else {
      error.value = err.message || `Erreur dans ${context}`
    }
  }

  function clearError(): void {
    error.value = null
  }

  function $reset(): void {
    userLevel.value = null
    xpEvents.value = []
    levelRewards.value = []
    loading.value = false
    updatingXP.value = false
    error.value = null
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    userLevel,
    xpEvents,
    levelRewards,
    loading,
    updatingXP,
    error,
    levelConfig,

    // Getters
    currentLevel,
    totalXP,
    currentLevelXP,
    nextLevelXP,
    levelProgress,
    estimatedTimeToNextLevel,
    userRank,
    recentXPEvents,
    todayXP,
    weekXP,

    // Actions - API
    fetchUserLevel,
    fetchXPEvents,
    fetchLevelRewards,
    addXP,
    claimLevelRewards,

    // Actions - CoinQuest Specific
    rewardGoalContribution,
    rewardGoalCompleted,
    rewardBudgetRespected,
    rewardSpendingReduced,
    rewardStreakMaintained,

    // Utility
    calculateXPForLevel,
    calculateTotalXPForLevel,
    getLevelFromTotalXP,
    getRewardsForLevel,
    hasUnclaimedRewards,
    clearError,
    $reset
  }
})
