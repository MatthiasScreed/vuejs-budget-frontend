import { ref, computed } from 'vue'
import { useErrorHandler } from '@/composables/core'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  executed: boolean
}

interface AsyncOptions {
  immediate?: boolean
  resetOnExecute?: boolean
  throwOnError?: boolean
  timeout?: number
}

/**
 * Composable pour gestion états asynchrones
 * Loading, erreurs, retry, timeout, concurrent calls
 */
export function useAsync<T = any, P extends any[] = any[]>(
  asyncFn: (...args: P) => Promise<T>,
  options: AsyncOptions = {}
) {
  const { handleApiError } = useErrorHandler()

  // State
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const executed = ref(false)

  // Options par défaut
  const opts: Required<AsyncOptions> = {
    immediate: false,
    resetOnExecute: true,
    throwOnError: false,
    timeout: 30000, // 30 secondes
    ...options
  }

  // Contrôle concurrent
  let currentPromise: Promise<T> | null = null
  let abortController: AbortController | null = null

  /**
   * Exécuter la fonction asynchrone
   */
  async function execute(...args: P): Promise<T | null> {
    // Annuler l'appel précédent si en cours
    if (abortController) {
      abortController.abort()
    }

    // Réinitialiser état si nécessaire
    if (opts.resetOnExecute) {
      error.value = null
    }

    loading.value = true
    abortController = new AbortController()

    // Créer promesse avec timeout
    const timeoutPromise = createTimeoutPromise(opts.timeout)
    const asyncPromise = asyncFn(...args)

    currentPromise = Promise.race([asyncPromise, timeoutPromise])

    try {
      const result = await currentPromise

      // Vérifier si pas annulé
      if (!abortController.signal.aborted) {
        data.value = result as T
        executed.value = true
        return result
      }

      return null
    } catch (err: any) {
      if (!abortController.signal.aborted) {
        error.value = err.message
        await handleApiError(err, 'useAsync')

        if (opts.throwOnError) {
          throw err
        }
      }

      return null
    } finally {
      if (!abortController.signal.aborted) {
        loading.value = false
      }
      currentPromise = null
    }
  }

  /**
   * Retry avec backoff exponentiel
   */
  async function retry(maxAttempts: number = 3, baseDelay: number = 1000): Promise<T | null> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await execute()
      } catch (err) {
        if (attempt === maxAttempts) {
          throw err
        }

        // Délai exponentiel
        const delay = baseDelay * Math.pow(2, attempt - 1)
        await sleep(delay)
      }
    }

    return null
  }

  /**
   * Annuler l'exécution en cours
   */
  function cancel(): void {
    if (abortController) {
      abortController.abort()
      loading.value = false
    }
  }

  /**
   * Réinitialiser l'état
   */
  function reset(): void {
    data.value = null
    error.value = null
    loading.value = false
    executed.value = false
    cancel()
  }

  /**
   * Créer promesse avec timeout
   */
  function createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout après ${timeout}ms`)), timeout)
    })
  }

  /**
   * Utilitaire sleep
   */
  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Computed properties
  const isIdle = computed(() => !loading.value && !executed.value)
  const isLoading = computed(() => loading.value)
  const isSuccess = computed(() => executed.value && !error.value)
  const isError = computed(() => Boolean(error.value))

  return {
    // State
    data,
    loading,
    error,
    executed,

    // Computed
    isIdle,
    isLoading,
    isSuccess,
    isError,

    // Methods
    execute,
    retry,
    cancel,
    reset
  }
}

/**
 * Hook spécialisé pour listes avec pagination
 */
export function useAsyncList<T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[], total: number }>,
  limit: number = 20
) {
  const items = ref<T[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const hasMore = ref(true)

  const { execute: fetchPage, loading, error } = useAsync(
    async (page: number, itemsPerPage: number) => {
      const response = await fetchFn(page, itemsPerPage)
      return response
    }
  )

  /**
   * Charger première page
   */
  async function loadFirst(): Promise<void> {
    const response = await fetchPage(1, limit)

    if (response) {
      items.value = response.data
      total.value = response.total
      currentPage.value = 1
      hasMore.value = response.data.length === limit
    }
  }

  /**
   * Charger page suivante (infinite scroll)
   */
  async function loadMore(): Promise<void> {
    if (!hasMore.value || loading.value) return

    const nextPage = currentPage.value + 1
    const response = await fetchPage(nextPage, limit)

    if (response) {
      items.value.push(...response.data)
      currentPage.value = nextPage
      hasMore.value = response.data.length === limit
    }
  }

  /**
   * Recharger depuis le début
   */
  async function refresh(): Promise<void> {
    await loadFirst()
  }

  return {
    // State
    items,
    total,
    currentPage,
    hasMore,
    loading,
    error,

    // Methods
    loadFirst,
    loadMore,
    refresh
  }
}

/**
 * Hook pour données avec cache local
 */
export function useAsyncCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes
) {
  const cacheKey = `async_cache_${key}`

  const { data, loading, error, execute } = useAsync(fetchFn)

  /**
   * Charger depuis cache ou API
   */
  async function load(): Promise<void> {
    const cached = getCachedData()

    if (cached && !isCacheExpired(cached.timestamp, ttl)) {
      data.value = cached.data
      return
    }

    await execute()

    if (data.value) {
      setCachedData(data.value)
    }
  }

  /**
   * Forcer rechargement
   */
  async function refresh(): Promise<void> {
    clearCache()
    await execute()

    if (data.value) {
      setCachedData(data.value)
    }
  }

  /**
   * Obtenir données en cache
   */
  function getCachedData(): { data: T; timestamp: number } | null {
    try {
      const cached = localStorage.getItem(cacheKey)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }

  /**
   * Sauvegarder en cache
   */
  function setCachedData(value: T): void {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: value,
        timestamp: Date.now()
      }))
    } catch {
      // Ignore erreurs localStorage
    }
  }

  /**
   * Vérifier expiration cache
   */
  function isCacheExpired(timestamp: number, cacheTTL: number): boolean {
    return Date.now() - timestamp > cacheTTL
  }

  /**
   * Nettoyer cache
   */
  function clearCache(): void {
    localStorage.removeItem(cacheKey)
  }

  return {
    // State
    data,
    loading,
    error,

    // Methods
    load,
    refresh,
    clearCache
  }
}
