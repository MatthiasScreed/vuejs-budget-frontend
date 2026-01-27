import type { Transaction, User, Achievement, FinancialGoal } from '@/types'

// ==========================================
// TYPES
// ==========================================

export interface GameAction {
  id: string
  type: string
  timestamp: Date
  data?: any
  xpAwarded?: number
  userId: number
}

export interface UserPattern {
  mostActiveHour: number
  mostActiveDay: string
  averageTransactionsPerDay: number
  favoriteCategoryId: string | null
  engagementScore: number
}

export interface GameSuggestion {
  id: string
  type: 'habit' | 'engagement' | 'optimization' | 'achievement'
  title: string
  description: string
  action?: string
  priority: 'low' | 'medium' | 'high'
  xpReward: number
}

export interface LevelPrediction {
  currentLevel: number
  currentXP: number
  xpNeeded: number
  estimatedDays: number
  recommendedActions: string[]
  confidence: 'low' | 'medium' | 'high'
}

// ==========================================
// GAME ANALYTICS SERVICE
// ==========================================

/**
 * Service d'analytics gaming (sans state statique)
 * Toutes les méthodes sont pures et testables
 */
export class GameAnalytics {
  /**
   * Analyser les patterns d'utilisation d'un utilisateur
   */
  static analyzeUserPatterns(
    actions: GameAction[],
    timeframeDays: number = 30
  ): UserPattern {
    if (!Array.isArray(actions) || actions.length === 0) {
      return {
        mostActiveHour: 9,
        mostActiveDay: 'Lundi',
        averageTransactionsPerDay: 0,
        favoriteCategoryId: null,
        engagementScore: 0
      }
    }

    // Filtrer les actions récentes
    const cutoff = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000)
    const recentActions = actions.filter(a => a.timestamp >= cutoff)

    if (recentActions.length === 0) {
      return this.analyzeUserPatterns(actions.slice(-50), timeframeDays * 2) // Fallback
    }

    // Analyser l'heure la plus active
    const hourCounts = new Map<number, number>()
    recentActions.forEach(action => {
      const hour = action.timestamp.getHours()
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    })

    const mostActiveHour = Array.from(hourCounts.entries())
      .reduce((a, b) => a[1] > b[1] ? a : b, [9, 0])[0]

    // Analyser le jour le plus actif
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const dayCounts = new Map<number, number>()

    recentActions.forEach(action => {
      const day = action.timestamp.getDay()
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
    })

    const mostActiveDayIndex = Array.from(dayCounts.entries())
      .reduce((a, b) => a[1] > b[1] ? a : b, [1, 0])[0]
    const mostActiveDay = dayNames[mostActiveDayIndex]

    // Calculer moyenne transactions/jour
    const transactionActions = recentActions.filter(a => a.type === 'transaction')
    const uniqueDays = new Set(
      recentActions.map(a => a.timestamp.toDateString())
    ).size

    const averageTransactionsPerDay = uniqueDays > 0 ?
      Math.round((transactionActions.length / uniqueDays) * 10) / 10 : 0

    // Trouver catégorie favorite
    const categoryCounts = new Map<string, number>()
    recentActions.forEach(action => {
      if (action.data?.category_id) {
        const catId = action.data.category_id
        categoryCounts.set(catId, (categoryCounts.get(catId) || 0) + 1)
      }
    })

    const favoriteCategoryId = Array.from(categoryCounts.entries())
      .reduce((a, b) => a[1] > b[1] ? a : b, [null, 0])[0]

    // Calculer score d'engagement (0-100)
    const engagementFactors = [
      Math.min(averageTransactionsPerDay * 20, 40), // Max 40 pts pour fréquence
      Math.min(recentActions.length * 2, 30),       // Max 30 pts pour volume
      uniqueDays > 7 ? 30 : uniqueDays * 4          // Max 30 pts pour régularité
    ]

