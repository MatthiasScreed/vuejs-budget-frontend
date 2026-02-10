// src/types/projection.types.ts

/**
 * Période de projection
 */
export type ProjectionPeriod = '3months' | '6months' | '12months'

/**
 * Projection financière
 * École 42: Types explicites pour maintainability
 */
export interface FinancialProjection {
  period: ProjectionPeriod
  periodLabel: string
  projectedSavings: number
  projectedIncome: number
  projectedExpenses: number
  confidence: number // 0-100
  variance: {
    min: number
    max: number
  }
  assumptions: string[]
}

/**
 * Insight IA
 */
export interface AIInsight {
  id: string
  type: 'warning' | 'opportunity' | 'achievement' | 'suggestion'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string // Ex: "+150€/mois"
  actionable: boolean
  action?: {
    label: string
    route?: string
    handler?: () => void
  }
  icon: string
  color: string
}

/**
 * Tendance de dépenses
 */
export interface SpendingTrend {
  category: string
  trend: 'increasing' | 'decreasing' | 'stable'
  changePercentage: number
  projection: number
}

/**
 * Données complètes de projection
 */
export interface ProjectionData {
  projections: FinancialProjection[]
  insights: AIInsight[]
  trends: SpendingTrend[]
  lastUpdated: string
}
