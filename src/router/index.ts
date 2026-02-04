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
        meta: {
          title: 'Épargne - Budget Gaming',
          icon: 'PiggyBankIcon',
        },
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
// 🛡️ GUARD DE NAVIGATION OPTIMISÉ
// ==========================================

router.beforeEach(async (to, from, next) => {
  console.log('═══════════════════════════════════════')
  console.log('🧭 NAVIGATION:', from.path, '→', to.path)
  console.log('═══════════════════════════════════════')

  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

  // 📊 État complet de l'auth
  console.log('📊 AUTH STATE:')
  console.log('   - isInitialized:', authStore.isInitialized)
  console.log('   - isAuthenticated:', authStore.isAuthenticated)
  console.log('   - hasToken:', !!authStore.token)
  console.log('   - hasUser:', !!authStore.user)
  console.log('   - userEmail:', authStore.user?.email || 'null')
  console.log('   - requiresAuth:', requiresAuth)

  // 🔍 Vérifier localStorage directement
  const rawToken = localStorage.getItem('auth_token')
  const rawUser = localStorage.getItem('user')
  console.log('💾 LOCALSTORAGE:')
  console.log('   - auth_token exists:', !!rawToken)
  console.log('   - user exists:', !!rawUser)

  if (rawToken) {
    try {
      const parsed = JSON.parse(rawToken)
      const now = Date.now()
      const isExpired = now > parsed.expiry
      console.log('   - token expiry:', new Date(parsed.expiry).toISOString())
      console.log('   - is expired:', isExpired)
    } catch (e) {
      console.log('   - token parse error:', e)
    }
  }

  // ⏳ Attendre l'initialisation si nécessaire
  if (!authStore.isInitialized) {
    console.log('⏳ Attente initialisation auth...')

    let attempts = 0
    const maxAttempts = 50

    while (!authStore.isInitialized && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }

    if (!authStore.isInitialized) {
      console.error('❌ TIMEOUT: Auth non initialisée après 5s')
      console.log('🔄 Forçage initAuth()...')
      await authStore.initAuth()
    }

    console.log('✅ Auth initialisée après', attempts * 100, 'ms')
    console.log('   - isAuthenticated maintenant:', authStore.isAuthenticated)
  }

  // 🚦 Décision de navigation
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('🚫 BLOCAGE: Route protégée, non authentifié')
    console.log('   → Redirection vers /login')
    console.log('═══════════════════════════════════════')
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    console.log('✅ Déjà connecté, redirection dashboard')
    console.log('═══════════════════════════════════════')
    return next('/app/dashboard')
  }

  console.log('✅ Navigation autorisée vers:', to.path)
  console.log('═══════════════════════════════════════')
  next()
})

// ==========================================
// 📄 APRÈS NAVIGATION
// ==========================================

router.afterEach(async (to) => {
  // Mettre à jour le titre de la page
  const title = (to.meta.title as string) || 'Budget Gaming'
  document.title = title

  // Tracker la navigation dans le gaming store (si applicable)
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

// ==========================================
// ❌ GESTION DES ERREURS ROUTER
// ==========================================

router.onError((error) => {
  console.error('❌ Erreur du routeur:', error)

  // Si chunk loading failed (après un déploiement) → reload
  if (error.message.includes('Loading chunk') || error.message.includes('Failed to fetch')) {
    console.warn('⚠️ Chunk loading failed, rechargement de la page...')
    window.location.reload()
  }
})

export default router
