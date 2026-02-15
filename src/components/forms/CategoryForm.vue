<template>
  <div class="category-form">
    <!-- Header -->
    <div class="form-header">
      <div class="header-info">
        <div class="header-icon" :style="{ backgroundColor: formData.color + '20' }">
          <span>{{ formData.icon || '🗂️' }}</span>
        </div>
        <div>
          <h2 class="form-title">
            {{ isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
          </h2>
          <p class="form-subtitle">Organisez vos finances intelligemment</p>
        </div>
      </div>
      <button @click="$emit('close')" class="close-btn" type="button">✕</button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="form-body">
      <!-- Nom et Type -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">📝 Nom de la catégorie</label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ error: errors.name }"
            placeholder="ex: Courses alimentaires"
            maxlength="100"
          />
          <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          <span class="char-count">{{ formData.name?.length || 0 }}/100</span>
        </div>

        <div class="form-group">
          <label class="form-label required">⚡ Type</label>
          <div class="type-selector">
            <button
              type="button"
              @click="formData.type = 'expense'"
              class="type-btn"
              :class="{ selected: formData.type === 'expense', expense: true }"
            >
              💸 Dépense
            </button>
            <button
              type="button"
              @click="formData.type = 'income'"
              class="type-btn"
              :class="{ selected: formData.type === 'income', income: true }"
            >
              💰 Revenu
            </button>
          </div>
          <span v-if="errors.type" class="error-text">{{ errors.type }}</span>
        </div>
      </div>

      <!-- Icône et Couleur -->
      <div class="form-row">
        <!-- Icône -->
        <div class="form-group">
          <label class="form-label">🎨 Icône</label>
          <button type="button" @click="showIconPicker = !showIconPicker" class="picker-trigger">
            <span class="picker-preview">{{ formData.icon || '📁' }}</span>
            <span class="picker-text">Choisir une icône</span>
            <span class="picker-arrow">{{ showIconPicker ? '▲' : '▼' }}</span>
          </button>

          <!-- Icon Picker Dropdown -->
          <div v-if="showIconPicker" class="picker-dropdown">
            <div class="picker-grid icons">
              <button
                v-for="icon in availableIcons"
                :key="icon"
                type="button"
                @click="selectIcon(icon)"
                class="picker-item"
                :class="{ selected: formData.icon === icon }"
              >
                {{ icon }}
              </button>
            </div>
          </div>
        </div>

        <!-- Couleur -->
        <div class="form-group">
          <label class="form-label">🎨 Couleur</label>
          <button type="button" @click="showColorPicker = !showColorPicker" class="picker-trigger">
            <span class="color-preview" :style="{ backgroundColor: formData.color }"></span>
            <span class="picker-text">{{ formData.color }}</span>
            <span class="picker-arrow">{{ showColorPicker ? '▲' : '▼' }}</span>
          </button>

          <!-- Color Picker Dropdown -->
          <div v-if="showColorPicker" class="picker-dropdown">
            <div class="picker-grid colors">
              <button
                v-for="color in presetColors"
                :key="color"
                type="button"
                @click="selectColor(color)"
                class="color-item"
                :class="{ selected: formData.color === color }"
                :style="{ backgroundColor: color }"
              >
                <span v-if="formData.color === color" class="check">✓</span>
              </button>
            </div>

            <!-- Custom Color Input -->
            <div class="custom-color">
              <label>Couleur personnalisée:</label>
              <div class="custom-color-input">
                <input type="color" v-model="formData.color" class="color-input-native" />
                <input
                  type="text"
                  v-model="formData.color"
                  class="color-input-text"
                  placeholder="#000000"
                  pattern="^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="form-label">📄 Description (optionnelle)</label>
        <textarea
          v-model="formData.description"
          class="form-textarea"
          placeholder="Décrivez cette catégorie..."
          rows="2"
          maxlength="500"
        ></textarea>
        <span class="char-count">{{ formData.description?.length || 0 }}/500</span>
      </div>

      <!-- Budget limite -->
      <div class="form-group">
        <label class="form-label">💰 Budget limite mensuel (optionnel)</label>
        <div class="input-with-suffix">
          <input
            v-model.number="formData.budget_limit"
            type="number"
            class="form-input"
            placeholder="500"
            min="0"
            step="1"
          />
          <span class="input-suffix">€</span>
        </div>
        <span class="help-text">Laissez vide pour ne pas définir de limite</span>
      </div>

      <!-- Options avancées -->
      <div class="advanced-section">
        <h3 class="section-title">⚙️ Options avancées</h3>

        <label class="checkbox-wrapper">
          <input v-model="formData.is_active" type="checkbox" class="checkbox-input" />
          <span class="checkbox-label">Catégorie active</span>
          <span class="checkbox-hint">(Les catégories inactives sont masquées)</span>
        </label>
      </div>

      <!-- Aperçu -->
      <div v-if="isPreviewValid" class="preview-section">
        <h3 class="section-title">👁️ Aperçu</h3>
        <div class="preview-card">
          <div class="preview-icon" :style="{ backgroundColor: formData.color + '20' }">
            <span>{{ formData.icon || '📁' }}</span>
          </div>
          <div class="preview-content">
            <h4 class="preview-name">{{ formData.name }}</h4>
            <div class="preview-meta">
              <span class="preview-type" :class="formData.type">
                {{ formData.type === 'income' ? '💰 Revenu' : '💸 Dépense' }}
              </span>
              <span v-if="formData.budget_limit" class="preview-budget">
                Budget: {{ formData.budget_limit }}€
              </span>
            </div>
            <p v-if="formData.description" class="preview-desc">{{ formData.description }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn btn-outline">🔄 Réinitialiser</button>
        <div class="actions-right">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Annuler</button>
          <button type="submit" :disabled="!isFormValid || loading" class="btn btn-primary">
            <span v-if="loading">⏳ Enregistrement...</span>
            <span v-else>{{ isEditing ? '✅ Modifier' : '➕ Créer' }}</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'

// Props & Emits
interface Props {
  category?: any
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  category: null,
  isEditing: false,
})

const emit = defineEmits<{
  save: [data: any]
  close: []
}>()

// Store
const categoryStore = useCategoryStore()

// State
const loading = ref(false)
const showIconPicker = ref(false)
const showColorPicker = ref(false)
const errors = reactive<Record<string, string>>({})

const formData = reactive({
  name: '',
  type: 'expense' as 'income' | 'expense',
  icon: '📁',
  color: '#3B82F6',
  description: '',
  budget_limit: null as number | null,
  is_active: true,
})

// Constants
const availableIcons = [
  '🛒',
  '🍔',
  '🏠',
  '🚗',
  '⛽',
  '🎬',
  '🎮',
  '👕',
  '💊',
  '📱',
  '✈️',
  '🎓',
  '💼',
  '🏋️',
  '🎁',
  '📚',
  '🔧',
  '💡',
  '📦',
  '🎵',
  '💰',
  '💵',
  '🏦',
  '💳',
  '📈',
  '🎯',
  '⭐',
  '❤️',
  '🔥',
  '✨',
]

const presetColors = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#EAB308',
  '#84CC16',
  '#22C55E',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#0EA5E9',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#D946EF',
  '#EC4899',
  '#F43F5E',
  '#78716C',
  '#5b6270',
  '#1F2937',
]

// Computed
const isPreviewValid = computed(() => {
  return formData.name?.trim().length >= 2
})

const isFormValid = computed(() => {
  return formData.name?.trim().length >= 2 && formData.type
})

// Methods
function selectIcon(icon: string) {
  formData.icon = icon
  showIconPicker.value = false
}

function selectColor(color: string) {
  formData.color = color
  showColorPicker.value = false
}

function validate(): boolean {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!formData.name?.trim()) {
    errors.name = 'Le nom est requis'
  } else if (formData.name.length < 2) {
    errors.name = 'Minimum 2 caractères'
  }

  if (!formData.type) {
    errors.type = 'Le type est requis'
  }

  return Object.keys(errors).length === 0
}

