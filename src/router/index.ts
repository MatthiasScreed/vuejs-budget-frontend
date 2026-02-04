// src/router/index.ts - VERSION CORRIGÉE
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ==========================================
// LAZY LOADING DES COMPOSANTS
// ==========================================

const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Transactions = () => import('@/views/Transactions.vue')
const Goals = () => import('@/views/Goals.vue')
const Categories = () => import('@/views/Categories.vue')
const Analytics = () => import('@/views/Analytics.vue')
const Gaming = () => import('@/views/Gaming.vue')
const Profile = () => import('@/views/Profile.vue')
const Banking = () => import('@/views/Banking.vue')

// ==========================================
// DÉFINITION DES ROUTES
// ==========================================

const routes = [
  // Page d'accueil publique
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false, title: 'CoinQuest - Budget Gaming' },
  },

  // Auth
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
  // ROUTES AUTHENTIFIÉES (avec /app prefix)
  // ==========================================
  {
    path: '/app/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, title: 'Dashboard - CoinQuest' },
  },
  {
    path: '/app/transactions',
    name: 'Transactions',
    component: Transactions,
    meta: { requiresAuth: true, title: 'Transactions - CoinQuest' },
  },
  {
    path: '/app/goals',
    name: 'Goals',
    component: Goals,
    meta: { requiresAuth: true, title: 'Objectifs - CoinQuest' },
  },
  {
    path: '/app/categories',
    name: 'Categories',
    component: Categories,
    meta: { requiresAuth: true, title: 'Catégories - CoinQuest' },
  },
  {
    path: '/app/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { requiresAuth: true, title: 'Analytique - CoinQuest' },
  },
  {
    path: '/app/gaming',
    name: 'Gaming',
    component: Gaming,
    meta: { requiresAuth: true, title: 'Gaming - CoinQuest' },
  },
  {
    path: '/app/banking',
    name: 'Banking',
    component: Banking,
    meta: { requiresAuth: true, title: 'Banking - CoinQuest' },
  },
  {
    path: '/app/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true, title: 'Profil - CoinQuest' },
  },

  // Redirections de compatibilité
  { path: '/app', redirect: '/app/dashboard' },
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
// GUARD SIMPLIFIÉ - SANS APPEL API !
// ==========================================

router.beforeEach(async (to, from, next) => {
  console.log(`🧭 Navigation: ${from.path} → ${to.path}`)

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

  // =============================================
  // 1. ROUTES PUBLIQUES - Pas besoin de vérifier
  // =============================================
  if (!requiresAuth) {
    // Si déjà connecté et va vers login/register → dashboard
    const token = localStorage.getItem('auth_token')
    if (token && (to.path === '/login' || to.path === '/register')) {
      console.log('✅ Déjà connecté, redirection vers dashboard')
      next('/app/dashboard')
      return
    }
    next()
    return
  }

  // =============================================
  // 2. ROUTES PROTÉGÉES - Vérifier AUTH LOCALE
  // =============================================
  const authStore = useAuthStore()

  // Vérifier d'abord le store (initialisé par App.vue)
  if (authStore.isAuthenticated && authStore.user) {
    console.log('✅ Auth OK (store), navigation autorisée')
    next()
    return
  }

  // Fallback : vérifier localStorage directement
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('user')

  if (token && userStr) {
    // Restaurer dans le store si nécessaire
    try {
      authStore.token = token
      authStore.user = JSON.parse(userStr)
      authStore.isAuthenticated = true
      console.log('✅ Auth restaurée depuis localStorage')
      next()
      return
    } catch (error) {
      console.error('❌ Erreur parsing user:', error)
    }
  }

  // =============================================
  // 3. PAS D'AUTH → Login
  // =============================================
  console.log('🔒 Non authentifié, redirection vers login')
  next({
    path: '/login',
    query: { redirect: to.fullPath },
  })
})

// ==========================================
// AFTER EACH - TITRES UNIQUEMENT (pas d'API !)
// ==========================================

router.afterEach((to) => {
  // Mettre à jour le titre
  const title = to.meta.title as string
  document.title = title || 'CoinQuest'

  // ⚠️ SUPPRIMÉ : Les appels gamingStore.addXP() et updateStreak()
  // Ces appels API déclenchaient des 401 et des logouts !
  // Le tracking gaming sera fait ailleurs (dans les composants)
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
