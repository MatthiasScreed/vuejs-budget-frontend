// src/types/entities/category.ts
// Types complets pour la gestion des catégories

/**
 * Interface principale pour une catégorie
 */
export interface Category {
  id: number
  name: string
  slug: string
  color: string
  icon: string
  type: CategoryType
  parent_id?: number | null

  // Métadonnées
  description?: string
  is_active: boolean
  is_default: boolean
  is_template?: boolean
  user_customized?: boolean

  // Budget et finances
  monthly_budget?: number | null
  current_spent?: number
  budget_status?: BudgetStatus
  budget_alert_threshold?: number

  // Gaming et récompenses
  xp_multiplier?: number
  achievement_triggers?: string[]

  // Statistiques d'usage
  usage_count?: number
  last_used_at?: string
  total_spent?: number
  avg_transaction?: number

  // Relations
  children?: Category[]
  parent?: Category
  transactions_count?: number

  // Métadonnées système
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

/**
 * Types de catégories supportés
 */
export type CategoryType = 'income' | 'expense' | 'transfer' | 'both'

/**
 * Status du budget pour une catégorie
 */
export type BudgetStatus = 'safe' | 'warning' | 'exceeded' | 'unknown'

/**
 * Données pour créer une nouvelle catégorie
 */
export interface CreateCategoryData {
  name: string
  type: CategoryType
  color: string
  icon: string
  description?: string
  parent_id?: number | null
  monthly_budget?: number | null
  is_active?: boolean
  budget_alert_threshold?: number
  xp_multiplier?: number
  achievement_triggers?: string[]
}

/**
 * Données pour mettre à jour une catégorie
 */
export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  slug?: string
  usage_count?: number
  current_spent?: number
  budget_status?: BudgetStatus
}

/**
 * Template de catégorie prédéfini
 */
export interface CategoryTemplate {
  id: string
  name: string
  type: CategoryType
  icon: string
  color: string
  description: string
  suggested_budget?: number
  common_keywords: string[]
  xp_multiplier: number
  category: TemplateCategory
  popularity_score: number
}

/**
 * Catégories de templates
 */
export type TemplateCategory =
  | 'essentials'      // Alimentation, Logement, Transport
  | 'lifestyle'       // Loisirs, Shopping, Restaurants
  | 'financial'       // Épargne, Investissements, Assurances
  | 'professional'    // Salaire, Freelance, Business
  | 'health'          // Santé, Sport, Bien-être
  | 'family'          // Enfants, Éducation, Famille
  | 'travel'          // Voyages, Vacances, Déplacements
  | 'utilities'       // Factures, Abonnements, Services
  | 'entertainment'   // Sorties, Culture, Hobbies
  | 'other'          // Divers, Non catégorisé

/**
 * Statistiques d'une catégorie
 */
export interface CategoryStats {
  category_id: number
  period: 'week' | 'month' | 'quarter' | 'year'

  // Totaux
  total_amount: number
  transaction_count: number
  avg_transaction: number

  // Comparaisons
  vs_previous_period: {
    amount_change: number
    count_change: number
    percentage_change: number
  }

  // Budget
  budget_limit?: number
  budget_used: number
  budget_remaining: number
  budget_percentage: number
  budget_status: BudgetStatus

  // Tendances
  daily_average: number
  peak_day?: string
  peak_amount: number

  // Gaming
  xp_earned: number
  achievements_triggered: number
}

/**
 * Filtre pour rechercher des catégories
 */
