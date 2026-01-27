// src/components/forms/index.ts

import { ref, reactive } from 'vue'

// ==========================================
// EXPORTS DES FORMULAIRES
// ==========================================

export { default as TransactionEditModal } from './TransactionEditModal.vue'
export { default as GoalForm } from './GoalForm.vue'
export { default as CategoryForm } from './CategoryForm.vue'

// Re-export du modal existant si déjà présent
// export { default as PendingTransactionsModal } from './PendingTransactionsModal.vue'

// ==========================================
// COMPOSABLE POUR GÉRER L'ÉTAT DES MODALS
// ==========================================

interface FormState {
  showTransactionModal: boolean
  showGoalModal: boolean
  showCategoryModal: boolean
  showPendingTransactionsModal: boolean
  editingItem: any | null
  formMode: 'create' | 'edit'
}

export function useFormModals() {
  const formState = reactive<FormState>({
    showTransactionModal: false,
    showGoalModal: false,
    showCategoryModal: false,
    showPendingTransactionsModal: false,
    editingItem: null,
    formMode: 'create'
  })

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
