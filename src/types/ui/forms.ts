// ==========================================
// UI FORMS TYPES - types/ui/forms.ts
// ==========================================

import type { EntityId, DateString, Currency, ValidationErrors } from '../base'
import type {
  CreateTransactionData,
  UpdateTransactionData,
  Category
} from '../entities/transactions'
import type {
  LoginCredentials,
  RegisterData,
  User
} from '../entities/auth'
import type { FinancialGoal } from '../entities/financial'

// ==========================================
// BASE FORM TYPES
// ==========================================

export interface BaseFormState<T = any> {
  data: T
  initialData: T
  loading: boolean
  submitting: boolean
  errors: ValidationErrors
  touched: Record<keyof T, boolean>
  dirty: boolean
  valid: boolean
  submitted: boolean
}

export interface FormActions<T = any> {
  setField: (field: keyof T, value: any) => void
  setFields: (fields: Partial<T>) => void
  setErrors: (errors: ValidationErrors) => void
  setFieldError: (field: keyof T, error: string) => void
  clearErrors: () => void
  setTouched: (field: keyof T, touched?: boolean) => void
  setLoading: (loading: boolean) => void
  setSubmitting: (submitting: boolean) => void
  reset: () => void
  submit: () => Promise<void>
  validate: () => Promise<boolean>
  validateField: (field: keyof T) => Promise<boolean>
}

export interface FormConfig<T = any> {
  initialData: T
  validationSchema?: any
  onSubmit: (data: T) => Promise<void>
  onValidate?: (data: T) => Promise<ValidationErrors>
  onReset?: () => void
  validateOnChange?: boolean
  validateOnBlur?: boolean
  resetOnSubmit?: boolean
}

// ==========================================
// FIELD COMPONENT PROPS
// ==========================================

export interface BaseFieldProps {
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  error?: string
  hint?: string
  description?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'filled' | 'outlined' | 'underlined'
  className?: string
  name?: string
  id?: string
}

export interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  value?: string | number
  defaultValue?: string | number
  maxLength?: number
  minLength?: number
  min?: number
  max?: number
  step?: number
  pattern?: string
  autoComplete?: string
  autoFocus?: boolean
  onChange?: (value: string | number) => void
  onBlur?: () => void
  onFocus?: () => void
}

export interface TextareaFieldProps extends BaseFieldProps {
  value?: string
  defaultValue?: string
  rows?: number
  cols?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  autoResize?: boolean
  maxLength?: number
  onChange?: (value: string) => void
  onBlur?: () => void
}

export interface SelectFieldProps extends BaseFieldProps {
  options: SelectOption[]
  value?: string | number | string[] | number[]
  defaultValue?: string | number | string[] | number[]
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  creatable?: boolean
  loading?: boolean
  noOptionsMessage?: string
  onChange?: (value: string | number | string[] | number[]) => void
  onCreate?: (value: string) => void
}

export interface SelectOption {
  value: string | number
  label: string
  icon?: string
  avatar?: string
  description?: string
  group?: string
  disabled?: boolean
  color?: string
}

export interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
}

export interface RadioFieldProps extends BaseFieldProps {
  options: RadioOption[]
  value?: string | number
  defaultValue?: string | number
  direction?: 'horizontal' | 'vertical'
  onChange?: (value: string | number) => void
}

export interface RadioOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

export interface DateFieldProps extends BaseFieldProps {
  value?: Date | string
  defaultValue?: Date | string
  format?: string
  showTime?: boolean
  range?: boolean
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  shortcuts?: DateShortcut[]
  onChange?: (date: Date | Date[] | null) => void
}

export interface DateShortcut {
  label: string
  value: Date | Date[]
  icon?: string
}

// ==========================================
// SPECIFIC FORM TYPES
// ==========================================

// Login Form
export interface LoginFormState extends BaseFormState<LoginCredentials> {
  showPassword: boolean
  rememberMe: boolean
}

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  loading?: boolean
  error?: string
  showRegisterLink?: boolean
  showForgotPassword?: boolean
}

// Register Form
export interface RegisterFormState extends BaseFormState<RegisterData> {
  showPassword: boolean
  showPasswordConfirm: boolean
  acceptTerms: boolean
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>
  loading?: boolean
  error?: string
  showLoginLink?: boolean
}

// Transaction Form
export interface TransactionFormState extends BaseFormState<CreateTransactionData> {
  availableCategories: Category[]
  showRecurringOptions: boolean
  previewMode: boolean
}

export interface TransactionFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<CreateTransactionData>
  transaction?: Transaction
  categories: Category[]
  onSubmit: (data: CreateTransactionData) => Promise<void>
  onUpdate?: (id: EntityId, data: UpdateTransactionData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  showAdvancedOptions?: boolean
}

// Goal Form
export interface GoalFormState extends BaseFormState<Partial<FinancialGoal>> {
  selectedTemplate?: string
  estimatedMonthlyAmount: number
  projectedCompletionDate: Date | null
}

