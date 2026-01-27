<template>
  <Transition name="modal-fade">
    <div
      v-if="show"
      class="achievement-modal-overlay"
      @click="$emit('close')"
    >
      <div
        class="achievement-modal"
        :class="getRarityModalClass(achievement.rarity)"
        @click.stop
      >
        <!-- Header avec fermeture -->
        <div class="achievement-modal-header">
          <h2 class="achievement-modal-title">
            {{ isUnlocked ? '🏆 Achievement Débloqué' : '🔒 Achievement Verrouillé' }}
          </h2>
          <button
            @click="$emit('close')"
            class="achievement-modal-close"
          >
            ✕
          </button>
        </div>

        <!-- Contenu principal -->
        <div class="achievement-modal-content">
          <!-- Icône et badge de rareté -->
          <div class="achievement-modal-icon-section">
            <div class="achievement-modal-icon-container">
              <div
                class="achievement-modal-icon-bg"
                :class="[
                  getRarityBgClass(achievement.rarity),
                  !isUnlocked && 'grayscale opacity-60'
                ]"
              >
                <span class="achievement-modal-icon">
                  {{ isUnlocked ? achievement.icon : '🔒' }}
                </span>
              </div>

              <!-- Badge de rareté avec animation -->
              <div
                class="achievement-modal-rarity-badge"
                :class="getRarityBadgeClass(achievement.rarity)"
              >
                {{ getRarityLabel(achievement.rarity) }}
              </div>

              <!-- Particules d'effet (pour legendary) -->
              <div
                v-if="achievement.rarity === 'legendary'"
                class="achievement-particles"
              >
                <div
                  v-for="n in 6"
                  :key="n"
                  class="particle"
                  :style="{
                    '--delay': n * 0.2 + 's',
                    '--angle': n * 60 + 'deg'
                  }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Informations -->
          <div class="achievement-modal-info">
            <h3 class="achievement-modal-name">
              {{ isUnlocked ? achievement.name : 'Achievement Mystérieux' }}
            </h3>

            <p class="achievement-modal-description">
              {{ isUnlocked ? achievement.description : 'Continuez à jouer pour découvrir cet achievement !' }}
            </p>

            <!-- Récompense XP -->
            <div class="achievement-modal-reward">
              <div class="achievement-reward-badge">
                <span class="achievement-reward-icon">⚡</span>
                <span class="achievement-reward-text">+{{ achievement.xp_reward }} XP</span>
              </div>
            </div>
          </div>

          <!-- Statistiques détaillées -->
          <div class="achievement-modal-stats">
            <div class="achievement-stat-grid">
              <div class="achievement-stat-item">
                <span class="achievement-stat-label">Catégorie</span>
                <span class="achievement-stat-value">
                  {{ getCategoryIcon(achievement.category) }}
                  {{ getCategoryName(achievement.category) }}
                </span>
              </div>

              <div class="achievement-stat-item">
                <span class="achievement-stat-label">Rareté</span>
                <span
                  class="achievement-stat-value achievement-rarity-text"
                  :class="getRarityTextClass(achievement.rarity)"
                >
                  {{ getRarityLabel(achievement.rarity) }}
                </span>
              </div>

              <div class="achievement-stat-item">
                <span class="achievement-stat-label">Récompense</span>
                <span class="achievement-stat-value">{{ achievement.xp_reward }} XP</span>
              </div>

              <div class="achievement-stat-item">
                <span class="achievement-stat-label">Statut</span>
                <span
                  class="achievement-stat-value"
                  :class="isUnlocked ? 'text-green-600' : 'text-gray-500'"
                >
                  {{ isUnlocked ? '✅ Débloqué' : '🔒 Verrouillé' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Progression (si pas débloqué) -->
          <div
            v-if="!isUnlocked && progress"
            class="achievement-modal-progress"
          >
            <div class="achievement-progress-header">
              <span class="achievement-progress-label">Progression</span>
              <span class="achievement-progress-percentage">{{ progressPercentage }}%</span>
            </div>

            <div class="achievement-progress-bar-container">
              <div class="achievement-progress-bar">
                <div
                  class="achievement-progress-fill"
                  :style="{ width: progressPercentage + '%' }"
                ></div>
              </div>
            </div>

            <div class="achievement-progress-hint">
              <span class="achievement-hint-text">
                {{ getProgressHint() }}
              </span>
            </div>
          </div>

          <!-- Date de déblocage (si débloqué) -->
          <div
            v-if="isUnlocked && progress?.unlocked_at"
            class="achievement-modal-unlock-date"
          >
            <div class="achievement-unlock-info">
              <span class="achievement-unlock-icon">🎉</span>
              <div class="achievement-unlock-text">
                <span class="achievement-unlock-label">Débloqué le</span>
                <span class="achievement-unlock-date">
                  {{ formatUnlockDate(progress.unlocked_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="achievement-modal-actions">
          <button
            v-if="isUnlocked"
            @click="shareAchievement"
            class="achievement-action-btn achievement-share-btn"
          >
            <span class="achievement-btn-icon">🔗</span>
            <span>Partager</span>
          </button>

          <button
            @click="$emit('close')"
            class="achievement-action-btn achievement-close-btn"
          >
            <span class="achievement-btn-icon">{{ isUnlocked ? '✨' : '🎯' }}</span>
            <span>{{ isUnlocked ? 'Fantastique !' : 'Compris !' }}</span>
          </button>
        </div>

        <!-- Effet de brillance pour les achievements rares -->
        <div
          v-if="isUnlocked && ['epic', 'legendary'].includes(achievement.rarity)"
          class="achievement-modal-shine"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAchievementStore } from '@/stores/achievementStore'
import type { Achievement, AchievementProgress } from '@/types/entities/gaming.ts'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  achievement: Achievement
  progress?: AchievementProgress | null
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// ==========================================
// STORES
// ==========================================

const achievementStore = useAchievementStore()

// ==========================================
// COMPUTED
// ==========================================

/**
 * L'achievement est-il débloqué ?
 */
const isUnlocked = computed(() => {
  return props.progress?.unlocked || false
})

/**
 * Pourcentage de progression
 */
const progressPercentage = computed(() => {
  if (isUnlocked.value) return 100
  return achievementStore.calculateProgress(props.achievement.id)
})

// ==========================================
// METHODS
// ==========================================

/**
 * Obtenir la classe CSS de la modal selon la rareté
 */
function getRarityModalClass(rarity: string): string {
  return `achievement-modal-${rarity}`
}

/**
 * Obtenir la classe CSS du background selon la rareté
 */
function getRarityBgClass(rarity: string): string {
  const classes = {
    common: 'bg-green-500',
    uncommon: 'bg-blue-500',
    rare: 'bg-purple-500',
    epic: 'bg-yellow-500',
    legendary: 'bg-red-500'
  }
  return classes[rarity as keyof typeof classes] || 'bg-gray-500'
}

/**
 * Obtenir la classe CSS du badge selon la rareté
 */
function getRarityBadgeClass(rarity: string): string {
  const classes = {
    common: 'badge-green',
    uncommon: 'badge-blue',
    rare: 'badge-purple',
    epic: 'badge-yellow',
    legendary: 'badge-red'
  }
  return classes[rarity as keyof typeof classes] || 'badge-gray'
}

/**
 * Obtenir la classe CSS du texte selon la rareté
 */
function getRarityTextClass(rarity: string): string {
  const classes = {
    common: 'text-green-600',
    uncommon: 'text-blue-600',
    rare: 'text-purple-600',
    epic: 'text-yellow-600',
    legendary: 'text-red-600'
  }
  return classes[rarity as keyof typeof classes] || 'text-gray-600'
}

/**
 * Obtenir le label de rareté
 */
function getRarityLabel(rarity: string): string {
  const labels = {
    common: 'Commun',
    uncommon: 'Peu commun',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire'
  }
  return labels[rarity as keyof typeof labels] || 'Inconnu'
}

/**
 * Obtenir l'icône de catégorie
 */
function getCategoryIcon(categoryId: string): string {
  const category = achievementStore.categories.find(c => c.id === categoryId)
  return category?.icon || '🎯'
}

/**
 * Obtenir le nom de catégorie
 */
function getCategoryName(categoryId: string): string {
  const category = achievementStore.categories.find(c => c.id === categoryId)
  return category?.name || categoryId
}

/**
 * Obtenir un conseil de progression
 */
function getProgressHint(): string {
  const hints = {
    transaction_count: `Ajoutez plus de transactions pour débloquer cet achievement`,
    total_income: `Augmentez vos revenus pour atteindre l'objectif`,
    total_expenses: `Continuez à enregistrer vos dépenses`,
    balance_positive: `Maintenez un bilan positif`,
    categories_used: `Utilisez différentes catégories pour vos transactions`,
    days_active: `Restez actif plusieurs jours consécutifs`,
    user_level: `Gagnez plus d'XP pour augmenter votre niveau`,
    first_transaction: `Ajoutez votre première transaction`
  }

  return hints[props.achievement.condition_type as keyof typeof hints] ||
    'Continuez à utiliser l\'application pour débloquer cet achievement'
}

/**
 * Formater la date de déblocage
 */
function formatUnlockDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return 'Aujourd\'hui'
  } else if (diffDays === 2) {
    return 'Hier'
  } else if (diffDays <= 7) {
    return `Il y a ${diffDays - 1} jours`
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
}

/**
 * Partager l'achievement
 */
function shareAchievement() {
  const text = `Je viens de débloquer l'achievement "${props.achievement.name}" dans Budget Gaming ! 🏆 +${props.achievement.xp_reward} XP`

  if (navigator.share) {
    navigator.share({
      title: 'Achievement Débloqué !',
      text: text,
      url: window.location.href
    }).catch(() => {
      // Fallback si le partage échoue
      copyToClipboard(text)
    })
  } else {
    copyToClipboard(text)
  }
}

/**
 * Copier dans le presse-papier
 */
function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Texte copié dans le presse-papier !')
    }).catch(() => {
      // Fallback pour les navigateurs plus anciens
      fallbackCopyTextToClipboard(text)
    })
  } else {
    fallbackCopyTextToClipboard(text)
  }
}

