import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    redirect: '/app/dashboard',
  },

  // ROUTES PUBLIQUES
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      requiresAuth: false,
      title: 'Connexion - Budget Gaming',
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: {
      requiresAuth: false,
      title: 'Inscription - Budget Gaming',
    },
  },

  // ROUTES AUTHENTIFIÉES
  {
    path: '/app',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: 'Dashboard - Budget Gaming',
          icon: 'HomeIcon',
        },
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('@/views/Transactions.vue'),
        meta: {
          title: 'Transactions - Budget Gaming',
          icon: 'CreditCardIcon',
        },
      },
      {
        path: 'goals',
        name: 'Goals',
        component: () => import('@/views/Goals.vue'),
        meta: {
          title: 'Objectifs - Budget Gaming',
          icon: 'CalendarIcon',
        },
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories.vue'),
        meta: {
          title: 'Catégories - Budget Gaming',
          icon: 'TagIcon',
        },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/Analytics.vue'),
        meta: {
          title: 'Analyses - Budget Gaming',
          icon: 'ChartBarIcon',
        },
      },
      {
        path: 'gaming',
        name: 'Gaming',
        component: () => import('@/views/Gaming.vue'),
        meta: {
          title: 'Gaming Center - Budget Gaming',
          icon: 'TrophyIcon',
          isGaming: true,
        },
      },
      {
        path: 'gaming/achievements',
        name: 'Achievements',
        component: () => import('@/views/Achievements.vue'),
        meta: {
          title: 'Succès - Budget Gaming',
          icon: 'TrophyIcon',
          parent: 'Gaming',
          isGaming: true,
        },
      },
      {
        path: 'gaming/challenges',
        name: 'Challenges',
        component: () => import('@/views/Challenges.vue'),
        meta: {
          title: 'Défis - Budget Gaming',
          icon: 'FireIcon',
          parent: 'Gaming',
          isGaming: true,
        },
      },
      {
        path: 'banking',
        name: 'Banking',
        component: () => import('@/views/Banking.vue'),
        meta: {
          title: 'Banking - Budget Gaming',
          icon: 'BankIcon',
        },
      },
      {
        path: 'diagnostic',
        name: 'Diagnostic',
        component: () => import('@/views/Diagnostic.vue'),
        meta: {
          title: 'Diagnostic - Budget Gaming',
          icon: 'WrenchIcon',
        },
      },
      {
        path: 'banking/callback',
        name: 'BankingCallback',
        component: () => import('@/views/BankingCallback.vue'),
        meta: {
          title: 'Connexion bancaire - Budget Gaming',
          requiresAuth: true,
        },
      },
      {
        path: 'savings',
        name: 'Savings',
        component: () => import('@/views/SavingsDashboard.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: {
          title: 'Mon Profil - Budget Gaming',
          icon: 'UserIcon',
        },
      },
      {
        path: '',
        redirect: 'dashboard',
      },
    ],
  },

  // REDIRECTIONS COMPATIBILITÉ
  { path: '/dashboard', redirect: '/app/dashboard' },
  { path: '/transactions', redirect: '/app/transactions' },
  { path: '/goals', redirect: '/app/goals' },
  { path: '/categories', redirect: '/app/categories' },
  { path: '/analytics', redirect: '/app/analytics' },
  { path: '/gaming', redirect: '/app/gaming' },
  { path: '/achievements', redirect: '/app/gaming/achievements' },
  { path: '/challenges', redirect: '/app/gaming/challenges' },
  { path: '/profile', redirect: '/app/profile' },

  // ROUTE 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      requiresAuth: false,
      title: 'Page non trouvée - Budget Gaming',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

// ==========================================
// GUARD DE NAVIGATION AVEC INIT AUTH
// ==========================================

router.beforeEach(async (to, from, next) => {
  console.group('🧭 === ROUTER GUARD ===')
  console.log('From:', from.path)
  console.log('To:', to.path)

  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

  console.log('Route requires auth?', requiresAuth)
  console.log('isInitialized?', authStore.isInitialized)
  console.log('isAuthenticated?', authStore.isAuthenticated)

  // ⏳ Si auth pas initialisée, ATTENDRE (max 10 secondes)
  // App.vue appelle initAuth() au démarrage, le router attend juste qu'elle termine
  if (!authStore.isInitialized && requiresAuth) {
    console.log('⏳ Auth pas encore initialisée, attente de App.vue...')

    let attempts = 0
    const maxAttempts = 100 // 100 * 100ms = 10 secondes

    while (!authStore.isInitialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    if (!authStore.isInitialized) {
      console.error('❌ TIMEOUT: Auth non initialisée après 10s')
      console.error('→ Forçant initAuth() depuis le router')
      await authStore.initAuth()
    }

    console.log(`✅ Auth initialisée après ${attempts * 100}ms`)
  }

  console.log('User:', authStore.user?.email || 'null')

  // Route protégée sans auth → login
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('❌ BLOCAGE : Route protégée, utilisateur non authentifié')
    console.log('→ Redirection vers /login')
    console.groupEnd()
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // Déjà connecté sur login/register → dashboard
  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    console.log('✅ Utilisateur déjà connecté, redirection vers dashboard')
    console.groupEnd()
    next('/app/dashboard')
    return
  }

  console.log('✅ Navigation autorisée')
  console.groupEnd()
  next()
})

router.afterEach(async (to) => {
  // Mettre à jour le titre
  const title = to.meta.title as string
  document.title = title || 'Budget Gaming'

  // Gérer le gaming
  if (to.meta.requiresAuth) {
    try {
      const { useGamingStore } = await import('@/stores/gamingStore')
      const gamingStore = useGamingStore()

      if (gamingStore.handleNavigation) {
        await gamingStore.handleNavigation({
          routeName: to.name as string,
          routePath: to.path,
          isGaming: to.meta.isGaming as boolean,
        })
      }
    } catch (err) {
      console.warn('⚠️ Erreur tracking gaming navigation:', err)
    }
  }
})

router.onError((error) => {
  console.error('❌ Erreur du routeur:', error)

  if (error.message.includes('Loading chunk')) {
    window.location.reload()
  }
})

export default router
