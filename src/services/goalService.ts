import { api, type ApiResponse, type PaginationMeta } from './api'

// ==========================================
// TYPES DES OBJECTIFS FINANCIERS
// ==========================================

export interface FinancialGoal {
  id: number
  user_id: number
  name: string
  description?: string
  target_amount: number
  current_amount: number
  target_date: string
  status: 'active' | 'completed' | 'paused' | 'archived'
  priority: 'low' | 'medium' | 'high'
  category?: string
  color?: string
  icon?: string
  auto_contribution?: boolean
  monthly_target?: number
  created_at: string
  updated_at: string
  completed_at?: string

  // Relations
  contributions?: GoalContribution[]
  milestones?: GoalMilestone[]
}

export interface GoalContribution {
  id: number
  goal_id: number
  amount: number
  description?: string
  transaction_id?: number
  created_at: string
  updated_at: string
}

export interface GoalMilestone {
  id: number
  goal_id: number
  name: string
  target_amount: number
  achieved_at?: string
  created_at: string
}

export interface CreateGoalData {
  name: string
  description?: string
  target_amount: number
  target_date: string
  current_amount?: number
  priority?: 'low' | 'medium' | 'high'
  category?: string
  color?: string
  icon?: string
  auto_contribution?: boolean
  milestones?: Array<{
    name: string
    target_amount: number
  }>
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  status?: 'active' | 'completed' | 'paused' | 'archived'
}

export interface GoalFilters {
  status?: 'active' | 'completed' | 'paused' | 'archived'
  priority?: 'low' | 'medium' | 'high'
  category?: string
  due_soon?: boolean // Échéance proche
  search?: string
  page?: number
  per_page?: number
  sort?: 'name' | 'target_date' | 'progress' | 'created_at'
  order?: 'asc' | 'desc'
}

export interface GoalStats {
  total_goals: number
  active_goals: number
  completed_goals: number
  paused_goals: number
  archived_goals: number
  total_saved: number
  total_target: number
  overall_progress: number
  goals_completed_this_month: number
  total_contributions: number
}

export interface GoalProgress {
  goal: FinancialGoal
  progress_percentage: number
  days_remaining: number
  monthly_required: number
  on_track: boolean
  projected_completion: string
  milestones_achieved: number
  next_milestone?: GoalMilestone
}

export interface ContributionData {
  amount: number
  description?: string
  transaction_id?: number
}

// ==========================================
// CONSTANTES
// ==========================================

const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
  target_amount: {
    min: 1,
    max: 10000000, // 10M max
  },
  contribution: {
    min: 0.01,
    max: 1000000, // 1M max par contribution
  },
} as const

const GOAL_CATEGORIES = [
  { id: 'travel', name: 'Voyage', icon: '✈️', color: '#3B82F6' },
  { id: 'house', name: 'Immobilier', icon: '🏠', color: '#10B981' },
  { id: 'car', name: 'Véhicule', icon: '🚗', color: '#F59E0B' },
  { id: 'emergency', name: 'Urgence', icon: '🚨', color: '#EF4444' },
  { id: 'education', name: 'Éducation', icon: '📚', color: '#8B5CF6' },
  { id: 'retirement', name: 'Retraite', icon: '🏖️', color: '#6366F1' },
  { id: 'wedding', name: 'Mariage', icon: '💍', color: '#EC4899' },
  { id: 'business', name: 'Entreprise', icon: '💼', color: '#059669' },
  { id: 'technology', name: 'Technologie', icon: '💻', color: '#DC2626' },
  { id: 'health', name: 'Santé', icon: '🏥', color: '#0891B2' },
  { id: 'other', name: 'Autre', icon: '🎯', color: '#5b6270' },
] as const

// ==========================================
// SERVICE DES OBJECTIFS FINANCIERS
// ==========================================

