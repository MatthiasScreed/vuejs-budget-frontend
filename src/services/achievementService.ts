import api from './api'
import type { Achievement, AchievementProgress, ApiResponse } from '@/types/base'

export const achievementService = {

  // ==========================================
  // RÉCUPÉRATION DES ACHIEVEMENTS
  // ==========================================

  /**
   * Récupérer tous les achievements disponibles
   */
  async getAchievements(): Promise<ApiResponse<Achievement[]>> {
    const response = await api.get('/gaming/achievements')
    return response.data
  },

  /**
   * Récupérer les achievements de l'utilisateur connecté
   */
  async getUserAchievements(): Promise<ApiResponse<AchievementProgress[]>> {
    const response = await api.get('/gaming/achievements/user')
    return response.data
  },

  /**
   * Récupérer les achievements débloqués de l'utilisateur
   */
  async getUnlockedAchievements(): Promise<ApiResponse<AchievementProgress[]>> {
    const response = await api.get('/gaming/achievements/unlocked')
    return response.data
  },

  /**
   * Récupérer un achievement spécifique
   */
  async getAchievement(id: string): Promise<ApiResponse<Achievement>> {
    const response = await api.get(`/gaming/achievements/${id}`)
    return response.data
  },

  // ==========================================
  // VÉRIFICATION ET DÉBLOCAGE
  // ==========================================

  /**
   * Vérifier si de nouveaux achievements peuvent être débloqués
   */
  async checkAchievements(): Promise<ApiResponse<Achievement[]>> {
    const response = await api.post('/gaming/achievements/check')
    return response.data
  },

  /**
   * Débloquer des achievements spécifiques
   */
  async unlockAchievements(achievementIds: string[]): Promise<ApiResponse<AchievementProgress[]>> {
    const response = await api.post('/gaming/achievements/unlock', {
      achievement_ids: achievementIds
    })
    return response.data
  },

  /**
   * Vérifier les achievements après une action spécifique
   */
  async checkAchievementsForAction(action: string, data?: any): Promise<ApiResponse<Achievement[]>> {
    const response = await api.post('/gaming/achievements/check-action', {
      action: action,
      data: data || {}
    })
    return response.data
  },

  // ==========================================
  // STATISTIQUES ET PROGRESSION
  // ==========================================

  /**
   * Récupérer les statistiques d'achievements de l'utilisateur
   */
  async getAchievementStats(): Promise<ApiResponse<any>> {
    const response = await api.get('/gaming/achievements/stats')
    return response.data
  },

  /**
   * Récupérer la progression vers un achievement
   */
  async getAchievementProgress(achievementId: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/gaming/achievements/${achievementId}/progress`)
    return response.data
  },

  /**
   * Récupérer les achievements par catégorie
   */
  async getAchievementsByCategory(): Promise<ApiResponse<any>> {
    const response = await api.get('/gaming/achievements/by-category')
    return response.data
  },

  // ==========================================
  // CLASSEMENTS ET SOCIAL
  // ==========================================

  /**
   * Récupérer le leaderboard des achievements
   */
  async getAchievementLeaderboard(limit: number = 10): Promise<ApiResponse<any[]>> {
    const response = await api.get(`/gaming/achievements/leaderboard?limit=${limit}`)
    return response.data
  },

  /**
   * Récupérer les achievements récents de tous les utilisateurs
   */
  async getRecentAchievements(limit: number = 5): Promise<ApiResponse<any[]>> {
    const response = await api.get(`/gaming/achievements/recent?limit=${limit}`)
    return response.data
  },

  // ==========================================
  // GESTION DES ACHIEVEMENTS (ADMIN)
  // ==========================================

  /**
   * Créer un nouvel achievement (admin)
   */
  async createAchievement(achievementData: Partial<Achievement>): Promise<ApiResponse<Achievement>> {
    const response = await api.post('/gaming/achievements', achievementData)
    return response.data
  },

  /**
   * Mettre à jour un achievement (admin)
   */
  async updateAchievement(id: string, achievementData: Partial<Achievement>): Promise<ApiResponse<Achievement>> {
    const response = await api.put(`/gaming/achievements/${id}`, achievementData)
    return response.data
  },

  /**
   * Supprimer un achievement (admin)
   */
  async deleteAchievement(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/gaming/achievements/${id}`)
    return response.data
  },

  // ==========================================
  // ÉVÉNEMENTS TEMPS RÉEL
  // ==========================================

  /**
   * Marquer une notification d'achievement comme vue
   */
  async markAchievementNotificationSeen(achievementId: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/gaming/achievements/${achievementId}/seen`)
    return response.data
  },

  /**
   * Récupérer les notifications d'achievements non vues
   */
  async getUnseenAchievementNotifications(): Promise<ApiResponse<any[]>> {
    const response = await api.get('/gaming/achievements/notifications/unseen')
    return response.data
  },

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Calculer l'XP total gagné via les achievements
   */
  calculateTotalAchievementXP(userAchievements: AchievementProgress[], achievements: Achievement[]): number {
    return userAchievements
      .filter(ua => ua.unlocked)
      .reduce((total, ua) => {
        const achievement = achievements.find(a => a.id === ua.achievement_id)
        return total + (achievement?.xp_reward || 0)
      }, 0)
  },

  /**
   * Obtenir l'icône d'un achievement selon sa catégorie
   */
  getAchievementCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'beginner': '🌱',
      'saver': '💰',
      'tracker': '📊',
      'milestone': '🎯',
      'streak': '🔥',
      'expert': '🏆',
      'special': '⭐'
    }
    return icons[category] || '🎯'
  },

  /**
   * Obtenir la couleur d'un achievement selon sa rareté
   */
  getAchievementRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      'common': '#10B981',     // Vert
      'uncommon': '#3B82F6',   // Bleu
      'rare': '#8B5CF6',       // Violet
      'epic': '#F59E0B',       // Orange
      'legendary': '#EF4444'   // Rouge
    }
    return colors[rarity] || '#5b6270'
  },

  /**
   * Formater la description d'un achievement avec les valeurs dynamiques
   */
  formatAchievementDescription(achievement: Achievement, currentValue?: number): string {
    let description = achievement.description

    if (currentValue !== undefined) {
      description = description.replace('{current}', currentValue.toLocaleString())
    }

    description = description.replace('{target}', achievement.condition_value.toLocaleString())

    return description
  },

  /**
   * Vérifier si un achievement peut être débloqué localement
   */
  canUnlockAchievement(achievement: Achievement, userStats: any): boolean {
    switch (achievement.condition_type) {
      case 'transaction_count':
        return userStats.transactionCount >= achievement.condition_value
      case 'total_income':
        return userStats.totalIncome >= achievement.condition_value
      case 'total_expenses':
        return userStats.totalExpenses >= achievement.condition_value
      case 'balance_positive':
        return userStats.balance > 0
      case 'categories_used':
        return userStats.categoriesUsed >= achievement.condition_value
      case 'days_active':
        return userStats.daysActive >= achievement.condition_value
      case 'user_level':
        return userStats.userLevel >= achievement.condition_value
      case 'first_transaction':
        return userStats.transactionCount >= 1
      default:
        return false
    }
  }
}
