<template>
  <div class="transaction-card" @click="handleClick">
    <!-- Header -->
    <div class="card-header">
      <div class="transaction-type">
        <div
          class="type-icon"
          :class="[transaction.type]"
        >
          {{ transaction.type === 'income' ? '💰' : '💸' }}
        </div>

        <div class="type-info">
          <div class="transaction-description">{{ transaction.description }}</div>
          <div class="transaction-meta">
            <span class="transaction-date">{{ formatDate(transaction.date) }}</span>
            <span v-if="transaction.time" class="transaction-time">{{ transaction.time }}</span>
            <span v-if="transaction.location" class="transaction-location">📍 {{ transaction.location }}</span>
          </div>
        </div>
      </div>

      <div class="transaction-amount" :class="[transaction.type]">
        {{ formatAmount(transaction.amount, transaction.type) }}
      </div>
    </div>

    <!-- Category -->
    <div v-if="transaction.category || showCategory" class="card-category">
      <div v-if="transaction.category" class="category-info">
        <span
          class="category-icon"
          :style="{ color: transaction.category.color }"
        >
          {{ transaction.category.icon }}
        </span>
        <span class="category-name">{{ transaction.category.name }}</span>

        <!-- Budget indicator -->
        <div v-if="transaction.category.monthly_budget" class="budget-indicator">
          <div class="budget-bar">
            <div
              class="budget-progress"
              :style="{
                width: `${Math.min(budgetUsage, 100)}%`,
                backgroundColor: budgetColor
              }"
            ></div>
          </div>
          <span class="budget-text">{{ budgetUsage }}% utilisé</span>
        </div>
      </div>
      <div v-else class="no-category">
        <span class="no-category-icon">❓</span>
        <span class="no-category-text">Non catégorisé</span>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="transaction.tags?.length" class="card-tags">
      <span
        v-for="tag in transaction.tags.slice(0, 3)"
        :key="tag"
        class="tag"
      >
        {{ tag }}
      </span>
      <span v-if="transaction.tags.length > 3" class="more-tags">
        +{{ transaction.tags.length - 3 }}
      </span>
    </div>

    <!-- Status indicators -->
    <div class="card-indicators">
      <!-- Recurring indicator -->
      <div v-if="transaction.is_recurring" class="indicator recurring" title="Transaction récurrente">
        🔄
      </div>

      <!-- Gaming XP indicator -->
      <div v-if="transaction.xp_earned" class="indicator xp" :title="`+${transaction.xp_earned} XP`">
        ⭐ {{ transaction.xp_earned }}
      </div>

      <!-- Recent indicator -->
      <div v-if="isRecentTransaction" class="indicator recent" title="Récent">
        🆕
      </div>
    </div>

    <!-- Actions -->
    <div class="card-actions" @click.stop>
      <button
        @click="$emit('edit', transaction)"
        class="action-btn edit"
        title="Modifier"
      >
        ✏️
      </button>

      <button
        @click="$emit('duplicate', transaction)"
        class="action-btn duplicate"
        title="Dupliquer"
      >
        📋
      </button>

      <button
        @click="showMoreActions = !showMoreActions"
        class="action-btn more"
        title="Plus d'actions"
      >
        ⋮
      </button>

      <!-- More actions menu -->
      <div v-if="showMoreActions" class="more-actions-menu" @click.stop>
        <button @click="$emit('view', transaction)" class="menu-item">
          👁️ Voir détails
        </button>
        <button @click="shareTransaction" class="menu-item">
          📤 Partager
        </button>
        <button @click="$emit('delete', transaction)" class="menu-item danger">
          🗑️ Supprimer
        </button>
      </div>
    </div>

    <!-- Notes preview -->
    <div v-if="transaction.notes && showNotes" class="card-notes">
      <div class="notes-icon">📝</div>
      <div class="notes-content">
        {{ transaction.notes.length > 100 ? transaction.notes.substring(0, 100) + '...' : transaction.notes }}
      </div>
    </div>

    <!-- Hover overlay for quick actions -->
    <div class="hover-overlay">
      <div class="quick-actions">
        <button @click.stop="$emit('edit', transaction)" class="quick-action primary">
          ✏️ Modifier
        </button>
        <button @click.stop="$emit('duplicate', transaction)" class="quick-action secondary">
          📋 Dupliquer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Transaction } from '@/types'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  transaction: Transaction
  showCategory?: boolean
  showNotes?: boolean
  compact?: boolean
  interactive?: boolean
}

interface Emits {
  edit: [transaction: Transaction]
  duplicate: [transaction: Transaction]
  delete: [transaction: Transaction]
  view: [transaction: Transaction]
  click: [transaction: Transaction]
}

const props = withDefaults(defineProps<Props>(), {
  showCategory: true,
  showNotes: true,
  compact: false,
  interactive: true
})

const emit = defineEmits<Emits>()

// ==========================================
// STATE
// ==========================================

const showMoreActions = ref(false)

// ==========================================
// COMPUTED
// ==========================================

const isRecentTransaction = computed(() => {
  const transactionDate = new Date(props.transaction.date)
  const now = new Date()
  const diffInHours = (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60)
  return diffInHours <= 24 // Moins de 24h
})

const budgetUsage = computed(() => {
  if (!props.transaction.category?.monthly_budget) return 0

  // Simulation - à remplacer par les vraies données
  const spent = Math.random() * props.transaction.category.monthly_budget
  return Math.round((spent / props.transaction.category.monthly_budget) * 100)
})

