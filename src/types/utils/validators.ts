// ==========================================
// UTILS VALIDATORS - types/utils/validators.ts
// ==========================================

import type { EntityId, DateString, Currency } from '../base'
import type { Transaction, CreateTransactionData } from '../entities/transactions'
import type { User, LoginCredentials, RegisterData } from '../entities/auth'
import type { FinancialGoal } from '../entities/financial'

// ==========================================
// BASE VALIDATION TYPES
// ==========================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
  fieldErrors?: Record<string, string[]>
}

export interface ValidationRule<T = any> {
  name: string
  message: string
  validator: (value: T, context?: any) => boolean | Promise<boolean>
  async?: boolean
  severity?: 'error' | 'warning'
}

export type ValidationSchema<T = any> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

// ==========================================
// FIELD VALIDATORS
// ==========================================

export interface FieldValidators {
  // Basic types
  required: (message?: string) => ValidationRule
  string: (minLength?: number, maxLength?: number) => ValidationRule
  number: (min?: number, max?: number) => ValidationRule
  boolean: () => ValidationRule
  array: (minItems?: number, maxItems?: number) => ValidationRule

  // Format validators
  email: (message?: string) => ValidationRule
  url: (message?: string) => ValidationRule
  phone: (country?: string) => ValidationRule
  iban: (message?: string) => ValidationRule

  // Pattern validators
  pattern: (regex: RegExp, message: string) => ValidationRule
  alphanumeric: (message?: string) => ValidationRule
  numeric: (message?: string) => ValidationRule

  // Date validators
  date: (message?: string) => ValidationRule
  dateFormat: (format: string, message?: string) => ValidationRule
  dateRange: (minDate?: Date, maxDate?: Date) => ValidationRule
  futureDate: (message?: string) => ValidationRule
  pastDate: (message?: string) => ValidationRule

  // Business logic validators
  positiveAmount: (message?: string) => ValidationRule
  validCurrency: (message?: string) => ValidationRule
  uniqueValue: <T>(collection: T[], field: keyof T, message?: string) => ValidationRule

  // Custom validators
  custom: <T>(validator: (value: T) => boolean | Promise<boolean>, message: string) => ValidationRule
  conditional: <T>(condition: (context: any) => boolean, rule: ValidationRule<T>) => ValidationRule<T>
}

// ==========================================
// ENTITY VALIDATORS
// ==========================================

// User validation
export interface UserValidationRules {
  validateUser: (user: Partial<User>) => ValidationResult
  validateLogin: (credentials: LoginCredentials) => ValidationResult
  validateRegister: (data: RegisterData) => ValidationResult
  validateEmail: (email: string) => ValidationResult
  validatePassword: (password: string) => ValidationResult
  validateName: (name: string) => ValidationResult
}

// Transaction validation
export interface TransactionValidationRules {
  validateTransaction: (transaction: CreateTransactionData) => ValidationResult
  validateAmount: (amount: number, type: 'income' | 'expense') => ValidationResult
  validateDescription: (description: string) => ValidationResult
  validateDate: (date: string) => ValidationResult
  validateRecurring: (data: { is_recurring: boolean; frequency?: string; end_date?: string }) => ValidationResult
}

// Goal validation
export interface GoalValidationRules {
  validateGoal: (goal: Partial<FinancialGoal>) => ValidationResult
  validateTargetAmount: (amount: number) => ValidationResult
  validateTargetDate: (date: string, startDate?: string) => ValidationResult
  validateGoalName: (name: string, existingNames?: string[]) => ValidationResult
}

// Category validation
export interface CategoryValidationRules {
  validateCategory: (category: any) => ValidationResult
  validateCategoryName: (name: string, existingNames?: string[]) => ValidationResult
  validateCategoryColor: (color: string) => ValidationResult
  validateCategoryIcon: (icon: string) => ValidationResult
}

// ==========================================
// FORM VALIDATION
// ==========================================

export interface FormValidator<T = any> {
  schema: ValidationSchema<T>
  validate: (data: T) => Promise<ValidationResult>
  validateField: (field: keyof T, value: any, data?: T) => Promise<ValidationResult>
  addRule: (field: keyof T, rule: ValidationRule) => void
  removeRule: (field: keyof T, ruleName: string) => void
  setContext: (context: any) => void
}

export interface FormValidationOptions {
  abortEarly?: boolean // S'arrêter à la première erreur
  stripUnknown?: boolean // Supprimer les champs non définis dans le schéma
  allowUnknown?: boolean // Autoriser les champs non définis
  context?: any // Contexte pour validation conditionnelle
}

// ==========================================
// ASYNC VALIDATION
// ==========================================

export interface AsyncValidator<T = any> {
  name: string
  validator: (value: T, context?: any) => Promise<boolean>
  message: string
  debounceMs?: number
  cacheResults?: boolean
}

