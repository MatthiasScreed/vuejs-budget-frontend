// ==========================================
// UTILS CONSTANTS - types/utils/constants.ts
// ==========================================

// ==========================================
// APPLICATION CONSTANTS
// ==========================================

export const APP_CONFIG = {
  NAME: 'Budget Gaming',
  VERSION: '1.0.0',
  DESCRIPTION: 'Application de gestion budgétaire gamifiée',
  AUTHOR: 'École 42 Team',
  CONTACT: 'contact@budget-gaming.com',
  WEBSITE: 'https://budget-gaming.com',
  REPOSITORY: 'https://github.com/ecole42/budget-gaming'
} as const

// ==========================================
// BUSINESS RULES CONSTANTS
// ==========================================

export const TRANSACTION_LIMITS = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 1000000,
  MAX_DESCRIPTION_LENGTH: 255,
  MAX_NOTES_LENGTH: 1000,
  MAX_TRANSACTIONS_PER_DAY: 100,
  MAX_CATEGORIES_PER_USER: 50
} as const

export const GOAL_LIMITS = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 10000000,
  MIN_DURATION_DAYS: 1,
  MAX_DURATION_DAYS: 3650, // 10 ans
  MAX_GOALS_PER_USER: 20,
  MAX_CONTRIBUTIONS_PER_GOAL: 1000
} as const

export const USER_LIMITS = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT_MINUTES: 720, // 12 heures
  MAX_DEVICES: 5
} as const

// ==========================================
// GAMING CONSTANTS
// ==========================================

export const XP_RATES = {
  TRANSACTION_CREATED: 10,
  TRANSACTION_UPDATED: 5,
  TRANSACTION_DELETED: 2,
  CATEGORY_CREATED: 15,
  CATEGORY_UPDATED: 8,
  GOAL_CREATED: 25,
  GOAL_CONTRIBUTION: 20,
  GOAL_COMPLETED: 100,
  DAILY_LOGIN: 5,
  WEEKLY_LOGIN_BONUS: 25,
  MONTHLY_LOGIN_BONUS: 100,
  STREAK_BONUS_MULTIPLIER: 1.5,
  ACHIEVEMENT_UNLOCKED_BONUS: 50,
  CHALLENGE_COMPLETED_BONUS: 75,
  BRIDGE_CONNECTION: 200,
  FIRST_SYNC: 150
} as const

export const LEVEL_CONFIG = {
  BASE_XP_PER_LEVEL: 100,
  XP_MULTIPLIER_PER_LEVEL: 1.2,
  MAX_LEVEL: 100,
  PRESTIGE_LEVELS: [25, 50, 75, 100],
  LEVEL_UP_BONUS_XP: 50
} as const

export const ACHIEVEMENT_CONFIG = {
  NOTIFICATION_DURATION: 5000, // 5 secondes
  AUTO_CHECK_ENABLED: true,
  CHECK_INTERVAL: 60000, // 1 minute
  MAX_NOTIFICATIONS_QUEUE: 10,
  CELEBRATION_DURATION: 3000,
  RARITY_GLOW_DURATION: 2000
} as const

export const CHALLENGE_CONFIG = {
  DAILY_CHALLENGES_COUNT: 3,
  WEEKLY_CHALLENGES_COUNT: 2,
  MONTHLY_CHALLENGES_COUNT: 1,
  CHALLENGE_REFRESH_TIME: '00:00', // Minuit
  MAX_ACTIVE_CHALLENGES: 10,
  CHALLENGE_EXPIRY_WARNING_HOURS: 24
} as const

export const STREAK_CONFIG = {
  MIN_STREAK_FOR_BONUS: 3,
  STREAK_BONUS_INCREMENT: 0.1, // +10% par niveau
  MAX_STREAK_MULTIPLIER: 3.0,
  STREAK_RESET_GRACE_HOURS: 6, // Grâce de 6h pour maintenance
  WEEKLY_STREAK_RESET_DAY: 'monday'
} as const

// ==========================================
// UI/UX CONSTANTS
// ==========================================

export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 4000,
  TOOLTIP_DELAY: 1000,
  MODAL_Z_INDEX: 1000,
  NOTIFICATION_Z_INDEX: 1050,
  LOADING_MIN_DURATION: 500, // Éviter flash
  SCROLL_SMOOTH_DURATION: 500
} as const

export const BREAKPOINTS = {
  XS: 0,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536
} as const

export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4',

  // Gaming colors
  XP_BAR: '#3B82F6',
  LEVEL_BADGE: '#F59E0B',
  ACHIEVEMENT_GLOW: '#FFD700',

  // Transaction colors
  INCOME: '#10B981',
  EXPENSE: '#EF4444',
  TRANSFER: '#6B7280',

  // Status colors
  ACTIVE: '#10B981',
  PENDING: '#F59E0B',
  COMPLETED: '#06B6D4',
  CANCELLED: '#6B7280',
  ERROR: '#EF4444'
} as const

