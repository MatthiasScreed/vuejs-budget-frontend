<!-- src/components/quest/QuestHeader.vue -->
<template>
  <header class="quest-header">
    <!-- Logo -->
    <div class="quest-header__logo">
      <span class="quest-header__logo-icon">🪙</span>
      <span class="quest-header__logo-text">CoinQuest</span>
    </div>

    <!-- Actions -->
    <div class="quest-header__actions">
      <!-- Streak badge -->
      <div v-if="currentStreak > 0" class="streak-badge">🔥 {{ currentStreak }}</div>

      <!-- Notifications -->
      <button
        class="icon-btn"
        @click="$router.push({ name: 'Notifications' })"
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
</script>

<style scoped>
.quest-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(15, 15, 26, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.quest-header__logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quest-header__logo-icon {
  font-size: 22px;
}

.quest-header__logo-text {
  font-size: 16px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
}

.quest-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Streak badge */
.streak-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid rgba(249, 115, 22, 0.3);
  color: #fb923c;
}

/* Icon buttons */
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

/* Avatar */
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
