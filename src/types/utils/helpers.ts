// ==========================================
// UTILS HELPERS - types/utils/helpers.ts
// ==========================================

import type { EntityId, DateString, Currency } from '../base'
import type {
  Transaction,
  Achievement,
  AchievementRarity,
  UserLevel,
  GamingStats
} from '../entities/gaming'

// ==========================================
// CURRENCY HELPERS
// ==========================================

export interface CurrencyHelpers {
  format: (amount: number, currency: Currency, locale?: string) => string
  parse: (value: string, currency: Currency) => number
  convert: (amount: number, fromCurrency: Currency, toCurrency: Currency) => Promise<number>
  getSymbol: (currency: Currency) => string
  getDisplayName: (currency: Currency) => string
}

export interface CurrencyFormatOptions {
  currency: Currency
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
  style?: 'currency' | 'decimal' | 'percent'
}

// ==========================================
// DATE HELPERS
// ==========================================

export interface DateHelpers {
  format: (date: Date | string, format: string, locale?: string) => string
  parse: (dateString: string, format?: string) => Date
  isValid: (date: any) => boolean
  addDays: (date: Date, days: number) => Date
  addMonths: (date: Date, months: number) => Date
  diffInDays: (startDate: Date, endDate: Date) => number
  isToday: (date: Date) => boolean
  isThisWeek: (date: Date) => boolean
  isThisMonth: (date: Date) => boolean
  getWeekStart: (date: Date) => Date
  getMonthStart: (date: Date) => Date
  getQuarterStart: (date: Date) => Date
  getYearStart: (date: Date) => Date
}

export interface DateRange {
  start: DateString
  end: DateString
  label?: string
}

export interface RelativeTimeOptions {
  includeSeconds?: boolean
  addSuffix?: boolean
  locale?: string
}

// ==========================================
// MATH & CALCULATION HELPERS
// ==========================================

export interface MathHelpers {
  round: (value: number, decimals?: number) => number
  percentage: (value: number, total: number) => number
  average: (values: number[]) => number
  sum: (values: number[]) => number
  median: (values: number[]) => number
  variance: (values: number[]) => number
  standardDeviation: (values: number[]) => number
  compound: (principal: number, rate: number, periods: number) => number
  presentValue: (futureValue: number, rate: number, periods: number) => number
}

export interface StatisticalData {
  count: number
  sum: number
  average: number
  median: number
  min: number
  max: number
  variance: number
  standardDeviation: number
}

// ==========================================
// GAMING CALCULATION HELPERS
// ==========================================

export interface GamingCalculationHelpers {
  calculateXP: (action: string, metadata?: any) => number
  calculateLevel: (totalXP: number) => { level: number; currentLevelXP: number; nextLevelXP: number }
  calculateLevelProgress: (userLevel: UserLevel) => number
  calculateAchievementProgress: (achievement: Achievement, userStats: any) => number
  calculateStreakBonus: (streakCount: number, baseXP: number) => number
  predictNextLevel: (userLevel: UserLevel, averageWeeklyXP: number) => { estimatedDays: number; estimatedDate: Date }
}

export interface XPCalculationContext {
  user_id: EntityId
  action: string
  amount?: number
  category?: string
  streak_count?: number
  metadata?: Record<string, any>
}

export interface LevelCalculationResult {
  level: number
  total_xp: number
  current_level_xp: number
  next_level_xp: number
  xp_to_next_level: number
  level_progress_percentage: number
}

// ==========================================
// TRANSACTION HELPERS
// ==========================================

export interface TransactionHelpers {
  formatAmount: (transaction: Transaction, currency?: Currency) => string
  getTransactionColor: (transaction: Transaction) => string
  getTransactionIcon: (transaction: Transaction) => string
  getTransactionDirection: (transaction: Transaction) => 'in' | 'out'
  groupByDate: (transactions: Transaction[]) => Record<string, Transaction[]>
  groupByCategory: (transactions: Transaction[]) => Record<string, Transaction[]>
  calculateRunningBalance: (transactions: Transaction[], startingBalance?: number) => Array<{ transaction: Transaction; balance: number }>
  filterByDateRange: (transactions: Transaction[], startDate: Date, endDate: Date) => Transaction[]
  searchTransactions: (transactions: Transaction[], query: string) => Transaction[]
}

