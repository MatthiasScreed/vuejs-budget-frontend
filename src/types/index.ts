// src/types/index.ts

// ===== TYPES DE BASE =====
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  meta?: {
    total?: number
    per_page?: number
    current_page?: number
    last_page?: number
  }
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  email_verified_at?: string

  // Gaming data
  level: number
  total_xp: number
  current_level_xp: number
  next_level_xp: number
  gaming_enabled: boolean

  // Préférences
  currency: string
  timezone: string
  theme: 'light' | 'dark' | 'auto'

  // Stats
  total_transactions: number
  total_savings: number
  current_streak: number
  longest_streak: number

  created_at: string
  updated_at: string
}

// ===== TYPES FINANCIERS =====
export interface Transaction {
  id: number
  user_id: number
  category_id: number
  amount: number
  description: string
  type: 'income' | 'expense' | 'transfer'
  date: string
  status: 'pending' | 'completed' | 'cancelled'

  // Métadonnées
  tags?: string[]
  location?: string
  receipt_url?: string

  // Relations
  category?: Category
  recurring_transaction_id?: number

  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  color: string
  icon: string
  type: 'income' | 'expense' | 'transfer' | 'both'
  parent_id?: number

  // Budget
  monthly_budget?: number
  current_spent: number
  budget_status: 'safe' | 'warning' | 'exceeded'

  // Gaming
  xp_multiplier: number

  // Relations
  children?: Category[]
  parent?: Category

  created_at: string
  updated_at: string
}

export interface FinancialGoal {
  id: number
  user_id: number
  name: string
  description: string
  target_amount: number
  current_amount: number
  target_date: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'

  // Gaming
  xp_reward: number
  milestone_rewards: Record<string, number>

  // Métadonnées
  category: string
  priority: 'low' | 'medium' | 'high'

  created_at: string
  updated_at: string
}

// ===== TYPES GAMING =====
export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  category: string
  xp_reward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'

  // Conditions
  criteria: Record<string, any>
  hidden: boolean

  // User progress
  unlocked_at?: string
  progress?: number
  max_progress?: number

  created_at: string
  updated_at: string
}

export interface Challenge {
  id: number
  name: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  status: 'active' | 'completed' | 'failed' | 'expired'

  // Objectifs
  target_value: number
  current_value: number
  target_metric: string

  // Récompenses
  xp_reward: number
  bonus_multiplier: number
  special_rewards?: string[]

  // Dates
  start_date: string
  end_date: string

  created_at: string
  updated_at: string
}

export interface UserLevel {
  id: number
  user_id: number
  level: number
  total_xp: number
  current_level_xp: number
  next_level_xp: number

  // Bonus de niveau
  xp_multiplier: number
  special_perks: string[]

  // Historique
  level_up_date?: string
  previous_level?: number

  updated_at: string
}

export interface Streak {
  id: number
  user_id: number
  type: 'daily_budget_check' | 'transaction_entry' | 'goal_progress'
  current_count: number
  longest_count: number
  last_activity_date: string

  // Bonus
  bonus_xp_per_day: number
  milestone_bonuses: Record<string, number>

  created_at: string
  updated_at: string
}

export interface GamingStats {
  total_xp: number
  current_level: number
  achievements_unlocked: number
  total_achievements: number
  active_streaks: number
  completed_challenges: number
  leaderboard_position?: number

  // Stats par période
  daily_xp: number
  weekly_xp: number
  monthly_xp: number

  // Répartition XP
  xp_by_activity: Record<string, number>

  updated_at: string
}

// ===== TYPES UI =====
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'gaming'
  title: string
  message: string
  duration: number
  actions?: ToastAction[]
}

export interface ToastAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary'
}

export interface Modal {
  id: string
  component: string
  props?: Record<string, any>
  persistent?: boolean
}

export interface LoadingState {
  [key: string]: boolean
}

// ===== TYPES FORMS =====
export interface TransactionForm {
  category_id: number
  amount: number | string
  description: string
  type: 'income' | 'expense'
  date: string
  tags?: string[]
}

export interface CategoryForm {
  name: string
  color: string
  icon: string
  type: 'income' | 'expense'
  parent_id?: number
  monthly_budget?: number
}

export interface GoalForm {
  name: string
  description: string
  target_amount: number | string
  target_date: string
  category: string
  priority: 'low' | 'medium' | 'high'
}

// ===== TYPES PROJETS =====
export interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  estimated_cost: number
  duration_months: number

  // Structure du projet
  phases: ProjectPhase[]
  default_categories: string[]

  // Gaming
  xp_rewards: Record<string, number>
  achievements: string[]
}

export interface ProjectPhase {
  id: string
  name: string
  description: string
  order: number
  estimated_cost: number
  categories: string[]
  milestones: string[]
}

export interface UserProject {
  id: number
  user_id: number
  template_id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'

  // Progression
  current_phase: number
  progress_percentage: number
  total_spent: number
  remaining_budget: number

  // Dates
  start_date: string
  target_date: string
  completed_at?: string

  created_at: string
  updated_at: string
}

// ===== TYPES CACHE ET PERFORMANCE =====
export interface CacheConfig {
  ttl: number
  tags: string[]
  key: string
}

export interface ErrorLog {
  id: string
  timestamp: number
  type: 'api' | 'validation' | 'network' | 'gaming' | 'system'
  message: string
  context?: string
  stack?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}

// ===== TYPES ANALYTICS =====
export interface AnalyticsEvent {
  name: string
  category: string
  properties: Record<string, any>
  timestamp: number
  user_id?: number
}

export interface BudgetAnalytics {
  total_income: number
  total_expenses: number
  savings_rate: number
  top_categories: { category: string; amount: number }[]
  monthly_trends: { month: string; income: number; expenses: number }[]
  goal_progress: { goal: string; progress: number }[]
}

// ===== TYPES VALIDATION =====
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  email?: boolean
  numeric?: boolean
  custom?: (value: any) => boolean | string
}

export interface ValidationRules {
  [field: string]: ValidationRule
}

export interface ValidationErrors {
  [field: string]: string[]
}

// ===== TYPES ROUTES =====
export interface RouteConfig {
  path: string
  name: string
  component: any
  meta?: {
    requiresAuth?: boolean
    title?: string
    gaming?: boolean
    level?: number
  }
  children?: RouteConfig[]
}

// ===== TYPES WIDGETS DASHBOARD =====
export interface DashboardWidget {
  id: string
  type: 'chart' | 'stat' | 'progress' | 'gaming' | 'list'
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  config: Record<string, any>
  data?: any
}

// ===== EXPORTS GROUPÉS =====
export type TransactionType = Transaction['type']
export type CategoryType = Category['type']
export type GoalStatus = FinancialGoal['status']
export type ChallengeType = Challenge['type']
export type AchievementRarity = Achievement['rarity']
export type UserTheme = User['theme']

// Types utilitaires
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
