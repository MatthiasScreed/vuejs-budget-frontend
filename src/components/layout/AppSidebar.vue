<template>
  <aside :class="sidebarClasses" :style="sidebarStyles">
    <!-- Gaming Stats Header (quand sidebar ouverte) -->
    <div
      v-if="isOpen"
      class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 shrink-0"
    >
      <div class="space-y-3">
        <!-- Daily Progress -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">{{ t('gaming.dailyProgress') }}</span>
          <span class="text-sm text-blue-600 font-semibold">{{ dailyProgress }}%</span>
        </div>
        <div class="w-full h-2 bg-gray-200 rounded-full">
          <div
            class="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
            :style="{ width: `${dailyProgress}%` }"
          ></div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-white rounded-lg p-2">
            <div class="text-lg font-bold text-blue-600">{{ totalAchievements }}</div>
            <div class="text-xs text-gray-500">{{ t('gaming.achievements') }}</div>
          </div>
          <div class="bg-white rounded-lg p-2">
            <div class="text-lg font-bold text-green-600">{{ currentStreak }}</div>
            <div class="text-xs text-gray-500">{{ t('gaming.streak') }}</div>
          </div>
          <div class="bg-white rounded-lg p-2">
            <div class="text-lg font-bold text-purple-600">{{ weeklyRank }}</div>
            <div class="text-xs text-gray-500">{{ t('gaming.rank') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex flex-col flex-1 min-h-0">
      <!-- Primary Navigation -->
      <div class="flex-1 px-2 py-4 space-y-1 overflow-y-auto sidebar-scroll">
        <template v-for="item in navigationItems" :key="item.name">
          <!-- Section header -->
          <div
            v-if="item.type === 'header' && isOpen"
            class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            {{ item.name }}
          </div>

          <!-- Navigation item -->
          <router-link
            v-else-if="item.type === 'link'"
            :to="item.href"
            class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="[
              isCurrentRoute(item.href)
                ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-500'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
              !isOpen && 'justify-center',
            ]"
            @click="handleNavClick"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 transition-colors"
              :class="[
                isCurrentRoute(item.href)
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-gray-600',
                isOpen ? 'mr-3' : '',
              ]"
            />
            <span v-if="isOpen" class="truncate">{{ item.name }}</span>

            <!-- Badge pour nouvelles fonctionnalités -->
            <span
              v-if="item.badge && isOpen"
              class="ml-auto px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full font-medium"
            >
              {{ item.badge }}
            </span>

            <!-- ✅ Badge compteur insights non lus -->
            <span
              v-if="item.href === '/app/insights' && unreadInsightsCount > 0 && isOpen"
              class="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-bold"
            >
              {{ unreadInsightsCount }}
            </span>
          </router-link>
        </template>
      </div>

      <!-- Gaming Quick Actions (quand sidebar ouverte) -->
      <div v-if="isOpen" class="px-4 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {{ t('sidebar.quickActions') }}
        </h3>

        <div class="space-y-2">
          <button
            @click="openQuickTransaction"
            class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <PlusIcon class="w-4 h-4" />
            <span>{{ t('sidebar.quickTransaction') }}</span>
          </button>

          <button
            @click="openDailyChallenge"
            class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <StarIcon class="w-4 h-4" />
            <span>{{ t('sidebar.dailyChallenge') }}</span>
          </button>
        </div>
      </div>

      <!-- Toggle button (desktop) -->
      <div class="hidden lg:block p-2 border-t border-gray-200 shrink-0">
        <button
          @click="emit('toggle-sidebar')"
          class="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          :aria-label="t('common.toggleSidebar')"
        >
          <ChevronLeftIcon
            class="w-5 h-5 transition-transform duration-200"
            :class="{ 'rotate-180': !isOpen }"
          />
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGamingStore } from '@/stores/gamingStore'
import { useInsightStore } from '@/stores/insightStore'
import { useBreakpoints } from '@vueuse/core'
import {
  HomeIcon,
  CreditCardIcon,
  ChartBarIcon,
  TrophyIcon,
  UserGroupIcon,
  CogIcon,
  PlusIcon,
  StarIcon,
  ChevronLeftIcon,
  CalendarIcon,
  LightBulbIcon,
} from '@heroicons/vue/24/outline'

// ✅ Utiliser vue-i18n
const { t } = useI18n()

// Props
interface Props {
  isOpen: boolean
  currentRoute?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentRoute: '',
})

const emit = defineEmits<{
  close: []
  'toggle-sidebar': []
}>()

// Composables
const route = useRoute()
const gamingStore = useGamingStore()
const insightStore = useInsightStore()

const showApiStatus = inject('showApiStatus', ref(false))

// Responsive
const breakpoints = useBreakpoints({ lg: 1024 })
const isMobile = computed(() => !breakpoints.lg.value)

