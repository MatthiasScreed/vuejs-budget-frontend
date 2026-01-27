// src/composables/sync/useAutoRefresh.ts
import { onMounted, onUnmounted } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useGoalStore } from '@/stores/goalStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { eventBus } from '@/services/eventBus'

/**
 * Composable pour auto-refresh après sync bancaire
 */
export function useAutoRefresh() {
  const transactionStore = useTransactionStore()
  const goalStore = useGoalStore()
  const achievementStore = useAchievementStore()

  // ✅ Écouter les événements de sync
  function handleBankSync() {
    console.log('🔄 Bank sync detected - Refreshing data...')

    // Recharger toutes les données
    Promise.allSettled([
      transactionStore.fetchTransactions(),
      transactionStore.fetchStats(),
      goalStore.fetchGoals(),
      achievementStore.checkAchievements()
    ])
  }

  function handleTransactionCreated() {
    console.log('➕ Transaction created - Refreshing...')

    Promise.allSettled([
      transactionStore.fetchTransactions(),
      transactionStore.fetchStats(),
      achievementStore.checkAchievements()
    ])
  }

  onMounted(() => {
    // S'abonner aux événements
    eventBus.on('bank:sync:complete', handleBankSync)
    eventBus.on('transaction:created', handleTransactionCreated)
    eventBus.on('transaction:updated', handleTransactionCreated)
  })

  onUnmounted(() => {
    // Se désabonner
    eventBus.off('bank:sync:complete', handleBankSync)
    eventBus.off('transaction:created', handleTransactionCreated)
    eventBus.off('transaction:updated', handleTransactionCreated)
  })

  return {
    refresh: handleBankSync
  }
}
