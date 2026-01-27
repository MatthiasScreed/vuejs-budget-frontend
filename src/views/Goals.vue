<template>
  <div class="goals-page">
    <!-- Tutorial Modal -->
    <TutorialModal
      v-model="showTutorial"
      :steps="tutorialSteps"
      storage-key="goals_tutorial_seen"
      @finish="handleTutorialFinish"
      @skip="handleTutorialSkip"
    />

    <!-- Error Boundary -->
    <ErrorBoundary :error="error" @retry="handleRefresh" @dismiss="error = null">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">🎯 Objectifs</h1>
            <p class="page-subtitle">Gérez vos objectifs d'épargne</p>
          </div>

          <div class="flex gap-2">
            <LoadingButton variant="neutral" icon="❓" @click="showTutorial = true">
              Aide
            </LoadingButton>
            <LoadingButton variant="primary" icon="➕" @click="handleNewGoal">
              Nouvel objectif
            </LoadingButton>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-active">
          <div class="stat-header">
            <span class="stat-emoji">🎯</span>
          </div>
          <div class="stat-amount">{{ stats.activeGoals }}</div>
          <div class="stat-label">Objectifs actifs</div>
        </div>

        <div class="stat-card stat-total">
          <div class="stat-header">
            <span class="stat-emoji">💰</span>
          </div>
          <div class="stat-amount">{{ formatDisplayCurrency(stats.totalAmount) }}</div>
          <div class="stat-label">Montant total</div>
        </div>

        <div class="stat-card stat-progress">
          <div class="stat-header">
            <span class="stat-emoji">📊</span>
          </div>
          <div class="stat-amount">{{ stats.averageProgress }}%</div>
          <div class="stat-label">Progression moyenne</div>
        </div>

        <div class="stat-card stat-deadline">
          <div class="stat-header">
            <span class="stat-emoji">📅</span>
          </div>
          <div class="stat-amount">{{ stats.nextDeadlineDays }}</div>
          <div class="stat-label">Jours jusqu'au prochain</div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <LoadingButton variant="primary" icon="➕" :loading="false" @click="handleNewGoal">
          Nouvel objectif
        </LoadingButton>

        <LoadingButton variant="neutral" icon="🎯" :loading="false" @click="handleFilterActive">
          Actifs {{ activeGoals.length > 0 ? `(${activeGoals.length})` : '' }}
        </LoadingButton>

        <LoadingButton variant="success" icon="🏆" :loading="false" @click="handleFilterCompleted">
          Complétés {{ completedGoals.length > 0 ? `(${completedGoals.length})` : '' }}
        </LoadingButton>

        <LoadingButton
          variant="neutral"
          icon="🔄"
          :loading="crud.loading.value"
          @click="handleRefresh"
        >
          Actualiser
        </LoadingButton>
      </div>

      <!-- Loading state -->
      <div v-if="loading && goals.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">Chargement des objectifs...</p>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="isEmpty && !error"
        icon="🎯"
        :title="hasFilters ? 'Aucun objectif correspondant' : 'Aucun objectif'"
        :description="
          hasFilters
            ? 'Aucun objectif ne correspond à ces filtres'
            : 'Créez votre premier objectif d\'épargne'
        "
        show-action
        action-text="🎯 Créer mon premier objectif"
        action-icon="➕"
        @action="handleNewGoal"
      >
        <template #secondary>
          <button
            v-if="hasFilters"
            @click="filterStatus = 'all'"
            class="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Réinitialiser les filtres
          </button>
        </template>
      </EmptyState>

      <!-- Goals Grid -->
      <div v-else class="goals-grid">
        <div
          v-for="goal in displayedGoals"
          :key="goal.id"
          class="goal-card"
          :class="getGoalCardClass(goal)"
        >
          <!-- Mobile layout -->
          <div class="goal-mobile">
            <div class="mobile-header">
              <div class="mobile-title">
                <span class="goal-icon">{{ goal.icon || '🎯' }}</span>
                <h3 class="goal-name">{{ goal.name }}</h3>
              </div>
              <div class="mobile-status">
                <span class="status-badge" :class="getStatusClass(goal.status)">
                  {{ getStatusLabel(goal.status) }}
                </span>
                <button @click="toggleMenu(goal.id)" class="menu-btn">⚙️</button>
              </div>
            </div>

            <!-- Menu dropdown -->
            <div v-if="openMenuId === goal.id" class="dropdown-menu">
              <button @click="handleEdit(goal)" class="menu-item">✏️ Modifier</button>
              <button @click="handleAddContribution(goal)" class="menu-item">💰 Contribuer</button>
              <button @click="handleToggleStatus(goal)" class="menu-item">
                {{ goal.status === 'active' ? '⏸️ Suspendre' : '▶️ Reprendre' }}
              </button>
              <button @click="handleDelete(goal)" class="menu-item menu-item-danger">
                🗑️ Supprimer
              </button>
            </div>

            <p v-if="goal.description" class="mobile-desc">{{ goal.description }}</p>

            <!-- Progress -->
            <div class="mobile-progress">
              <div class="progress-amounts">
                <span class="current-amount">{{ formatDisplayCurrency(goal.current_amount) }}</span>
                <span class="target-amount">/ {{ formatDisplayCurrency(goal.target_amount) }}</span>
              </div>
              <div class="progress-bar-wrapper">
                <div class="progress-bar-track">
                  <div
                    class="progress-bar-fill"
                    :class="getProgressBarClass(goal)"
                    :style="{ width: `${Math.min(getProgressPercentage(goal), 100)}%` }"
                  ></div>
                </div>
                <span class="progress-percentage">{{ getProgressPercentage(goal) }}%</span>
              </div>
            </div>

            <!-- Details -->
            <div class="mobile-details">
              <div class="detail-row">
                <span class="detail-label">📅 Échéance:</span>
                <span class="detail-value">{{ formatDisplayDate(goal.target_date) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">💰 Restant:</span>
                <span class="detail-value">{{
                  formatDisplayCurrency(goal.target_amount - goal.current_amount)
                }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📊 Par mois:</span>
                <span class="detail-value">{{
                  formatDisplayCurrency(getMonthlyRequired(goal))
                }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mobile-actions">
              <LoadingButton
                variant="primary"
                size="sm"
                icon="💰"
                @click="handleAddContribution(goal)"
              >
                Contribuer
              </LoadingButton>
              <LoadingButton variant="secondary" size="sm" @click="handleEdit(goal)">
                Modifier
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>

    <!-- Modal Goal Form -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="handleCloseModal">
        <div class="modal-content modal-form">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Modifier' : 'Nouvel' }} objectif</h2>
            <button @click="handleCloseModal" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nom de l'objectif</label>
              <input
                v-model="goalForm.name"
                type="text"
                class="form-input"
                placeholder="ex: Voyage au Japon"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="goalForm.description"
                class="form-input"
                rows="3"
                placeholder="Décrivez votre objectif..."
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Montant cible (€)</label>
                <input
                  v-model.number="goalForm.target_amount"
                  type="number"
                  min="0"
                  step="10"
                  class="form-input"
                  placeholder="0"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Montant actuel (€)</label>
                <input
                  v-model.number="goalForm.current_amount"
                  type="number"
                  min="0"
                  step="10"
                  class="form-input"
                  placeholder="0"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Date cible</label>
              <input v-model="goalForm.target_date" type="date" class="form-input" :min="today" />
            </div>

            <div class="form-group">
              <label class="form-label">Icône (optionnelle)</label>
              <div class="icon-grid">
                <button
                  v-for="icon in availableIcons"
                  :key="icon"
                  @click="goalForm.icon = icon"
                  type="button"
                  class="icon-btn"
                  :class="{ 'icon-btn-active': goalForm.icon === icon }"
                >
                  {{ icon }}
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <LoadingButton variant="secondary" @click="handleCloseModal"> Annuler </LoadingButton>
            <LoadingButton
              variant="primary"
              :disabled="!isGoalFormValid"
              :loading="crud.loading.value"
              @click="handleSave"
            >
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </LoadingButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Contribution -->
    <Teleport to="body">
      <div v-if="showContributionModal" class="modal-overlay" @click.self="handleCloseContribution">
        <div class="modal-content modal-contribution">
          <div class="modal-header">
            <h2>💰 Ajouter une contribution</h2>
            <button @click="handleCloseContribution" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <p class="contribution-goal">
              Objectif: <strong>{{ contributingGoal?.name }}</strong>
            </p>
            <div class="form-group">
              <label class="form-label">Montant (€)</label>
              <input
                v-model.number="contributionForm.amount"
                type="number"
                min="0.01"
                step="0.01"
                class="form-input"
                placeholder="100.00"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Description (optionnelle)</label>
              <input
                v-model="contributionForm.description"
                type="text"
                class="form-input"
                placeholder="Contribution mensuelle"
              />
            </div>
          </div>
          <div class="modal-footer">
            <LoadingButton variant="secondary" @click="handleCloseContribution">
              Annuler
            </LoadingButton>
            <LoadingButton
              variant="primary"
              :disabled="!contributionForm.amount || contributionForm.amount <= 0"
              :loading="crud.loading.value"
              @click="handleConfirmContribution"
            >
              Ajouter
            </LoadingButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Delete -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="handleCancelDelete">
        <div class="modal-delete">
          <div class="modal-delete-header">
            <div class="delete-icon-wrapper">
              <span class="delete-icon">🗑️</span>
            </div>
            <div>
              <h3 class="delete-title">Confirmer la suppression</h3>
              <p class="delete-subtitle">Cette action est irréversible</p>
            </div>
          </div>

          <div class="modal-delete-content">
            <p class="delete-text">
              Supprimer l'objectif <strong>"{{ deletingItem?.name }}"</strong> ?
            </p>
            <div class="delete-info">
              Montant cible: {{ formatDisplayCurrency(deletingItem?.target_amount || 0) }}
            </div>
          </div>

          <div class="modal-delete-actions">
            <LoadingButton variant="secondary" @click="handleCancelDelete"> Annuler </LoadingButton>
            <LoadingButton
              variant="danger"
              :loading="crud.loading.value"
              @click="handleConfirmDelete"
            >
              Supprimer
            </LoadingButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGoalStore } from '@/stores/goalStore'
import { useCrudOperation } from '@/composables/useAsyncOperation'
import { useGoalsProjectsTutorial } from '@/composables/useTutorial'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue'
import TutorialModal from '@/components/tutorial/TutorialModal.vue'

// ==========================================
// TYPES
// ==========================================

interface Goal {
  id: number
  name: string
  description?: string
  target_amount: number
  current_amount: number
  target_date: string
  status: 'active' | 'completed' | 'paused'
  icon?: string
}

interface GoalForm {
  name: string
  description: string
  target_amount: number
  current_amount: number
  target_date: string
  icon: string
}

interface ContributionForm {
  amount: number
  description: string
}

// ==========================================
// STORES & COMPOSABLES
// ==========================================

const goalStore = useGoalStore()
const crud = useCrudOperation()
const { steps: tutorialSteps } = useGoalsProjectsTutorial()

// ==========================================
// STATE
// ==========================================

const loading = computed(() => goalStore.loading)
const error = ref<Error | null>(null)

// Tutorial
const showTutorial = ref(false)

const goals = computed(() => goalStore.goals)
const activeGoals = computed(() => goalStore.activeGoals)
const completedGoals = computed(() => goalStore.completedGoals)
const pausedGoals = computed(() => goalStore.pausedGoals)

const showModal = ref(false)
const showContributionModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const editingItem = ref<Goal | null>(null)
const deletingItem = ref<Goal | null>(null)
const contributingGoal = ref<Goal | null>(null)
const openMenuId = ref<number | null>(null)
const filterStatus = ref<'all' | 'active' | 'completed'>('all')

const goalForm = ref<GoalForm>({
  name: '',
  description: '',
  target_amount: 0,
  current_amount: 0,
  target_date: '',
  icon: '🎯',
})

const contributionForm = ref<ContributionForm>({
  amount: 0,
  description: '',
})

const availableIcons = [
  '🎯',
  '💰',
  '🏠',
  '🚗',
  '✈️',
  '🎓',
  '💍',
  '🎮',
  '📱',
  '💻',
  '🖼️',
  '🎨',
  '🎸',
  '📚',
  '🎁',
  '💎',
  '🏆',
  '⭐',
  '🌟',
  '🎪',
]

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// ==========================================
// COMPUTED
// ==========================================

const displayedGoals = computed(() => {
  let filtered = goals.value || []

  if (filterStatus.value === 'active') {
    filtered = activeGoals.value || []
  } else if (filterStatus.value === 'completed') {
    filtered = completedGoals.value || []
  }

  return filtered
})

const isEmpty = computed(() => displayedGoals.value.length === 0)
const hasFilters = computed(() => filterStatus.value !== 'all')

const stats = computed(() => {
  const allGoals = goals.value || []
  const active = activeGoals.value || []

  const totalAmount = allGoals.reduce((sum, g) => {
    return sum + (Number(g.target_amount) || 0)
  }, 0)

  const averageProgress =
    allGoals.length > 0
      ? Math.round(
          allGoals.reduce((sum, g) => {
            const progress = (Number(g.current_amount) || 0) / (Number(g.target_amount) || 1)
            return sum + progress * 100
          }, 0) / allGoals.length,
        )
      : 0

  const nextDeadline = active
    .filter((g) => g.target_date)
    .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())[0]

  const nextDeadlineDays = nextDeadline
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextDeadline.target_date).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0

  return {
    activeGoals: active.length,
    totalAmount,
    averageProgress,
    nextDeadlineDays,
  }
})

const isGoalFormValid = computed(() => {
  return !!(goalForm.value.name && goalForm.value.target_amount > 0 && goalForm.value.target_date)
})

// ==========================================
// METHODS - FORMATTING
// ==========================================

function formatDisplayCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

function formatDisplayDate(dateString: string): string {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

function getProgressPercentage(goal: Goal): number {
  if (!goal.target_amount) return 0
  const current = Number(goal.current_amount) || 0
  const target = Number(goal.target_amount) || 1
  return Math.round((current / target) * 100)
}

function getMonthlyRequired(goal: Goal): number {
  const remaining = (Number(goal.target_amount) || 0) - (Number(goal.current_amount) || 0)

  if (remaining <= 0) return 0
  if (!goal.target_date) return 0

  const today = new Date()
  const target = new Date(goal.target_date)
  const monthsRemaining = Math.max(
    1,
    Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)),
  )

  return remaining / monthsRemaining
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Actif',
    completed: 'Complété',
    paused: 'En pause',
  }
  return labels[status] || status
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    active: 'status-active',
    completed: 'status-completed',
    paused: 'status-paused',
  }
  return classes[status] || ''
}

