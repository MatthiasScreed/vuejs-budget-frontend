// src/stores/achievementStore.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/composables/core/useApi' // ⚠️ MANQUANT !

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
  name: string
  achievements: Achievement[]
}

// ==========================================
// STORE
// ==========================================

export const useAchievementStore = defineStore('achievement', () => {

  // ✅ INITIALISER l'API
  const api = useApi()

  // ==========================================
  // STATE
  // ==========================================

  const achievements = ref<Achievement[]>([])
  const userProgress = ref<Record<number, UserAchievementProgress>>({})
  const recentUnlocks = ref<Achievement[]>([]) // ✅ Initialisé comme tableau vide
  const categories = ref<AchievementCategory[]>([])

  const recentAchievements = computed(() => recentUnlocks.value)

  const loading = ref(false)
  const checking = ref(false)
  const error = ref<string | null>(null)

  // ==========================================
  // GETTERS
  // ==========================================

  const unlockedAchievements = computed(() => {
    return achievements.value.filter(a =>
      userProgress.value[a.id]?.unlocked === true
    )
  })

  const lockedAchievements = computed(() => {
    return achievements.value.filter(a =>
      !userProgress.value[a.id]?.unlocked
    )
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
   * Alias pour loadAchievementData (rétrocompatibilité)
   */
  async function fetchAchievements(): Promise<void> {
    return loadAchievementData()
  }

  /**
   * Alias pour loadAchievementData (rétrocompatibilité)
   */
  async function fetchUserAchievements(): Promise<void> {
    return loadAchievementData()
  }

  /**
   * Charger les données d'achievements
   */
  async function loadAchievementData(): Promise<void> {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      console.log('🏆 Chargement achievements...')

      // Charger les achievements disponibles
      const achievementsResponse = await api.get('/gaming/achievements')

      if (achievementsResponse.success && achievementsResponse.data) {
        achievements.value = Array.isArray(achievementsResponse.data) ? achievementsResponse.data : []
      }

      // Charger la progression utilisateur
      const progressResponse = await api.get('/gaming/user-achievements')

      if (progressResponse.success && progressResponse.data) {
        const progressData = Array.isArray(progressResponse.data) ? progressResponse.data : []

        // Mapper les achievements débloqués
        const unlocked = progressData.filter((a: any) => a.unlocked)

        // Mettre à jour recentUnlocks avec les derniers débloqués
        recentUnlocks.value = unlocked
          .sort((a: any, b: any) =>
            new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime()
          )
          .slice(0, 10) // Garder les 10 derniers

        // Mapper la progression
        progressData.forEach((progress: any) => {
          userProgress.value[progress.achievement_id] = {
            unlocked: progress.unlocked,
            progress: progress.progress || 0,
            unlocked_at: progress.unlocked_at
          }
        })
      }

      console.log('✅ Achievements loaded:', {
        total: achievements.value.length,
        unlocked: unlockedAchievements.value.length,
        recent: recentUnlocks.value.length
      })

    } catch (err: any) {
      console.error('❌ Erreur chargement achievements:', err)
      error.value = err.message || 'Erreur lors du chargement des achievements'
      recentUnlocks.value = [] // Fallback sur tableau vide

    } finally {
      loading.value = false
    }
  }

  /**
   * Vérifier les nouveaux achievements
   */
  async function checkAchievements(): Promise<{
    newUnlocks: Achievement[]
    xpGained: number
  }> {
    checking.value = true

    try {
      console.log('🔍 Vérification nouveaux achievements...')

      const response = await api.post('/gaming/achievements/check')

      if (response.success && response.data) {
        const { new_achievements, xp_gained } = response.data

        if (new_achievements && new_achievements.length > 0) {
          // Ajouter les nouveaux achievements
          recentUnlocks.value = [
            ...new_achievements,
            ...recentUnlocks.value
          ].slice(0, 10)

          // Mettre à jour la progression
          new_achievements.forEach((achievement: Achievement) => {
            userProgress.value[achievement.id] = {
              unlocked: true,
              progress: 100,
              unlocked_at: new Date().toISOString()
            }
          })

          console.log('🎉 Nouveaux achievements débloqués:', new_achievements.length)
        }

        return {
          newUnlocks: new_achievements || [],
          xpGained: xp_gained || 0
        }
      }

      return { newUnlocks: [], xpGained: 0 }

    } catch (err: any) {
      console.error('❌ Erreur vérification achievements:', err)
      return { newUnlocks: [], xpGained: 0 }
    } finally {
      checking.value = false
    }
  }

  /**
   * Réinitialiser le store
   */
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
    $reset
  }
})

// ==========================================
// EXPORT DEFAULT
// ==========================================

export default useAchievementStore
