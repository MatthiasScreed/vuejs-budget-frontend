import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/ui/useNotifications'
import { useApi } from '@/composables/core/useApi'

interface PWAInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface InstallationStatus {
  isSupported: boolean
  canInstall: boolean
  isInstalled: boolean
  isStandalone: boolean
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
}

interface InstallationStats {
  prompt_shown: number
  install_accepted: number
  install_dismissed: number
  uninstall_count: number
  last_prompt: number
}

/**
 * Composable pour gestion installation PWA
 * Installation native, bannières, tracking analytics
 */
export function usePWAInstall() {
  const notifications = useNotifications()
  const api = useApi()

  // State
  const deferredPrompt = ref<PWAInstallPromptEvent | null>(null)
  const isInstallPromptReady = ref(false)
  const installationAttempts = ref(0)
  const dismissalCount = ref(0)
  const lastPromptTime = ref<number>(0)
  const userDecision = ref<'accepted' | 'dismissed' | 'pending'>('pending')

  /**
   * Initialiser la gestion d'installation PWA
   */
  function initPWAInstall(): void {
    detectPlatform()
    setupInstallListeners()
    loadInstallationStats()
    checkStandaloneMode()
    log('PWA Install initialisé')
  }

  /**
   * Setup des listeners d'installation
   */
  function setupInstallListeners(): void {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('DOMContentLoaded', checkStandaloneMode)
    log('Listeners installation configurés')
  }

  /**
   * Gérer l'événement beforeinstallprompt
   */
  function handleBeforeInstallPrompt(event: Event): void {
    event.preventDefault()
    deferredPrompt.value = event as PWAInstallPromptEvent
    isInstallPromptReady.value = true

    log("Prompt d'installation disponible")

    saveInstallationStats({
      ...getInstallationStats(),
      prompt_shown: getInstallationStats().prompt_shown + 1,
    })

    if (shouldShowInstallPrompt()) {
      showInstallationHint()
    }
  }

  /**
   * Gérer l'événement appinstalled
   * 🎁 Donne 100 XP au backend (une seule fois)
   */
  async function handleAppInstalled(): Promise<void> {
    deferredPrompt.value = null
    isInstallPromptReady.value = false

    try {
      const response = await api.post('/gaming/pwa-installed', {})

      if (response.data?.success) {
        const xp = response.data.data?.xp_earned ?? 100
        notifications.success(`🎉 +${xp} XP — Merci d'avoir installé CoinQuest !`, {
          title: '📱 App installée',
          duration: 6000,
        })
      } else {
        notifications.success("🎉 CoinQuest est maintenant sur ton écran d'accueil !", {
          title: '📱 App installée',
          duration: 4000,
        })
      }
    } catch {
      notifications.success("🎉 CoinQuest est maintenant sur ton écran d'accueil !", {
        title: '📱 App installée',
        duration: 4000,
      })
    }

    const stats = getInstallationStats()
    saveInstallationStats({
      ...stats,
      install_accepted: stats.install_accepted + 1,
    })

    trackInstallationEvent('app_installed', {
      platform: getInstallationStatus().platform,
      attempts: installationAttempts.value,
      time_to_install: Date.now() - lastPromptTime.value,
    })

    log('App installée avec succès')
  }

  /**
   * Afficher le prompt d'installation
   */
  async function showInstallPrompt(): Promise<boolean> {
    if (!deferredPrompt.value) {
      log("Aucun prompt d'installation disponible")
      return false
    }

    installationAttempts.value++
    lastPromptTime.value = Date.now()

    try {
      await deferredPrompt.value.prompt()

      const choiceResult = await deferredPrompt.value.userChoice
      userDecision.value = choiceResult.outcome

      log(`Décision utilisateur: ${choiceResult.outcome}`)

      if (choiceResult.outcome === 'accepted') {
        return true
      } else {
        dismissalCount.value++

        const stats = getInstallationStats()
        saveInstallationStats({
          ...stats,
          install_dismissed: stats.install_dismissed + 1,
          last_prompt: Date.now(),
        })

        trackInstallationEvent('install_dismissed', {
          platform: getInstallationStatus().platform,
          dismissal_count: dismissalCount.value,
        })

        return false
      }
    } catch (error: any) {
      log("Erreur lors du prompt d'installation:", error)
      return false
    } finally {
      deferredPrompt.value = null
      isInstallPromptReady.value = false
    }
  }

  /**
   * Afficher un hint subtil pour l'installation
   */
  function showInstallationHint(): void {
    const hintMessage = "Installez l'app pour une meilleure expérience"

    notifications.info(hintMessage, {
      title: '📱 Installation disponible',
      duration: 10000,
      actions: [
        { label: 'Installer maintenant', action: 'install_now' },
        { label: 'Plus tard', action: 'dismiss' },
      ],
    })
  }

  /**
   * Vérifier si on doit montrer le prompt
   */
  function shouldShowInstallPrompt(): boolean {
    const stats = getInstallationStats()
    const timeSinceLastPrompt = Date.now() - stats.last_prompt

    return (
      dismissalCount.value < 3 &&
      timeSinceLastPrompt > 24 * 60 * 60 * 1000 &&
      !getInstallationStatus().isInstalled
    )
  }

  /**
   * Détecter la plateforme
   */
  function detectPlatform(): 'ios' | 'android' | 'desktop' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase()

    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
    if (/android/.test(userAgent)) return 'android'
    if (!/mobi/i.test(userAgent)) return 'desktop'

    return 'unknown'
  }

  /**
   * Vérifier le mode standalone
   */
  function checkStandaloneMode(): boolean {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')

    log(`Mode standalone: ${isStandalone}`)
    return isStandalone
  }

  /**
   * Obtenir le statut d'installation
   */
  function getInstallationStatus(): InstallationStatus {
    const platform = detectPlatform()
    const isStandalone = checkStandaloneMode()

    return {
      isSupported: 'serviceWorker' in navigator,
      canInstall: isInstallPromptReady.value,
      isInstalled: isStandalone,
      isStandalone,
      platform,
    }
  }

  /**
   * Obtenir les statistiques d'installation
   */
  function getInstallationStats(): InstallationStats {
    const saved = localStorage.getItem('pwa_install_stats')

    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        log("Erreur parsing des stats d'installation")
      }
    }

    return {
      prompt_shown: 0,
      install_accepted: 0,
      install_dismissed: 0,
      uninstall_count: 0,
      last_prompt: 0,
    }
  }

  /**
   * Sauvegarder les statistiques d'installation
   */
  function saveInstallationStats(stats: InstallationStats): void {
    localStorage.setItem('pwa_install_stats', JSON.stringify(stats))
  }

  /**
   * Charger les stats au démarrage
   */
  function loadInstallationStats(): void {
    const stats = getInstallationStats()
    dismissalCount.value = stats.install_dismissed
  }

  /**
   * Tracking des événements d'installation
   */
  function trackInstallationEvent(event: string, data: any): void {
    log(`📊 Tracking: ${event}`, data)

    if (typeof gtag !== 'undefined') {
      gtag('event', event, {
        event_category: 'pwa_install',
        event_label: data.platform,
        value: data.attempts || 1,
      })
    }
  }

  /**
   * Forcer le rechargement de la page en mode PWA
   */
  function reloadAsPWA(): void {
    if (getInstallationStatus().isStandalone) {
      window.location.reload()
    } else {
      window.location.href = window.location.href + '?pwa=true'
    }
  }

  /**
   * Détecter si l'utilisateur a désinstallé l'app
   */
  function detectUninstall(): void {
    const wasInstalled = localStorage.getItem('pwa_was_installed') === 'true'
    const isCurrentlyInstalled = getInstallationStatus().isInstalled

    if (wasInstalled && !isCurrentlyInstalled) {
      const stats = getInstallationStats()
      saveInstallationStats({ ...stats, uninstall_count: stats.uninstall_count + 1 })
      trackInstallationEvent('app_uninstalled', { platform: getInstallationStatus().platform })
      localStorage.setItem('pwa_was_installed', 'false')
      log('App désinstallée détectée')
    } else if (!wasInstalled && isCurrentlyInstalled) {
      localStorage.setItem('pwa_was_installed', 'true')
    }
  }

  /**
   * Obtenir les instructions d'installation par plateforme
   */
  function getInstallInstructions(): string {
    const platform = getInstallationStatus().platform

    const instructions: Record<string, string> = {
      ios: 'Pour installer sur iOS :\n1. Ouvrez dans Safari\n2. Appuyez sur Partager\n3. "Sur l\'écran d\'accueil"',
      android:
        'Pour installer sur Android :\n1. Menu du navigateur\n2. "Ajouter à l\'écran d\'accueil"',
      desktop: "Pour installer sur ordinateur :\n1. Icône d'installation dans la barre d'adresse",
    }

    return instructions[platform] ?? 'Instructions non disponibles pour cette plateforme'
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[PWAInstall]', ...args)
  }

  // Computed
  const installationStatus = computed(() => getInstallationStatus())
  const canShowPrompt = computed(() => isInstallPromptReady.value && shouldShowInstallPrompt())
  const installInstructions = computed(() => getInstallInstructions())
  const installationStatsComputed = computed(() => getInstallationStats())

  onMounted(() => {
    initPWAInstall()
    setInterval(detectUninstall, 60000)
  })

  return {
    // State
    deferredPrompt,
    isInstallPromptReady,
    installationAttempts,
    dismissalCount,
    lastPromptTime,
    userDecision,

    // Computed
    installationStatus,
    canShowPrompt,
    installInstructions,
    installationStats: installationStatsComputed,

    // Methods
    initPWAInstall,
    showInstallPrompt,
    showInstallationHint,
    reloadAsPWA,
    getInstallationStatus,
  }
}
