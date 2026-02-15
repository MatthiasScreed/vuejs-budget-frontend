// src/services/transactionService.ts - VERSION CORRIGÉE
// ✅ Utilise le singleton api
// ✅ Routes sans /api/ (baseURL le contient déjà)
// ✅ Cache simplifié in-memory
import api from '@/services/api'
import type { ApiResponse } from '@/services/api'

// ==========================================
// TYPES
// ==========================================

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

// ==========================================
// CACHE SIMPLE
// ==========================================

interface CacheEntry<T = any> {
  data: T
  expires: number
  tags: string[]
}

const cache = new Map<string, CacheEntry>()

function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry || Date.now() > entry.expires) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function cacheSet<T>(key: string, data: T, ttlMs: number, tags: string[] = []): void {
  cache.set(key, { data, expires: Date.now() + ttlMs, tags })
}

function invalidateByTag(tag: string): void {
  for (const [key, entry] of cache.entries()) {
    if (entry.tags.includes(tag)) cache.delete(key)
  }
}

// ==========================================
// SERVICE
// ==========================================

class TransactionService {
  /**
   * Récupérer les transactions avec filtres
   */
  async getTransactions(
    params: {
      page?: number
      per_page?: number
      type?: 'income' | 'expense'
      category_id?: number
      date_from?: string
      date_to?: string
      search?: string
      sort_by?: 'date' | 'amount' | 'description'
      sort_order?: 'asc' | 'desc'
    } = {},
  ): Promise<
    ApiResponse<{
      data: Transaction[]
      meta: any
    }>
  > {
    try {
      const key = `transactions_${JSON.stringify(params)}`
      const cached = cacheGet<ApiResponse>(key)
      if (cached) return cached

      const response = await api.get('/transactions', { params })
      if (response.success) {
        cacheSet(key, response, 2 * 60 * 1000, ['transactions'])
      }
      return response
    } catch (error: any) {
      console.error('Get transactions error:', error)
      throw error
    }
  }

  /**
   * Créer une transaction
   */
  async createTransaction(data: CreateTransactionData): Promise<ApiResponse<Transaction>> {
    try {
      const response = await api.post<Transaction>('/transactions', data)
      if (response.success) {
        invalidateByTag('transactions')
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
  async updateTransaction(
    id: number,
    data: Partial<CreateTransactionData>,
  ): Promise<ApiResponse<Transaction>> {
    try {
      const response = await api.put<Transaction>(`/transactions/${id}`, data)
      if (response.success) {
        invalidateByTag('transactions')
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
      const response = await api.delete(`/transactions/${id}`)
      if (response.success) {
        invalidateByTag('transactions')
        console.log('Transaction supprimée:', id)
      }
      return response
    } catch (error: any) {
      console.error('Delete transaction error:', error)
      throw error
    }
  }

  /**
   * Stats des transactions
   */
  async getStats(
    period: 'month' | 'quarter' | 'year' | 'all' = 'month',
  ): Promise<ApiResponse<TransactionStats>> {
    try {
      const key = `transaction_stats_${period}`
      const cached = cacheGet<ApiResponse>(key)
      if (cached) return cached

      const response = await api.get<TransactionStats>(`/transactions/stats?period=${period}`)
      if (response.success) {
        cacheSet(key, response, 5 * 60 * 1000, ['stats'])
      }
      return response
    } catch (error: any) {
      console.error('Get stats error:', error)
      throw error
    }
  }

  /**
   * Catégories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const key = 'categories'
      const cached = cacheGet<ApiResponse>(key)
      if (cached) return cached

      const response = await api.get<Category[]>('/categories')
      if (response.success) {
        cacheSet(key, response, 30 * 60 * 1000, ['categories'])
      }
      return response
    } catch (error: any) {
      console.error('Get categories error:', error)
      throw error
    }
  }

  /**
   * Créer une catégorie
   */
  async createCategory(data: {
    name: string
    color: string
    type: 'income' | 'expense' | 'both'
    icon?: string
    budget_limit?: number
  }): Promise<ApiResponse<Category>> {
    try {
      const response = await api.post<Category>('/categories', data)
      if (response.success) {
        invalidateByTag('categories')
        console.log('Catégorie créée:', response.data?.name)
      }
      return response
    } catch (error: any) {
      console.error('Create category error:', error)
      throw error
    }
  }

  /**
   * Auto-catégorisation IA
   */
  async autoCategorizePending(): Promise<
    ApiResponse<{
      categorized: number
      confidence_scores: Record<number, number>
    }>
  > {
    try {
      const response = await api.post('/transactions/auto-categorize')
      if (response.success) {
        invalidateByTag('transactions')
        console.log('Auto-catégorisation:', response.data?.categorized)
      }
      return response
    } catch (error: any) {
      console.error('Auto categorize error:', error)
      throw error
    }
  }

  /**
   * Recherche intelligente
   */
  async searchTransactions(
    query: string,
    filters?: {
      amount_min?: number
      amount_max?: number
      categories?: number[]
      date_range?: [string, string]
    },
  ): Promise<ApiResponse<Transaction[]>> {
    try {
      return await api.get<Transaction[]>('/transactions/search', { params: { query, ...filters } })
    } catch (error: any) {
      console.error('Search error:', error)
      throw error
    }
  }

  /**
   * Suggestions de catégories
   */
  async getCategorySuggestions(
    description: string,
    amount: number,
  ): Promise<
    ApiResponse<{
      suggestions: Array<{
        category: Category
        confidence: number
        reason: string
      }>
    }>
  > {
    try {
      return await api.post('/transactions/suggest-category', { description, amount })
    } catch (error: any) {
      console.error('Category suggestions error:', error)
      throw error
    }
  }

  /**
   * Récapitulatif mensuel
   */
  async getMonthlyRecap(month?: string): Promise<ApiResponse<any>> {
    try {
      const params = month ? `?month=${month}` : ''
      const key = `monthly_recap_${month || 'current'}`
      const cached = cacheGet<ApiResponse>(key)
      if (cached) return cached

      const response = await api.get(`/transactions/monthly-recap${params}`)
      if (response.success) {
        cacheSet(key, response, 60 * 60 * 1000, ['recap'])
      }
      return response
    } catch (error: any) {
      console.error('Monthly recap error:', error)
      throw error
    }
  }

  /**
   * Marquer comme vues (gaming)
   */
  async markTransactionsAsSeen(transactionIds: number[]): Promise<ApiResponse> {
    try {
      return await api.post('/transactions/mark-seen', { transaction_ids: transactionIds })
    } catch (error: any) {
      console.error('Mark as seen error:', error)
      throw error
    }
  }
}

export const transactionService = new TransactionService()
