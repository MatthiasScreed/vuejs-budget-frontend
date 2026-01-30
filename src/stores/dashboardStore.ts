// src/stores/dashboardStore.ts - VERSION CORRIGÉE AVEC AUTH GUARD
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

// ==========================================
// TYPES - ✅ Alignés avec DashboardController
// ==========================================

export interface CurrentMonthStats {
  income: number
  expenses: number
  net: number
  transactions_count: number
}

export interface SavingsCapacityInfo {
  amount: number
  is_positive: boolean
  calculation: {
    total_balance: number
    monthly_expenses: number
    formula: string
  }
}

export interface ComparisonStats {
  last_month_capacity: number
  current_month_capacity: number
  change_percent: number
  trend: 'up' | 'down' | 'stable'
}

export interface CapacityStatus {
  status: 'excellent' | 'warning' | 'deficit' | 'insufficient' | 'not_configured'
  message: string
  surplus?: number
  deficit?: number
  color: string
}

export interface GoalsStats {
  active_count: number
  goals_with_target: number
  available_capacity: number
  total_monthly_targets: number
  total_saved: number
  total_target: number
  capacity_status: CapacityStatus
}

export interface StreakInfo {
  days: number
  type: string
  best: number
}

export interface PeriodInfo {
  start: string
  end: string
  label: string
}

export interface UserInfo {
  level: number
  xp: number
  achievements: number
}

export interface DashboardStats {
  total_balance: number
  savings_capacity: SavingsCapacityInfo
  current_month: CurrentMonthStats
  comparison: ComparisonStats
  goals: GoalsStats
  streak: StreakInfo | null
  period: PeriodInfo
  user: UserInfo
}

// ==========================================
// STORE DEFINITION
// ==========================================

