<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="handleBackdropClick">
        <div class="flex items-center justify-center min-h-screen px-4 py-8">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-gray-900 opacity-75" @click="handleBackdropClick"></div>

          <!-- Modal -->
          <div class="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all">
            <!-- Progress bar -->
            <div class="flex justify-between px-8 pt-6 pb-4">
              <div v-for="i in 3" :key="i" class="flex-1 mx-1">
                <div :class="[
                  'h-1.5 rounded-full transition-all duration-300',
                  currentStep >= i ? 'bg-purple-600' : 'bg-gray-200'
                ]"></div>
              </div>
            </div>

            <!-- Content -->
            <div class="px-8 pb-8">
              <!-- Étape 1 : Bienvenue -->
              <div v-if="currentStep === 1" class="text-center">
                <div class="text-6xl mb-4 animate-bounce">👋</div>
                <h2 class="text-3xl font-bold mb-4 text-gray-900">Bienvenue sur CoinQuest !</h2>
                <p class="text-gray-600 mb-6 text-lg leading-relaxed">
                  CoinQuest est une app de budget <strong>qui te motive</strong> à économiser
                  en transformant la gestion d'argent en aventure progressive.
                </p>

                <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 text-left">
                  <h3 class="font-semibold mb-4 text-gray-900 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                    </svg>
                    Comment ça marche ?
                  </h3>
                  <ol class="space-y-3 text-sm text-gray-700">
                    <li class="flex items-start">
                      <span class="font-bold text-purple-600 mr-3 text-lg">1</span>
                      <span><strong>Tu connectes ta banque</strong> (sécurisé et automatique)</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-purple-600 mr-3 text-lg">2</span>
                      <span><strong>Tu définis tes objectifs</strong> (voyage, appart, voiture...)</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-purple-600 mr-3 text-lg">3</span>
                      <span><strong>L'app calcule ta capacité d'épargne</strong> automatiquement</span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-purple-600 mr-3 text-lg">4</span>
                      <span><strong>Tu gagnes des points</strong> à chaque progrès 🎯</span>
                    </li>
                  </ol>
                </div>

                <div class="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <svg class="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Gratuit pendant la phase alpha</span>
                </div>
              </div>

              <!-- Étape 2 : Système de points expliqué simplement -->
              <div v-if="currentStep === 2" class="text-center">
                <div class="text-6xl mb-4">⭐</div>
                <h2 class="text-3xl font-bold mb-4 text-gray-900">Pourquoi des points ?</h2>
                <p class="text-gray-600 mb-6 text-lg leading-relaxed">
                  Parce que <strong>voir sa progression</strong> rend plus motivant d'économiser !<br/>
                  <span class="text-sm text-gray-500">(C'est 100% optionnel, tu peux les ignorer)</span>
                </p>

                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 hover:scale-105 transition-transform">
                    <div class="text-3xl font-bold text-green-700 mb-1">+50</div>
                    <div class="text-sm font-medium text-green-900">Économie réalisée</div>
                    <div class="text-xs text-green-700 mt-1">Chaque progrès compte</div>
                  </div>

                  <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 hover:scale-105 transition-transform">
                    <div class="text-3xl font-bold text-blue-700 mb-1">+30</div>
                    <div class="text-sm font-medium text-blue-900">Objectif atteint</div>
                    <div class="text-xs text-blue-700 mt-1">Célèbre tes victoires</div>
                  </div>

                  <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 hover:scale-105 transition-transform">
                    <div class="text-3xl font-bold text-purple-700 mb-1">+20</div>
                    <div class="text-sm font-medium text-purple-900">Série de 7 jours</div>
                    <div class="text-xs text-purple-700 mt-1">La régularité paie</div>
                  </div>

                  <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 hover:scale-105 transition-transform">
                    <div class="text-3xl font-bold text-yellow-700 mb-1">+100</div>
                    <div class="text-sm font-medium text-yellow-900">Défi complété</div>
                    <div class="text-xs text-yellow-700 mt-1">Challenges hebdo</div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4">
                  <div class="flex items-start space-x-3">
                    <svg class="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    <div class="text-left">
                      <div class="font-semibold text-sm text-gray-900 mb-1">💡 Le secret</div>
                      <div class="text-sm text-gray-700">
                        Plus tu accumules de points, plus tu débloques de badges et fonctionnalités.
                        <strong>C'est optionnel</strong>, mais ça rend le budget moins ennuyeux !
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Étape 3 : Sécurité et confiance -->
              <div v-if="currentStep === 3" class="text-center">
                <div class="text-6xl mb-4">🔒</div>
                <h2 class="text-3xl font-bold mb-4 text-gray-900">Tes données sont 100% sécurisées</h2>
                <p class="text-gray-600 mb-6 text-lg leading-relaxed">
                  CoinQuest utilise <strong>Bridge</strong>, le même système que les banques
                  européennes pour connecter tes comptes en toute sécurité.
                </p>

                <div class="space-y-3 text-left mb-6">
                  <div class="flex items-start space-x-3 bg-green-50 rounded-xl p-4 border border-green-200">
                    <svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                      <div class="font-semibold text-sm text-gray-900">Connexion bancaire européenne certifiée</div>
                      <div class="text-xs text-gray-600 mt-1">Conforme PSD2, comme ton application bancaire officielle</div>
                    </div>
                  </div>

                  <div class="flex items-start space-x-3 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <svg class="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                      <div class="font-semibold text-sm text-gray-900">Accès lecture seule</div>
                      <div class="text-xs text-gray-600 mt-1">On ne peut pas faire de virements, juste consulter tes transactions</div>
                    </div>
                  </div>

                  <div class="flex items-start space-x-3 bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <svg class="w-6 h-6 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                      <div class="font-semibold text-sm text-gray-900">Tes identifiants JAMAIS stockés</div>
                      <div class="text-xs text-gray-600 mt-1">Authentification directe avec ta banque, zéro stockage chez nous</div>
                    </div>
                  </div>

                  <div class="flex items-start space-x-3 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <svg class="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                      <div class="font-semibold text-sm text-gray-900">Tu peux déconnecter à tout moment</div>
                      <div class="text-xs text-gray-600 mt-1">Tu gardes le contrôle total de tes données, toujours</div>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-100 rounded-xl p-4 text-sm text-gray-600">
                  <strong>🛡️ Conforme RGPD :</strong> Tes données restent en Europe, chiffrées de bout en bout
                </div>
              </div>
            </div>

            <!-- Navigation buttons -->
            <div class="flex justify-between items-center px-8 pb-6">
              <button
                v-if="currentStep > 1"
                @click="previousStep"
                class="text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-2 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span>Retour</span>
              </button>
              <div v-else></div>

              <button
                @click="nextStep"
                class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-lg text-white font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
              >
                <span>{{ currentStep < 3 ? 'Suivant' : '🚀 Commencer !' }}</span>
                <svg v-if="currentStep < 3" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <!-- Skip button -->
            <button
              @click="skip"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              title="Passer le tutoriel"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const currentStep = ref(1)

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    finishOnboarding()
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const skip = () => {
  finishOnboarding()
}

const handleBackdropClick = () => {
  // Ne rien faire - empêche la fermeture accidentelle
}

const finishOnboarding = () => {
  localStorage.setItem('onboarding_completed', 'true')
  emit('close')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}

@media (max-width: 640px) {
  .text-3xl {
    font-size: 1.5rem;
  }

  .text-lg {
    font-size: 1rem;
  }

  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
