// src/services/index.ts

// ==========================================
// SERVICES EXPORTS
// ==========================================

// Services principaux
export { categoryService } from './categoryService'
export { bankService } from './bankService'

// Types exports pour faciliter l'utilisation
export type {
  // Category types
  Category,
  CreateCategoryData,
  UpdateCategoryData
} from '@/types/entities/category'

export type {
  // Bank types
  BankConnection,
  BankAccount,
  BankTransaction,
  InitiateBankConnectionData,
  ConvertTransactionData,
  BankingStats,
  SyncResult,
  TransactionFilter
} from './bankService'

// ==========================================
// SERVICES UTILITAIRES (à ajouter plus tard)
// ==========================================

// Futurs services à implémenter :
// export { transactionService } from './transactionService'
// export { goalService } from './goalService'
// export { projectService } from './projectService'
// export { gamingService } from './gamingService'
// export { analyticsService } from './analyticsService'
// export { authService } from './authService'
