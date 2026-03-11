// src/stores/achievementStore.ts — VERSION CORRIGÉE
// ✅ Parse correctement le format { achievement_id, achievement: {...}, unlocked, progress }
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
  // AUTH GUARD
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
    return unlockedAchievements.value.reduce((sum, a) => sum + (a.xp_reward || 0), 0)
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
   * ✅ Charger les achievements — UN SEUL appel API suffit
   * L'endpoint user-achievements retourne TOUS les achievements
   * avec leur statut unlocked/locked pour l'utilisateur
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

      const response = await api.get<any[]>('/gaming/user-achievements')

      if (response.success && response.data) {
        const rawData = Array.isArray(response.data) ? response.data : []

        // ✅ Extraire les achievements depuis le format imbriqué
        // Format API: { achievement_id, achievement: {...}, unlocked, progress }
        const parsedAchievements: Achievement[] = []
        const parsedProgress: Record<number, UserAchievementProgress> = {}
        const unlocked: any[] = []

        rawData.forEach((item: any) => {
          // Extraire l'achievement (format imbriqué ou plat)
          const achData = item.achievement || item
          const achId = item.achievement_id || achData.id

          if (achId) {
            // Ajouter à la liste des achievements
            parsedAchievements.push({
              id: achId,
              name: achData.name || '',
              description: achData.description || '',
              icon: achData.icon || '🏆',
              xp_reward: achData.xp_reward || achData.points || 0,
              criteria: achData.criteria || null,
              rarity: achData.rarity || 'common',
              category: achData.category || achData.type || 'general',
            })

            // Mapper la progression
            parsedProgress[achId] = {
              unlocked: item.unlocked === true,
              progress: item.progress || 0,
              unlocked_at: item.unlocked_at || undefined,
            }

            // Collecter les débloqués pour les récents
            if (item.unlocked) {
              unlocked.push({
                ...parsedAchievements[parsedAchievements.length - 1],
                unlocked_at: item.unlocked_at,
              })
            }
          }
        })

        // Mettre à jour le state
        achievements.value = parsedAchievements
        userProgress.value = parsedProgress

        // Trier les récents par date
        recentUnlocks.value = unlocked
          .filter((a) => a.unlocked_at)
          .sort((a, b) => {
            const dateA = new Date(a.unlocked_at).getTime() || 0
            const dateB = new Date(b.unlocked_at).getTime() || 0
            return dateB - dateA
          })
          .slice(0, 10)

        // Construire les catégories
        buildCategories()

        console.log('✅ Achievements loaded:', {
          total: achievements.value.length,
          unlocked: unlockedAchievements.value.length,
          recent: recentUnlocks.value.length,
        })
      }
    } catch (err: any) {
      console.error('❌ Erreur achievements:', err)
      error.value = err.message || 'Erreur chargement'
      recentUnlocks.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Construire les catégories
   */
  function buildCategories(): void {
    const categoryMap = new Map<string, AchievementCategory>()

    const defaultCategories: Record<string, { name: string; icon: string }> = {
      transaction: { name: 'Transactions', icon: '💰' },
      transactions: { name: 'Transactions', icon: '💰' },
      savings: { name: 'Épargne', icon: '🏦' },
      streak: { name: 'Séries', icon: '🔥' },
      streaks: { name: 'Séries', icon: '🔥' },
      goal: { name: 'Objectifs', icon: '🎯' },
      goals: { name: 'Objectifs', icon: '🎯' },
      milestone: { name: 'Étapes', icon: '⭐' },
      general: { name: 'Général', icon: '📋' },
    }

    achievements.value.forEach((a) => {
      const catKey = a.category || 'general'

      if (!categoryMap.has(catKey)) {
        const def = defaultCategories[catKey] || {
          name: catKey,
          icon: '📋',
        }
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

  // Aliases
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

  return {
    achievements,
    userProgress,
    recentUnlocks,
    categories,
    loading,
    checking,
    error,
    unlockedAchievements,
    lockedAchievements,
    totalXP,
    completionPercentage,
    recentAchievements,
    fetchAchievements,
    fetchUserAchievements,
    loadAchievementData,
    checkAchievements,
    $reset,
  }
})

export default useAchievementStore
