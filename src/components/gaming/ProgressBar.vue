<template>
  <!--
    Barre de progression adaptative selon le niveau d'engagement
    - Niveau 1: Invisible ou très subtile
    - Niveau 2: Points et palier visibles
    - Niveau 3+: Détails complets avec animation
  -->
  <div v-if="shouldShow" :class="containerClasses">

    <!-- Version Compacte (Header/Sidebar) -->
    <template v-if="variant === 'compact'">
      <div class="flex items-center gap-2">
        <!-- Badge niveau -->
        <div :class="tierBadgeClasses">
          {{ progress?.current_tier ?? 1 }}
        </div>

        <!-- Barre -->
        <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            :class="progressBarClasses"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>

        <!-- Points (niveau 2+) -->
        <span v-if="showPoints" class="text-xs text-gray-500 min-w-[60px] text-right">
          {{ formattedPoints }}
        </span>
      </div>
    </template>

    <!-- Version Détaillée (Dashboard) -->
    <template v-else-if="variant === 'detailed'">
      <div class="space-y-3">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Badge niveau -->
            <div :class="tierBadgeClassesLarge">
              <span class="text-lg font-bold">{{ progress?.current_tier ?? 1 }}</span>
            </div>

            <div>
              <h4 class="font-medium text-gray-900">
                {{ terminology.tier }} {{ progress?.current_tier ?? 1 }}
              </h4>
              <p class="text-sm text-gray-500">{{ progress?.tier_name ?? 'Débutant' }}</p>
            </div>
          </div>

          <!-- Points totaux (niveau 3+) -->
          <div v-if="showTotalPoints" class="text-right">
            <p class="text-lg font-semibold text-gray-900">
              {{ formatNumber(progress?.total_points ?? 0) }}
            </p>
            <p class="text-xs text-gray-500">{{ terminology.points }} total</p>
          </div>
        </div>

        <!-- Barre de progression -->
        <div>
          <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              :class="[progressBarClasses, 'h-full']"
              :style="{ width: `${progressPercent}%` }"
            >
              <!-- Effet brillant (niveau 3+) -->
              <div
                v-if="showShineEffect"
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"
              />
            </div>
          </div>

          <!-- Labels sous la barre -->
          <div class="flex justify-between mt-1 text-xs text-gray-500">
            <span>{{ formatNumber(progress?.points_in_tier ?? 0) }} {{ terminology.points }}</span>
            <span>{{ formatNumber(progress?.points_for_next ?? 100) }} {{ terminology.points }}</span>
          </div>
        </div>

        <!-- Message d'encouragement (niveau 1-2) -->
        <p v-if="showEncouragement" class="text-sm text-gray-600 text-center">
          {{ encouragementMessage }}
        </p>
      </div>
    </template>

    <!-- Version Mini (Inline) -->
    <template v-else-if="variant === 'mini'">
      <div class="inline-flex items-center gap-1.5">
        <div class="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span class="text-[10px] font-bold text-white">{{ progress?.current_tier ?? 1 }}</span>
        </div>
        <div class="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>
    </template>

    <!-- Version Card (Standalone) -->
    <template v-else>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex items-center gap-4">
          <!-- Badge animé -->
          <div :class="tierBadgeClassesAnimated">
            <span class="text-xl font-bold">{{ progress?.current_tier ?? 1 }}</span>

            <!-- Cercle de progression -->
            <svg class="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                :r="radius"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                class="text-gray-200"
              />
              <circle
                cx="50%"
                cy="50%"
                :r="radius"
                fill="none"
                stroke="url(#progressGradient)"
                stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
                class="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#3B82F6" />
                  <stop offset="100%" stop-color="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div class="flex-1">
            <div class="flex items-baseline gap-2">
              <span class="font-semibold text-gray-900">{{ progress?.tier_name ?? 'Débutant' }}</span>
              <span v-if="showPoints" class="text-sm text-gray-500">
                • {{ formattedPoints }}
              </span>
            </div>

            <!-- Barre linéaire -->
            <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                :class="progressBarClasses"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>

            <!-- Prochain palier -->
            <p v-if="showNextTier" class="mt-1 text-xs text-gray-500">
              Encore {{ remainingPoints }} {{ terminology.points }} pour le {{ terminology.tier }} {{ (progress?.current_tier ?? 1) + 1 }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProgressiveGaming, ENGAGEMENT_LEVELS, type ProgressData } from '@/composables/useProgressiveGaming'

