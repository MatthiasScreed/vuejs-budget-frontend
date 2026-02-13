<template>
  <!-- Toast de feedback adaptatif selon le niveau d'engagement -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-2 scale-95"
  >
    <div
      v-if="visible"
      :class="toastClasses"
      @click="handleClick"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <!-- Icône -->
      <span class="text-xl flex-shrink-0">{{ feedback.icon }}</span>

      <!-- Contenu -->
      <div class="flex-1 min-w-0">
        <!-- Titre (visible niveau 2+) -->
        <p v-if="showTitle" class="font-medium text-sm" :class="titleClass">
          {{ feedback.title }}
        </p>

        <!-- Message -->
        <p :class="messageClass" class="text-sm truncate">
          {{ feedback.message }}
        </p>
      </div>

      <!-- Points gagnés (niveau 2+) -->
      <div v-if="showPoints && points > 0" class="flex-shrink-0 ml-2">
        <span class="text-xs font-medium px-2 py-1 rounded-full" :class="pointsBadgeClass">
          +{{ points }} {{ terminology.points }}
        </span>
      </div>

      <!-- Bouton fermer (niveau 3+) -->
      <button
        v-if="showCloseButton"
        @click.stop="dismiss"
        class="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
      >
        <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Barre de progression (niveau 2+) -->
      <div
        v-if="showProgressBar"
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 rounded-b-lg overflow-hidden"
      >
        <div
          class="h-full transition-all duration-100 ease-linear"
          :class="progressBarClass"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  useProgressiveGaming,
  type Feedback,
  ENGAGEMENT_LEVELS,
} from '@/composables/useProgressiveGaming'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  feedback: Feedback
  points?: number
  duration?: number
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
}

const props = withDefaults(defineProps<Props>(), {
  points: 0,
  duration: 3500,
  position: 'top-right',
})

const emit = defineEmits<{
  close: []
  click: []
}>()

// ==========================================
// COMPOSABLES
// ==========================================

const { engagementLevel, terminology, uiConfig, recordInteraction } = useProgressiveGaming()

// ==========================================
// STATE
// ==========================================

const visible = ref(false)
const progressPercent = ref(100)
const isPaused = ref(false)
let timer: ReturnType<typeof setInterval> | null = null
let startTime: number = 0
let remainingTime: number = 0

// ==========================================
// COMPUTED - Affichage conditionnel
// ==========================================

const showTitle = computed(
  () => engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS && props.feedback.title,
)

const showPoints = computed(
  () => engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS && uiConfig.value.show_xp_bar,
)

const showProgressBar = computed(() => engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS)

const showCloseButton = computed(() => engagementLevel.value >= ENGAGEMENT_LEVELS.SOCIAL)

// ==========================================
// COMPUTED - Styles
// ==========================================

const toastClasses = computed(() => {
  const base = [
    'relative flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
    'cursor-pointer select-none max-w-sm',
  ]

  // Position
  const positionClasses: Record<string, string> = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
  }
  base.push(positionClasses[props.position])

  // Style selon le ton
  const toneClasses: Record<string, string> = {
    neutral: 'bg-white border border-gray-200',
    encouraging: 'bg-blue-50 border border-blue-100',
    celebratory: 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200',
    informative: 'bg-gray-50 border border-gray-200',
  }
  base.push(toneClasses[props.feedback.tone] || toneClasses.neutral)

  // Animation selon l'intensité
  const intensity = uiConfig.value.animation_intensity
  if (intensity === 'engaging' || intensity === 'full') {
    base.push('hover:scale-[1.02] transition-transform')
  }

  return base
})

const titleClass = computed(() => {
  const classes: Record<string, string> = {
    neutral: 'text-gray-900',
    encouraging: 'text-blue-900',
    celebratory: 'text-green-900',
    informative: 'text-gray-900',
  }
  return classes[props.feedback.tone] || classes.neutral
})

const messageClass = computed(() => {
  const classes: Record<string, string> = {
    neutral: 'text-gray-600',
    encouraging: 'text-blue-700',
    celebratory: 'text-green-700',
    informative: 'text-gray-600',
  }
  return classes[props.feedback.tone] || classes.neutral
})

const pointsBadgeClass = computed(() => {
  const classes: Record<string, string> = {
    neutral: 'bg-gray-100 text-gray-700',
    encouraging: 'bg-blue-100 text-blue-700',
    celebratory: 'bg-green-100 text-green-700',
    informative: 'bg-gray-100 text-gray-700',
  }
  return classes[props.feedback.tone] || classes.neutral
})

const progressBarClass = computed(() => {
  const classes: Record<string, string> = {
    neutral: 'bg-gray-400',
    encouraging: 'bg-blue-400',
    celebratory: 'bg-green-400',
    informative: 'bg-gray-400',
  }
  return classes[props.feedback.tone] || classes.neutral
})

// ==========================================
// MÉTHODES
// ==========================================

function startTimer(): void {
  remainingTime = props.duration
  startTime = Date.now()

  timer = setInterval(() => {
    if (isPaused.value) return

    const elapsed = Date.now() - startTime
    const remaining = props.duration - elapsed
    progressPercent.value = Math.max(0, (remaining / props.duration) * 100)

    if (remaining <= 0) {
      dismiss()
    }
  }, 50)
}

function pauseTimer(): void {
  if (!showProgressBar.value) return

  isPaused.value = true
  remainingTime = (progressPercent.value / 100) * props.duration
}

function resumeTimer(): void {
  if (!showProgressBar.value) return

  isPaused.value = false
  startTime = Date.now() - (props.duration - remainingTime)
}

function dismiss(): void {
  visible.value = false

  if (timer) {
    clearInterval(timer)
    timer = null
  }

  // Enregistrer l'interaction
  recordInteraction('dismissed_feedback', 'feedback', props.feedback.id)

  setTimeout(() => emit('close'), 200)
}

function handleClick(): void {
  recordInteraction('clicked_feedback', 'feedback', props.feedback.id)
  emit('click')
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  // Délai avant affichage pour l'animation
  setTimeout(() => {
    visible.value = true
    startTimer()
  }, 50)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
