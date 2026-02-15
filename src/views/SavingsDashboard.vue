<template>
  <div style="max-width: 1152px; margin: 0 auto;">
    <!-- Header -->
    <div style="margin-bottom: 2rem;">
      <h1 style="font-size: 1.875rem; font-weight: 700; color: #111827;">
        💎 Capacité d'Épargne
      </h1>
      <p style="color: #5b6270; margin-top: 0.5rem;">
        {{ summary }}
      </p>
    </div>

    <!-- Main Stats -->
    <div class="stats-grid" style="margin-bottom: 2rem;">
      <!-- Revenus -->
      <div class="stat-card">
        <div class="stat-header">
          <span style="font-size: 1.5rem;">💰</span>
          <span style="font-size: 0.75rem; color: #5b6270;">Revenus mensuels</span>
        </div>
        <div class="stat-value" style="color: #059669;">
          {{ formatCurrency(capacity.monthly_income) }}
        </div>
        <div style="font-size: 0.75rem; color: #5b6270;">
          Moyenne sur {{ selectedPeriod }} mois
        </div>
      </div>

      <!-- Dépenses -->
      <div class="stat-card">
        <div class="stat-header">
          <span style="font-size: 1.5rem;">💸</span>
          <span style="font-size: 0.75rem; color: #5b6270;">Dépenses mensuelles</span>
        </div>
        <div class="stat-value" style="color: #dc2626;">
          {{ formatCurrency(capacity.monthly_expenses) }}
        </div>
        <div style="font-size: 0.75rem; color: #5b6270;">
          Moyenne sur {{ selectedPeriod }} mois
        </div>
      </div>

      <!-- Capacité d'épargne -->
      <div class="stat-card featured">
        <div class="stat-header">
          <span style="font-size: 1.5rem;">💎</span>
          <span style="font-size: 0.75rem; color: #5b6270;">Capacité d'épargne</span>
        </div>
        <div
          class="stat-value"
          :style="{ color: capacity.available_savings >= 0 ? '#7c3aed' : '#dc2626' }"
        >
          {{ formatCurrency(capacity.available_savings) }}/mois
        </div>
        <div class="health-badge" :class="`health-${capacity.health_status}`">
          {{ getHealthLabel(capacity.health_status) }}
        </div>
      </div>

      <!-- Taux d'épargne -->
      <div class="stat-card">
        <div class="stat-header">
          <span style="font-size: 1.5rem;">📊</span>
          <span style="font-size: 0.75rem; color: #5b6270;">Taux d'épargne</span>
        </div>
        <div class="stat-value" style="color: #3b82f6;">
          {{ Math.round(capacity.savings_rate) }}%
        </div>
        <div style="font-size: 0.75rem; color: #5b6270;">
          Objectif : 20%
        </div>
        <div class="progress-bar" style="margin-top: 0.5rem;">
          <div
            class="progress-fill"
            :style="`width: ${Math.min(capacity.savings_rate, 100)}%; background-color: ${getProgressColor(capacity.savings_rate)}`"
          ></div>
        </div>
      </div>
    </div>

    <!-- Période selector -->
    <div style="margin-bottom: 2rem; background: white; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e5e7eb;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <label style="font-size: 0.875rem; font-weight: 500; color: #374151;">
            Période de calcul :
          </label>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button
            v-for="period in ['1', '3', '6', '12']"
            :key="period"
            @click="setPeriod(period as any)"
            :class="['period-btn', { active: selectedPeriod === period }]"
          >
            {{ period }} mois
          </button>
        </div>
      </div>
    </div>

    <!-- Répartition des objectifs -->
    <div v-if="allocation.allocations.length > 0" style="margin-bottom: 2rem;">
      <div class="gaming-card">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin-bottom: 1.5rem;">
          🎯 Répartition Optimale
        </h2>

        <div style="margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(to right, #eff6ff, #f0fdf4); border-radius: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.875rem; color: #5b6270;">Disponible</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: #111827;">
                {{ formatCurrency(allocation.total_available) }}
              </div>
            </div>
            <div style="font-size: 2rem;">→</div>
            <div>
              <div style="font-size: 0.875rem; color: #5b6270;">Alloué</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: #7c3aed;">
                {{ formatCurrency(allocation.total_allocated) }}
              </div>
            </div>
            <div style="font-size: 2rem;">→</div>
            <div>
              <div style="font-size: 0.875rem; color: #5b6270;">Restant</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: #059669;">
                {{ formatCurrency(allocation.remaining) }}
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="alloc in allocation.allocations"
            :key="alloc.goal_id"
            class="goal-allocation-card"
          >
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <div>
                <h3 style="font-weight: 600; color: #111827;">
                  #{{ alloc.priority }} {{ alloc.goal_name }}
                </h3>
                <p style="font-size: 0.875rem; color: #5b6270;">
                  {{ alloc.monthly_amount }}€/mois pendant {{ alloc.months_to_complete }} mois
                </p>
              </div>
              <div class="allocation-badge" :class="{ 'not-achievable': !alloc.is_achievable }">
                {{ alloc.is_achievable ? '✅ Atteignable' : '⚠️ Trop long' }}
              </div>
            </div>

            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="`width: ${Math.min((alloc.monthly_amount / allocation.total_available) * 100, 100)}%; background: linear-gradient(to right, #3b82f6, #8b5cf6);`"
              ></div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #5b6270; margin-top: 0.25rem;">
              <span>{{ Math.round((alloc.monthly_amount / allocation.total_available) * 100) }}% du budget</span>
              <span>{{ formatDate(new Date(Date.now() + alloc.months_to_complete * 30 * 24 * 60 * 60 * 1000)) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommandations -->
    <div v-if="recommendations.length > 0" style="margin-bottom: 2rem;">
      <div class="gaming-card">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin-bottom: 1.5rem;">
          💡 Recommandations
        </h2>

        <div class="space-y-3">
          <div
            v-for="rec in recommendations"
            :key="rec.title"
            class="recommendation-card"
            :class="`priority-${rec.priority}`"
          >
            <div style="display: flex; align-items: start; gap: 1rem;">
              <div style="font-size: 2rem;">{{ rec.icon }}</div>
              <div style="flex: 1;">
                <h3 style="font-weight: 600; color: #111827; margin-bottom: 0.25rem;">
                  {{ rec.title }}
                </h3>
                <p style="font-size: 0.875rem; color: #5b6270;">
                  {{ rec.description }}
                </p>
                <div v-if="rec.impact > 0" style="margin-top: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #059669;">
                  Impact : +{{ Math.round(rec.impact) }}€/mois
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analyse par catégorie -->
    <div style="margin-bottom: 2rem;">
      <div class="gaming-card">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin-bottom: 1.5rem;">
          📊 Dépenses par Catégorie
        </h2>

        <div class="space-y-3">
          <div
            v-for="cat in expensesByCategory"
            :key="cat.category"
            class="category-card"
          >
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-weight: 500; color: #111827;">{{ cat.category }}</span>
              <span style="font-weight: 600; color: #dc2626;">{{ formatCurrency(cat.amount) }}/mois</span>
            </div>

            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="`width: ${cat.percentage}%; background-color: ${cat.percentage > 30 ? '#dc2626' : '#3b82f6'};`"
              ></div>
            </div>

            <div style="font-size: 0.75rem; color: #5b6270; margin-top: 0.25rem;">
              {{ Math.round(cat.percentage) }}% de vos dépenses
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSavingsCapacityStore } from '@/stores/savingsCapacityStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useGoalStore } from '@/stores/goalStore'
import { useFormatting } from '@/composables/ui/useFormatting'

const savingsStore = useSavingsCapacityStore()
const transactionStore = useTransactionStore()
const goalStore = useGoalStore()

const { formatCurrency } = useFormatting()

const {
  selectedPeriod,
  savingsCapacity: capacity,
  optimalAllocation: allocation,
  recommendations
} = storeToRefs(savingsStore)

const expensesByCategory = computed(() => savingsStore.analyzeExpensesByCategory())
const summary = computed(() => savingsStore.getSummary())

function setPeriod(period: '1' | '3' | '6' | '12') {
  savingsStore.setPeriod(period)
}

function getHealthLabel(status: string): string {
  const labels = {
    excellent: '🌟 Excellent',
    good: '✅ Bon',
    warning: '⚠️ Attention',
    critical: '🚨 Critique'
  }
  return labels[status] || status
}

function getProgressColor(rate: number): string {
  if (rate >= 20) return '#059669'
  if (rate >= 10) return '#f59e0b'
  return '#dc2626'
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric'
  }).format(date)
}

onMounted(async () => {
  await Promise.all([
    transactionStore.fetchTransactions(),
    goalStore.fetchGoals()
  ])
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.stat-card.featured {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.stat-card.featured .stat-value {
  color: white !important;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.health-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.health-excellent {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.health-good {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.health-warning {
  background-color: rgba(251, 191, 36, 0.2);
  color: #f59e0b;
}

.health-critical {
  background-color: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.period-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.period-btn:hover {
  background: #f9fafb;
}

.period-btn.active {
  background: #7c3aed;
  color: white;
  border-color: #7c3aed;
}

.gaming-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.goal-allocation-card {
  padding: 1rem;
  background: linear-gradient(to right, #f9fafb, #fff);
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.allocation-badge {
  padding: 0.25rem 0.75rem;
  background: #dcfce7;
  color: #059669;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.allocation-badge.not-achievable {
  background: #fef2f2;
  color: #dc2626;
}

.recommendation-card {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
}

.recommendation-card.priority-high {
  border-color: #dc2626;
  background: #fef2f2;
}

.recommendation-card.priority-medium {
  border-color: #f59e0b;
  background: #fffbeb;
}

.recommendation-card.priority-low {
  border-color: #3b82f6;
  background: #eff6ff;
}

.category-card {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}
</style>
