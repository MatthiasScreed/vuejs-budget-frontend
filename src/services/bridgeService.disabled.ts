import api from './api'
import type { ApiResponse } from './api'
import { gamingService } from './gamingService'
import { levelService } from './levelService'
import { useToast } from 'vue-toastification'

// ==========================================
// INTERFACES BRIDGE AMÉLIORÉES
// ==========================================

export interface BudgetGamingBridge {
  transaction_id: number
  action_type: BridgeActionType
  amount: number
  category: string
  xp_earned: number
  achievements_triggered: string[]
  gaming_data?: Record<string, unknown>
  timestamp: string // AJOUT: Timestamp pour traçabilité
}

export interface FinancialAction {
  type: FinancialActionType
  amount: number
  category_id?: number
  goal_id?: number
  metadata?: Record<string, unknown>
  user_id: number // AJOUT: ID utilisateur obligatoire
  description?: string // AJOUT: Description optionnelle
}

export interface GamingTrigger {
  action: string
  user_id: number
  data: Record<string, unknown>
  xp_amount?: number
  auto_process: boolean
  priority: 'low' | 'medium' | 'high' // AJOUT: Priorité de traitement
}

export interface BridgeResponse {
  financial_processed: boolean
  gaming_processed: boolean
  xp_gained: number
  achievements_unlocked: number
  level_changed: boolean
  notifications: BridgeNotification[] // AMÉLIORÉ: Structure notification
  errors?: string[]
  processing_time_ms: number // AJOUT: Métrique performance
}

export interface BridgeNotification {
  type: 'success' | 'warning' | 'info' | 'achievement' | 'level_up'
  title: string
  message: string
  data?: Record<string, unknown>
  auto_dismiss?: boolean
}

export interface SyncResult {
  transactions_synced: number
  goals_synced: number
  achievements_checked: number
  xp_recalculated: boolean
  sync_timestamp: string
  errors: string[]
  performance_metrics: SyncMetrics // AJOUT: Métriques détaillées
}

export interface SyncMetrics {
  total_duration_ms: number
  api_calls_count: number
  data_processed_mb: number
  cache_hits: number
}

// ==========================================
// TYPES & ENUMS ÉTENDUS
// ==========================================

export type BridgeActionType =
  | 'transaction_create'
  | 'transaction_update'
  | 'transaction_delete'
  | 'goal_create'
  | 'goal_complete'
  | 'goal_update'
  | 'budget_exceed'
  | 'budget_respect'
  | 'category_usage'
  | 'streak_achievement' // AJOUT
  | 'monthly_summary'    // AJOUT

export type FinancialActionType =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'savings'
  | 'investment'
  | 'debt_payment'
  | 'subscription'      // AJOUT
  | 'refund'            // AJOUT

export type SyncScope =
  | 'achievements'
  | 'xp'
  | 'levels'
  | 'transactions'
  | 'goals'
  | 'streaks'           // AJOUT
  | 'analytics'         // AJOUT
  | 'all'

// ==========================================
// SERVICE BRIDGE AMÉLIORÉ
// ==========================================

class BridgeService {
  private toast = useToast()
  private processingQueue: GamingTrigger[] = [] // AJOUT: Queue de traitement
  private isProcessing = false

  // Cache pour éviter les appels API répétés
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // ==========================================
  // INTÉGRATION BUDGET <-> GAMING
  // ==========================================

