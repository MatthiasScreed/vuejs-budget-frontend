// composables/useProgressiveGaming.ts
import { ref, computed, readonly } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

// ==========================================
// TYPES
// ==========================================

export interface GamingConfig {
  engagement_level: number
  engagement_label: string
  terminology: {
    points: string
    tier: string
    achievement: string
    streak: string
  }
  features: string[]
  ui_config: UIConfig
  notifications: NotificationConfig
}

export interface UIConfig {
  show_xp_bar: boolean
  show_level_badge: boolean
  show_achievements_count: boolean
  show_streak_counter: boolean
  show_comparison_widget: boolean
  show_leaderboard_link: boolean
  show_challenges_link: boolean
  animation_intensity: 'subtle' | 'moderate' | 'engaging' | 'full'
}

export interface NotificationConfig {
  show_xp_notifications: boolean
  show_level_badges: boolean
  show_leaderboard: boolean
  show_challenges: boolean
}

export interface Milestone {
  id: number
  code: string
  title: string
  description: string
  icon: string
  category: { label: string; icon: string }
  progress: {
    current: number
    target: number
    percentage: number
  }
  is_completed: boolean
  completed_at: string | null
  reward: string | null
  reward_claimed: boolean
}

export interface Feedback {
  id: number
  title: string
  message: string
  icon: string
  category: string
  tone: 'neutral' | 'encouraging' | 'celebratory' | 'informative'
}

export interface ProgressData {
  current_tier: number
  tier_name: string
  total_points: number
  points_in_tier: number
  points_for_next: number
  progress_percentage: number
  terminology: { points: string; tier: string }
}

export interface DashboardData {
  engagement_level: number
  milestones: Milestone[]
  encouragement: {
    message: string
    stats_highlight: { type: string; value: number; label: string } | null
  }
  progress?: ProgressData
  comparison?: {
    savings_comparison: {
      user_rate: number
      percentile: number
      message: string
    }
  }
  streak?: { current: number; best: number; label: string }
}

export interface GamingPreferences {
  gaming_preference: 'auto' | 'minimal' | 'moderate' | 'full'
  show_xp_notifications: boolean
  show_level_badges: boolean
  show_leaderboard: boolean
  show_challenges: boolean
}

// ==========================================
// ENGAGEMENT LEVELS
// ==========================================

export const ENGAGEMENT_LEVELS = {
  SOFT: 1, // Encouragements doux
  REWARDS: 2, // Points et paliers visibles
  SOCIAL: 3, // Comparaisons et streaks
  GAMING: 4, // Full gaming
} as const

// ==========================================
// COMPOSABLE
// ==========================================

// State global (singleton)
const config = ref<GamingConfig | null>(null)
const dashboardData = ref<DashboardData | null>(null)
const pendingFeedback = ref<Feedback[]>([])
const loading = ref(false)
const initialized = ref(false)

