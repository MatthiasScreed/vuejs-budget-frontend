// src/stores/transactionStore.ts - VERSION COMPLÈTE CORRIGÉE
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
  transaction_date: string
  date?: string
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

export interface TransactionFilters {
  type?: string
  category_id?: string | number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export interface PaginationInfo {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

// ==========================================
// STORE
// ==========================================

export const useTransactionStore = defineStore('transaction', () => {
  // ==========================================
  // STATE
  // ==========================================

  const transactions = ref<Transaction[]>([])
  const pendingTransactions = ref<Transaction[]>([])
  const currentTransaction = ref<Transaction | null>(null)
  const pagination = ref<PaginationInfo | null>(null)
  const stats = ref<any>(null)

  const loading = ref(false)
  const syncing = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const deleting = ref(false)

  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]>>({})

  const activeFilters = ref<TransactionFilters>({
    per_page: 15,
    page: 1,
  })

  // ==========================================
  // 🔐 AUTH CHECK
  // ==========================================

  function checkAuth(): boolean {
    const authStore = useAuthStore()

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

  async function waitForAuth(maxWaitMs = 3000): Promise<boolean> {
    const authStore = useAuthStore()

    if (authStore.isInitialized && authStore.isAuthenticated && authStore.token) {
      return true
    }

    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitMs) {
      if (authStore.isInitialized && authStore.isAuthenticated && authStore.token) {
        console.log('✅ [Transactions] Auth prête')
        return true
      }
      await new Promise((r) => setTimeout(r, 50))
    }

    console.warn('⚠️ [Transactions] Timeout attente auth')
    return authStore.isAuthenticated
  }

  // ==========================================
  // GETTERS
  // ==========================================

  const filteredTransactions = computed(() => [...transactions.value])

  const incomeTransactions = computed(() => transactions.value.filter((t) => t.type === 'income'))

  const expenseTransactions = computed(() => transactions.value.filter((t) => t.type === 'expense'))

  const totalIncome = computed(() =>
    incomeTransactions.value.reduce((sum, t) => sum + Number(t.amount || 0), 0),
  )

  const totalExpenses = computed(() =>
    expenseTransactions.value.reduce((sum, t) => sum + Number(t.amount || 0), 0),
  )

  const netBalance = computed(() => totalIncome.value - totalExpenses.value)

  // ==========================================
  // ACTIONS
  // ==========================================

  async function fetchTransactions(filters?: TransactionFilters): Promise<void> {
    const isAuth = await waitForAuth(3000)
    if (!isAuth) {
      console.warn('⚠️ [Transactions] Chargement sans auth - abandon')
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
      if (err.response?.status === 401) {
        console.warn('⚠️ [Transactions] 401 - Session expirée')
        error.value = 'Session expirée'
        return
      }
      console.error('❌ [Transactions] Erreur:', err)
      error.value = err.message || 'Erreur chargement'
    } finally {
      loading.value = false
    }
  }

  async function fetchPendingTransactions(): Promise<void> {
    if (!checkAuth()) return

    try {
      const response = await api.get<any>('/transactions/pending')
      if (response?.success && response.data) {
        pendingTransactions.value = Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      }
    } catch (err: any) {
      console.warn('⚠️ [Transactions] Erreur pending:', err.message)
      pendingTransactions.value = []
    }
  }

  async function fetchStats(): Promise<void> {
    if (!checkAuth()) return

    try {
      const response = await api.get<any>('/transactions/stats')
      if (response?.success && response.data) {
        stats.value = response.data
      }
    } catch (err: any) {
      console.warn('⚠️ [Transactions] Erreur stats:', err.message)
    }
  }

  async function createTransaction(data: CreateTransactionData): Promise<boolean> {
    if (!checkAuth()) {
      error.value = 'Authentification requise'
      return false
    }

    creating.value = true
    error.value = null

    try {
      const response = await api.post<Transaction>('/transactions', data)
      if (response?.success && response.data) {
        transactions.value.unshift(response.data)
        console.log('✅ [Transactions] Créée:', response.data.id)
        return true
      }
      error.value = response?.message || 'Erreur création'
      return false
    } catch (err: any) {
      console.error('❌ [Transactions] Erreur création:', err)
      error.value = err.message
      return false
    } finally {
      creating.value = false
    }
  }

  // À ajouter dans transactionStore.ts, dans la section ACTIONS,
  // après createTransaction et avant deleteTransaction

  async function updateTransaction(id: number, data: UpdateTransactionData): Promise<boolean> {
    if (!checkAuth()) {
      error.value = 'Authentification requise'
      return false
    }

    updating.value = true
    error.value = null

    try {
      console.log('✏️ [Transactions] Update:', id, data)

      // Nettoyer les données avant envoi
      // (ne pas envoyer les relations/objets)
      const cleanData: Record<string, any> = {}
      const allowedFields = [
        'type',
        'amount',
        'description',
        'transaction_date',
        'category_id',
        'is_recurring',
        'recurrence_frequency',
        'recurrence_end_date',
        'tags',
        'notes',
        'status',
      ]

      for (const key of allowedFields) {
        if (key in data) {
          cleanData[key] = (data as any)[key]
        }
      }

      const response = await api.put<Transaction>(`/transactions/${id}`, cleanData)

      if (response?.success && response.data) {
        // Mettre à jour dans le tableau local
        const index = transactions.value.findIndex((t) => t.id === id)
        if (index !== -1) {
          transactions.value[index] = response.data
        }
        console.log('✅ [Transactions] Mise à jour:', id)
        return true
      }

      if (response?.errors) {
        validationErrors.value = response.errors
      }
      error.value = response?.message || 'Erreur mise à jour'
      return false
    } catch (err: any) {
      console.error('❌ [Transactions] Erreur update:', err)

      if (err.response?.status === 422) {
        validationErrors.value = err.response?.data?.errors || {}
        error.value = 'Erreur de validation'
      } else {
        error.value = err.message || 'Erreur mise à jour'
      }
      return false
    } finally {
      updating.value = false
    }
  }

  // ⚠️ Ne pas oublier d'ajouter updateTransaction dans le return {}

  async function deleteTransaction(id: number): Promise<boolean> {
    if (!checkAuth()) {
      error.value = 'Authentification requise'
      return false
    }

    deleting.value = true
    error.value = null

    try {
      const response = await api.delete(`/transactions/${id}`)
      if (response?.success) {
        transactions.value = transactions.value.filter((t) => t.id !== id)
        console.log('✅ [Transactions] Supprimée:', id)
        return true
      }
      error.value = response?.message || 'Erreur suppression'
      return false
    } catch (err: any) {
      console.error('❌ [Transactions] Erreur suppression:', err)
      error.value = err.message
      return false
    } finally {
      deleting.value = false
    }
  }

  async function categorizeTransaction(id: number, categoryId: number): Promise<boolean> {
    if (!checkAuth()) return false

    try {
      const response = await api.put(`/transactions/${id}`, { category_id: categoryId })
      if (response?.success) {
        const tx = transactions.value.find((t) => t.id === id)
        if (tx) tx.category_id = categoryId
        pendingTransactions.value = pendingTransactions.value.filter((t) => t.id !== id)
        return true
      }
      return false
    } catch (err) {
      console.error('❌ Erreur catégorisation:', err)
      return false
    }
  }

  async function autoCategorize(): Promise<void> {
    if (!checkAuth()) return

    syncing.value = true
    try {
      await api.post('/transactions/auto-categorize')
      await fetchPendingTransactions()
      await fetchTransactions()
    } catch (err) {
      console.error('❌ Erreur auto-catégorisation:', err)
    } finally {
      syncing.value = false
    }
  }

  async function syncAllBankConnections(): Promise<void> {
    if (!checkAuth()) return

    syncing.value = true
    try {
      await api.post('/bank/sync-all')
      await fetchTransactions()
      await fetchPendingTransactions()
    } catch (err) {
      console.error('❌ Erreur sync bancaire:', err)
    } finally {
      syncing.value = false
    }
  }

  async function applyFilters(filters: TransactionFilters): Promise<void> {
    activeFilters.value = { ...activeFilters.value, ...filters, page: 1 }
    await fetchTransactions()
  }

  async function changePage(page: number): Promise<void> {
    activeFilters.value.page = page
    await fetchTransactions()
  }

  function $reset(): void {
    transactions.value = []
    pendingTransactions.value = []
    currentTransaction.value = null
    pagination.value = null
    stats.value = null
    loading.value = false
    syncing.value = false
    error.value = null
    activeFilters.value = { per_page: 15, page: 1 }
    console.log('🔄 [Transactions] Store reset')
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    transactions,
    pendingTransactions,
    currentTransaction,
    pagination,
    stats,
    loading,
    syncing,
    creating,
    updating,
    deleting,
    error,
    validationErrors,
    activeFilters,

    // Getters
    filteredTransactions,
    incomeTransactions,
    expenseTransactions,
    totalIncome,
    totalExpenses,
    netBalance,

    // Actions
    fetchTransactions,
    fetchPendingTransactions,
    fetchStats,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    categorizeTransaction,
    autoCategorize,
    syncAllBankConnections,
    applyFilters,
    changePage,
    $reset,
  }
})

export default useTransactionStore
