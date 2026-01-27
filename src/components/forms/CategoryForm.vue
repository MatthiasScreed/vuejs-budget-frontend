<template>
  <div class="category-form-container">
    <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span class="text-2xl">🗂️</span>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
            </h2>
            <p class="text-gray-500">Organisez vos finances intelligemment</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="form-container">
        <!-- Ligne 1: Nom et Type -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label for="name" class="form-label required">
              <span class="flex items-center gap-2">
                <span>📝</span>
                <span>Nom de la catégorie</span>
              </span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.name }"
              placeholder="ex: Courses alimentaires"
              maxlength="100"
            >
            <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formData.name?.length || 0 }}/100 caractères
            </div>
          </div>

          <div class="form-group">
            <label for="type" class="form-label required">
              <span class="flex items-center gap-2">
                <span>⚡</span>
                <span>Type de catégorie</span>
              </span>
            </label>
            <select
              id="type"
              v-model="formData.type"
              class="form-select"
              :class="{ 'input-error': errors.type }"
            >
              <option value="">Choisir le type</option>
              <option value="income">💰 Revenus</option>
              <option value="expense">💸 Dépenses</option>
            </select>
            <div v-if="errors.type" class="form-error">{{ errors.type }}</div>
          </div>
        </div>

        <!-- Ligne 2: Description -->
        <div class="form-group">
          <label for="description" class="form-label">
            <span class="flex items-center gap-2">
              <span>📄</span>
              <span>Description (optionnelle)</span>
            </span>
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-textarea"
            :class="{ 'input-error': errors.description }"
            placeholder="Décrivez l'usage de cette catégorie..."
            rows="3"
            maxlength="500"
          ></textarea>
          <div v-if="errors.description" class="form-error">{{ errors.description }}</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ formData.description?.length || 0 }}/500 caractères
          </div>
        </div>

        <!-- Ligne 3: Icône et Couleur -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Icône -->
          <div class="form-group">
            <label class="form-label">
              <span class="flex items-center gap-2">
                <span>🎨</span>
                <span>Icône</span>
              </span>
            </label>
            <div class="icon-selector">
              <div class="selected-icon" @click="iconPickerOpen = !iconPickerOpen">
                <span class="text-2xl">{{ getIconDisplay(formData.icon) || '📁' }}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              <div v-if="iconPickerOpen" class="icon-grid">
                <button
                  v-for="icon in availableIcons"
                  :key="icon.key"
                  type="button"
                  @click="selectIcon(icon.key)"
                  class="icon-option"
                  :class="{ 'icon-selected': formData.icon === icon.key }"
                >
                  {{ icon.display }}
                </button>
              </div>
            </div>
          </div>

          <!-- Couleur -->
          <div class="form-group">
            <label class="form-label">
              <span class="flex items-center gap-2">
                <span>🌈</span>
                <span>Couleur</span>
              </span>
            </label>
            <div class="color-selector">
              <div
                class="color-preview"
                :style="{ backgroundColor: formData.color || '#6B7280' }"
                @click="colorPickerOpen = !colorPickerOpen"
              ></div>
              <input
                v-model="formData.color"
                type="text"
                class="form-input flex-1"
                placeholder="#6B7280"
                pattern="^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
              >
            </div>

            <!-- Color Picker -->
            <div v-if="colorPickerOpen" class="color-picker">
              <div class="color-grid">
                <button
                  v-for="color in presetColors"
                  :key="color"
                  type="button"
                  @click="selectColor(color)"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  :class="{ 'color-selected': formData.color === color }"
                ></button>
              </div>
              <button @click="colorPickerOpen = false" class="btn-close-picker">
                Fermer
              </button>
            </div>
          </div>
        </div>

        <!-- Ligne 4: Budget mensuel (pour dépenses) -->
        <div v-if="formData.type === 'expense'" class="form-group">
          <label for="monthly_budget" class="form-label">
            <span class="flex items-center gap-2">
              <span>💰</span>
              <span>Budget mensuel (optionnel)</span>
            </span>
          </label>
          <div class="budget-input">
            <input
              id="monthly_budget"
              v-model.number="formData.monthly_budget"
              type="number"
              class="form-input"
              :class="{ 'input-error': errors.monthly_budget }"
              placeholder="0"
              min="0"
              step="0.01"
            >
            <span class="currency-symbol">€</span>
          </div>
          <div v-if="errors.monthly_budget" class="form-error">{{ errors.monthly_budget }}</div>
          <p class="text-xs text-gray-500 mt-1">
            Définissez une limite de dépenses pour cette catégorie
          </p>
        </div>

        <!-- Options avancées -->
        <div class="advanced-section">
          <h3 class="section-title">⚙️ Options avancées</h3>

          <div class="options-grid">
            <label class="checkbox-label">
              <input
                v-model="formData.is_active"
                type="checkbox"
                class="form-checkbox"
              >
              <span class="checkbox-text">Catégorie active</span>
              <span class="checkbox-help">(Les catégories inactives sont masquées)</span>
            </label>

            <!-- Parent Category (si modification) -->
            <div v-if="isEditing" class="form-group">
              <label for="parent_id" class="form-label">Catégorie parent</label>
              <select
                id="parent_id"
                v-model="formData.parent_id"
                class="form-select"
              >
                <option value="">Aucune (catégorie principale)</option>
                <option
                  v-for="category in availableParentCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Aperçu -->
        <div v-if="isFormValid" class="preview-section">
          <h3 class="section-title">👁️ Aperçu</h3>
          <div class="preview-card">
            <div
              class="preview-icon"
              :style="{ backgroundColor: (formData.color || '#6B7280') + '20' }"
            >
              <span class="text-xl">{{ getIconDisplay(formData.icon) || '📁' }}</span>
            </div>
            <div class="preview-content">
              <h4 class="preview-title">{{ formData.name || 'Nom de la catégorie' }}</h4>
              <div class="preview-meta">
                <span class="capitalize">{{ getTypeDisplay(formData.type) }}</span>
                <span v-if="formData.monthly_budget" class="budget-display">
                  • Budget: {{ formatCurrency(formData.monthly_budget) }}/mois
                </span>
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
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="!isFormValid || isSubmitting"
            class="btn-primary"
          >
            <span v-if="isSubmitting">⏳ Enregistrement...</span>
            <span v-else>
              {{ isEditing ? '✅ Modifier' : '➕ Créer' }} la catégorie
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'

