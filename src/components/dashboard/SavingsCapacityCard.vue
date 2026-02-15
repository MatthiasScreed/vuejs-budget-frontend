<template>
  <div class="savings-capacity-card" :class="statusClass">
    <div class="savings-capacity-header">
      <div class="savings-capacity-icon">
        {{ statusIcon }}
      </div>
      <div class="savings-capacity-title-section">
        <h3 class="savings-capacity-title">{{ mainTitle }}</h3>
        <p class="savings-capacity-period">{{ period }}</p>
      </div>
    </div>

    <div class="savings-capacity-amount">
      {{ formatCurrency(capacity) }}
    </div>

    <!-- Message encourageant si positif -->
    <div v-if="isPositive && capacity > 0" class="savings-capacity-encouragement">
      <span class="encouragement-icon">✨</span>
      <span class="encouragement-text">{{ getEncouragementMessage() }}</span>
    </div>

    <div v-if="totalMonthlyTargets > 0" class="savings-capacity-details">
      <div class="savings-detail-item">
        <span class="savings-detail-label">Objectifs mensuels :</span>
        <span class="savings-detail-value">{{ formatCurrency(totalMonthlyTargets) }}</span>
      </div>
      <div class="savings-detail-item">
        <span class="savings-detail-label">Restant disponible :</span>
        <span class="savings-detail-value" :class="remainingClass">
          {{ formatCurrency(capacity - totalMonthlyTargets) }}
        </span>
      </div>
    </div>

    <div v-if="trend !== 'stable'" class="savings-capacity-trend">
      <span class="trend-icon">{{ trend === 'up' ? '📈' : '📉' }}</span>
      <span class="trend-text">
        {{ getTrendMessage() }}
      </span>
    </div>

    <div v-if="capacityStatus && capacityStatus.status !== 'not_configured'" class="savings-capacity-status">
      <div class="status-indicator" :class="`status-indicator--${capacityStatus.status}`"></div>
      <p class="status-message">{{ capacityStatus.message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  capacity: number
  isPositive: boolean
  capacityStatus: {
    status: 'excellent' | 'warning' | 'deficit' | 'insufficient' | 'not_configured'
    message: string
    surplus?: number
    deficit?: number
  }
  goalsCount: number
  totalMonthlyTargets: number
  trend?: 'up' | 'down' | 'stable'
  changePercent?: number
  period: string
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'stable',
  changePercent: 0
})

// ==========================================
// COMPUTED
// ==========================================

const mainTitle = computed(() => {
  if (!props.isPositive || props.capacity <= 0) {
    return 'Situation ce mois'
  }
  return 'Ta capacité d\'épargne'
})

const statusIcon = computed(() => {
  if (!props.isPositive) return '⚠️'
  if (props.capacityStatus.status === 'excellent') return '🎉'
  if (props.capacityStatus.status === 'warning') return '💪'
  if (props.capacity > 0) return '🎯'
  return '📊'
})

const statusClass = computed(() => {
  if (!props.isPositive) return 'savings-capacity-card--negative'
  if (props.capacityStatus.status === 'excellent') return 'savings-capacity-card--excellent'
  if (props.capacityStatus.status === 'warning') return 'savings-capacity-card--warning'
  return 'savings-capacity-card--normal'
})

const remainingClass = computed(() => {
  const remaining = props.capacity - props.totalMonthlyTargets
  if (remaining < 0) return 'text-red-600'
  if (remaining < 100) return 'text-orange-600'
  return 'text-green-600'
})

// ==========================================
// METHODS
// ==========================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

function getEncouragementMessage(): string {
  if (props.capacity >= 500) {
    return 'Excellente capacité d\'épargne ce mois !'
  } else if (props.capacity >= 200) {
    return 'Bonne capacité d\'épargne, continue comme ça !'
  } else if (props.capacity >= 50) {
    return 'Chaque euro compte, tu es sur la bonne voie'
  } else if (props.capacity > 0) {
    return 'C\'est un début ! Chaque petit pas compte'
  }
  return ''
}

function getTrendMessage(): string {
  const percent = Math.abs(props.changePercent)
  if (props.trend === 'up') {
    return `+${percent}% par rapport au mois dernier. Super progression ! 🚀`
  } else {
    return `${percent}% de moins que le mois dernier. On peut améliorer ça !`
  }
}
</script>

<style scoped>
.savings-capacity-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.savings-capacity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.savings-capacity-card--excellent::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.savings-capacity-card--warning::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.savings-capacity-card--negative::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.savings-capacity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* Header */
.savings-capacity-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.savings-capacity-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.savings-capacity-card--excellent .savings-capacity-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.savings-capacity-card--warning .savings-capacity-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.savings-capacity-card--negative .savings-capacity-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.savings-capacity-title-section {
  flex: 1;
  min-width: 0;
}