export const goalService = {
  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  /**
   * Récupérer tous les objectifs avec filtres et pagination
   */
  async getGoals(filters: GoalFilters = {}): Promise<ApiResponse<{
    data: FinancialGoal[]
    pagination: PaginationMeta
  }>> {
    const params = this.buildFilterParams(filters)
    return api.get(`/financial-goals?${params.toString()}`)
  },

  /**
   * Récupérer un objectif spécifique avec ses détails
   */
  async getGoal(id: number): Promise<ApiResponse<FinancialGoal>> {
    return api.get<FinancialGoal>(`/financial-goals/${id}`)
  },

  /**
   * Créer un nouvel objectif financier
   */
  async createGoal(data: CreateGoalData): Promise<ApiResponse<FinancialGoal>> {
    const validationResult = this.validateGoalData(data)
    if (!validationResult.isValid) {
      return {
        success: false,
        data: {} as FinancialGoal,
        message: 'Données invalides',
        errors: { validation: validationResult.errors }
      }
    }

    const goalData = this.prepareGoalData(data)
    return api.post<FinancialGoal>('/financial-goals', goalData)
  },

  /**
   * Mettre à jour un objectif existant
   */
  async updateGoal(id: number, data: UpdateGoalData): Promise<ApiResponse<FinancialGoal>> {
    const validationResult = this.validateUpdateData(data)
    if (!validationResult.isValid) {
      return {
        success: false,
        data: {} as FinancialGoal,
        message: 'Données invalides',
        errors: { validation: validationResult.errors }
      }
    }

    return api.put<FinancialGoal>(`/financial-goals/${id}`, data)
  },

  /**
   * Supprimer un objectif
   */
  async deleteGoal(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/financial-goals/${id}`)
  },

  // ==========================================
  // GESTION DES CONTRIBUTIONS
  // ==========================================

  /**
   * Ajouter une contribution à un objectif
   */
  async addContribution(
    goalId: number,
    contributionData: ContributionData
  ): Promise<ApiResponse<{
    contribution: GoalContribution
    updated_goal: FinancialGoal
  }>> {
    const validationResult = this.validateContribution(contributionData)
    if (!validationResult.isValid) {
      return {
        success: false,
        data: {} as any,
        message: 'Contribution invalide',
        errors: { validation: validationResult.errors }
      }
    }

    return api.post(`/financial-goals/${goalId}/contributions`, contributionData)
  },

  /**
   * Récupérer les contributions d'un objectif
   */
  async getContributions(
    goalId: number,
    page: number = 1,
    perPage: number = 20
  ): Promise<ApiResponse<{
    data: GoalContribution[]
    pagination: PaginationMeta
  }>> {
    return api.get(`/financial-goals/${goalId}/contributions?page=${page}&per_page=${perPage}`)
  },

  /**
   * Supprimer une contribution
   */
  async deleteContribution(
    goalId: number,
    contributionId: number
  ): Promise<ApiResponse<{ updated_goal: FinancialGoal }>> {
    return api.delete(`/financial-goals/${goalId}/contributions/${contributionId}`)
  },

  /**
   * Mettre à jour une contribution
   */
  async updateContribution(
    goalId: number,
    contributionId: number,
    data: Partial<ContributionData>
  ): Promise<ApiResponse<GoalContribution>> {
    return api.put(`/financial-goals/${goalId}/contributions/${contributionId}`, data)
  },

  // ==========================================
  // GESTION DU STATUT
  // ==========================================

  /**
   * Changer le statut d'un objectif
   */
  async updateStatus(
    id: number,
    status: 'active' | 'completed' | 'paused' | 'archived'
  ): Promise<ApiResponse<FinancialGoal>> {
    return api.patch<FinancialGoal>(`/financial-goals/${id}/status`, { status })
  },

  /**
   * Marquer un objectif comme terminé
   */
  async completeGoal(id: number): Promise<ApiResponse<FinancialGoal>> {
    return this.updateStatus(id, 'completed')
  },

  /**
   * Mettre en pause un objectif
   */
  async pauseGoal(id: number): Promise<ApiResponse<FinancialGoal>> {
    return this.updateStatus(id, 'paused')
  },

  /**
   * Réactiver un objectif
   */
  async activateGoal(id: number): Promise<ApiResponse<FinancialGoal>> {
    return this.updateStatus(id, 'active')
  },

  /**
   * Archiver un objectif
   */
  async archiveGoal(id: number): Promise<ApiResponse<FinancialGoal>> {
    return this.updateStatus(id, 'archived')
  },

  // ==========================================
  // STATISTIQUES ET RAPPORTS
  // ==========================================

  /**
   * Récupérer les statistiques des objectifs
   */
  async getStats(): Promise<ApiResponse<GoalStats>> {
    return api.get<GoalStats>('/financial-goals/stats')
  },

  /**
   * Récupérer les objectifs par statut
   */
  async getGoalsByStatus(status: string): Promise<ApiResponse<FinancialGoal[]>> {
    return this.getGoals({ status: status as any, per_page: 100 })
      .then(response => ({
        ...response,
        data: response.data?.data || []
      }))
  },

  /**
   * Récupérer les objectifs actifs
   */
  async getActiveGoals(): Promise<ApiResponse<FinancialGoal[]>> {
    return this.getGoalsByStatus('active')
  },

  /**
   * Récupérer les objectifs terminés
   */
  async getCompletedGoals(): Promise<ApiResponse<FinancialGoal[]>> {
    return this.getGoalsByStatus('completed')
  },

  /**
   * Récupérer les objectifs proches de l'échéance
   */
  async getUpcomingGoals(days: number = 30): Promise<ApiResponse<FinancialGoal[]>> {
    return api.get<FinancialGoal[]>(`/financial-goals/upcoming?days=${days}`)
  },

  /**
   * Récupérer le progrès détaillé d'un objectif
   */
  async getGoalProgress(id: number): Promise<ApiResponse<GoalProgress>> {
    return api.get<GoalProgress>(`/financial-goals/${id}/progress`)
  },

  // ==========================================
  // MILESTONES (ÉTAPES)
  // ==========================================

  /**
   * Créer une étape pour un objectif
   */
  async createMilestone(
    goalId: number,
    milestoneData: { name: string; target_amount: number }
  ): Promise<ApiResponse<GoalMilestone>> {
    return api.post(`/financial-goals/${goalId}/milestones`, milestoneData)
  },

  /**
   * Marquer une étape comme atteinte
   */
  async achieveMilestone(
    goalId: number,
    milestoneId: number
  ): Promise<ApiResponse<GoalMilestone>> {
    return api.patch(`/financial-goals/${goalId}/milestones/${milestoneId}/achieve`)
  },

  /**
   * Supprimer une étape
   */
  async deleteMilestone(
    goalId: number,
    milestoneId: number
  ): Promise<ApiResponse<void>> {
    return api.delete(`/financial-goals/${goalId}/milestones/${milestoneId}`)
  },

  // ==========================================
  // RECHERCHE ET FILTRES
  // ==========================================

  /**
   * Rechercher des objectifs
   */
  async searchGoals(
    query: string,
    filters?: Omit<GoalFilters, 'search'>
  ): Promise<ApiResponse<{
    data: FinancialGoal[]
    pagination: PaginationMeta
  }>> {
    return this.getGoals({ ...filters, search: query })
  },

  /**
   * Récupérer les objectifs par catégorie
   */
  async getGoalsByCategory(category: string): Promise<ApiResponse<FinancialGoal[]>> {
    return this.getGoals({ category, per_page: 100 })
      .then(response => ({
        ...response,
        data: response.data?.data || []
      }))
  },

  // ==========================================
  // RECOMMANDATIONS ET SUGGESTIONS
  // ==========================================

  /**
   * Obtenir des recommandations d'objectifs
   */
  async getGoalRecommendations(): Promise<ApiResponse<Array<{
    category: string
    name: string
    suggested_amount: number
    priority: 'low' | 'medium' | 'high'
    reasoning: string
  }>>> {
    return api.get('/financial-goals/recommendations')
  },

  /**
   * Analyser la faisabilité d'un objectif
   */
  async analyzeGoalFeasibility(goalData: CreateGoalData): Promise<ApiResponse<{
    feasible: boolean
    monthly_required: number
    recommended_target_date: string
    suggestions: string[]
  }>> {
    return api.post('/financial-goals/analyze-feasibility', goalData)
  },

  // ==========================================
  // UTILITAIRES DE CONSTRUCTION
  // ==========================================

  /**
   * Construire les paramètres de filtre
   */
  buildFilterParams(filters: GoalFilters): URLSearchParams {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })

    return params
  },

  /**
   * Préparer les données d'objectif pour l'envoi
   */
  prepareGoalData(data: CreateGoalData): CreateGoalData {
    return {
      ...data,
      name: data.name.trim(),
      description: data.description?.trim(),
      target_amount: Number(data.target_amount.toFixed(2)),
      current_amount: Number((data.current_amount || 0).toFixed(2)),
      priority: data.priority || 'medium',
      auto_contribution: data.auto_contribution || false,
    }
  },

  // ==========================================
  // VALIDATION
  // ==========================================

  /**
   * Valider les données de création d'objectif
   */
  validateGoalData(data: CreateGoalData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Nom
    if (!data.name?.trim()) {
      errors.push('Le nom de l\'objectif est obligatoire')
    } else if (data.name.trim().length < VALIDATION_RULES.name.minLength) {
      errors.push(`Le nom doit faire au moins ${VALIDATION_RULES.name.minLength} caractères`)
    } else if (data.name.length > VALIDATION_RULES.name.maxLength) {
      errors.push(`Le nom ne peut pas dépasser ${VALIDATION_RULES.name.maxLength} caractères`)
    }

    // Description
    if (data.description && data.description.length > VALIDATION_RULES.description.maxLength) {
      errors.push(`La description ne peut pas dépasser ${VALIDATION_RULES.description.maxLength} caractères`)
    }

    // Montant cible
    if (!data.target_amount || data.target_amount <= 0) {
      errors.push('Le montant cible doit être supérieur à 0')
    } else if (data.target_amount < VALIDATION_RULES.target_amount.min) {
      errors.push(`Le montant cible minimum est de ${VALIDATION_RULES.target_amount.min}€`)
    } else if (data.target_amount > VALIDATION_RULES.target_amount.max) {
      errors.push(`Le montant cible maximum est de ${VALIDATION_RULES.target_amount.max.toLocaleString()}€`)
    }

    // Montant actuel
    if (data.current_amount !== undefined) {
      if (data.current_amount < 0) {
        errors.push('Le montant actuel ne peut pas être négatif')
      } else if (data.current_amount > data.target_amount) {
        errors.push('Le montant actuel ne peut pas dépasser le montant cible')
      }
    }

    // Date cible
    if (!data.target_date) {
      errors.push('La date cible est obligatoire')
    } else if (!this.isValidDate(data.target_date)) {
      errors.push('La date cible est invalide')
    } else {
      const targetDate = new Date(data.target_date)
      const now = new Date()
      if (targetDate <= now) {
        errors.push('La date cible doit être dans le futur')
      }
    }

    // Priorité
    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      errors.push('La priorité doit être "low", "medium" ou "high"')
    }

    return { isValid: errors.length === 0, errors }
  },

  /**
   * Valider les données de mise à jour
   */
  validateUpdateData(data: UpdateGoalData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Seulement valider les champs présents
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('Le nom ne peut pas être vide')
      } else if (data.name.length > VALIDATION_RULES.name.maxLength) {
        errors.push(`Le nom ne peut pas dépasser ${VALIDATION_RULES.name.maxLength} caractères`)
      }
    }

    if (data.target_amount !== undefined) {
      if (data.target_amount <= 0) {
        errors.push('Le montant cible doit être supérieur à 0')
      }
    }

    if (data.target_date !== undefined) {
      if (!this.isValidDate(data.target_date)) {
        errors.push('La date cible est invalide')
      }
    }

    return { isValid: errors.length === 0, errors }
  },

  /**
   * Valider une contribution
   */
  validateContribution(data: ContributionData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.amount || data.amount <= 0) {
      errors.push('Le montant de la contribution doit être supérieur à 0')
    } else if (data.amount < VALIDATION_RULES.contribution.min) {
      errors.push(`Le montant minimum est de ${VALIDATION_RULES.contribution.min}€`)
    } else if (data.amount > VALIDATION_RULES.contribution.max) {
      errors.push(`Le montant maximum est de ${VALIDATION_RULES.contribution.max.toLocaleString()}€`)
    }

    return { isValid: errors.length === 0, errors }
  },

  // ==========================================
  // CALCULS ET UTILITAIRES
  // ==========================================

  /**
   * Calculer la progression d'un objectif en pourcentage
   */
  calculateProgress(goal: FinancialGoal): number {
    if (goal.target_amount <= 0) return 0
    const progress = (goal.current_amount / goal.target_amount) * 100
    return Math.min(Math.round(progress * 100) / 100, 100) // Arrondi à 2 décimales, max 100%
  },

  /**
   * Calculer le montant restant
   */
  calculateRemaining(goal: FinancialGoal): number {
    return Math.max(0, goal.target_amount - goal.current_amount)
  },

  /**
   * Calculer les jours restants
   */
  calculateDaysRemaining(goal: FinancialGoal): number {
    const now = new Date()
    const targetDate = new Date(goal.target_date)
    const diffTime = targetDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  /**
   * Calculer le montant à épargner par mois
   */
  calculateMonthlyTarget(goal: FinancialGoal): number {
    const remaining = this.calculateRemaining(goal)
    const daysRemaining = this.calculateDaysRemaining(goal)

    if (daysRemaining <= 0) return 0

    const monthsRemaining = Math.max(1, daysRemaining / 30)
    return Math.ceil(remaining / monthsRemaining)
  },

  /**
   * Calculer si l'objectif est sur la bonne voie
   */
  isOnTrack(goal: FinancialGoal): boolean {
    const now = new Date()
    const startDate = new Date(goal.created_at)
    const targetDate = new Date(goal.target_date)

    const totalDuration = targetDate.getTime() - startDate.getTime()
    const elapsedDuration = now.getTime() - startDate.getTime()

    const expectedProgress = (elapsedDuration / totalDuration) * 100
    const actualProgress = this.calculateProgress(goal)

    return actualProgress >= expectedProgress * 0.9 // 90% de tolérance
  },

  /**
   * Vérifier si un objectif est proche de l'échéance
   */
  isUpcoming(goal: FinancialGoal, days: number = 30): boolean {
    const daysRemaining = this.calculateDaysRemaining(goal)
    return daysRemaining > 0 && daysRemaining <= days
  },

  /**
   * Vérifier si un objectif est en retard
   */
  isOverdue(goal: FinancialGoal): boolean {
    return this.calculateDaysRemaining(goal) < 0 && goal.status === 'active'
  },

  /**
   * Estimer la date de finalisation à ce rythme
   */
  estimateCompletionDate(goal: FinancialGoal, monthlyContribution: number): Date | null {
    const remaining = this.calculateRemaining(goal)
    if (remaining <= 0 || monthlyContribution <= 0) return null

    const monthsNeeded = Math.ceil(remaining / monthlyContribution)
    const completionDate = new Date()
    completionDate.setMonth(completionDate.getMonth() + monthsNeeded)

    return completionDate
  },

  // ==========================================
  // FORMATAGE
  // ==========================================

  /**
   * Formater un montant avec devise
   */
  formatAmount(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  },

  /**
   * Formater une date
   */
  formatDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date))
  },

  /**
   * Formater le temps restant
   */
  formatTimeRemaining(goal: FinancialGoal): string {
    const days = this.calculateDaysRemaining(goal)

    if (days < 0) return 'Échéance dépassée'
    if (days === 0) return 'Aujourd\'hui'
    if (days === 1) return 'Demain'
    if (days < 30) return `${days} jours`
    if (days < 365) return `${Math.round(days / 30)} mois`
    return `${Math.round(days / 365)} ans`
  },

  /**
   * Obtenir la couleur selon le statut
   */
  getStatusColor(status: string): string {
    const colors = {
      'active': 'text-green-600',
      'completed': 'text-blue-600',
      'paused': 'text-yellow-600',
      'archived': 'text-gray-600'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600'
  },

  /**
   * Obtenir l'icône selon le statut
   */
  getStatusIcon(status: string): string {
    const icons = {
      'active': '🎯',
      'completed': '✅',
      'paused': '⏸️',
      'archived': '📦'
    }
    return icons[status as keyof typeof icons] || '📋'
  },

  /**
   * Obtenir les catégories disponibles
   */
  getAvailableCategories(): typeof GOAL_CATEGORIES {
    return GOAL_CATEGORIES
  },

  /**
   * Obtenir les détails d'une catégorie
   */
  getCategoryDetails(categoryId: string): typeof GOAL_CATEGORIES[0] | null {
    return GOAL_CATEGORIES.find(cat => cat.id === categoryId) || null
  },

  // ==========================================
  // UTILITAIRES PRIVÉES
  // ==========================================

  /**
   * Vérifier si une date est valide
   */
  isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  },

  /**
   * Obtenir la date actuelle au format ISO
   */
  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0]
  }
}

export default goalService
