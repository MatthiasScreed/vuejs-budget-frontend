/**
 * Utilitaires de validation pour formulaires et données
 * Fonctions pures avec messages d'erreur en français
 */

// ==========================================
// TYPES
// ==========================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  fieldErrors?: Record<string, string[]>
}

export interface ValidationRule {
  name: string
  validator: (value: any) => boolean
  message: string
}

export interface FieldValidation {
  field: string
  value: any
  rules: ValidationRule[]
}

// ==========================================
// VALIDATEURS DE BASE
// ==========================================

/**
 * Vérifier si une valeur est requise (non vide)
 */
export function required(value: any, fieldName: string = 'champ'): ValidationResult {
  const isEmpty = value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)

  return {
    isValid: !isEmpty,
    errors: isEmpty ? [`Le ${fieldName} est requis`] : []
  }
}

/**
 * Valider une adresse email
 */
export function email(value: string): ValidationResult {
  if (!value) {
    return { isValid: false, errors: ['Email requis'] }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(value)

  return {
    isValid,
    errors: isValid ? [] : ['Format email invalide']
  }
}

/**
 * Valider un mot de passe
 */
export function password(value: string, options: {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSpecialChars?: boolean
} = {}): ValidationResult {
  if (!value) {
    return { isValid: false, errors: ['Mot de passe requis'] }
  }

  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false
  } = options

  const errors: string[] = []

  if (value.length < minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères`)
  }

  if (requireUppercase && !/[A-Z]/.test(value)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }

  if (requireLowercase && !/[a-z]/.test(value)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule')
  }

  if (requireNumbers && !/\d/.test(value)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valider la correspondance de deux mots de passe
 */
export function passwordConfirmation(password: string, confirmation: string): ValidationResult {
  const isValid = password === confirmation

  return {
    isValid,
    errors: isValid ? [] : ['Les mots de passe ne correspondent pas']
  }
}

// ==========================================
// VALIDATEURS FINANCIERS
// ==========================================

/**
 * Valider un montant financier
 */
export function amount(value: number | string, options: {
  min?: number
  max?: number
  allowZero?: boolean
  allowNegative?: boolean
} = {}): ValidationResult {
  const {
    min,
    max,
    allowZero = true,
    allowNegative = false
  } = options

  // Convertir en nombre
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return { isValid: false, errors: ['Montant invalide'] }
  }

  const errors: string[] = []

  if (!allowZero && numValue === 0) {
    errors.push('Le montant ne peut pas être zéro')
  }

  if (!allowNegative && numValue < 0) {
    errors.push('Le montant ne peut pas être négatif')
  }

  if (min !== undefined && numValue < min) {
    errors.push(`Le montant doit être supérieur à ${min}`)
  }

  if (max !== undefined && numValue > max) {
    errors.push(`Le montant doit être inférieur à ${max}`)
  }

  // Vérifier le nombre de décimales (max 2 pour devise)
  const decimalPlaces = (numValue.toString().split('.')[1] || '').length
  if (decimalPlaces > 2) {
    errors.push('Le montant ne peut avoir plus de 2 décimales')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valider un IBAN
 */
export function iban(value: string): ValidationResult {
  if (!value) {
    return { isValid: false, errors: ['IBAN requis'] }
  }

  // Nettoyer l'IBAN
  const cleaned = value.replace(/\s/g, '').toUpperCase()

  // Vérifier le format basique
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
    return { isValid: false, errors: ['Format IBAN invalide'] }
  }

  // Vérifier la longueur (entre 15 et 34 caractères)
  if (cleaned.length < 15 || cleaned.length > 34) {
    return { isValid: false, errors: ['Longueur IBAN incorrecte'] }
  }

  // Algorithme de validation IBAN (modulo 97)
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4)
  const numericString = rearranged.replace(/[A-Z]/g, (char) =>
    (char.charCodeAt(0) - 55).toString()
  )

  // Calcul modulo 97 pour grands nombres
  let remainder = 0
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i])) % 97
  }

  const isValid = remainder === 1

  return {
    isValid,
    errors: isValid ? [] : ['IBAN invalide']
  }
}

// ==========================================
// VALIDATEURS DE DATES
// ==========================================

/**
 * Valider une date
 */
export function date(value: string | Date, options: {
  format?: string
  allowPast?: boolean
  allowFuture?: boolean
  minDate?: string | Date
  maxDate?: string | Date
} = {}): ValidationResult {
  if (!value) {
    return { isValid: false, errors: ['Date requise'] }
  }

  const {
    allowPast = true,
    allowFuture = true,
    minDate,
    maxDate
  } = options

  const parsedDate = new Date(value)

  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, errors: ['Date invalide'] }
  }

  const errors: string[] = []
  const now = new Date()

  if (!allowPast && parsedDate < now) {
    errors.push('La date ne peut pas être dans le passé')
  }

  if (!allowFuture && parsedDate > now) {
    errors.push('La date ne peut pas être dans le futur')
  }

  if (minDate && parsedDate < new Date(minDate)) {
    errors.push(`La date doit être postérieure au ${formatDate(minDate, { format: 'short' })}`)
  }

  if (maxDate && parsedDate > new Date(maxDate)) {
    errors.push(`La date doit être antérieure au ${formatDate(maxDate, { format: 'short' })}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valider une plage de dates
 */
export function dateRange(startDate: string | Date, endDate: string | Date): ValidationResult {
  const startValidation = date(startDate)
  const endValidation = date(endDate)

  const errors: string[] = []

  if (!startValidation.isValid) {
    errors.push(...startValidation.errors.map(e => `Date début: ${e}`))
  }

  if (!endValidation.isValid) {
    errors.push(...endValidation.errors.map(e => `Date fin: ${e}`))
  }

  if (startValidation.isValid && endValidation.isValid) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      errors.push('La date de début doit être antérieure à la date de fin')
    }

    // Vérifier que la plage n'est pas trop longue (max 5 ans)
    const diffMs = end.getTime() - start.getTime()
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365)

    if (diffYears > 5) {
      errors.push('La plage ne peut pas dépasser 5 ans')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ==========================================
// VALIDATEURS MÉTIER
// ==========================================

/**
 * Valider les données de transaction
 */
export function transactionData(data: {
  type?: string
  amount?: number | string
  description?: string
  transaction_date?: string
  category_id?: string
}): ValidationResult {
  const errors: string[] = []
  const fieldErrors: Record<string, string[]> = {}

  // Valider le type
  if (!data.type) {
    fieldErrors.type = ['Type de transaction requis']
  } else if (!['income', 'expense', 'transfer'].includes(data.type)) {
    fieldErrors.type = ['Type de transaction invalide']
  }

  // Valider le montant
  const amountValidation = amount(data.amount || 0, {
    min: 0.01,
    max: 1_000_000,
    allowZero: false
  })
  if (!amountValidation.isValid) {
    fieldErrors.amount = amountValidation.errors
  }

  // Valider la description
  if (!data.description || data.description.trim().length === 0) {
    fieldErrors.description = ['Description requise']
  } else if (data.description.length > 255) {
    fieldErrors.description = ['Description trop longue (max 255 caractères)']
  }

  // Valider la date
  const dateValidation = date(data.transaction_date || '', {
    allowFuture: false, // Pas de transactions futures
    maxDate: new Date() // Max aujourd'hui
  })
  if (!dateValidation.isValid) {
    fieldErrors.transaction_date = dateValidation.errors
  }

  // Compiler toutes les erreurs
  Object.values(fieldErrors).forEach(errs => errors.push(...errs))

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  }
}

/**
 * Valider les données d'objectif financier
 */
export function goalData(data: {
  name?: string
  target_amount?: number | string
  target_date?: string
  description?: string
}): ValidationResult {
  const errors: string[] = []
  const fieldErrors: Record<string, string[]> = {}

  // Valider le nom
  if (!data.name || data.name.trim().length === 0) {
    fieldErrors.name = ['Nom d\'objectif requis']
  } else if (data.name.length > 100) {
    fieldErrors.name = ['Nom trop long (max 100 caractères)']
  }

  // Valider le montant cible
  const amountValidation = amount(data.target_amount || 0, {
    min: 1,
    max: 10_000_000,
    allowZero: false
  })
  if (!amountValidation.isValid) {
    fieldErrors.target_amount = amountValidation.errors
  }

  // Valider la date cible
  const dateValidation = date(data.target_date || '', {
    allowPast: false, // Objectif doit être dans le futur
    minDate: new Date() // Min aujourd'hui
  })
  if (!dateValidation.isValid) {
    fieldErrors.target_date = dateValidation.errors
  }

  // Valider la description (optionnelle)
  if (data.description && data.description.length > 500) {
    fieldErrors.description = ['Description trop longue (max 500 caractères)']
  }

  // Compiler toutes les erreurs
  Object.values(fieldErrors).forEach(errs => errors.push(...errs))

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  }
}

