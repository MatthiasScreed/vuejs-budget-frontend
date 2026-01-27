import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useValidation } from './useValidation'
import { useAuthStore } from '@/stores/authStore'
import { useGamingStore } from '@/stores/gamingStore'
import { eventBus } from '@/services/eventBus'
import type { ApiResponse } from '@/types'

interface FormField {
  value: any
  error?: string
  touched: boolean
  required: boolean
  validator?: (value: any) => string | null
  formatter?: (value: any) => any
  debounceMs?: number
}

interface FormConfig<T> {
  initialValues: T
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
  formatters?: Partial<Record<keyof T, (value: any) => any>>
  onSubmit?: (values: T) => Promise<ApiResponse<any>>
  onSuccess?: (response: ApiResponse<any>) => void | Promise<void>
  resetOnSubmit?: boolean
  gamingEnabled?: boolean
  cacheKey?: string
  debounceMs?: number
}

interface FormState<T> {
  isValid: boolean
  isDirty: boolean
  hasErrors: boolean
  isSubmitting: boolean
  submitError: string | null
  touchedFields: Set<keyof T>
  validatingFields: Set<keyof T>
}

/**
 * Composable pour gestion avancée de formulaires réactifs
 * Validation temps réel, gaming, formatage et intégration API
 */
export function useForm<T extends Record<string, any>>(config: FormConfig<T>) {
  const { validateField, createRules } = useValidation()
  const authStore = useAuthStore()
  const gamingStore = useGamingStore()
  const validationRules = createRules()

  // ==========================================
  // STATE
  // ==========================================

  const values = reactive<T>({ ...config.initialValues })
  const fields = reactive<Record<keyof T, FormField>>({} as any)
  const debounceTimers = new Map<keyof T, number>()

  const state = reactive<FormState<T>>({
    isValid: false,
    isDirty: false,
    hasErrors: false,
    isSubmitting: false,
    submitError: null,
    touchedFields: new Set(),
    validatingFields: new Set()
  })

  // Initialiser les champs
  initializeFields()

  // ==========================================
  // INITIALIZATION
  // ==========================================

  /**
   * Initialiser la structure des champs
   */
  function initializeFields(): void {
    Object.keys(config.initialValues).forEach(key => {
      const fieldKey = key as keyof T
      fields[fieldKey] = {
        value: config.initialValues[fieldKey],
        touched: false,
        required: isFieldRequired(key),
        validator: config.validationRules?.[fieldKey],
        formatter: config.formatters?.[fieldKey],
        debounceMs: config.debounceMs || 300
      }
    })

    // Charger depuis le cache si disponible
    loadFromCache()
  }

  /**
   * Vérifier si un champ est requis (version corrigée)
   */
  function isFieldRequired(fieldName: string): boolean {
    const validator = config.validationRules?.[fieldName as keyof T]
    if (!validator) return false

    // Tester avec une valeur vide pour détecter 'required'
    const testResult = validator('')
    return testResult?.includes('obligatoire') || testResult?.includes('requis') || false
  }

  /**
   * Charger les données depuis le cache
   */
  function loadFromCache(): void {
    if (!config.cacheKey) return

    try {
      const cached = localStorage.getItem(`form_${config.cacheKey}`)
      if (cached) {
        const cachedValues = JSON.parse(cached)
        Object.assign(values, cachedValues)
        updateFieldValues()
      }
    } catch (error) {
      console.warn('Erreur chargement cache formulaire:', error)
    }
  }

  // ==========================================
  // FIELD MANAGEMENT
  // ==========================================

  /**
   * Mettre à jour un champ avec validation et formatage
   */
  function updateField(fieldName: keyof T, newValue: any): void {
    const field = fields[fieldName]
    if (!field) return

    // Formater la valeur si nécessaire
    const formattedValue = field.formatter ? field.formatter(newValue) : newValue

    // Mettre à jour les valeurs
    values[fieldName] = formattedValue
    field.value = formattedValue
    field.touched = true
    state.touchedFields.add(fieldName)

    // Validation avec debounce
    clearTimeout(debounceTimers.get(fieldName))
    const timer = setTimeout(() => {
      validateSingleField(fieldName)
      saveToCache()
    }, field.debounceMs) as unknown as number

    debounceTimers.set(fieldName, timer)
    updateFormState()
  }

  /**
   * Valider un champ spécifique (version améliorée)
   */
  async function validateSingleField(fieldName: keyof T): Promise<void> {
    const field = fields[fieldName]
    if (!field) return

    state.validatingFields.add(fieldName)

    try {
      // Validation personnalisée d'abord
      if (field.validator) {
        field.error = field.validator(field.value)
      }

      // Si pas d'erreur, utiliser les règles prédéfinies
      if (!field.error && field.required && !field.value) {
        field.error = 'Ce champ est obligatoire'
      }

      // Validation métier spécialisée
      if (!field.error) {
        field.error = await validateBusinessRules(fieldName, field.value)
      }

    } catch (error) {
      field.error = 'Erreur de validation'
      console.error('Erreur validation champ:', error)
    } finally {
      state.validatingFields.delete(fieldName)
      updateFormState()
    }
  }

  /**
   * Validation métier spécialisée
   */
  async function validateBusinessRules(fieldName: keyof T, value: any): Promise<string | null> {
    const fieldStr = String(fieldName)

    // Montants
    if (fieldStr.includes('amount') || fieldStr.includes('montant')) {
      return validationRules.transactionAmount(value)
    }

    // Descriptions
    if (fieldStr.includes('description') || fieldStr.includes('name')) {
      return validationRules.transactionDescription(value)
    }

    // Dates
    if (fieldStr.includes('date')) {
      return validationRules.transactionDate(value)
    }

    return null
  }

  /**
   * Mettre à jour les valeurs des champs
   */
  function updateFieldValues(): void {
    Object.keys(fields).forEach(key => {
      const fieldKey = key as keyof T
      fields[fieldKey].value = values[fieldKey]
    })
  }

  // ==========================================
  // VALIDATION
  // ==========================================

  /**
   * Valider tout le formulaire
   */
  async function validateAll(): Promise<boolean> {
    const validationPromises = Object.keys(fields).map(key =>
      validateSingleField(key as keyof T)
    )

    await Promise.all(validationPromises)
    updateFormState()

    return !state.hasErrors
  }

  /**
   * Marquer tous les champs comme touchés
   */
  function touchAll(): void {
    Object.keys(fields).forEach(key => {
      const fieldKey = key as keyof T
      fields[fieldKey].touched = true
      state.touchedFields.add(fieldKey)
    })
    updateFormState()
  }

  // ==========================================
  // FORM STATE MANAGEMENT
  // ==========================================

  /**
   * Mettre à jour l'état global du formulaire
   */
  function updateFormState(): void {
    const touchedFields = Object.values(fields).filter(f => f.touched)
    const errorFields = touchedFields.filter(f => f.error)

    state.hasErrors = errorFields.length > 0
    state.isDirty = touchedFields.length > 0
    state.isValid = touchedFields.length > 0 && errorFields.length === 0
  }

  /**
   * Sauvegarder dans le cache
   */
  function saveToCache(): void {
    if (!config.cacheKey || !state.isDirty) return

    try {
      localStorage.setItem(`form_${config.cacheKey}`, JSON.stringify(values))
    } catch (error) {
      console.warn('Erreur sauvegarde cache:', error)
    }
  }

  // ==========================================
  // FORM SUBMISSION
  // ==========================================

  /**
   * Soumettre le formulaire avec intégration complète
   */
  async function submit(): Promise<boolean> {
    state.isSubmitting = true
    state.submitError = null

    try {
      // Validation complète
      touchAll()
      const isValid = await validateAll()

      if (!isValid) {
        throw new Error('Formulaire invalide')
      }

      // Préparer les données
      const submitData = prepareSubmitData()

      // Émettre événement pré-soumission
      eventBus.emit('form:beforeSubmit', {
        formId: config.cacheKey,
        data: submitData
      })

      // Soumettre via la fonction personnalisée
      let response: ApiResponse<any> | undefined

      if (config.onSubmit) {
        response = await config.onSubmit(submitData)
      }

      // Gestion du succès
      await handleSubmitSuccess(response)

      return true

    } catch (error: any) {
      await handleSubmitError(error)
      return false
    } finally {
      state.isSubmitting = false
    }
  }

  /**
   * Préparer les données pour soumission
   */
  function prepareSubmitData(): T {
    const submitData = { ...values }

    // Appliquer les formatters finaux
    Object.keys(fields).forEach(key => {
      const fieldKey = key as keyof T
      const field = fields[fieldKey]

      if (field.formatter) {
        submitData[fieldKey] = field.formatter(submitData[fieldKey])
      }
    })

    return submitData
  }

  /**
   * Gérer le succès de soumission
   */
  async function handleSubmitSuccess(response?: ApiResponse<any>): Promise<void> {
    // Callback utilisateur
    if (config.onSuccess && response) {
      await config.onSuccess(response)
    }

    // Intégration gaming
    if (config.gamingEnabled && authStore.isAuthenticated) {
      await gamingStore.awardXP('form_submitted', 10)
    }

    // Reset si demandé
    if (config.resetOnSubmit) {
      reset()
    } else {
      clearCache()
    }

    // Émettre événement succès
    eventBus.emit('form:submitSuccess', {
      formId: config.cacheKey,
      response
    })
  }

  /**
   * Gérer les erreurs de soumission
   */
  async function handleSubmitError(error: any): Promise<void> {
    // Erreurs serveur Laravel
    if (error.response?.data?.errors) {
      setServerErrors(error.response.data.errors)
    } else {
      state.submitError = error.message || 'Erreur lors de la soumission'
    }

    // Émettre événement erreur
    eventBus.emit('form:submitError', {
      formId: config.cacheKey,
      error
    })

    console.error('Erreur soumission formulaire:', error)
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  /**
   * Réinitialiser le formulaire
   */
  function reset(): void {
    Object.keys(config.initialValues).forEach(key => {
      const fieldKey = key as keyof T
      values[fieldKey] = config.initialValues[fieldKey]
      fields[fieldKey].value = config.initialValues[fieldKey]
      fields[fieldKey].touched = false
      fields[fieldKey].error = undefined
    })

    state.touchedFields.clear()
    state.submitError = null
    clearCache()
    updateFormState()
  }

  /**
   * Définir les erreurs serveur
   */
  function setServerErrors(errors: Record<string, string[]>): void {
    Object.entries(errors).forEach(([fieldName, messages]) => {
      const fieldKey = fieldName as keyof T
      if (fields[fieldKey]) {
        fields[fieldKey].error = messages[0]
        fields[fieldKey].touched = true
        state.touchedFields.add(fieldKey)
      }
    })
    updateFormState()
  }

  /**
   * Vider le cache
   */
  function clearCache(): void {
    if (config.cacheKey) {
      localStorage.removeItem(`form_${config.cacheKey}`)
    }
  }

  /**
   * Obtenir l'erreur d'un champ
   */
  function getFieldError(fieldName: keyof T): string | undefined {
    const field = fields[fieldName]
    return field?.touched ? field.error : undefined
  }

  /**
   * Vérifier si un champ est valide
   */
  function isFieldValid(fieldName: keyof T): boolean {
    const field = fields[fieldName]
    return !field?.error || !field?.touched
  }

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  const isValid = computed(() => state.isValid)
  const isDirty = computed(() => state.isDirty)
  const hasErrors = computed(() => state.hasErrors)
  const isSubmitting = computed(() => state.isSubmitting)
  const submitError = computed(() => state.submitError)

  const progress = computed(() => {
    const totalFields = Object.keys(fields).length
    const completedFields = Array.from(state.touchedFields).length
    return totalFields > 0 ? (completedFields / totalFields) * 100 : 0
  })

  // ==========================================
  // WATCHERS
  // ==========================================

  // Sauvegarde automatique
  watch(values, () => {
    if (state.isDirty) {
      saveToCache()
    }
  }, { deep: true })

  // ==========================================
  // CLEANUP
  // ==========================================

  // Nettoyer les timers au démontage
  function cleanup(): void {
    debounceTimers.forEach(timer => clearTimeout(timer))
    debounceTimers.clear()
  }

  // ==========================================
  // RETURN API
  // ==========================================

  return {
    // State réactif
    values,
    fields,

    // État du formulaire
    isValid,
    isDirty,
    hasErrors,
    isSubmitting,
    submitError,
    progress,

    // Actions principales
    updateField,
    submit,
    reset,
    validateAll,
    touchAll,

    // Utilitaires
    getFieldError,
    isFieldValid,
    setServerErrors,
    clearCache,
    cleanup,

    // États granulaires
    isFieldValidating: (field: keyof T) => state.validatingFields.has(field),
    isFieldTouched: (field: keyof T) => state.touchedFields.has(field),
    getFieldState: (field: keyof T) => ({
      value: fields[field]?.value,
      error: getFieldError(field),
      touched: state.touchedFields.has(field),
      validating: state.validatingFields.has(field),
      valid: isFieldValid(field)
    })
  }
}
