import type { Achievement, UserLevel, Challenge, Streak } from '@/types'

/**
 * Utilitaires spécialisés pour le système de gamification
 * Calculs XP, niveaux, achievements, streaks
 */

// ==========================================
// CALCULS DE NIVEAUX ET XP
// ==========================================

export interface LevelCalculation {
  level: number
  currentLevelXP: number
  nextLevelXP: number
  totalXP: number
  progressPercentage: number
}

/**
 * Calculer l'XP nécessaire pour un niveau donné
 */
export function calculateXPForLevel(level: number, config: {
  baseXP?: number
  multiplier?: number
  maxLevel?: number
} = {}): number {
  const { baseXP = 100, multiplier = 1.5, maxLevel = 100 } = config

  if (level < 1 || level > maxLevel) {
    throw new Error(`Niveau doit être entre 1 et ${maxLevel}`)
  }

  return Math.floor(baseXP * Math.pow(level, multiplier))
}

/**
 * Calculer l'XP total nécessaire pour atteindre un niveau
 */
export function calculateTotalXPForLevel(level: number, config?: {
  baseXP?: number
  multiplier?: number
}): number {
  let totalXP = 0

  for (let i = 1; i < level; i++) {
    totalXP += calculateXPForLevel(i, config)
  }

  return totalXP
}

/**
 * Déterminer le niveau à partir de l'XP total
 */
export function getLevelFromTotalXP(
  totalXP: number,
  config?: { baseXP?: number; multiplier?: number; maxLevel?: number }
): LevelCalculation {
  const { maxLevel = 100 } = config || {}

  let level = 1
  let xpUsed = 0

  while (level < maxLevel) {
    const xpForNextLevel = calculateXPForLevel(level + 1, config)

    if (xpUsed + xpForNextLevel > totalXP) {
      break
    }

    xpUsed += xpForNextLevel
    level++
  }

  const currentLevelXP = totalXP - xpUsed
  const nextLevelXP = level < maxLevel ? calculateXPForLevel(level + 1, config) : 0
  const progressPercentage = nextLevelXP > 0 ? Math.round((currentLevelXP / nextLevelXP) * 100) : 100

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    totalXP,
    progressPercentage
  }
}

/**
 * Calculer l'XP avec multiplicateurs
 */
export function calculateXPWithMultipliers(
  baseXP: number,
  multipliers: {
    levelBonus?: number
    streakBonus?: number
    eventMultiplier?: number
    achievementBonus?: number
  } = {}
): {
  baseXP: number
  bonusXP: number
  totalXP: number
  appliedMultipliers: string[]
} {
  const {
    levelBonus = 0,
    streakBonus = 0,
    eventMultiplier = 1,
    achievementBonus = 0
  } = multipliers

  const appliedMultipliers: string[] = []
  let totalMultiplier = 1

  if (levelBonus > 0) {
    totalMultiplier += levelBonus
    appliedMultipliers.push(`Niveau: +${Math.round(levelBonus * 100)}%`)
  }

  if (streakBonus > 0) {
    totalMultiplier += streakBonus
    appliedMultipliers.push(`Streak: +${Math.round(streakBonus * 100)}%`)
  }

  if (eventMultiplier > 1) {
    totalMultiplier *= eventMultiplier
    appliedMultipliers.push(`Événement: x${eventMultiplier}`)
  }

  const bonusXP = Math.round((baseXP * totalMultiplier) - baseXP + achievementBonus)
  const totalXP = baseXP + bonusXP

  return {
    baseXP,
    bonusXP,
    totalXP: Math.round(totalXP),
    appliedMultipliers
  }
}

// ==========================================
// CALCULS D'ACHIEVEMENTS
// ==========================================

export interface AchievementEvaluation {
  achievementId: string
  currentProgress: number
  targetValue: number
  progressPercentage: number
  isUnlocked: boolean
  estimatedCompletion?: {
    days: number
    confidence: 'low' | 'medium' | 'high'
  }
}

/**
 * Évaluer la progression d'un achievement
 */
