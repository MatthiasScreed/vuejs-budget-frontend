// src/services/api/goalApi.ts
// ✅ CORRIGÉ: Utilise le client API centralisé
import { apiClient } from '@/services/api'
import type { ApiResponse, GoalApiResponse } from '@/types/api.types'

/**
 * API Goals
 * École 42: CRUD complet pour les objectifs
 */
export class GoalApi {
  static async getGoals(): Promise<GoalApiResponse[]> {
    const response = await apiClient.get<ApiResponse<GoalApiResponse[]>>('/goals')
    return response.data.data
  }

  static async getActiveGoals(): Promise<GoalApiResponse[]> {
    const response = await apiClient.get<ApiResponse<GoalApiResponse[]>>('/goals/active')
    return response.data.data
  }

  static async getGoal(id: number): Promise<GoalApiResponse> {
    const response = await apiClient.get<ApiResponse<GoalApiResponse>>(`/goals/${id}`)
    return response.data.data
  }

  static async createGoal(data: any): Promise<GoalApiResponse> {
    const response = await apiClient.post<ApiResponse<GoalApiResponse>>('/goals', data)
    return response.data.data
  }

  static async updateGoal(id: number, data: any): Promise<GoalApiResponse> {
    const response = await apiClient.put<ApiResponse<GoalApiResponse>>(`/goals/${id}`, data)
    return response.data.data
  }

  static async deleteGoal(id: number): Promise<void> {
    await apiClient.delete(`/goals/${id}`)
  }
}
