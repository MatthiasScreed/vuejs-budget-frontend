// ==========================================
// USE XP COMPOSABLE - STUB TEMPORAIRE
// ==========================================

import { ref } from 'vue'

export interface XPGainResult {
  xp_gained: number
  level_up?: boolean
  old_level?: number
  new_level?: number
  rewards?: any[]
}

export function useXP() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Ajouter de l'XP à l'utilisateur
   */
  async function addXP(amount: number, source: string, description?: string): Promise<XPGainResult> {
    loading.value = true
    error.value = null

    try {
      // TODO: Appeler l'API réelle
      console.log(`[useXP] +${amount} XP from ${source}:`, description)

      // Simulation de la réponse
      return {
        xp_gained: amount,
        level_up: false
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Erreur addXP:', err)
      return {
        xp_gained: 0
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Calculer l'XP bonus basé sur un multiplicateur
   */
  function calculateBonusXP(baseXP: number, multiplier: number): number {
    return Math.floor(baseXP * multiplier)
  }

  /**
   * Calculer l'XP total avec bonus
   */
  function calculateTotalXP(baseXP: number, bonusMultiplier: number = 0): number {
    const bonus = calculateBonusXP(baseXP, bonusMultiplier)
    return baseXP + bonus
  }

  return {
    loading,
    error,
    addXP,
    calculateBonusXP,
    calculateTotalXP
  }
}
