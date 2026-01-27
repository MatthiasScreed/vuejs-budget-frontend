// src/services/categoryService.ts
import { useApi } from '@/composables/core/useApi'
import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData
} from '@/types/entities/category'
import type { ApiResponse, PaginationMeta } from '@/types/base'

interface CategoryListResponse extends ApiResponse<Category[]> {
  meta?: PaginationMeta
}

interface CategoryResponse extends ApiResponse<Category> {}

/**
 * Service de gestion des catégories
 * Interactions avec l'API Laravel pour les catégories
 */
export const categoryService = {
  /**
   * Récupérer toutes les catégories
   */
  async getCategories(): Promise<CategoryListResponse> {
    try {
      const api = useApi()
      const response = await api.get<CategoryListResponse>('/categories')
      return response
    } catch (error: any) {
      console.error('Erreur getCategories:', error)
      throw new Error(error.message || 'Erreur lors du chargement des catégories')
    }
  },

  /**
   * Récupérer les templates de catégories
   */
  async getTemplates(): Promise<CategoryListResponse> {
    try {
      const api = useApi()
      const response = await api.get<CategoryListResponse>('/categories/templates')
      return response
    } catch (error: any) {
      console.error('Erreur getTemplates:', error)
      throw new Error(error.message || 'Erreur lors du chargement des templates')
    }
  },

  /**
   * Récupérer une catégorie par ID
   */
  async getCategory(id: string): Promise<CategoryResponse> {
    try {
      const api = useApi()
      const response = await api.get<CategoryResponse>(`/categories/${id}`)
      return response
    } catch (error: any) {
      console.error('Erreur getCategory:', error)
      throw new Error(error.message || 'Erreur lors du chargement de la catégorie')
    }
  },

  /**
   * Créer une nouvelle catégorie
   */
  async createCategory(data: CreateCategoryData): Promise<CategoryResponse> {
    try {
      const api = useApi()
      const response = await api.post<CategoryResponse>('/categories', data)
      return response
    } catch (error: any) {
      console.error('Erreur createCategory:', error)

      if (error.response?.status === 422) {
        throw {
          message: 'Erreur de validation',
          response: error.response
        }
      }

      throw new Error(error.message || 'Erreur lors de la création de la catégorie')
    }
  },

  /**
   * Mettre à jour une catégorie
   */
  async updateCategory(id: string, data: UpdateCategoryData): Promise<CategoryResponse> {
    try {
      const api = useApi()
      const response = await api.put<CategoryResponse>(`/categories/${id}`, data)
      return response
    } catch (error: any) {
      console.error('Erreur updateCategory:', error)

      if (error.response?.status === 422) {
        throw {
          message: 'Erreur de validation',
          response: error.response
        }
      }

      throw new Error(error.message || 'Erreur lors de la mise à jour de la catégorie')
    }
  },

  /**
   * Supprimer une catégorie
   */
  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    try {
      const api = useApi()
      const response = await api.del<ApiResponse<null>>(`/categories/${id}`)
      return response
    } catch (error: any) {
      console.error('Erreur deleteCategory:', error)
      throw new Error(error.message || 'Erreur lors de la suppression de la catégorie')
    }
  },

  /**
   * Créer une catégorie depuis un template
   */
  async createFromTemplate(templateId: string, customizations: Partial<CreateCategoryData> = {}): Promise<CategoryResponse> {
    try {
      const api = useApi()
      const response = await api.post<CategoryResponse>(`/categories/from-template/${templateId}`, customizations)
      return response
    } catch (error: any) {
      console.error('Erreur createFromTemplate:', error)
      throw new Error(error.message || 'Erreur lors de la création depuis le template')
    }
  },

  /**
   * Récupérer les statistiques d'une catégorie
   */
  async getCategoryStats(id: string, period: string = 'month'): Promise<ApiResponse<any>> {
    try {
      const api = useApi()
      const response = await api.get<ApiResponse<any>>(`/categories/${id}/stats`, {
        params: { period }
      })
      return response
    } catch (error: any) {
      console.error('Erreur getCategoryStats:', error)
      throw new Error(error.message || 'Erreur lors du chargement des statistiques')
    }
  },

  /**
   * Récupérer les catégories populaires
   */
  async getPopularCategories(limit: number = 10): Promise<CategoryListResponse> {
    try {
      const api = useApi()
      const response = await api.get<CategoryListResponse>('/categories/popular', {
        params: { limit }
      })
      return response
    } catch (error: any) {
      console.error('Erreur getPopularCategories:', error)
      throw new Error(error.message || 'Erreur lors du chargement des catégories populaires')
    }
  },

  /**
   * Rechercher des catégories
   */
  async searchCategories(query: string, filters: any = {}): Promise<CategoryListResponse> {
    try {
      const api = useApi()
      const response = await api.get<CategoryListResponse>('/categories/search', {
        params: { q: query, ...filters }
      })
      return response
    } catch (error: any) {
      console.error('Erreur searchCategories:', error)
      throw new Error(error.message || 'Erreur lors de la recherche de catégories')
    }
  }
}
