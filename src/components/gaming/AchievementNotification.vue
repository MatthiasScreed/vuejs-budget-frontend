<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 transform translate-x-full"
    enter-to-class="opacity-100 transform translate-x-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 transform translate-x-0"
    leave-to-class="opacity-0 transform translate-x-full"
  >
    <div
      v-if="visible"
      class="achievement-notification bg-white rounded-lg shadow-lg border-l-4 border-purple-500 p-4 mb-2 max-w-sm"
      :class="rarityClass"
    >
      <div class="flex items-center space-x-3">
        <!-- Icône du succès -->
        <div
          class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
          :class="iconBackgroundClass"
        >
          {{ achievement.icon }}
        </div>

        <!-- Contenu de la notification -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-gray-900 truncate">
              🏆 Nouveau succès !
            </h4>
            <button
              @click="$emit('close', notification.id)"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon class="h-4 w-4" />
            </button>
          </div>

          <p class="text-lg font-semibold text-gray-800 mt-1">
            {{ achievement.name }}
          </p>

          <p class="text-sm text-gray-600 mt-1">
            {{ achievement.description }}
          </p>

          <div class="flex items-center justify-between mt-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="rarityBadgeClass">
              {{ achievement.rarity_name || rarityName }}
            </span>

            <span class="text-sm font-medium text-purple-600">
              +{{ achievement.points }} XP
            </span>
          </div>
        </div>
      </div>

      <!-- Barre de progression/animation -->
      <div class="mt-3 w-full bg-gray-200 rounded-full h-1">
        <div
          class="bg-purple-500 h-1 rounded-full transition-all duration-300 ease-out"
          :style="{ width: progressWidth + '%' }"
        ></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { Achievement, GamingNotification } from '@/types/entities/gaming.ts'

// Props
interface Props {
  notification: GamingNotification
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: [id: string]
}>()

// État local
const visible = ref(false)
const progressWidth = ref(0)

// Computed
const achievement = computed(() => props.notification.data as Achievement)

const rarityName = computed(() => {
  const names: Record<string, string> = {
    'common': 'Commun',
    'uncommon': 'Peu commun',
    'rare': 'Rare',
    'epic': 'Épique',
    'legendary': 'Légendaire'
  }
  return names[achievement.value.rarity] || 'Inconnu'
})

const rarityClass = computed(() => {
  const classes: Record<string, string> = {
    'common': 'border-gray-400',
    'uncommon': 'border-green-400',
    'rare': 'border-blue-400',
    'epic': 'border-purple-400',
    'legendary': 'border-yellow-400'
  }
  return classes[achievement.value.rarity] || 'border-gray-400'
})

const iconBackgroundClass = computed(() => {
  const classes: Record<string, string> = {
    'common': 'bg-gray-500',
    'uncommon': 'bg-green-500',
    'rare': 'bg-blue-500',
    'epic': 'bg-purple-500',
    'legendary': 'bg-yellow-500'
  }
  return classes[achievement.value.rarity] || 'bg-gray-500'
})

const rarityBadgeClass = computed(() => {
  const classes: Record<string, string> = {
    'common': 'bg-gray-100 text-gray-800',
    'uncommon': 'bg-green-100 text-green-800',
    'rare': 'bg-blue-100 text-blue-800',
    'epic': 'bg-purple-100 text-purple-800',
    'legendary': 'bg-yellow-100 text-yellow-800'
  }
  return classes[achievement.value.rarity] || 'bg-gray-100 text-gray-800'
})

// Méthodes
const showNotification = () => {
  visible.value = true

  // Animation de la barre de progression
  setTimeout(() => {
    progressWidth.value = 100
  }, 100)
}

const hideNotification = () => {
  visible.value = false
  setTimeout(() => {
    emit('close', props.notification.id)
  }, 300)
}

// Lifecycle hooks
onMounted(() => {
  showNotification()

  // Auto-fermeture après la durée spécifiée
  setTimeout(() => {
    hideNotification()
  }, props.notification.duration || 5000)
})

onUnmounted(() => {
  // Nettoyage si nécessaire
})
</script>

<style scoped>
.achievement-notification {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.achievement-notification:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
</style>
