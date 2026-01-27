/**
 * Composable pour formatage intelligent des données
 * Monnaies, dates, pourcentages, nombres avec localisation
 */
export function useFormatting() {
  const locale = 'fr-FR'
  const currency = 'EUR'

  /**
   * Formater un montant en devise
   */
  function formatCurrency(
    amount: number,
    currencyCode: string = currency,
    showSymbol: boolean = true
  ): string {
    if (isNaN(amount)) return '0,00 €'

    const formatter = new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    return formatter.format(amount)
  }

  /**
   * Formater un nombre avec séparateurs
   */
  function formatNumber(
    number: number,
    decimals: number = 0
  ): string {
    if (isNaN(number)) return '0'

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number)
  }

  /**
   * Formater un pourcentage
   */
  function formatPercentage(
    value: number,
    decimals: number = 1
  ): string {
    if (isNaN(value)) return '0%'

    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100)
  }

  /**
   * Formater une date relative (il y a X jours)
   */
  function formatRelativeDate(date: string | Date): string {
    const targetDate = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - targetDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Aujourd\'hui'
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`

    return `Il y a ${Math.floor(diffDays / 365)} ans`
  }

  /**
   * Formater une date complète
   */
  function formatDate(date: string | Date, style: 'short' | 'long' = 'short'): string {
    const targetDate = new Date(date)

    const options: Intl.DateTimeFormatOptions = style === 'long'
      ? {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      : {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }

    return new Intl.DateTimeFormat(locale, options).format(targetDate)
  }

  /**
   * Formater la durée (minutes, heures, jours)
   */
  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h${minutes % 60}min`

    const days = Math.floor(minutes / 1440)
    const hours = Math.floor((minutes % 1440) / 60)

    return `${days}j ${hours}h`
  }

  /**
   * Formater l'XP avec abréviations (1.2k, 5.8M)
   */
  function formatXP(xp: number): string {
    if (xp < 1000) return xp.toString()
    if (xp < 1000000) return `${(xp / 1000).toFixed(1)}k`

    return `${(xp / 1000000).toFixed(1)}M`
  }

  /**
   * Formater un changement avec signe (+/-)
   */
  function formatChange(value: number, format: 'currency' | 'percentage' | 'number' = 'number'): string {
    const sign = value >= 0 ? '+' : ''

    switch (format) {
      case 'currency':
        return `${sign}${formatCurrency(Math.abs(value))}`
      case 'percentage':
        return `${sign}${formatPercentage(Math.abs(value))}`
      default:
        return `${sign}${formatNumber(value)}`
    }
  }

  /**
   * Tronquer un texte avec ellipsis
   */
  function truncateText(text: string, maxLength: number = 50): string {
    if (!text || text.length <= maxLength) return text

    return text.substring(0, maxLength - 3) + '...'
  }

  /**
   * Formater la taille d'un fichier
   */
  function formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB']
    let i = 0

    while (bytes >= 1024 && i < sizes.length - 1) {
      bytes /= 1024
      i++
    }

    return `${bytes.toFixed(1)} ${sizes[i]}`
  }

  return {
    // Formatage financier
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatChange,

    // Formatage temporel
    formatDate,
    formatRelativeDate,
    formatDuration,

    // Formatage gaming
    formatXP,

    // Utilitaires
    truncateText,
    formatFileSize
  }
}
