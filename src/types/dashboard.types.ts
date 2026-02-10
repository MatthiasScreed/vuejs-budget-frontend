// src/types/dashboard.types.ts

/**
 * Métriques financières du dashboard
 * École 42: Types explicites pour maintainability
 */
export interface DashboardMetrics {
  savingsCapacity: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  goalsProgress: GoalProgress[]
  categoryBreakdown: CategoryBreakdown[]
}

/**
 * Progression d'un objectif
 */
export interface GoalProgress {
  id: number
  name: string
  currentAmount: number
  targetAmount: number
  progressPercentage: number
  estimatedCompletionDate: string
  category: string
  icon: string
}

/**
 * Répartition par catégorie
 */
export interface CategoryBreakdown {
  id: number
  name: string
  amount: number
  percentage: number
  color: string
  icon: string
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

/**
 * Transaction récente
 */
export interface RecentTransaction {
  id: number
  description: string
  amount: number
  category: string
  categoryIcon: string
  date: string
  type: 'income' | 'expense'
}

/**
 * Projection IA
 */
export interface AIProjection {
  period: '3months' | '6months' | '12months'
  projectedSavings: number
  projectedExpenses: number
  confidence: number
  insights: string[]
}

/**
 * Données gaming (sidebar)
 */
export interface GamingData {
  currentLevel: number
  currentXP: number
  nextLevelXP: number
  currentStreak: number
  recentAchievements: Achievement[]
  weeklyProgress: number
}

/**
 * Achievement simple
 */
export interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  unlockedAt: string
}
