/**
 * Utilitaires pour la gestion des dates
 * Fonctions pures et testables
 */

// ==========================================
// CONSTANTES
// ==========================================

export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DISPLAY_SHORT: 'DD/MM/YYYY',
  DISPLAY_LONG: 'dddd, DD MMMM YYYY',
  MONTH_YEAR: 'MMMM YYYY'
} as const

export const LOCALES = {
  FR: 'fr-FR',
  EN: 'en-US',
  ES: 'es-ES'
} as const

// ==========================================
// GETTERS DE DATES
// ==========================================

/**
 * Obtenir la date d'aujourd'hui au format ISO (YYYY-MM-DD)
 */
export function today(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Obtenir la date de demain
 */
export function tomorrow(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}

/**
 * Obtenir la date d'hier
 */
export function yesterday(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

/**
 * Obtenir le premier jour du mois courant
 */
export function startOfCurrentMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}

/**
 * Obtenir le dernier jour du mois courant
 */
export function endOfCurrentMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
}

/**
 * Obtenir le premier jour d'un mois spécifique
 */
export function startOfMonth(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    throw new Error('Date invalide pour startOfMonth')
  }
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}

/**
 * Obtenir le dernier jour d'un mois spécifique
 */
export function endOfMonth(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    throw new Error('Date invalide pour endOfMonth')
  }
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
}

// ==========================================
// PLAGES DE DATES
// ==========================================

export interface DateRange {
  start: string
  end: string
  label: string
}

/**
 * Obtenir une plage de dates prédéfinie
 */
export function getDateRange(
  period: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'last_week' | 'last_month'
): DateRange {
  const now = new Date()
  let start: Date
  let end: Date
  let label: string

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = new Date(start)
      end.setHours(23, 59, 59, 999)
      label = 'Aujourd\'hui'
      break

    case 'yesterday':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      end = new Date(start)
      end.setHours(23, 59, 59, 999)
      label = 'Hier'
      break

    case 'week':
      // Semaine courante (lundi à dimanche)
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday)
      end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      label = 'Cette semaine'
      break

    case 'last_week':
      const lastWeekStart = new Date(now)
      lastWeekStart.setDate(now.getDate() - 7 - (now.getDay() === 0 ? 6 : now.getDay() - 1))
      start = lastWeekStart
      end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      label = 'Semaine dernière'
      break

    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      label = 'Ce mois'
      break

    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0)
      end.setHours(23, 59, 59, 999)
      label = 'Mois dernier'
      break

    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      start = new Date(now.getFullYear(), quarter * 3, 1)
      end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
      end.setHours(23, 59, 59, 999)
      label = `T${quarter + 1} ${now.getFullYear()}`
      break

    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31)
      end.setHours(23, 59, 59, 999)
      label = `Année ${now.getFullYear()}`
      break

    default:
      throw new Error(`Période non supportée: ${period}`)
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    label
  }
}

/**
 * Créer une plage de dates personnalisée
 */
export function createDateRange(
  startDate: string | Date,
  endDate: string | Date
): DateRange {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Dates invalides pour createDateRange')
  }

  if (start > end) {
    throw new Error('La date de début doit être antérieure à la date de fin')
  }

  const label = `Du ${formatDate(start, { format: 'short' })} au ${formatDate(end, { format: 'short' })}`

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    label
  }
}

// ==========================================
// FORMATAGE DE DATES
// ==========================================

export interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'relative'
  locale?: string
  includeTime?: boolean
}

/**
 * Formater une date pour l'affichage
 */
export function formatDate(
  dateInput: string | Date,
  options: DateFormatOptions = {}
): string {
  const date = new Date(dateInput)

  if (isNaN(date.getTime())) {
    console.warn('formatDate: date invalide', dateInput)
    return String(dateInput)
  }

  const {
    format = 'medium',
    locale = LOCALES.FR,
    includeTime = false
  } = options

  if (format === 'relative') {
    return getRelativeTime(date, locale)
  }

  let dateOptions: Intl.DateTimeFormatOptions = {}

  switch (format) {
    case 'short':
      dateOptions = {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }
      break

    case 'long':
      dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      break

    default: // medium
      dateOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
  }

  if (includeTime) {
    dateOptions.hour = '2-digit'
    dateOptions.minute = '2-digit'
  }

  return date.toLocaleDateString(locale, dateOptions)
}

