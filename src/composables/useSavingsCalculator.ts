// src/composables/useSavingsCalculator.ts

import { ref, computed } from 'vue'
import type { SavingsCalculation, CalculatorInput } from '@/types/landing.types'

/**
 * Composable pour le calculateur d'épargne
 * École 42: Séparation logique métier / UI
 */
export function useSavingsCalculator() {
  // État réactif
  const income = ref<number>(2500)
  const expenses = ref<number>(1800)

  /**
   * Calcule la capacité d'épargne
   * École 42: Max 25 lignes, logique claire
   */
  const calculation = computed<SavingsCalculation>(() => {
    const monthlyCapacity = income.value - expenses.value
    const yearlyPotential = monthlyCapacity * 12
    const percentageOfIncome = income.value > 0 ? (monthlyCapacity / income.value) * 100 : 0

    return {
      monthlyCapacity,
      yearlyPotential,
      percentageOfIncome,
      isValid: monthlyCapacity > 0,
    }
  })

  /**
   * Formate un montant en euros
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Valide les entrées
   */
  const isInputValid = computed<boolean>(() => {
    return income.value > 0 && expenses.value >= 0 && expenses.value < income.value
  })

  return {
    income,
    expenses,
    calculation,
    isInputValid,
    formatCurrency,
  }
}
