<!-- src/components/dashboard/FinancialMetrics.vue -->

<template>
  <div class="financial-metrics">
    <h2 class="metrics-title">{{ t('dashboard.financialOverview') }}</h2>

    <div class="metrics-grid">
      <!-- Capacité d'épargne (PRIMAIRE) -->
      <MetricCard
        :title="t('dashboard.savingsCapacity')"
        :value="formatCurrency(savingsCapacity)"
        :subtitle="t('dashboard.savingsRateSubtitle', { rate: formatPercentage(savingsRate) })"
        icon="💰"
        :trend="savingsCapacity > 0 ? 'up' : 'down'"
        :trend-value="12.5"
        variant="primary"
        class="metric-primary"
      />

      <!-- Revenus -->
      <MetricCard
        :title="t('dashboard.monthlyIncome')"
        :value="formatCurrency(monthlyIncome)"
        icon="📈"
        variant="default"
      />

      <!-- Dépenses -->
      <MetricCard
        :title="t('dashboard.monthlyExpenses')"
        :value="formatCurrency(monthlyExpenses)"
        icon="📊"
        variant="default"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n' // ✅ AJOUTER CETTE LIGNE
import MetricCard from './MetricCard.vue'

// ✅ AJOUTER CETTE LIGNE
const { t } = useI18n()

/**
 * Props du composant
 * École 42: Props typées, max 5 paramètres
 */
interface Props {
  savingsCapacity: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
}

defineProps<Props>()

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

/**
 * Formate un pourcentage
 */
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}
</script>

<style scoped>
.financial-metrics {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.metrics-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.5rem;
}

.metric-primary {
  grid-column: span 1;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-primary {
    grid-column: span 1;
  }
}
</style>
