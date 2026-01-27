<template>
  <div
    class="goal-card"
    :class="{ 'goal-card--clickable': clickable }"
    @click="handleClick"
  >
    <div class="goal-header">
      <div class="goal-icon" :style="{ backgroundColor: goal.color || '#3b82f6' }">
        {{ goal.icon || '🎯' }}
      </div>
      <div class="goal-title-section">
        <h3 class="goal-title">{{ goal.name }}</h3>
        <p v-if="goal.description" class="goal-description">
          {{ goal.description }}
        </p>
      </div>
      <div class="goal-percentage">
        {{ progressPercentage }}%
      </div>
    </div>

    <div class="goal-amounts">
      <span class="goal-current">{{ formatCurrency(goal.current_amount) }}</span>
      <span class="goal-separator">/</span>
      <span class="goal-target">{{ formatCurrency(goal.target_amount) }}</span>
    </div>

    <div class="goal-progress-bar">
      <div
        class="goal-progress-fill"
        :style="{
          width: `${Math.min(progressPercentage, 100)}%`,
          backgroundColor: getProgressColor()
        }"
      />
    </div>

    <div class="goal-footer">
      <div class="goal-deadline">
        <span class="goal-deadline-icon">⏰</span>
        <span class="goal-deadline-text">{{ formatDate(goal.target_date) }}</span>
      </div>
      <div v-if="goalStatus" class="goal-status" :class="`goal-status--${goalStatus}`">
        {{ statusText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FinancialGoal } from '@/types/entities/gaming'

// ==========================================
// PROPS
// ==========================================

interface Props {
  goal: FinancialGoal
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true
})

// ==========================================
// EMITS
// ==========================================

const emit = defineEmits<{
  click: [goal: FinancialGoal]
}>()

// ==========================================
// COMPUTED
// ==========================================

const progressPercentage = computed(() => {
  if (props.goal.target_amount <= 0) return 0
  const percentage = (props.goal.current_amount / props.goal.target_amount) * 100
  return Math.round(Math.min(percentage, 100))
})

const goalStatus = computed(() => {
  const progress = progressPercentage.value

  if (progress >= 100) return 'completed'
  if (progress >= 75) return 'on-track'
  if (progress >= 50) return 'progress'
  if (progress >= 25) return 'started'
  return 'early'
})

const statusText = computed(() => {
  switch (goalStatus.value) {
    case 'completed':
      return '✅ Atteint'
    case 'on-track':
      return '🎯 En bonne voie'
    case 'progress':
      return '📊 En cours'
    case 'started':
      return '🚀 Démarré'
    case 'early':
      return '🌱 Début'
    default:
      return ''
  }
})

// ==========================================
// METHODS
// ==========================================

function handleClick() {
  if (props.clickable) {
    emit('click', props.goal)
  }
}

function getProgressColor(): string {
  const progress = progressPercentage.value

  if (progress >= 100) return '#10b981' // green
  if (progress >= 75) return '#3b82f6'  // blue
  if (progress >= 50) return '#8b5cf6'  // purple
  if (progress >= 25) return '#f59e0b'  // orange
  return '#ef4444' // red
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.goal-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.goal-card--clickable {
  cursor: pointer;
}

.goal-card--clickable:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

/* Header */
.goal-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.goal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.goal-title-section {
  flex: 1;
  min-width: 0;
}

.goal-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goal-description {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goal-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  flex-shrink: 0;
}

/* Amounts */
.goal-amounts {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
}

.goal-current {
  font-weight: 600;
  color: #111827;
}

.goal-separator {
  color: #9ca3af;
}

.goal-target {
  color: #6b7280;
}

/* Progress Bar */
.goal-progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.goal-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease, background-color 0.3s ease;
}

/* Footer */
.goal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.goal-deadline {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.goal-deadline-icon {
  font-size: 0.875rem;
}

.goal-status {
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.goal-status--completed {
  background: #d1fae5;
  color: #065f46;
}

.goal-status--on-track {
  background: #dbeafe;
  color: #1e40af;
}

.goal-status--progress {
  background: #ede9fe;
  color: #5b21b6;
}

.goal-status--started {
  background: #fef3c7;
  color: #92400e;
}

.goal-status--early {
  background: #fee2e2;
  color: #991b1b;
}

/* Responsive */
@media (max-width: 640px) {
  .goal-card {
    padding: 1rem;
  }

  .goal-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .goal-title {
    font-size: 0.9375rem;
  }

  .goal-percentage {
    font-size: 1.125rem;
  }

  .goal-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
