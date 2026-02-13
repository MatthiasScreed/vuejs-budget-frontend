// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ==========================================
// LAZY LOADING
// ==========================================

// Layout avec navbar (pour app authentifiée)
const AppLayout = () => import('@/components/layout/AppLayout.vue')

// Pages publiques
const LandingPage = () => import('@/views/LandingPage.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')

// Pages authentifiées - Core
const Dashboard = () => import('@/views/Dashboard.vue')
const Transactions = () => import('@/views/Transactions.vue')
const Goals = () => import('@/views/Goals.vue')
const Categories = () => import('@/views/Categories.vue')
const Analytics = () => import('@/views/Analytics.vue')
const Profile = () => import('@/views/Profile.vue')
const Banking = () => import('@/views/Banking.vue')

// Pages authentifiées - Gaming System
const Gaming = () => import('@/views/Gaming.vue')
const Achievements = () => import('@/views/Achievements.vue')
const Challenges = () => import('@/views/Challenges.vue')

// ==========================================
// ROUTES
// ==========================================

const routes = [
  // ==========================================
  // 🎯 LANDING PAGE - Page d'accueil publique
  // ==========================================
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
    meta: {
      requiresAuth: false,
      title: 'CoinQuest - Économisez 324€/mois en moyenne',
      description:
        'Gérez votre budget intelligemment avec CoinQuest. Catégorisation automatique, objectifs personnalisés et analyse IA.',
    },
  },

  // ==========================================
  // 🔐 AUTHENTIFICATION (sans layout)
  // ==========================================
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: 'Connexion - CoinQuest',
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      requiresAuth: false,
      title: 'Inscription - CoinQuest',
    },
  },

  // ==========================================
  // 📱 APPLICATION (avec layout + navbar)
  // ==========================================
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      // === CORE ===
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          requiresAuth: true,
          title: 'Tableau de bord - CoinQuest',
        },
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: Transactions,
        meta: {
          requiresAuth: true,
          title: 'Transactions - CoinQuest',
        },
      },
      {
        path: 'goals',
        name: 'Goals',
        component: Goals,
        meta: {
          requiresAuth: true,
          title: 'Objectifs - CoinQuest',
        },
      },
      {
        path: 'categories',
        name: 'Categories',
        component: Categories,
        meta: {
          requiresAuth: true,
          title: 'Catégories - CoinQuest',
        },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: Analytics,
        meta: {
          requiresAuth: true,
          title: 'Analyse - CoinQuest',
        },
      },
      {
        path: 'banking',
        name: 'Banking',
        component: Banking,
        meta: {
          requiresAuth: true,
          title: 'Banque - CoinQuest',
        },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: {
          requiresAuth: true,
          title: 'Profil - CoinQuest',
        },
      },

      // === GAMING SYSTEM ===
      {
        path: 'gaming',
        name: 'Gaming',
        component: Gaming,
        meta: {
          requiresAuth: true,
          title: 'Progression - CoinQuest',
        },
      },
      {
        path: 'achievements',
        name: 'Achievements',
        component: Achievements,
        meta: {
          requiresAuth: true,
          title: 'Succès - CoinQuest',
        },
      },
      {
        path: 'challenges',
        name: 'Challenges',
        component: Challenges,
        meta: {
          requiresAuth: true,
          title: 'Défis - CoinQuest',
        },
      },

      // Redirection /app → /app/dashboard
      {
        path: '',
        redirect: { name: 'Dashboard' },
      },
    ],
  },

  // ==========================================
  // 🔀 REDIRECTIONS (compatibilité anciennes URLs)
  // ==========================================
  { path: '/home', redirect: { name: 'Landing' } },
  { path: '/dashboard', redirect: { name: 'Dashboard' } },
  { path: '/transactions', redirect: { name: 'Transactions' } },
  { path: '/goals', redirect: { name: 'Goals' } },
  { path: '/categories', redirect: { name: 'Categories' } },
  { path: '/analytics', redirect: { name: 'Analytics' } },
  { path: '/gaming', redirect: { name: 'Gaming' } },
  { path: '/achievements', redirect: { name: 'Achievements' } },
  { path: '/challenges', redirect: { name: 'Challenges' } },
  { path: '/profile', redirect: { name: 'Profile' } },
  { path: '/banking', redirect: { name: 'Banking' } },

  // ==========================================
  // ❌ 404 - Page non trouvée
  // ==========================================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      requiresAuth: false,
      title: 'Page non trouvée - CoinQuest',
    },
  },
]

// ==========================================
// CRÉATION DU ROUTER
// ==========================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  },
})

// ==========================================
// NAVIGATION GUARDS
// ==========================================

router.beforeEach(async (to, from, next) => {
  console.log(`🧭 Navigation: ${from.path} → ${to.path}`)

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const authStore = useAuthStore()

  // Routes publiques
  if (!requiresAuth) {
    if (authStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
      console.log('✅ Déjà connecté, redirection dashboard')
      next({ name: 'Dashboard' })
      return
    }
    next()
    return
  }

  // Routes protégées - Vérifier authentification
  if (authStore.isAuthenticated && authStore.user) {
    console.log('✅ Utilisateur authentifié:', authStore.user.email)
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
      authStore.isInitialized = true
      console.log('✅ Session restaurée depuis localStorage')
      next()
      return
    } catch (error) {
      console.error('❌ Erreur parsing user:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  // Non authentifié → Login
  console.log('⚠️ Non authentifié, redirection login')
  next({
    name: 'Login',
    query: { redirect: to.fullPath },
  })
})

// ==========================================
// AFTER EACH - Métadonnées
// ==========================================

router.afterEach((to) => {
  const title = (to.meta.title as string) || 'CoinQuest'
  document.title = title

  const description =
    (to.meta.description as string) || 'CoinQuest - Gestion de budget intelligente'
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', description)
  }

  console.log(`✅ Page chargée: ${title}`)
})

// ==========================================
// GESTION D'ERREURS
// ==========================================

router.onError((error) => {
  console.error('❌ Erreur routeur:', error)

  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Loading chunk')
  ) {
    console.warn('🔄 Rechargement nécessaire après erreur de chunk')
    window.location.reload()
  }
})

export default router