function resetForm() {
  formData.name = ''
  formData.type = 'expense'
  formData.icon = '📁'
  formData.color = '#3B82F6'
  formData.description = ''
  formData.budget_limit = null
  formData.is_active = true
  Object.keys(errors).forEach((key) => delete errors[key])
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true

  try {
    const categoryData = {
      name: formData.name.trim(),
      type: formData.type,
      icon: formData.icon,
      color: formData.color,
      description: formData.description?.trim() || null,
      budget_limit: formData.budget_limit || null,
      is_active: formData.is_active,
    }

    console.log('💾 Submitting category:', categoryData)

    let success = false

    if (props.isEditing && props.category?.id) {
      success = await categoryStore.updateCategory(props.category.id, categoryData)
    } else {
      success = await categoryStore.createCategory(categoryData)
    }

    if (success) {
      // ✅ FERMER LE MODAL ET RAFRAÎCHIR
      emit('close')
      await categoryStore.fetchCategories()
    }
  } catch (error) {
    console.error('❌ Submit error:', error)
  } finally {
    loading.value = false
  }
}

function loadCategory(category: any) {
  if (!category) return

  formData.name = category.name || ''
  formData.type = category.type || 'expense'
  formData.icon = category.icon || '📁'
  formData.color = category.color || '#3B82F6'
  formData.description = category.description || ''
  formData.budget_limit = category.budget_limit || null
  formData.is_active = category.is_active !== false
}

