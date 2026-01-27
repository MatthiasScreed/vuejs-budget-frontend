import { useApi } from '@/composables/core/useApi'
import { useCache } from '@/composables/core/useCache'
import type { ApiResponse } from '@/stores/authStore'

export interface Transaction {
  id: number
  user_id: number
  type: 'income' | 'expense'
  amount: number
  description: string
  category_id?: number
  category?: Category
  transaction_date: string
  source: 'manual' | 'bank_import' | 'api' | 'recurring'
  status: 'pending' | 'completed' | 'cancelled'
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  color: string
  icon?: string
  type: 'income' | 'expense' | 'both'
  budget_limit?: number
  is_default: boolean
}

export interface TransactionStats {
  total_income: number
  total_expenses: number
  net_balance: number
  transaction_count: number
  avg_transaction: number
  largest_expense: number
  largest_income: number
  category_breakdown: CategoryBreakdown[]
}

export interface CategoryBreakdown {
  category_id: number
  category_name: string
  total_amount: number
  transaction_count: number
  percentage: number
  budget_status: 'under' | 'on_track' | 'over'
}

export interface CreateTransactionData {
  type: 'income' | 'expense'
  amount: number
  description: string
  category_id?: number
  transaction_date: string
  metadata?: Record<string, any>
}

/**
 * Service pour gestion des transactions
 * CRUD, stats, catégorisation et intégration gaming
 */
class TransactionService {
  private api = useApi()
  private cache = useCache()

  /**
   * Récupérer toutes les transactions avec filtres
   */
  async getTransactions(params: {
    page?: number
    per_page?: number
    type?: 'income' | 'expense'
    category_id?: number
    date_from?: string
    date_to?: string
    search?: string
    sort_by?: 'date' | 'amount' | 'description'
    sort_order?: 'asc' | 'desc'
  } = {}): Promise<ApiResponse<{ data: Transaction[], meta: any }>> {
    try {
      const cacheKey = `transactions_${JSON.stringify(params)}`

      return await this.cache.remember(
        cacheKey,
        () => this.api.get('/api/transactions', { params } as any),
        2 * 60 * 1000, // Cache 2 minutes
        ['transactions', 'financial']
      )
    } catch (error: any) {
      console.error('Get transactions error:', error)
      throw error
    }
  }

  /**
   * Créer une nouvelle transaction
   */
  async createTransaction(data: CreateTransactionData): Promise<ApiResponse<Transaction>> {
    try {
      const response = await this.api.post<Transaction>('/api/transactions', data)

      if (response.success) {
        // Invalider le cache des transactions
        this.cache.invalidateByTag('transactions')

        console.log('Transaction créée:', response.data?.description)
      }

      return response
    } catch (error: any) {
      console.error('Create transaction error:', error)
      throw error
    }
  }

  /**
   * Mettre à jour une transaction
   */
  async updateTransaction(id: number, data: Partial<CreateTransactionData>): Promise<ApiResponse<Transaction>> {
    try {
      const response = await this.api.put<Transaction>(`/api/transactions/${id}`, data)

      if (response.success) {
        this.cache.invalidateByTag('transactions')
        console.log('Transaction mise à jour:', id)
      }

      return response
    } catch (error: any) {
      console.error('Update transaction error:', error)
      throw error
    }
  }

  /**
   * Supprimer une transaction
   */
  async deleteTransaction(id: number): Promise<ApiResponse> {
    try {
      const response = await this.api.del(`/api/transactions/${id}`)

      if (response.success) {
        this.cache.invalidateByTag('transactions')
        console.log('Transaction supprimée:', id)
      }

      return response
    } catch (error: any) {
      console.error('Delete transaction error:', error)
      throw error
    }
  }

  /**
   * Obtenir les statistiques des transactions
   */
  async getStats(period: 'month' | 'quarter' | 'year' | 'all' = 'month'): Promise<ApiResponse<TransactionStats>> {
    try {
      const cacheKey = `transaction_stats_${period}`

      return await this.cache.remember(
        cacheKey,
        () => this.api.get<TransactionStats>(`/api/transactions/stats?period=${period}`),
        5 * 60 * 1000, // Cache 5 minutes
        ['stats', 'financial']
      )
    } catch (error: any) {
      console.error('Get transaction stats error:', error)
      throw error
    }
  }