export interface GoalFormProps {
  mode: 'create' | 'edit'
  goal?: FinancialGoal
  templates?: Array<{
    id: string
    name: string
    icon: string
    description: string
  }>
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

// Category Form
export interface CategoryFormState extends BaseFormState<{
  name: string
  type: 'income' | 'expense' | 'both'
  icon: string
  color: string
  budget_limit?: number
  description?: string
}> {
  iconPickerOpen: boolean
  colorPickerOpen: boolean
}

export interface CategoryFormProps {
  mode: 'create' | 'edit'
  category?: Category
  existingCategories: Category[]
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

// Profile Form
export interface ProfileFormState extends BaseFormState<{
  name: string
  email: string
  currency: Currency
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    gaming: boolean
  }
}> {
  avatarFile?: File
  avatarPreview?: string
}

export interface ProfileFormProps {
  user: User
  onSubmit: (data: any) => Promise<void>
  onUploadAvatar?: (file: File) => Promise<string>
  loading?: boolean
}

// ==========================================
// FORM WIZARD TYPES
// ==========================================

export interface FormWizardStep<T = any> {
  id: string
  title: string
  description?: string
  icon?: string
  component: string
  validation?: (data: T) => Promise<boolean>
  optional?: boolean
  disabled?: boolean
}

export interface FormWizardState<T = any> {
  currentStep: number
  totalSteps: number
  data: T
  stepStates: Record<string, {
    completed: boolean
    valid: boolean
    touched: boolean
    errors: ValidationErrors
  }>
  canGoNext: boolean
  canGoPrevious: boolean
  canSubmit: boolean
}

export interface FormWizardProps<T = any> {
  steps: FormWizardStep<T>[]
  initialData: T
  onSubmit: (data: T) => Promise<void>
  onStepChange?: (step: number, data: T) => void
  onCancel?: () => void
  showProgress?: boolean
  allowSkipOptional?: boolean
  showStepNavigation?: boolean
}

// ==========================================
// DYNAMIC FORM TYPES
// ==========================================

export interface DynamicFormField {
  key: string
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date'
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: SelectOption[]
  validation?: ValidationRule[]
  defaultValue?: any
  dependsOn?: string // Autre champ dont dépend ce champ
  showWhen?: (formData: any) => boolean
  props?: Record<string, any>
}

export interface DynamicFormConfig {
  id: string
  title: string
  description?: string
  fields: DynamicFormField[]
  submitLabel?: string
  resetLabel?: string
  layout?: 'single' | 'double' | 'grid'
  showReset?: boolean
  showCancel?: boolean
}

export interface DynamicFormProps {
  config: DynamicFormConfig
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

// ==========================================
// FORM BUILDER TYPES
// ==========================================

export interface FormBuilder {
  addField: (field: DynamicFormField) => FormBuilder
  removeField: (key: string) => FormBuilder
  updateField: (key: string, updates: Partial<DynamicFormField>) => FormBuilder
  addValidation: (fieldKey: string, rule: ValidationRule) => FormBuilder
  setLayout: (layout: 'single' | 'double' | 'grid') => FormBuilder
  build: () => DynamicFormConfig
}

// ==========================================
// FORM HOOKS TYPES
// ==========================================

export interface UseFormOptions<T = any> {
  initialData: T
  validationSchema?: any
  onSubmit?: (data: T) => Promise<void>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  resetOnSubmit?: boolean
}

export interface UseFormReturn<T = any> {
  data: T
  errors: ValidationErrors
  touched: Record<keyof T, boolean>
  loading: boolean
  submitting: boolean
  dirty: boolean
  valid: boolean
  setField: (field: keyof T, value: any) => void
  setErrors: (errors: ValidationErrors) => void
  setTouched: (field: keyof T, touched?: boolean) => void
  validate: () => Promise<boolean>
  submit: () => Promise<void>
  reset: () => void
}

// ==========================================
// FORM FIELD GROUPS
// ==========================================

export interface FormFieldGroup {
  title: string
  description?: string
  collapsible?: boolean
  collapsed?: boolean
  fields: string[]
  className?: string
}

export interface FormSection {
  id: string
  title: string
  subtitle?: string
  icon?: string
  fields: DynamicFormField[]
  groups?: FormFieldGroup[]
  visible?: boolean | ((data: any) => boolean)
}

// ==========================================
// FORM TEMPLATES
// ==========================================

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: 'user' | 'transaction' | 'goal' | 'category' | 'system'
  config: DynamicFormConfig
  preview?: string
  tags?: string[]
  created_at: DateString
  updated_at: DateString
}

// ==========================================
// FORM VALIDATION STATES
// ==========================================

export interface FormFieldState {
  value: any
  error: string | null
  touched: boolean
  focused: boolean
  validating: boolean
  valid: boolean
  dirty: boolean
}

export interface FormSubmissionState {
  submitting: boolean
  submitted: boolean
  submitCount: number
  lastSubmitAt: Date | null
  success: boolean
  error: string | null
}

// ==========================================
// FORM EVENTS
// ==========================================

export interface FormEvent<T = any> {
  type: 'field_change' | 'field_blur' | 'field_focus' | 'form_submit' | 'form_reset' | 'validation_error'
  field?: keyof T
  value?: any
  data: T
  timestamp: Date
}

export interface FormEventHandler<T = any> {
  (event: FormEvent<T>): void
}
