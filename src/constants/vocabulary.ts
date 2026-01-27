// src/constants/vocabulary.ts
// Vocabulaire accessible pour remplacer les termes techniques/gaming

/**
 * Labels accessibles à utiliser partout dans l'app
 * ✅ Termes clairs et motivants
 * ❌ Jargon gaming/technique
 */
export const VOCABULARY = {
  // Points et progression
  xp: 'Points',
  xp_gained: 'Points gagnés',
  total_xp: 'Total de points',
  earn_xp: 'Gagner des points',

  // Niveaux
  level: 'Palier',
  level_up: 'Palier suivant débloqué !',
  current_level: 'Palier actuel',
  next_level: 'Prochain palier',

  // Achievements
  achievement: 'Badge',
  achievements: 'Badges',
  unlock_achievement: 'Badge débloqué !',
  achievement_unlocked: 'Nouveau badge !',

  // Streaks
  streak: 'Série de jours',
  current_streak: 'Jours de suite',
  best_streak: 'Meilleure série',
  streak_bonus: 'Bonus régularité',

  // Challenges
  challenge: 'Défi',
  challenges: 'Défis',
  weekly_challenge: 'Défi de la semaine',
  complete_challenge: 'Défi accompli !',

  // Gaming general
  leaderboard: 'Classement',
  rank: 'Position',
  rewards: 'Récompenses',
  progress: 'Progression',

  // Financial terms - Adoucis
  budget: 'Mon budget',
  projection: 'Estimation',
  forecast: 'Prévision',
  analytics: 'Analyses',
  dashboard: 'Ma vue',

  // Goals
  goal: 'Objectif',
  goals: 'Objectifs',
  personal_goal: 'Projet personnel',
  short_term_goal: 'Objectif court terme',
  long_term_goal: 'Grand projet',

  // Actions
  plan: 'Prévoir',
  track: 'Suivre',
  achieve: 'Atteindre',
  save: 'Économiser',

  // Messages d'encouragement
  well_done: 'Bravo !',
  keep_going: 'Continue comme ça !',
  almost_there: 'Tu y es presque !',
  great_job: 'Super travail !',

} as const

/**
 * Messages contextuels pour différents événements
 */
export const MESSAGES = {
  // Gains de points
  points_earned: (amount: number) => `+${amount} points gagnés !`,
  points_milestone: (total: number) => `${total} points au total. Impressionnant !`,

  // Progression
  level_up: (newLevel: number) => `🎉 Palier ${newLevel} débloqué !`,
  halfway: 'Tu as atteint la moitié de ton objectif !',
  almost_done: 'Encore un petit effort !',

  // Streaks
  streak_continue: (days: number) => `🔥 ${days} jours de suite. Record !`,
  streak_broken: 'Ta série s\'est arrêtée, mais tu peux recommencer !',

  // Objectifs
  goal_created: 'Objectif enregistré ! C\'est parti',
  goal_reached: 'Objectif atteint ! Tu l\'as fait ! 🎯',
  goal_progress: (percent: number) => `${percent}% de ton objectif accompli`,

  // Défis
  challenge_accepted: 'Défi accepté ! Tu as 7 jours',
  challenge_completed: 'Défi terminé ! Bien joué',

  // Erreurs (ton positif)
  error_generic: 'Oups, petit problème. Réessaye dans quelques instants',
  error_connection: 'Connexion perdue. Vérifie ton réseau',
  error_bank: 'La connexion bancaire a échoué. Retente ta chance',

  // Succès
  success_generic: 'Parfait ! C\'est enregistré',
  success_save: 'Sauvegarde réussie !',
  success_update: 'Mise à jour effectuée !',

} as const

/**
 * Tooltips explicatifs pour les non-gamers
 */
export const TOOLTIPS = {
  points: 'Les points mesurent ta progression. Plus tu avances, plus tu en gagnes.',
  palier: 'Chaque palier débloque de nouvelles fonctionnalités et badges.',
  badge: 'Récompenses obtenues en accomplissant des objectifs spécifiques.',
  serie: 'Jours consécutifs où tu as consulté ton budget ou fait une action.',
  defi: 'Objectifs hebdomadaires optionnels pour pimenter ton expérience.',
  capacite_epargne: 'Montant que tu peux mettre de côté sans te priver, calculé automatiquement.',
  budget_status: 'Indique si tu respectes ton budget du mois (vert) ou si tu dépasses (rouge).',
} as const

/**
 * Helper function pour obtenir un label
 */
export function getLabel(key: keyof typeof VOCABULARY): string {
  return VOCABULARY[key] || key
}

/**
 * Helper function pour obtenir un message
 */
export function getMessage(key: keyof typeof MESSAGES, ...args: any[]): string {
  const message = MESSAGES[key]
  if (typeof message === 'function') {
    return message(...args)
  }
  return message || ''
}

/**
 * Helper function pour obtenir un tooltip
 */
export function getTooltip(key: keyof typeof TOOLTIPS): string {
  return TOOLTIPS[key] || ''
}
