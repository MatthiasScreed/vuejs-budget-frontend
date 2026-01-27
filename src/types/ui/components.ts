// ==========================================
// UI COMPONENTS TYPES - VERSION CORRIGÉE
// ==========================================

import type { DateString, EntityId } from '../base'
import type {
  Achievement,
  AchievementProgress,
  Challenge,
  ChallengeProgress,
  GamingNotification,
  LeaderboardPeriod,
  UserLevel,
  Streak
} from '../entities/gaming'
import type { Transaction, Category } from '../entities/transactions'
import type { FinancialGoal } from '../entities/financial'

// ==========================================
// BASE COMPONENT PROPS
// ==========================================

export interface BaseCardProps {
  title?: string
  subtitle?: string
  hover?: boolean
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  loading?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export interface StatCardProps extends BaseCardProps {
  label: string
  value: number | string
  change?: number
  subtitle?: string
  icon?: string
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'custom'
  currency?: string
  precision?: number
  showTrend?: boolean
  trendPeriod?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  colorScheme?: 'auto' | 'positive' | 'negative' | 'neutral'
}

// ==========================================
// GAMING COMPONENTS
// ==========================================

export interface AchievementCardProps {
  achievement: Achievement
  progress?: AchievementProgress
  showProgress?: boolean
  showRarity?: boolean
  showCategory?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'locked' | 'unlocked' | 'in_progress' | 'completed'
  interactive?: boolean
  compact?: boolean
  animated?: boolean
  onClick?: (achievement: Achievement) => void
}

export interface ChallengeCardProps {
  challenge: Challenge
  progress?: ChallengeProgress
  showTimer?: boolean
  showDifficulty?: boolean
  showReward?: boolean
  compact?: boolean
  interactive?: boolean
  showProgress?: boolean
  onClick?: (challenge: Challenge) => void
}

export interface UserLevelCardProps {
  userLevel: UserLevel
  showXPDetails?: boolean
  showProgress?: boolean
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export interface StreakCardProps {
  streak: Streak
  showBest?: boolean
  showType?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export interface LeaderboardProps {
  type: 'xp' | 'achievements' | 'challenges' | 'level'
  period: LeaderboardPeriod
  limit?: number
  showCurrentUser?: boolean
  showPosition?: boolean
  showAvatar?: boolean
  interactive?: boolean
  onUserClick?: (userId: EntityId) => void
}

export interface GamingNotificationProps {
  notification: GamingNotification
  visible: boolean
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  showIcon?: boolean
  showClose?: boolean
  animated?: boolean
  onClose?: () => void
  onClick?: () => void
}

// ==========================================
// FINANCIAL COMPONENTS
// ==========================================

export interface TransactionCardProps {
  transaction: Transaction
  showCategory?: boolean
  showDate?: boolean
  showStatus?: boolean
  compact?: boolean
  interactive?: boolean
  showActions?: boolean
  onClick?: (transaction: Transaction) => void
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
}

export interface CategoryCardProps {
  category: Category
  showBudget?: boolean
  showTransactionCount?: boolean
  showAmount?: boolean
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onClick?: (category: Category) => void
}

export interface GoalCardProps {
  goal: FinancialGoal
  showProgress?: boolean
  showDeadline?: boolean
  showActions?: boolean
  compact?: boolean
  interactive?: boolean
  onClick?: (goal: FinancialGoal) => void
}

// ==========================================
// CHART COMPONENTS
// ==========================================

export interface ChartProps {
  data: any[]
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
  title?: string
  height?: number
  width?: number
  responsive?: boolean
  animated?: boolean
  showLegend?: boolean
  showGrid?: boolean
  colorScheme?: string[]
}

export interface FinancialChartProps extends ChartProps {
  currency?: string
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  showTrend?: boolean
  showComparison?: boolean
}

export interface GamingChartProps extends ChartProps {
  showXP?: boolean
  showLevel?: boolean
  showAchievements?: boolean
  timeframe?: 'week' | 'month' | 'quarter' | 'year'
}

// ==========================================
// TABLE COMPONENTS
// ==========================================

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => string
  render?: (value: any, item: T) => string
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string | null
  pagination?: {
    current_page: number
    per_page: number
    total: number
    show_pagination?: boolean
  }
  sortable?: boolean
  filterable?: boolean
  selectable?: boolean
  actions?: Array<{
    label: string
    icon?: string
    action: (item: T) => void
    variant?: 'primary' | 'secondary' | 'danger'
  }>
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  onFilter?: (filters: Record<string, any>) => void
  onSelect?: (items: T[]) => void
}

// ==========================================
// FORM COMPONENTS
// ==========================================

export interface FormFieldProps {
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  error?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
}

export interface SelectOption {
  value: string | number
  label: string
  icon?: string
  disabled?: boolean
  group?: string
}

export interface SelectProps extends FormFieldProps {
  options: SelectOption[]
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  onCreate?: (value: string) => void
}

export interface DatePickerProps extends FormFieldProps {
  format?: string
  minDate?: Date
  maxDate?: Date
  showTime?: boolean
  range?: boolean
}

// ==========================================
// MODAL & OVERLAY COMPONENTS
// ==========================================

export interface ModalProps {
  visible: boolean
  title?: string
  subtitle?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  maskClosable?: boolean
  centered?: boolean
  fullscreen?: boolean
  loading?: boolean
  onClose?: () => void
  onConfirm?: () => void
  onCancel?: () => void
}

export interface TooltipProps {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click' | 'focus'
  disabled?: boolean
  delay?: number
}

// ==========================================
// NAVIGATION COMPONENTS
// ==========================================

export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
  active?: boolean
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: string
  showHome?: boolean
  maxItems?: number
}

export interface TabItem {
  key: string
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
  content?: any
}

export interface TabsProps {
  items: TabItem[]
  activeKey?: string
  onChange?: (key: string) => void
  type?: 'line' | 'card' | 'button'
  size?: 'sm' | 'md' | 'lg'
  centered?: boolean
}

// ==========================================
// GAMING UI SPECIFIC
// ==========================================

export interface XPBarProps {
  currentXP: number
  maxXP: number
  level: number
  animated?: boolean
  showNumbers?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  glowing?: boolean
}

export interface LevelBadgeProps {
  level: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'premium' | 'elite'
  animated?: boolean
}

// ==========================================
// UTILITY COMPONENT TYPES
// ==========================================

export interface IconProps {
  name: string
  size?: number | string
  color?: string
  className?: string
}

export interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  online?: boolean
}

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  rounded?: boolean
  outline?: boolean
}

// ==========================================
// RESPONSIVE & LAYOUT TYPES
// ==========================================

export interface ResponsiveBreakpoints {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

export interface GridProps {
  cols?: number | Partial<ResponsiveBreakpoints>
  gap?: number | string
  autoRows?: string
  className?: string
}

export interface FlexProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  gap?: number | string
  className?: string
}
