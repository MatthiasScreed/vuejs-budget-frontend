import type { Transaction, Category, FinancialGoal } from '@/types'

/**
 * Transformateurs de données - Logique métier pure
 * Séparation claire entre calculs et formatage UI
 */

// ==========================================
// BUSINESS LOGIC - Calculs financiers purs
// ==========================================

/**
 * Calculer les totaux mensuels pour revenus/dépenses
 */
export interface MonthlyTotals {
  month: string
  income: number
  expenses: number
  balance: number
  transactionCount: number
}

export function calculateMonthlyTotals(transactions: Transaction[]): MonthlyTotals[] {
  if (!Array.isArray(transactions)) return []

  const monthlyData = new Map<string, { income: number; expenses: number; count: number }>()

  transactions.forEach(transaction => {
    if (!transaction?.transaction_date || typeof transaction.amount !== 'number') {
      return
    }

    const month = transaction.transaction_date.substring(0, 7) // YYYY-MM

    if (!monthlyData.has(month)) {
      monthlyData.set(month, { income: 0, expenses: 0, count: 0 })
    }

    const data = monthlyData.get(month)!
    data.count++

    const amount = Math.abs(transaction.amount)
    if (transaction.type === 'income') {
      data.income += amount
    } else if (transaction.type === 'expense') {
      data.expenses += amount
    }
  })

  // Convertir en array triée
  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      income: Math.round(data.income * 100) / 100,
      expenses: Math.round(data.expenses * 100) / 100,
      balance: Math.round((data.income - data.expenses) * 100) / 100,
      transactionCount: data.count
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Calculer les totaux par catégorie
 */
export interface CategoryTotals {
  categoryId: string
  categoryName: string
  amount: number
  transactionCount: number
  percentage: number
  color: string
  icon: string
}

export function calculateCategoryTotals(
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense' = 'expense'
): CategoryTotals[] {
  if (!Array.isArray(transactions) || !Array.isArray(categories)) {
    return []
  }

  const categoryTotals = new Map<string, number>()
  const categoryCount = new Map<string, number>()

  // Calculer totaux par catégorie
  transactions
    .filter(t => t && t.type === type && t.category?.id)
    .forEach(transaction => {
      const catId = transaction.category!.id
      const amount = Math.abs(transaction.amount)

      categoryTotals.set(catId, (categoryTotals.get(catId) || 0) + amount)
      categoryCount.set(catId, (categoryCount.get(catId) || 0) + 1)
    })

  const totalAmount = Array.from(categoryTotals.values()).reduce((sum, amt) => sum + amt, 0)

  // Transformer en résultats avec métadonnées
  return Array.from(categoryTotals.entries())
    .map(([catId, amount]) => {
      const category = categories.find(c => c.id === catId)
      const count = categoryCount.get(catId) || 0

      return {
        categoryId: catId,
        categoryName: category?.name || 'Inconnu',
        amount: Math.round(amount * 100) / 100,
        transactionCount: count,
        percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
        color: category?.color || '#5b6270',
        icon: category?.icon || '📋'
      }
    })
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Analyser les tendances de dépenses
 */
export interface SpendingTrend {
  trend: 'increasing' | 'decreasing' | 'stable'
  changePercentage: number
  averageMonthly: number
  monthlyData: Array<{ month: string; amount: number }>
  recommendation: string
}

export function analyzeSpendingTrends(
  transactions: Transaction[],
  months: number = 6
): SpendingTrend {
  if (!Array.isArray(transactions) || months < 2) {
    return {
      trend: 'stable',
      changePercentage: 0,
      averageMonthly: 0,
      monthlyData: [],
      recommendation: 'Pas assez de données pour analyser les tendances'
    }
  }

  // Filtrer les X derniers mois
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - months)

  const recentTransactions = transactions.filter(t =>
    t &&
    t.type === 'expense' &&
    new Date(t.transaction_date) >= cutoffDate
  )

  const monthlyTotals = calculateMonthlyTotals(recentTransactions)
  const monthlyExpenses = monthlyTotals.map(m => ({
    month: m.month,
    amount: m.expenses
  }))

  if (monthlyExpenses.length < 2) {
    return {
      trend: 'stable',
      changePercentage: 0,
      averageMonthly: monthlyExpenses[0]?.amount || 0,
      monthlyData: monthlyExpenses,
      recommendation: 'Continuez à enregistrer vos dépenses pour obtenir des analyses'
    }
  }

  // Calculer la tendance
  const averageMonthly = monthlyExpenses.reduce((sum, m) => sum + m.amount, 0) / monthlyExpenses.length

  const firstHalf = monthlyExpenses.slice(0, Math.floor(monthlyExpenses.length / 2))
  const secondHalf = monthlyExpenses.slice(Math.floor(monthlyExpenses.length / 2))

  const firstAvg = firstHalf.reduce((sum, m) => sum + m.amount, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, m) => sum + m.amount, 0) / secondHalf.length

  const changePercentage = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  let recommendation = ''

  if (Math.abs(changePercentage) > 15) {
    trend = changePercentage > 0 ? 'increasing' : 'decreasing'

    if (trend === 'increasing') {
      recommendation = 'Vos dépenses augmentent. Identifiez les catégories responsables pour optimiser.'
    } else {
      recommendation = 'Félicitations ! Vos dépenses diminuent. Continuez sur cette voie.'
    }
  } else {
    recommendation = 'Vos dépenses sont stables. Bon équilibre financier.'
  }

  return {
    trend,
    changePercentage: Math.round(changePercentage),
    averageMonthly: Math.round(averageMonthly),
    monthlyData: monthlyExpenses,
    recommendation
  }
}

