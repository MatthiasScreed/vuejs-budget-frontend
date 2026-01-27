// ==========================================
// NOTIFICATION SERVICE - CONNECTÉ AU BACKEND RÉEL
// ==========================================

import api from './api'
import type { ApiResponse } from '@/types/base'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface CreateNotificationData {
  type: string
  title: string
  message: string
  priority?: string
}

export const notificationService = {
  /**
   * Récupérer les notifications
   * ✅ Utilise la vraie route Laravel : /api/engagement/notifications
   */
  async getNotifications(params?: { limit?: number }): Promise<ApiResponse<Notification[]>> {
    try {
      const response = await api.get('/engagement/notifications', { params })
      return response.data
    } catch (error: any) {
      console.error('Erreur getNotifications:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors du chargement des notifications'
      }
    }
  },

  /**
   * Créer une notification (pas d'endpoint pour ça, géré côté backend)
   */
  async createNotification(data: CreateNotificationData): Promise<ApiResponse<Notification>> {
    console.warn('createNotification: Pas d\'endpoint disponible')
    return {
      success: false,
      data: {} as Notification,
      message: 'Création manuelle de notifications non supportée'
    }
  },

  /**
   * Marquer comme lue
   * ✅ Utilise la vraie route Laravel : PUT /api/engagement/notifications/{id}/read
   */
  async markAsRead(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.put(`/engagement/notifications/${id}/read`)
      return response.data
    } catch (error: any) {
      console.error('Erreur markAsRead:', error)
      return {
        success: false,
        data: undefined,
        message: 'Erreur lors du marquage'
      }
    }
  },

  /**
   * Supprimer une notification (dismiss)
   * ✅ Utilise la vraie route Laravel : POST /api/engagement/notifications/{id}/dismiss
   */
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post(`/engagement/notifications/${id}/dismiss`)
      return response.data
    } catch (error: any) {
      console.error('Erreur deleteNotification:', error)
      return {
        success: false,
        data: undefined,
        message: 'Erreur lors de la suppression'
      }
    }
  }
}
