// src/composables/useLazyImage.ts

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable pour lazy loading d'images
 * École 42: Composable réutilisable
 */
export function useLazyImage(imageSrc: string) {
  const isLoaded = ref(false)
  const hasError = ref(false)
  const observer = ref<IntersectionObserver | null>(null)

  const loadImage = (): void => {
    const img = new Image()

    img.onload = () => {
      isLoaded.value = true
    }

    img.onerror = () => {
      hasError.value = true
    }

    img.src = imageSrc
  }

  const setupObserver = (element: HTMLElement): void => {
    observer.value = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoaded.value) {
          loadImage()
          observer.value?.disconnect()
        }
      })
    })

    observer.value.observe(element)
  }

  onUnmounted(() => {
    observer.value?.disconnect()
  })

  return {
    isLoaded,
    hasError,
    setupObserver,
  }
}
