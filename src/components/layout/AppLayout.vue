<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <!-- Header fixe -->
    <AppHeader
      :user="currentUser"
      :level="userLevel"
      :xp="userXP"
      :show-api-status="false"
      @toggle-sidebar="toggleSidebar"
    />

    <div class="flex">
      <!-- Sidebar — desktop uniquement -->
      <AppSidebar :is-open="sidebarOpen" :current-route="currentRoute" @close="closeSidebar" />

      <!-- CONTENU PRINCIPAL -->
      <main
        class="flex-1 transition-all duration-300 bg-white pt-16 min-h-screen pb-20 lg:pb-6"
        :class="sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'"
      >
        <div class="p-4 lg:p-6 min-h-full">
          <QuestMiniCard v-if="showQuestCard" />
          <router-view />
        </div>
      </main>
    </div>

    <!-- Footer — desktop uniquement -->
    <AppFooter
      class="hidden lg:block transition-all duration-300"
      :class="sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'"
    />

    <!-- Overlay sidebar mobile -->
    <div
      v-if="sidebarOpen && isMobile"
      class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
      @click="closeSidebar"
    />

    <!-- ===== BOTTOM NAV MOBILE ===== -->
    <nav class="mobile-bottom-nav lg:hidden">
      <router-link
        to="/quete"
        class="mobile-nav-item"
        :class="{ 'mobile-nav-item--active': isRoute('/quete') }"
      >
        <span class="mobile-nav-item__icon">🎯</span>
        <span class="mobile-nav-item__label">Quête</span>
      </router-link>

      <router-link
        to="/app/transactions"
        class="mobile-nav-item"
        :class="{ 'mobile-nav-item--active': isRoute('/app/transactions') }"
      >
        <span class="mobile-nav-item__icon">💳</span>
        <span class="mobile-nav-item__label">Actions</span>
      </router-link>

      <router-link
        to="/app/analytics"
        class="mobile-nav-item"
        :class="{ 'mobile-nav-item--active': isRoute('/app/analytics') }"
      >
        <span class="mobile-nav-item__icon">📊</span>
        <span class="mobile-nav-item__label">Stats</span>
      </router-link>

      <router-link
        to="/app/profile"
        class="mobile-nav-item"
        :class="{ 'mobile-nav-item--active': isRoute('/app/profile') }"
      >
        <span class="mobile-nav-item__icon">👤</span>
        <span class="mobile-nav-item__label">Profil</span>
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/app/admin"
        class="mobile-nav-item mobile-nav-item--admin"
        :class="{ 'mobile-nav-item--active': isRoute('/app/admin') }"
      >
        <span class="mobile-nav-item__icon">🛡️</span>
        <span class="mobile-nav-item__label">Admin</span>
      </router-link>
    </nav>

    <!-- Notifications gaming -->
    <!--<GamingNotifications v-if="gamingNotificationsEnabled" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useGamingStore } from '@/stores/gamingStore'
import { useBreakpoints } from '@vueuse/core'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'
import GamingNotifications from '@/components/gaming/GamingNotifications.vue'
import QuestMiniCard from '@/components/quest/QuestMiniCard.vue'

const authStore = useAuthStore()
const gamingStore = useGamingStore()
const route = useRoute()

const sidebarOpen = ref(false)
const gamingNotificationsEnabled = ref(true)

const HIDE_QUEST_CARD_ROUTES = ['Quest', 'Onboarding', 'AdminDashboard']

const showQuestCard = computed(() => !HIDE_QUEST_CARD_ROUTES.includes(route.name as string))

// ==========================================
// COMPUTED
// ==========================================

const currentUser = computed(() => authStore.user)

const userLevel = computed(
  () => gamingStore.currentLevel?.level ?? authStore.user?.level?.level ?? 1,
)

const userXP = computed(() => gamingStore.totalXP ?? authStore.user?.level?.current_xp ?? 0)

const currentRoute = computed(() => route.name as string)

const breakpoints = useBreakpoints({ lg: 1024 })
const isMobile = computed(() => !breakpoints.lg.value)

const isAdmin = computed(() => !!authStore.user?.is_admin)

// ==========================================
// MÉTHODES
// ==========================================

const toggleSidebar = (): void => {
  sidebarOpen.value = !sidebarOpen.value
}
const closeSidebar = (): void => {
  sidebarOpen.value = false
}

const isRoute = (path: string): boolean => route.path === path || route.path.startsWith(path + '/')

const handleKeyboard = (e: KeyboardEvent): void => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault()
    toggleSidebar()
  }
  if (e.key === 'Escape' && sidebarOpen.value && isMobile.value) closeSidebar()
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // ✅ FIX: window.innerWidth évite le bug useBreakpoints non initialisé
  sidebarOpen.value = window.innerWidth >= 1024

  try {
    await Promise.all([authStore.loadUser?.(), gamingStore.loadPlayerData?.()])
  } catch {
    /* non bloquant */
  }

  document.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => document.removeEventListener('keydown', handleKeyboard))

watch(
  () => route.path,
  () => {
    if (isMobile.value) closeSidebar()
  },
)
</script>

<style scoped>
main {
  background-color: white;
}

/* ===== BOTTOM NAV MOBILE ===== */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid #e5e7eb;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 10px 4px;
  text-decoration: none;
  color: #9ca3af;
  transition: color 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.mobile-nav-item:active {
  transform: scale(0.93);
}

.mobile-nav-item--active {
  color: #7c3aed;
}

.mobile-nav-item--admin {
  color: #dc2626;
}

.mobile-nav-item__icon {
  font-size: 20px;
}
.mobile-nav-item__label {
  font-size: 10px;
  font-weight: 600;
}
</style>
