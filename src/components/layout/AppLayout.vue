<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <!-- Header fixe avec props API status -->
    <AppHeader
      :user="currentUser"
      :level="userLevel"
      :xp="userXP"
      :show-api-status="showApiStatus"
      @toggle-sidebar="toggleSidebar"
    />

    <div class="flex relative">
      <!-- Sidebar -->
      <AppSidebar
        :is-open="sidebarOpen"
        :current-route="currentRoute"
        @close="closeSidebar"
        @toggle-sidebar="toggleSidebar"
      />

      <!-- Overlay mobile -->
      <div
        v-if="sidebarOpen && isMobile"
        class="fixed inset-0 bg-black opacity-50 z-30 lg:hidden transition-opacity duration-300"
        :style="overlayStyles"
        @click="closeSidebar"
        @touchstart="closeSidebar"
      />

      <!-- Contenu principal -->
      <main
        class="flex-1 transition-all duration-300 relative"
        :class="['bg-white', 'min-h-screen', sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-16']"
        :style="mainStyles"
      >
        <div class="p-4 lg:p-6 w-full" style="background-color: white; min-height: 100%">
          <!-- Debug Info (dev only) -->
          <div v-if="isDevelopment" class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-blue-800 text-sm">
              🔧 <strong>{{ t('debug.info') }}:</strong><br />
              • {{ t('debug.route') }}: {{ currentRoute }} ({{ $route.path }})<br />
              • {{ t('debug.apiStatusVisible') }}:
              {{ showApiStatus ? t('common.yes') : t('common.no') }}<br />
              • {{ t('debug.paddingTop') }}: {{ showApiStatus ? '112px (pt-28)' : '64px (pt-16)'
              }}<br />
              • {{ t('debug.userLevel') }}: {{ userLevel }} | {{ t('gaming.xp') }}: {{ userXP
              }}<br />
              • {{ t('debug.sidebarOpen') }}: {{ sidebarOpen }}<br />
              • {{ t('debug.isMobile') }}: {{ isMobile }}
            </p>
          </div>

          <!-- Slot principal -->
          <router-view />
        </div>
      </main>
    </div>

    <!-- Footer -->
    <AppFooter class="transition-all duration-300" :class="footerClasses" />

    <!-- Notifications gaming -->
    <GamingNotifications v-if="gamingNotificationsEnabled" />

    <!-- ✅ Modal Onboarding pour nouveaux utilisateurs -->
    <OnboardingModal :show="showOnboarding" @close="closeOnboarding" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { useGamingStore } from '@/stores/gamingStore'
import { useBreakpoints } from '@vueuse/core'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'
import GamingNotifications from '@/components/gaming/GamingNotifications.vue'
import OnboardingModal from '@/components/OnboardingModal.vue'

// ✅ Utiliser vue-i18n
const { t } = useI18n()

const showApiStatus = inject('showApiStatus', ref(false))

// Stores
const authStore = useAuthStore()
const gamingStore = useGamingStore()
const route = useRoute()

// State
const sidebarOpen = ref(false)
const gamingNotificationsEnabled = ref(false)
const showOnboarding = ref(false) // ✅ Ajouter
const isDevelopment = computed(() => import.meta.env.DEV)

// Computed avec valeurs par défaut sécurisées
const currentUser = computed(() => authStore.user)

const userLevel = computed(() => {
  if (gamingStore.player?.level) return gamingStore.player.level
  if (authStore.user?.level?.level) return authStore.user.level.level
  return 1
})

const userXP = computed(() => {
  if (gamingStore.player?.currentXP !== undefined) return gamingStore.player.currentXP
  if (authStore.user?.level?.current_xp !== undefined) return authStore.user.level.current_xp
  return 0
})

// ✅ Ajouter ces fonctions
function checkOnboarding(): void {
  const completed = localStorage.getItem('onboarding_completed')
  if (!completed) {
    setTimeout(() => {
      showOnboarding.value = true
    }, 500)
  }
}

function closeOnboarding(): void {
  showOnboarding.value = false
}

const currentRoute = computed(() => route.name as string)

// Responsive
const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
})
const isMobile = computed(() => !breakpoints.lg.value)

const mainClasses = computed(() => {
  const classes = [sidebarOpen.value && !isMobile.value ? 'lg:ml-64' : 'lg:ml-16', 'min-h-screen']

  return classes
})

const mainStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (showApiStatus.value) {
    styles.paddingTop = '112px'
  } else {
    styles.paddingTop = '64px'
  }

  return styles
})

const overlayStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (showApiStatus.value) {
    styles.top = '112px'
    styles.height = 'calc(100vh - 112px)'
  } else {
    styles.top = '64px'
    styles.height = 'calc(100vh - 64px)'
  }

  return styles
})

const footerClasses = computed(() => [
  sidebarOpen.value && !isMobile.value ? 'lg:ml-64' : 'lg:ml-16',
])

const toggleSidebar = (): void => {
  sidebarOpen.value = !sidebarOpen.value
  console.log('🎮 Sidebar toggled:', sidebarOpen.value)

  if (isMobile.value) {
    document.body.style.overflow = sidebarOpen.value ? 'hidden' : 'auto'
  }
}

const closeSidebar = (): void => {
  sidebarOpen.value = false

  if (isMobile.value) {
    document.body.style.overflow = 'auto'
  }
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

const autoCloseSidebarOnMobile = (): void => {
  if (isMobile.value && sidebarOpen.value) {
    closeSidebar()
  }
}

watch(isMobile, (newIsMobile) => {
  console.log('📱 Breakpoint changed, isMobile:', newIsMobile)

  if (newIsMobile) {
    sidebarOpen.value = false
    document.body.style.overflow = 'auto'
  } else {
    sidebarOpen.value = true
    document.body.style.overflow = 'auto'
  }
})

onMounted(async () => {
  console.log('🎮 AppLayout monté, initialisation...')

  try {
    await Promise.all([
      authStore.loadUser ? authStore.loadUser() : Promise.resolve(),
      gamingStore.loadPlayerData ? gamingStore.loadPlayerData() : Promise.resolve(),
    ])
    console.log('✅ Données AppLayout chargées')
  } catch (error) {
    console.warn('⚠️ Erreur chargement données initiales:', error)
  }

  // ✅ Vérifier si c'est un nouvel utilisateur
  checkOnboarding()

  document.addEventListener('keydown', handleKeyboard)

  if (isMobile.value) {
    sidebarOpen.value = false
    document.body.style.overflow = 'auto'
  } else {
    sidebarOpen.value = true
  }

  console.log(
    '🎮 AppLayout prêt, sidebar:',
    sidebarOpen.value,
    'API status visible:',
    showApiStatus.value,
  )
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
  document.body.style.overflow = 'auto'
})

watch(
  () => route.path,
  (newPath, oldPath) => {
    console.log(`🧭 AppLayout route change: ${oldPath} → ${newPath}`)
    autoCloseSidebarOnMobile()
  },
)
</script>

<style scoped>
/* ✅ TRANSITIONS AMÉLIORÉES */
.layout-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* S'assurer que le contenu principal est visible */
main {
  background-color: white;
  position: relative;
  z-index: 10; /* Plus bas que l'overlay et la sidebar */
}

main > div {
  background-color: white !important;
}

/* ✅ Classes utilitaires pour les différents paddings */
.pt-28 {
  padding-top: 7rem; /* 112px = header (64px) + API status (48px) */
}

.pt-16 {
  padding-top: 4rem; /* 64px = header seulement */
}

/* ✅ OVERLAY AMÉLIORÉ */
.overlay-mobile {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* ✅ CORRECTIFS POUR ÉVITER LE SCROLL HORIZONTAL */
.no-scroll {
  overflow: hidden !important;
}

/* Debug styles temporaires */
.debug-slot {
  border: 2px dashed #3b82f6;
  background-color: #eff6ff;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 0.5rem;
}

/* ✅ MEDIA QUERIES POUR FIXES SPÉCIFIQUES */
@media (max-width: 1023px) {
  /* Force la sidebar à être au-dessus du contenu sur mobile */
  main {
    margin-left: 0 !important;
  }

  aside {
    z-index: 40 !important;
  }

  /* L'overlay doit être en dessous de la sidebar mais au-dessus du contenu */
  .overlay-mobile {
    z-index: 30 !important;
  }
}

/* ✅ FIXES POUR IOS SAFARI */
@supports (-webkit-touch-callout: none) {
  /* iOS Safari specific fixes */
  body {
    -webkit-overflow-scrolling: touch;
  }

  main {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
