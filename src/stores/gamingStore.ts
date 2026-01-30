// src/stores/gamingStore.ts - VERSION CORRIGÉE AVEC AUTH GUARD
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { gamingService } from '@/services/gamingService'
import type { Achievement, Challenge, Level, Streak } from '@/types'

// ==========================================
// TYPES DE NAVIGATION GAMING
// ==========================================

interface NavigationContext {
  routeName: string
  routePath: string
  isGaming: boolean
}

interface NavigationReward {
  routeName: string
  xpBonus: number
  reason: string
  achievements?: string[]
}

// ==========================================
// STORE GAMING - VERSION SÉCURISÉE ✅
// ==========================================

export const useGamingStore = defineStore('gaming', () => {
  // ==========================================
  // STATE
  // ==========================================

  const achievements = ref<Achievement[]>([])
  const challenges = ref<Challenge[]>([])
  const levels = ref<Level[]>([])
  const streaks = ref<Streak[]>([])
  const recentUnlocks = ref<Achievement[]>([])

  const currentLevel = ref<Level | null>(null)
  const totalXP = ref(0)
  const weeklyXP = ref(0)

  const loading = ref(false)
  const isInitialized = ref(false)
  const error = ref<string | null>(null)

  // ==========================================
  // 🔐 AUTH GUARD HELPER
  // ==========================================

  /**
   * Vérifier que l'utilisateur est authentifié avant un appel API
   */
  async function ensureAuthenticated(): Promise<boolean> {
    const authStore = useAuthStore()

    // 1️⃣ Attendre l'initialisation de l'auth
    if (!authStore.isInitialized) {
      console.log('⏳ [Gaming] Attente initialisation auth...')

      let attempts = 0
      const maxAttempts = 30 // 3 secondes max

      while (!authStore.isInitialized && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 100))
        attempts++
      }

      if (!authStore.isInitialized) {
        console.error('❌ [Gaming] Auth non initialisée après timeout')
        return false
      }
    }

    // 2️⃣ Vérifier l'authentification
    if (!authStore.isAuthenticated) {
      console.warn('⚠️ [Gaming] Utilisateur non authentifié')
      return false
    }

    return true
  }

  // ==========================================
  // GETTERS
  // ==========================================

  const unlockedAchievements = computed(() => achievements.value.filter((a) => a.unlocked_at))

  const lockedAchievements = computed(() => achievements.value.filter((a) => !a.unlocked_at))

  const activeChallenges = computed(() => challenges.value.filter((c) => c.status === 'active'))

  const activeStreaks = computed(() => streaks.value.filter((s) => s.is_active))

  const levelProgress = computed(() => {
    if (!currentLevel.value) return 0
    const current = totalXP.value - (currentLevel.value.min_xp || 0)
    const needed = (currentLevel.value.max_xp || 0) - (currentLevel.value.min_xp || 0)
    return needed > 0 ? (current / needed) * 100 : 0
  })

  // ==========================================
  // NAVIGATION REWARDS CONFIGURATION
  // ==========================================

  const navigationRewards: Record<string, NavigationReward> = {
    Dashboard: {
      routeName: 'Dashboard',
      xpBonus: 5,
      reason: '🏠 Visite du dashboard',
      achievements: ['daily_login'],
    },
    Transactions: {
      routeName: 'Transactions',
      xpBonus: 8,
      reason: '💳 Gestion des transactions',
      achievements: ['transaction_manager'],
    },
    Goals: {
      routeName: 'Goals',
      xpBonus: 10,
      reason: '🎯 Planification des objectifs',
      achievements: ['goal_setter'],
    },
    Gaming: {
      routeName: 'Gaming',
      xpBonus: 15,
      reason: '🎮 Visite du Gaming Center',
      achievements: ['gaming_explorer', 'gaming_first_visit'],
    },
    Achievements: {
      routeName: 'Achievements',
      xpBonus: 10,
      reason: '🏆 Consultation des succès',
      achievements: ['achievement_hunter'],
    },
    Challenges: {
      routeName: 'Challenges',
      xpBonus: 10,
      reason: '🎯 Découverte des défis',
      achievements: ['challenge_seeker'],
    },
    Profile: {
      routeName: 'Profile',
      xpBonus: 8,
      reason: '👤 Mise à jour du profil',
      achievements: ['profile_editor'],
    },
    Analytics: {
      routeName: 'Analytics',
      xpBonus: 12,
      reason: '📊 Analyse des données',
      achievements: ['data_analyst'],
    },
  }

  // ==========================================
  // ACTIONS PRINCIPALES - AVEC AUTH GUARD
  // ==========================================

  /**
   * Gérer la navigation avec récompenses gaming
   * 🔐 Protégé par auth guard
   */
  async function handleNavigation(context: NavigationContext): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Gaming] handleNavigation annulé - utilisateur non authentifié')
      return
    }

    try {
      const { routeName, isGaming } = context

      // Vérifier si cette route donne des récompenses
      const reward = navigationRewards[routeName]

      if (!reward) {
        console.log(`ℹ️ [Gaming] Pas de récompense pour ${routeName}`)
        return
      }

      // ✅ Système de cooldown : 1 récompense par route par jour
      const today = new Date().toDateString()
      const navigationKey = `nav_${routeName}_${today}`
      const hasNavigatedToday = localStorage.getItem(navigationKey)

      if (hasNavigatedToday) {
        console.log(`⏰ [Gaming] Déjà récompensé pour ${routeName} aujourd'hui`)
        return
      }

      // ✅ Ajouter l'XP
      console.log(`🎮 [Gaming] Récompense navigation: ${reward.reason} (+${reward.xpBonus} XP)`)
      await addXP(reward.xpBonus, reward.reason)

      // ✅ Marquer comme visité aujourd'hui
      localStorage.setItem(navigationKey, 'true')

      // ✅ Vérifier les achievements associés
      if (reward.achievements && reward.achievements.length > 0) {
        await checkAchievements(reward.achievements)
      }

      // ✅ Gérer les routes gaming spéciales
      if (isGaming) {
        await handleGamingRoutes(routeName)
      }

      // ✅ Mettre à jour le streak de connexion quotidienne
      if (routeName === 'Dashboard') {
        await updateStreak('daily_login')
      }
    } catch (error) {
      console.error('❌ [Gaming] Erreur handleNavigation:', error)
    }
  }

  /**
   * Gérer les routes gaming spécifiques
   * 🔐 Protégé par auth guard (appelé depuis handleNavigation déjà protégé)
   */
  async function handleGamingRoutes(routeName: string): Promise<void> {
    // Initialiser le gaming si nécessaire
    if (!isInitialized.value) {
      await initializeGaming()
    }

    // Achievement spécial : première visite du Gaming Center
    if (routeName === 'Gaming') {
      const firstVisit = localStorage.getItem('first_gaming_visit')

      if (!firstVisit) {
        setTimeout(async () => {
          await unlockAchievement('gaming_first_visit', {
            name: '🎮 Premier joueur',
            description: 'Visitez le Gaming Center pour la première fois',
            xp_reward: 50,
          })
        }, 2000)

        localStorage.setItem('first_gaming_visit', 'true')
      }
    }
  }

  /**
   * Initialiser le système gaming
   * 🔐 Protégé par auth guard
   */
  async function initializeGaming(): Promise<void> {
    if (isInitialized.value) {
      console.log('ℹ️ [Gaming] Déjà initialisé')
      return
    }

    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Gaming] initializeGaming annulé - utilisateur non authentifié')
      return
    }

    try {
      loading.value = true
      console.log('🎮 [Gaming] Initialisation du système gaming...')

      await Promise.allSettled([loadAchievements(), loadChallenges(), loadLevels(), loadStreaks()])

      isInitialized.value = true
      console.log('✅ [Gaming] Gaming initialisé')
    } catch (err: any) {
      console.error('❌ [Gaming] Erreur initialisation:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger tous les achievements
   * 🔐 Protégé par auth guard
   */
  async function loadAchievements(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Gaming] loadAchievements annulé - utilisateur non authentifié')
      return
    }

    try {
      const response = await gamingService.getAchievements()

      if (response.success && response.data) {
        achievements.value = response.data
        console.log('✅ [Gaming] Achievements chargés:', achievements.value.length)
      }
    } catch (err) {
      console.error('❌ [Gaming] Erreur chargement achievements:', err)
    }
  }

  /**
   * Charger tous les challenges
   * 🔐 Protégé par auth guard
   */
  async function loadChallenges(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Gaming] loadChallenges annulé - utilisateur non authentifié')
      return
    }

    try {
      const response = await gamingService.getChallenges()

      if (response.success && response.data) {
        challenges.value = response.data
        console.log('✅ [Gaming] Challenges chargés:', challenges.value.length)
      }
    } catch (err) {
      console.error('❌ [Gaming] Erreur chargement challenges:', err)
    }
  }

  /**
   * Charger les niveaux
   * 🔐 Protégé par auth guard
   */
  async function loadLevels(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Gaming] loadLevels annulé - utilisateur non authentifié')
      return
    }

    try {
      const response = await gamingService.getLevels()

      if (response.success && response.data) {
        levels.value = response.data
        console.log('✅ [Gaming] Levels chargés:', levels.value.length)
      }
    } catch (err) {
      console.error('❌ [Gaming] Erreur chargement levels:', err)
    }
  }

  /**
   * Charger les streaks
   * 🔐 Protégé par auth guard
   */
  async function loadStreaks(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Gaming] loadStreaks annulé - utilisateur non authentifié')
      return
    }

    try {
      const response = await gamingService.getStreaks()

      if (response.success && response.data) {
        streaks.value = response.data
        console.log('✅ [Gaming] Streaks chargés:', streaks.value.length)
      }
    } catch (err) {
      console.error('❌ [Gaming] Erreur chargement streaks:', err)
    }
  }

  /**
   * Charger toutes les données gaming
   * 🔐 Protégé par auth guard
   */
  async function loadAchievementData(): Promise<void> {
    await initializeGaming()
  }

  /**
   * Ajouter de l'XP
   * 🔐 Protégé par auth guard
   */
  async function addXP(amount: number, reason: string): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Gaming] addXP annulé - utilisateur non authentifié')
      return
    }

    try {
      const response = await gamingService.addXP(amount, reason)

      if (response.success && response.data) {
        totalXP.value = response.data.total_xp || totalXP.value + amount
        weeklyXP.value = response.data.weekly_xp || weeklyXP.value + amount

        // Vérifier level up
        if (response.data.level_up) {
          currentLevel.value = response.data.new_level
          console.log('🎉 [Gaming] LEVEL UP!', response.data.new_level)
        }

        console.log(`✅ [Gaming] +${amount} XP : ${reason}`)
      }
    } catch (err) {
      console.error('❌ [Gaming] Erreur ajout XP:', err)
    }
  }

  /**
   * Débloquer un achievement
   * 🔐 Protégé par auth guard
   */
  async function unlockAchievement(
    achievementId: string,
    fallbackData?: Partial<Achievement>,
  ): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Gaming] unlockAchievement annulé - utilisateur non authentifié')
      return
    }

    try {
      const response = await gamingService.unlockAchievement(achievementId)

      if (response.success && response.data) {
        // Mettre à jour la liste
        const index = achievements.value.findIndex((a) => a.id === achievementId)
        if (index !== -1) {
          achievements.value[index] = {
            ...achievements.value[index],
            ...response.data,
            unlocked_at: response.data.unlocked_at || new Date().toISOString(),
          }
        }

        // Ajouter aux débloquages récents
        recentUnlocks.value.unshift(response.data)
        if (recentUnlocks.value.length > 5) {
          recentUnlocks.value = recentUnlocks.value.slice(0, 5)
        }

        console.log('🏆 [Gaming] Achievement débloqué:', response.data.name)
      }
    } catch (err) {
      console.error('❌ [Gaming] Erreur unlock achievement:', err)
    }
  }

  /**
   * Vérifier plusieurs achievements
   * 🔐 Protégé par auth guard (appelé depuis handleNavigation déjà protégé)
   */
  async function checkAchievements(achievementIds: string[]): Promise<void> {
    try {
      for (const id of achievementIds) {
        const achievement = achievements.value.find((a) => a.id === id)

        // Si déjà débloqué, skip
        if (achievement?.unlocked_at) continue

        // Essayer de débloquer
        await unlockAchievement(id)
      }
    } catch (err) {
      console.error('❌ [Gaming] Erreur check achievements:', err)
    }
  }

  /**
   * Mettre à jour un streak
   * 🔐 Protégé par auth guard
   */
  async function updateStreak(streakType: string): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Gaming] updateStreak annulé - utilisateur non authentifié')
      return
    }

    try {
      const response = await gamingService.updateStreak(streakType)

      if (response.success && response.data) {
        const index = streaks.value.findIndex((s) => s.type === streakType)

        if (index !== -1) {
          streaks.value[index] = response.data
        } else {
          streaks.value.push(response.data)
        }

        console.log(`🔥 [Gaming] Streak ${streakType} mis à jour:`, response.data.current_count)
      }
    } catch (err) {
      console.error('❌ [Gaming] Erreur update streak:', err)
    }
  }

  /**
   * Réinitialiser le store
   */
  function reset(): void {
    achievements.value = []
    challenges.value = []
    levels.value = []
    streaks.value = []
    recentUnlocks.value = []
    currentLevel.value = null
    totalXP.value = 0
    weeklyXP.value = 0
    loading.value = false
    isInitialized.value = false
    error.value = null
    console.log('🔄 [Gaming] Store réinitialisé')
  }

  // ==========================================
  // RETURN (INTERFACE PUBLIQUE)
  // ==========================================

  return {
    // State
    achievements,
    challenges,
    levels,
    streaks,
    recentUnlocks,
    currentLevel,
    totalXP,
    weeklyXP,
    loading,
    isInitialized,
    error,

    // Getters
    unlockedAchievements,
    lockedAchievements,
    activeChallenges,
    activeStreaks,
    levelProgress,

    // Actions principales
    handleNavigation,
    initializeGaming,
    loadAchievementData,

    // Actions spécifiques
    loadAchievements,
    loadChallenges,
    loadLevels,
    loadStreaks,
    addXP,
    unlockAchievement,
    checkAchievements,
    updateStreak,
    reset,
  }
})

export default useGamingStore
