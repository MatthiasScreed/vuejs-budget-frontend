// src/types/api.types.ts

/**
 * Types pour les réponses API
 * École 42: Types explicites pour toutes les API
 */

// ==========================================
// RÉPONSES GÉNÉRIQUES
// ==========================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    from: number
    to: number
    total: number
    per_page: number
    last_page: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

// ==========================================
// DASHBOARD
// ==========================================

export interface DashboardMetricsResponse {
  monthly_income: number
  monthly_expenses: number
  savings_capacity: number
  savings_rate: number
  total_balance: number
  active_goals_count: number
}

export interface DashboardDataResponse {
  metrics: DashboardMetricsResponse
  goals: GoalApiResponse[]
  categories: CategoryBreakdownResponse[]
  recent_transactions: TransactionApiResponse[]
  projections: ProjectionApiResponse[]
}

// ==========================================
// TRANSACTIONS
// ==========================================

export interface TransactionApiResponse {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string // ISO format
  category_id: number | null
  category?: {
    id: number
    name: string
    icon: string
    color: string
  }
  account_id: number
  is_recurring: boolean
  bridge_transaction_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateTransactionRequest {
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  category_id?: number
  account_id: number
  is_recurring?: boolean
}

// ==========================================
// GOALS
// ==========================================

export interface GoalApiResponse {
  id: number
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused'
  category: string
  icon: string
  progress_percentage: number
  estimated_completion_date: string | null
  created_at: string
  updated_at: string
}

// ==========================================
// CATEGORIES
// ==========================================

export interface CategoryBreakdownResponse {
  id: number
  name: string
  amount: number
  percentage: number
  color: string
  icon: string
  trend: 'up' | 'down' | 'stable'
  trend_percentage: number
  transaction_count: number
}

// ==========================================
// PROJECTIONS
// ==========================================

export interface ProjectionApiResponse {
  period: '3months' | '6months' | '12months'
  period_label: string
  projected_savings: number
  projected_income: number
  projected_expenses: number
  confidence: number
  variance_min: number
  variance_max: number
  assumptions: string[]
}

export interface InsightApiResponse {
  id: string
  type: 'warning' | 'opportunity' | 'achievement' | 'suggestion'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  actionable: boolean
  action_label?: string
  action_route?: string
  icon: string
  color: string
}
