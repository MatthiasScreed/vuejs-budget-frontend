import { ref, computed } from 'vue'
import { useApi, useCache, useErrorHandler } from '@/composables/core'
import type { Category, CategoryForm, ApiResponse } from '@/types'

interface CategoryBudget {
  category_id: number
  monthly_limit: number
  current_spent: number
  percentage_used: number
  status: 'safe' | 'warning' | 'exceeded'
}

interface CategoryStats {
  total_categories: number
  most_used: Category
  highest_spending: Category
  budget_compliance: number
}

/**
 * Composable pour gestion complète des catégories
 * CRUD, budgets, statistiques et recommandations IA
 */
export function useCategories() {
  const { get, post, put, delete: del } = useApi()
  const { remember, invalidateByTag } = useCache()
  const { handleApiError } = useErrorHandler()

  // State
  const categories = ref<Category[]>([])
  const budgets = ref<CategoryBudget[]>([])
  const currentCategory = ref<Category | null>(null)
  const loading = ref(false)

  /**
   * Charger toutes les catégories
   */
  async function loadCategories(): Promise<void> {
    loading.value = true

    try {
      categories.value = await remember(
        'user_categories',
        async () => {
          const response = await get<Category[]>('/categories')
          return response.data || []
        },
        5 * 60 * 1000, // 5 minutes
        ['categories']
      )
    } catch (error: any) {
      await handleApiError(error, 'loadCategories')
    } finally {
      loading.value = false
    }
  }

  /**
   * Créer une nouvelle catégorie
   */
  async function createCategory(data: CategoryForm): Promise<ApiResponse<Category>> {
    try {
      const response = await post<Category>('/categories', data)

      if (response.success && response.data) {
        categories.value.push(response.data)
        invalidateCategoryCaches()
      }

      return response
    } catch (error: any) {
      await handleApiError(error, 'createCategory')
      return { success: false, message: error.message }
    }
  }

  /**
   * Mettre à jour une catégorie
   */
  async function updateCategory(id: number, data: Partial<CategoryForm>): Promise<boolean> {
    try {
      const response = await put<Category>(`/categories/${id}`, data)

      if (response.success && response.data) {
        updateCategoryInList(response.data)
        invalidateCategoryCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'updateCategory')
      return false
    }
  }

  /**
   * Supprimer une catégorie
   */
  async function deleteCategory(id: number): Promise<boolean> {
    try {
      const response = await del(`/categories/${id}`)

      if (response.success) {
        categories.value = categories.value.filter(c => c.id !== id)
        invalidateCategoryCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'deleteCategory')
      return false
    }
  }

  /**
   * Charger les budgets par catégorie
   */
  async function loadCategoryBudgets(): Promise<void> {
    try {
      budgets.value = await remember(
        'category_budgets',
        async () => {
          const response = await get<CategoryBudget[]>('/categories/budgets')
          return response.data || []
        },
        2 * 60 * 1000, // 2 minutes
        ['categories', 'budgets']
      )
    } catch (error: any) {
      await handleApiError(error, 'loadCategoryBudgets')
    }
  }

  /**
   * Définir un budget pour une catégorie
   */
  async function setCategoryBudget(categoryId: number, monthlyLimit: number): Promise<boolean> {
    try {
      const response = await post(`/categories/${categoryId}/budget`, {
        monthly_limit: monthlyLimit
      })

      if (response.success) {
        await loadCategoryBudgets()
        invalidateCategoryCaches()
        return true
      }

      return false
    } catch (error: any) {
      await handleApiError(error, 'setCategoryBudget')
      return false
    }
  }

  /**
   * Obtenir les catégories par type
   */
  function getCategoriesByType(type: 'income' | 'expense' | 'both'): Category[] {
    return categories.value.filter(c => c.type === type || c.type === 'both')
  }

  /**
   * Trouver une catégorie par ID
   */
  function findCategory(id: number): Category | undefined {
    return categories.value.find(c => c.id === id)
  }

  /**
   * Vérifier si une catégorie dépasse son budget
   */
  function isBudgetExceeded(categoryId: number): boolean {
    const budget = budgets.value.find(b => b.category_id === categoryId)
    return budget ? budget.status === 'exceeded' : false
  }

  /**
   * Obtenir le pourcentage d'utilisation du budget
   */
  function getBudgetUsage(categoryId: number): number {
    const budget = budgets.value.find(b => b.category_id === categoryId)
    return budget ? budget.percentage_used : 0
  }

  /**
   * Obtenir les recommandations de catégories IA
   */
  async function getAIRecommendations(): Promise<any[]> {
    return remember(
      'category_recommendations',
      async () => {
        const response = await get('/categories/recommendations')
        return response.data || []
      },
      10 * 60 * 1000, // 10 minutes
      ['categories', 'ai']
    )
  }

  /**
   * Dupliquer une catégorie
   */
  async function duplicateCategory(id: number, newName: string): Promise<boolean> {
    const original = findCategory(id)

    if (!original) return false

    const duplicateData: CategoryForm = {
      name: newName,
      icon: original.icon,
      color: original.color,
      type: original.type,
      budget_limit: original.budget_limit,
      description: original.description
    }

    const result = await createCategory(duplicateData)
    return result.success
  }

  /**
   * Mettre à jour une catégorie dans la liste
   */
  function updateCategoryInList(updatedCategory: Category): void {
    const index = categories.value.findIndex(c => c.id === updatedCategory.id)

    if (index !== -1) {
      categories.value[index] = updatedCategory
    }
  }

  /**
   * Invalider les caches liés aux catégories
   */
  function invalidateCategoryCaches(): void {
    invalidateByTag('categories')
    invalidateByTag('budgets')
    invalidateByTag('analytics')
  }

  /**
   * Obtenir les statistiques des catégories
   */
  async function getCategoryStats(): Promise<CategoryStats> {
    return remember(
      'category_stats',
      async () => {
        const response = await get<CategoryStats>('/categories/stats')
        return response.data
      },
      5 * 60 * 1000,
      ['categories', 'stats']
    )
  }

  // Computed properties
  const incomeCategories = computed(() => getCategoriesByType('income'))
  const expenseCategories = computed(() => getCategoriesByType('expense'))
  const allCategories = computed(() => getCategoriesByType('both'))

  const categoriesWithBudget = computed(() =>
    categories.value.filter(c => c.budget_limit && c.budget_limit > 0)
  )

  const exceededBudgets = computed(() =>
    budgets.value.filter(b => b.status === 'exceeded')
  )

  const warningBudgets = computed(() =>
    budgets.value.filter(b => b.status === 'warning')
  )

  const totalBudgetAllocated = computed(() =>
    categoriesWithBudget.value.reduce((sum, c) => sum + (c.budget_limit || 0), 0)
  )

  return {
    // State
    categories,
    budgets,
    currentCategory,
    loading,

    // Computed
    incomeCategories,
    expenseCategories,
    allCategories,
    categoriesWithBudget,
    exceededBudgets,
    warningBudgets,
    totalBudgetAllocated,

    // Methods
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    loadCategoryBudgets,
    setCategoryBudget,
    duplicateCategory,
    getCategoriesByType,
    findCategory,
    isBudgetExceeded,
    getBudgetUsage,
    getAIRecommendations,
    getCategoryStats
  }
}
