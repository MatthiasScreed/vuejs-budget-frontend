<template>
  <div class="error-boundary">
    <!-- Erreur affichée -->
    <div v-if="hasError && showError" class="error-container">
      <div :class="errorClasses">
        <!-- Header avec icône -->
        <div class="error-header">
          <div class="error-icon-wrapper">
            <span class="error-icon">{{ errorIcon }}</span>
          </div>
          <div class="error-header-text">
            <h3 class="error-title">{{ errorTitle }}</h3>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          </div>
          <button v-if="dismissible" @click="dismiss" class="error-close" aria-label="Fermer">
            ✕
          </button>
        </div>

        <!-- Détails de l'erreur (en dev seulement) -->
        <div v-if="showDetails && isDevelopment" class="error-details">
          <details>
            <summary class="error-details-toggle">Détails techniques</summary>
            <pre class="error-stack">{{ errorDetails }}</pre>
          </details>
        </div>

        <!-- Actions -->
        <div class="error-actions">
          <LoadingButton
            v-if="enableRetry"
            variant="primary"
            size="sm"
            :loading="retrying"
            @click="handleRetry"
          >
            🔄 Réessayer
          </LoadingButton>

          <LoadingButton
            v-if="showReportButton"
            variant="secondary"
            size="sm"
            @click="handleReport"
          >
            📧 Signaler le problème
          </LoadingButton>

          <slot name="actions"></slot>
        </div>
      </div>
    </div>

    <!-- Contenu normal -->
    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import LoadingButton from './LoadingButton.vue'

// ==========================================
// PROPS
// ==========================================

const props = withDefaults(
  defineProps<{
    error?: Error | string | null
    variant?: 'error' | 'warning' | 'info'
    title?: string
    dismissible?: boolean
    enableRetry?: boolean
    showDetails?: boolean
    showReportButton?: boolean
    autoHide?: boolean
    autoHideDelay?: number
  }>(),
  {
    error: null,
    variant: 'error',
    dismissible: true,
    enableRetry: true,
    showDetails: true,
    showReportButton: false,
    autoHide: false,
    autoHideDelay: 5000,
  },
)

// ==========================================
// EMITS
// ==========================================

const emit = defineEmits<{
  retry: []
  dismiss: []
  report: [error: string]
}>()

// ==========================================
// STATE
// ==========================================

const showError = ref(true)
const retrying = ref(false)
const isDevelopment = import.meta.env.DEV

// ==========================================
// COMPUTED
// ==========================================

const hasError = computed(() => {
  return props.error !== null && props.error !== undefined
})

const errorIcon = computed(() => {
  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }
  return icons[props.variant]
})

const errorTitle = computed(() => {
  if (props.title) return props.title

  const titles = {
    error: 'Une erreur est survenue',
    warning: 'Attention',
    info: 'Information',
  }
  return titles[props.variant]
})

const errorMessage = computed(() => {
  if (!props.error) return ''

  if (typeof props.error === 'string') {
    return props.error
  }

  return props.error.message || 'Une erreur inattendue est survenue'
})

const errorDetails = computed(() => {
  if (!props.error || typeof props.error === 'string') {
    return props.error || ''
  }

  return props.error.stack || props.error.message || ''
})

const errorClasses = computed(() => {
  const baseClasses = ['error-card', 'rounded-lg', 'border', 'p-4', 'shadow-md']

  const variantClasses = {
    error: ['bg-red-50', 'border-red-200', 'text-red-900'],
    warning: ['bg-yellow-50', 'border-yellow-200', 'text-yellow-900'],
    info: ['bg-blue-50', 'border-blue-200', 'text-blue-900'],
  }

  return [...baseClasses, ...variantClasses[props.variant]]
})

// ==========================================
// WATCHERS
// ==========================================

watch(
  () => props.error,
  (newError) => {
    if (newError) {
      showError.value = true

      // Auto-hide si activé
      if (props.autoHide) {
        setTimeout(() => {
          showError.value = false
        }, props.autoHideDelay)
      }
    }
  },
)

// ==========================================
// METHODS
// ==========================================

function dismiss() {
  showError.value = false
  emit('dismiss')
}

async function handleRetry() {
  retrying.value = true

  try {
    await emit('retry')
    showError.value = false
  } catch (error) {
    console.error('Retry failed:', error)
  } finally {
    retrying.value = false
  }
}

function handleReport() {
  const errorInfo = errorDetails.value
  emit('report', errorInfo)
}
</script>

<style scoped>
.error-boundary {
  width: 100%;
}

.error-container {
  margin-bottom: 1.5rem;
}

.error-card {
  position: relative;
}

.error-header {
  display: flex;
  align-items: start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.error-icon-wrapper {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.05);
}

.error-icon {
  font-size: 1.25rem;
}

.error-header-text {
  flex: 1;
  min-width: 0;
}

.error-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.error-message {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
}

.error-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.25rem;
  opacity: 0.6;
  transition: opacity 0.2s;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-close:hover {
  opacity: 1;
}

.error-details {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
}

.error-details-toggle {
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.error-details-toggle:hover {
  text-decoration: underline;
}

.error-stack {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-family: 'Monaco', 'Courier New', monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* Responsive */
@media (max-width: 640px) {
  .error-header {
    flex-direction: column;
  }

  .error-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }

  .error-actions {
    flex-direction: column;
  }
}
</style>