// Props & Emits
interface Props {
  category?: Category
  isEditing?: boolean
  defaultType?: 'income' | 'expense'
}

interface Emits {
  close: []
  cancel: []
  save: [data: CreateCategoryData]
}
const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  defaultType: 'expense'
})

const emit = defineEmits<Emits>()

// State
const iconPickerOpen = ref(false)
const colorPickerOpen = ref(false)
const isSubmitting = ref(false)

const formData = reactive({
  name: '',
  type: props.defaultType, // Utiliser le defaultType
  description: '',
  icon: 'folder',
  color: '#6B7280',
  monthly_budget: null,
  is_active: true,
  parent_id: null,
  ...props.category
})

const errors = reactive({
  name: '',
  type: '',
  description: '',
  monthly_budget: ''
})

// Available options
const availableIcons = [
  { key: 'folder', display: '📁' },
  { key: 'shopping-cart', display: '🛒' },
  { key: 'car', display: '🚗' },
  { key: 'home', display: '🏠' },
  { key: 'heart', display: '❤️' },
  { key: 'star', display: '⭐' },
  { key: 'money', display: '💰' },
  { key: 'credit-card', display: '💳' },
  { key: 'gift', display: '🎁' },
  { key: 'plane', display: '✈️' },
  { key: 'coffee', display: '☕' },
  { key: 'book', display: '📚' },
  { key: 'music', display: '🎵' },
  { key: 'game', display: '🎮' },
  { key: 'phone', display: '📱' },
  { key: 'laptop', display: '💻' },
  { key: 'camera', display: '📷' },
  { key: 'medical', display: '🏥' },
  { key: 'education', display: '🎓' },
  { key: 'fitness', display: '💪' }
]