export function evaluateAchievementProgress(
  achievement: Achievement,
  userActions: Array<{ type: string; value: number; date: string }>,
  currentStats: Record<string, number>
): AchievementEvaluation {
  let currentProgress = 0
  let estimatedCompletion: { days: number; confidence: 'low' | 'medium' | 'high' } | undefined

  switch (achievement.condition_type) {
    case 'transaction_count':
      currentProgress = currentStats.transaction_count || 0
      break

    case 'total_income':
      currentProgress = currentStats.total_income || 0
      break

    case 'total_expenses':
      currentProgress = currentStats.total_expenses || 0
      break

    case 'balance_positive':
      currentProgress = (currentStats.balance || 0) > 0 ? 1 : 0
      break

    case 'categories_used':
      currentProgress = currentStats.categories_used || 0
      break

    case 'days_active':
      // Calculer les jours uniques avec activité
      const uniqueDays = new Set(
        userActions.map(action => action.date.split('T')[0])
      ).size
      currentProgress = uniqueDays
      break

    case 'streak_days':
      currentProgress = currentStats.current_streak || 0
      break

    default:
      currentProgress = 0
  }

  const targetValue = achievement.condition_value
  const progressPercentage = targetValue > 0 ? Math.min(Math.round((currentProgress / targetValue) * 100), 100) : 0
  const isUnlocked = currentProgress >= targetValue

  // Estimer temps de completion si pas encore débloqué
  if (!isUnlocked && userActions.length > 0) {
    const recentActions = userActions.filter(action => {
      const actionDate = new Date(action.date)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return actionDate >= thirtyDaysAgo
    })

    if (recentActions.length >= 5) {
      const dailyRate = recentActions.length / 30
      const remaining = targetValue - currentProgress
      const estimatedDays = Math.ceil(remaining / Math.max(dailyRate, 0.1))

      let confidence: 'low' | 'medium' | 'high' = 'low'
      if (recentActions.length >= 20) confidence = 'high'
      else if (recentActions.length >= 10) confidence = 'medium'

      estimatedCompletion = { days: Math.min(estimatedDays, 365), confidence }
    }
  }

  return {
    achievementId: achievement.id,
    currentProgress,
    targetValue,
    progressPercentage,
    isUnlocked,
    estimatedCompletion
  }
}

/**
 * Calculer le score de rareté d'un achievement
 */
export function calculateAchievementRarityScore(
  achievement: Achievement,
  totalUsers: number,
  usersWithAchievement: number
): {
  rarityScore: number
  rarityLevel: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  percentageOfUsers: number
} {
  const percentageOfUsers = totalUsers > 0 ? (usersWithAchievement / totalUsers) * 100 : 0

  let rarityLevel: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' = 'common'
  let rarityScore = 100 - percentageOfUsers

  if (percentageOfUsers > 50) rarityLevel = 'common'
  else if (percentageOfUsers > 25) rarityLevel = 'uncommon'
  else if (percentageOfUsers > 10) rarityLevel = 'rare'
  else if (percentageOfUsers > 5) rarityLevel = 'epic'
  else rarityLevel = 'legendary'

  return {
    rarityScore: Math.round(rarityScore),
    rarityLevel,
    percentageOfUsers: Math.round(percentageOfUsers * 10) / 10
  }
}

// ==========================================
// CALCULS DE STREAKS
// ==========================================

export interface StreakAnalysis {
  streakId: string
  currentDays: number
  bestDays: number
  isActive: boolean
  timeUntilExpiry: {
    hours: number
    minutes: number
    expired: boolean
  }
  multiplierBonus: number
  projectedXP: number
  riskLevel: 'low' | 'medium' | 'high'
}

/**
 * Analyser un streak en détail
 */
export function analyzeStreak(
  streak: Streak,
  lastActivityDate: string
): StreakAnalysis {
  const now = new Date()
  const expiryDate = new Date(streak.expires_at)
  const lastActivity = new Date(lastActivityDate)

  const timeDiff = expiryDate.getTime() - now.getTime()
  const expired = timeDiff <= 0

  const hours = expired ? 0 : Math.floor(timeDiff / (1000 * 60 * 60))
  const minutes = expired ? 0 : Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

  // Calculer le multiplicateur bonus (augmente avec la longueur du streak)
  const multiplierBonus = 1 + (streak.current_count * 0.05) // +5% par jour

  // Calculer l'XP projeté pour le prochain jour
  const projectedXP = Math.round(streak.xp_bonus * multiplierBonus)

  // Évaluer le risque de perte du streak
  let riskLevel: 'low' | 'medium' | 'high' = 'low'

  if (expired) {
    riskLevel = 'high'
  } else if (hours <= 6) {
    riskLevel = 'high'
  } else if (hours <= 12) {
    riskLevel = 'medium'
  }

  return {
    streakId: streak.id,
    currentDays: streak.current_count,
    bestDays: streak.best_count,
    isActive: streak.status === 'active' && !expired,
    timeUntilExpiry: { hours, minutes, expired },
    multiplierBonus,
    projectedXP,
    riskLevel
  }
}

