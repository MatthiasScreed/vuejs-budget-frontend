// src/stores/insightStore.ts

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { insightService } from '@/services/insightService'
import type { FinancialInsight, InsightSummary, InsightFilters } from '@/services/insightService'

export const useInsightStore = defineStore('insight', () => {
  // ==========================================
  // STATE
  // ==========================================

  const insights = ref<FinancialInsight[]>([])
  const summary = ref<InsightSummary | null>(null)
  const currentInsight = ref<FinancialInsight | null>(null)

  // Pagination
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)

  // Loading states
  const loading = ref(false)
  const generating = ref(false)
  const error = ref<string | null>(null)

  // ==========================================
  // GETTERS
  // ==========================================

  const unreadCount = computed(() => summary.value?.unread ?? 0)

  const hasUnread = computed(() => unreadCount.value > 0)

  const totalPotentialSaving = computed(() => summary.value?.total_potential_saving ?? 0)

  const highPriorityInsights = computed(() => insights.value.filter((i) => i.priority === 1))

  const actionableInsights = computed(() =>
    insights.value.filter((i) => i.action_label && !i.acted_at),
  )

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Charger les insights avec filtres
   */
  async function loadInsights(filters: InsightFilters = {}): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const result = await insightService.getInsights(filters)
      insights.value = result.data
      currentPage.value = result.meta.current_page
      lastPage.value = result.meta.last_page
      total.value = result.meta.total
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erreur chargement'
      console.error('loadInsights error:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger le résumé (compteurs)
   */
  async function loadSummary(): Promise<void> {
    try {
      summary.value = await insightService.getSummary()
    } catch (e: any) {
      console.error('loadSummary error:', e)
    }
  }

  /**
   * Générer de nouveaux insights
   */
  async function generateInsights(): Promise<void> {
    generating.value = true
    error.value = null

    try {
      const result = await insightService.generate()

      // Recharger la liste et le résumé
      await Promise.all([loadInsights(), loadSummary()])

      return result as any
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erreur génération'
      console.error('generateInsights error:', e)
    } finally {
      generating.value = false
    }
  }

  /**
   * Marquer un insight comme lu
   */
  async function markAsRead(id: number): Promise<void> {
    try {
      await insightService.markAsRead(id)
      updateInsightLocally(id, { is_read: true })
      decrementUnread()
    } catch (e: any) {
      console.error('markAsRead error:', e)
    }
  }

  /**
   * Marquer action effectuée (+ XP)
   */
  async function markAsActed(id: number): Promise<any> {
    try {
      const result = await insightService.markAsActed(id)
      updateInsightLocally(id, {
        acted_at: new Date().toISOString(),
      })
      return result
    } catch (e: any) {
      console.error('markAsActed error:', e)
    }
  }

  /**
   * Rejeter un insight
   */
  async function dismiss(id: number): Promise<void> {
    try {
      await insightService.dismiss(id)
      removeInsightLocally(id)
      await loadSummary()
    } catch (e: any) {
      console.error('dismiss error:', e)
    }
  }

  /**
   * Tout marquer comme lu
   */
  async function markAllAsRead(): Promise<void> {
    try {
      await insightService.markAllAsRead()
      insights.value.forEach((i) => (i.is_read = true))
      if (summary.value) summary.value.unread = 0
    } catch (e: any) {
      console.error('markAllAsRead error:', e)
    }
  }

  /**
   * Supprimer un insight
   */
  async function deleteInsight(id: number): Promise<void> {
    try {
      await insightService.deleteInsight(id)
      removeInsightLocally(id)
      await loadSummary()
    } catch (e: any) {
      console.error('deleteInsight error:', e)
    }
  }

  // ==========================================
  // HELPERS LOCAUX
  // ==========================================

  /**
   * Mise à jour optimiste d'un insight
   */
  function updateInsightLocally(id: number, updates: Partial<FinancialInsight>): void {
    const idx = insights.value.findIndex((i) => i.id === id)
    if (idx !== -1) {
      insights.value[idx] = {
        ...insights.value[idx],
        ...updates,
      }
    }
  }

  /**
   * Supprimer un insight localement
   */
  function removeInsightLocally(id: number): void {
    insights.value = insights.value.filter((i) => i.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  /**
   * Décrémenter le compteur non-lus
   */
  function decrementUnread(): void {
    if (summary.value && summary.value.unread > 0) {
      summary.value.unread--
    }
  }

  /**
   * Reset du store
   */
  function $reset(): void {
    insights.value = []
    summary.value = null
    currentInsight.value = null
    currentPage.value = 1
    lastPage.value = 1
    total.value = 0
    loading.value = false
    generating.value = false
    error.value = null
  }

  return {
    // State
    insights,
    summary,
    currentInsight,
    currentPage,
    lastPage,
    total,
    loading,
    generating,
    error,
    // Getters
    unreadCount,
    hasUnread,
    totalPotentialSaving,
    highPriorityInsights,
    actionableInsights,
    // Actions
    loadInsights,
    loadSummary,
    generateInsights,
    markAsRead,
    markAsActed,
    dismiss,
    markAllAsRead,
    deleteInsight,
    $reset,
  }
})
