export interface Transaction {
  id: number
  user_id: number
  category_id?: number
  type: 'income' | 'expense'
  amount: number
  description: string
  transaction_date: string
  is_recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurring_end_date?: string
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  category?: Category
}

export interface Category {
  id: number
  user_id: number
  name: string
  icon: string
  color: string
  type: 'income' | 'expense' | 'both'
  budget_limit?: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FinancialGoal {
  id: number
  user_id: number
  name: string
  description?: string
  target_amount: number
  current_amount: number
  target_date: string
  status: 'active' | 'completed' | 'paused'
  project_template?: string
  created_at: string
  updated_at: string
  contributions?: GoalContribution[]
}

export interface GoalContribution {
  id: number
  goal_id: number
  user_id: number
  amount: number
  description?: string
  contribution_date: string
  created_at: string
  updated_at: string
}

export interface Budget {
  id: number
  user_id: number
  name: string
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
  total_budget: number
  categories: BudgetCategory[]
  created_at: string
  updated_at: string
}

export interface BudgetCategory {
  id: number
  budget_id: number
  category_id: number
  allocated_amount: number
  spent_amount: number
  remaining_amount: number
  category: Category
}

export interface Projection {
  id: number
  user_id: number
  type: 'income' | 'expense' | 'balance'
  period: 'monthly' | 'yearly'
  projected_amount: number
  confidence_score: number
  factors: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Suggestion {
  id: number
  user_id: number
  type: 'saving' | 'spending' | 'investment' | 'goal'
  title: string
  description: string
  impact_score: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  estimated_savings?: number
  category?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
