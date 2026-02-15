// src/services/dashboardService.ts
import api from './api'
import type {
  DashboardStats,
  SavingsCapacityData,
  DistributionData
} from '@/stores/dashboardStore'
import type { ApiResponse } from '@/types/base'

/**
 * Service Dashboard - Aligné avec DashboardController
 */
class DashboardService {

  /**
   * Récupérer les statistiques du dashboard
   */
  async getStats(refresh: boolean = false): Promise<ApiResponse<DashboardStats>> {
    try {
      return await api.get<DashboardStats>('/dashboard/stats', {
        params: { refresh: refresh ? 'true' : 'false' }
      })
    } catch (error: any) {
      console.error('❌ Erreur getStats:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Erreur lors du chargement des statistiques'
      }
    }
  }

  /**
   * Récupérer la capacité d'épargne détaillée
   */
  async getSavingsCapacity(): Promise<ApiResponse<SavingsCapacityData>> {
    try {
      return await api.get<SavingsCapacityData>('/dashboard/savings-capacity')
    } catch (error: any) {
      console.error('❌ Erreur getSavingsCapacity:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Erreur lors du chargement de la capacité d\'épargne'
      }
    }
  }

  /**
   * Récupérer la distribution aux objectifs
   */
  async getGoalDistribution(): Promise<ApiResponse<DistributionData>> {
    try {
      return await api.get<DistributionData>('/dashboard/goal-distribution')
    } catch (error: any) {
      console.error('❌ Erreur getGoalDistribution:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Erreur lors du chargement de la distribution'
      }
    }
  }

  /**
   * Rafraîchir toutes les données du dashboard
   */
  async refresh(): Promise<ApiResponse<DashboardStats>> {
    try {
      return await api.post<DashboardStats>('/dashboard/refresh')
    } catch (error: any) {
      console.error('❌ Erreur refresh:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Erreur lors du rafraîchissement'
      }
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Formater un montant
   */
  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  /**
   * Formater un pourcentage
   */
  formatPercent(value: number, decimals: number = 1): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
  }

  /**
   * Obtenir la couleur d'une tendance
   */
  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    const colors = {
      up: '#10b981',
      down: '#ef4444',
      stable: '#5b6270'
    }
    return colors[trend]
  }

  /**
   * Obtenir l'icône d'une tendance
   */
  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    const icons = {
      up: '↗️',
      down: '↘️',
      stable: '→'
    }
    return icons[trend]
  }

  /**
   * Formater une date relative
   */
  formatRelativeDate(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Aujourd\'hui'
    if (diffInDays === 1) return 'Demain'
    if (diffInDays === -1) return 'Hier'
    if (diffInDays > 0) return `Dans ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
    return `Il y a ${Math.abs(diffInDays)} jour${Math.abs(diffInDays) > 1 ? 's' : ''}`
  }
}

// Singleton
export const dashboardService = new DashboardService()
export default dashboardService
