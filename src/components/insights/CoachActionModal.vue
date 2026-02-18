<!-- src/components/insights/CoachActionModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-backdrop" @click.self="close">
        <div class="modal-box">
          <!-- HEADER -->
          <div class="modal-header">
            <div class="header-icon">
              <span class="text-2xl">{{ insight?.icon || '💡' }}</span>
            </div>
            <div class="header-text">
              <h3 class="modal-title">Coach IA — Action recommandée</h3>
              <p class="modal-subtitle">{{ insight?.title }}</p>
            </div>
            <button @click="close" class="close-btn">✕</button>
          </div>

          <!-- DESCRIPTION -->
          <div class="insight-desc">
            <p>{{ insight?.description }}</p>
          </div>

          <!-- ==========================================
               FORMULAIRE — create_goal
               ========================================== -->
          <div v-if="action?.type === 'create_goal'" class="action-form">
            <div class="form-title"><span class="form-title-icon">🎯</span>Objectif à créer</div>
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Nom de l'objectif</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-input"
                  placeholder="Ex: Fonds d'urgence"
                />
              </div>

              <div class="form-group">
                <label>Montant cible (€)</label>
                <input
                  v-model.number="form.target_amount"
                  type="number"
                  min="1"
                  class="form-input"
                />
                <span class="form-hint">Calculé sur 3 mois de revenus</span>
              </div>

              <div class="form-group">
                <label>Date cible</label>
                <input v-model="form.target_date" type="date" :min="tomorrow" class="form-input" />
              </div>

              <div class="form-group">
                <label>Priorité</label>
                <select v-model="form.priority" class="form-select">
                  <option value="low">🟢 Faible</option>
                  <option value="medium">🟡 Moyenne</option>
                  <option value="high">🔴 Haute</option>
                </select>
              </div>

              <div class="form-group">
                <label>Icône</label>
                <select v-model="form.icon" class="form-select">
                  <option value="💰">💰 Épargne</option>
                  <option value="🛡️">🛡️ Urgence</option>
                  <option value="🎯">🎯 Objectif</option>
                  <option value="🏠">🏠 Immobilier</option>
                  <option value="✈️">✈️ Voyage</option>
                  <option value="🚗">🚗 Voiture</option>
                  <option value="📈">📈 Investissement</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Description</label>
                <textarea
                  v-model="form.description"
                  rows="2"
                  class="form-input"
                  placeholder="Optionnel…"
                ></textarea>
              </div>
            </div>

            <div class="action-summary">
              <span class="summary-icon">📋</span>
              <span>
                Création de <strong>{{ form.name || '…' }}</strong> — objectif de
                <strong>{{ formatCurrency(form.target_amount) }}</strong> pour le
                <strong>{{ formatDate(form.target_date) }}</strong>
              </span>
            </div>
          </div>

          <!-- ==========================================
               FORMULAIRE — add_contribution
               ========================================== -->
          <div v-else-if="action?.type === 'add_contribution'" class="action-form">
            <div class="form-title">
              <span class="form-title-icon">💰</span>Contribution à ajouter
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Objectif concerné</label>
                <select v-model="form.goal_id" class="form-select">
                  <option v-for="g in goals" :key="g.id" :value="g.id">
                    {{ g.icon || '🎯' }} {{ g.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Montant (€)</label>
                <input
                  v-model.number="form.amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  class="form-input"
                />
                <span v-if="action.hint" class="form-hint">{{ action.hint }}</span>
              </div>

              <div class="form-group full-width">
                <label>Note</label>
                <input
                  v-model="form.description"
                  type="text"
                  class="form-input"
                  placeholder="Ex: Épargne mensuelle Coach IA"
                />
              </div>
            </div>

            <div class="action-summary">
              <span class="summary-icon">📋</span>
              <span
                >Ajout de <strong>{{ formatCurrency(form.amount) }}</strong> sur
                <strong>{{ selectedGoalName }}</strong></span
              >
            </div>
          </div>

          <!-- ==========================================
               FORMULAIRE — update_goal
               ========================================== -->
          <div v-else-if="action?.type === 'update_goal'" class="action-form">
            <div class="form-title">
              <span class="form-title-icon">✏️</span>Modification d'objectif
            </div>
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Objectif</label>
                <select v-model="form.goal_id" class="form-select">
                  <option v-for="g in goals" :key="g.id" :value="g.id">
                    {{ g.icon || '🎯' }} {{ g.name }}
                  </option>
                </select>
              </div>

              <div v-if="action.fields?.includes('target_amount')" class="form-group">
                <label>Nouveau montant cible (€)</label>
                <input
                  v-model.number="form.target_amount"
                  type="number"
                  min="1"
                  class="form-input"
                />
              </div>

              <div v-if="action.fields?.includes('target_date')" class="form-group">
                <label>Nouvelle date cible</label>
                <input v-model="form.target_date" type="date" :min="tomorrow" class="form-input" />
              </div>

              <div v-if="action.fields?.includes('monthly_target')" class="form-group full-width">
                <label>Épargne mensuelle (€)</label>
                <input
                  v-model.number="form.monthly_target"
                  type="number"
                  min="1"
                  class="form-input"
                />
                <span v-if="action.hint" class="form-hint">{{ action.hint }}</span>
              </div>
            </div>

            <div class="action-summary">
              <span class="summary-icon">📋</span>
              <span
                >Mise à jour de <strong>{{ selectedGoalName }}</strong></span
              >
            </div>
          </div>

          <!-- FOOTER -->
          <div class="modal-footer">
            <button @click="close" class="btn-cancel">Annuler</button>
            <button
              @click="handleConfirm"
              :disabled="executing || !isFormValid"
              class="btn-confirm"
            >
              <span v-if="executing" class="spinner"></span>
              <span v-else>⚡</span>
              {{ executing ? 'En cours…' : 'Appliquer cette action' }}
            </button>
          </div>

          <!-- ERREUR -->
          <div v-if="error" class="error-banner">❌ {{ error }}</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGoalStore } from '@/stores/goalStore'

// ==========================================
// TYPES
// ==========================================

interface CoachAction {
  type: 'create_goal' | 'add_contribution' | 'update_goal'
  hint?: string
  fields?: string[]
  defaults: Record<string, any>
}

// ==========================================
// PROPS / EMITS
// ==========================================

const props = defineProps<{
  modelValue: boolean
  insight: any
  action: CoachAction | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: [result: any]
}>()

// ==========================================
// STORE + STATE
// ==========================================

const goalStore = useGoalStore()
const goals = computed(() => goalStore.goals)
const executing = ref(false)
const error = ref<string | null>(null)
const form = ref<Record<string, any>>({})

// ==========================================
// COMPUTED
// ==========================================

const tomorrow = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const selectedGoalName = computed(() => {
  const g = goals.value.find((g) => g.id === form.value.goal_id)
  return g ? `${g.icon || '🎯'} ${g.name}` : '…'
})

const isFormValid = computed(() => {
  const a = props.action
  if (!a) return false
  if (a.type === 'create_goal')
    return !!(form.value.name && form.value.target_amount > 0 && form.value.target_date)
  if (a.type === 'add_contribution') return !!(form.value.goal_id && form.value.amount > 0)
  if (a.type === 'update_goal') return !!form.value.goal_id
  return false
})

// ==========================================
// WATCHER — initialiser le form à l'ouverture
// ==========================================

watch(
  () => props.action,
  (action) => {
    if (!action) return
    error.value = null
    form.value = { ...action.defaults }

    // Pré-sélectionner le premier objectif pour les types qui en ont besoin
    if (['add_contribution', 'update_goal'].includes(action.type) && goals.value.length > 0) {
      if (!form.value.goal_id) form.value.goal_id = action.defaults.goal_id ?? goals.value[0].id
    }
  },
  { immediate: true },
)

// Charger les goals si pas encore chargés (nécessaire pour les selects)
watch(
  () => props.modelValue,
  async (open) => {
    if (open && goals.value.length === 0) await goalStore.fetchGoals()
  },
)

// ==========================================
// ACTIONS
// ==========================================

function close(): void {
  emit('update:modelValue', false)
}

/**
 * Exécuter l'action → BDD mise à jour, puis émettre success
 */
async function handleConfirm(): Promise<void> {
  if (!props.action || !isFormValid.value) return

  executing.value = true
  error.value = null

  try {
    let ok = false

    switch (props.action.type) {
      // ✅ Créer un objectif
      case 'create_goal':
        ok = await goalStore.createGoal({
          name: form.value.name,
          description: form.value.description ?? '',
          target_amount: form.value.target_amount,
          target_date: form.value.target_date,
          icon: form.value.icon ?? '💰',
          priority: form.value.priority ?? 'medium',
          current_amount: 0,
        })
        if (ok) await goalStore.fetchGoals()
        break

      // ✅ Ajouter une contribution
      case 'add_contribution':
        ok = await goalStore.addContribution(
          form.value.goal_id,
          form.value.amount,
          form.value.description ?? 'Contribution Coach IA',
        )
        break

      // ✅ Mettre à jour un objectif
      case 'update_goal': {
        const data: Record<string, any> = {}
        if (form.value.target_amount) data.target_amount = form.value.target_amount
        if (form.value.target_date) data.target_date = form.value.target_date
        if (form.value.monthly_target) data.monthly_target = form.value.monthly_target
        ok = await goalStore.updateGoal(form.value.goal_id, data)
        if (ok) await goalStore.fetchGoals()
        break
      }
    }

    if (ok) {
      emit('success', { type: props.action.type, form: { ...form.value } })
      close()
    } else {
      error.value = goalStore.error ?? 'Une erreur est survenue.'
    }
  } catch (err: any) {
    error.value = err.message ?? 'Erreur inattendue'
  } finally {
    executing.value = false
  }
}

// ==========================================
// HELPERS
// ==========================================

function formatCurrency(amount: number): string {
  if (!amount) return '0 €'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '…'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}
.modal-box {
  background: #fff;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}
.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}
.header-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.header-text {
  flex: 1;
}
.modal-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
.modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0;
}
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 1.25rem;
  padding: 0.25rem;
}
.close-btn:hover {
  color: #374151;
}
.insight-desc {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}
.action-form {
  padding: 1.25rem 1.5rem;
}
.form-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}
.form-title-icon {
  font-size: 1.1rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-group label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
}
.form-input,
.form-select {
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #1f2937;
  background: #fff;
  transition: border-color 0.15s;
  width: 100%;
}
.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
textarea.form-input {
  resize: vertical;
  min-height: 60px;
}
.form-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}
.action-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #1e40af;
}
.summary-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f3f4f6;
}
.btn-cancel {
  padding: 0.625rem 1.25rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.625rem;
  background: #fff;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
}
.btn-cancel:hover {
  background: #f9fafb;
}
.btn-confirm {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.625rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  transition: opacity 0.15s;
}
.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-confirm:not(:disabled):hover {
  opacity: 0.9;
}
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.error-banner {
  margin: 0 1.5rem 1rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
}
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-group.full-width {
    grid-column: auto;
  }
}
</style>
