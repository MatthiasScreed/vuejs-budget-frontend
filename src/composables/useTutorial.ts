import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

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
 * Tutoriel pour Goals vs Projects
 */
export function useGoalsProjectsTutorial() {
  const { t } = useI18n()

  const steps = computed<TutorialStep[]>(() => [
    {
      icon: '🎯',
      title: t('goalsProjectsTutorial.welcome.title'),
      content: t('goalsProjectsTutorial.welcome.content'),
    },
    {
      icon: '💰',
      title: t('goalsProjectsTutorial.goals.title'),
      content: t('goalsProjectsTutorial.goals.content'),
      examples: [
        {
          icon: '🏖️',
          title: t('goalsProjectsTutorial.goals.ex1Title'),
          description: t('goalsProjectsTutorial.goals.ex1Desc'),
          details: [
            t('goalsProjectsTutorial.goals.ex1Detail1'),
            t('goalsProjectsTutorial.goals.ex1Detail2'),
            t('goalsProjectsTutorial.goals.ex1Detail3'),
          ],
        },
        {
          icon: '📱',
          title: t('goalsProjectsTutorial.goals.ex2Title'),
          description: t('goalsProjectsTutorial.goals.ex2Desc'),
          details: [
            t('goalsProjectsTutorial.goals.ex2Detail1'),
            t('goalsProjectsTutorial.goals.ex2Detail2'),
            t('goalsProjectsTutorial.goals.ex2Detail3'),
          ],
        },
        {
          icon: '🛡️',
          title: t('goalsProjectsTutorial.goals.ex3Title'),
          description: t('goalsProjectsTutorial.goals.ex3Desc'),
          details: [
            t('goalsProjectsTutorial.goals.ex3Detail1'),
            t('goalsProjectsTutorial.goals.ex3Detail2'),
            t('goalsProjectsTutorial.goals.ex3Detail3'),
          ],
        },
      ],
      tips: [
        t('goalsProjectsTutorial.goals.tip1'),
        t('goalsProjectsTutorial.goals.tip2'),
        t('goalsProjectsTutorial.goals.tip3'),
      ],
    },
    {
      icon: '🗝️',
      title: t('goalsProjectsTutorial.projects.title'),
      content: t('goalsProjectsTutorial.projects.content'),
      examples: [
        {
          icon: '🗾',
          title: t('goalsProjectsTutorial.projects.ex1Title'),
          description: t('goalsProjectsTutorial.projects.ex1Desc'),
          details: [
            t('goalsProjectsTutorial.projects.ex1Detail1'),
            t('goalsProjectsTutorial.projects.ex1Detail2'),
            t('goalsProjectsTutorial.projects.ex1Detail3'),
            t('goalsProjectsTutorial.projects.ex1Detail4'),
          ],
        },
        {
          icon: '🏠',
          title: t('goalsProjectsTutorial.projects.ex2Title'),
          description: t('goalsProjectsTutorial.projects.ex2Desc'),
          details: [
            t('goalsProjectsTutorial.projects.ex2Detail1'),
            t('goalsProjectsTutorial.projects.ex2Detail2'),
            t('goalsProjectsTutorial.projects.ex2Detail3'),
            t('goalsProjectsTutorial.projects.ex2Detail4'),
          ],
        },
        {
          icon: '🚗',
          title: t('goalsProjectsTutorial.projects.ex3Title'),
          description: t('goalsProjectsTutorial.projects.ex3Desc'),
          details: [
            t('goalsProjectsTutorial.projects.ex3Detail1'),
            t('goalsProjectsTutorial.projects.ex3Detail2'),
            t('goalsProjectsTutorial.projects.ex3Detail3'),
            t('goalsProjectsTutorial.projects.ex3Detail4'),
          ],
        },
      ],
      tips: [
        t('goalsProjectsTutorial.projects.tip1'),
        t('goalsProjectsTutorial.projects.tip2'),
        t('goalsProjectsTutorial.projects.tip3'),
      ],
    },
    {
      icon: '🤔',
      title: t('goalsProjectsTutorial.when.title'),
      content: t('goalsProjectsTutorial.when.content'),
    },
    // ==========================================
    // NOUVELLE ÉTAPE : Coach Financier
    // ==========================================
    {
      icon: '🤖',
      title: t('goalsProjectsTutorial.coach.title'),
      content: t('goalsProjectsTutorial.coach.content'),
      examplesTitle: t('goalsProjectsTutorial.coach.examplesTitle'),
      examples: [
        {
          icon: '💡',
          title: t('goalsProjectsTutorial.coach.ex1Title'),
          description: t('goalsProjectsTutorial.coach.ex1Desc'),
        },
        {
          icon: '🎯',
          title: t('goalsProjectsTutorial.coach.ex2Title'),
          description: t('goalsProjectsTutorial.coach.ex2Desc'),
        },
        {
          icon: '⚠️',
          title: t('goalsProjectsTutorial.coach.ex3Title'),
          description: t('goalsProjectsTutorial.coach.ex3Desc'),
        },
        {
          icon: '📈',
          title: t('goalsProjectsTutorial.coach.ex4Title'),
          description: t('goalsProjectsTutorial.coach.ex4Desc'),
        },
      ],
      tips: [t('goalsProjectsTutorial.coach.tip1'), t('goalsProjectsTutorial.coach.tip2')],
    },
    {
      icon: '🎮',
      title: t('goalsProjectsTutorial.gaming.title'),
      content: t('goalsProjectsTutorial.gaming.content'),
      tips: [
        t('goalsProjectsTutorial.gaming.tip1'),
        t('goalsProjectsTutorial.gaming.tip2'),
        t('goalsProjectsTutorial.gaming.tip3'),
      ],
    },
    {
      icon: '🚀',
      title: t('goalsProjectsTutorial.ready.title'),
      content: t('goalsProjectsTutorial.ready.content'),
    },
  ])

  return { steps }
}

