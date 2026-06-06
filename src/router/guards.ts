import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAppStore, useAuthStore } from '@/stores'

/**
 * Guard d'authentification
 */
export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Rediriger vers login avec return URL
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
    return
  }

  next()
}

/**
 * Guard invité — PWA fix
 * Redirige vers /quete si l'utilisateur est déjà connecté
 * quand il atterrit sur /login ou /register (ex: icône PWA)
 */
export function guestGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    next({ name: 'Quest', replace: true })
    return
  }

  next()
}

/**
 * Guard d'initialisation
 */
export async function initGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const appStore = useAppStore()

  if (to.meta.requiresAuth && !appStore.initialized) {
    // Initialiser l'app si nécessaire
    const success = await appStore.initializeApp()

    if (!success) {
      next('/login')
      return
    }
  }

  next()
}

/**
 * Guard de gaming (vérifier si gaming activé)
 */
export function gamingGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const appStore = useAppStore()

  if (to.path.startsWith('/gaming') && !appStore.config.gamingEnabled) {
    next('/dashboard')
    return
  }

  next()
}
