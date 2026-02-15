// src/stores/achievementStore.ts - VERSION CORRIGÉE
// ✅ Utilise @/services/api (comme goalStore et transactionStore)
// ❌ Plus de useApi() qui pointait vers une URL différente
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

// ==========================================
// TYPES
// ==========================================

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  xp_reward: number
  criteria: any
  rarity: string
  category?: string
}

interface UserAchievementProgress {
  unlocked: boolean
  progress: number
  unlocked_at?: string
}

interface AchievementCategory {
  id: string
  name: string
  icon: string
  achievements: Achievement[]
}

// ==========================================
// STORE
// ==========================================

export const useAchievementStore = defineStore('achievement', () => {
  // ==========================================
  // STATE
  // ==========================================

  const achievements = ref<Achievement[]>([])
  const userProgress = ref<Record<number, UserAchievementProgress>>({})
  const recentUnlocks = ref<Achievement[]>([])
  const categories = ref<AchievementCategory[]>([])

  const loading = ref(false)
  const checking = ref(false)
  const error = ref<string | null>(null)

  // ==========================================
  // 🔐 AUTH GUARD (même pattern que goalStore)
  // ==========================================

  async function ensureAuthenticated(): Promise<boolean> {
    const authStore = useAuthStore()

    if (!authStore.isInitialized) {
      let attempts = 0
      while (!authStore.isInitialized && attempts < 30) {
        await new Promise((r) => setTimeout(r, 100))
        attempts++
      }
      if (!authStore.isInitialized) return false
    }

    return authStore.isAuthenticated
  }

  // ==========================================
  // GETTERS
  // ==========================================

  const recentAchievements = computed(() => recentUnlocks.value)

  const unlockedAchievements = computed(() => {
    return achievements.value.filter((a) => userProgress.value[a.id]?.unlocked === true)
  })

  const lockedAchievements = computed(() => {
    return achievements.value.filter((a) => !userProgress.value[a.id]?.unlocked)
  })

  const totalXP = computed(() => {
    return unlockedAchievements.value.reduce((sum, a) => sum + a.xp_reward, 0)
  })

  const completionPercentage = computed(() => {
    const total = achievements.value.length
    const unlocked = unlockedAchievements.value.length
    return total > 0 ? Math.round((unlocked / total) * 100) : 0
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Charger les données d'achievements
   * ✅ Utilise api singleton (même URL que les autres stores)
   */
  async function loadAchievementData(): Promise<void> {
    if (loading.value) return

    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Achievements] Non authentifié')
      error.value = 'Authentification requise'
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('🏆 Chargement achievements...')

      // Charger les achievements disponibles
      const achievementsRes = await api.get<Achievement[]>('/gaming/achievements')

      if (achievementsRes.success && achievementsRes.data) {
        achievements.value = Array.isArray(achievementsRes.data) ? achievementsRes.data : []
      }

      // Charger la progression utilisateur
      const progressRes = await api.get<any[]>('/gaming/user-achievements')

      if (progressRes.success && progressRes.data) {
        const progressData = Array.isArray(progressRes.data) ? progressRes.data : []

        // Mapper les unlocks récents
        const unlocked = progressData.filter((a: any) => a.unlocked)

        recentUnlocks.value = unlocked
          .sort(
            (a: any, b: any) =>
              new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime(),
          )
          .slice(0, 10)

        // Mapper la progression
        progressData.forEach((p: any) => {
          userProgress.value[p.achievement_id] = {
            unlocked: p.unlocked,
            progress: p.progress || 0,
            unlocked_at: p.unlocked_at,
          }
        })
      }

      // Construire les catégories
      buildCategories()

      console.log('✅ Achievements loaded:', {
        total: achievements.value.length,
        unlocked: unlockedAchievements.value.length,
        recent: recentUnlocks.value.length,
      })
    } catch (err: any) {
      console.error('❌ Erreur achievements:', err)
      error.value = err.message || 'Erreur chargement'
      recentUnlocks.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Construire les catégories à partir des achievements
   */
  function buildCategories(): void {
    const categoryMap = new Map<string, AchievementCategory>()

    const defaultCategories: Record<string, { name: string; icon: string }> = {
      transactions: { name: 'Transactions', icon: '💰' },
      savings: { name: 'Épargne', icon: '🏦' },
      streaks: { name: 'Séries', icon: '🔥' },
      goals: { name: 'Objectifs', icon: '🎯' },
      general: { name: 'Général', icon: '⭐' },
    }

    achievements.value.forEach((a) => {
      const catKey = a.category || 'general'
      if (!categoryMap.has(catKey)) {
        const def = defaultCategories[catKey] || { name: catKey, icon: '📋' }
        categoryMap.set(catKey, {
          id: catKey,
          name: def.name,
          icon: def.icon,
          achievements: [],
        })
      }
      categoryMap.get(catKey)!.achievements.push(a)
    })

    categories.value = Array.from(categoryMap.values())
  }

  /**
   * Vérifier les nouveaux achievements
   * ✅ Utilise api singleton
   */
  async function checkAchievements(): Promise<{
    newUnlocks: Achievement[]
    xpGained: number
  }> {
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      return { newUnlocks: [], xpGained: 0 }
    }

    checking.value = true

    try {
      console.log('🔍 Vérification achievements...')

      const response = await api.post<any>('/gaming/achievements/check')

      if (response.success && response.data) {
        const newAchievements = response.data.new_achievements || []
        const xpGained = response.data.xp_gained || 0

        if (newAchievements.length > 0) {
          recentUnlocks.value = [...newAchievements, ...recentUnlocks.value].slice(0, 10)

          newAchievements.forEach((a: Achievement) => {
            userProgress.value[a.id] = {
              unlocked: true,
              progress: 100,
              unlocked_at: new Date().toISOString(),
            }
          })

          console.log('🎉 Nouveaux achievements:', newAchievements.length)
        }

        return { newUnlocks: newAchievements, xpGained }
      }

      return { newUnlocks: [], xpGained: 0 }
    } catch (err: any) {
      console.error('❌ Erreur check achievements:', err)
      return { newUnlocks: [], xpGained: 0 }
    } finally {
      checking.value = false
    }
  }

  // Aliases rétrocompatibilité
  const fetchAchievements = loadAchievementData
  const fetchUserAchievements = loadAchievementData

  function $reset(): void {
    achievements.value = []
    userProgress.value = {}
    recentUnlocks.value = []
    categories.value = []
    loading.value = false
    checking.value = false
    error.value = null
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    achievements,
    userProgress,
    recentUnlocks,
    categories,
    loading,
    checking,
    error,

    // Getters
    unlockedAchievements,
    lockedAchievements,
    totalXP,
    completionPercentage,
    recentAchievements,

    // Actions
    fetchAchievements,
    fetchUserAchievements,
    loadAchievementData,
    checkAchievements,
    $reset,
  }
})

export default useAchievementStore
