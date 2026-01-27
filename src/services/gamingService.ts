import { useApi } from '@/composables/core/useApi'
import { useCache } from '@/composables/core/useCache'
import type { ApiResponse } from '@/stores/authStore'
import type {
  Achievement,
  Challenge,
  Streak,
  GamingStats
} from '@/stores/gamingStore'

export interface LeaderboardEntry {
  user_id: number
  user_name: string
  avatar?: string
  level: number
  total_xp: number
  weekly_xp: number
  position: number
  change: number // +/- depuis la semaine dernière
}

export interface XPTransaction {
  id: number
  amount: number
  action: string
  source: string
  created_at: string
}

export interface DashboardData {
  stats: GamingStats
  recent_achievements: Achievement[]
  next_achievements: Achievement[]
  active_challenges: Challenge[]
  active_streaks: Streak[]
  leaderboard_position: number
  recent_xp: XPTransaction[]
}

/**
 * Service gaming pour toutes les fonctionnalités de gamification
 */
class GamingService {
  private api = useApi()
  private cache = useCache()

  /**
   * Récupérer le dashboard gaming complet
   */
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      return await this.cache.remember(
        'gaming_dashboard',
        () => this.api.get<DashboardData>('/api/gaming/dashboard'),
        2 * 60 * 1000, // Cache 2 minutes
        ['gaming', 'dashboard']
      )
    } catch (error: any) {
      console.error('Get gaming dashboard error:', error)
      throw error
    }
  }

  /**
   * Récupérer les stats du joueur
   */
  async getPlayerStats(): Promise<ApiResponse<GamingStats>> {
    try {
      return await this.cache.remember(
        'player_stats',
        () => this.api.get<GamingStats>('/api/gaming/stats'),
        1 * 60 * 1000, // Cache 1 minute
        ['gaming', 'stats']
      )
    } catch (error: any) {
      console.error('Get player stats error:', error)
      throw error
    }
  }

  /**
   * Ajouter de l'XP
   */
  async addXP(amount: number, action: string, metadata?: Record<string, any>): Promise<ApiResponse<{
    new_total: number
    level_up: boolean
    new_level?: number
    achievements_unlocked?: Achievement[]
  }>> {
    try {
      const response = await this.api.post('/api/gaming/level/xp', {
        amount,
        action,
        metadata
      })

      if (response.success) {
        // Invalider cache gaming
        this.cache.invalidateByTag('gaming')
        console.log(`XP ajouté: +${amount} pour ${action}`)
      }

      return response
    } catch (error: any) {
      console.error('Add XP error:', error)
      throw error
    }
  }

  /**
   * Débloquer un succès manuellement
   */
  async unlockAchievement(achievementId: number): Promise<ApiResponse<Achievement>> {
    try {
      const response = await this.api.post<Achievement>(`/api/gaming/achievements/${achievementId}/unlock`)

      if (response.success) {
        this.cache.invalidateByTag('gaming')
        console.log('Achievement débloqué:', response.data?.name)
      }

      return response
    } catch (error: any) {
      console.error('Unlock achievement error:', error)
      throw error
    }
  }

  /**
   * Récupérer tous les succès disponibles
   */
  async getAchievements(filter: 'all' | 'unlocked' | 'locked' = 'all'): Promise<ApiResponse<Achievement[]>> {
    try {
      const cacheKey = `achievements_${filter}`

      return await this.cache.remember(
        cacheKey,
        () => this.api.get<Achievement[]>(`/api/gaming/achievements?filter=${filter}`),
        10 * 60 * 1000, // Cache 10 minutes
        ['gaming', 'achievements']
      )
    } catch (error: any) {
      console.error('Get achievements error:', error)
      throw error
    }
  }

  /**
   * Récupérer les défis actifs
   */
  async getChallenges(): Promise<ApiResponse<Challenge[]>> {
    try {
      return await this.cache.remember(
        'active_challenges',
        () => this.api.get<Challenge[]>('/api/gaming/challenges'),
        5 * 60 * 1000, // Cache 5 minutes
        ['gaming', 'challenges']
      )
    } catch (error: any) {
      console.error('Get challenges error:', error)
      throw error
    }
  }

  /**
   * Mettre à jour la progression d'un défi
   */
  async updateChallengeProgress(challengeId: number, progress: number): Promise<ApiResponse<Challenge>> {
    try {
      const response = await this.api.post<Challenge>(`/api/gaming/challenges/${challengeId}/progress`, {
        progress
      })

      if (response.success) {
        this.cache.invalidateByTag('challenges')
        console.log(`Défi ${challengeId} progression: ${progress}`)
      }

      return response
    } catch (error: any) {
      console.error('Update challenge progress error:', error)
      throw error
    }
  }

  /**
   * Récupérer les streaks actives
   */
  async getStreaks(): Promise<ApiResponse<Streak[]>> {
    try {
      return await this.cache.remember(
        'active_streaks',
        () => this.api.get<Streak[]>('/api/gaming/streaks'),
        3 * 60 * 1000, // Cache 3 minutes
        ['gaming', 'streaks']
      )
    } catch (error: any) {
      console.error('Get streaks error:', error)
      throw error
    }
  }

  /**
   * Mettre à jour un streak
   */
  async updateStreak(type: string): Promise<ApiResponse<Streak>> {
    try {
      const response = await this.api.post<Streak>(`/api/gaming/streaks/${type}/update`)

      if (response.success) {
        this.cache.invalidateByTag('streaks')
        console.log(`Streak ${type} mis à jour`)
      }

      return response
    } catch (error: any) {
      console.error('Update streak error:', error)
      throw error
    }
  }

  /**
   * Récupérer le leaderboard
   */
  async getLeaderboard(period: 'weekly' | 'monthly' | 'all_time' = 'weekly'): Promise<ApiResponse<LeaderboardEntry[]>> {
    try {
      const cacheKey = `leaderboard_${period}`

      return await this.cache.remember(
        cacheKey,
        () => this.api.get<LeaderboardEntry[]>(`/api/gaming/leaderboard?period=${period}`),
        10 * 60 * 1000, // Cache 10 minutes
        ['gaming', 'leaderboard']
      )
    } catch (error: any) {
      console.error('Get leaderboard error:', error)
      throw error
    }
  }

  /**
   * Récupérer l'historique XP
   */
  async getXPHistory(days: number = 30): Promise<ApiResponse<XPTransaction[]>> {
    try {
      const cacheKey = `xp_history_${days}`

      return await this.cache.remember(
        cacheKey,
        () => this.api.get<XPTransaction[]>(`/api/gaming/xp-history?days=${days}`),
        5 * 60 * 1000, // Cache 5 minutes
        ['gaming', 'xp_history']
      )
    } catch (error: any) {
      console.error('Get XP history error:', error)
      throw error
    }
  }

  /**
   * Vérifier les succès disponibles
   */
  async checkAvailableAchievements(): Promise<ApiResponse<{
    unlocked: Achievement[]
    progress_updated: Array<{
      achievement: Achievement
      old_progress: number
      new_progress: number
    }>
  }>> {
    try {
      const response = await this.api.post('/api/gaming/achievements/check')

      if (response.success) {
        this.cache.invalidateByTag('achievements')
      }

      return response
    } catch (error: any) {
      console.error('Check achievements error:', error)
      throw error
    }
  }

  /**
   * Générer un rapport gaming personnalisé
   */
  async generateGamingReport(period: 'week' | 'month' | 'year'): Promise<ApiResponse<{
    period: string
    xp_gained: number
    achievements_unlocked: Achievement[]
    challenges_completed: Challenge[]
    streaks_maintained: Streak[]
    level_progression: {
      start_level: number
      end_level: number
      levels_gained: number
    }
    recommendations: string[]
  }>> {
    try {
      return await this.api.get(`/api/gaming/report?period=${period}`)
    } catch (error: any) {
      console.error('Generate gaming report error:', error)
      throw error
    }
  }

  /**
   * Configuration des préférences gaming
   */
  async updateGamingPreferences(preferences: {
    notifications_enabled?: boolean
    sounds_enabled?: boolean
    public_profile?: boolean
    leaderboard_visible?: boolean
    difficulty_level?: 'casual' | 'normal' | 'hardcore'
  }): Promise<ApiResponse> {
    try {
      const response = await this.api.put('/api/gaming/preferences', preferences)

      if (response.success) {
        this.cache.invalidateByTag('gaming')
      }

      return response
    } catch (error: any) {
      console.error('Update gaming preferences error:', error)
      throw error
    }
  }

  /**
   * Reset complet du gaming (dev only)
   */
  async resetGamingProgress(): Promise<ApiResponse> {
    if (import.meta.env.PROD) {
      throw new Error('Reset gaming non disponible en production')
    }

    try {
      const response = await this.api.post('/api/gaming/reset')

      if (response.success) {
        // Clear cache complet gaming
        this.cache.invalidateByTag('gaming')
        console.log('Gaming progress reset')
      }

      return response
    } catch (error: any) {
      console.error('Reset gaming error:', error)
      throw error
    }
  }
}

// Export singleton
export const gamingService = new GamingService()
