// ==========================================
// PROJECT SERVICE - STUB TEMPORAIRE
// ==========================================

import api from './api'
import type { ApiResponse } from '@/types/base'

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: string
  type: string
  default_target_amount?: number
  sub_categories?: string[]
}

export interface Project {
  id: number
  user_id: number
  name: string
  description?: string
  type: string
  target_amount: number
  current_amount: number
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export const projectService = {
  /**
   * Récupérer tous les templates de projets
   */
  async getTemplates(): Promise<ApiResponse<ProjectTemplate[]>> {
    try {
      const response = await api.get('/api/projects/templates')
      return response.data
    } catch (error: any) {
      console.error('Erreur getTemplates:', error)

      // Retourner des templates par défaut
      return {
        success: true,
        data: [
          {
            id: 'travel',
            name: 'Voyage',
            description: 'Planifier un voyage',
            icon: '✈️',
            type: 'travel',
            default_target_amount: 2000
          },
          {
            id: 'house',
            name: 'Achat immobilier',
            description: 'Épargner pour un bien immobilier',
            icon: '🏠',
            type: 'house',
            default_target_amount: 50000
          },
          {
            id: 'car',
            name: 'Achat véhicule',
            description: 'Acheter une voiture',
            icon: '🚗',
            type: 'car',
            default_target_amount: 15000
          },
          {
            id: 'emergency',
            name: 'Fonds d\'urgence',
            description: 'Constituer une épargne de précaution',
            icon: '🛡️',
            type: 'emergency',
            default_target_amount: 5000
          }
        ]
      }
    }
  },

  /**
   * Récupérer un template spécifique
   */
  async getTemplate(id: string): Promise<ApiResponse<ProjectTemplate>> {
    try {
      const response = await api.get(`/api/projects/templates/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Erreur getTemplate:', error)
      return {
        success: false,
        data: {} as ProjectTemplate,
        message: 'Template introuvable'
      }
    }
  },

  /**
   * Récupérer tous les projets de l'utilisateur
   */
  async getProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const response = await api.get('/api/projects')
      return response.data
    } catch (error: any) {
      console.error('Erreur getProjects:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors du chargement des projets'
      }
    }
  },

  /**
   * Créer un projet depuis un template
   */
  async createFromTemplate(templateId: string, data: any): Promise<ApiResponse<Project>> {
    try {
      const response = await api.post('/api/projects/from-template', { template_id: templateId, ...data })
      return response.data
    } catch (error: any) {
      console.error('Erreur createFromTemplate:', error)
      return {
        success: false,
        data: {} as Project,
        message: 'Erreur lors de la création du projet'
      }
    }
  },

  /**
   * Créer un projet personnalisé
   */
  async createProject(data: any): Promise<ApiResponse<Project>> {
    try {
      const response = await api.post('/api/projects', data)
      return response.data
    } catch (error: any) {
      console.error('Erreur createProject:', error)
      return {
        success: false,
        data: {} as Project,
        message: 'Erreur lors de la création du projet'
      }
    }
  },

  /**
   * Mettre à jour un projet
   */
  async updateProject(id: number, data: any): Promise<ApiResponse<Project>> {
    try {
      const response = await api.put(`/api/projects/${id}`, data)
      return response.data
    } catch (error: any) {
      console.error('Erreur updateProject:', error)
      return {
        success: false,
        data: {} as Project,
        message: 'Erreur lors de la mise à jour du projet'
      }
    }
  },

  /**
   * Supprimer un projet
   */
  async deleteProject(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/api/projects/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Erreur deleteProject:', error)
      return {
        success: false,
        data: undefined,
        message: 'Erreur lors de la suppression du projet'
      }
    }
  }
}
