import { useApi } from '@/composables/core/useApi'
import type { ApiResponse } from '@/types/base'

// ==========================================
// INTERFACES NIVEAU & XP
// ==========================================

export interface UserLevel {
  id: number
  user_id: number
  level: number
  total_xp: number
  current_level_xp: number
  next_level_xp: number
  created_at: string
  updated_at: string
}

export interface XPEvent {
  id: number
  user_id: number
  amount: number
  source: string
  description?: string
  event_type: XPEventType
  metadata?: Record<string, unknown>
  created_at: string
}

export interface LevelReward {
  id: number
  level: number
  type: RewardType
  name: string
  description: string
  value: number
  claimed: boolean
  claimed_at?: string
  metadata?: Record<string, unknown>
}

export interface LevelConfig {
  base_xp: number
  multiplier: number
  max_level: number
  level_rewards: LevelReward[]
}

export interface UserRank {
  user_id: number
  level_rank: number
  xp_rank: number
  total_users: number
  percentile: number
}

export interface XPStats {
  total_xp: number
  daily_average: number
  weekly_average: number
  monthly_average: number
  best_day: number
  current_streak: number
  longest_streak: number
  events_count: number
}

// ==========================================
// TYPES & ENUMS
// ==========================================

export type XPEventType =
  | 'transaction_created'
  | 'transaction_updated'
  | 'achievement_unlocked'
  | 'goal_completed'
  | 'daily_login'
  | 'streak_bonus'
  | 'challenge_completed'
  | 'level_bonus'
  | 'manual_add'
  | 'simulation'

export type RewardType =
  | 'badge'
  | 'feature_unlock'
  | 'xp_bonus'
  | 'achievement_boost'
  | 'customization'

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time'

// ==========================================
// DONNÉES POUR LES REQUÊTES
// ==========================================

export interface AddXPData {
  amount: number
  source: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface LevelUpResult {
  leveledUp: boolean
  oldLevel: number
  newLevel: number
  xpGained: number
  userLevel: UserLevel
  rewards?: LevelReward[]
}

export interface SimulateXPData {
  amount: number
  source: string
  user_id?: number
}

export interface SetLevelData {
  level: number
  reason?: string
}

// ==========================================
// SERVICE NIVEAU & XP
// ==========================================

class LevelService {
  private api = useApi()

  // ==========================================
  // NIVEAU UTILISATEUR
  // ==========================================

