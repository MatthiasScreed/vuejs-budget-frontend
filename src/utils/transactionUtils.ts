import type { Transaction } from '@/types/base'

/**
 * Calculer le solde à partir d'une liste de transactions
 */
export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, transaction) => {
    if (transaction.status !== 'completed') return balance

    const amount = transaction.amount
    return transaction.type === 'income' ? balance + amount : balance - amount
  }, 0)
}

/**
 * Grouper les transactions par date
 */
export function groupTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  return transactions.reduce((groups, transaction) => {
    const date = transaction.date.split('T')[0] // Prendre seulement la date (YYYY-MM-DD)

    if (!groups[date]) {
      groups[date] = []
    }

    groups[date].push(transaction)

    return groups
  }, {} as Record<string, Transaction[]>)
}

/**
 * Filtrer les transactions par type
 */
export function filterTransactionsByType(
  transactions: Transaction[],
  type: 'income' | 'expense'
): Transaction[] {
  return transactions.filter(transaction => transaction.type === type)
}

/**
 * Calculer les statistiques d'un groupe de transactions
 */
export function calculateTransactionStats(transactions: Transaction[]) {
  const completedTransactions = transactions.filter(t => t.status === 'completed')

  const income = filterTransactionsByType(completedTransactions, 'income')
  const expenses = filterTransactionsByType(completedTransactions, 'expense')

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    incomeCount: income.length,
    expensesCount: expenses.length,
    totalCount: completedTransactions.length
  }
}

/**
 * Formater une date pour l'affichage
 */
export function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString)

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Obtenir la date d'aujourd'hui au format YYYY-MM-DD
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Obtenir le premier jour du mois au format YYYY-MM-DD
 */
export function getFirstDayOfMonth(): string {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  return firstDay.toISOString().split('T')[0]
}

/**
 * Obtenir le dernier jour du mois au format YYYY-MM-DD
 */
export function getLastDayOfMonth(): string {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return lastDay.toISOString().split('T')[0]
}