/**
 * Fallback pour copier du texte
 */
function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand('copy')
    alert('✅ Texte copié dans le presse-papier !')
  } catch (err) {
    alert('❌ Impossible de copier le texte')
  }

  document.body.removeChild(textArea)
}
</script>

<style scoped>
/* ==========================================
   OVERLAY ET MODAL PRINCIPALE
   ========================================== */
.achievement-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 20px;
}

.achievement-modal {
  background: white;
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  position: relative;
}

/* Styles spéciaux par rareté */
.achievement-modal-legendary {
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fef2f2 100%);
  border: 2px solid #ef4444;
  animation: legendary-pulse 2s ease-in-out infinite;
}

.achievement-modal-epic {
  background: linear-gradient(135deg, #fefbeb 0%, #ffffff 50%, #fefbeb 100%);
  border: 2px solid #f59e0b;
}

@keyframes legendary-pulse {
  0%, 100% {
    box-shadow: 0 25px 50px rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 30px 60px rgba(239, 68, 68, 0.4);
  }
}

/* ==========================================
   HEADER
   ========================================== */
.achievement-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
}

.achievement-modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.achievement-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s;
  line-height: 1;
}

.achievement-modal-close:hover {
  background: #f3f4f6;
  color: #374151;
  transform: scale(1.1);
}

