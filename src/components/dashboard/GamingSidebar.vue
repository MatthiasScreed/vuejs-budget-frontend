<!-- src/components/dashboard/GamingSidebar.vue -->

<template>
  <div class="gaming-sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">🎮 Votre progression</h3>
      <button
        class="btn-collapse"
        @click="toggleCollapse"
        :aria-label="isCollapsed ? 'Développer' : 'Réduire'"
      >
        {{ isCollapsed ? '▼' : '▲' }}
      </button>
    </div>

    <div v-show="!isCollapsed" class="sidebar-content">
      <!-- Niveau & XP -->
      <div class="level-card">
        <div class="level-header">
          <span class="level-label">Palier {{ currentLevel }}</span>
          <span class="xp-count">{{ currentXP }} points</span>
        </div>

        <div class="xp-bar">
          <div class="xp-fill" :style="{ width: `${xpPercentage}%` }"></div>
        </div>

        <p class="xp-next">
          {{ nextLevelXP - currentXP }} points avant palier {{ currentLevel + 1 }}
        </p>
      </div>

      <!-- Série -->
      <div class="streak-card">
        <div class="streak-icon">🔥</div>
        <div class="streak-info">
          <p class="streak-count">{{ currentStreak }} jours</p>
          <p class="streak-label">de régularité</p>
        </div>
      </div>

      <!-- Succès récents -->
      <div class="achievements-preview">
        <h4 class="achievements-title">Succès récents</h4>

        <div
          v-for="achievement in recentAchievements"
          :key="achievement.id"
          class="achievement-item"
        >
          <span class="achievement-icon">{{ achievement.icon }}</span>
          <div class="achievement-info">
            <p class="achievement-name">{{ achievement.title }}</p>
            <p class="achievement-date">
              {{ formatRelativeDate(achievement.unlockedAt) }}
            </p>
          </div>
        </div>

        <router-link to="/app/gaming" class="link-view-all"> Voir tous les succès → </router-link>
      </div>

      <!-- Progression hebdomadaire -->
      <div class="weekly-progress">
        <h4 class="weekly-title">Cette semaine</h4>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${weeklyProgress}%` }"></div>
        </div>
        <p class="weekly-text">{{ weeklyProgress }}% des objectifs atteints</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Achievement } from '@/types/dashboard.types'

/**
 * Sidebar gaming - Version discrète
 * École 42: Composant secondaire, non intrusif
 */

const isCollapsed = ref(false)

// Données gaming (à charger depuis API)
const currentLevel = ref(5)
const currentXP = ref(2340)
const nextLevelXP = ref(3000)
const currentStreak = ref(7)
const weeklyProgress = ref(65)

const recentAchievements = ref<Achievement[]>([
  {
    id: 1,
    title: 'Économe',
    description: 'Économisé 200€ ce mois',
    icon: '💰',
    unlockedAt: '2026-02-07T10:30:00Z',
  },
  {
    id: 2,
    title: 'Régulier',
    description: '7 jours de connexion',
    icon: '🔥',
    unlockedAt: '2026-02-05T15:20:00Z',
  },
])

/**
 * Calcule le pourcentage d'XP
 */
const xpPercentage = computed(() => {
  return (currentXP.value / nextLevelXP.value) * 100
})

/**
 * Toggle collapse
 */
const toggleCollapse = (): void => {
  isCollapsed.value = !isCollapsed.value
}

/**
 * Formate une date relative
 */
const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}
</script>

<style scoped>
.gaming-sidebar {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
}

.btn-collapse {
  background: none;
  border: none;
  font-size: 0.875rem;
  color: #718096;
  cursor: pointer;
  padding: 0.25rem;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Carte niveau */
.level-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid #e2e8f0;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.level-label {
  font-weight: 700;
  color: #667eea;
  font-size: 1rem;
}

.xp-count {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 600;
}

.xp-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.xp-next {
  font-size: 0.75rem;
  color: #718096;
  text-align: center;
}

/* Carte série */
.streak-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid #ffd700;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.streak-icon {
  font-size: 2rem;
}

.streak-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1;
}

.streak-label {
  font-size: 0.75rem;
  color: #718096;
}

/* Succès */
.achievements-preview {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid #e2e8f0;
}

.achievements-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
}

.achievement-item:hover {
  background: #f7fafc;
}

.achievement-icon {
  font-size: 1.5rem;
}

.achievement-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
}

.achievement-date {
  font-size: 0.75rem;
  color: #718096;
}

.link-view-all {
  display: block;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
}

/* Progression hebdomadaire */
.weekly-progress {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid #e2e8f0;
}

.weekly-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #48bb78;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.weekly-text {
  font-size: 0.75rem;
  color: #718096;
  text-align: center;
}

@media (max-width: 1200px) {
  .gaming-sidebar {
    max-width: 100%;
  }
}
</style>
