<template>
  <transition-group
    name="alert"
    tag="div"
    class="fixed top-4 right-4 z-50 space-y-3"
  >
    <div
      v-for="alert in visibleAlerts"
      :key="alert.id"
      class="banking-alert max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden"
      :class="getAlertClasses(alert.type)"
    >
      <div class="p-4">
        <div class="flex items-start">
          <!-- Icône -->
          <div class="flex-shrink-0">
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-sm"
              :class="getIconClasses(alert.type)"
            >
              {{ getIcon(alert.type) }}
            </div>
          </div>

          <!-- Contenu -->
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium" :class="getTitleClasses(alert.type)">
              {{ alert.title }}
            </p>
            <p class="mt-1 text-sm" :class="getMessageClasses(alert.type)">
              {{ alert.message }}
            </p>

            <!-- Action button si présente -->
            <div v-if="alert.action" class="mt-3 flex">
              <button
                @click="handleAction(alert)"
                class="text-xs font-medium rounded-md px-2 py-1 transition-colors duration-200"
                :class="getActionClasses(alert.type)"
              >
                {{ alert.actionText || 'Action' }}
              </button>
            </div>
          </div>

          <!-- Bouton fermer -->
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="dismiss(alert.id)"
              class="inline-flex rounded-md focus:outline-none focus:ring-2 transition-colors duration-200"
              :class="getCloseClasses(alert.type)"
            >
              <span class="sr-only">Fermer</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Barre de progression pour auto-dismiss -->
      <div
        v-if="alert.autoDismiss"
        class="h-1 bg-black bg-opacity-10"
      >
        <div
          class="h-1 transition-all ease-linear"
          :class="getProgressClasses(alert.type)"
          :style="`width: ${getProgress(alert.id)}%; transition-duration: ${DISMISS_TIMEOUT}ms;`"
        ></div>
      </div>
    </div>
  </transition-group>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBankingStore } from '@/stores/banking.ts'

// Composition
const router = useRouter()
const bankingStore = useBankingStore()

// Constants
const DISMISS_TIMEOUT = 5000 // 5 secondes
const MAX_VISIBLE_ALERTS = 4

// State
const progress = ref<Record<string, number>>({})
const timers = ref<Record<string, number>>({})

// Computed
const visibleAlerts = computed(() => {
  return bankingStore.recentAlerts
    .slice(0, MAX_VISIBLE_ALERTS)
    .map(alert => ({
      ...alert,
      autoDismiss: alert.type === 'success' || alert.type === 'info'
    }))
})

// Lifecycle
onMounted(() => {
  // Démarrer les timers pour les alertes auto-dismiss
  visibleAlerts.value.forEach(alert => {
    if (alert.autoDismiss) {
      startDismissTimer(alert.id)
    }
  })
})

onUnmounted(() => {
  // Nettoyer tous les timers
  Object.values(timers.value).forEach(timer => clearTimeout(timer))
})

// Methods
function dismiss(alertId: string): void {
  // Nettoyer le timer si il existe
  if (timers.value[alertId]) {
    clearTimeout(timers.value[alertId])
    delete timers.value[alertId]
  }

  // Supprimer l'alerte du store
  bankingStore.removeAlert(alertId)
}

function handleAction(alert: any): void {
  // Exécuter l'action selon le type
  switch (alert.action) {
    case 'view-pending':
      router.push('/banking/pending')
      break
    case 'fix-connections':
      router.push('/banking')
      break
    case 'sync-all':
      bankingStore.syncAllConnections()
      break
    case 'connect-bank':
      router.push('/banking')
      break
    default:
      console.log('Action non gérée:', alert.action)
  }

  // Fermer l'alerte après action
  dismiss(alert.id)
}

function startDismissTimer(alertId: string): void {
  // Démarrer le timer de progression
  progress.value[alertId] = 0

  const startTime = Date.now()

  // Timer pour la barre de progression
  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const percentage = (elapsed / DISMISS_TIMEOUT) * 100

    progress.value[alertId] = Math.min(percentage, 100)

    if (percentage >= 100) {
      clearInterval(progressInterval)
    }
  }, 50)

  // Timer pour fermeture automatique
  timers.value[alertId] = setTimeout(() => {
    dismiss(alertId)
    clearInterval(progressInterval)
  }, DISMISS_TIMEOUT)
}

function getProgress(alertId: string): number {
  return progress.value[alertId] || 0
}

// Style helpers
function getAlertClasses(type: string): string {
  const classes: Record<string, string> = {
    'success': 'bg-green-50 border border-green-200',
    'error': 'bg-red-50 border border-red-200',
    'warning': 'bg-yellow-50 border border-yellow-200',
    'info': 'bg-blue-50 border border-blue-200'
  }
  return classes[type] || classes.info
}

function getIconClasses(type: string): string {
  const classes: Record<string, string> = {
    'success': 'bg-green-100 text-green-600',
    'error': 'bg-red-100 text-red-600',
    'warning': 'bg-yellow-100 text-yellow-600',
    'info': 'bg-blue-100 text-blue-600'
  }
  return classes[type] || classes.info
}

function getTitleClasses(type: string): string {
  const classes: Record<string, string> = {
    'success': 'text-green-900',
    'error': 'text-red-900',
    'warning': 'text-yellow-900',
    'info': 'text-blue-900'
  }
  return classes[type] || classes.info
}

function getMessageClasses(type: string): string {
  const classes: Record<string, string> = {
    'success': 'text-green-700',
    'error': 'text-red-700',
    'warning': 'text-yellow-700',
    'info': 'text-blue-700'
  }
  return classes[type] || classes.info
}

function getActionClasses(type: string): string {
  const classes: Record<string, string> = {
    'success': 'bg-green-100 text-green-800 hover:bg-green-200',
    'error': 'bg-red-100 text-red-800 hover:bg-red-200',
    'warning': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    'info': 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  }
  return classes[type] || classes.info
}

function getCloseClasses(type: string): string {
  const classes = {
    'success': 'text-green-400 hover:text-green-500 focus:ring-green-500',
    'error': 'text-red-400 hover:text-red-500 focus:ring-red-500',
    'warning': 'text-yellow-400 hover:text-yellow-500 focus:ring-yellow-500',
    'info': 'text-blue-400 hover:text-blue-500 focus:ring-blue-500'
  }
  return classes[type] || classes.info
}

function getProgressClasses(type: string): string {
  const classes = {
    'success': 'bg-green-400',
    'error': 'bg-red-400',
    'warning': 'bg-yellow-400',
    'info': 'bg-blue-400'
  }
  return classes[type] || classes.info
}

function getIcon(type: string): string {
  const icons = {
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'info': 'ℹ️'
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
/* Animations pour les alertes */
.alert-enter-active {
  transition: all 0.3s ease-out;
}

.alert-leave-active {
  transition: all 0.3s ease-in;
}

.alert-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.alert-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.alert-move {
  transition: transform 0.3s ease;
}

/* Styles de base pour les alertes */
.banking-alert {
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Animation pour la barre de progression */
.progress-bar {
  animation: progress linear;
}

@keyframes progress {
  from { width: 0%; }
  to { width: 100%; }
}

/* Hover effects */
.banking-alert:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* Focus states pour l'accessibilité */
button:focus {
  outline: none;
  ring: 2px;
  ring-offset: 2px;
}
</style>