/**
 * Calculer les bonus de streak pour différents milestones
 */
export function calculateStreakMilestones(currentDays: number): Array<{
  milestone: number
  reached: boolean
  bonusXP: number
  title: string
  emoji: string
}> {
  const milestones = [
    { days: 3, bonusXP: 25, title: 'Premier élan', emoji: '🌟' },
    { days: 7, bonusXP: 50, title: 'Une semaine solide', emoji: '⚡' },
    { days: 14, bonusXP: 100, title: 'Deux semaines', emoji: '🔥' },
    { days: 30, bonusXP: 200, title: 'Un mois complet', emoji: '💪' },
    { days: 50, bonusXP: 350, title: 'Cinquante jours', emoji: '🏆' },
    { days: 100, bonusXP: 500, title: 'Centenaire', emoji: '👑' },
    { days: 365, bonusXP: 1000, title: 'Année complète', emoji: '🎉' }
  ]

  return milestones.map(milestone => ({
    milestone: milestone.days,
    reached: currentDays >= milestone.days,
    bonusXP: milestone.bonusXP,
    title: milestone.title,
    emoji: milestone.emoji
  }))
}

// ==========================================
// CALCULS DE DÉFIS
// ==========================================

export interface ChallengeEvaluation {
  challengeId: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedDifficulty: number // 0-100
  recommendedForUser: boolean
  timeRemaining: {
    days: number
    hours: number
    urgent: boolean
  }
  projectedRank: number
  competitionLevel: 'low' | 'medium' | 'high'
}

/**
 * Évaluer un défi pour un utilisateur
 */
export function evaluateChallengeForUser(
  challenge: Challenge,
  userLevel: number,
  userStats: Record<string, number>,
  participantCount: number = 0
): ChallengeEvaluation {
  // Calculer difficulté estimée basée sur les stats utilisateur
  let estimatedDifficulty = 50 // Base 50/100

  switch (challenge.condition_type) {
    case 'transaction_count':
      const userAvgTransactions = userStats.daily_transactions || 1
      const dailyRequired = challenge.target_value / getDaysInChallenge(challenge)
      estimatedDifficulty = Math.min(100, (dailyRequired / userAvgTransactions) * 50)
      break

    case 'savings_amount':
      const userAvgSavings = userStats.monthly_savings || 100
      const monthlyRequired = challenge.target_value / (getDaysInChallenge(challenge) / 30)
      estimatedDifficulty = Math.min(100, (monthlyRequired / userAvgSavings) * 50)
      break

    default:
      // Utiliser la difficulté native du défi
      estimatedDifficulty = challenge.difficulty === 'easy' ? 25 :
        challenge.difficulty === 'medium' ? 50 : 75
  }

  // Ajuster selon le niveau utilisateur
  const levelAdjustment = Math.max(-20, Math.min(20, (userLevel - 10) * 2))
  estimatedDifficulty = Math.max(0, Math.min(100, estimatedDifficulty + levelAdjustment))

  // Recommandation
  const recommendedForUser = estimatedDifficulty >= 20 && estimatedDifficulty <= 80

  // Calculer temps restant
  const now = new Date()
  const endDate = new Date(challenge.end_date)
  const timeRemainingMs = endDate.getTime() - now.getTime()

  const days = Math.max(0, Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24)))
  const hours = Math.max(0, Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
  const urgent = days === 0 && hours <= 12

  // Estimer rang probable (basé sur participation et stats)
  const competitionLevel = participantCount > 100 ? 'high' :
    participantCount > 25 ? 'medium' : 'low'

  let projectedRank = Math.round(participantCount * 0.5) // Milieu par défaut

  if (estimatedDifficulty < 30) projectedRank = Math.round(participantCount * 0.2) // Top 20%
  else if (estimatedDifficulty > 70) projectedRank = Math.round(participantCount * 0.8) // Bottom 20%

  return {
    challengeId: challenge.id,
    difficulty: challenge.difficulty,
    estimatedDifficulty: Math.round(estimatedDifficulty),
    recommendedForUser,
    timeRemaining: { days, hours, urgent },
    projectedRank: Math.max(1, projectedRank),
    competitionLevel
  }
}

/**
 * Calculer les jours dans un défi
 */
