import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/ui'

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
    // Listener pour l'événement beforeinstallprompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listener pour l'événement appinstalled
    window.addEventListener('appinstalled', handleAppInstalled)

    // Listener pour détecter si l'app est utilisée en standalone
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

    log('Prompt d\'installation disponible')

    // Sauvegarder les stats
    saveInstallationStats({
      ...getInstallationStats(),
      prompt_shown: getInstallationStats().prompt_shown + 1
    })

    // Décider si montrer le prompt automatiquement
    if (shouldShowInstallPrompt()) {
      showInstallationHint()
    }
  }

  /**
   * Gérer l'événement appinstalled
   */
  function handleAppInstalled(): void {
    deferredPrompt.value = null
    isInstallPromptReady.value = false

    notifications.success('🎉 App installée avec succès !', {
      title: '📱 Installation PWA',
      duration: 6000,
      actions: [
        { label: 'Découvrir les fonctionnalités', action: 'tour', url: '/onboarding' }
      ]
    })

    // Sauvegarder les stats
    const stats = getInstallationStats()
    saveInstallationStats({
      ...stats,
      install_accepted: stats.install_accepted + 1
    })

    // Tracking analytics
    trackInstallationEvent('app_installed', {
      platform: getInstallationStatus().platform,
      attempts: installationAttempts.value,
      time_to_install: Date.now() - lastPromptTime.value
    })

    log('App installée avec succès')
  }

  /**
   * Afficher le prompt d'installation
   */
  async function showInstallPrompt(): Promise<boolean> {
    if (!deferredPrompt.value) {
      log('Aucun prompt d\'installation disponible')
      return false
    }

    installationAttempts.value++
    lastPromptTime.value = Date.now()

    try {
      // Déclencher le prompt d'installation
      await deferredPrompt.value.prompt()

      // Attendre la décision de l'utilisateur
      const choiceResult = await deferredPrompt.value.userChoice
      userDecision.value = choiceResult.outcome

      log(`Décision utilisateur: ${choiceResult.outcome}`)

      // Traitement selon la décision
      if (choiceResult.outcome === 'accepted') {
        // L'installation sera gérée par l'événement appinstalled
        return true
      } else {
        dismissalCount.value++

        // Sauvegarder le refus
        const stats = getInstallationStats()
        saveInstallationStats({
          ...stats,
          install_dismissed: stats.install_dismissed + 1,
          last_prompt: Date.now()
        })

        // Tracking du refus
        trackInstallationEvent('install_dismissed', {
          platform: getInstallationStatus().platform,
          dismissal_count: dismissalCount.value
        })

        return false
      }
    } catch (error: any) {
      log('Erreur lors du prompt d\'installation:', error)
      return false
    } finally {
      // Nettoyage
      deferredPrompt.value = null
      isInstallPromptReady.value = false
    }
  }

  /**
   * Afficher un hint subtil pour l'installation
   */
  function showInstallationHint(): void {
    const platform = getInstallationStatus().platform

    let hintMessage = 'Installez l\'app pour une meilleure expérience'
    let instructions = ''

    switch (platform) {
      case 'ios':
        instructions = 'Appuyez sur le bouton Partager puis "Sur l\'écran d\'accueil"'
        break
      case 'android':
        instructions = 'Utilisez le menu du navigateur ou le bouton d\'installation'
        break
      case 'desktop':
        instructions = 'Cliquez sur l\'icône d\'installation dans la barre d\'adresse'
        break
    }

    notifications.info(hintMessage, {
      title: '📱 Installation disponible',
      duration: 10000,
      actions: [
        { label: 'Installer maintenant', action: 'install_now' },
        { label: 'Plus tard', action: 'dismiss' }
      ]
    })
  }

  /**
   * Vérifier si on doit montrer le prompt
   */
  function shouldShowInstallPrompt(): boolean {
    const stats = getInstallationStats()
    const timeSinceLastPrompt = Date.now() - stats.last_prompt

    // Critères pour montrer le prompt:
    // - Moins de 3 refus
    // - Au moins 24h depuis le dernier prompt
    // - Pas déjà installé
    return dismissalCount.value < 3 &&
      timeSinceLastPrompt > 24 * 60 * 60 * 1000 &&
      !getInstallationStatus().isInstalled
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
      platform
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
      } catch (error) {
        log('Erreur parsing des stats d\'installation')
      }
    }

    return {
      prompt_shown: 0,
      install_accepted: 0,
      install_dismissed: 0,
      uninstall_count: 0,
      last_prompt: 0
    }
  }

  /**
   * Sauvegarder les statistiques d'installation
   */
  function saveInstallationStats(stats: InstallationStats): void {
    localStorage.setItem('pwa_install_stats', JSON.stringify(stats))
  }

  /**
   * Tracking des événements d'installation
   */
  function trackInstallationEvent(event: string, data: any): void {
    // Intégration avec votre système d'analytics
    log(`📊 Tracking: ${event}`, data)

    // Exemple d'intégration Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', event, {
        event_category: 'pwa_install',
        event_label: data.platform,
        value: data.attempts || 1
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
    // Cette méthode est appelée périodiquement pour détecter si l'app a été désinstallée
    const wasInstalled = localStorage.getItem('pwa_was_installed') === 'true'
    const isCurrentlyInstalled = getInstallationStatus().isInstalled

    if (wasInstalled && !isCurrentlyInstalled) {
      // L'app a été désinstallée
      const stats = getInstallationStats()
      saveInstallationStats({
        ...stats,
        uninstall_count: stats.uninstall_count + 1
      })

      trackInstallationEvent('app_uninstalled', {
        platform: getInstallationStatus().platform
      })

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

    const instructions = {
      ios: `
        Pour installer sur iOS :
        1. Ouvrez cette page dans Safari
        2. Appuyez sur le bouton Partager (carré avec flèche)
        3. Faites défiler et appuyez sur "Sur l'écran d'accueil"
        4. Appuyez sur "Ajouter" pour confirmer
      `,
      android: `
        Pour installer sur Android :
        1. Ouvrez le menu de votre navigateur (⋮)
        2. Appuyez sur "Ajouter à l'écran d'accueil" ou "Installer l'app"
        3. Confirmez l'installation
      `,
      desktop: `
        Pour installer sur ordinateur :
        1. Recherchez l'icône d'installation dans la barre d'adresse
        2. Cliquez dessus ou utilisez le menu du navigateur
        3. Sélectionnez "Installer Budget Gaming"
      `
    }

    return instructions[platform] || 'Instructions d\'installation non disponibles pour cette plateforme'
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[PWAInstall]', ...args)
  }

  // Computed properties
  const installationStatus = computed(() => getInstallationStatus())

  const canShowPrompt = computed(() =>
    isInstallPromptReady.value && shouldShowInstallPrompt()
  )

  const installInstructions = computed(() => getInstallInstructions())

  const installationStatsComputed = computed(() => getInstallationStats())

  // Auto-init
  onMounted(() => {
    initPWAInstall()

    // Vérification périodique de désinstallation
    setInterval(detectUninstall, 60000) // Toutes les minutes
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
    getInstallationStatus
  }
}
