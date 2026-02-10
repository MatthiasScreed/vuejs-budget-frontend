// src/mocks/projectionMocks.ts

import type { AIInsight, FinancialProjection } from '@/types/projection.types'

/**
 * Données de test pour les projections
 * École 42: Mocks séparés pour tests
 */

export const mockProjections: FinancialProjection[] = [
  {
    period: '3months',
    periodLabel: '3 mois',
    projectedSavings: 2100,
    projectedIncome: 7500,
    projectedExpenses: 5400,
    confidence: 90,
    variance: { min: 1785, max: 2415 },
    assumptions: ['Revenus stables', 'Dépenses constantes'],
  },
  {
    period: '6months',
    periodLabel: '6 mois',
    projectedSavings: 4200,
    projectedIncome: 15000,
    projectedExpenses: 10800,
    confidence: 75,
    variance: { min: 3570, max: 4830 },
    assumptions: ['Revenus stables', 'Dépenses constantes'],
  },
  {
    period: '12months',
    periodLabel: '12 mois',
    projectedSavings: 8400,
    projectedIncome: 30000,
    projectedExpenses: 21600,
    confidence: 60,
    variance: { min: 7140, max: 9660 },
    assumptions: ['Revenus stables', 'Dépenses constantes', 'Hors événements exceptionnels'],
  },
]

export const mockInsights: AIInsight[] = [
  {
    id: 'savings-potential',
    type: 'achievement',
    priority: 'high',
    title: "Excellent potentiel d'épargne",
    description: 'À ce rythme, vous économiserez 8 400€ cette année.',
    impact: '+8 400€',
    actionable: true,
    action: {
      label: 'Créer un objectif',
      route: '/app/goals',
    },
    icon: '🎯',
    color: '#48bb78',
  },
  {
    id: 'optimize-housing',
    type: 'opportunity',
    priority: 'medium',
    title: 'Optimisez vos dépenses en Logement',
    description: 'Réduire de 10% vous ferait économiser 85€ par mois.',
    impact: '+1 020€/an',
    actionable: true,
    action: {
      label: 'Voir les détails',
      route: '/app/categories',
    },
    icon: '💡',
    color: '#667eea',
  },
]
