import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { challengeService } from '@/services/challengeService'
import type {
  Challenge,
  UserChallenge,
  ChallengeParticipation,
  ChallengeLeaderboard
} from '@/types/entities/challenge'
import { useNotificationStore } from './notificationStore'

export const useChallengeStore = defineStore('challenge', () => {

  // ==========================================
  // STATE
  // ==========================================

  const challenges = ref<Challenge[]>([])
  const userChallenges = ref<UserChallenge[]>([])
  const participations = ref<ChallengeParticipation[]>([])
  const leaderboards = ref<ChallengeLeaderboard[]>([])
  const currentChallenge = ref<Challenge | null>(null)

  // États de chargement
  const loading = ref(false)
  const joining = ref(false)
  const updating = ref(false)

  // Erreurs
  const error = ref<string | null>(null)

  // Configuration
  const autoJoinEnabled = ref(true)
  const notificationsEnabled = ref(true)

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * Défis actifs (en cours)
   */
  const activeChallenges = computed(() => {
    const now = new Date()
    return challenges.value.filter(challenge => {
      const startDate = new Date(challenge.start_date)
      const endDate = new Date(challenge.end_date)
      return startDate <= now && endDate > now && challenge.status === 'active'
    })
  })

  /**
   * Défis à venir
   */
  const upcomingChallenges = computed(() => {
    const now = new Date()
    return challenges.value.filter(challenge => {
      const startDate = new Date(challenge.start_date)
      return startDate > now && challenge.status === 'active'
    })
  })

  /**
   * Défis terminés
   */
  const completedChallenges = computed(() =>
    challenges.value.filter(challenge =>
      challenge.status === 'completed' || new Date(challenge.end_date) <= new Date()
    )
  )

  /**
   * Mes défis actifs (que l'utilisateur a rejoint)
   */
  const myActiveChallenges = computed(() =>
    userChallenges.value.filter(uc =>
      uc.status === 'active' &&
      activeChallenges.value.some(c => c.id === uc.challenge_id)
    )
  )

  /**
   * Mes défis terminés
   */
  const myCompletedChallenges = computed(() =>
    userChallenges.value.filter(uc => uc.status === 'completed')
  )

  /**
   * Défis par difficulté
   */
  const challengesByDifficulty = computed(() => {
    const grouped = {
      easy: activeChallenges.value.filter(c => c.difficulty === 'easy'),
      medium: activeChallenges.value.filter(c => c.difficulty === 'medium'),
      hard: activeChallenges.value.filter(c => c.difficulty === 'hard')
    }

    return grouped
  })

  /**
   * Défis par type
   */
  const challengesByType = computed(() => {
    const grouped = new Map<string, Challenge[]>()

    activeChallenges.value.forEach(challenge => {
      if (!grouped.has(challenge.type)) {
        grouped.set(challenge.type, [])
      }
      grouped.get(challenge.type)!.push(challenge)
    })

    return Array.from(grouped.entries()).map(([type, challenges]) => ({
      type,
      challenges: challenges.sort((a, b) => b.xp_reward - a.xp_reward)
    }))
  })

  /**
   * Défis recommandés (basés sur le niveau et les préférences)
   */
  const recommendedChallenges = computed(() => {
    // TODO: Intégrer avec authStore pour le niveau utilisateur
    return activeChallenges.value
      .filter(challenge => !userChallenges.value.some(uc => uc.challenge_id === challenge.id))
      .filter(challenge => challenge.difficulty === 'easy' || challenge.difficulty === 'medium')
      .sort((a, b) => b.participants_count - a.participants_count)
      .slice(0, 3)
  })

  /**
   * Statistiques des défis
   */
  const challengeStats = computed(() => {
    const total = challenges.value.length
    const active = activeChallenges.value.length
    const joined = myActiveChallenges.value.length
    const completed = myCompletedChallenges.value.length

    const totalXPEarned = myCompletedChallenges.value.reduce((sum, uc) => {
      const challenge = challenges.value.find(c => c.id === uc.challenge_id)
      return sum + (challenge?.xp_reward || 0)
    }, 0)

    const winRate = completed > 0 ? Math.round((myCompletedChallenges.value.filter(uc => uc.final_rank <= 3).length / completed) * 100) : 0

    return {
      total,
      active,
      joined,
      completed,
      totalXPEarned,
      winRate,
      averageRank: completed > 0 ? Math.round(myCompletedChallenges.value.reduce((sum, uc) => sum + (uc.final_rank || 0), 0) / completed) : 0
    }
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Charger tous les défis disponibles
   */
  async function fetchChallenges(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await challengeService.getChallenges()

      if (response.success) {
        challenges.value = response.data
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des défis')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des défis'
      console.error('Erreur fetchChallenges:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger mes défis
   */
  async function fetchUserChallenges(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await challengeService.getUserChallenges()

      if (response.success) {
        userChallenges.value = response.data
      } else {
        throw new Error(response.message || 'Erreur lors du chargement de mes défis')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement de mes défis'
      console.error('Erreur fetchUserChallenges:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Rejoindre un défi
   */
  async function joinChallenge(challengeId: string): Promise<boolean> {
    joining.value = true
    error.value = null

    try {
      const response = await challengeService.joinChallenge(challengeId)

      if (response.success) {
        // Ajouter à mes défis
        userChallenges.value.push(response.data)

        // Mettre à jour le nombre de participants
        const challenge = challenges.value.find(c => c.id === challengeId)
        if (challenge) {
          challenge.participants_count += 1
        }

        // Notification de succès
        const notificationStore = useNotificationStore()
        const challengeName = challenge?.name || 'le défi'
        await notificationStore.createNotification({
          type: 'achievement',
          title: '🎯 Défi rejoint !',
          message: `Tu as rejoint "${challengeName}". Bonne chance !`,
          priority: 'normal'
        })

        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la participation au défi')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la participation au défi'
      console.error('Erreur joinChallenge:', err)
      return false
    } finally {
      joining.value = false
    }
  }

  /**
   * Quitter un défi
   */
  async function leaveChallenge(challengeId: string): Promise<boolean> {
    try {
      const response = await challengeService.leaveChallenge(challengeId)

      if (response.success) {
        // Retirer de mes défis
        userChallenges.value = userChallenges.value.filter(uc => uc.challenge_id !== challengeId)

        // Mettre à jour le nombre de participants
        const challenge = challenges.value.find(c => c.id === challengeId)
        if (challenge && challenge.participants_count > 0) {
          challenge.participants_count -= 1
        }

        return true
      } else {
        throw new Error(response.message || 'Erreur lors de l\'abandon du défi')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'abandon du défi'
      console.error('Erreur leaveChallenge:', err)
      return false
    }
  }

  /**
   * Mettre à jour le progrès d'un défi
   */
  async function updateChallengeProgress(challengeId: string, progress: number): Promise<boolean> {
    updating.value = true

    try {
      const response = await challengeService.updateProgress(challengeId, progress)

      if (response.success) {
        // Mettre à jour le progrès local
        const userChallenge = userChallenges.value.find(uc => uc.challenge_id === challengeId)
        if (userChallenge) {
          userChallenge.progress = progress
          userChallenge.updated_at = new Date().toISOString()

          // Vérifier si le défi est terminé
          const challenge = challenges.value.find(c => c.id === challengeId)
          if (challenge && progress >= challenge.target_value) {
            userChallenge.status = 'completed'
            userChallenge.completed_at = new Date().toISOString()

            // Notification de réussite
            const notificationStore = useNotificationStore()
            await notificationStore.notifyAchievement(
              `Défi "${challenge.name}" terminé`,
              challenge.xp_reward
            )
          }
        }

        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour du progrès')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour du progrès'
      console.error('Erreur updateChallengeProgress:', err)
      return false
    } finally {
      updating.value = false
    }
  }

  /**
   * Charger le classement d'un défi
   */
  async function fetchLeaderboard(challengeId: string): Promise<void> {
    try {
      const response = await challengeService.getLeaderboard(challengeId)

      if (response.success) {
        // Mettre à jour ou ajouter le leaderboard
        const existingIndex = leaderboards.value.findIndex(l => l.challenge_id === challengeId)
        if (existingIndex !== -1) {
          leaderboards.value[existingIndex] = response.data
        } else {
          leaderboards.value.push(response.data)
        }
      }
    } catch (err: any) {
      console.error('Erreur fetchLeaderboard:', err)
    }
  }

  /**
   * Vérifier automatiquement les progrès des défis
   */
  async function checkChallengeProgress(): Promise<void> {
    for (const userChallenge of myActiveChallenges.value) {
      const challenge = challenges.value.find(c => c.id === userChallenge.challenge_id)
      if (!challenge) continue

      let newProgress = 0

      // Calculer le progrès selon le type de défi
      switch (challenge.condition_type) {
        case 'transaction_count':
          // TODO: Intégrer avec transactionStore
          break
        case 'savings_amount':
          // TODO: Intégrer avec goalStore
          break
        case 'days_streak':
          // TODO: Intégrer avec streakStore
          break
        case 'categories_used':
          // TODO: Intégrer avec categoryStore
          break
        default:
          continue
      }

      // Mettre à jour si le progrès a changé
      if (newProgress !== userChallenge.progress) {
        await updateChallengeProgress(challenge.id, newProgress)
      }
    }
  }

  /**
   * Obtenir ma position dans un défi
   */
  function getMyRankInChallenge(challengeId: string): number | null {
    const leaderboard = leaderboards.value.find(l => l.challenge_id === challengeId)
    if (!leaderboard) return null

    const userEntry = leaderboard.entries.find(entry => entry.is_current_user)
    return userEntry?.rank || null
  }

  /**
   * Vérifier si je participe à un défi
   */
  function isParticipating(challengeId: string): boolean {
    return userChallenges.value.some(uc =>
      uc.challenge_id === challengeId && uc.status === 'active'
    )
  }

  /**
   * Obtenir les détails de ma participation
   */
  function getMyParticipation(challengeId: string): UserChallenge | null {
    return userChallenges.value.find(uc => uc.challenge_id === challengeId) || null
  }

  /**
   * Calculer le temps restant pour un défi
   */
  function getTimeRemaining(challenge: Challenge): {
    days: number
    hours: number
    minutes: number
    isExpired: boolean
  } {
    const now = new Date()
    const endDate = new Date(challenge.end_date)
    const diff = endDate.getTime() - now.getTime()

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, isExpired: true }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes, isExpired: false }
  }

  /**
   * Statistiques des défis
   */
  const stats = computed(() => {
    const totalChallenges = challenges.value.length
    const activeChallenges = activeChallenges.value.length
    const myChallenges = myActiveChallenges.value.length
    const myCompleted = myCompletedChallenges.value.length

    const totalXPFromChallenges = myCompletedChallenges.value.reduce((sum, uc) => {
      const challenge = challenges.value.find(c => c.id === uc.challenge_id)
      return sum + (challenge?.xp_reward || 0)
    }, 0)

    const bestRank = myCompletedChallenges.value.reduce((best, uc) => {
      return Math.min(best, uc.final_rank || 999)
    }, 999)

    return {
      totalChallenges,
      activeChallenges,
      myChallenges,
      myCompleted,
      totalXPFromChallenges,
      bestRank: bestRank === 999 ? null : bestRank,
      participationRate: totalChallenges > 0 ? Math.round(((myChallenges + myCompleted) / totalChallenges) * 100) : 0
    }
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Charger toutes les données des défis
   */
  async function loadChallengeData(): Promise<void> {
    await Promise.all([
      fetchChallenges(),
      fetchUserChallenges()
    ])
  }

  /**
   * Rejoindre automatiquement les défis recommandés
   */
  async function autoJoinRecommended(): Promise<void> {
    if (!autoJoinEnabled.value) return

    const recommended = recommendedChallenges.value.slice(0, 2) // Rejoindre max 2 défis auto

    for (const challenge of recommended) {
      if (challenge.difficulty === 'easy') {
        await joinChallenge(challenge.id)
      }
    }
  }

  /**
   * Vérifier les défis en cours et mettre à jour les progrès
   */
  async function syncChallengeProgress(): Promise<void> {
    if (myActiveChallenges.value.length === 0) return

    try {
      const response = await challengeService.syncProgress()

      if (response.success && response.data) {
        // Mettre à jour les progrès locaux
        response.data.forEach((update: any) => {
          const userChallenge = userChallenges.value.find(uc => uc.challenge_id === update.challenge_id)
          if (userChallenge) {
            userChallenge.progress = update.progress
            userChallenge.current_rank = update.rank
            userChallenge.updated_at = new Date().toISOString()

            // Vérifier si terminé
            if (update.completed) {
              userChallenge.status = 'completed'
              userChallenge.completed_at = new Date().toISOString()
              userChallenge.final_rank = update.rank

              // Notification
              const challenge = challenges.value.find(c => c.id === update.challenge_id)
              if (challenge && notificationsEnabled.value) {
                const notificationStore = useNotificationStore()
                notificationStore.notifyAchievement(
                  `Défi "${challenge.name}" terminé`,
                  challenge.xp_reward
                )
              }
            }
          }
        })
      }
    } catch (err: any) {
      console.error('Erreur syncChallengeProgress:', err)
    }
  }

  /**
   * Rechercher des défis
   */
  function searchChallenges(query: string): Challenge[] {
    const lowerQuery = query.toLowerCase()
    return challenges.value.filter(challenge =>
      challenge.name.toLowerCase().includes(lowerQuery) ||
      challenge.description.toLowerCase().includes(lowerQuery) ||
      challenge.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Filtrer les défis
   */
  function filterChallenges(filters: {
    type?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    status?: 'active' | 'upcoming' | 'completed'
    participating?: boolean
  }): Challenge[] {
    let filtered = [...challenges.value]

    if (filters.type) {
      filtered = filtered.filter(c => c.type === filters.type)
    }

    if (filters.difficulty) {
      filtered = filtered.filter(c => c.difficulty === filters.difficulty)
    }

    if (filters.status === 'active') {
      filtered = activeChallenges.value
    } else if (filters.status === 'upcoming') {
      filtered = upcomingChallenges.value
    } else if (filters.status === 'completed') {
      filtered = completedChallenges.value
    }

    if (filters.participating !== undefined) {
      if (filters.participating) {
        filtered = filtered.filter(c => isParticipating(c.id))
      } else {
        filtered = filtered.filter(c => !isParticipating(c.id))
      }
    }

    return filtered
  }

  /**
   * Obtenir les détails d'un défi
   */
  async function fetchChallengeDetails(challengeId: string): Promise<Challenge | null> {
    try {
      const response = await challengeService.getChallengeDetails(challengeId)

      if (response.success) {
        currentChallenge.value = response.data

        // Mettre à jour dans la liste si existe
        const index = challenges.value.findIndex(c => c.id === challengeId)
        if (index !== -1) {
          challenges.value[index] = response.data
        }

        return response.data
      }

      return null
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des détails'
      console.error('Erreur fetchChallengeDetails:', err)
      return null
    }
  }

  /**
   * Récupérer les classements
   */
  async function loadLeaderboards(): Promise<void> {
    const activeChallengeIds = myActiveChallenges.value.map(uc => uc.challenge_id)

    for (const challengeId of activeChallengeIds) {
      await fetchLeaderboard(challengeId)
    }
  }

  /**
   * Vérifier les nouveaux défis disponibles
   */
  async function checkForNewChallenges(): Promise<Challenge[]> {
    try {
      const response = await challengeService.getNewChallenges()

      if (response.success && response.data.length > 0) {
        // Ajouter les nouveaux défis
        response.data.forEach((newChallenge: Challenge) => {
          const exists = challenges.value.some(c => c.id === newChallenge.id)
          if (!exists) {
            challenges.value.push(newChallenge)
          }
        })

        // Notification des nouveaux défis
        if (notificationsEnabled.value) {
          const notificationStore = useNotificationStore()
          await notificationStore.createNotification({
            type: 'achievement',
            title: '🆕 Nouveaux défis !',
            message: `${response.data.length} nouveau(x) défi(s) disponible(s)`,
            priority: 'normal',
            action: {
              type: 'view_challenges',
              label: 'Découvrir',
              url: '/gaming/challenges'
            }
          })
        }

        return response.data
      }

      return []
    } catch (err: any) {
      console.error('Erreur checkForNewChallenges:', err)
      return []
    }
  }

  /**
   * Nettoyer les erreurs
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * Réinitialiser le store
   */
  function $reset(): void {
    challenges.value = []
    userChallenges.value = []
    participations.value = []
    leaderboards.value = []
    currentChallenge.value = null
    loading.value = false
    joining.value = false
    updating.value = false
    error.value = null
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    challenges,
    userChallenges,
    participations,
    leaderboards,
    currentChallenge,
    loading,
    joining,
    updating,
    error,
    autoJoinEnabled,
    notificationsEnabled,

    // Getters
    activeChallenges,
    upcomingChallenges,
    completedChallenges,
    myActiveChallenges,
    myCompletedChallenges,
    challengesByDifficulty,
    challengesByType,
    recommendedChallenges,
    stats,

    // Actions
    fetchChallenges,
    fetchUserChallenges,
    joinChallenge,
    leaveChallenge,
    updateChallengeProgress,
    fetchLeaderboard,
    loadChallengeData,
    autoJoinRecommended,
    syncChallengeProgress,
    searchChallenges,
    filterChallenges,
    fetchChallengeDetails,
    loadLeaderboards,
    checkForNewChallenges,

    // Utilitaires
    getMyRankInChallenge,
    isParticipating,
    getMyParticipation,
    getTimeRemaining,
    clearError,
    $reset
  }
})
