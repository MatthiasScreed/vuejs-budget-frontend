import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'
import { useToastStore } from '@/stores/toastStore'
import { useGamingStore } from '@/stores/gamingStore'
import { useQuestStore } from '@/stores/Queststore.ts'

// ==========================================
// TYPES
// ==========================================

export type ActionType = 'save' | 'spend'

export type ReasonPreset =
  | 'cooked'
  | 'avoided'
  | 'transport'
  | 'other_save'
  | 'food'
  | 'shopping'
  | 'subscription'
  | 'other_spend'

export interface DailyAction {
  id: number
  type: ActionType
  amount: number
  reason: string | null
  reason_preset: ReasonPreset | null
  reason_label: string
  xp_earned: number
  quest_id: number | null
  action_date: string
  created_at: string
}

export interface ActionResult {
  action: DailyAction
  gaming: {
    xp_earned: number
    total_xp: number
    level: number
    leveled_up: boolean
    new_level: number | null
  }
  streak: {
    current: number
    best: number
    bonus_xp: number
    is_milestone: boolean
  }
  quest: {
    id: number
    name: string
    emoji: string
    progress_percentage: number
    current_amount: number
    target_amount: number
  } | null
}

interface CreateActionData {
  type: ActionType
  amount: number
  reason?: string
  reason_preset?: ReasonPreset
  quest_id?: number | null
  action_date?: string
}

interface TodaySummary {
  total_saved: number
  total_spent: number
  total_xp: number
  actions_count: number
  has_acted: boolean
}

// Libellés des raisons prédéfinies
export const REASON_PRESETS: Record<ReasonPreset, string> = {
  cooked: "J'ai cuisiné",
  avoided: "J'ai évité un achat",
  transport: "J'ai pris les transports",
  other_save: 'Autre économie',
  food: 'Nourriture / restaurant',
  shopping: 'Shopping',
  subscription: 'Abonnement',
  other_spend: 'Autre dépense',
}

export const SAVE_PRESETS: ReasonPreset[] = ['cooked', 'avoided', 'transport', 'other_save']
export const SPEND_PRESETS: ReasonPreset[] = ['food', 'shopping', 'subscription', 'other_spend']

// ==========================================
// STORE
// ==========================================

