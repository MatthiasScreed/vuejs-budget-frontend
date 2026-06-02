<!-- src/components/quest/QuestHeader.vue -->
<template>
  <header class="quest-header">
    <!-- Logo -->
    <div class="quest-header__logo">
      <div class="logo-icon-wrap">
        <img src="@/assets/images/icon/icon.svg" class="logo-img" alt="CoinQuest" />
        <div class="level-badge">{{ safeLevel }}</div>
      </div>
      <span class="logo-text">CoinQuest</span>
    </div>

    <!-- Actions -->
    <div class="quest-header__actions">
      <!-- Streak badge -->
      <div v-if="currentStreak > 0" class="streak-badge">🔥 {{ currentStreak }}</div>

      <!-- Notifications -->
      <button
        class="icon-btn"
        @click="$router.push({ name: 'Profile' })"
        aria-label="Notifications"
      >
        <span class="icon-btn__icon">🔔</span>
        <span v-if="unreadCount > 0" class="icon-btn__badge">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <!-- Profil -->
      <button class="icon-btn" @click="$router.push({ name: 'Profile' })" aria-label="Profil">
        <div class="avatar">
          <span>{{ userInitial }}</span>
        </div>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useGamingStore } from '@/stores/gamingStore'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const gamingStore = useGamingStore()

const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() ?? '?')

const unreadCount = computed(() => notificationStore.unreadNotifications?.length ?? 0)

const currentStreak = computed(() => {
  const daily = gamingStore.streaks?.find((s: any) => s.type === 'daily')
  return daily?.current_count ?? 0
})

// ✅ FIX: safeLevel défini
const safeLevel = computed(
  () => gamingStore.currentLevel?.level ?? authStore.user?.level?.level ?? 1,
)
</script>

<style scoped>
.quest-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(15, 15, 26, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  /* ✅ FIX safe area iOS */
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
}

/* ===== LOGO ===== */
.quest-header__logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ✅ FIX: position relative pour le badge absolu */
.logo-icon-wrap {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

/* ✅ FIX: badge niveau positionné correctement */
.level-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: #22c55e;
  border: 2px solid #0f0f1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: white;
  line-height: 1;
}

/* ✅ FIX: typo blanche en CSS scoped (pas Tailwind) */
.logo-text {
  font-size: 17px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
  /* Masqué sur très petits écrans */
  display: none;
}

@media (min-width: 380px) {
  .logo-text {
    display: block;
  }
}

/* ===== ACTIONS ===== */
.quest-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.streak-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid rgba(249, 115, 22, 0.3);
  color: #fb923c;
  white-space: nowrap;
}

.icon-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}
.icon-btn:active {
  transform: scale(0.95);
}

.icon-btn__icon {
  font-size: 16px;
}

.icon-btn__badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border: 2px solid #0f0f1a;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: white;
}
</style>
