import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'
import { useGamingNotifications } from '../ui/useGamingNotifications'
import type { Achievement, AchievementProgress, ApiResponse } from '@/types'

interface AchievementCondition {
  type: 'transaction_count' | 'total_income' | 'balance_positive' | 'streak_days' | 'goals_completed'
  operator: 'gte' | 'lte' | 'eq'
  value: number
  timeframe?: 'day' | 'week' | 'month' | 'all_time'
}

interface AchievementUnlock {
  achievement_id: number
  unlocked_at: string
  xp_bonus: number
  rarity_bonus: number
  progress_snapshot: Record<string, any>
}

interface AchievementCategory {
  id: string
  name: string
  icon: string
  achievements: Achievement[]
  completion_rate: number
}

/**
 * Composable pour système d'achievements avancé
 * Déblocage automatique, progression, rarités, bonus XP
 */
export function useAchievements() {
  const { get, post } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()
  const { notifyAchievementUnlocked } = useGamingNotifications()

  // State
  const achievements = ref<Achievement[]>([])
  const userProgress = ref<Record<number, AchievementProgress>>({})
  const recentUnlocks = ref<AchievementUnlock[]>([])
  const categories = ref<AchievementCategory[]>([])
  const loading = ref(false)

  /**
   * Initialiser le système d'achievements
   */
  async function initAchievements(): Promise<void> {
    loading.value = true

    try {
      await Promise.all([
        loadAllAchievements(),
        loadUserProgress(),
        loadRecentUnlocks(),
        loadCategories()
      ])
    } catch (error: any) {
      await handleApiError(error, 'initAchievements')
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger tous les achievements disponibles
   */
  async function loadAllAchievements(): Promise<void> {
    achievements.value = await remember(
      'all_achievements',
      async () => {
        const response = await get<Achievement[]>('/gaming/achievements')
        return response.data || []
      },
      30 * 60 * 1000, // 30 minutes (change rarement)
      ['gaming', 'achievements']
    )
  }

  /**
   * Charger la progression utilisateur
   */
  async function loadUserProgress(): Promise<void> {
    const progress = await remember(
      'achievements_progress',
      async () => {
        const response = await get<Record<number, AchievementProgress>>('/gaming/achievements/progress')
        return response.data || {}
      },
      2 * 60 * 1000, // 2 minutes
      ['gaming', 'progress']
    )

    userProgress.value = progress
  }

  /**
   * Vérifier et débloquer de nouveaux achievements
   */
  async function checkForUnlocks(): Promise<AchievementUnlock[]> {
    try {
      const response = await post<AchievementUnlock[]>('/gaming/achievements/check')

      if (response.success && response.data) {
        const newUnlocks = response.data

        // Traiter chaque nouvel unlock
        for (const unlock of newUnlocks) {
          await processAchievementUnlock(unlock)
        }

        return newUnlocks
      }

      return []
    } catch (error: any) {
      await handleApiError(error, 'checkForUnlocks')
      return []
    }
  }

  /**
   * Traiter un déblocage d'achievement
   */
  async function processAchievementUnlock(unlock: AchievementUnlock): Promise<void> {
    // Ajouter aux unlocks récents
    recentUnlocks.value.unshift(unlock)

    // Mettre à jour la progression
    userProgress.value[unlock.achievement_id] = {
      achievement_id: unlock.achievement_id,
      current_value: 0,
      target_value: 0,
      completed: true,
      unlocked_at: unlock.unlocked_at
    }

    // Notifier l'utilisateur
    const achievement = achievements.value.find(a => a.id === unlock.achievement_id)
    if (achievement) {
      await notifyAchievementUnlocked(achievement, unlock.xp_bonus)
    }

    // Invalider les caches
    invalidateAchievementCaches()
  }

  /**
   * Calculer la progression d'un achievement
   */
  function calculateProgress(achievementId: number): number {
    const progress = userProgress.value[achievementId]

    if (!progress || progress.target_value <= 0) return 0

    const percent = (progress.current_value / progress.target_value) * 100
    return Math.min(100, Math.round(percent))
  }

  /**
   * Vérifier si un achievement est débloqué
   */
  function isUnlocked(achievementId: number): boolean {
    return Boolean(userProgress.value[achievementId]?.completed)
  }

  /**
   * Obtenir les achievements par rareté
   */
  function getAchievementsByRarity(rarity: string): Achievement[] {
    return achievements.value.filter(a => a.rarity === rarity)
  }

  /**
   * Calculer le score total des achievements
   */
  function calculateAchievementScore(): number {
    const rarityPoints = {
      common: 10,
      uncommon: 25,
      rare: 50,
      epic: 100,
      legendary: 250
    }

    return unlockedAchievements.value.reduce((score, achievement) => {
      const points = rarityPoints[achievement.rarity as keyof typeof rarityPoints] || 0
      return score + points
    }, 0)
  }

  /**
   * Obtenir les achievements proches du déblocage
   */
  function getNearCompletionAchievements(threshold: number = 80): Achievement[] {
    return achievements.value.filter(achievement => {
      const progress = calculateProgress(achievement.id)
      return progress >= threshold && progress < 100
    })
  }

  /**
   * Charger les unlocks récents
   */
  async function loadRecentUnlocks(): Promise<void> {
    recentUnlocks.value = await remember(
      'recent_achievement_unlocks',
      async () => {
        const response = await get<AchievementUnlock[]>('/gaming/achievements/recent')
        return response.data || []
      },
      5 * 60 * 1000, // 5 minutes
      ['gaming', 'unlocks']
    )
  }

  /**
   * Charger les catégories d'achievements
   */
  async function loadCategories(): Promise<void> {
    categories.value = await remember(
      'achievement_categories',
      async () => {
        const response = await get<AchievementCategory[]>('/gaming/achievements/categories')
        return response.data || []
      },
      15 * 60 * 1000, // 15 minutes
      ['gaming', 'categories']
    )
  }

  /**
   * Forcer la vérification d'un achievement spécifique
   */
  async function forceCheckAchievement(achievementId: number): Promise<boolean> {
    try {
      const response = await post(`/gaming/achievements/${achievementId}/check`)

      if (response.success) {
        await loadUserProgress()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'forceCheckAchievement')
      return false
    }
  }

  /**
   * Obtenir les suggestions d'achievements
   */
  async function getAchievementSuggestions(): Promise<Achievement[]> {
    return remember(
      'achievement_suggestions',
      async () => {
        const response = await get<Achievement[]>('/gaming/achievements/suggestions')
        return response.data || []
      },
      10 * 60 * 1000, // 10 minutes
      ['gaming', 'suggestions']
    )
  }

  /**
   * Invalider les caches achievements
   */
  function invalidateAchievementCaches(): void {
    invalidateByTag('gaming')
    invalidateByTag('achievements')
    invalidateByTag('progress')
  }

  // Computed properties
  const unlockedAchievements = computed(() =>
    achievements.value.filter(a => isUnlocked(a.id))
  )

  const availableAchievements = computed(() =>
    achievements.value.filter(a => !isUnlocked(a.id))
  )

  const completionRate = computed(() => {
    const total = achievements.value.length
    const unlocked = unlockedAchievements.value.length
    return total > 0 ? Math.round((unlocked / total) * 100) : 0
  })

  const achievementScore = computed(() => calculateAchievementScore())

  const nearCompletion = computed(() => getNearCompletionAchievements())

  const legendaryUnlocked = computed(() =>
    unlockedAchievements.value.filter(a => a.rarity === 'legendary').length
  )

  return {
    // State
    achievements,
    userProgress,
    recentUnlocks,
    categories,
    loading,

    // Computed
    unlockedAchievements,
    availableAchievements,
    completionRate,
    achievementScore,
    nearCompletion,
    legendaryUnlocked,

    // Methods
    initAchievements,
    checkForUnlocks,
    calculateProgress,
    isUnlocked,
    getAchievementsByRarity,
    getNearCompletionAchievements,
    forceCheckAchievement,
    getAchievementSuggestions
  }
}
