<!-- src/components/quest/QuestBottomNav.vue -->
<template>
  <nav class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.name"
      :class="['bottom-nav__item', { 'bottom-nav__item--active': isActive(item) }]"
      @click="navigate(item)"
      :aria-label="item.label"
    >
      <div class="bottom-nav__icon-wrap">
        <span class="bottom-nav__icon">{{ item.icon }}</span>
        <!-- Badge pour notifications -->
        <span v-if="item.name === 'Notifications' && unreadCount > 0" class="bottom-nav__badge">{{
          unreadCount > 9 ? '9+' : unreadCount
        }}</span>
      </div>
      <span class="bottom-nav__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

interface NavItem {
  name: string
  icon: string
  label: string
  routeName: string
}

const navItems: NavItem[] = [
  { name: 'Quest', icon: '🎯', label: 'Quête', routeName: 'Quest' },
  { name: 'Transactions', icon: '💳', label: 'Actions', routeName: 'Transactions' },
  { name: 'Notifications', icon: '🔔', label: 'Alertes', routeName: 'Notifications' },
  { name: 'Profile', icon: '👤', label: 'Profil', routeName: 'Profile' },
]

const unreadCount = computed(() => notificationStore.unreadNotifications?.length ?? 0)

function isActive(item: NavItem): boolean {
  return route.name === item.routeName
}

function navigate(item: NavItem): void {
  if (!isActive(item)) {
    router.push({ name: item.routeName })
  }
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px));
  background: rgba(15, 15, 26, 0.95);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
  padding: 8px 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.15s;
  color: rgba(255, 255, 255, 0.35);
  -webkit-tap-highlight-color: transparent;
}

.bottom-nav__item:active {
  transform: scale(0.93);
}

.bottom-nav__item--active {
  color: #a78bfa;
}

.bottom-nav__icon-wrap {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-nav__icon {
  font-size: 20px;
  transition: transform 0.15s;
}

.bottom-nav__item--active .bottom-nav__icon {
  transform: scale(1.1);
}

.bottom-nav__badge {
  position: absolute;
  top: -4px;
  right: -6px;
  background: #ef4444;
  color: white;
  font-size: 9px;
  font-weight: 700;
  min-width: 15px;
  height: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border: 2px solid #0f0f1a;
}

.bottom-nav__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Indicateur actif */
.bottom-nav__item--active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: #7c3aed;
  border-radius: 0 0 2px 2px;
}
</style>
