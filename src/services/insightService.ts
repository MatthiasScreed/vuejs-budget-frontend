// src/services/insightService.ts

import api from '@/services/api'
import type { ApiResponse } from '@/services/api'

// ==========================================
// TYPES
// ==========================================

export interface FinancialInsight {
  id: number
  type: string
  priority: number
  title: string
  description: string
  icon: string
  action_label: string | null
  action_data: Record<string, any> | null
  potential_saving: number | null
  goal_impact: Record<string, any>[] | null
  metadata: Record<string, any> | null
  is_read: boolean
  is_dismissed: boolean
  acted_at: string | null
  created_at: string
  updated_at: string
}

export interface InsightSummary {
  total_active: number
  unread: number
  by_type: Record<string, number>
  by_priority: Record<string, number>
  total_potential_saving: number
  acted_count: number
}

export interface InsightFilters {
  type?: string
  priority?: number
  unread_only?: boolean
  per_page?: number
  page?: number
}

export interface PaginatedInsights {
  success: boolean
  data: FinancialInsight[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface InsightActionResult {
  success: boolean
  message: string
  data?: FinancialInsight
  gaming?: {
    xp_earned: number
    action: string
  }
}

// ==========================================
// SERVICE
// ==========================================

export const insightService = {
  /**
   * Récupérer les insights paginés
   */
  async getInsights(filters: InsightFilters = {}): Promise<PaginatedInsights> {
    const params = new URLSearchParams()

    if (filters.type) {
      params.append('type', filters.type)
    }
    if (filters.priority) {
      params.append('priority', String(filters.priority))
    }
    if (filters.unread_only) {
      params.append('unread_only', '1')
    }
    if (filters.per_page) {
      params.append('per_page', String(filters.per_page))
    }
    if (filters.page) {
      params.append('page', String(filters.page))
    }

    const query = params.toString()
    const url = query ? `/insights?${query}` : '/insights'
    return await api.get<PaginatedInsights>(url)
  },

  /**
   * Récupérer le résumé des insights
   */
  async getSummary(): Promise<InsightSummary> {
    const res = await api.get<InsightSummary>('/insights/summary')
    return res.data as InsightSummary
  },

  /**
   * Récupérer un insight par ID
   */
  async getInsight(id: number): Promise<FinancialInsight> {
    const res = await api.get<FinancialInsight>(`/insights/${id}`)
    return res.data as FinancialInsight
  },

  /**
   * Générer de nouveaux insights
   */
  async generate(): Promise<InsightActionResult> {
    return await api.post<InsightActionResult>('/insights/generate')
  },

  /**
   * Marquer comme lu
   */
  async markAsRead(id: number): Promise<InsightActionResult> {
    return await api.patch<InsightActionResult>(`/insights/${id}/read`)
  },

  /**
   * Marquer action effectuée
   */
  async markAsActed(id: number): Promise<InsightActionResult> {
    return await api.patch<InsightActionResult>(`/insights/${id}/act`)
  },

  /**
   * Rejeter un insight
   */
  async dismiss(id: number): Promise<InsightActionResult> {
    return await api.patch<InsightActionResult>(`/insights/${id}/dismiss`)
  },

  /**
   * Tout marquer comme lu
   */
  async markAllAsRead(): Promise<InsightActionResult> {
    return await api.post<InsightActionResult>('/insights/read-all')
  },

  /**
   * Supprimer un insight
   */
  async deleteInsight(id: number): Promise<InsightActionResult> {
    return await api.delete<InsightActionResult>(`/insights/${id}`)
  },
}
