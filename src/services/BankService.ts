import { api, type ApiResponse } from './api'

// ==========================================
// TYPES BANCAIRES
// ==========================================

export interface BankConnection {
  id: number
  user_id: number
  bank_name: string
  bank_code?: string
  connection_id: string
  provider: 'bridge' | 'budget_insight' | 'nordigen' | 'plaid'
  status: 'active' | 'expired' | 'error' | 'disabled' | 'pending'
  last_sync_at?: string
  auto_sync_enabled: boolean
  sync_frequency_hours: number
  transactions_count: number
  accounts_count: number
  needs_sync: boolean
  error_message?: string
  created_at: string
  updated_at: string
  accounts?: BankAccount[]
}

export interface BankAccount {
  id: string
  connection_id: number
  account_name: string
  account_type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan'
  balance: number
  currency: string
  iban?: string
  is_active: boolean
}

export interface InitiateBankConnectionData {
  provider?: 'bridge' | 'budget_insight' | 'nordigen' | 'plaid'
  return_url?: string
  webhook_url?: string
  institution_id?: string
  country?: string
}

export interface BankingStats {
  connected_accounts: number
  active_connections: number
  pending_transactions: number
  processed_transactions: number
  total_imported: number
  last_sync?: string
  sync_health: 'good' | 'warning' | 'error'
  providers_status: Record<string, 'active' | 'down' | 'maintenance'>
}

// ==========================================
// SERVICE BANCAIRE - BRIDGE API v3 2025
// ==========================================

export const bankService = {
  // Cache simple
  cache: new Map<string, { data: any; timestamp: number }>(),
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes

  /**
   * ✅ CORRIGÉ : Initier une connexion bancaire (Bridge v3 2025)
   * Le backend gère le flow complet : user creation, token, connect session
   */
  async initiateConnection(data?: InitiateBankConnectionData): Promise<ApiResponse<{
    connect_url: string
    session_id?: string
    expires_at?: string
  }>> {
    try {
      console.log('🔗 Initiating bank connection:', data)

      // ✅ Backend gère tout, on envoie juste le provider
      const response = await api.post('/bank/initiate', {
        provider: data?.provider || 'bridge',
        country: data?.country || 'FR',
        // ⚠️ Ne pas envoyer return_url sauf si tu veux un callback custom
        // Bridge utilisera la config dashboard par défaut
      })

      if (response.success) {
        this.cache.delete('connections')
        console.log('✅ Connection initiated:', response.data.connect_url)
      } else {
        console.error('❌ Connection failed:', response)
      }

      return response
    } catch (error: any) {
      console.error('❌ Error initiating connection:', error)
      return {
        success: false,
        data: {} as any,
        message: error.message || 'Impossible d\'initier la connexion bancaire',
        errors: error.response?.data?.errors
      }
    }
  },

  /**
   * Récupérer les connexions bancaires
   */
  async getConnections(): Promise<ApiResponse<BankConnection[]>> {
    const cacheKey = 'connections'
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { success: true, data: cached.data, message: 'From cache' }
    }

    try {
      const response = await api.get('/bank/connections')

      if (response.success && response.data) {
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        })
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message || 'Impossible de récupérer les connexions'
      }
    }
  },

  /**
   * Synchroniser une connexion
   */
  async syncConnection(connectionId: number): Promise<ApiResponse<{
    imported: number
    processed: number
    message: string
    xp_gained?: number
  }>> {
    try {
      const response = await api.post(`/bank/connections/${connectionId}/sync`)

      if (response.success) {
        this.cache.delete('connections')
        this.cache.delete('pending')
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        data: {} as any,
        message: error.message || 'Erreur lors de la synchronisation'
      }
    }
  },

  /**
   * Récupérer transactions en attente
   */
  async getPendingTransactions(): Promise<ApiResponse<any[]>> {
    const cacheKey = 'pending'
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { success: true, data: cached.data, message: 'From cache' }
    }

    try {
      const response = await api.get('/bank/pending-transactions')

      if (response.success && response.data) {
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        })
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message || 'Impossible de récupérer les transactions'
      }
    }
  },

  /**
   * Convertir une transaction bancaire
   */
  async convertTransaction(
    transactionId: number,
    data: {
      category_id: number
      description?: string
    }
  ): Promise<ApiResponse<any>> {
    try {
      const response = await api.post(`/bank/transactions/${transactionId}/convert`, data)

      if (response.success) {
        this.cache.delete('pending')
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        data: {} as any,
        message: error.message || 'Impossible de convertir la transaction'
      }
    }
  },

  /**
   * Ignorer une transaction
   */
  async ignoreTransaction(transactionId: number): Promise<ApiResponse<any>> {
    try {
      const response = await api.post(`/bank/transactions/${transactionId}/ignore`)

      if (response.success) {
        this.cache.delete('pending')
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        data: {} as any,
        message: error.message || 'Impossible d\'ignorer la transaction'
      }
    }
  },

  /**
   * Supprimer une connexion
   */
  async deleteConnection(connectionId: number): Promise<ApiResponse<any>> {
    try {
      const response = await api.delete(`/bank/connections/${connectionId}`)

      if (response.success) {
        this.cache.delete('connections')
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        data: {} as any,
        message: error.message || 'Impossible de supprimer la connexion'
      }
    }
  },

  /**
   * Récupérer les stats bancaires
   */
  async getStats(): Promise<ApiResponse<BankingStats>> {
    try {
      return await api.get('/bank/stats')
    } catch (error: any) {
      return {
        success: false,
        data: {} as any,
        message: error.message || 'Impossible de récupérer les statistiques'
      }
    }
  },

  /**
   * Health check du système bancaire
   */
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      return await api.get('/bank/health')
    } catch (error: any) {
      return {
        success: false,
        data: { status: 'down' },
        message: error.message || 'Service bancaire indisponible'
      }
    }
  },

  /**
   * Lister les providers disponibles
   */
  async getProviders(): Promise<ApiResponse<any>> {
    try {
      return await api.get('/bank/providers')
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message || 'Impossible de récupérer les providers'
      }
    }
  },

  /**
   * Invalider le cache
   */
  invalidateCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  },

  /**
   * Récupérer les statistiques bancaires
   */
  async getBankingStats(useCache: boolean = true): Promise<ApiResponse<BankingStats>> {
    const cacheKey = 'banking_stats'

    if (useCache) {
      const cached = this.cache.get<BankingStats>(cacheKey)
      if (cached) {
        return { success: true, data: cached }
      }
    }

    try {
      const response = await api.get<BankingStats>('/bank/stats')

      if (response.success && response.data) {
        this.cache.set(cacheKey, response.data, CACHE_TTL.stats)
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        data: {
          connected_accounts: 0,
          active_connections: 0,
          pending_transactions: 0,
          processed_transactions: 0,
          total_imported: 0,
          sync_health: 'error',
          providers_status: {}
        },
        message: 'Impossible de récupérer les statistiques'
      }
    }
  }
}

export default bankService
