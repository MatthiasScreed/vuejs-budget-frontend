import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { streakService } from '@/services/streakService'
import { useNotificationStore } from './notificationStore'
import { useXP } from '@/composables/useXP'
import type { Streak, StreakActivity } from '@/types'

export const useStreakStore = defineStore('streak', () => {

  // ==========================================
  // STATE
  // ==========================================

  const streaks = ref<Streak[]>([])
  const activities = ref<Map<string, StreakActivity[]>>(new Map())
  const currentStreaks = ref<Streak[]>([])

  // États de chargement
  const loading = ref(false)
  const updating = ref(false)
  const checking = ref(false)

  // Erreurs
  const error = ref<string | null>(null)

  // Configuration
  const config = ref({
    maxStreakDays: 365,
    bonusMultiplier: 0.1, // +10% XP par jour de streak
    notificationsEnabled: true,
    autoCheck: true
  })

  // Cache des dernières activités
  const lastActivityDates = ref<Map<string, Date>>(new Map())

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * Streaks actifs
   */
  const activeStreaks = computed(() =>
    streaks.value.filter(streak => streak.status === 'active')
  )

  /**
   * Streaks cassés récemment
   */
  const brokenStreaks = computed(() =>
    streaks.value.filter(streak => streak.status === 'broken')
  )

  /**
   * Streaks terminés (objectif atteint)
   */
  const completedStreaks = computed(() =>
    streaks.value.filter(streak => streak.status === 'completed')
  )

  /**
   * Meilleur streak de chaque type
   */
  const bestStreaks = computed(() => {
    const best = new Map<string, Streak>()

    streaks.value.forEach(streak => {
      const current = best.get(streak.type)
      if (!current || streak.best_count > current.best_count) {
        best.set(streak.type, streak)
      }
    })

    return Array.from(best.values())
  })

  /**
   * Streak actuel le plus long
   */
  const longestActiveStreak = computed(() => {
    if (activeStreaks.value.length === 0) return null

    return activeStreaks.value.reduce((longest, current) =>
      current.current_count > longest.current_count ? current : longest
    )
  })

  /**
   * Total des jours de streaks actifs
   */
  const totalActiveDays = computed(() =>
    activeStreaks.value.reduce((sum, streak) => sum + streak.current_count, 0)
  )

  /**
   * Bonus XP total des streaks
   */
  const totalXPBonus = computed(() =>
    activeStreaks.value.reduce((sum, streak) => sum + streak.xp_bonus, 0)
  )

  /**
   * Streaks nécessitant attention (expire bientôt)
   */
  const streaksNeedingAttention = computed(() => {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    return activeStreaks.value.filter(streak => {
      const expiresAt = new Date(streak.expires_at)
      return expiresAt <= tomorrow
    })
  })

  /**
   * Statistiques des streaks
   */
  const streakStats = computed(() => {
    const total = streaks.value.length
    const active = activeStreaks.value.length
    const broken = brokenStreaks.value.length
    const completed = completedStreaks.value.length

    const longestEver = streaks.value.reduce((max, streak) =>
      Math.max(max, streak.best_count), 0
    )

    const totalXPEarned = streaks.value.reduce((sum, streak) =>
      sum + (streak.best_count * streak.xp_bonus), 0
    )

    return {
      total,
      active,
      broken,
      completed,
      longestEver,
      totalXPEarned,
      averageLength: total > 0 ? Math.round(
        streaks.value.reduce((sum, s) => sum + s.best_count, 0) / total
      ) : 0
    }
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Charger tous les streaks de l'utilisateur
   */
  async function fetchStreaks(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await streakService.getUserStreaks()

      if (response.success) {
        streaks.value = response.data

        // Filtrer les streaks actifs
        currentStreaks.value = activeStreaks.value

        // Mettre à jour le cache des dernières activités
        updateLastActivityCache()
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des streaks')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des streaks'
      console.error('Erreur fetchStreaks:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Enregistrer une activité pour un streak
   */
  async function recordActivity(
    streakType: string,
    actionType: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    updating.value = true
    error.value = null

    try {
      // Trouver le streak correspondant
      let streak = activeStreaks.value.find(s => s.type === streakType)

      // Si aucun streak actif, en créer un nouveau
      if (!streak) {
        streak = await createStreak(streakType)
        if (!streak) return false
      }

      const response = await streakService.updateStreakActivity(streak.id, actionType, metadata)

      if (response.success) {
        // Mettre à jour le streak local
        const index = streaks.value.findIndex(s => s.id === streak!.id)
        if (index !== -1) {
          const updatedStreak = response.data
          streaks.value[index] = updatedStreak

          // Vérifier si le streak a progressé
          if (updatedStreak.current_count > streak.current_count) {
            await handleStreakProgress(updatedStreak, streak.current_count)
          }
        }

        // Mettre à jour le cache
        lastActivityDates.value.set(streak.id, new Date())

        return true
      } else {
        throw new Error(response.message || 'Erreur lors de l\'enregistrement de l\'activité')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'enregistrement de l\'activité'
      console.error('Erreur recordActivity:', err)
      return false
    } finally {
      updating.value = false
    }
  }

  /**
   * Créer un nouveau streak
   */
  async function createStreak(type: string): Promise<Streak | null> {
    try {
      const streakConfig = getStreakConfig(type)
      if (!streakConfig) return null

      // Pour l'instant, créer localement (à adapter avec l'API)
      const newStreak: Streak = {
        id: `streak_${Date.now()}`,
        user_id: 0, // À récupérer depuis authStore
        type: type as any,
        name: streakConfig.name,
        description: streakConfig.description,
        current_count: 0,
        best_count: 0,
        multiplier: streakConfig.multiplier,
        xp_bonus: streakConfig.xpBonus,
        last_activity_date: new Date().toISOString(),
        expires_at: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // 25h
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      streaks.value.push(newStreak)
      return newStreak
    } catch (err: any) {
      console.error('Erreur createStreak:', err)
      return null
    }
  }

  /**
   * Configuration des différents types de streaks
   */
  function getStreakConfig(type: string): {
    name: string
    description: string
    multiplier: number
    xpBonus: number
  } | null {
    const configs = {
      'daily_transaction': {
        name: 'Suivi Quotidien',
        description: 'Enregistre au moins une transaction chaque jour',
        multiplier: 1.1,
        xpBonus: 5
      },
      'weekly_savings': {
        name: 'Épargne Hebdomadaire',
        description: 'Épargne de l\'argent chaque semaine',
        multiplier: 1.2,
        xpBonus: 10
      },
      'goal_progress': {
        name: 'Progression Objectifs',
        description: 'Progresse vers tes objectifs régulièrement',
        multiplier: 1.15,
        xpBonus: 8
      },
      'challenge_participation': {
        name: 'Défis Actifs',
        description: 'Participe aux défis communautaires',
        multiplier: 1.25,
        xpBonus: 12
      }
    }

    return configs[type as keyof typeof configs] || null
  }

  /**
   * Gérer la progression d'un streak
   */
  async function handleStreakProgress(updatedStreak: Streak, previousCount: number): Promise<void> {
    const { awardXP } = useXP()
    const notificationStore = useNotificationStore()

    // Calculer l'XP bonus
    const streakBonus = Math.floor(updatedStreak.current_count * config.value.bonusMultiplier)
    const totalXP = updatedStreak.xp_bonus + streakBonus

    // Donner l'XP
    await awardXP(totalXP, 'streak_maintained', `Streak ${updatedStreak.name} - Jour ${updatedStreak.current_count}`)

    // Notifications pour milestones importants
    if (config.value.notificationsEnabled) {
      const milestones = [3, 7, 14, 30, 50, 100]

      if (milestones.includes(updatedStreak.current_count)) {
        await notificationStore.createNotification({
          type: 'achievement',
          title: '🔥 Streak Milestone !',
          message: `${updatedStreak.current_count} jours de suite pour "${updatedStreak.name}" !`,
          priority: 'high'
        })
      }
    }

    // Vérifier si c'est un nouveau record personnel
    if (updatedStreak.current_count > updatedStreak.best_count) {
      updatedStreak.best_count = updatedStreak.current_count

      if (config.value.notificationsEnabled) {
        await notificationStore.createNotification({
          type: 'achievement',
          title: '🏆 Nouveau Record !',
          message: `Nouveau record personnel : ${updatedStreak.current_count} jours pour "${updatedStreak.name}" !`,
          priority: 'high'
        })
      }
    }
  }

  /**
   * Vérifier tous les streaks (à appeler périodiquement)
   */
  async function checkAllStreaks(): Promise<void> {
    if (!config.value.autoCheck) return

    checking.value = true

    try {
      const response = await streakService.checkAllStreaks()

      if (response.success) {
        const updatedStreaks = response.data

        // Mettre à jour les streaks locaux
        updatedStreaks.forEach(updatedStreak => {
          const index = streaks.value.findIndex(s => s.id === updatedStreak.id)
          if (index !== -1) {
            const oldStreak = streaks.value[index]
            streaks.value[index] = updatedStreak

            // Vérifier si cassé
            if (oldStreak.status === 'active' && updatedStreak.status === 'broken') {
              handleStreakBroken(updatedStreak)
            }
          }
        })
      }
    } catch (err: any) {
      console.error('Erreur checkAllStreaks:', err)
    } finally {
      checking.value = false
    }
  }

  /**
   * Gérer un streak cassé
   */
  async function handleStreakBroken(streak: Streak): Promise<void> {
    if (!config.value.notificationsEnabled) return

    const notificationStore = useNotificationStore()

    await notificationStore.createNotification({
      type: 'reminder',
      title: '💔 Streak cassé',
      message: `Ton streak "${streak.name}" de ${streak.current_count} jours est cassé. Tu peux le redémarrer !`,
      priority: 'normal',
      action: {
        type: 'view_profile',
        label: 'Redémarrer',
        url: '/gaming/streaks'
      }
    })
  }

  /**
   * Redémarrer un streak cassé
   */
  async function restartStreak(streakId: string): Promise<boolean> {
    updating.value = true

    try {
      const response = await streakService.resetStreak(streakId)

      if (response.success) {
        // Mettre à jour le streak local
        const index = streaks.value.findIndex(s => s.id === streakId)
        if (index !== -1) {
          streaks.value[index] = response.data
        }

        const notificationStore = useNotificationStore()
        await notificationStore.createNotification({
          type: 'achievement',
          title: '🔥 Streak redémarré !',
          message: `Ton streak "${response.data.name}" repart à zéro. Allez-y !`,
          priority: 'normal'
        })

        return true
      } else {
        throw new Error(response.message || 'Erreur lors du redémarrage du streak')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du redémarrage du streak'
      console.error('Erreur restartStreak:', err)
      return false
    } finally {
      updating.value = false
    }
  }

  /**
   * Charger l'historique d'activité d'un streak
   */
  async function fetchStreakActivity(streakId: string, limit: number = 30): Promise<void> {
    try {
      const response = await streakService.getStreakActivity(streakId, limit)

      if (response.success) {
        activities.value.set(streakId, response.data)
      }
    } catch (err: any) {
      console.error('Erreur fetchStreakActivity:', err)
    }
  }

  /**
   * Calculer l'XP bonus d'un streak
   */
  function calculateStreakBonus(streak: Streak): number {
    const baseBonus = streak.xp_bonus
    const streakMultiplier = 1 + (streak.current_count * config.value.bonusMultiplier)
    return Math.round(baseBonus * streakMultiplier)
  }

  /**
   * Vérifier si une activité peut continuer un streak
   */
  function canContinueStreak(streakId: string): boolean {
    const streak = streaks.value.find(s => s.id === streakId)
    if (!streak || streak.status !== 'active') return false

    const now = new Date()
    const expiresAt = new Date(streak.expires_at)
    return now <= expiresAt
  }

  /**
   * Obtenir le prochain délai d'expiration pour un streak
   */
  function getTimeUntilExpiry(streakId: string): {
    hours: number
    minutes: number
    expired: boolean
  } {
    const streak = streaks.value.find(s => s.id === streakId)
    if (!streak) return { hours: 0, minutes: 0, expired: true }

    const now = new Date()
    const expiresAt = new Date(streak.expires_at)
    const diff = expiresAt.getTime() - now.getTime()

    if (diff <= 0) {
      return { hours: 0, minutes: 0, expired: true }
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return { hours, minutes, expired: false }
  }

  /**
   * Mettre à jour le cache des dernières activités
   */
  function updateLastActivityCache(): void {
    streaks.value.forEach(streak => {
      lastActivityDates.value.set(streak.id, new Date(streak.last_activity_date))
    })
  }

  /**
   * Actions spécialisées pour différents types de streaks
   */
  async function recordTransactionActivity(): Promise<void> {
    await recordActivity('daily_transaction', 'transaction_added')
  }

  async function recordSavingsActivity(amount: number): Promise<void> {
    await recordActivity('weekly_savings', 'savings_added', { amount })
  }

  async function recordGoalProgressActivity(goalId: number, progress: number): Promise<void> {
    await recordActivity('goal_progress', 'goal_updated', { goal_id: goalId, progress })
  }

  async function recordChallengeActivity(challengeId: string): Promise<void> {
    await recordActivity('challenge_participation', 'challenge_joined', { challenge_id: challengeId })
  }

  /**
   * Obtenir les recommandations de streaks
   */
  function getStreakRecommendations(): string[] {
    const userStreakTypes = new Set(streaks.value.map(s => s.type))
    const allTypes = ['daily_transaction', 'weekly_savings', 'goal_progress', 'challenge_participation']

    return allTypes.filter(type => !userStreakTypes.has(type))
  }

  /**
   * Simuler l'impact d'un streak sur l'XP
   */
  function simulateStreakImpact(streakType: string, days: number): {
    totalXP: number
    dailyBonus: number
    weeklyBonus: number
  } {
    const config = getStreakConfig(streakType)
    if (!config) return { totalXP: 0, dailyBonus: 0, weeklyBonus: 0 }

    let totalXP = 0
    let dailyBonus = config.xpBonus

    for (let day = 1; day <= days; day++) {
      const dayBonus = Math.round(dailyBonus * (1 + (day * 0.1)))
      totalXP += dayBonus

      if (day % 7 === 0) {
        dailyBonus = Math.round(dailyBonus * 1.1) // +10% chaque semaine
      }
    }

    const weeklyBonus = Math.round(totalXP / Math.ceil(days / 7))

    return { totalXP, dailyBonus, weeklyBonus }
  }

  /**
   * Obtenir les streaks par ordre de priorité
   */
  function getStreaksByPriority(): Streak[] {
    return activeStreaks.value.sort((a, b) => {
      // Prioriser par temps restant (moins de temps = plus prioritaire)
      const timeA = new Date(a.expires_at).getTime() - Date.now()
      const timeB = new Date(b.expires_at).getTime() - Date.now()

      return timeA - timeB
    })
  }

  /**
   * Configuration des types de streaks
   */
  function getStreakConfig(type: string) {
    return streaks.value.find(s => s.type === type) || null
  }

  /**
   * Planifier les rappels de streaks
   */
  async function scheduleStreakReminders(): Promise<void> {
    const notificationStore = useNotificationStore()

    for (const streak of streaksNeedingAttention.value) {
      const timeUntilExpiry = getTimeUntilExpiry(streak.id)

      if (timeUntilExpiry.hours <= 6 && !timeUntilExpiry.expired) {
        await notificationStore.scheduleReminder(
          'Streak en danger !',
          `Ton streak "${streak.name}" expire dans ${timeUntilExpiry.hours}h${timeUntilExpiry.minutes}min`,
          new Date(Date.now() + (timeUntilExpiry.hours - 1) * 60 * 60 * 1000),
          '/gaming/streaks'
        )
      }
    }
  }

  /**
   * Analyse des patterns de streaks
   */
  function analyzeStreakPatterns(): {
    bestDayOfWeek: string
    bestTimeOfDay: string
    averageStreakLength: number
    successRate: number
  } {
    const allActivities = Array.from(activities.value.values()).flat()

    // Analyse jour de la semaine
    const dayCount = new Map<number, number>()
    allActivities.forEach(activity => {
      const day = new Date(activity.activity_date).getDay()
      dayCount.set(day, (dayCount.get(day) || 0) + 1)
    })

    const bestDay = Array.from(dayCount.entries()).reduce((a, b) => a[1] > b[1] ? a : b)?.[0] || 0
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

    // Analyse heure
    const hourCount = new Map<number, number>()
    allActivities.forEach(activity => {
      const hour = new Date(activity.activity_date).getHours()
      hourCount.set(hour, (hourCount.get(hour) || 0) + 1)
    })

    const bestHour = Array.from(hourCount.entries()).reduce((a, b) => a[1] > b[1] ? a : b)?.[0] || 9

    return {
      bestDayOfWeek: dayNames[bestDay],
      bestTimeOfDay: `${bestHour}h`,
      averageStreakLength: streakStats.value.averageLength,
      successRate: Math.round((completedStreaks.value.length / streaks.value.length) * 100) || 0
    }
  }

  /**
   * Nettoyer les erreurs
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * Réinitialiser le store
   */
  function $reset(): void {
    streaks.value = []
    activities.value.clear()
    currentStreaks.value = []
    lastActivityDates.value.clear()
    loading.value = false
    updating.value = false
    checking.value = false
    error.value = null
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    streaks,
    activities,
    currentStreaks,
    loading,
    updating,
    checking,
    error,
    config,

    // Getters
    activeStreaks,
    brokenStreaks,
    completedStreaks,
    bestStreaks,
    longestActiveStreak,
    totalActiveDays,
    totalXPBonus,
    streaksNeedingAttention,
    streakStats,

    // Actions
    fetchStreaks,
    recordActivity,
    restartStreak,
    fetchStreakActivity,
    checkAllStreaks,

    // Actions spécialisées
    recordTransactionActivity,
    recordSavingsActivity,
    recordGoalProgressActivity,
    recordChallengeActivity,

    // Utilitaires
    calculateStreakBonus,
    canContinueStreak,
    getTimeUntilExpiry,
    getStreakRecommendations,
    simulateStreakImpact,
    getStreaksByPriority,
    scheduleStreakReminders,
    analyzeStreakPatterns,
    clearError,
    $reset
  }
})
