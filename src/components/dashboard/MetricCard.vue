<!-- src/components/dashboard/MetricCard.vue -->

<template>
  <div class="metric-card" :class="`metric-${variant}`">
    <div class="metric-header">
      <span class="metric-icon">{{ icon }}</span>
      <span class="metric-title">{{ title }}</span>
    </div>

    <div class="metric-value">
      {{ value }}
    </div>

    <div v-if="subtitle" class="metric-subtitle">
      {{ subtitle }}
    </div>

    <div v-if="trend" class="metric-trend" :class="`trend-${trend}`">
      <span class="trend-icon">
        {{ trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→' }}
      </span>
      <span class="trend-text">
        {{ trendValue > 0 ? '+' : '' }}{{ trendValue.toFixed(1) }}% vs mois dernier
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Carte métrique réutilisable
 * École 42: Composant générique, réutilisable
 */

interface Props {
  title: string
  value: string
  icon: string
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
  variant?: 'primary' | 'default'
}

withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  trend: undefined,
  trendValue: 0,
  variant: 'default',
})
</script>

<style scoped>
.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Variant primaire (capacité d'épargne) */
.metric-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.metric-primary .metric-title,
.metric-primary .metric-subtitle,
.metric-primary .trend-text {
  color: rgba(255, 255, 255, 0.9);
}

.metric-primary .metric-value {
  color: white;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.metric-icon {
  font-size: 1.5rem;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
  color: #1a202c;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.metric-subtitle {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.75rem;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.trend-icon {
  font-size: 1rem;
}

.trend-up {
  color: #48bb78;
}

.trend-down {
  color: #f56565;
}

.trend-stable {
  color: #718096;
}

/* Trend dans variant primaire */
.metric-primary .trend-up,
.metric-primary .trend-down,
.metric-primary .trend-stable {
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
  .metric-value {
    font-size: 1.75rem;
  }
}
</style>
