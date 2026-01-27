import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { categoryService } from '@/services/categoryService'
import type { Category, CreateCategoryData, UpdateCategoryData } from '@/types/entities/category'
import type { ApiResponse } from '@/types/base'

export const useCategoryStore = defineStore('category', () => {

  // ==========================================
  // STATE
  // ==========================================

  const categories = ref<Category[]>([])
  const currentCategory = ref<Category | null>(null)
  const templates = ref<Category[]>([])

  // États de chargement
  const loading = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const deleting = ref(false)

  // Erreurs
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]>>({})

  // Configuration par défaut
  const defaultCategories = ref<Category[]>([
    {
      id: 'food',
      name: 'Alimentation',
      icon: '🍽️',
      color: '#10B981',
      type: 'expense',
      is_template: true,
      user_customized: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'transport',
      name: 'Transport',
      icon: '🚗',
      color: '#3B82F6',
      type: 'expense',
      is_template: true,
      user_customized: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'entertainment',
      name: 'Loisirs',
      icon: '🎬',
      color: '#8B5CF6',
      type: 'expense',
      is_template: true,
      user_customized: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'salary',
      name: 'Salaire',
      icon: '💰',
      color: '#059669',
      type: 'income',
      is_template: true,
      user_customized: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * Catégories par type
   */
  const incomeCategories = computed(() =>
    categories.value.filter(c => c.type === 'income')
  )

  const expenseCategories = computed(() =>
    categories.value.filter(c => c.type === 'expense')
  )

  const transferCategories = computed(() =>
    categories.value.filter(c => c.type === 'transfer')
  )

  /**
   * Catégories personnalisées par l'utilisateur
   */
  const customCategories = computed(() =>
    categories.value.filter(c => c.user_customized)
  )

  /**
   * Catégories templates
   */
  const templateCategories = computed(() =>
    categories.value.filter(c => c.is_template)
  )

  /**
   * Hiérarchie des catégories (parents/enfants)
   */
  const categoryHierarchy = computed(() => {
    const parentCategories = categories.value.filter(c => !c.parent_id)

    return parentCategories.map(parent => ({
      ...parent,
      children: categories.value.filter(c => c.parent_id === parent.id)
    }))
  })

  /**
   * Catégories les plus utilisées
   */
  const popularCategories = computed(() => {
    return categories.value
      .filter(c => c.usage_count && c.usage_count > 0)
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, 5)
  })

  /**
   * Statistiques des catégories
   */
  const categoryStats = computed(() => {
    return {
      total: categories.value.length,
      income: incomeCategories.value.length,
      expense: expenseCategories.value.length,
      transfer: transferCategories.value.length,
      custom: customCategories.value.length,
      templates: templateCategories.value.length
    }
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Charger toutes les catégories
   */
  async function fetchCategories(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await categoryService.getCategories()

      if (response.success) {
        categories.value = response.data
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des catégories')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des catégories'
      console.error('Erreur fetchCategories:', err)

      // Fallback sur les catégories par défaut
      categories.value = defaultCategories.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger les templates de catégories
   */
  async function fetchTemplates(): Promise<void> {
    try {
      const response = await categoryService.getTemplates()

      if (response.success) {
        templates.value = response.data
      }
    } catch (err: any) {
      console.error('Erreur fetchTemplates:', err)
      templates.value = defaultCategories.value
    }
  }

  /**
   * Créer une nouvelle catégorie
   */
  async function createCategory(data: CreateCategoryData): Promise<boolean> {
    creating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const response = await categoryService.createCategory(data)

      if (response.success) {
        categories.value.push(response.data)
        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la création')
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors || {}
      }
      error.value = err.message || 'Erreur lors de la création de la catégorie'
      console.error('Erreur createCategory:', err)
      return false
    } finally {
      creating.value = false
    }
  }

  /**
   * Mettre à jour une catégorie
   */
  async function updateCategory(id: string, data: UpdateCategoryData): Promise<boolean> {
    updating.value = true
    error.value = null
    validationErrors.value = {}

    try {
      const response = await categoryService.updateCategory(id, data)

      if (response.success) {
        const index = categories.value.findIndex(c => c.id === id)
        if (index !== -1) {
          categories.value[index] = response.data
        }

        if (currentCategory.value?.id === id) {
          currentCategory.value = response.data
        }

        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour')
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors || {}
      }
      error.value = err.message || 'Erreur lors de la mise à jour de la catégorie'
      console.error('Erreur updateCategory:', err)
      return false
    } finally {
      updating.value = false
    }
  }

  /**
   * Supprimer une catégorie
   */
  async function deleteCategory(id: string): Promise<boolean> {
    deleting.value = true
    error.value = null

    try {
      const response = await categoryService.deleteCategory(id)

      if (response.success) {
        categories.value = categories.value.filter(c => c.id !== id)

        if (currentCategory.value?.id === id) {
          currentCategory.value = null
        }

        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression de la catégorie'
      console.error('Erreur deleteCategory:', err)
      return false
    } finally {
      deleting.value = false
    }
  }

  /**
   * Créer une catégorie depuis un template
   */
  async function createFromTemplate(templateId: string, customizations?: Partial<CreateCategoryData>): Promise<boolean> {
    const template = templates.value.find(t => t.id === templateId)
    if (!template) {
      error.value = 'Template non trouvé'
      return false
    }

    const categoryData: CreateCategoryData = {
      name: template.name,
      icon: template.icon,
      color: template.color,
      type: template.type,
      parent_id: template.parent_id,
      ...customizations
    }

    return createCategory(categoryData)
  }

  /**
   * Rechercher des catégories
   */
  function searchCategories(query: string): Category[] {
    const lowerQuery = query.toLowerCase()
    return categories.value.filter(category =>
      category.name.toLowerCase().includes(lowerQuery) ||
      (category.description && category.description.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Obtenir une catégorie par ID
   */
  function getCategoryById(id: string): Category | null {
    return categories.value.find(c => c.id === id) || null
  }

  /**
   * Obtenir les catégories enfants
   */
  function getChildCategories(parentId: string): Category[] {
    return categories.value.filter(c => c.parent_id === parentId)
  }

  /**
   * Vérifier si une catégorie a des enfants
   */
  function hasChildren(categoryId: string): boolean {
    return categories.value.some(c => c.parent_id === categoryId)
  }

  /**
   * Obtenir le chemin complet d'une catégorie (parent > enfant)
   */
  function getCategoryPath(categoryId: string): string {
    const category = getCategoryById(categoryId)
    if (!category) return ''

    if (category.parent_id) {
      const parent = getCategoryById(category.parent_id)
      return parent ? `${parent.name} > ${category.name}` : category.name
    }

    return category.name
  }

  /**
   * Initialiser avec les catégories par défaut
   */
  async function initializeDefaults(): Promise<void> {
    if (categories.value.length === 0) {
      categories.value = defaultCategories.value
    }
  }

  /**
   * Nettoyer les erreurs
   */
  function clearErrors(): void {
    error.value = null
    validationErrors.value = {}
  }

  /**
   * Réinitialiser le store
   */
  function $reset(): void {
    categories.value = []
    currentCategory.value = null
    templates.value = []
    loading.value = false
    creating.value = false
    updating.value = false
    deleting.value = false
    error.value = null
    validationErrors.value = {}
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    categories,
    currentCategory,
    templates,
    loading,
    creating,
    updating,
    deleting,
    error,
    validationErrors,
    defaultCategories,

    // Getters
    incomeCategories,
    expenseCategories,
    transferCategories,
    customCategories,
    templateCategories,
    categoryHierarchy,
    popularCategories,
    categoryStats,

    // Actions
    fetchCategories,
    fetchTemplates,
    createCategory,
    updateCategory,
    deleteCategory,
    createFromTemplate,
    searchCategories,
    getCategoryById,
    getChildCategories,
    hasChildren,
    getCategoryPath,
    initializeDefaults,
    clearErrors,
    $reset
  }
})
