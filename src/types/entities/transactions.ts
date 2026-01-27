import type { DateString, EntityId } from '@/types/base'

export interface Transaction {
  id: EntityId
  user_id: EntityId
  category_id?: EntityId
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description: string
  date: DateString // ← Uniformiser avec 'date' au lieu de 'transaction_date'
  notes?: string
  is_recurring: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  status: 'pending' | 'completed' | 'cancelled'
  created_at: DateString
  updated_at: DateString
  category?: Category

  bridge_transaction_id?: string
  bridge_account_id?: string
  is_from_bridge?: boolean
  auto_imported?: boolean
  reconciliation_status?: 'pending' | 'matched' | 'manual'
}

export interface Category {
  id: number
  user_id: number
  name: string
  type: 'income' | 'expense' | 'transfer' | 'both'
  color: string
  icon: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateTransactionData {
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  category_id?: number
  notes?: string
  is_recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  status?: 'pending' | 'completed' | 'cancelled'
}

export interface TransactionFilters {
  type?: 'income' | 'expense' | 'transfer'
  category_id?: number
  status?: string
  date_from?: string
  date_to?: string
  search?: string
  per_page?: number
  page?: number
}

export interface TransactionStats {
  total_income: number
  total_expenses: number
  balance: number
  current_month_income: number
  current_month_expenses: number
  current_month_balance: number
  transactions_count: number
}

export interface PaginatedTransactions {
  data: Transaction[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}
