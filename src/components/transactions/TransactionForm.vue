<template>
  <div class="transaction-form-container">
    <div class="form-card">
      <!-- Header -->
      <div class="form-header">
        <div class="header-info">
          <div class="header-icon" :class="transaction?.id ? 'icon-edit' : 'icon-new'">
            <span>💳</span>
          </div>
          <div>
            <h2 class="form-title">
              {{ transaction?.id ? 'Modifier la transaction' : 'Nouvelle transaction' }}
            </h2>
            <p class="form-subtitle">
              {{ formData.type === 'income' ? 'Ajouter un revenu' : 'Ajouter une dépense' }}
            </p>
          </div>
        </div>
        <button @click="$emit('close')" class="close-btn" type="button">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="form-body">
        <!-- Type de transaction -->
        <div class="form-group">
          <label class="form-label required"> <span>⚡</span> Type de transaction </label>
          <div class="type-selector">
            <button
              type="button"
              @click="selectType('expense')"
              class="type-btn"
              :class="{ 'type-selected expense-selected': formData.type === 'expense' }"
            >
              <span class="type-icon">💸</span>
              <span class="type-text">Dépense</span>
            </button>
            <button
              type="button"
              @click="selectType('income')"
              class="type-btn"
              :class="{ 'type-selected income-selected': formData.type === 'income' }"
            >
              <span class="type-icon">💰</span>
              <span class="type-text">Revenu</span>
            </button>
          </div>
          <p v-if="errors.type" class="error-text">{{ errors.type }}</p>
        </div>

        <!-- Description et Montant -->
        <div class="form-row">
          <div class="form-group">
            <label for="description" class="form-label required">
              <span>📝</span> Description
            </label>
            <input
              id="description"
              v-model="formData.description"
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.description }"
              placeholder="ex: Courses Carrefour"
              maxlength="255"
            />
            <p v-if="errors.description" class="error-text">{{ errors.description }}</p>
            <p class="char-count">{{ formData.description?.length || 0 }}/255</p>
          </div>

          <div class="form-group">
            <label for="amount" class="form-label required"> <span>💶</span> Montant </label>
            <div class="amount-wrapper">
              <input
                id="amount"
                v-model.number="formData.amount"
                type="number"
                class="form-input amount-input"
                :class="{ 'input-error': errors.amount }"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <span class="currency">€</span>
            </div>
            <p v-if="errors.amount" class="error-text">{{ errors.amount }}</p>
          </div>
        </div>

        <!-- Catégorie et Date -->
        <div class="form-row">
          <div class="form-group">
            <label for="category_id" class="form-label"> <span>🏷️</span> Catégorie </label>
            <select
              id="category_id"
              v-model="formData.category_id"
              class="form-select"
              :class="{ 'input-error': errors.category_id }"
            >
              <option value="">Sélectionner une catégorie</option>
              <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
                {{ cat.icon || '📁' }} {{ cat.name }}
              </option>
            </select>
            <p v-if="errors.category_id" class="error-text">{{ errors.category_id }}</p>
          </div>

          <div class="form-group">
            <label for="transaction_date" class="form-label required"> <span>📅</span> Date </label>
            <input
              id="transaction_date"
              v-model="formData.transaction_date"
              type="date"
              class="form-input"
              :class="{ 'input-error': errors.transaction_date }"
            />
            <p v-if="errors.transaction_date" class="error-text">{{ errors.transaction_date }}</p>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label for="notes" class="form-label"> <span>📄</span> Notes (optionnelles) </label>
          <textarea
            id="notes"
            v-model="formData.notes"
            class="form-textarea"
            placeholder="Informations complémentaires..."
            rows="3"
            maxlength="1000"
          ></textarea>
          <p class="char-count">{{ formData.notes?.length || 0 }}/1000</p>
        </div>

        <!-- Options avancées -->
        <div class="advanced-section">
          <h3 class="section-title">⚙️ Options avancées</h3>

          <label class="checkbox-wrapper">
            <input v-model="formData.is_recurring" type="checkbox" class="checkbox-input" />
            <span class="checkbox-label">Transaction récurrente</span>
            <span class="checkbox-hint">(Se répète automatiquement)</span>
          </label>

          <div v-if="formData.is_recurring" class="recurring-options">
            <div class="form-row">
              <div class="form-group">
                <label for="recurring_frequency" class="form-label">Fréquence</label>
                <select
                  id="recurring_frequency"
                  v-model="formData.recurring_frequency"
                  class="form-select"
                >
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                  <option value="quarterly">Trimestrielle</option>
                  <option value="yearly">Annuelle</option>
                </select>
              </div>
              <div class="form-group">
                <label for="recurring_end_date" class="form-label">Date de fin</label>
                <input
                  id="recurring_end_date"
                  v-model="formData.recurring_end_date"
                  type="date"
                  class="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Aperçu -->
        <div v-if="showPreview" class="preview-section">
          <h3 class="section-title">👁️ Aperçu</h3>
          <div class="preview-card">
            <div
              class="preview-icon"
              :class="formData.type === 'income' ? 'preview-income' : 'preview-expense'"
            >
              {{ formData.type === 'income' ? '💰' : '💸' }}
            </div>
            <div class="preview-content">
              <h4 class="preview-title">{{ formData.description }}</h4>
              <div
                class="preview-amount"
                :class="formData.type === 'income' ? 'text-income' : 'text-expense'"
              >
                {{ formData.type === 'income' ? '+' : '-'
                }}{{ formatCurrency(formData.amount || 0) }}
              </div>
              <div class="preview-meta">
                <span>{{ formatDate(formData.transaction_date) }}</span>
                <span v-if="selectedCategory">• {{ selectedCategory.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button
            type="button"
            @click="$emit('cancel')"
            class="btn-cancel"
            :disabled="isSubmitting"
          >
            Annuler
          </button>
          <button type="submit" :disabled="!canSubmit" class="btn-submit">
            <span v-if="isSubmitting">⏳ Enregistrement...</span>
            <span v-else>{{ transaction?.id ? '✅ Modifier' : '➕ Créer' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'

// ==========================================
// TYPES
// ==========================================

interface Transaction {
  id?: number
  type: 'income' | 'expense'
  description: string
  amount: number
  category_id?: number | null
  transaction_date: string
  notes?: string
  is_recurring?: boolean
  recurring_frequency?: string
  recurring_end_date?: string
  tags?: string[]
}

interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  icon?: string
}

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  transaction?: Transaction | null
  type?: 'income' | 'expense'
  categories?: Category[]
}

const props = withDefaults(defineProps<Props>(), {
  transaction: null,
  type: 'expense',
  categories: () => [],
})

const emit = defineEmits<{
  close: []
  cancel: []
  save: [transaction: Transaction]
}>()

// ==========================================
// STATE
// ==========================================

const isSubmitting = ref(false)
const errors = reactive<Record<string, string>>({})

const formData = reactive<Transaction>({
  type: props.type,
  description: '',
  amount: 0,
  category_id: null,
  transaction_date: new Date().toISOString().split('T')[0],
  notes: '',
  is_recurring: false,
  recurring_frequency: 'monthly',
  recurring_end_date: '',
  tags: [],
})

// ==========================================
// COMPUTED
// ==========================================

const filteredCategories = computed(() => {
  if (!props.categories?.length) return []
  return props.categories.filter((cat) => cat.type === formData.type)
})

const selectedCategory = computed(() => {
  if (!formData.category_id || !props.categories?.length) return null
  return props.categories.find((cat) => cat.id === formData.category_id)
})

const showPreview = computed(() => {
  return formData.description && formData.amount && formData.amount > 0
})

const canSubmit = computed(() => {
  return (
    !isSubmitting.value &&
    formData.description?.trim() &&
    formData.amount > 0 &&
    formData.transaction_date
  )
})

// ==========================================
// METHODS
// ==========================================

function selectType(type: 'income' | 'expense') {
  formData.type = type
  // Reset category if type changes
  if (selectedCategory.value?.type !== type) {
    formData.category_id = null
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

function validate(): boolean {
  // Clear errors
  Object.keys(errors).forEach((key) => delete errors[key])

  let isValid = true

  if (!formData.type) {
    errors.type = 'Le type est requis'
    isValid = false
  }

  if (!formData.description?.trim()) {
    errors.description = 'La description est requise'
    isValid = false
  } else if (formData.description.length < 2) {
    errors.description = 'Minimum 2 caractères'
    isValid = false
  }

  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Le montant doit être supérieur à 0'
    isValid = false
  }

  if (!formData.transaction_date) {
    errors.transaction_date = 'La date est requise'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  console.log('📝 Form submit triggered')

  if (!validate()) {
    console.warn('❌ Validation failed:', errors)
    return
  }

  isSubmitting.value = true

  try {
    // Prepare data
    const transactionData: Transaction = {
      type: formData.type,
      description: formData.description.trim(),
      amount: Number(formData.amount),
      category_id: formData.category_id || null,
      transaction_date: formData.transaction_date,
      notes: formData.notes?.trim() || '',
      is_recurring: formData.is_recurring || false,
      recurring_frequency: formData.is_recurring ? formData.recurring_frequency : undefined,
      recurring_end_date: formData.is_recurring ? formData.recurring_end_date : undefined,
    }

    // If editing, include ID
    if (props.transaction?.id) {
      transactionData.id = props.transaction.id
    }

    console.log('💾 Emitting save:', transactionData)
    emit('save', transactionData)
  } catch (error) {
    console.error('❌ Submit error:', error)
  } finally {
    isSubmitting.value = false
  }
}

function loadTransaction(tx: Transaction) {
  formData.type = tx.type || props.type
  formData.description = tx.description || ''
  formData.amount = Number(tx.amount) || 0
  formData.category_id = tx.category_id || null
  formData.transaction_date = tx.transaction_date || new Date().toISOString().split('T')[0]
  formData.notes = tx.notes || ''
  formData.is_recurring = tx.is_recurring || false
  formData.recurring_frequency = tx.recurring_frequency || 'monthly'
  formData.recurring_end_date = tx.recurring_end_date || ''
}

// ==========================================
// WATCHERS
// ==========================================

watch(
  () => props.transaction,
  (newTx) => {
    if (newTx) {
      loadTransaction(newTx)
    }
  },
  { immediate: true },
)

watch(
  () => props.type,
  (newType) => {
    if (!props.transaction && newType) {
      formData.type = newType
    }
  },
  { immediate: true },
)

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  console.log('🚀 TransactionForm mounted')
  console.log('📋 Props:', {
    transaction: props.transaction,
    type: props.type,
    categoriesCount: props.categories?.length,
  })

  if (!props.transaction) {
    formData.type = props.type
  }
})
</script>

<style scoped>
.transaction-form-container {
  width: 100%;
  max-width: 42rem;
}

.form-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

/* Header */
.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.icon-new {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.icon-edit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.form-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.form-subtitle {
  font-size: 0.875rem;
  color: #5b6270;
  margin: 0.25rem 0 0 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #5b6270;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

/* Form Body */
.form-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-label.required::after {
  content: '*';
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  color: #111827;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
  opacity: 1;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin: 0;
}

.char-count {
  font-size: 0.75rem;
  color: #8c939f;
  text-align: right;
  margin: 0;
}

/* Type Selector */
.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: #8c939f;
}

.type-selected {
  border-width: 2px;
}

.expense-selected {
  border-color: #ef4444;
  background: #fef2f2;
}

.income-selected {
  border-color: #22c55e;
  background: #f0fdf4;
}

.type-icon {
  font-size: 1.5rem;
}

.type-text {
  font-weight: 500;
  color: #374151;
}

/* Amount */
.amount-wrapper {
  position: relative;
}

.amount-input {
  padding-right: 2.5rem;
}

.currency {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #5b6270;
  font-weight: 500;
}

/* Advanced Section */
.advanced-section {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-input {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #3b82f6;
}

.checkbox-label {
  font-weight: 500;
  color: #374151;
}

.checkbox-hint {
  font-size: 0.75rem;
  color: #5b6270;
}

.recurring-options {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

/* Preview */
.preview-section {
  background: linear-gradient(135deg, #f3e8ff, #fdf2f8);
  border-radius: 0.75rem;
  padding: 1rem;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.preview-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.preview-income {
  background: #dcfce7;
}

.preview-expense {
  background: #fee2e2;
}

.preview-content {
  flex: 1;
}

.preview-title {
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.preview-amount {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.text-income {
  color: #16a34a;
}

.text-expense {
  color: #dc2626;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #5b6270;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-submit {
  flex: 2;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
}

.btn-submit:disabled,
.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    flex: none;
    width: 100%;
  }
}
</style>
