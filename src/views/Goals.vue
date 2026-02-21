<template>
  <div class="goals-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">🎯 {{ t('goals.title') }}</h1>
          <p class="page-subtitle">{{ t('goals.subtitle') }}</p>
        </div>
        <div class="header-actions">
          <button @click="handleRefresh" :disabled="loading" class="btn btn-secondary">
            <span>{{ loading ? '⏳' : '🔄' }}</span>
            {{ loading ? t('goals.refreshing') : t('goals.refresh') }}
          </button>
          <button @click="showTemplates = true" class="btn btn-outline">
            📋 {{ t('goals.templates') }}
          </button>
          <button @click="openCreateModal" class="btn btn-primary">➕ {{ t('goals.new') }}</button>
        </div>
      </div>
    </div>

    <!-- Erreur -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="clearErrors" class="error-close">✕</button>
    </div>

    <!-- Stats overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-blue">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats?.active || 0 }}</div>
          <div class="stat-label">{{ t('goals.activeGoals') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-green">💰</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(stats?.totalSaved || 0) }}</div>
          <div class="stat-label">{{ t('goals.totalSaved') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-purple">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats?.overallProgress || 0 }}%</div>
          <div class="stat-label">{{ t('goals.averageProgress') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-orange">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats?.completed || 0 }}</div>
          <div class="stat-label">{{ t('goals.goalsReached') }}</div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-bar">
      <div class="filter-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          @click="activeFilter = tab.value"
          class="filter-tab"
          :class="{ active_tab: activeFilter === tab.value }"
        >
          {{ tab.icon }} {{ tab.label }}
          <span v-if="tab.count > 0" class="filter-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Chargement -->
    <div v-if="loading && !goals.length" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- Liste vide -->
    <div v-else-if="!filteredGoals.length" class="empty-state">
      <div class="empty-icon">🎯</div>
      <h3 class="empty-title">
        {{ t('goals.noGoals') }} {{ activeFilter !== 'all' ? t('goals.noGoalsInCategory') : '' }}
      </h3>
      <p class="empty-text">{{ t('goals.createFirstGoal') }}</p>
      <button @click="openCreateModal" class="btn btn-primary">
        ➕ {{ t('goals.createGoal') }}
      </button>
    </div>

    <!-- Liste des objectifs -->
    <div v-else class="goals-grid">
      <div
        v-for="goal in filteredGoals"
        :key="goal.id"
        class="goal-card"
        :class="[`status-${goal.status}`]"
      >
        <!-- Header de la carte -->
        <div class="goal-header">
          <div class="goal-icon">{{ goal.icon || '🎯' }}</div>
          <div class="goal-info">
            <h3 class="goal-name">{{ goal.name }}</h3>
            <p class="goal-description">{{ goal.description || t('goals.noDescription') }}</p>
          </div>
          <div class="goal-menu">
            <button @click="toggleMenu(goal.id)" class="menu-btn">⋮</button>
            <div v-if="openMenuId === goal.id" class="menu-dropdown">
              <button @click="openEditModal(goal)">✏️ {{ t('goals.modify') }}</button>
              <button @click="handleAddContribution(goal)">💰 {{ t('goals.contribution') }}</button>
              <button v-if="goal.status === 'active'" @click="handlePause(goal)">
                ⏸️ {{ t('goals.pause') }}
              </button>
              <button v-if="goal.status === 'paused'" @click="handleResume(goal)">
                ▶️ {{ t('goals.resume') }}
              </button>
              <button @click="confirmDelete(goal)" class="danger">
                🗑️ {{ t('goals.delete') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Progression -->
        <div class="goal-progress">
          <div class="progress-header">
            <span class="progress-amount">{{ formatCurrency(goal.current_amount) }}</span>
            <span class="progress-target"
              >{{ t('goals.on') }} {{ formatCurrency(goal.target_amount) }}</span
            >
          </div>
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              :style="{ width: `${calculateProgress(goal)}%` }"
              :class="getProgressClass(goal)"
            ></div>
          </div>
          <div class="progress-footer">
            <span class="progress-percent">{{ calculateProgress(goal) }}%</span>
            <span class="progress-remaining">
              {{ t('goals.remaining', { amount: formatCurrency(calculateRemaining(goal)) }) }}
            </span>
          </div>
        </div>

        <!-- Infos supplémentaires -->
        <div class="goal-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span class="meta-text">{{ formatDate(goal.target_date) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">⏱️</span>
            <span class="meta-text" :class="getDaysClass(goal)">
              {{ formatDaysRemaining(goal) }}
            </span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">💵</span>
            <span class="meta-text"
              >{{ formatCurrency(calculateMonthlyTarget(goal)) }}{{ t('goals.perMonth') }}</span
            >
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="goal-actions">
          <button @click="handleAddContribution(goal)" class="btn btn-sm btn-primary">
            💰 {{ t('goals.add') }}
          </button>
          <button @click="openEditModal(goal)" class="btn btn-sm btn-secondary">
            ✏️ {{ t('goals.modify') }}
          </button>
        </div>

        <!-- Badge de statut -->
        <div class="status-badge" :class="`badge-${goal.status}`">
          {{ getStatusLabel(goal.status) }}
        </div>
      </div>
    </div>

    <!-- Modal Création/Édition -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <GoalForm
            :goal="editingGoal"
            :is-editing="!!editingGoal"
            @save="handleSave"
            @close="closeModal"
          />
        </div>
      </div>
    </Teleport>

    <!-- Modal Templates -->
    <Teleport to="body">
      <div v-if="showTemplates" class="modal-overlay" @click.self="showTemplates = false">
        <div class="templates-modal">
          <div class="templates-header">
            <h2>📋 {{ t('goals.chooseTemplate') }}</h2>
            <button @click="showTemplates = false" class="close-btn">✕</button>
          </div>
          <div class="templates-grid">
            <button
              v-for="template in goalTemplates"
              :key="template.id"
              @click="applyTemplate(template)"
              class="template-card"
            >
              <span class="template-icon">{{ template.icon }}</span>
              <span class="template-name">{{ template.name }}</span>
              <span class="template-desc">{{ template.description }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Contribution -->
    <Teleport to="body">
      <div
        v-if="showContributionModal"
        class="modal-overlay"
        @click.self="showContributionModal = false"
      >
        <div class="contribution-modal">
          <h3>💰 {{ t('goals.addContribution') }}</h3>
          <p>
            {{ t('goals.goal') }}: <strong>{{ contributionGoal?.name }}</strong>
          </p>
          <div class="form-group">
            <label>{{ t('goals.amount') }}</label>
            <input
              v-model.number="contributionAmount"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              placeholder="100.00"
            />
          </div>
          <div class="modal-actions">
            <button @click="showContributionModal = false" class="btn btn-secondary">
              {{ t('goals.cancel') }}
            </button>
            <button
              @click="submitContribution"
              :disabled="!contributionAmount"
              class="btn btn-primary"
            >
              ✅ {{ t('goals.add') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Suppression -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="delete-modal">
          <div class="delete-icon">🗑️</div>
          <h3>{{ t('goals.deleteTitle') }}</h3>
          <p>
            {{ t('goals.deleteText', { name: deletingGoal?.name }) }}
          </p>
          <div class="modal-actions">
            <button @click="showDeleteConfirm = false" class="btn btn-secondary">
              {{ t('goals.cancel') }}
            </button>
            <button @click="handleDelete" :disabled="deleting" class="btn btn-danger">
              {{ deleting ? t('goals.deleting') : t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router' // ✅ AJOUT
import { useGoalStore } from '@/stores/goalStore'
import GoalForm from '@/components/goals/GoalForm.vue'

const { t } = useI18n()
const route = useRoute() // ✅ AJOUT
const goalStore = useGoalStore()

// State
const showModal = ref(false)
const showTemplates = ref(false)
const showContributionModal = ref(false)
const showDeleteConfirm = ref(false)
const editingGoal = ref<any>(null)
const deletingGoal = ref<any>(null)
const contributionGoal = ref<any>(null)
const contributionAmount = ref<number>(0)
const activeFilter = ref('all')
const openMenuId = ref<number | null>(null)

// Computed from store
const goals = computed(() => goalStore.goals)
const loading = computed(() => goalStore.loading)
const deleting = computed(() => goalStore.deleting)
const error = computed(() => goalStore.error)
const stats = computed(() => goalStore.stats)

// Templates d'objectifs
const goalTemplates = computed(() => [
  { id: 'travel', icon: '✈️', name: t('goals.travel'), description: t('goals.travelDesc') },
  {
    id: 'emergency',
    icon: '🛡️',
    name: t('goals.emergency'),
    description: t('goals.emergencyDesc'),
  },
  { id: 'house', icon: '🏠', name: t('goals.house'), description: t('goals.houseDesc') },
  { id: 'car', icon: '🚗', name: t('goals.car'), description: t('goals.carDesc') },
  {
    id: 'education',
    icon: '🎓',
    name: t('goals.education'),
    description: t('goals.educationDesc'),
  },
  { id: 'wedding', icon: '💍', name: t('goals.wedding'), description: t('goals.weddingDesc') },
  {
    id: 'retirement',
    icon: '🏖️',
    name: t('goals.retirement'),
    description: t('goals.retirementDesc'),
  },
  { id: 'tech', icon: '💻', name: t('goals.tech'), description: t('goals.techDesc') },
])

// Filtres
const filterTabs = computed(() => [
  { value: 'all', label: t('goals.all'), icon: '📋', count: goals.value.length },
  { value: 'active', label: t('goals.active'), icon: '🎯', count: goalStore.activeGoals.length },
  {
    value: 'completed',
    label: t('goals.completed'),
    icon: '✅',
    count: goalStore.completedGoals.length,
  },
  { value: 'paused', label: t('goals.paused'), icon: '⏸️', count: goalStore.pausedGoals.length },
])

const filteredGoals = computed(() => {
  if (activeFilter.value === 'all') return goals.value
  return goals.value.filter((g) => g.status === activeFilter.value)
})

// ==========================================
// METHODS
// ==========================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0)
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function calculateProgress(goal: any): number {
  return goalStore.calculateProgress(goal)
}
function calculateRemaining(goal: any): number {
  return goalStore.calculateRemaining(goal)
}
function calculateMonthlyTarget(goal: any): number {
  return goalStore.calculateMonthlyTarget(goal)
}

function formatDaysRemaining(goal: any): string {
  const days = goalStore.calculateDaysRemaining(goal)
  if (days < 0) return t('goals.exceeded')
  if (days === 0) return t('goals.today')
  if (days === 1) return t('goals.tomorrow')
  if (days < 30) return t('goals.daysRemaining', { n: days })
  if (days < 365) return t('goals.monthsRemaining', { n: Math.floor(days / 30) })
  return t('goals.yearsRemaining', { n: Math.floor(days / 365) })
}

function getDaysClass(goal: any): string {
  const days = goalStore.calculateDaysRemaining(goal)
  if (days < 0) return 'text-danger'
  if (days < 30) return 'text-warning'
  return 'text-normal'
}

function getProgressClass(goal: any): string {
  const p = calculateProgress(goal)
  if (p >= 100) return 'progress-complete'
  if (p >= 75) return 'progress-good'
  if (p >= 50) return 'progress-medium'
  return 'progress-low'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: `🎯 ${t('goals.statusActive')}`,
    completed: `✅ ${t('goals.statusCompleted')}`,
    paused: `⏸️ ${t('goals.statusPaused')}`,
  }
  return labels[status] || status
}

function toggleMenu(id: number) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function closeMenuOnClickOutside(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.goal-menu')) {
    openMenuId.value = null
  }
}

// ==========================================
// ACTIONS
// ==========================================

async function handleRefresh() {
  try {
    await goalStore.fetchGoals()
  } catch (err) {
    console.error('Erreur refresh:', err)
  }
}

function openCreateModal() {
  editingGoal.value = null
  showModal.value = true
}

function openEditModal(goal: any) {
  editingGoal.value = { ...goal }
  openMenuId.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingGoal.value = null
}

function applyTemplate(template: any) {
  editingGoal.value = {
    name: template.name,
    icon: template.icon,
    description: template.description,
    target_amount: 0,
    current_amount: 0,
    target_date: '',
    status: 'active',
  }
  showTemplates.value = false
  showModal.value = true
}

async function handleSave(goalData: any) {
  try {
    let success = false

    if (editingGoal.value?.id) {
      success = await goalStore.updateGoal(editingGoal.value.id, goalData)
    } else {
      // ✅ Crée l'objectif en BDD via l'API
      success = await goalStore.createGoal(goalData)
    }

    if (success) {
      closeModal()
      await goalStore.fetchGoals() // ✅ Recharge depuis la BDD
    }
  } catch (err) {
    console.error('Erreur save:', err)
  }
}

function handleAddContribution(goal: any) {
  contributionGoal.value = goal
  contributionAmount.value = 0
  openMenuId.value = null
  showContributionModal.value = true
}

async function submitContribution() {
  if (!contributionGoal.value || !contributionAmount.value) return

  const success = await goalStore.addContribution(
    contributionGoal.value.id,
    Number(contributionAmount.value), // ✅ paramètre séparé + cast en number
    'Contribution manuelle'           // ✅ paramètre séparé
  )

  if (success) {
    showContributionModal.value = false
    contributionGoal.value = null
    contributionAmount.value = 0
  }
}

async function handlePause(goal: any) {
  openMenuId.value = null
  await goalStore.changeStatus(goal.id, 'paused')
}

async function handleResume(goal: any) {
  openMenuId.value = null
  await goalStore.changeStatus(goal.id, 'active')
}

function confirmDelete(goal: any) {
  deletingGoal.value = goal
  openMenuId.value = null
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingGoal.value) return
  const success = await goalStore.deleteGoal(deletingGoal.value.id)
  if (success) {
    showDeleteConfirm.value = false
    deletingGoal.value = null
  }
}

function clearErrors() {
  goalStore.clearErrors()
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  console.log('🎯 Goals.vue mounted')
  document.addEventListener('click', closeMenuOnClickOutside)

  // ✅ Charger les goals depuis la BDD
  await goalStore.fetchGoals()

  // ✅ Si le Coach IA a redirigé avec ?action=create, ouvrir le modal automatiquement
  if (route.query.action === 'create') {
    openCreateModal()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<style scoped>
.goals-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}
.header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (min-width: 768px) {
  .header-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
.page-subtitle {
  color: #5b6270;
  margin: 0.5rem 0 0 0;
}
.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* Buttons */
.btn {
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}
.btn-secondary:hover {
  background: #e5e7eb;
}
.btn-outline {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}
.btn-outline:hover {
  border-color: #8c939f;
}
.btn-danger {
  background: #dc2626;
  color: white;
}
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Error banner */
.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.error-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.stat-icon-blue {
  background: #dbeafe;
}
.stat-icon-green {
  background: #dcfce7;
}
.stat-icon-purple {
  background: #f3e8ff;
}
.stat-icon-orange {
  background: #ffedd5;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}
.stat-label {
  font-size: 0.875rem;
  color: #5b6270;
}

/* Filters */
.filters-bar {
  margin-bottom: 1.5rem;
}
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.filter-tab {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #5b6270;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}
.filter-tab.active_tab {
  background: #3b82f6;
  color: white;
}
.filter-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Loading & Empty */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}
.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}
.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem;
}
.empty-text {
  color: #5b6270;
  margin: 0 0 1.5rem;
}

/* Goals Grid */
.goals-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 768px) {
  .goals-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .goals-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Goal Card */
.goal-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s;
}
.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
.goal-card.status-paused {
  opacity: 0.7;
}
.goal-card.status-completed {
  border: 2px solid #22c55e;
}

.goal-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.goal-icon {
  width: 3rem;
  height: 3rem;
  background: #f3f4f6;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}
.goal-info {
  flex: 1;
  min-width: 0;
}
.goal-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goal-description {
  font-size: 0.875rem;
  color: #5b6270;
  margin: 0.25rem 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goal-menu {
  position: relative;
}
.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
}
.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 150px;
  overflow: hidden;
}
.menu-dropdown button {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
}
.menu-dropdown button:hover {
  background: #f3f4f6;
}
.menu-dropdown button.danger {
  color: #dc2626;
}

/* Progress */
.goal-progress {
  margin-bottom: 1rem;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.progress-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}
.progress-target {
  font-size: 0.875rem;
  color: #5b6270;
}
.progress-bar-container {
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.5s ease;
}
.progress-low {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.progress-medium {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}
.progress-good {
  background: linear-gradient(90deg, #10b981, #34d399);
}
.progress-complete {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.progress-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}
.progress-percent {
  font-weight: 600;
  color: #1f2937;
}
.progress-remaining {
  color: #5b6270;
}

/* Meta */
.goal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}
.meta-icon {
  opacity: 0.7;
}
.meta-text {
  color: #4b5563;
}
.text-danger {
  color: #dc2626 !important;
  font-weight: 600;
}
.text-warning {
  color: #f59e0b !important;
}

/* Actions */
.goal-actions {
  display: flex;
  gap: 0.5rem;
}
.goal-actions .btn {
  flex: 1;
  justify-content: center;
}

/* Status Badge */
.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.badge-active {
  background: #3b82f6;
  color: white;
}
.badge-completed {
  background: #22c55e;
  color: white;
}
.badge-paused {
  background: #f59e0b;
  color: white;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}
.modal-container {
  max-width: 48rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.templates-modal,
.contribution-modal,
.delete-modal {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 32rem;
  width: 100%;
}
.templates-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.templates-header h2 {
  margin: 0;
  font-size: 1.25rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.templates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.template-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.template-card:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}
.template-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.template-name {
  font-weight: 600;
  color: #1f2937;
}
.template-desc {
  font-size: 0.75rem;
  color: #5b6270;
  margin-top: 0.25rem;
}

.contribution-modal h3,
.delete-modal h3 {
  margin: 0 0 0.5rem;
}
.contribution-modal p,
.delete-modal p {
  color: #5b6270;
  margin: 0 0 1rem;
}
.delete-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}
.form-input::placeholder {
  color: #5b6270;
  opacity: 1;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
