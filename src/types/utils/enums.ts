import type { Transaction } from '@/types/entities/gaming.ts'

export type NotificationType =
  | 'achievement_unlocked'
  | 'level_up'
  | 'challenge_completed'
  | 'streak_milestone'
  | 'leaderboard_position'
  | 'xp_gained'
  | 'goal_reached'
  | 'budget_exceeded'
  | 'transaction_created'

export type AchievementConditionType =
  | 'transaction_count'
  | 'total_income'
  | 'total_expenses'
  | 'balance_positive'
  | 'categories_used'
  | 'days_active'
  | 'user_level'
  | 'first_transaction'
  | 'expense_category'
  | 'income_streak'
  | 'savings_goal'
  | 'budget_respect'

export type ChallengeConditionType =
  | 'daily_transaction'
  | 'weekly_budget'
  | 'category_target'
  | 'savings_challenge'
  | 'no_expense_day'
  | 'income_goal'
  | 'streak_maintain'

export type StreakType =
  | 'daily_transaction'
  | 'budget_respect'
  | 'goal_progress'
  | 'category_tracking'
  | 'login_streak'

export type ProjectTemplate =
  | 'travel'
  | 'real_estate'
  | 'car'
  | 'event'
  | 'emergency_fund'
  | 'investment'
  | 'education'
  | 'home_improvement'
  | 'business'
  | 'debt_payoff'

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'CAD'

export type Language = 'fr' | 'en' | 'es' | 'de' | 'it'

export type Timezone =
  | 'Europe/Paris'
  | 'Europe/London'
  | 'America/New_York'
  | 'America/Los_Angeles'
  | 'Asia/Tokyo'
  | 'Australia/Sydney'

export const validateTransaction = (data: any): data is Transaction => {
  return (
    typeof data.amount === 'number' &&
    data.amount > 0 &&
    ['income', 'expense'].includes(data.type) &&
    typeof data.description === 'string'
  )
}
