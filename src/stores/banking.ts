import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { bankService } from '@/services/BankService'
import { useAuthGuard } from '@/composables/useAuthGuard'
import type { BankConnection, BankTransaction, BankingStats } from '@/services/BankService'
import type { ApiResponse } from '@/types/base'

export const useBankingStore = defineStore('banking', () => {
  const { ensureAuthenticated } = useAuthGuard()

  // ==========================================
  // STATE
  // ==========================================

  // Connexions bancaires
  const connections = ref<BankConnection[]>([])
  const currentConnection = ref<BankConnection | null>(null)

  // Transactions en attente
  const pendingTransactions = ref<BankTransaction[]>([])
  const processedTransactions = ref<BankTransaction[]>([])

  // Statistiques
  const stats = ref<BankingStats>({
    connected_accounts: 0,
    pending_transactions: 0,
    total_imported: 0,
    total_processed: 0,
    sync_health: 'good',
  })

  // États de chargement
  const loading = ref(false)
  const connecting = ref(false)
  const syncing = ref(false)
  const processing = ref(false)

  // Erreurs et alertes
  const error = ref<string | null>(null)
  const alerts = ref<
    Array<{
      id: string
      type: 'info' | 'warning' | 'error' | 'success'
      title: string
      message: string
      action?: string
      actionText?: string
      timestamp: number
    }>
  >([])

  // Cache et optimisation
  const lastSync = ref<string | null>(null)
  const syncInProgress = ref<Set<number>>(new Set())

  // ==========================================
  // GETTERS (COMPUTED)
  // ==========================================

  const isConnected = computed(() => connections.value.length > 0)

  const activeConnections = computed(() => connections.value.filter((c) => c.status === 'active'))

  const connectionsNeedingSync = computed(() =>
    connections.value.filter((c) => c.needs_sync && c.status === 'active'),
  )

  const highConfidenceTransactions = computed(() =>
    pendingTransactions.value.filter((t) => (t.confidence_score || 0) >= 0.8),
  )

  const lowConfidenceTransactions = computed(() =>
    pendingTransactions.value.filter((t) => (t.confidence_score || 0) < 0.5),
  )

  const totalPendingAmount = computed(() =>
    pendingTransactions.value.reduce((sum, t) => sum + Math.abs(t.amount), 0),
  )

  const recentAlerts = computed(() =>
    alerts.value.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5),
  )

  // ==========================================
  // ACTIONS - CONNEXIONS BANCAIRES
  // ==========================================

  /**
   * ✅ Charger toutes les connexions bancaires
   */
  async function fetchConnections(): Promise<boolean> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip fetchConnections: utilisateur non authentifié')
      connections.value = []
      return false
    }

    loading.value = true
    error.value = null

    try {
      const response = await bankService.getConnections()

      if (response.success && response.data) {
        connections.value = response.data
        await updateStats()
        return true
      }

      throw new Error(response.message || 'Erreur lors du chargement des connexions')
    } catch (err: any) {
      error.value = err.message
      console.error('Erreur fetchConnections:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ Initier une nouvelle connexion bancaire
   */
  async function initiateConnection(provider: string): Promise<string | null> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip initiateConnection: utilisateur non authentifié')
      return null
    }

    connecting.value = true
    error.value = null

    try {
      const response = await bankService.initiateConnection({
        provider: provider as 'bridge' | 'budget_insight' | 'nordigen',
      })

      if (response.success && response.data?.connect_url) {
        addAlert({
          type: 'info',
          title: 'Connexion bancaire initiée',
          message: `Redirection vers ${provider} pour autorisation`,
        })

        return response.data.connect_url
      }

      throw new Error(response.message || "Impossible d'initier la connexion")
    } catch (err: any) {
      error.value = err.message
      addAlert({
        type: 'error',
        title: 'Échec connexion bancaire',
        message: err.message || "Erreur lors de l'initiation",
      })
      return null
    } finally {
      connecting.value = false
    }
  }

  /**
   * ✅ Synchroniser une connexion bancaire
   */
  async function syncConnection(connectionId: number): Promise<boolean> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip syncConnection: utilisateur non authentifié')
      return false
    }

    if (syncInProgress.value.has(connectionId)) {
      return false
    }

    syncing.value = true
    syncInProgress.value.add(connectionId)

    try {
      const response = await bankService.syncConnection(connectionId)

      if (response.success && response.data) {
        const { imported, processed, message } = response.data

        // Mettre à jour les stats
        await Promise.all([fetchConnections(), fetchPendingTransactions()])

        // Alerte de succès
        addAlert({
          type: 'success',
          title: 'Synchronisation terminée',
          message: `${imported} transactions importées, ${processed} traitées`,
        })

        lastSync.value = new Date().toISOString()
        return true
      }

      throw new Error(response.message || 'Erreur de synchronisation')
    } catch (err: any) {
      addAlert({
        type: 'error',
        title: 'Échec synchronisation',
        message: err.message || 'Impossible de synchroniser',
      })
      return false
    } finally {
      syncing.value = false
      syncInProgress.value.delete(connectionId)
    }
  }

  /**
   * ✅ Supprimer une connexion bancaire
   */
  async function removeConnection(connectionId: number): Promise<boolean> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip removeConnection: utilisateur non authentifié')
      return false
    }

    loading.value = true

    try {
      const response = await bankService.deleteConnection(connectionId)

      if (response.success) {
        // Retirer de la liste locale
        connections.value = connections.value.filter((c) => c.id !== connectionId)

        addAlert({
          type: 'success',
          title: 'Connexion supprimée',
          message: 'La connexion bancaire a été supprimée avec succès',
        })

        await updateStats()
        return true
      }

      throw new Error(response.message || 'Impossible de supprimer')
    } catch (err: any) {
      addAlert({
        type: 'error',
        title: 'Échec suppression',
        message: err.message,
      })
      return false
    } finally {
      loading.value = false
    }
  }

  // ==========================================
  // ACTIONS - TRANSACTIONS EN ATTENTE
  // ==========================================

  /**
   * ✅ Charger les transactions en attente
   */
  async function fetchPendingTransactions(): Promise<boolean> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip fetchPendingTransactions: utilisateur non authentifié')
      pendingTransactions.value = []
      return false
    }

    loading.value = true

    try {
      const response = await bankService.getPendingTransactions()

      if (response.success && response.data) {
        pendingTransactions.value = response.data
        await updateStats()
        return true
      }

      return false
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ Traiter une transaction en attente
   */
  async function processTransaction(
    transactionId: number,
    action: 'convert' | 'ignore',
    data?: any,
  ): Promise<boolean> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip processTransaction: utilisateur non authentifié')
      return false
    }

    processing.value = true

    try {
      let response: ApiResponse<any>

      if (action === 'convert') {
        response = await bankService.convertTransaction(transactionId, data)
      } else {
        response = await bankService.ignoreTransaction(transactionId)
      }

      if (response.success) {
        // Retirer de la liste en attente
        pendingTransactions.value = pendingTransactions.value.filter((t) => t.id !== transactionId)

        // Ajouter aux traitées si conversion
        if (action === 'convert' && response.data) {
          processedTransactions.value.unshift(response.data)
        }

        await updateStats()
        return true
      }

      throw new Error(response.message || `Impossible de ${action} la transaction`)
    } catch (err: any) {
      error.value = err.message
      return false
    } finally {
      processing.value = false
    }
  }

  /**
   * ✅ Traitement automatique des transactions haute confiance
   */
  async function processHighConfidenceTransactions(): Promise<number> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip processHighConfidenceTransactions: utilisateur non authentifié')
      return 0
    }

    const highConfidence = highConfidenceTransactions.value
    let processed = 0

    processing.value = true

    try {
      for (const transaction of highConfidence) {
        if (transaction.suggested_category_id) {
          const success = await processTransaction(transaction.id, 'convert', {
            category_id: transaction.suggested_category_id,
            description: transaction.formatted_description,
          })

          if (success) {
            processed++
          }
        }
      }

      if (processed > 0) {
        addAlert({
          type: 'success',
          title: 'Traitement automatique terminé',
          message: `${processed} transactions traitées automatiquement`,
        })
      }

      return processed
    } finally {
      processing.value = false
    }
  }

  // ==========================================
  // ACTIONS - STATISTIQUES ET MONITORING
  // ==========================================

  /**
   * ✅ Mettre à jour les statistiques
   */
  async function updateStats(): Promise<void> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip updateStats: utilisateur non authentifié')
      return
    }

    try {
      const response = await bankService.getBankingStats()

      if (response.success && response.data) {
        stats.value = response.data
      } else {
        // Calculer les stats localement
        stats.value = {
          connected_accounts: connections.value.length,
          pending_transactions: pendingTransactions.value.length,
          total_imported: connections.value.reduce((sum, c) => sum + c.transactions_count, 0),
          total_processed: processedTransactions.value.length,
          sync_health: getSyncHealth(),
        }
      }
    } catch (err) {
      console.error('Erreur mise à jour stats:', err)
    }
  }

  /**
   * Déterminer l'état de santé des syncs
   */
  function getSyncHealth(): 'good' | 'warning' | 'error' {
    const errorConnections = connections.value.filter((c) => c.status === 'error').length
    const totalConnections = connections.value.length

    if (errorConnections === 0) return 'good'
    if (errorConnections / totalConnections > 0.5) return 'error'
    return 'warning'
  }

  /**
   * Vérifier et générer les alertes automatiques
   */
  async function checkAutoAlerts(): Promise<void> {
    const now = Date.now()

    // Alerte si beaucoup de transactions en attente
    if (pendingTransactions.value.length > 10) {
      addAlert({
        type: 'warning',
        title: 'Nombreuses transactions en attente',
        message: `${pendingTransactions.value.length} transactions nécessitent votre attention`,
        action: 'view-pending',
        actionText: 'Traiter',
      })
    }

    // Alerte si sync en échec
    const failedConnections = connections.value.filter((c) => c.status === 'error')
    if (failedConnections.length > 0) {
      addAlert({
        type: 'error',
        title: 'Connexions en erreur',
        message: `${failedConnections.length} connexion(s) nécessitent votre intervention`,
        action: 'fix-connections',
        actionText: 'Corriger',
      })
    }

    // Alerte si sync recommandée
    if (connectionsNeedingSync.value.length > 0) {
      addAlert({
        type: 'info',
        title: 'Synchronisation recommandée',
        message: `${connectionsNeedingSync.value.length} compte(s) peuvent être synchronisés`,
        action: 'sync-all',
        actionText: 'Synchroniser',
      })
    }
  }

  // ==========================================
  // UTILITAIRES ET HELPERS
  // ==========================================

  /**
   * Ajouter une alerte
   */
  function addAlert(alert: Omit<(typeof alerts.value)[0], 'id' | 'timestamp'>) {
    alerts.value.unshift({
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    })

    // Limiter à 10 alertes max
    if (alerts.value.length > 10) {
      alerts.value = alerts.value.slice(0, 10)
    }
  }

  /**
   * Supprimer une alerte
   */
  function removeAlert(alertId: string): void {
    alerts.value = alerts.value.filter((a) => a.id !== alertId)
  }

  /**
   * Nettoyer les anciennes alertes (> 24h)
   */
  function cleanupAlerts(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    alerts.value = alerts.value.filter((a) => a.timestamp > oneDayAgo)
  }

  /**
   * Récupérer la liste des providers bancaires disponibles
   */
  async function fetchProviders(): Promise<{ success: boolean; providers: any[] }> {
    try {
      // Pour l'instant, retourner une liste statique
      // TODO: À connecter avec l'API backend quand disponible
      const providers = [
        {
          id: 'bridge',
          name: 'Bridge',
          logo: '/logos/bridge.png',
          supported: true,
          description: 'Connexion bancaire sécurisée via Bridge API',
        },
      ]

      return { success: true, providers }
    } catch (err: any) {
      error.value = err.message
      return { success: false, providers: [] }
    }
  }

  /**
   * Reset complet du store
   */
  function reset(): void {
    connections.value = []
    currentConnection.value = null
    pendingTransactions.value = []
    processedTransactions.value = []
    stats.value = {
      connected_accounts: 0,
      pending_transactions: 0,
      total_imported: 0,
      total_processed: 0,
      sync_health: 'good',
    }
    alerts.value = []
    error.value = null
    lastSync.value = null
    syncInProgress.value.clear()
  }

  /**
   * ✅ Actualiser toutes les données
   */
  async function refreshAll(): Promise<void> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip refreshAll: utilisateur non authentifié')
      return
    }

    await Promise.all([fetchConnections(), fetchPendingTransactions(), updateStats()])

    await checkAutoAlerts()
    cleanupAlerts()
  }

  // ==========================================
  // ACTIONS AUTOMATIQUES
  // ==========================================

  /**
   * ✅ Synchroniser toutes les connexions actives
   */
  async function syncAllConnections(): Promise<void> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip syncAllConnections: utilisateur non authentifié')
      return
    }

    const activeSyncable = connections.value.filter(
      (c) => c.status === 'active' && (c.needs_sync || c.auto_sync_enabled),
    )

    for (const connection of activeSyncable) {
      await syncConnection(connection.id)
    }
  }

  /**
   * ✅ Auto-refresh périodique (appelé depuis un interval)
   */
  async function periodicRefresh(): Promise<void> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip periodicRefresh: utilisateur non authentifié')
      return
    }

    if (loading.value || syncing.value) {
      return // Éviter la concurrence
    }

    try {
      await Promise.all([fetchConnections(), fetchPendingTransactions()])

      await checkAutoAlerts()
    } catch (err) {
      console.error('Erreur refresh périodique:', err)
    }
  }

  // ==========================================
  // RETURN DU STORE
  // ==========================================

  return {
    // State
    connections,
    currentConnection,
    pendingTransactions,
    processedTransactions,
    stats,
    loading,
    connecting,
    syncing,
    processing,
    error,
    alerts,
    lastSync,

    // Getters
    isConnected,
    activeConnections,
    connectionsNeedingSync,
    highConfidenceTransactions,
    lowConfidenceTransactions,
    totalPendingAmount,
    recentAlerts,

    // Actions - Connexions
    fetchConnections,
    fetchProviders,
    initiateConnection,
    syncConnection,
    removeConnection,

    // Actions - Transactions
    fetchPendingTransactions,
    processTransaction,
    processHighConfidenceTransactions,

    // Actions - Stats
    updateStats,
    checkAutoAlerts,

    // Utilitaires
    addAlert,
    removeAlert,
    cleanupAlerts,
    reset,
    refreshAll,
    syncAllConnections,
    periodicRefresh,
  }
})
