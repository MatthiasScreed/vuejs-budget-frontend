<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200"
    :class="[
      cardClasses,
      { 'hover:shadow-md hover:-translate-y-1 cursor-pointer': hover }
    ]"
    @click="handleClick"
  >
    <!-- Header -->
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-200">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
          <div v-if="$slots.action" class="flex items-center space-x-2">
            <slot name="action" />
          </div>
        </div>
      </slot>
    </div>

    <!-- Content -->
    <div class="px-6 py-4">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  hover: false,
  padding: 'md',
  variant: 'default'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => {
  const classes = []

  // Variants
  switch (props.variant) {
    case 'success':
      classes.push('border-green-200 bg-green-50')
      break
    case 'warning':
      classes.push('border-yellow-200 bg-yellow-50')
      break
    case 'error':
      classes.push('border-red-200 bg-red-50')
      break
    case 'info':
      classes.push('border-blue-200 bg-blue-50')
      break
    default:
      classes.push('border-gray-200 bg-white')
  }

  return classes
})

const handleClick = (event: MouseEvent) => {
  if (props.hover) {
    emit('click', event)
  }
}
</script>
