// src/composables/useCategories.ts - VERSION CORRIGÉE
// ✅ Utilise le singleton api au lieu de useApi()
// ✅ Cache in-memory simple au lieu de useCache composable
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { ApiResponse } from '@/services/api'

// ==========================================
// TYPES
// ==========================================

interface Category {
  id: number
  name: string
  icon?: string
  color: string
  type: 'income' | 'expense' | 'both'
  budget_limit?: number
  is_default: boolean
  description?: string
}

interface CategoryForm {
  name: string
  icon?: string
  color: string
  type: 'income' | 'expense' | 'both'
  budget_limit?: number
  description?: string
}

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

// ==========================================
// CACHE SIMPLE
// ==========================================

const cache = new Map<
  string,
  {
    data: any
    expires: number
    tags: string[]
  }
>()

function remember<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  tags: string[] = [],
): Promise<T> {
  const entry = cache.get(key)
  if (entry && Date.now() < entry.expires) {
    return Promise.resolve(entry.data as T)
  }
  return fetcher().then((data) => {
    cache.set(key, { data, expires: Date.now() + ttlMs, tags })
    return data
  })
}

function invalidateByTag(tag: string): void {
  for (const [key, entry] of cache.entries()) {
    if (entry.tags.includes(tag)) cache.delete(key)
  }
}

// ==========================================
// COMPOSABLE
// ==========================================

export function useCategories() {
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
          const response = await api.get<Category[]>('/categories')
          return response.data || []
        },
        5 * 60 * 1000,
        ['categories'],
      )
    } catch (error: any) {
      console.error('loadCategories error:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Créer une catégorie
   */
  async function createCategory(data: CategoryForm): Promise<ApiResponse<Category>> {
    try {
      const response = await api.post<Category>('/categories', data)
      if (response.success && response.data) {
        categories.value.push(response.data)
        invalidateCategoryCaches()
      }
      return response
    } catch (error: any) {
      console.error('createCategory error:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * Mettre à jour une catégorie
   */
  async function updateCategory(id: number, data: Partial<CategoryForm>): Promise<boolean> {
    try {
      const response = await api.put<Category>(`/categories/${id}`, data)
      if (response.success && response.data) {
        updateCategoryInList(response.data)
        invalidateCategoryCaches()
        return true
      }
      return false
    } catch (error: any) {
      console.error('updateCategory error:', error)
      return false
    }
  }

  /**
   * Supprimer une catégorie
   */
  async function deleteCategory(id: number): Promise<boolean> {
    try {
      const response = await api.delete(`/categories/${id}`)
      if (response.success) {
        categories.value = categories.value.filter((c) => c.id !== id)
        invalidateCategoryCaches()
        return true
      }
      return false
    } catch (error: any) {
      console.error('deleteCategory error:', error)
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
          const response = await api.get<CategoryBudget[]>('/categories/budgets')
          return response.data || []
        },
        2 * 60 * 1000,
        ['categories', 'budgets'],
      )
    } catch (error: any) {
      console.error('loadCategoryBudgets error:', error)
    }
  }

  /**
   * Définir un budget
   */
  async function setCategoryBudget(categoryId: number, monthlyLimit: number): Promise<boolean> {
    try {
      const response = await api.post(`/categories/${categoryId}/budget`, {
        monthly_limit: monthlyLimit,
      })
      if (response.success) {
        await loadCategoryBudgets()
        invalidateCategoryCaches()
        return true
      }
      return false
    } catch (error: any) {
      console.error('setCategoryBudget error:', error)
      return false
    }
  }

  // ==========================================
  // HELPERS
  // ==========================================

  function getCategoriesByType(type: 'income' | 'expense' | 'both'): Category[] {
    return categories.value.filter((c) => c.type === type || c.type === 'both')
  }

  function findCategory(id: number): Category | undefined {
    return categories.value.find((c) => c.id === id)
  }

  function isBudgetExceeded(categoryId: number): boolean {
    const b = budgets.value.find((b) => b.category_id === categoryId)
    return b ? b.status === 'exceeded' : false
  }

  function getBudgetUsage(categoryId: number): number {
    const b = budgets.value.find((b) => b.category_id === categoryId)
    return b ? b.percentage_used : 0
  }

  async function getAIRecommendations(): Promise<any[]> {
    return remember(
      'category_recommendations',
      async () => {
        const response = await api.get('/categories/recommendations')
        return response.data || []
      },
      10 * 60 * 1000,
      ['categories', 'ai'],
    )
  }

  async function duplicateCategory(id: number, newName: string): Promise<boolean> {
    const original = findCategory(id)
    if (!original) return false

    const result = await createCategory({
      name: newName,
      icon: original.icon,
      color: original.color,
      type: original.type,
      budget_limit: original.budget_limit,
      description: original.description,
    })
    return result.success
  }

  function updateCategoryInList(updated: Category): void {
    const idx = categories.value.findIndex((c) => c.id === updated.id)
    if (idx !== -1) categories.value[idx] = updated
  }

  function invalidateCategoryCaches(): void {
    invalidateByTag('categories')
    invalidateByTag('budgets')
    invalidateByTag('analytics')
  }

  async function getCategoryStats(): Promise<CategoryStats | null> {
    return remember(
      'category_stats',
      async () => {
        const response = await api.get<CategoryStats>('/categories/stats')
        return response.data || null
      },
      5 * 60 * 1000,
      ['categories', 'stats'],
    )
  }

  // ==========================================
  // COMPUTED
  // ==========================================

  const incomeCategories = computed(() => getCategoriesByType('income'))
  const expenseCategories = computed(() => getCategoriesByType('expense'))
  const allCategories = computed(() => getCategoriesByType('both'))
  const categoriesWithBudget = computed(() =>
    categories.value.filter((c) => c.budget_limit && c.budget_limit > 0),
  )
  const exceededBudgets = computed(() => budgets.value.filter((b) => b.status === 'exceeded'))
  const warningBudgets = computed(() => budgets.value.filter((b) => b.status === 'warning'))
  const totalBudgetAllocated = computed(() =>
    categoriesWithBudget.value.reduce((sum, c) => sum + (c.budget_limit || 0), 0),
  )

  // ==========================================
  // RETURN
  // ==========================================

  return {
    categories,
    budgets,
    currentCategory,
    loading,
    incomeCategories,
    expenseCategories,
    allCategories,
    categoriesWithBudget,
    exceededBudgets,
    warningBudgets,
    totalBudgetAllocated,
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
    getCategoryStats,
  }
}