const presetColors = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#6B7280', '#1F2937', '#7C3AED', '#DB2777',
  '#059669', '#DC2626', '#CA8A04', '#4338CA'
]

const availableParentCategories = ref([])

// Computed
const isFormValid = computed(() => {
  return formData.name && formData.type && !Object.values(errors).some(error => error)
})

// Methods
function getIconDisplay(iconKey: string): string {
  const icon = availableIcons.find(i => i.key === iconKey)
  return icon?.display || '📁'
}

function getTypeDisplay(type: string): string {
  const types = {
    income: 'Revenus',
    expense: 'Dépenses'
  }
  return types[type as keyof typeof types] || ''
}

function selectIcon(iconKey: string): void {
  formData.icon = iconKey
  iconPickerOpen.value = false
}

function selectColor(color: string): void {
  formData.color = color
  colorPickerOpen.value = false
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function validateForm(): boolean {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // Validation nom
  if (!formData.name?.trim()) {
    errors.name = 'Le nom est obligatoire'
    isValid = false
  } else if (formData.name.length > 100) {
    errors.name = 'Le nom ne peut pas dépasser 100 caractères'
    isValid = false
  }

  // Validation type
  if (!formData.type) {
    errors.type = 'Le type est obligatoire'
    isValid = false
  }

  // Validation budget
  if (formData.monthly_budget !== null && formData.monthly_budget < 0) {
    errors.monthly_budget = 'Le budget ne peut pas être négatif'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const categoryData = {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description?.trim() || null,
      icon: formData.icon,
      color: formData.color,
      monthly_budget: formData.monthly_budget,
      is_active: formData.is_active,
      parent_id: formData.parent_id || null
    }

    emit('save', categoryData)
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Close pickers when clicking outside
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (!target.closest('.icon-selector')) {
    iconPickerOpen.value = false
  }
  if (!target.closest('.color-selector') && !target.closest('.color-picker')) {
    colorPickerOpen.value = false
  }
})
</script>

<style scoped>
/* CORRIGÉ: Remplacement de toutes les classes problématiques */

.form-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

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

.form-input::placeholder {
  color: #9ca3af;
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

.form-select:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  border-color: #3b82f6;
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

.form-textarea:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  border-color: #3b82f6;
}

.input-error {
  border-color: #f87171;
}

.input-error:focus {
  ring-color: #ef4444;
  border-color: #ef4444;
}

.form-error {
  font-size: 0.875rem;
  color: #ef4444;
}

/* Icon Selector */
.icon-selector {
  position: relative;
}

.selected-icon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.selected-icon:hover {
  border-color: #9ca3af;
}

.icon-grid {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.icon-option {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.icon-option:hover {
  border-color: #8b5cf6;
}

.icon-selected {
  border-color: #8b5cf6;
  background-color: #f3e8ff;
}

/* Color Selector */
.color-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-preview {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.color-preview:hover {
  border-color: #9ca3af;
}

.color-picker {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 20;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 1rem;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.color-option {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.color-selected {
  border-color: #1f2937;
}

.btn-close-picker {
  width: 100%;
  padding: 0.5rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-picker:hover {
  background: #e5e7eb;
}

/* Budget Input */
.budget-input {
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

/* Advanced Section CORRIGÉ */
.advanced-section {
  padding: 1.5rem;
  background: #f8fafc; /* Remplace bg-gray-50 */
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

/* Preview Section CORRIGÉ */
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

.preview-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.budget-display {
  font-weight: 500;
  color: #059669;
}

/* Form Actions */
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

.btn-outline:hover {
  background: #f9fafb; /* Remplace hover:bg-gray-50 */
}

/* Responsive */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .icon-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .color-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