function getGoalCardClass(goal: Goal): string {
  if (goal.status === 'completed') return 'card-completed'
  if (goal.status === 'paused') return 'card-paused'
  return 'card-active'
}

function getProgressBarClass(goal: Goal): string {
  const percentage = getProgressPercentage(goal)
  if (percentage >= 100) return 'bar-completed'
  if (percentage >= 75) return 'bar-high'
  if (percentage >= 50) return 'bar-medium'
  return 'bar-low'
}

// ==========================================
// METHODS - ACTIONS
// ==========================================

function handleNewGoal() {
  isEditing.value = false
  editingItem.value = null
  goalForm.value = {
    name: '',
    description: '',
    target_amount: 0,
    current_amount: 0,
    target_date: '',
    icon: '🎯',
  }
  showModal.value = true
}

function handleEdit(goal: Goal) {
  isEditing.value = true
  editingItem.value = goal
  goalForm.value = {
    name: goal.name,
    description: goal.description || '',
    target_amount: goal.target_amount,
    current_amount: goal.current_amount,
    target_date: goal.target_date,
    icon: goal.icon || '🎯',
  }
  showModal.value = true
}

function handleAddContribution(goal: Goal) {
  contributingGoal.value = goal
  contributionForm.value = {
    amount: 0,
    description: 'Contribution manuelle',
  }
  showContributionModal.value = true
}

