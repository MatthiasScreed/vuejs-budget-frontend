<!-- src/components/dashboard/GoalsProgressCard.vue -->

<template>
  <div class="goals-progress-card">
    <div class="card-header">
      <h2 class="card-title">🎯 Objectifs actifs</h2>
      <router-link to="/app/goals" class="link-view-all"> Voir tout → </router-link>
    </div>

    <div v-if="goals.length === 0" class="empty-state">
      <p>Aucun objectif actif</p>
      <router-link to="/app/goals" class="btn-create-goal"> Créer un objectif </router-link>
    </div>

    <div v-else class="goals-list">
      <div v-for="goal in displayedGoals" :key="goal.id" class="goal-item">
        <div class="goal-header">
          <div class="goal-info">
            <span class="goal-icon">{{ goal.icon }}</span>
            <div>
              <h3 class="goal-name">{{ goal.name }}</h3>
              <p class="goal-progress-text">
                {{ formatCurrency(goal.currentAmount) }} /
                {{ formatCurrency(goal.targetAmount) }}
              </p>
            </div>
          </div>
          <div class="goal-percentage">{{ goal.progressPercentage }}%</div>
        </div>

        <!-- Barre de progression -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${goal.progressPercentage}%` }"></div>
        </div>

        <!-- Date estimée -->
        <p class="goal-eta">Objectif estimé: {{ formatDate(goal.estimatedCompletionDate) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GoalProgress } from '@/types/dashboard.types'

/**
 * Props du composant
 */
interface Props {
  goals: GoalProgress[]
  maxDisplay?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 3,
})

/**
 * Limite le nombre d'objectifs affichés
 */
const displayedGoals = computed(() => {
  return props.goals.slice(0, props.maxDisplay)
})

/**
 * Formate une date
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Formate un montant
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>

<style scoped>
.goals-progress-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
}

.link-view-all {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.link-view-all:hover {
  color: #5568d3;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
}

.btn-create-goal {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.goal-item {
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.goal-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.goal-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.goal-icon {
  font-size: 2rem;
}

.goal-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.goal-progress-text {
  font-size: 0.875rem;
  color: #718096;
}

.goal-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.goal-eta {
  font-size: 0.75rem;
  color: #718096;
  text-align: right;
}

@media (max-width: 768px) {
  .goal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .goal-percentage {
    align-self: flex-end;
  }
}
</style>
