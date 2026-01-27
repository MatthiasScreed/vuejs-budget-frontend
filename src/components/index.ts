// src/components/forms/index.ts
// ==========================================
// EXPORTS DES FORMULAIRES
// ==========================================

export { default as TransactionEditModal } from './TransactionEditModal.vue'
export { default as GoalForm } from './GoalForm.vue'
export { default as CategoryForm } from './CategoryForm.vue'

// Re-export du modal existant des transactions en attente
export { default as PendingTransactionsModal } from './PendingTransactionsModal.vue'

// ==========================================
// TYPES ET INTERFACES POUR LES FORMULAIRES
// ==========================================

export interface FormModalProps {
  visible: boolean
  mode?: 'create' | 'edit'
  loading?: boolean
  onClose: () => void
  onSuccess: (data: any) => void
}

export interface TransactionFormProps extends FormModalProps {
  transaction?: any
  onCreateCategory?: () => void
}

export interface GoalFormProps extends FormModalProps {
  goal?: any
}

export interface CategoryFormProps extends FormModalProps {
  category?: any
}

// ==========================================
// COMPOSABLES POUR FORMULAIRES
// ==========================================

export interface FormState {
  showTransactionModal: boolean
  showGoalModal: boolean
  showCategoryModal: boolean
  showPendingTransactionsModal: boolean
  editingItem: any | null
  formMode: 'create' | 'edit'
}

/**
 * Composable pour gérer l'état des modals de formulaires
 */
export function useFormModals() {
  const formState: FormState = {
    showTransactionModal: false,
    showGoalModal: false,
    showCategoryModal: false,
    showPendingTransactionsModal: false,
    editingItem: null,
    formMode: 'create'
  }

  // Transaction Modal
  const openTransactionModal = (transaction?: any) => {
    formState.editingItem = transaction || null
    formState.formMode = transaction ? 'edit' : 'create'
    formState.showTransactionModal = true
  }

  const closeTransactionModal = () => {
    formState.showTransactionModal = false
    formState.editingItem = null
  }

  // Goal Modal
  const openGoalModal = (goal?: any) => {
    formState.editingItem = goal || null
    formState.formMode = goal ? 'edit' : 'create'
    formState.showGoalModal = true
  }

  const closeGoalModal = () => {
    formState.showGoalModal = false
    formState.editingItem = null
  }

  // Category Modal
  const openCategoryModal = (category?: any) => {
    formState.editingItem = category || null
    formState.formMode = category ? 'edit' : 'create'
    formState.showCategoryModal = true
  }

  const closeCategoryModal = () => {
    formState.showCategoryModal = false
    formState.editingItem = null
  }

  // Pending Transactions Modal
  const openPendingTransactionsModal = () => {
    formState.showPendingTransactionsModal = true
  }

  const closePendingTransactionsModal = () => {
    formState.showPendingTransactionsModal = false
  }

  return {
    formState,
    // Transaction
    openTransactionModal,
    closeTransactionModal,
    // Goal
    openGoalModal,
    closeGoalModal,
    // Category
    openCategoryModal,
    closeCategoryModal,
    // Pending
    openPendingTransactionsModal,
    closePendingTransactionsModal
  }
}