/**
 * Formatage de temps relatif (il y a X temps)
 */
export function getRelativeTime(date: Date, locale: string = LOCALES.FR): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return 'À l\'instant'
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`

  return `Il y a ${Math.floor(diffDays / 365)} ans`
}

// ==========================================
// CALCULS ET VALIDATIONS
// ==========================================

/**
 * Calculer la différence entre deux dates
 */
export function dateDiff(
  startDate: string | Date,
  endDate: string | Date,
  unit: 'days' | 'hours' | 'minutes' | 'months' | 'years' = 'days'
): number {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Dates invalides pour dateDiff')
  }

  const diffMs = end.getTime() - start.getTime()

  switch (unit) {
    case 'minutes':
      return Math.floor(diffMs / (1000 * 60))
    case 'hours':
      return Math.floor(diffMs / (1000 * 60 * 60))
    case 'days':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24))
    case 'months':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
    case 'years':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365))
    default:
      return 0
  }
}

/**
 * Valider qu'une date est dans le futur
 */
export function isDateInFuture(dateInput: string | Date): boolean {
  const date = new Date(dateInput)
  return !isNaN(date.getTime()) && date > new Date()
}

/**
 * Valider qu'une date est dans le passé
 */
export function isDateInPast(dateInput: string | Date): boolean {
  const date = new Date(dateInput)
  return !isNaN(date.getTime()) && date < new Date()
}

/**
 * Valider qu'une date est valide
 */
export function isValidDate(dateInput: string | Date): boolean {
  const date = new Date(dateInput)
  return !isNaN(date.getTime())
}

/**
 * Valider qu'une plage de dates est cohérente
 */
export function isValidDateRange(startDate: string | Date, endDate: string | Date): {
  isValid: boolean
  error?: string
} {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime())) {
    return { isValid: false, error: 'Date de début invalide' }
  }

  if (isNaN(end.getTime())) {
    return { isValid: false, error: 'Date de fin invalide' }
  }

  if (start > end) {
    return { isValid: false, error: 'La date de début doit être antérieure à la date de fin' }
  }

  // Vérifier que la plage n'est pas trop longue (max 2 ans)
  const diffDays = dateDiff(start, end, 'days')
  if (diffDays > 730) {
    return { isValid: false, error: 'La plage de dates ne peut pas dépasser 2 ans' }
  }

  return { isValid: true }
}

// ==========================================
// MANIPULATIONS DE DATES
// ==========================================

/**
 * Ajouter des jours à une date
 */
export function addDays(dateInput: string | Date, days: number): string {
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) {
    throw new Error('Date invalide pour addDays')
  }

  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

/**
 * Ajouter des mois à une date
 */
export function addMonths(dateInput: string | Date, months: number): string {
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) {
    throw new Error('Date invalide pour addMonths')
  }

  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}

/**
 * Ajouter des années à une date
 */
export function addYears(dateInput: string | Date, years: number): string {
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) {
    throw new Error('Date invalide pour addYears')
  }

  date.setFullYear(date.getFullYear() + years)
  return date.toISOString().split('T')[0]
}

// ==========================================
// PLAGES DE DATES AVANCÉES
// ==========================================

/**
 * Générer une liste de dates entre deux dates
 */
export function generateDateRange(
  startDate: string | Date,
  endDate: string | Date,
  step: 'day' | 'week' | 'month' = 'day'
): string[] {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Dates invalides pour generateDateRange')
  }

  if (start > end) {
    throw new Error('Date de début postérieure à date de fin')
  }

  const dates: string[] = []
  const current = new Date(start)

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])

    switch (step) {
      case 'day':
        current.setDate(current.getDate() + 1)
        break
      case 'week':
        current.setDate(current.getDate() + 7)
        break
      case 'month':
        current.setMonth(current.getMonth() + 1)
        break
    }
  }

  return dates
}

/**
 * Obtenir les X derniers mois
 */
export function getLastMonths(count: number): DateRange[] {
  if (count < 1 || count > 24) {
    throw new Error('Nombre de mois doit être entre 1 et 24')
  }

  const ranges: DateRange[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const label = monthDate.toLocaleDateString(LOCALES.FR, {
      month: 'long',
      year: 'numeric'
    })

    ranges.push({ start, end, label })
  }

  return ranges.reverse() // Plus ancien en premier
}

/**
 * Obtenir les X dernières semaines
 */
export function getLastWeeks(count: number): DateRange[] {
  if (count < 1 || count > 52) {
    throw new Error('Nombre de semaines doit être entre 1 et 52')
  }

  const ranges: DateRange[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (i * 7) - (now.getDay() === 0 ? 6 : now.getDay() - 1))

    const start = weekStart.toISOString().split('T')[0]
    const end = addDays(start, 6)

    const label = `Semaine du ${formatDate(start, { format: 'short' })}`

    ranges.push({ start, end, label })
  }

  return ranges.reverse()
}

// ==========================================
// HELPERS BUSINESS
// ==========================================

/**
 * Calculer l'âge en années
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = new Date(birthDate)
  const today = new Date()

  if (isNaN(birth.getTime()) || birth > today) {
    throw new Error('Date de naissance invalide')
  }

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Calculer le nombre de jours ouvrables entre deux dates
 */
export function getBusinessDays(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return 0
  }

  let businessDays = 0
  const current = new Date(start)

  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Pas weekend
      businessDays++
    }
    current.setDate(current.getDate() + 1)
  }

  return businessDays
}

/**
 * Vérifier si une date est un weekend
 */
export function isWeekend(dateInput: string | Date): boolean {
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return false

  const day = date.getDay()
  return day === 0 || day === 6 // Dimanche ou samedi
}

/**
 * Obtenir le prochain jour ouvrable
 */
export function getNextBusinessDay(dateInput: string | Date): string {
  let date = new Date(dateInput)

  if (isNaN(date.getTime())) {
    throw new Error('Date invalide pour getNextBusinessDay')
  }

  // Avancer jusqu'au prochain jour ouvrable
  do {
    date.setDate(date.getDate() + 1)
  } while (isWeekend(date))

  return date.toISOString().split('T')[0]
}

// ==========================================
// HELPERS TIMEZONE
// ==========================================

/**
 * Convertir une date locale en UTC
 */
export function toUTC(dateInput: string | Date): string {
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) {
    throw new Error('Date invalide pour toUTC')
  }

  return date.toISOString()
}

/**
 * Convertir UTC en heure locale
 */
export function fromUTC(utcDate: string, timezone?: string): Date {
  const date = new Date(utcDate)
  if (isNaN(date.getTime())) {
    throw new Error('Date UTC invalide')
  }

  if (timezone) {
    // Note: Nécessite Intl.DateTimeFormat pour support complet timezone
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  }

  return date
}

// ==========================================
// EXPORT DEFAULT OBJECT
// ==========================================

export const DateUtils = {
  // Getters
  today,
  tomorrow,
  yesterday,
  startOfCurrentMonth,
  endOfCurrentMonth,
  startOfMonth,
  endOfMonth,

  // Ranges
  getDateRange,
  createDateRange,
  generateDateRange,
  getLastMonths,
  getLastWeeks,

  // Format
  formatDate,
  getRelativeTime,

  // Calculs
  dateDiff,
  addDays,
  addMonths,
  addYears,
  calculateAge,
  getBusinessDays,

  // Validations
  isValidDate,
  isValidDateRange,
  isDateInFuture,
  isDateInPast,
  isWeekend,
  getNextBusinessDay,

  // Timezone
  toUTC,
  fromUTC
} as const
