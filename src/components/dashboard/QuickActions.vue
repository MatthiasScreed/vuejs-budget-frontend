<!-- src/components/dashboard/QuickActions.vue -->

<template>
  <div class="quick-actions">
    <button
      v-for="action in actions"
      :key="action.id"
      class="action-button"
      @click="handleAction(action.id)"
    >
      <span class="action-icon">{{ action.icon }}</span>
      <span class="action-label">{{ action.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Actions rapides du dashboard
 * École 42: Composant simple, un rôle
 */

interface QuickAction {
  id: string
  icon: string
  label: string
  route?: string
}

const router = useRouter()

const actions = ref<QuickAction[]>([
  { id: 'new-goal', icon: '🎯', label: 'Nouvel objectif', route: '/app/goals' },
  { id: 'connect-bank', icon: '🏦', label: 'Banque', route: '/app/banking' },
  { id: 'view-analytics', icon: '📊', label: 'Analyse', route: '/app/analytics' },
])

/**
 * Gère le clic sur une action
 */
const handleAction = (actionId: string): void => {
  const action = actions.value.find((a) => a.id === actionId)
  if (action?.route) {
    router.push(action.route)
  }
}
</script>

<style scoped>
.quick-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  transition: all 0.2s ease;
}

.action-button:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.15);
}

.action-icon {
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .quick-actions {
    flex-direction: column;
    width: 100%;
  }

  .action-button {
    justify-content: center;
  }
}
</style>
