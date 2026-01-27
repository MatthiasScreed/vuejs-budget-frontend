// src/utils/formatters.ts
// Helpers de formatage pour CoinQuest

/**
 * Formate un montant en devise
 * @param amount Montant à formater
 * @param currency Code devise (EUR, USD, etc.)
 * @param locale Locale (fr-FR, en-US, etc.)
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return '0,00 €'
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount)
}

/**
 * Formate un nombre avec séparateurs de milliers
 * @param value Nombre à formater
 * @param decimals Nombre de décimales (défaut: 0)
 */
export function formatNumber(
  value: number | string,
  decimals: number = 0
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return '0'
  }

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue)
}

/**
 * Formate une date
 * @param date Date à formater
 * @param format Format (short, medium, long, full)
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return '-'
  }

  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'long', year: 'numeric' },
    long: {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    },
    full: {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  }[format]

  return new Intl.DateTimeFormat('fr-FR', options).format(dateObj)
}

/**
 * Formate une date relative (il y a X jours)
 * @param date Date à formater
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`
  return `Il y a ${Math.floor(diffDays / 365)} ans`
}

/**
 * Formate un pourcentage
 * @param value Valeur (0-100)
 * @param decimals Nombre de décimales
 */
export function formatPercent(
  value: number | string,
  decimals: number = 1
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return '0 %'
  }

  return `${numValue.toFixed(decimals)} %`
}

/**
 * Formate une durée en texte lisible
 * @param days Nombre de jours
 */
export function formatDuration(days: number): string {
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return '1 jour'
  if (days < 7) return `${days} jours`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? '1 semaine' : `${weeks} semaines`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    return months === 1 ? '1 mois' : `${months} mois`
  }
  const years = Math.floor(days / 365)
  return years === 1 ? '1 an' : `${years} ans`
}

/**
 * Raccourcit un texte avec ellipsis
 * @param text Texte à raccourcir
 * @param maxLength Longueur maximale
 */
export function truncate(text: string, maxLength: number = 50): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalise la première lettre
 * @param text Texte à capitaliser
 */
export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Formate un montant compact (1.5K, 2.3M, etc.)
 * @param amount Montant
 */
export function formatCompactCurrency(
  amount: number,
  currency: string = 'EUR'
): string {
  const symbol = currency === 'EUR' ? '€' : currency

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ${symbol}`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ${symbol}`
  }
  return formatCurrency(amount, currency)
}

/**
 * Parse un montant depuis une string
 * @param value String à parser
 */
export function parseCurrency(value: string): number {
  // Enlever les espaces, €, virgules
  const cleaned = value
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(/,/g, '.')

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Formate une taille de fichier
 * @param bytes Taille en bytes
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Export d'un objet global pour utilisation facile
 */
export default {
  currency: formatCurrency,
  number: formatNumber,
  date: formatDate,
  relativeDate: formatRelativeDate,
  percent: formatPercent,
  duration: formatDuration,
  truncate,
  capitalize,
  compactCurrency: formatCompactCurrency,
  parseCurrency,
  fileSize: formatFileSize
}
