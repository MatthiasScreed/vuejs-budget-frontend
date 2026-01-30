import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/composables/core/useApi'
import { useErrorHandler } from '@/composables/core/useErrorHandler'
import { useCache } from '@/composables/core/useCache'
import { eventBus } from '@/services/eventBus'
import { useAuthGuard } from '@/composables/useAuthGuard'
import type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionStats,
  PaginatedTransactions,
} from '@/types/base'

export const useTransactionStore = defineStore('transaction', () => {
  const { get, post, put, delete: del } = useApi()
  const { handleApiError } = useErrorHandler()
  const { ensureAuthenticated } = useAuthGuard()
  const { remember, invalidateByTag } = useCache()

  // ==========================================
  // STATE
  // ==========================================

  const transactions = ref<Transaction[]>([])
  const pendingTransactions = ref<Transaction[]>([])
  const currentTransaction = ref<Transaction | null>(null)
  const stats = ref<TransactionStats | null>(null)

  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
    has_more_pages: false,
  })

  const filters = ref<TransactionFilters>({
    per_page: 15,
    page: 1,
  })

  const loading = ref(false)
  const syncing = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const deleting = ref(false)
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]>>({})

  // ==========================================
  // GETTERS
  // ==========================================

  const incomeTransactions = computed(() => transactions.value.filter((t) => t.type === 'income'))

  const expenseTransactions = computed(() => transactions.value.filter((t) => t.type === 'expense'))

  const recentTransactions = computed(() =>
    transactions.value
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10),
  )

  const totalIncome = computed(() =>
    incomeTransactions.value.reduce((sum, t) => {
      const amount = Number(t.amount) || 0
      return sum + amount
    }, 0),
  )

  const totalExpenses = computed(() =>
    expenseTransactions.value.reduce((sum, t) => {
      const amount = Number(t.amount) || 0
      return sum + amount
    }, 0),
  )

  const balance = computed(() => totalIncome.value - totalExpenses.value)

  const isLoading = computed(
    () => loading.value || creating.value || updating.value || deleting.value || syncing.value,
  )

  const hasTransactions = computed(() => transactions.value.length > 0)
  const hasPendingTransactions = computed(() => pendingTransactions.value.length > 0)
  const hasStats = computed(() => stats.value !== null)

  // ==========================================
  // ACTIONS - BRIDGE API
  // ==========================================

  /**
   * 🏦 Récupérer les transactions d'une connexion bancaire
   */
  async function fetchBankTransactions(connectionId: number) {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip fetchBankTransactions: utilisateur non authentifié')
      return null
    }

    syncing.value = true
    error.value = null

    try {
      const response = await get<any>(`/bank/connections/${connectionId}/transactions`)

      if (!response.success) {
        throw new Error(response.message || 'Erreur récupération transactions bancaires')
      }

      const bankTransactions = response.data || []

      // Éviter les doublons
      bankTransactions.forEach((bankTx: any) => {
        const exists = transactions.value.some((t) => t.bank_transaction_id === bankTx.id)

        if (!exists) {
          transactions.value.push(bankTx)
        }
      })

      invalidateByTag('transactions')
      eventBus.emit('transactions:synced', bankTransactions)

      return response.data
    } catch (err: any) {
      await handleApiError(err, 'fetch_bank_transactions')
      error.value = err.message
      throw err
    } finally {
      syncing.value = false
    }
  }

  /**
   * 🔄 Synchroniser toutes les connexions bancaires
   */
  async function syncAllBankConnections() {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip syncAllBankConnections: utilisateur non authentifié')
      return null
    }

    syncing.value = true

    try {
      const response = await post<any>('/bank/sync-all')

      if (!response.success) {
        throw new Error(response.message || 'Erreur synchronisation')
      }

      await fetchTransactions()

      eventBus.emit('transactions:synced-all')

      return response.data
    } catch (err: any) {
      await handleApiError(err, 'sync_all_banks')
      error.value = err.message
      throw err
    } finally {
      syncing.value = false
    }
  }

  /**
   * ⏳ Récupérer les transactions en attente
   */
  async function fetchPendingTransactions() {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip fetchPendingTransactions: utilisateur non authentifié')
      pendingTransactions.value = []
      return []
    }

    loading.value = true

    try {
      const response = await get<any>('/bank/pending-transactions')

      if (response.success) {
        pendingTransactions.value = response.data || []
      }

      return pendingTransactions.value
    } catch (err: any) {
      await handleApiError(err, 'fetch_pending_transactions')
      pendingTransactions.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 🏷️ Catégoriser une transaction
   */
  async function categorizeTransaction(
    transactionId: number,
    categoryId: number,
  ): Promise<boolean> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip categorizeTransaction: utilisateur non authentifié')
      return false
    }

    updating.value = true

    try {
      const response = await put<Transaction>(`/transactions/${transactionId}/categorize`, {
        category_id: categoryId,
      })

      if (response.success && response.data) {
        const index = transactions.value.findIndex((t) => t.id === transactionId)
        if (index !== -1) {
          transactions.value[index] = response.data
        }

        pendingTransactions.value = pendingTransactions.value.filter((t) => t.id !== transactionId)

        invalidateByTag('transactions')
        eventBus.emit('transaction:categorized', response.data)

        return true
      }

      throw new Error(response.message || 'Erreur catégorisation')
    } catch (err: any) {
      await handleApiError(err, 'categorize_transaction', false)
      error.value = err.message
      return false
    } finally {
      updating.value = false
    }
  }

  /**
   * 🤖 Catégorisation automatique (IA)
   */
  async function autoCategorize(transactionId?: number) {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip autoCategorize: utilisateur non authentifié')
      return null
    }

    updating.value = true

    try {
      const endpoint = transactionId
        ? `/transactions/${transactionId}/auto-categorize`
        : '/transactions/auto-categorize'

      const response = await post<any>(endpoint)

      if (response.success) {
        await fetchTransactions()

        eventBus.emit('transactions:auto-categorized', response.data)

        return response.data
      }

      throw new Error(response.message || 'Erreur catégorisation auto')
    } catch (err: any) {
      await handleApiError(err, 'auto_categorize', false)
      error.value = err.message
      return null
    } finally {
      updating.value = false
    }
  }

  // ==========================================
  // ACTIONS - CRUD TRANSACTIONS
  // ==========================================

  /**
   * ✅ Charger les transactions avec vérification auth
   */
  async function fetchTransactions(newFilters: TransactionFilters = {}) {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip fetchTransactions: utilisateur non authentifié')
      return
    }

    loading.value = true
    error.value = null

    try {
      const mergedFilters = { ...filters.value, ...newFilters }
      filters.value = mergedFilters

      console.log('📡 Fetching transactions...')

      const response = await get<any>('/transactions', {
        params: mergedFilters,
      })

      if (!response.success) {
        throw new Error(response.message || 'Erreur chargement transactions')
      }

      if (Array.isArray(response.data)) {
        transactions.value = response.data.map((t: any) => ({
          ...t,
          amount: Number(t.amount) || 0,
        }))

        if (response.meta) {
          pagination.value = {
            current_page: response.meta.current_page || 1,
            per_page: response.meta.per_page || 15,
            total: response.meta.total || 0,
            last_page: response.meta.last_page || 1,
            from: response.meta.from || 0,
            to: response.meta.to || 0,
            has_more_pages: response.meta.has_more_pages || false,
          }
        }
      } else if (response.data?.data) {
        transactions.value = response.data.data.map((t: any) => ({
          ...t,
          amount: Number(t.amount) || 0,
        }))

        if (response.data.meta) {
          pagination.value = response.data.meta
        }
      } else {
        console.warn('⚠️ Format inattendu')
        transactions.value = []
      }

      console.log('✅ Transactions chargées:', transactions.value.length)
    } catch (err: any) {
      console.error('❌ Erreur fetchTransactions:', err)
      await handleApiError(err, 'fetch_transactions')
      error.value = err.message
      transactions.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * ✅ Créer une nouvelle transaction
   */
  async function createTransaction(data: CreateTransactionData): Promise<boolean> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip createTransaction: utilisateur non authentifié')
      return false
    }

    creating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const response = await post<Transaction>('/transactions', data)

      if (response.success && response.data) {
        const newTransaction = {
          ...response.data,
          amount: Number(response.data.amount) || 0,
        }

        transactions.value.unshift(newTransaction)

        invalidateByTag('transactions')
        invalidateByTag('stats')

        eventBus.emit('transaction:created', newTransaction)

        if (hasStats.value) {
          await fetchStats()
        }

        return true
      }

      throw new Error(response.message || 'Erreur création transaction')
    } catch (err: any) {
      await handleApiError(err, 'create_transaction', false)

      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors || {}
      }

      error.value = err.message
      return false
    } finally {
      creating.value = false
    }
  }

  /**
   * ✅ Mettre à jour une transaction
   */
  async function updateTransaction(id: number, data: UpdateTransactionData): Promise<boolean> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip updateTransaction: utilisateur non authentifié')
      return false
    }

    updating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const response = await put<Transaction>(`/transactions/${id}`, data)

      if (response.success && response.data) {
        const updatedTransaction = {
          ...response.data,
          amount: Number(response.data.amount) || 0,
        }

        const index = transactions.value.findIndex((t) => t.id === id)
        if (index !== -1) {
          transactions.value[index] = updatedTransaction
        }

        if (currentTransaction.value?.id === id) {
          currentTransaction.value = updatedTransaction
        }

        invalidateByTag('transactions')
        eventBus.emit('transaction:updated', updatedTransaction)

        if (hasStats.value) {
          await fetchStats()
        }

        return true
      }

      throw new Error(response.message || 'Erreur mise à jour transaction')
    } catch (err: any) {
      await handleApiError(err, 'update_transaction', false)

      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors || {}
      }

      error.value = err.message
      return false
    } finally {
      updating.value = false
    }
  }

  /**
   * ✅ Supprimer une transaction
   */
  async function deleteTransaction(id: number): Promise<boolean> {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip deleteTransaction: utilisateur non authentifié')
      return false
    }

    deleting.value = true
    error.value = null

    try {
      const response = await del(`/transactions/${id}`)

      if (response.success) {
        transactions.value = transactions.value.filter((t) => t.id !== id)

        if (currentTransaction.value?.id === id) {
          currentTransaction.value = null
        }

        invalidateByTag('transactions')
        eventBus.emit('transaction:deleted', id)

        if (hasStats.value) {
          await fetchStats()
        }

        return true
      }

      throw new Error(response.message || 'Erreur suppression transaction')
    } catch (err: any) {
      await handleApiError(err, 'delete_transaction')
      error.value = err.message
      return false
    } finally {
      deleting.value = false
    }
  }

  /**
   * ✅ Charger les statistiques
   */
  async function fetchStats() {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip fetchStats: utilisateur non authentifié')
      stats.value = null
      return
    }

    try {
      const response = await get<any>('/transactions/stats')

      if (response.success && response.data) {
        console.log('📊 Stats API:', response.data)
        stats.value = response.data
        return
      }
    } catch (err: any) {
      console.warn('⚠️ Stats API failed, calcul local:', err.message)
    }

    // Fallback : calculer localement
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyTransactions = transactions.value.filter((t) => {
      const date = new Date(t.transaction_date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    stats.value = {
      total_transactions: transactions.value.length,
      total_income: totalIncome.value,
      total_expenses: totalExpenses.value,
      balance: balance.value,
      monthly_income: monthlyIncome,
      monthly_expenses: monthlyExpenses,
      calculated_locally: true,
    }

    console.log('✅ Stats calculées localement:', stats.value)
  }

  /**
   * ✅ Charger une transaction spécifique
   */
  async function fetchTransaction(id: number) {
    // 🔥 VÉRIFICATION AUTH
    const isAuth = await ensureAuthenticated()
    if (!isAuth) {
      console.warn('⚠️ Skip fetchTransaction: utilisateur non authentifié')
      return
    }

    loading.value = true

    try {
      const response = await get<Transaction>(`/transactions/${id}`)

      if (response.success) {
        currentTransaction.value = {
          ...response.data,
          amount: Number(response.data.amount) || 0,
        }
      }
    } catch (err: any) {
      await handleApiError(err, 'fetch_transaction')
    } finally {
      loading.value = false
    }
  }

  /**
   * Changer de page
   */
  async function changePage(page: number) {
    if (page >= 1 && page <= pagination.value.last_page) {
      await fetchTransactions({ ...filters.value, page })
    }
  }

  /**
   * Appliquer des filtres
   */
  async function applyFilters(newFilters: TransactionFilters) {
    await fetchTransactions({ ...newFilters, page: 1 })
  }

  /**
   * Actualiser les données
   */
  async function refresh() {
    invalidateByTag('transactions')

    await Promise.all([fetchTransactions(filters.value), fetchPendingTransactions(), fetchStats()])
  }

  /**
   * Nettoyer les erreurs
   */
  function clearErrors() {
    error.value = null
    validationErrors.value = {}
  }

  /**
   * Réinitialiser le store
   */
  function $reset() {
    transactions.value = []
    pendingTransactions.value = []
    currentTransaction.value = null
    stats.value = null
    pagination.value = {
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1,
      from: 0,
      to: 0,
      has_more_pages: false,
    }
    filters.value = { per_page: 15, page: 1 }
    loading.value = false
    syncing.value = false
    creating.value = false
    updating.value = false
    deleting.value = false
    error.value = null
    validationErrors.value = {}
  }

  return {
    // State
    transactions,
    pendingTransactions,
    currentTransaction,
    stats,
    pagination,
    filters,
    loading,
    syncing,
    creating,
    updating,
    deleting,
    error,
    validationErrors,

    // Getters
    incomeTransactions,
    expenseTransactions,
    recentTransactions,
    totalIncome,
    totalExpenses,
    balance,
    isLoading,
    hasTransactions,
    hasPendingTransactions,
    hasStats,

    // Actions - Bridge API
    fetchBankTransactions,
    syncAllBankConnections,
    fetchPendingTransactions,
    categorizeTransaction,
    autoCategorize,

    // Actions - CRUD
    fetchTransactions,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchStats,
    changePage,
    applyFilters,
    refresh,
    clearErrors,
    $reset,
  }
})
