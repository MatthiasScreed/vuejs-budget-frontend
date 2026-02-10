<!-- src/components/landing/BenefitCard.vue -->

<template>
  <div class="benefit-card">
    <div class="card-icon">
      {{ benefit.icon }}
    </div>

    <h3 class="card-title">
      {{ benefit.title }}
    </h3>

    <p class="card-description">
      {{ benefit.description }}
    </p>

    <div v-if="benefit.example" class="card-example">
      <span class="example-label">💡</span>
      <span class="example-text">{{ benefit.example }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Benefit } from '@/types/landing.types'

/**
 * Props du composant
 * École 42: Props typées et documentées
 */
defineProps<{
  benefit: Benefit
}>()
</script>

<style scoped>
.benefit-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.benefit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
}

.card-description {
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.card-example {
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.example-label {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.example-text {
  font-size: 0.875rem;
  color: #4a5568;
  font-style: italic;
}
</style>
