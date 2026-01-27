<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl transform transition-all"
          >
            <!-- Header -->
            <div class="relative bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 rounded-t-2xl">
              <button
                @click="handleClose"
                class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                  {{ currentStep.icon }}
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">{{ currentStep.title }}</h2>
                  <p class="text-white/80 text-sm">Étape {{ currentStepIndex + 1 }} sur {{ steps.length }}</p>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="px-8 py-6 max-h-[60vh] overflow-y-auto">
              <div v-html="currentStep.content" class="prose prose-purple max-w-none"></div>

              <!-- Examples if present -->
              <div v-if="currentStep.examples" class="mt-6 space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ currentStep.examplesTitle || 'Exemples' }}</h3>
                <div
                  v-for="(example, index) in currentStep.examples"
                  :key="index"
                  class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200"
                >
                  <div class="flex items-start gap-3">
                    <div class="text-2xl">{{ example.icon }}</div>
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 mb-1">{{ example.title }}</h4>
                      <p class="text-gray-600 text-sm mb-2">{{ example.description }}</p>
                      <div v-if="example.details" class="text-xs text-gray-500 space-y-1">
                        <div v-for="(detail, i) in example.details" :key="i">
                          • {{ detail }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tips if present -->
              <div v-if="currentStep.tips" class="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div class="flex items-start gap-3">
                  <span class="text-2xl">💡</span>
                  <div>
                    <h4 class="font-semibold text-amber-900 mb-2">Astuce</h4>
                    <ul class="text-sm text-amber-800 space-y-1">
                      <li v-for="(tip, index) in currentStep.tips" :key="index">{{ tip }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-8 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
              <div class="flex items-center justify-between">
                <!-- Progress -->
                <div class="flex gap-2">
                  <div
                    v-for="(step, index) in steps"
                    :key="index"
                    class="w-2 h-2 rounded-full transition-all"
                    :class="index === currentStepIndex ? 'bg-purple-600 w-8' : index < currentStepIndex ? 'bg-purple-300' : 'bg-gray-300'"
                  />
                </div>

                <!-- Navigation -->
                <div class="flex gap-3">
                  <button
                    v-if="currentStepIndex > 0"
                    @click="previousStep"
                    class="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Précédent
                  </button>

                  <button
                    v-if="!isLastStep"
                    @click="nextStep"
                    class="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Suivant
                  </button>

                  <button
                    v-else
                    @click="handleFinish"
                    class="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Commencer !
                  </button>
                </div>
              </div>

              <!-- Skip option -->
              <div class="mt-3 text-center">
                <button
                  @click="handleSkip"
                  class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Ne plus afficher ce tutoriel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface TutorialExample {
  icon: string
  title: string
  description: string
  details?: string[]
}

interface TutorialStep {
  icon: string
  title: string
  content: string
  examples?: TutorialExample[]
  examplesTitle?: string
  tips?: string[]
}

interface Props {
  modelValue: boolean
  steps: TutorialStep[]
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  storageKey: 'tutorial_seen'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'finish': []
  'skip': []
}>()

const currentStepIndex = ref(0)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentStep = computed(() => props.steps[currentStepIndex.value])
const isLastStep = computed(() => currentStepIndex.value === props.steps.length - 1)

function nextStep() {
  if (!isLastStep.value) {
    currentStepIndex.value++
  }
}

function previousStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

function handleClose() {
  isOpen.value = false
  currentStepIndex.value = 0
}

function handleFinish() {
  emit('finish')
  handleClose()
}

function handleSkip() {
  if (props.storageKey) {
    localStorage.setItem(props.storageKey, 'true')
  }
  emit('skip')
  handleClose()
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

.modal-enter-active .transform,
.modal-leave-active .transform {
  transition: transform 0.3s ease;
}

.modal-enter-from .transform,
.modal-leave-to .transform {
  transform: scale(0.95);
}

.prose {
  color: #374151;
}

.prose h3 {
  color: #111827;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.prose ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose strong {
  color: #7c3aed;
  font-weight: 600;
}
</style>
