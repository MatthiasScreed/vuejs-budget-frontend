<template name="FormProgress.vue">
  <div class="form-progress-container">
    <!-- Progress Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <span class="text-sm font-medium text-gray-700">Progression du formulaire</span>
        <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {{ currentStep }}/{{ totalSteps }}
        </div>
      </div>
      <div class="text-sm font-semibold text-purple-600">{{ progressPercentage }}%</div>
    </div>

    <!-- Progress Bar -->
    <div class="relative">
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>

      <!-- Step Indicators -->
      <div class="absolute top-0 left-0 w-full h-2 flex justify-between">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="relative"
          :style="{ left: (index / (totalSteps - 1)) * 100 + '%' }"
        >
          <div
            class="absolute -top-1 -left-1 w-4 h-4 rounded-full border-2 border-white transition-all duration-300"
            :class="[
            index < currentStep
              ? 'bg-purple-500'
              : index === currentStep - 1
              ? 'bg-purple-400'
              : 'bg-gray-300'
          ]"
          >
            <div
              v-if="index < currentStep - 1"
              class="absolute inset-1 bg-white rounded-full flex items-center justify-center"
            >
              <svg class="w-2 h-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Step Label -->
          <div
            v-if="showLabels && step.label"
            class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap"
          >
            {{ step.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Current Step Info -->
    <div v-if="showCurrentStep && steps[currentStep - 1]" class="mt-4 text-center">
      <h3 class="text-lg font-semibold text-gray-900">{{ steps[currentStep - 1].title }}</h3>
      <p v-if="steps[currentStep - 1].description" class="text-sm text-gray-600 mt-1">
        {{ steps[currentStep - 1].description }}
      </p>
    </div>

    <!-- Validation Status -->
    <div v-if="showValidation" class="mt-4">
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div class="flex items-center space-x-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="validFields > 0 ? 'bg-green-500' : 'bg-gray-300'"
          ></div>
          <span class="text-gray-600">{{ validFields }} champs valides</span>
        </div>
        <div class="flex items-center space-x-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="invalidFields > 0 ? 'bg-red-500' : 'bg-gray-300'"
          ></div>
          <span class="text-gray-600">{{ invalidFields }} champs à corriger</span>
        </div>
      </div>
    </div>

    <!-- Estimated Time -->
    <div v-if="showEstimatedTime && estimatedTimeRemaining" class="mt-3 text-center">
      <div class="text-xs text-gray-500 flex items-center justify-center space-x-1">
        <span>⏱️</span>
        <span>Temps estimé restant: {{ estimatedTimeRemaining }}</span>
      </div>
    </div>
  </div>
</template>
