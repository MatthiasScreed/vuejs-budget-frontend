import api from './api'
import type { ApiResponse } from './api'

// ==========================================
// INTERFACES RÉCONCILIATION
// ==========================================

export interface ReconciliationReport {
  id: string
  user_id: number
  type: ReconciliationType
  status: ReconciliationStatus
  discrepancies: Discrepancy[]
  total_discrepancies: number
  resolved_count: number
  created_at: string
  resolved_at?: string
  metadata?: Record<string, unknown>
}

export interface Discrepancy {
  id: string
  type: DiscrepancyType
  entity_type: EntityType
  entity_id: number
  expected_value: unknown
  actual_value: unknown
  difference: number | string
  severity: SeverityLevel
  status: DiscrepancyStatus
  auto_fixable: boolean
  resolution_action?: string
  metadata?: Record<string, unknown>
}

export interface ReconciliationConfig {
  auto_fix_enabled: boolean
  tolerance_amount: number
  tolerance_percentage: number
  max_auto_fix_amount: number
  excluded_categories: number[]
  notification_threshold: number
}

export interface FixResult {
  discrepancy_id: string
  fixed: boolean
  action_taken: string
  old_value: unknown
  new_value: unknown
  error?: string
}

export interface ReconciliationStats {
  total_reconciliations: number
  pending_discrepancies: number
  auto_fixed_count: number
  manual_fixes_required: number
  avg_resolution_time: number
  success_rate: number
  last_run: string
  next_scheduled: string
}

// ==========================================
// TYPES & ENUMS
// ==========================================

export type ReconciliationType =
  | 'balance'
  | 'xp'
  | 'achievements'
  | 'transactions'
  | 'goals'
  | 'categories'
  | 'full'

export type ReconciliationStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'partial'

export type DiscrepancyType =
  | 'balance_mismatch'
  | 'xp_mismatch'
  | 'achievement_inconsistency'
  | 'transaction_orphan'
  | 'goal_progress_error'
  | 'category_total_error'
  | 'level_calculation_error'
  | 'streak_calculation_error'

export type EntityType =
  | 'user'
  | 'transaction'
  | 'goal'
  | 'achievement'
  | 'category'
  | 'level'
  | 'streak'

export type SeverityLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export type DiscrepancyStatus =
  | 'detected'
  | 'acknowledged'
  | 'fixing'
  | 'fixed'
  | 'ignored'
  | 'manual_review'

// ==========================================
// SERVICE RÉCONCILIATION
// ==========================================

class ReconciliationService {

  // ==========================================
  // RÉCONCILIATION PRINCIPALE
  // ==========================================

