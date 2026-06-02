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
      <!-- Sidebar -->
      <AppSidebar :is-open="sidebarOpen" :current-route="currentRoute" @close="closeSidebar" />

      <!-- CONTENU PRINCIPAL -->
      <main
        class="flex-1 transition-all duration-300 bg-white pt-16 min-h-screen"
        :class="sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'"
      >
        <div class="p-4 lg:p-6 min-h-full">
          <!-- ✅ QUEST MINI CARD — visible sur toutes les pages -->
          <QuestMiniCard v-if="showQuestCard" />

          <!-- Contenu de la page -->
          <router-view />
        </div>
      </main>
    </div>

    <!-- Footer -->
    <AppFooter class="transition-all duration-300" :class="sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'" />

    <!-- Overlay mobile pour sidebar -->
    <div
      v-if="sidebarOpen && isMobile"
      class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
      @click="closeSidebar"
    />

    <!-- Notifications gaming flottantes -->
    <GamingNotifications v-if="gamingNotificationsEnabled" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useGamingStore } from '@/stores/gamingStore'
import { useBreakpoints } from '@vueuse/core'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'
import GamingNotifications from '@/components/gaming/GamingNotifications.vue'
import QuestMiniCard from '@/components/quest/QuestMiniCard.vue'

const showApiStatus = inject('showApiStatus', ref(false))

const authStore = useAuthStore()
const gamingStore = useGamingStore()
const route = useRoute()

const sidebarOpen = ref(false)
const gamingNotificationsEnabled = ref(true)

// Pages où la QuestMiniCard ne s'affiche pas (inutile sur la quête elle-même)
const HIDE_QUEST_CARD_ROUTES = ['Quest', 'Onboarding', 'AdminDashboard']

const showQuestCard = computed(() => !HIDE_QUEST_CARD_ROUTES.includes(route.name as string))

// ==========================================
// COMPUTED
// ==========================================

const currentUser = computed(() => authStore.user)

const userLevel = computed(() => {
  if (gamingStore.currentLevel?.level) return gamingStore.currentLevel.level
  if (authStore.user?.level?.level) return authStore.user.level.level
  return 1
})

const userXP = computed(() => {
  if (gamingStore.totalXP !== undefined) return gamingStore.totalXP
  if (authStore.user?.level?.current_xp !== undefined) return authStore.user.level.current_xp
  return 0
})

const currentRoute = computed(() => route.name as string)

const breakpoints = useBreakpoints({ sm: 640, md: 768, lg: 1024, xl: 1280 })
const isMobile = computed(() => !breakpoints.lg.value)

// ==========================================
// MÉTHODES
// ==========================================

const toggleSidebar = (): void => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = (): void => {
  sidebarOpen.value = false
}

const handleKeyboard = (event: KeyboardEvent): void => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    toggleSidebar()
  }
  if (event.key === 'Escape' && sidebarOpen.value && isMobile.value) {
    closeSidebar()
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  try {
    await Promise.all([
      authStore.loadUser ? authStore.loadUser() : Promise.resolve(),
      gamingStore.loadPlayerData ? gamingStore.loadPlayerData() : Promise.resolve(),
    ])
  } catch {
    // Continuer même si le chargement échoue
  }

  document.addEventListener('keydown', handleKeyboard)
  sidebarOpen.value = !isMobile.value // ouvert sur desktop, fermé sur mobile
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
})

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
  min-height: calc(100vh - 4rem);
}
</style>
