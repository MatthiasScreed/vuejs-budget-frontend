import { ref, computed, onMounted } from 'vue'
import { useWebSocket } from './useWebSocket'
import { useGaming, useXP, useAchievements, useStreaks, useChallenges } from '@/composables/gaming'
import { useNotifications } from '@/composables/ui'

interface LiveGamingEvent {
  user_id: number
  event_type: 'xp_gained' | 'level_up' | 'achievement_unlocked' | 'streak_milestone' | 'challenge_completed'
  data: any
  timestamp: number
  broadcast: boolean
}

interface LiveLeaderboardUpdate {
  leaderboard_type: string
  period: string
  top_changes: Array<{
    user_id: number
    user_name: string
    old_rank: number
    new_rank: number
    score: number
  }>
}

interface LiveChallengeUpdate {
  challenge_id: number
  challenge_name: string
  participants_count: number
  leaderboard: Array<{
    rank: number
    user_name: string
    score: number
    change: number
  }>
}

/**
 * Composable pour gaming temps réel via WebSocket
 * Événements live, leaderboards, défis collaboratifs
 */
export function useRealTimeGaming() {
  const ws = useWebSocket('/gaming')
  const gaming = useGaming()
  const xp = useXP()
  const achievements = useAchievements()
  const streaks = useStreaks()
  const challenges = useChallenges()
  const notifications = useNotifications()

  // State temps réel
  const liveEvents = ref<LiveGamingEvent[]>([])
  const activePlayers = ref<number>(0)
  const globalActivity = ref<any[]>([])
  const isSubscribedToEvents = ref(false)

  /**
   * Initialiser le gaming temps réel
   */
  async function initRealTimeGaming(): Promise<void> {
    await ws.connect()

    if (ws.isConnected.value) {
      subscribeToGamingEvents()
      await joinGamingRoom()
    }
  }

  /**
   * S'abonner aux événements gaming
   */
  function subscribeToGamingEvents(): void {
    if (isSubscribedToEvents.value) return

    // Événements XP et level-up
    ws.on('xp_gained', handleXPGained)
    ws.on('level_up', handleLevelUp)

    // Achievements
    ws.on('achievement_unlocked', handleAchievementUnlocked)
    ws.on('achievement_progress', handleAchievementProgress)

    // Streaks
    ws.on('streak_milestone', handleStreakMilestone)
    ws.on('streak_broken', handleStreakBroken)

    // Défis
    ws.on('challenge_update', handleChallengeUpdate)
    ws.on('challenge_completed', handleChallengeCompleted)

    // Leaderboards
    ws.on('leaderboard_update', handleLeaderboardUpdate)

    // Activité globale
    ws.on('global_activity', handleGlobalActivity)
    ws.on('players_count', handlePlayersCount)

    isSubscribedToEvents.value = true
    log('Abonnement événements gaming activé')
  }

  /**
   * Rejoindre la room gaming générale
   */
  async function joinGamingRoom(): Promise<void> {
    ws.send('gaming', 'join_room', {
      user_id: getCurrentUserId(),
      level: xp.userLevel.value,
      interests: ['achievements', 'challenges', 'leaderboards']
    })
  }

  /**
   * Broadcast action gaming aux autres joueurs
   */
  function broadcastGamingAction(
    actionType: string,
    data: any,
    shouldBroadcast: boolean = true
  ): void {
    if (!shouldBroadcast || !ws.isConnected.value) return

    ws.send('gaming', 'action_broadcast', {
      action_type: actionType,
      data,
      user_level: xp.userLevel.value,
      timestamp: Date.now()
    })
  }

  /**
   * Gestionnaire XP gagné en temps réel
   */
  function handleXPGained(data: any): void {
    const event: LiveGamingEvent = {
      user_id: data.user_id,
      event_type: 'xp_gained',
      data,
      timestamp: Date.now(),
      broadcast: data.broadcast || false
    }

    addLiveEvent(event)

    // Mettre à jour XP local si c'est l'utilisateur actuel
    if (isCurrentUser(data.user_id)) {
      xp.currentLevel.value!.total_xp += data.xp_amount
    }

    log('XP gagné en temps réel:', data)
  }

  /**
   * Gestionnaire level-up en temps réel
   */
  function handleLevelUp(data: any): void {
    const event: LiveGamingEvent = {
      user_id: data.user_id,
      event_type: 'level_up',
      data,
      timestamp: Date.now(),
      broadcast: data.broadcast || false
    }

    addLiveEvent(event)

    // Notification level-up si utilisateur actuel
    if (isCurrentUser(data.user_id)) {
      notifications.levelUp(data.old_level, data.new_level, data.xp_gained)
      xp.currentLevel.value!.level = data.new_level
    }

    log('Level-up en temps réel:', data)
  }

  /**
   * Gestionnaire achievement débloqué
   */
  function handleAchievementUnlocked(data: any): void {
    const event: LiveGamingEvent = {
      user_id: data.user_id,
      event_type: 'achievement_unlocked',
      data,
      timestamp: Date.now(),
      broadcast: data.broadcast || false
    }

    addLiveEvent(event)

    // Notification achievement si utilisateur actuel
    if (isCurrentUser(data.user_id)) {
      notifications.achievement(
        data.achievement_name,
        data.xp_bonus,
        data.rarity
      )

      // Recharger achievements
      achievements.loadAchievements()
    }

    log('Achievement débloqué en temps réel:', data)
  }

  /**
   * Gestionnaire progression achievement
   */
  function handleAchievementProgress(data: any): void {
    if (isCurrentUser(data.user_id)) {
      // Mettre à jour progression locale
      achievements.userProgress.value[data.achievement_id] = data.progress
    }
  }

  /**
   * Gestionnaire milestone streak
   */
  function handleStreakMilestone(data: any): void {
    const event: LiveGamingEvent = {
      user_id: data.user_id,
      event_type: 'streak_milestone',
      data,
      timestamp: Date.now(),
      broadcast: data.broadcast || false
    }

    addLiveEvent(event)

    // Notification si utilisateur actuel
    if (isCurrentUser(data.user_id)) {
      notifications.streakMilestone(data.streak_name, data.days)
    }

    log('Streak milestone en temps réel:', data)
  }

  /**
   * Gestionnaire streak cassée
   */
  function handleStreakBroken(data: any): void {
    if (isCurrentUser(data.user_id)) {
      notifications.warning(`Streak "${data.streak_name}" interrompue après ${data.days} jours`)

      // Mettre à jour streak locale
      const streak = streaks.userStreaks.value.find(s => s.id === data.streak_id)
      if (streak) {
        streak.current_count = 0
        streak.is_active = false
      }
    }
  }

  /**
   * Gestionnaire mise à jour défi
   */
  function handleChallengeUpdate(data: LiveChallengeUpdate): void {
    // Mettre à jour leaderboard local
    challenges.leaderboards.value[data.challenge_id] = data.leaderboard.map((entry, index) => ({
      rank: entry.rank,
      user_id: 0, // Pas d'ID dans cette structure simplifiée
      user_name: entry.user_name,
      user_level: 0,
      score: entry.score,
      progress_percent: 0,
      last_activity: new Date().toISOString()
    }))

    log('Challenge update en temps réel:', data)
  }

  /**
   * Gestionnaire mise à jour leaderboard
   */
  function handleLeaderboardUpdate(data: LiveLeaderboardUpdate): void {
    // Notification si l'utilisateur a changé de rang
    const userChange = data.top_changes.find(change => isCurrentUser(change.user_id))

    if (userChange && userChange.new_rank < userChange.old_rank) {
      notifications.success(`🚀 Vous êtes monté au rang ${userChange.new_rank} !`)
    }

    log('Leaderboard update en temps réel:', data)
  }

  /**
   * Gestionnaire activité globale
   */
  function handleGlobalActivity(data: any): void {
    globalActivity.value.unshift(data)

    // Garder seulement les 20 dernières activités
    if (globalActivity.value.length > 20) {
      globalActivity.value = globalActivity.value.slice(0, 20)
    }
  }

  /**
   * Gestionnaire nombre de joueurs
   */
  function handlePlayersCount(data: any): void {
    activePlayers.value = data.count || 0
  }

  /**
   * Ajouter événement live à l'historique
   */
  function addLiveEvent(event: LiveGamingEvent): void {
    liveEvents.value.unshift(event)

    // Limiter à 50 événements
    if (liveEvents.value.length > 50) {
      liveEvents.value = liveEvents.value.slice(0, 50)
    }
  }

  /**
   * Vérifier si c'est l'utilisateur actuel
   */
  function isCurrentUser(userId: number): boolean {
    return getCurrentUserId() === userId
  }

  /**
   * Obtenir l'ID utilisateur actuel
   */
  function getCurrentUserId(): number {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr)?.id || 0 : 0
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[RealTimeGaming]', ...args)
  }

  // Computed properties
  const recentEvents = computed(() => liveEvents.value.slice(0, 10))

  const userEvents = computed(() =>
    liveEvents.value.filter(event => isCurrentUser(event.user_id))
  )

  const communityEvents = computed(() =>
    liveEvents.value.filter(event => !isCurrentUser(event.user_id) && event.broadcast)
  )

  const isLive = computed(() => ws.isConnected.value && isSubscribedToEvents.value)

  // Auto-init si connecté
  onMounted(() => {
    if (ws.isConnected.value) {
      initRealTimeGaming()
    }
  })

  return {
    // State
    liveEvents,
    activePlayers,
    globalActivity,
    isSubscribedToEvents,

    // Computed
    recentEvents,
    userEvents,
    communityEvents,
    isLive,

    // Methods
    initRealTimeGaming,
    broadcastGamingAction,
    joinGamingRoom
  }
}
