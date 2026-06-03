<template>
  <aside :class="sidebarClasses">
    <!-- Header sidebar — quête + streak -->
    <div v-if="isOpen" class="sidebar-header">
      <div class="sidebar-quest" @click="goToQuest">
        <span class="sidebar-quest__emoji">{{ questEmoji }}</span>
        <div class="sidebar-quest__info">
          <span class="sidebar-quest__name">{{ questName }}</span>
          <div class="sidebar-quest__bar">
            <div class="sidebar-quest__fill" :style="{ width: questProgress + '%' }" />
          </div>
        </div>
        <span class="sidebar-quest__pct">{{ questProgress }}%</span>
      </div>

      <div class="sidebar-stats">
        <div class="sidebar-stat">
          <span class="sidebar-stat__val">{{ totalAchievements }}</span>
          <span class="sidebar-stat__label">Succès</span>
        </div>
        <div class="sidebar-stat">
          <span class="sidebar-stat__val streak">🔥 {{ currentStreak }}</span>
          <span class="sidebar-stat__label">Série</span>
        </div>
        <div class="sidebar-stat">
          <span class="sidebar-stat__val">{{ weeklyRank }}</span>
          <span class="sidebar-stat__label">Rang</span>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav" :style="{ height: navHeight }">
      <div class="sidebar-nav__scroll">
        <!-- ===== SECTION MVP ===== -->
        <router-link
          to="/quete"
          class="nav-item nav-item--quest"
          :class="{ active: isCurrentRoute('/quete') }"
        >
          <span class="nav-item__icon">🎯</span>
          <span v-if="isOpen" class="nav-item__label">Ma Quête</span>
        </router-link>

        <!-- ===== SECTION FINANCES ===== -->
        <div v-if="isOpen" class="nav-section">Finances</div>

        <router-link
          to="/app/transactions"
          class="nav-item"
          :class="{ active: isCurrentRoute('/app/transactions') }"
        >
          <CreditCardIcon class="nav-item__hero-icon" />
          <span v-if="isOpen" class="nav-item__label">Transactions</span>
        </router-link>

        <router-link
          to="/app/analytics"
          class="nav-item"
          :class="{ active: isCurrentRoute('/app/analytics') }"
        >
          <ChartBarIcon class="nav-item__hero-icon" />
          <span v-if="isOpen" class="nav-item__label">Analytics</span>
        </router-link>

        <router-link
          v-if="authStore.user?.is_admin || !!authStore.user?.is_admin"
          to="/app/admin"
          class="nav-item nav-item--admin"
          :class="{ active: isCurrentRoute('/app/admin') }"
        >
          <ShieldCheckIcon class="nav-item__hero-icon" />
          <span v-if="isOpen" class="nav-item__label">Admin</span>
          <span v-if="isOpen" class="nav-badge nav-badge--admin">ADMIN</span>
        </router-link>

        <!-- ===== SECTION GAMING ===== -->
        <div v-if="isOpen" class="nav-section">Gaming</div>

        <router-link
          to="/app/gaming"
          class="nav-item"
          :class="{ active: isCurrentRoute('/app/gaming') }"
        >
          <TrophyIcon class="nav-item__hero-icon" />
          <span v-if="isOpen" class="nav-item__label">Gaming Center</span>
          <span v-if="isOpen" class="nav-badge">NEW</span>
        </router-link>

        <router-link
          to="/app/gaming/achievements"
          class="nav-item"
          :class="{ active: isCurrentRoute('/app/gaming/achievements') }"
        >
          <StarIcon class="nav-item__hero-icon" />
          <span v-if="isOpen" class="nav-item__label">Succès</span>
        </router-link>

        <!-- ===== SECTION PLUS (collapse) ===== -->
        <button v-if="isOpen" class="nav-more-toggle" @click="showMore = !showMore">
          <span>{{ showMore ? '▲' : '▼' }} Plus</span>
        </button>

        <template v-if="showMore || !isOpen">
          <div v-if="isOpen" class="nav-section nav-section--sub">Outils</div>

          <router-link
            to="/app/goals"
            class="nav-item nav-item--muted"
            :class="{ active: isCurrentRoute('/app/goals') }"
          >
            <CalendarIcon class="nav-item__hero-icon" />
            <span v-if="isOpen" class="nav-item__label">Objectifs legacy</span>
          </router-link>

          <router-link
            to="/app/categories"
            class="nav-item nav-item--muted"
            :class="{ active: isCurrentRoute('/app/categories') }"
          >
            <FolderIcon class="nav-item__hero-icon" />
            <span v-if="isOpen" class="nav-item__label">Catégories</span>
          </router-link>

          <router-link
            to="/app/banking"
            class="nav-item nav-item--muted"
            :class="{ active: isCurrentRoute('/app/banking') }"
          >
            <CogIcon class="nav-item__hero-icon" />
            <span v-if="isOpen" class="nav-item__label">Connexions</span>
          </router-link>

          <router-link
            to="/app/gaming/challenges"
            class="nav-item nav-item--muted"
            :class="{ active: isCurrentRoute('/app/gaming/challenges') }"
          >
            <LightBulbIcon class="nav-item__hero-icon" />
            <span v-if="isOpen" class="nav-item__label">Défis</span>
          </router-link>
        </template>

        <!-- ===== ADMIN (visible uniquement pour les admins) ===== -->
        <router-link
          v-if="isAdmin"
          to="/app/admin"
          class="nav-item nav-item--admin"
          :class="{ active: isCurrentRoute('/app/admin') }"
        >
          <ShieldCheckIcon class="nav-item__hero-icon" />
          <span v-if="isOpen" class="nav-item__label">Administration</span>
          <span v-if="isOpen" class="nav-badge nav-badge--admin">ADMIN</span>
        </router-link>

        <!-- ===== PROFIL ===== -->
        <div class="nav-divider" />

        <router-link
          to="/app/profile"
          class="nav-item"
          :class="{ active: isCurrentRoute('/app/profile') }"
        >
          <UserGroupIcon class="nav-item__hero-icon" />
          <span v-if="isOpen" class="nav-item__label">Profil</span>
        </router-link>
      </div>

      <!-- Action rapide -->
      <div v-if="isOpen" class="sidebar-quick-action">
        <button class="quick-action-btn" @click="goToQuest">
          <span>⚡ Enregistrer une action</span>
        </button>
      </div>

      <!-- Toggle collapse desktop -->
      <div class="sidebar-toggle">
        <button @click="$emit('toggle-sidebar')">
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
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useGamingStore } from '@/stores/gamingStore'
import { useQuestStore } from '@/stores/Queststore.ts'
import { useApiHealth } from '@/composables/core/useApiHealth'
import { useBreakpoints } from '@vueuse/core'
import {
  CreditCardIcon,
  ChartBarIcon,
  TrophyIcon,
  UserGroupIcon,
  CogIcon,
  StarIcon,
  ChevronLeftIcon,
  FolderIcon,
  CalendarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'

// ==========================================
// PROPS / EMITS
// ==========================================

interface Props {
  isOpen: boolean
  currentRoute?: string
}

const props = withDefaults(defineProps<Props>(), { currentRoute: '' })

defineEmits<{ close: []; 'toggle-sidebar': [] }>()

// ==========================================
// STORES
// ==========================================

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const gamingStore = useGamingStore()
const questStore = useQuestStore()
const apiHealth = useApiHealth()

// ==========================================
// STATE
// ==========================================

const showMore = ref(false)

// ==========================================
// COMPUTED
// ==========================================

const breakpoints = useBreakpoints({ lg: 1024 })
const isMobile = computed(() => !breakpoints.lg.value)

const showApiStatus = computed(() => !apiHealth.isConnected.value || import.meta.env.DEV)

const sidebarClasses = computed(() => [
  'fixed left-0 z-20 transition-all duration-300 bg-white border-r border-gray-200',
  props.isOpen ? 'w-64' : 'w-16',
  'lg:translate-x-0',
  props.isOpen || !isMobile.value ? 'translate-x-0' : '-translate-x-full',
  showApiStatus.value ? 'top-28' : 'top-16',
])

const navHeight = computed(() =>
  showApiStatus.value ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)',
)

