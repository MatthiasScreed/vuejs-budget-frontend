// src/services/api/transactionApi.ts

import axiosInstance from './axiosInstance'
import type {
  ApiResponse,
  PaginatedResponse,
  TransactionApiResponse,
  CreateTransactionRequest,
} from '@/types/api.types'

/**
 * API Transactions
 * École 42: Service séparé pour chaque ressource
 */
export class TransactionApi {
  /**
   * Récupère toutes les transactions (paginées)
   */
  static async getTransactions(
    page: number = 1,
    perPage: number = 15,
  ): Promise<PaginatedResponse<TransactionApiResponse>> {
    const response = await axiosInstance.get<PaginatedResponse<TransactionApiResponse>>(
      '/transactions',
      { params: { page, per_page: perPage } },
    )
    return response.data
  }

  /**
   * Récupère les transactions récentes
   */
  static async getRecentTransactions(limit: number = 10): Promise<TransactionApiResponse[]> {
    const response = await axiosInstance.get<ApiResponse<TransactionApiResponse[]>>(
      '/transactions/recent',
      { params: { limit } },
    )
    return response.data.data
  }

  /**
   * Récupère une transaction par ID
   */
  static async getTransaction(id: number): Promise<TransactionApiResponse> {
    const response = await axiosInstance.get<ApiResponse<TransactionApiResponse>>(
      `/transactions/${id}`,
    )
    return response.data.data
  }

  /**
   * Crée une nouvelle transaction
   */
  static async createTransaction(data: CreateTransactionRequest): Promise<TransactionApiResponse> {
    const response = await axiosInstance.post<ApiResponse<TransactionApiResponse>>(
      '/transactions',
      data,
    )
    return response.data.data
  }

  /**
   * Met à jour une transaction
   */
  static async updateTransaction(
    id: number,
    data: Partial<CreateTransactionRequest>,
  ): Promise<TransactionApiResponse> {
    const response = await axiosInstance.put<ApiResponse<TransactionApiResponse>>(
      `/transactions/${id}`,
      data,
    )
    return response.data.data
  }

  /**
   * Supprime une transaction
   */
  static async deleteTransaction(id: number): Promise<void> {
    await axiosInstance.delete(`/transactions/${id}`)
  }

  /**
   * Récupère les transactions par catégorie
   */
  static async getTransactionsByCategory(
    categoryId: number,
    page: number = 1,
  ): Promise<PaginatedResponse<TransactionApiResponse>> {
    const response = await axiosInstance.get<PaginatedResponse<TransactionApiResponse>>(
      `/transactions/category/${categoryId}`,
      { params: { page } },
    )
    return response.data
  }

  /**
   * Récupère les transactions par période
   */
  static async getTransactionsByPeriod(
    startDate: string,
    endDate: string,
  ): Promise<TransactionApiResponse[]> {
    const response = await axiosInstance.get<ApiResponse<TransactionApiResponse[]>>(
      '/transactions/period',
      { params: { start_date: startDate, end_date: endDate } },
    )
    return response.data.data
  }
}