export interface AsyncValidationResult extends ValidationResult {
  pending: boolean
  debouncing: boolean
}

// ==========================================
// BUSINESS RULE VALIDATORS
// ==========================================

export interface BusinessRuleValidators {
  // Financial rules
  canAffordTransaction: (amount: number, currentBalance: number) => ValidationResult
  isWithinBudgetLimit: (amount: number, categoryId: EntityId, currentSpending: number) => ValidationResult
  isValidGoalTimeline: (targetAmount: number, currentAmount: number, targetDate: Date, monthlyIncome: number) => ValidationResult

  // Gaming rules
  canUnlockAchievement: (achievementId: EntityId, userStats: any) => ValidationResult
  isValidXPAmount: (amount: number, action: string) => ValidationResult
  canAcceptChallenge: (challengeId: EntityId, activeChallengnes: any[]) => ValidationResult

  // Banking rules
  isValidBankConnection: (bankData: any) => ValidationResult
  canSyncAccount: (accountId: string, lastSync: Date) => ValidationResult
}

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

export interface ValidationMiddleware<T = any> {
  before: Array<(data: T) => T | Promise<T>> // Transform avant validation
  validators: Array<(data: T) => ValidationResult | Promise<ValidationResult>>
  after: Array<(data: T, result: ValidationResult) => ValidationResult | Promise<ValidationResult>> // Post-traitement
}

export interface ValidationPipeline<T = any> {
  name: string
  middleware: ValidationMiddleware<T>
  execute: (data: T) => Promise<ValidationResult>
  addBefore: (transform: (data: T) => T | Promise<T>) => void
  addValidator: (validator: (data: T) => ValidationResult | Promise<ValidationResult>) => void
  addAfter: (postProcess: (data: T, result: ValidationResult) => ValidationResult | Promise<ValidationResult>) => void
}

// ==========================================
// REAL-TIME VALIDATION
// ==========================================

export interface RealTimeValidator<T = any> {
  field: keyof T
  rules: ValidationRule<T[keyof T]>[]
  debounce: number
  onValidate: (result: ValidationResult) => void
  onError?: (error: Error) => void
}

export interface FieldValidationState {
  value: any
  isValid: boolean
  isPending: boolean
  errors: string[]
  warnings: string[]
  lastValidated: Date | null
  debounceTimer: number | null
}

// ==========================================
// VALIDATION HELPERS INTERFACE
// ==========================================

export interface ValidationHelpers {
  // Core validation
  createValidator: <T>(schema: ValidationSchema<T>) => FormValidator<T>
  createAsyncValidator: <T>(rules: AsyncValidator<T>[]) => (value: T) => Promise<AsyncValidationResult>

  // Pre-built validators
  user: UserValidationRules
  transaction: TransactionValidationRules
  goal: GoalValidationRules
  category: CategoryValidationRules
  businessRules: BusinessRuleValidators

  // Field validators
  field: FieldValidators

  // Utilities
  formatErrors: (result: ValidationResult) => string[]
  hasErrors: (result: ValidationResult) => boolean
  hasWarnings: (result: ValidationResult) => boolean
  combineResults: (results: ValidationResult[]) => ValidationResult

  // Schema building
  buildSchema: <T>(rules: Record<keyof T, ValidationRule[]>) => ValidationSchema<T>
  extendSchema: <T>(base: ValidationSchema<T>, extension: Partial<ValidationSchema<T>>) => ValidationSchema<T>
}

// ==========================================
// ERROR TYPES
// ==========================================

export interface ValidationError extends Error {
  field?: string
  code?: string
  value?: any
  constraint?: any
}

export interface ValidationErrorDetail {
  field: string
  message: string
  code: string
  value: any
  constraint?: any
}

// ==========================================
// VALIDATION CONTEXT
// ==========================================

export interface ValidationContext {
  user?: User
  currentData?: any
  environment: 'client' | 'server'
  locale: string
  timezone: string
  features: Record<string, boolean>
}

// ==========================================
// SANITIZATION TYPES
// ==========================================

export interface SanitizationRules {
  trim?: boolean
  lowercase?: boolean
  uppercase?: boolean
  removeSpecialChars?: boolean
  allowedChars?: string
  maxLength?: number
  removeHtml?: boolean
  escapeHtml?: boolean
}

export interface SanitizedData<T = any> {
  original: T
  sanitized: T
  changes: Array<{
    field: string
    rule: string
    before: any
    after: any
  }>
}

// ==========================================
// VALIDATION CACHE
// ==========================================

export interface ValidationCache {
  get: (key: string) => ValidationResult | null
  set: (key: string, result: ValidationResult, ttl?: number) => void
  clear: (pattern?: string) => void
  size: () => number
}

export interface CacheableValidator<T = any> {
  validator: (value: T) => Promise<ValidationResult>
  cacheKey: (value: T) => string
  ttl?: number // Time to live en millisecondes
}