// ==========================================
// UI ADAPTERS - Formatage pour composants
// ==========================================

/**
 * Adapter les données mensuelles pour Chart.js
 */
export function adaptMonthlyDataForChart(monthlyData: MonthlyTotals[]): {
  labels: string[]
  datasets: any[]
} {
  if (!Array.isArray(monthlyData) || monthlyData.length === 0) {
    return { labels: [], datasets: [] }
  }

  return {
    labels: monthlyData.map(data => {
      const date = new Date(data.month + '-01')
      return date.toLocaleDateString('fr-FR', {
        month: 'short',
        year: 'numeric'
      })
    }),
    datasets: [
      {
        label: 'Revenus',
        data: monthlyData.map(data => data.income),
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Dépenses',
        data: monthlyData.map(data => data.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  }
}

/**
 * Adapter les catégories pour un pie chart
 */
export function adaptCategoriesForPieChart(categoryData: CategoryTotals[]): {
  labels: string[]
  data: number[]
  backgroundColor: string[]
  borderColor: string[]
} {
  if (!Array.isArray(categoryData) || categoryData.length === 0) {
    return { labels: [], data: [], backgroundColor: [], borderColor: [] }
  }

  // Prendre les 8 plus importantes + regrouper le reste
  const top8 = categoryData.slice(0, 8)
  const others = categoryData.slice(8)

  let finalData = [...top8]

  if (others.length > 0) {
    const othersTotal = others.reduce((sum, cat) => sum + cat.amount, 0)
    finalData.push({
      categoryId: 'others',
      categoryName: 'Autres',
      amount: othersTotal,
      transactionCount: others.reduce((sum, cat) => sum + cat.transactionCount, 0),
      percentage: others.reduce((sum, cat) => sum + cat.percentage, 0),
      color: '#5b6270',
      icon: '📦'
    })
  }

  return {
    labels: finalData.map(cat => `${cat.icon} ${cat.categoryName}`),
    data: finalData.map(cat => cat.amount),
    backgroundColor: finalData.map(cat => cat.color),
    borderColor: finalData.map(cat => cat.color)
  }
}

/**
 * Adapter les objectifs pour timeline
 */
export interface GoalTimelineEvent {
  date: string
  title: string
  type: 'creation' | 'milestone' | 'completion'
  goalId: number
  goalName: string
  amount?: number
  percentage?: number
  icon: string
  color: string
}

export function adaptGoalsForTimeline(goals: FinancialGoal[]): GoalTimelineEvent[] {
  if (!Array.isArray(goals)) return []

  const events: GoalTimelineEvent[] = []

  goals.forEach(goal => {
    if (!goal) return

    // Événement de création
    events.push({
      date: goal.created_at,
      title: `Objectif "${goal.name}" créé`,
      type: 'creation',
      goalId: goal.id,
      goalName: goal.name,
      amount: goal.target_amount,
      icon: '🎯',
      color: '#3B82F6'
    })

    // Milestones de progression
    const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0

    if (progress >= 25) {
      events.push({
        date: goal.updated_at,
        title: `${goal.name} - 25% atteint`,
        type: 'milestone',
        goalId: goal.id,
        goalName: goal.name,
        percentage: 25,
        icon: '📈',
        color: '#10B981'
      })
    }

    if (progress >= 50) {
      events.push({
        date: goal.updated_at,
        title: `${goal.name} - 50% atteint`,
        type: 'milestone',
        goalId: goal.id,
        goalName: goal.name,
        percentage: 50,
        icon: '🎊',
        color: '#F59E0B'
      })
    }

    // Événement de completion
    if (goal.status === 'completed') {
      events.push({
        date: goal.updated_at, // Utiliser updated_at car completed_at n'existe pas
        title: `Objectif "${goal.name}" accompli !`,
        type: 'completion',
        goalId: goal.id,
        goalName: goal.name,
        amount: goal.current_amount,
        icon: '🏆',
        color: '#059669'
      })
    }
  })

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// ==========================================
// ANALYTICS - Analyses avancées
// ==========================================

/**
 * Analyser les patterns de dépenses par jour de la semaine
 */
export interface WeeklyPattern {
  dayOfWeek: string
  dayIndex: number
  averageAmount: number
  transactionCount: number
  topCategory: string
}

export function analyzeWeeklyPatterns(
  transactions: Transaction[],
  categories: Category[]
): WeeklyPattern[] {
  if (!Array.isArray(transactions)) return []

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const weeklyData = new Map<number, { total: number; count: number; categories: Map<string, number> }>()

  // Initialiser tous les jours
  for (let i = 0; i < 7; i++) {
    weeklyData.set(i, { total: 0, count: 0, categories: new Map() })
  }

  transactions
    .filter(t => t && t.type === 'expense')
    .forEach(transaction => {
      const dayIndex = new Date(transaction.transaction_date).getDay()
      const data = weeklyData.get(dayIndex)!

      data.total += Math.abs(transaction.amount)
      data.count += 1

      if (transaction.category?.id) {
        const catCount = data.categories.get(transaction.category.id) || 0
        data.categories.set(transaction.category.id, catCount + 1)
      }
    })

  return Array.from(weeklyData.entries()).map(([dayIndex, data]) => {
    // Trouver la catégorie la plus utilisée ce jour
    let topCategoryId = ''
    let maxCount = 0

    data.categories.forEach((count, catId) => {
      if (count > maxCount) {
        maxCount = count
        topCategoryId = catId
      }
    })

    const topCategory = categories.find(c => c.id === topCategoryId)

    return {
      dayOfWeek: dayNames[dayIndex],
      dayIndex,
      averageAmount: data.count > 0 ? Math.round(data.total / data.count) : 0,
      transactionCount: data.count,
      topCategory: topCategory?.name || 'Aucune'
    }
  })
}

/**
 * Calculer la vélocité de progression des objectifs
 */
export interface GoalVelocity {
  goalId: number
  goalName: string
  monthlyRate: number
  projectedCompletion: string | null
  isOnTrack: boolean
  daysRemaining: number
  monthlyRequired: number
}

export function calculateGoalVelocities(goals: FinancialGoal[]): GoalVelocity[] {
  if (!Array.isArray(goals)) return []

  return goals
    .filter(goal => goal && goal.status === 'active')
    .map(goal => {
      const now = new Date()
      const targetDate = new Date(goal.target_date)
      const createdDate = new Date(goal.created_at)

      const daysElapsed = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)))
      const daysRemaining = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

      const monthsElapsed = daysElapsed / 30
      const monthsRemaining = Math.max(0.1, daysRemaining / 30)

      const monthlyRate = monthsElapsed > 0 ? goal.current_amount / monthsElapsed : 0
      const remaining = goal.target_amount - goal.current_amount
      const monthlyRequired = remaining / monthsRemaining

      const projectedDays = monthlyRate > 0 ? Math.ceil(remaining / (monthlyRate / 30)) : null
      const projectedCompletion = projectedDays ?
        new Date(now.getTime() + projectedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null

      const isOnTrack = monthlyRate >= monthlyRequired * 0.8 // 80% de marge

      return {
        goalId: goal.id,
        goalName: goal.name,
        monthlyRate: Math.round(monthlyRate),
        projectedCompletion,
        isOnTrack,
        daysRemaining,
        monthlyRequired: Math.round(monthlyRequired)
      }
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
}

// ==========================================
// COMPARISONS & BENCHMARKS
// ==========================================

/**
 * Comparer les performances sur différentes périodes
 */
export interface PeriodComparison {
  currentPeriod: {
    income: number
    expenses: number
    balance: number
    transactions: number
  }
  previousPeriod: {
    income: number
    expenses: number
    balance: number
    transactions: number
  }
  changes: {
    income: { amount: number; percentage: number }
    expenses: { amount: number; percentage: number }
    balance: { amount: number; percentage: number }
    transactions: { amount: number; percentage: number }
  }
}

export function comparePeriods(
  transactions: Transaction[],
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
): PeriodComparison {
  if (!Array.isArray(transactions)) {
    const emptyPeriod = { income: 0, expenses: 0, balance: 0, transactions: 0 }
    const emptyChanges = {
      income: { amount: 0, percentage: 0 },
      expenses: { amount: 0, percentage: 0 },
      balance: { amount: 0, percentage: 0 },
      transactions: { amount: 0, percentage: 0 }
    }

    return {
      currentPeriod: emptyPeriod,
      previousPeriod: emptyPeriod,
      changes: emptyChanges
    }
  }

  const currentTrans = transactions.filter(t =>
    t && t.transaction_date >= currentStart && t.transaction_date <= currentEnd
  )

  const previousTrans = transactions.filter(t =>
    t && t.transaction_date >= previousStart && t.transaction_date <= previousEnd
  )

  const calculatePeriodStats = (periodTransactions: Transaction[]) => {
    const stats = calculateDetailedStats(periodTransactions)
    return {
      income: stats.totalIncome,
      expenses: stats.totalExpenses,
      balance: stats.balance,
      transactions: stats.totalCount
    }
  }

  const currentPeriod = calculatePeriodStats(currentTrans)
  const previousPeriod = calculatePeriodStats(previousTrans)

  // Calculer les changements
  const calculateChange = (current: number, previous: number) => {
    const amount = current - previous
    const percentage = previous > 0 ? (amount / previous) * 100 : 0
    return { amount: Math.round(amount), percentage: Math.round(percentage) }
  }

  return {
    currentPeriod,
    previousPeriod,
    changes: {
      income: calculateChange(currentPeriod.income, previousPeriod.income),
      expenses: calculateChange(currentPeriod.expenses, previousPeriod.expenses),
      balance: calculateChange(currentPeriod.balance, previousPeriod.balance),
      transactions: calculateChange(currentPeriod.transactions, previousPeriod.transactions)
    }
  }
}

// ==========================================
// EXPORT HELPER
// ==========================================

/**
 * Transformer les données pour export CSV/Excel
 */
export function prepareDataForExport(transactions: Transaction[]): Array<{
  Date: string
  Type: string
  Description: string
  Categorie: string
  Montant: number
}> {
  if (!Array.isArray(transactions)) return []

  return transactions
    .filter(t => t)
    .map(transaction => ({
      Date: transaction.transaction_date.split('T')[0],
      Type: transaction.type === 'income' ? 'Revenu' :
        transaction.type === 'expense' ? 'Dépense' : 'Transfert',
      Description: transaction.description || '',
      Categorie: transaction.category?.name || 'Sans catégorie',
      Montant: transaction.type === 'income' ? transaction.amount : -transaction.amount
    }))
    .sort((a, b) => b.Date.localeCompare(a.Date))
}

// Import function from transactionUtils to avoid duplication
import { calculateDetailedStats } from './transactionUtils'
