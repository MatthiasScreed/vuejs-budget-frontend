import { ref, computed } from 'vue'
import { useWebSocket } from './useWebSocket'
import { useNotifications } from '@/composables/ui'
import { useFormatting } from '@/composables/ui'

interface CollaborativeChallenge {
  id: number
  name: string
  description: string
  type: 'team_savings' | 'community_goal' | 'group_budget' | 'social_streak'
  target_amount?: number
  current_amount: number
  participants: ChallengeParticipant[]
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'failed'
  rewards: ChallengeReward[]
}

interface ChallengeParticipant {
  user_id: number
  user_name: string
  user_level: number
  contribution: number
  rank: number
  joined_at: string
  last_activity: string
  is_online: boolean
}

interface ChallengeReward {
  rank_min: number
  rank_max: number
  xp_bonus: number
  achievement_id?: number
  badge?: string
  title?: string
}

interface LiveTeamAction {
  challenge_id: number
  user_id: number
  user_name: string
  action_type: 'contribute' | 'milestone' | 'boost' | 'message'
  amount?: number
  message?: string
  timestamp: number
}

/**
 * Composable pour défis collaboratifs temps réel
 * Équipes, objectifs communs, progression live, chat défis
 */
export function useCollaborativeChallenges() {
  const ws = useWebSocket('/collaborative')
  const notifications = useNotifications()
  const { formatCurrency } = useFormatting()

  // State
  const activeChallenges = ref<CollaborativeChallenge[]>([])
  const teamActions = ref<LiveTeamAction[]>([])
  const currentChallenge = ref<CollaborativeChallenge | null>(null)
  const isParticipating = ref(false)
  const loading = ref(false)

  /**
   * Initialiser les défis collaboratifs
   */
  async function initCollaborative(): Promise<void> {
    loading.value = true

    try {
      await ws.connect()

      if (ws.isConnected.value) {
        subscribeToCollaborativeEvents()
        await loadActiveChallenges()
        await joinActiveParticipations()
      }
    } catch (error: any) {
      log('Erreur init collaborative:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * S'abonner aux événements collaboratifs
   */
  function subscribeToCollaborativeEvents(): void {
    ws.on('challenge_update', handleChallengeUpdate)
    ws.on('team_action', handleTeamAction)
    ws.on('milestone_reached', handleMilestoneReached)
    ws.on('participant_joined', handleParticipantJoined)
    ws.on('participant_left', handleParticipantLeft)
    ws.on('challenge_completed', handleChallengeCompleted)
    ws.on('team_message', handleTeamMessage)

    log('Événements collaboratifs activés')
  }

  /**
   * Charger les défis actifs
   */
  async function loadActiveChallenges(): Promise<void> {
    ws.send('collaborative', 'get_active_challenges', {
      user_id: getCurrentUserId()
    })
  }

  /**
   * Rejoindre les participations actives
   */
  async function joinActiveParticipations(): Promise<void> {
    activeChallenges.value.forEach(challenge => {
      const isParticipant = challenge.participants.some(p => p.user_id === getCurrentUserId())

      if (isParticipant) {
        joinChallengeRoom(challenge.id)
      }
    })
  }

  /**
   * Rejoindre un défi collaboratif
   */
  async function joinChallenge(challengeId: number): Promise<boolean> {
    try {
      ws.send('collaborative', 'join_challenge', {
        challenge_id: challengeId,
        user_id: getCurrentUserId(),
        user_name: getCurrentUserName(),
        user_level: getCurrentUserLevel()
      })

      await joinChallengeRoom(challengeId)
      return true
    } catch (error: any) {
      log('Erreur join challenge:', error)
      return false
    }
  }

  /**
   * Rejoindre la room d'un défi
   */
  async function joinChallengeRoom(challengeId: number): Promise<void> {
    ws.send('collaborative', 'join_room', {
      room_id: `challenge_${challengeId}`,
      user_id: getCurrentUserId()
    })

    log(`Rejoint room challenge: ${challengeId}`)
  }

  /**
   * Contribuer à un défi d'équipe
   */
  async function contributeToChallenge(
    challengeId: number,
    amount: number,
    message?: string
  ): Promise<boolean> {
    try {
      ws.send('collaborative', 'contribute', {
        challenge_id: challengeId,
        user_id: getCurrentUserId(),
        amount,
        message,
        timestamp: Date.now()
      })

      // Notification locale immédiate
      notifications.success(
        `Contribution de ${formatCurrency(amount)} ajoutée !`,
        {
          title: '🎯 Défi d\'Équipe',
          duration: 3000
        }
      )

      return true
    } catch (error: any) {
      log('Erreur contribution:', error)
      return false
    }
  }

  /**
   * Envoyer message à l'équipe
   */
  function sendTeamMessage(challengeId: number, message: string): void {
    ws.send('collaborative', 'team_message', {
      challenge_id: challengeId,
      user_id: getCurrentUserId(),
      user_name: getCurrentUserName(),
      message,
      timestamp: Date.now()
    })
  }

  /**
   * Gérer mise à jour défi
   */
  function handleChallengeUpdate(data: any): void {
    const challenge = activeChallenges.value.find(c => c.id === data.challenge_id)

    if (challenge) {
      // Mettre à jour progression
      challenge.current_amount = data.new_amount
      challenge.participants = data.participants

      log('Challenge update:', data)
    }
  }

  /**
   * Gérer action d'équipe
   */
  function handleTeamAction(action: LiveTeamAction): void {
    teamActions.value.unshift(action)

    // Limiter l'historique
    if (teamActions.value.length > 100) {
      teamActions.value = teamActions.value.slice(0, 100)
    }

    // Notification pour actions importantes
    if (action.action_type === 'contribute' && action.amount && action.amount >= 100) {
      notifications.info(
        `💰 ${action.user_name} a contribué ${formatCurrency(action.amount)} !`,
        {
          title: '🤝 Contribution d\'Équipe',
          duration: 3000
        }
      )
    }

    log('Team action:', action)
  }

  /**
   * Gérer milestone atteint
   */
  function handleMilestoneReached(data: any): void {
    const { challenge_name, milestone_name, progress_percent } = data

    notifications.success(
      `🎯 Milestone "${milestone_name}" atteint à ${progress_percent}% !`,
      {
        title: `🏆 ${challenge_name}`,
        duration: 6000,
        priority: 'high',
        actions: [
          { label: 'Voir progression', action: 'view_challenge', url: `/challenges/${data.challenge_id}` }
        ]
      }
    )

    log('Milestone atteint:', data)
  }

  /**
   * Gérer nouveau participant
   */
  function handleParticipantJoined(data: any): void {
    const challenge = activeChallenges.value.find(c => c.id === data.challenge_id)

    if (challenge) {
      challenge.participants.push(data.participant)

      // Notification subtile
      notifications.info(
        `${data.participant.user_name} a rejoint "${challenge.name}" !`,
        {
          title: '👥 Nouveau Coéquipier',
          duration: 2000
        }
      )
    }

    log('Participant rejoint:', data)
  }

  /**
   * Gérer participant quitté
   */
  function handleParticipantLeft(data: any): void {
    const challenge = activeChallenges.value.find(c => c.id === data.challenge_id)

    if (challenge) {
      challenge.participants = challenge.participants.filter(p => p.user_id !== data.user_id)
    }

    log('Participant quitté:', data)
  }

  /**
   * Gérer défi terminé
   */
  function handleChallengeCompleted(data: any): void {
    const { challenge_name, success, final_amount, rewards } = data

    if (success) {
      notifications.success(
        `🎉 Défi "${challenge_name}" réussi ! ${formatCurrency(final_amount)} atteint !`,
        {
          title: '🏆 VICTOIRE D\'ÉQUIPE !',
          duration: 8000,
          priority: 'high',
          actions: [
            { label: 'Voir récompenses', action: 'view_rewards', url: `/challenges/${data.challenge_id}/rewards` }
          ]
        }
      )
    } else {
      notifications.warning(
        `😔 Défi "${challenge_name}" échoué. Prochain défi bientôt !`,
        {
          title: '⚔️ Défi Terminé',
          duration: 5000
        }
      )
    }

    log('Challenge terminé:', data)
  }

  /**
   * Gérer message d'équipe
   */
  function handleTeamMessage(data: any): void {
    // Ajouter à l'historique team actions
    const teamAction: LiveTeamAction = {
      challenge_id: data.challenge_id,
      user_id: data.user_id,
      user_name: data.user_name,
      action_type: 'message',
      message: data.message,
      timestamp: data.timestamp
    }

    teamActions.value.unshift(teamAction)

    log('Message équipe:', data)
  }

  /**
   * Obtenir les défis où l'utilisateur participe
   */
  function getUserChallenges(): CollaborativeChallenge[] {
    const userId = getCurrentUserId()

    return activeChallenges.value.filter(challenge =>
      challenge.participants.some(p => p.user_id === userId)
    )
  }

  /**
   * Calculer contribution utilisateur
   */
  function getUserContribution(challengeId: number): number {
    const challenge = activeChallenges.value.find(c => c.id === challengeId)
    const userId = getCurrentUserId()

    if (!challenge) return 0

    const participant = challenge.participants.find(p => p.user_id === userId)
    return participant?.contribution || 0
  }

  /**
   * Obtenir info utilisateur actuel
   */
  function getCurrentUserId(): number {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr)?.id || 0 : 0
  }

  function getCurrentUserName(): string {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr)?.name || 'Anonyme' : 'Anonyme'
  }

  function getCurrentUserLevel(): number {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr)?.level?.level || 1 : 1
  }

  /**
   * Logger avec préfixe
   */
  function log(...args: any[]): void {
    console.log('[CollaborativeChallenges]', ...args)
  }

  // Computed properties
  const userChallenges = computed(() => getUserChallenges())

  const totalContributions = computed(() =>
    userChallenges.value.reduce((sum, challenge) =>
      sum + getUserContribution(challenge.id), 0
    )
  )

  const recentTeamActions = computed(() =>
    teamActions.value.slice(0, 20)
  )

  const participatingCount = computed(() => userChallenges.value.length)

  return {
    // State
    activeChallenges,
    teamActions,
    currentChallenge,
    isParticipating,
    loading,

    // Computed
    userChallenges,
    totalContributions,
    recentTeamActions,
    participatingCount,

    // Methods
    initCollaborative,
    joinChallenge,
    contributeToChallenge,
    sendTeamMessage,
    getUserContribution
  }
}