    const engagementScore = Math.round(engagementFactors.reduce((sum, factor) => sum + factor, 0))

    return {
      mostActiveHour,
      mostActiveDay,
      averageTransactionsPerDay,
      favoriteCategoryId,
      engagementScore: Math.min(engagementScore, 100)
    }
  }

  /**
   * Générer suggestions personnalisées basées sur les patterns
   */
  static generatePersonalizedSuggestions(
    patterns: UserPattern,
    userLevel: number = 1,
    achievements: Achievement[] = []
  ): GameSuggestion[] {
    const suggestions: GameSuggestion[] = []

    // Suggestions basées sur l'heure d'activité
    if (patterns.mostActiveHour < 9) {
      suggestions.push({
        id: 'morning_optimizer',
        type: 'habit',
        title: 'Lève-tôt productif',
        description: `Tu es actif tôt le matin (${patterns.mostActiveHour}h). Configure des rappels matinaux pour optimiser cette période !`,
        action: 'setup_morning_routine',
        priority: 'medium',
        xpReward: 25
      })
    } else if (patterns.mostActiveHour > 20) {
      suggestions.push({
        id: 'night_owl',
        type: 'habit',
        title: 'Oiseau de nuit',
        description: 'Tu gères tes finances tard le soir. Attention à ne pas prendre de décisions impulsives !',
        action: 'evening_review_checklist',
        priority: 'low',
        xpReward: 15
      })
    }

    // Suggestions basées sur la fréquence
    if (patterns.averageTransactionsPerDay < 0.5) {
      suggestions.push({
        id: 'daily_tracker',
        type: 'engagement',
        title: 'Boost ton engagement',
        description: 'Enregistre au moins une transaction par jour pour maintenir tes streaks et débloquer des achievements !',
        action: 'setup_daily_reminder',
        priority: 'high',
        xpReward: 50
      })
    } else if (patterns.averageTransactionsPerDay > 5) {
      suggestions.push({
        id: 'transaction_master',
        type: 'optimization',
        title: 'Maître des transactions',
        description: 'Tu es très actif ! Pense à utiliser les transactions récurrentes pour gagner du temps.',
        action: 'setup_recurring_transactions',
        priority: 'medium',
        xpReward: 30
      })
    }

    // Suggestions basées sur le niveau
    if (userLevel >= 10 && !achievements.some(a => a.category === 'expert')) {
      suggestions.push({
        id: 'expert_challenge',
        type: 'achievement',
        title: 'Défis expert disponibles',
        description: 'Ton niveau te permet d\'accéder aux défis experts. Prêt pour le challenge ?',
        action: 'unlock_expert_challenges',
        priority: 'high',
        xpReward: 100
      })
    }

    // Suggestions basées sur la catégorie favorite
    if (patterns.favoriteCategoryId && patterns.engagementScore > 60) {
      suggestions.push({
        id: 'category_optimizer',
        type: 'optimization',
        title: 'Optimise ta catégorie favorite',
        description: 'Tu utilises beaucoup cette catégorie. Crée des sous-catégories pour un suivi plus précis !',
        action: `optimize_category_${patterns.favoriteCategoryId}`,
        priority: 'medium',
        xpReward: 35
      })
    }

    // Suggestions basées sur le score d'engagement
    if (patterns.engagementScore < 30) {
      suggestions.push({
        id: 'engagement_booster',
        type: 'engagement',
        title: 'Réactive ton compte',
        description: 'Rejoins un défi ou fixe-toi un petit objectif pour rebooster ta motivation !',
        action: 'suggest_easy_challenge',
        priority: 'high',
        xpReward: 40
      })
    }

    return suggestions.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      return priorityWeight[b.priority] - priorityWeight[a.priority]
    })
  }

  /**
   * Prédire le prochain level up
   */
  static predictNextLevelUp(
    actions: GameAction[],
    currentLevel: number,
    currentXP: number,
    xpNeededForNextLevel: number
  ): LevelPrediction {
    if (!Array.isArray(actions)) {
      return {
        currentLevel,
        currentXP,
        xpNeeded: xpNeededForNextLevel,
        estimatedDays: 30,
        recommendedActions: ['Commencez à enregistrer vos activités'],
        confidence: 'low'
      }
    }

    // Analyser les gains XP récents (30 derniers jours)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentXPActions = actions.filter(a =>
      a.timestamp >= thirtyDaysAgo &&
      a.xpAwarded &&
      a.xpAwarded > 0
    )

    if (recentXPActions.length === 0) {
      return {
        currentLevel,
        currentXP,
        xpNeeded: xpNeededForNextLevel,
        estimatedDays: 60,
        recommendedActions: [
          'Ajoutez des transactions quotidiennes',
          'Participez aux défis communautaires',
          'Fixez-vous des objectifs d\'épargne'
        ],
        confidence: 'low'
      }
    }

    // Calculer la vélocité XP
    const totalXPEarned = recentXPActions.reduce((sum, a) => sum + (a.xpAwarded || 0), 0)
    const daysWithActivity = new Set(
      recentXPActions.map(a => a.timestamp.toDateString())
    ).size

    const averageXPPerDay = daysWithActivity > 0 ? totalXPEarned / daysWithActivity : 0
    const estimatedDays = averageXPPerDay > 0 ? Math.ceil(xpNeededForNextLevel / averageXPPerDay) : 90

    // Déterminer confiance basée sur consistance
    let confidence: 'low' | 'medium' | 'high' = 'low'

    if (daysWithActivity >= 20 && averageXPPerDay > 10) {
      confidence = 'high'
    } else if (daysWithActivity >= 10 && averageXPPerDay > 5) {
      confidence = 'medium'
    }

    // Générer recommandations
    const recommendedActions: string[] = []

    if (estimatedDays > 30) {
      recommendedActions.push('Augmentez votre fréquence d\'activité')
    }

    if (averageXPPerDay < 20) {
      recommendedActions.push('Participez à plus de défis pour gagner plus d\'XP')
    }

    if (daysWithActivity < 15) {
      recommendedActions.push('Soyez plus régulier dans vos activités')
    }

    // Recommandations spécifiques par type d'action
    const actionTypes = new Map<string, number>()
    recentXPActions.forEach(a => {
      actionTypes.set(a.type, (actionTypes.get(a.type) || 0) + 1)
    })

    if (!actionTypes.has('transaction') || actionTypes.get('transaction')! < 10) {
      recommendedActions.push('Enregistrez plus de transactions quotidiennes')
    }

    if (!actionTypes.has('goal_progress') || actionTypes.get('goal_progress')! < 3) {
      recommendedActions.push('Progressez sur vos objectifs d\'épargne')
    }

    return {
      currentLevel,
      currentXP,
      xpNeeded: xpNeededForNextLevel,
      estimatedDays: Math.max(1, estimatedDays),
      recommendedActions: recommendedActions.slice(0, 4), // Max 4 conseils
      confidence
    }
  }

  /**
   * Calculer le score d'engagement d'un utilisateur
   */
  static calculateEngagementScore(
    actions: GameAction[],
    user: User,
    timeframeDays: number = 30
  ): {
    score: number
    factors: Record<string, number>
    level: 'low' | 'medium' | 'high'
    recommendations: string[]
  } {
    if (!Array.isArray(actions)) {
      return {
        score: 0,
        factors: {},
        level: 'low',
        recommendations: ['Commencez à utiliser l\'application régulièrement']
      }
    }

    const cutoff = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000)
    const recentActions = actions.filter(a => a.timestamp >= cutoff)

    // Facteurs d'engagement (max 100 points)
    const factors = {
      frequency: Math.min(recentActions.length * 2, 25),      // Fréquence d'usage
      consistency: this.calculateConsistencyScore(recentActions), // Régularité
      diversity: this.calculateDiversityScore(recentActions),     // Variété d'actions
      achievement: Math.min(user.level || 1 * 5, 25)             // Progression niveau
    }

    const score = Math.round(Object.values(factors).reduce((sum, factor) => sum + factor, 0))

    let level: 'low' | 'medium' | 'high' = 'low'
    if (score >= 70) level = 'high'
    else if (score >= 40) level = 'medium'

    const recommendations: string[] = []

    if (factors.frequency < 15) {
      recommendations.push('Utilisez l\'app plus régulièrement')
    }
    if (factors.consistency < 15) {
      recommendations.push('Maintenez une routine quotidienne')
    }
    if (factors.diversity < 15) {
      recommendations.push('Explorez différentes fonctionnalités')
    }

    return { score, factors, level, recommendations }
  }

  /**
   * Score de consistance (régularité d'usage)
   */
  private static calculateConsistencyScore(actions: GameAction[]): number {
    if (actions.length === 0) return 0

    const uniqueDays = new Set(
      actions.map(a => a.timestamp.toDateString())
    ).size

    const totalDays = Math.max(1, Math.ceil(
      (Date.now() - actions[0].timestamp.getTime()) / (1000 * 60 * 60 * 24)
    ))

    const consistencyRatio = uniqueDays / Math.min(totalDays, 30)
    return Math.min(Math.round(consistencyRatio * 25), 25)
  }

  /**
   * Score de diversité (variété d'actions)
   */
  private static calculateDiversityScore(actions: GameAction[]): number {
    const actionTypes = new Set(actions.map(a => a.type))
    const maxTypes = 8 // achievement, transaction, goal, challenge, etc.

    return Math.min(Math.round((actionTypes.size / maxTypes) * 25), 25)
  }

  /**
   * Analyser la performance financière pour le gaming
   */
  static analyzeFinancialPerformance(
    transactions: Transaction[],
    goals: FinancialGoal[]
  ): {
    savingsRate: number
    budgetControl: number
    goalProgress: number
    financialHealth: 'poor' | 'fair' | 'good' | 'excellent'
    insights: string[]
  } {
    if (!Array.isArray(transactions)) {
      return {
        savingsRate: 0,
        budgetControl: 0,
        goalProgress: 0,
        financialHealth: 'poor',
        insights: ['Aucune donnée disponible']
      }
    }

    // Calculer le taux d'épargne (derniers 3 mois)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const recentTransactions = transactions.filter(t =>
      new Date(t.transaction_date) >= threeMonthsAgo
    )

    const totalIncome = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0

    // Calculer contrôle du budget (variance des dépenses)
    const monthlyExpenses = new Map<string, number>()
    recentTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const month = t.transaction_date.substring(0, 7)
        monthlyExpenses.set(month, (monthlyExpenses.get(month) || 0) + t.amount)
      })

    const expensesArray = Array.from(monthlyExpenses.values())
    const avgExpenses = expensesArray.reduce((sum, e) => sum + e, 0) / Math.max(expensesArray.length, 1)

    const variance = expensesArray.reduce((sum, e) => sum + Math.pow(e - avgExpenses, 2), 0) / Math.max(expensesArray.length, 1)
    const standardDeviation = Math.sqrt(variance)
    const budgetControl = avgExpenses > 0 ? Math.max(0, 100 - Math.round((standardDeviation / avgExpenses) * 100)) : 0

    // Calculer progression des objectifs
    const activeGoals = goals?.filter(g => g.status === 'active') || []
    const goalProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => {
        const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0
        return sum + Math.min(progress, 100)
      }, 0) / activeGoals.length)
      : 0

    // Déterminer santé financière
    let financialHealth: 'poor' | 'fair' | 'good' | 'excellent' = 'poor'
    const healthScore = (savingsRate * 0.4) + (budgetControl * 0.3) + (goalProgress * 0.3)

    if (healthScore >= 80) financialHealth = 'excellent'
    else if (healthScore >= 60) financialHealth = 'good'
    else if (healthScore >= 40) financialHealth = 'fair'

    // Générer insights
    const insights: string[] = []

    if (savingsRate < 10) {
      insights.push('Taux d\'épargne faible - essayez de réduire quelques dépenses')
    } else if (savingsRate > 30) {
      insights.push('Excellent taux d\'épargne ! Vous maîtrisez vos finances')
    }

    if (budgetControl < 50) {
      insights.push('Vos dépenses varient beaucoup - planifiez un budget mensuel')
    }

    if (goalProgress < 25 && activeGoals.length > 0) {
      insights.push('Progression lente sur vos objectifs - augmentez vos contributions')
    }

    if (totalIncome === 0) {
      insights.push('Ajoutez vos sources de revenus pour une analyse complète')
    }

    return {
      savingsRate: Math.max(0, savingsRate),
      budgetControl: Math.max(0, budgetControl),
      goalProgress: Math.max(0, goalProgress),
      financialHealth,
      insights: insights.length > 0 ? insights : ['Continuez à enregistrer vos transactions !']
    }
  }

  /**
   * Calculer le potentiel XP d'actions futures
   */
  static calculateActionPotentialXP(actionType: string, level: number = 1): number {
    const baseXP: Record<string, number> = {
      'transaction': 5,
      'goal_progress': 15,
      'challenge_complete': 50,
      'streak_maintain': 10,
      'achievement_unlock': 25,
      'level_up': 100
    }

    const base = baseXP[actionType] || 5
    const levelMultiplier = 1 + (level * 0.1) // +10% par niveau

    return Math.round(base * levelMultiplier)
  }

  /**
   * Recommander des objectifs SMART basés sur les habitudes
   */
  static recommendSmartGoals(
    transactions: Transaction[],
    currentGoals: FinancialGoal[],
    userLevel: number = 1
  ): Array<{
    type: 'savings' | 'expense_reduction' | 'income_boost'
    title: string
    description: string
    suggestedAmount: number
    timeframe: string
    difficulty: 'easy' | 'medium' | 'hard'
  }> {
    if (!Array.isArray(transactions)) return []

    const recentStats = this.calculateRecentFinancialStats(transactions, 90) // 3 mois
    const recommendations = []

    // Objectif d'épargne basé sur les revenus
    if (recentStats.monthlyIncome > 0) {
      const suggestedSavingsRate = Math.min(20, 5 + userLevel) // 5-20% selon niveau
      const monthlyTarget = Math.round(recentStats.monthlyIncome * (suggestedSavingsRate / 100))

      recommendations.push({
        type: 'savings' as const,
        title: `Épargner ${suggestedSavingsRate}% de vos revenus`,
        description: `Basé sur vos revenus moyens, épargnez ${monthlyTarget}€ par mois`,
        suggestedAmount: monthlyTarget * 6, // Objectif 6 mois
        timeframe: '6 mois',
        difficulty: suggestedSavingsRate > 15 ? 'hard' : suggestedSavingsRate > 10 ? 'medium' : 'easy'
      })
    }

    // Objectif de réduction de dépenses
    if (recentStats.monthlyExpenses > 1000) {
      const reductionPercentage = 5 + Math.floor(userLevel / 5) // 5-10%
      const monthlyReduction = Math.round(recentStats.monthlyExpenses * (reductionPercentage / 100))

      recommendations.push({
        type: 'expense_reduction' as const,
        title: `Réduire les dépenses de ${reductionPercentage}%`,
        description: `Économisez ${monthlyReduction}€/mois en optimisant vos achats`,
        suggestedAmount: monthlyReduction * 12, // Économie sur 1 an
        timeframe: '3 mois',
        difficulty: reductionPercentage > 8 ? 'hard' : 'medium'
      })
    }

    // Objectif revenus complémentaires
    if (userLevel >= 5 && recentStats.monthlyIncome < 5000) {
      recommendations.push({
        type: 'income_boost' as const,
        title: 'Développer un revenu complémentaire',
        description: 'Créez une source de revenus additionnelle',
        suggestedAmount: Math.round(recentStats.monthlyIncome * 0.2), // +20% de revenus
        timeframe: '6 mois',
        difficulty: 'medium'
      })
    }

    return recommendations
  }

  /**
   * Calculer statistiques financières récentes
   */
  private static calculateRecentFinancialStats(transactions: Transaction[], days: number) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const recent = transactions.filter(t => new Date(t.transaction_date) >= cutoff)

    const monthlyIncome = recent
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(days / 30, 1)

    const monthlyExpenses = recent
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(days / 30, 1)

    return {
      monthlyIncome: Math.round(monthlyIncome),
      monthlyExpenses: Math.round(monthlyExpenses),
      savingsRate: monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0
    }
  }
}