  /**
   * Lancer une réconciliation complète
   */
  async runFullReconciliation(): Promise<ApiResponse<ReconciliationReport>> {
    console.log('🔍 Lancement de la réconciliation complète...')

    try {
      const response = await api.post<ReconciliationReport>(
        '/reconciliation/run-full'
      )

      if (response.success && response.data) {
        this.logReconciliationResult(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur runFullReconciliation:', error)
      throw error
    }
  }

  /**
   * Réconciliation par type spécifique
   */
  async runReconciliationByType(
    type: ReconciliationType
  ): Promise<ApiResponse<ReconciliationReport>> {
    console.log(`🎯 Réconciliation ${type}...`)

    try {
      const response = await api.post<ReconciliationReport>(
        `/reconciliation/run-type/${type}`
      )

      if (response.success && response.data) {
        this.logReconciliationResult(response.data)
      }

      return response
    } catch (error) {
      console.error(`❌ Erreur réconciliation ${type}:`, error)
      throw error
    }
  }

  /**
   * Réconciliation pour un utilisateur spécifique
   */
  async runUserReconciliation(
    userId: number,
    type?: ReconciliationType
  ): Promise<ApiResponse<ReconciliationReport>> {
    console.log(`👤 Réconciliation utilisateur ${userId}...`)

    try {
      const params = type ? { type } : {}
      const response = await api.post<ReconciliationReport>(
        `/reconciliation/run-user/${userId}`,
        params
      )

      if (response.success && response.data) {
        this.logReconciliationResult(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur runUserReconciliation:', error)
      throw error
    }
  }

  // ==========================================
  // GESTION DES RAPPORTS
  // ==========================================

  /**
   * Récupérer les rapports de réconciliation
   */
  async getReconciliationReports(
    limit: number = 10,
    offset: number = 0
  ): Promise<ApiResponse<ReconciliationReport[]>> {
    console.log('📊 Récupération des rapports de réconciliation...')

    try {
      const response = await api.get<ReconciliationReport[]>(
        '/reconciliation/reports',
        { params: { limit, offset } }
      )

      if (response.success) {
        console.log('✅ Rapports récupérés:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getReconciliationReports:', error)
      throw error
    }
  }

  /**
   * Récupérer un rapport spécifique
   */
  async getReconciliationReport(
    reportId: string
  ): Promise<ApiResponse<ReconciliationReport>> {
    console.log('📋 Récupération du rapport:', reportId)

    try {
      const response = await api.get<ReconciliationReport>(
        `/reconciliation/reports/${reportId}`
      )

      if (response.success) {
        console.log('✅ Rapport récupéré')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getReconciliationReport:', error)
      throw error
    }
  }

  /**
   * Récupérer les rapports en attente
   */
  async getPendingReports(): Promise<ApiResponse<ReconciliationReport[]>> {
    console.log('⏳ Récupération des rapports en attente...')

    try {
      const response = await api.get<ReconciliationReport[]>(
        '/reconciliation/reports/pending'
      )

      if (response.success) {
        console.log('✅ Rapports en attente:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getPendingReports:', error)
      throw error
    }
  }

  // ==========================================
  // GESTION DES DISCREPANCES
  // ==========================================

  /**
   * Récupérer les discrepances non résolues
   */
  async getUnresolvedDiscrepancies(
    severity?: SeverityLevel
  ): Promise<ApiResponse<Discrepancy[]>> {
    console.log('🚨 Récupération des discrepances non résolues...')

    try {
      const params = severity ? { severity } : {}
      const response = await api.get<Discrepancy[]>(
        '/reconciliation/discrepancies/unresolved',
        { params }
      )

      if (response.success) {
        console.log('✅ Discrepances récupérées:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getUnresolvedDiscrepancies:', error)
      throw error
    }
  }

  /**
   * Récupérer les discrepances par entité
   */
  async getDiscrepanciesByEntity(
    entityType: EntityType,
    entityId: number
  ): Promise<ApiResponse<Discrepancy[]>> {
    console.log(`🔍 Récupération des discrepances ${entityType}:${entityId}`)

    try {
      const response = await api.get<Discrepancy[]>(
        `/reconciliation/discrepancies/${entityType}/${entityId}`
      )

      if (response.success) {
        console.log('✅ Discrepances entité récupérées:', response.data?.length)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getDiscrepanciesByEntity:', error)
      throw error
    }
  }

  /**
   * Marquer une discrepance comme ignorée
   */
  async ignoreDiscrepancy(
    discrepancyId: string,
    reason?: string
  ): Promise<ApiResponse> {
    console.log('🙈 Marquage discrepance comme ignorée:', discrepancyId)

    try {
      const response = await api.post(
        `/reconciliation/discrepancies/${discrepancyId}/ignore`,
        { reason }
      )

      if (response.success) {
        console.log('✅ Discrepance marquée comme ignorée')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur ignoreDiscrepancy:', error)
      throw error
    }
  }

  // ==========================================
  // CORRECTION AUTOMATIQUE
  // ==========================================

  /**
   * Corriger automatiquement une discrepance
   */
  async autoFixDiscrepancy(
    discrepancyId: string
  ): Promise<ApiResponse<FixResult>> {
    console.log('🔧 Correction automatique:', discrepancyId)

    try {
      const response = await api.post<FixResult>(
        `/reconciliation/discrepancies/${discrepancyId}/auto-fix`
      )

      if (response.success && response.data) {
        this.logFixResult(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur autoFixDiscrepancy:', error)
      throw error
    }
  }

  /**
   * Corriger automatiquement toutes les discrepances éligibles
   */
  async autoFixAllEligible(): Promise<ApiResponse<FixResult[]>> {
    console.log('🔧 Correction automatique de toutes les discrepances éligibles...')

    try {
      const response = await api.post<FixResult[]>(
        '/reconciliation/auto-fix-all'
      )

      if (response.success && response.data) {
        console.log('✅ Corrections automatiques terminées:', response.data.length)
        response.data.forEach(fix => this.logFixResult(fix))
      }

      return response
    } catch (error) {
      console.error('❌ Erreur autoFixAllEligible:', error)
      throw error
    }
  }

  /**
   * Correction manuelle d'une discrepance
   */
  async manualFixDiscrepancy(
    discrepancyId: string,
    fixData: Record<string, unknown>
  ): Promise<ApiResponse<FixResult>> {
    console.log('✏️ Correction manuelle:', discrepancyId)

    try {
      const response = await api.post<FixResult>(
        `/reconciliation/discrepancies/${discrepancyId}/manual-fix`,
        fixData
      )

      if (response.success && response.data) {
        this.logFixResult(response.data)
      }

      return response
    } catch (error) {
      console.error('❌ Erreur manualFixDiscrepancy:', error)
      throw error
    }
  }

  // ==========================================
  // CONFIGURATION
  // ==========================================

  /**
   * Récupérer la configuration de réconciliation
   */
  async getReconciliationConfig(): Promise<ApiResponse<ReconciliationConfig>> {
    console.log('⚙️ Récupération de la configuration...')

    try {
      const response = await api.get<ReconciliationConfig>(
        '/reconciliation/config'
      )

      if (response.success) {
        console.log('✅ Configuration récupérée')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getReconciliationConfig:', error)
      throw error
    }
  }

  /**
   * Mettre à jour la configuration de réconciliation
   */
  async updateReconciliationConfig(
    config: Partial<ReconciliationConfig>
  ): Promise<ApiResponse<ReconciliationConfig>> {
    console.log('🔧 Mise à jour de la configuration...')

    try {
      const response = await api.put<ReconciliationConfig>(
        '/reconciliation/config',
        config
      )

      if (response.success) {
        console.log('✅ Configuration mise à jour')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur updateReconciliationConfig:', error)
      throw error
    }
  }

  // ==========================================
  // STATISTIQUES ET MONITORING
  // ==========================================

  /**
   * Récupérer les statistiques de réconciliation
   */
  async getReconciliationStats(): Promise<ApiResponse<ReconciliationStats>> {
    console.log('📊 Récupération des statistiques...')

    try {
      const response = await api.get<ReconciliationStats>(
        '/reconciliation/stats'
      )

      if (response.success) {
        console.log('✅ Statistiques récupérées')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getReconciliationStats:', error)
      throw error
    }
  }

  /**
   * Récupérer l'état de santé du système
   */
  async getHealthStatus(): Promise<ApiResponse<unknown>> {
    console.log('🏥 Vérification de l\'état de santé...')

    try {
      const response = await api.get('/reconciliation/health')

      if (response.success) {
        console.log('✅ État de santé récupéré')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur getHealthStatus:', error)
      throw error
    }
  }

  /**
   * Forcer une vérification de cohérence
   */
  async forceConsistencyCheck(): Promise<ApiResponse<unknown>> {
    console.log('🔍 Vérification forcée de cohérence...')

    try {
      const response = await api.post('/reconciliation/force-check')

      if (response.success) {
        console.log('✅ Vérification de cohérence terminée')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur forceConsistencyCheck:', error)
      throw error
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Calculer la priorité d'une discrepance
   */
  calculateDiscrepancyPriority(discrepancy: Discrepancy): number {
    const severityWeight = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    }

    const typeWeight = {
      'balance_mismatch': 4,
      'xp_mismatch': 2,
      'achievement_inconsistency': 3,
      'transaction_orphan': 3,
      'goal_progress_error': 2,
      'category_total_error': 2,
      'level_calculation_error': 3,
      'streak_calculation_error': 1
    }

    return (severityWeight[discrepancy.severity] || 1) *
      (typeWeight[discrepancy.type] || 1)
  }

  /**
   * Formater une discrepance pour l'affichage
   */
  formatDiscrepancy(discrepancy: Discrepancy): string {
    const severity = discrepancy.severity.toUpperCase()
    const type = discrepancy.type.replace('_', ' ')

    return `[${severity}] ${type} - ${discrepancy.entity_type}:${discrepancy.entity_id}`
  }

  /**
   * Valider les données de correction manuelle
   */
  validateManualFix(
    discrepancy: Discrepancy,
    fixData: Record<string, unknown>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!fixData || Object.keys(fixData).length === 0) {
      errors.push('Les données de correction sont requises')
    }

    if (discrepancy.status === 'fixed') {
      errors.push('Cette discrepance est déjà corrigée')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Obtenir l'icône selon le type de discrepance
   */
  getDiscrepancyIcon(type: DiscrepancyType): string {
    const icons: Record<DiscrepancyType, string> = {
      'balance_mismatch': '💰',
      'xp_mismatch': '⭐',
      'achievement_inconsistency': '🏆',
      'transaction_orphan': '💸',
      'goal_progress_error': '🎯',
      'category_total_error': '📊',
      'level_calculation_error': '📈',
      'streak_calculation_error': '🔥'
    }
    return icons[type] || '⚠️'
  }

  /**
   * Obtenir la couleur selon la sévérité
   */
  getSeverityColor(severity: SeverityLevel): string {
    const colors: Record<SeverityLevel, string> = {
      'low': '#10B981',
      'medium': '#F59E0B',
      'high': '#EF4444',
      'critical': '#DC2626'
    }
    return colors[severity] || '#6B7280'
  }

  // ==========================================
  // MÉTHODES PRIVÉES
  // ==========================================

  /**
   * Logger le résultat de réconciliation
   */
  private logReconciliationResult(report: ReconciliationReport): void {
    console.log('✅ Réconciliation terminée:', {
      type: report.type,
      status: report.status,
      discrepancies: report.total_discrepancies,
      resolved: report.resolved_count
    })

    if (report.total_discrepancies > 0) {
      console.warn(`⚠️ ${report.total_discrepancies} discrepance(s) détectée(s)`)
    }
  }

  /**
   * Logger le résultat d'une correction
   */
  private logFixResult(fix: FixResult): void {
    if (fix.fixed) {
      console.log(`✅ Correction réussie: ${fix.action_taken}`)
    } else {
      console.error(`❌ Échec de correction: ${fix.error}`)
    }
  }
}

// ==========================================
// INSTANCE SINGLETON
// ==========================================

export const reconciliationService = new ReconciliationService()
export default reconciliationService
