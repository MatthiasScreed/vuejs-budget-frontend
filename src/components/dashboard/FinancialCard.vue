<template>
  <div
    class="financial-card"
    :class="[
      `financial-card--${color}`,
      `financial-card--${size}`
    ]"
  >
    <div class="financial-card-header">
      <div class="financial-card-icon">
        {{ icon }}
      </div>
      <div class="financial-card-title-section">
        <h3 class="financial-card-title">{{ title }}</h3>
        <p v-if="subtitle" class="financial-card-subtitle">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <div class="financial-card-value">
      {{ value }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  color?: 'primary' | 'success' | 'warning' | 'error'
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  size: 'medium'
})
</script>

<style scoped>
.financial-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.financial-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* Sizes */
.financial-card--small {
  padding: 1rem;
}

.financial-card--large {
  padding: 2rem;
}

/* Colors */
.financial-card--primary {
  border-left: 4px solid #3b82f6;
}

.financial-card--success {
  border-left: 4px solid #10b981;
}

.financial-card--warning {
  border-left: 4px solid #f59e0b;
}

.financial-card--error {
  border-left: 4px solid #ef4444;
}

/* Header */
.financial-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.financial-card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.financial-card--success .financial-card-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.financial-card--warning .financial-card-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.financial-card--error .financial-card-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.financial-card-title-section {
  flex: 1;
  min-width: 0;
}

.financial-card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  word-break: break-word;
}

.financial-card-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0.25rem 0 0 0;
  word-break: break-word;
}

/* Value */
.financial-card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  word-break: break-word;
}

.financial-card--small .financial-card-value {
  font-size: 1.5rem;
}

.financial-card--large .financial-card-value {
  font-size: 2.5rem;
}

/* ========================================
   RESPONSIVE - TABLET
   ======================================== */

@media (max-width: 768px) {
  .financial-card {
    padding: 1.25rem;
  }

  .financial-card-icon {
    width: 44px;
    height: 44px;
    font-size: 1.375rem;
  }

  .financial-card-value {
    font-size: 1.875rem;
  }

  .financial-card--large .financial-card-value {
    font-size: 2.25rem;
  }
}

/* ========================================
   RESPONSIVE - MOBILE
   ======================================== */

@media (max-width: 640px) {
  .financial-card {
    padding: 1rem;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .financial-card-header {
    gap: 0.625rem;
  }

  .financial-card-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
    border-radius: 10px;
  }

  .financial-card-title {
    font-size: 0.8125rem;
  }

  .financial-card-subtitle {
    font-size: 0.6875rem;
  }

  .financial-card-value {
    font-size: 1.625rem;
  }

  .financial-card--small .financial-card-value {
    font-size: 1.375rem;
  }

  .financial-card--large .financial-card-value {
    font-size: 2rem;
  }
}

/* ========================================
   RESPONSIVE - VERY SMALL MOBILE
   ======================================== */

@media (max-width: 375px) {
  .financial-card {
    padding: 0.875rem;
  }

  .financial-card-icon {
    width: 36px;
    height: 36px;
    font-size: 1.125rem;
  }

  .financial-card-value {
    font-size: 1.5rem;
  }
}

/* ========================================
   DARK MODE SUPPORT
   ======================================== */

@media (prefers-color-scheme: dark) {
  .financial-card {
    background: #1f2937;
    border-color: #374151;
  }

  .financial-card-title {
    color: #9ca3af;
  }

  .financial-card-subtitle {
    color: #6b7280;
  }

  .financial-card-value {
    color: #f9fafb;
  }

  .financial-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

/* ========================================
   REDUCED MOTION
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  .financial-card {
    transition: none;
  }

  .financial-card:hover {
    transform: none;
  }
}
</style>
