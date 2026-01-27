import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from './useApi'
import type { User, LoginForm, RegisterForm, ApiResponse } from '@/types'

/**
 * Composable pour la gestion de l'authentification
 * Compatible avec Laravel Sanctum
 */
export function useAuth() {
  const router = useRouter()
  const { post, get } = useApi()

  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)

  /**
   * Initialiser l'authentification au démarrage
   */
  async function initAuth(): Promise<void> {
    const token = localStorage.getItem('auth_token')

    if (token) {
      await fetchUser()
    }
  }

  /**
   * Connexion utilisateur
   */
  async function login(credentials: LoginForm): Promise<ApiResponse<any>> {
    loading.value = true

    try {
      const response = await post<{user: User, token: string}>('/auth/login', credentials)

      if (response.success && response.data) {
        setAuthData(response.data.user, response.data.token)
        await router.push('/dashboard')
      }

      return response
    } finally {
      loading.value = false
    }
  }

  /**
   * Inscription utilisateur
   */
  async function register(userData: RegisterForm): Promise<ApiResponse<any>> {
    loading.value = true

    try {
      const response = await post<{user: User, token: string}>('/auth/register', userData)

      if (response.success && response.data) {
        setAuthData(response.data.user, response.data.token)
        await router.push('/dashboard')
      }

      return response
    } finally {
      loading.value = false
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async function logout(): Promise<void> {
    loading.value = true

    try {
      await post('/auth/logout')
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error)
    } finally {
      clearAuthData()
      await router.push('/login')
      loading.value = false
    }
  }

  /**
   * Récupérer les données utilisateur
   */
  async function fetchUser(): Promise<void> {
    try {
      const response = await get<User>('/auth/user')

      if (response.success && response.data) {
        user.value = response.data
        isAuthenticated.value = true
      } else {
        clearAuthData()
      }
    } catch (error) {
      clearAuthData()
    }
  }

  /**
   * Définir les données d'authentification
   */
  function setAuthData(userData: User, token: string): void {
    user.value = userData
    isAuthenticated.value = true
    localStorage.setItem('auth_token', token)
  }

  /**
   * Nettoyer les données d'authentification
   */
  function clearAuthData(): void {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('auth_token')
  }

  /**
   * Vérifier si l'utilisateur a une permission
   */
  function hasPermission(permission: string): boolean {
    if (!user.value) return false

    // Logique basée sur le niveau gaming
    const level = user.value.level?.level || 0

    switch (permission) {
      case 'premium_features': return level >= 10
      case 'export_data': return level >= 20
      case 'api_access': return level >= 30
      case 'moderate_community': return level >= 50
      default: return false
    }
  }

  // Computed properties
  const userLevel = computed(() => user.value?.level?.level || 0)
  const totalXP = computed(() => user.value?.level?.total_xp || 0)
  const userName = computed(() => user.value?.name || '')

  return {
    // State
    user,
    isAuthenticated,
    loading,

    // Computed
    userLevel,
    totalXP,
    userName,

    // Methods
    initAuth,
    login,
    register,
    logout,
    fetchUser,
    hasPermission
  }
}
