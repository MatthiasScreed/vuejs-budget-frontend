// src/services/api/dashboardApi.ts
// ✅ CORRIGÉ: Utilise le client API centralisé au lieu de axiosInstance
import { apiClient } from '@/services/api'
import type {
  ApiResponse,
  DashboardDataResponse,
  DashboardMetricsResponse,
} from '@/types/api.types'

/**
 * API Dashboard
 * École 42: Fonctions max 25 lignes, un rôle par fonction
 */
export class DashboardApi {
  /**
   * Récupère toutes les données du dashboard
   */
  static async getDashboardData(): Promise<DashboardDataResponse> {
    const response = await apiClient.get<ApiResponse<DashboardDataResponse>>('/dashboard')
    return response.data.data
  }

  /**
   * Récupère uniquement les métriques
   */
  static async getMetrics(): Promise<DashboardMetricsResponse> {
    const response =
      await apiClient.get<ApiResponse<DashboardMetricsResponse>>('/dashboard/metrics')
    return response.data.data
  }

  /**
   * Force le recalcul des métriques
   */
  static async refreshMetrics(): Promise<DashboardMetricsResponse> {
    const response = await apiClient.post<ApiResponse<DashboardMetricsResponse>>(
      '/dashboard/metrics/refresh',
    )
    return response.data.data
  }
}