function getDaysInChallenge(challenge: Challenge): number {
  const start = new Date(challenge.start_date)
  const end = new Date(challenge.end_date)
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
}

// ==========================================
// SYSTÈME DE RÉCOMPENSES
// ==========================================

export interface RewardCalculation {
  baseReward: number
  bonusReward: number
  totalReward: number
  bonusSources: Array<{
    source: string
    multiplier: number
    description: string
  }>
}

/**
 * Calculer les récompenses avec bonus
 */
export function calculateRewards(
  baseAmount: number,
  bonusFactors: {
    firstTime?: boolean
    perfectScore?: boolean
    speedBonus?: number
    difficultyMultiplier?: number
    communityBonus?: boolean
  } = {}
): RewardCalculation {
  const {
    firstTime = false,
    perfectScore = false,
    speedBonus = 0,
    difficultyMultiplier = 1,
    communityBonus = false
  } = bonusFactors

  let totalMultiplier = difficultyMultiplier
  const bonusSources = []

  if (firstTime) {
    totalMultiplier *= 1.5
    bonusSources.push({
      source: 'first_time',
      multiplier: 1.5,
      description: 'Première fois'
    })
  }

  if (perfectScore) {
    totalMultiplier *= 1.25
    bonusSources.push({
      source: 'perfect',
      multiplier: 1.25,
      description: 'Score parfait'
    })
  }

  if (speedBonus > 0) {
    const speedMultiplier = 1 + (speedBonus * 0.1)
    totalMultiplier *= speedMultiplier
    bonusSources.push({
      source: 'speed',
      multiplier: speedMultiplier,
      description: 'Bonus rapidité'
    })
  }

  if (communityBonus) {
    totalMultiplier *= 1.1
    bonusSources.push({
      source: 'community',
      multiplier: 1.1,
      description: 'Participation communautaire'
    })
  }

  const totalReward = Math.round(baseAmount * totalMultiplier)
  const bonusReward = totalReward - baseAmount

  return {
    baseReward: baseAmount,
    bonusReward,
    totalReward,
    bonusSources
  }
}

// ==========================================
// ALGORITHMES DE RECOMMANDATION
// ==========================================

export interface GamingRecommendation {
  type: 'achievement' | 'challenge' | 'goal' | 'streak'
  id: string
  title: string
  description: string
  difficulty: number
  xpReward: number
  timeEstimate: string
  priority: number
  reasons: string[]
}

/**
 * Générer des recommandations gaming personnalisées
 */
export function generateGamingRecommendations(
  userLevel: number,
  userStats: Record<string, number>,
  availableAchievements: Achievement[],
  activeChallenges: Challenge[],
  currentStreaks: Streak[]
): GamingRecommendation[] {
  const recommendations: GamingRecommendation[] = []

  // Recommandations d'achievements proches
  availableAchievements.forEach(achievement => {
    const evaluation = evaluateAchievementProgress(achievement, [], userStats)

    if (evaluation.progressPercentage >= 50 && evaluation.progressPercentage < 100) {
      const timeEstimate = evaluation.estimatedCompletion ?
        `${evaluation.estimatedCompletion.days} jours` : 'Bientôt'

      recommendations.push({
        type: 'achievement',
        id: achievement.id,
        title: `Débloquer "${achievement.name}"`,
        description: achievement.description,
        difficulty: 100 - evaluation.progressPercentage,
        xpReward: achievement.xp_reward,
        timeEstimate,
        priority: evaluation.progressPercentage + (achievement.xp_reward * 0.1),
        reasons: [`${evaluation.progressPercentage}% complété`, 'Progression excellente']
      })
    }
  })

  // Recommandations de défis
  activeChallenges.forEach(challenge => {
    const evaluation = evaluateChallengeForUser(challenge, userLevel, userStats)

    if (evaluation.recommendedForUser && !evaluation.timeRemaining.urgent) {
      recommendations.push({
        type: 'challenge',
        id: challenge.id,
        title: `Rejoindre "${challenge.name}"`,
        description: challenge.description,
        difficulty: evaluation.estimatedDifficulty,
        xpReward: challenge.xp_reward,
        timeEstimate: `${evaluation.timeRemaining.days} jours`,
        priority: 100 - evaluation.estimatedDifficulty + (challenge.xp_reward * 0.05),
        reasons: [
          `Difficulté adaptée (${evaluation.estimatedDifficulty}%)`,
          `Rang estimé: ${evaluation.projectedRank}`
        ]
      })
    }
  })

  // Recommandations de streaks à maintenir
  currentStreaks
    .filter(s => s.status === 'active')
    .forEach(streak => {
      const analysis = analyzeStreak(streak, streak.last_activity_date)

      if (analysis.riskLevel === 'medium' || analysis.riskLevel === 'high') {
        recommendations.push({
          type: 'streak',
          id: streak.id,
          title: `Maintenir "${streak.name}"`,
          description: `${analysis.currentDays} jours de suite`,
          difficulty: analysis.riskLevel === 'high' ? 80 : 40,
          xpReward: analysis.projectedXP,
          timeEstimate: `${analysis.timeUntilExpiry.hours}h restantes`,
          priority: 100 + analysis.currentDays, // Streaks = haute priorité
          reasons: [
            `${analysis.currentDays} jours acquis`,
            analysis.riskLevel === 'high' ? 'Urgent !' : 'À risque'
          ]
        })
      }
    })

  // Trier par priorité décroissante
  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 10) // Top 10 recommandations
}

