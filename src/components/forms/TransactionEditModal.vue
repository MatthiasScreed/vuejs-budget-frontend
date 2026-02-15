<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <span class="text-3xl">💰</span>
            </div>
            <div>
              <h2 class="text-3xl font-bold">
                {{ isEditing ? 'Modifier la transaction' : 'Nouvelle transaction' }}
              </h2>
              <p class="text-green-100 mt-1">Gérez vos finances précisément</p>
            </div>
          </div>
          <button @click="handleClose" class="text-white/80 hover:text-white">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Progress indicator -->
        <div class="mt-6" v-if="currentStep > 1 || form.progress > 0">
          <div class="flex items-center justify-between text-sm text-green-100 mb-2">
            <span>Progression</span>
            <span>{{ Math.round(form.progress) }}%</span>
          </div>
          <div class="w-full bg-white/20 rounded-full h-2">
            <div
              class="bg-white h-2 rounded-full transition-all duration-500"
              :style="{ width: `${form.progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Navigation steps -->
        <div class="flex items-center justify-center space-x-8 mt-6">
          <div
            v-for="(step, index) in TRANSACTION_STEPS"
            :key="step.id"
            class="flex items-center space-x-2"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
              :class="[
                currentStep >= index + 1
                  ? 'bg-white text-green-600'
                  : 'bg-white/20 text-white/60'
              ]"
            >
              {{ index + 1 }}
            </div>
            <span
              class="text-sm font-medium transition-all duration-300 hidden sm:block"
              :class="[
                currentStep >= index + 1
                  ? 'text-white'
                  : 'text-white/60'
              ]"
            >
              {{ step.title }}
            </span>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="form.submit" class="flex-1 overflow-hidden">
        <!-- Étape 1: Type et montant -->
        <div v-if="currentStep === 1" class="p-8 space-y-8">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900">💸 Type et montant</h3>
            <p class="text-gray-600 mt-2">Définissons la nature de cette transaction</p>
          </div>

          <!-- Templates rapides -->
          <div class="form-section">
            <h4 class="section-title">⚡ Actions rapides</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                v-for="template in QUICK_TEMPLATES"
                :key="template.id"
                type="button"
                @click="applyQuickTemplate(template)"
                class="quick-template-btn"
                :class="{ 'selected': selectedTemplate === template.id }"
              >
                <span class="text-xl">{{ template.icon }}</span>
                <span class="text-xs font-medium">{{ template.name }}</span>
                <span class="text-xs text-gray-500">{{ template.amount }}€</span>
              </button>
            </div>
          </div>

          <!-- Type de transaction -->
          <div class="form-section">
            <h4 class="section-title">⚡ Type de transaction</h4>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                @click="form.updateField('type', 'expense')"
                class="transaction-type-btn"
                :class="{ 'selected': form.values.type === 'expense' }"
              >
                <div class="type-icon expense">💸</div>
                <div class="type-content">
                  <h5 class="type-title">Dépense</h5>
                  <p class="type-desc">Argent qui sort</p>
                </div>
              </button>

              <button
                type="button"
                @click="form.updateField('type', 'income')"
                class="transaction-type-btn"
                :class="{ 'selected': form.values.type === 'income' }"
              >
                <div class="type-icon income">💰</div>
                <div class="type-content">
                  <h5 class="type-title">Revenu</h5>
                  <p class="type-desc">Argent qui entre</p>
                </div>
              </button>
            </div>
            <div v-if="form.getFieldError('type')" class="form-error mt-2">
              {{ form.getFieldError('type') }}
            </div>
          </div>

          <!-- Montant -->
          <div class="form-section">
            <h4 class="section-title">💶 Montant</h4>
            <div class="amount-input-container">
              <div class="currency-symbol">€</div>
              <input
                :value="form.values.amount"
                @input="form.updateField('amount', parseFloat(($event.target as HTMLInputElement).value) || 0)"
                type="number"
                step="0.01"
                min="0"
                max="999999.99"
                class="amount-input"
                :class="{ 'input-error': form.getFieldError('amount') }"
                placeholder="0.00"
              >
            </div>
            <div v-if="form.getFieldError('amount')" class="form-error">
              {{ form.getFieldError('amount') }}
            </div>

            <!-- Calculatrice rapide -->
            <div v-if="form.values.amount > 0" class="mt-4 p-4 bg-gray-50 rounded-xl">
              <h5 class="font-medium text-gray-900 mb-2">🔢 Équivalences</h5>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div class="text-center">
                  <div class="font-semibold text-blue-600">{{ (form.values.amount / 30).toFixed(2) }}€</div>
                  <div class="text-gray-500">par jour (30j)</div>
                </div>
                <div class="text-center">
                  <div class="font-semibold text-purple-600">{{ (form.values.amount / 4.33).toFixed(2) }}€</div>
                  <div class="text-gray-500">par semaine</div>
                </div>
                <div class="text-center">
                  <div class="font-semibold text-green-600">{{ (form.values.amount * 12).toFixed(2) }}€</div>
                  <div class="text-gray-500">par an</div>
                </div>
                <div class="text-center">
                  <div class="font-semibold text-orange-600">{{ ((form.values.amount / 2080) * 100).toFixed(1) }}%</div>
                  <div class="text-gray-500">du SMIC/h</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Étape 2: Description et catégorie -->
        <div v-if="currentStep === 2" class="p-8 space-y-8">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900">📝 Détails</h3>
            <p class="text-gray-600 mt-2">Décrivez et catégorisez cette transaction</p>
          </div>

          <!-- Description -->
          <div class="form-section">
            <h4 class="section-title">📝 Description</h4>
            <div class="space-y-4">
              <input
                :value="form.values.description"
                @input="form.updateField('description', ($event.target as HTMLInputElement).value)"
                type="text"
                class="form-input"
                :class="{ 'input-error': form.getFieldError('description') }"
                placeholder="ex: Course chez Carrefour, Salaire janvier..."
                maxlength="255"
              >
              <div v-if="form.getFieldError('description')" class="form-error">
                {{ form.getFieldError('description') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ form.values.description?.length || 0 }}/255 caractères
              </div>
            </div>

            <!-- Suggestions intelligentes -->
            <div v-if="descriptionSuggestions.length > 0" class="mt-4">
              <h5 class="text-sm font-medium text-gray-700 mb-2">💡 Suggestions</h5>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="suggestion in descriptionSuggestions"
                  :key="suggestion"
                  type="button"
                  @click="form.updateField('description', suggestion)"
                  class="suggestion-btn"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </div>

          <!-- Catégorie -->
          <div class="form-section">
            <h4 class="section-title">🗂️ Catégorie</h4>
            <div class="space-y-4">
              <!-- Catégories visuelles -->
              <div v-if="form.values.type" class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  v-for="category in filteredCategories"
                  :key="category.id"
                  type="button"
                  @click="form.updateField('category_id', category.id)"
                  class="category-btn"
                  :class="{ 'selected': form.values.category_id === category.id }"
                >
                  <div class="category-icon" :style="{ backgroundColor: category.color + '20' }">
                    {{ category.icon }}
                  </div>
                  <span class="category-name">{{ category.name }}</span>
                  <span v-if="category.monthly_budget" class="category-budget">
                    {{ formatCurrency(category.monthly_budget) }}/mois
                  </span>
                </button>
              </div>

              <!-- Select classique si aucune catégorie trouvée -->
              <select
                v-if="!form.values.category_id && filteredCategories.length === 0"
                :value="form.values.category_id"
                @change="form.updateField('category_id', parseInt(($event.target as HTMLSelectElement).value))"
                class="form-select"
                :class="{ 'input-error': form.getFieldError('category_id') }"
              >
                <option value="">Choisir une catégorie...</option>
                <option
                  v-for="category in categoryStore.categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.icon }} {{ category.name }}
                </option>
              </select>

              <div v-if="form.getFieldError('category_id')" class="form-error">
                {{ form.getFieldError('category_id') }}
              </div>

              <!-- Lien vers création de catégorie -->
              <div class="text-center">
                <button
                  type="button"
                  @click="$emit('create-category')"
                  class="create-category-btn"
                >
                  ➕ Créer une nouvelle catégorie
                </button>
              </div>
            </div>
          </div>

          <!-- Prévision budget -->
          <div v-if="selectedCategoryBudget" class="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h5 class="font-medium text-gray-900 mb-2">📊 Impact sur le budget</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Budget mensuel:</span>
                <span class="font-semibold ml-2">{{ formatCurrency(selectedCategoryBudget.monthly_budget) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Dépensé ce mois:</span>
                <span class="font-semibold ml-2">{{ formatCurrency(selectedCategoryBudget.spent_this_month) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Restant:</span>
                <span class="font-semibold ml-2" :class="remainingBudgetClass">
                  {{ formatCurrency(selectedCategoryBudget.remaining) }}
                </span>
              </div>
            </div>
            <div class="mt-3">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="budgetProgressClass"
                  :style="{ width: `${budgetUsagePercentage}%` }"
                ></div>
              </div>
              <div class="text-xs text-gray-500 mt-1 text-center">
                {{ budgetUsagePercentage }}% du budget utilisé
              </div>
            </div>
          </div>
        </div>

        <!-- Étape 3: Date et options -->
        <div v-if="currentStep === 3" class="p-8 space-y-8">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900">📅 Planification</h3>
            <p class="text-gray-600 mt-2">Date et options avancées</p>
          </div>

          <!-- Date et heure -->
          <div class="form-section">
            <h4 class="section-title">📅 Date et heure</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label for="date" class="form-label required">Date</label>
                <input
                  id="date"
                  :value="form.values.date"
                  @input="form.updateField('date', ($event.target as HTMLInputElement).value)"
                  type="date"
                  class="form-input"
                  :class="{ 'input-error': form.getFieldError('date') }"
                  :max="today"
                >
                <div v-if="form.getFieldError('date')" class="form-error">
                  {{ form.getFieldError('date') }}
                </div>
              </div>

              <div class="form-group">
                <label for="time" class="form-label">Heure (optionnel)</label>
                <input
                  id="time"
                  :value="form.values.time"
                  @input="form.updateField('time', ($event.target as HTMLInputElement).value)"
                  type="time"
                  class="form-input"
                >
              </div>
            </div>

            <!-- Raccourcis de date -->
            <div class="flex flex-wrap gap-2 mt-4">
              <button
                v-for="shortcut in DATE_SHORTCUTS"
                :key="shortcut.label"
                type="button"
                @click="form.updateField('date', shortcut.date)"
                class="date-shortcut-btn"
              >
                {{ shortcut.label }}
              </button>
            </div>
          </div>

          <!-- Lieu et notes -->
          <div class="form-section">
            <h4 class="section-title">📍 Informations complémentaires</h4>
            <div class="space-y-4">
              <div class="form-group">
                <label for="location" class="form-label">📍 Lieu (optionnel)</label>
                <input
                  id="location"
                  :value="form.values.location"
                  @input="form.updateField('location', ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="form-input"
                  placeholder="ex: Carrefour Villeneuve, Virement en ligne..."
                  maxlength="100"
                >
              </div>

              <div class="form-group">
                <label for="notes" class="form-label">📝 Notes (optionnel)</label>
                <textarea
                  id="notes"
                  :value="form.values.notes"
                  @input="form.updateField('notes', ($event.target as HTMLTextAreaElement).value)"
                  class="form-textarea"
                  rows="3"
                  placeholder="Informations supplémentaires..."
                  maxlength="500"
                ></textarea>
                <div class="text-xs text-gray-500 mt-1">
                  {{ form.values.notes?.length || 0 }}/500 caractères
                </div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="form-section">
            <h4 class="section-title">🏷️ Tags</h4>
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in form.values.tags || []"
                  :key="tag"
                  class="tag-item"
                >
                  {{ tag }}
                  <button
                    type="button"
                    @click="removeTag(tag)"
                    class="tag-remove"
                  >
                    ×
                  </button>
                </span>
              </div>

              <div class="flex gap-2">
                <input
                  v-model="newTag"
                  @keyup.enter="addTag"
                  type="text"
                  class="form-input flex-1"
                  placeholder="Ajouter un tag..."
                  maxlength="20"
                >
                <button
                  type="button"
                  @click="addTag"
                  class="action-button secondary"
                >
                  Ajouter
                </button>
              </div>

              <!-- Tags suggérés -->
              <div v-if="suggestedTags.length > 0">
                <h5 class="text-sm font-medium text-gray-700 mb-2">💡 Tags suggérés</h5>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="tag in suggestedTags"
                    :key="tag"
                    type="button"
                    @click="addSuggestedTag(tag)"
                    class="suggested-tag-btn"
                  >
                    {{ tag }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Options avancées -->
          <div class="form-section">
            <h4 class="section-title">⚙️ Options</h4>
            <div class="space-y-4">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  :checked="form.values.is_recurring"
                  @change="form.updateField('is_recurring', ($event.target as HTMLInputElement).checked)"
                  type="checkbox"
                  class="form-checkbox"
                >
                <div>
                  <span class="text-sm font-medium text-gray-700">🔄 Transaction récurrente</span>
                  <p class="text-xs text-gray-600">Cette transaction se répète régulièrement</p>
                </div>
              </label>

              <div v-if="form.values.is_recurring" class="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Fréquence</label>
                  <select
                    :value="form.values.recurring_frequency"
                    @change="form.updateField('recurring_frequency', ($event.target as HTMLSelectElement).value)"
                    class="form-select"
                  >
                    <option value="">Choisir...</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                    <option value="quarterly">Trimestrielle</option>
                    <option value="yearly">Annuelle</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Fin de récurrence</label>
                  <input
                    :value="form.values.recurring_end_date"
                    @input="form.updateField('recurring_end_date', ($event.target as HTMLInputElement).value)"
                    type="date"
                    class="form-input"
                    :min="form.values.date"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button
                v-if="currentStep > 1"
                type="button"
                @click="previousStep"
                class="action-button secondary"
                :disabled="form.isSubmitting"
              >
                ← Précédent
              </button>
              <div v-else></div>
            </div>

            <div class="text-center">
              <div class="text-sm text-gray-500 mb-1">Étape {{ currentStep }} sur {{ TRANSACTION_STEPS.length }}</div>
              <div class="flex space-x-2">
                <div
                  v-for="step in TRANSACTION_STEPS"
                  :key="step.id"
                  class="w-2 h-2 rounded-full"
                  :class="[
                    currentStep >= step.id ? 'bg-green-500' : 'bg-gray-300'
                  ]"
                ></div>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <button
                type="button"
                @click="handleClose"
                class="action-button secondary"
                :disabled="form.isSubmitting"
              >
                Annuler
              </button>

              <button
                v-if="currentStep < TRANSACTION_STEPS.length"
                type="button"
                @click="nextStep"
                :disabled="!canProceedToNext"
                class="action-button primary"
              >
                Suivant →
              </button>

              <button
                v-else
                type="submit"
                :disabled="!form.isValid || form.isSubmitting"
                class="action-button primary"
              >
                <div v-if="form.isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {{ isEditing ? '✅ Modifier' : '💰 Créer' }}
              </button>
            </div>
          </div>
        </div>
      </form>

      <!-- Erreur générale -->
      <div v-if="form.submitError" class="mx-8 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-sm text-red-700">{{ form.submitError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useForm } from '@/composables/ui/useForm.ts'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useGamingStore } from '@/stores/gamingStore'
import type { Transaction, CreateTransactionData, Category } from '@/types'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  visible?: boolean
  transaction?: Transaction
  mode?: 'create' | 'edit'
}

interface Emits {
  close: []
  success: [transaction: Transaction]
  'create-category': []
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'create'
})

const emit = defineEmits<Emits>()

// ==========================================
// STORES
// ==========================================

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const gamingStore = useGamingStore()

// ==========================================
// CONSTANTS
// ==========================================

const TRANSACTION_STEPS = [
  { id: 1, title: 'Type & Montant' },
  { id: 2, title: 'Détails' },
  { id: 3, title: 'Options' }
] as const

const QUICK_TEMPLATES = [
  { id: 'coffee', name: 'Café', icon: '☕', amount: 3.50, type: 'expense', category: 'food' },
  { id: 'lunch', name: 'Déjeuner', icon: '🍽️', amount: 12, type: 'expense', category: 'food' },
  { id: 'gas', name: 'Essence', icon: '⛽', amount: 50, type: 'expense', category: 'transport' },
  { id: 'salary', name: 'Salaire', icon: '💰', amount: 2500, type: 'income', category: 'salary' },
  { id: 'grocery', name: 'Courses', icon: '🛒', amount: 45, type: 'expense', category: 'food' },
  { id: 'cinema', name: 'Cinéma', icon: '🎬', amount: 10, type: 'expense', category: 'entertainment' }
] as const

const DATE_SHORTCUTS = [
  { label: "Aujourd'hui", date: new Date().toISOString().split('T')[0] },
  { label: 'Hier', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { label: 'Il y a 2 jours', date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
  { label: 'Début du mois', date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0] }
] as const

// ==========================================
// REACTIVE STATE
// ==========================================

const currentStep = ref(1)
const selectedTemplate = ref<string | null>(null)
const newTag = ref('')

// Computed properties
const isEditing = computed(() => props.mode === 'edit' && !!props.transaction)
const today = computed(() => new Date().toISOString().split('T')[0])

const filteredCategories = computed(() => {
  if (!form.values.type) return []
  return categoryStore.categories.filter(cat =>
    cat.type === form.values.type || cat.type === 'both'
  ).slice(0, 9) // Limiter à 9 pour l'affichage en grille
})

const descriptionSuggestions = computed(() => {
  if (!form.values.type || !form.values.category_id) return []

  // Suggestions basées sur le type et la catégorie
  const suggestions: Record<string, string[]> = {
    'food': ['Courses Carrefour', 'Restaurant', 'Boulangerie', 'Livraison'],
    'transport': ['Essence Total', 'Métro', 'Uber', 'Péage autoroute'],
    'entertainment': ['Cinéma', 'Concert', 'Streaming Netflix', 'Livre Amazon'],
    'salary': ['Salaire janvier', 'Prime', 'Heures supplémentaires']
  }

  const category = categoryStore.categories.find(c => c.id === form.values.category_id)
  return suggestions[category?.slug || ''] || []
})

const selectedCategoryBudget = computed(() => {
  if (!form.values.category_id) return null

  const category = categoryStore.categories.find(c => c.id === form.values.category_id)
  if (!category?.monthly_budget) return null

  // Simulation des données - à remplacer par les vraies données du store
  const spent_this_month = Math.random() * category.monthly_budget * 0.8
  const remaining = category.monthly_budget - spent_this_month

  return {
    monthly_budget: category.monthly_budget,
    spent_this_month,
    remaining
  }
})

const budgetUsagePercentage = computed(() => {
  if (!selectedCategoryBudget.value) return 0
  return Math.round((selectedCategoryBudget.value.spent_this_month / selectedCategoryBudget.value.monthly_budget) * 100)
})

const budgetProgressClass = computed(() => {
  const percentage = budgetUsagePercentage.value
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 75) return 'bg-orange-500'
  if (percentage >= 50) return 'bg-yellow-500'
  return 'bg-green-500'
})

const remainingBudgetClass = computed(() => {
  if (!selectedCategoryBudget.value) return ''
  return selectedCategoryBudget.value.remaining < 0 ? 'text-red-600' : 'text-green-600'
})

const suggestedTags = computed(() => {
  const baseTags = ['urgent', 'prévu', 'exceptionnel', 'personnel', 'professionnel']
  if (form.values.type === 'expense') {
    return [...baseTags, 'nécessaire', 'plaisir', 'imprévu']
  }
  return [...baseTags, 'bonus', 'récurrent', 'ponctuel']
})

const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return form.values.type &&
        form.values.amount > 0 &&
        !form.getFieldError('type') &&
        !form.getFieldError('amount')
    case 2:
      return form.values.description?.trim() &&
        form.values.category_id &&
        !form.getFieldError('description') &&
        !form.getFieldError('category_id')
    default:
      return true
  }
})

