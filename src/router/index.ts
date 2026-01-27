import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ==========================================
// LAZY LOADING DES COMPOSANTS
// ==========================================

const AppLayout = () => import('@/components/layout/AppLayout.vue')

// Pages publiques
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
const Achievements = () => import('@/views/Achievements.vue')
const Challenges = () => import('@/views/Challenges.vue')

// ==========================================
// DÉFINITION DES ROUTES
// ==========================================

const routes = [
  {
    path: '/',
    redirect: '/app/dashboard'
  },

  // ==========================================
  // ROUTES PUBLIQUES
  // ==========================================
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: 'Connexion - Budget Gaming'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      requiresAuth: false,
      title: 'Inscription - Budget Gaming'
    }
  },

  // ==========================================
  // ROUTES AUTHENTIFIÉES (AVEC LAYOUT)
  // ==========================================
  {
    path: '/app',
    component: AppLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: 'Dashboard - Budget Gaming',
          icon: 'HomeIcon'
        }
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: Transactions,
        meta: {
          title: 'Transactions - Budget Gaming',
          icon: 'CreditCardIcon'
        }
      },
      {
        path: 'goals',
        name: 'Goals',
        component: Goals,
        meta: {
          title: 'Objectifs - Budget Gaming',
          icon: 'CalendarIcon'
        }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: Categories,
        meta: {
          title: 'Catégories - Budget Gaming',
          icon: 'TagIcon'
        }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: Analytics,
        meta: {
          title: 'Analyses - Budget Gaming',
          icon: 'ChartBarIcon'
        }
      },

      // 🎮 SECTION GAMING
      {
        path: 'gaming',
        name: 'Gaming',
        component: Gaming,
        meta: {
          title: 'Gaming Center - Budget Gaming',
          icon: 'TrophyIcon',
          isGaming: true // ✅ Flag pour identifier les routes gaming
        }
      },
      {
        path: 'gaming/achievements',
        name: 'Achievements',
        component: Achievements,
        meta: {
          title: 'Succès - Budget Gaming',
          icon: 'TrophyIcon',
          parent: 'Gaming',
          isGaming: true
        }
      },
      {
        path: 'gaming/challenges',
        name: 'Challenges',
        component: Challenges,
        meta: {
          title: 'Défis - Budget Gaming',
          icon: 'FireIcon',
          parent: 'Gaming',
          isGaming: true
        }
      },

      // Banking
      {
        path: 'banking',
        name: 'Banking',
        component: () => import('@/views/Banking.vue'),
        meta: {
          title: 'Banking - Budget Gaming',
          icon: 'BankIcon'
        }
      },
      {
        path: 'diagnostic',
        name: 'Diagnostic',
        component: () => import('@/views/Diagnostic.vue'),
        meta: {
          title: 'Diagnostic - Budget Gaming',
          icon: 'WrenchIcon'
        }
      },
      {
        path: 'banking/callback',
        name: 'BankingCallback',
        component: () => import('@/views/BankingCallback.vue'),
        meta: {
          title: 'Connexion bancaire - Budget Gaming',
          requiresAuth: true
        }
      },
      {
        path: 'savings',
        name: 'Savings',
        component: () => import('@/views/SavingsDashboard.vue')
      },

      // Profil
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: {
          title: 'Mon Profil - Budget Gaming',
          icon: 'UserIcon'
        }
      },

      // Redirection par défaut
      {
        path: '',
        redirect: 'dashboard'
      }
    ]
  },

  // ==========================================
  // REDIRECTIONS COMPATIBILITÉ
  // ==========================================
  {
    path: '/dashboard',
    redirect: '/app/dashboard'
  },
  {
    path: '/transactions',
    redirect: '/app/transactions'
  },
  {
    path: '/goals',
    redirect: '/app/goals'
  },
  {
    path: '/categories',
    redirect: '/app/categories'
  },
  {
    path: '/analytics',
    redirect: '/app/analytics'
  },
  {
    path: '/gaming',
    redirect: '/app/gaming'
  },
  {
    path: '/achievements',
    redirect: '/app/gaming/achievements'
  },
  {
    path: '/challenges',
    redirect: '/app/gaming/challenges'
  },
  {
    path: '/profile',
    redirect: '/app/profile'
  },

  // ==========================================
  // ROUTE 404
  // ==========================================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      requiresAuth: false,
      title: 'Page non trouvée - Budget Gaming'
    }
  }
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
    } else {
      return { top: 0 }
    }
  }
})

// ==========================================
// GUARDS DE NAVIGATION
// ==========================================

/**
 * ✅ Guard principal : Authentification
 */
router.beforeEach(async (to, from, next) => {
  console.log(`🧭 Navigation: ${from.path} → ${to.path}`)

  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // Vérifier l'authentification
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('🔒 Route protégée, redirection vers login')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Rediriger si déjà connecté
  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    console.log('✅ Utilisateur connecté, redirection vers dashboard')
    next('/app/dashboard')
    return
  }

  // Valider le token si authentifié
  if (requiresAuth && authStore.isAuthenticated) {
    try {
      if (authStore.validateToken) {
        await authStore.validateToken()
      }
    } catch (error) {
      console.log('🔒 Token invalide, redirection vers login')
      next('/login')
      return
    }
  }

  next()
})

/**
 * ✅ SIMPLIFIÉ : Déléguer la logique gaming au gamingStore
 */
router.afterEach(async (to) => {
  // Mettre à jour le titre
  const title = to.meta.title as string
  document.title = title || 'Budget Gaming'

  // ✅ Si route nécessite l'authentification, gérer le gaming
  if (to.meta.requiresAuth) {
    try {
      const { useGamingStore } = await import('@/stores/gamingStore')
      const gamingStore = useGamingStore()

      // ✅ Déléguer toute la logique au store
      if (gamingStore.handleNavigation) {
        await gamingStore.handleNavigation({
          routeName: to.name as string,
          routePath: to.path,
          isGaming: to.meta.isGaming as boolean
        })
      }

    } catch (err) {
      console.warn('⚠️ Erreur tracking gaming navigation:', err)
    }
  }
})

/**
 * ✅ Gestion des erreurs
 */
router.onError((error) => {
  console.error('❌ Erreur du routeur:', error)

  // Si erreur de chargement de chunk, recharger la page
  if (error.message.includes('Loading chunk')) {
    window.location.reload()
  }
})

export default router
