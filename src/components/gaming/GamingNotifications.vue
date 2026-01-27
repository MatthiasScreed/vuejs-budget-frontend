<template>
  <!-- Container pour toutes les notifications flottantes -->
  <div class="fixed top-20 right-4 z-50 space-y-4 pointer-events-none">
    <!-- Notifications gaming -->
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in visibleNotifications"
        :key="notification.id"
        class="pointer-events-auto transform transition-all duration-500"
        :class="getNotificationClass(notification.type)"
      >
        <!-- Achievement Unlock -->
        <div
          v-if="notification.type === 'achievement'"
          class="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white p-4 rounded-xl shadow-xl border-2 border-yellow-300 max-w-sm"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TrophyIcon class="w-6 h-6 text-white" />
              </div>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-lg">🏆 Succès débloqué !</h3>
              <p class="text-yellow-100 text-sm">{{ notification.title }}</p>
              <p class="text-xs text-yellow-200 mt-1">+{{ notification.xpGain }} XP</p>
            </div>
          </div>
          <button
            @click="dismissNotification(notification.id)"
            class="absolute top-2 right-2 text-white/70 hover:text-white"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Level Up -->
        <div
          v-else-if="notification.type === 'level_up'"
          class="bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 text-white p-4 rounded-xl shadow-xl border-2 border-purple-300 max-w-sm"
        >
          <div class="text-center">
            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <StarIcon class="w-8 h-8 text-white" />
            </div>
            <h3 class="font-bold text-xl">🎉 NIVEAU {{ notification.newLevel }} !</h3>
            <p class="text-purple-100 text-sm mt-1">{{ notification.title }}</p>
            <p class="text-xs text-purple-200 mt-2">Nouvelles fonctionnalités débloquées !</p>
          </div>
          <button
            @click="dismissNotification(notification.id)"
            class="absolute top-2 right-2 text-white/70 hover:text-white"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- XP Gain -->
        <div
          v-else-if="notification.type === 'xp_gain'"
          class="bg-gradient-to-r from-green-400 to-blue-500 text-white p-3 rounded-lg shadow-lg max-w-xs"
        >
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <PlusIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-semibold">+{{ notification.xpGain }} XP</p>
              <p class="text-xs text-green-100">{{ notification.title }}</p>
            </div>
          </div>
        </div>

        <!-- Streak -->
        <div
          v-else-if="notification.type === 'streak'"
          class="bg-gradient-to-r from-orange-400 to-red-500 text-white p-3 rounded-lg shadow-lg max-w-xs"
        >
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FireIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-semibold">🔥 Série de {{ notification.streakDays }} jours !</p>
              <p class="text-xs text-orange-100">{{ notification.title }}</p>
            </div>
          </div>
        </div>

        <!-- Challenge Complete -->
        <div
          v-else-if="notification.type === 'challenge'"
          class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl shadow-xl max-w-sm"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircleIcon class="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 class="font-bold">🎯 Défi terminé !</h3>
              <p class="text-indigo-100 text-sm">{{ notification.title }}</p>
              <div class="flex items-center space-x-2 mt-2">
                <span class="text-xs bg-white/20 px-2 py-1 rounded">+{{ notification.xpGain }} XP</span>
                <span class="text-xs bg-white/20 px-2 py-1 rounded">{{ notification.reward }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Budget Alert -->
        <div
          v-else-if="notification.type === 'budget_alert'"
          class="bg-gradient-to-r from-red-400 to-pink-500 text-white p-3 rounded-lg shadow-lg max-w-xs"
        >
          <div class="flex items-center space-x-2">
            <ExclamationTriangleIcon class="w-6 h-6 text-white" />
            <div>
              <p class="font-semibold text-sm">⚠️ Alerte Budget</p>
              <p class="text-xs text-red-100">{{ notification.title }}</p>
            </div>
          </div>
        </div>

        <!-- Default notification -->
        <div
          v-else
          class="bg-white border border-gray-200 text-gray-900 p-4 rounded-xl shadow-lg max-w-sm"
        >
          <div class="flex items-start space-x-3">
            <BellIcon class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="font-medium text-sm">{{ notification.title }}</p>
              <p v-if="notification.message" class="text-gray-600 text-xs mt-1">{{ notification.message }}</p>
            </div>
            <button
              @click="dismissNotification(notification.id)"
              class="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGamingStore } from '@/stores/gamingStore'
import {
  TrophyIcon,
  StarIcon,
  PlusIcon,
  FireIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface GamingNotification {
  id: string
  type: 'achievement' | 'level_up' | 'xp_gain' | 'streak' | 'challenge' | 'budget_alert' | 'general'
  title: string
  message?: string
  xpGain?: number
  newLevel?: number
  streakDays?: number
  reward?: string
  duration?: number // Durée d'affichage en ms (défaut: 5000)
  timestamp: number
}

// Store
const gamingStore = useGamingStore()

// State
const notifications = ref<GamingNotification[]>([])
const autoHideTimeout = ref<Record<string, NodeJS.Timeout>>({})

// Computed
const visibleNotifications = computed(() =>
  notifications.value.slice(0, 5) // Max 5 notifications affichées
)

/**
 * Ajouter une nouvelle notification
 */
const addNotification = (notification: Omit<GamingNotification, 'id' | 'timestamp'>): void => {
  const newNotification: GamingNotification = {
    ...notification,
    id: generateNotificationId(),
    timestamp: Date.now(),
    duration: notification.duration || 5000
  }

  // Ajouter en haut de la pile
  notifications.value.unshift(newNotification)

  // Auto-hide après la durée spécifiée
  if (newNotification.duration > 0) {
    autoHideTimeout.value[newNotification.id] = setTimeout(() => {
      dismissNotification(newNotification.id)
    }, newNotification.duration)
  }

  // Limiter le nombre total de notifications
  if (notifications.value.length > 10) {
    const removed = notifications.value.splice(10)
    removed.forEach(n => clearTimeout(autoHideTimeout.value[n.id]))
  }
}

/**
 * Supprimer une notification
 */
const dismissNotification = (id: string): void => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)

    // Nettoyer le timeout
    if (autoHideTimeout.value[id]) {
      clearTimeout(autoHideTimeout.value[id])
      delete autoHideTimeout.value[id]
    }
  }
}