  /**
   * Traiter une action financière avec impact gaming
   * AMÉLIORÉ: Avec validation, cache et métriques
   */
  async processFinancialAction(
    action: FinancialAction
  ): Promise<ApiResponse<BridgeResponse>> {
    console.log('🌉 Traitement action financière avec gaming:', action.type)
    const startTime = performance.now()

    try {
      // Validation des données
      const validation = this.validateFinancialAction(action)
      if (!validation.isValid) {
        throw new Error(`Validation échouée: ${validation.errors.join(', ')}`)
      }

      // Vérifier le cache
      const cacheKey = this.generateCacheKey('financial', action)
      const cached = this.getFromCache<BridgeResponse>(cacheKey)
      if (cached) {
        console.log('✅ Réponse depuis le cache')
        return { success: true, data: cached }
      }

      const response = await api.post<BridgeResponse>(
        '/bridge/financial-action',
        {
          ...action,
          timestamp: new Date().toISOString()
        }
      )

      if (response.success && response.data) {
        // Ajouter métriques de performance
        response.data.processing_time_ms = performance.now() - startTime

        this.logBridgeResponse(response.data)
        this.handleNotifications(response.data.notifications)

        // Mettre en cache
        this.setCache(cacheKey, response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur processFinancialAction:', error)
      this.toast.error('Erreur lors du traitement de l\'action financière')
      throw error
    }
  }

  /**
   * Traitement en lot des actions
   * NOUVEAU: Pour optimiser les performances
   */
  async processBatchFinancialActions(
    actions: FinancialAction[]
  ): Promise<ApiResponse<BridgeResponse[]>> {
    console.log(`🔄 Traitement en lot: ${actions.length} actions`)

    try {
      // Valider toutes les actions
      const validations = actions.map(action => this.validateFinancialAction(action))
      const invalidActions = validations.filter(v => !v.isValid)

      if (invalidActions.length > 0) {
        throw new Error(`${invalidActions.length} actions invalides`)
      }

      const response = await api.post<BridgeResponse[]>(
        '/bridge/financial-actions-batch',
        { actions }
      )

      if (response.success && response.data) {
        // Traiter les notifications de chaque réponse
        response.data.forEach(bridgeResponse => {
          this.handleNotifications(bridgeResponse.notifications)
        })
      }

      return response
    } catch (error) {
      console.error('❌ Erreur processBatchFinancialActions:', error)
      throw error
    }
  }

  /**
   * File d'attente pour les triggers gaming
   * NOUVEAU: Éviter la surcharge du système
   */
  async queueGamingTrigger(trigger: GamingTrigger): Promise<void> {
    console.log('📝 Ajout trigger à la queue:', trigger.action)

    this.processingQueue.push(trigger)

    if (!this.isProcessing) {
      this.processGamingQueue()
    }
  }

  /**
   * Traiter la queue des triggers gaming
   */
  private async processGamingQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return
    }

    this.isProcessing = true
    console.log(`🔄 Traitement de la queue: ${this.processingQueue.length} triggers`)

    try {
      while (this.processingQueue.length > 0) {
        // Traiter par ordre de priorité
        this.processingQueue.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })

        const trigger = this.processingQueue.shift()
        if (trigger) {
          await this.triggerGamingFromBudget(trigger)
        }
      }
    } catch (error) {
      console.error('❌ Erreur processGamingQueue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Déclencher les événements gaming depuis les actions budget
   * AMÉLIORÉ: Avec retry et gestion d'erreurs
   */
  async triggerGamingFromBudget(
    trigger: GamingTrigger,
    retryCount = 0
  ): Promise<ApiResponse<BridgeResponse>> {
    console.log('🎮 Déclenchement gaming depuis budget:', trigger.action)

    try {
      const response = await api.post<BridgeResponse>(
        '/bridge/gaming-trigger',
        trigger
      )

      if (response.success && response.data) {
        this.logBridgeResponse(response.data)
        this.handleNotifications(response.data.notifications)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur triggerGamingFromBudget:', error)

      // Retry logic pour les erreurs temporaires
      if (retryCount < 3 && this.isRetryableError(error)) {
        console.log(`🔄 Retry ${retryCount + 1}/3`)
        await this.delay(1000 * (retryCount + 1)) // Exponential backoff
        return this.triggerGamingFromBudget(trigger, retryCount + 1)
      }

      throw error
    }
  }

  // ==========================================
  // ANALYTICS ET MÉTRIQUES
  // ==========================================

  /**
   * Obtenir les métriques de performance du bridge
   * NOUVEAU
   */
  async getBridgeAnalytics(timeframe: 'day' | 'week' | 'month'): Promise<ApiResponse<unknown>> {
    console.log(`📊 Récupération analytics bridge: ${timeframe}`)

    try {
      const response = await api.get(`/bridge/analytics/${timeframe}`)

      if (response.success) {
        console.log('✅ Analytics bridge récupérées')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getBridgeAnalytics:', error)
      throw error
    }
  }

  /**
   * Surveiller la santé du système bridge
   * NOUVEAU
   */
  async getBridgeHealth(): Promise<ApiResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    uptime: number
    queue_size: number
    cache_hit_rate: number
    error_rate: number
  }>> {
    try {
      const response = await api.get('/bridge/health')
      return response
    } catch (error) {
      console.error('❌ Erreur getBridgeHealth:', error)
      throw error
    }
  }

  // ==========================================
  // GESTION DU CACHE INTELLIGENT
  // ==========================================

  /**
   * Générer une clé de cache unique
   */
  private generateCacheKey(type: string, data: unknown): string {
    const hash = this.simpleHash(JSON.stringify(data))
    return `${type}_${hash}`
  }

  /**
   * Récupérer depuis le cache
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  /**
   * Mettre en cache
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })

    // Nettoyage périodique du cache
    if (this.cache.size > 1000) {
      this.cleanupCache()
    }
  }

  /**
   * Nettoyer le cache expiré
   */
  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key)
      }
    }
    console.log('🧹 Cache nettoyé')
  }

  // ==========================================
  // NOTIFICATIONS AMÉLIORÉES
  // ==========================================

  /**
   * Gérer les notifications du bridge
   */
  private handleNotifications(notifications: BridgeNotification[]): void {
    notifications.forEach(notification => {
      switch (notification.type) {
        case 'success':
          this.toast.success(notification.message)
          break
        case 'warning':
          this.toast.warning(notification.message)
          break
        case 'achievement':
          this.toast.success(`🏆 ${notification.message}`, {
            timeout: 5000,
            icon: '🏆'
          })
          break
        case 'level_up':
          this.toast.success(`⭐ ${notification.message}`, {
            timeout: 5000,
            icon: '⭐'
          })
          break
        default:
          this.toast.info(notification.message)
      }
    })
  }

  // ==========================================
  // UTILITAIRES AMÉLIORÉS
  // ==========================================

  /**
   * Calculer l'XP avec des bonus contextuels
   * AMÉLIORÉ
   */
  calculateXPForAction(
    actionType: BridgeActionType,
    amount?: number,
    context?: Record<string, unknown>
  ): number {
    const baseXPMap: Record<BridgeActionType, number> = {
      'transaction_create': 10,
      'transaction_update': 5,
      'transaction_delete': -5,
      'goal_create': 25,
      'goal_complete': 100,
      'goal_update': 10,
      'budget_exceed': -10,
      'budget_respect': 50,
      'category_usage': 5,
      'streak_achievement': 75,  // NOUVEAU
      'monthly_summary': 30      // NOUVEAU
    }

    let xp = baseXPMap[actionType] || 0

    // Bonus basé sur le montant
    if (amount && ['transaction_create', 'goal_complete'].includes(actionType)) {
      const amountBonus = Math.min(25, Math.floor(amount / 200))
      xp += amountBonus
    }

    // Bonus contextuels
    if (context) {
      if (context.isFirstTime) xp *= 1.5          // Premier fois
      if (context.isStreakContinued) xp *= 1.2    // Continuation streak
      if (context.perfectWeek) xp *= 1.3          // Semaine parfaite
    }

    return Math.max(0, Math.round(xp))
  }

  /**
   * Déterminer si l'erreur est "retryable"
   */
  private isRetryableError(error: unknown): boolean {
    const retryableErrors = [
      'Network Error',
      'timeout',
      'ECONNRESET',
      'ECONNREFUSED'
    ]

    const errorMessage = String(error).toLowerCase()
    return retryableErrors.some(retryError =>
      errorMessage.includes(retryError.toLowerCase())
    )
  }

  /**
   * Attendre un délai
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Hash simple pour les clés de cache
   */
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Logger amélioré avec métriques
   */
  private logBridgeResponse(response: BridgeResponse): void {
    console.log('✅ Action bridge traitée:', {
      financial: response.financial_processed,
      gaming: response.gaming_processed,
      xp: response.xp_gained,
      achievements: response.achievements_unlocked,
      levelUp: response.level_changed,
      processingTime: `${response.processing_time_ms}ms`,
      notifications: response.notifications.length
    })
  }

  /**
   * Validation étendue des actions financières
   */
  validateFinancialAction(action: FinancialAction): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!action.type) {
      errors.push('Le type d\'action est obligatoire')
    }

    if (!action.user_id || action.user_id <= 0) {
      errors.push('L\'ID utilisateur est obligatoire')
    }

    if (action.amount <= 0) {
      errors.push('Le montant doit être supérieur à 0')
    }

    if (action.amount > 1000000) {
      errors.push('Le montant ne peut pas dépasser 1 000 000')
    }

    // Validation contextuelle
    if (action.type === 'transfer' && !action.metadata?.target_account) {
      errors.push('Le compte de destination est obligatoire pour les virements')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// ==========================================
// INSTANCE SINGLETON
// ==========================================

export const bridgeService = new BridgeService()
export default bridgeService
