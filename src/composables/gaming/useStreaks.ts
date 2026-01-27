import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'
import { useGamingNotifications } from '../ui/useGamingNotifications'

interface UserStreak {
  id: number
  type: 'daily_transaction' | 'budget_respect' | 'goal_progress' | 'login_streak'
  name: string
  description: string
  current_count: number
  best_count: number
  last_activity: string
  is_active: boolean
  bonus_multiplier: number
  next_milestone: number
}

interface StreakBonus {
  days: number
  xp_multiplier: number
  special_reward?: string
  badge_unlocked?: string
}

interface StreakMilestone {
  days: number
  title: string
  description: string
  xp_bonus: number
  badge?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

/**
 * Composable pour système de streaks avec bonus progressifs
 * Séries quotidiennes, bonus XP, milestones, maintien automatique
 */
export function useStreaks() {
  const { get, post, put } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()
  const { notifyStreakMilestone } = useGamingNotifications()

  // State
  const userStreaks = ref<UserStreak[]>([])
  const streakHistory = ref<any[]>([])
  const availableBonuses = ref<StreakBonus[]>([])
  const loading = ref(false)

  /**
   * Initialiser le système de streaks
   */
  async function initStreaks(): Promise<void> {
    loading.value = true

    try {
      await Promise.all([
        loadUserStreaks(),
        loadStreakBonuses(),
        checkDailyStreaks()
      ])
    } catch (error: any) {
      await handleApiError(error, 'initStreaks')
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les streaks de l'utilisateur
   */
  async function loadUserStreaks(): Promise<void> {
    userStreaks.value = await remember(
      'user_streaks',
      async () => {
        const response = await get<UserStreak[]>('/gaming/streaks')
        return response.data || []
      },
      2 * 60 * 1000, // 2 minutes
      ['gaming', 'streaks']
    )
  }

  /**
   * Incrémenter une streak
   */
  async function incrementStreak(streakType: string, context?: Record<string, any>): Promise<boolean> {
    try {
      const response = await post<UserStreak>('/gaming/streaks/increment', {
        type: streakType,
        context
      })

      if (response.success && response.data) {
        updateStreakInList(response.data)

        // Vérifier les milestones
        await checkStreakMilestones(response.data)

        invalidateStreakCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'incrementStreak')
      return false
    }
  }

  /**
   * Vérifier les milestones de streak
   */
  async function checkStreakMilestones(streak: UserStreak): Promise<void> {
    const milestones = getStreakMilestones()
    const currentMilestone = milestones.find(m => m.days === streak.current_count)

    if (currentMilestone) {
      await notifyStreakMilestone(streak.name, streak.current_count)

      // Attribuer le bonus XP
      if (currentMilestone.xp_bonus > 0) {
        await awardStreakBonus(streak.id, currentMilestone.xp_bonus)
      }
    }
  }

  /**
   * Réinitialiser une streak (échec)
   */
  async function resetStreak(streakId: number, reason?: string): Promise<void> {
    try {
      await post(`/gaming/streaks/${streakId}/reset`, { reason })

      // Mettre à jour localement
      const streak = userStreaks.value.find(s => s.id === streakId)
      if (streak) {
        streak.current_count = 0
        streak.is_active = false
      }

      invalidateStreakCaches()
    } catch (error: any) {
      await handleApiError(error, 'resetStreak')
    }
  }

  /**
   * Vérifier les streaks quotidiennes automatiquement
   */
  async function checkDailyStreaks(): Promise<void> {
    try {
      const response = await post('/gaming/streaks/daily-check')

      if (response.success) {
        await loadUserStreaks()
      }
    } catch (error: any) {
      await handleApiError(error, 'checkDailyStreaks')
    }
  }

  /**
   * Obtenir le bonus multiplier actuel
   */
  function getCurrentMultiplier(streakType: string): number {
    const streak = userStreaks.value.find(s => s.type === streakType && s.is_active)

    if (!streak) return 1.0

    // Calcul bonus progressif
    if (streak.current_count >= 365) return 3.0 // 1 an
    if (streak.current_count >= 100) return 2.5 // 100 jours
    if (streak.current_count >= 30) return 2.0  // 1 mois
    if (streak.current_count >= 7) return 1.5   // 1 semaine
    if (streak.current_count >= 3) return 1.2   // 3 jours

    return 1.0
  }

  /**
   * Calculer l'XP avec bonus de streak
   */
  function calculateStreakXP(baseXP: number, streakType: string): number {
    const multiplier = getCurrentMultiplier(streakType)
    return Math.floor(baseXP * multiplier)
  }

  /**
   * Obtenir les milestones de streak
   */
  function getStreakMilestones(): StreakMilestone[] {
    return [
      { days: 3, title: '🔥 Bon départ', description: '3 jours consécutifs', xp_bonus: 50, rarity: 'common' },
      { days: 7, title: '📅 Une semaine', description: '7 jours de suite', xp_bonus: 100, rarity: 'common' },
      { days: 14, title: '💪 Deux semaines', description: '14 jours consécutifs', xp_bonus: 200, rarity: 'uncommon' },
      { days: 30, title: '🏆 Un mois', description: '30 jours de régularité', xp_bonus: 500, badge: 'monthly_master', rarity: 'rare' },
      { days: 50, title: '⭐ Cinquantaine', description: '50 jours impressionnants', xp_bonus: 750, rarity: 'rare' },
      { days: 100, title: '💯 Centenaire', description: '100 jours d\'élite', xp_bonus: 1500, badge: 'centurion', rarity: 'epic' },
      { days: 365, title: '👑 Légende', description: 'Une année complète', xp_bonus: 5000, badge: 'legend', rarity: 'legendary' }
    ]
  }

  /**
   * Attribuer bonus XP de streak
   */
  async function awardStreakBonus(streakId: number, xpBonus: number): Promise<void> {
    try {
      await post('/gaming/xp/bonus', {
        source: 'streak_milestone',
        streak_id: streakId,
        amount: xpBonus
      })
    } catch (error: any) {
      await handleApiError(error, 'awardStreakBonus')
    }
  }

  /**
   * Charger les bonus disponibles
   */
  async function loadStreakBonuses(): Promise<void> {
    availableBonuses.value = await remember(
      'streak_bonuses',
      async () => {
        const response = await get<StreakBonus[]>('/gaming/streaks/bonuses')
        return response.data || []
      },
      30 * 60 * 1000, // 30 minutes
      ['gaming', 'bonuses']
    )
  }

  /**
   * Obtenir l'historique des streaks
   */
  async function loadStreakHistory(): Promise<void> {
    streakHistory.value = await remember(
      'streak_history',
      async () => {
        const response = await get('/gaming/streaks/history')
        return response.data || []
      },
      10 * 60 * 1000,
      ['gaming', 'history']
    )
  }

  /**
   * Mettre à jour une streak dans la liste
   */
  function updateStreakInList(updatedStreak: UserStreak): void {
    const index = userStreaks.value.findIndex(s => s.id === updatedStreak.id)

    if (index !== -1) {
      userStreaks.value[index] = updatedStreak
    } else {
      userStreaks.value.push(updatedStreak)
    }
  }

  /**
   * Obtenir l'ID utilisateur actuel
   */
  function getCurrentUserId(): number {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr)?.id || 0 : 0
  }

  /**
   * Invalider les caches streaks
   */
  function invalidateStreakCaches(): void {
    invalidateByTag('gaming')
    invalidateByTag('streaks')
    invalidateByTag('bonuses')
  }

  // Computed properties
  const activeStreaks = computed(() =>
    userStreaks.value.filter(s => s.is_active)
  )

  const longestStreak = computed(() =>
    Math.max(...userStreaks.value.map(s => s.best_count), 0)
  )

  const totalActiveStreaks = computed(() => activeStreaks.value.length)

  const averageMultiplier = computed(() => {
    const multipliers = activeStreaks.value.map(s => getCurrentMultiplier(s.type))
    return multipliers.length > 0
      ? Math.round((multipliers.reduce((sum, m) => sum + m, 0) / multipliers.length) * 100) / 100
      : 1.0
  })

  const nextMilestones = computed(() =>
    activeStreaks.value.map(streak => {
      const milestones = getStreakMilestones()
      const next = milestones.find(m => m.days > streak.current_count)

      return {
        streak_name: streak.name,
        days_needed: next ? next.days - streak.current_count : 0,
        milestone: next
      }
    }).filter(item => item.days_needed > 0)
  )

  return {
    // State
    userStreaks,
    streakHistory,
    availableBonuses,
    loading,

    // Computed
    activeStreaks,
    longestStreak,
    totalActiveStreaks,
    averageMultiplier,
    nextMilestones,

    // Methods
    initStreaks,
    incrementStreak,
    resetStreak,
    checkDailyStreaks,
    getCurrentMultiplier,
    calculateStreakXP,
    getStreakMilestones,
    loadStreakHistory
  }
}
