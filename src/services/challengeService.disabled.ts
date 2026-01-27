// ==========================================
// CHALLENGE SERVICE - STUB TEMPORAIRE
// ==========================================

import api from './api'
import type { ApiResponse } from '@/types/base'

export interface Challenge {
  id: number
  name: string
  description: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  xp_reward: number
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'upcoming'
  participants_count: number
  tags?: string[]
}

export interface UserChallenge {
  id: number
  user_id: number
  challenge_id: number
  progress: number
  status: 'active' | 'completed' | 'failed'
  current_rank?: number
  final_rank?: number
  completed_at?: string
  updated_at: string
}

export const challengeService = {
  /**
   * Récupérer tous les défis
   */
  async getChallenges(filters?: any): Promise<ApiResponse<Challenge[]>> {
    try {
      const response = await api.get('/gaming/challenges', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Erreur getChallenges:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors du chargement des défis'
      }
    }
  },

  /**
   * Récupérer les défis de l'utilisateur
   */
  async getUserChallenges(): Promise<ApiResponse<UserChallenge[]>> {
    try {
      const response = await api.get('/gaming/user-challenges')
      return response.data
    } catch (error: any) {
      console.error('Erreur getUserChallenges:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors du chargement des défis utilisateur'
      }
    }
  },

  /**
   * Rejoindre un défi
   */
  async joinChallenge(challengeId: number): Promise<ApiResponse<UserChallenge>> {
    try {
      const response = await api.post(`/gaming/challenges/${challengeId}/join`)
      return response.data
    } catch (error: any) {
      console.error('Erreur joinChallenge:', error)
      return {
        success: false,
        data: {} as UserChallenge,
        message: 'Erreur lors de l\'inscription au défi'
      }
    }
  },

  /**
   * Quitter un défi
   */
  async leaveChallenge(challengeId: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.post(`/gaming/challenges/${challengeId}/leave`)
      return response.data
    } catch (error: any) {
      console.error('Erreur leaveChallenge:', error)
      return {
        success: false,
        data: undefined,
        message: 'Erreur lors de l\'abandon du défi'
      }
    }
  },

  /**
   * Mettre à jour la progression
   */
  async updateProgress(challengeId: number, progress: number): Promise<ApiResponse<UserChallenge>> {
    try {
      const response = await api.put(`/gaming/challenges/${challengeId}/progress`, { progress })
      return response.data
    } catch (error: any) {
      console.error('Erreur updateProgress:', error)
      return {
        success: false,
        data: {} as UserChallenge,
        message: 'Erreur lors de la mise à jour de la progression'
      }
    }
  },

  /**
   * Récupérer le leaderboard
   */
  async getLeaderboard(challengeId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get(`/gaming/challenges/${challengeId}/leaderboard`)
      return response.data
    } catch (error: any) {
      console.error('Erreur getLeaderboard:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors du chargement du classement'
      }
    }
  },

  /**
   * Synchroniser la progression
   */
  async syncProgress(): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.post('/gaming/challenges/sync-progress')
      return response.data
    } catch (error: any) {
      console.error('Erreur syncProgress:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors de la synchronisation'
      }
    }
  }
}