  /**
   * Récupérer le niveau actuel de l'utilisateur
   */
  async getUserLevel(): Promise<ApiResponse<UserLevel>> {
    console.log('📊 Récupération du niveau utilisateur...')

    try {
      const response = await this.api.get<UserLevel>('/gaming/level')

      if (response.success) {
        this.logLevelInfo(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getUserLevel:', error)
      throw error
    }
  }

  /**
   * Récupérer la progression détaillée du niveau
   */
  async getLevelProgress(): Promise<ApiResponse<unknown>> {
    console.log('📈 Récupération de la progression...')

    try {
      const response = await this.api.get('/gaming/level/progress')
      return response
    } catch (error) {
      console.error('❌ Erreur getLevelProgress:', error)
      throw error
    }
  }

  /**
   * Initialiser le niveau d'un utilisateur
   */
  async initializeUserLevel(): Promise<ApiResponse<UserLevel>> {
    console.log('🚀 Initialisation du niveau utilisateur...')

    try {
      const response = await this.api.post<UserLevel>('/gaming/level/initialize')

      if (response.success) {
        console.log('✅ Niveau utilisateur initialisé')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur initializeUserLevel:', error)
      throw error
    }
  }

  // ==========================================
  // GESTION DE L'XP
  // ==========================================

  /**
   * Ajouter de l'XP à l'utilisateur
   */
  async addXP(data: AddXPData): Promise<ApiResponse<LevelUpResult>> {
    console.log('⭐ Ajout d\'XP:', data.amount)

    const validation = this.validateXPData(data)
    if (!validation.isValid) {
      throw new Error(`Données XP invalides: ${validation.errors.join(', ')}`)
    }

    try {
      const response = await this.api.post<LevelUpResult>('/gaming/add-xp', data)

      if (response.success && response.data) {
        this.logXPResult(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur addXP:', error)
      throw error
    }
  }

  /**
   * Retirer de l'XP à l'utilisateur (admin)
   */
  async removeXP(amount: number, reason: string): Promise<ApiResponse<UserLevel>> {
    console.log('➖ Retrait d\'XP:', amount)

    try {
      const response = await this.api.post<UserLevel>('/gaming/remove-xp', {
        amount,
        reason
      })

      if (response.success) {
        console.log('✅ XP retiré avec succès')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur removeXP:', error)
      throw error
    }
  }

  /**
   * Récupérer l'historique des événements XP
   */
  async getXPEvents(
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<XPEvent[]>> {
    console.log('📜 Récupération des événements XP...')

    try {
      const response = await this.api.get<XPEvent[]>('/gaming/xp-events', {
        params: { limit, offset }
      })

      if (response.success) {
        console.log('✅ Événements XP récupérés:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getXPEvents:', error)
      throw error
    }
  }

  /**
   * Récupérer les événements XP récents
   */
  async getRecentXPEvents(days: number = 7): Promise<ApiResponse<XPEvent[]>> {
    console.log('🕐 Récupération des événements XP récents...')

    try {
      const response = await this.api.get<XPEvent[]>('/gaming/xp-events/recent', {
        params: { days }
      })

      if (response.success) {
        console.log('✅ Événements récents récupérés:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getRecentXPEvents:', error)
      throw error
    }
  }

  /**
   * Récupérer les statistiques XP
   */
  async getXPStats(): Promise<ApiResponse<XPStats>> {
    console.log('📊 Récupération des statistiques XP...')

    try {
      const response = await this.api.get<XPStats>('/gaming/xp-stats')

      if (response.success) {
        console.log('✅ Statistiques XP récupérées')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getXPStats:', error)
      throw error
    }
  }

  // ==========================================
  // RÉCOMPENSES DE NIVEAU
  // ==========================================

  /**
   * Récupérer toutes les récompenses de niveau
   */
  async getLevelRewards(): Promise<ApiResponse<LevelReward[]>> {
    console.log('🎁 Récupération des récompenses de niveau...')

    try {
      const response = await this.api.get<LevelReward[]>('/gaming/level-rewards')

      if (response.success) {
        console.log('✅ Récompenses récupérées:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getLevelRewards:', error)
      throw error
    }
  }

  /**
   * Récupérer les récompenses pour un niveau spécifique
   */
  async getRewardsForLevel(level: number): Promise<ApiResponse<LevelReward[]>> {
    console.log('🎯 Récupération des récompenses niveau', level)

    try {
      const response = await this.api.get<LevelReward[]>(`/gaming/level-rewards/${level}`)

      if (response.success) {
        console.log('✅ Récompenses niveau récupérées:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getRewardsForLevel:', error)
      throw error
    }
  }

  /**
   * Réclamer les récompenses d'un niveau
   */
  async claimLevelRewards(level: number): Promise<ApiResponse<LevelReward[]>> {
    console.log('🎉 Réclamation des récompenses niveau', level)

    try {
      const response = await this.api.post<LevelReward[]>(`/gaming/claim-level-rewards/${level}`)

      if (response.success) {
        console.log('✅ Récompenses réclamées avec succès')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur claimLevelRewards:', error)
      throw error
    }
  }

  /**
   * Vérifier les récompenses non réclamées
   */
  async getUnclaimedRewards(): Promise<ApiResponse<LevelReward[]>> {
    console.log('🔍 Vérification des récompenses non réclamées...')

    try {
      const response = await this.api.get<LevelReward[]>('/gaming/level-rewards/unclaimed')

      if (response.success) {
        console.log('✅ Récompenses non réclamées:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getUnclaimedRewards:', error)
      throw error
    }
  }

  // ==========================================
  // CLASSEMENTS ET COMPARAISONS
  // ==========================================

  /**
   * Récupérer le classement par niveau
   */
  async getLevelLeaderboard(limit: number = 10): Promise<ApiResponse<unknown[]>> {
    console.log('🏆 Récupération du classement par niveau...')

    return this.getLeaderboard('level', limit)
  }

  /**
   * Récupérer le classement par XP
   */
  async getXPLeaderboard(limit: number = 10): Promise<ApiResponse<unknown[]>> {
    console.log('⭐ Récupération du classement par XP...')

    return this.getLeaderboard('xp', limit)
  }

  /**
   * Récupérer la position de l'utilisateur dans le classement
   */
  async getUserRank(): Promise<ApiResponse<UserRank>> {
    console.log('📊 Récupération du rang utilisateur...')

    try {
      const response = await this.api.get<UserRank>('/gaming/user-rank')

      if (response.success) {
        console.log('✅ Rang utilisateur récupéré')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getUserRank:', error)
      throw error
    }
  }

  // ==========================================
  // ACTIONS SPÉCIALES
  // ==========================================

  /**
   * Simuler un gain d'XP (pour tests/démos)
   */
  async simulateXPGain(
    amount: number,
    source: string
  ): Promise<ApiResponse<LevelUpResult>> {
    console.log('🧪 Simulation gain XP:', amount)

    try {
      const response = await this.api.post<LevelUpResult>('/gaming/simulate-xp', {
        amount,
        source
      })

      if (response.success && response.data) {
        this.logXPResult(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur simulateXPGain:', error)
      throw error
    }
  }

  /**
   * Réinitialiser le niveau d'un utilisateur (admin)
   */
  async resetUserLevel(userId: string): Promise<ApiResponse<UserLevel>> {
    console.log('🔄 Réinitialisation du niveau utilisateur:', userId)

    try {
      const response = await this.api.post<UserLevel>(`/gaming/reset-level/${userId}`)

      if (response.success) {
        console.log('✅ Niveau utilisateur réinitialisé')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur resetUserLevel:', error)
      throw error
    }
  }

  /**
   * Définir manuellement le niveau d'un utilisateur (admin)
   */
  async setUserLevel(
    userId: string,
    level: number
  ): Promise<ApiResponse<UserLevel>> {
    console.log('⚙️ Définition manuelle du niveau:', { userId, level })

    try {
      const response = await this.api.post<UserLevel>(
        `/gaming/set-level/${userId}`,
        { level }
      )

      if (response.success) {
        console.log('✅ Niveau utilisateur défini')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur setUserLevel:', error)
      throw error
    }
  }

  // ==========================================
  // CONFIGURATION
  // ==========================================

  /**
   * Récupérer la configuration des niveaux
   */
  async getLevelConfig(): Promise<ApiResponse<LevelConfig>> {
    console.log('⚙️ Récupération de la configuration des niveaux...')

    try {
      const response = await this.api.get<LevelConfig>('/gaming/level-config')

      if (response.success) {
        console.log('✅ Configuration des niveaux récupérée')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getLevelConfig:', error)
      throw error
    }
  }

  /**
   * Mettre à jour la configuration des niveaux (admin)
   */
  async updateLevelConfig(config: Partial<LevelConfig>): Promise<ApiResponse<LevelConfig>> {
    console.log('🔧 Mise à jour de la configuration des niveaux...')

    try {
      const response = await this.api.put<LevelConfig>('/gaming/level-config', config)

      if (response.success) {
        console.log('✅ Configuration des niveaux mise à jour')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur updateLevelConfig:', error)
      throw error
    }
  }

  // ==========================================
  // UTILITAIRES PUBLICS
  // ==========================================

  /**
   * Calculer l'XP nécessaire pour un niveau donné
   */
  calculateXPForLevel(
    level: number,
    baseXP: number = 100,
    multiplier: number = 1.5
  ): number {
    return Math.floor(baseXP * Math.pow(level, multiplier))
  }

  /**
   * Calculer l'XP total nécessaire pour atteindre un niveau
   */
  calculateTotalXPForLevel(
    level: number,
    baseXP: number = 100,
    multiplier: number = 1.5
  ): number {
    let totalXP = 0
    for (let i = 1; i < level; i++) {
      totalXP += this.calculateXPForLevel(i, baseXP, multiplier)
    }
    return totalXP
  }

  /**
   * Déterminer le niveau à partir de l'XP total
   */
  getLevelFromTotalXP(
    totalXP: number,
    baseXP: number = 100,
    multiplier: number = 1.5,
    maxLevel: number = 100
  ): number {
    let level = 1
    let xpForCurrentLevel = 0

    while (xpForCurrentLevel <= totalXP && level < maxLevel) {
      level++
      xpForCurrentLevel += this.calculateXPForLevel(level, baseXP, multiplier)
    }

    return level - 1
  }

  /**
   * Calculer la progression en pourcentage
   */
  calculateLevelProgress(currentXP: number, nextLevelXP: number): number {
    return nextLevelXP > 0 ? Math.round((currentXP / nextLevelXP) * 100) : 0
  }

  /**
   * Estimer le temps pour atteindre le prochain niveau
   */
  estimateTimeToNextLevel(
    currentXP: number,
    nextLevelXP: number,
    averageXPPerDay: number
  ): number | null {
    if (averageXPPerDay <= 0) return null

    const xpNeeded = nextLevelXP - currentXP
    return Math.ceil(xpNeeded / averageXPPerDay)
  }

  /**
   * Obtenir le rang basé sur le niveau
   */
  getRankFromLevel(level: number): { name: string; color: string; icon: string } {
    const ranks = [
      { min: 50, name: 'Grand Maître', color: '#FFD700', icon: '👑' },
      { min: 40, name: 'Maître', color: '#FFA500', icon: '🏆' },
      { min: 30, name: 'Expert', color: '#9932CC', icon: '🥇' },
      { min: 20, name: 'Avancé', color: '#1E90FF', icon: '🥈' },
      { min: 10, name: 'Intermédiaire', color: '#32CD32', icon: '🥉' },
      { min: 5, name: 'Apprenti', color: '#FF6347', icon: '📚' },
      { min: 0, name: 'Débutant', color: '#696969', icon: '🌱' }
    ]

    return ranks.find(rank => level >= rank.min) || ranks[ranks.length - 1]
  }

  /**
   * Formater l'XP avec séparateurs
   */
  formatXP(xp: number): string {
    return new Intl.NumberFormat('fr-FR').format(xp)
  }

  /**
   * Formater une date relative pour les événements XP
   */
  formatRelativeTime(date: string): string {
    const now = new Date()
    const targetDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

    if (diffInSeconds < 60) return 'À l\'instant'
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
    }
    const days = Math.floor(diffInSeconds / 86400)
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  }

  /**
   * Obtenir l'icône selon le type d'événement XP
   */
  getXPEventIcon(eventType: XPEventType): string {
    const icons: Record<XPEventType, string> = {
      'transaction_created': '💰',
      'transaction_updated': '✏️',
      'achievement_unlocked': '🏆',
      'goal_completed': '🎯',
      'daily_login': '📅',
      'streak_bonus': '🔥',
      'challenge_completed': '⭐',
      'level_bonus': '🎊',
      'manual_add': '➕',
      'simulation': '🧪'
    }
    return icons[eventType] || '📊'
  }

  /**
   * Obtenir la couleur selon le type d'événement XP
   */
  getXPEventColor(eventType: XPEventType): string {
    const colors: Record<XPEventType, string> = {
      'transaction_created': '#10B981',
      'transaction_updated': '#3B82F6',
      'achievement_unlocked': '#F59E0B',
      'goal_completed': '#8B5CF6',
      'daily_login': '#6366F1',
      'streak_bonus': '#EF4444',
      'challenge_completed': '#EC4899',
      'level_bonus': '#14B8A6',
      'manual_add': '#6B7280',
      'simulation': '#F97316'
    }
    return colors[eventType] || '#6B7280'
  }

  /**
   * Valider les données d'ajout d'XP
   */
  validateXPData(data: AddXPData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.amount || data.amount <= 0) {
      errors.push('Le montant d\'XP doit être supérieur à 0')
    }

    if (data.amount > 10000) {
      errors.push('Le montant d\'XP ne peut pas dépasser 10 000')
    }

    if (!data.source || data.source.trim().length === 0) {
      errors.push('La source de l\'XP est obligatoire')
    }

    if (data.description && data.description.length > 255) {
      errors.push('La description ne peut pas dépasser 255 caractères')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // ==========================================
  // MÉTHODES PRIVÉES
  // ==========================================

  /**
   * Récupérer un leaderboard générique
   */
  private async getLeaderboard(
    type: 'level' | 'xp',
    limit: number
  ): Promise<ApiResponse<unknown[]>> {
    try {
      const response = await this.api.get<unknown[]>(`/gaming/leaderboard/${type}`, {
        params: { limit }
      })

      if (response.success) {
        console.log(`✅ Leaderboard ${type} récupéré:`, response.data?.length)
      }

      return response
    } catch (error) {
      console.error(`❌ Erreur leaderboard ${type}:`, error)
      throw error
    }
  }

  /**
   * Logger les informations de niveau
   */
  private logLevelInfo(data?: UserLevel): void {
    if (!data) return

    console.log('✅ Niveau utilisateur récupéré:', {
      level: data.level,
      total_xp: data.total_xp,
      progress: `${data.current_level_xp}/${data.next_level_xp}`
    })
  }

  /**
   * Logger le résultat d'XP
   */
  private logXPResult(result: LevelUpResult): void {
    const { leveledUp, oldLevel, newLevel, xpGained } = result

    console.log('⭐ XP traité:', xpGained)

    if (leveledUp) {
      console.log('📈 Level up!', `${oldLevel} → ${newLevel}`)
    }

    if (result.rewards && result.rewards.length > 0) {
      console.log('🎁 Récompenses débloquées:', result.rewards.length)
    }
  }
}

// ==========================================
// INSTANCE SINGLETON
// ==========================================

export const levelService = new LevelService()
export default levelService
