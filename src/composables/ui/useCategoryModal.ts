// src/composables/ui/useCategoryModal.ts
import { ref } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { useToast } from 'vue-toastification'
import type { Category, CreateCategoryData } from '@/types/entities/category'

export function useCategoryModal() {
  const categoryStore = useCategoryStore()
  const toast = useToast()

  // État des modales
  const showCategoryModal = ref(false)
  const editingCategory = ref<Category | null>(null)
  const categoryDefaultType = ref<'income' | 'expense'>('expense')

  // Callbacks pour notifier les composants parents
  const onCategoryCreatedCallback = ref<((category: Category) => void) | null>(null)
  const onCategoryUpdatedCallback = ref<((category: Category) => void) | null>(null)

  /**
   * Ouvrir la modale de création de catégorie
   */
  function openCategoryModal(
    defaultType: 'income' | 'expense' = 'expense',
    onCreated?: (category: Category) => void
  ) {
    categoryDefaultType.value = defaultType
    editingCategory.value = null
    onCategoryCreatedCallback.value = onCreated || null
    showCategoryModal.value = true
  }

  /**
   * Ouvrir la modale d'édition de catégorie
   */
  function openEditCategoryModal(
    category: Category,
    onUpdated?: (category: Category) => void
  ) {
    editingCategory.value = category
    onCategoryUpdatedCallback.value = onUpdated || null
    showCategoryModal.value = true
  }

  /**
   * Fermer la modale de catégorie
   */
  function closeCategoryModal() {
    showCategoryModal.value = false
    editingCategory.value = null
    onCategoryCreatedCallback.value = null
    onCategoryUpdatedCallback.value = null
  }

  /**
   * Gérer la sauvegarde d'une catégorie
   */
  async function handleCategorySave(categoryData: CreateCategoryData) {
    try {
      let savedCategory: Category

      if (editingCategory.value) {
        // Mode édition
        const success = await categoryStore.updateCategory(
          editingCategory.value.id,
          categoryData
        )

        if (!success) {
          throw new Error(categoryStore.error || 'Erreur lors de la mise à jour')
        }

        savedCategory = categoryStore.getCategoryById(editingCategory.value.id)!
        toast.success('Catégorie modifiée avec succès!')

        // Notifier le callback d'update
        if (onCategoryUpdatedCallback.value) {
          onCategoryUpdatedCallback.value(savedCategory)
        }

      } else {
        // Mode création
        const success = await categoryStore.createCategory(categoryData)

        if (!success) {
          throw new Error(categoryStore.error || 'Erreur lors de la création')
        }

        // Récupérer la dernière catégorie créée
        savedCategory = categoryStore.categories[categoryStore.categories.length - 1]
        toast.success('Catégorie créée avec succès!')

        // Notifier le callback de création
        if (onCategoryCreatedCallback.value) {
          onCategoryCreatedCallback.value(savedCategory)
        }
      }

      closeCategoryModal()
      return savedCategory

    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde')
      console.error('Erreur sauvegarde catégorie:', error)
      throw error
    }
  }

  /**
   * Créer une catégorie depuis un template
   */
  async function createFromTemplate(
    templateId: string,
    customizations: Partial<CreateCategoryData> = {}
  ) {
    try {
      const success = await categoryStore.createFromTemplate(templateId, customizations)

      if (!success) {
        throw new Error(categoryStore.error || 'Erreur lors de la création depuis le template')
      }

      const newCategory = categoryStore.categories[categoryStore.categories.length - 1]
      toast.success(`Catégorie "${newCategory.name}" créée depuis le template!`)

      return newCategory

    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création depuis le template')
      throw error
    }
  }

  /**
   * Supprimer une catégorie avec confirmation
   */
  async function deleteCategory(categoryId: string, categoryName?: string) {
    const confirmMessage = categoryName
      ? `Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`
      : 'Êtes-vous sûr de vouloir supprimer cette catégorie ?'

    if (!confirm(confirmMessage)) {
      return false
    }

    try {
      const success = await categoryStore.deleteCategory(categoryId)

      if (!success) {
        throw new Error(categoryStore.error || 'Erreur lors de la suppression')
      }

      toast.success('Catégorie supprimée avec succès!')
      return true

    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression')
      return false
    }
  }

  /**
   * Initialiser les catégories si nécessaire
   */
  async function ensureCategoriesLoaded() {
    if (categoryStore.categories.length === 0) {
      await categoryStore.fetchCategories()
    }
  }

  return {
    // État
    showCategoryModal,
    editingCategory,
    categoryDefaultType,

    // Actions
    openCategoryModal,
    openEditCategoryModal,
    closeCategoryModal,
    handleCategorySave,
    createFromTemplate,
    deleteCategory,
    ensureCategoriesLoaded,

    // Store state
    categories: categoryStore.categories,
    loading: categoryStore.loading,
    creating: categoryStore.creating,
    updating: categoryStore.updating,
    error: categoryStore.error,
    validationErrors: categoryStore.validationErrors
  }
}
