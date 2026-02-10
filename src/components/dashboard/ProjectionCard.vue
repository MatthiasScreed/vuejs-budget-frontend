<!-- src/components/dashboard/ProjectionCard.vue -->

<template>
  <div class="projection-card">
    <div class="projection-header">
      <h4 class="projection-period">{{ projection.periodLabel }}</h4>
      <span class="confidence-badge" :class="confidenceClass">
        {{ projection.confidence }}% sûr
      </span>
    </div>

    <div class="projection-main">
      <p class="projection-label">Économies projetées</p>
      <p class="projection-value" :class="valueClass">
        {{ formatCurrency(projection.projectedSavings) }}
      </p>
    </div>

    <div class="projection-details">
      <div class="detail-item">
        <span class="detail-label">Revenus</span>
        <span class="detail-value">
          {{ formatCurrency(projection.projectedIncome) }}
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Dépenses</span>
        <span class="detail-value">
          {{ formatCurrency(projection.projectedExpenses) }}
        </span>
      </div>
    </div>

    <!-- Variance -->
    <div class="variance-section">
      <p class="variance-label">Fourchette estimée</p>
      <div class="variance-bar">
        <div class="variance-range">
          <span class="range-min">
            {{ formatCurrency(projection.variance.min) }}
          </span>
          <span class="range-max">
            {{ formatCurrency(projection.variance.max) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Assumptions -->
    <div class="assumptions">
      <details>
        <summary>Hypothèses</summary>
        <ul class="assumptions-list">
          <li v-for="(assumption, index) in projection.assumptions" :key="index">
            {{ assumption }}
          </li>
        </ul>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FinancialProjection } from '@/types/projection.types'

/**
 * Carte de projection individuelle
 * École 42: Composant réutilisable, typé
 */

interface Props {
  projection: FinancialProjection
}

const props = defineProps<Props>()

/**
 * Classe CSS selon la confiance
 */
const confidenceClass = computed(() => {
  if (props.projection.confidence >= 80) return 'high'
  if (props.projection.confidence >= 60) return 'medium'
  return 'low'
})

/**
 * Classe CSS selon la valeur (positif/négatif)
 */
const valueClass = computed(() => {
  return props.projection.projectedSavings >= 0 ? 'positive' : 'negative'
})

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
.projection-card {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.projection-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.projection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.projection-period {
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
}

.confidence-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.confidence-badge.high {
  background: #c6f6d5;
  color: #22543d;
}

.confidence-badge.medium {
  background: #feebc8;
  color: #744210;
}

.confidence-badge.low {
  background: #fed7d7;
  color: #742a2a;
}

.projection-main {
  margin-bottom: 1.5rem;
}

.projection-label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.projection-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

.projection-value.positive {
  color: #48bb78;
}

.projection-value.negative {
  color: #f56565;
}

.projection-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-label {
  color: #718096;
}

.detail-value {
  font-weight: 600;
  color: #1a202c;
}

/* Variance */
.variance-section {
  margin-bottom: 1rem;
}

.variance-label {
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.variance-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  position: relative;
  margin-bottom: 0.5rem;
}

.variance-bar::after {
  content: '';
  position: absolute;
  left: 20%;
  right: 20%;
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.variance-range {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #718096;
}

/* Assumptions */
.assumptions {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

details summary {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  user-select: none;
}

details summary:hover {
  color: #667eea;
}

.assumptions-list {
  margin-top: 0.75rem;
  margin-left: 1.5rem;
  font-size: 0.75rem;
  color: #718096;
  line-height: 1.6;
}

.assumptions-list li {
  margin-bottom: 0.25rem;
}
</style>
