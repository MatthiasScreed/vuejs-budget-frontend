// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ==========================================
// LAZY LOADING
// ==========================================

// Layout
const AppLayout = () => import('@/components/layout/AppLayout.vue')

// Pages publiques
const LandingPage = () => import('@/views/LandingPage.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')

// MVP — Dashboard principal (quête + action quotidienne)
const Dashboard = () => import('@/views/Dashboard.vue')

// Pages authentifiées — legacy (conservées mais non prioritaires)
const Transactions = () => import('@/views/Transactions.vue')
const Goals = () => import('@/views/Goals.vue')
const Categories = () => import('@/views/Categories.vue')
const Analytics = () => import('@/views/Analytics.vue')
const Profile = () => import('@/views/Profile.vue')
const Banking = () => import('@/views/Banking.vue')

// Gaming
const Gaming = () => import('@/views/Gaming.vue')
const Achievements = () => import('@/views/Achievements.vue')
const Challenges = () => import('@/views/Challenges.vue')

// Admin
const AdminDashboard = () => import('@/views/AdminDashboard.vue')

// ==========================================
// ROUTES
// ==========================================

const routes = [
  // ==========================================
  // LANDING PAGE
  // ==========================================
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
    meta: {
      requiresAuth: false,
      title: 'CoinQuest - Transforme tes finances en aventure',
    },
  },

  // ==========================================
  // AUTHENTIFICATION (sans layout)
  // ==========================================
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

  // ==========================================
  // MVP — QUÊTE (sans AppLayout, expérience immersive)
  // ==========================================
  {
    path: '/quete',
    name: 'Quest',
    component: Dashboard, // ← Dashboard.vue = le MVP
    meta: {
      requiresAuth: true,
      title: 'Ma Quête - CoinQuest',
    },
  },

  // ==========================================
  // APPLICATION (avec AppLayout + navbar)
  // ==========================================
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      // Redirection /app → /quete (point d'entrée MVP)
      {
        path: '',
        redirect: { name: 'Quest' },
      },

      // Dashboard legacy (redirige vers la quête MVP)
      {
        path: 'dashboard',
        redirect: { name: 'Quest' },
      },

      // === FEATURES LEGACY ===
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

      // === GAMING ===
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

      // === ADMIN ===
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: 'Admin - CoinQuest',
        },
      },
    ],
  },

  // ==========================================
  // REDIRECTIONS (compatibilité URLs existantes)
  // ==========================================
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

  // ==========================================
  // 404
  // ==========================================
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
// NAVIGATION GUARDS
// ==========================================

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin)
  const authStore = useAuthStore()

  // Routes publiques
  if (!requiresAuth) {
    // Déjà connecté → pas besoin d'aller sur Login/Register
    if (authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
      next({ name: 'Quest' })
      return
    }
    next()
    return
  }

  // Déjà authentifié en mémoire
  if (authStore.isAuthenticated && authStore.user) {
    if (requiresAdmin && !authStore.user.is_admin) {
      next({ name: 'Quest' })
      return
    }
    next()
    return
  }

  // Tentative restauration depuis localStorage
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('user')

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr)
      authStore.token = token
      authStore.user = user
      authStore.isAuthenticated = true

      if (requiresAdmin && !user.is_admin) {
        next({ name: 'Quest' })
        return
      }

      next()
      return
    } catch {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  // Non authentifié → Login
  next({ name: 'Login', query: { redirect: to.fullPath } })
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
// GESTION D'ERREURS (chunks lazy)
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
