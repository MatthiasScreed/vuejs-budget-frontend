<template name="ValidationMessages.vue">
  <div class="validation-messages-container">
    <!-- Individual Field Errors -->
    <transition-group
      name="error-message"
      tag="div"
      class="space-y-2"
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform translate-x-4"
      enter-to-class="opacity-100 transform translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-x-0"
      leave-to-class="opacity-0 transform -translate-x-4"
    >
      <div
        v-for="(error, field) in errors"
        :key="field"
        class="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg"
      >
        <div class="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
          <svg class="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-800">{{ getFieldLabel(field) }}</p>
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
        <button
          @click="clearFieldError(field)"
          class="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition-group>

    <!-- Success Message -->
    <transition
      name="success-message"
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 transform translate-y-4 scale-95"
      enter-to-class="opacity-100 transform translate-y-0 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 transform translate-y-0 scale-100"
      leave-to-class="opacity-0 transform translate-y-4 scale-95"
    >
      <div
        v-if="successMessage"
        class="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg"
      >
        <div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-green-800">Succès</p>
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
        <button
          @click="clearSuccess"
          class="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition>

    <!-- Warning Message -->
    <transition
      name="warning-message"
      enter-active-class="transition-all duration-400 ease-out"
      enter-from-class="opacity-0 transform translate-x-4"
      enter-to-class="opacity-100 transform translate-x-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 transform translate-x-0"
      leave-to-class="opacity-0 transform -translate-x-4"
    >
      <div
        v-if="warningMessage"
        class="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
      >
        <div class="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-yellow-800">Attention</p>
          <p class="text-sm text-yellow-700">{{ warningMessage }}</p>
        </div>
        <button
          @click="clearWarning"
          class="flex-shrink-0 text-yellow-400 hover:text-yellow-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>
