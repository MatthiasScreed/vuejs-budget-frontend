export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  validationErrors: Record<string, string[]>
}

export interface DashboardState {
  stats: DashboardStats | null
  analytics: DashboardAnalytics | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface GamingState {
  userLevel: UserLevel | null
  stats: GamingStats | null
  achievements: Achievement[]
  unlockedAchievements: Achievement[]
  challenges: Challenge[]
  streaks: Streak[]
  loading: boolean
  error: string | null
  notifications: GamingNotification[]
}

export interface TransactionState {
  transactions: Transaction[]
  categories: Category[]
  loading: boolean
  error: string | null
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface GoalState {
  goals: FinancialGoal[]
  currentGoal: FinancialGoal | null
  contributions: GoalContribution[]
  loading: boolean
  error: string | null
  validationErrors: Record<string, string[]>
}