export interface TransactionSummary {
  total_income: number
  total_expenses: number
  net_balance: number
  transaction_count: number
  average_transaction: number
  largest_expense: Transaction | null
  largest_income: Transaction | null
  most_used_category: string | null
}

// ==========================================
// GOAL CALCULATION HELPERS
// ==========================================

export interface GoalCalculationHelpers {
  calculateProgress: (current: number, target: number) => number
  calculateTimeRemaining: (targetDate: Date) => { days: number; months: number; years: number }
  calculateRequiredMonthlySaving: (current: number, target: number, targetDate: Date) => number
  predictGoalCompletion: (current: number, target: number, monthlyContribution: number) => Date
  calculateGoalEfficiency: (goal: any, contributions: any[]) => number
}

export interface GoalProjection {
  estimated_completion_date: Date
  required_monthly_amount: number
  probability_success: number
  alternative_scenarios: Array<{
    monthly_amount: number
    completion_date: Date
    probability: number
  }>
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

export interface ValidationHelpers {
  isValidEmail: (email: string) => boolean
  isValidPassword: (password: string) => boolean
  isValidAmount: (amount: number) => boolean
  isValidDate: (date: string) => boolean
  isValidCurrency: (currency: string) => currency is Currency
  isValidTransactionType: (type: string) => type is 'income' | 'expense'
  sanitizeString: (input: string) => string
  normalizeAmount: (amount: number) => number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface FieldValidation {
  field: string
  value: any
  rules: ValidationRule[]
  result: ValidationResult
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
  validate?: (value: any) => boolean
}

// ==========================================
// ARRAY & OBJECT HELPERS
// ==========================================

export interface ArrayHelpers {
  groupBy: <T>(array: T[], key: keyof T) => Record<string, T[]>
  sortBy: <T>(array: T[], key: keyof T, direction?: 'asc' | 'desc') => T[]
  uniqueBy: <T>(array: T[], key: keyof T) => T[]
  chunk: <T>(array: T[], size: number) => T[][]
  shuffle: <T>(array: T[]) => T[]
  sample: <T>(array: T[], count?: number) => T | T[]
}

export interface ObjectHelpers {
  pick: <T, K extends keyof T>(object: T, keys: K[]) => Pick<T, K>
  omit: <T, K extends keyof T>(object: T, keys: K[]) => Omit<T, K>
  deepClone: <T>(object: T) => T
  deepMerge: <T>(target: T, source: Partial<T>) => T
  isEmpty: (value: any) => boolean
  isEqual: (a: any, b: any) => boolean
}

// ==========================================
// STRING HELPERS
// ==========================================

export interface StringHelpers {
  capitalize: (str: string) => string
  camelCase: (str: string) => string
  kebabCase: (str: string) => string
  snakeCase: (str: string) => string
  truncate: (str: string, length: number, suffix?: string) => string
  slugify: (str: string) => string
  removeAccents: (str: string) => string
  highlight: (text: string, query: string) => string
  generateId: (prefix?: string) => string
  maskSensitiveData: (str: string, type: 'email' | 'phone' | 'iban') => string
}

// ==========================================
// LOCAL STORAGE HELPERS
// ==========================================

export interface StorageHelpers {
  get: <T = any>(key: string, defaultValue?: T) => T | null
  set: (key: string, value: any) => boolean
  remove: (key: string) => boolean
  clear: () => boolean
  exists: (key: string) => boolean
  getSize: () => number
  isAvailable: () => boolean
}

// ==========================================
// API HELPERS
// ==========================================

export interface ApiHelpers {
  buildQueryString: (params: Record<string, any>) => string
  parseApiError: (error: any) => { message: string; code?: string; details?: any }
  retryWithBackoff: <T>(fn: () => Promise<T>, maxAttempts?: number) => Promise<T>
  debounce: <T extends (...args: any[]) => any>(func: T, delay: number) => (...args: Parameters<T>) => void
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => (...args: Parameters<T>) => void
}

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  exponential: boolean
  jitter: boolean
}

// ==========================================
// CHART & VISUALIZATION HELPERS
// ==========================================

export interface ChartHelpers {
  generateColors: (count: number) => string[]
  formatChartData: (data: any[], xKey: string, yKey: string) => any[]
  calculateChartDimensions: (containerWidth: number, aspectRatio: number) => { width: number; height: number }
  getChartTheme: (darkMode: boolean) => any
  exportChart: (chartRef: any, format: 'png' | 'jpg' | 'svg' | 'pdf') => Promise<string>
}

export interface ChartDataPoint {
  x: string | number | Date
  y: number
  label?: string
  color?: string
  metadata?: any
}

// ==========================================
// PERFORMANCE HELPERS
// ==========================================

export interface PerformanceHelpers {
  measureTime: <T>(fn: () => T, label?: string) => T
  measureAsyncTime: <T>(fn: () => Promise<T>, label?: string) => Promise<T>
  memoize: <T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: Parameters<T>) => string) => T
  lazyLoad: <T>(factory: () => Promise<T>) => () => Promise<T>
}