.savings-capacity-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #5b6270;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  word-break: break-word;
}

.savings-capacity-period {
  font-size: 0.75rem;
  color: #8c939f;
  margin: 0.25rem 0 0 0;
}

/* Amount */
.savings-capacity-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
  word-break: break-word;
}

/* Encouragement message */
.savings-capacity-encouragement {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.encouragement-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.encouragement-text {
  font-size: 0.875rem;
  color: #047857;
  font-weight: 500;
  line-height: 1.4;
}

/* Details */
.savings-capacity-details {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.savings-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  gap: 1rem;
}

.savings-detail-item:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.savings-detail-label {
  font-size: 0.875rem;
  color: #5b6270;
  word-break: break-word;
}

.savings-detail-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  flex-shrink: 0;
}

.text-red-600 {
  color: #dc2626;
}

.text-orange-600 {
  color: #ea580c;
}

.text-green-600 {
  color: #16a34a;
}

/* Trend */
.savings-capacity-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.trend-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.trend-text {
  font-size: 0.875rem;
  color: #0369a1;
  font-weight: 500;
  line-height: 1.4;
}

/* Status */
.savings-capacity-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator--excellent {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.status-indicator--warning {
  background: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

.status-indicator--deficit,
.status-indicator--insufficient {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.status-message {
  font-size: 0.875rem;
  color: #78350f;
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
}

/* ========================================
   RESPONSIVE - TABLET
   ======================================== */

@media (max-width: 768px) {
  .savings-capacity-card {
    padding: 1.25rem;
  }

  .savings-capacity-icon {
    width: 44px;
    height: 44px;
    font-size: 1.375rem;
  }

  .savings-capacity-amount {
    font-size: 1.875rem;
  }
}

/* ========================================
   RESPONSIVE - MOBILE
   ======================================== */

@media (max-width: 640px) {
  .savings-capacity-card {
    padding: 1rem;
    max-width: 100%;
  }

  .savings-capacity-header {
    gap: 0.625rem;
  }

  .savings-capacity-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
    border-radius: 10px;
  }

  .savings-capacity-title {
    font-size: 0.8125rem;
  }

  .savings-capacity-period {
    font-size: 0.6875rem;
  }

  .savings-capacity-amount {
    font-size: 1.625rem;
    margin-bottom: 0.875rem;
  }

  .savings-capacity-encouragement {
    padding: 0.625rem;
    gap: 0.375rem;
  }

  .encouragement-icon {
    font-size: 1rem;
  }

  .encouragement-text {
    font-size: 0.8125rem;
  }

  .savings-capacity-details {
    padding: 0.875rem;
    margin-bottom: 0.875rem;
  }

  .savings-detail-item {
    padding: 0.375rem 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .savings-detail-label {
    font-size: 0.8125rem;
  }

  .savings-detail-value {
    font-size: 0.875rem;
  }

  .savings-capacity-trend {
    padding: 0.625rem;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .trend-icon {
    font-size: 1rem;
  }

  .trend-text {
    font-size: 0.8125rem;
  }

  .savings-capacity-status {
    padding: 0.625rem;
    gap: 0.625rem;
  }

  .status-message {
    font-size: 0.8125rem;
  }
}

/* ========================================
   RESPONSIVE - VERY SMALL MOBILE
   ======================================== */

@media (max-width: 375px) {
  .savings-capacity-card {
    padding: 0.875rem;
  }

  .savings-capacity-icon {
    width: 36px;
    height: 36px;
    font-size: 1.125rem;
  }

  .savings-capacity-amount {
    font-size: 1.5rem;
  }

  .savings-detail-label,
  .savings-detail-value {
    font-size: 0.75rem;
  }

  .encouragement-text,
  .trend-text,
  .status-message {
    font-size: 0.75rem;
  }
}

/* ========================================
   DARK MODE SUPPORT
   ======================================== */

@media (prefers-color-scheme: dark) {
  .savings-capacity-card {
    background: #1f2937;
    border-color: #374151;
  }

  .savings-capacity-title {
    color: #8c939f;
  }

  .savings-capacity-period {
    color: #5b6270;
  }

  .savings-capacity-amount {
    color: #f9fafb;
  }

  .savings-capacity-details {
    background: #111827;
  }

  .savings-detail-label {
    color: #8c939f;
  }

  .savings-detail-value {
    color: #f9fafb;
  }

  .savings-capacity-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

/* ========================================
   REDUCED MOTION
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  .savings-capacity-card {
    transition: none;
  }

  .savings-capacity-card:hover {
    transform: none;
  }
}
</style>
