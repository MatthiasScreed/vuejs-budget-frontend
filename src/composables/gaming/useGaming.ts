import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'
import type {
  Achievement,
  Challenge,
  UserLevel,
  GamingStats,
  ApiResponse
} from '@/types'

interface GamingAction {
  type: string
  amount?: number
  context?: Record<string, any>
}

interface XPResult {
  xp_gained: number
  new_level?: number
  achievements_unlocked: string[]
  level_up: boolean
}

/**
 * Composable principal du système gaming
 * Orchestration des XP, achievements, challenges et niveaux
 */
export function useGaming() {
  const { post, get } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()

  // State
  const currentLevel = ref<UserLevel | null>(null)
  const achievements = ref<Achievement[]>([])
  const activeChallenges = ref<Challenge[]>([])
  const stats = ref<GamingStats | null>(null)
  const loading = ref(false)

  /**
   * Initialiser le système gaming pour l'utilisateur
   */
  async function initGaming(): Promise<void> {
    loading.value = true

    try {
      await Promise.all([
        loadUserLevel(),
        loadAchievements(),
        loadActiveChallenges(),
        loadStats()
      ])
    } catch (error: any) {
      await handleApiError(error, 'initGaming')
    } finally {
      loading.value = false
    }
  }

  /**
   * Déclencher une action gaming et gérer les récompenses
   */
  async function triggerAction(action: GamingAction): Promise<XPResult> {
    try {
      const response = await post<XPResult>('/gaming/action', action)

      if (response.success && response.data) {
        // Mettre à jour le state local
        await updateLocalState(response.data)

        // Invalider les caches
        invalidateGamingCaches()

        return response.data
      }

      return { xp_gained: 0, achievements_unlocked: [], level_up: false }
    } catch (error: any) {
      await handleApiError(error, 'triggerGamingAction')
      return { xp_gained: 0, achievements_unlocked: [], level_up: false }
    }
  }

  /**
   * Charger le niveau utilisateur
   */
  async function loadUserLevel(): Promise<void> {
    const level = await remember(
      'user_level',
      async () => {
        const response = await get<UserLevel>('/gaming/level')
        return response.data
      },
      60 * 1000, // 1 minute
      ['gaming', 'user']
    )

    currentLevel.value = level
  }

  /**
   * Charger les achievements
   */
  async function loadAchievements(): Promise<void> {
    achievements.value = await remember(
      'achievements',
      async () => {
        const response = await get<Achievement[]>('/gaming/achievements')
        return response.data || []
      },
      5 * 60 * 1000, // 5 minutes
      ['gaming', 'achievements']
    )
  }

  /**
   * Charger les défis actifs
   */
  async function loadActiveChallenges(): Promise<void> {
    activeChallenges.value = await remember(
      'active_challenges',
      async () => {
        const response = await get<Challenge[]>('/gaming/challenges/active')
        return response.data || []
      },
      2 * 60 * 1000, // 2 minutes
      ['gaming', 'challenges']
    )
  }

  /**
   * Charger les statistiques gaming
   */
  async function loadStats(): Promise<void> {
    stats.value = await remember(
      'gaming_stats',
      async () => {
        const response = await get<GamingStats>('/gaming/stats')
        return response.data
      },
      5 * 60 * 1000,
      ['gaming', 'stats']
    )
  }

  /**
   * Mettre à jour le state local après action
   */
  async function updateLocalState(result: XPResult): Promise<void> {
    if (result.level_up && result.new_level) {
      await loadUserLevel()
    }

    if (result.achievements_unlocked.length > 0) {
      await loadAchievements()
    }

    await loadStats()
  }

  /**
   * Invalider les caches gaming
   */
  function invalidateGamingCaches(): void {
    invalidateByTag('gaming')
    invalidateByTag('user')
  }

  /**
   * Calculer l'XP pour une action spécifique
   */
  function calculateActionXP(actionType: string, amount?: number): number {
    const baseXP: Record<string, number> = {
      create_transaction: 10,
      create_goal: 50,
      complete_goal: 100,
      add_category: 25,
      daily_login: 5,
      first_transaction: 100
    }

    let xp = baseXP[actionType] || 0

    // Bonus pour transactions importantes
    if (actionType === 'create_transaction' && amount) {
      xp += Math.min(50, Math.floor(amount / 100))
    }

    return xp
  }

  // Computed properties
  const userLevel = computed(() => currentLevel.value?.level || 1)
  const totalXP = computed(() => currentLevel.value?.total_xp || 0)
  const nextLevelXP = computed(() => currentLevel.value?.next_level_xp || 100)
  const levelProgress = computed(() => {
    const current = currentLevel.value?.current_level_xp || 0
    const next = nextLevelXP.value
    return next > 0 ? Math.round((current / next) * 100) : 0
  })

  const unlockedAchievements = computed(() =>
    achievements.value.filter(a => a.unlocked_at)
  )

  const availableAchievements = computed(() =>
    achievements.value.filter(a => !a.unlocked_at)
  )

  return {
    // State
    currentLevel,
    achievements,
    activeChallenges,
    stats,
    loading,

    // Computed
    userLevel,
    totalXP,
    nextLevelXP,
    levelProgress,
    unlockedAchievements,
    availableAchievements,

    // Methods
    initGaming,
    triggerAction,
    calculateActionXP,
    loadUserLevel,
    loadAchievements,
    loadActiveChallenges,
    invalidateGamingCaches
  }
}
