import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotifications } from '@/composables/ui'

interface DeviceInfo {
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
  browser: string
  version: string
  isMobile: boolean
  isTablet: boolean
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  orientation: 'portrait' | 'landscape'
  hasTouch: boolean
  isStandalone: boolean
}

interface DeviceCapabilities {
  vibration: boolean
  geolocation: boolean
  camera: boolean
  microphone: boolean
  bluetooth: boolean
  nfc: boolean
  share: boolean
  clipboard: boolean
  fullscreen: boolean
  wakeLock: boolean
  gamepad: boolean
  deviceMotion: boolean
  battery: boolean
}

interface VibrationPattern {
  success: number[]
  error: number[]
  warning: number[]
  notification: number[]
  gaming: {
    levelUp: number[]
    achievement: number[]
    combo: number[]
    button: number[]
  }
}

interface GeolocationInfo {
  latitude: number
  longitude: number
  accuracy: number
  altitude?: number
  heading?: number
  speed?: number
  timestamp: number
}

interface BatteryInfo {
  level: number
  charging: boolean
  chargingTime?: number
  dischargingTime?: number
}

/**
 * Composable pour capacités device PWA
 * Hardware access, sensors, vibrations, géolocalisation
 */
export function usePWADevice() {
  const notifications = useNotifications()

  // State
  const deviceInfo = ref<DeviceInfo>({
    platform: 'unknown',
    browser: '',
    version: '',
    isMobile: false,
    isTablet: false,
    screenWidth: 0,
    screenHeight: 0,
    pixelRatio: 1,
    orientation: 'portrait',
    hasTouch: false,
    isStandalone: false
  })

  const capabilities = ref<DeviceCapabilities>({
    vibration: false,
    geolocation: false,
    camera: false,
    microphone: false,
    bluetooth: false,
    nfc: false,
    share: false,
    clipboard: false,
    fullscreen: false,
    wakeLock: false,
    gamepad: false,
    deviceMotion: false,
    battery: false
  })

  const currentLocation = ref<GeolocationInfo | null>(null)
  const batteryInfo = ref<BatteryInfo | null>(null)
  const isLocationTracking = ref(false)
  const wakeLock = ref<any>(null)

  // Patterns de vibration prédéfinis
  const vibrationPatterns: VibrationPattern = {
    success: [100, 50, 100],
    error: [200, 100, 200, 100, 200],
    warning: [150, 100, 150],
    notification: [200, 100, 200],
    gaming: {
      levelUp: [300, 200, 300, 200, 500],
      achievement: [100, 50, 100, 50, 100, 50, 400],
      combo: [50, 25, 50, 25, 50, 25, 200],
      button: [50]
    }
  }

  /**
   * Initialiser les capacités device PWA
   */
  async function initDeviceCapabilities(): Promise<void> {
    detectDeviceInfo()
    detectCapabilities()
    setupOrientationListener()
    setupBatteryMonitoring()
    setupLocationTracking()

    log('Capacités device initialisées')
  }

  /**
   * Détecter les informations du device
   */
  function detectDeviceInfo(): void {
    const userAgent = navigator.userAgent

    // Détecter plateforme
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      deviceInfo.value.platform = 'ios'
    } else if (/Android/.test(userAgent)) {
      deviceInfo.value.platform = 'android'
    } else if (!/Mobi/i.test(userAgent)) {
      deviceInfo.value.platform = 'desktop'
    }

    // Détecter navigateur
    if (userAgent.includes('Chrome')) {
      deviceInfo.value.browser = 'Chrome'
    } else if (userAgent.includes('Safari')) {
      deviceInfo.value.browser = 'Safari'
    } else if (userAgent.includes('Firefox')) {
      deviceInfo.value.browser = 'Firefox'
    } else if (userAgent.includes('Edge')) {
      deviceInfo.value.browser = 'Edge'
    }

    // Détails device
    deviceInfo.value.isMobile = /Mobi|Android/i.test(userAgent)
    deviceInfo.value.isTablet = /iPad|Android(?!.*Mobi)/i.test(userAgent)
    deviceInfo.value.screenWidth = window.screen.width
    deviceInfo.value.screenHeight = window.screen.height
    deviceInfo.value.pixelRatio = window.devicePixelRatio || 1
    deviceInfo.value.hasTouch = 'ontouchstart' in window
    deviceInfo.value.isStandalone = window.matchMedia('(display-mode: standalone)').matches

    updateOrientation()

    log('Device info détectée:', deviceInfo.value)
  }

  /**
   * Détecter les capacités disponibles
   */
  function detectCapabilities(): void {
    capabilities.value = {
      vibration: 'vibrate' in navigator,
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      bluetooth: 'bluetooth' in navigator,
      nfc: 'nfc' in navigator,
      share: 'share' in navigator,
      clipboard: 'clipboard' in navigator,
      fullscreen: 'requestFullscreen' in document.documentElement,
      wakeLock: 'wakeLock' in navigator,
      gamepad: 'getGamepads' in navigator,
      deviceMotion: 'DeviceMotionEvent' in window,
      battery: 'getBattery' in navigator
    }

    log('Capacités détectées:', capabilities.value)
  }

  /**
   * Vibrations avec patterns prédéfinis
   */
  const vibration = {
    /**
     * Vibration success
     */
    success: () => {
      if (capabilities.value.vibration) {
        navigator.vibrate(vibrationPatterns.success)
      }
    },

    /**
     * Vibration error
     */
    error: () => {
      if (capabilities.value.vibration) {
        navigator.vibrate(vibrationPatterns.error)
      }
    },

    /**
     * Vibration warning
     */
    warning: () => {
      if (capabilities.value.vibration) {
        navigator.vibrate(vibrationPatterns.warning)
      }
    },

    /**
     * Vibration notification
     */
    notification: () => {
      if (capabilities.value.vibration) {
        navigator.vibrate(vibrationPatterns.notification)
      }
    },

    /**
     * Vibrations gaming
     */
    gaming: {
      levelUp: () => {
        if (capabilities.value.vibration) {
          navigator.vibrate(vibrationPatterns.gaming.levelUp)
        }
      },

      achievement: () => {
        if (capabilities.value.vibration) {
          navigator.vibrate(vibrationPatterns.gaming.achievement)
        }
      },

      combo: () => {
        if (capabilities.value.vibration) {
          navigator.vibrate(vibrationPatterns.gaming.combo)
        }
      },

      button: () => {
        if (capabilities.value.vibration) {
          navigator.vibrate(vibrationPatterns.gaming.button)
        }
      }
    },

    /**
     * Vibration personnalisée
     */
    custom: (pattern: number | number[]) => {
      if (capabilities.value.vibration) {
        navigator.vibrate(pattern)
      }
    },

    /**
     * Arrêter les vibrations
     */
    stop: () => {
      if (capabilities.value.vibration) {
        navigator.vibrate(0)
      }
    }
  }

  /**
   * Obtenir la position géographique
   */
  async function getCurrentPosition(options?: PositionOptions): Promise<GeolocationInfo | null> {
    if (!capabilities.value.geolocation) {
      log('Géolocalisation non disponible')
      return null
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: GeolocationInfo = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp
          }

          currentLocation.value = location
          log('Position obtenue:', location)
          resolve(location)
        },
        (error) => {
          log('Erreur géolocalisation:', error)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
          ...options
        }
      )
    })
  }

  /**
   * Démarrer le tracking de position
   */
  function startLocationTracking(options?: PositionOptions): number | null {
    if (!capabilities.value.geolocation || isLocationTracking.value) {
      return null
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: GeolocationInfo = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp
        }

        currentLocation.value = location
        log('Position mise à jour:', location)
      },
      (error) => {
        log('Erreur tracking position:', error)
        isLocationTracking.value = false
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
        ...options
      }
    )

    isLocationTracking.value = true
    log('Tracking géolocalisation démarré')
    return watchId
  }

  /**
   * Arrêter le tracking de position
   */
  function stopLocationTracking(watchId: number): void {
    if (capabilities.value.geolocation) {
      navigator.geolocation.clearWatch(watchId)
      isLocationTracking.value = false
      log('Tracking géolocalisation arrêté')
    }
  }

  /**
   * Partager du contenu
   */
  async function shareContent(data: {
    title?: string
    text?: string
    url?: string
  }): Promise<boolean> {
    if (!capabilities.value.share) {
      log('Web Share API non supportée')
      return false
    }

    try {
      await navigator.share(data)
      log('Contenu partagé avec succès')
      return true
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        log('Erreur partage:', error)
      }
      return false
    }
  }

  /**
   * Copier dans le presse-papiers
   */
  async function copyToClipboard(text: string): Promise<boolean> {
    if (!capabilities.value.clipboard) {
      // Fallback pour navigateurs non supportés
      return fallbackCopyToClipboard(text)
    }

    try {
      await navigator.clipboard.writeText(text)
      notifications.success('📋 Copié dans le presse-papiers', {
        duration: 2000
      })
      log('Texte copié:', text)
      return true
    } catch (error: any) {
      log('Erreur copie presse-papiers:', error)
      return fallbackCopyToClipboard(text)
    }
  }

  /**
   * Fallback pour copier dans le presse-papiers
   */
  function fallbackCopyToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (successful) {
        notifications.success('📋 Copié dans le presse-papiers', {
          duration: 2000
        })
      }
      return successful
    } catch (error) {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }

  /**
   * Activer le plein écran
   */
  async function enterFullscreen(): Promise<boolean> {
    if (!capabilities.value.fullscreen) {
      log('Fullscreen non supporté')
      return false
    }

    try {
      await document.documentElement.requestFullscreen()
      log('Mode plein écran activé')
      return true
    } catch (error: any) {
      log('Erreur plein écran:', error)
      return false
    }
  }

  /**
   * Quitter le plein écran
   */
  async function exitFullscreen(): Promise<boolean> {
    if (!document.fullscreenElement) {
      return false
    }

    try {
      await document.exitFullscreen()
      log('Mode plein écran quitté')
      return true
    } catch (error: any) {
      log('Erreur sortie plein écran:', error)
      return false
    }
  }

  /**
   * Activer le wake lock (empêcher veille)
   */
  async function requestWakeLock(): Promise<boolean> {
    if (!capabilities.value.wakeLock) {
      log('Wake Lock non supporté')
      return false
    }

    try {
      wakeLock.value = await (navigator as any).wakeLock.request('screen')

      wakeLock.value.addEventListener('release', () => {
        log('Wake lock libéré')
        wakeLock.value = null
      })

      log('Wake lock activé')
      return true
    } catch (error: any) {
      log('Erreur wake lock:', error)
      return false
    }
  }

  /**
   * Libérer le wake lock
   */
  async function releaseWakeLock(): Promise<void> {
    if (wakeLock.value) {
      await wakeLock.value.release()
      wakeLock.value = null
      log('Wake lock libéré manuellement')
    }
  }

  /**
   * Obtenir les informations batterie
   */
  async function getBatteryInfo(): Promise<BatteryInfo | null> {
    if (!capabilities.value.battery) {
      log('Battery API non supportée')
      return null
    }

    try {
      const battery = await (navigator as any).getBattery()

      const info: BatteryInfo = {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime !== Infinity ? battery.chargingTime : undefined,
        dischargingTime: battery.dischargingTime !== Infinity ? battery.dischargingTime : undefined
      }

      batteryInfo.value = info
      log('Info batterie:', info)
      return info
    } catch (error: any) {
      log('Erreur info batterie:', error)
      return null
    }
  }

  /**
   * Mettre à jour l'orientation
   */
  function updateOrientation(): void {
    deviceInfo.value.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    deviceInfo.value.screenWidth = window.screen.width
    deviceInfo.value.screenHeight = window.screen.height
  }

  /**
   * Setup listener orientation
   */
  function setupOrientationListener(): void {
    window.addEventListener('orientationchange', updateOrientation)
    window.addEventListener('resize', updateOrientation)
  }

  /**
   * Setup monitoring batterie
   */
  async function setupBatteryMonitoring(): Promise<void> {
    if (!capabilities.value.battery) return

    try {
      const battery = await (navigator as any).getBattery()

      battery.addEventListener('levelchange', () => {
        getBatteryInfo()
      })

      battery.addEventListener('chargingchange', () => {
        getBatteryInfo()
      })

      await getBatteryInfo()
    } catch (error: any) {
      log('Erreur setup monitoring batterie:', error)
    }
  }

  /**
   * Setup tracking localisation
   */
  function setupLocationTracking(): void {
    // Demander permission géolocalisation si supportée
    if (capabilities.value.geolocation) {
      navigator.permissions?.query({ name: 'geolocation' as PermissionName })
        .then(result => {
          log('Permission géolocalisation:', result.state)
        })
        .catch(() => {
          // Ignore les erreurs de permission
        })
    }
  }

  /**
   * Obtenir les capacités résumées
   */
  function getCapabilitiesSummary(): string[] {
    const available = []

    if (capabilities.value.vibration) available.push('Vibrations')
    if (capabilities.value.geolocation) available.push('Géolocalisation')
    if (capabilities.value.camera) available.push('Caméra')
    if (capabilities.value.share) available.push('Partage')
    if (capabilities.value.clipboard) available.push('Presse-papiers')
    if (capabilities.value.fullscreen) available.push('Plein écran')
    if (capabilities.value.wakeLock) available.push('Wake Lock')
    if (capabilities.value.battery) available.push('Batterie')

    return available
  }

  /**
   * Tester les capacités device
   */
  async function testDeviceCapabilities(): Promise<void> {
    log('🧪 Test des capacités device...')

    // Test vibration
    if (capabilities.value.vibration) {
      vibration.success()
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Test géolocalisation
    if (capabilities.value.geolocation) {
      try {
        await getCurrentPosition()
      } catch (error) {
        log('Test géolocalisation échoué')
      }
    }

    // Test partage
    if (capabilities.value.share) {
      log('Web Share API disponible')
    }

    // Test presse-papiers
    if (capabilities.value.clipboard) {
      await copyToClipboard('Test PWA Device')
    }

    // Test batterie
    if (capabilities.value.battery) {
      await getBatteryInfo()
    }

    log('Test des capacités terminé')
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[PWADevice]', ...args)
  }

  // Computed properties
  const deviceSummary = computed(() =>
    `${deviceInfo.value.platform} ${deviceInfo.value.browser} - ${deviceInfo.value.screenWidth}x${deviceInfo.value.screenHeight}`
  )

  const batteryLevel = computed(() =>
    batteryInfo.value ? Math.round(batteryInfo.value.level * 100) : null
  )

  const isLowBattery = computed(() =>
    batteryLevel.value !== null && batteryLevel.value < 20
  )

  const hasMotionSensors = computed(() =>
    capabilities.value.deviceMotion && deviceInfo.value.isMobile
  )

  const supportsAdvancedFeatures = computed(() => {
    const advanced = [
      capabilities.value.wakeLock,
      capabilities.value.bluetooth,
      capabilities.value.nfc,
      capabilities.value.share
    ]
    return advanced.filter(Boolean).length >= 2
  })

  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('orientationchange', updateOrientation)
    window.removeEventListener('resize', updateOrientation)

    if (wakeLock.value) {
      releaseWakeLock()
    }
  })

  // Auto-init
  onMounted(() => {
    initDeviceCapabilities()
  })

  return {
    // State
    deviceInfo,
    capabilities,
    currentLocation,
    batteryInfo,
    isLocationTracking,
    wakeLock,

    // Computed
    deviceSummary,
    batteryLevel,
    isLowBattery,
    hasMotionSensors,
    supportsAdvancedFeatures,

    // Methods
    initDeviceCapabilities,
    vibration,
    getCurrentPosition,
    startLocationTracking,
    stopLocationTracking,
    shareContent,
    copyToClipboard,
    enterFullscreen,
    exitFullscreen,
    requestWakeLock,
    releaseWakeLock,
    getBatteryInfo,
    getCapabilitiesSummary,
    testDeviceCapabilities
  }
}
