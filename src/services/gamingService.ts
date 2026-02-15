// src/services/gamingService.ts - VERSION CORRIGÉE
// ✅ Utilise le singleton api (même client que tous les stores)
// ✅ Routes sans /api/ (baseURL le contient déjà)
// ✅ Cache simplifié (Map in-memory au lieu de useCache composable)
import api from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Achievement, Challenge, Streak, GamingStats } from '@/stores/gamingStore'

// ==========================================
// TYPES
// ==========================================

export interface LeaderboardEntry {
  user_id: number
  user_name: string
  avatar?: string
  level: number
  total_xp: number
  weekly_xp: number
  position: number
  change: number
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

// ==========================================
// CACHE SIMPLE IN-MEMORY
// ==========================================

interface CacheEntry<T = any> {
  data: T
  expires: number
  tags: string[]
}

const cache = new Map<string, CacheEntry>()

function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function cacheSet<T>(key: string, data: T, ttlMs: number, tags: string[] = []): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttlMs,
    tags,
  })
}

function cacheInvalidateByTag(tag: string): void {
  for (const [key, entry] of cache.entries()) {
    if (entry.tags.includes(tag)) {
      cache.delete(key)
    }
  }
}

// ==========================================
// SERVICE
// ==========================================

class GamingService {
  /**
   * Helper: GET avec cache
   */
  private async cachedGet<T>(
    key: string,
    url: string,
    ttlMs: number,
    tags: string[],
  ): Promise<ApiResponse<T>> {
    const cached = cacheGet<ApiResponse<T>>(key)
    if (cached) return cached

    const response = await api.get<T>(url)
    if (response.success) {
      cacheSet(key, response, ttlMs, tags)
    }
    return response
  }

