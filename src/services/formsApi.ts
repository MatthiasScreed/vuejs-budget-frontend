// services/api/formsApi.ts
import { api } from '@/services/api'
import type {
  Transaction,
  Category,
  FinancialGoal,
  ApiResponse
} from '@/types'

/**
 * Service API spécialisé pour les formulaires
 * Compatible avec votre useForm.ts existant
 */
export const formsApi = {

  // ==========================================
  // TRANSACTIONS
  // ==========================================

  async createTransaction(data: {
    description: string
    amount: number
    type: 'income' | 'expense'
    category_id?: number
    transaction_date: string
    notes?: string
    tags?: string[]
    is_recurring?: boolean
    recurring_frequency?: string
    recurring_end_date?: string
  }): Promise<ApiResponse<Transaction>> {
    // Formatage des données selon votre backend
    const payload = {
      ...data,
      amount: Math.abs(data.amount),
      transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],
      tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags
    }

    const response = await api.post<ApiResponse<Transaction>>('/transactions', payload)
    return response.data
  },

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data)
    return response.data
  },

  async deleteTransaction(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/transactions/${id}`)
    return response.data
  },

  // ==========================================
  // CATÉGORIES
  // ==========================================

  async createCategory(data: {
    name: string
    type: 'income' | 'expense'
    description?: string
    icon?: string
    color?: string
    monthly_budget?: number
    is_active?: boolean
    parent_id?: number
  }): Promise<ApiResponse<Category>> {
    const response = await api.post<ApiResponse<Category>>('/categories', {
      ...data,
      is_active: data.is_active ?? true,
      icon: data.icon || 'folder',
      color: data.color || '#6B7280'
    })
    return response.data
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<ApiResponse<Category>> {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data)
    return response.data
  },

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/categories/${id}`)
    return response.data
  },

  // ==========================================
  // OBJECTIFS
  // ==========================================

  async createGoal(data: {
    name: string
    description?: string
    target_amount: number
    start_date?: string
    target_date?: string
    category_id?: number
    is_active?: boolean
  }): Promise<ApiResponse<FinancialGoal>> {
    const response = await api.post<ApiResponse<FinancialGoal>>('/financial-goals', {
      ...data,
      is_active: data.is_active ?? true,
      start_date: data.start_date || new Date().toISOString().split('T')[0]
    })
    return response.data
  },

  async updateGoal(id: number, data: Partial<FinancialGoal>): Promise<ApiResponse<FinancialGoal>> {
    const response = await api.put<ApiResponse<FinancialGoal>>(`/financial-goals/${id}`, data)
    return response.data
  },

  async deleteGoal(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/financial-goals/${id}`)
    return response.data
  },

  // ==========================================
  // UTILITAIRES
  // ==========================================

  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>('/categories')
    return response.data
  },

  async uploadFile(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<ApiResponse<{ url: string; filename: string }>>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    )
    return response.data
  }
}

export default formsApi