export function useProgressiveGaming() {
  const toast = useToast()

  // ==========================================
  // COMPUTED
  // ==========================================

  const engagementLevel = computed(() => config.value?.engagement_level ?? 1)

  const terminology = computed(
    () =>
      config.value?.terminology ?? {
        points: 'Points',
        tier: 'Palier',
        achievement: 'Objectif atteint',
        streak: 'Série',
      },
  )

  const uiConfig = computed(
    () =>
      config.value?.ui_config ?? {
        show_xp_bar: false,
        show_level_badge: false,
        show_achievements_count: false,
        show_streak_counter: false,
        show_comparison_widget: false,
        show_leaderboard_link: false,
        show_challenges_link: false,
        animation_intensity: 'subtle' as const,
      },
  )

  const features = computed(() => config.value?.features ?? [])

  const hasFeature = (feature: string): boolean => {
    return features.value.includes(feature)
  }

  const shouldShowXP = computed(
    () => engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS && uiConfig.value.show_xp_bar,
  )

  const shouldShowLeaderboard = computed(
    () => engagementLevel.value >= ENGAGEMENT_LEVELS.SOCIAL && uiConfig.value.show_leaderboard_link,
  )

  const shouldShowChallenges = computed(
    () => engagementLevel.value >= ENGAGEMENT_LEVELS.GAMING && uiConfig.value.show_challenges_link,
  )

  const animationClass = computed(() => {
    const intensity = uiConfig.value.animation_intensity
    return {
      'animate-subtle': intensity === 'subtle',
      'animate-moderate': intensity === 'moderate',
      'animate-engaging': intensity === 'engaging',
      'animate-full': intensity === 'full',
    }
  })

  // ==========================================
  // MÉTHODES - INITIALISATION
  // ==========================================

  async function initialize(): Promise<void> {
    if (initialized.value) return

    loading.value = true
    try {
      const [configRes, dashboardRes] = await Promise.all([
        api.get('/gaming/config'),
        api.get('/gaming/dashboard'),
      ])

      if (configRes.data.success) {
        config.value = configRes.data.data
      }

      if (dashboardRes.data.success) {
        dashboardData.value = dashboardRes.data.data
      }

      initialized.value = true
    } catch (error) {
      console.error('❌ Erreur initialisation gaming:', error)
    } finally {
      loading.value = false
    }
  }

  async function refreshDashboard(): Promise<void> {
    try {
      const response = await api.get('/gaming/dashboard')
      if (response.data.success) {
        dashboardData.value = response.data.data
      }
    } catch (error) {
      console.error('❌ Erreur refresh dashboard:', error)
    }
  }

  // ==========================================
  // MÉTHODES - ÉVÉNEMENTS
  // ==========================================

  async function processEvent(
    eventType: string,
    context: Record<string, any> = {},
  ): Promise<{ feedback: Feedback | null; milestones: Milestone[] }> {
    try {
      const response = await api.post('/gaming/event', {
        event_type: eventType,
        context,
      })

      if (response.data.success) {
        const result = response.data.data

        // Afficher le feedback si présent
        if (result.feedback) {
          showFeedback(result.feedback)
        }

        // Afficher les milestones complétés
        if (result.milestones?.newly_completed?.length > 0) {
          result.milestones.newly_completed.forEach((m: Milestone) => {
            showMilestoneUnlocked(m)
          })
        }

        return {
          feedback: result.feedback,
          milestones: result.milestones?.newly_completed ?? [],
        }
      }
    } catch (error) {
      console.error('❌ Erreur processEvent:', error)
    }

    return { feedback: null, milestones: [] }
  }

  async function recordInteraction(
    eventType: string,
    elementType?: string,
    elementId?: number,
  ): Promise<void> {
    try {
      await api.post('/gaming/interaction', {
        event_type: eventType,
        element_type: elementType,
        element_id: elementId,
      })
    } catch (error) {
      // Silencieux - ne pas bloquer l'UX
      console.warn('Interaction non enregistrée:', error)
    }
  }

  // ==========================================
  // MÉTHODES - FEEDBACK & NOTIFICATIONS
  // ==========================================

  function showFeedback(feedback: Feedback): void {
    const level = engagementLevel.value

    // Niveau 1 : Toast très subtil
    if (level === ENGAGEMENT_LEVELS.SOFT) {
      toast.info(`${feedback.icon} ${feedback.message}`, {
        timeout: 2500,
        hideProgressBar: true,
        closeButton: false,
      })
      return
    }

    // Niveau 2+ : Toast plus visible
    const toastType = feedback.tone === 'celebratory' ? 'success' : 'info'
    toast[toastType](`${feedback.icon} ${feedback.title}`, {
      timeout: 3500,
      hideProgressBar: level < ENGAGEMENT_LEVELS.SOCIAL,
    })
  }

  function showMilestoneUnlocked(milestone: Milestone): void {
    const level = engagementLevel.value

    // Niveau 1 : Message simple
    if (level === ENGAGEMENT_LEVELS.SOFT) {
      toast.success(`${milestone.icon} ${milestone.title}`, {
        timeout: 3000,
      })
      return
    }

    // Niveau 2+ : Message avec récompense
    let message = `${milestone.icon} ${milestone.title}`
    if (milestone.reward && level >= ENGAGEMENT_LEVELS.REWARDS) {
      message += ` • ${milestone.reward}`
    }

    toast.success(message, {
      timeout: 4000,
    })

    // Ajouter aux feedbacks en attente pour affichage custom
    pendingFeedback.value.push({
      id: milestone.id,
      title: milestone.title,
      message: milestone.description,
      icon: milestone.icon,
      category: 'milestone',
      tone: 'celebratory',
    })
  }

  function consumePendingFeedback(): Feedback | null {
    return pendingFeedback.value.shift() ?? null
  }

  // ==========================================
  // MÉTHODES - MILESTONES
  // ==========================================

  async function getMilestones(
    category?: string,
    status?: 'all' | 'completed' | 'pending',
  ): Promise<Milestone[]> {
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (status) params.append('status', status)

      const response = await api.get(`/gaming/milestones?${params}`)

      if (response.data.success) {
        return response.data.data.milestones
      }
    } catch (error) {
      console.error('❌ Erreur getMilestones:', error)
    }

    return []
  }

  async function claimMilestoneReward(milestoneId: number): Promise<boolean> {
    try {
      const response = await api.post(`/gaming/milestones/${milestoneId}/claim`)

      if (response.data.success) {
        toast.success('🎁 Récompense réclamée !')
        await refreshDashboard()
        return true
      }
    } catch (error) {
      console.error('❌ Erreur claimReward:', error)
      toast.error('Impossible de réclamer la récompense')
    }

    return false
  }

  // ==========================================
  // MÉTHODES - PRÉFÉRENCES
  // ==========================================

  async function updatePreferences(prefs: Partial<GamingPreferences>): Promise<boolean> {
    try {
      const response = await api.put('/gaming/preferences', prefs)

      if (response.data.success) {
        // Rafraîchir la config
        const configRes = await api.get('/gaming/config')
        if (configRes.data.success) {
          config.value = configRes.data.data
        }
        return true
      }
    } catch (error) {
      console.error('❌ Erreur updatePreferences:', error)
    }

    return false
  }

  // ==========================================
  // MÉTHODES - ENCOURAGEMENT
  // ==========================================

  async function getDailyEncouragement(): Promise<{ message: string } | null> {
    try {
      const response = await api.get('/gaming/encouragement')

      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('❌ Erreur encouragement:', error)
    }

    return null
  }

  // ==========================================
  // MÉTHODES - UTILITAIRES
  // ==========================================

  function formatPoints(points: number): string {
    const term = terminology.value.points
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}k ${term}`
    }
    return `${points} ${term}`
  }

  function getTierLabel(tier: number): string {
    const labels: Record<number, string> = {
      1: 'Débutant',
      2: 'Apprenti',
      5: 'En progression',
      10: 'Épargnant régulier',
      15: 'Gestionnaire confirmé',
      20: 'Expert financier',
    }

    for (const [minTier, label] of Object.entries(labels).reverse()) {
      if (tier >= Number(minTier)) return label
    }

    return 'Débutant'
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State (readonly)
    config: readonly(config),
    dashboardData: readonly(dashboardData),
    pendingFeedback: readonly(pendingFeedback),
    loading: readonly(loading),
    initialized: readonly(initialized),

    // Computed
    engagementLevel,
    terminology,
    uiConfig,
    features,
    shouldShowXP,
    shouldShowLeaderboard,
    shouldShowChallenges,
    animationClass,

    // Methods - Init
    initialize,
    refreshDashboard,

    // Methods - Events
    processEvent,
    recordInteraction,

    // Methods - Feedback
    showFeedback,
    showMilestoneUnlocked,
    consumePendingFeedback,

    // Methods - Milestones
    getMilestones,
    claimMilestoneReward,

    // Methods - Preferences
    updatePreferences,

    // Methods - Utils
    hasFeature,
    getDailyEncouragement,
    formatPoints,
    getTierLabel,

    // Constants
    ENGAGEMENT_LEVELS,
  }
}
