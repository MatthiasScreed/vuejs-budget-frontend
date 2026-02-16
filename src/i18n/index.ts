// src/i18n/index.ts
// Configuration Vue I18n pour CoinQuest

import { createI18n } from 'vue-i18n'
import fr from './locales/fr'
import en from './locales/en'

// ==========================================
// DÉTECTION AUTOMATIQUE DE LA LANGUE
// ==========================================

/**
 * Détecte la langue préférée de l'utilisateur
 * Priorité : localStorage > navigateur > défaut (fr)
 */
function detectLocale(): string {
  // 1. Langue sauvegardée par l'utilisateur
  const saved = localStorage.getItem('coinquest_locale')
  if (saved && ['fr', 'en'].includes(saved)) {
    return saved
  }

  // 2. Langue du navigateur
  const browserLang = navigator.language?.split('-')[0]
  if (browserLang && ['fr', 'en'].includes(browserLang)) {
    return browserLang
  }

  // 3. Défaut : français
  return 'fr'
}

// ==========================================
// CRÉATION DE L'INSTANCE I18N
// ==========================================

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'fr',
  messages: { fr, en },

  // Formattage des nombres (devises)
  numberFormats: {
    fr: {
      currency: {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
    en: {
      currency: {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  },

  // Formattage des dates
  datetimeFormats: {
    fr: {
      short: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
      long: {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    },
    en: {
      short: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
      long: {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    },
  },
})

export default i18n