/* ==========================================
   CONTENU PRINCIPAL
   ========================================== */
.achievement-modal-content {
  padding: 24px;
}

.achievement-modal-icon-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.achievement-modal-icon-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.achievement-modal-icon-bg {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.achievement-modal-icon {
  font-size: 48px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.achievement-modal-rarity-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Particules pour legendary */
.achievement-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fbbf24;
  border-radius: 50%;
  animation: particle-float 3s ease-in-out infinite;
  animation-delay: var(--delay);
  transform-origin: 0 60px;
  transform: rotate(var(--angle));
}

@keyframes particle-float {
  0%, 100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateY(0) scale(0);
  }
  20% {
    opacity: 1;
    transform: rotate(var(--angle)) translateY(-20px) scale(1);
  }
  80% {
    opacity: 1;
    transform: rotate(var(--angle)) translateY(-40px) scale(1);
  }
}

/* ==========================================
   INFORMATIONS
   ========================================== */
.achievement-modal-info {
  text-align: center;
  margin-bottom: 24px;
}

.achievement-modal-name {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.achievement-modal-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 20px 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.achievement-modal-reward {
  display: flex;
  justify-content: center;
}

.achievement-reward-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 12px 20px;
  border-radius: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.achievement-reward-icon {
  font-size: 20px;
}

.achievement-reward-text {
  font-size: 18px;
}

/* ==========================================
   STATISTIQUES
   ========================================== */
.achievement-modal-stats {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.achievement-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.achievement-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.achievement-stat-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.achievement-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.achievement-rarity-text {
  font-weight: 700;
}

/* ==========================================
   PROGRESSION
   ========================================== */
.achievement-modal-progress {
  background: #f0f9ff;
  border: 2px solid #e0f2fe;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.achievement-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.achievement-progress-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.achievement-progress-percentage {
  font-size: 18px;
  font-weight: 700;
  color: #0369a1;
}

.achievement-progress-bar-container {
  margin-bottom: 12px;
}

.achievement-progress-bar {
  width: 100%;
  height: 8px;
  background: #e0f2fe;
  border-radius: 4px;
  overflow: hidden;
}

.achievement-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9, #0284c7);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.achievement-progress-hint {
  text-align: center;
}

.achievement-hint-text {
  font-size: 13px;
  color: #0369a1;
  font-style: italic;
}

/* ==========================================
   DATE DE DÉBLOCAGE
   ========================================== */
.achievement-modal-unlock-date {
  background: #f0fdf4;
  border: 2px solid #dcfce7;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.achievement-unlock-info {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.achievement-unlock-icon {
  font-size: 24px;
}

.achievement-unlock-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.achievement-unlock-label {
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.achievement-unlock-date {
  font-size: 16px;
  font-weight: 700;
  color: #15803d;
}

/* ==========================================
   ACTIONS
   ========================================== */
.achievement-modal-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px 24px;
}

.achievement-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.achievement-share-btn {
  background: #6b7280;
  color: white;
}

.achievement-share-btn:hover {
  background: #4b5563;
  transform: translateY(-2px);
}

.achievement-close-btn {
  background: #3b82f6;
  color: white;
}

.achievement-close-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.achievement-btn-icon {
  font-size: 18px;
}

/* ==========================================
   EFFET DE BRILLANCE
   ========================================== */
.achievement-modal-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shine-sweep 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes shine-sweep {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

/* ==========================================
   BADGES DE RARETÉ
   ========================================== */
.badge-green { background: #10b981; color: white; }
.badge-blue { background: #3b82f6; color: white; }
.badge-purple { background: #8b5cf6; color: white; }
.badge-yellow { background: #f59e0b; color: white; }
.badge-red { background: #ef4444; color: white; }
.badge-gray { background: #6b7280; color: white; }

/* ==========================================
   ANIMATIONS
   ========================================== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .achievement-modal,
.modal-fade-leave-to .achievement-modal {
  transform: scale(0.9) translateY(20px);
}

/* ==========================================
   RESPONSIVE
   ========================================== */
@media (max-width: 640px) {
  .achievement-modal {
    margin: 10px;
    max-height: calc(100vh - 20px);
    border-radius: 20px;
  }

  .achievement-modal-content {
    padding: 20px;
  }

  .achievement-modal-icon-bg {
    width: 100px;
    height: 100px;
  }

  .achievement-modal-icon {
    font-size: 40px;
  }

  .achievement-modal-name {
    font-size: 24px;
  }

  .achievement-stat-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .achievement-modal-actions {
    flex-direction: column;
  }
}
</style>
