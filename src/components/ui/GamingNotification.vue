<template>
  <Transition
    enter-active-class="transform transition-all duration-300 ease-out"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transform transition-all duration-300 ease-in"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div
      v-if="visible"
      class="fixed top-4 right-4 z-50 max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      :class="notificationClasses"
    >
      <!-- Header with Icon -->
      <div class="p-4 flex items-start space-x-3">
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
          :class="iconClasses"
        >
          <span class="text-lg">{{ getIcon() }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-gray-900 truncate">
              {{ notification.title }}
            </h4>
            <button
              @click="close"
              class="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p class="mt-1 text-sm text-gray-600">
            {{ notification.message }}
          </p>

          <!-- Achievement Progress -->
          <div v-if="notification.type === 'achievement_unlocked' && notification.data" class="mt-2">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ notification.data.points }} XP</span>
              <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {{ notification.data.rarity_name }}
              </span>
            </div>
          </div>

          <!-- Level Up Progress -->
          <div v-if="notification.type === 'level_up' && notification.data" class="mt-2">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>Niveau {{ notification.data.old_level }} → {{ notification.data.new_level }}</span>
              <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                +{{ notification.data.xp_bonus }} XP Bonus
              </span>
            </div>
          </div>

          <!-- XP Gained -->
          <div v-if="notification.type === 'xp_gained' && notification.data" class="mt-2">
            <div class="text-xs text-gray-500">
              +{{ notification.data.amount }} XP - {{ notification.data.action }}
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="duration && duration > 0" class="h-1 bg-gray-200">
        <div
          class="h-full bg-blue-500 transition-all duration-100 ease-linear"
          :style="`width: ${progressPercentage}%`"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface GamingNotification {
  id: string
  type: 'achievement_unlocked' | 'level_up' | 'challenge_completed' | 'streak_milestone' | 'xp_gained'
  title: string
  message: string
  icon?: string
  data?: any
  created_at: string
  read_at?: string
}

interface Props {
  notification: GamingNotification
  visible: boolean
  duration?: number // in milliseconds, 0 = no auto-close
}

const props = withDefaults(defineProps<Props>(), {
  duration: 5000
})

const emit = defineEmits<{
  close: []
}>()

const progressPercentage = ref(100)
let timer: NodeJS.Timeout | null = null
let progressTimer: NodeJS.Timeout | null = null

const notificationClasses = computed(() => {
  switch (props.notification.type) {
    case 'achievement_unlocked':
      return 'ring-2 ring-purple-500 ring-opacity-50'
    case 'level_up':
      return 'ring-2 ring-yellow-500 ring-opacity-50'
    case 'challenge_completed':
      return 'ring-2 ring-green-500 ring-opacity-50'
    case 'streak_milestone':
      return 'ring-2 ring-orange-500 ring-opacity-50'
    case 'xp_gained':
      return 'ring-2 ring-blue-500 ring-opacity-50'
    default:
      return ''
  }
})

const iconClasses = computed(() => {
  switch (props.notification.type) {
    case 'achievement_unlocked':
      return 'bg-gradient-to-r from-purple-500 to-pink-500'
    case 'level_up':
      return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    case 'challenge_completed':
      return 'bg-gradient-to-r from-green-500 to-teal-500'
    case 'streak_milestone':
      return 'bg-gradient-to-r from-orange-500 to-red-500'
    case 'xp_gained':
      return 'bg-gradient-to-r from-blue-500 to-indigo-500'
    default:
      return 'bg-gray-500'
  }
})

const getIcon = (): string => {
  if (props.notification.icon) {
    return props.notification.icon
  }

  switch (props.notification.type) {
    case 'achievement_unlocked':
      return '🏆'
    case 'level_up':
      return '📈'
    case 'challenge_completed':
      return '🎯'
    case 'streak_milestone':
      return '🔥'
    case 'xp_gained':
      return '⭐'
    default:
      return '🎮'
  }
}

const close = () => {
  emit('close')
}

const startAutoClose = () => {
  if (props.duration > 0) {
    // Timer for auto-close
    timer = setTimeout(() => {
      close()
    }, props.duration)

    // Progress bar animation
    const interval = 100
    const steps = props.duration / interval
    const decrement = 100 / steps

    progressTimer = setInterval(() => {
      progressPercentage.value -= decrement
      if (progressPercentage.value <= 0) {
        progressPercentage.value = 0
        if (progressTimer) {
          clearInterval(progressTimer)
        }
      }
    }, interval)
  }
}

const stopAutoClose = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

onMounted(() => {
  if (props.visible) {
    startAutoClose()
  }
})

onUnmounted(() => {
  stopAutoClose()
})
</script>
