// ==========================================
// GAMING ENTITIES - Types pour le système gaming
// ==========================================

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  condition_type: string
  condition_value: number
  xp_reward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface AchievementProgress {
  id: number
  user_id: number
  achievement_id: string
  unlocked: boolean
  progress: number
  unlocked_at?: string
  created_at: string
  updated_at: string
}

export interface AchievementCategory {
  id: string
  name: string
  icon: string
  color: string
}

export interface UserLevel {
  id: number
  user_id: number
  level: number
  total_xp: number
  current_level_xp: number
  next_level_xp: number
  created_at: string
  updated_at: string
}

export interface XPEvent {
  id: string
  user_id: number
  event_type: string
  xp_amount: number
  description?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface LevelReward {
  id: number
  level: number
  reward_type: string
  reward_value: string
  description?: string
  claimed: boolean
  created_at: string
}

export interface Challenge {
  id: string
  name: string
  description: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  condition_type: string
  condition_value: number
  target_value: number
  xp_reward: number
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'cancelled'
  participants_count: number
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface UserChallenge {
  id: number
  user_id: number
  challenge_id: string
  status: 'active' | 'completed' | 'abandoned'
  progress: number
  current_rank?: number
  final_rank?: number
  joined_at: string
  completed_at?: string
  updated_at: string
}

export interface ChallengeParticipation {
  user_id: number
  challenge_id: string
  rank: number
  progress: number
  updated_at: string
}

export interface ChallengeLeaderboard {
  challenge_id: string
  entries: Array<{
    user_id: number
    user_name: string
    progress: number
    rank: number
    is_current_user: boolean
  }>
  updated_at: string
}

export interface Streak {
  id: string
  user_id: number
  type: 'daily_transaction' | 'weekly_savings' | 'goal_progress' | 'challenge_participation'
  name: string
  description: string
  current_count: number
  best_count: number
  multiplier: number
  xp_bonus: number
  last_activity_date: string
  expires_at: string
  status: 'active' | 'broken' | 'completed'
  created_at: string
  updated_at: string
}

export interface StreakActivity {
  id: number
  streak_id: string
  activity_type: string
  activity_date: string
  metadata?: Record<string, any>
  created_at: string
}

// ==========================================
// FINANCIAL ENTITIES
// ==========================================

export interface FinancialGoal {
  id: number
  user_id: number
  name: string
  description?: string
  target_amount: number
  current_amount: number
  target_date: string
  status: 'active' | 'completed' | 'paused'
  project_id?: number
  created_at: string
  updated_at: string
}

export interface GoalContribution {
  id: number
  goal_id: number
  amount: number
  description?: string
  transaction_id?: number
  metadata?: Record<string, any>
  created_at: string
}

export interface Projection {
  id: number
  user_id: number
  type: string
  period: string
  predicted_amount: number
  confidence_score: number
  factors: Record<string, any>
  created_at: string
}

export interface Suggestion {
  id: number
  user_id: number
  type: string
  title: string
  description: string
  action_type?: string
  action_data?: Record<string, any>
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'applied' | 'dismissed'
  confidence_score: number
  created_at: string
}

// ==========================================
// CREATE/UPDATE DATA TYPES
// ==========================================

export interface CreateGoalData {
  name: string
  description?: string
  target_amount: number
  target_date: string
  current_amount?: number
  project_id?: number
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  status?: 'active' | 'completed' | 'paused'
}

// ==========================================
// API RESPONSE WRAPPERS
// ==========================================

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationData
  links?: {
    first: string
    last: string
    prev?: string
    next?: string
  }
}

export interface StatsResponse {
  financial: {
    balance: number
    monthly_income: number
    monthly_expenses: number
    total_transactions: number
  }
  goals: {
    total_goals: number
    active_goals: number
    completed_goals: number
    total_saved: number
    total_target: number
  }
  gaming: {
    level: number
    total_xp: number
    achievements_count: number
    active_streaks: number
  }
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type EntityStatus = 'active' | 'completed' | 'paused' | 'cancelled'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type Priority = 'low' | 'normal' | 'high'

// ==========================================
// ERROR TYPES
// ==========================================

export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  code?: string
  status?: number
}
