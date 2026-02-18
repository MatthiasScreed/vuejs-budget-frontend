// src/config/tutorialSteps.ts
// Configuration des étapes du tutoriel avec i18n
// École 42: Données séparées de la logique

import type { ComposerTranslation } from 'vue-i18n'

interface TutorialExample {
  icon: string
  title: string
  description: string
  details?: string[]
}

interface TutorialStep {
  icon: string
  title: string
  content: string
  examples?: TutorialExample[]
  examplesTitle?: string
  tips?: string[]
}

/**
 * Générer les étapes du tutoriel principal
 * École 42: Fonction pure, données i18n injectées
 */
export function getMainTutorialSteps(t: ComposerTranslation): TutorialStep[] {
  return [
    // ==========================================
    // ÉTAPE 1 : Bienvenue
    // ==========================================
    {
      icon: '🎮',
      title: t('tutorial.welcome.title'),
      content: t('tutorial.welcome.content'),
      tips: [t('tutorial.welcome.tip1'), t('tutorial.welcome.tip2')],
    },

    // ==========================================
    // ÉTAPE 2 : Connexion bancaire
    // ==========================================
    {
      icon: '🏦',
      title: t('tutorial.bank.title'),
      content: t('tutorial.bank.content'),
      examples: [
        {
          icon: '🔒',
          title: t('tutorial.bank.ex1Title'),
          description: t('tutorial.bank.ex1Desc'),
        },
        {
          icon: '📥',
          title: t('tutorial.bank.ex2Title'),
          description: t('tutorial.bank.ex2Desc'),
        },
      ],
      tips: [t('tutorial.bank.tip1')],
    },

    // ==========================================
    // ÉTAPE 3 : Objectifs financiers
    // ==========================================
    {
      icon: '🎯',
      title: t('tutorial.goals.title'),
      content: t('tutorial.goals.content'),
      examples: [
        {
          icon: '✈️',
          title: t('tutorial.goals.ex1Title'),
          description: t('tutorial.goals.ex1Desc'),
          details: [t('tutorial.goals.ex1Detail1'), t('tutorial.goals.ex1Detail2')],
        },
        {
          icon: '🏠',
          title: t('tutorial.goals.ex2Title'),
          description: t('tutorial.goals.ex2Desc'),
        },
        {
          icon: '🚗',
          title: t('tutorial.goals.ex3Title'),
          description: t('tutorial.goals.ex3Desc'),
        },
      ],
      examplesTitle: t('tutorial.goals.examplesTitle'),
      tips: [t('tutorial.goals.tip1'), t('tutorial.goals.tip2')],
    },

    // ==========================================
    // ÉTAPE 4 : Coach Insights (NOUVEAU)
    // ==========================================
    {
      icon: '🤖',
      title: t('tutorial.coach.title'),
      content: t('tutorial.coach.content'),
      examples: [
        {
          icon: '💡',
          title: t('tutorial.coach.ex1Title'),
          description: t('tutorial.coach.ex1Desc'),
          details: [t('tutorial.coach.ex1Detail1'), t('tutorial.coach.ex1Detail2')],
        },
        {
          icon: '🎯',
          title: t('tutorial.coach.ex2Title'),
          description: t('tutorial.coach.ex2Desc'),
        },
        {
          icon: '⚠️',
          title: t('tutorial.coach.ex3Title'),
          description: t('tutorial.coach.ex3Desc'),
        },
      ],
      examplesTitle: t('tutorial.coach.examplesTitle'),
      tips: [t('tutorial.coach.tip1'), t('tutorial.coach.tip2')],
    },

    // ==========================================
    // ÉTAPE 5 : Système de progression
    // ==========================================
    {
      icon: '⭐',
      title: t('tutorial.gaming.title'),
      content: t('tutorial.gaming.content'),
      examples: [
        {
          icon: '🏆',
          title: t('tutorial.gaming.ex1Title'),
          description: t('tutorial.gaming.ex1Desc'),
        },
        {
          icon: '🔥',
          title: t('tutorial.gaming.ex2Title'),
          description: t('tutorial.gaming.ex2Desc'),
        },
        {
          icon: '📈',
          title: t('tutorial.gaming.ex3Title'),
          description: t('tutorial.gaming.ex3Desc'),
        },
      ],
      examplesTitle: t('tutorial.gaming.examplesTitle'),
      tips: [t('tutorial.gaming.tip1')],
    },
  ]
}
