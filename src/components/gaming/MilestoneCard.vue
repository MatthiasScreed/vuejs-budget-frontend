<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- Icône et statut -->
    <div class="flex items-start gap-3">
      <!-- Icône -->
      <div :class="iconContainerClasses">
        <span
          class="text-2xl"
          :class="{
            'grayscale opacity-50': !milestone.is_completed && milestone.progress.percentage === 0,
          }"
        >
          {{ milestone.icon }}
        </span>

        <!-- Badge complété -->
        <div
          v-if="milestone.is_completed"
          class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <!-- Contenu -->
      <div class="flex-1 min-w-0">
        <!-- Titre -->
        <h4 :class="titleClasses">
          {{ milestone.title }}
        </h4>

        <!-- Description -->
        <p class="text-sm text-gray-600 mt-0.5 line-clamp-2">
          {{ milestone.description }}
        </p>

        <!-- Catégorie (niveau 2+) -->
        <div v-if="showCategory" class="flex items-center gap-2 mt-2">
          <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
            {{ milestone.category.icon }} {{ milestone.category.label }}
          </span>
        </div>
      </div>

      <!-- Récompense (niveau 2+) -->
      <div v-if="showReward && milestone.reward" class="flex-shrink-0 text-right">
        <span class="text-sm font-medium text-green-600">
          {{ milestone.reward }}
        </span>
      </div>
    </div>

    <!-- Barre de progression -->
    <div v-if="!milestone.is_completed && showProgress" class="mt-4">
      <div class="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progression</span>
        <span>{{ milestone.progress.percentage }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="progressBarColor"
          :style="{ width: `${milestone.progress.percentage}%` }"
        />
      </div>

      <!-- Détails progression (niveau 3+) -->
      <div v-if="showProgressDetails" class="flex justify-between text-xs text-gray-400 mt-1">
        <span>{{ formatValue(milestone.progress.current) }}</span>
        <span>{{ formatValue(milestone.progress.target) }}</span>
      </div>
    </div>

    <!-- Date de complétion -->
    <div v-if="milestone.is_completed && milestone.completed_at" class="mt-3 text-xs text-gray-500">
      Complété le {{ formatDate(milestone.completed_at) }}
    </div>

    <!-- Bouton réclamer récompense -->
    <button
      v-if="milestone.is_completed && !milestone.reward_claimed && milestone.reward"
      @click.stop="claimReward"
      :disabled="claiming"
      class="mt-3 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
    >
      {{ claiming ? 'Chargement...' : '🎁 Réclamer la récompense' }}
    </button>

    <!-- Indicateur récompense réclamée -->
    <div v-if="milestone.reward_claimed" class="mt-3 text-center text-xs text-gray-500">
      ✓ Récompense réclamée
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useProgressiveGaming,
  type Milestone,
  ENGAGEMENT_LEVELS,
} from '@/composables/useProgressiveGaming'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  milestone: Milestone
  compact?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  clickable: true,
})

const emit = defineEmits<{
  click: [milestone: Milestone]
  claimed: [milestone: Milestone]
}>()

// ==========================================
// COMPOSABLES
// ==========================================

const { engagementLevel, claimMilestoneReward, recordInteraction } = useProgressiveGaming()

// ==========================================
// STATE
// ==========================================

const claiming = ref(false)

// ==========================================
// COMPUTED - Affichage conditionnel
// ==========================================

const showCategory = computed(
  () => !props.compact && engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS,
)

const showReward = computed(() => engagementLevel.value >= ENGAGEMENT_LEVELS.REWARDS)

const showProgress = computed(() => !props.compact && props.milestone.progress.percentage > 0)

const showProgressDetails = computed(() => engagementLevel.value >= ENGAGEMENT_LEVELS.SOCIAL)

// ==========================================
// COMPUTED - Styles
// ==========================================

const cardClasses = computed(() => {
  const base = ['relative p-4 rounded-xl border transition-all duration-200']

  // Style selon l'état
  if (props.milestone.is_completed) {
    base.push('bg-gradient-to-br from-green-50 to-emerald-50 border-green-200')
  } else if (props.milestone.progress.percentage > 0) {
    base.push('bg-white border-blue-200')
  } else {
    base.push('bg-white border-gray-200')
  }

  // Interactivité
  if (props.clickable) {
    base.push('cursor-pointer hover:shadow-md hover:border-gray-300')
  }

  // Compact mode
  if (props.compact) {
    base.push('p-3')
  }

  return base
})

const iconContainerClasses = computed(() => {
  const base = ['relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center']

  if (props.milestone.is_completed) {
    base.push('bg-green-100')
  } else if (props.milestone.progress.percentage > 50) {
    base.push('bg-blue-100')
  } else {
    base.push('bg-gray-100')
  }

  return base
})

const titleClasses = computed(() => {
  const base = ['font-semibold']

  if (props.milestone.is_completed) {
    base.push('text-green-900')
  } else {
    base.push('text-gray-900')
  }

  if (props.compact) {
    base.push('text-sm')
  }

  return base
})

const progressBarColor = computed(() => {
  const percentage = props.milestone.progress.percentage

  if (percentage >= 75) return 'bg-green-500'
  if (percentage >= 50) return 'bg-blue-500'
  if (percentage >= 25) return 'bg-yellow-500'
  return 'bg-gray-400'
})

// ==========================================
// MÉTHODES
// ==========================================

function handleClick(): void {
  if (!props.clickable) return

  recordInteraction('clicked_milestone', 'milestone', props.milestone.id)
  emit('click', props.milestone)
}

async function claimReward(): Promise<void> {
  claiming.value = true

  try {
    const success = await claimMilestoneReward(props.milestone.id)

    if (success) {
      emit('claimed', props.milestone)
    }
  } finally {
    claiming.value = false
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toString()
}
</script>
