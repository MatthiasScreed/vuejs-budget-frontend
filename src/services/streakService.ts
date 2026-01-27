// ==========================================
// STREAK SERVICE - CONNECTÉ AU BACKEND RÉEL
// ==========================================

import api from './api'
import type { ApiResponse } from '@/types/base'

export interface Streak {
  id: number
  user_id: number
  type: string
  current_count: number
  best_count: number
  status: 'active' | 'broken' | 'completed'
  last_activity_date: string
  created_at: string
  updated_at: string
}

export interface StreakActivity {
  id: number
  streak_id: number
  activity_date: string
  activity_type: string
  created_at: string
}

export const streakService = {
  /**
   * Récupérer tous les streaks
   * ✅ Route réelle : GET /api/gaming/streaks/all
   */
  async getStreaks(): Promise<ApiResponse<Streak[]>> {
    try {
      const response = await api.get('/gaming/streaks/all')
      return response.data
    } catch (error: any) {
      console.error('Erreur getStreaks:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors du chargement des séries'
      }
    }
  },

  /**
   * Récupérer un streak spécifique par type
   * ✅ Route réelle : GET /api/gaming/streaks/{type}
   */
  async getStreak(type: string): Promise<ApiResponse<Streak>> {
    try {
      const response = await api.get(`/gaming/streaks/${type}`)
      return response.data
    } catch (error: any) {
      console.error('Erreur getStreak:', error)
      return {
        success: false,
        data: {} as Streak,
        message: 'Erreur lors du chargement de la série'
      }
    }
  },

  /**
   * Mettre à jour un streak
   * ✅ Route réelle : POST /api/gaming/streaks/update
   */
  async updateStreak(id: number, type: string): Promise<ApiResponse<Streak>> {
    try {
      const response = await api.post('/gaming/streaks/update', { id, type })
      return response.data
    } catch (error: any) {
      console.error('Erreur updateStreak:', error)
      return {
        success: false,
        data: {} as Streak,
        message: 'Erreur lors de la mise à jour de la série'
      }
    }
  },

  /**
   * Déclencher un streak par type
   * ✅ Route réelle : POST /api/gaming/streaks/{type}/trigger
   */
  async triggerStreak(type: string): Promise<ApiResponse<Streak>> {
    try {
      const response = await api.post(`/gaming/streaks/${type}/trigger`)
      return response.data
    } catch (error: any) {
      console.error('Erreur triggerStreak:', error)
      return {
        success: false,
        data: {} as Streak,
        message: 'Erreur lors du déclenchement de la série'
      }
    }
  },

  /**
   * Vérifier les streaks actifs (pas d'endpoint dédié)
   */
  async checkStreaks(): Promise<ApiResponse<any>> {
    // Cette fonctionnalité est gérée automatiquement côté backend
    console.warn('checkStreaks: Géré automatiquement par le backend')
    return {
      success: true,
      data: { message: 'Vérification automatique' }
    }
  },

  /**
   * Récupérer les activités d'un streak (pas d'endpoint dédié)
   */
  async getStreakActivities(streakId: number, limit: number = 30): Promise<ApiResponse<StreakActivity[]>> {
    console.warn('getStreakActivities: Endpoint non disponible')
    return {
      success: false,
      data: [],
      message: 'Endpoint non disponible'
    }
  },

  /**
   * Réparer un streak cassé (pas d'endpoint dédié)
   */
  async repairStreak(id: number): Promise<ApiResponse<Streak>> {
    console.warn('repairStreak: Endpoint non disponible')
    return {
      success: false,
      data: {} as Streak,
      message: 'Fonctionnalité non disponible'
    }
  }
}
