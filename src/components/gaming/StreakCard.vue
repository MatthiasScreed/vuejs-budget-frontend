<template>
  <div class="streak-card">
    <div class="streak-icon">🔥</div>

    <div class="streak-content">
      <h3 class="streak-title">Série de {{ days }} jours !</h3>
      <p class="streak-type">{{ typeLabel }}</p>

      <div class="streak-progress">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
        <span class="progress-text">
          {{ days }} / {{ best }} jours (record)
        </span>
      </div>

      <p class="streak-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  days: number
  type: string
  best: number
}>()

const typeLabel = computed(() => {
  const labels: Record<string, string> = {
    'daily_budget_check': 'Consultation quotidienne',
    'weekly_savings': 'Épargne hebdomadaire',
    'transaction_tracking': 'Suivi des transactions',
    'goal_contribution': 'Contributions aux objectifs'
  }
  return labels[props.type] || props.type
})

const progressPercent = computed(() => {
  return Math.min((props.days / props.best) * 100, 100)
})

const message = computed(() => {
  if (props.days < 7) {
    return 'Continue comme ça ! 💪'
  } else if (props.days < 30) {
    return 'Excellente régularité ! 🌟'
  } else if (props.days < 100) {
    return 'Champion de la constance ! 🏆'
  } else {
    return 'Légende absolue ! 👑'
  }
})
</script>

<style scoped>
.streak-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  border-radius: 16px;
  color: white;
}

.streak-icon {
  font-size: 4rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.streak-content {
  flex: 1;
}

.streak-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.streak-type {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.streak-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  opacity: 0.9;
}

.streak-message {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.95;
}

@media (max-width: 768px) {
  .streak-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .streak-icon {
    font-size: 3rem;
  }

  .streak-title {
    font-size: 1.25rem;
  }
}
</style>
