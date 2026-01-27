import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'

interface LeaderboardEntry {
  rank: number
  user_id: number
  user_name: string
  user_avatar?: string
  user_level: number
  score: number
  change_24h: number
  is_current_user: boolean
  last_activity: string
}

interface LeaderboardFilters {
  type: 'xp' | 'achievements' | 'challenges' | 'savings' | 'streaks'
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  limit: number
  include_friends?: boolean
}

interface UserRanking {
  global_rank: number
  friends_rank?: number
  percentile: number
  score: number
  category: string
}

interface LeaderboardStats {
  total_participants: number
  average_score: number
  top_score: number
  user_position: number
  improvement_needed: number
}

/**
 * Composable pour classements temps réel et compétition
 * Leaderboards dynamiques, rankings, comparaisons sociales
 */
export function useLeaderboard() {
  const { get, post } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()

  // State
  const leaderboards = ref<Record<string, LeaderboardEntry[]>>({})
  const userRankings = ref<Record<string, UserRanking>>({})
  const friends = ref<LeaderboardEntry[]>([])
  const stats = ref<Record<string, LeaderboardStats>>({})
  const loading = ref(false)

  /**
   * Charger un leaderboard spécifique
   */
  async function loadLeaderboard(filters: LeaderboardFilters): Promise<void> {
    loading.value = true

    try {
      const key = generateLeaderboardKey(filters)

      const entries = await remember(
        key,
        async () => {
          const response = await post<LeaderboardEntry[]>('/gaming/leaderboard', filters)
          return response.data || []
        },
        getLeaderboardCacheTTL(filters.period),
        ['gaming', 'leaderboards']
      )

      leaderboards.value[key] = entries
    } catch (error: any) {
      await handleApiError(error, 'loadLeaderboard')
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger le ranking personnel de l'utilisateur
   */
  async function loadUserRanking(type: string, period: string): Promise<void> {
    try {
      const key = `${type}_${period}`

      const ranking = await remember(
        `user_ranking_${key}`,
        async () => {
          const response = await get<UserRanking>(`/gaming/leaderboard/rank/${type}/${period}`)
          return response.data
        },
        5 * 60 * 1000, // 5 minutes
        ['gaming', 'rankings']
      )

      if (ranking) {
        userRankings.value[key] = ranking
      }
    } catch (error: any) {
      await handleApiError(error, 'loadUserRanking')
    }
  }

  /**
   * Charger le leaderboard des amis
   */
  async function loadFriendsLeaderboard(type: string = 'xp'): Promise<void> {
    try {
      friends.value = await remember(
        `friends_leaderboard_${type}`,
        async () => {
          const response = await get<LeaderboardEntry[]>(`/gaming/leaderboard/friends/${type}`)
          return response.data || []
        },
        5 * 60 * 1000,
        ['gaming', 'friends']
      )
    } catch (error: any) {
      await handleApiError(error, 'loadFriendsLeaderboard')
    }
  }

  /**
   * Obtenir les statistiques d'un leaderboard
   */
  async function getLeaderboardStats(type: string, period: string): Promise<void> {
    try {
      const key = `${type}_${period}`

      const leaderboardStats = await remember(
        `leaderboard_stats_${key}`,
        async () => {
          const response = await get<LeaderboardStats>(`/gaming/leaderboard/stats/${type}/${period}`)
          return response.data
        },
        10 * 60 * 1000, // 10 minutes
        ['gaming', 'stats']
      )

      if (leaderboardStats) {
        stats.value[key] = leaderboardStats
      }
    } catch (error: any) {
      await handleApiError(error, 'getLeaderboardStats')
    }
  }

  /**
   * Générer une clé unique pour le cache
   */
  function generateLeaderboardKey(filters: LeaderboardFilters): string {
    return `leaderboard_${filters.type}_${filters.period}_${filters.limit}_${filters.include_friends || false}`
  }

  /**
   * Obtenir le TTL du cache selon la période
   */
  function getLeaderboardCacheTTL(period: string): number {
    const ttls = {
      daily: 5 * 60 * 1000,    // 5 minutes
      weekly: 15 * 60 * 1000,  // 15 minutes
      monthly: 30 * 60 * 1000, // 30 minutes
      all_time: 60 * 60 * 1000 // 1 heure
    }

    return ttls[period as keyof typeof ttls] || 5 * 60 * 1000
  }

  /**
   * Trouver la position d'un utilisateur
   */
  function findUserPosition(entries: LeaderboardEntry[], userId: number): number {
    const index = entries.findIndex(entry => entry.user_id === userId)
    return index !== -1 ? index + 1 : 0
  }

  /**
   * Calculer l'amélioration nécessaire pour monter de rang
   */
  function calculateImprovementNeeded(entries: LeaderboardEntry[], userRank: number): number {
    if (userRank <= 1) return 0

    const currentEntry = entries[userRank - 1]
    const nextEntry = entries[userRank - 2]

    return nextEntry ? nextEntry.score - currentEntry.score + 1 : 0
  }

  /**
   * Obtenir les leaderboards populaires
   */
  function getPopularLeaderboards(): LeaderboardFilters[] {
    return [
      { type: 'xp', period: 'weekly', limit: 50 },
      { type: 'achievements', period: 'monthly', limit: 30 },
      { type: 'savings', period: 'monthly', limit: 20 },
      { type: 'streaks', period: 'all_time', limit: 100 },
      { type: 'challenges', period: 'weekly', limit: 25 }
    ]
  }

  /**
   * Mettre à jour une streak dans la liste
   */
  function updateStreakInList(updatedStreak: any): void {
    const key = Object.keys(leaderboards.value).find(k => k.includes(updatedStreak.type))

    if (key) {
      // Recharger ce leaderboard
      invalidateByTag('leaderboards')
    }
  }

  /**
   * Comparer avec un autre utilisateur
   */
  async function compareWithUser(userId: number, type: string = 'xp'): Promise<any> {
    try {
      const response = await get(`/gaming/leaderboard/compare/${userId}/${type}`)
      return response.data
    } catch (error: any) {
      await handleApiError(error, 'compareWithUser')
      return null
    }
  }

  /**
   * Obtenir les achievements récents du leaderboard
   */
  async function getRecentTopAchievements(): Promise<any[]> {
    return remember(
      'recent_top_achievements',
      async () => {
        const response = await get('/gaming/leaderboard/recent-achievements')
        return response.data || []
      },
      10 * 60 * 1000,
      ['gaming', 'recent']
    )
  }

  /**
   * Invalider les caches leaderboards
   */
  function invalidateStreakCaches(): void {
    invalidateByTag('gaming')
    invalidateByTag('leaderboards')
    invalidateByTag('rankings')
  }

  // Computed properties
  const globalRankings = computed(() => {
    const rankings: Record<string, number> = {}

    Object.entries(userRankings.value).forEach(([key, ranking]) => {
      rankings[key] = ranking.global_rank
    })

    return rankings
  })

  const bestGlobalRank = computed(() => {
    const ranks = Object.values(globalRankings.value)
    return ranks.length > 0 ? Math.min(...ranks) : 0
  })

  const topPercentile = computed(() => {
    const percentiles = Object.values(userRankings.value).map(r => r.percentile)
    return percentiles.length > 0 ? Math.max(...percentiles) : 0
  })

  const friendsCount = computed(() => friends.value.length)

  const isTopPlayer = computed(() => bestGlobalRank.value <= 10)

  return {
    // State
    leaderboards,
    userRankings,
    friends,
    stats,
    loading,

    // Computed
    globalRankings,
    bestGlobalRank,
    topPercentile,
    friendsCount,
    isTopPlayer,

    // Methods
    loadLeaderboard,
    loadUserRanking,
    loadFriendsLeaderboard,
    getLeaderboardStats,
    compareWithUser,
    getRecentTopAchievements,
    findUserPosition,
    calculateImprovementNeeded,
    getPopularLeaderboards
  }
}