/**
 * Valider les données de catégorie
 */
export function categoryData(data: {
  name?: string
  type?: string
  icon?: string
  color?: string
  parent_id?: string
}): ValidationResult {
  const errors: string[] = []
  const fieldErrors: Record<string, string[]> = {}

  // Valider le nom
  if (!data.name || data.name.trim().length === 0) {
    fieldErrors.name = ['Nom de catégorie requis']
  } else if (data.name.length > 50) {
    fieldErrors.name = ['Nom trop long (max 50 caractères)']
  }

  // Valider le type
  if (!data.type) {
    fieldErrors.type = ['Type de catégorie requis']
  } else if (!['income', 'expense', 'transfer'].includes(data.type)) {
    fieldErrors.type = ['Type de catégorie invalide']
  }

  // Valider l'icône (emoji)
  if (data.icon && !/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(data.icon)) {
    fieldErrors.icon = ['Icône doit être un emoji valide']
  }

  // Valider la couleur (hex)
  if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
    fieldErrors.color = ['Couleur doit être au format hexadécimal (#RRGGBB)']
  }

  // Compiler toutes les erreurs
  Object.values(fieldErrors).forEach(errs => errors.push(...errs))

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  }
}

// ==========================================
// VALIDATEURS TEXTE
// ==========================================

