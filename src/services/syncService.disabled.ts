import api from './api'
import type { ApiResponse } from './api'

// ==========================================
// INTERFACES SYNCHRONISATION
// ==========================================

export interface SyncSession {
  id: string
  user_id: number
  type: SyncType
  status: SyncStatus
  started_at: string
  completed_at?: string
  duration?: number
  items_synced: number
  items_failed: number
  error_count: number
  metadata?: Record<string, unknown>
}

export interface SyncQueueItem {
  id: string
  user_id: number
  entity_type: EntityType
  entity_id: number
  action: SyncAction
  priority: SyncPriority
  attempts: number
  max_attempts: number
  next_retry_at?: string
  created_at: string
  processed_at?: string
  error?: string
  payload: Record<string, unknown>
}

export interface SyncConflict {
  id: string
  entity_type: EntityType
  entity_id: number
  field: string
  local_value: unknown
  server_value: unknown
  strategy: ConflictResolutionStrategy
  resolved: boolean
  resolved_at?: string
  resolved_value?: unknown
  metadata?: Record<string, unknown>
}

export interface SyncStats {
  total_syncs: number
  successful_syncs: number
  failed_syncs: number
  pending_items: number
  conflict_count: number
  avg_sync_time: number
  last_sync: string
  next_scheduled: string
  queue_health: QueueHealth
}

export interface OfflineChanges {
  transactions: OfflineTransaction[]
  goals: OfflineGoal[]
  categories: OfflineCategory[]
  total_changes: number
  oldest_change: string
  sync_required: boolean
}

// ==========================================
// TYPES & ENUMS
// ==========================================

export type SyncType =
  | 'full'
  | 'incremental'
  | 'realtime'
  | 'conflict_resolution'
  | 'offline_sync'

export type SyncStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'cancelled'

export type EntityType =
  | 'transaction'
  | 'goal'
  | 'category'
  | 'achievement'
  | 'user_level'
  | 'streak'
  | 'challenge'

export type SyncAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'sync'
  | 'conflict_resolve'

export type SyncPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'critical'

export type ConflictResolutionStrategy =
  | 'server_wins'
  | 'client_wins'
  | 'merge'
  | 'manual'
  | 'latest_timestamp'

export type QueueHealth =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'offline'

// ==========================================
// INTERFACES OFFLINE
// ==========================================

export interface OfflineTransaction {
  temp_id: string
  action: SyncAction
  data: Record<string, unknown>
  timestamp: string
}

export interface OfflineGoal {
  temp_id: string
  action: SyncAction
  data: Record<string, unknown>
  timestamp: string
}

export interface OfflineCategory {
  temp_id: string
  action: SyncAction
  data: Record<string, unknown>
  timestamp: string
}

// ==========================================
// SERVICE SYNCHRONISATION
// ==========================================

class SyncService {

  // ==========================================
  // SYNCHRONISATION PRINCIPALE
  // ==========================================

