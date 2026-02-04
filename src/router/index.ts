// src/router/index.ts - AVEC LAYOUT NAVBAR
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ==========================================
// LAZY LOADING
// ==========================================

// Layout avec navbar
const AppLayout = () => import('@/components/layout/AppLayout.vue')

// Pages publiques
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')

// Pages authentifiées
const Dashboard = () => import('@/views/Dashboard.vue')
const Transactions = () => import('@/views/Transactions.vue')
const Goals = () => import('@/views/Goals.vue')
const Categories = () => import('@/views/Categories.vue')
const Analytics = () => import('@/views/Analytics.vue')
const Gaming = () => import('@/views/Gaming.vue')
const Profile = () => import('@/views/Profile.vue')
const Banking = () => import('@/views/Banking.vue')

// ==========================================
// ROUTES
// ==========================================

const routes = [
  // Page d'accueil publique
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false, title: 'CoinQuest - Budget Gaming' },
  },

  // Auth (sans layout)
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
  // ✅ ROUTES AVEC LAYOUT (navbar incluse)
  // ==========================================
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true, title: 'Dashboard - CoinQuest' },
      },
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
        path: 'categories',
        name: 'Categories',
        component: Categories,
        meta: { requiresAuth: true, title: 'Catégories - CoinQuest' },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: Analytics,
        meta: { requiresAuth: true, title: 'Analytique - CoinQuest' },
      },
      {
        path: 'gaming',
        name: 'Gaming',
        component: Gaming,
        meta: { requiresAuth: true, title: 'Gaming - CoinQuest' },
      },
      {
        path: 'banking',
        name: 'Banking',
        component: Banking,
        meta: { requiresAuth: true, title: 'Banking - CoinQuest' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true, title: 'Profil - CoinQuest' },
      },
      // Redirection /app → /app/dashboard
      {
        path: '',
        redirect: 'dashboard',
      },
    ],
  },

  // Redirections de compatibilité
  { path: '/dashboard', redirect: '/app/dashboard' },
  { path: '/transactions', redirect: '/app/transactions' },
  { path: '/goals', redirect: '/app/goals' },
  { path: '/categories', redirect: '/app/categories' },
  { path: '/analytics', redirect: '/app/analytics' },
  { path: '/gaming', redirect: '/app/gaming' },
  { path: '/profile', redirect: '/app/profile' },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { requiresAuth: false, title: 'Page non trouvée' },
  },
]

// ==========================================
// CRÉATION DU ROUTER
// ==========================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from, savedPosition) => savedPosition || { top: 0 },
})

// ==========================================
// GUARD SIMPLIFIÉ
// ==========================================

router.beforeEach(async (to, from, next) => {
  console.log(`🧭 Navigation: ${from.path} → ${to.path}`)

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

  // Routes publiques
  if (!requiresAuth) {
    const token = localStorage.getItem('auth_token')
    if (token && (to.path === '/login' || to.path === '/register')) {
      next('/app/dashboard')
      return
    }
    next()
    return
  }

  // Routes protégées
  const authStore = useAuthStore()

  if (authStore.isAuthenticated && authStore.user) {
    next()
    return
  }

  // Fallback localStorage
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('user')

  if (token && userStr) {
    try {
      authStore.token = token
      authStore.user = JSON.parse(userStr)
      authStore.isAuthenticated = true
      authStore.isInitialized = true
      next()
      return
    } catch (error) {
      console.error('❌ Erreur parsing user:', error)
    }
  }

  // Pas d'auth → Login
  next({ path: '/login', query: { redirect: to.fullPath } })
})

// ==========================================
// AFTER EACH - Titres uniquement
// ==========================================

router.afterEach((to) => {
  const title = to.meta.title as string
  document.title = title || 'CoinQuest'
})

// ==========================================
// GESTION ERREURS
// ==========================================

router.onError((error) => {
  console.error('❌ Erreur routeur:', error)
  if (error.message.includes('Loading chunk')) {
    window.location.reload()
  }
})

export default router