// ==========================================
// FORM SETUP
// ==========================================

const initialValues: CreateTransactionData = {
  type: props.transaction?.type || '',
  amount: props.transaction?.amount || 0,
  description: props.transaction?.description || '',
  category_id: props.transaction?.category_id || null,
  date: props.transaction?.date || today.value,
  time: props.transaction?.time || '',
  location: props.transaction?.location || '',
  notes: props.transaction?.notes || '',
  tags: props.transaction?.tags || [],
  is_recurring: props.transaction?.is_recurring || false,
  recurring_frequency: props.transaction?.recurring_frequency || '',
  recurring_end_date: props.transaction?.recurring_end_date || ''
}

const form = useForm({
  initialValues,
  validationRules: {
    type: (value: string) => {
      if (!value) return 'Le type de transaction est obligatoire'
      if (!['income', 'expense'].includes(value)) return 'Type invalide'
      return null
    },
    amount: (value: number) => {
      if (!value || value <= 0) return 'Le montant doit être positif'
      if (value > 999999.99) return 'Montant trop élevé (max 999,999€)'
      return null
    },
    description: (value: string) => {
      if (!value?.trim()) return 'La description est obligatoire'
      if (value.length < 3) return 'Minimum 3 caractères'
      if (value.length > 255) return 'Maximum 255 caractères'
      return null
    },
    category_id: (value: number | null) => {
      if (!value) return 'La catégorie est obligatoire'
      return null
    },
    date: (value: string) => {
      if (!value) return 'La date est obligatoire'
      const date = new Date(value)
      const today = new Date()
      if (date > today) return 'La date ne peut pas être dans le futur'
      return null
    }
  },
  formatters: {
    amount: (value: number) => Math.round(value * 100) / 100,
    description: (value: string) => value?.trim()
  },
  onSubmit: handleFormSubmit,
  onSuccess: handleFormSuccess,
  gamingEnabled: true,
  cacheKey: isEditing.value ? `transaction-edit-${props.transaction?.id}` : 'transaction-create'
})

