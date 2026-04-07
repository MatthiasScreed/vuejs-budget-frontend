<template>
  <div
    class="bg-white rounded-xl border border-gray-200 transition-shadow hover:shadow-md"
    :class="small ? 'p-4' : 'p-6'"
  >
    <div class="flex items-center gap-3">
      <div
        class="flex items-center justify-center rounded-xl text-white"
        :class="[iconBgClass, small ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl']"
      >
        {{ icon }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm text-gray-600 truncate">{{ title }}</div>
        <div class="font-bold text-gray-900" :class="small ? 'text-lg' : 'text-2xl'">
          {{ formattedValue }}
        </div>
        <div v-if="subtitle" class="text-xs text-gray-500 truncate">{{ subtitle }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  subtitle?: string
  icon: string
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'orange' | 'teal' | 'amber'
  small?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  small: false,
})

const colorClasses: Record<string, string> = {
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
  green: 'bg-gradient-to-br from-green-500 to-green-600',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
  red: 'bg-gradient-to-br from-red-500 to-red-600',
  orange: 'bg-gradient-to-br from-orange-400 to-orange-500',
  teal: 'bg-gradient-to-br from-teal-500 to-teal-600',
  amber: 'bg-gradient-to-br from-amber-400 to-amber-500',
}

const iconBgClass = computed(() => colorClasses[props.color] || colorClasses.blue)

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('fr-FR')
  }
  return props.value
})
</script>