export interface CategoryFilters {
  type?: CategoryType | CategoryType[]
  is_active?: boolean
  has_budget?: boolean
  parent_id?: number | 'root' | null
  template_category?: TemplateCategory
  search?: string
  used_recently?: boolean
  min_usage_count?: number
  created_after?: string
  sort_by?: CategorySortField
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * Champs de tri disponibles pour les catégories
 */
export type CategorySortField =
  | 'name'
  | 'created_at'
  | 'updated_at'
  | 'usage_count'
  | 'total_spent'
  | 'last_used_at'
  | 'budget_percentage'

/**
 * Réponse paginée pour les catégories
 */
export interface PaginatedCategories {
  data: Category[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
    has_more_pages: boolean
  }
}

/**
 * Suggestion de catégorie basée sur une transaction
 */
export interface CategorySuggestion {
  category: Category
  confidence: number
  reasons: SuggestionReason[]
  auto_apply: boolean
}

/**
 * Raison d'une suggestion de catégorie
 */
export interface SuggestionReason {
  type: 'keyword_match' | 'amount_pattern' | 'merchant_history' | 'similar_transactions' | 'ai_analysis'
  description: string
  confidence: number
  matched_data?: string
}

/**
 * Règle de catégorisation automatique
 */
export interface CategoryRule {
  id: number
  category_id: number
  name: string
  conditions: CategoryRuleCondition[]
  actions: CategoryRuleAction[]
  is_active: boolean
  priority: number
  auto_apply: boolean
  created_at: string
  updated_at: string
}

/**
 * Condition pour une règle de catégorisation
 */
export interface CategoryRuleCondition {
  field: 'description' | 'amount' | 'merchant' | 'account' | 'date' | 'metadata'
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'regex'
  value: string | number | [number, number]
  case_sensitive?: boolean
}

/**
 * Action pour une règle de catégorisation
 */
export interface CategoryRuleAction {
  type: 'set_category' | 'add_tag' | 'set_description' | 'trigger_notification'
  value: string | number
  override_existing?: boolean
}

/**
 * Hiérarchie de catégories (arbre)
 */
export interface CategoryHierarchy {
  category: Category
  children: CategoryHierarchy[]
  depth: number
  path: string[]
  transaction_count: number
  total_amount: number
}

/**
 * Export d'une catégorie (pour sauvegarde/import)
 */
export interface CategoryExport {
  categories: Category[]
  templates: CategoryTemplate[]
  rules: CategoryRule[]
  exported_at: string
  version: string
  user_id?: number
}

/**
 * Paramètres d'import de catégories
 */
export interface CategoryImportOptions {
  merge_strategy: 'replace' | 'merge' | 'skip_existing'
  import_templates: boolean
  import_rules: boolean
  preserve_ids: boolean
  activate_all: boolean
  parent_category_id?: number
}

/**
 * Résultat d'un import de catégories
 */
export interface CategoryImportResult {
  success: boolean
  imported_count: number
  skipped_count: number
  error_count: number
  categories: Category[]
  errors: Array<{
    category_name: string
    error: string
  }>
  warnings: string[]
}

/**
 * Couleurs prédéfinies pour les catégories
 */
export const CATEGORY_COLORS = {
  // Revenus (tons verts)
  INCOME_PRIMARY: '#059669',
  INCOME_SECONDARY: '#10B981',
  INCOME_LIGHT: '#34D399',

  // Dépenses essentielles (tons bleus)
  EXPENSE_ESSENTIAL: '#2563EB',
  EXPENSE_UTILITIES: '#3B82F6',
  EXPENSE_TRANSPORT: '#60A5FA',

  // Dépenses lifestyle (tons violets/roses)
  LIFESTYLE_SHOPPING: '#8B5CF6',
  LIFESTYLE_ENTERTAINMENT: '#A855F7',
  LIFESTYLE_DINING: '#EC4899',

  // Dépenses importantes (tons orange/rouge)
  EXPENSE_HEALTH: '#EF4444',
  EXPENSE_EDUCATION: '#F59E0B',
  EXPENSE_FAMILY: '#F97316',

  // Neutres (tons gris)
  DEFAULT: '#5b6270',
  TRANSFER: '#8c939f',
  OTHER: '#374151'
} as const

/**
 * Icônes prédéfinies pour les catégories
 */
export const CATEGORY_ICONS = {
  // Revenus
  SALARY: '💰',
  FREELANCE: '💼',
  INVESTMENT: '📈',
  GIFT: '🎁',
  BONUS: '💵',

  // Alimentation
  FOOD: '🍽️',
  GROCERIES: '🛒',
  RESTAURANT: '🍕',
  COFFEE: '☕',

  // Transport
  CAR: '🚗',
  GAS: '⛽',
  PUBLIC_TRANSPORT: '🚌',
  TAXI: '🚕',
  PLANE: '✈️',

  // Logement
  HOME: '🏠',
  RENT: '🔑',
  UTILITIES: '💡',
  MAINTENANCE: '🔧',

  // Loisirs
  ENTERTAINMENT: '🎬',
  GAMING: '🎮',
  SPORT: '⚽',
  TRAVEL: '🧳',
  BOOKS: '📚',

  // Santé
  HEALTH: '🏥',
  PHARMACY: '💊',
  FITNESS: '💪',
  BEAUTY: '💄',

  // Autres
  SHOPPING: '🛍️',
  EDUCATION: '🎓',
  FAMILY: '👨‍👩‍👧‍👦',
  PETS: '🐕',
  CHARITY: '❤️',
  SAVINGS: '🏦',
  DEFAULT: '📁'
} as const

/**
 * Templates de catégories prédéfinies
 */
export const DEFAULT_CATEGORY_TEMPLATES: CategoryTemplate[] = [
  // Revenus
  {
    id: 'salary',
    name: 'Salaire',
    type: 'income',
    icon: CATEGORY_ICONS.SALARY,
    color: CATEGORY_COLORS.INCOME_PRIMARY,
    description: 'Salaire mensuel ou revenus fixes',
    suggested_budget: 0,
    common_keywords: ['salaire', 'paie', 'traitement', 'rémunération'],
    xp_multiplier: 1.0,
    category: 'professional',
    popularity_score: 10
  },

  // Dépenses essentielles
  {
    id: 'food',
    name: 'Alimentation',
    type: 'expense',
    icon: CATEGORY_ICONS.FOOD,
    color: CATEGORY_COLORS.EXPENSE_ESSENTIAL,
    description: 'Courses alimentaires et repas',
    suggested_budget: 400,
    common_keywords: ['courses', 'supermarché', 'alimentation', 'carrefour', 'leclerc'],
    xp_multiplier: 1.2,
    category: 'essentials',
    popularity_score: 10
  },

  {
    id: 'transport',
    name: 'Transport',
    type: 'expense',
    icon: CATEGORY_ICONS.CAR,
    color: CATEGORY_COLORS.EXPENSE_TRANSPORT,
    description: 'Véhicule, essence, transports en commun',
    suggested_budget: 300,
    common_keywords: ['essence', 'transport', 'train', 'bus', 'métro'],
    xp_multiplier: 1.1,
    category: 'essentials',
    popularity_score: 9
  },

  // Loisirs
  {
    id: 'entertainment',
    name: 'Loisirs',
    type: 'expense',
    icon: CATEGORY_ICONS.ENTERTAINMENT,
    color: CATEGORY_COLORS.LIFESTYLE_ENTERTAINMENT,
    description: 'Sorties, divertissements, culture',
    suggested_budget: 200,
    common_keywords: ['cinéma', 'restaurant', 'concert', 'spectacle'],
    xp_multiplier: 1.3,
    category: 'lifestyle',
    popularity_score: 8
  }
]

/**
 * Type guards pour validation
 */
export function isCategoryType(value: string): value is CategoryType {
  return ['income', 'expense', 'transfer', 'both'].includes(value)
}

export function isBudgetStatus(value: string): value is BudgetStatus {
  return ['safe', 'warning', 'exceeded', 'unknown'].includes(value)
}

export function isTemplateCategory(value: string): value is TemplateCategory {
  return [
    'essentials', 'lifestyle', 'financial', 'professional',
    'health', 'family', 'travel', 'utilities', 'entertainment', 'other'
  ].includes(value)
}