async function handleConfirmContribution() {
  if (!contributingGoal.value || !contributionForm.value.amount) return

  const result = await crud.execute(
    () => goalStore.addContribution(contributingGoal.value!.id, contributionForm.value),
    {
      loadingMessage: '💰 Ajout de la contribution...',
      successMessage: (result: any) =>
        `💰 Contribution de ${formatDisplayCurrency(contributionForm.value.amount)} ajoutée !`,
      errorMessage: "Erreur lors de l'ajout de la contribution",
      enableRetry: true,
    },
  )

  if (result) {
    handleCloseContribution()
  }
}

function handleCloseContribution() {
  showContributionModal.value = false
  contributingGoal.value = null
  contributionForm.value = {
    amount: 0,
    description: '',
  }
}

async function handleToggleStatus(goal: Goal) {
  const newStatus = goal.status === 'active' ? 'paused' : 'active'

  await crud.update(() => goalStore.updateGoal(goal.id, { status: newStatus }), "l'objectif")

  openMenuId.value = null
}

function handleDelete(goal: Goal) {
  deletingItem.value = goal
  showDeleteConfirm.value = true
  openMenuId.value = null
}

async function handleConfirmDelete() {
  if (!deletingItem.value) return

  const result = await crud.remove(
    () => goalStore.deleteGoal(deletingItem.value!.id),
    "l'objectif",
    deletingItem.value.name,
  )

  if (result) {
    handleCancelDelete()
  }
}

