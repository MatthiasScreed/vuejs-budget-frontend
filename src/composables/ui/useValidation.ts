/**
 * Composable pour validation avancée des données
 * Rules réutilisables pour formulaires et API
 */
export function useValidation() {

  /**
   * Valider un champ avec une règle
   */
  function validateField(value: any, rule: string): string | null {
    const rules = rule.split('|')

    for (const r of rules) {
      const [ruleName, ...params] = r.split(':')
      const error = applyRule(value, ruleName, params)

      if (error) return error
    }

    return null
  }

  /**
   * Appliquer une règle de validation
   */
  function applyRule(value: any, ruleName: string, params: string[]): string | null {
    switch (ruleName) {
      case 'required':
        return validateRequired(value)
      case 'email':
        return validateEmail(value)
      case 'min':
        return validateMin(value, parseInt(params[0]))
      case 'max':
        return validateMax(value, parseInt(params[0]))
      case 'amount':
        return validateAmount(value)
      case 'date':
        return validateDate(value)
      case 'future_date':
        return validateFutureDate(value, parseInt(params[0] || '0'))
      case 'password':
        return validatePassword(value)
      case 'confirmed':
        return validateConfirmed(value, params[0])
      default:
        return null
    }
  }

  /**
   * Valider champ requis
   */
  function validateRequired(value: any): string | null {
    if (value === null || value === undefined || value === '') {
      return 'Ce champ est obligatoire'
    }
    return null
  }

  /**
   * Valider format email
   */
  function validateEmail(value: string): string | null {
    if (!value) return null

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : 'Format email invalide'
  }

  /**
   * Valider longueur minimale
   */
  function validateMin(value: string | number, min: number): string | null {
    if (!value) return null

    const length = typeof value === 'string' ? value.length : value
    return length >= min ? null : `Minimum ${min} caractères requis`
  }

  /**
   * Valider longueur maximale
   */
  function validateMax(value: string | number, max: number): string | null {
    if (!value) return null

    const length = typeof value === 'string' ? value.length : value
    return length <= max ? null : `Maximum ${max} caractères autorisés`
  }

  /**
   * Valider montant financier
   */
  function validateAmount(value: number): string | null {
    if (value === null || value === undefined) return null

    if (isNaN(value) || value <= 0) {
      return 'Montant doit être positif'
    }

    if (value > 1000000) {
      return 'Montant trop élevé (max 1M€)'
    }

    return null
  }

  /**
   * Valider format de date
   */
  function validateDate(value: string): string | null {
    if (!value) return null

    const date = new Date(value)
    return isValidDateObject(date) ? null : 'Date invalide'
  }

  /**
   * Valider date future avec limite
   */
  function validateFutureDate(value: string, maxDaysInFuture: number = 365): string | null {
    if (!value) return null

    const date = new Date(value)
    const now = new Date()
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + maxDaysInFuture)

    if (!isValidDateObject(date)) {
      return 'Date invalide'
    }

    if (date < now) {
      return 'La date doit être dans le futur'
    }

    if (date > maxDate) {
      return `Date trop éloignée (max ${maxDaysInFuture} jours)`
    }

    return null
  }

  /**
   * Valider mot de passe sécurisé
   */
  function validatePassword(value: string): string | null {
    if (!value) return null

    if (value.length < 8) {
      return 'Minimum 8 caractères requis'
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Doit contenir : majuscule, minuscule et chiffre'
    }

    return null
  }

  /**
   * Valider confirmation de mot de passe
   */
  function validateConfirmed(value: string, originalValue: string): string | null {
    if (!value) return null

    return value === originalValue ? null : 'Les mots de passe ne correspondent pas'
  }

  /**
   * Vérifier si l'objet Date est valide
   */
  function isValidDateObject(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime())
  }

  /**
   * Créer des rules personnalisées pour les formulaires
   */
  function createRules() {
    return {
      // Transaction rules
      transactionAmount: (value: number) => validateAmount(value),
      transactionDescription: (value: string) => validateRequired(value) || validateMin(value, 3),
      transactionDate: (value: string) => validateRequired(value) || validateDate(value),

      // Goal rules
      goalName: (value: string) => validateRequired(value) || validateMin(value, 3),
      goalAmount: (value: number) => validateRequired(value) || validateAmount(value),
      goalDate: (value: string) => validateRequired(value) || validateFutureDate(value, 1095), // 3 ans max

      // Auth rules
      loginEmail: (value: string) => validateRequired(value) || validateEmail(value),
      loginPassword: (value: string) => validateRequired(value),
      registerPassword: (value: string) => validateRequired(value) || validatePassword(value),

      // Category rules
      categoryName: (value: string) => validateRequired(value) || validateMin(value, 2),
      categoryBudget: (value: number) => value ? validateAmount(value) : null
    }
  }

  return {
    // Core validation
    validateField,
    validateRequired,
    validateEmail,
    validateAmount,
    validateDate,
    validateFutureDate,
    validatePassword,

    // Form helpers
    createRules,
    isValidDateObject
  }
}