// ==========================================
// MÉTRIQUES DE PERFORMANCE GAMING
// ==========================================

export interface GamingPerformanceMetrics {
  engagementScore: number // 0-100
  progressionRate: number // XP/jour
  achievementRate: number // achievements/semaine
  consistencyScore: number // 0-100
  competitivenessScore: number // 0-100
  overallRating: 'beginner' | 'casual' | 'engaged' | 'hardcore' | 'expert'
}

/**
 * Calculer les métriques de performance gaming
 */
export function calculateGamingMetrics(
  userLevel: number,
  totalXP: number,
  accountAge: number, // jours
  achievements: Achievement[],
  streaks: Streak[],
  challengesCompleted: number
): GamingPerformanceMetrics {
  // Score d'engagement (0-100)
  const levelFactor = Math.min(userLevel * 5, 30) // Max 30 pts
  const xpFactor = Math.min(totalXP * 0.01, 25) // Max 25 pts
  const achievementFactor = Math.min(achievements.length * 2, 25) // Max 25 pts
  const streakFactor = Math.min(streaks.filter(s => s.status === 'active').length * 5, 20) // Max 20 pts

  const engagementScore = Math.round(levelFactor + xpFactor + achievementFactor + streakFactor)

  // Taux de progression (XP par jour)
  const progressionRate = accountAge > 0 ? Math.round((totalXP / accountAge) * 10) / 10 : 0

  // Taux d'achievements (par semaine)
  const weeksActive = Math.max(accountAge / 7, 1)
  const achievementRate = Math.round((achievements.length / weeksActive) * 100) / 100

  // Score de consistance (régularité des streaks)
  const totalStreakDays = streaks.reduce((sum, s) => sum + s.best_count, 0)
  const avgStreakLength = streaks.length > 0 ? totalStreakDays / streaks.length : 0
  const consistencyScore = Math.min(Math.round(avgStreakLength * 5), 100)

  // Score de compétitivité (participation aux défis)
  const challengeParticipationRate = challengesCompleted / Math.max(accountAge / 30, 1) // défis par mois
  const competitivenessScore = Math.min(Math.round(challengeParticipationRate * 25), 100)

  // Évaluation globale
  let overallRating: 'beginner' | 'casual' | 'engaged' | 'hardcore' | 'expert' = 'beginner'

  const globalScore = (engagementScore + consistencyScore + competitivenessScore) / 3

  if (globalScore >= 80) overallRating = 'expert'
  else if (globalScore >= 60) overallRating = 'hardcore'
  else if (globalScore >= 40) overallRating = 'engaged'
  else if (globalScore >= 20) overallRating = 'casual'

  return {
    engagementScore: Math.min(engagementScore, 100),
    progressionRate,
    achievementRate,
    consistencyScore,
    competitivenessScore,
    overallRating
  }
}

// ==========================================
// OPTIMISATION ET SUGGESTIONS
// ==========================================

/**
 * Analyser les opportunités d'optimisation gaming
 */