export const useDailyActionStore = defineStore('dailyAction', () => {
  // ==========================================
  // STATE
  // ==========================================

  const actions = ref<DailyAction[]>([])
  const todayActions = ref<DailyAction[]>([])
  const todaySummary = ref<TodaySummary>({
    total_saved: 0,
    total_spent: 0,
    total_xp: 0,
    actions_count: 0,
    has_acted: false,
  })
  const weekStats = ref({ saved: 0, spent: 0, xp_earned: 0, actions_count: 0 })
  const monthStats = ref({ saved: 0, spent: 0, xp_earned: 0, actions_count: 0, save_days: 0 })

  const submitting = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastResult = ref<ActionResult | null>(null)

  // ==========================================
  // GETTERS
  // ==========================================

  const hasActedToday = computed(() => todaySummary.value.has_acted)

  const netTodayBalance = computed(
    () => todaySummary.value.total_saved - todaySummary.value.total_spent,
  )

  const netMonthBalance = computed(() => monthStats.value.saved - monthStats.value.spent)

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Enregistrer une action — cœur du MVP
   */
  async function submitAction(data: CreateActionData): Promise<ActionResult | null> {
    submitting.value = true
    error.value = null
    const toast = useToastStore()

    try {
      const res = await api.post('/daily-actions', data)
      const result = res.data as ActionResult

      lastResult.value = result

      // Mise à jour locale immédiate
      todayActions.value.unshift(result.action)
      todaySummary.value.actions_count++
      todaySummary.value.has_acted = true

      if (data.type === 'save') {
        todaySummary.value.total_saved += data.amount
        weekStats.value.saved += data.amount
        monthStats.value.saved += data.amount
      } else {
        todaySummary.value.total_spent += data.amount
        weekStats.value.spent += data.amount
        monthStats.value.spent += data.amount
      }

      todaySummary.value.total_xp += result.gaming.xp_earned
      weekStats.value.xp_earned += result.gaming.xp_earned

      // Mettre à jour le store gaming
      syncGamingStore(result)

      // Mettre à jour la quête localement
      if (result.quest && data.quest_id) {
        useQuestStore().applyActionToQuest(data.quest_id, data.type, data.amount)
      }

      // ✅ FIX 1: Toast avec contexte quête
      showActionToast(result, toast)

      return result
    } catch (e: any) {
      error.value = e.message
      toast.error("Impossible d'enregistrer l'action")
      return null
    } finally {
      submitting.value = false
    }
  }

  /**
   * Charger les actions du jour
   */
  async function fetchToday(): Promise<void> {
    loading.value = true

    try {
      const res = await api.get('/daily-actions/today')
      const data = res.data

      todayActions.value = data?.actions ?? []
      todaySummary.value = data?.summary ?? todaySummary.value
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les stats (semaine + mois)
   */
  async function fetchStats(): Promise<void> {
    try {
      const res = await api.get('/daily-actions/stats')
      const data = res.data

      weekStats.value = data?.week ?? weekStats.value
      monthStats.value = data?.month ?? monthStats.value

      todaySummary.value.has_acted = data?.has_acted_today ?? false
    } catch (e: any) {
      error.value = e.message
    }
  }

  /**
   * Charger l'historique
   */
  async function fetchHistory(days = 30): Promise<void> {
    loading.value = true

    try {
      const res = await api.get(`/daily-actions?days=${days}`)
      actions.value = res.data?.data ?? []
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprimer une action
   */
  async function deleteAction(id: number): Promise<boolean> {
    try {
      await api.delete(`/daily-actions/${id}`)

      todayActions.value = todayActions.value.filter((a) => a.id !== id)
      actions.value = actions.value.filter((a) => a.id !== id)

      useToastStore().success('Action supprimée')
      return true
    } catch {
      useToastStore().error("Impossible de supprimer l'action")
      return false
    }
  }

  // ==========================================
  // HELPERS PRIVÉS
  // ==========================================

  function syncGamingStore(result: ActionResult): void {
    try {
      const gaming = useGamingStore()
      gaming.player.level = result.gaming.level
      gaming.player.currentXP = result.gaming.total_xp
      gaming.currentStreak = result.streak.current
    } catch {
      // GamingStore optionnel
    }
  }

  /**
   * ✅ FIX 1: Toast post-action avec contexte quête
   * Avant : "+10 XP · 🔥 17j"
   * Après : "✈️ Voyage au Japon · 41% → 42% · +10 XP · 🔥 17j"
   */
  function showActionToast(result: ActionResult, toast: ReturnType<typeof useToastStore>): void {
    const xp = result.gaming.xp_earned
    const streak = result.streak.current
    const isLvlUp = result.gaming.leveled_up
    const quest = result.quest

    // Cas 1: Level up — message prioritaire
    if (isLvlUp) {
      const questCtx = quest ? `${quest.emoji} ${quest.name} · ` : ''
      toast.success(`${questCtx}Niveau ${result.gaming.new_level} atteint ! +${xp} XP`, {
        title: '🌟 Level Up !',
        duration: 6000,
      })
      return
    }

    // Cas 2: Milestone streak
    if (result.streak.is_milestone) {
      const questCtx = quest ? `${quest.emoji} ${quest.name} · ` : ''
      toast.success(
        `${questCtx}🔥 ${streak} jours de série ! +${result.streak.bonus_xp} XP bonus`,
        { title: '🏆 Milestone !', duration: 6000 },
      )
      return
    }

    // Cas 3: Quête complétée
    if (quest?.progress_percentage >= 100) {
      toast.success(`${quest.emoji} ${quest.name} terminée ! Objectif atteint ! 🎉`, {
        title: '🏆 Quête accomplie !',
        duration: 8000,
      })
      return
    }

    // Cas 4: Toast normal avec contexte quête (cas principal)
    const questPart = quest ? `${quest.emoji} ${quest.name} · ${quest.progress_percentage}%` : null

    const xpPart = `⚡ +${xp} XP`
    const streakPart = streak > 1 ? `🔥 ${streak}j` : null

    const body = [xpPart, streakPart].filter(Boolean).join(' · ')
    const title = questPart ?? 'Action enregistrée'

    toast.success(body, { title, duration: 4000 })
  }

  // ==========================================
  // API PUBLIQUE
  // ==========================================

  return {
    actions,
    todayActions,
    todaySummary,
    weekStats,
    monthStats,
    submitting,
    loading,
    error,
    lastResult,
    hasActedToday,
    netTodayBalance,
    netMonthBalance,
    submitAction,
    fetchToday,
    fetchStats,
    fetchHistory,
    deleteAction,
  }
})
