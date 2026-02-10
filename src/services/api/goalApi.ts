// src/services/api/goalApi.ts

import axiosInstance from './axiosInstance'
import type { ApiResponse, GoalApiResponse } from '@/types/api.types'

/**
 * API Goals
 * École 42: CRUD complet pour les objectifs
 */
export class GoalApi {
  /**
   * Récupère tous les objectifs
   */
  static async getGoals(): Promise<GoalApiResponse[]> {
    const response = await axiosInstance.get<ApiResponse<GoalApiResponse[]>>('/goals')
    return response.data.data
  }

  /**
   * Récupère les objectifs actifs
   */
  static async getActiveGoals(): Promise<GoalApiResponse[]> {
    const response = await axiosInstance.get<ApiResponse<GoalApiResponse[]>>('/goals/active')
    return response.data.data
  }

  /**
   * Récupère un objectif par ID
   */
  static async getGoal(id: number): Promise<GoalApiResponse> {
    const response = await axiosInstance.get<ApiResponse<GoalApiResponse>>(`/goals/${id}`)
    return response.data.data
  }

  /**
   * Crée un nouvel objectif
   */
  static async createGoal(data: any): Promise<GoalApiResponse> {
    const response = await axiosInstance.post<ApiResponse<GoalApiResponse>>('/goals', data)
    return response.data.data
  }

  /**
   * Met à jour un objectif
   */
  static async updateGoal(id: number, data: any): Promise<GoalApiResponse> {
    const response = await axiosInstance.put<ApiResponse<GoalApiResponse>>(`/goals/${id}`, data)
    return response.data.data
  }

  /**
   * Supprime un objectif
   */
  static async deleteGoal(id: number): Promise<void> {
    await axiosInstance.delete(`/goals/${id}`)
  }
}
