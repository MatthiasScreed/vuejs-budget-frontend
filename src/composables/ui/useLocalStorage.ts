import { ref, watch, Ref } from 'vue'

interface StorageOptions {
  serializer?: {
    read: (value: string) => any
    write: (value: any) => string
  }
  syncAcrossTabs?: boolean
  onError?: (error: Error) => void
}

/**
 * Composable pour localStorage réactif et sécurisé
 * Synchronisation onglets, sérialisation, gestion erreurs
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: StorageOptions = {}
): [Ref<T>, (value: T) => void, () => void] {

  const opts: Required<StorageOptions> = {
    serializer: {
      read: JSON.parse,
      write: JSON.stringify
    },
    syncAcrossTabs: true,
    onError: (error: Error) => console.error('LocalStorage error:', error),
    ...options
  }

  // State réactif
  const storedValue = ref<T>(defaultValue)

  /**
   * Lire depuis localStorage
   */
  function readFromStorage(): T {
    if (!isStorageAvailable()) {
      return defaultValue
    }

    try {
      const item = window.localStorage.getItem(key)

      if (item === null) {
        return defaultValue
      }

      return opts.serializer.read(item)
    } catch (error) {
      opts.onError(error as Error)
      return defaultValue
    }
  }

  /**
   * Écrire dans localStorage
   */
  function writeToStorage(value: T): void {
    if (!isStorageAvailable()) {
      return
    }

    try {
      const serializedValue = opts.serializer.write(value)
      window.localStorage.setItem(key, serializedValue)
    } catch (error) {
      opts.onError(error as Error)
    }
  }

  /**
   * Supprimer du localStorage
   */
  function removeFromStorage(): void {
    if (!isStorageAvailable()) {
      return
    }

    try {
      window.localStorage.removeItem(key)
      storedValue.value = defaultValue
    } catch (error) {
      opts.onError(error as Error)
    }
  }

  /**
   * Vérifier disponibilité localStorage
   */
  function isStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window
    } catch {
      return false
    }
  }

  /**
   * Initialiser la valeur
   */
  function initializeValue(): void {
    const initialValue = readFromStorage()
    storedValue.value = initialValue
  }

  /**
   * Gestionnaire changements cross-tab
   */
  function handleStorageChange(event: StorageEvent): void {
    if (event.key === key && event.newValue !== null) {
      try {
        const newValue = opts.serializer.read(event.newValue)
        storedValue.value = newValue
      } catch (error) {
        opts.onError(error as Error)
      }
    }
  }

  // Initialisation
  initializeValue()

  // Watcher pour changements locaux
  watch(
    storedValue,
    (newValue) => {
      writeToStorage(newValue)
    },
    { deep: true }
  )

  // Sync cross-tab si activé
  if (opts.syncAcrossTabs && isStorageAvailable()) {
    window.addEventListener('storage', handleStorageChange)
  }

  return [
    storedValue,
    (value: T) => { storedValue.value = value },
    removeFromStorage
  ]
}

/**
 * Hook spécialisé pour objets complexes
 */
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  defaultValue: T
) {
  const [state, setState, remove] = useLocalStorage(key, defaultValue)

  /**
   * Mettre à jour partiellement
   */
  function updatePartial(updates: Partial<T>): void {
    setState({
      ...state.value,
      ...updates
    })
  }

  /**
   * Mettre à jour une propriété
   */
  function updateProperty<K extends keyof T>(property: K, value: T[K]): void {
    setState({
      ...state.value,
      [property]: value
    })
  }

  return {
    state,
    setState,
    updatePartial,
    updateProperty,
    remove
  }
}

/**
 * Hook pour arrays avec méthodes utiles
 */
export function useLocalStorageArray<T>(
  key: string,
  defaultValue: T[] = []
) {
  const [items, setItems, remove] = useLocalStorage(key, defaultValue)

  /**
   * Ajouter un élément
   */
  function push(item: T): void {
    setItems([...items.value, item])
  }

  /**
   * Supprimer un élément par index
   */
  function removeAt(index: number): void {
    const newItems = [...items.value]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  /**
   * Supprimer par condition
   */
  function removeWhere(predicate: (item: T) => boolean): void {
    const newItems = items.value.filter(item => !predicate(item))
    setItems(newItems)
  }

  /**
   * Vider le tableau
   */
  function clear(): void {
    setItems([])
  }

  return {
    items,
    setItems,
    push,
    removeAt,
    removeWhere,
    clear,
    remove
  }
}

/**
 * Hook pour cache avec expiration
 */
export function useLocalStorageCache<T>(
  key: string,
  ttl: number = 60 * 60 * 1000 // 1 heure par défaut
) {
  interface CacheEntry {
    data: T
    timestamp: number
  }

  const cacheKey = `cache_${key}`

  /**
   * Obtenir depuis cache
   */
  function get(): T | null {
    try {
      const cached = window.localStorage.getItem(cacheKey)

      if (!cached) return null

      const entry: CacheEntry = JSON.parse(cached)
      const now = Date.now()

      if (now - entry.timestamp > ttl) {
        remove()
        return null
      }

      return entry.data
    } catch {
      return null
    }
  }

  /**
   * Sauvegarder en cache
   */
  function set(data: T): void {
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now()
      }

      window.localStorage.setItem(cacheKey, JSON.stringify(entry))
    } catch (error) {
      console.error('Cache storage error:', error)
    }
  }

  /**
   * Supprimer du cache
   */
  function remove(): void {
    try {
      window.localStorage.removeItem(cacheKey)
    } catch (error) {
      console.error('Cache removal error:', error)
    }
  }

  /**
   * Vérifier si en cache et valide
   */
  function has(): boolean {
    return get() !== null
  }

  return {
    get,
    set,
    remove,
    has
  }
}
