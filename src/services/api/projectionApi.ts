// src/services/api/projectionApi.ts
// ✅ CORRIGÉ: Utilise le client API centralisé
import { apiClient } from '@/services/api'
import type { ApiResponse, ProjectionApiResponse, InsightApiResponse } from '@/types/api.types'

/**
 * API Projections et Insights IA
 * École 42: Service séparé pour l'IA
 */
export class ProjectionApi {
  static async getProjections(): Promise<ProjectionApiResponse[]> {
    const response = await apiClient.get<ApiResponse<ProjectionApiResponse[]>>('/projections')
    return response.data.data
  }

  static async getInsights(): Promise<InsightApiResponse[]> {
    const response = await apiClient.get<ApiResponse<InsightApiResponse[]>>('/projections/insights')
    return response.data.data
  }

  static async refreshProjections(): Promise<ProjectionApiResponse[]> {
    const response =
      await apiClient.post<ApiResponse<ProjectionApiResponse[]>>('/projections/refresh')
    return response.data.data
  }

  static async getProjectionByPeriod(
    period: '3months' | '6months' | '12months',
  ): Promise<ProjectionApiResponse> {
    const response = await apiClient.get<ApiResponse<ProjectionApiResponse>>(
      `/projections/${period}`,
    )
    return response.data.data
  }
}