const budgetColor = computed(() => {
  const usage = budgetUsage.value
  if (usage >= 90) return '#EF4444' // Rouge
  if (usage >= 75) return '#F59E0B' // Orange
  if (usage >= 50) return '#EAB308' // Jaune
  return '#10B981' // Vert
})

// ==========================================
// METHODS
// ==========================================

/**
 * Formater une date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "Aujourd'hui"
  if (diffInDays === 1) return 'Hier'
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Formater un montant
 */
function formatAmount(amount: number, type: string): string {
  const sign = type === 'income' ? '+' : '-'
  return `${sign}${Math.abs(amount).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  })}`
}

/**
 * Gérer le clic sur la carte
 */
function handleClick(): void {
  if (props.interactive) {
    emit('click', props.transaction)
  }
}

/**
 * Partager la transaction
 */
function shareTransaction(): void {
  if (navigator.share) {
    navigator.share({
      title: 'Transaction',
      text: `${props.transaction.description} - ${formatAmount(props.transaction.amount, props.transaction.type)}`,
      url: window.location.href
    })
  } else {
    // Fallback - copier dans le presse-papier
    const text = `${props.transaction.description} - ${formatAmount(props.transaction.amount, props.transaction.type)}`
    navigator.clipboard.writeText(text)
  }
  showMoreActions.value = false
}

// Fermer le menu d'actions au clic ailleurs
document.addEventListener('click', () => {
  showMoreActions.value = false
})
</script>

<style scoped>
/* Base card - CORRIGÉ : Suppression de la classe 'group' */
.transaction-card {
  position: relative;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  transition: all 0.2s;
  cursor: pointer;
  overflow: hidden;
}

.transaction-card:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Actions apparaissent au hover directement */
.transaction-card:hover .card-actions {
  opacity: 1;
}

.transaction-card:hover .hover-overlay {
  opacity: 1;
}

/* Card Header */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.transaction-type {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.type-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
}

.type-icon.income {
  background-color: #dcfce7;
  color: #059669;
}

.type-icon.expense {
  background-color: #fef2f2;
  color: #dc2626;
}

.type-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.transaction-description {
  font-weight: 600;
  color: #111827;
  font-size: 1.125rem;
  line-height: 1.25;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  flex-wrap: wrap;
}

.transaction-date {
  font-weight: 500;
}

.transaction-time::before,
.transaction-location::before {
  content: '•';
  margin: 0 0.25rem;
}

.transaction-amount {
  text-align: right;
  font-size: 1.25rem;
  font-weight: 700;
}

.transaction-amount.income {
  color: #059669;
}

.transaction-amount.expense {
  color: #dc2626;
}

/* Category */
.card-category {
  margin-bottom: 1rem;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.category-icon {
  font-size: 1.25rem;
}

.category-name {
  font-weight: 500;
  color: #374151;
  flex: 1;
}

.budget-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.budget-bar {
  width: 4rem;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.budget-progress {
  height: 100%;
  transition: all 0.3s;
}

.budget-text {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

.no-category {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
  font-style: italic;
  font-size: 0.875rem;
}

/* Tags */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  background-color: #dbeafe;
  color: #1d4ed8;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.more-tags {
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  color: #6b7280;
  border-radius: 9999px;
  font-size: 0.75rem;
}

/* Indicators */
.card-indicators {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.indicator.recurring {
  background-color: #f3e8ff;
  color: #7c3aed;
}

.indicator.xp {
  background-color: #fef3c7;
  color: #d97706;
}

.indicator.recent {
  background-color: #dbeafe;
  color: #1d4ed8;
}

/* Actions - CORRIGÉ : Gestion hover directe */
.card-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: none;
  background: transparent;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #f3f4f6;
}

.action-btn.edit:hover {
  background-color: #dbeafe;
}

.action-btn.duplicate:hover {
  background-color: #dcfce7;
}

.action-btn.more:hover {
  background-color: #f3f4f6;
}

/* More actions menu */
.more-actions-menu {
  position: absolute;
  top: 2.5rem;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 9rem;
}

.menu-item {
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:first-child {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.menu-item:last-child {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.menu-item:hover {
  background-color: #f9fafb;
}

.menu-item.danger:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

/* Notes */
.card-notes {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fefce8;
  border: 1px solid #fde047;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.notes-icon {
  color: #ca8a04;
}

.notes-content {
  color: #374151;
  flex: 1;
}

/* Hover overlay */
.hover-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.05);
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-actions {
  display: flex;
  gap: 0.75rem;
}

.quick-action {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
}

.quick-action.primary {
  background-color: #2563eb;
  color: white;
}

.quick-action.primary:hover {
  background-color: #1d4ed8;
  transform: scale(1.05);
}

.quick-action.secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.quick-action.secondary:hover {
  background-color: #f9fafb;
  transform: scale(1.05);
}

/* Compact variant */
.transaction-card.compact {
  padding: 1rem;
}

.transaction-card.compact .card-header {
  margin-bottom: 0.5rem;
}

.transaction-card.compact .type-icon {
  width: 2rem;
  height: 2rem;
  font-size: 1rem;
}

.transaction-card.compact .transaction-description {
  font-size: 1rem;
}

.transaction-card.compact .transaction-amount {
  font-size: 1.125rem;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .transaction-card {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .transaction-amount {
    text-align: right;
  }

  .card-actions {
    opacity: 1;
  }

  .hover-overlay {
    display: none;
  }
}

/* Animation variants */
.transaction-card.slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Theme variants */
.transaction-card.highlighted {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.transaction-card.muted {
  opacity: 0.6;
}

/* Loading state */
.transaction-card.loading {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.transaction-card.loading * {
  background-color: #e5e7eb;
  color: transparent;
  border-radius: 0.25rem;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
