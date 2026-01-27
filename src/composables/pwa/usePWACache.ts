import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/ui'

interface CacheStats {
  total_size: number
  cache_entries: number
  hit_rate: number
  last_cleanup: number
  storage_quota: number
  storage_used: number
}

interface CacheStrategy {
  name: string
  pattern: RegExp
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only'
  maxAge: number // en millisecondes
  maxEntries: number
}

interface CachedItem {
  url: string
  timestamp: number
  size: number
  strategy: string
  hits: number
  last_accessed: number
}

interface CacheConfig {
  version: string
  strategies: CacheStrategy[]
  cleanup_threshold: number // Pourcentage de quota utilisé pour déclencher cleanup
  max_cache_age: number // Âge maximum en millisecondes
}

/**
 * Composable pour gestion cache avancée PWA
 * Stratégies de cache, nettoyage intelligent, analytics
 */
export function usePWACache() {
  const notifications = useNotifications()

  // State
  const isSupported = ref(false)
  const cacheStats = ref<CacheStats>({
    total_size: 0,
    cache_entries: 0,
    hit_rate: 0,
    last_cleanup: 0,
    storage_quota: 0,
    storage_used: 0
  })

  const cacheConfig = ref<CacheConfig>({
    version: '1.0.0',
    strategies: [
      {
        name: 'static-assets',
        pattern: /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/,
        strategy: 'cache-first',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        maxEntries: 100
      },
      {
        name: 'api-calls',
        pattern: /\/api\//,
        strategy: 'network-first',
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxEntries: 50
      },
      {
        name: 'gaming-data',
        pattern: /\/api\/(achievements|leaderboards|gaming)/,
        strategy: 'stale-while-revalidate',
        maxAge: 2 * 60 * 1000, // 2 minutes
        maxEntries: 30
      },
      {
        name: 'user-data',
        pattern: /\/api\/(transactions|goals|categories)/,
        strategy: 'network-first',
        maxAge: 1 * 60 * 1000, // 1 minute
        maxEntries: 100
      },
      {
        name: 'images',
        pattern: /\.(png|jpg|jpeg|gif|webp)$/,
        strategy: 'cache-first',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
        maxEntries: 200
      }
    ],
    cleanup_threshold: 80, // 80% du quota
    max_cache_age: 30 * 24 * 60 * 60 * 1000 // 30 jours max
  })

  /**
   * Initialiser la gestion de cache PWA
   */
  async function initPWACache(): Promise<void> {
    checkCacheSupport()
    await loadCacheConfig()
    await updateCacheStats()
    setupCacheMonitoring()

    log('PWA Cache initialisé')
  }

  /**
   * Vérifier le support du cache
   */
  function checkCacheSupport(): boolean {
    const supported = 'caches' in window &&
      'serviceWorker' in navigator

    isSupported.value = supported

    if (!supported) {
      log('Cache API non supportée')
    }

    return supported
  }

  /**
   * Obtenir ou créer un cache par nom
   */
  async function getCache(cacheName: string): Promise<Cache | null> {
    if (!isSupported.value) return null

    try {
      return await caches.open(cacheName)
    } catch (error: any) {
      log('Erreur ouverture cache:', error)
      return null
    }
  }

  /**
   * Mettre en cache une ressource
   */
  async function cacheResource(url: string, response: Response, strategy: string): Promise<boolean> {
    if (!isSupported.value) return false

    try {
      const cache = await getCache(`budget-gaming-${strategy}`)
      if (!cache) return false

      await cache.put(url, response.clone())

      // Mettre à jour les stats
      await updateCacheStats()

      log(`Ressource mise en cache: ${url}`)
      return true

    } catch (error: any) {
      log('Erreur mise en cache:', error)
      return false
    }
  }

  /**
   * Récupérer une ressource depuis le cache
   */
  async function getCachedResource(url: string, strategy?: string): Promise<Response | null> {
    if (!isSupported.value) return null

    try {
      // Essayer les différents caches si pas de stratégie spécifiée
      const cacheNames = strategy
        ? [`budget-gaming-${strategy}`]
        : await caches.keys()

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const cached = await cache.match(url)

        if (cached) {
          // Mettre à jour les stats d'accès
          await updateAccessStats(url, cacheName)
          return cached
        }
      }

      return null

    } catch (error: any) {
      log('Erreur récupération cache:', error)
      return null
    }
  }

  /**
   * Vérifier si une ressource est en cache
   */
  async function isCached(url: string): Promise<boolean> {
    const cached = await getCachedResource(url)
    return cached !== null
  }

  /**
   * Supprimer une ressource du cache
   */
  async function removeCachedResource(url: string): Promise<boolean> {
    if (!isSupported.value) return false

    try {
      const cacheNames = await caches.keys()
      let removed = false

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        if (await cache.delete(url)) {
          removed = true
        }
      }

      if (removed) {
        await updateCacheStats()
        log(`Ressource supprimée du cache: ${url}`)
      }

      return removed

    } catch (error: any) {
      log('Erreur suppression cache:', error)
      return false
    }
  }

  /**
   * Nettoyer les caches automatiquement
   */
  async function cleanupCaches(): Promise<void> {
    if (!isSupported.value) return

    log('🧹 Nettoyage des caches...')

    try {
      const cacheNames = await caches.keys()
      const now = Date.now()
      let totalCleaned = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()

        for (const request of keys) {
          const cached = await cache.match(request)

          if (cached) {
            const headers = cached.headers
            const cacheDate = headers.get('date')
            const timestamp = cacheDate ? new Date(cacheDate).getTime() : 0
            const age = now - timestamp

            // Supprimer si trop ancien
            if (age > cacheConfig.value.max_cache_age) {
              await cache.delete(request)
              totalCleaned++
            }
          }
        }
      }

      cacheStats.value.last_cleanup = now
      await updateCacheStats()

      if (totalCleaned > 0) {
        notifications.info(`🧹 ${totalCleaned} entrées supprimées du cache`, {
          title: 'Cache nettoyé',
          duration: 3000
        })
      }

      log(`Nettoyage terminé: ${totalCleaned} entrées supprimées`)

    } catch (error: any) {
      log('Erreur nettoyage cache:', error)
    }
  }

  /**
   * Forcer le nettoyage complet des caches
   */
  async function clearAllCaches(): Promise<void> {
    if (!isSupported.value) return

    try {
      const cacheNames = await caches.keys()

      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )

      await updateCacheStats()

      notifications.success('🗑️ Tous les caches supprimés', {
        title: 'Cache vidé',
        duration: 4000
      })

      log('Tous les caches supprimés')

    } catch (error: any) {
      log('Erreur suppression des caches:', error)
    }
  }

  /**
   * Obtenir les entrées d'un cache
   */
  async function getCacheEntries(cacheName: string): Promise<CachedItem[]> {
    if (!isSupported.value) return []

    try {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      const entries: CachedItem[] = []

      for (const request of keys) {
        const cached = await cache.match(request)

        if (cached) {
          const stats = getCachedItemStats(request.url)

          entries.push({
            url: request.url,
            timestamp: cached.headers.get('date')
              ? new Date(cached.headers.get('date')!).getTime()
              : Date.now(),
            size: parseInt(cached.headers.get('content-length') || '0'),
            strategy: cacheName.replace('budget-gaming-', ''),
            hits: stats.hits,
            last_accessed: stats.last_accessed
          })
        }
      }

      return entries

    } catch (error: any) {
      log('Erreur récupération entrées cache:', error)
      return []
    }
  }

  /**
   * Pré-charger des ressources importantes
   */
  async function preloadCriticalResources(): Promise<void> {
    const criticalResources = [
      '/api/user/profile',
      '/api/gaming/level',
      '/api/transactions/recent',
      '/icons/icon-192x192.png',
      '/manifest.json'
    ]

    log('🚀 Pré-chargement des ressources critiques...')

    for (const url of criticalResources) {
      try {
        const response = await fetch(url)
        if (response.ok) {
          await cacheResource(url, response, 'critical')
        }
      } catch (error) {
        log(`Erreur pré-chargement: ${url}`)
      }
    }

    log('Pré-chargement terminé')
  }

  /**
   * Mettre à jour les statistiques de cache
   */
  async function updateCacheStats(): Promise<void> {
    if (!isSupported.value) return

    try {
      // Obtenir le quota de stockage
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        cacheStats.value.storage_quota = estimate.quota || 0
        cacheStats.value.storage_used = estimate.usage || 0
      }

      // Compter les entrées de cache
      const cacheNames = await caches.keys()
      let totalEntries = 0
      let totalSize = 0

      for (const cacheName of cacheNames) {
        const entries = await getCacheEntries(cacheName)
        totalEntries += entries.length
        totalSize += entries.reduce((sum, entry) => sum + entry.size, 0)
      }

      cacheStats.value.cache_entries = totalEntries
      cacheStats.value.total_size = totalSize

      // Calculer le taux de hit (simplifié)
      const hitStats = getCacheHitStats()
      cacheStats.value.hit_rate = hitStats.total > 0
        ? (hitStats.hits / hitStats.total) * 100
        : 0

    } catch (error: any) {
      log('Erreur mise à jour stats cache:', error)
    }
  }

  /**
   * Configurer le monitoring du cache
   */
  function setupCacheMonitoring(): void {
    // Monitoring périodique
    setInterval(async () => {
      await updateCacheStats()

      // Nettoyage automatique si seuil dépassé
      const usagePercent = cacheStats.value.storage_quota > 0
        ? (cacheStats.value.storage_used / cacheStats.value.storage_quota) * 100
        : 0

      if (usagePercent > cacheConfig.value.cleanup_threshold) {
        await cleanupCaches()
      }
    }, 5 * 60 * 1000) // Toutes les 5 minutes

    log('Monitoring cache activé')
  }

  /**
   * Obtenir les stats d'accès d'un élément en cache
   */
  function getCachedItemStats(url: string): { hits: number, last_accessed: number } {
    const stats = localStorage.getItem(`cache_stats_${btoa(url)}`)

    if (stats) {
      try {
        return JSON.parse(stats)
      } catch (error) {
        // Ignore
      }
    }

    return { hits: 0, last_accessed: 0 }
  }

  /**
   * Mettre à jour les stats d'accès
   */
  async function updateAccessStats(url: string, cacheName: string): Promise<void> {
    const key = `cache_stats_${btoa(url)}`
    const stats = getCachedItemStats(url)

    stats.hits++
    stats.last_accessed = Date.now()

    localStorage.setItem(key, JSON.stringify(stats))
  }

  /**
   * Obtenir les statistiques globales de hit
   */
  function getCacheHitStats(): { hits: number, total: number } {
    const globalStats = localStorage.getItem('cache_global_stats')

    if (globalStats) {
      try {
        return JSON.parse(globalStats)
      } catch (error) {
        // Ignore
      }
    }

    return { hits: 0, total: 0 }
  }

  /**
   * Charger la configuration du cache
   */
  async function loadCacheConfig(): Promise<void> {
    const saved = localStorage.getItem('pwa_cache_config')

    if (saved) {
      try {
        const config = JSON.parse(saved)
        cacheConfig.value = { ...cacheConfig.value, ...config }
      } catch (error) {
        log('Erreur chargement config cache')
      }
    }
  }

  /**
   * Sauvegarder la configuration du cache
   */
  async function saveCacheConfig(): Promise<void> {
    localStorage.setItem('pwa_cache_config', JSON.stringify(cacheConfig.value))
  }

  /**
   * Obtenir la stratégie de cache pour une URL
   */
  function getCacheStrategy(url: string): CacheStrategy | null {
    for (const strategy of cacheConfig.value.strategies) {
      if (strategy.pattern.test(url)) {
        return strategy
      }
    }
    return null
  }

  /**
   * Optimiser automatiquement les stratégies
   */
  async function optimizeCacheStrategies(): Promise<void> {
    log('🔧 Optimisation des stratégies de cache...')

    // Analyser les patterns d'utilisation et ajuster les stratégies
    // Cette fonction peut être étendue avec de l'IA/ML pour optimiser
    // automatiquement les stratégies selon l'usage

    const cacheNames = await caches.keys()

    for (const cacheName of cacheNames) {
      const entries = await getCacheEntries(cacheName)

      // Exemple d'optimisation: supprimer les entrées jamais utilisées
      for (const entry of entries) {
        if (entry.hits === 0 && Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
          await removeCachedResource(entry.url)
        }
      }
    }

    await updateCacheStats()
    log('Optimisation terminée')
  }

  /**
   * Exporter les données de cache pour debug
   */
  async function exportCacheData(): Promise<any> {
    const cacheNames = await caches.keys()
    const exportData: any = {
      stats: cacheStats.value,
      config: cacheConfig.value,
      caches: {}
    }

    for (const cacheName of cacheNames) {
      exportData.caches[cacheName] = await getCacheEntries(cacheName)
    }

    return exportData
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[PWACache]', ...args)
  }

  // Computed properties
  const cacheSupported = computed(() => isSupported.value)

  const storageUsagePercent = computed(() => {
    if (cacheStats.value.storage_quota === 0) return 0
    return (cacheStats.value.storage_used / cacheStats.value.storage_quota) * 100
  })

  const needsCleanup = computed(() =>
    storageUsagePercent.value > cacheConfig.value.cleanup_threshold
  )

  const cacheHealthy = computed(() =>
    cacheStats.value.hit_rate > 50 && !needsCleanup.value
  )

  const formattedCacheSize = computed(() => {
    const bytes = cacheStats.value.total_size
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  })

  // Auto-init
  onMounted(async () => {
    await initPWACache()
    await preloadCriticalResources()

    // Optimisation périodique
    setInterval(optimizeCacheStrategies, 24 * 60 * 60 * 1000) // Tous les jours
  })

  return {
    // State
    isSupported,
    cacheStats,
    cacheConfig,

    // Computed
    cacheSupported,
    storageUsagePercent,
    needsCleanup,
    cacheHealthy,
    formattedCacheSize,

    // Methods
    initPWACache,
    cacheResource,
    getCachedResource,
    isCached,
    removeCachedResource,
    cleanupCaches,
    clearAllCaches,
    getCacheEntries,
    preloadCriticalResources,
    optimizeCacheStrategies,
    exportCacheData,
    getCacheStrategy
  }
}