export function analyzeGamingOptimization(
  metrics: GamingPerformanceMetrics,
  currentStreaks: Streak[],
  recentActions: Array<{ type: string; timestamp: string }>
): Array<{
  area: string
  priority: 'low' | 'medium' | 'high'
  suggestion: string
  potentialGain: string
  actionRequired: string
}> {
  const optimizations = []

  // Optimisation engagement
  if (metrics.engagementScore < 40) {
    optimizations.push({
      area: 'Engagement',
      priority: 'high' as const,
      suggestion: 'Augmentez votre activité quotidienne',
      potentialGain: '+15-30 points d\'engagement',
      actionRequired: 'Enregistrez au moins une transaction par jour'
    })
  }

  // Optimisation consistance
  if (metrics.consistencyScore < 50 && currentStreaks.length === 0) {
    optimizations.push({
      area: 'Consistance',
      priority: 'medium' as const,
      suggestion: 'Démarrez un streak pour améliorer votre régularité',
      potentialGain: '+20 points de consistance',
      actionRequired: 'Commencez un streak de transactions quotidiennes'
    })
  }

  // Optimisation compétitivité
  if (metrics.competitivenessScore < 30) {
    optimizations.push({
      area: 'Compétitivité',
      priority: 'low' as const,
      suggestion: 'Participez aux défis communautaires',
      potentialGain: '+25 points de compétitivité',
      actionRequired: 'Rejoignez un défi adapté à votre niveau'
    })
  }

  // Analyse des patterns d'activité
  if (recentActions.length > 0) {
    const actionTypes = new Map<string, number>()
    recentActions.forEach(action => {
      actionTypes.set(action.type, (actionTypes.get(action.type) || 0) + 1)
    })

    const transactionActions = actionTypes.get('transaction') || 0
    const goalActions = actionTypes.get('goal_progress') || 0

    if (transactionActions > goalActions * 5) {
      optimizations.push({
        area: 'Équilibre',
        priority: 'medium' as const,
        suggestion: 'Équilibrez entre transactions et objectifs',
        potentialGain: 'Progression plus complète',
        actionRequired: 'Travaillez aussi sur vos objectifs d\'épargne'
      })
    }
  }

  return optimizations.sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 }
    return priorityWeight[b.priority] - priorityWeight[a.priority]
  })
}

// ==========================================
// CALCULS DE LEADERBOARD
// ==========================================

export interface LeaderboardPosition {
  rank: number
  totalParticipants: number
  percentile: number
  pointsToNextRank: number
  pointsToTopTen: number
  category: 'top1' | 'top5' | 'top10' | 'top25' | 'top50' | 'bottom50'
}

/**
 * Calculer la position dans un leaderboard
 */
export function calculateLeaderboardPosition(
  userScore: number,
  allScores: number[]
): LeaderboardPosition {
  if (!Array.isArray(allScores) || allScores.length === 0) {
    return {
      rank: 1,
      totalParticipants: 1,
      percentile: 100,
      pointsToNextRank: 0,
      pointsToTopTen: 0,
      category: 'top1'
    }
  }

  const sortedScores = [...allScores].sort((a, b) => b - a)
  const rank = sortedScores.findIndex(score => score <= userScore) + 1
  const totalParticipants = sortedScores.length
  const percentile = Math.round(((totalParticipants - rank + 1) / totalParticipants) * 100)

  // Points pour rank suivant
  const nextRankScore = rank > 1 ? sortedScores[rank - 2] : userScore
  const pointsToNextRank = Math.max(0, nextRankScore - userScore + 1)

  // Points pour top 10
  const topTenScore = totalParticipants >= 10 ? sortedScores[9] : sortedScores[totalParticipants - 1]
  const pointsToTopTen = rank > 10 ? Math.max(0, topTenScore - userScore + 1) : 0

  // Catégorie
  let category: LeaderboardPosition['category'] = 'bottom50'

  if (percentile >= 99) category = 'top1'
  else if (percentile >= 95) category = 'top5'
  else if (percentile >= 90) category = 'top10'
  else if (percentile >= 75) category = 'top25'
  else if (percentile >= 50) category = 'top50'

  return {
    rank,
    totalParticipants,
    percentile,
    pointsToNextRank,
    pointsToTopTen,
    category
  }
}

// ==========================================
// EXPORT GROUPÉ
// ==========================================

export const GamingUtils = {
  // XP et niveaux
  calculateXPForLevel,
  calculateTotalXPForLevel,
  getLevelFromTotalXP,
  calculateXPWithMultipliers,

  // Achievements
  evaluateAchievementProgress,
  calculateAchievementRarityScore,

  // Streaks
  analyzeStreak,
  calculateStreakMilestones,

  // Défis
  evaluateChallengeForUser,

  // Récompenses
  calculateRewards,

  // Leaderboard
  calculateLeaderboardPosition,

  // Analytics
  calculateGamingMetrics,
  analyzeGamingOptimization,
  generateGamingRecommendations
} as const