function handleCancelDelete() {
  showDeleteConfirm.value = false
  deletingItem.value = null
}

function handleCloseModal() {
  showModal.value = false
  editingItem.value = null
  isEditing.value = false
}

async function handleSave() {
  if (!isGoalFormValid.value) return

  let result

  if (isEditing.value && editingItem.value) {
    result = await crud.update(
      () => goalStore.updateGoal(editingItem.value!.id, goalForm.value),
      "l'objectif",
    )
  } else {
    result = await crud.create(() => goalStore.createGoal(goalForm.value), "l'objectif")
  }

  if (result) {
    handleCloseModal()
  }
}

function handleFilterActive() {
  filterStatus.value = filterStatus.value === 'active' ? 'all' : 'active'
}

function handleFilterCompleted() {
  filterStatus.value = filterStatus.value === 'completed' ? 'all' : 'completed'
}

async function handleRefresh() {
  const result = await crud.fetch(() => goalStore.fetchGoals(), 'les objectifs')

  if (!result) {
    error.value = new Error('Impossible de charger les objectifs')
  }
}

function toggleMenu(goalId: number) {
  openMenuId.value = openMenuId.value === goalId ? null : goalId
}

// ==========================================
// TUTORIAL HANDLERS
// ==========================================

function handleTutorialFinish() {
  console.log('✅ Tutorial terminé')
}

