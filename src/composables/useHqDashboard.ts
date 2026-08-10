// src/composables/useHqDashboard.ts
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import { useQuestStore } from '@/stores/Queststore.ts'
import { useDailyActionStore } from '@/stores/Dailyactionstore.ts'
import { useGamingStore } from '@/stores/gamingStore'

/**
 * Orchestration des données de l'écran HQ.
 * Regroupe les fetchs déjà exposés par les stores/endpoints existants —
 * aucune nouvelle logique de calcul XP/streak/achievement.
 */
export function useHqDashboard() {
  const questStore = useQuestStore()
  const actionStore = useDailyActionStore()
  const gamingStore = useGamingStore()

  const todayChallenge = ref<any>(null)
  const completingChallenge = ref(false)

  const currentStreak = computed(() => {
    const streaks = Array.isArray(gamingStore.streaks) ? gamingStore.streaks : []
    return streaks.find((s: any) => s.type === 'daily')?.current_count ?? 0
  })

  async function loadTodayChallenge(): Promise<void> {
    try {
      const res = await api.get('/gaming/milestones')
      todayChallenge.value = res.data?.data?.[0] ?? null
    } catch {
      todayChallenge.value = null
    }
  }

  async function completeChallenge(success: boolean): Promise<void> {
    if (!todayChallenge.value) return
    completingChallenge.value = true

    try {
      if (success) await api.post(`/gaming/milestones/${todayChallenge.value.id}/claim`)
      todayChallenge.value = null
    } finally {
      completingChallenge.value = false
    }
  }

  async function loadYesterdayImpact(): Promise<void> {
    const net =
      actionStore.yesterdaySummary.total_saved - actionStore.yesterdaySummary.total_spent
    if (!questStore.mainQuest || net === 0) return

    await questStore.fetchProjectionImpact(Math.abs(net), net > 0 ? 'save' : 'spend')
  }

  async function loadAll(): Promise<void> {
    await Promise.all([
      questStore.fetchMainQuest(),
      actionStore.fetchToday(),
      actionStore.fetchYesterday(),
      actionStore.fetchStats(),
      gamingStore.initializeGaming(),
      loadTodayChallenge(),
    ])

    await loadYesterdayImpact()
  }

  onMounted(loadAll)

  return {
    questStore,
    actionStore,
    gamingStore,
    currentStreak,
    todayChallenge,
    completingChallenge,
    completeChallenge,
  }
}