export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: Date
  metadata?: any
}

// ==========================================
// ERROR HANDLING HELPERS
// ==========================================

export interface ErrorHelpers {
  createAppError: (message: string, code?: string, details?: any) => AppError
  isAppError: (error: any) => error is AppError
  formatErrorMessage: (error: any) => string
  logError: (error: any, context?: string) => void
  reportError: (error: any, userContext?: any) => Promise<void>
}

export interface AppError {
  message: string
  code?: string
  details?: any
  timestamp: Date
  stack?: string
}

// ==========================================
// BROWSER HELPERS
// ==========================================

export interface BrowserHelpers {
  isMobile: () => boolean
  isTablet: () => boolean
  isDesktop: () => boolean
  getDeviceType: () => 'mobile' | 'tablet' | 'desktop'
  getBrowserInfo: () => { name: string; version: string }
  copyToClipboard: (text: string) => Promise<boolean>
  downloadFile: (data: any, filename: string, type: string) => void
  getScreenSize: () => { width: number; height: number }
  isOnline: () => boolean
  vibrate: (pattern?: number | number[]) => boolean
}

// ==========================================
// GAMING SPECIFIC HELPERS
// ==========================================

export interface GamingHelpers {
  formatXP: (xp: number) => string
  formatLevel: (level: number) => string
  getRarityDisplay: (rarity: AchievementRarity) => { name: string; color: string; emoji: string }
  calculateRarityScore: (achievements: Achievement[]) => number
  generateCelebrationMessage: (type: 'achievement' | 'level_up' | 'challenge', data: any) => string
  shouldShowTutorial: (userStats: GamingStats) => boolean
}

// ==========================================
// FORM HELPERS
// ==========================================

export interface FormHelpers {
  validateField: (value: any, rules: ValidationRule[]) => ValidationResult
  validateForm: (data: Record<string, any>, schema: Record<string, ValidationRule[]>) => Record<string, ValidationResult>
  formatFormErrors: (errors: Record<string, string[]>) => Record<string, string>
  resetFormState: <T>(initialData: T) => T
  isDirty: <T>(current: T, initial: T) => boolean
  getChangedFields: <T>(current: T, initial: T) => Partial<T>
}

export interface FormValidationSchema {
  [fieldName: string]: ValidationRule[]
}

// ==========================================
// SEARCH & FILTER HELPERS
// ==========================================

export interface SearchHelpers {
  fuzzySearch: <T>(items: T[], query: string, keys: (keyof T)[]) => T[]
  highlightMatch: (text: string, query: string) => string
  createSearchIndex: <T>(items: T[], keys: (keyof T)[]) => Map<string, T[]>
  filterByMultipleCriteria: <T>(items: T[], criteria: FilterCriteria<T>[]) => T[]
}

