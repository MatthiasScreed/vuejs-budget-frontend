// ==========================================
// DASHBOARD TYPES - VERSION CORRIGÉE
// ==========================================

import type { DateString, EntityId } from '../base'
import type { Transaction } from './transactions'  // ✅ Import correct
import type { Achievement } from './gaming'        // ✅ Import correct

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

export interface DashboardStats {
  financial: {
    balance: number
    monthly_income: number
    monthly_expenses: number
    total_transactions: number
    savings_rate: number
    expense_categories: Array<{
      category: string
      amount: number
      percentage: number
    }>
  }
  goals: {
    total_goals: number
    active_goals: number
    completed_goals: number
    total_saved: number
    total_target: number
    completion_rate: number
    average_progress: number
  }
  gaming: {
    level: number
    total_xp: number
    current_level_xp: number
    next_level_xp: number
    level_progress_percentage: number
    achievements_count: number
    achievements_unlocked: number
    active_streaks: number
    longest_streak: number
    weekly_xp: number
    monthly_xp: number
  }
  recent_activity: {
    recent_transactions: Transaction[]
    recent_achievements: Achievement[]
    last_activity_date: DateString
  }

  // 🆕 Section Banking (Bridge)
  banking?: {
    connected_accounts: number
    total_balance: number
    last_sync: DateString
    pending_sync_transactions: number
    sync_status: 'connected' | 'disconnected' | 'syncing' | 'error'
    auto_sync_enabled: boolean
  }
}

// ==========================================
// DASHBOARD ANALYTICS
// ==========================================

export interface DashboardAnalytics {
  overview: {
    total_income: number
    total_expenses: number
    net_balance: number
    transactions_count: number
    average_transaction_amount: number
    most_expensive_transaction: number
    period: {
      start_date: DateString
      end_date: DateString
      days_count: number
    }
  }

  cash_flow: {
    monthly_data: Array<{
      month: string
      year: number
      income: number
      expenses: number
      balance: number
      net_savings: number
      transactions_count: number
    }>
    trend: 'increasing' | 'decreasing' | 'stable'
    projection: {
      next_month_income: number
      next_month_expenses: number
      confidence_score: number
    }
  }

  category_breakdown: {
    income_categories: CategoryBreakdown[]
    expense_categories: CategoryBreakdown[]
    top_categories: CategoryBreakdown[]
    unused_categories: string[]
  }

  trends: {
    income_trend: TrendData
    expense_trend: TrendData
    savings_trend: TrendData
    category_trends: Array<{
      category: string
      trend: TrendData
    }>
  }

  gaming_stats: {
    level: number
    xp: number
    achievements: number
    challenges_completed: number
    streaks_active: number
    weekly_activity: Array<{
      day: string
      date: DateString
      transactions: number
      xp_earned: number
      achievements_unlocked: number
    }>
    monthly_progression: Array<{
      month: string
      level_start: number
      level_end: number
      xp_gained: number
      achievements_count: number
    }>
  }

  // 🆕 Insights IA
  insights: {
    spending_patterns: string[]
    saving_opportunities: string[]
    budget_recommendations: string[]
    goal_suggestions: string[]
    risk_alerts: string[]
  }
}

// ==========================================
// TYPES SUPPLÉMENTAIRES
// ==========================================

export interface CategoryBreakdown {
  category: string
  category_id: EntityId
  amount: number
  percentage: number
  color: string
  icon: string
  transaction_count: number
  average_amount: number
  trend: 'up' | 'down' | 'stable'
}

export interface TrendData {
  value: number
  percentage_change: number
  direction: 'up' | 'down' | 'stable'
  period_comparison: 'vs_previous_month' | 'vs_previous_week' | 'vs_last_year'
  confidence_level: 'high' | 'medium' | 'low'
}

export interface DashboardWidget {
  id: string
  type: 'stats' | 'chart' | 'list' | 'gaming' | 'goals'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  position: {
    row: number
    col: number
    width: number
    height: number
  }
  config: Record<string, any>
  is_visible: boolean
  is_draggable: boolean
  refresh_interval?: number
}

export interface DashboardLayout {
  id: EntityId
  user_id: EntityId
  name: string
  widgets: DashboardWidget[]
  is_default: boolean
  created_at: DateString
  updated_at: DateString
}

// ==========================================
// DASHBOARD LOADING STATES
// ==========================================

export interface DashboardLoadingState {
  stats: boolean
  analytics: boolean
  gaming: boolean
  banking: boolean
  goals: boolean
  transactions: boolean
  achievements: boolean
}

export interface DashboardErrorState {
  stats: string | null
  analytics: string | null
  gaming: string | null
  banking: string | null
  general: string | null
}

// ==========================================
// DASHBOARD ACTIONS
// ==========================================

export interface DashboardAction {
  type: 'refresh_all' | 'refresh_stats' | 'refresh_gaming' | 'sync_bank' | 'check_achievements'
  title: string
  icon: string
  loading: boolean
  disabled: boolean
  action: () => Promise<void>
}

// ==========================================
// FILTERS & PERIODS
// ==========================================

export interface DashboardPeriodFilter {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  start_date?: DateString
  end_date?: DateString
  comparison_period?: DashboardPeriodFilter
}

export interface DashboardFilters {
  period: DashboardPeriodFilter
  categories?: EntityId[]
  transaction_types?: ('income' | 'expense')[]
  amount_range?: {
    min: number
    max: number
  }
  include_recurring?: boolean
}

// ==========================================
// DASHBOARD PREFERENCES
// ==========================================

export interface DashboardPreferences {
  user_id: EntityId
  default_period: 'week' | 'month' | 'quarter' | 'year'
  currency_display: 'symbol' | 'code' | 'name'
  chart_type: 'line' | 'bar' | 'pie' | 'doughnut'
  show_gaming_stats: boolean
  show_banking_info: boolean
  auto_refresh: boolean
  refresh_interval: number // en minutes
  widgets_order: string[]
  created_at: DateString
  updated_at: DateString
}

// ==========================================
// API RESPONSES
// ==========================================

export interface DashboardResponse {
  stats: DashboardStats
  analytics?: DashboardAnalytics
  user_preferences?: DashboardPreferences
  last_updated: DateString
  cache_expires_at: DateString
}

export interface DashboardRefreshResponse {
  success: boolean
  updated_sections: string[]
  stats: DashboardStats
  gaming_updates?: {
    xp_gained: number
    achievements_unlocked: Achievement[]
    level_up: boolean
  }
  message: string
}
