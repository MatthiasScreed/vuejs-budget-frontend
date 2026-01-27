import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useTransactionStore } from './transactionStore'
import { useGoalStore } from './goalStore'
import { storeToRefs } from 'pinia'

// ==========================================
// TYPES
// ==========================================

export interface SavingsCapacity {
  monthly_income: number
  monthly_expenses: number
  available_savings: number  // ✅ LE CHIFFRE CLÉ !
  savings_rate: number        // % d'épargne
  health_status: 'excellent' | 'good' | 'warning' | 'critical'
}

export interface GoalAllocation {
  goal_id: number
  goal_name: string
  monthly_amount: number
  months_to_complete: number
  priority: number
  is_achievable: boolean
}

export interface SavingsStrategy {
  total_available: number
  total_allocated: number
  remaining: number
  allocations: GoalAllocation[]
  recommendations: string[]
}

export interface BudgetRecommendation {
  type: 'increase_income' | 'reduce_expenses' | 'adjust_goals' | 'optimize_allocation'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: number  // Impact en € par mois
  icon: string
}

// ==========================================
// STORE
// ==========================================

export const useSavingsCapacityStore = defineStore('savingsCapacity', () => {
  const transactionStore = useTransactionStore()
  const goalStore = useGoalStore()

  const { transactions } = storeToRefs(transactionStore)
  const { goals } = storeToRefs(goalStore)

  // ==========================================
  // STATE
  // ==========================================

  const customMonthlyIncome = ref<number | null>(null)  // Override manuel
  const customMonthlyExpenses = ref<number | null>(null)
  const selectedPeriod = ref<'1' | '3' | '6' | '12'>('3')  // Mois pour calcul moyenne

  // ==========================================
  // COMPUTED - CALCULS FINANCIERS
  // ==========================================

  /**
   * ✅ REVENUS MENSUELS MOYENS (sur période sélectionnée)
   */
  const averageMonthlyIncome = computed(() => {
    // Si override manuel, utiliser ça
    if (customMonthlyIncome.value !== null) {
      return customMonthlyIncome.value
    }

    const months = parseInt(selectedPeriod.value)
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - months)

    const recentIncomes = transactions.value
      .filter(t => t.type === 'income' && new Date(t.transaction_date) >= cutoffDate)

    if (recentIncomes.length === 0) return 0

    const total = recentIncomes.reduce((sum, t) => {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

    return total / months
  })

  /**
   * ✅ DÉPENSES MENSUELLES MOYENNES (sur période sélectionnée)
   */
  const averageMonthlyExpenses = computed(() => {
    // Si override manuel, utiliser ça
    if (customMonthlyExpenses.value !== null) {
      return customMonthlyExpenses.value
    }

    const months = parseInt(selectedPeriod.value)
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - months)

    const recentExpenses = transactions.value
      .filter(t => t.type === 'expense' && new Date(t.transaction_date) >= cutoffDate)

    if (recentExpenses.length === 0) return 0

    const total = recentExpenses.reduce((sum, t) => {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

    return total / months
  })

  /**
   * 💎 CAPACITÉ D'ÉPARGNE MENSUELLE (LE CHIFFRE CLÉ !)
   */
  const savingsCapacity = computed((): SavingsCapacity => {
    const income = averageMonthlyIncome.value
    const expenses = averageMonthlyExpenses.value
    const available = income - expenses

    // Calculer le taux d'épargne
    const rate = income > 0 ? (available / income) * 100 : 0

    // Déterminer l'état de santé financière
    let health: 'excellent' | 'good' | 'warning' | 'critical'
    if (available < 0) health = 'critical'
    else if (rate < 10) health = 'warning'
    else if (rate < 20) health = 'good'
    else health = 'excellent'

    return {
      monthly_income: income,
      monthly_expenses: expenses,
      available_savings: available,
      savings_rate: rate,
      health_status: health
    }
  })

  /**
   * 🎯 RÉPARTITION INTELLIGENTE ENTRE OBJECTIFS
   */
  const optimalAllocation = computed((): SavingsStrategy => {
    const available = savingsCapacity.value.available_savings
    const activeGoals = goals.value.filter(g => g.status === 'active')

    if (available <= 0 || activeGoals.length === 0) {
      return {
        total_available: available,
        total_allocated: 0,
        remaining: available,
        allocations: [],
        recommendations: available <= 0
          ? ['⚠️ Revenus insuffisants - Réduisez vos dépenses ou augmentez vos revenus']
          : ['🎯 Créez des objectifs pour optimiser votre épargne']
      }
    }

    // Trier par priorité
    const sortedGoals = [...activeGoals].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    const allocations: GoalAllocation[] = []
    let remainingBudget = available

    sortedGoals.forEach((goal, index) => {
      const remaining = goal.target_amount - goal.current_amount

      // Calculer l'allocation idéale (proportionnelle à la priorité)
      let allocation: number

      if (sortedGoals.length === 1) {
        // Si un seul objectif, tout allouer
        allocation = Math.min(remainingBudget, remaining)
      } else {
        // Répartition selon priorité
        const priorityWeights = { high: 0.5, medium: 0.3, low: 0.2 }
        const weight = priorityWeights[goal.priority]
        allocation = Math.min(available * weight, remaining, remainingBudget)
      }

      const monthsNeeded = allocation > 0 ? Math.ceil(remaining / allocation) : Infinity
      const isAchievable = allocation > 0 && monthsNeeded < 120  // Moins de 10 ans

      allocations.push({
        goal_id: goal.id,
        goal_name: goal.name,
        monthly_amount: Math.round(allocation * 100) / 100,
        months_to_complete: monthsNeeded,
        priority: index + 1,
        is_achievable: isAchievable
      })

      remainingBudget -= allocation
    })

    const totalAllocated = allocations.reduce((sum, a) => sum + a.monthly_amount, 0)

    // Générer des recommandations
    const recommendations: string[] = []

    if (remainingBudget > 50) {
      recommendations.push(`💰 Il vous reste ${Math.round(remainingBudget)}€/mois - Créez un nouvel objectif !`)
    }

    if (allocations.some(a => !a.is_achievable)) {
      recommendations.push('⚠️ Certains objectifs nécessitent trop de temps - Ajustez-les ou augmentez votre épargne')
    }

    if (allocations.length > 5) {
      recommendations.push('📊 Trop d\'objectifs actifs - Concentrez-vous sur les prioritaires')
    }

    return {
      total_available: available,
      total_allocated: totalAllocated,
      remaining: remainingBudget,
      allocations,
      recommendations
    }
  })

  /**
   * 💡 RECOMMANDATIONS INTELLIGENTES
   */
  const recommendations = computed((): BudgetRecommendation[] => {
    const recs: BudgetRecommendation[] = []
    const capacity = savingsCapacity.value

    // 1. Si capacité négative
    if (capacity.available_savings < 0) {
      recs.push({
        type: 'reduce_expenses',
        priority: 'high',
        title: '🚨 Budget déficitaire',
        description: `Vous dépensez ${Math.abs(Math.round(capacity.available_savings))}€ de plus que vos revenus chaque mois. Réduisez vos dépenses ou augmentez vos revenus.`,
        impact: Math.abs(capacity.available_savings),
        icon: '🚨'
      })
    }

    // 2. Si taux d'épargne faible
    if (capacity.savings_rate < 10 && capacity.available_savings > 0) {
      recs.push({
        type: 'increase_income',
        priority: 'high',
        title: '📈 Taux d\'épargne faible',
        description: `Vous n'épargnez que ${Math.round(capacity.savings_rate)}% de vos revenus. Visez au moins 20% pour une santé financière optimale.`,
        impact: capacity.monthly_income * 0.1,
        icon: '📈'
      })
    }

    // 3. Analyser les dépenses par catégorie
    const expensesByCategory = analyzeExpensesByCategory()

    expensesByCategory.forEach(cat => {
      if (cat.percentage > 30 && cat.category !== 'Logement') {
        recs.push({
          type: 'reduce_expenses',
          priority: 'medium',
          title: `💸 Dépenses élevées en ${cat.category}`,
          description: `${Math.round(cat.percentage)}% de vos dépenses (${Math.round(cat.amount)}€/mois). Essayez de réduire.`,
          impact: cat.amount * 0.2,
          icon: '💸'
        })
      }
    })

    // 4. Si objectifs inatteignables
    const unachievable = optimalAllocation.value.allocations.filter(a => !a.is_achievable)

    if (unachievable.length > 0) {
      recs.push({
        type: 'adjust_goals',
        priority: 'medium',
        title: '🎯 Objectifs trop ambitieux',
        description: `${unachievable.length} objectif(s) nécessitent plus de 10 ans. Ajustez les montants ou augmentez votre épargne.`,
        impact: 0,
        icon: '🎯'
      })
    }

    // 5. Si reste de l'argent non alloué
    if (optimalAllocation.value.remaining > 100) {
      recs.push({
        type: 'optimize_allocation',
        priority: 'low',
        title: '💰 Épargne non allouée',
        description: `${Math.round(optimalAllocation.value.remaining)}€/mois disponibles. Créez un nouvel objectif ou augmentez les existants.`,
        impact: optimalAllocation.value.remaining,
        icon: '💰'
      })
    }

    // Trier par priorité
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return recs.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Définir manuellement les revenus mensuels
   */
  function setCustomIncome(amount: number | null): void {
    customMonthlyIncome.value = amount
  }

  /**
   * Définir manuellement les dépenses mensuelles
   */
  function setCustomExpenses(amount: number | null): void {
    customMonthlyExpenses.value = amount
  }

  /**
   * Changer la période de calcul
   */
  function setPeriod(period: '1' | '3' | '6' | '12'): void {
    selectedPeriod.value = period
  }

  /**
   * Réinitialiser les valeurs personnalisées
   */
  function resetCustomValues(): void {
    customMonthlyIncome.value = null
    customMonthlyExpenses.value = null
  }

  /**
   * Analyser les dépenses par catégorie
   */
  function analyzeExpensesByCategory(): Array<{
    category: string
    amount: number
    percentage: number
  }> {
    const months = parseInt(selectedPeriod.value)
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - months)

    const expenses = transactions.value
      .filter(t => t.type === 'expense' && new Date(t.transaction_date) >= cutoffDate)

    const byCategory = new Map<string, number>()

    expenses.forEach(t => {
      const category = t.category?.name || 'Non catégorisée'
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
      const current = byCategory.get(category) || 0
      byCategory.set(category, current + (isNaN(amount) ? 0 : amount))
    })

    const total = Array.from(byCategory.values()).reduce((sum, v) => sum + v, 0)
    const monthlyTotal = total / months

    return Array.from(byCategory.entries())
      .map(([category, amount]) => ({
        category,
        amount: amount / months,
        percentage: monthlyTotal > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  /**
   * Obtenir un résumé textuel
   */
  function getSummary(): string {
    const capacity = savingsCapacity.value

    if (capacity.available_savings < 0) {
      return `⚠️ Attention ! Vous dépensez ${Math.abs(Math.round(capacity.available_savings))}€ de plus que vos revenus chaque mois.`
    }

    if (capacity.available_savings === 0) {
      return '💰 Vos revenus couvrent exactement vos dépenses. Essayez de réduire vos dépenses pour épargner.'
    }

    const allocation = optimalAllocation.value

    if (allocation.allocations.length === 0) {
      return `💎 Vous pouvez épargner ${Math.round(capacity.available_savings)}€/mois ! Créez des objectifs pour optimiser cette épargne.`
    }

    return `💎 Vous pouvez épargner ${Math.round(capacity.available_savings)}€/mois pour atteindre ${allocation.allocations.length} objectif(s).`
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    customMonthlyIncome,
    customMonthlyExpenses,
    selectedPeriod,

    // Computed
    averageMonthlyIncome,
    averageMonthlyExpenses,
    savingsCapacity,
    optimalAllocation,
    recommendations,

    // Actions
    setCustomIncome,
    setCustomExpenses,
    setPeriod,
    resetCustomValues,
    analyzeExpensesByCategory,
    getSummary
  }
})
