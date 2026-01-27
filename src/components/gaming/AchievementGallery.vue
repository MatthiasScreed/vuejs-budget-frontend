<template>
  <div class="achievement-gallery bg-white rounded-xl shadow-lg p-6">

    <!-- Header avec titre et contrôles -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">🏆 Collection d'Achievements</h2>
        <p class="text-gray-600">
          {{ achievementStore.achievementStats.unlocked }}/{{ achievementStore.achievementStats.total }} débloqués
          ({{ achievementStore.achievementStats.percentage }}%)
        </p>
      </div>

      <!-- Contrôles de vue -->
      <div class="flex items-center gap-4 mt-4 lg:mt-0">
        <!-- Filtres -->
        <div class="flex items-center gap-2">
          <select
            v-model="selectedCategory"
            class="form-select-small"
          >
            <option value="">Toutes catégories</option>
            <option
              v-for="category in achievementStore.categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.icon }} {{ category.name }}
            </option>
          </select>

          <select
            v-model="selectedRarity"
            class="form-select-small"
          >
            <option value="">Toutes raretés</option>
            <option value="common">Commun</option>
            <option value="uncommon">Peu commun</option>
            <option value="rare">Rare</option>
            <option value="epic">Épique</option>
            <option value="legendary">Légendaire</option>
          </select>

          <button
            @click="toggleShowUnlocked"
            :class="[
              'filter-toggle',
              showOnlyUnlocked ? 'filter-toggle-active' : 'filter-toggle-inactive'
            ]"
          >
            {{ showOnlyUnlocked ? '✅' : '🔒' }}
            {{ showOnlyUnlocked ? 'Débloqués' : 'Tous' }}
          </button>
        </div>

        <!-- Modes d'affichage -->
        <div class="view-mode-selector">
          <button
            @click="viewMode = 'grid'"
            :class="['view-mode-btn', viewMode === 'grid' ? 'active' : '']"
            title="Vue grille"
          >
            ⊞
          </button>
          <button
            @click="viewMode = 'list'"
            :class="['view-mode-btn', viewMode === 'list' ? 'active' : '']"
            title="Vue liste"
          >
            ☰
          </button>
          <button
            @click="viewMode = 'category'"
            :class="['view-mode-btn', viewMode === 'category' ? 'active' : '']"
            title="Par catégorie"
          >
            📁
          </button>
        </div>
      </div>
    </div>

    <!-- Barre de progression globale -->
    <div class="progress-section mb-8">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700">Progression globale</span>
        <span class="text-sm text-gray-500">
          {{ achievementStore.achievementStats.unlocked }}/{{ achievementStore.achievementStats.total }}
        </span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: achievementStore.achievementStats.percentage + '%' }"
        ></div>
      </div>
      <div class="flex justify-between items-center mt-2">
        <span class="text-xs text-gray-500">
          +{{ achievementStore.achievementStats.totalXP }} XP total
        </span>
        <span class="text-xs text-gray-500">
          {{ achievementStore.achievementStats.percentage }}% complété
        </span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="achievementStore.loading" class="loading-state">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-600 mt-2">Chargement des achievements...</p>
    </div>

    <!-- Vue Grille -->
    <div v-else-if="viewMode === 'grid'" class="achievement-grid">
      <div
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        class="achievement-card"
        :class="getAchievementCardClass(achievement)"
        @click="selectAchievement(achievement)"
      >
        <div class="achievement-card-inner">
          <!-- Badge de rareté -->
          <div
            class="achievement-rarity-badge"
            :class="getRarityBadgeClass(achievement.rarity)"
          >
            {{ getRarityLabel(achievement.rarity) }}
          </div>

          <!-- Icône -->
          <div class="achievement-card-icon">
            <div
              class="achievement-icon-bg"
              :class="[
                getRarityBgClass(achievement.rarity),
                !isUnlocked(achievement) && 'grayscale opacity-50'
              ]"
            >
              <span class="achievement-icon">
                {{ isUnlocked(achievement) ? achievement.icon : '🔒' }}
              </span>
            </div>
          </div>

          <!-- Contenu -->
          <div class="achievement-card-content">
            <h3 class="achievement-card-title">
              {{ isUnlocked(achievement) ? achievement.name : '???' }}
            </h3>
            <p class="achievement-card-description">
              {{ isUnlocked(achievement) ? achievement.description : 'Achievement verrouillé' }}
            </p>
          </div>

          <!-- Pied -->
          <div class="achievement-card-footer">
            <div class="flex justify-between items-center">
              <span class="achievement-xp">+{{ achievement.xp_reward }} XP</span>
              <span class="achievement-category-icon">
                {{ getCategoryIcon(achievement.category) }}
              </span>
            </div>

            <!-- Barre de progression pour non-débloqués -->
            <div v-if="!isUnlocked(achievement)" class="achievement-progress">
              <div class="achievement-progress-bar">
                <div
                  class="achievement-progress-fill"
                  :style="{ width: getProgress(achievement) + '%' }"
                ></div>
              </div>
              <span class="achievement-progress-text">
                {{ getProgress(achievement) }}%
              </span>
            </div>

            <!-- Date de déblocage -->
            <div v-else class="achievement-unlocked-date">
              <span class="text-xs text-green-600">
                ✅ {{ formatUnlockedDate(achievement) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue Liste -->
    <div v-else-if="viewMode === 'list'" class="achievement-list">
      <div
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        class="achievement-list-item"
        :class="{ 'unlocked': isUnlocked(achievement) }"
        @click="selectAchievement(achievement)"
      >
        <div class="achievement-list-icon">
          <div
            class="achievement-icon-bg-small"
            :class="[
              getRarityBgClass(achievement.rarity),
              !isUnlocked(achievement) && 'grayscale opacity-50'
            ]"
          >
            <span class="achievement-icon-small">
              {{ isUnlocked(achievement) ? achievement.icon : '🔒' }}
            </span>
          </div>
        </div>

        <div class="achievement-list-content">
          <div class="achievement-list-header">
            <h4 class="achievement-list-title">
              {{ isUnlocked(achievement) ? achievement.name : 'Achievement verrouillé' }}
            </h4>
            <div class="achievement-list-badges">
              <span
                class="achievement-rarity-badge-small"
                :class="getRarityBadgeClass(achievement.rarity)"
              >
                {{ getRarityLabel(achievement.rarity) }}
              </span>
              <span class="achievement-xp-badge">+{{ achievement.xp_reward }} XP</span>
            </div>
          </div>

          <p class="achievement-list-description">
            {{ isUnlocked(achievement) ? achievement.description : 'Continuez à jouer pour débloquer cet achievement' }}
          </p>

          <div class="achievement-list-footer">
            <span class="achievement-category-text">
              {{ getCategoryIcon(achievement.category) }} {{ getCategoryName(achievement.category) }}
            </span>

            <div v-if="!isUnlocked(achievement)" class="achievement-list-progress">
              <span class="text-xs text-gray-500">Progression: {{ getProgress(achievement) }}%</span>
              <div class="achievement-progress-bar-small">
                <div
                  class="achievement-progress-fill"
                  :style="{ width: getProgress(achievement) + '%' }"
                ></div>
              </div>
            </div>

            <span v-else class="achievement-unlocked-text">
              ✅ Débloqué le {{ formatUnlockedDate(achievement) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue par Catégorie -->
    <div v-else-if="viewMode === 'category'" class="achievement-categories">
      <div
        v-for="categoryGroup in achievementsByCategory"
        :key="categoryGroup.category.id"
        class="achievement-category-section"
      >
        <div class="achievement-category-header">
          <div class="flex items-center gap-3">
            <div
              class="achievement-category-icon"
              :style="{ backgroundColor: categoryGroup.category.color }"
            >
              <span>{{ categoryGroup.category.icon }}</span>
            </div>
            <div>
              <h3 class="achievement-category-title">{{ categoryGroup.category.name }}</h3>
              <p class="achievement-category-subtitle">
                {{ categoryGroup.unlockedCount }}/{{ categoryGroup.totalCount }}
                ({{ categoryGroup.percentage }}%)
              </p>
            </div>
          </div>

          <div class="achievement-category-progress">
            <div class="progress-bar-small">
              <div
                class="progress-fill"
                :style="{ width: categoryGroup.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="achievement-category-grid">
          <div
            v-for="achievement in categoryGroup.achievements"
            :key="achievement.id"
            class="achievement-card-small"
            :class="{ 'unlocked': isUnlocked(achievement) }"
            @click="selectAchievement(achievement)"
          >
            <div
              class="achievement-icon-bg-tiny"
              :class="[
                getRarityBgClass(achievement.rarity),
                !isUnlocked(achievement) && 'grayscale opacity-50'
              ]"
            >
              <span class="achievement-icon-tiny">
                {{ isUnlocked(achievement) ? achievement.icon : '🔒' }}
              </span>
            </div>
            <span class="achievement-card-small-title">
              {{ isUnlocked(achievement) ? achievement.name : '???' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-if="filteredAchievements.length === 0 && !achievementStore.loading" class="empty-state">
      <div class="empty-icon">🎯</div>
      <h3 class="empty-title">Aucun achievement trouvé</h3>
      <p class="empty-text">Essayez de modifier vos filtres ou continuez à utiliser l'application !</p>
    </div>

    <!-- Modal de détails -->
    <AchievementModal
      v-if="selectedAchievementDetail"
      :achievement="selectedAchievementDetail"
      :progress="getAchievementProgress(selectedAchievementDetail.id)"
      :show="showModal"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/achievementStore'
import AchievementModal from './AchievementModal.vue'
import type { Achievement } from '@/types/entities/gaming.ts'

// ==========================================
// STORES & STATE
// ==========================================

const achievementStore = useAchievementStore()

// État local
const viewMode = ref<'grid' | 'list' | 'category'>('grid')
const selectedCategory = ref('')
const selectedRarity = ref('')
const showOnlyUnlocked = ref(false)
const selectedAchievementDetail = ref<Achievement | null>(null)
const showModal = ref(false)

// ==========================================
// COMPUTED
// ==========================================

/**
 * Achievements filtrés selon les critères sélectionnés
 */
const filteredAchievements = computed(() => {
  let filtered = achievementStore.achievements

  // Filtre par catégorie
  if (selectedCategory.value) {
    filtered = filtered.filter(a => a.category === selectedCategory.value)
  }

  // Filtre par rareté
  if (selectedRarity.value) {
    filtered = filtered.filter(a => a.rarity === selectedRarity.value)
  }

  // Filtre débloqués uniquement
  if (showOnlyUnlocked.value) {
    filtered = filtered.filter(a => isUnlocked(a))
  }

  return filtered.sort((a, b) => {
    // Trier par statut débloqué d'abord, puis par nom
    const aUnlocked = isUnlocked(a)
    const bUnlocked = isUnlocked(b)

    if (aUnlocked && !bUnlocked) return -1
    if (!aUnlocked && bUnlocked) return 1

    return a.name.localeCompare(b.name)
  })
})

/**
 * Achievements groupés par catégorie
 */
const achievementsByCategory = computed(() => {
  return achievementStore.achievementsByCategory.filter(group => {
    if (selectedRarity.value) {
      return group.achievements.some(a => a.rarity === selectedRarity.value)
    }
    return true
  })
})

// ==========================================
// METHODS
// ==========================================

/**
 * Vérifier si un achievement est débloqué
 */
function isUnlocked(achievement: Achievement): boolean {
  return achievementStore.unlockedAchievements.some(ua => ua.achievement_id === achievement.id)
}

/**
 * Obtenir le progrès d'un achievement
 */
function getProgress(achievement: Achievement): number {
  return achievementStore.calculateProgress(achievement.id)
}

/**
 * Obtenir les détails de progression d'un achievement
 */
function getAchievementProgress(achievementId: string) {
  return achievementStore.getAchievementProgress(achievementId)
}

/**
 * Obtenir la classe CSS pour une carte d'achievement
 */
function getAchievementCardClass(achievement: Achievement): string {
  const classes = ['achievement-' + achievement.rarity]
  if (isUnlocked(achievement)) {
    classes.push('unlocked')
  }
  return classes.join(' ')
}

/**
 * Obtenir la classe CSS selon la rareté
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
 * Formater la date de déblocage
 */
function formatUnlockedDate(achievement: Achievement): string {
  const progress = achievementStore.getAchievementProgress(achievement.id)
  if (progress?.unlocked_at) {
    return new Date(progress.unlocked_at).toLocaleDateString('fr-FR')
  }
  return 'Récemment'
}

/**
 * Basculer l'affichage des achievements débloqués uniquement
 */
function toggleShowUnlocked() {
  showOnlyUnlocked.value = !showOnlyUnlocked.value
}

/**
 * Sélectionner un achievement pour voir les détails
 */
function selectAchievement(achievement: Achievement) {
  selectedAchievementDetail.value = achievement
  showModal.value = true
}

/**
 * Fermer la modal de détails
 */
function closeModal() {
  showModal.value = false
  selectedAchievementDetail.value = null
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Charger les données d'achievements
  await achievementStore.loadAchievementData()
})
</script>

<style scoped>
/* ==========================================
   CONTRÔLES ET FILTRES
   ========================================== */
.form-select-small {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #374151;
  min-width: 120px;
}

.filter-toggle {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-toggle-active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.filter-toggle-inactive:hover {
  background: #f3f4f6;
}

.view-mode-selector {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.view-mode-btn {
  padding: 8px 12px;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.view-mode-btn:hover {
  background: #f3f4f6;
}

.view-mode-btn.active {
  background: #3b82f6;
  color: white;
}

/* ==========================================
   PROGRESSION GLOBALE
   ========================================== */
.progress-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-bar-small {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

/* ==========================================
   VUE GRILLE
   ========================================== */
.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.achievement-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.achievement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.achievement-card.unlocked {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.achievement-card-inner {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
}

.achievement-rarity-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.achievement-card-icon {
  margin-bottom: 16px;
}

.achievement-icon-bg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.achievement-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.achievement-card-content {
  flex: 1;
  margin-bottom: 16px;
}

.achievement-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.achievement-card-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
}

.achievement-card-footer {
  width: 100%;
}

.achievement-xp {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  background: #eff6ff;
  padding: 4px 8px;
  border-radius: 8px;
}

.achievement-category-icon {
  font-size: 16px;
}

.achievement-progress {
  margin-top: 12px;
}

.achievement-progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.achievement-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f97316, #eab308);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.achievement-progress-text {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.achievement-unlocked-date {
  margin-top: 8px;
}

/* ==========================================
   VUE LISTE
   ========================================== */
.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.achievement-list-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.achievement-list-item.unlocked {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.achievement-list-icon {
  flex-shrink: 0;
}

.achievement-icon-bg-small {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.achievement-icon-small {
  font-size: 20px;
}

.achievement-list-content {
  flex: 1;
  min-width: 0;
}

.achievement-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.achievement-list-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.achievement-list-badges {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.achievement-rarity-badge-small {
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.achievement-xp-badge {
  font-size: 10px;
  font-weight: 600;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 6px;
}

.achievement-list-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.achievement-list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.achievement-category-text {
  color: #9ca3af;
}

.achievement-list-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.achievement-progress-bar-small {
  width: 60px;
  height: 3px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.achievement-unlocked-text {
  color: #10b981;
  font-weight: 500;
}

/* ==========================================
   VUE PAR CATÉGORIE
   ========================================== */
.achievement-categories {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.achievement-category-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
}

.achievement-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.achievement-category-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.achievement-category-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.achievement-category-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.achievement-category-progress {
  min-width: 120px;
}

.achievement-category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.achievement-card-small {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.achievement-card-small:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.achievement-card-small.unlocked {
  border-color: #10b981;
}

.achievement-icon-bg-tiny {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 8px;
}

.achievement-icon-tiny {
  font-size: 14px;
}

.achievement-card-small-title {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  line-height: 1.3;
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
   ÉTATS
   ========================================== */
.loading-state {
  text-align: center;
  padding: 40px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.empty-text {
  color: #6b7280;
  margin: 0;
}

/* ==========================================
   RESPONSIVE
   ========================================== */
@media (max-width: 768px) {
  .achievement-grid {
    grid-template-columns: 1fr;
  }

  .achievement-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .achievement-category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .achievement-category-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
