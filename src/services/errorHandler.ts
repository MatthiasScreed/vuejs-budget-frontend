// src/services/errorHandler.ts

import { AxiosError } from 'axios'

/**
 * Gestionnaire d'erreurs global
 * École 42: Gestion centralisée des erreurs
 */
export class ErrorHandler {
  /**
   * Extrait un message d'erreur lisible
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      // Erreur de validation Laravel (422)
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors
        if (errors) {
          const firstError = Object.values(errors)[0]
          return Array.isArray(firstError) ? firstError[0] : 'Erreur de validation'
        }
      }

      // Erreur avec message du serveur
      if (error.response?.data?.message) {
        return error.response.data.message
      }

      // Erreurs HTTP standards
      if (error.response?.status === 404) {
        return 'Ressource non trouvée'
      }
      if (error.response?.status === 401) {
        return 'Non authentifié'
      }
      if (error.response?.status === 403) {
        return 'Accès refusé'
      }
      if (error.response?.status === 500) {
        return 'Erreur serveur'
      }

      // Erreur réseau
      if (error.code === 'ERR_NETWORK') {
        return 'Problème de connexion réseau'
      }

      // Timeout
      if (error.code === 'ECONNABORTED') {
        return 'La requête a expiré'
      }
    }

    // Erreur générique
    if (error instanceof Error) {
      return error.message
    }

    return 'Une erreur est survenue'
  }

  /**
   * Log une erreur en console
   */
  static logError(context: string, error: unknown): void {
    console.error(`[${context}]`, error)

    if (error instanceof AxiosError) {
      console.error('Request:', error.config?.url)
      console.error('Response:', error.response?.data)
    }
  }
}
