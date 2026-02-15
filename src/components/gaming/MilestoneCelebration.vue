<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div class="celebration-overlay" @click.self="handleClose">
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-90"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-90"
        >
          <div class="celebration-modal">
            <!-- Confetti Animation (CSS) -->
            <div class="confetti-container">
              <div v-for="i in 20" :key="i" class="confetti" :style="confettiStyle(i)"></div>
            </div>

            <!-- Icon -->
            <div class="celebration-icon">
              <span class="icon-emoji">{{ milestone.icon }}</span>
              <div class="icon-ring"></div>
              <div class="icon-ring ring-2"></div>
            </div>

            <!-- Content -->
            <div class="celebration-content">
              <p class="celebration-label">{{ celebrationLabel }}</p>
              <h2 class="celebration-title">{{ milestone.title }}</h2>
              <p class="celebration-description">{{ milestone.description }}</p>

              <!-- Reward -->
              <div v-if="milestone.reward && showReward" class="reward-badge">
                <span class="reward-icon">🎁</span>
                <span class="reward-text">{{ milestone.reward }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="celebration-actions">
              <button
                v-if="milestone.reward && !milestone.reward_claimed"
                @click="handleClaim"
                :disabled="claiming"
                class="btn-claim"
              >
                {{ claiming ? 'Chargement...' : '🎉 Réclamer' }}
              </button>

              <button @click="handleClose" class="btn-close">
                {{ milestone.reward && !milestone.reward_claimed ? 'Plus tard' : 'Continuer' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  useProgressiveGaming,
  ENGAGEMENT_LEVELS,
  type Milestone,
} from '@/composables/useProgressiveGaming'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  milestone: Milestone
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  claimed: [milestone: Milestone]
}>()

// ==========================================
// COMPOSABLES
// ==========================================

const { engagementLevel, claimMilestoneReward, recordInteraction } = useProgressiveGaming()

// ==========================================
// STATE
// ==========================================

const claiming = ref(false)

// ==========================================
// COMPUTED
// ==========================================

const showReward = computed(() => engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS)

const celebrationLabel = computed(() => {
  if (engagementLevel.value >= ENGAGEMENT_LEVELS.GAMING) {
    return '🏆 Succès débloqué !'
  }
  return '✨ Objectif atteint !'
})

// ==========================================
// MÉTHODES
// ==========================================

async function handleClaim(): Promise<void> {
  claiming.value = true

  try {
    const success = await claimMilestoneReward(props.milestone.id)

    if (success) {
      emit('claimed', props.milestone)
    }
  } finally {
    claiming.value = false
  }
}

function handleClose(): void {
  recordInteraction('closed_celebration', 'milestone', props.milestone.id)
  emit('close')
}

function confettiStyle(index: number): Record<string, string> {
  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B']
  const color = colors[index % colors.length]
  const left = Math.random() * 100
  const delay = Math.random() * 2
  const duration = 2 + Math.random() * 2

  return {
    '--confetti-color': color,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  // Enregistrer l'affichage de la célébration
  recordInteraction('viewed_celebration', 'milestone', props.milestone.id)
})
</script>

<style scoped>
.celebration-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.celebration-modal {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: center;
  overflow: hidden;
}

/* Confetti */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  top: -10px;
  width: 10px;
  height: 10px;
  background: var(--confetti-color);
  opacity: 0;
  animation: confetti-fall 3s ease-out forwards;
}

.confetti:nth-child(odd) {
  border-radius: 50%;
}

@keyframes confetti-fall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(400px) rotate(720deg);
  }
}

/* Icon */
.celebration-icon {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-emoji {
  font-size: 3rem;
  z-index: 2;
  animation: bounce 0.5s ease-out;
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.icon-ring {
  position: absolute;
  inset: 0;
  border: 3px solid #3b82f6;
  border-radius: 50%;
  opacity: 0;
  animation: ring-expand 1s ease-out 0.3s forwards;
}

.icon-ring.ring-2 {
  animation-delay: 0.5s;
  border-color: #8b5cf6;
}

@keyframes ring-expand {
  0% {
    transform: scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Content */
.celebration-content {
  margin-bottom: 1.5rem;
}

.celebration-label {
  font-size: 0.875rem;
  color: #5b6270;
  margin-bottom: 0.5rem;
}

.celebration-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.celebration-description {
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.5;
}

/* Reward */
.reward-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fcd34d;
  border-radius: 9999px;
}

.reward-icon {
  font-size: 1.25rem;
}

.reward-text {
  font-weight: 600;
  color: #92400e;
}

/* Actions */
.celebration-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-claim {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-claim:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-claim:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-close {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #5b6270;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #374151;
}
</style>
