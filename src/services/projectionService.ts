// src/services/projectionService.ts

import type {
  FinancialProjection,
  AIInsight,
  SpendingTrend,
  ProjectionPeriod,
} from '@/types/projection.types'

/**
 * Service de calcul des projections IA
 * École 42: Service séparé, responsabilité unique
 */
export class ProjectionService {
  /**
   * Calcule les projections basées sur l'historique
   * École 42: Max 25 lignes, logique claire
   */
  static calculateProjection(
    monthlyIncome: number,
    monthlyExpenses: number,
    period: ProjectionPeriod,
  ): FinancialProjection {
    const months = this.getMonthsFromPeriod(period)
    const savingsCapacity = monthlyIncome - monthlyExpenses

    // Projection simple (à améliorer avec vraie IA)
    const projectedSavings = savingsCapacity * months
    const projectedIncome = monthlyIncome * months
    const projectedExpenses = monthlyExpenses * months

    // Variance basée sur l'historique (simulé)
    const variance = this.calculateVariance(savingsCapacity, months)

    // Confiance (simulée, devrait être calculée par ML)
    const confidence = this.calculateConfidence(months)

    return {
      period,
      periodLabel: this.getPeriodLabel(period),
      projectedSavings,
      projectedIncome,
      projectedExpenses,
      confidence,
      variance,
      assumptions: this.getAssumptions(period),
    }
  }

  /**
   * Génère des insights IA
   */
  static generateInsights(
    projections: FinancialProjection[],
    currentSavings: number,
    categories: any[],
  ): AIInsight[] {
    const insights: AIInsight[] = []

    // Insight 1: Économies potentielles
    const yearProjection = projections.find((p) => p.period === '12months')
    if (yearProjection && yearProjection.projectedSavings > 0) {
      insights.push({
        id: 'savings-potential',
        type: 'achievement',
        priority: 'high',
        title: "Excellent potentiel d'épargne",
        description: `À ce rythme, vous économiserez ${this.formatCurrency(yearProjection.projectedSavings)} cette année.`,
        impact: `+${this.formatCurrency(yearProjection.projectedSavings)}`,
        actionable: true,
        action: {
          label: 'Créer un objectif',
          route: '/app/goals',
        },
        icon: '🎯',
        color: '#48bb78',
      })
    }

    // Insight 2: Catégorie à optimiser
    const topCategory = categories.sort((a, b) => b.amount - a.amount)[0]
    if (topCategory && topCategory.amount > 500) {
      insights.push({
        id: 'optimize-category',
        type: 'opportunity',
        priority: 'medium',
        title: `Optimisez vos dépenses en ${topCategory.name}`,
        description: `Réduire de 10% vous ferait économiser ${this.formatCurrency(topCategory.amount * 0.1)} par mois.`,
        impact: `+${this.formatCurrency(topCategory.amount * 0.1 * 12)}/an`,
        actionable: true,
        action: {
          label: 'Voir les détails',
          route: '/app/categories',
        },
        icon: '💡',
        color: '#667eea',
      })
    }

    // Insight 3: Alerte si dépenses en hausse
    const increasingCategory = categories.find((c) => c.trend === 'up')
    if (increasingCategory) {
      insights.push({
        id: 'spending-alert',
        type: 'warning',
        priority: 'high',
        title: `Attention aux dépenses en ${increasingCategory.name}`,
        description: `Hausse de ${Math.abs(increasingCategory.trendPercentage).toFixed(1)}% ce mois. Surveillez cette catégorie.`,
        impact: `+${Math.abs(increasingCategory.trendPercentage).toFixed(1)}%`,
        actionable: true,
        action: {
          label: 'Analyser',
          route: '/app/analytics',
        },
        icon: '⚠️',
        color: '#f56565',
      })
    }

    // Insight 4: Suggestion de fonds d'urgence
    const emergencyFundTarget = currentSavings * 3
    if (currentSavings < emergencyFundTarget) {
      insights.push({
        id: 'emergency-fund',
        type: 'suggestion',
        priority: 'medium',
        title: "Constituez un fonds d'urgence",
        description: `Visez 3 mois de dépenses (${this.formatCurrency(emergencyFundTarget)}) pour plus de sécurité.`,
        impact: `${this.formatCurrency(emergencyFundTarget - currentSavings)} restants`,
        actionable: true,
        action: {
          label: "Créer l'objectif",
          route: '/app/goals',
        },
        icon: '🛡️',
        color: '#4299e1',
      })
    }

    return insights
  }

  /**
   * Convertit une période en nombre de mois
   */
  private static getMonthsFromPeriod(period: ProjectionPeriod): number {
    const months = {
      '3months': 3,
      '6months': 6,
      '12months': 12,
    }
    return months[period]
  }

  /**
   * Obtient le label d'une période
   */
  private static getPeriodLabel(period: ProjectionPeriod): string {
    const labels = {
      '3months': '3 mois',
      '6months': '6 mois',
      '12months': '12 mois',
    }
    return labels[period]
  }

  /**
   * Calcule la variance
   */
  private static calculateVariance(
    monthlySavings: number,
    months: number,
  ): { min: number; max: number } {
    const baseVariance = 0.15 // 15% de variance
    const totalSavings = monthlySavings * months

    return {
      min: totalSavings * (1 - baseVariance),
      max: totalSavings * (1 + baseVariance),
    }
  }

  /**
   * Calcule le niveau de confiance
   */
  private static calculateConfidence(months: number): number {
    // Plus la projection est lointaine, moins on est confiant
    if (months <= 3) return 90
    if (months <= 6) return 75
    return 60
  }

  /**
   * Génère les hypothèses de calcul
   */
  private static getAssumptions(period: ProjectionPeriod): string[] {
    const base = ['Revenus stables', 'Dépenses constantes']

    if (period === '12months') {
      base.push('Hors événements exceptionnels')
    }

    return base
  }

  /**
   * Formate un montant
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }
}
