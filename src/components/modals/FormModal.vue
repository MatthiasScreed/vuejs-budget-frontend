<template name="FormModal.vue">
  <div class="form-modal-overlay">
    <!-- Background Overlay -->
    <transition
      name="modal-backdrop"
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="closeOnBackdrop && $emit('close')"
      ></div>
    </transition>

    <!-- Modal Content -->
    <transition
      name="modal-content"
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform scale-95 translate-y-4"
      enter-to-class="opacity-100 transform scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform scale-100 translate-y-0"
      leave-to-class="opacity-0 transform scale-95 translate-y-4"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        :class="modalClasses"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative w-full bg-white rounded-2xl shadow-2xl"
            :class="sizeClasses"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
          >
            <!-- Header -->
            <div v-if="!hideHeader" class="flex items-center justify-between p-6 border-b border-gray-200">
              <div class="flex items-center space-x-3">
                <div v-if="icon" class="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span class="text-xl">{{ icon }}</span>
                </div>
                <div>
                  <h2 :id="titleId" class="text-xl font-semibold text-gray-900">
                    {{ title }}
                  </h2>
                  <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
                </div>
              </div>

              <button
                v-if="closable"
                @click="$emit('close')"
                class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1"
                aria-label="Fermer"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="relative">
              <!-- Loading Overlay -->
              <div
                v-if="loading"
                class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
              >
                <div class="flex items-center space-x-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <span class="text-sm text-gray-600">{{ loadingText }}</span>
                </div>
              </div>

              <!-- Main Content -->
              <div :class="contentClasses">
                <slot />
              </div>
            </div>

            <!-- Footer -->
            <div v-if="!hideFooter" class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <slot name="footer-left">
                <div></div>
              </slot>

              <div class="flex items-center space-x-3">
                <slot name="footer-actions">
                  <button
                    v-if="showCancel"
                    @click="$emit('cancel')"
                    :disabled="loading"
                    class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ cancelText }}
                  </button>
                  <button
                    v-if="showConfirm"
                    @click="$emit('confirm')"
                    :disabled="loading || !canConfirm"
                    class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    :class="confirmButtonClass"
                  >
                    <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{{ confirmText }}</span>
                  </button>
                </slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
