// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ==========================================
// LAZY LOADING
// ==========================================

const AppLayout = () => import('@/components/layout/AppLayout.vue')
const LandingPage = () => import('@/views/LandingPage.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')

// ✅ MVP
const Dashboard = () => import('@/views/Dashboard.vue')
const OnboardingQuest = () => import('@/views/OnboardingQuest.vue')

// Legacy
const Transactions = () => import('@/views/Transactions.vue')
const Goals = () => import('@/views/Goals.vue')
const Categories = () => import('@/views/Categories.vue')
const Analytics = () => import('@/views/Analytics.vue')
const Profile = () => import('@/views/Profile.vue')
const Banking = () => import('@/views/Banking.vue')
const Gaming = () => import('@/views/Gaming.vue')
const Achievements = () => import('@/views/Achievements.vue')
const Challenges = () => import('@/views/Challenges.vue')
const AdminDashboard = () => import('@/views/AdminDashboard.vue')

// ==========================================
// HELPER — onboarding déjà fait ?
// ==========================================

function hasCompletedOnboarding(): boolean {
  return localStorage.getItem('onboarding_completed') === 'true'
}

// ==========================================
// ROUTES
// ==========================================

const routes = [
  // PUBLIC
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
    meta: { requiresAuth: false, title: 'CoinQuest - Transforme tes finances en aventure' },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, title: 'Connexion - CoinQuest' },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, title: 'Inscription - CoinQuest' },
  },

  // ✅ ONBOARDING — affiché une seule fois après inscription
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: OnboardingQuest,
    meta: { requiresAuth: true, title: 'Crée ta quête - CoinQuest' },
  },

  // ✅ MVP QUEST — dashboard principal
  {
    path: '/quete',
    name: 'Quest',
    component: Dashboard,
    meta: { requiresAuth: true, title: 'Ma Quête - CoinQuest' },
  },

  // APP (avec AppLayout)
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'Quest' } },
      { path: 'dashboard', redirect: { name: 'Quest' } },

      {
        path: 'transactions',
        name: 'Transactions',
        component: Transactions,
        meta: { requiresAuth: true, title: 'Transactions - CoinQuest' },
      },
      {
        path: 'goals',
        name: 'Goals',
        component: Goals,
        meta: { requiresAuth: true, title: 'Objectifs - CoinQuest' },
      },
      {
        path: 'insights',
        name: 'Insights',
        component: () => import('@/views/Insights.vue'),
        meta: { requiresAuth: true, title: 'Coach IA - CoinQuest' },
      },
      {
        path: 'categories',
        name: 'Categories',
        component: Categories,
        meta: { requiresAuth: true, title: 'Catégories - CoinQuest' },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: Analytics,
        meta: { requiresAuth: true, title: 'Analyse - CoinQuest' },
      },
      {
        path: 'banking',
        name: 'Banking',
        component: Banking,
        meta: { requiresAuth: true, title: 'Banque - CoinQuest' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true, title: 'Profil - CoinQuest' },
      },
      {
        path: 'gaming',
        name: 'Gaming',
        component: Gaming,
        meta: { requiresAuth: true, title: 'Progression - CoinQuest' },
      },
      {
        path: 'gaming/achievements',
        name: 'Achievements',
        component: Achievements,
        meta: { requiresAuth: true, title: 'Succès - CoinQuest' },
      },
      {
        path: 'gaming/challenges',
        name: 'Challenges',
        component: Challenges,
        meta: { requiresAuth: true, title: 'Défis - CoinQuest' },
      },
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true, title: 'Admin - CoinQuest' },
      },
    ],
  },

  // REDIRECTIONS
  { path: '/home', redirect: { name: 'Landing' } },
  { path: '/dashboard', redirect: { name: 'Quest' } },
  { path: '/transactions', redirect: { name: 'Transactions' } },
  { path: '/goals', redirect: { name: 'Goals' } },
  { path: '/categories', redirect: { name: 'Categories' } },
  { path: '/analytics', redirect: { name: 'Analytics' } },
  { path: '/profile', redirect: { name: 'Profile' } },
  { path: '/banking', redirect: { name: 'Banking' } },
  { path: '/gaming', redirect: { name: 'Gaming' } },
  { path: '/achievements', redirect: { name: 'Achievements' } },
  { path: '/challenges', redirect: { name: 'Challenges' } },
  { path: '/gaming/achievements', redirect: { name: 'Achievements' } },
  { path: '/gaming/challenges', redirect: { name: 'Challenges' } },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { requiresAuth: false, title: 'Page non trouvée - CoinQuest' },
  },
]

// ==========================================
// CRÉATION DU ROUTER
// ==========================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

// ==========================================
// NAVIGATION GUARD
// ==========================================

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin)
  const authStore = useAuthStore()

  // Routes publiques
  if (!requiresAuth) {
    if (authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
      next({ name: 'Quest' })
      return
    }
    next()
    return
  }

  // Restauration session depuis localStorage
  if (!authStore.isAuthenticated || !authStore.user) {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        authStore.token = token
        authStore.user = user
        authStore.isAuthenticated = true
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
      }
    } else {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }

  // Vérification admin
  if (requiresAdmin && !authStore.user?.is_admin) {
    next({ name: 'Quest' })
    return
  }

  // ✅ GUARD ONBOARDING
  // Si authentifié, pas sur la page onboarding, et onboarding pas encore fait
  // → rediriger vers l'onboarding (sauf pages admin et profil)
  const bypassOnboarding = ['Onboarding', 'Profile', 'AdminDashboard'].includes(to.name as string)

  if (!hasCompletedOnboarding() && !bypassOnboarding) {
    next({ name: 'Onboarding' })
    return
  }

  next()
})

// ==========================================
// AFTER EACH — Métadonnées
// ==========================================

router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'CoinQuest'

  const desc = (to.meta.description as string) || 'CoinQuest - Transforme tes finances en aventure'
  document.querySelector('meta[name="description"]')?.setAttribute('content', desc)
})

// ==========================================
// GESTION ERREURS (chunks lazy)
// ==========================================

router.onError((error) => {
  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Loading chunk')
  ) {
    window.location.reload()
  }
})

export default router
