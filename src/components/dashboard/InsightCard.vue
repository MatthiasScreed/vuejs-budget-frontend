<!-- src/components/dashboard/InsightCard.vue -->

<template>
  <div class="insight-card" :class="`insight-${insight.type}`">
    <div class="insight-header">
      <span class="insight-icon">{{ insight.icon }}</span>
      <div class="insight-title-section">
        <h4 class="insight-title">{{ insight.title }}</h4>
        <span class="insight-priority" :class="`priority-${insight.priority}`">
          {{ priorityLabel }}
        </span>
      </div>
    </div>

    <p class="insight-description">{{ insight.description }}</p>

    <div class="insight-footer">
      <span class="insight-impact" :style="{ color: insight.color }">
        {{ insight.impact }}
      </span>

      <button
        v-if="insight.actionable && insight.action"
        class="insight-action-btn"
        @click="handleAction"
      >
        {{ insight.action.label }} →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { AIInsight } from '@/types/projection.types'

/**
 * Carte d'insight IA
 * École 42: Composant simple, un rôle
 */

interface Props {
  insight: AIInsight
}

const props = defineProps<Props>()
const router = useRouter()

/**
 * Label de priorité
 */
const priorityLabel = computed(() => {
  const labels = {
    high: 'Urgent',
    medium: 'Important',
    low: 'Info',
  }
  return labels[props.insight.priority]
})

/**
 * Gère l'action
 */
const handleAction = (): void => {
  if (props.insight.action?.route) {
    router.push(props.insight.action.route)
  } else if (props.insight.action?.handler) {
    props.insight.action.handler()
  }
}
</script>

<style scoped>
.insight-card {
  padding: 1.25rem;
  border-radius: 12px;
  border-left: 4px solid;
  background: white;
  transition: all 0.3s ease;
}

.insight-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Types d'insights */
.insight-warning {
  border-left-color: #f56565;
  background: linear-gradient(90deg, #fff5f5 0%, white 100%);
}

.insight-opportunity {
  border-left-color: #667eea;
  background: linear-gradient(90deg, #f0f4ff 0%, white 100%);
}

.insight-achievement {
  border-left-color: #48bb78;
  background: linear-gradient(90deg, #f0fff4 0%, white 100%);
}

.insight-suggestion {
  border-left-color: #4299e1;
  background: linear-gradient(90deg, #ebf8ff 0%, white 100%);
}

.insight-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.insight-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.insight-title-section {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.insight-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.3;
}

.insight-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.priority-high {
  background: #fed7d7;
  color: #742a2a;
}

.priority-medium {
  background: #feebc8;
  color: #744210;
}

.priority-low {
  background: #e2e8f0;
  color: #4a5568;
}

.insight-description {
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.insight-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.insight-impact {
  font-size: 0.875rem;
  font-weight: 700;
}

.insight-action-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.insight-action-btn:hover {
  background: #5568d3;
  transform: translateX(2px);
}

@media (max-width: 640px) {
  .insight-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .insight-action-btn {
    width: 100%;
  }
}
</style>
