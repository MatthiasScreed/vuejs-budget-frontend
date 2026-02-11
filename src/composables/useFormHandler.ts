// composables/useFormHandler.ts
import { ref, reactive, computed, watch } from 'vue'
import api from '@/services/api'

// ==========================================
// TYPES
// ==========================================

interface FormState {
  isDirty: boolean
  isSubmitting: boolean
  isValid: boolean
  submitCount: number
  lastError: string | null
}

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

interface ValidationRules {
  [field: string]: ValidationRule
}

// ==========================================
// VALIDATION RULES PAR ENTITÉ
// ==========================================

const VALIDATION_RULES: Record<string, ValidationRules> = {
  transaction: {
    type: { required: true },
    description: { required: true, minLength: 2, maxLength: 255 },
    amount: { required: true, min: 0.01 },
    transaction_date: { required: true },
  },
  category: {
    name: { required: true, minLength: 2, maxLength: 100 },
    type: { required: true },
  },
  goal: {
    name: { required: true, minLength: 2, maxLength: 100 },
    target_amount: { required: true, min: 1 },
    target_date: { required: true },
  },
}

// ==========================================
// API ENDPOINTS PAR ENTITÉ
// ==========================================

const API_ENDPOINTS: Record<string, string> = {
  transaction: '/transactions',
  category: '/categories',
  goal: '/financial-goals',
}

// ==========================================
// COMPOSABLE
// ==========================================

export function useFormHandler<T extends Record<string, any>>(
  entityType: string,
  defaultValues: Partial<T> = {},
) {
  // État du formulaire
  const formData = reactive<T>({ ...defaultValues } as T)
  const errors = reactive<Record<string, string>>({})

  const formState = reactive<FormState>({
    isDirty: false,
    isSubmitting: false,
    isValid: true,
    submitCount: 0,
    lastError: null,
  })

  // Règles de validation pour cette entité
  const rules = VALIDATION_RULES[entityType] || {}

  // ==========================================
  // VALIDATION
  // ==========================================

  function validateField(field: string, value: any): string | null {
    const rule = rules[field]
    if (!rule) return null

    // Required
    if (rule.required && (value === null || value === undefined || value === '')) {
      return 'Ce champ est requis'
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `Minimum ${rule.minLength} caractères`
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `Maximum ${rule.maxLength} caractères`
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return 'Format invalide'
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `Minimum ${rule.min}`
      }
      if (rule.max !== undefined && value > rule.max) {
        return `Maximum ${rule.max}`
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }

  function validateAll(): boolean {
    let isValid = true

    // Clear previous errors
    Object.keys(errors).forEach((key) => {
      delete errors[key]
    })

    // Validate each field with rules
    Object.keys(rules).forEach((field) => {
      const error = validateField(field, formData[field as keyof T])
      if (error) {
        errors[field] = error
        isValid = false
      }
    })

    formState.isValid = isValid
    return isValid
  }

  // ==========================================
  // COMPUTED
  // ==========================================

  const isValid = computed(() => {
    return Object.keys(errors).length === 0 && formState.isValid
  })

  const canSubmit = computed(() => {
    return !formState.isSubmitting && formState.isDirty
  })

  const hasErrors = computed(() => {
    return Object.keys(errors).length > 0
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  function markAsDirty() {
    formState.isDirty = true
    // Validate on change
    validateAll()
  }

  function reset(newDefaults?: Partial<T>) {
    // Reset form data
    Object.keys(formData).forEach((key) => {
      delete formData[key as keyof T]
    })

    const defaults = newDefaults || defaultValues
    Object.assign(formData, defaults)

    // Reset errors
    Object.keys(errors).forEach((key) => {
      delete errors[key]
    })

    // Reset state
    formState.isDirty = false
    formState.isSubmitting = false
    formState.isValid = true
    formState.lastError = null
  }

  function loadData(data: Partial<T>) {
    Object.assign(formData, data)
    formState.isDirty = false
    validateAll()
  }

  async function submitForm(): Promise<T | null> {
    // Validate before submit
    if (!validateAll()) {
      console.warn('Form validation failed:', errors)
      return null
    }

    formState.isSubmitting = true
    formState.submitCount++
    formState.lastError = null

    try {
      const endpoint = API_ENDPOINTS[entityType]
      if (!endpoint) {
        throw new Error(`Unknown entity type: ${entityType}`)
      }

      // Prepare data for API
      const submitData = prepareDataForSubmit()

      let response

      // Check if editing (has id) or creating
      if (formData.id) {
        response = await api.put(`${endpoint}/${formData.id}`, submitData)
      } else {
        response = await api.post(endpoint, submitData)
      }

      console.log('✅ Form submitted successfully:', response.data)

      // Reset dirty state after successful submit
      formState.isDirty = false

      return response.data.data || response.data
    } catch (error: any) {
      console.error('❌ Form submission error:', error)

      // Handle validation errors from API
      if (error.response?.status === 422) {
        const apiErrors = error.response.data.errors || {}
        Object.keys(apiErrors).forEach((field) => {
          errors[field] = Array.isArray(apiErrors[field]) ? apiErrors[field][0] : apiErrors[field]
        })
      }

      formState.lastError = error.message || 'Une erreur est survenue'
      return null
    } finally {
      formState.isSubmitting = false
    }
  }

  function prepareDataForSubmit(): Record<string, any> {
    const data: Record<string, any> = {}

    // Copy all non-null, non-undefined values
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof T]

      // Skip internal fields
      if (key === 'created_at' || key === 'updated_at') {
        return
      }

      // Handle special cases
      if (key === 'tags' && Array.isArray(value)) {
        data[key] = value.join(',')
      } else if (value !== null && value !== undefined && value !== '') {
        data[key] = value
      }
    })

    return data
  }

  function setFieldError(field: string, message: string) {
    errors[field] = message
    formState.isValid = false
  }

  function clearFieldError(field: string) {
    delete errors[field]
    formState.isValid = Object.keys(errors).length === 0
  }

  // ==========================================
  // WATCHERS
  // ==========================================

  // Auto-validate when form data changes
  watch(
    () => ({ ...formData }),
    () => {
      if (formState.isDirty) {
        validateAll()
      }
    },
    { deep: true },
  )

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // Data
    formData,
    errors,
    formState,

    // Computed
    isValid,
    canSubmit,
    hasErrors,

    // Actions
    markAsDirty,
    reset,
    loadData,
    submitForm,
    validateField,
    validateAll,
    setFieldError,
    clearFieldError,
    prepareDataForSubmit,
  }
}

export default useFormHandler