export interface FilterCriteria<T = any> {
  field: keyof T
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in'
  value: any
}

// ==========================================
// EXPORT & IMPORT HELPERS
// ==========================================

export interface ExportHelpers {
  toCSV: <T>(data: T[], columns?: string[]) => string
  toExcel: <T>(data: T[], sheetName?: string) => Promise<Blob>
  toPDF: <T>(data: T[], title?: string, options?: PDFOptions) => Promise<Blob>
  toJSON: <T>(data: T[], pretty?: boolean) => string
}

export interface ImportHelpers {
  fromCSV: <T = any>(csvContent: string, mapping?: Record<string, string>) => Promise<T[]>
  fromExcel: <T = any>(file: File, sheetIndex?: number) => Promise<T[]>
  fromJSON: <T = any>(jsonContent: string) => T[]
  validateImportData: <T>(data: T[], schema: any) => { valid: T[]; invalid: any[] }
}

export interface PDFOptions {
  orientation: 'portrait' | 'landscape'
  format: 'A4' | 'A3' | 'Letter'
  margins: { top: number; right: number; bottom: number; left: number }
  includeHeader?: boolean
  includeFooter?: boolean
  watermark?: string
}

// ==========================================
// NOTIFICATION HELPERS
// ==========================================

export interface NotificationHelpers {
  show: (message: string, type: 'success' | 'error' | 'warning' | 'info', options?: NotificationOptions) => void
  showSuccess: (message: string, options?: NotificationOptions) => void
  showError: (message: string, options?: NotificationOptions) => void
  showWarning: (message: string, options?: NotificationOptions) => void
  showInfo: (message: string, options?: NotificationOptions) => void
  clear: (id?: string) => void
  clearAll: () => void
}

export interface NotificationOptions {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  closable?: boolean
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// ==========================================
// ANALYTICS HELPERS
// ==========================================

export interface AnalyticsHelpers {
  track: (event: string, properties?: Record<string, any>) => void
  trackPageView: (path: string, title?: string) => void
  trackUserAction: (action: string, category: string, value?: number) => void
  trackError: (error: Error, context?: string) => void
  setUserProperties: (properties: Record<string, any>) => void
}

export interface AnalyticsEvent {
  name: string
  properties: Record<string, any>
  timestamp: Date
  session_id: string
  user_id?: EntityId
}

// ==========================================
// THEME & STYLING HELPERS
// ==========================================

export interface ThemeHelpers {
  getThemeColors: (theme: 'light' | 'dark') => Record<string, string>
  generateColorPalette: (baseColor: string) => Record<string, string>
  isValidColor: (color: string) => boolean
  hexToRgb: (hex: string) => { r: number; g: number; b: number } | null
  rgbToHex: (r: number, g: number, b: number) => string
  getContrastColor: (backgroundColor: string) => 'light' | 'dark'
  adjustColorBrightness: (color: string, amount: number) => string
}

export interface ColorPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

// ==========================================
// UTILITY TYPE GUARDS
// ==========================================

export interface TypeGuards {
  isTransaction: (obj: any) => obj is Transaction
  isAchievement: (obj: any) => obj is Achievement
  isUserLevel: (obj: any) => obj is UserLevel
  isValidEntityId: (id: any) => id is EntityId
  isValidDateString: (date: any) => date is DateString
  isValidCurrency: (currency: any) => currency is Currency
}

// ==========================================
// HELPER FUNCTIONS COLLECTION
// ==========================================

export interface HelperCollection {
  currency: CurrencyHelpers
  date: DateHelpers
  math: MathHelpers
  gaming: GamingCalculationHelpers
  transaction: TransactionHelpers
  goal: GoalCalculationHelpers
  validation: ValidationHelpers
  search: SearchHelpers
  export: ExportHelpers
  import: ImportHelpers
  notification: NotificationHelpers
  analytics: AnalyticsHelpers
  theme: ThemeHelpers
  typeGuards: TypeGuards
  browser: BrowserHelpers
  performance: PerformanceHelpers
  error: ErrorHelpers
}
