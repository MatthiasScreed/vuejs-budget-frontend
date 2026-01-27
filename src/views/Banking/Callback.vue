<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">

      <!-- État de traitement -->
      <div v-if="processing" class="space-y-6">
        <!-- Animation de chargement -->
        <div class="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
          <svg class="animate-spin h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Messages dynamiques -->
        <div class="space-y-3">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ currentStep.title }}
          </h1>
          <p class="text-gray-600">
            {{ currentStep.description }}
          </p>

          <!-- Barre de progression -->
          <div class="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              :style="`width: ${progress}%`"
            ></div>
          </div>

          <p class="text-sm text-gray-500">{{ Math.round(progress) }}% terminé</p>
        </div>

        <!-- Étapes de progression -->
        <div class="bg-white rounded-xl p-4 border border-gray-100">
          <div class="space-y-2">
            <div
              v-for="(step, index) in steps"
              :key="step.key"
              class="flex items-center text-sm"
              :class="{
                'text-green-600': step.completed,
                'text-blue-600': step.active,
                'text-gray-400': !step.completed && !step.active
              }"
            >
              <div class="w-4 h-4 mr-3 flex-shrink-0">
                <svg v-if="step.completed" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else-if="step.active" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div v-else class="w-2 h-2 rounded-full bg-current"></div>
              </div>
              <span>{{ step.label }}</span>
            </div>
          </div>
        </div>

        <!-- Temps estimé -->
        <div class="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          ⏱️ Temps estimé restant : {{ estimatedTime }} secondes
        </div>
      </div>

      <!-- État d'erreur -->
      <div v-else-if="error" class="space-y-6">
        <div class="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.635 0L3.178 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>

        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Erreur de traitement
          </h1>
          <p class="text-gray-600 mb-4">
            {{ error.message }}
          </p>

          <button
            @click="handleError"
            class="bg-red-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retourner à la gestion bancaire
          </button>
        </div>
      </div>

      <!-- Instructions utilisateur si nécessaire -->
      <div v-if="processing && currentStep.requiresUserAction" class="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <div class="flex items-center mb-2">
          <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <h4 class="font-semibold text-yellow-900">Action requise</h4>
        </div>
        <p class="text-yellow-800 text-sm">
          {{ currentStep.userActionMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { bankService } from '@/services/BankService'

// Composition
const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const processing = ref(true)
const error = ref(null)
const currentStepIndex = ref(0)
const estimatedTime = ref(30)
const startTime = ref(Date.now())

// Steps de progression
const steps = ref([
  {
    key: 'validate',
    label: 'Validation des paramètres',
    completed: false,
    active: true
  },
  {
    key: 'authenticate',
    label: 'Authentification bancaire',
    completed: false,
    active: false
  },
  {
    key: 'authorize',
    label: 'Autorisation d\'accès',
    completed: false,
    active: false
  },
  {
    key: 'connect',
    label: 'Établissement de la connexion',
    completed: false,
    active: false
  },
  {
    key: 'sync',
    label: 'Synchronisation initiale',
    completed: false,
    active: false
  }
])

// Timer pour mise à jour du temps estimé
let timeInterval: NodeJS.Timeout | null = null

// Computed
const currentStep = computed(() => {
  const stepMessages = {
    validate: {
      title: 'Validation en cours...',
      description: 'Nous vérifions les informations de connexion.',
      requiresUserAction: false
    },
    authenticate: {
      title: 'Authentification bancaire...',
      description: 'Connexion sécurisée à votre banque.',
      requiresUserAction: false
    },
    authorize: {
      title: 'Autorisation d\'accès...',
      description: 'Votre banque vérifie les autorisations.',
      requiresUserAction: true,
      userActionMessage: 'Vous pourriez recevoir une notification sur votre téléphone pour confirmer l\'accès.'
    },
    connect: {
      title: 'Connexion en cours...',
      description: 'Établissement de la liaison sécurisée.',
      requiresUserAction: false
    },
    sync: {
      title: 'Synchronisation...',
      description: 'Récupération de vos dernières transactions.',
      requiresUserAction: false
    }
  }

  const currentStepKey = steps.value[currentStepIndex.value]?.key || 'validate'
  return stepMessages[currentStepKey]
})

const progress = computed(() => {
  return ((currentStepIndex.value + 1) / steps.value.length) * 100
})

// Lifecycle
onMounted(() => {
  console.log('🏦 Callback bancaire - Début du traitement')
  initializeCallback()
  startProgressTimer()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// Methods
async function initializeCallback() {
  try {
    // Récupérer les paramètres de callback
    const callbackData = {
      item_id: route.query.item_id as string,
      status: route.query.status as string,
      error: route.query.error as string,
      error_code: route.query.error_code as string,
      provider: route.query.provider as string
    }

    console.log('📋 Données callback reçues:', callbackData)

    // Valider les paramètres requis
    if (!callbackData.item_id && !callbackData.error) {
      throw new Error('Paramètres de callback manquants')
    }

    // Traiter selon le statut
    if (callbackData.error || callbackData.status === 'error') {
      await handleCallbackError(callbackData)
    } else {
      await handleCallbackSuccess(callbackData)
    }

  } catch (err) {
    console.error('❌ Erreur callback:', err)
    error.value = {
      message: err.message || 'Erreur de traitement du callback bancaire'
    }
    processing.value = false
  }
}

async function handleCallbackSuccess(data: any) {
  try {
    // Progression étape par étape avec délais réalistes
    await processStep('validate', 1000)
    await processStep('authenticate', 2000)
    await processStep('authorize', 3000)
    await processStep('connect', 2000)
    await processStep('sync', 2000)

    // Finalisation côté API
    console.log('🔄 Finalisation de la connexion bancaire...')

    // Mock API call - sera remplacé par vrai appel
    // await bankService.finalizeConnection(data.item_id)

    // Succès - redirection
    console.log('✅ Connexion bancaire finalisée avec succès')

    router.push({
      path: '/banking/success',
      query: {
        item_id: data.item_id,
        status: 'success',
        provider: data.provider
      }
    })

  } catch (err) {
    console.error('❌ Erreur finalisation:', err)

    router.push({
      path: '/banking/error',
      query: {
        error: 'finalization_failed',
        error_code: 'technical_error',
        provider: data.provider
      }
    })
  }
}

async function handleCallbackError(data: any) {
  console.log('❌ Callback d\'erreur reçu')

  // Redirection vers page d'erreur avec détails
  router.push({
    path: '/banking/error',
    query: {
      error: data.error || 'unknown_error',
      error_code: data.error_code || 'callback_error',
      provider: data.provider || 'unknown'
    }
  })
}

async function processStep(stepKey: string, delay: number) {
  // Trouver l'étape à traiter
  const stepIndex = steps.value.findIndex(s => s.key === stepKey)

  if (stepIndex === -1) return

  // Activer l'étape courante
  steps.value[stepIndex].active = true
  currentStepIndex.value = stepIndex

  // Attendre le délai simulé
  await new Promise(resolve => setTimeout(resolve, delay))

  // Marquer comme complétée
  steps.value[stepIndex].completed = true
  steps.value[stepIndex].active = false

  console.log(`✅ Étape '${stepKey}' terminée`)
}

function handleError() {
  router.push('/banking')
}

function startProgressTimer() {
  timeInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime.value) / 1000
    const totalEstimated = 30 // 30 secondes total estimé

    estimatedTime.value = Math.max(0, totalEstimated - Math.floor(elapsed))

    if (estimatedTime.value === 0 && processing.value) {
      // Si on dépasse le temps estimé, ajuster
      estimatedTime.value = 5
    }
  }, 1000)
}

// Gestion des interruptions utilisateur
window.addEventListener('beforeunload', (e) => {
  if (processing.value) {
    e.preventDefault()
    e.returnValue = 'Le traitement de votre connexion bancaire est en cours. Êtes-vous sûr de vouloir quitter ?'
  }
})
</script>

<style scoped>
/* Animation pour la barre de progression */
.progress-bar {
  transition: width 0.5s ease-in-out;
}

/* Animation pour les étapes */
.step-item {
  transition: color 0.3s ease;
}

/* Pulsation pour l'étape active */
@keyframes pulse-blue {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-blue {
  animation: pulse-blue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