  /**
   * Dashboard gaming complet
   */
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      return await this.cachedGet<DashboardData>(
        'gaming_dashboard',
        '/gaming/dashboard',
        2 * 60 * 1000,
        ['gaming', 'dashboard'],
      )
    } catch (error: any) {
      console.error('Get gaming dashboard error:', error)
      throw error
    }
  }

  /**
   * Stats du joueur
   */
  async getPlayerStats(): Promise<ApiResponse<GamingStats>> {
    try {
      return await this.cachedGet<GamingStats>('player_stats', '/gaming/stats', 60 * 1000, [
        'gaming',
        'stats',
      ])
    } catch (error: any) {
      console.error('Get player stats error:', error)
      throw error
    }
  }

  /**
   * Ajouter de l'XP
   */
  async addXP(
    amount: number,
    action: string,
    metadata?: Record<string, any>,
  ): Promise<
    ApiResponse<{
      new_total: number
      level_up: boolean
      new_level?: number
      achievements_unlocked?: Achievement[]
    }>
  > {
    try {
      const response = await api.post('/gaming/level/xp', { amount, action, metadata })
      if (response.success) {
        cacheInvalidateByTag('gaming')
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
      const response = await api.post<Achievement>(`/gaming/achievements/${achievementId}/unlock`)
      if (response.success) {
        cacheInvalidateByTag('gaming')
        console.log('Achievement débloqué:', response.data?.name)
      }
      return response
    } catch (error: any) {
      console.error('Unlock achievement error:', error)
      throw error
    }
  }

  /**
   * Tous les succès disponibles
   */
  async getAchievements(
    filter: 'all' | 'unlocked' | 'locked' = 'all',
  ): Promise<ApiResponse<Achievement[]>> {
    try {
      return await this.cachedGet<Achievement[]>(
        `achievements_${filter}`,
        `/gaming/achievements?filter=${filter}`,
        10 * 60 * 1000,
        ['gaming', 'achievements'],
      )
    } catch (error: any) {
      console.error('Get achievements error:', error)
      throw error
    }
  }

  /**
   * Défis actifs
   */
  async getChallenges(): Promise<ApiResponse<Challenge[]>> {
    try {
      return await this.cachedGet<Challenge[]>(
        'active_challenges',
        '/gaming/challenges',
        5 * 60 * 1000,
        ['gaming', 'challenges'],
      )
    } catch (error: any) {
      console.error('Get challenges error:', error)
      throw error
    }
  }

  /**
   * Mettre à jour progression d'un défi
   */
  async updateChallengeProgress(
    challengeId: number,
    progress: number,
  ): Promise<ApiResponse<Challenge>> {
    try {
      const response = await api.post<Challenge>(`/gaming/challenges/${challengeId}/progress`, {
        progress,
      })
      if (response.success) {
        cacheInvalidateByTag('challenges')
      }
      return response
    } catch (error: any) {
      console.error('Update challenge progress error:', error)
      throw error
    }
  }

  /**
   * Streaks actives
   */
  async getStreaks(): Promise<ApiResponse<Streak[]>> {
    try {
      return await this.cachedGet<Streak[]>('active_streaks', '/gaming/streaks', 3 * 60 * 1000, [
        'gaming',
        'streaks',
      ])
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
      const response = await api.post<Streak>(`/gaming/streaks/${type}/update`)
      if (response.success) {
        cacheInvalidateByTag('streaks')
      }
      return response
    } catch (error: any) {
      console.error('Update streak error:', error)
      throw error
    }
  }

  /**
   * Leaderboard
   */
  async getLeaderboard(
    period: 'weekly' | 'monthly' | 'all_time' = 'weekly',
  ): Promise<ApiResponse<LeaderboardEntry[]>> {
    try {
      return await this.cachedGet<LeaderboardEntry[]>(
        `leaderboard_${period}`,
        `/gaming/leaderboard?period=${period}`,
        10 * 60 * 1000,
        ['gaming', 'leaderboard'],
      )
    } catch (error: any) {
      console.error('Get leaderboard error:', error)
      throw error
    }
  }

  /**
   * Historique XP
   */
  async getXPHistory(days: number = 30): Promise<ApiResponse<XPTransaction[]>> {
    try {
      return await this.cachedGet<XPTransaction[]>(
        `xp_history_${days}`,
        `/gaming/xp-history?days=${days}`,
        5 * 60 * 1000,
        ['gaming', 'xp_history'],
      )
    } catch (error: any) {
      console.error('Get XP history error:', error)
      throw error
    }
  }

  /**
   * Vérifier les succès disponibles
   */
  async checkAvailableAchievements(): Promise<
    ApiResponse<{
      unlocked: Achievement[]
      progress_updated: Array<{
        achievement: Achievement
        old_progress: number
        new_progress: number
      }>
    }>
  > {
    try {
      const response = await api.post('/gaming/achievements/check')
      if (response.success) {
        cacheInvalidateByTag('achievements')
      }
      return response
    } catch (error: any) {
      console.error('Check achievements error:', error)
      throw error
    }
  }

  /**
   * Rapport gaming personnalisé
   */
  async generateGamingReport(period: 'week' | 'month' | 'year'): Promise<ApiResponse<any>> {
    try {
      return await api.get(`/gaming/report?period=${period}`)
    } catch (error: any) {
      console.error('Generate gaming report error:', error)
      throw error
    }
  }

  /**
   * Préférences gaming
   */
  async updateGamingPreferences(preferences: {
    notifications_enabled?: boolean
    sounds_enabled?: boolean
    public_profile?: boolean
    leaderboard_visible?: boolean
    difficulty_level?: 'casual' | 'normal' | 'hardcore'
  }): Promise<ApiResponse> {
    try {
      const response = await api.put('/gaming/preferences', preferences)
      if (response.success) {
        cacheInvalidateByTag('gaming')
      }
      return response
    } catch (error: any) {
      console.error('Update preferences error:', error)
      throw error
    }
  }

  /**
   * Reset gaming (dev only)
   */
  async resetGamingProgress(): Promise<ApiResponse> {
    if (import.meta.env.PROD) {
      throw new Error('Reset non disponible en production')
    }
    try {
      const response = await api.post('/gaming/reset')
      if (response.success) {
        cacheInvalidateByTag('gaming')
      }
      return response
    } catch (error: any) {
      console.error('Reset gaming error:', error)
      throw error
    }
  }
}

export const gamingService = new GamingService()