// Close pickers when clicking outside
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.form-group')) {
    showIconPicker.value = false
    showColorPicker.value = false
  }
}

// Watchers
watch(
  () => props.category,
  (newCat) => {
    if (newCat) {
      loadCategory(newCat)
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  console.log('🗂️ CategoryForm mounted')
  document.addEventListener('click', handleClickOutside)

  if (props.category) {
    loadCategory(props.category)
  }
})
</script>

<style scoped>
.category-form {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  max-width: 32rem;
  width: 100%;
}

/* Header */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
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
  background: rgba(255, 255, 255, 0.2);
}
.form-title {
  font-size: 1.25rem;
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
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Form Body */
.form-body {
  padding: 1.5rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Form Groups */
.form-group {
  margin-bottom: 1.25rem;
  position: relative;
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
  transition: all 0.2s;
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
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
.form-input.error {
  border-color: #ef4444;
}
.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}
.char-count {
  font-size: 0.75rem;
  color: #8c939f;
  text-align: right;
  display: block;
  margin-top: 0.25rem;
}
.help-text {
  font-size: 0.75rem;
  color: #5b6270;
  margin-top: 0.25rem;
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

/* Type Selector */
.type-selector {
  display: flex;
  gap: 0.5rem;
}
.type-btn {
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
.type-btn:hover {
  border-color: #8c939f;
}
.type-btn.selected.expense {
  border-color: #ef4444;
  background: #fef2f2;
  color: #dc2626;
}
.type-btn.selected.income {
  border-color: #22c55e;
  background: #f0fdf4;
  color: #16a34a;
}

/* Picker Trigger */
.picker-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}
.picker-trigger:hover {
  border-color: #8b5cf6;
}
.picker-preview {
  font-size: 1.5rem;
}
.color-preview {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.picker-text {
  flex: 1;
  text-align: left;
  color: #374151;
}
.picker-arrow {
  color: #8c939f;
  font-size: 0.75rem;
}

/* Picker Dropdown */
.picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 20;
  padding: 0.75rem;
  margin-top: 0.25rem;
}
.picker-grid {
  display: grid;
  gap: 0.5rem;
}
.picker-grid.icons {
  grid-template-columns: repeat(6, 1fr);
}
.picker-grid.colors {
  grid-template-columns: repeat(5, 1fr);
}
.picker-item {
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.picker-item:hover {
  border-color: #8b5cf6;
  transform: scale(1.1);
}
.picker-item.selected {
  border-color: #8b5cf6;
  background: #f3e8ff;
}

.color-item {
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.color-item:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.color-item.selected {
  border-color: #1f2937;
}
.color-item .check {
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Custom Color */
.custom-color {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}
.custom-color label {
  display: block;
  font-size: 0.75rem;
  color: #5b6270;
  margin-bottom: 0.5rem;
}
.custom-color-input {
  display: flex;
  gap: 0.5rem;
}
.color-input-native {
  width: 3rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
}
.color-input-text {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-family: monospace;
}

/* Advanced Section */
.advanced-section {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
}
.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem;
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
  accent-color: #8b5cf6;
}
.checkbox-label {
  font-weight: 500;
  color: #374151;
}
.checkbox-hint {
  font-size: 0.75rem;
  color: #5b6270;
}

/* Preview */
.preview-section {
  background: linear-gradient(135deg, #f3e8ff, #fce7f3);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
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
  font-size: 1.5rem;
  flex-shrink: 0;
}
.preview-content {
  flex: 1;
  min-width: 0;
}
.preview-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}
.preview-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
.preview-type {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
}
.preview-type.income {
  background: #dcfce7;
  color: #166534;
}
.preview-type.expense {
  background: #fee2e2;
  color: #991b1b;
}
.preview-budget {
  color: #5b6270;
}
.preview-desc {
  font-size: 0.875rem;
  color: #5b6270;
  margin: 0.5rem 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
.actions-right {
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
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
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
