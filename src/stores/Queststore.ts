import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'
import { useToastStore } from '@/stores/toastStore'

// ==========================================
// TYPES
// ==========================================

export interface Quest {
  id: number
  name: string
  emoji: string
  target_amount: number
  current_amount: number
  remaining_amount: number
  progress_percentage: number
  target_date: string | null
  days_remaining: number | null
  status: 'active' | 'completed' | 'abandoned'
  is_main: boolean
  is_completed: boolean
  completed_at: string | null
  created_at: string
}

interface CreateQuestData {
  name: string
  target_amount: number
  target_date?: string | null
  emoji?: string
}

interface UpdateQuestData extends Partial<CreateQuestData> {}

// ==========================================
// STORE
// ==========================================

export const useQuestStore = defineStore('quest', () => {
  // ==========================================
  // STATE
  // ==========================================

  const quests = ref<Quest[]>([])
  const mainQuest = ref<Quest | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  // ==========================================
  // GETTERS
  // ==========================================

  const activeQuests = computed(() => quests.value.filter((q) => q.status === 'active'))

  const completedQuests = computed(() => quests.value.filter((q) => q.status === 'completed'))

  const hasMainQuest = computed(() => mainQuest.value !== null)

  const mainProgress = computed(() => mainQuest.value?.progress_percentage ?? 0)

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Charger toutes les quêtes
   */
  async function fetchQuests(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const res = await api.get('/quests')
      quests.value = res.data?.data ?? []
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger la quête principale (dashboard)
   */
  async function fetchMainQuest(): Promise<void> {
    try {
      const res = await api.get('/quests/main')
      mainQuest.value = res.data?.data ?? null
    } catch (e: any) {
      error.value = e.message
    }
  }

  /**
   * Créer une nouvelle quête
   */
  async function createQuest(data: CreateQuestData): Promise<Quest | null> {
    saving.value = true
    error.value = null
    const toast = useToastStore()

    try {
      const res = await api.post('/quests', data)
      const quest = res.data?.data as Quest

      quests.value.unshift(quest)

      if (quest.is_main) {
        mainQuest.value = quest
      }

      toast.success(res.data?.message ?? 'Quête créée !', { title: '🎯 Nouvelle quête' })
      return quest
    } catch (e: any) {
      error.value = e.message
      toast.error('Impossible de créer la quête')
      return null
    } finally {
      saving.value = false
    }
  }

  /**
   * Mettre à jour une quête
   */
  async function updateQuest(id: number, data: UpdateQuestData): Promise<Quest | null> {
    saving.value = true
    error.value = null

    try {
      const res = await api.put(`/quests/${id}`, data)
      const quest = res.data?.data as Quest

      updateQuestInList(quest)
      if (quest.is_main) mainQuest.value = quest

      useToastStore().success('Quête mise à jour')
      return quest
    } catch (e: any) {
      error.value = e.message
      useToastStore().error('Impossible de mettre à jour la quête')
      return null
    } finally {
      saving.value = false
    }
  }

  /**
   * Définir comme quête principale
   */
  async function setMainQuest(id: number): Promise<void> {
    try {
      const res = await api.post(`/quests/${id}/set-main`)
      const quest = res.data?.data as Quest

      quests.value = quests.value.map((q) => ({ ...q, is_main: q.id === id }))
      mainQuest.value = quest

      useToastStore().success(`${quest.emoji} ${quest.name} est maintenant ta quête principale`)
    } catch (e: any) {
      useToastStore().error('Impossible de changer la quête principale')
    }
  }

  /**
   * Supprimer une quête
   */
  async function deleteQuest(id: number): Promise<boolean> {
    try {
      await api.delete(`/quests/${id}`)

      quests.value = quests.value.filter((q) => q.id !== id)

      if (mainQuest.value?.id === id) {
        mainQuest.value = quests.value.find((q) => q.is_main) ?? null
      }

      useToastStore().success('Quête supprimée')
      return true
    } catch (e: any) {
      useToastStore().error('Impossible de supprimer la quête')
      return false
    }
  }

  /**
   * Mettre à jour localement après une action quotidienne
   */
  function applyActionToQuest(questId: number, type: 'save' | 'spend', amount: number): void {
    const quest = quests.value.find((q) => q.id === questId)
    if (!quest) return

    if (type === 'save') {
      quest.current_amount = Math.min(quest.target_amount, quest.current_amount + amount)
    } else {
      quest.current_amount = Math.max(0, quest.current_amount - amount)
    }

    quest.remaining_amount = Math.max(0, quest.target_amount - quest.current_amount)
    quest.progress_percentage = Math.min(
      100,
      Math.round((quest.current_amount / quest.target_amount) * 100 * 10) / 10,
    )
    quest.is_completed = quest.current_amount >= quest.target_amount

    if (quest.is_main) {
      mainQuest.value = { ...quest }
    }
  }

  // ==========================================
  // HELPERS PRIVÉS
  // ==========================================

  function updateQuestInList(quest: Quest): void {
    const idx = quests.value.findIndex((q) => q.id === quest.id)
    if (idx !== -1) quests.value[idx] = quest
  }

  // ==========================================
  // API PUBLIQUE
  // ==========================================

  return {
    quests,
    mainQuest,
    loading,
    saving,
    error,
    activeQuests,
    completedQuests,
    hasMainQuest,
    mainProgress,
    fetchQuests,
    fetchMainQuest,
    createQuest,
    updateQuest,
    setMainQuest,
    deleteQuest,
    applyActionToQuest,
  }
})
