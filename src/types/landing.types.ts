// src/types/landing.types.ts

/**
 * Type pour les calculs d'épargne
 * École 42: Types explicites pour maintainability
 */
export interface SavingsCalculation {
  monthlyCapacity: number
  yearlyPotential: number
  percentageOfIncome: number
  isValid: boolean
}

/**
 * Données d'entrée du calculateur
 */
export interface CalculatorInput {
  income: number
  expenses: number
}

/**
 * Carte de bénéfice
 */
export interface Benefit {
  id: string
  icon: string
  title: string
  description: string
  example?: string
}

/**
 * Témoignage utilisateur
 */
export interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  quote: string
  savings: string
  duration: string
}

/**
 * Étape "Comment ça marche"
 */
export interface HowItWorksStep {
  id: string
  number: number
  title: string
  description: string
  icon: string
}
