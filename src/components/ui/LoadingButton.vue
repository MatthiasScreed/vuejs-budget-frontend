<template>
  <button :type="type" :disabled="loading || disabled" :class="buttonClasses" @click="handleClick">
    <!-- Loading spinner -->
    <span v-if="loading" class="btn-spinner">
      <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>

    <!-- Icon (if provided) -->
    <span v-if="!loading && icon" class="btn-icon">{{ icon }}</span>

    <!-- Text content -->
    <span class="btn-text">
      <slot v-if="!loading"></slot>
      <template v-else>{{ loadingText || 'Chargement...' }}</template>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// ==========================================
// PROPS
// ==========================================

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'neutral'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    icon?: string
    loadingText?: string
    fullWidth?: boolean
  }>(),
  {
    type: 'button',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    fullWidth: false,
  },
)

// ==========================================
// EMITS
// ==========================================

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// ==========================================
// COMPUTED
// ==========================================

const buttonClasses = computed(() => {
  const baseClasses = [
    'btn',
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
  ]

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-gradient-to-r',
      'from-purple-600',
      'to-pink-600',
      'text-white',
      'hover:from-purple-700',
      'hover:to-pink-700',
      'focus:ring-purple-500',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
    ],
    secondary: [
      'bg-gray-100',
      'text-gray-700',
      'hover:bg-gray-200',
      'focus:ring-gray-500',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
    ],
    success: [
      'bg-green-600',
      'text-white',
      'hover:bg-green-700',
      'focus:ring-green-500',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
    ],
    neutral: [
      'bg-white',
      'text-gray-700',
      'border',
      'border-gray-300',
      'hover:bg-gray-50',
      'focus:ring-gray-500',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
    ],
  }

  // Size classes
  const sizeClasses = {
    sm: ['text-sm', 'px-3', 'py-1.5', 'min-h-[36px]'],
    md: ['text-base', 'px-4', 'py-2', 'min-h-[44px]'],
    lg: ['text-lg', 'px-6', 'py-3', 'min-h-[52px]'],
  }

  // Full width
  const widthClass = props.fullWidth ? 'w-full' : ''

  return [...baseClasses, ...variantClasses[props.variant], ...sizeClasses[props.size], widthClass]
})

// ==========================================
// METHODS
// ==========================================

function handleClick(event: MouseEvent) {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  font-size: 1.125rem;
}

.btn-text {
  display: inline-flex;
  align-items: center;
}

/* Animation du spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
