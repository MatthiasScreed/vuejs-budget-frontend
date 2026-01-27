<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Animation d'erreur -->
      <div class="text-center mb-8">
        <div class="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>

        <div class="text-6xl mb-4">😞</div>

        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Connexion échouée
        </h1>

        <p class="text-gray-600 text-lg">
          Impossible de connecter votre compte bancaire
        </p>
      </div>

      <!-- Carte d'erreur détaillée -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-red-900">Détails de l'erreur</h3>
        </div>

        <div class="space-y-3">
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-800 font-medium">{{ errorDetails.title || 'Erreur de connexion' }}</p>
            <p class="text-red-600 text-sm mt-1">
              {{ errorDetails.message || 'Une erreur est survenue lors de la connexion à votre banque.' }}
            </p>
          </div>

          <div v-if="errorDetails.code" class="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
            Code erreur: {{ errorDetails.code }}
          </div>
        </div>
      </div>

      <!-- Causes possibles et solutions -->
      <div class="bg-yellow-50 rounded-xl p-4 mb-6">
        <h4 class="font-semibold text-yellow-900 mb-3 flex items-center">
          💡 Causes possibles
        </h4>
        <ul class="text-yellow-800 text-sm space-y-1">
          <li v-for="cause in possibleCauses" :key="cause" class="flex items-start">
            <span class="text-yellow-600 mr-2">•</span>
            <span>{{ cause }}</span>
          </li>
        </ul>
      </div>

      <!-- Actions de récupération -->
      <div class="space-y-3">
        <button
          @click="retryConnection"
          :disabled="retrying"
          class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg v-if="retrying" class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ retrying ? 'Nouvelle tentative...' : '🔄 Réessayer' }}</span>
        </button>

        <router-link
          to="/banking"
          class="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-600 transition-colors duration-200 flex items-center justify-center group"
        >
          <span>🏦 Essayer avec une autre banque</span>
          <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
        </router-link>

        <button
          @click="showSupportModal = true"
          class="w-full bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center"
        >
          <span>💬 Contacter le support</span>
        </button>

        <router-link
          to="/dashboard"
          class="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
        >
          <span>← Retour au dashboard</span>
        </router-link>
      </div>

      <!-- Alternative suggestion -->
      <div class="mt-8 bg-blue-50 rounded-xl p-4">
        <h4 class="font-semibold text-blue-900 mb-2 flex items-center">
          💡 Alternative
        </h4>
        <p class="text-blue-700 text-sm mb-3">
          En attendant de résoudre ce problème, vous pouvez continuer à utiliser l'application en saisissant vos transactions manuellement.
        </p>
        <router-link
          to="/transactions"
          class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Ajouter une transaction manuelle
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Modal Support -->
    <div v-if="showSupportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">Contacter le support</h3>
          <button
            @click="showSupportModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Décrivez votre problème
            </label>
            <textarea
              v-model="supportMessage"
              rows="4"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Expliquez ce qui s'est passé..."
            ></textarea>
          </div>

          <div class="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <p class="font-medium mb-1">Informations techniques (envoyées automatiquement) :</p>
            <p>• Code erreur : {{ errorDetails.code || 'N/A' }}</p>
            <p>• Provider : {{ errorDetails.provider || 'N/A' }}</p>
            <p>• Timestamp : {{ new Date().toISOString() }}</p>
          </div>

          <div class="flex space-x-3">
            <button
              @click="showSupportModal = false"
              class="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              @click="sendSupportRequest"
              :disabled="!supportMessage.trim() || sendingSupport"
              class="flex-1 bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ sendingSupport ? 'Envoi...' : 'Envoyer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { bankService } from '@/services/bankService'

// Composition
const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const retrying = ref(false)
const showSupportModal = ref(false)
const supportMessage = ref('')
const sendingSupport = ref(false)

const errorDetails = ref({
  title: '',
  message: '',
  code: '',
  provider: '',
  timestamp: ''
})

// Computed
const possibleCauses = computed(() => {
  const causes = [
    'Identifiants bancaires incorrects',
    'Compte temporairement verrouillé',
    'Maintenance de votre banque',
    'Problème de réseau temporaire'
  ]

  // Ajouter des causes spécifiques selon le type d'erreur
  if (errorDetails.value.code?.includes('auth')) {
    causes.unshift('Double authentification requise')
  }

  if (errorDetails.value.code?.includes('timeout')) {
    causes.unshift('Délai de connexion dépassé')
  }

  return causes.slice(0, 4) // Limiter à 4 causes
})

// Lifecycle
onMounted(() => {
  initializeError()
})

// Methods
function initializeError() {
  // Récupérer les détails d'erreur depuis l'URL
  const error = route.query.error as string
  const errorCode = route.query.error_code as string
  const provider = route.query.provider as string

  // Mapper les codes d'erreur vers des messages utilisateur-friendly
  const errorMessages = {
    'auth_failed': {
      title: 'Authentification échouée',
      message: 'Vos identifiants bancaires semblent incorrects. Veuillez vérifier et réessayer.'
    },
    'bank_maintenance': {
      title: 'Maintenance bancaire',
      message: 'Votre banque effectue actuellement une maintenance. Réessayez dans quelques heures.'
    },
    'timeout': {
      title: 'Délai dépassé',
      message: 'La connexion a pris trop de temps. Vérifiez votre connexion internet et réessayez.'
    },
    'unsupported_bank': {
      title: 'Banque non supportée',
      message: 'Cette banque n\'est pas encore supportée par notre système.'
    },
    'user_cancelled': {
      title: 'Connexion annulée',
      message: 'Vous avez annulé la connexion bancaire.'
    },
    'technical_error': {
      title: 'Erreur technique',
      message: 'Une erreur technique est survenue. Notre équipe en a été informée.'
    }
  }

  errorDetails.value = {
    ...errorMessages[errorCode] || errorMessages['technical_error'],
    code: errorCode || 'unknown',
    provider: provider || 'unknown',
    timestamp: new Date().toISOString()
  }

  // Toast d'erreur
  toast.error(`❌ ${errorDetails.value.title}`, {
    timeout: 5000
  })
}

async function retryConnection() {
  retrying.value = true

  try {
    // Attendre un peu pour montrer l'état de chargement
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Rediriger vers la page de connexion bancaire pour réessayer
    router.push('/banking')

    toast.info('Prêt pour une nouvelle tentative de connexion')

  } catch (error) {
    toast.error('Impossible de relancer la connexion')
  } finally {
    retrying.value = false
  }
}

async function sendSupportRequest() {
  if (!supportMessage.value.trim()) return

  sendingSupport.value = true

  try {
    // Simuler l'envoi du support request
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Dans un vrai projet, appel API :
    // await supportService.createTicket({
    //   message: supportMessage.value,
    //   error_details: errorDetails.value,
    //   user_agent: navigator.userAgent,
    //   url: window.location.href
    // })

    toast.success('✅ Demande de support envoyée ! Nous vous contacterons rapidement.')

    showSupportModal.value = false
    supportMessage.value = ''

    // Rediriger vers le dashboard après envoi
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)

  } catch (error) {
    toast.error('Erreur lors de l\'envoi du support')
  } finally {
    sendingSupport.value = false
  }
}
</script>

<style scoped>
/* Animation shake pour l'erreur */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Animation fade pour le modal */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
