<template>
  <div class="dashboard-header">
    <div class="user-info">
      <div class="avatar">
        <span>{{ userInitials }}</span>
      </div>
      <div class="user-details">
        <h1>Bonjour {{ userName }} 👋</h1>
        <p class="subtitle">Voici ta situation financière</p>
      </div>
    </div>

    <div class="level-info">
      <div class="level-badge">
        <span class="level-icon">⭐</span>
        <span class="level-text">{{ levelLabel }} {{ displayLevel }}</span>
      </div>
      <div class="xp-bar">
        <div class="xp-fill" :style="{ width: `${xpProgress}%` }" />
      </div>
      <p class="xp-text">{{ displayXp }} / {{ nextLevelXp }} {{ pointsLabel }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getLabel } from '@/constants/vocabulary'

// ==========================================
// PROPS - Plus défensif
// ==========================================

interface Props {
  user?: {
    name?: string
    email?: string
  } | null
  level?: number | null
  xp?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  level: 1,
  xp: 0
})

// ==========================================
// VOCABULAIRE ACCESSIBLE
// ==========================================

const levelLabel = computed(() => getLabel('level')) // "Palier"
const pointsLabel = computed(() => getLabel('xp')) // "Points"

// ==========================================
// COMPUTED - Avec validation stricte
// ==========================================

const userName = computed(() => {
  // Si user est un objet avec name
  if (props.user && typeof props.user === 'object' && 'name' in props.user) {
    return props.user.name || 'Utilisateur'
  }
  return 'Utilisateur'
})

const userInitials = computed(() => {
  const name = userName.value
  if (name === 'Utilisateur') return 'U'

  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

const displayLevel = computed(() => {
  // Extraire le niveau même si c'est un objet
  if (typeof props.level === 'number') {
    return props.level
  }
  if (props.level && typeof props.level === 'object' && 'level' in props.level) {
    return (props.level as any).level
  }
  return 1
})

const displayXp = computed(() => {
  // Extraire l'XP même si c'est un objet
  if (typeof props.xp === 'number') {
    return props.xp
  }
  if (props.xp && typeof props.xp === 'object' && 'total_xp' in props.xp) {
    return (props.xp as any).total_xp
  }
  return 0
})

const nextLevelXp = computed(() => {
  return displayLevel.value * 1000
})

const xpProgress = computed(() => {
  if (nextLevelXp.value === 0) return 0
  return Math.min((displayXp.value / nextLevelXp.value) * 100, 100)
})
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 16px;
  margin-bottom: 2rem;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-details h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.subtitle {
  opacity: 0.9;
  font-size: 0.875rem;
}

.level-info {
  text-align: right;
  min-width: 200px;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  margin-bottom: 0.75rem;
}

.level-icon {
  font-size: 1.25rem;
}

.level-text {
  font-weight: 600;
}

.xp-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.xp-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.xp-text {
  font-size: 0.75rem;
  opacity: 0.9;
}

/* ========================================
   RESPONSIVE - TABLET
   ======================================== */

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
    padding: 1.5rem;
  }

  .user-info {
    flex-direction: column;
  }

  .user-details h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.8125rem;
  }

  .level-info {
    text-align: center;
    width: 100%;
  }
}

/* ========================================
   RESPONSIVE - MOBILE
   ======================================== */

@media (max-width: 640px) {
  .dashboard-header {
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }

  .avatar {
    width: 56px;
    height: 56px;
    font-size: 1.25rem;
  }

  .user-details h1 {
    font-size: 1.25rem;
    word-break: break-word;
  }

  .subtitle {
    font-size: 0.75rem;
  }

  .level-badge {
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
  }

  .level-icon {
    font-size: 1.125rem;
  }

  .xp-bar {
    height: 6px;
  }

  .xp-text {
    font-size: 0.6875rem;
  }
}

/* ========================================
   RESPONSIVE - VERY SMALL MOBILE
   ======================================== */

@media (max-width: 375px) {
  .dashboard-header {
    padding: 0.875rem;
  }

  .avatar {
    width: 48px;
    height: 48px;
    font-size: 1.125rem;
  }

  .user-details h1 {
    font-size: 1.125rem;
  }

  .level-badge {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
}

/* ========================================
   SAFE AREA INSETS (iPhone X+)
   ======================================== */

@supports (padding: env(safe-area-inset-top)) {
  .dashboard-header {
    padding-top: max(2rem, env(safe-area-inset-top));
  }
}

/* ========================================
   DARK MODE SUPPORT
   ======================================== */

@media (prefers-color-scheme: dark) {
  .dashboard-header {
    background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
  }
}

/* ========================================
   REDUCED MOTION
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  .xp-fill {
    transition: none;
  }
}
</style>
