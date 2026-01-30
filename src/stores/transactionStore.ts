// src/stores/transactionStore.ts - VERSION CORRIGÉE AVEC AUTH GUARD
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

// ==========================================
// TYPES
// ==========================================

export interface Transaction {
  id: number
  user_id: number
  category_id?: number
  amount: number
  description: string
  type: 'income' | 'expense'
  date: string
  is_recurring: boolean
  status: 'pending' | 'completed' | 'cancelled'
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  category?: {
    id: number
    name: string
    icon?: string
    color?: string
  }
}

export interface CreateTransactionData {
  category_id?: number
  amount: number
  description: string
  type: 'income' | 'expense'
  date: string
  is_recurring?: boolean
  metadata?: Record<string, any>
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  status?: 'pending' | 'completed' | 'cancelled'
}

// ==========================================
// STORE DEFINITION - VERSION SÉCURISÉE ✅
// ==========================================

export const useTransactionStore = defineStore('transaction', () => {
  // ==========================================
  // STATE
  // ==========================================

  const transactions = ref<Transaction[]>([])
  const currentTransaction = ref<Transaction | null>(null)

  // États de chargement
  const loading = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const deleting = ref(false)

  // Erreurs
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]>>({})

  // Filtres
  const filters = ref({
    type: null as 'income' | 'expense' | null,
    category: null as number | null,
    dateFrom: null as string | null,
    dateTo: null as string | null,
    search: '',
  })

  // ==========================================
  // 🔐 AUTH GUARD HELPER
  // ==========================================

  /**
   * Vérifier que l'utilisateur est authentifié avant un appel API
   */
  async function ensureAuthenticated(): Promise<boolean> {
    const authStore = useAuthStore()

    // 1️⃣ Attendre l'initialisation de l'auth
    if (!authStore.isInitialized) {
      console.log('⏳ [Transactions] Attente initialisation auth...')

      let attempts = 0
      const maxAttempts = 30 // 3 secondes max

      while (!authStore.isInitialized && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 100))
        attempts++
      }

      if (!authStore.isInitialized) {
        console.error('❌ [Transactions] Auth non initialisée après timeout')
        return false
      }
    }

    // 2️⃣ Vérifier l'authentification
    if (!authStore.isAuthenticated) {
      console.warn('⚠️ [Transactions] Utilisateur non authentifié')
      return false
    }

    console.log('✅ [Transactions] Utilisateur authentifié')
    return true
  }

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * Transactions filtrées
   */
  const filteredTransactions = computed(() => {
    let result = [...transactions.value]

    // Filtre par type
    if (filters.value.type) {
      result = result.filter((t) => t.type === filters.value.type)
    }

    // Filtre par catégorie
    if (filters.value.category) {
      result = result.filter((t) => t.category_id === filters.value.category)
    }

    // Filtre par date
    if (filters.value.dateFrom) {
      result = result.filter((t) => new Date(t.date) >= new Date(filters.value.dateFrom!))
    }

    if (filters.value.dateTo) {
      result = result.filter((t) => new Date(t.date) <= new Date(filters.value.dateTo!))
    }

    // Recherche textuelle
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(search) ||
          t.category?.name.toLowerCase().includes(search),
      )
    }

    return result
  })

  /**
   * Transactions de revenus
   */
  const incomeTransactions = computed(() => transactions.value.filter((t) => t.type === 'income'))

  /**
   * Transactions de dépenses
   */
  const expenseTransactions = computed(() => transactions.value.filter((t) => t.type === 'expense'))

  /**
   * Total des revenus
   */
  const totalIncome = computed(() => incomeTransactions.value.reduce((sum, t) => sum + t.amount, 0))

  /**
   * Total des dépenses
   */
  const totalExpenses = computed(() =>
    expenseTransactions.value.reduce((sum, t) => sum + t.amount, 0),
  )

  /**
   * Balance nette
   */
  const netBalance = computed(() => totalIncome.value - totalExpenses.value)

  /**
   * Transactions par catégorie
   */
  const transactionsByCategory = computed(() => {
    const grouped = new Map<number, Transaction[]>()

    transactions.value.forEach((transaction) => {
      if (transaction.category_id) {
        if (!grouped.has(transaction.category_id)) {
          grouped.set(transaction.category_id, [])
        }
        grouped.get(transaction.category_id)!.push(transaction)
      }
    })

    return Array.from(grouped.entries()).map(([categoryId, transactions]) => ({
      categoryId,
      categoryName: transactions[0]?.category?.name || 'Sans catégorie',
      transactions,
      total: transactions.reduce((sum, t) => sum + t.amount, 0),
      count: transactions.length,
    }))
  })

  /**
   * Transactions récentes (30 derniers jours)
   */
  const recentTransactions = computed(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return transactions.value
      .filter((t) => new Date(t.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  // ==========================================
  // ACTIONS - AVEC AUTH GUARD
  // ==========================================

  /**
   * Récupérer toutes les transactions
   * 🔐 Protégé par auth guard
   */
  async function fetchTransactions(): Promise<void> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Transactions] fetchTransactions annulé - utilisateur non authentifié')
      error.value = 'Authentication required'
      throw new Error('Authentication required')
    }

    if (loading.value) {
      console.log('⏳ [Transactions] Chargement déjà en cours, ignoré')
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('💳 [Transactions] Chargement des transactions...')

      const response = await api.get<any>('/transactions')

      if (!response) {
        console.warn("⚠️ [Transactions] Aucune réponse de l'API")
        transactions.value = []
        return
      }

      if (response.success && response.data) {
        // Gérer les deux formats possibles
        const transactionsData = Array.isArray(response.data)
          ? response.data
          : response.data.data || []

        transactions.value = transactionsData
        console.log('✅ [Transactions] Transactions chargées:', transactions.value.length)
      } else {
        console.warn('⚠️ [Transactions] API returned no data')
        transactions.value = []
      }
    } catch (err: any) {
      console.error('❌ [Transactions] Erreur chargement transactions:', err)
      error.value = err.message || 'Erreur lors du chargement des transactions'
      transactions.value = []
      throw err // Relancer l'erreur pour que le composant puisse la gérer
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupérer une transaction par son ID
   * 🔐 Protégé par auth guard
   */
  async function fetchTransaction(transactionId: number): Promise<Transaction | null> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Transactions] fetchTransaction annulé - utilisateur non authentifié')
      return null
    }

    try {
      console.log('💳 [Transactions] Chargement transaction:', transactionId)

      const response = await api.get<Transaction>(`/transactions/${transactionId}`)

      if (!response) {
        throw new Error("Aucune réponse de l'API")
      }

      if (response.success && response.data) {
        currentTransaction.value = response.data
        return response.data
      }

      return null
    } catch (err: any) {
      console.error('❌ [Transactions] Erreur chargement transaction:', err)
      error.value = err.message
      return null
    }
  }

  /**
   * Créer une nouvelle transaction
   * 🔐 Protégé par auth guard
   */
  async function createTransaction(data: CreateTransactionData): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Transactions] createTransaction annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return false
    }

    creating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      console.log('📝 [Transactions] Création transaction:', data)

      const response = await api.post<Transaction>('/transactions', data)

      if (!response) {
        throw new Error("Aucune réponse de l'API")
      }

      if (response.success && response.data) {
        transactions.value.push(response.data)
        console.log('✅ [Transactions] Transaction créée:', response.data)
        return true
      }

      if (response.errors) {
        validationErrors.value = response.errors
      }

      error.value = response.message || 'Erreur lors de la création'
      return false
    } catch (err: any) {
      console.error('❌ [Transactions] Erreur création transaction:', err)

      if (err.response?.status === 422 && err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors
        error.value = 'Erreur de validation'
      } else {
        error.value = err.message || 'Erreur lors de la création de la transaction'
      }

      return false
    } finally {
      creating.value = false
    }
  }

  /**
   * Mettre à jour une transaction
   * 🔐 Protégé par auth guard
   */
  async function updateTransaction(
    transactionId: number,
    data: UpdateTransactionData,
  ): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Transactions] updateTransaction annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return false
    }

    updating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      console.log('✏️ [Transactions] Mise à jour transaction:', transactionId, data)

      const response = await api.put<Transaction>(`/transactions/${transactionId}`, data)

      if (!response) {
        throw new Error("Aucune réponse de l'API")
      }

      if (response.success && response.data) {
        const index = transactions.value.findIndex((t) => t.id === transactionId)
        if (index !== -1) {
          transactions.value[index] = response.data
        }

        if (currentTransaction.value?.id === transactionId) {
          currentTransaction.value = response.data
        }

        console.log('✅ [Transactions] Transaction mise à jour')
        return true
      }

      if (response.errors) {
        validationErrors.value = response.errors
      }

      error.value = response.message || 'Erreur lors de la mise à jour'
      return false
    } catch (err: any) {
      console.error('❌ [Transactions] Erreur mise à jour transaction:', err)

      if (err.response?.status === 422 && err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors
        error.value = 'Erreur de validation'
      } else {
        error.value = err.message || 'Erreur lors de la mise à jour'
      }

      return false
    } finally {
      updating.value = false
    }
  }

  /**
   * Supprimer une transaction
   * 🔐 Protégé par auth guard
   */
  async function deleteTransaction(transactionId: number): Promise<boolean> {
    // 🔐 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ [Transactions] deleteTransaction annulé - utilisateur non authentifié')
      error.value = 'Authentification requise'
      return false
    }

    deleting.value = true
    error.value = null

    try {
      console.log('🗑️ [Transactions] Suppression transaction:', transactionId)

      const response = await api.delete(`/transactions/${transactionId}`)

      if (!response) {
        throw new Error("Aucune réponse de l'API")
      }

      if (response.success) {
        transactions.value = transactions.value.filter((t) => t.id !== transactionId)

        if (currentTransaction.value?.id === transactionId) {
          currentTransaction.value = null
        }

        console.log('✅ [Transactions] Transaction supprimée')
        return true
      }

      error.value = response.message || 'Erreur lors de la suppression'
      return false
    } catch (err: any) {
      console.error('❌ [Transactions] Erreur suppression transaction:', err)
      error.value = err.message || 'Erreur lors de la suppression'
      return false
    } finally {
      deleting.value = false
    }
  }

  /**
   * Appliquer les filtres
   */
  function setFilters(newFilters: Partial<typeof filters.value>): void {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * Réinitialiser les filtres
   */
  function resetFilters(): void {
    filters.value = {
      type: null,
      category: null,
      dateFrom: null,
      dateTo: null,
      search: '',
    }
  }

  /**
   * Réinitialiser le store
   */
  function $reset(): void {
    transactions.value = []
    currentTransaction.value = null
    loading.value = false
    creating.value = false
    updating.value = false
    deleting.value = false
    error.value = null
    validationErrors.value = {}
    resetFilters()
    console.log('🔄 [Transactions] Store réinitialisé')
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    transactions,
    currentTransaction,
    loading,
    creating,
    updating,
    deleting,
    error,
    validationErrors,
    filters,

    // Getters
    filteredTransactions,
    incomeTransactions,
    expenseTransactions,
    totalIncome,
    totalExpenses,
    netBalance,
    transactionsByCategory,
    recentTransactions,

    // Actions
    fetchTransactions,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    resetFilters,
    $reset,
  }
})

export default useTransactionStore
