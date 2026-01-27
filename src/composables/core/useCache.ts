// src/composables/core/useCache.ts
import { ref, reactive } from 'vue'

interface CacheEntry<T = any> {
  key: string
  data: T
  timestamp: number
  expiry: number
  tags: string[]
  hits: number
  size: number
}

interface CacheStats {
  total_entries: number
  total_size: number
  hit_rate: number
  miss_rate: number
  cleanup_count: number
}

/**
 * Composable pour cache intelligent côté client
 * Gestion TTL, tags, invalidation et statistiques
 */
export function useCache() {
  const cache = reactive(new Map<string, CacheEntry>())
  const stats = reactive<CacheStats>({
    total_entries: 0,
    total_size: 0,
    hit_rate: 0,
    miss_rate: 0,
    cleanup_count: 0
  })

  let hitCount = 0
  let missCount = 0

  /**
   * Récupérer ou exécuter une fonction avec mise en cache
   */
  async function remember<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000, // 5 minutes par défaut
    tags: string[] = []
  ): Promise<T> {
    const entry = cache.get(key)

    // Cache hit valide
    if (entry && Date.now() < entry.expiry) {
      entry.hits++
      hitCount++
      updateStats()
      return entry.data as T
    }

    // Cache miss - exécuter la fonction
    missCount++
    try {
      const data = await fn()
      set(key, data, ttl, tags)
      updateStats()
      return data
    } catch (error) {
      updateStats()
      throw error
    }
  }

  /**
   * Stocker une valeur dans le cache
   */
  function set<T>(
    key: string,
    data: T,
    ttl: number = 5 * 60 * 1000,
    tags: string[] = []
  ): void {
    const now = Date.now()
    const size = calculateSize(data)

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: now,
      expiry: now + ttl,
      tags,
      hits: 0,
      size
    }

    cache.set(key, entry)
    updateStats()

    // Auto-cleanup si nécessaire
    scheduleCleanup()
  }

  /**
   * Récupérer une valeur du cache
   */
  function get<T>(key: string): T | null {
    const entry = cache.get(key)

    if (!entry) {
      missCount++
      updateStats()
      return null
    }

    // Vérifier l'expiration
    if (Date.now() >= entry.expiry) {
      cache.delete(key)
      missCount++
      updateStats()
      return null
    }

    entry.hits++
    hitCount++
    updateStats()
    return entry.data as T
  }

  /**
   * Vérifier si une clé existe et est valide
   */
  function has(key: string): boolean {
    const entry = cache.get(key)

    if (!entry) return false

    if (Date.now() >= entry.expiry) {
      cache.delete(key)
      updateStats()
      return false
    }

    return true
  }

  /**
   * Supprimer une entrée du cache
   */
  function forget(key: string): boolean {
    const result = cache.delete(key)
    if (result) {
      updateStats()
    }
    return result
  }

  /**
   * Invalider toutes les entrées avec des tags spécifiques
   */
  function invalidateByTag(tags: string | string[]): number {
    const tagsArray = Array.isArray(tags) ? tags : [tags]
    let invalidated = 0

    for (const [key, entry] of cache.entries()) {
      const hasMatchingTag = tagsArray.some(tag =>
        entry.tags.includes(tag)
      )

      if (hasMatchingTag) {
        cache.delete(key)
        invalidated++
      }
    }

    updateStats()
    return invalidated
  }

  /**
   * Invalider toutes les entrées expirées
   */
  function invalidateExpired(): number {
    const now = Date.now()
    let invalidated = 0

    for (const [key, entry] of cache.entries()) {
      if (now >= entry.expiry) {
        cache.delete(key)
        invalidated++
      }
    }

    updateStats()
    return invalidated
  }

  /**
   * Vider complètement le cache
   */
  function flush(): void {
    cache.clear()
    hitCount = 0
    missCount = 0
    updateStats()
  }

  /**
   * Obtenir toutes les clés du cache
   */
  function keys(): string[] {
    return Array.from(cache.keys())
  }

  /**
   * Obtenir toutes les entrées du cache
   */
  function entries(): CacheEntry[] {
    return Array.from(cache.values())
  }

  /**
   * Obtenir les entrées par tag
   */
  function getEntriesByTag(tag: string): CacheEntry[] {
    return entries().filter(entry => entry.tags.includes(tag))
  }

  /**
   * Calculer la taille approximative d'un objet
   */
  function calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2 // Approximation en bytes
    } catch {
      return 0
    }
  }

  /**
   * Mettre à jour les statistiques
   */
  function updateStats(): void {
    stats.total_entries = cache.size
    stats.total_size = Array.from(cache.values()).reduce(
      (total, entry) => total + entry.size, 0
    )

    const totalRequests = hitCount + missCount
    if (totalRequests > 0) {
      stats.hit_rate = (hitCount / totalRequests) * 100
      stats.miss_rate = (missCount / totalRequests) * 100
    }
  }

  /**
   * Programmer un nettoyage automatique
   */
  function scheduleCleanup(): void {
    // Nettoyer si plus de 1000 entrées
    if (cache.size > 1000) {
      cleanup()
    }
  }

  /**
   * Nettoyage intelligent du cache
   */
  function cleanup(): void {
    const now = Date.now()
    const entries = Array.from(cache.entries())

    // 1. Supprimer les entrées expirées
    let cleaned = 0
    for (const [key, entry] of entries) {
      if (now >= entry.expiry) {
        cache.delete(key)
        cleaned++
      }
    }

    // 2. Si toujours trop d'entrées, supprimer les moins utilisées
    if (cache.size > 800) {
      const sortedEntries = Array.from(cache.entries())
        .sort(([, a], [, b]) => {
          // Trier par hits puis par timestamp
          if (a.hits !== b.hits) {
            return a.hits - b.hits
          }
          return a.timestamp - b.timestamp
        })

      const toRemove = sortedEntries.slice(0, cache.size - 500)
      for (const [key] of toRemove) {
        cache.delete(key)
        cleaned++
      }
    }

    stats.cleanup_count++
    updateStats()

    console.log(`Cache cleanup: ${cleaned} entrées supprimées`)
  }

  /**
   * Précharger des données avec une clé
   */
  async function preload<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
    tags?: string[]
  ): Promise<void> {
    try {
      await remember(key, fn, ttl, tags)
    } catch (error) {
      console.warn(`Preload failed for key ${key}:`, error)
    }
  }

  /**
   * Récupérer des statistiques détaillées
   */
  function getDetailedStats() {
    const entries = Array.from(cache.values())

    return {
      ...stats,
      entries_by_tag: entries.reduce((acc, entry) => {
        entry.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>),
      top_accessed: entries
        .sort((a, b) => b.hits - a.hits)
        .slice(0, 10)
        .map(e => ({ key: e.key, hits: e.hits })),
      size_distribution: {
        small: entries.filter(e => e.size < 1000).length,
        medium: entries.filter(e => e.size >= 1000 && e.size < 10000).length,
        large: entries.filter(e => e.size >= 10000).length
      }
    }
  }

  // Nettoyage automatique toutes les 30 minutes
  setInterval(cleanup, 30 * 60 * 1000)

  // Nettoyage lors de la fermeture de la page
  window.addEventListener('beforeunload', cleanup)

  return {
    // Méthodes principales
    remember,
    set,
    get,
    has,
    forget,

    // Invalidation
    invalidateByTag,
    invalidateExpired,
    flush,

    // Utilitaires
    keys,
    entries,
    getEntriesByTag,
    cleanup,
    preload,

    // Statistiques
    stats,
    getDetailedStats
  }
}
