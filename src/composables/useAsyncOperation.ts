// src/composables/useAsyncOperation.ts
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

/**
 * Interface pour les options d'opération async
 */
interface AsyncOperationOptions {
  loadingMessage?: string
  successMessage?: string | ((result: any) => string)
  errorMessage?: string | ((error: any) => string)
  showToast?: boolean
  showErrorToast?: boolean
  showSuccessToast?: boolean
  enableRetry?: boolean
  retryDelay?: number
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
  onFinally?: () => void
}

/**
 * Composable pour gérer les opérations asynchrones
 * avec gestion d'erreurs, loading states et toasts automatiques
 *
 * @example
 * const { loading, error, execute } = useAsyncOperation()
 *
 * await execute(
 *   () => api.createGoal(data),
 *   {
 *     loadingMessage: '💾 Création...',
 *     successMessage: (result) => `✅ ${result.name} créé !`,
 *     errorMessage: 'Erreur création',
 *     enableRetry: true
 *   }
 * )
 */
export function useAsyncOperation() {
  const toast = useToast()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastOperation = ref<(() => Promise<any>) | null>(null)
  const lastOptions = ref<AsyncOperationOptions | null>(null)

  /**
   * Exécute une opération async avec gestion complète
   */
  async function execute<T>(
    operation: () => Promise<T>,
    options: AsyncOperationOptions = {},
  ): Promise<T | null> {
    // Sauvegarder pour retry
    lastOperation.value = operation
    lastOptions.value = options

    loading.value = true
    error.value = null

    // Toast de chargement
    if (options.loadingMessage && options.showToast !== false) {
      toast.info(options.loadingMessage, {
        timeout: 3000,
        icon: '⏳',
      })
    }

    try {
      const result = await operation()

      // Toast de succès
      if (options.showSuccessToast !== false && options.showToast !== false) {
        const message =
          typeof options.successMessage === 'function'
            ? options.successMessage(result)
            : options.successMessage || '✅ Opération réussie'

        toast.success(message, {
          timeout: 3000,
          icon: '✅',
        })
      }

      // Callback de succès
      options.onSuccess?.(result)

      return result
    } catch (err: any) {
      console.error('❌ [AsyncOperation] Erreur:', err)

      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue'

      error.value = errorMessage

      // Toast d'erreur avec retry si demandé
      if (options.showErrorToast !== false && options.showToast !== false) {
        const message =
          typeof options.errorMessage === 'function'
            ? options.errorMessage(err)
            : options.errorMessage || errorMessage

        // Cas spécial: pas de connexion
        if (!navigator.onLine) {
          toast.error('❌ Pas de connexion Internet', {
            timeout: 0,
            icon: '📡',
            action: options.enableRetry
              ? {
                  text: 'Réessayer',
                  onClick: () => retry(),
                }
              : undefined,
          })
        }
        // Erreur avec retry possible
        else if (options.enableRetry) {
          toast.error(message, {
            timeout: 8000,
            icon: '❌',
            action: {
              text: 'Réessayer',
              onClick: () => retry(),
            },
          })
        }
        // Erreur simple
        else {
          toast.error(message, {
            timeout: 5000,
            icon: '❌',
          })
        }
      }

      // Callback d'erreur
      options.onError?.(err)

      return null
    } finally {
      loading.value = false
      options.onFinally?.()
    }
  }

  /**
   * Retry de la dernière opération
   */
  async function retry() {
    if (!lastOperation.value) {
      console.warn('⚠️ Aucune opération à réessayer')
      return null
    }

    // Délai avant retry si configuré
    if (lastOptions.value?.retryDelay) {
      await new Promise((resolve) => setTimeout(resolve, lastOptions.value!.retryDelay))
    }

    return execute(lastOperation.value, lastOptions.value || {})
  }

  /**
   * Reset de l'état
   */
  function reset() {
    loading.value = false
    error.value = null
    lastOperation.value = null
    lastOptions.value = null
  }

  return {
    loading,
    error,
    execute,
    retry,
    reset,
  }
}

/**
 * Composable spécialisé pour les opérations CRUD
 */
export function useCrudOperation() {
  const { loading, error, execute } = useAsyncOperation()

  async function create<T>(operation: () => Promise<T>, entityName: string) {
    return execute(operation, {
      loadingMessage: `💾 Création de ${entityName}...`,
      successMessage: (result: any) => `✅ ${entityName} "${result.name || 'créé'}" avec succès !`,
      errorMessage: `Erreur lors de la création de ${entityName}`,
      enableRetry: true,
    })
  }

  async function update<T>(operation: () => Promise<T>, entityName: string) {
    return execute(operation, {
      loadingMessage: `✏️ Modification de ${entityName}...`,
      successMessage: (result: any) =>
        `✅ ${entityName} "${result.name || 'modifié'}" avec succès !`,
      errorMessage: `Erreur lors de la modification de ${entityName}`,
      enableRetry: true,
    })
  }

  async function remove<T>(operation: () => Promise<T>, entityName: string, itemName?: string) {
    return execute(operation, {
      loadingMessage: `🗑️ Suppression de ${entityName}...`,
      successMessage: itemName
        ? `✅ ${entityName} "${itemName}" supprimé`
        : `✅ ${entityName} supprimé`,
      errorMessage: `Erreur lors de la suppression de ${entityName}`,
      enableRetry: true,
    })
  }

  async function fetch<T>(operation: () => Promise<T>, entityName: string) {
    return execute(operation, {
      loadingMessage: `📡 Chargement de ${entityName}...`,
      successMessage: false, // Pas de toast success pour fetch
      errorMessage: `Erreur lors du chargement de ${entityName}`,
      enableRetry: true,
    })
  }

  return {
    loading,
    error,
    create,
    update,
    remove,
    fetch,
    execute,
  }
}
