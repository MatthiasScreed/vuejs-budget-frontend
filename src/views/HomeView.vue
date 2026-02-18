<template>
  <main class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Welcome Section -->
    <div class="relative">
      <!-- Background avec particules -->
      <div class="particles-bg absolute inset-0"></div>

      <!-- Header avec logo -->
      <header class="relative z-10 pt-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="flex items-center justify-center mb-8">
            <div
              class="bg-gaming-gradient w-16 h-16 rounded-xl flex items-center justify-center mr-4 shadow-gaming"
            >
              <img src="@/assets/images/logo/logo.svg" alt="CoinQuest Logo" class="w-8 h-8" />
            </div>
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900">
              {{ t('homeView.welcomeTitle') }}
              <span class="text-transparent bg-clip-text bg-gaming-gradient">CoinQuest</span>
            </h1>
          </div>

          <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {{ t('homeView.welcomeSubtitle') }}
          </p>
        </div>
      </header>

      <!-- Welcome Component Container -->
      <div class="relative z-10 pb-20">
        <CoinQuestWelcome />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import CoinQuestWelcome from '@/components/CoinQuestWelcome.vue'

const { t } = useI18n()

document.title = t('homeView.pageTitle')

onMounted(() => {
  console.log('🎮 CoinQuest home loaded')
})
</script>

<style scoped>
.particles-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  animation: particlesFloat 20s ease-in-out infinite;
  z-index: 0;
}

@keyframes particlesFloat {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.6;
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
    opacity: 0.8;
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
    opacity: 0.7;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

main {
  animation: fadeInUp 0.8s ease-out;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }
  .particles-bg::before {
    animation-duration: 15s;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2rem;
  }
}
</style>
