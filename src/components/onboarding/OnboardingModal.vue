<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="handleBackdropClick">
        <div class="flex items-center justify-center min-h-screen px-4 py-8">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-gray-900 opacity-75" @click="handleBackdropClick"></div>

          <!-- Modal -->
          <div
            class="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all"
          >
            <!-- Progress bar -->
            <div class="flex justify-between px-8 pt-6 pb-4">
              <div v-for="i in 3" :key="i" class="flex-1 mx-1">
                <div
                  :class="[
                    'h-1.5 rounded-full transition-all duration-300',
                    currentStep >= i ? 'bg-purple-600' : 'bg-gray-200',
                  ]"
                ></div>
              </div>
            </div>

            <!-- Content -->
            <div class="px-8 pb-8">
              <!-- Étape 1 : Bienvenue -->
              <div v-if="currentStep === 1" class="text-center">
                <div class="text-6xl mb-4 animate-bounce">👋</div>
                <h2 class="text-3xl font-bold mb-4 text-gray-900">
                  {{ t('onboarding.step1.title') }}
                </h2>
                <p
                  class="text-gray-600 mb-6 text-lg leading-relaxed"
                  v-html="t('onboarding.step1.description')"
                ></p>

                <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 text-left">
                  <h3 class="font-semibold mb-4 text-gray-900 flex items-center">
                    <svg
                      class="w-5 h-5 mr-2 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fill-rule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ t('onboarding.step1.howTitle') }}
                  </h3>
                  <ol class="space-y-3 text-sm text-gray-700">
                    <li class="flex items-start">
                      <span class="font-bold text-purple-600 mr-3 text-lg">1</span>
                      <span v-html="t('onboarding.step1.how1')"></span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-purple-600 mr-3 text-lg">2</span>
                      <span v-html="t('onboarding.step1.how2')"></span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-purple-600 mr-3 text-lg">3</span>
                      <span v-html="t('onboarding.step1.how3')"></span>
                    </li>
                    <li class="flex items-start">
                      <span class="font-bold text-purple-600 mr-3 text-lg">4</span>
                      <span v-html="t('onboarding.step1.how4')"></span>
                    </li>
                  </ol>
                </div>

                <div class="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <svg class="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ t('onboarding.step1.freeAlpha') }}</span>
                </div>
              </div>

              <!-- Étape 2 : Système de points -->
              <div v-if="currentStep === 2" class="text-center">
                <div class="text-6xl mb-4">⭐</div>
                <h2 class="text-3xl font-bold mb-4 text-gray-900">
                  {{ t('onboarding.step2.title') }}
                </h2>
                <p class="text-gray-600 mb-6 text-lg leading-relaxed">
                  <span v-html="t('onboarding.step2.description')"></span><br />
                  <span class="text-sm text-gray-500">{{ t('onboarding.step2.optional') }}</span>
                </p>

                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div
                    class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 hover:scale-105 transition-transform"
                  >
                    <div class="text-3xl font-bold text-green-700 mb-1">+50</div>
                    <div class="text-sm font-medium text-green-900">
                      {{ t('onboarding.step2.saving') }}
                    </div>
                    <div class="text-xs text-green-700 mt-1">
                      {{ t('onboarding.step2.savingDesc') }}
                    </div>
                  </div>

                  <div
                    class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 hover:scale-105 transition-transform"
                  >
                    <div class="text-3xl font-bold text-blue-700 mb-1">+30</div>
                    <div class="text-sm font-medium text-blue-900">
                      {{ t('onboarding.step2.goalReached') }}
                    </div>
                    <div class="text-xs text-blue-700 mt-1">
                      {{ t('onboarding.step2.goalDesc') }}
                    </div>
                  </div>

                  <div
                    class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 hover:scale-105 transition-transform"
                  >
                    <div class="text-3xl font-bold text-purple-700 mb-1">+20</div>
                    <div class="text-sm font-medium text-purple-900">
                      {{ t('onboarding.step2.streak') }}
                    </div>
                    <div class="text-xs text-purple-700 mt-1">
                      {{ t('onboarding.step2.streakDesc') }}
                    </div>
                  </div>

                  <div
                    class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 hover:scale-105 transition-transform"
                  >
                    <div class="text-3xl font-bold text-yellow-700 mb-1">+100</div>
                    <div class="text-sm font-medium text-yellow-900">
                      {{ t('onboarding.step2.challenge') }}
                    </div>
                    <div class="text-xs text-yellow-700 mt-1">
                      {{ t('onboarding.step2.challengeDesc') }}
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4">
                  <div class="flex items-start space-x-3">
                    <svg
                      class="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <div class="text-left">
                      <div class="font-semibold text-sm text-gray-900 mb-1">
                        {{ t('onboarding.step2.secretTitle') }}
                      </div>
                      <div
                        class="text-sm text-gray-700"
                        v-html="t('onboarding.step2.secretDesc')"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Étape 3 : Sécurité -->
              <div v-if="currentStep === 3" class="text-center">
                <div class="text-6xl mb-4">🔒</div>
                <h2 class="text-3xl font-bold mb-4 text-gray-900">
                  {{ t('onboarding.step3.title') }}
                </h2>
                <p
                  class="text-gray-600 mb-6 text-lg leading-relaxed"
                  v-html="t('onboarding.step3.description')"
                ></p>

                <div class="space-y-3 text-left mb-6">
                  <div
                    v-for="item in securityItems"
                    :key="item.key"
                    :class="['flex items-start space-x-3 rounded-xl p-4 border', item.classes]"
                  >
                    <svg
                      :class="['w-6 h-6 flex-shrink-0', item.iconClass]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <div>
                      <div class="font-semibold text-sm text-gray-900">
                        {{ t(`onboarding.step3.${item.key}Title`) }}
                      </div>
                      <div class="text-xs text-gray-600 mt-1">
                        {{ t(`onboarding.step3.${item.key}Desc`) }}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="bg-gray-100 rounded-xl p-4 text-sm text-gray-600"
                  v-html="t('onboarding.step3.gdpr')"
                ></div>
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
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>{{ t('common.back') }}</span>
              </button>
              <div v-else></div>

              <button
                @click="nextStep"
                class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-lg text-white font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
              >
                <span>{{ currentStep < 3 ? t('common.next') : t('onboarding.startBtn') }}</span>
                <svg
                  v-if="currentStep < 3"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <!-- Skip button -->
            <button
              @click="skip"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              :title="t('onboarding.skipTitle')"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const currentStep = ref(1)

/**
 * Items sécurité (Étape 3) — données séparées
 * École 42: Pas de répétition dans le template
 */
const securityItems = [
  { key: 'certified', classes: 'bg-green-50 border-green-200', iconClass: 'text-green-600' },
  { key: 'readOnly', classes: 'bg-blue-50 border-blue-200', iconClass: 'text-blue-600' },
  { key: 'noStorage', classes: 'bg-purple-50 border-purple-200', iconClass: 'text-purple-600' },
  { key: 'disconnect', classes: 'bg-yellow-50 border-yellow-200', iconClass: 'text-yellow-600' },
]

function nextStep(): void {
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    finishOnboarding()
  }
}

function previousStep(): void {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function skip(): void {
  finishOnboarding()
}

function handleBackdropClick(): void {
  // Empêche la fermeture accidentelle
}

function finishOnboarding(): void {
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
