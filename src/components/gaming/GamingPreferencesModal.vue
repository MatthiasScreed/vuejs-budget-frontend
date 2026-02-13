<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="true"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="$emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div class="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">⚙️ Personnaliser l'affichage</h2>
                <button
                  @click="$emit('close')"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="px-6 py-4 space-y-6 overflow-y-auto max-h-[60vh]">
              <!-- Mode global -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-3">
                  Style d'affichage
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="mode in displayModes"
                    :key="mode.value"
                    @click="preferences.gaming_preference = mode.value"
                    :class="[
                      'p-4 rounded-xl border-2 text-left transition-all',
                      preferences.gaming_preference === mode.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300',
                    ]"
                  >
                    <span class="text-2xl block mb-2">{{ mode.icon }}</span>
                    <span class="font-medium text-gray-900 block">{{ mode.label }}</span>
                    <span class="text-xs text-gray-500">{{ mode.description }}</span>
                  </button>
                </div>
              </div>

              <!-- Options détaillées -->
              <div v-if="preferences.gaming_preference !== 'minimal'" class="space-y-4">
                <h3 class="text-sm font-medium text-gray-900">Options détaillées</h3>

                <!-- Toggle options -->
                <div class="space-y-3">
                  <label
                    v-for="option in toggleOptions"
                    :key="option.key"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-xl">{{ option.icon }}</span>
                      <div>
                        <span class="font-medium text-gray-900">{{ option.label }}</span>
                        <p class="text-xs text-gray-500">{{ option.description }}</p>
                      </div>
                    </div>

                    <div class="relative">
                      <input
                        type="checkbox"
                        v-model="preferences[option.key]"
                        class="sr-only peer"
                      />
                      <div
                        class="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors"
                      />
                      <div
                        class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"
                      />
                    </div>
                  </label>
                </div>
              </div>

              <!-- Aperçu -->
              <div class="bg-gray-50 rounded-xl p-4">
                <h3 class="text-sm font-medium text-gray-900 mb-3">Aperçu</h3>
                <div class="bg-white rounded-lg border border-gray-200 p-3">
                  <div class="flex items-center gap-3">
                    <!-- Badge niveau -->
                    <div
                      v-if="previewShowLevel"
                      class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold"
                    >
                      5
                    </div>

                    <!-- Barre de progression -->
                    <div v-if="previewShowXP" class="flex-1">
                      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          class="h-full w-3/5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        />
                      </div>
                      <p class="text-xs text-gray-500 mt-1">350 / 500 points</p>
                    </div>

                    <!-- Message simple si minimal -->
                    <p v-if="!previewShowXP" class="text-sm text-gray-600">
                      Vous progressez bien ! 👍
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                @click="$emit('close')"
                class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                @click="savePreferences"
                :disabled="saving"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useProgressiveGaming, type GamingPreferences } from '@/composables/useProgressiveGaming'

// ==========================================
// EMITS
// ==========================================

const emit = defineEmits<{
  close: []
  saved: []
}>()

// ==========================================
// COMPOSABLES
// ==========================================

const { config, updatePreferences } = useProgressiveGaming()

// ==========================================
// STATE
// ==========================================

const saving = ref(false)

const preferences = reactive<GamingPreferences>({
  gaming_preference: 'auto',
  show_xp_notifications: false,
  show_level_badges: false,
  show_leaderboard: false,
  show_challenges: false,
})

// ==========================================
// OPTIONS
// ==========================================

const displayModes = [
  {
    value: 'minimal' as const,
    icon: '🌱',
    label: 'Minimaliste',
    description: 'Encouragements discrets',
  },
  {
    value: 'auto' as const,
    icon: '✨',
    label: 'Automatique',
    description: "S'adapte à vous",
  },
  {
    value: 'moderate' as const,
    icon: '🎯',
    label: 'Modéré',
    description: 'Points et paliers',
  },
  {
    value: 'full' as const,
    icon: '🎮',
    label: 'Complet',
    description: 'Toutes les fonctionnalités',
  },
]

const toggleOptions = [
  {
    key: 'show_xp_notifications' as keyof GamingPreferences,
    icon: '🔔',
    label: 'Notifications de points',
    description: 'Afficher les points gagnés',
  },
  {
    key: 'show_level_badges' as keyof GamingPreferences,
    icon: '🏅',
    label: 'Badges de niveau',
    description: 'Afficher votre palier actuel',
  },
  {
    key: 'show_leaderboard' as keyof GamingPreferences,
    icon: '🏆',
    label: 'Classement',
    description: 'Voir le classement des utilisateurs',
  },
  {
    key: 'show_challenges' as keyof GamingPreferences,
    icon: '⚔️',
    label: 'Défis',
    description: 'Participer aux défis communautaires',
  },
]

// ==========================================
// COMPUTED
// ==========================================

const previewShowLevel = computed(
  () =>
    preferences.gaming_preference !== 'minimal' &&
    (preferences.gaming_preference === 'full' || preferences.show_level_badges),
)

const previewShowXP = computed(
  () =>
    preferences.gaming_preference !== 'minimal' &&
    (preferences.gaming_preference !== 'auto' || preferences.show_xp_notifications),
)

// ==========================================
// MÉTHODES
// ==========================================

async function savePreferences(): Promise<void> {
  saving.value = true

  try {
    const success = await updatePreferences(preferences)

    if (success) {
      emit('saved')
    }
  } finally {
    saving.value = false
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  // Charger les préférences actuelles
  if (config.value) {
    preferences.gaming_preference = config.value.notifications.show_xp_notifications
      ? config.value.engagement_level >= 4
        ? 'full'
        : 'moderate'
      : 'auto'

    preferences.show_xp_notifications = config.value.notifications.show_xp_notifications
    preferences.show_level_badges = config.value.notifications.show_level_badges
    preferences.show_leaderboard = config.value.notifications.show_leaderboard
    preferences.show_challenges = config.value.notifications.show_challenges
  }
})
</script>