// Quest
const questEmoji = computed(() => questStore.mainQuest?.emoji ?? '🎯')
const questName = computed(() => questStore.mainQuest?.name ?? 'Ma Quête')
const questProgress = computed(() => questStore.mainQuest?.progress_percentage ?? 0)

// Gaming stats
const totalAchievements = computed(() => gamingStore.achievements?.length ?? 0)
const currentStreak = computed(() => {
  const streaks = Array.isArray(gamingStore.streaks) ? gamingStore.streaks : []
  return streaks.find((s: any) => s.type === 'daily')?.current_count ?? 0
})
const weeklyRank = computed(() => '--')
const isAdmin = computed(() => !!authStore.user?.is_admin)

// ==========================================
// MÉTHODES
// ==========================================

const isCurrentRoute = (href: string): boolean => {
  if (href === '/quete') return route.path === '/quete'
  return route.path === href || route.path.startsWith(href + '/')
}

const goToQuest = (): void => {
  router.push({ name: 'Quest' })
}
</script>

<style scoped>
/* ===== SIDEBAR HEADER ===== */
.sidebar-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
}

.nav-item--admin {
  color: #dc2626;
}
.nav-item--admin:hover {
  background: #fef2f2;
}
.nav-badge--admin {
  background: #fee2e2;
  color: #dc2626;
}

