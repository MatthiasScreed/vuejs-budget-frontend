import { ref, computed } from 'vue'
import { useApi, useCache } from '@/composables/core'
import type { UserLevel, XPResult, ApiResponse } from '@/types'

interface XPConfig {
  levelCap: number
  xpMultiplier: number
  bonusActions: string[]
}

/**
 * Composable dédié au système XP et niveaux
 * Calculs, progression, bonus et level-up
 */
export function useXP() {
  const { post } = useApi()
  const { remember, invalidateByTag } = useCache()

  // State
  const currentLevel = ref<UserLevel | null>(null)
  const xpHistory = ref<any[]>([])
  const loading = ref(false)

  // Configuration XP
  const config: XPConfig = {
    levelCap: 100,
    xpMultiplier: 1.0,
    bonusActions: ['first_transaction', 'daily_login', 'complete_goal']
  }

  /**
   * Attribuer de l'XP pour une action
   */
  async function awardXP(action: string, amount?: number): Promise<XPResult> {
    try {
      const xpAmount = calculateXP(action, amount)

      const response = await post<XPResult>('/gaming/xp', {
        action,
        amount: xpAmount,
        context: { original_amount: amount }
      })

      if (response.success && response.data) {
        await updateXPState(response.data)
        invalidateByTag('gaming')

        return response.data
      }

      return { xp_gained: 0, achievements_unlocked: [], level_up: false }
    } catch (error) {
      console.error('Erreur attribution XP:', error)
      return { xp_gained: 0, achievements_unlocked: [], level_up: false }
    }
  }

  /**
   * Calculer l'XP pour une action
   */
  function calculateXP(action: string, amount?: number): number {
    const baseXP = getBaseXP(action)
    let finalXP = baseXP

    // Bonus pour montant (transactions)
    if (action === 'create_transaction' && amount) {
      finalXP += Math.min(50, Math.floor(amount / 100))
    }

    // Bonus pour actions spéciales
    if (config.bonusActions.includes(action)) {
      finalXP = Math.floor(finalXP * 1.5)
    }

    return Math.floor(finalXP * config.xpMultiplier)
  }

  /**
   * Obtenir l'XP de base pour une action
   */
  function getBaseXP(action: string): number {
    const xpTable: Record<string, number> = {
      // Transactions
      create_transaction: 10,
      edit_transaction: 5,
      delete_transaction: 2,

      // Objectifs
      create_goal: 50,
      complete_goal: 100,
      update_goal: 15,

      // Catégories
      add_category: 25,
      customize_category: 10,

      // Engagement
      daily_login: 5,
      weekly_budget_respect: 75,
      monthly_budget_respect: 150,

      // Spéciaux
      first_transaction: 100,
      invite_friend: 200,
      share_achievement: 30
    }

    return xpTable[action] || 0
  }

  /**
   * Calculer l'XP requis pour un niveau
   */
  function getXPForLevel(level: number): number {
    if (level <= 1) return 0

    // Formule progressive : level² * 100
    return Math.floor(Math.pow(level, 2) * 100)
  }

  /**
   * Obtenir le niveau pour un XP total
   */
  function getLevelForXP(totalXP: number): number {
    for (let level = 1; level <= config.levelCap; level++) {
      if (totalXP < getXPForLevel(level)) {
        return level - 1
      }
    }

    return config.levelCap
  }

  /**
   * Mettre à jour le state XP local
   */
  async function updateXPState(result: XPResult): Promise<void> {
    if (currentLevel.value) {
      currentLevel.value.total_xp += result.xp_gained

      if (result.level_up && result.new_level) {
        currentLevel.value.level = result.new_level
      }
    }

    // Ajouter à l'historique
    xpHistory.value.unshift({
      action: 'manual',
      xp_gained: result.xp_gained,
      timestamp: new Date().toISOString()
    })

    // Garder seulement les 50 dernières entrées
    if (xpHistory.value.length > 50) {
      xpHistory.value = xpHistory.value.slice(0, 50)
    }
  }

  /**
   * Charger l'historique XP
   */
  async function loadXPHistory(): Promise<void> {
    xpHistory.value = await remember(
      'xp_history',
      async () => {
        const response = await post<any[]>('/gaming/xp/history')
        return response.data || []
      },
      5 * 60 * 1000, // 5 minutes
      ['gaming', 'xp']
    )
  }

  /**
   * Formater l'XP avec icônes
   */
  function formatXPDisplay(xp: number): string {
    if (xp < 1000) return `${xp} XP`
    if (xp < 1000000) return `${(xp / 1000).toFixed(1)}k XP`

    return `${(xp / 1000000).toFixed(1)}M XP`
  }

  // Computed properties
  const totalXP = computed(() => currentLevel.value?.total_xp || 0)
  const userLevel = computed(() => currentLevel.value?.level || 1)
  const currentLevelXP = computed(() => currentLevel.value?.current_level_xp || 0)
  const nextLevelXP = computed(() => currentLevel.value?.next_level_xp || 100)

  const progressPercent = computed(() => {
    const next = nextLevelXP.value
    return next > 0 ? Math.round((currentLevelXP.value / next) * 100) : 0
  })

  const isMaxLevel = computed(() => userLevel.value >= config.levelCap)

  return {
    // State
    currentLevel,
    xpHistory,
    loading,

    // Computed
    totalXP,
    userLevel,
    currentLevelXP,
    nextLevelXP,
    progressPercent,
    isMaxLevel,

    // Methods
    awardXP,
    calculateXP,
    getXPForLevel,
    getLevelForXP,
    loadXPHistory,
    formatXPDisplay
  }
}
