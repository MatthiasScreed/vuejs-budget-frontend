// src/stores/transactionStore.ts - Extrait des corrections clés

// ==========================================
// 🔐 AUTH CHECK - VERSION AMÉLIORÉE
// ==========================================

/**
 * ✅ Vérifier auth SANS bloquer
 */
function checkAuth(): boolean {
  const authStore = useAuthStore()

  // ✅ Vérifier d'abord isAuthenticated (set avant isInitialized parfois)
  if (authStore.isAuthenticated && authStore.token) {
    return true
  }

  if (!authStore.isInitialized) {
    console.log('⏳ [Transactions] Auth pas encore initialisée')
    return false
  }

  if (!authStore.isAuthenticated) {
    console.warn('⚠️ [Transactions] Non authentifié')
    return false
  }

  return true
}

/**
 * ✅ Attendre l'auth avec vérification du token
 */
async function waitForAuth(maxWaitMs = 3000): Promise<boolean> {
  const authStore = useAuthStore()

  // ✅ Si déjà prêt avec token
  if (authStore.isInitialized && authStore.isAuthenticated && authStore.token) {
    console.log('✅ [Transactions] Auth déjà prête')
    return true
  }

  const startTime = Date.now()
  let checkCount = 0

  while (Date.now() - startTime < maxWaitMs) {
    // ✅ Vérifier les 3 conditions
    if (authStore.isInitialized && authStore.isAuthenticated && authStore.token) {
      console.log(`✅ [Transactions] Auth prête après ${checkCount} checks`)
      return true
    }

    await new Promise((r) => setTimeout(r, 50))
    checkCount++
  }

  console.warn('⚠️ [Transactions] Timeout attente auth')
  console.log('  - isInitialized:', authStore.isInitialized)
  console.log('  - isAuthenticated:', authStore.isAuthenticated)
  console.log('  - hasToken:', !!authStore.token)

  return authStore.isAuthenticated
}

// ==========================================
// ACTIONS - fetchTransactions corrigé
// ==========================================

/**
 * ✅ Récupérer les transactions - avec meilleure gestion auth
 */
async function fetchTransactions(filters?: TransactionFilters): Promise<void> {
  // ✅ Attendre l'auth avec plus de temps
  const isAuth = await waitForAuth(3000)

  if (!isAuth) {
    console.warn('⚠️ [Transactions] Chargement sans auth - abandon')
    error.value = 'Authentification requise'
    return
  }

  if (loading.value) {
    console.log('⏳ [Transactions] Déjà en chargement')
    return
  }

  loading.value = true
  error.value = null

  try {
    const params = { ...activeFilters.value, ...filters }
    console.log('📡 [Transactions] Fetch avec params:', params)

    const response = await api.get<any>('/transactions', { params })

    // ✅ Vérifier si la réponse indique une erreur auth
    if (!response.success && response.message === 'Session invalide') {
      console.warn('⚠️ [Transactions] Session invalide - ne pas déconnecter')
      error.value = 'Session expirée, veuillez rafraîchir'
      transactions.value = []
      return
    }

    if (!response) {
      console.warn('⚠️ [Transactions] Pas de réponse API')
      transactions.value = []
      return
    }

    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        transactions.value = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        transactions.value = response.data.data
        pagination.value = {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 15,
          total: response.data.total || 0,
          from: response.data.from || 0,
          to: response.data.to || 0,
        }
      } else {
        transactions.value = []
      }

      console.log('✅ [Transactions] Chargées:', transactions.value.length)
    }
  } catch (err: any) {
    // ✅ NE PAS propager l'erreur 401 comme déconnexion
    if (err.response?.status === 401) {
      console.warn('⚠️ [Transactions] 401 reçu - session peut-être expirée')
      error.value = 'Session expirée'
      // ✅ NE PAS vider les transactions, juste signaler l'erreur
      return
    }

    console.error('❌ [Transactions] Erreur:', err)
    error.value = err.message || 'Erreur chargement'
  } finally {
    loading.value = false
  }
}
