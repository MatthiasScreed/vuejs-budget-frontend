<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { useGamingStore } from '@/stores/gamingStore'
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  FireIcon,
  TrophyIcon,
  UserIcon,
  CogIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

// ✅ Utiliser vue-i18n
const { t } = useI18n()

// Props avec valeurs par défaut et validation
interface Props {
  user?: any
  level?: number
  xp?: number
  showApiStatus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  level: 1,
  xp: 0,
  showApiStatus: false,
})

// Emits
defineEmits<{
  'toggle-sidebar': []
}>()

// Stores & Composables
const router = useRouter()
const authStore = useAuthStore()
const gamingStore = useGamingStore()

// State
const notificationsOpen = ref(false)
const profileOpen = ref(false)

// Computed avec valeurs sécurisées
const safeLevel = computed(() => props.level || 1)
const safeXP = computed(() => props.xp || 0)

const nextLevelXP = computed(() => {
  return (safeLevel.value + 1) * 1000
})

const xpProgress = computed(() => {
  const currentLevelXP = safeLevel.value * 1000
  const currentXP = safeXP.value - currentLevelXP
  const requiredXP = nextLevelXP.value - currentLevelXP

  if (requiredXP <= 0) return 0
  return Math.min((currentXP / requiredXP) * 100, 100)
})

const currentStreak = computed(() => gamingStore.currentStreak || 0)
const unreadCount = computed(() => gamingStore.unreadNotifications || 0)

const headerClasses = computed(() => {
  return [
    'fixed left-0 right-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200',
    props.showApiStatus ? 'top-12' : 'top-0',
  ]
})

// ✅ Notifications avec i18n
const recentNotifications = computed(() => [
  {
    id: 1,
    icon: '🏆',
    title: t('notifications.achievementUnlocked'),
    time: t('notifications.minutesAgo', { n: 2 }),
    type: 'achievement',
  },
  {
    id: 2,
    icon: '💰',
    title: t('notifications.goalReached'),
    time: t('notifications.hoursAgo', { n: 1 }),
    type: 'goal',
  },
  {
    id: 3,
    icon: '⚡',
    title: t('notifications.streakDays', { n: 7 }),
    time: t('notifications.hoursAgo', { n: 3 }),
    type: 'streak',
  },
])

// ✅ Profile menu avec i18n
const profileMenuItems = computed(() => [
  { name: t('nav.profile'), href: '/profile', icon: UserIcon },
  { name: t('nav.analytics'), href: '/stats', icon: ChartBarIcon },
  { name: t('nav.settings'), href: '/settings', icon: CogIcon },
])

// Methods
const toggleNotifications = (): void => {
  notificationsOpen.value = !notificationsOpen.value
  profileOpen.value = false
}

const toggleProfile = (): void => {
  profileOpen.value = !profileOpen.value
  notificationsOpen.value = false
}

const closeProfile = (): void => {
  profileOpen.value = false
}

const handleNotificationClick = (notification: any): void => {
  switch (notification.type) {
    case 'achievement':
      router.push('/achievements')
      break
    case 'goal':
      router.push('/goals')
      break
    case 'streak':
      router.push('/dashboard')
      break
  }
  notificationsOpen.value = false
}

const handleLogout = async (): Promise<void> => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

// Fermer dropdowns au clic extérieur
import { onClickOutside } from '@vueuse/core'

const notificationsRef = ref(null)
const profileRef = ref(null)

onClickOutside(notificationsRef, () => {
  notificationsOpen.value = false
})
onClickOutside(profileRef, () => {
  profileOpen.value = false
})
</script>

