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

      <!-- ✅ OVERLAY MOBILE CORRIGÉ -->
      <div
        v-if="sidebarOpen && isMobile"
        class="fixed inset-0 bg-black opacity-50 z-30 lg:hidden transition-opacity duration-300"
        :style="overlayStyles"
        @click="closeSidebar"
        @touchstart="closeSidebar"
      />

      <!-- ✅ CONTENU PRINCIPAL avec padding-top dynamique -->
      <main
        class="flex-1 transition-all duration-300 relative"
        :class="[
          'bg-white',
          'min-h-screen',
          sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-16'
        ]"
        :style="mainStyles"
      >
        <!-- ✅ WRAPPER POUR LE CONTENU -->
        <div class="p-4 lg:p-6 w-full" style="background-color: white; min-height: 100%;">
          <!-- ✅ Status visible pour debug (à supprimer en prod) -->
          <div v-if="isDevelopment" class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-blue-800 text-sm">
              🔧 <strong>Debug Info:</strong><br>
              • Route: {{ currentRoute }} ({{ $route.path }})<br>
              • API Status visible: {{ showApiStatus ? 'Oui' : 'Non' }}<br>
              • Padding-top: {{ showApiStatus ? '112px (pt-28)' : '64px (pt-16)' }}<br>
              • User level: {{ userLevel }} | XP: {{ userXP }}<br>
              • Sidebar open: {{ sidebarOpen }}<br>
              • Is mobile: {{ isMobile }}
            </p>
          </div>

          <!-- ✅ SLOT PRINCIPAL pour le contenu des pages -->
          <router-view />
        </div>
      </main>
    </div>

    <!-- Footer avec marge adaptative -->
    <AppFooter
      class="transition-all duration-300"
      :class="footerClasses"
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

// ✅ RÉCUPÉRER l'état API depuis le composant parent (App.vue)
const showApiStatus = inject('showApiStatus', ref(false))

// Stores
const authStore = useAuthStore()
const gamingStore = useGamingStore()
const route = useRoute()

// State
const sidebarOpen = ref(false)
const gamingNotificationsEnabled = ref(false)
const isDevelopment = computed(() => import.meta.env.DEV)

// Computed avec valeurs par défaut SÉCURISÉES
const currentUser = computed(() => authStore.user)

// ✅ Valeurs par défaut pour éviter undefined
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

const currentRoute = computed(() => route.name as string)

// Responsive
const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
})
const isMobile = computed(() => !breakpoints.lg.value)

// ✅ CLASSES POUR LE CONTENU PRINCIPAL
const mainClasses = computed(() => {
  const classes = [
    // Marge gauche responsive selon l'état de la sidebar
    sidebarOpen.value && !isMobile.value ? 'lg:ml-64' : 'lg:ml-16',
    'min-h-screen'
  ]

  return classes
})

// ✅ STYLES POUR LE CONTENU PRINCIPAL
const mainStyles = computed(() => {
  const styles: Record<string, string> = {}

  // Padding-top dynamique selon l'API status
  if (showApiStatus.value) {
    styles.paddingTop = '112px' // API status (48px) + Header (64px)
  } else {
    styles.paddingTop = '64px' // Juste le header
  }

  return styles
})

// ✅ STYLES POUR L'OVERLAY MOBILE
const overlayStyles = computed(() => {
  const styles: Record<string, string> = {}

  // Position top identique au contenu pour éviter de couvrir le header
  if (showApiStatus.value) {
    styles.top = '112px'
    styles.height = 'calc(100vh - 112px)'
  } else {
    styles.top = '64px'
    styles.height = 'calc(100vh - 64px)'
  }

  return styles
})

// ✅ CLASSES POUR LE FOOTER
const footerClasses = computed(() => [
  sidebarOpen.value && !isMobile.value ? 'lg:ml-64' : 'lg:ml-16'
])

/**
 * Toggle sidebar visibility
 */
const toggleSidebar = (): void => {
  sidebarOpen.value = !sidebarOpen.value
  console.log('🎮 Sidebar toggled:', sidebarOpen.value)

  // ✅ Désactiver le scroll du body quand sidebar ouverte sur mobile
  if (isMobile.value) {
    document.body.style.overflow = sidebarOpen.value ? 'hidden' : 'auto'
  }
}

/**
 * Fermer sidebar (utile pour mobile)
 */
const closeSidebar = (): void => {
  sidebarOpen.value = false

  // ✅ Réactiver le scroll du body
  if (isMobile.value) {
    document.body.style.overflow = 'auto'
  }
}

/**
 * Handle keyboard shortcuts
 */
const handleKeyboard = (event: KeyboardEvent): void => {
  // Ctrl/Cmd + B pour toggle sidebar
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    toggleSidebar()
  }

  // Escape pour fermer sidebar sur mobile
  if (event.key === 'Escape' && sidebarOpen.value && isMobile.value) {
    closeSidebar()
  }
}

/**
 * Auto-fermer sidebar en mobile au changement de route
 */
const autoCloseSidebarOnMobile = (): void => {
  if (isMobile.value && sidebarOpen.value) {
    closeSidebar()
  }
}

// ✅ WATCHER pour gérer les changements de breakpoint
watch(isMobile, (newIsMobile) => {
  console.log('📱 Breakpoint changed, isMobile:', newIsMobile)

  if (newIsMobile) {
    // Passage en mode mobile : fermer la sidebar
    sidebarOpen.value = false
    document.body.style.overflow = 'auto'
  } else {
    // Passage en mode desktop : ouvrir la sidebar
    sidebarOpen.value = true
    document.body.style.overflow = 'auto'
  }
})

// Lifecycle
onMounted(async () => {
  console.log('🎮 AppLayout monté, initialisation...')

  // Charger les données initiales avec gestion d'erreur
  try {
    await Promise.all([
      authStore.loadUser ? authStore.loadUser() : Promise.resolve(),
      gamingStore.loadPlayerData ? gamingStore.loadPlayerData() : Promise.resolve()
    ])
    console.log('✅ Données AppLayout chargées')
  } catch (error) {
    console.warn('⚠️ Erreur chargement données initiales:', error)
    // Continuer même si le chargement échoue
  }

  // Event listeners
  document.addEventListener('keydown', handleKeyboard)

  // ✅ CONFIGURATION INITIALE SELON LE DEVICE
  if (isMobile.value) {
    sidebarOpen.value = false // Fermée par défaut sur mobile
    document.body.style.overflow = 'auto'
  } else {
    sidebarOpen.value = true // Ouverte par défaut sur desktop
  }

  console.log('🎮 AppLayout prêt, sidebar:', sidebarOpen.value, 'API status visible:', showApiStatus.value)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
  // ✅ Cleanup: restaurer le scroll
  document.body.style.overflow = 'auto'
})

// Watcher pour auto-close sur mobile lors des changements de route
watch(() => route.path, (newPath, oldPath) => {
  console.log(`🧭 AppLayout route change: ${oldPath} → ${newPath}`)
  autoCloseSidebarOnMobile()
})
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
