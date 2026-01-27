/**
 * ==========================================
 * DÉTECTEUR D'ENVIRONNEMENT INTELLIGENT
 * ==========================================
 * S'adapte automatiquement selon ton emplacement
 * (Maison, Bureau, Local, Expose, etc.)
 */

export type DeploymentMode = 'local' | 'expose' | 'ngrok' | 'production'

interface EnvironmentConfig {
  mode: DeploymentMode
  apiBaseUrl: string
  appUrl: string
  isSecure: boolean
  isTunneled: boolean
}

class EnvironmentDetector {
  private config: EnvironmentConfig | null = null

  /**
   * Détecter automatiquement l'environnement
   */
  detect(): EnvironmentConfig {
    if (this.config) {
      return this.config
    }

    const hostname = window.location.hostname
    const protocol = window.location.protocol
    const port = window.location.port

    console.log('🔍 Détection environnement...', {
      hostname,
      protocol,
      port,
      origin: window.location.origin
    })

    // 1. Vérifier si mode forcé dans .env
    const forcedMode = import.meta.env.VITE_DEPLOYMENT_MODE
    if (forcedMode && forcedMode !== 'auto') {
      this.config = this.getConfigForMode(forcedMode as DeploymentMode)
      console.log('✅ Mode forcé détecté:', forcedMode)
      return this.config
    }

    // 2. Vérifier si URL API explicite fournie
    const explicitApiUrl = import.meta.env.VITE_API_BASE_URL
    if (explicitApiUrl) {
      this.config = {
        mode: this.detectModeFromUrl(explicitApiUrl),
        apiBaseUrl: explicitApiUrl,
        appUrl: window.location.origin,
        isSecure: explicitApiUrl.startsWith('https'),
        isTunneled: this.isTunneledUrl(explicitApiUrl)
      }
      console.log('✅ URL API explicite fournie')
      return this.config
    }

    // 3. Détection automatique basée sur l'URL
    this.config = this.autoDetect(hostname, protocol, port)

    console.log('✅ Environnement détecté:', this.config)
    return this.config
  }

  /**
   * Détection automatique intelligente
   */
  private autoDetect(hostname: string, protocol: string, port: string): EnvironmentConfig {
    // Production (domaine personnalisé HTTPS)
    if (hostname.includes('coinquest.app') || hostname.includes('yourdomain.com')) {
      return this.getConfigForMode('production')
    }

    // Expose (URLs sharedwithexpose.com)
    if (hostname.includes('sharedwithexpose.com')) {
      return this.getConfigForMode('expose')
    }

    // Ngrok
    if (hostname.includes('ngrok') || hostname.includes('ngrok-free.app')) {
      return this.getConfigForMode('ngrok')
    }

    // Localhost / IP locale
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      this.isLocalIp(hostname)
    ) {
      return this.getConfigForMode('local')
    }

