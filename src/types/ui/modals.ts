// ==========================================
// UI MODALS TYPES - types/ui/modals.ts
// ==========================================

import type { DateString, EntityId } from '../base'
import type { Transaction, CreateTransactionData } from '../entities/transactions'
import type { Achievement, Challenge, FinancialGoal } from '../entities'

// ==========================================
// BASE MODAL PROPS
// ==========================================

export interface BaseModalProps {
  visible: boolean
  title?: string
  subtitle?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  maskClosable?: boolean
  centered?: boolean
  fullscreen?: boolean
  loading?: boolean
  className?: string
  onClose?: () => void
}

// ==========================================
// CONFIRMATION MODALS
// ==========================================

export interface ConfirmModalProps extends BaseModalProps {
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export interface DeleteConfirmModalProps extends ConfirmModalProps {
  itemName: string
  itemType: 'transaction' | 'category' | 'goal' | 'achievement'
  permanent?: boolean
}

// ==========================================
// TRANSACTION MODALS
// ==========================================

export interface TransactionModalProps extends BaseModalProps {
  mode: 'create' | 'edit' | 'view'
  transaction?: Transaction
  initialData?: Partial<CreateTransactionData>
  onSubmit: (data: CreateTransactionData) => Promise<void>
  onUpdate?: (id: EntityId, data: Partial<Transaction>) => Promise<void>
  onDelete?: (id: EntityId) => Promise<void>
}

export interface QuickTransactionModalProps extends BaseModalProps {
  type: 'income' | 'expense'
  onSubmit: (data: CreateTransactionData) => Promise<void>
  categories: Array<{
    id: EntityId
    name: string
    icon: string
    color: string
  }>
}

export interface RecurringTransactionModalProps extends BaseModalProps {
  onSubmit: (data: CreateTransactionData & { is_recurring: true }) => Promise<void>
  onPreview: (data: CreateTransactionData) => Promise<Transaction[]>
}

// ==========================================
// GAMING MODALS
// ==========================================

export interface AchievementModalProps extends BaseModalProps {
  achievement: Achievement
  progress?: number
  showProgress?: boolean
  celebrationMode?: boolean
  onClaim?: () => Promise<void>
  onShare?: () => void
}

export interface LevelUpModalProps extends BaseModalProps {
  oldLevel: number
  newLevel: number
  xpGained: number
  newFeatures?: string[]
  rewards?: Array<{
    type: string
    name: string
    icon: string
  }>
  celebrationAnimation?: boolean
}

export interface ChallengeModalProps extends BaseModalProps {
  challenge: Challenge
  progress?: number
  timeRemaining?: number
  onAccept?: () => Promise<void>
  onComplete?: () => Promise<void>
}

export interface LeaderboardModalProps extends BaseModalProps {
  type: 'global' | 'friends' | 'local'
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  userPosition?: number
  showFilters?: boolean
}

// ==========================================
// FINANCIAL MODALS
// ==========================================

export interface GoalModalProps extends BaseModalProps {
  mode: 'create' | 'edit' | 'view'
  goal?: FinancialGoal
  onSubmit: (data: any) => Promise<void>
  onUpdate?: (id: EntityId, data: any) => Promise<void>
  onDelete?: (id: EntityId) => Promise<void>
  templates?: Array<{
    id: string
    name: string
    icon: string
    description: string
  }>
}

export interface BudgetModalProps extends BaseModalProps {
  mode: 'create' | 'edit'
  currentBudget?: any
  onSubmit: (data: any) => Promise<void>
  categories: Array<{
    id: EntityId
    name: string
    current_spending: number
  }>
}

export interface CategoryModalProps extends BaseModalProps {
  mode: 'create' | 'edit'
  category?: any
  onSubmit: (data: any) => Promise<void>
  existingCategories: string[]
}

// ==========================================
// ANALYTICS & REPORTS MODALS
// ==========================================

export interface ReportModalProps extends BaseModalProps {
  reportType: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  period: {
    start: DateString
    end: DateString
  }
  onGenerate: (config: ReportConfig) => Promise<void>
  onExport?: (format: 'pdf' | 'excel' | 'csv') => Promise<void>
}

export interface ReportConfig {
  include_transactions: boolean
  include_categories: boolean
  include_goals: boolean
  include_gaming_stats: boolean
  group_by: 'day' | 'week' | 'month' | 'category'
  currency: string
  charts: Array<{
    type: 'line' | 'bar' | 'pie'
    data: string
  }>
}

export interface FilterModalProps extends BaseModalProps {
  filters: {
    categories: EntityId[]
    date_range: {
      start: DateString
      end: DateString
    }
    amount_range: {
      min: number
      max: number
    }
    types: ('income' | 'expense')[]
  }
  onApply: (filters: any) => void
  onReset: () => void
}

// ==========================================
// SETTINGS MODALS
// ==========================================

export interface SettingsModalProps extends BaseModalProps {
  section?: 'profile' | 'notifications' | 'gaming' | 'banking' | 'privacy'
  onSave: (settings: any) => Promise<void>
}

export interface NotificationSettingsProps {
  email_notifications: boolean
  push_notifications: boolean
  gaming_notifications: boolean
  achievement_notifications: boolean
  goal_reminders: boolean
  budget_alerts: boolean
  banking_sync_notifications: boolean
}

// ==========================================
// BANKING MODALS (BRIDGE)
// ==========================================

export interface BankConnectionModalProps extends BaseModalProps {
  onConnect: (bankId: string) => Promise<void>
  availableBanks: Array<{
    id: string
    name: string
    logo: string
    country: string
  }>
  connectingBankId?: string
}

export interface BankSyncModalProps extends BaseModalProps {
  accounts: Array<{
    id: string
    name: string
    balance: number
    last_sync: DateString
  }>
  onSync: (accountIds: string[]) => Promise<void>
  onDisconnect: (accountId: string) => Promise<void>
}

// ==========================================
// GENERIC MODAL TYPES
// ==========================================

export interface AlertModalProps extends BaseModalProps {
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  icon?: string
  autoClose?: boolean
  autoCloseDelay?: number
}

export interface InputModalProps extends BaseModalProps {
  label: string
  placeholder?: string
  inputType?: 'text' | 'number' | 'email' | 'password'
  required?: boolean
  validation?: (value: string) => string | null
  onSubmit: (value: string) => Promise<void>
}

export interface SelectModalProps extends BaseModalProps {
  label: string
  options: Array<{
    value: string | number
    label: string
    icon?: string
    disabled?: boolean
  }>
  multiple?: boolean
  searchable?: boolean
  onSubmit: (values: string[] | string) => Promise<void>
}

// ==========================================
// MODAL ACTIONS & EVENTS
// ==========================================

export interface ModalAction {
  label: string
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  loading?: boolean
  disabled?: boolean
  action: () => void | Promise<void>
}

export interface ModalEvent {
  type: 'open' | 'close' | 'confirm' | 'cancel' | 'submit'
  modalId: string
  data?: any
  timestamp: number
}

// ==========================================
// MODAL MANAGER TYPES
// ==========================================

export interface ModalConfig {
  id: string
  component: string
  props: Record<string, any>
  persistent?: boolean
  zIndex?: number
}

export interface ModalManager {
  open: (config: ModalConfig) => void
  close: (id: string) => void
  closeAll: () => void
  isOpen: (id: string) => boolean
  getModal: (id: string) => ModalConfig | null
}
