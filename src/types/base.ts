// types/base.ts - TYPES CORRIGÉS POUR ÉVITER LES ERREURS DE CONCATÉNATION

// ==========================================
// TRANSACTION TYPES
// ==========================================

export interface Transaction {
  id: number
  user_id: number
  type: 'income' | 'expense' | 'transfer'
  amount: number  // ✅ TOUJOURS UN NUMBER, jamais un string
  description: string
  category_id?: number
  category?: Category
  transaction_date: string
  source: 'manual' | 'bank_import' | 'api' | 'recurring'
  status: 'pending' | 'completed' | 'cancelled'

  // Bridge API fields
  bank_transaction_id?: string
  bank_account_id?: string
  bank_description?: string

  // Recurring transaction fields
  recurring_id?: number
  is_recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'

  // Metadata
  metadata?: Record<string, any>
  tags?: string[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  icon?: string
  color?: string
  type: 'income' | 'expense' | 'transfer' | 'both'
  is_default: boolean
  user_id?: number
  parent_id?: number
  budget_limit?: number
  created_at: string
  updated_at: string
}

export interface TransactionStats {
  total_transactions: number
  total_income: number        // ✅ TOUJOURS UN NUMBER
  total_expenses: number       // ✅ TOUJOURS UN NUMBER
  balance: number             // ✅ TOUJOURS UN NUMBER
  monthly_income: number      // ✅ TOUJOURS UN NUMBER
  monthly_expenses: number    // ✅ TOUJOURS UN NUMBER
  calculated_locally?: boolean
}

// ==========================================
// CREATE/UPDATE TYPES
// ==========================================

export interface CreateTransactionData {
  type: 'income' | 'expense' | 'transfer'
  amount: number | string  // Peut être string depuis le formulaire
  description: string
  category_id?: number
  transaction_date: string
  source?: 'manual' | 'bank_import' | 'api'
  status?: 'pending' | 'completed'
  metadata?: Record<string, any>
  tags?: string[]
}

export interface UpdateTransactionData {
  type?: 'income' | 'expense' | 'transfer'
  amount?: number | string
  description?: string
  category_id?: number
  transaction_date?: string
  status?: 'pending' | 'completed' | 'cancelled'
  metadata?: Record<string, any>
  tags?: string[]
}

// ==========================================
// FILTER TYPES
// ==========================================

export interface TransactionFilters {
  page?: number
  per_page?: number
  type?: 'income' | 'expense' | 'transfer'
  category_id?: number
  date_from?: string
  date_to?: string
  search?: string
  status?: 'pending' | 'completed' | 'cancelled'
  source?: 'manual' | 'bank_import' | 'api' | 'recurring'
  min_amount?: number
  max_amount?: number
  tags?: string[]
}

// ==========================================
// PAGINATION TYPES
// ==========================================

export interface PaginatedTransactions {
  data: Transaction[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number
  to: number
  has_more_pages: boolean
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * ✅ Normaliser une transaction pour s'assurer que amount est un number
 */
export function normalizeTransaction(transaction: any): Transaction {
  return {
    ...transaction,
    amount: typeof transaction.amount === 'string'
      ? parseFloat(transaction.amount)
      : transaction.amount
  }
}

/**
 * ✅ Normaliser un tableau de transactions
 */
export function normalizeTransactions(transactions: any[]): Transaction[] {
  return transactions.map(normalizeTransaction)
}

/**
 * ✅ Calculer le total d'un tableau de transactions
 */
export function calculateTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
}

/**
 * ✅ Calculer le solde (revenus - dépenses)
 */
export function calculateBalance(transactions: Transaction[]): number {
  const income = calculateTotal(transactions.filter(t => t.type === 'income'))
  const expenses = calculateTotal(transactions.filter(t => t.type === 'expense'))
  return income - expenses
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Valider qu'un montant est valide
 */
export function isValidAmount(amount: any): boolean {
  if (typeof amount === 'number') {
    return !isNaN(amount) && isFinite(amount) && amount > 0
  }

  if (typeof amount === 'string') {
    const parsed = parseFloat(amount)
    return !isNaN(parsed) && isFinite(parsed) && parsed > 0
  }

  return false
}

/**
 * Convertir un montant en number de manière sécurisée
 */
export function toNumber(value: any): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }

  return 0
}

// ==========================================
// GOAL TYPES
// ==========================================

export interface FinancialGoal {
  id: number
  user_id: number
  name: string
  description?: string
  target_amount: number
  current_amount: number
  target_date?: string
  status: 'active' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  icon?: string
  color?: string
  created_at: string
  updated_at: string
}

// ==========================================
// API RESPONSE TYPE
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  meta?: any
}
