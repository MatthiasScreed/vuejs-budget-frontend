import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/ui'

interface PWAManifest {
  name: string
  short_name: string
  description: string
  start_url: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  theme_color: string
  background_color: string
  icons: PWAIcon[]
}

interface PWAIcon {
  src: string
  sizes: string
  type: string
  purpose?: 'any' | 'maskable' | 'monochrome'
}

interface PWACapabilities {
  installable: boolean
  standalone: boolean
  offline_capable: boolean
  push_notifications: boolean
  background_sync: boolean
  file_system_access: boolean
}

/**
 * Composable pour gestion PWA core
 * Installation, manifest, capabilities, lifecycle
 */
export function usePWA() {
  const notifications = useNotifications()

  // State
  const isSupported = ref(false)
  const isInstalled = ref(false)
  const isStandalone = ref(false)
  const installPromptEvent = ref<any>(null)
  const capabilities = ref<PWACapabilities>({
    installable: false,
    standalone: false,
    offline_capable: false,
    push_notifications: false,
    background_sync: false,
    file_system_access: false
  })

  /**
   * Initialiser PWA
   */
  function initPWA(): void {
    detectPWASupport()
    checkStandaloneMode()
    detectCapabilities()
    registerServiceWorker()
    setupInstallPrompt()
    setupPWAListeners()

    log('PWA initialisé')
  }

  /**
   * Détecter support PWA
   */
  function detectPWASupport(): void {
    isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
  }

  /**
   * Vérifier mode standalone
   */
  function checkStandaloneMode(): void {
    // Différentes méthodes de détection selon platform
    isStandalone.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://') ||
      window.location.search.includes('pwa=true')
  }

  /**
   * Détecter capabilities device
   */
  function detectCapabilities(): void {
    capabilities.value = {
      installable: 'BeforeInstallPromptEvent' in window,
      standalone: isStandalone.value,
      offline_capable: 'serviceWorker' in navigator && 'caches' in window,
      push_notifications: 'PushManager' in window && 'Notification' in window,
      background_sync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      file_system_access: 'showOpenFilePicker' in window
    }

    log('Capabilities détectées:', capabilities.value)
  }

  /**
   * Enregistrer Service Worker
   */
  async function registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      log('Service Worker non supporté')
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      log('Service Worker enregistré:', registration.scope)

      // Écouter updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateAvailable()
            }
          })
        }
      })

    } catch (error) {
      log('Erreur Service Worker:', error)
    }
  }

  /**
   * Setup prompt d'installation
   */
  function setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      installPromptEvent.value = event
      capabilities.value.installable = true

      log('Prompt installation disponible')
    })

    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      installPromptEvent.value = null

      notifications.success('🎉 App installée avec succès !', {
        title: '📱 Installation Réussie',
        duration: 5000
      })

      log('App installée')
    })
  }

  /**
   * Setup listeners PWA
   */
  function setupPWAListeners(): void {
    // Visibilité app
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isStandalone.value) {
        log('App visible en mode standalone')
      }
    })

    // Online/Offline
    window.addEventListener('online', () => {
      notifications.success('🌐 Connexion rétablie !', {
        title: '📶 En ligne',
        duration: 3000
      })
    })

    window.addEventListener('offline', () => {
      notifications.warning('📡 Mode hors ligne activé', {
        title: '📴 Hors ligne',
        duration: 0 // Persistent
      })
    })
  }

  /**
   * Afficher prompt d'installation
   */
  async function showInstallPrompt(): Promise<boolean> {
    if (!installPromptEvent.value) {
      log('Prompt installation non disponible')
      return false
    }

    try {
      const result = await installPromptEvent.value.prompt()
      const { outcome } = await installPromptEvent.value.userChoice

      log('Résultat installation:', outcome)

      if (outcome === 'accepted') {
        isInstalled.value = true
        return true
      }

      return false
    } catch (error) {
      log('Erreur prompt installation:', error)
      return false
    }
  }

  /**
   * Afficher notification update disponible
   */
  function showUpdateAvailable(): void {
    notifications.info('🔄 Mise à jour disponible !', {
      title: '📱 Nouvelle Version',
      duration: 0,
      actions: [
        { label: 'Mettre à jour', action: 'update_app', style: 'primary' },
        { label: 'Plus tard', action: 'dismiss', style: 'secondary' }
      ]
    })
  }

  /**
   * Recharger avec nouvelle version
   */
  async function updateApp(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()

      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    }
  }

  /**
   * Obtenir manifest PWA
   */
  function getManifest(): PWAManifest {
    return {
      name: 'Budget Gaming - Gestionnaire Financier Gamifié',
      short_name: 'Budget Gaming',
      description: 'L\'app de budget la plus engageante avec système de gamification avancé',
      start_url: '/?pwa=true',
      display: 'standalone',
      theme_color: '#6366f1',
      background_color: '#0f172a',
      icons: [
        {
          src: '/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: '/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    }
  }

  /**
   * Générer manifest dynamique
   */
  function generateManifest(): string {
    const manifest = getManifest()
    return JSON.stringify(manifest, null, 2)
  }

  /**
   * Vérifier si peut être installée
   */
  function canInstall(): boolean {
    return capabilities.value.installable && !isInstalled.value && Boolean(installPromptEvent.value)
  }

  /**
   * Obtenir informations device
   */
  function getDeviceInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isStandalone: isStandalone.value,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      supportsPWA: isSupported.value
    }
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[PWA]', ...args)
  }

  // Computed properties
  const deviceInfo = computed(() => getDeviceInfo())

  const installationStatus = computed(() => {
    if (isInstalled.value) return 'installed'
    if (canInstall()) return 'installable'
    return 'not_installable'
  })

  const isOnline = computed(() => navigator.onLine)

  const platformName = computed(() => {
    const info = deviceInfo.value
    if (info.isIOS) return 'iOS'
    if (info.isAndroid) return 'Android'
    if (info.isMobile) return 'Mobile'
    return 'Desktop'
  })

  // Auto-init
  onMounted(() => {
    initPWA()
  })

  return {
    // State
    isSupported,
    isInstalled,
    isStandalone,
    installPromptEvent,
    capabilities,

    // Computed
    deviceInfo,
    installationStatus,
    isOnline,
    platformName,

    // Methods
    initPWA,
    showInstallPrompt,
    updateApp,
    getManifest,
    generateManifest,
    canInstall
  }
}
