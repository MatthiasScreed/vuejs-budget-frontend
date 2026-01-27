import mitt from 'mitt'
import type { Transaction, Achievement, FinancialGoal, User } from '@/types'

/**
 * Events typés pour le découplage entre stores
 * Évite les imports circulaires et facilite les tests
 */
type AppEvents = {
  // Auth events
  'auth:login': User
  'auth:logout': void
  'auth:register': User
  'auth:user_updated': User
  'auth:profile_updated': User

  // Transaction events
  'transaction:created': Transaction
  'transaction:updated': Transaction
  'transaction:deleted': number

  // Goal events
  'goal:created': FinancialGoal
  'goal:updated': FinancialGoal
  'goal:completed': FinancialGoal
  'goal:deleted': number

  // Achievement events
  'achievement:unlocked': Achievement
  'achievements:unlocked': Achievement[]
  'achievement:progress': { achievementId: string, progress: number }

  // Level events
  'level:up': { oldLevel: number, newLevel: number, xpGained: number }
  'xp:gained': { amount: number, source: string, description?: string }

  // Challenge events
  'challenge:joined': string
  'challenge:completed': string
  'challenge:progress': { challengeId: string, progress: number }

  // Streak events
  'streak:maintained': { streakId: string, days: number }
  'streak:broken': { streakId: string, finalDays: number }
  'streak:milestone': { streakId: string, milestone: number }

  // Notification events
  'notification:created': any
  'notification:read': string
  'notification:clear_all': void

  // Banking events
  'banking:sync_started': number
  'banking:sync_completed': { connectionId: number, imported: number }
  'banking:transaction_processed': any

  // System events
  'app:initialized': void
  'app:error': { context: string, error: any }
  'cache:invalidated': string[]
}

/**
 * Event bus global de l'application
 */
export const eventBus = mitt<AppEvents>()

/**
 * Helper pour écouter plusieurs événements
 */
export function onMultiple<K extends keyof AppEvents>(
  events: K[],
  handler: (event: K, data: AppEvents[K]) => void
) {
  events.forEach(event => {
    eventBus.on(event, (data) => handler(event, data))
  })
}

/**
 * Helper pour émettre avec logging (dev only)
 */
export function emitWithLog<K extends keyof AppEvents>(
  event: K,
  data: AppEvents[K]
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔥 Event: ${event}`, data)
  }
  eventBus.emit(event, data)
}

/**
 * Nettoyer tous les event listeners (pour tests)
 */
export function clearEventBus() {
  eventBus.all.clear()
}

/**
 * Middleware pour retry automatique sur erreur réseau
 */
export async function withRetry<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await action()
    } catch (error: any) {
      if (attempt === maxRetries - 1) throw error

      // Attendre avant retry
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)))

      emitWithLog('app:error', {
        context: `retry_attempt_${attempt + 1}`,
        error
      })
    }
  }

  throw new Error('Max retries exceeded')
}