  /**
   * Obtenir les catégories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      return await this.cache.remember(
        'categories',
        () => this.api.get<Category[]>('/api/categories'),
        30 * 60 * 1000, // Cache 30 minutes (données statiques)
        ['categories', 'static']
      )
    } catch (error: any) {
      console.error('Get categories error:', error)
      throw error
    }
  }

  /**
   * Créer une catégorie personnalisée
   */
  async createCategory(data: {
    name: string
    color: string
    type: 'income' | 'expense' | 'both'
    icon?: string
    budget_limit?: number
  }): Promise<ApiResponse<Category>> {
    try {
      const response = await this.api.post<Category>('/api/categories', data)

      if (response.success) {
        this.cache.invalidateByTag('categories')
        console.log('Catégorie créée:', response.data?.name)
      }

      return response
    } catch (error: any) {
      console.error('Create category error:', error)
      throw error
    }
  }

  /**
   * Import en lot de transactions (CSV, etc.)
   */
  async importTransactions(file: File): Promise<ApiResponse<{
    imported: number
    skipped: number
    errors: string[]
  }>> {
    try {
      const response = await this.api.upload('/api/transactions/import', file)

      if (response.success) {
        this.cache.invalidateByTag('transactions')
        console.log('Import terminé:', response.data)
      }

      return response
    } catch (error: any) {
      console.error('Import transactions error:', error)
      throw error
    }
  }

  /**
   * Catégorisation automatique par IA
   */
  async autoCategorizePending(): Promise<ApiResponse<{
    categorized: number
    confidence_scores: Record<number, number>
  }>> {
    try {
      const response = await this.api.post('/api/transactions/auto-categorize')

      if (response.success) {
        this.cache.invalidateByTag('transactions')
        console.log('Auto-catégorisation terminée:', response.data?.categorized)
      }

      return response
    } catch (error: any) {
      console.error('Auto categorize error:', error)
      throw error
    }
  }

  /**
   * Recherche intelligente de transactions
   */
  async searchTransactions(query: string, filters?: {
    amount_min?: number
    amount_max?: number
    categories?: number[]
    date_range?: [string, string]
  }): Promise<ApiResponse<Transaction[]>> {
    try {
      const params = { query, ...filters }
      return await this.api.get<Transaction[]>('/api/transactions/search', { params } as any)
    } catch (error: any) {
      console.error('Search transactions error:', error)
      throw error
    }
  }

  /**
   * Obtenir les suggestions de catégories pour une transaction
   */
  async getCategorySuggestions(description: string, amount: number): Promise<ApiResponse<{
    suggestions: Array<{
      category: Category
      confidence: number
      reason: string
    }>
  }>> {
    try {
      return await this.api.post('/api/transactions/suggest-category', {
        description,
        amount
      })
    } catch (error: any) {
      console.error('Category suggestions error:', error)
      throw error
    }
  }

  /**
   * Récupérer le récapitulatif mensuel
   */
  async getMonthlyRecap(month?: string): Promise<ApiResponse<{
    period: string
    transactions: Transaction[]
    stats: TransactionStats
    gaming_progress: {
      xp_gained: number
      achievements_unlocked: number
      streak_maintained: boolean
    }
  }>> {
    try {
      const params = month ? `?month=${month}` : ''
      const cacheKey = `monthly_recap_${month || 'current'}`

      return await this.cache.remember(
        cacheKey,
        () => this.api.get(`/api/transactions/monthly-recap${params}`),
        60 * 60 * 1000, // Cache 1 heure
        ['recap', 'monthly', 'financial']
      )
    } catch (error: any) {
      console.error('Monthly recap error:', error)
      throw error
    }
  }

  /**
   * Marquer des transactions comme vues (pour gaming)
   */
  async markTransactionsAsSeen(transactionIds: number[]): Promise<ApiResponse> {
    try {
      return await this.api.post('/api/transactions/mark-seen', {
        transaction_ids: transactionIds
      })
    } catch (error: any) {
      console.error('Mark as seen error:', error)
      throw error
    }
  }
}

// Export singleton
export const transactionService = new TransactionService()
