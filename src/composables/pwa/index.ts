// ========================================
// 📱 PWA COMPOSABLES - INDEX
// Export centralisé des composables PWA
// ========================================

// Composables PWA individuels
export { usePWAInstall } from './usePWAInstall'
export { usePWANotifications } from './usePWANotifications'
export { usePWACache } from './usePWACache'
export { usePWABackgroundSync } from './usePWABackgroundSync'
export { usePWADevice } from './usePWADevice'
export { usePWALifecycle } from './usePWALifecycle'

// Orchestrateur principal
export { usePWAOrchestrator } from './usePWAOrchestrator'

// ========================================
// 🚀 COMPOSABLE PWA MASTER SIMPLIFIÉ
// ========================================

import { usePWAOrchestrator } from './usePWAOrchestrator'

/**
 * Composable PWA master simplifié
 * Usage unique pour toutes les fonctionnalités PWA
 */
export function usePWA() {
  const orchestrator = usePWAOrchestrator()

  return {
    // États principaux
    isReady: orchestrator.isReady,
    isOptimal: orchestrator.isOptimal,
    healthScore: orchestrator.healthScore,

    // Installation
    canInstall: orchestrator.install.canShowPrompt,
    showInstallPrompt: orchestrator.install.showInstallPrompt,
    isInstalled: orchestrator.install.installationStatus.value.isInstalled,

    // Notifications
    canNotify: orchestrator.notifications.canRequestPermission,
    requestNotifications: orchestrator.notifications.requestPermission,
    gamingNotifications: orchestrator.notifications.gamingNotifications,

    // Cache
    cacheHealth: orchestrator.cache.cacheHealthy,
    cleanupCache: orchestrator.cache.cleanupCaches,
    cacheSize: orchestrator.cache.formattedCacheSize,

    // Sync
    hasPendingSync: orchestrator.backgroundSync.hasPendingTasks,
    syncNow: orchestrator.backgroundSync.forceSyncNow,
    queueSync: orchestrator.backgroundSync.queueSyncTask,

    // Device
    vibration: orchestrator.device.vibration,
    shareContent: orchestrator.device.shareContent,
    copyToClipboard: orchestrator.device.copyToClipboard,
    deviceCapabilities: orchestrator.device.capabilities,

    // Lifecycle
    sessionDuration: orchestrator.lifecycle.sessionDuration,
    isEngagedUser: orchestrator.lifecycle.isEngagedUser,

    // Actions
    init: orchestrator.initPWAOrchestrator,
    restart: orchestrator.restartPWA,
    optimize: orchestrator.optimizePWA,

    // Sub-composables pour usage avancé
    install: orchestrator.install,
    notifications: orchestrator.notifications,
    cache: orchestrator.cache,
    backgroundSync: orchestrator.backgroundSync,
    device: orchestrator.device,
    lifecycle: orchestrator.lifecycle
  }
}
