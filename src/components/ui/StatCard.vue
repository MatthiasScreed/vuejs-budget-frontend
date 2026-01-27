<template>
  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div class="flex items-center">
      <div
        class="p-3 rounded-lg"
        :class="iconBgClass"
      >
        <component
          :is="iconComponent"
          class="h-6 w-6"
          :class="iconClass"
        />
      </div>
      <div class="ml-4 flex-1">
        <p class="text-sm font-medium text-gray-600">{{ label }}</p>
        <div class="flex items-baseline">
          <p class="text-2xl font-bold text-gray-900">{{ formattedValue }}</p>
          <p
            v-if="change !== undefined"
            class="ml-2 text-sm font-medium"
            :class="changeClass"
          >
            {{ changeText }}
          </p>
        </div>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-1">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: number | string
  change?: number
  subtitle?: string
  icon?: string
  iconComponent?: any
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  format?: 'number' | 'currency' | 'percentage'
  currency?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  format: 'number',
  currency: 'EUR'
})

const formattedValue = computed(() => {
  if (typeof props.value === 'string') {
    return props.value
  }

  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: props.currency
      }).format(props.value)
    case 'percentage':
      return `${props.value}%`
    default:
      return new Intl.NumberFormat('fr-FR').format(props.value)
  }
})

const changeText = computed(() => {
  if (props.change === undefined) return ''

  const prefix = props.change > 0 ? '+' : ''
  const suffix = props.format === 'percentage' ? '%' : ''

  return `${prefix}${props.change}${suffix}`
})

const changeClass = computed(() => {
  if (props.change === undefined) return ''

  return props.change > 0
    ? 'text-green-600'
    : props.change < 0
      ? 'text-red-600'
      : 'text-gray-600'
})

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-green-100'
    case 'warning':
      return 'bg-yellow-100'
    case 'error':
      return 'bg-red-100'
    case 'info':
      return 'bg-blue-100'
    default:
      return 'bg-gray-100'
  }
})

const iconClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'text-green-600'
    case 'warning':
      return 'text-yellow-600'
    case 'error':
      return 'text-red-600'
    case 'info':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
})
</script>