const sidebarClasses = computed(() => {
  const baseClasses = [
    'fixed left-0 transition-all duration-300 bg-white border-r border-gray-200',
    'z-40',
    props.isOpen ? 'w-64' : 'w-16',
    'lg:translate-x-0',
  ]

  if (isMobile.value) {
    baseClasses.push(props.isOpen ? 'translate-x-0' : '-translate-x-full')
  } else {
    baseClasses.push('translate-x-0')
  }

  return baseClasses
})

const sidebarStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (showApiStatus.value) {
    styles.top = '112px'
    styles.height = 'calc(100vh - 112px)'
  } else {
    styles.top = '64px'
    styles.height = 'calc(100vh - 64px)'
  }

  if (isMobile.value) {
    styles.height = showApiStatus.value ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)'
    styles.maxHeight = styles.height
  }

  return styles
})

// Computed gaming stats
const dailyProgress = computed(() => gamingStore.dailyProgress || 0)
const totalAchievements = computed(() => gamingStore.achievements?.length || 0)
const currentStreak = computed(() => gamingStore.currentStreak || 0)
const weeklyRank = computed(() => gamingStore.weeklyRank || '--')

// ✅ Compteur insights non lus
const unreadInsightsCount = computed(() => insightStore.unreadCount || 0)

// ✅ Navigation structure avec i18n + INSIGHTS
const navigationItems = computed(() => [
  // Dashboard
  { type: 'link', name: t('nav.dashboard'), href: '/app/dashboard', icon: HomeIcon },

  // Section Finances
  { type: 'header', name: t('sidebar.sectionFinances') },
  { type: 'link', name: t('nav.transactions'), href: '/app/transactions', icon: CreditCardIcon },
  { type: 'link', name: t('nav.budget'), href: '/app/categories', icon: ChartBarIcon },
  { type: 'link', name: t('nav.goals'), href: '/app/goals', icon: CalendarIcon },

  // ✅ INSIGHTS AJOUTÉ ICI
  {
    type: 'link',
    name: 'Coach IA',
    href: '/app/insights',
    icon: LightBulbIcon,
    badge: unreadInsightsCount.value > 0 ? String(unreadInsightsCount.value) : undefined,
  },

  // Section Gaming
  { type: 'header', name: t('sidebar.sectionGaming') },
  {
    type: 'link',
    name: t('nav.gamingCenter'),
    href: '/app/gaming',
    icon: TrophyIcon,
    badge: t('sidebar.badgeNew'),
  },
  { type: 'link', name: t('nav.achievements'), href: '/app/gaming/achievements', icon: TrophyIcon },
  { type: 'link', name: t('nav.challenges'), href: '/app/gaming/challenges', icon: StarIcon },

  // Section Outils
  { type: 'header', name: t('sidebar.sectionTools') },
  { type: 'link', name: t('nav.analytics'), href: '/app/analytics', icon: ChartBarIcon },
  { type: 'link', name: t('nav.connections'), href: '/app/banking', icon: CogIcon },
  { type: 'link', name: t('nav.profile'), href: '/app/profile', icon: UserGroupIcon },
])

const isCurrentRoute = (href: string): boolean => {
  const currentPath = route.path
  return currentPath === href || currentPath.startsWith(href + '/')
}

const handleNavClick = (): void => {
  if (isMobile.value && props.isOpen) {
    setTimeout(() => {
      emit('close')
    }, 100)
  }
}

const openQuickTransaction = (): void => {
  console.log('Opening quick transaction modal')
}

const openDailyChallenge = (): void => {
  console.log('Opening daily challenge')
}

// ✅ Charger le summary au montage pour avoir le compteur
onMounted(async () => {
  try {
    await insightStore.loadSummary()
  } catch (error) {
    console.error('Erreur chargement insights summary:', error)
  }
})
</script>

<style scoped>
/* ✅ SCROLLBAR CUSTOM AMÉLIORÉE */
.sidebar-scroll {
  overflow-y: auto;
  /* Smooth scrolling sur mobile */
  -webkit-overflow-scrolling: touch;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 4px;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgb(209, 213, 219);
  border-radius: 4px;
}

.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: rgb(156, 163, 175);
}

/* ✅ ANIMATIONS FLUIDES */
@keyframes badge-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.badge-animate {
  animation: badge-pulse 2s ease-in-out infinite;
}

/* ✅ CORRECTIFS MOBILES */
@media (max-width: 1023px) {
  /* Assurer que la sidebar mobile s'affiche correctement */
  .sidebar-mobile-fix {
    position: fixed !important;
    top: var(--sidebar-top, 64px) !important;
    height: var(--sidebar-height, calc(100vh - 64px)) !important;
    left: 0 !important;
    z-index: 40 !important;
  }
}

/* ✅ FIXES POUR IOS SAFARI */
@supports (-webkit-touch-callout: none) {
  /* iOS Safari specific fixes */
  .sidebar-scroll {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