// ==========================================
// API CONSTANTS
// ==========================================

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 secondes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 3600000, // 1 heure
  CACHE_DURATION: 300000, // 5 minutes

  // Endpoints
  BASE_URL: '/api',
  AUTH_PREFIX: '/auth',
  TRANSACTIONS_PREFIX: '/transactions',
  GAMING_PREFIX: '/gaming',
  BANKING_PREFIX: '/banking',
  ADMIN_PREFIX: '/admin'
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

// ==========================================
// VALIDATION CONSTANTS
// ==========================================

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  PHONE_REGEX: /^(\+33|0)[1-9]([0-9]{8})$/,
  IBAN_REGEX: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/,

  // Contraintes métier
  TRANSACTION_DESCRIPTION_MIN: 3,
  TRANSACTION_DESCRIPTION_MAX: 255,
  CATEGORY_NAME_MIN: 2,
  CATEGORY_NAME_MAX: 30,
  GOAL_NAME_MIN: 3,
  GOAL_NAME_MAX: 50,
  USER_NAME_MIN: 2,
  USER_NAME_MAX: 50
} as const

// ==========================================
// DATE & TIME CONSTANTS
// ==========================================

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
  MONTH: 'MM/YYYY',
  YEAR: 'YYYY',
  RELATIVE: 'relative' // il y a 2 heures
} as const

export const RECURRING_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
} as const

export const TIME_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
} as const

// ==========================================
// BANKING CONSTANTS (BRIDGE)
// ==========================================

export const BANKING_CONFIG = {
  SYNC_INTERVALS: {
    MANUAL: 'manual',
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly'
  },

  CONNECTION_STATUS: {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    ERROR: 'error',
    PENDING: 'pending',
    REQUIRES_ACTION: 'requires_action'
  },

  SYNC_BATCH_SIZE: 100,
  MAX_SYNC_RETRIES: 3,
  SYNC_TIMEOUT: 60000, // 1 minute

  SUPPORTED_COUNTRIES: ['FR', 'GB', 'DE', 'ES', 'IT'],
  SUPPORTED_CURRENCIES: ['EUR', 'USD', 'GBP']
} as const

// ==========================================
// FEATURE FLAGS
// ==========================================

export const FEATURES = {
  GAMING_ENABLED: true,
  BANKING_ENABLED: true,
  NOTIFICATIONS_ENABLED: true,
  ANALYTICS_ENABLED: true,
  SOCIAL_FEATURES: false,
  PREMIUM_FEATURES: false,
  BETA_FEATURES: false,
  DEBUG_MODE: false
} as const

// ==========================================
// ERROR MESSAGES
// ==========================================

export const ERROR_MESSAGES = {
  // Network
  NETWORK_ERROR: 'Erreur de connexion réseau',
  TIMEOUT_ERROR: 'Délai d\'attente dépassé',
  SERVER_ERROR: 'Erreur serveur interne',

  // Auth
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  ACCOUNT_LOCKED: 'Compte temporairement verrouillé',
  TOKEN_EXPIRED: 'Session expirée, veuillez vous reconnecter',

  // Validation
  REQUIRED_FIELD: 'Ce champ est obligatoire',
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_AMOUNT: 'Montant invalide',
  AMOUNT_TOO_HIGH: 'Montant trop élevé',
  AMOUNT_TOO_LOW: 'Montant trop faible',

  // Business rules
  INSUFFICIENT_FUNDS: 'Fonds insuffisants',
  DUPLICATE_TRANSACTION: 'Transaction déjà existante',
  GOAL_ALREADY_COMPLETED: 'Objectif déjà atteint',
  CATEGORY_IN_USE: 'Catégorie utilisée par des transactions',

  // Gaming
  ACHIEVEMENT_ALREADY_UNLOCKED: 'Succès déjà débloqué',
  CHALLENGE_EXPIRED: 'Défi expiré',
  XP_CALCULATION_ERROR: 'Erreur de calcul XP',
  LEVEL_UP_ERROR: 'Erreur lors du passage de niveau'
} as const

// ==========================================
// SUCCESS MESSAGES
// ==========================================

export const SUCCESS_MESSAGES = {
  // CRUD operations
  CREATED: 'Créé avec succès',
  UPDATED: 'Modifié avec succès',
  DELETED: 'Supprimé avec succès',

  // Specific entities
  TRANSACTION_CREATED: 'Transaction enregistrée',
  GOAL_COMPLETED: 'Objectif atteint ! Félicitations !',
  CATEGORY_CREATED: 'Catégorie créée',

  // Gaming
  ACHIEVEMENT_UNLOCKED: 'Nouveau succès débloqué !',
  LEVEL_UP: 'Niveau suivant atteint !',
  CHALLENGE_COMPLETED: 'Défi relevé avec succès !',
  STREAK_MILESTONE: 'Nouveau record de régularité !',

  // Banking
  BANK_CONNECTED: 'Compte bancaire connecté',
  SYNC_COMPLETED: 'Synchronisation terminée',

  // System
  SETTINGS_SAVED: 'Paramètres sauvegardés',
  PASSWORD_CHANGED: 'Mot de passe modifié',
  PROFILE_UPDATED: 'Profil mis à jour'
} as const