function handleTutorialSkip() {
  console.log('⏭️ Tutorial ignoré')
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  console.log('🚀 [MOUNT] Mounting Goals.vue')

  // Afficher le tutoriel si première visite
  const tutorialSeen = localStorage.getItem('goals_tutorial_seen')
  if (!tutorialSeen) {
    setTimeout(() => {
      showTutorial.value = true
    }, 1000)
  }

  try {
    loading.value = true
    await goalStore.fetchGoals()
    console.log(`✅ [MOUNT] ${goals.value?.length || 0} objectifs chargés`)
  } catch (err: any) {
    console.error('❌ [MOUNT] Erreur montage:', err)
    error.value = err
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ========================================== */
/* BASE */
/* ========================================== */

* {
  box-sizing: border-box;
}

:root {
  --color-primary: #8b5cf6;
  --color-success: #059669;
  --color-danger: #dc2626;
  --color-warning: #f59e0b;
}

/* ========================================== */
/* DEBUG PANEL */
/* ========================================== */

.debug-panel {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 2px solid #10b981;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Monaco', 'Courier New', monospace;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.debug-panel h3 {
  color: #fbbf24;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.debug-content {
  display: grid;
  gap: 1rem;
}

.debug-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
}

.debug-section strong {
  display: block;
  color: #60a5fa;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.debug-section pre {
  color: #10b981;
  margin: 0;
  font-size: 0.75rem;
  white-space: pre-wrap;
  overflow-x: auto;
}

/* ========================================== */
/* LAYOUT */
/* ========================================== */

.goals-page {
  max-width: 1152px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
  overflow-x: hidden;
}

/* ========================================== */
/* HEADER */
/* ========================================== */

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .header-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.header-text {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 0.9375rem;
}

/* ========================================== */
/* SUCCESS BANNER */
/* ========================================== */

.success-banner {
  background: linear-gradient(to right, #d1fae5, #a7f3d0);
  border-left: 4px solid #059669;
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.success-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.success-icon {
  font-size: 1.5rem;
}

.success-text {
  color: #065f46;
  font-weight: 500;
}

/* ========================================== */
/* BUTTONS */
/* ========================================== */

.btn {
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  font-size: 0.9375rem;
}

.btn-primary {
  background: linear-gradient(to right, #8b5cf6, #ec4899);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========================================== */
/* STATS GRID */
/* ========================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
}

.stat-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  text-align: center;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.stat-header {
  margin-bottom: 0.5rem;
}

.stat-emoji {
  font-size: 2rem;
}

.stat-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 640px) {
  .stat-card {
    padding: 1rem;
  }

  .stat-amount {
    font-size: 1.25rem;
  }

  .stat-emoji {
    font-size: 1.5rem;
  }
}

/* ========================================== */
/* QUICK ACTIONS */
/* ========================================== */

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .quick-actions {
    grid-template-columns: repeat(4, 1fr);
  }
}

.action-btn {
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  font-size: 0.875rem;
}

.action-primary {
  background: linear-gradient(to right, #8b5cf6, #ec4899);
  color: white;
}

.action-primary:hover {
  transform: translateY(-1px);
}

.action-info {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.action-info:hover {
  background-color: #bfdbfe;
}

.action-success {
  background-color: #d1fae5;
  color: #065f46;
}

.action-success:hover {
  background-color: #a7f3d0;
}

.action-neutral {
  background-color: #f3f4f6;
  color: #374151;
}

.action-neutral:hover {
  background-color: #e5e7eb;
}

/* ========================================== */
/* LOADING */
/* ========================================== */

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 2px solid #e5e7eb;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
}

/* ========================================== */
/* EMPTY STATE */
/* ========================================== */

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

/* ========================================== */
/* GOALS GRID */
/* ========================================== */

.goals-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
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

.goal-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  position: relative;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-completed {
  border-left: 4px solid #059669;
  background: linear-gradient(to bottom right, #ffffff, #f0fdf4);
}

.card-paused {
  border-left: 4px solid #f59e0b;
  opacity: 0.8;
}

.card-active {
  border-left: 4px solid #8b5cf6;
}

/* ========================================== */
/* GOAL MOBILE */
/* ========================================== */

.goal-mobile {
  display: block;
}

@media (min-width: 768px) {
  .goal-mobile {
    display: none;
  }
}

.mobile-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.75rem;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.goal-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.goal-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}

.status-active {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-paused {
  background-color: #fef3c7;
  color: #92400e;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  font-size: 1.125rem;
  min-height: 44px;
  min-width: 44px;
}

.menu-btn:hover {
  background-color: #f3f4f6;
}

.dropdown-menu {
  position: absolute;
  right: 1rem;
  top: 4rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 200px;
}

.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f9fafb;
}

.menu-item-danger {
  color: #dc2626;
}

.menu-item-danger:hover {
  background-color: #fef2f2;
}

.mobile-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.mobile-progress {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.progress-amounts {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.current-amount {
  font-weight: 600;
  color: #111827;
}

.target-amount {
  color: #6b7280;
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar-track {
  flex: 1;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: all 0.3s;
}

.bar-completed {
  background-color: #059669;
}

.bar-high {
  background-color: #3b82f6;
}

.bar-medium {
  background-color: #8b5cf6;
}

.bar-low {
  background-color: #f59e0b;
}

.progress-percentage {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  min-width: 2.5rem;
  text-align: right;
}

.mobile-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-label {
  color: #6b7280;
}

.detail-value {
  font-weight: 500;
  color: #111827;
}

.mobile-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.action-link {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 0;
  min-height: 44px;
  font-size: 0.875rem;
}

.link-primary {
  color: #3b82f6;
}

.link-primary:hover {
  color: #2563eb;
}

.link-edit {
  color: #6b7280;
}

.link-edit:hover {
  color: #374151;
}

/* ========================================== */
/* GOAL DESKTOP */
/* ========================================== */

.goal-desktop {
  display: none;
}

@media (min-width: 768px) {
  .goal-desktop {
    display: block;
  }
}

.desktop-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.desktop-title {
  display: flex;
  align-items: start;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.goal-icon-desktop {
  font-size: 2rem;
  flex-shrink: 0;
}

.goal-name-desktop {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.goal-desc-desktop {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.desktop-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-btn-desktop {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  font-size: 1.125rem;
  min-height: 44px;
  min-width: 44px;
}

.menu-btn-desktop:hover {
  background-color: #f3f4f6;
}

.dropdown-menu-desktop {
  position: absolute;
  right: 1rem;
  top: 4rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 200px;
}

.desktop-progress {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-percent {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.desktop-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.detail-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.desktop-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  flex: 1;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-contribute {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.btn-contribute:hover {
  background-color: #bfdbfe;
}

.btn-edit {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-edit:hover {
  background-color: #e5e7eb;
}

/* ========================================== */
/* CTA SECTION */
/* ========================================== */

.cta-section {
  background: linear-gradient(to right, #eff6ff, #f3e8ff);
  border-radius: 0.75rem;
  padding: 3rem 2rem;
  text-align: center;
  margin-top: 3rem;
}

.cta-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.cta-text {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.cta-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* ========================================== */
/* MODALS */
/* ========================================== */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 32rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  min-height: 44px;
  min-width: 44px;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: all 0.2s;
  font-size: 1rem;
}

.form-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

.icon-btn {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.5rem;
}

.icon-btn:hover {
  background-color: #f9fafb;
}

.icon-btn-active {
  border-color: #8b5cf6;
  background-color: #f5f3ff;
}

.contribution-goal {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.modal-delete {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
}

.modal-delete-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.delete-icon-wrapper {
  width: 3rem;
  height: 3rem;
  background-color: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-icon {
  color: #dc2626;
  font-size: 1.5rem;
}

.delete-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.delete-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

.modal-delete-content {
  margin-bottom: 1.5rem;
}

.delete-text {
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.delete-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.modal-delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* ========================================== */
/* MOBILE RESPONSIVE */
/* ========================================== */

@media (max-width: 640px) {
  .goals-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .goal-card {
    padding: 1rem;
  }
}

/* ========================================== */
/* SAFE AREAS (iPhone) */
/* ========================================== */

@supports (padding: env(safe-area-inset-bottom)) {
  .goals-page {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}
</style>
