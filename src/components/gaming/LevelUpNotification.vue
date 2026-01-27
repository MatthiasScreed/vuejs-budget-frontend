<template>
  <transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 transform scale-50"
    enter-to-class="opacity-100 transform scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 transform scale-100"
    leave-to-class="opacity-0 transform scale-50"
  >
    <div
      v-if="visible"
      class="level-up-notification bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-2xl p-6 mb-2 max-w-md"
    >
      <div class="text-center">
        <!-- Animation d'étoiles -->
        <div class="relative mb-4">
          <div class="stars-animation">
            <span class="star star-1">⭐</span>
            <span class="star star-2">🌟</span>
            <span class="star star-3">✨</span>
            <span class="star star-4">⭐</span>
            <span class="star star-5">🌟</span>
          </div>

          <!-- Icône principale -->
          <div class="level-icon bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
            <span class="text-3xl">🎉</span>
          </div>
        </div>

        <!-- Contenu principal -->
        <div class="text-white">
          <h2 class="text-2xl font-bold mb-2">
            MONTÉE DE NIVEAU !
          </h2>

          <p class="text-lg mb-3">
            Félicitations ! Vous êtes maintenant
          </p>

          <div class="level-display bg-white bg-opacity-20 rounded-lg p-4 mb-4">
            <div class="text-4xl font-bold text-white">
              NIVEAU {{ levelData.level }}
            </div>
            <div class="text-sm text-yellow-100 mt-1">
              +{{ levelData.xp_gained }} XP
            </div>
          </div>

          <!-- Récompenses si disponibles -->
          <div v-if="rewards && rewards.length > 0" class="mb-4">
            <p class="text-sm text-yellow-100 mb-2">🎁 Récompenses débloquées :</p>
            <div class="flex flex-wrap justify-center gap-2">
              <span
                v-for="reward in rewards"
                :key="reward.id"
                class="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs"
              >
                {{ reward.description }}
              </span>
            </div>
          </div>

          <!-- Bouton de fermeture -->
          <button
            @click="closeNotification"
            class="bg-white text-orange-500 font-semibold py-2 px-6 rounded-full hover:bg-yellow-50 transition-colors"
          >
            Continuer
          </button>
        </div>
      </div>

      <!-- Particules d'animation -->
      <div class="particles">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { GamingNotification, LevelReward } from '@/types/entities/gaming.ts'

// Props
interface Props {
  notification: GamingNotification
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// État local
const visible = ref(false)

// Computed
const levelData = computed(() => props.notification.data as { level: number; xp_gained: number })

const rewards = computed(() => {
  // Si des récompenses sont disponibles dans les données
  return props.notification.data.rewards as LevelReward[] || []
})

// Méthodes
const showNotification = () => {
  visible.value = true

  // Jouer un son si disponible
  playLevelUpSound()

  // Effet de confetti
  triggerConfetti()
}

const closeNotification = () => {
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}

const playLevelUpSound = () => {
  try {
    // Créer un son de niveau avec Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.log('Impossible de jouer le son de niveau:', error)
  }
}

const triggerConfetti = () => {
  // Animation de confetti simple avec CSS
  const particles = document.querySelectorAll('.particle')
  particles.forEach((particle, index) => {
    setTimeout(() => {
      particle.classList.add('animate')
    }, index * 100)
  })
}

// Lifecycle hooks
onMounted(() => {
  showNotification()

  // Auto-fermeture après 8 secondes
  setTimeout(() => {
    closeNotification()
  }, 8000)
})

onUnmounted(() => {
  // Nettoyage si nécessaire
})
</script>

<style scoped>
.level-up-notification {
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Animation des étoiles */
.stars-animation {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  pointer-events: none;
}

.star {
  position: absolute;
  font-size: 1.5rem;
  animation: float 2s ease-in-out infinite;
}

.star-1 { top: 0; left: 0; animation-delay: 0s; }
.star-2 { top: 0; right: 0; animation-delay: 0.2s; }
.star-3 { top: 20px; left: 50%; transform: translateX(-50%); animation-delay: 0.4s; }
.star-4 { bottom: 0; left: 0; animation-delay: 0.6s; }
.star-5 { bottom: 0; right: 0; animation-delay: 0.8s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(180deg); }
}

/* Animation de l'icône de niveau */
.level-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Particules */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  opacity: 0;
}

.particle-1 { top: 20%; left: 10%; }
.particle-2 { top: 30%; right: 10%; }
.particle-3 { top: 50%; left: 20%; }
.particle-4 { bottom: 30%; right: 20%; }
.particle-5 { bottom: 20%; left: 30%; }
.particle-6 { top: 40%; left: 50%; }

.particle.animate {
  animation: particleFloat 3s ease-out forwards;
}

@keyframes particleFloat {
  0% {
    opacity: 0;
    transform: translateY(0px) scale(0);
  }
  10% {
    opacity: 1;
    transform: translateY(-10px) scale(1);
  }
  90% {
    opacity: 1;
    transform: translateY(-80px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(0);
  }
}

/* Effet de brillance */
.level-up-notification::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .level-up-notification {
    max-width: 90vw;
    margin: 0 auto;
  }

  .level-display {
    padding: 1rem;
  }

  .level-display .text-4xl {
    font-size: 2rem;
  }
}
</style>
