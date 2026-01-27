<template>
  <div class="transaction-form-container">
    <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center"
               :class="transaction?.id ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'">
            <span class="text-2xl">💳</span>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ transaction?.id ? 'Modifier la transaction' : 'Nouvelle transaction' }}
            </h2>
            <p class="text-gray-500">{{ type === 'income' ? 'Ajouter un revenu' : 'Ajouter une dépense' }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Type de transaction -->
        <div class="form-group">
          <label class="form-label required">
            <span class="flex items-center gap-2">
              <span>⚡</span>
              <span>Type de transaction</span>
            </span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="selectType('expense')"
              class="type-button"
              :class="{ 'type-selected': formData.type === 'expense' }"
            >
              <span class="text-2xl">💸</span>
              <span class="font-medium">Dépense</span>
            </button>
            <button
              type="button"
              @click="selectType('income')"
              class="type-button"
              :class="{ 'type-selected': formData.type === 'income' }"
            >
              <span class="text-2xl">💰</span>
              <span class="font-medium">Revenu</span>
            </button>
          </div>
          <div v-if="errors.type" class="form-error">{{ errors.type }}</div>
        </div>

        <!-- Ligne 1: Description et Montant -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label for="description" class="form-label required">
              <span class="flex items-center gap-2">
                <span>📝</span>
                <span>Description</span>
              </span>
            </label>
            <input
              id="description"
              v-model="formData.description"
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.description }"
              placeholder="ex: Courses Carrefour"
              maxlength="255"
              @input="markAsDirty"
            >
            <div v-if="errors.description" class="form-error">{{ errors.description }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formData.description?.length || 0 }}/255 caractères
            </div>
          </div>

          <div class="form-group">
            <label for="amount" class="form-label required">
              <span class="flex items-center gap-2">
                <span>💶</span>
                <span>Montant</span>
              </span>
            </label>
            <div class="amount-input">
              <input
                id="amount"
                v-model.number="formData.amount"
                type="number"
                class="form-input"
                :class="{ 'input-error': errors.amount }"
                placeholder="0.00"
                min="0"
                step="0.01"
                @input="markAsDirty"
              >
              <span class="currency-symbol">€</span>
            </div>
            <div v-if="errors.amount" class="form-error">{{ errors.amount }}</div>
          </div>
        </div>

        <!-- Ligne 2: Catégorie et Date -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label for="category_id" class="form-label">
              <span class="flex items-center gap-2">
                <span>🏷️</span>
                <span>Catégorie</span>
              </span>
            </label>
            <select
              id="category_id"
              v-model="formData.category_id"
              class="form-select"
              :class="{ 'input-error': errors.category_id }"
              @change="markAsDirty"
            >
              <option value="">Sélectionner une catégorie</option>
              <option
                v-for="category in availableCategories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
            <div v-if="errors.category_id" class="form-error">{{ errors.category_id }}</div>
          </div>

          <div class="form-group">
            <label for="transaction_date" class="form-label required">
              <span class="flex items-center gap-2">
                <span>📅</span>
                <span>Date</span>
              </span>
            </label>
            <input
              id="transaction_date"
              v-model="formData.transaction_date"
              type="date"
              class="form-input"
              :class="{ 'input-error': errors.transaction_date }"
              @change="markAsDirty"
            >
            <div v-if="errors.transaction_date" class="form-error">{{ errors.transaction_date }}</div>
          </div>
        </div>

        <!-- Notes optionnelles -->
        <div class="form-group">
          <label for="notes" class="form-label">
            <span class="flex items-center gap-2">
              <span>📄</span>
              <span>Notes (optionnelles)</span>
            </span>
          </label>
          <textarea
            id="notes"
            v-model="formData.notes"
            class="form-textarea"
            :class="{ 'input-error': errors.notes }"
            placeholder="Informations complémentaires..."
            rows="3"
            maxlength="1000"
            @input="markAsDirty"
          ></textarea>
          <div v-if="errors.notes" class="form-error">{{ errors.notes }}</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ formData.notes?.length || 0 }}/1000 caractères
          </div>
        </div>

        <!-- Tags optionnels -->
        <div class="form-group">
          <label class="form-label">
            <span class="flex items-center gap-2">
              <span>🏷️</span>
              <span>Tags (optionnels)</span>
            </span>
          </label>
          <div class="tags-input">
            <input
              v-model="newTag"
              type="text"
              class="form-input"
              placeholder="Ajouter un tag..."
              @keydown.enter.prevent="addTag"
              @keydown.comma.prevent="addTag"
            >
            <button type="button" @click="addTag" class="add-tag-btn">
              ➕
            </button>
          </div>

          <!-- Liste des tags -->
          <div v-if="formData.tags && formData.tags.length > 0" class="tags-list">
            <span
              v-for="(tag, index) in formData.tags"
              :key="index"
              class="tag"
            >
              {{ tag }}
              <button type="button" @click="removeTag(index)" class="remove-tag">×</button>
            </span>
          </div>
        </div>

        <!-- Options avancées -->
        <div class="advanced-section">
          <h3 class="section-title">⚙️ Options avancées</h3>

          <div class="options-grid">
            <label class="checkbox-label">
              <input
                v-model="formData.is_recurring"
                type="checkbox"
                class="form-checkbox"
                @change="markAsDirty"
              >
              <span class="checkbox-text">Transaction récurrente</span>
              <span class="checkbox-help">(Se répète automatiquement)</span>
            </label>

            <!-- Options récurrence -->
            <div v-if="formData.is_recurring" class="recurring-options">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="recurring_frequency" class="form-label">Fréquence</label>
                  <select
                    id="recurring_frequency"
                    v-model="formData.recurring_frequency"
                    class="form-select"
                    @change="markAsDirty"
                  >
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                    <option value="quarterly">Trimestrielle</option>
                    <option value="yearly">Annuelle</option>
                  </select>
                </div>

                <div>
                  <label for="recurring_end_date" class="form-label">Date de fin</label>
                  <input
                    id="recurring_end_date"
                    v-model="formData.recurring_end_date"
                    type="date"
                    class="form-input"
                    @change="markAsDirty"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aperçu -->
        <div v-if="isValid && formData.description && formData.amount" class="preview-section">
          <h3 class="section-title">👁️ Aperçu</h3>
          <div class="preview-card">
            <div
              class="preview-icon"
              :class="formData.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
            >
              <span class="text-xl">{{ formData.type === 'income' ? '💰' : '💸' }}</span>
            </div>
            <div class="preview-content">
              <h4 class="preview-title">{{ formData.description }}</h4>
              <div class="preview-amount"
                   :class="formData.type === 'income' ? 'text-green-600' : 'text-red-600'">
                {{ formData.type === 'income' ? '+' : '-' }}{{ formatCurrency(formData.amount || 0) }}
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
            class="btn-outline"
            :disabled="formState.isSubmitting"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="!canSubmit"
            class="btn-primary"
          >
            <span v-if="formState.isSubmitting">⏳ Enregistrement...</span>
            <span v-else>
              {{ transaction?.id ? '✅ Modifier' : '➕ Créer' }} la transaction
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFormHandler } from '@/composables/useFormHandler'
import type { Transaction, Category } from '@/types'

