import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'
import { useGamingNotifications } from '../ui/useGamingNotifications'
import type { Challenge, ChallengeProgress, ChallengeParticipant, ApiResponse } from '@/types'

interface ChallengeLeaderboard {
  rank: number
  user_id: number
  user_name: string
  user_level: number
  score: number
  progress_percent: number
  last_activity: string
}

interface ChallengeReward {
  rank_min: number
  rank_max: number
  xp_bonus: number
  achievement_id?: number
  special_badge?: string
}

interface ChallengeStats {
  participants_count: number
  completion_rate: number
  average_score: number
  top_score: number
  user_rank?: number
  time_remaining: number
}

/**
 * Composable pour système de défis communautaires
 * Participation, classements, récompenses, défis saisonniers
 */
export function useChallenges() {
  const { get, post, put } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()
  const { notifyChallengeRank } = useGamingNotifications()

  // State
  const availableChallenges = ref<Challenge[]>([])
  const activeChallenges = ref<Challenge[]>([])
  const userProgress = ref<Record<number, ChallengeProgress>>({})
  const leaderboards = ref<Record<number, ChallengeLeaderboard[]>>({})
  const loading = ref(false)

  /**
   * Initialiser le système de défis
   */
  async function initChallenges(): Promise<void> {
    loading.value = true

    try {
      await Promise.all([
        loadAvailableChallenges(),
        loadActiveChallenges(),
        loadUserProgress()
      ])
    } catch (error: any) {
      await handleApiError(error, 'initChallenges')
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les défis disponibles
   */
  async function loadAvailableChallenges(): Promise<void> {
    availableChallenges.value = await remember(
      'available_challenges',
      async () => {
        const response = await get<Challenge[]>('/gaming/challenges/available')
        return response.data || []
      },
      10 * 60 * 1000, // 10 minutes
      ['gaming', 'challenges']
    )
  }

  /**
   * Charger les défis actifs de l'utilisateur
   */
  async function loadActiveChallenges(): Promise<void> {
    activeChallenges.value = await remember(
      'active_challenges',
      async () => {
        const response = await get<Challenge[]>('/gaming/challenges/active')
        return response.data || []
      },
      5 * 60 * 1000, // 5 minutes
      ['gaming', 'active']
    )
  }

  /**
   * Rejoindre un défi
   */
  async function joinChallenge(challengeId: number): Promise<boolean> {
    try {
      const response = await post<ChallengeProgress>(`/gaming/challenges/${challengeId}/join`)

      if (response.success && response.data) {
        // Ajouter aux défis actifs
        const challenge = availableChallenges.value.find(c => c.id === challengeId)
        if (challenge) {
          activeChallenges.value.push(challenge)
        }

        // Mettre à jour la progression
        userProgress.value[challengeId] = response.data

        invalidateChallengeCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'joinChallenge')
      return false
    }
  }

  /**
   * Quitter un défi
   */
  async function leaveChallenge(challengeId: number): Promise<boolean> {
    try {
      const response = await post(`/gaming/challenges/${challengeId}/leave`)

      if (response.success) {
        // Retirer des défis actifs
        activeChallenges.value = activeChallenges.value.filter(c => c.id !== challengeId)

        // Supprimer la progression
        delete userProgress.value[challengeId]

        invalidateChallengeCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'leaveChallenge')
      return false
    }
  }

  /**
   * Mettre à jour la progression d'un défi
   */
  async function updateChallengeProgress(
    challengeId: number,
    actionData: Record<string, any>
  ): Promise<ChallengeProgress | null> {
    try {
      const response = await post<ChallengeProgress>(`/gaming/challenges/${challengeId}/progress`, actionData)

      if (response.success && response.data) {
        userProgress.value[challengeId] = response.data

        // Vérifier si nouveau rang atteint
        await checkRankUpdate(challengeId)

        return response.data
      }

      return null
    } catch (error: any) {
      await handleApiError(error, 'updateChallengeProgress')
      return null
    }
  }

  /**
   * Charger le classement d'un défi
   */
  async function loadChallengeLeaderboard(challengeId: number): Promise<void> {
    try {
      const leaderboard = await remember(
        `leaderboard_${challengeId}`,
        async () => {
          const response = await get<ChallengeLeaderboard[]>(`/gaming/challenges/${challengeId}/leaderboard`)
          return response.data || []
        },
        2 * 60 * 1000, // 2 minutes
        ['gaming', 'leaderboards']
      )

      leaderboards.value[challengeId] = leaderboard
    } catch (error: any) {
      await handleApiError(error, 'loadChallengeLeaderboard')
    }
  }

  /**
   * Vérifier mise à jour du rang
   */
  async function checkRankUpdate(challengeId: number): Promise<void> {
    await loadChallengeLeaderboard(challengeId)

    const leaderboard = leaderboards.value[challengeId] || []
    const userEntry = leaderboard.find(entry => entry.user_id === getCurrentUserId())

    if (userEntry) {
      const challenge = activeChallenges.value.find(c => c.id === challengeId)

      if (challenge) {
        await notifyChallengeRank(
          challenge.name,
          userEntry.rank,
          leaderboard.length
        )
      }
    }
  }

  /**
   * Obtenir les statistiques d'un défi
   */
  async function getChallengeStats(challengeId: number): Promise<ChallengeStats | null> {
    try {
      const response = await get<ChallengeStats>(`/gaming/challenges/${challengeId}/stats`)
      return response.data || null
    } catch (error: any) {
      await handleApiError(error, 'getChallengeStats')
      return null
    }
  }

  /**
   * Créer un défi personnalisé (niveau élevé)
   */
  async function createCustomChallenge(challengeData: any): Promise<boolean> {
    try {
      const response = await post<Challenge>('/gaming/challenges/create', challengeData)

      if (response.success && response.data) {
        availableChallenges.value.unshift(response.data)
        invalidateChallengeCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'createCustomChallenge')
      return false
    }
  }

  /**
   * Charger la progression utilisateur
   */
  async function loadUserProgress(): Promise<void> {
    const progress = await remember(
      'challenges_user_progress',
      async () => {
        const response = await get<Record<number, ChallengeProgress>>('/gaming/challenges/progress')
        return response.data || {}
      },
      3 * 60 * 1000, // 3 minutes
      ['gaming', 'progress']
    )

    userProgress.value = progress
  }

  /**
   * Charger les unlocks récents
   */
  async function loadRecentUnlocks(): Promise<void> {
    recentUnlocks.value = await remember(
      'recent_challenge_completions',
      async () => {
        const response = await get<AchievementUnlock[]>('/gaming/challenges/completions')
        return response.data || []
      },
      5 * 60 * 1000,
      ['gaming', 'completions']
    )
  }

  /**
   * Charger les catégories d'achievements
   */
  async function loadCategories(): Promise<void> {
    categories.value = await remember(
      'challenge_categories',
      async () => {
        const response = await get<AchievementCategory[]>('/gaming/challenges/categories')
        return response.data || getDefaultCategories()
      },
      20 * 60 * 1000, // 20 minutes
      ['gaming', 'categories']
    )
  }

  /**
   * Obtenir les catégories par défaut
   */
  function getDefaultCategories(): AchievementCategory[] {
    return [
      {
        id: 'financial',
        name: 'Maîtrise Financière',
        icon: '💰',
        achievements: [],
        completion_rate: 0
      },
      {
        id: 'saving',
        name: 'Roi de l\'Épargne',
        icon: '🏦',
        achievements: [],
        completion_rate: 0
      },
      {
        id: 'community',
        name: 'Esprit Communautaire',
        icon: '👥',
        achievements: [],
        completion_rate: 0
      },
      {
        id: 'consistency',
        name: 'Régularité',
        icon: '📅',
        achievements: [],
        completion_rate: 0
      }
    ]
  }

  /**
   * Obtenir l'ID utilisateur actuel
   */
  function getCurrentUserId(): number {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr)?.id || 0 : 0
  }

  /**
   * Invalider les caches challenges
   */
  function invalidateChallengeCaches(): void {
    invalidateByTag('gaming')
    invalidateByTag('challenges')
    invalidateByTag('leaderboards')
  }

  // Computed properties
  const joinedChallenges = computed(() => activeChallenges.value.length)

  const completedChallenges = computed(() =>
    activeChallenges.value.filter(c =>
      userProgress.value[c.id]?.completed
    ).length
  )

  const challengeCompletionRate = computed(() => {
    const joined = joinedChallenges.value
    const completed = completedChallenges.value
    return joined > 0 ? Math.round((completed / joined) * 100) : 0
  })

  const topRankedChallenges = computed(() =>
    activeChallenges.value.filter(challenge => {
      const leaderboard = leaderboards.value[challenge.id] || []
      const userEntry = leaderboard.find(entry => entry.user_id === getCurrentUserId())
      return userEntry && userEntry.rank <= 10
    })
  )

  return {
    // State
    availableChallenges,
    activeChallenges,
    userProgress,
    leaderboards,
    recentUnlocks,
    categories,
    loading,

    // Computed
    joinedChallenges,
    completedChallenges,
    challengeCompletionRate,
    topRankedChallenges,

    // Methods
    initChallenges,
    joinChallenge,
    leaveChallenge,
    updateChallengeProgress,
    loadChallengeLeaderboard,
    getChallengeStats,
    createCustomChallenge,
    checkRankUpdate
  }
}
