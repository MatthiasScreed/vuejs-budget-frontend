// ==========================================
// STORES EXPORTS - VERSION CORRIGÉE
// ==========================================

// Stores principaux
export { useAppStore } from './appStore'
export { useAuthStore } from './authStore'

// Stores fonctionnels
export { useTransactionStore } from './transactionStore'
export { useGoalStore } from './goalStore'
export { useCategoryStore } from './categoryStore'
export { useProjectStore } from './projectStore'

// Stores gaming
export { useAchievementStore } from './achievementStore'
export { useLevelStore } from './levelStore'
// TODO: Réactiver quand le backend /api/gaming/challenges sera implémenté
// export { useChallengeStore } from './challengeStore'
export { useStreakStore } from './streakStore'

// Stores système
export { useNotificationStore } from './notificationStore'
export { useBankingStore } from './banking'  // ✅ CORRECTION: banking.ts et non bankingStore.ts
export { useDashboardStore } from './dashboardStore'
export { useSavingsCapacityStore } from './savingsCapacityStore'  // ✅ NOUVEAU

// Store legacy gaming (à garder pour compatibilité)
export { useGamingStore } from './gamingStore'

// ==========================================
// HELPERS D'INITIALISATION
// ==========================================

/**
 * Initialiser tous les stores critiques
 */
export async function initializeCoreStores() {
  const authStore = useAuthStore()

  await authStore.initAuth()

  if (authStore.isAuthenticated) {
    const transactionStore = useTransactionStore()
    const categoryStore = useCategoryStore()
    const goalStore = useGoalStore()

    await Promise.allSettled([
      categoryStore.fetchCategories(),
      transactionStore.fetchTransactions(),
      goalStore.fetchGoals()
    ])
  }
}

/**
 * Initialiser les stores gaming
 */
export async function initializeGamingStores() {
  const achievementStore = useAchievementStore()
  const levelStore = useLevelStore()

  await Promise.allSettled([
    achievementStore.loadAchievementData(),
    levelStore.fetchUserLevel()
  ])
}

/**
 * Reset tous les stores
 */
export function resetAllStores() {
  const stores = [
    useAuthStore(),
    useTransactionStore(),
    useGoalStore(),
    useAchievementStore(),
    useLevelStore(),
    useCategoryStore(),
    useProjectStore(),
    useNotificationStore(),
    useBankingStore(),
    useDashboardStore()
  ]

  stores.forEach(store => {
    if (store.$reset) {
      store.$reset()
    }
  })
}
