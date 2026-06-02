<template>
  <aside :class="sidebarClasses">
    <!-- Gaming Stats Header (quand sidebar ouverte) -->
    <div
      v-if="isOpen"
      class="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200"
    >
      <div class="space-y-3">
        <!-- Daily Progress -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">ProgrÃ¨s du jour</span>
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
            <div class="text-xs text-gray-500">SuccÃ¨s</div>
          </div>
          <div class="bg-white rounded-lg p-2">
            <div class="text-lg font-bold text-green-600">{{ currentStreak }}</div>
            <div class="text-xs text-gray-500">SÃ©rie</div>
          </div>
          <div class="bg-white rounded-lg p-2">
            <div class="text-lg font-bold text-purple-600">{{ weeklyRank }}</div>
            <div class="text-xs text-gray-500">Rang</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex flex-col" :style="{ height: navHeight }">
      <!-- Primary Navigation -->
      <div class="flex-1 px-2 py-4 space-y-1 sidebar-scroll overflow-y-auto">
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
            active-class="bg-blue-100 text-blue-700"
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

            <!-- Badge pour nouvelles fonctionnalitÃ©s -->
            <span
              v-if="item.badge && isOpen"
              class="ml-auto px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full font-medium"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </template>
      </div>

      <!-- Gaming Quick Actions (quand sidebar ouverte) -->
      <div v-if="isOpen" class="px-4 py-4 border-t border-gray-200 bg-gray-50">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Actions Rapides
        </h3>

        <div class="space-y-2">
          <button
            @click="openQuickTransaction"
            class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <PlusIcon class="w-4 h-4" />
            <span>Transaction rapide</span>
          </button>

          <button
            @click="openDailyChallenge"
            class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <StarIcon class="w-4 h-4" />
            <span>DÃ©fi du jour</span>
          </button>
        </div>
      </div>

      <!-- Toggle button (desktop) -->
      <div class="hidden lg:block p-2 border-t border-gray-200">
        <button
          @click="$emit('toggle-sidebar')"
          class="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGamingStore } from '@/stores/gamingStore'
import { useApiHealth } from '@/composables/core/useApiHealth'
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
  FolderIcon,
  CalendarIcon,
  LightBulbIcon,
} from '@heroicons/vue/24/outline'

// Props
interface Props {
  isOpen: boolean
  currentRoute?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentRoute: '',
})

// Emits
defineEmits<{
  close: []
  'toggle-sidebar': []
}>()

// Composables
const route = useRoute()
const gamingStore = useGamingStore()
const apiHealth = useApiHealth()

// Responsive
const breakpoints = useBreakpoints({ lg: 1024 })
const isMobile = computed(() => !breakpoints.lg.value)

// âœ… Position adaptative selon l'API status
const showApiStatus = computed(() => !apiHealth.isConnected.value || import.meta.env.DEV)

const sidebarClasses = computed(() => {
  const baseClasses = [
    'fixed left-0 z-20 transition-all duration-300 bg-white border-r border-gray-200',
    props.isOpen ? 'w-64' : 'w-16',
    'lg:translate-x-0',
    props.isOpen || !isMobile.value ? 'translate-x-0' : '-translate-x-full',
  ]

  // Position adaptative selon l'Ã©tat de l'API
  if (showApiStatus.value) {
    baseClasses.push('top-28') // 48px (API) + 64px (Header) = 112px
  } else {
    baseClasses.push('top-16') // 64px (juste Header)
  }

  return baseClasses
})

// âœ… Hauteur adaptative pour le contenu de navigation
const navHeight = computed(() => {
  // Calculer la hauteur restante selon la position
  if (showApiStatus.value) {
    return 'calc(100vh - 112px)' // Soustraire API (48px) + Header (64px)
  } else {
    return 'calc(100vh - 64px)' // Soustraire seulement Header (64px)
  }
})

// Computed gaming stats
const dailyProgress = computed(() => gamingStore.dailyProgress || 0)
const totalAchievements = computed(() => gamingStore.achievements?.length || 0)
const currentStreak = computed(() => gamingStore.currentStreak || 0)
const weeklyRank = computed(() => gamingStore.weeklyRank || '--')

// Navigation structure
const navigationItems = [
  // Dashboard
  { type: 'link', name: 'Dashboard', href: '/app/dashboard', icon: HomeIcon },

  // Section Finances
  { type: 'header', name: 'Finances' },
  { type: 'link', name: 'Transactions', href: '/app/transactions', icon: CreditCardIcon },
  { type: 'link', name: 'Budget', href: '/app/categories', icon: ChartBarIcon },
  { type: 'link', name: 'Objectifs', href: '/app/goals', icon: CalendarIcon },

  // Section Gaming
  { type: 'header', name: 'Gaming' },
  { type: 'link', name: 'Gaming Center', href: '/app/gaming', icon: TrophyIcon, badge: 'NEW' },
  { type: 'link', name: 'SuccÃ¨s', href: '/app/achievements', icon: TrophyIcon },
  { type: 'link', name: 'DÃ©fis', href: '/app/challenges', icon: StarIcon },

  // Section Outils
  { type: 'header', name: 'Outils' },
  { type: 'link', name: 'Analytics', href: '/app/analytics', icon: LightBulbIcon },
  { type: 'link', name: 'Connexions', href: '/app/banking', icon: CogIcon },
  { type: 'link', name: 'Profil', href: '/app/profile', icon: UserGroupIcon },
]

// Methods
const isCurrentRoute = (href: string): boolean => {
  const currentPath = route.path

  // Si on est sur une route /app/*, comparer avec le href
  if (currentPath.startsWith('/app/') && href.startsWith('/app/')) {
    return currentPath === href
  }

  // Fallback pour les autres routes
  return currentPath.startsWith(href)
}

const openQuickTransaction = (): void => {
  // Ã‰mettre un Ã©vÃ©nement pour ouvrir la modal de transaction rapide
  console.log('Opening quick transaction modal')
  // TODO: ImplÃ©menter ouverture modal
}

const openDailyChallenge = (): void => {
  // Router vers le dÃ©fi du jour
  console.log('Opening daily challenge')
  // TODO: Router.push('/app/challenges/daily')
}
</script>

<style scoped>
/* Custom scrollbar pour la sidebar */
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

/* Animation pour les badges */
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

/* Transition fluide pour le repositionnement */
.sidebar-adaptive {
  transition:
    top 0.3s ease,
    height 0.3s ease;
}
</style>
