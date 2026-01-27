// ==========================================
// CORE COMPOSABLES - Fondamentaux
// ==========================================
export { useApi } from './core/useApi'
export { useAuth } from './core/useAuth'
export { useCache } from './core/useCache'
export { useErrorHandler } from './core/useErrorHandler'
export { useLocalStorage, useLocalStorageObject, useLocalStorageArray, useLocalStorageCache } from './core/useLocalStorage'

// ==========================================
// BUSINESS LOGIC - Logique métier
// ==========================================
export { useTransactionFlow } from './business/useTransactionFlow'
export { useGoals } from './business/useGoals'
export { useCategories } from './business/useCategories'
export { useAnalytics } from './business/useAnalytics'
export { useBudget } from './business/useBudget'
export { useProjects } from './business/useProjects'
export { useReports } from './business/useReports'

// ==========================================
// GAMING SYSTEM - Système de gamification
// ==========================================
export { useGaming } from './gaming/useGaming'
export { useXP } from './gaming/useXP'
export { useAchievements } from './gaming/useAchievements'
export { useChallenges } from './gaming/useChallenges'
export { useStreaks } from './gaming/useStreaks'
export { useLeaderboard } from './gaming/useLeaderboard'

// ==========================================
// UI & UX - Interface utilisateur
// ==========================================
export { useForm } from './ui/useForm'
export { useValidation } from './ui/useValidation'
export { useFormatting } from './ui/useFormatting'
export { usePagination } from './ui/usePagination'
export { useConfirm } from './ui/useConfirm'
export { useDebounce, useSearch, useValidationDebounce, useAutoSave, useScrollDebounce } from './ui/useDebounce'
export { useNotifications } from './ui/useNotifications'
export { useAsync, useAsyncList, useAsyncCache } from './ui/useAsync'

// ==========================================
// ADVANCED - Fonctionnalités avancées
// ==========================================
export { useWebSocket } from './advanced/useWebSocket'
export { usePWA } from './pwa/usePWA.ts'
export { useOffline } from './advanced/useOffline'

// ==========================================
// TYPES EXPORTS - Pour faciliter l'import
// ==========================================
export type {
  // Core types
  ApiResponse,
  ValidationResult,
  CacheConfig,

  // Business types
  Transaction,
  FinancialGoal,
  Category,

  // Gaming types
  Achievement,
  Challenge,
  UserLevel,
  GamingStats,
  XPResult,

  // Form types
  LoginForm,
  RegisterForm,
  TransactionForm,
  GoalForm,
  CategoryForm
} from '@/types'

// ==========================================
// BARREL EXPORTS PAR DOMAINE
// ==========================================

// Core barrel export
export * as Core from './core'

// Business barrel export
export * as Business from './business'

// Gaming barrel export
export * as Gaming from './gaming'

// UI barrel export
export * as UI from './ui'

// Advanced barrel export
export * as Advanced from './advanced'

// ==========================================
// COMPOSABLES COMBINÉS - Shortcuts
// ==========================================

/**
 * Composable combiné pour dashboard
 * Combine business + gaming + analytics
 */
export function useDashboard() {
  return {
    ...useTransactionFlow(),
    ...useGaming(),
    ...useAnalytics(),
    ...useBudget()
  }
}

/**
 * Composable combiné pour forms avancés
 * Combine validation + formatting + error handling + debounce
 */
export function useSmartForm<T extends Record<string, any>>(config: any) {
  return {
    ...useForm<T>(config),
    ...useValidation(),
    ...useFormatting(),
    ...useDebounce()
  }
}

/**
 * Composable combiné pour gaming complet
 * Combine tous les aspects du gaming
 */
export function useGamingComplete() {
  return {
    ...useGaming(),
    ...useXP(),
    ...useAchievements(),
    ...useChallenges(),
    ...useStreaks(),
    ...useLeaderboard(),
    ...useNotifications()
  }
}

/**
 * Composable combiné pour gestion financière complète
 * Combine transactions + goals + budget + analytics
 */
export function useFinancialManagement() {
  return {
    ...useTransactionFlow(),
    ...useGoals(),
    ...useBudget(),
    ...useCategories(),
    ...useAnalytics()
  }
}

/**
 * Composable combiné pour projets complets
 * Combine projects + reports + goals
 */
export function useProjectManagement() {
  return {
    ...useProjects(),
    ...useGoals(),
    ...useReports()
  }
}

/**
 * Composable combiné pour UI complète
 * Combine tous les outils UI/UX
 */
export function useCompleteUI() {
  return {
    ...useForm(),
    ...useValidation(),
    ...useFormatting(),
    ...usePagination(),
    ...useConfirm(),
    ...useDebounce(),
    ...useNotifications(),
    ...useAsync()
  }
}
