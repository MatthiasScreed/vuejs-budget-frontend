// src/composables/useInsightAction.ts
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useInsightStore } from '@/stores/insightStore'
import { useGoalStore } from '@/stores/goalStore'

/**
 * Logique partagée de traitement d'une action Coach IA sur un insight.
 * Extrait de InsightsPanel.vue pour être réutilisable par CoachInsightSingle.vue.
 */
export function useInsightAction(handleInsightAction: (id: number) => Promise<any>) {
  const router = useRouter()
  const goalStore = useGoalStore()
  const insightStore = useInsightStore()

  const showActionModal = ref(false)
  const activeInsight = ref<any>(null)
  const activeAction = ref<any>(null)
  const actionLoading = ref<number | null>(null)
  const creatingGoal = ref(false)
  const showXpToast = ref(false)
  const lastXpEarned = ref(0)
  const processingInsightIds = ref<Set<number>>(new Set())

  function parseActionData(raw: any): Record<string, any> {
    if (!raw) return {}
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw)
      } catch {
        return {}
      }
    }
    return raw
  }

  function getDefaultTargetDate(): string {
    const d = new Date()
    d.setMonth(d.getMonth() + 6)
    return d.toISOString().split('T')[0]
  }

  function showXpReward(xp?: number): void {
    if (!xp) return
    lastXpEarned.value = xp
    showXpToast.value = true
    setTimeout(() => {
      showXpToast.value = false
    }, 2500)
  }

  function navigateIfUrl(url: string | null): void {
    if (!url) return
    if (url.startsWith('http')) window.open(url, '_blank')
    else router.push(url)
  }

  async function createGoalFromInsight(
    template: Record<string, any>,
    redirectUrl: string | null,
  ): Promise<void> {
    if (creatingGoal.value) return
    creatingGoal.value = true

    try {
      const goalData = {
        name: template.name ?? "Objectif d'épargne",
        description: template.description ?? 'Objectif créé par le Coach IA',
        target_amount: template.target_amount ?? 1000,
        current_amount: 0,
        target_date: template.target_date ?? getDefaultTargetDate(),
        icon: template.icon ?? '💰',
        priority: template.priority ?? 'medium',
      }

      const success = await goalStore.createGoal(goalData)

      if (success) {
        await goalStore.fetchGoals()
        router.push('/app/goals')
      } else {
        navigateIfUrl(redirectUrl)
      }
    } catch (err) {
      console.error('❌ Erreur création objectif:', err)
      navigateIfUrl(redirectUrl)
    } finally {
      creatingGoal.value = false
    }
  }

  async function removeInsightAfterAction(insightId: number, delay: number): Promise<void> {
    setTimeout(async () => {
      insightStore.insights = insightStore.insights.filter((i) => i.id !== insightId)
      await insightStore.loadSummary()
    }, delay)
  }

  async function handleAction(insight: any): Promise<void> {
    if (processingInsightIds.value.has(insight.id) || creatingGoal.value) return
    processingInsightIds.value.add(insight.id)
    actionLoading.value = insight.id

    try {
      const actionData = parseActionData(insight.action_data)
      const result = await handleInsightAction(insight.id)

      if (result?.gaming?.xp_earned) showXpReward(result.gaming.xp_earned)

      const redirectUrl = actionData.url ?? null

      if (actionData.create_goal) {
        await createGoalFromInsight(actionData.create_goal, redirectUrl)
      } else if (result?.gaming?.xp_earned) {
        setTimeout(() => navigateIfUrl(redirectUrl), 1500)
      } else {
        navigateIfUrl(redirectUrl)
      }

      await removeInsightAfterAction(insight.id, result?.gaming?.xp_earned ? 2000 : 500)
    } finally {
      processingInsightIds.value.delete(insight.id)
      actionLoading.value = null
    }
  }

  async function handleModalSuccess(_result: any): Promise<void> {
    if (!activeInsight.value) return

    try {
      const gaming = await handleInsightAction(activeInsight.value.id)
      showXpReward(gaming?.gaming?.xp_earned ?? gaming?.xp_earned)
      await removeInsightAfterAction(activeInsight.value.id, 2000)
    } finally {
      activeInsight.value = null
      activeAction.value = null
    }
  }

  return {
    showActionModal,
    activeInsight,
    activeAction,
    actionLoading,
    showXpToast,
    lastXpEarned,
    handleAction,
    handleModalSuccess,
  }
}
