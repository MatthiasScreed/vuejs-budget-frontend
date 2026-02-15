<template>
  <div class="goal-form">
    <!-- Header -->
    <div class="form-header">
      <div class="header-info">
        <div class="header-icon">🎯</div>
        <div>
          <h2 class="form-title">{{ isEditing ? "Modifier l'objectif" : 'Nouvel objectif' }}</h2>
          <p class="form-subtitle">Définissez et atteignez vos rêves financiers</p>
        </div>
      </div>
      <button @click="$emit('close')" class="close-btn" type="button">✕</button>
    </div>

    <!-- Steps Indicator -->
    <div class="steps-indicator">
      <div
        v-for="(step, index) in formSteps"
        :key="step.id"
        class="step"
        :class="{ active: currentStep >= index + 1, completed: currentStep > index + 1 }"
      >
        <div class="step-number">{{ currentStep > index + 1 ? '✓' : index + 1 }}</div>
        <span class="step-label">{{ step.title }}</span>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="form-body">
      <!-- Étape 1: Informations de base -->
      <div v-if="currentStep === 1" class="step-content">
        <h3 class="step-title">📋 Informations de base</h3>

        <!-- Templates -->
        <div class="templates-section">
          <label class="form-label">🎪 Utiliser un template (optionnel)</label>
          <div class="templates-grid">
            <button
              v-for="template in goalTemplates"
              :key="template.id"
              type="button"
              @click="applyTemplate(template)"
              class="template-btn"
              :class="{ selected: selectedTemplate === template.id }"
            >
              <span class="template-icon">{{ template.icon }}</span>
              <span class="template-name">{{ template.name }}</span>
            </button>
          </div>
        </div>

        <!-- Nom -->
        <div class="form-group">
          <label class="form-label required">🏷️ Nom de l'objectif</label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ error: errors.name }"
            placeholder="ex: Voyage au Japon"
            maxlength="100"
          />
          <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">📝 Description</label>
          <textarea
            v-model="formData.description"
            class="form-textarea"
            placeholder="Décrivez votre objectif..."
            rows="3"
          ></textarea>
        </div>

        <!-- Icône -->
        <div class="form-group">
          <label class="form-label">🎨 Icône</label>
          <div class="icon-grid">
            <button
              v-for="icon in availableIcons"
              :key="icon"
              type="button"
              @click="formData.icon = icon"
              class="icon-btn"
              :class="{ selected: formData.icon === icon }"
            >
              {{ icon }}
            </button>
          </div>
        </div>
      </div>

      <!-- Étape 2: Montants -->
      <div v-if="currentStep === 2" class="step-content">
        <h3 class="step-title">💰 Montants</h3>

        <!-- Montant cible -->
        <div class="form-group">
          <label class="form-label required">🎯 Montant cible</label>
          <div class="input-with-suffix">
            <input
              v-model.number="formData.target_amount"
              type="number"
              class="form-input"
              :class="{ error: errors.target_amount }"
              placeholder="5000"
              min="1"
              step="1"
            />
            <span class="input-suffix">€</span>
          </div>
          <span v-if="errors.target_amount" class="error-text">{{ errors.target_amount }}</span>
        </div>

        <!-- Montant actuel -->
        <div class="form-group">
          <label class="form-label">💵 Montant déjà épargné</label>
          <div class="input-with-suffix">
            <input
              v-model.number="formData.current_amount"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
              step="1"
            />
            <span class="input-suffix">€</span>
          </div>
        </div>

        <!-- Aperçu progression -->
        <div v-if="formData.target_amount > 0" class="preview-progress">
          <div class="preview-header">
            <span>Progression initiale</span>
            <span class="preview-percent">{{ initialProgress }}%</span>
          </div>
          <div class="preview-bar">
            <div class="preview-fill" :style="{ width: `${initialProgress}%` }"></div>
          </div>
          <div class="preview-amounts">
            <span>{{ formatCurrency(formData.current_amount || 0) }}</span>
            <span>{{ formatCurrency(formData.target_amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Étape 3: Date et options -->
      <div v-if="currentStep === 3" class="step-content">
        <h3 class="step-title">📅 Échéance et options</h3>

        <!-- Date cible -->
        <div class="form-group">
          <label class="form-label required">📆 Date cible</label>
          <input
            v-model="formData.target_date"
            type="date"
            class="form-input"
            :class="{ error: errors.target_date }"
            :min="minDate"
          />
          <span v-if="errors.target_date" class="error-text">{{ errors.target_date }}</span>
        </div>

        <!-- Priorité -->
        <div class="form-group">
          <label class="form-label">⚡ Priorité</label>
          <div class="priority-selector">
            <button
              v-for="p in priorities"
              :key="p.value"
              type="button"
              @click="formData.priority = p.value"
              class="priority-btn"
              :class="{ selected: formData.priority === p.value, [p.class]: true }"
            >
              {{ p.icon }} {{ p.label }}
            </button>
          </div>
        </div>

        <!-- Rappels -->
        <div class="form-group">
          <label class="form-label">🔔 Rappels</label>
          <select v-model="formData.reminder_frequency" class="form-select">
            <option value="">Pas de rappel</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuel</option>
          </select>
        </div>

        <!-- Résumé -->
        <div class="summary-card">
          <h4>📊 Résumé de votre objectif</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Objectif</span>
              <span class="summary-value">{{ formData.name || '-' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Montant cible</span>
              <span class="summary-value">{{ formatCurrency(formData.target_amount || 0) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Échéance</span>
              <span class="summary-value">{{
                formData.target_date ? formatDate(formData.target_date) : '-'
              }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Épargne mensuelle suggérée</span>
              <span class="summary-value highlight">{{ formatCurrency(suggestedMonthly) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="form-navigation">
        <button
          v-if="currentStep > 1"
          type="button"
          @click="previousStep"
          class="btn btn-secondary"
        >
          ← Précédent
        </button>
        <div v-else></div>

        <div class="nav-right">
          <button type="button" @click="$emit('close')" class="btn btn-outline">Annuler</button>

          <button
            v-if="currentStep < formSteps.length"
            type="button"
            @click="nextStep"
            :disabled="!canProceed"
            class="btn btn-primary"
          >
            Suivant →
          </button>

          <button v-else type="submit" :disabled="!isFormValid || loading" class="btn btn-success">
            <span v-if="loading">⏳ Enregistrement...</span>
            <span v-else>{{ isEditing ? '✅ Modifier' : "🎯 Créer l'objectif" }}</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'

// Props & Emits
interface Props {
  goal?: any
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  goal: null,
  isEditing: false,
})

const emit = defineEmits<{
  save: [data: any]
  close: []
}>()

// State
const loading = ref(false)
const currentStep = ref(1)
const selectedTemplate = ref<string | null>(null)
const errors = reactive<Record<string, string>>({})

const formData = reactive({
  name: '',
  description: '',
  icon: '🎯',
  target_amount: 0,
  current_amount: 0,
  target_date: '',
  priority: 'medium',
  reminder_frequency: '',
  status: 'active',
})

// Constants
const formSteps = [
  { id: 1, title: 'Informations' },
  { id: 2, title: 'Montants' },
  { id: 3, title: 'Échéance' },
]

const goalTemplates = [
  { id: 'travel', icon: '✈️', name: 'Voyage', target: 2000 },
  { id: 'emergency', icon: '🛡️', name: 'Urgence', target: 5000 },
  { id: 'house', icon: '🏠', name: 'Immobilier', target: 30000 },
  { id: 'car', icon: '🚗', name: 'Voiture', target: 15000 },
  { id: 'education', icon: '🎓', name: 'Formation', target: 1500 },
  { id: 'tech', icon: '💻', name: 'High-Tech', target: 1000 },
]

const availableIcons = ['🎯', '✈️', '🏠', '🚗', '🎓', '💻', '🛡️', '💍', '🏖️', '🎁', '📱', '🏋️']

const priorities = [
  { value: 'low', label: 'Basse', icon: '🟢', class: 'priority-low' },
  { value: 'medium', label: 'Moyenne', icon: '🟡', class: 'priority-medium' },
  { value: 'high', label: 'Haute', icon: '🔴', class: 'priority-high' },
]

// Computed
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const initialProgress = computed(() => {
  if (!formData.target_amount || formData.target_amount <= 0) return 0
  return Math.min(100, Math.round((formData.current_amount / formData.target_amount) * 100))
})

const suggestedMonthly = computed(() => {
  if (!formData.target_amount || !formData.target_date) return 0
  const remaining = formData.target_amount - (formData.current_amount || 0)
  const targetDate = new Date(formData.target_date)
  const today = new Date()
  const months = Math.max(
    1,
    Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)),
  )
  return Math.ceil(remaining / months)
})

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return formData.name?.trim().length >= 2
  }
  if (currentStep.value === 2) {
    return formData.target_amount > 0
  }
  return true
})

const isFormValid = computed(() => {
  return formData.name?.trim().length >= 2 && formData.target_amount > 0 && formData.target_date
})

// Methods
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0)
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function applyTemplate(template: any) {
  selectedTemplate.value = template.id
  formData.name = template.name
  formData.icon = template.icon
  formData.target_amount = template.target
  formData.description = `Objectif ${template.name.toLowerCase()}`
}

function validate(): boolean {
  // Clear errors
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!formData.name?.trim()) {
    errors.name = 'Le nom est requis'
  } else if (formData.name.length < 2) {
    errors.name = 'Minimum 2 caractères'
  }

  if (!formData.target_amount || formData.target_amount <= 0) {
    errors.target_amount = 'Le montant doit être supérieur à 0'
  }

  if (!formData.target_date) {
    errors.target_date = 'La date est requise'
  }

  return Object.keys(errors).length === 0
}

function nextStep() {
  if (canProceed.value && currentStep.value < formSteps.length) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true

  try {
    const goalData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      icon: formData.icon,
      target_amount: formData.target_amount,
      current_amount: formData.current_amount || 0,
      target_date: formData.target_date,
      priority: formData.priority,
      reminder_frequency: formData.reminder_frequency || null,
      status: formData.status,
    }

    console.log('💾 Submitting goal:', goalData)

    // Émettre l'événement save avec les données
    emit('save', goalData)

    // ✅ FERMER LE MODAL AUTOMATIQUEMENT
    // Note: Le parent gère la fermeture après le succès de l'API
    // Si on veut fermer immédiatement, décommenter:
    // emit('close')
  } catch (error) {
    console.error('❌ Submit error:', error)
  } finally {
    loading.value = false
  }
}

function loadGoal(goal: any) {
  if (!goal) return

  formData.name = goal.name || ''
  formData.description = goal.description || ''
  formData.icon = goal.icon || '🎯'
  formData.target_amount = goal.target_amount || 0
  formData.current_amount = goal.current_amount || 0
  formData.target_date = goal.target_date || ''
  formData.priority = goal.priority || 'medium'
  formData.reminder_frequency = goal.reminder_frequency || ''
  formData.status = goal.status || 'active'
}

// Watchers
watch(
  () => props.goal,
  (newGoal) => {
    if (newGoal) {
      loadGoal(newGoal)
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  console.log('🎯 GoalForm mounted, isEditing:', props.isEditing)
  if (props.goal) {
    loadGoal(props.goal)
  }
})
</script>

<style scoped>
.goal-form {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  max-width: 100%;
}

/* Header */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}
.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header-icon {
  font-size: 2.5rem;
}
.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}
.form-subtitle {
  margin: 0.25rem 0 0;
  opacity: 0.9;
  font-size: 0.875rem;
}
.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  transition: background 0.2s;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Steps */
.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}
.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
}
.step.active {
  opacity: 1;
}
.step.completed .step-number {
  background: #22c55e;
}
.step-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #d1d5db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}
.step.active .step-number {
  background: #3b82f6;
}
.step-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

