import { ref, computed, onMounted, watch } from 'vue'
import { useWebSocket } from './useWebSocket'
import { useLeaderboard } from '@/composables/gaming'
import { useNotifications } from '@/composables/ui'

interface LiveRanking {
  user_id: number
  user_name: string
  user_avatar?: string
  rank: number
  score: number
  change: number
  trend: 'up' | 'down' | 'stable'
  level: number
  online: boolean
}

interface LeaderboardRoom {
  id: string
  type: 'xp' | 'achievements' | 'challenges' | 'savings'
  period: 'daily' | 'weekly' | 'monthly'
  participants: number
  last_update: number
}

interface RankingUpdate {
  leaderboard_id: string
  updates: Array<{
    user_id: number
    old_rank: number
    new_rank: number
    score_change: number
  }>
  timestamp: number
}

/**
 * Composable pour leaderboards temps réel
 * Classements live, notifications rang, compétition sociale
 */
export function useRealTimeLeaderboards() {
  const ws = useWebSocket('/leaderboards')
  const leaderboard = useLeaderboard()
  const notifications = useNotifications()

  // State
  const liveRankings = ref<Record<string, LiveRanking[]>>({})
  const subscribedRooms = ref<LeaderboardRoom[]>([])
  const userPositions = ref<Record<string, number>>({})
  const rankingUpdates = ref<RankingUpdate[]>([])
  const isLive = ref(false)

  /**
   * Initialiser les leaderboards temps réel
   */
  async function initLiveLeaderboards(): Promise<void> {
    await ws.connect()

    if (ws.isConnected.value) {
      subscribeToLeaderboardEvents()
      await joinDefaultRooms()
      isLive.value = true
    }
  }

  /**
   * S'abonner aux événements leaderboard
   */
  function subscribeToLeaderboardEvents(): void {
    ws.on('ranking_update', handleRankingUpdate)
    ws.on('user_position_change', handleUserPositionChange)
    ws.on('leaderboard_refresh', handleLeaderboardRefresh)
    ws.on('new_participant', handleNewParticipant)
    ws.on('room_stats', handleRoomStats)

    log('Abonnement leaderboards live activé')
  }

  /**
   * Rejoindre les leaderboards par défaut
   */
  async function joinDefaultRooms(): Promise<void> {
    const defaultRooms = [
      { type: 'xp', period: 'weekly' },
      { type: 'achievements', period: 'monthly' },
      { type: 'challenges', period: 'weekly' }
    ]

    for (const room of defaultRooms) {
      await joinLeaderboardRoom(room.type, room.period)
    }
  }

  /**
   * Rejoindre une room de leaderboard
   */
  async function joinLeaderboardRoom(
    type: 'xp' | 'achievements' | 'challenges' | 'savings',
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<boolean> {
    if (!ws.isConnected.value) return false

    const roomId = `${type}_${period}`

    ws.send('leaderboards', 'join_room', {
      room_id: roomId,
      user_id: getCurrentUserId(),
      user_level: getCurrentUserLevel()
    })

    log(`Rejoint leaderboard room: ${roomId}`)
    return true
  }

  /**
   * Quitter une room de leaderboard
   */
  async function leaveLeaderboardRoom(roomId: string): Promise<void> {
    ws.send('leaderboards', 'leave_room', {
      room_id: roomId,
      user_id: getCurrentUserId()
    })

    // Nettoyer state local
    delete liveRankings.value[roomId]
    subscribedRooms.value = subscribedRooms.value.filter(r => r.id !== roomId)

    log(`Quitté leaderboard room: ${roomId}`)
  }

  /**
   * Gérer mise à jour ranking
   */
  function handleRankingUpdate(data: RankingUpdate): void {
    const roomId = data.leaderboard_id

    // Mettre à jour rankings live
    if (liveRankings.value[roomId]) {
      applyRankingUpdates(roomId, data.updates)
    }

    // Ajouter à l'historique
    rankingUpdates.value.unshift(data)
    if (rankingUpdates.value.length > 50) {
      rankingUpdates.value = rankingUpdates.value.slice(0, 50)
    }

    log('Ranking update reçu:', data)
  }

  /**
   * Gérer changement position utilisateur
   */
  function handleUserPositionChange(data: any): void {
    const { leaderboard_id, old_rank, new_rank, score_change } = data

    // Mettre à jour position locale
    userPositions.value[leaderboard_id] = new_rank

    // Notifier si amélioration significative
    if (new_rank < old_rank && old_rank - new_rank >= 5) {
      notifications.success(
        `🚀 Vous êtes monté de ${old_rank - new_rank} rangs ! (${new_rank}e place)`,
        {
          title: '📈 Leaderboard Boost !',
          duration: 6000,
          actions: [
            { label: 'Voir classement', action: 'view_leaderboard', url: '/leaderboards' }
          ]
        }
      )
    }

    log('Position change:', data)
  }

  /**
   * Gérer refresh complet leaderboard
   */
  function handleLeaderboardRefresh(data: any): void {
    const { room_id, rankings } = data

    liveRankings.value[room_id] = rankings.map((ranking: any, index: number) => ({
      ...ranking,
      rank: index + 1,
      trend: calculateTrend(ranking.score_change),
      online: ranking.last_activity > Date.now() - 5 * 60 * 1000 // 5 min
    }))

    log(`Leaderboard refresh: ${room_id}`)
  }

  /**
   * Gérer nouveau participant
   */
  function handleNewParticipant(data: any): void {
    const room = subscribedRooms.value.find(r => r.id === data.room_id)

    if (room) {
      room.participants = data.participants_count
    }

    log('Nouveau participant:', data)
  }

  /**
   * Gérer statistiques room
   */
  function handleRoomStats(data: any): void {
    const room = subscribedRooms.value.find(r => r.id === data.room_id)

    if (room) {
      room.participants = data.participants
      room.last_update = Date.now()
    }
  }

  /**
   * Appliquer les mises à jour de ranking
   */
  function applyRankingUpdates(roomId: string, updates: RankingUpdate['updates']): void {
    const rankings = liveRankings.value[roomId]

    if (!rankings) return

    updates.forEach(update => {
      const ranking = rankings.find(r => r.user_id === update.user_id)

      if (ranking) {
        ranking.rank = update.new_rank
        ranking.change = update.score_change
        ranking.trend = calculateTrend(update.score_change)
      }
    })

    // Retrié par rang
    liveRankings.value[roomId] = rankings.sort((a, b) => a.rank - b.rank)
  }

  /**
   * Calculer la tendance selon changement score
   */
  function calculateTrend(scoreChange: number): 'up' | 'down' | 'stable' {
    if (scoreChange > 0) return 'up'
    if (scoreChange < 0) return 'down'
    return 'stable'
  }

  /**
   * Obtenir position utilisateur actuel
   */
  function getUserPosition(roomId: string): number {
    return userPositions.value[roomId] || 0
  }

  /**
   * Vérifier si utilisateur est dans le top X
   */
  function isUserInTop(roomId: string, topX: number): boolean {
    const position = getUserPosition(roomId)
    return position > 0 && position <= topX
  }

  /**
   * Obtenir les concurrents proches
   */
  function getNearbyCompetitors(roomId: string, range: number = 3): LiveRanking[] {
    const rankings = liveRankings.value[roomId] || []
    const userPos = getUserPosition(roomId)

    if (userPos === 0) return []

    const start = Math.max(0, userPos - range - 1)
    const end = Math.min(rankings.length, userPos + range)

    return rankings.slice(start, end)
  }

  /**
   * Obtenir l'ID utilisateur actuel
   */
  function getCurrentUserId(): number {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr)?.id || 0 : 0
  }

  /**
   * Obtenir le niveau utilisateur actuel
   */
  function getCurrentUserLevel(): number {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr)?.level?.level || 1 : 1
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[LiveLeaderboards]', ...args)
  }

  // Computed properties
  const totalParticipants = computed(() =>
    subscribedRooms.value.reduce((sum, room) => sum + room.participants, 0)
  )

  const userBestRank = computed(() => {
    const positions = Object.values(userPositions.value).filter(pos => pos > 0)
    return positions.length > 0 ? Math.min(...positions) : 0
  })

  const activeRooms = computed(() => subscribedRooms.value.length)

  const recentUpdates = computed(() => rankingUpdates.value.slice(0, 10))

  const isTopPerformer = computed(() => userBestRank.value <= 10)

  // Auto-init
  onMounted(() => {
    if (ws.isConnected.value) {
      initLiveLeaderboards()
    }
  })

  return {
    // State
    liveRankings,
    subscribedRooms,
    userPositions,
    rankingUpdates,
    isLive,

    // Computed
    totalParticipants,
    userBestRank,
    activeRooms,
    recentUpdates,
    isTopPerformer,

    // Methods
    initLiveLeaderboards,
    joinLeaderboardRoom,
    leaveLeaderboardRoom,
    getUserPosition,
    isUserInTop,
    getNearbyCompetitors
  }
}