/**
 * Supprimer toutes les notifications
 */
const clearAll = (): void => {
  // Clear timeouts
  Object.values(autoHideTimeout.value).forEach(clearTimeout)
  autoHideTimeout.value = {}

  // Clear notifications
  notifications.value = []
}

/**
 * Générer un ID unique pour les notifications
 */
const generateNotificationId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get notification CSS class
 */
const getNotificationClass = (type: string): string => {
  return `notification-${type}`
}

// Méthodes d'exemple pour tester les notifications
const testAchievement = (): void => {
  addNotification({
    type: 'achievement',
    title: 'Économe de la semaine',
    message: 'Tu as respecté ton budget 7 jours consécutifs !',
    xpGain: 250
  })
}

const testLevelUp = (): void => {
  addNotification({
    type: 'level_up',
    title: 'Félicitations !',
    newLevel: 5,
    duration: 7000
  })
}

const testStreak = (): void => {
  addNotification({
    type: 'streak',
    title: 'Incroyable régularité !',
    streakDays: 14
  })
}

// Exposer les méthodes pour utilisation externe
defineExpose({
  addNotification,
  dismissNotification,
  clearAll,
  testAchievement,
  testLevelUp,
  testStreak
})

// Lifecycle
onMounted(() => {
  // Écouter les événements gaming du store
  gamingStore.$subscribe((mutation, state) => {
    // Détecter les gains XP et afficher notification
    if (mutation.type === 'direct' && mutation.payload && typeof mutation.payload === 'object') {
      const payload = mutation.payload as any

      if (payload.xpGain) {
        addNotification({
          type: 'xp_gain',
          title: payload.action || 'Action terminée',
          xpGain: payload.xpGain,
          duration: 3000
        })
      }
    }
  })
})
</script>

<style scoped>
/* Animations des notifications */
.notification-enter-active {
  transition: all 0.5s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Effets spéciaux pour chaque type */
.notification-achievement {
  animation: achievement-glow 0.5s ease-out;
}

.notification-level_up {
  animation: level-up-bounce 0.6s ease-out;
}

.notification-streak {
  animation: streak-flame 0.4s ease-out;
}

/* Keyframes pour les animations */
@keyframes achievement-glow {
  0% {
    box-shadow: 0 0 0 rgba(255, 193, 7, 0);
    transform: scale(0.9);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 193, 7, 0.6);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.3);
    transform: scale(1);
  }
}

@keyframes level-up-bounce {
  0%, 20%, 40%, 60%, 80% {
    transform: translateY(0) scale(1);
  }
  10% {
    transform: translateY(-10px) scale(1.05);
  }
  30% {
    transform: translateY(-5px) scale(1.02);
  }
  50% {
    transform: translateY(-8px) scale(1.03);
  }
  70% {
    transform: translateY(-3px) scale(1.01);
  }
}

@keyframes streak-flame {
  0% {
    transform: scale(0.8) rotate(-3deg);
  }
  50% {
    transform: scale(1.1) rotate(3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* Hover effects */
.notification-item:hover {
  transform: scale(1.02);
  z-index: 60;
}
</style>