/**
 * Valider la longueur d'un texte
 */
export function textLength(
  value: string,
  min: number = 0,
  max: number = 255,
  fieldName: string = 'champ'
): ValidationResult {
  if (!value && min > 0) {
    return { isValid: false, errors: [`${fieldName} requis`] }
  }

  const length = value ? value.length : 0
  const errors: string[] = []

  if (length < min) {
    errors.push(`${fieldName} doit contenir au moins ${min} caractères`)
  }

  if (length > max) {
    errors.push(`${fieldName} ne peut dépasser ${max} caractères`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valider une URL
 */
export function url(value: string): ValidationResult {
  if (!value) {
    return { isValid: false, errors: ['URL requise'] }
  }

  try {
    const urlObj = new URL(value)
    const validProtocols = ['http:', 'https:']

    if (!validProtocols.includes(urlObj.protocol)) {
      return { isValid: false, errors: ['URL doit utiliser HTTP ou HTTPS'] }
    }

    return { isValid: true, errors: [] }
  } catch (error) {
    return { isValid: false, errors: ['Format URL invalide'] }
  }
}

/**
 * Valider un nom (personne, entreprise)
 */
export function name(value: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, errors: ['Nom requis'] }
  }

  const trimmed = value.trim()
  const errors: string[] = []

  if (trimmed.length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères')
  }

  if (trimmed.length > 100) {
    errors.push('Le nom ne peut dépasser 100 caractères')
  }

  // Vérifier caractères autorisés (lettres, espaces, tirets, apostrophes)
  if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(trimmed)) {
    errors.push('Le nom contient des caractères non autorisés')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ==========================================
// VALIDATEURS AVANCÉS
// ==========================================

/**
 * Valider un objet selon des règles multiples
 */
export function validateObject(
  data: Record<string, any>,
  validations: FieldValidation[]
): ValidationResult {
  const errors: string[] = []
  const fieldErrors: Record<string, string[]> = {}

  validations.forEach(validation => {
    const { field, value, rules } = validation
    const fieldErrs: string[] = []

    rules.forEach(rule => {
      if (!rule.validator(value)) {
        fieldErrs.push(rule.message)
      }
    })

    if (fieldErrs.length > 0) {
      fieldErrors[field] = fieldErrs
      errors.push(...fieldErrs)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  }
}

/**
 * Valider selon un schema personnalisé
 */
export function validateSchema<T>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>
): ValidationResult {
  const errors: string[] = []
  const fieldErrors: Record<string, string[]> = {}

  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field as keyof T]
    const fieldErrs: string[] = []

    ;(rules as ValidationRule[]).forEach(rule => {
      if (!rule.validator(value)) {
        fieldErrs.push(rule.message)
      }
    })

    if (fieldErrs.length > 0) {
      fieldErrors[field] = fieldErrs
      errors.push(...fieldErrs)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  }
}

// ==========================================
// RÈGLES DE VALIDATION COMMUNES
// ==========================================

export const ValidationRules = {
  required: (fieldName: string = 'champ') => ({
    name: 'required',
    validator: (value: any) => value !== null && value !== undefined && value !== '',
    message: `${fieldName} est requis`
  }),

  email: {
    name: 'email',
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || ''),
    message: 'Format email invalide'
  },

  minLength: (min: number) => ({
    name: 'minLength',
    validator: (value: string) => (value || '').length >= min,
    message: `Minimum ${min} caractères requis`
  }),

  maxLength: (max: number) => ({
    name: 'maxLength',
    validator: (value: string) => (value || '').length <= max,
    message: `Maximum ${max} caractères autorisés`
  }),

  minAmount: (min: number) => ({
    name: 'minAmount',
    validator: (value: number | string) => {
      const num = typeof value === 'string' ? parseFloat(value) : value
      return !isNaN(num) && num >= min
    },
    message: `Montant minimum: ${min}`
  }),

  maxAmount: (max: number) => ({
    name: 'maxAmount',
    validator: (value: number | string) => {
      const num = typeof value === 'string' ? parseFloat(value) : value
      return !isNaN(num) && num <= max
    },
    message: `Montant maximum: ${max}`
  }),

  positiveNumber: {
    name: 'positiveNumber',
    validator: (value: number | string) => {
      const num = typeof value === 'string' ? parseFloat(value) : value
      return !isNaN(num) && num > 0
    },
    message: 'Doit être un nombre positif'
  },

  futureDate: {
    name: 'futureDate',
    validator: (value: string | Date) => {
      const date = new Date(value)
      return !isNaN(date.getTime()) && date > new Date()
    },
    message: 'La date doit être dans le futur'
  }
} as const

// ==========================================
// EXPORT GROUPÉ
// ==========================================

export const Validators = {
  // Base
  required,
  email,
  password,
  passwordConfirmation,

  // Financier
  amount,
  iban,

  // Dates
  date,
  dateRange,

  // Texte
  textLength,
  url,
  name,

  // Métier
  transactionData,
  goalData,
  categoryData,

  // Avancés
  validateObject,
  validateSchema
} as const

// Import formatDate depuis dateUtils
import { formatDate } from './dateUtils'
