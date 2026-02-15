<!-- src/components/dashboard/SpendingChart.vue -->

<template>
  <div class="spending-chart-card">
    <div class="card-header">
      <h2 class="card-title">📊 Répartition des dépenses</h2>
      <select v-model="selectedPeriod" class="period-selector">
        <option value="current_month">Ce mois</option>
        <option value="last_month">Mois dernier</option>
        <option value="3_months">3 derniers mois</option>
      </select>
    </div>

    <!-- État vide -->
    <div v-if="!sortedCategories.length" class="empty-state">
      <div class="empty-icon">📭</div>
      <p class="empty-title">Aucune dépense</p>
      <p class="empty-subtitle">Les dépenses apparaîtront ici une fois importées</p>
    </div>

    <!-- Graphique -->
    <div v-else class="chart-container">
      <!-- Graphique Donut -->
      <div class="donut-chart">
        <svg viewBox="0 0 200 200" class="donut-svg">
          <circle
            v-for="(segment, index) in donutSegments"
            :key="index"
            cx="100"
            cy="100"
            r="70"
            fill="none"
            :stroke="segment.color"
            stroke-width="40"
            :stroke-dasharray="segment.dasharray"
            :stroke-dashoffset="segment.dashoffset"
            class="donut-segment"
          />

          <!-- Centre du donut -->
          <text x="100" y="95" text-anchor="middle" class="donut-total-label">Total</text>
          <text x="100" y="115" text-anchor="middle" class="donut-total-value">
            {{ formatCurrency(totalExpenses) }}
          </text>
        </svg>
      </div>

      <!-- Légende -->
      <div class="chart-legend">
        <div v-for="category in sortedCategories" :key="category.id" class="legend-item">
          <div class="legend-color-wrapper">
            <div class="legend-color" :style="{ background: category.color }"></div>
            <span class="category-icon">{{ category.icon }}</span>
          </div>

          <div class="legend-info">
            <div class="legend-header">
              <span class="legend-name">{{ category.name }}</span>
              <span class="legend-amount">
                {{ formatCurrency(category.amount) }}
              </span>
            </div>
            <div class="legend-details">
              <span class="legend-percentage">{{ formatPercentage(category.percentage) }}%</span>

              <!-- Tendance disponible -->
              <span
                v-if="hasTrend(category)"
                class="legend-trend"
                :class="`trend-${category.trend || 'stable'}`"
              >
                {{ getTrendIcon(category.trend) }}
                {{ formatTrendPercentage(category.trendPercentage) }}%
              </span>

              <!-- Pas encore de tendance (1er mois) -->
              <span
                v-else
                class="legend-trend trend-new"
                title="Les tendances apparaîtront le mois prochain"
              >
                ✨ 1er mois
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CategoryBreakdown } from '@/types/dashboard.types'

/**
 * Props du composant
 */
interface Props {
  categories: CategoryBreakdown[]
}

const props = defineProps<Props>()

const selectedPeriod = ref('current_month')

/**
 * Trie les catégories par montant
 */
const sortedCategories = computed(() => {
  if (!props.categories || !Array.isArray(props.categories)) {
    return []
  }
  return [...props.categories].filter((cat) => cat.amount > 0).sort((a, b) => b.amount - a.amount)
})

/**
 * Calcule le total des dépenses
 */
const totalExpenses = computed(() => {
  if (!props.categories || !Array.isArray(props.categories)) {
    return 0
  }
  return props.categories.reduce((sum, cat) => sum + (cat.amount || 0), 0)
})

/**
 * Génère les segments du donut
 */
const donutSegments = computed(() => {
  const circumference = 2 * Math.PI * 70
  let currentOffset = 0

  return sortedCategories.value.map((category) => {
    const percentage = (category.percentage || 0) / 100
    const dasharray = `${percentage * circumference} ${circumference}`
    const dashoffset = -currentOffset

    currentOffset += percentage * circumference

    return {
      color: category.color || '#5b6270',
      dasharray,
      dashoffset,
    }
  })
})

/**
 * Vérifie si la tendance est disponible et valide
 */
const hasTrend = (category: CategoryBreakdown): boolean => {
  return (
    category.trendPercentage != null &&
    !isNaN(category.trendPercentage) &&
    isFinite(category.trendPercentage)
  )
}

/**
 * Retourne l'icône de tendance
 */
const getTrendIcon = (trend: string | undefined): string => {
  if (trend === 'up') return '↗'
  if (trend === 'down') return '↘'
  return '→'
}

/**
 * Formate un montant en devise
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

/**
 * Formate un pourcentage avec protection contre NaN
 */
const formatPercentage = (value: number | undefined): string => {
  if (value == null || isNaN(value) || !isFinite(value)) {
    return '0.0'
  }
  return value.toFixed(1)
}

/**
 * Formate le pourcentage de tendance
 */
const formatTrendPercentage = (value: number | undefined): string => {
  if (value == null || isNaN(value) || !isFinite(value)) {
    return '0.0'
  }
  return Math.abs(value).toFixed(1)
}
</script>

<style scoped>
.spending-chart-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
}

.period-selector {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
}

.period-selector:focus {
  outline: none;
  border-color: #667eea;
}

/* État vide */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #718096;
}

/* Graphique */
.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.donut-chart {
  display: flex;
  justify-content: center;
}

.donut-svg {
  width: 100%;
  max-width: 250px;
  transform: rotate(-90deg);
}

.donut-segment {
  transition: stroke-width 0.3s ease;
}

.donut-segment:hover {
  stroke-width: 45;
}

.donut-total-label {
  font-size: 12px;
  fill: #718096;
  transform: rotate(90deg) translate(0, -100px);
}

.donut-total-value {
  font-size: 18px;
  font-weight: 700;
  fill: #1a202c;
  transform: rotate(90deg) translate(0, -100px);
}

/* Légende */
.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.legend-item:hover {
  background: #f7fafc;
}

.legend-color-wrapper {
  position: relative;
  flex-shrink: 0;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.category-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 1.25rem;
}

.legend-info {
  flex: 1;
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.legend-name {
  font-weight: 600;
  color: #1a202c;
}

.legend-amount {
  font-weight: 700;
  color: #4a5568;
}

.legend-details {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
}

.legend-percentage {
  color: #718096;
}

.legend-trend {
  font-weight: 600;
}

.trend-up {
  color: #f56565;
}

.trend-down {
  color: #48bb78;
}

.trend-stable {
  color: #718096;
}

.trend-new {
  color: #8b5cf6;
  font-weight: 500;
  font-size: 0.7rem;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

@media (max-width: 1024px) {
  .chart-container {
    grid-template-columns: 1fr;
  }
}
</style>
