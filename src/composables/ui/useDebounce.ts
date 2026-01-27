import { ref, watch, onUnmounted } from 'vue'

interface DebounceOptions {
  delay: number
  immediate?: boolean
  maxWait?: number
}

/**
 * Composable pour optimisation performance avec debounce/throttle
 * Recherche, validation, API calls optimisés
 */
export function useDebounce() {
  const timers = ref<Map<string, NodeJS.Timeout>>(new Map())

  /**
   * Debounce une fonction avec délai
   */
  function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number,
    immediate: boolean = false
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null
    let lastCallTime = 0

    return (...args: Parameters<T>) => {
      const now = Date.now()
      const callNow = immediate && !timeoutId

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        timeoutId = null
        if (!immediate) {
          fn.apply(null, args)
        }
      }, delay)

      if (callNow) {
        fn.apply(null, args)
      }

      lastCallTime = now
    }
  }

  /**
   * Throttle une fonction (limite la fréquence)
   */
  function throttle<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCallTime = 0
    let timeoutId: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastCallTime >= delay) {
        lastCallTime = now
        fn.apply(null, args)
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastCallTime = Date.now()
          timeoutId = null
          fn.apply(null, args)
        }, delay - (now - lastCallTime))
      }
    }
  }

  /**
   * Debounce une ref reactive
   */
  function debouncedRef<T>(
    initialValue: T,
    delay: number = 300,
    options: Partial<DebounceOptions> = {}
  ) {
    const immediate = ref(initialValue)
    const debounced = ref(initialValue)

    const opts: DebounceOptions = {
      delay,
      immediate: false,
      ...options
    }

    let timeoutId: NodeJS.Timeout | null = null
    let lastCallTime = 0

    watch(immediate, (newValue) => {
      const now = Date.now()
      const callNow = opts.immediate && !timeoutId

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // MaxWait logic
      if (opts.maxWait && (now - lastCallTime) >= opts.maxWait) {
        debounced.value = newValue
        lastCallTime = now
        return
      }

      timeoutId = setTimeout(() => {
        debounced.value = newValue
        timeoutId = null
        lastCallTime = Date.now()
      }, opts.delay)

      if (callNow) {
        debounced.value = newValue
        lastCallTime = now
      }
    })

    return { immediate, debounced }
  }

  /**
   * Debounce spécialisé pour recherche
   */
  function useSearch(
    initialValue: string = '',
    searchFn: (query: string) => Promise<any>,
    delay: number = 300
  ) {
    const query = ref(initialValue)
    const results = ref<any[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const debouncedSearch = debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        results.value = []
        loading.value = false
        return
      }

      loading.value = true
      error.value = null

      try {
        const data = await searchFn(searchQuery)
        results.value = data
      } catch (err: any) {
        error.value = err.message
        results.value = []
      } finally {
        loading.value = false
      }
    }, delay)

    watch(query, (newQuery) => {
      debouncedSearch(newQuery)
    })

    return {
      query,
      results,
      loading,
      error
    }
  }

  /**
   * Debounce pour validation de formulaire
   */
  function useValidationDebounce(
    value: any,
    validator: (val: any) => Promise<string | null>,
    delay: number = 500
  ) {
    const isValidating = ref(false)
    const error = ref<string | null>(null)
    const isValid = ref(true)

    const debouncedValidate = debounce(async (val: any) => {
      isValidating.value = true
      error.value = null

      try {
        const result = await validator(val)
        error.value = result
        isValid.value = result === null
      } catch (err: any) {
        error.value = err.message
        isValid.value = false
      } finally {
        isValidating.value = false
      }
    }, delay)

    watch(() => value, (newValue) => {
      debouncedValidate(newValue)
    }, { immediate: true })

    return {
      isValidating,
      error,
      isValid
    }
  }

  /**
   * Auto-save avec debounce
   */
  function useAutoSave<T>(
    data: T,
    saveFn: (data: T) => Promise<void>,
    delay: number = 2000
  ) {
    const saving = ref(false)
    const lastSaved = ref<Date | null>(null)
    const hasChanges = ref(false)

    const debouncedSave = debounce(async (dataToSave: T) => {
      saving.value = true

      try {
        await saveFn(dataToSave)
        lastSaved.value = new Date()
        hasChanges.value = false
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        saving.value = false
      }
    }, delay)

    watch(
      () => data,
      (newData) => {
        hasChanges.value = true
        debouncedSave(newData)
      },
      { deep: true }
    )

    return {
      saving,
      lastSaved,
      hasChanges
    }
  }

  /**
   * Scroll debounce pour infinite loading
   */
  function useScrollDebounce(
    callback: () => void,
    delay: number = 100,
    threshold: number = 100
  ) {
    const debouncedCallback = debounce(callback, delay)

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.offsetHeight

      if (scrollTop + windowHeight >= docHeight - threshold) {
        debouncedCallback()
      }
    }

    return {
      handleScroll,
      attachScrollListener: () => window.addEventListener('scroll', handleScroll),
      detachScrollListener: () => window.removeEventListener('scroll', handleScroll)
    }
  }

  /**
   * Nettoyer tous les timers
   */
  function cleanup(): void {
    timers.value.forEach(timer => clearTimeout(timer))
    timers.value.clear()
  }

  // Nettoyage automatique au démontage
  onUnmounted(() => {
    cleanup()
  })

  return {
    // Core functions
    debounce,
    throttle,
    debouncedRef,

    // Specialized hooks
    useSearch,
    useValidationDebounce,
    useAutoSave,
    useScrollDebounce,

    // Utils
    cleanup
  }
}