// ==========================================
// PROPS
// ==========================================

interface Props {
  progress?: ProgressData | null
  variant?: 'compact' | 'detailed' | 'mini' | 'card'
  forceShow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  progress: null,
  variant: 'card',
  forceShow: false,
})

// ==========================================
// COMPOSABLES
// ==========================================

const {
  engagementLevel,
  terminology,
  uiConfig,
  dashboardData,
} = useProgressiveGaming()

// ==========================================
// COMPUTED - Données
// ==========================================

const progress = computed(() => props.progress ?? dashboardData.value?.progress ?? null)

const progressPercent = computed(() => progress.value?.progress_percentage ?? 0)

const remainingPoints = computed(() => {
  if (!progress.value) return 0
  return progress.value.points_for_next - progress.value.points_in_tier
})

const formattedPoints = computed(() => {
  const pts = progress.value?.points_in_tier ?? 0
  const total = progress.value?.points_for_next ?? 100
  return `${formatNumber(pts)}/${formatNumber(total)}`
})

// Cercle SVG
const radius = 22
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() =>
  circumference - (progressPercent.value / 100) * circumference
)

// ==========================================
// COMPUTED - Affichage conditionnel
// ==========================================

const shouldShow = computed(() => {
  if (props.forceShow) return true
  return engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS && uiConfig.value.show_xp_bar
})

const showPoints = computed(() =>
  engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS
)

const showTotalPoints = computed(() =>
  engagementLevel.value >= ENGAGEMENT_LEVELS.SOCIAL
)

const showNextTier = computed(() =>
  engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS
)

const showShineEffect = computed(() =>
  engagementLevel.value >= ENGAGEMENT_LEVELS.SOCIAL &&
  uiConfig.value.animation_intensity !== 'subtle'
)

const showEncouragement = computed(() =>
  engagementLevel.value <= ENGAGEMENT_LEVELS.REWARDS
)

const encouragementMessage = computed(() => {
  const percent = progressPercent.value

  if (percent >= 90) return 'Presque au prochain palier !'
  if (percent >= 50) return 'Vous progressez bien, continuez !'
  if (percent >= 25) return 'Beau début, gardez le rythme'
  return 'Chaque action vous rapproche de vos objectifs'
})

// ==========================================
// COMPUTED - Styles
// ==========================================

const containerClasses = computed(() => {
  if (props.variant === 'mini') return ''
  if (props.variant === 'compact') return 'w-full'
  return 'w-full'
})

const tierBadgeClasses = computed(() => [
  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
  'bg-gradient-to-br from-blue-500 to-purple-600 text-white',
])

const tierBadgeClassesLarge = computed(() => [
  'w-12 h-12 rounded-xl flex items-center justify-center',
  'bg-gradient-to-br from-blue-500 to-purple-600 text-white',
])

const tierBadgeClassesAnimated = computed(() => [
  'relative w-14 h-14 rounded-full flex items-center justify-center',
  'bg-gray-50 text-gray-900',
])

const progressBarClasses = computed(() => {
  const base = ['rounded-full transition-all duration-500 ease-out relative overflow-hidden']

  // Couleur selon le pourcentage
  const percent = progressPercent.value
  if (percent >= 75) {
    base.push('bg-gradient-to-r from-green-500 to-emerald-500')
  } else if (percent >= 50) {
    base.push('bg-gradient-to-r from-blue-500 to-purple-500')
  } else {
    base.push('bg-gradient-to-r from-blue-400 to-blue-500')
  }

  return base
})

// ==========================================
// MÉTHODES
// ==========================================

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toLocaleString('fr-FR')
}
</script>

<style scoped>
@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shine {
  animation: shine 2s infinite;
}
</style>
