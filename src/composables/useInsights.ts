// src/composables/useInsights.ts

import { ref, computed, onMounted } from 'vue'
import { useInsightStore } from '@/stores/insightStore'
import { storeToRefs } from 'pinia'
import type { InsightFilters } from '@/services/insightService'

/**
 * Composable pour utiliser les insights dans les composants
 * Abstraction du store avec logique métier additionnelle
 */
export function useInsights(autoLoad = true) {
  const store = useInsightStore()

  const {
    insights,
    summary,
    loading,
    generating,
    error,
    unreadCount,
    hasUnread,
    totalPotentialSaving,
    highPriorityInsights,
    actionableInsights,
    currentPage,
    lastPage,
    total,
  } = storeToRefs(store)

  // Filtres actifs
  const filters = ref<InsightFilters>({
    per_page: 15,
    page: 1,
  })

  // ==========================================
  // COMPUTED
  // ==========================================

  /**
   * Insights groupés par type
   */
  const insightsByType = computed(() => {
    const grouped: Record<string, typeof insights.value> = {}

    insights.value.forEach((insight) => {
      if (!grouped[insight.type]) {
        grouped[insight.type] = []
      }
      grouped[insight.type].push(insight)
    })

    return grouped
  })

  /**
   * Badge texte pour le compteur
   */
  const badgeText = computed(() => {
    const count = unreadCount.value
    return count > 99 ? '99+' : String(count)
  })

  /**
   * Icône de priorité
   */
  const priorityIcons: Record<number, string> = {
    1: '🔴',
    2: '🟡',
    3: '🟢',
  }

  /**
   * Labels de type
   */
  const typeLabels: Record<string, string> = {
    cost_reduction: 'Réduction de coûts',
    savings_opportunity: "Opportunité d'épargne",
    unusual_spending: 'Dépense inhabituelle',
    goal_acceleration: 'Objectifs',
    behavioral_pattern: 'Habitudes',
  }

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Charger insights + résumé
   */
  async function loadAll(): Promise<void> {
    await Promise.all([store.loadInsights(filters.value), store.loadSummary()])
  }

  /**
   * Appliquer des filtres et recharger
   */
  async function applyFilters(newFilters: Partial<InsightFilters>): Promise<void> {
    filters.value = {
      ...filters.value,
      ...newFilters,
      page: 1,
    }
    await store.loadInsights(filters.value)
  }

  /**
   * Filtrer par type
   */
  async function filterByType(type: string | undefined): Promise<void> {
    await applyFilters({ type })
  }

  /**
   * Afficher uniquement non-lus
   */
  async function showUnreadOnly(unread: boolean): Promise<void> {
    await applyFilters({ unread_only: unread })
  }

  /**
   * Changer de page
   */
  async function goToPage(page: number): Promise<void> {
    filters.value.page = page
    await store.loadInsights(filters.value)
  }

  /**
   * Générer nouveaux insights
   */
  async function generate(): Promise<void> {
    await store.generateInsights()
  }

  /**
   * ✅ CORRIGÉ : Action sur un insight
   * - Parse action_data si string JSON
   * - Met à jour l'insight localement sans attendre un refetch
   * - Retourne la réponse API complète (avec gaming.xp_earned)
   */
  async function handleInsightAction(id: number): Promise<any> {
    const insight = insights.value.find((i) => i.id === id)

    if (insight && !insight.is_read) {
      await store.markAsRead(id)
    }

    const result = await store.markAsActed(id)

    // ✅ Mettre à jour l'insight localement pour que acted_at soit visible
    // sans attendre un refetch complet (évite le flash)
    const idx = insights.value.findIndex((i) => i.id === id)
    if (idx !== -1) {
      insights.value[idx] = {
        ...insights.value[idx],
        acted_at: new Date().toISOString(),
        is_read: true,
      }
    }

    // Recharger le summary (compteurs à jour)
    await store.loadSummary()

    return result
  }

  /**
   * Obtenir le label d'un type
   */
  function getTypeLabel(type: string): string {
    return typeLabels[type] ?? type
  }

  /**
   * Obtenir l'icône de priorité
   */
  function getPriorityIcon(priority: number): string {
    return priorityIcons[priority] ?? '⚪'
  }

  // Auto-load au montage si demandé
  if (autoLoad) {
    onMounted(() => loadAll())
  }

  return {
    // State (refs du store)
    insights,
    summary,
    loading,
    generating,
    error,
    filters,
    currentPage,
    lastPage,
    total,
    // Getters
    unreadCount,
    hasUnread,
    totalPotentialSaving,
    highPriorityInsights,
    actionableInsights,
    insightsByType,
    badgeText,
    // Actions
    loadAll,
    applyFilters,
    filterByType,
    showUnreadOnly,
    goToPage,
    generate,
    handleInsightAction,
    markAsRead: store.markAsRead,
    dismiss: store.dismiss,
    markAllAsRead: store.markAllAsRead,
    deleteInsight: store.deleteInsight,
    // Helpers
    getTypeLabel,
    getPriorityIcon,
  }
}