// ==========================================
// NOTIFICATION TYPES & CONFIG
// ==========================================

export const NOTIFICATION_CONFIG = {
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
    PERSISTENT: 0
  },

  POSITION: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    CENTER: 'center'
  },

  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    ACHIEVEMENT: 'achievement',
    LEVEL_UP: 'level_up'
  },

  MAX_CONCURRENT: 5,
  STACK_SPACING: 16
} as const

// ==========================================
// CURRENCY CONSTANTS
// ==========================================

export const CURRENCIES = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimal_places: 2,
    thousand_separator: ' ',
    decimal_separator: ',',
    symbol_position: 'after'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimal_places: 2,
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_position: 'before'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimal_places: 2,
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_position: 'before'
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    decimal_places: 2,
    thousand_separator: '\'',
    decimal_separator: '.',
    symbol_position: 'after'
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimal_places: 2,
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_position: 'before'
  }
} as const

// ==========================================
// CATEGORY DEFAULTS
// ==========================================

export const DEFAULT_CATEGORIES = {
  INCOME: [
    { name: 'Salaire', icon: '💼', color: '#10B981' },
    { name: 'Freelance', icon: '💻', color: '#3B82F6' },
    { name: 'Investissements', icon: '📈', color: '#8B5CF6' },
    { name: 'Prime', icon: '🎁', color: '#F59E0B' },
    { name: 'Autre revenu', icon: '💰', color: '#06B6D4' }
  ],
  EXPENSE: [
    { name: 'Alimentation', icon: '🛒', color: '#EF4444' },
    { name: 'Transport', icon: '🚗', color: '#F59E0B' },
    { name: 'Logement', icon: '🏠', color: '#8B5CF6' },
    { name: 'Loisirs', icon: '🎮', color: '#06B6D4' },
    { name: 'Santé', icon: '🏥', color: '#10B981' },
    { name: 'Éducation', icon: '📚', color: '#3B82F6' },
    { name: 'Vêtements', icon: '👕', color: '#EC4899' },
    { name: 'Électronique', icon: '📱', color: '#6B7280' }
  ]
} as const

// ==========================================
// DASHBOARD CONSTANTS
// ==========================================

export const DASHBOARD_CONFIG = {
  REFRESH_INTERVAL: 300000, // 5 minutes
  AUTO_REFRESH_ENABLED: true,
  CHART_ANIMATION_DURATION: 1000,
  STAT_CARD_UPDATE_ANIMATION: 500,

  WIDGETS: {
    MIN_WIDTH: 2,
    MIN_HEIGHT: 2,
    MAX_WIDTH: 12,
    MAX_HEIGHT: 8,
    DEFAULT_WIDTH: 4,
    DEFAULT_HEIGHT: 3
  },

  PERIODS: {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year',
    CUSTOM: 'custom'
  }
} as const

// ==========================================
// STORAGE CONSTANTS
// ==========================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
  CURRENCY_PREFERENCE: 'currency_preference',
  GAMING_SETTINGS: 'gaming_settings',
  NOTIFICATION_SETTINGS: 'notification_settings',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LAST_SYNC: 'last_sync'
} as const

// ==========================================
// ROUTES CONSTANTS
// ==========================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  CATEGORIES: '/categories',
  GOALS: '/goals',
  GAMING: '/gaming',
  ACHIEVEMENTS: '/gaming/achievements',
  CHALLENGES: '/gaming/challenges',
  LEADERBOARD: '/gaming/leaderboard',
  BANKING: '/banking',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  HELP: '/help',
  ADMIN: '/admin'
} as const

// ==========================================
// PERFORMANCE CONSTANTS
// ==========================================

export const PERFORMANCE_CONFIG = {
  VIRTUALIZATION_THRESHOLD: 100, // Activer virtualisation si plus de 100 items
  PAGINATION_DEFAULT_SIZE: 20,
  PAGINATION_SIZE_OPTIONS: [10, 20, 50, 100],
  SEARCH_DEBOUNCE: 300,
  LAZY_LOADING_OFFSET: 200, // pixels avant fin de scroll
  IMAGE_LAZY_LOADING: true,
  COMPONENT_LAZY_LOADING: true
} as const

// ==========================================
// EXPORT GROUPÉ
// ==========================================

export const ALL_CONSTANTS = {
  APP: APP_CONFIG,
  TRANSACTION_LIMITS,
  GOAL_LIMITS,
  USER_LIMITS,
  XP_RATES,
  LEVEL_CONFIG,
  ACHIEVEMENT_CONFIG,
  CHALLENGE_CONFIG,
  STREAK_CONFIG,
  UI: UI_CONFIG,
  COLORS,
  API: API_CONFIG,
  STORAGE: STORAGE_KEYS,
  ROUTES,
  CURRENCIES,
  DEFAULT_CATEGORIES,
  VALIDATION: VALIDATION_RULES,
  PERFORMANCE: PERFORMANCE_CONFIG
} as const

// Type pour accès type-safe aux constantes
export type AppConstants = typeof ALL_CONSTANTS