export const useDashboardStore = defineStore('dashboard', () => {
  // ==========================================
  // STATE
  // ==========================================

  const stats = ref<DashboardStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // ==========================================
  // 🔐 AUTH GUARD HELPER
  // ==========================================

  /**
   * Vérifier que l'utilisateur est authentifié avant un appel API
   */
  async function ensureAuthenticated(): Promise<boolean> {
    const authStore = useAuthStore()

    // 1️⃣ Attendre l'initialisation de l'auth
    if (!authStore.isInitialized) {
      console.log('⏳ [Dashboard] Attente initialisation auth...')

      let attempts = 0
      const maxAttempts = 30 // 3 secondes max

      while (!authStore.isInitialized && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 100))
        attempts++
      }

      if (!authStore.isInitialized) {
        console.error('❌ [Dashboard] Auth non initialisée après timeout')
        return false
      }
    }

    // 2️⃣ Vérifier l'authentification
    if (!authStore.isAuthenticated) {
      console.warn('⚠️ [Dashboard] Utilisateur non authentifié')
      return false
    }

    console.log('✅ [Dashboard] Utilisateur authentifié:', authStore.user?.email)
    return true
  }

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * Vérifier si les données sont disponibles
   */
  const hasData = computed(() => stats.value !== null)

  /**
   * Vérifier si les données sont récentes (< 5 min)
   */
  const isDataFresh = computed(() => {
    if (!lastUpdated.value) return false
    const now = new Date()
    const diff = now.getTime() - lastUpdated.value.getTime()
    return diff < 5 * 60 * 1000
  })

  // ==========================================
  // FINANCIER
  // ==========================================

  /**
   * Solde bancaire total
   */
  const totalBalance = computed(() => stats.value?.total_balance ?? 0)

  /**
   * ✅ Capacité d'épargne (Solde - Dépenses du mois)
   */
  const savingsCapacity = computed(() => stats.value?.savings_capacity.amount ?? 0)

  /**
   * Capacité d'épargne est positive ?
   */
  const isPositive = computed(() => stats.value?.savings_capacity.is_positive ?? true)

  /**
   * Détails du calcul de capacité
   */
  const capacityCalculation = computed(
    () =>
      stats.value?.savings_capacity.calculation ?? {
        total_balance: 0,
        monthly_expenses: 0,
        formula: '',
      },
  )

  /**
   * Revenus du mois actuel
   */
  const monthlyIncome = computed(() => stats.value?.current_month.income ?? 0)

  /**
   * Dépenses du mois actuel
   */
  const monthlyExpenses = computed(() => stats.value?.current_month.expenses ?? 0)

  /**
   * Net du mois (Revenus - Dépenses)
   */
  const monthlyNet = computed(() => stats.value?.current_month.net ?? 0)

  /**
   * Nombre de transactions du mois
   */
  const transactionCount = computed(() => stats.value?.current_month.transactions_count ?? 0)

  /**
   * ✅ Taux d'épargne basé sur la capacité / revenus
   */
  const savingsRate = computed(() => {
    const income = monthlyIncome.value
    const capacity = savingsCapacity.value

    if (income === 0) return 0

    return Math.round((capacity / income) * 100)
  })

  // ==========================================
  // COMPARAISON
  // ==========================================

  /**
   * Comparaison avec le mois dernier
   */
  const comparison = computed(
    () =>
      stats.value?.comparison ?? {
        last_month_capacity: 0,
        current_month_capacity: 0,
        change_percent: 0,
        trend: 'stable' as const,
      },
  )

  /**
   * Changement en %
   */
  const changePercent = computed(() => comparison.value.change_percent)

  /**
   * Tendance (up/down/stable)
   */
  const trend = computed(() => comparison.value.trend)

  // ==========================================
  // OBJECTIFS
  // ==========================================

  /**
   * Nombre d'objectifs actifs
   */
  const activeGoalsCount = computed(() => stats.value?.goals.active_count ?? 0)

  /**
   * Nombre d'objectifs avec contribution mensuelle
   */
  const goalsWithTarget = computed(() => stats.value?.goals.goals_with_target ?? 0)

  /**
   * Montant disponible pour objectifs
   */
  const availableToAllocate = computed(() => stats.value?.goals.available_capacity ?? 0)

  /**
   * Total des contributions mensuelles
   */
  const totalMonthlyTargets = computed(() => stats.value?.goals.total_monthly_targets ?? 0)

  /**
   * Total épargné sur les objectifs
   */
  const totalSaved = computed(() => stats.value?.goals.total_saved ?? 0)

  /**
   * Total des objectifs
   */
  const totalTarget = computed(() => stats.value?.goals.total_target ?? 0)

  /**
   * Status de la capacité vs contributions
   */
  const capacityStatus = computed(
    () =>
      stats.value?.goals.capacity_status ?? {
        status: 'not_configured',
        message: 'Pas de données',
        color: 'gray',
      },
  )

  // ==========================================
  // GAMING
  // ==========================================

  /**
   * Série active
   */
  const activeStreak = computed(() => stats.value?.streak ?? null)

  // ==========================================
  // PÉRIODE & USER
  // ==========================================

  /**
   * Informations de période
   */
  const period = computed(
    () =>
      stats.value?.period ?? {
        start: '',
        end: '',
        label: '',
      },
  )

  /**
   * Informations utilisateur
   */
  const user = computed(() => {
    const userInfo = stats.value?.user

    if (!userInfo) {
      return {
        level: 1,
        xp: 0,
        achievements: 0,
      }
    }

    return {
      level: typeof userInfo.level === 'number' ? userInfo.level : 1,
      xp: typeof userInfo.xp === 'number' ? userInfo.xp : 0,
      achievements: typeof userInfo.achievements === 'number' ? userInfo.achievements : 0,
    }
  })

  // ==========================================
  // HELPERS
  // ==========================================

  /**
   * Solde formaté avec info
   */
  const balanceInfo = computed(() => {
    const balance = totalBalance.value
    return {
      amount: balance,
      color: balance >= 0 ? 'success' : 'danger',
      icon: balance >= 0 ? '💰' : '⚠️',
      formatted: formatCurrency(balance),
    }
  })

  /**
   * Capacité formatée avec info
   */
  const capacityInfo = computed(() => {
    const capacity = savingsCapacity.value
    return {
      amount: capacity,
      color: capacity >= 0 ? 'success' : 'danger',
      icon: capacity >= 0 ? '🎯' : '⚠️',
      formatted: formatCurrency(capacity),
      rate: savingsRate.value,
    }
  })

  /**
   * Résumé pour debug
   */
  const summary = computed(() => ({
    hasData: hasData.value,
    isDataFresh: isDataFresh.value,
    lastUpdated: lastUpdated.value?.toLocaleString('fr-FR'),
    balance: totalBalance.value,
    savingsCapacity: savingsCapacity.value,
    monthlyIncome: monthlyIncome.value,
    monthlyExpenses: monthlyExpenses.value,
    activeGoals: activeGoalsCount.value,
    level: user.value.level,
    xp: user.value.xp,
  }))

  // ==========================================
  // ACTIONS - AVEC AUTH GUARD
  // ==========================================

  /**
   * Charger les statistiques du dashboard
   * 🔐 Protégé par auth guard
   */
  async function fetchStats(refresh: boolean = false): Promise<void> {
    // 🔐 VÉRIFICATION AUTH AVANT APPEL API
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Dashboard] fetchStats annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return
    }

    // Éviter les appels multiples simultanés
    if (loading.value) {
      console.log('⏳ [Dashboard] Chargement déjà en cours, ignoré')
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('📊 [Dashboard] Chargement des stats...')

      const response = await api.get<DashboardStats>('/dashboard/stats', {
        params: { refresh },
      })

      if (!response) {
        throw new Error("Aucune réponse de l'API")
      }

      if (response.success && response.data) {
        stats.value = response.data
        lastUpdated.value = new Date()

        console.log('✅ [Dashboard] Stats chargées:', {
          balance: response.data.total_balance,
          savingsCapacity: response.data.savings_capacity.amount,
          income: response.data.current_month.income,
          expenses: response.data.current_month.expenses,
          goals: response.data.goals.active_count,
        })
      } else {
        console.warn('⚠️ [Dashboard] Stats non disponibles')
        stats.value = null
      }
    } catch (err: any) {
      console.error('❌ [Dashboard] Erreur chargement stats:', err)

      // Ne pas considérer les erreurs 401 comme des erreurs dashboard
      if (err.response?.status === 401) {
        console.log('🔐 [Dashboard] 401 détecté - session expirée')
        error.value = 'Session expirée'
      } else {
        error.value = err.message || 'Erreur lors du chargement des statistiques'
      }

      stats.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger toutes les données
   * 🔐 Protégé par auth guard
   */
  async function fetchAll(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Dashboard] fetchAll annulé - utilisateur non authentifié')
      return
    }

    console.log('🔄 [Dashboard] Chargement complet dashboard...')
    await fetchStats()
    console.log('✅ [Dashboard] Dashboard chargé')
  }

  /**
   * Rafraîchir le dashboard
   * 🔐 Protégé par auth guard
   */
  async function refresh(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Dashboard] refresh annulé - utilisateur non authentifié')
      return
    }

    console.log('🔄 [Dashboard] Rafraîchissement dashboard...')

    try {
      const response = await api.post<DashboardStats>('/dashboard/refresh')

      if (response?.success && response.data) {
        stats.value = response.data
        lastUpdated.value = new Date()
        console.log('✅ [Dashboard] Dashboard rafraîchi')
      } else {
        console.log('⚠️ [Dashboard] Refresh API failed, fallback sur fetchAll')
        await fetchAll()
      }
    } catch (err) {
      console.error('❌ [Dashboard] Erreur refresh, fallback sur fetchAll')
      await fetchAll()
    }
  }

  /**
   * Réinitialiser le store
   */
  function $reset(): void {
    stats.value = null
    loading.value = false
    error.value = null
    lastUpdated.value = null
    console.log('🔄 [Dashboard] Store réinitialisé')
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Formater un montant en euros
   */
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  /**
   * Formater un pourcentage
   */
  function formatPercent(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    stats,
    loading,
    error,
    lastUpdated,

    // Getters - Financier
    hasData,
    isDataFresh,
    totalBalance,
    savingsCapacity,
    isPositive,
    capacityCalculation,
    monthlyIncome,
    monthlyExpenses,
    monthlyNet,
    transactionCount,
    savingsRate,

    // Getters - Comparaison
    comparison,
    changePercent,
    trend,

    // Getters - Objectifs
    activeGoalsCount,
    goalsWithTarget,
    availableToAllocate,
    totalMonthlyTargets,
    totalSaved,
    totalTarget,
    capacityStatus,

    // Getters - Gaming & Autres
    activeStreak,
    period,
    user,

    // Getters - Helpers
    balanceInfo,
    capacityInfo,
    summary,

    // Actions
    fetchStats,
    fetchAll,
    refresh,
    $reset,

    // Utilitaires
    formatCurrency,
    formatPercent,
  }
})

export default useDashboardStore