.sidebar-quest {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 10px;
  transition: background 0.15s;
}

.sidebar-quest:hover {
  background: rgba(255, 255, 255, 0.08);
}

.sidebar-quest__emoji {
  font-size: 20px;
  flex-shrink: 0;
}

.sidebar-quest__info {
  flex: 1;
  min-width: 0;
}

.sidebar-quest__name {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.sidebar-quest__bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.sidebar-quest__fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a78bfa);
  border-radius: 2px;
  transition: width 0.4s;
}

.sidebar-quest__pct {
  font-size: 13px;
  font-weight: 800;
  color: #a78bfa;
  flex-shrink: 0;
}

.sidebar-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.sidebar-stat {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 6px 4px;
  text-align: center;
}

.sidebar-stat__val {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.sidebar-stat__val.streak {
  color: #fb923c;
}

.sidebar-stat__label {
  display: block;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

/* ===== NAVIGATION ===== */
.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.sidebar-nav__scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.nav-section {
  padding: 10px 12px 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.nav-section--sub {
  color: #d1d5db;
}

.nav-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 6px 8px;
}

/* Nav items */
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  transition: all 0.15s;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: #f9fafb;
  color: #111827;
}
.nav-item.active {
  background: #ede9fe;
  color: #7c3aed;
}

.nav-item--quest {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  color: white;
  font-weight: 700;
  margin-bottom: 8px;
}

.nav-item--quest:hover {
  background: linear-gradient(135deg, #312e81, #4c1d95);
  color: white;
}
.nav-item--quest.active {
  background: linear-gradient(135deg, #4c1d95, #6d28d9);
  color: white;
}

.nav-item--muted {
  color: #9ca3af;
  font-size: 13px;
}
.nav-item--muted:hover {
  color: #6b7280;
}

.nav-item__icon {
  font-size: 18px;
  flex-shrink: 0;
}
.nav-item__hero-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.nav-item__label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 10px;
  flex-shrink: 0;
}

/* More toggle */
.nav-more-toggle {
  width: 100%;
  padding: 6px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
}

.nav-more-toggle:hover {
  background: #f9fafb;
  color: #374151;
}

/* Quick action */
.sidebar-quick-action {
  padding: 10px 12px;
  border-top: 1px solid #f3f4f6;
}

.quick-action-btn {
  width: 100%;
  padding: 10px 14px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.quick-action-btn:hover {
  opacity: 0.9;
}

/* Toggle button */
.sidebar-toggle {
  display: none;
  padding: 8px;
  border-top: 1px solid #f3f4f6;
}

@media (min-width: 1024px) {
  .sidebar-toggle {
    display: flex;
    justify-content: center;
  }
}

.sidebar-toggle button {
  padding: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 8px;
  transition: background 0.15s;
}

.sidebar-toggle button:hover {
  background: #f9fafb;
  color: #374151;
}
</style>
