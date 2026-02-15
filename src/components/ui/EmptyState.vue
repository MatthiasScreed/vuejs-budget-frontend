<template>
  <div :class="containerClasses">
    <!-- Icon -->
    <div class="empty-icon-wrapper">
      <span class="empty-icon">{{ icon }}</span>
    </div>

    <!-- Title -->
    <h3 class="empty-title">{{ title }}</h3>

    <!-- Description -->
    <p v-if="description" class="empty-description">
      {{ description }}
    </p>

    <!-- Actions slot -->
    <div v-if="showAction || $slots.actions" class="empty-actions">
      <slot name="actions">
        <LoadingButton
          v-if="showAction"
          :variant="actionVariant"
          :icon="actionIcon"
          :loading="actionLoading"
          @click="$emit('action')"
        >
          {{ actionText }}
        </LoadingButton>
      </slot>
    </div>

    <!-- Secondary action slot -->
    <div v-if="$slots.secondary" class="empty-secondary">
      <slot name="secondary"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LoadingButton from './LoadingButton.vue'

// ==========================================
// PROPS
// ==========================================

const props = withDefaults(
  defineProps<{
    icon?: string
    title: string
    description?: string
    variant?: 'default' | 'error' | 'info' | 'success'
    size?: 'sm' | 'md' | 'lg'
    showAction?: boolean
    actionText?: string
    actionIcon?: string
    actionVariant?: 'primary' | 'secondary' | 'danger' | 'success' | 'neutral'
    actionLoading?: boolean
  }>(),
  {
    icon: '📭',
    variant: 'default',
    size: 'md',
    showAction: false,
    actionText: 'Action',
    actionVariant: 'primary',
    actionLoading: false,
  },
)

// ==========================================
// EMITS
// ==========================================

defineEmits<{
  action: []
}>()

// ==========================================
// COMPUTED
// ==========================================

const containerClasses = computed(() => {
  const baseClasses = [
    'empty-state',
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'text-center',
  ]

  // Padding selon la taille
  const sizeClasses = {
    sm: ['py-8', 'px-4'],
    md: ['py-12', 'px-6'],
    lg: ['py-16', 'px-8'],
  }

  // Couleurs selon le variant
  const variantClasses = {
    default: [],
    error: ['text-red-900'],
    info: ['text-blue-900'],
    success: ['text-green-900'],
  }

  return [...baseClasses, ...sizeClasses[props.size], ...variantClasses[props.variant]]
})
</script>

<style scoped>
.empty-state {
  width: 100%;
  max-width: 32rem;
  margin: 0 auto;
}

.empty-icon-wrapper {
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 4rem;
  display: inline-block;
  opacity: 0.8;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.empty-description {
  font-size: 0.9375rem;
  color: #5b6270;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 16rem;
}

.empty-secondary {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #5b6270;
}

/* Responsive */
@media (max-width: 640px) {
  .empty-icon {
    font-size: 3rem;
  }

  .empty-title {
    font-size: 1.125rem;
  }

  .empty-description {
    font-size: 0.875rem;
  }
}
</style>
