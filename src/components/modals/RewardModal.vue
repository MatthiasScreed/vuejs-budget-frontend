<template name="RewardModal.vue">
  <div class="reward-modal-overlay">
    <transition
      name="reward-modal"
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 transform scale-50 rotate-180"
      enter-to-class="opacity-100 transform scale-100 rotate-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 transform scale-100 rotate-0"
      leave-to-class="opacity-0 transform scale-95"
    >
      <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div class="relative max-w-lg w-full mx-4">
          <!-- Confetti Animation -->
          <div class="absolute inset-0 pointer-events-none">
            <div
              v-for="i in 20"
              :key="i"
              class="absolute animate-bounce"
              :style="confettiStyle(i)"
            >
              {{ confettiEmojis[i % confettiEmojis.length] }}
            </div>
          </div>

          <!-- Modal Content -->
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden relative">
            <!-- Header with gradient -->
            <div class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-8 text-center text-white relative overflow-hidden">
              <!-- Animated background pattern -->
              <div class="absolute inset-0 opacity-20">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform skew-x-12 animate-pulse"></div>
              </div>

              <div class="relative z-10">
                <div class="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse">
                  <span class="text-4xl">{{ mainIcon }}</span>
                </div>
                <h2 class="text-3xl font-bold mb-2">{{ title }}</h2>
                <p class="text-orange-100">{{ subtitle }}</p>
              </div>
            </div>

            <!-- Rewards Content -->
            <div class="p-8">
              <!-- XP Gained -->
              <div v-if="xpGained > 0" class="text-center mb-6">
                <div class="inline-flex items-center space-x-3 bg-purple-100 text-purple-800 px-6 py-3 rounded-full">
                  <span class="text-2xl animate-bounce">⚡</span>
                  <div>
                    <span class="text-lg font-bold">+{{ xpGained }} XP</span>
                    <p class="text-sm">Points d'expérience gagnés</p>
                  </div>
                </div>
              </div>

              <!-- Level Up -->
              <div v-if="levelUp" class="text-center mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <div class="animate-bounce mb-2">
                  <span class="text-4xl">🎉</span>
                </div>
                <h3 class="text-xl font-bold text-purple-800 mb-2">Niveau supérieur atteint !</h3>
                <div class="flex items-center justify-center space-x-2 text-purple-700">
                  <span class="text-lg">⭐</span>
                  <span class="text-lg font-semibold">Niveau {{ newLevel }}</span>
                </div>
                <p class="text-sm text-purple-600 mt-1">{{ levelUpMessage }}</p>
              </div>

              <!-- Achievements -->
              <div v-if="achievements.length > 0" class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">
                  🏆 Succès débloqués
                </h3>
                <div class="space-y-3">
                  <div
                    v-for="achievement in achievements"
                    :key="achievement.id"
                    class="flex items-center space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl animate-pulse"
                  >
                    <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span class="text-2xl">{{ achievement.icon }}</span>
                    </div>
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900">{{ achievement.name }}</h4>
                      <p class="text-sm text-gray-600">{{ achievement.description }}</p>
                      <div class="flex items-center space-x-2 mt-1">
                      <span class="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                        {{ achievement.category }}
                      </span>
                        <span class="text-xs text-gray-500">+{{ achievement.xp_reward }} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Challenge Progress -->
              <div v-if="challengeProgress" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 class="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Progrès du défi</span>
                </h3>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-blue-700">{{ challengeProgress.name }}</span>
                    <span class="font-semibold text-blue-900">{{ challengeProgress.percentage }}%</span>
                  </div>
                  <div class="w-full bg-blue-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      :style="{ width: challengeProgress.percentage + '%' }"
                    ></div>
                  </div>
                  <p class="text-xs text-blue-600">{{ challengeProgress.description }}</p>
                </div>
              </div>

              <!-- Motivational Message -->
              <div class="text-center mb-6">
                <div class="inline-block p-4 bg-gray-50 rounded-xl">
                  <p class="text-lg text-gray-700 font-medium mb-2">{{ motivationalMessage }}</p>
                  <p class="text-sm text-gray-500">{{ encouragementText }}</p>
                </div>
              </div>

              <!-- Social Sharing -->
              <div v-if="showSharing" class="mb-6">
                <h3 class="text-sm font-medium text-gray-700 mb-3 text-center">📤 Partager votre succès</h3>
                <div class="flex justify-center space-x-3">
                  <button
                    @click="shareToSocial('twitter')"
                    class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    🐦
                  </button>
                  <button
                    @click="shareToSocial('facebook')"
                    class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    📘
                  </button>
                  <button
                    @click="copyToClipboard"
                    class="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 px-8 py-6 flex items-center justify-center">
              <button
                @click="close"
                class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>✨</span>
                <span>Continuer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