  /**
   * Démarrer une synchronisation complète
   */
  async startFullSync(): Promise<ApiResponse<SyncSession>> {
    console.log('🔄 Démarrage de la synchronisation complète...')

    try {
      const response = await api.post<SyncSession>('/sync/start-full')

      if (response.success && response.data) {
        this.logSyncStart(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur startFullSync:', error)
      throw error
    }
  }

  /**
   * Démarrer une synchronisation incrémentale
   */
  async startIncrementalSync(
    lastSyncTimestamp?: string
  ): Promise<ApiResponse<SyncSession>> {
    console.log('⏭️ Démarrage de la synchronisation incrémentale...')

    try {
      const payload = lastSyncTimestamp ? { last_sync: lastSyncTimestamp } : {}
      const response = await api.post<SyncSession>('/sync/start-incremental', payload)

      if (response.success && response.data) {
        this.logSyncStart(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur startIncrementalSync:', error)
      throw error
    }
  }

  /**
   * Synchronisation en temps réel (WebSocket ou Server-Sent Events)
   */
  async startRealtimeSync(): Promise<ApiResponse<{ connection_id: string }>> {
    console.log('⚡ Démarrage de la synchronisation temps réel...')

    try {
      const response = await api.post<{ connection_id: string }>('/sync/start-realtime')

      if (response.success) {
        console.log('✅ Connexion temps réel établie')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur startRealtimeSync:', error)
      throw error
    }
  }

  /**
   * Arrêter la synchronisation temps réel
   */
  async stopRealtimeSync(connectionId: string): Promise<ApiResponse> {
    console.log('⏹️ Arrêt de la synchronisation temps réel...')

    try {
      const response = await api.post('/sync/stop-realtime', { connection_id: connectionId })

      if (response.success) {
        console.log('✅ Synchronisation temps réel arrêtée')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur stopRealtimeSync:', error)
      throw error
    }
  }

  // ==========================================
  // GESTION DES SESSIONS
  // ==========================================

  /**
   * Récupérer le statut d'une session de sync
   */
  async getSyncStatus(sessionId: string): Promise<ApiResponse<SyncSession>> {
    try {
      const response = await api.get<SyncSession>(`/sync/sessions/${sessionId}/status`)

      if (response.success && response.data) {
        this.logSyncStatus(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getSyncStatus:', error)
      throw error
    }
  }

  /**
   * Récupérer l'historique des synchronisations
   */
  async getSyncHistory(
    limit: number = 10,
    offset: number = 0
  ): Promise<ApiResponse<SyncSession[]>> {
    console.log('📜 Récupération de l\'historique des synchronisations...')

    try {
      const response = await api.get<SyncSession[]>('/sync/history', {
        params: { limit, offset }
      })

      if (response.success) {
        console.log('✅ Historique récupéré:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getSyncHistory:', error)
      throw error
    }
  }

  /**
   * Annuler une synchronisation en cours
   */
  async cancelSync(sessionId: string): Promise<ApiResponse> {
    console.log('🛑 Annulation de la synchronisation:', sessionId)

    try {
      const response = await api.post(`/sync/sessions/${sessionId}/cancel`)

      if (response.success) {
        console.log('✅ Synchronisation annulée')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur cancelSync:', error)
      throw error
    }
  }

  // ==========================================
  // GESTION DE LA QUEUE
  // ==========================================

  /**
   * Ajouter un élément à la queue de synchronisation
   */
  async addToSyncQueue(
    entityType: EntityType,
    entityId: number,
    action: SyncAction,
    priority: SyncPriority = 'normal',
    payload: Record<string, unknown> = {}
  ): Promise<ApiResponse<SyncQueueItem>> {
    console.log(`➕ Ajout à la queue: ${entityType}:${entityId} - ${action}`)

    try {
      const response = await api.post<SyncQueueItem>('/sync/queue/add', {
        entity_type: entityType,
        entity_id: entityId,
        action,
        priority,
        payload
      })

      if (response.success) {
        console.log('✅ Élément ajouté à la queue')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur addToSyncQueue:', error)
      throw error
    }
  }

  /**
   * Récupérer les éléments en attente dans la queue
   */
  async getSyncQueue(): Promise<ApiResponse<SyncQueueItem[]>> {
    console.log('📋 Récupération de la queue de synchronisation...')

    try {
      const response = await api.get<SyncQueueItem[]>('/sync/queue')

      if (response.success) {
        console.log('✅ Queue récupérée:', response.data?.length, 'éléments')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getSyncQueue:', error)
      throw error
    }
  }

  /**
   * Traiter la queue de synchronisation
   */
  async processQueue(): Promise<ApiResponse<{ processed: number; failed: number }>> {
    console.log('⚡ Traitement de la queue de synchronisation...')

    try {
      const response = await api.post<{ processed: number; failed: number }>('/sync/queue/process')

      if (response.success && response.data) {
        console.log('✅ Queue traitée:', response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur processQueue:', error)
      throw error
    }
  }

  /**
   * Vider la queue de synchronisation
   */
  async clearQueue(): Promise<ApiResponse> {
    console.log('🧹 Vidage de la queue de synchronisation...')

    try {
      const response = await api.post('/sync/queue/clear')

      if (response.success) {
        console.log('✅ Queue vidée')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur clearQueue:', error)
      throw error
    }
  }

  // ==========================================
  // GESTION DES CONFLITS
  // ==========================================

  /**
   * Récupérer les conflits non résolus
   */
  async getConflicts(): Promise<ApiResponse<SyncConflict[]>> {
    console.log('⚔️ Récupération des conflits de synchronisation...')

    try {
      const response = await api.get<SyncConflict[]>('/sync/conflicts')

      if (response.success) {
        console.log('✅ Conflits récupérés:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getConflicts:', error)
      throw error
    }
  }

  /**
   * Résoudre un conflit
   */
  async resolveConflict(
    conflictId: string,
    strategy: ConflictResolutionStrategy,
    resolvedValue?: unknown
  ): Promise<ApiResponse<SyncConflict>> {
    console.log('🔧 Résolution de conflit:', conflictId)

    try {
      const response = await api.post<SyncConflict>(
        `/sync/conflicts/${conflictId}/resolve`,
        { strategy, resolved_value: resolvedValue }
      )

      if (response.success) {
        console.log('✅ Conflit résolu')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur resolveConflict:', error)
      throw error
    }
  }

  /**
   * Résoudre automatiquement tous les conflits éligibles
   */
  async autoResolveConflicts(): Promise<ApiResponse<{ resolved: number; failed: number }>> {
    console.log('🤖 Résolution automatique des conflits...')

    try {
      const response = await api.post<{ resolved: number; failed: number }>('/sync/conflicts/auto-resolve')

      if (response.success && response.data) {
        console.log('✅ Résolution automatique terminée:', response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur autoResolveConflicts:', error)
      throw error
    }
  }

  // ==========================================
  // SYNCHRONISATION HORS LIGNE
  // ==========================================

  /**
   * Enregistrer des changements hors ligne
   */
  async saveOfflineChanges(changes: OfflineChanges): Promise<ApiResponse> {
    console.log('💾 Enregistrement des changements hors ligne...')

    try {
      const response = await api.post('/sync/offline/save', changes)

      if (response.success) {
        console.log('✅ Changements hors ligne sauvegardés')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur saveOfflineChanges:', error)
      throw error
    }
  }

  /**
   * Récupérer les changements hors ligne
   */
  async getOfflineChanges(): Promise<ApiResponse<OfflineChanges>> {
    console.log('📥 Récupération des changements hors ligne...')

    try {
      const response = await api.get<OfflineChanges>('/sync/offline/changes')

      if (response.success && response.data) {
        console.log('✅ Changements hors ligne récupérés:', response.data.total_changes)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getOfflineChanges:', error)
      throw error
    }
  }

  /**
   * Synchroniser les changements hors ligne
   */
  async syncOfflineChanges(): Promise<ApiResponse<SyncSession>> {
    console.log('🔄 Synchronisation des changements hors ligne...')

    try {
      const response = await api.post<SyncSession>('/sync/offline/sync')

      if (response.success && response.data) {
        this.logSyncStart(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur syncOfflineChanges:', error)
      throw error
    }
  }

  /**
   * Vider les changements hors ligne
   */
  async clearOfflineChanges(): Promise<ApiResponse> {
    console.log('🧹 Vidage des changements hors ligne...')

    try {
      const response = await api.post('/sync/offline/clear')

      if (response.success) {
        console.log('✅ Changements hors ligne vidés')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur clearOfflineChanges:', error)
      throw error
    }
  }

  // ==========================================
  // MONITORING ET STATISTIQUES
  // ==========================================

  /**
   * Récupérer les statistiques de synchronisation
   */
  async getSyncStats(): Promise<ApiResponse<SyncStats>> {
    console.log('📊 Récupération des statistiques de synchronisation...')

    try {
      const response = await api.get<SyncStats>('/sync/stats')

      if (response.success) {
        console.log('✅ Statistiques récupérées')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getSyncStats:', error)
      throw error
    }
  }

  /**
   * Vérifier la santé du système de synchronisation
   */
  async checkSyncHealth(): Promise<ApiResponse<{ health: QueueHealth; details: unknown }>> {
    console.log('🏥 Vérification de la santé du système de sync...')

    try {
      const response = await api.get<{ health: QueueHealth; details: unknown }>('/sync/health')

      if (response.success && response.data) {
        console.log('✅ État de santé:', response.data.health)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur checkSyncHealth:', error)
      throw error
    }
  }

  /**
   * Forcer une vérification complète
   */
  async forceHealthCheck(): Promise<ApiResponse<unknown>> {
    console.log('🔍 Vérification forcée de la santé...')

    try {
      const response = await api.post('/sync/force-health-check')

      if (response.success) {
        console.log('✅ Vérification de santé terminée')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur forceHealthCheck:', error)
      throw error
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Calculer la priorité basée sur le type et l'action
   */
  calculatePriority(entityType: EntityType, action: SyncAction): SyncPriority {
    // Priorité critique pour les suppression
    if (action === 'delete') return 'critical'

    // Priorité élevée pour les transactions et objectifs
    if (['transaction', 'goal'].includes(entityType)) return 'high'

    // Priorité normale pour les autres
    return 'normal'
  }

  /**
   * Estimer le temps de synchronisation
   */
  estimateSyncTime(itemCount: number, avgTimePerItem: number = 100): number {
    return itemCount * avgTimePerItem // en millisecondes
  }

  /**
   * Formater la durée de synchronisation
   */
  formatSyncDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  /**
   * Obtenir l'icône selon le statut de sync
   */
  getSyncStatusIcon(status: SyncStatus): string {
    const icons: Record<SyncStatus, string> = {
      'pending': '⏳',
      'running': '🔄',
      'completed': '✅',
      'failed': '❌',
      'paused': '⏸️',
      'cancelled': '🛑'
    }
    return icons[status] || '❓'
  }

  /**
   * Obtenir la couleur selon la santé de la queue
   */
  getQueueHealthColor(health: QueueHealth): string {
    const colors: Record<QueueHealth, string> = {
      'healthy': '#10B981',
      'warning': '#F59E0B',
      'critical': '#EF4444',
      'offline': '#5b6270'
    }
    return colors[health] || '#5b6270'
  }

  /**
   * Valider les changements hors ligne
   */
  validateOfflineChanges(changes: OfflineChanges): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (changes.total_changes !==
      changes.transactions.length + changes.goals.length + changes.categories.length) {
      errors.push('Le nombre total de changements ne correspond pas')
    }

    if (changes.total_changes > 1000) {
      errors.push('Trop de changements hors ligne (max 1000)')
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
   * Logger le démarrage d'une synchronisation
   */
  private logSyncStart(session: SyncSession): void {
    console.log('🚀 Synchronisation démarrée:', {
      id: session.id,
      type: session.type,
      status: session.status,
      started: session.started_at
    })
  }

  /**
   * Logger le statut d'une synchronisation
   */
  private logSyncStatus(session: SyncSession): void {
    const progress = session.items_synced + session.items_failed
    const icon = this.getSyncStatusIcon(session.status)

    console.log(`${icon} Sync ${session.id}:`, {
      status: session.status,
      progress: progress,
      success: session.items_synced,
      errors: session.items_failed
    })

    if (session.completed_at && session.duration) {
      console.log(`⏱️ Durée: ${this.formatSyncDuration(session.duration)}`)
    }
  }
}

// ==========================================
// INSTANCE SINGLETON
// ==========================================

export const syncService = new SyncService()
export default syncService