/**
 * Tutoriel spécifique Goals uniquement
 */
export function useGoalsTutorial() {
  const { t } = useI18n()

  const steps = computed<TutorialStep[]>(() => [
    {
      icon: '🎯',
      title: t('goalsTutorial.intro.title'),
      content: t('goalsTutorial.intro.content'),
    },
    {
      icon: '➕',
      title: t('goalsTutorial.create.title'),
      content: t('goalsTutorial.create.content'),
      examples: [
        {
          icon: '📱',
          title: t('goalsTutorial.create.ex1Title'),
          description: t('goalsTutorial.create.ex1Desc'),
        },
        {
          icon: '✈️',
          title: t('goalsTutorial.create.ex2Title'),
          description: t('goalsTutorial.create.ex2Desc'),
        },
      ],
    },
    {
      icon: '💵',
      title: t('goalsTutorial.contributions.title'),
      content: t('goalsTutorial.contributions.content'),
      tips: [
        t('goalsTutorial.contributions.tip1'),
        t('goalsTutorial.contributions.tip2'),
        t('goalsTutorial.contributions.tip3'),
      ],
    },
    {
      icon: '🏆',
      title: t('goalsTutorial.achieve.title'),
      content: t('goalsTutorial.achieve.content'),
    },
  ])

  return { steps }
}

/**
 * Tutoriel spécifique Projects uniquement
 */
export function useProjectsTutorial() {
  const { t } = useI18n()

  const steps = computed<TutorialStep[]>(() => [
    {
      icon: '🗝️',
      title: t('projectsTutorial.intro.title'),
      content: t('projectsTutorial.intro.content'),
    },
    {
      icon: '📋',
      title: t('projectsTutorial.templates.title'),
      content: t('projectsTutorial.templates.content'),
      examples: [
        {
          icon: '✈️',
          title: t('projectsTutorial.templates.ex1Title'),
          description: t('projectsTutorial.templates.ex1Desc'),
          details: [
            t('projectsTutorial.templates.ex1Detail1'),
            t('projectsTutorial.templates.ex1Detail2'),
          ],
        },
        {
          icon: '🏠',
          title: t('projectsTutorial.templates.ex2Title'),
          description: t('projectsTutorial.templates.ex2Desc'),
          details: [
            t('projectsTutorial.templates.ex2Detail1'),
            t('projectsTutorial.templates.ex2Detail2'),
          ],
        },
        {
          icon: '🚗',
          title: t('projectsTutorial.templates.ex3Title'),
          description: t('projectsTutorial.templates.ex3Desc'),
          details: [
            t('projectsTutorial.templates.ex3Detail1'),
            t('projectsTutorial.templates.ex3Detail2'),
          ],
        },
        {
          icon: '💍',
          title: t('projectsTutorial.templates.ex4Title'),
          description: t('projectsTutorial.templates.ex4Desc'),
          details: [
            t('projectsTutorial.templates.ex4Detail1'),
            t('projectsTutorial.templates.ex4Detail2'),
          ],
        },
      ],
      tips: [
        t('projectsTutorial.templates.tip1'),
        t('projectsTutorial.templates.tip2'),
        t('projectsTutorial.templates.tip3'),
      ],
    },
    {
      icon: '🎯',
      title: t('projectsTutorial.milestones.title'),
      content: t('projectsTutorial.milestones.content'),
      examples: [
        {
          icon: '🗾',
          title: t('projectsTutorial.milestones.exTitle'),
          description: t('projectsTutorial.milestones.exDesc'),
          details: [
            t('projectsTutorial.milestones.exDetail1'),
            t('projectsTutorial.milestones.exDetail2'),
            t('projectsTutorial.milestones.exDetail3'),
            t('projectsTutorial.milestones.exDetail4'),
          ],
        },
      ],
    },
    {
      icon: '⚡',
      title: t('projectsTutorial.states.title'),
      content: t('projectsTutorial.states.content'),
      tips: [
        t('projectsTutorial.states.tip1'),
        t('projectsTutorial.states.tip2'),
        t('projectsTutorial.states.tip3'),
      ],
    },
    {
      icon: '📊',
      title: t('projectsTutorial.tracking.title'),
      content: t('projectsTutorial.tracking.content'),
    },
  ])

  return { steps }
}