// Props & Emits
interface Props {
  transaction?: Transaction | null
  type?: 'income' | 'expense'
  categories?: Category[]
}

interface Emits {
  close: []
  cancel: []
  save: [transaction: Transaction]
}

const props = withDefaults(defineProps<Props>(), {
  transaction: null,
  type: 'expense',
  categories: () => []
})

const emit = defineEmits<Emits>()

// State local
const newTag = ref('')
const availableCategories = ref<Category[]>([])

// Form handler
const {
  formData,
  errors,
  formState,
  isValid,
  canSubmit,
  markAsDirty,
  submitForm,
  loadData
} = useFormHandler<Transaction>('transaction', {
  type: props.type,
  transaction_date: new Date().toISOString().split('T')[0],
  is_recurring: false,
  recurring_frequency: 'monthly',
  tags: []
})

// Computed
const selectedCategory = computed(() =>
  availableCategories.value.find(cat => cat.id === formData.category_id)
)

// Methods
function selectType(type: 'income' | 'expense') {
  formData.type = type
  markAsDirty()

  // Filtrer les catégories selon le type
  filterCategoriesByType()
}

function filterCategoriesByType() {
  availableCategories.value = props.categories.filter(cat =>
    !formData.type || cat.type === formData.type
  )

  // Réinitialiser la catégorie si elle ne correspond plus au type
  if (formData.category_id && selectedCategory.value?.type !== formData.type) {
    formData.category_id = null
  }
}

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
    newTag.value = ''
    markAsDirty()
  }
}

function removeTag(index: number) {
  formData.tags.splice(index, 1)
  markAsDirty()
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR')
}

async function handleSubmit() {
  const result = await submitForm()

  if (result) {
    emit('save', result)
  }
}

// Watchers
watch(() => props.transaction, (newTransaction) => {
  if (newTransaction) {
    loadData({
      ...newTransaction,
      // Convertir les tags string en array si nécessaire
      tags: typeof newTransaction.tags === 'string'
        ? newTransaction.tags.split(',').filter(t => t.trim())
        : newTransaction.tags || []
    })
  }
}, { immediate: true })

watch(() => props.categories, (newCategories) => {
  availableCategories.value = newCategories
  filterCategoriesByType()
}, { immediate: true })

watch(() => formData.type, () => {
  filterCategoriesByType()
})

// Lifecycle
onMounted(() => {
  // Si pas de transaction existante, utiliser le type par défaut des props
  if (!props.transaction) {
    formData.type = props.type
    filterCategoriesByType()
  }
})
</script>

<style scoped>
/* STYLES DE BASE */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-label.required::after {
  content: ' *';
  color: #EF4444;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  border-color: #3b82f6;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  resize: vertical;
  transition: all 0.2s;
}

.input-error {
  border-color: #f87171;
}

.form-error {
  font-size: 0.875rem;
  color: #ef4444;
}

/* TYPE SELECTOR */
.type-button {
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

.type-button:hover {
  border-color: #9ca3af;
}

.type-selected {
  border-color: #3b82f6;
  background: #dbeafe;
}

/* AMOUNT INPUT */
.amount-input {
  position: relative;
}

.currency-symbol {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 500;
}

/* TAGS */
.tags-input {
  display: flex;
  gap: 0.5rem;
}

.add-tag-btn {
  padding: 0.75rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-tag-btn:hover {
  background: #e5e7eb;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.remove-tag {
  background: none;
  border: none;
  color: #1e40af;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
}

/* SECTIONS AVANCÉES */
.advanced-section {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.checkbox-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.checkbox-help {
  font-size: 0.75rem;
  color: #6b7280;
}

.recurring-options {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

/* APERÇU */
.preview-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f3e8ff 0%, #fdf2f8 100%);
  border-radius: 0.75rem;
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
}

.preview-content {
  flex: 1;
}

.preview-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.preview-amount {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

/* ACTIONS */
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.btn-outline {
  border: 1px solid #d1d5db;
  color: #374151;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
}
</style>