/* Form Body */
.form-body {
  padding: 1.5rem;
}
.step-content {
  min-height: 300px;
}
.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem;
}

/* Form Groups */
.form-group {
  margin-bottom: 1.5rem;
}
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}
.form-label.required::after {
  content: ' *';
  color: #ef4444;
}
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.form-input::placeholder,
.form-textarea::placeholder {
  color: #5b6270;
  opacity: 1;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.form-input.error {
  border-color: #ef4444;
}
.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.input-with-suffix {
  position: relative;
}
.input-suffix {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #5b6270;
  font-weight: 500;
}
.input-with-suffix .form-input {
  padding-right: 2.5rem;
}

/* Templates */
.templates-section {
  margin-bottom: 1.5rem;
}
.templates-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
}
@media (max-width: 640px) {
  .templates-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.template-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}
.template-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}
.template-btn.selected {
  border-color: #3b82f6;
  background: #dbeafe;
}
.template-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}
.template-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

/* Icon Grid */
.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.icon-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
}
.icon-btn:hover {
  border-color: #3b82f6;
}
.icon-btn.selected {
  border-color: #3b82f6;
  background: #dbeafe;
}

/* Priority */
.priority-selector {
  display: flex;
  gap: 0.5rem;
}
.priority-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}
.priority-btn:hover {
  border-color: currentColor;
}
.priority-btn.selected {
  color: white;
}
.priority-btn.priority-low.selected {
  background: #22c55e;
  border-color: #22c55e;
}
.priority-btn.priority-medium.selected {
  background: #f59e0b;
  border-color: #f59e0b;
}
.priority-btn.priority-high.selected {
  background: #ef4444;
  border-color: #ef4444;
}

/* Preview Progress */
.preview-progress {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}
.preview-percent {
  font-weight: 600;
  color: #3b82f6;
}
.preview-bar {
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}
.preview-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 9999px;
  transition: width 0.3s;
}
.preview-amounts {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #5b6270;
}

/* Summary */
.summary-card {
  background: linear-gradient(135deg, #f0fdf4, #ecfeff);
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-top: 1.5rem;
}
.summary-card h4 {
  margin: 0 0 1rem;
  color: #1f2937;
  font-size: 1rem;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.summary-item {
  display: flex;
  flex-direction: column;
}
.summary-label {
  font-size: 0.75rem;
  color: #5b6270;
}
.summary-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}
.summary-value.highlight {
  color: #059669;
  font-size: 1.25rem;
}

/* Navigation */
.form-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}
.nav-right {
  display: flex;
  gap: 0.75rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
.btn-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}
.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
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
</style>