    // Fallback: local
    console.warn('⚠️ Impossible de détecter l\'environnement, utilisation du mode local')
    return this.getConfigForMode('local')
  }

  /**
   * Obtenir la config pour un mode spécifique
   */
  private getConfigForMode(mode: DeploymentMode): EnvironmentConfig {
    const configs: Record<DeploymentMode, () => EnvironmentConfig> = {
      local: () => ({
        mode: 'local',
        apiBaseUrl: this.getEnvVar('VITE_API_BASE_URL_LOCAL') || this.buildLocalApiUrl(),
        appUrl: window.location.origin,
        isSecure: false,
        isTunneled: false
      }),

      expose: () => ({
        mode: 'expose',
        apiBaseUrl: this.getEnvVar('VITE_API_BASE_URL_EXPOSE') || this.buildExposeApiUrl(),
        appUrl: window.location.origin,
        isSecure: true,
        isTunneled: true
      }),

      ngrok: () => ({
        mode: 'ngrok',
        apiBaseUrl: this.getEnvVar('VITE_API_BASE_URL_NGROK') || this.buildNgrokApiUrl(),
        appUrl: window.location.origin,
        isSecure: true,
        isTunneled: true
      }),

      production: () => ({
        mode: 'production',
        apiBaseUrl: this.getEnvVar('VITE_API_BASE_URL_PRODUCTION') || 'https://api.coinquest.app/api',
        appUrl: window.location.origin,
        isSecure: true,
        isTunneled: false
      })
    }

    return configs[mode]()
  }

  /**
   * Construire l'URL API locale automatiquement
   */
  private buildLocalApiUrl(): string {
    // Essayer de détecter l'IP locale
    const hostname = window.location.hostname

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000/api'
    }

    // Utiliser l'IP actuelle du frontend pour deviner l'IP du backend
    if (this.isLocalIp(hostname)) {
      // Supposer que le backend est sur la même machine, port 8000
      return `http://${hostname}:8000/api`
    }

    // Fallback: Herd domain (.test)
    return 'http://coinquest-api.test/api'
  }

  /**
   * Construire l'URL Expose automatiquement
   */
  private buildExposeApiUrl(): string {
    const subdomain = import.meta.env.VITE_EXPOSE_SUBDOMAIN || 'coinquest-api'
    return `https://${subdomain}.sharedwithexpose.com/api`
  }

  /**
   * Construire l'URL Ngrok automatiquement
   */
  private buildNgrokApiUrl(): string {
    // Ngrok URLs doivent être configurées manuellement
    console.warn('⚠️ Ngrok URL non configurée dans .env')
    return 'http://localhost:8000/api'
  }

  /**
   * Vérifier si c'est une IP locale
   */
  private isLocalIp(hostname: string): boolean {
    return (
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname === '127.0.0.1' ||
      hostname === 'localhost'
    )
  }

  /**
   * Vérifier si l'URL utilise un tunnel
   */
  private isTunneledUrl(url: string): boolean {
    return (
      url.includes('sharedwithexpose.com') ||
      url.includes('ngrok') ||
      url.includes('localtunnel.me')
    )
  }

  /**
   * Détecter le mode depuis une URL
   */
  private detectModeFromUrl(url: string): DeploymentMode {
    if (url.includes('sharedwithexpose.com')) return 'expose'
    if (url.includes('ngrok')) return 'ngrok'
    if (url.startsWith('https://api.')) return 'production'
    return 'local'
  }

  /**
   * Obtenir une variable d'environnement
   */
  private getEnvVar(key: string): string | undefined {
    return import.meta.env[key]
  }

  /**
   * Obtenir la config actuelle
   */
  getConfig(): EnvironmentConfig {
    return this.detect()
  }

  /**
   * Obtenir l'URL complète de l'API
   */
  getApiUrl(): string {
    return this.detect().apiBaseUrl
  }

  /**
   * Vérifier si on est en HTTPS
   */
  isSecure(): boolean {
    return this.detect().isSecure
  }

  /**
   * Vérifier si on utilise un tunnel
   */
  isTunneled(): boolean {
    return this.detect().isTunneled
  }

  /**
   * Obtenir les URLs de callback pour Bridge
   */
  getBridgeUrls(): {
    callbackUrl: string
    webhookUrl: string
  } {
    const config = this.detect()
    const baseUrl = config.appUrl

    return {
      callbackUrl: `${baseUrl}/banking/callback`,
      webhookUrl: `${config.apiBaseUrl.replace('/api', '')}/api/banking/webhook`
    }
  }

  /**
   * Afficher les informations de debug
   */
  debugInfo(): void {
    const config = this.detect()

    console.group('🔍 Environment Configuration')
    console.log('Mode:', config.mode)
    console.log('API Base URL:', config.apiBaseUrl)
    console.log('App URL:', config.appUrl)
    console.log('Is Secure:', config.isSecure ? '✅ HTTPS' : '⚠️ HTTP')
    console.log('Is Tunneled:', config.isTunneled ? '✅ Yes' : '❌ No')
    console.log('Bridge URLs:', this.getBridgeUrls())
    console.groupEnd()
  }

  /**
   * Forcer un refresh de la détection
   */
  refresh(): void {
    this.config = null
    this.detect()
  }
}

// Export instance unique (singleton)
export const envDetector = new EnvironmentDetector()

// Export pour utilisation facile
export default envDetector
