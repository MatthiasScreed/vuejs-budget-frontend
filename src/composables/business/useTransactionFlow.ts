import { ref } from 'vue'
import { useApi, useErrorHandler, useCache } from '@/composables/core'
import type { CreateTransactionData, ApiResponse, Transaction } from '@/types'

interface TransactionResult {
  success: boolean
  transaction?: Transaction
  xpGained?: number
  achievementsUnlocked?: string[]
  leveledUp?: boolean
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Composable pour le flux complet des transactions
 * Validation, création, gaming et contributions automatiques
 */
export function useTransactionFlow() {
  const { post } = useApi()
  const { handleApiError } = useErrorHandler()
  const { remember, invalidateByTag } = useCache()

  const processing = ref(false)
  const lastResult = ref<TransactionResult | null>(null)

  /**
   * Créer une transaction avec toute la logique métier
   */
  async function createTransaction(data: CreateTransactionData): Promise<TransactionResult> {
    processing.value = true

    try {
      // 1. Validation côté client
      const validation = validateTransaction(data)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // 2. Appel API orchestré
      const response = await post<TransactionResult>('/transactions', data)

      if (response.success) {
        // 3. Invalider les caches pertinents
        invalidateTransactionCaches()

        lastResult.value = response.data
        return response.data
      }

      throw new Error(response.message || 'Erreur création transaction')
    } catch (error: any) {
      await handleApiError(error, 'createTransaction')
      return { success: false }
    } finally {
      processing.value = false
    }
  }

  /**
   * Valider les données de transaction
   */
  function validateTransaction(data: CreateTransactionData): ValidationResult {
    const errors: string[] = []

    // Validation montant
    if (!isValidAmount(data.amount)) {
      errors.push('Montant invalide (doit être > 0 et < 1M€)')
    }

    // Validation description
    if (!isValidDescription(data.description)) {
      errors.push('Description requise (min 3 caractères)')
    }

    // Validation date
    if (!isValidDate(data.transaction_date)) {
      errors.push('Date invalide (max 7 jours dans le futur)')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Valider le montant de transaction
   */
  function isValidAmount(amount: number): boolean {
    return amount > 0 && amount <= 1000000 && !isNaN(amount)
  }

  /**
   * Valider la description
   */
  function isValidDescription(description: string): boolean {
    return Boolean(description?.trim() && description.trim().length >= 3)
  }

  /**
   * Valider la date de transaction
   */
  function isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    const now = new Date()
    const maxFuture = new Date()
    maxFuture.setDate(maxFuture.getDate() + 7)

    return date <= maxFuture && date >= new Date('2020-01-01')
  }

  /**
   * Récupérer les transactions avec cache
   */
  async function getTransactions(filters?: any): Promise<Transaction[]> {
    const cacheKey = `transactions_${JSON.stringify(filters || {})}`

    return remember(
      cacheKey,
      () => fetchTransactionsFromApi(filters),
      2 * 60 * 1000, // 2 minutes
      ['transactions']
    )
  }

  /**
   * Appel API pour récupérer les transactions
   */
  async function fetchTransactionsFromApi(filters?: any): Promise<Transaction[]> {
    const response = await post<Transaction[]>('/transactions/list', filters)
    return response.data || []
  }

  /**
   * Invalider les caches liés aux transactions
   */
  function invalidateTransactionCaches(): void {
    invalidateByTag('transactions')
    invalidateByTag('goals')
    invalidateByTag('analytics')
    invalidateByTag('gaming')
  }

  /**
   * Obtenir les métriques de transaction
   */
  async function getTransactionMetrics(): Promise<any> {
    return remember(
      'transaction_metrics',
      async () => {
        const response = await post('/transactions/metrics')
        return response.data
      },
      5 * 60 * 1000, // 5 minutes
      ['transactions', 'analytics']
    )
  }

  /**
   * Calculer le surplus pour contributions auto
   */
  function calculateSurplus(incomeAmount: number, monthlyBudget: number): number {
    const surplus = Math.max(0, incomeAmount - monthlyBudget)
    return Math.round(surplus * 0.5) // 50% du surplus
  }

  return {
    // State
    processing,
    lastResult,

    // Main methods
    createTransaction,
    getTransactions,
    getTransactionMetrics,

    // Validation
    validateTransaction,
    isValidAmount,
    isValidDescription,
    isValidDate,

    // Utils
    calculateSurplus
  }
}
