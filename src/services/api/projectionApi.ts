// src/services/api/projectionApi.ts

import axiosInstance from './axiosInstance'
import type { ApiResponse, ProjectionApiResponse, InsightApiResponse } from '@/types/api.types'

/**
 * API Projections et Insights IA
 * École 42: Service séparé pour l'IA
 */
export class ProjectionApi {
  /**
   * Récupère toutes les projections
   */
  static async getProjections(): Promise<ProjectionApiResponse[]> {
    const response = await axiosInstance.get<ApiResponse<ProjectionApiResponse[]>>('/projections')
    return response.data.data
  }

  /**
   * Récupère les insights IA
   */
  static async getInsights(): Promise<InsightApiResponse[]> {
    const response =
      await axiosInstance.get<ApiResponse<InsightApiResponse[]>>('/projections/insights')
    return response.data.data
  }

  /**
   * Force le recalcul des projections
   */
  static async refreshProjections(): Promise<ProjectionApiResponse[]> {
    const response =
      await axiosInstance.post<ApiResponse<ProjectionApiResponse[]>>('/projections/refresh')
    return response.data.data
  }

  /**
   * Récupère une projection spécifique
   */
  static async getProjectionByPeriod(
    period: '3months' | '6months' | '12months',
  ): Promise<ProjectionApiResponse> {
    const response = await axiosInstance.get<ApiResponse<ProjectionApiResponse>>(
      `/projections/${period}`,
    )
    return response.data.data
  }
}
