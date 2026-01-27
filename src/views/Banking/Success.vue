<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Animation de succès -->
      <div class="text-center mb-8">
        <div class="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <div class="text-6xl mb-4 animate-pulse">🎉</div>

        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Connexion réussie !
        </h1>

        <p class="text-gray-600 text-lg">
          Votre compte bancaire a été connecté avec succès
        </p>
      </div>

      <!-- Carte d'information -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
        <!-- Détails de la connexion -->
        <div v-if="connectionDetails" class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Banque connectée</span>
            <span class="font-semibold text-gray-900">{{ connectionDetails.bank_name }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-600">Type de compte</span>
            <span class="font-semibold text-gray-900">{{ formatAccountType(connectionDetails.account_type) }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-600">Provider</span>
            <span class="font-semibold text-gray-900 capitalize">{{ connectionDetails.provider }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-600">Synchronisation</span>
            <span class="text-green-600 font-semibold flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              Activée
            </span>
          </div>
        </div>

        <!-- Loading state -->
        <div v-else class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p class="text-gray-600">Récupération des détails...</p>
        </div>
      </div>

      <!-- Gaming rewards -->
      <div v-if="gamingRewards" class="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-6">
        <h3 class="font-bold text-purple-900 mb-3 flex items-center">
          🎮 Récompenses Gaming
        </h3>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-purple-700">XP gagné</span>
            <span class="font-bold text-purple-900">+{{ gamingRewards.xp_gained }} XP</span>
          </div>
          <div v-if="gamingRewards.achievements_unlocked.length > 0" class="text-sm">
            <span class="text-purple-700">Achievements débloqués:</span>
            <div class="mt-1 flex flex-wrap gap-1">
              <span
                v-for="achievement in gamingRewards.achievements_unlocked"
                :key="achievement.id"
                class="inline-block bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full"
              >
                {{ achievement.icon }} {{ achievement.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <router-link
          to="/banking"
          class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center group"
        >
          <span>🏦 Gérer mes connexions</span>
          <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
        </router-link>

        <button
          @click="startSync"
          :disabled="syncing"
          class="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg v-if="syncing" class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ syncing ? 'Synchronisation...' : '🔄 Synchroniser maintenant' }}</span>
        </button>

        <router-link
          to="/dashboard"
          class="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
        >
          <span>← Retour au dashboard</span>
        </router-link>
      </div>

      <!-- Tips pour l'utilisateur -->
      <div class="mt-8 bg-blue-50 rounded-xl p-4">
        <h4 class="font-semibold text-blue-900 mb-2 flex items-center">
          💡 Conseils
        </h4>
        <ul class="text-blue-700 text-sm space-y-1">
          <li>• La synchronisation se fait automatiquement toutes les 6 heures</li>
          <li>• Vos transactions seront importées et catégorisées par IA</li>
          <li>• Vous gagnerez de l'XP automatiquement pour chaque transaction</li>
          <li>• Vous pouvez déconnecter votre compte à tout moment</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { bankService } from '@/services/bankService'

// Composition
const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const loading = ref(true)
const syncing = ref(false)
const connectionDetails = ref(null)
const gamingRewards = ref(null)

// Lifecycle
onMounted(() => {
  initializeSuccess()
})

// Methods
async function initializeSuccess() {
  try {
    const itemId = route.query.item_id as string
    const status = route.query.status as string

    if (!itemId || status !== 'success') {
      // Rediriger si params invalides
      router.push('/banking')
      return
    }

    // Récupérer les détails de la connexion
    await loadConnectionDetails(itemId)

    // Afficher une notification de succès
    toast.success('🎉 Connexion bancaire établie avec succès !', {
      timeout: 5000
    })

    // Simuler des récompenses gaming
    gamingRewards.value = {
      xp_gained: 100,
      achievements_unlocked: [
        { id: 'first-bank', name: 'Premier Pas Digital', icon: '🏦' }
      ]
    }

  } catch (error) {
    console.error('Erreur initialisation success:', error)
    toast.error('Erreur lors de la récupération des détails')

    // Rediriger vers banking après 3 secondes
    setTimeout(() => {
      router.push('/banking')
    }, 3000)
  } finally {
    loading.value = false
  }
}

async function loadConnectionDetails(itemId: string) {
  try {
    // Mock data pour le moment - sera remplacé par vrai appel API
    connectionDetails.value = {
      bank_name: 'Banque Populaire',
      account_type: 'checking',
      provider: 'bridge',
      connected_at: new Date().toISOString()
    }

    // Appel API réel à implémenter :
    // const response = await bankService.getConnectionDetails(itemId)
    // connectionDetails.value = response.data

  } catch (error) {
    console.error('Erreur chargement détails connexion:', error)
    throw error
  }
}

async function startSync() {
  syncing.value = true

  try {
    // Mock sync - sera remplacé par vrai appel
    await new Promise(resolve => setTimeout(resolve, 2000))

    // const response = await bankService.syncConnection(connectionDetails.value.id)

    toast.success('✅ Synchronisation terminée ! Nouvelles transactions importées.')

    // Rediriger vers banking pour voir les résultats
    setTimeout(() => {
      router.push('/banking/pending')
    }, 1500)

  } catch (error) {
    toast.error('Erreur lors de la synchronisation')
    console.error('Sync error:', error)
  } finally {
    syncing.value = false
  }
}

function formatAccountType(type: string): string {
  const types = {
    'checking': 'Compte courant',
    'savings': 'Compte épargne',
    'credit': 'Compte crédit',
    'investment': 'Compte investissement'
  }
  return types[type] || type
}
</script>

<style scoped>
/* Animations personnalisées */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.5s ease-out;
}

/* Animation de pulsation pour les éléments importants */
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(34, 197, 94, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
  }
}

.animate-glow {
  animation: glow 2s infinite;
}
</style>
