<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div v-if="!dismissed" class="encouragement-card">
      <div class="card-content">
        <!-- Icône -->
        <div class="card-icon">
          <span class="text-2xl">{{ icon }}</span>
        </div>

        <!-- Message -->
        <div class="card-text">
          <p class="card-message">{{ message || defaultMessage }}</p>

          <!-- Stats highlight -->
          <div v-if="statsHighlight" class="stats-highlight">
            <span class="stats-value">{{ formattedValue }}</span>
            <span class="stats-label">{{ statsHighlight.label }}</span>
          </div>
        </div>

        <!-- Bouton fermer -->
        <button @click="handleDismiss" class="dismiss-btn" aria-label="Fermer">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Barre décorative -->
      <div class="decorative-bar"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// ==========================================
// PROPS & EMITS
// ==========================================

interface StatsHighlight {
  type: string
  value: number
  label: string
}

interface Props {
  message?: string
  statsHighlight?: StatsHighlight | null
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  statsHighlight: null,
})

const emit = defineEmits<{
  dismiss: []
}>()

// ==========================================
// STATE
// ==========================================

const dismissed = ref(false)

// ==========================================
// COMPUTED
// ==========================================

const defaultMessage =
  'Bienvenue ! Vous êtes sur la bonne voie pour atteindre vos objectifs financiers.'

const icon = computed(() => {
  if (!props.statsHighlight) return '👋'

  switch (props.statsHighlight.type) {
    case 'savings':
      return '💰'
    case 'goal_progress':
      return '🎯'
    case 'streak':
      return '🔥'
    case 'achievement':
      return '🏆'
    default:
      return '✨'
  }
})

const formattedValue = computed(() => {
  if (!props.statsHighlight) return ''

  const value = props.statsHighlight.value

  // Formatage selon le type
  if (props.statsHighlight.type === 'savings') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return value.toString()
})

// ==========================================
// MÉTHODES
// ==========================================

function handleDismiss(): void {
  dismissed.value = true
  emit('dismiss')
}
</script>

<style scoped>
.encouragement-card {
  position: relative;
  background: linear-gradient(135deg, #ebf4ff 0%, #e0e7ff 100%);
  border: 1px solid #c7d2fe;
  border-radius: 1rem;
  overflow: hidden;
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
}

.card-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-text {
  flex: 1;
  min-width: 0;
}

.card-message {
  color: #1e40af;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.stats-highlight {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.stats-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a8a;
}

.stats-label {
  font-size: 0.875rem;
  color: #3b82f6;
}

.dismiss-btn {
  flex-shrink: 0;
  padding: 0.375rem;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dismiss-btn:hover {
  color: #374151;
  background: rgba(0, 0, 0, 0.05);
}

.decorative-bar {
  height: 3px;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
}
</style>