<template>
  <header :class="headerClasses">
    <div class="flex items-center justify-between h-16 px-4">
      <!-- Left side: Logo + Menu toggle -->
      <div class="flex items-center space-x-4">
        <button
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          :aria-label="t('common.toggleSidebar')"
        >
          <Bars3Icon class="w-6 h-6 text-gray-600" />
        </button>

        <router-link to="/dashboard" class="flex items-center space-x-3">
          <div class="relative">
            <img src="@/assets/images/icon/icon.svg" class="w-10" alt="CoinQuest" />
            <div
              class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            >
              <span class="text-xs text-white font-bold">{{ safeLevel }}</span>
            </div>
          </div>
          <span class="text-xl font-bold text-gray-900 hidden sm:block">CoinQuest</span>
        </router-link>
      </div>

      <!-- Center: Barre XP (desktop seulement) -->
      <div class="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div class="w-full">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">
              {{ t('gaming.level') }} {{ safeLevel }}
            </span>
            <span class="text-sm text-gray-500"
              >{{ safeXP }}/{{ nextLevelXP }} {{ t('gaming.xp') }}</span
            >
          </div>
          <div class="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              :style="{ width: `${xpProgress}%` }"
            >
              <div
                class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Actions + Profile -->
      <div class="flex items-center space-x-3">
        <!-- Streak indicator -->
        <div
          v-if="currentStreak > 0"
          class="hidden sm:flex items-center space-x-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full"
        >
          <FireIcon class="w-4 h-4" />
          <span class="text-sm font-semibold">{{ currentStreak }}</span>
        </div>

        <!-- ✅ LANGUAGE SWITCHER -->
        <LanguageSwitcher />

        <!-- Notifications -->
        <button
          @click="toggleNotifications"
          class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          :class="{ 'bg-blue-50': notificationsOpen }"
          :aria-label="t('notifications.title')"
        >
          <BellIcon class="w-6 h-6 text-gray-600" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <!-- Dropdown notifications -->
        <div
          v-if="notificationsOpen"
          ref="notificationsRef"
          class="absolute w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-40"
          :class="showApiStatus ? 'top-20' : 'top-16'"
          style="right: 1rem"
        >
          <div class="px-4 py-2 border-b border-gray-100">
            <h3 class="font-semibold text-gray-900">{{ t('notifications.title') }}</h3>
          </div>

          <div class="max-h-64 overflow-y-auto">
            <div
              v-for="notification in recentNotifications"
              :key="notification.id"
              class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start space-x-3">
                <div class="text-2xl">{{ notification.icon }}</div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                  <p class="text-xs text-gray-500">{{ notification.time }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="px-4 py-2 border-t border-gray-100">
            <button class="text-sm text-blue-600 hover:text-blue-700">
              {{ t('notifications.viewAll') }}
            </button>
          </div>
        </div>

        <!-- Profile dropdown -->
        <div class="relative">
          <button
            @click="toggleProfile"
            class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <span class="text-white text-sm font-bold">
                {{ (props.user?.name?.charAt(0) || 'U').toUpperCase() }}
              </span>
            </div>

            <div class="hidden lg:block text-left">
              <p class="text-sm font-medium text-gray-900">
                {{ props.user?.name || t('common.player') }}
              </p>
              <p class="text-xs text-gray-500">{{ t('gaming.level') }} {{ safeLevel }}</p>
            </div>

            <ChevronDownIcon class="w-4 h-4 text-gray-500" />
          </button>

          <!-- Dropdown menu -->
          <div
            v-if="profileOpen"
            ref="profileRef"
            class="absolute right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-40"
            :class="showApiStatus ? 'top-16' : 'top-12'"
          >
            <!-- Profile header -->
            <div class="px-4 py-3 border-b border-gray-100">
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                >
                  <span class="text-white text-lg font-bold">
                    {{ (props.user?.name?.charAt(0) || 'U').toUpperCase() }}
                  </span>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">
                    {{ props.user?.name || t('common.player') }}
                  </p>
                  <p class="text-sm text-gray-500">{{ props.user?.email }}</p>
                  <div class="flex items-center space-x-1 mt-1">
                    <TrophyIcon class="w-4 h-4 text-yellow-500" />
                    <span class="text-sm font-medium">{{ t('gaming.level') }} {{ safeLevel }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Menu items -->
            <nav class="py-2">
              <router-link
                v-for="item in profileMenuItems"
                :key="item.name"
                :to="item.href"
                class="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                @click="closeProfile"
              >
                <component :is="item.icon" class="w-5 h-5 text-gray-400" />
                <span class="text-sm">{{ item.name }}</span>
              </router-link>
            </nav>

            <!-- Logout -->
            <div class="border-t border-gray-100 pt-2">
              <button
                @click="handleLogout"
                class="flex items-center space-x-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon class="w-5 h-5" />
                <span class="text-sm">{{ t('auth.logout') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Animation pour la barre XP */
@keyframes xp-gain {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

.xp-bar-fill {
  animation: xp-gain 1s ease-out;
}

/* Effet hover sur avatar */
.avatar-hover {
  transition: all 0.2s ease;
}

.avatar-hover:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

/* Transitions fluides pour les changements de position */
.fixed {
  transition: top 0.3s ease;
}
</style>