// ==========================================
// HELPER FUNCTIONS - Fonctions utilitaires
// ==========================================

/**
 * Créer un identifiant unique pour actions
 */
export function createActionId(type: string, userId: number): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${type}_${userId}_${timestamp}_${random}`
}

/**
 * Valider une action de jeu
 */
export function validateGameAction(action: Partial<GameAction>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!action.type) errors.push('Type d\'action requis')
  if (!action.userId || action.userId <= 0) errors.push('ID utilisateur invalide')
  if (!action.timestamp || isNaN(action.timestamp.getTime())) errors.push('Timestamp invalide')

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Calculer le multiplicateur d'XP basé sur différents facteurs
 */
export function calculateXPMultiplier(
  userLevel: number,
  streakDays: number,
  achievementCount: number
): number {
  let multiplier = 1.0

  // Bonus de niveau (max +50%)
  multiplier += Math.min(userLevel * 0.02, 0.5)

  // Bonus de streak (max +30%)
  multiplier += Math.min(streakDays * 0.01, 0.3)

  // Bonus d'achievements (max +20%)
  multiplier += Math.min(achievementCount * 0.005, 0.2)

  return Math.round(multiplier * 100) / 100
}

/**
 * Générer des défis dynamiques basés sur l'activité utilisateur
 */
export function generateDynamicChallenges(
  patterns: UserPattern,
  currentGoals: FinancialGoal[]
): Array<{
  id: string
  name: string
  description: string
  target: number
  duration: number
  xpReward: number
  difficulty: 'easy' | 'medium' | 'hard'
}> {
  const challenges = []

  // Défi basé sur fréquence actuelle
  if (patterns.averageTransactionsPerDay > 0) {
    const currentDaily = patterns.averageTransactionsPerDay
    const target = Math.ceil(currentDaily * 1.5) // +50% d'amélioration

    challenges.push({
      id: 'boost_frequency',
      name: 'Boost de fréquence',
      description: `Enregistrez ${target} transactions par jour pendant une semaine`,
      target: target * 7,
      duration: 7,
      xpReward: target * 10,
      difficulty: target > 5 ? 'hard' : target > 2 ? 'medium' : 'easy'
    })
  }

  // Défi d'épargne si pas d'objectifs actifs
  if (!currentGoals.some(g => g.status === 'active')) {
    challenges.push({
      id: 'emergency_savings',
      name: 'Démarrage épargne',
      description: 'Créez votre premier objectif d\'épargne et contribuez 3 fois',
      target: 3,
      duration: 30,
      xpReward: 75,
      difficulty: 'easy'
    })
  }

  // Défi catégorie si usage monotone
  if (patterns.favoriteCategoryId && patterns.engagementScore > 50) {
    challenges.push({
      id: 'category_explorer',
      name: 'Explorateur de catégories',
      description: 'Utilisez 5 catégories différentes cette semaine',
      target: 5,
      duration: 7,
      xpReward: 40,
      difficulty: 'medium'
    })
  }

  return challenges
}
