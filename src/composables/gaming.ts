// src/composables/gaming.ts
// ==========================================
// EXPORTS GROUPÉS DES COMPOSABLES GAMING EXISTANTS
// ==========================================

// Import de vos composables existants
export { useGaming } from './gaming/useGaming'
export { useAchievements } from './gaming/useAchievements'
export { useChallenges } from './gaming/useChallenges'
export { useStreaks } from './gaming/useStreaks'

// Si ces composables existent, les exporter aussi
// export { useXP } from './useXP'
// export { useLevel } from './useLevel'

// ==========================================
// COMPOSABLES MANQUANTS (SI BESOIN)
// ==========================================

import { ref, computed } from 'vue'

/**
 * Composable simple pour XP si il n'existe pas encore
 */
export function useXP() {
  const currentXP = ref(0)

  function addXP(amount: number) {
    currentXP.value += amount
  }

  return {
    currentXP,
    addXP
  }
}

/**
 * Composable simple pour Level si il n'existe pas encore
 */
export function useLevel() {
  const currentLevel = ref(1)

  function levelUp() {
    currentLevel.value += 1
  }

  return {
    currentLevel,
    levelUp
  }
}