// ==========================================
// METHODS
// ==========================================

/**
 * Naviguer vers l'étape suivante
 */
function nextStep(): void {
  if (currentStep.value < TRANSACTION_STEPS.length && canProceedToNext.value) {
    currentStep.value++
  }
}

/**
 * Naviguer vers l'étape précédente
 */
function previousStep(): void {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

/**
 * Appliquer un template rapide
 */
function applyQuickTemplate(template: typeof QUICK_TEMPLATES[0]): void {
  selectedTemplate.value = template.id

  form.updateField('type', template.type)
  form.updateField('amount', template.amount)
  form.updateField('description', template.name)

  // Trouver la catégorie correspondante
  const category = categoryStore.categories.find(c =>
    c.slug === template.category || c.name.toLowerCase().includes(template.category)
  )
  if (category) {
    form.updateField('category_id', category.id)
  }
}

/**
 * Ajouter un tag
 */
function addTag(): void {
  const tag = newTag.value.trim()
  if (tag && !form.values.tags?.includes(tag)) {
    const currentTags = form.values.tags || []
    form.updateField('tags', [...currentTags, tag])
    newTag.value = ''
  }
}

/**
 * Ajouter un tag suggéré
 */
function addSuggestedTag(tag: string): void {
  if (!form.values.tags?.includes(tag)) {
    const currentTags = form.values.tags || []
    form.updateField('tags', [...currentTags, tag])
  }
}

/**
 * Supprimer un tag
 */
function removeTag(tagToRemove: string): void {
  const currentTags = form.values.tags || []
  form.updateField('tags', currentTags.filter(tag => tag !== tagToRemove))
}

/**
 * Gérer le clic sur l'overlay
 */
function handleOverlayClick(): void {
  handleClose()
}

/**
 * Fermer le modal avec confirmation si nécessaire
 */
function handleClose(): void {
  if (form.isDirty) {
    if (confirm('Voulez-vous vraiment fermer ? Les modifications non sauvegardées seront perdues.')) {
      form.clearCache()
      emit('close')
    }
  } else {
    emit('close')
  }
}

/**
 * Soumission du formulaire
 */
async function handleFormSubmit(data: CreateTransactionData) {
  try {
    // Nettoyer les données
    const cleanData = {
      ...data,
      time: data.time || null,
      location: data.location?.trim() || null,
      notes: data.notes?.trim() || null,
      tags: data.tags?.filter(tag => tag.trim()) || [],
      recurring_frequency: data.is_recurring ? data.recurring_frequency : null,
      recurring_end_date: data.is_recurring ? data.recurring_end_date : null
    }

    if (isEditing.value && props.transaction) {
      return await transactionStore.updateTransaction(props.transaction.id, cleanData)
    } else {
      return await transactionStore.createTransaction(cleanData)
    }
  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
    throw error
  }
}

/**
 * Gérer le succès de la soumission
 */
function handleFormSuccess(response: any): void {
  const transaction = response.data

  emit('success', transaction)

  // Notifications gaming différenciées
  if (isEditing.value) {
    gamingStore.showNotification('✅ Transaction modifiée avec succès !', 'success')
  } else {
    const xpBonus = form.values.amount > 100 ? 20 : 10
    gamingStore.showNotification(`💰 Transaction créée ! +${xpBonus} XP`, 'success')
  }

  emit('close')
}

/**
 * Formater la devise
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// ==========================================
// WATCHERS
// ==========================================

// Réinitialiser à l'étape 1 quand le modal s'ouvre/ferme
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    currentStep.value = 1
    selectedTemplate.value = null
  }
})

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Charger les catégories si nécessaire
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories()
  }
})

onUnmounted(() => {
  form.cleanup()
})
</script>

<style scoped>
/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden;
}

/* Sections */
.form-section {
  @apply bg-gray-50 rounded-xl p-6 border border-gray-100;
}

.section-title {
  @apply text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2;
}

/* Form elements */
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-label.required::after {
  content: ' *';
  @apply text-red-500;
}

.form-input, .form-select, .form-textarea {
  @apply w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200;
}

.form-input::placeholder, .form-textarea::placeholder {
  @apply placeholder-gray-500;
}

.input-error {
  @apply border-red-500 bg-red-50;
}

.form-error {
  @apply text-sm text-red-600 mt-1 flex items-center;
}

.form-error::before {
  content: '⚠️';
  @apply mr-1;
}

.form-checkbox {
  @apply h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded;
}

.form-group {
  @apply space-y-1;
}

/* Quick templates */
.quick-template-btn {
  @apply p-3 border-2 border-gray-200 rounded-xl hover:border-green-500 transition-all duration-200 text-center bg-white flex flex-col items-center space-y-1;
}

.quick-template-btn.selected {
  @apply border-green-500 bg-green-50 ring-2 ring-green-200;
}

/* Transaction type buttons */
.transaction-type-btn {
  @apply p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 transition-all duration-200 bg-white flex items-center space-x-4;
}

.transaction-type-btn.selected {
  @apply border-green-500 bg-green-50 ring-2 ring-green-200;
}

.type-icon {
  @apply w-16 h-16 rounded-xl flex items-center justify-center text-2xl;
}

.type-icon.expense {
  @apply bg-red-100;
}

.type-icon.income {
  @apply bg-green-100;
}

.type-title {
  @apply text-xl font-bold text-gray-900;
}

.type-desc {
  @apply text-sm text-gray-600;
}

/* Amount input */
.amount-input-container {
  @apply relative flex items-center;
}

.currency-symbol {
  @apply absolute left-4 text-lg font-semibold text-gray-600 z-10;
}

.amount-input {
  @apply w-full pl-12 pr-4 py-4 text-2xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200;
}

/* Category buttons */
.category-btn {
  @apply p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 transition-all duration-200 bg-white flex flex-col items-center space-y-2 text-center;
}

.category-btn.selected {
  @apply border-green-500 bg-green-50 ring-2 ring-green-200;
}

.category-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center text-xl;
}

.category-name {
  @apply font-medium text-gray-900 text-sm;
}

.category-budget {
  @apply text-xs text-gray-500;
}

/* Buttons */
.action-button {
  @apply px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2;
}

.action-button.primary {
  @apply bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.action-button.secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300;
}

/* Suggestions */
.suggestion-btn {
  @apply px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors;
}

.create-category-btn {
  @apply text-green-600 hover:text-green-700 text-sm font-medium;
}

/* Date shortcuts */
.date-shortcut-btn {
  @apply px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors;
}

/* Tags */
.tag-item {
  @apply inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm;
}

.tag-remove {
  @apply ml-2 text-purple-600 hover:text-purple-800 font-bold;
}

.suggested-tag-btn {
  @apply px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 transition-colors;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    @apply m-2 max-h-[98vh];
  }

  .quick-template-btn {
    @apply p-2;
  }

  .transaction-type-btn {
    @apply p-4 flex-col text-center space-x-0 space-y-2;
  }

  .type-icon {
    @apply w-12 h-12;
  }
}
</style>
