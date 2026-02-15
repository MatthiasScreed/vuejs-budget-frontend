<template>
  <div class="goal-form-container">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header avec progrès -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <span class="text-3xl">🎯</span>
            </div>
            <div>
              <h2 class="text-3xl font-bold">
                {{ isEditing ? 'Modifier l\'objectif' : 'Nouvel objectif financier' }}
              </h2>
              <p class="text-blue-100 mt-1">Définissez et atteignez vos rêves financiers</p>
            </div>
          </div>
          <button @click="handleClose" class="text-white/80 hover:text-white">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Steps indicator -->
        <div class="flex items-center space-x-4 mt-8">
          <div
            v-for="(step, index) in FORM_STEPS"
            :key="step.id"
            class="flex items-center"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
              :class="[
                currentStep >= index + 1
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white/60'
              ]"
            >
              {{ index + 1 }}
            </div>
            <span
              class="ml-2 text-sm font-medium transition-all duration-300"
              :class="[
                currentStep >= index + 1
                  ? 'text-white'
                  : 'text-white/60'
              ]"
            >
              {{ step.title }}
            </span>
            <div v-if="index < FORM_STEPS.length - 1" class="w-8 h-px bg-white/20 ml-4"></div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mt-6">
          <div class="w-full bg-white/20 rounded-full h-2">
            <div
              class="bg-white h-2 rounded-full transition-all duration-500"
              :style="{ width: `${(currentStep / FORM_STEPS.length) * 100}%` }"
            ></div>
          </div>
          <div class="text-xs text-white/80 mt-2 text-right">
            {{ currentStep }}/{{ FORM_STEPS.length }} étapes complétées
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="form.submit" class="p-8">
        <!-- Étape 1: Informations de base -->
        <div v-if="currentStep === 1" class="space-y-8">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900">📋 Informations de base</h3>
            <p class="text-gray-600 mt-2">Commençons par définir votre objectif</p>
          </div>

          <!-- Template Selection -->
          <div class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-4">
              🎪 Choisir un template (optionnel)
            </label>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <button
                v-for="template in GOAL_TEMPLATES"
                :key="template.id"
                type="button"
                @click="applyTemplate(template)"
                class="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-colors text-center"
                :class="{ 'border-purple-500 bg-purple-50': selectedTemplate === template.id }"
              >
                <span class="text-2xl block mb-2">{{ template.icon }}</span>
                <span class="text-sm font-medium block">{{ template.name }}</span>
                <span class="text-xs text-gray-500 block mt-1">{{ template.suggestedAmount }}€</span>
              </button>
            </div>
          </div>

          <!-- Nom et catégorie -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label for="name" class="form-label required">
                🏷️ Nom de l'objectif
              </label>
              <input
                id="name"
                :value="form.values.name"
                @input="form.updateField('name', ($event.target as HTMLInputElement).value)"
                type="text"
                class="form-input"
                :class="{ 'input-error': form.getFieldError('name') }"
                placeholder="ex: Voyage en Thaïlande"
                maxlength="100"
              >
              <div v-if="form.getFieldError('name')" class="form-error">
                {{ form.getFieldError('name') }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ form.values.name?.length || 0 }}/100 caractères
              </div>
            </div>

            <div class="form-group">
              <label for="category" class="form-label required">
                📂 Catégorie
              </label>
              <select
                id="category"
                :value="form.values.category"
                @change="form.updateField('category', ($event.target as HTMLSelectElement).value)"
                class="form-select"
                :class="{ 'input-error': form.getFieldError('category') }"
              >
                <option value="">Choisir une catégorie</option>
                <option
                  v-for="cat in GOAL_CATEGORIES"
                  :key="cat.value"
                  :value="cat.value"
                >
                  {{ cat.icon }} {{ cat.label }}
                </option>
              </select>
              <div v-if="form.getFieldError('category')" class="form-error">
                {{ form.getFieldError('category') }}
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" class="form-label">
              📝 Description détaillée
            </label>
            <textarea
              id="description"
              :value="form.values.description"
              @input="form.updateField('description', ($event.target as HTMLTextAreaElement).value)"
              class="form-textarea"
              placeholder="Décrivez votre objectif en détail..."
              rows="4"
              maxlength="500"
            ></textarea>
            <div class="text-xs text-gray-500 mt-1">
              {{ form.values.description?.length || 0 }}/500 caractères
            </div>
          </div>
        </div>

        <!-- Étape 2: Montants et dates -->
        <div v-if="currentStep === 2" class="space-y-8">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900">💰 Montants et échéances</h3>
            <p class="text-gray-600 mt-2">Définissons les aspects financiers</p>
          </div>

          <!-- Montants -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label for="target_amount" class="form-label required">
                🎯 Montant cible
              </label>
              <div class="relative">
                <input
                  id="target_amount"
                  :value="form.values.target_amount"
                  @input="form.updateField('target_amount', parseFloat(($event.target as HTMLInputElement).value) || 0)"
                  type="number"
                  step="0.01"
                  min="1"
                  max="9999999.99"
                  class="form-input pr-8"
                  :class="{ 'input-error': form.getFieldError('target_amount') }"
                  placeholder="0.00"
                >
                <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              </div>
              <div v-if="form.getFieldError('target_amount')" class="form-error">
                {{ form.getFieldError('target_amount') }}
              </div>
            </div>

            <div class="form-group">
              <label for="current_amount" class="form-label">
                💵 Montant déjà épargné
              </label>
              <div class="relative">
                <input
                  id="current_amount"
                  :value="form.values.current_amount"
                  @input="form.updateField('current_amount', parseFloat(($event.target as HTMLInputElement).value) || 0)"
                  type="number"
                  step="0.01"
                  min="0"
                  :max="form.values.target_amount"
                  class="form-input pr-8"
                  placeholder="0.00"
                >
                <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="form.values.target_amount > 0" class="bg-gray-50 rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Progression actuelle</span>
              <span class="text-sm font-bold text-purple-600">{{ progressPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                :style="{ width: Math.min(progressPercentage, 100) + '%' }"
              ></div>
            </div>
            <div class="flex items-center justify-between mt-2 text-xs text-gray-600">
              <span>{{ formatCurrency(form.values.current_amount || 0) }}</span>
              <span>{{ formatCurrency(form.values.target_amount) }}</span>
            </div>
            <div v-if="remainingAmount > 0" class="text-center mt-3">
              <span class="text-sm text-gray-600">Il reste à épargner: </span>
              <span class="font-semibold text-purple-600">{{ formatCurrency(remainingAmount) }}</span>
            </div>
          </div>

          <!-- Date et priorité -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label for="target_date" class="form-label required">
                📅 Date cible
              </label>
              <input
                id="target_date"
                :value="form.values.target_date"
                @input="form.updateField('target_date', ($event.target as HTMLInputElement).value)"
                type="date"
                :min="tomorrow"
                class="form-input"
                :class="{ 'input-error': form.getFieldError('target_date') }"
              >
              <div v-if="form.getFieldError('target_date')" class="form-error">
                {{ form.getFieldError('target_date') }}
              </div>
              <div v-if="monthsRemaining > 0" class="text-xs text-gray-500 mt-1">
                ⏰ {{ monthsRemaining }} mois restants
              </div>
            </div>

            <div class="form-group">
              <label for="priority" class="form-label required">
                🏆 Priorité
              </label>
              <select
                id="priority"
                :value="form.values.priority"
                @change="form.updateField('priority', ($event.target as HTMLSelectElement).value)"
                class="form-select"
                :class="{ 'input-error': form.getFieldError('priority') }"
              >
                <option value="">Choisir la priorité</option>
                <option
                  v-for="priority in PRIORITY_OPTIONS"
                  :key="priority.value"
                  :value="priority.value"
                >
                  {{ priority.icon }} {{ priority.label }}
                </option>
              </select>
              <div v-if="form.getFieldError('priority')" class="form-error">
                {{ form.getFieldError('priority') }}
              </div>
            </div>
          </div>

          <!-- Calcul automatique de l'épargne mensuelle -->
          <div v-if="monthlyTargetSuggestion > 0" class="bg-blue-50 rounded-xl p-6">
            <h4 class="font-medium text-gray-900 mb-2">💡 Suggestion d'épargne</h4>
            <p class="text-sm text-gray-600 mb-3">
              Pour atteindre votre objectif à temps, vous devriez épargner environ:
            </p>
            <div class="text-center">
              <span class="text-2xl font-bold text-blue-600">
                {{ formatCurrency(monthlyTargetSuggestion) }}
              </span>
              <span class="text-sm text-gray-600 ml-2">par mois</span>
            </div>
          </div>
        </div>

        <!-- Étape 3: Automatisation -->
        <div v-if="currentStep === 3" class="space-y-8">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900">🤖 Automatisation et suivi</h3>
            <p class="text-gray-600 mt-2">Configurez l'épargne automatique</p>
          </div>

          <!-- Auto-contribution -->
          <div class="bg-blue-50 rounded-xl p-6">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                :checked="form.values.auto_contribute"
                @change="form.updateField('auto_contribute', ($event.target as HTMLInputElement).checked)"
                type="checkbox"
                class="form-checkbox"
              >
              <div>
                <span class="text-sm font-semibold text-gray-900">🔄 Épargne automatique</span>
                <p class="text-xs text-gray-600">Effectuer des virements automatiques vers cet objectif</p>
              </div>
            </label>

            <div v-if="form.values.auto_contribute" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div class="form-group">
                <label for="contribution_amount" class="form-label required">
                  💶 Montant par contribution
                </label>
                <div class="relative">
                  <input
                    id="contribution_amount"
                    :value="form.values.contribution_amount"
                    @input="form.updateField('contribution_amount', parseFloat(($event.target as HTMLInputElement).value) || 0)"
                    type="number"
                    step="0.01"
                    min="1"
                    class="form-input pr-8"
                    placeholder="0.00"
                  >
                  <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>

              <div class="form-group">
                <label for="contribution_frequency" class="form-label required">
                  🗓️ Fréquence
                </label>
                <select
                  id="contribution_frequency"
                  :value="form.values.contribution_frequency"
                  @change="form.updateField('contribution_frequency', ($event.target as HTMLSelectElement).value)"
                  class="form-select"
                >
                  <option value="">Choisir la fréquence</option>
                  <option
                    v-for="freq in FREQUENCY_OPTIONS"
                    :key="freq.value"
                    :value="freq.value"
                  >
                    {{ freq.icon }} {{ freq.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Estimation -->
            <div v-if="contributionEstimate" class="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <h4 class="font-medium text-gray-900 mb-2">📊 Estimation de progression</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Épargne par mois:</span>
                  <span class="font-semibold ml-2">{{ formatCurrency(contributionEstimate.monthlyAmount) }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Objectif atteint en:</span>
                  <span class="font-semibold ml-2">{{ contributionEstimate.completionMonths }} mois</span>
                </div>
              </div>
              <div class="mt-2 text-xs text-gray-500">
                <span v-if="contributionEstimate.completionMonths <= monthsRemaining" class="text-green-600">
                  ✅ Vous atteindrez votre objectif {{ monthsRemaining - contributionEstimate.completionMonths }} mois à l'avance !
                </span>
                <span v-else class="text-orange-600">
                  ⚠️ Avec ce rythme, vous aurez {{ contributionEstimate.completionMonths - monthsRemaining }} mois de retard
                </span>
              </div>
            </div>
          </div>

          <!-- Catégories liées -->
          <div v-if="categoryStore.categories.length > 0" class="form-group">
            <label class="form-label">
              🔗 Catégories liées (optionnel)
            </label>
            <p class="text-xs text-gray-600 mb-3">
              Sélectionnez les catégories qui contribuent automatiquement à cet objectif
            </p>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
              <label
                v-for="category in categoryStore.categories"
                :key="category.id"
                class="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  :checked="form.values.linked_categories?.includes(category.id)"
                  @change="toggleLinkedCategory(category.id)"
                  type="checkbox"
                  class="form-checkbox"
                >
                <span class="text-sm">{{ category.icon }} {{ category.name }}</span>
              </label>
            </div>
          </div>

          <!-- Options avancées -->
          <div class="space-y-4">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                :checked="form.values.is_public"
                @change="form.updateField('is_public', ($event.target as HTMLInputElement).checked)"
                type="checkbox"
                class="form-checkbox"
              >
              <div>
                <span class="text-sm font-medium text-gray-700">🌟 Objectif public</span>
                <p class="text-xs text-gray-600">Partager avec la communauté pour motivation</p>
              </div>
            </label>

            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                :checked="form.values.reminder_enabled"
                @change="form.updateField('reminder_enabled', ($event.target as HTMLInputElement).checked)"
                type="checkbox"
                class="form-checkbox"
              >
              <div>
                <span class="text-sm font-medium text-gray-700">🔔 Rappels activés</span>
                <p class="text-xs text-gray-600">Recevoir des notifications de suivi</p>
              </div>
            </label>

            <div v-if="form.values.reminder_enabled" class="ml-6">
              <select
                :value="form.values.reminder_frequency"
                @change="form.updateField('reminder_frequency', ($event.target as HTMLSelectElement).value)"
                class="form-select w-48"
              >
                <option value="weekly">📅 Rappel hebdomadaire</option>
                <option value="monthly">📆 Rappel mensuel</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between pt-8 border-t border-gray-200">
          <button
            v-if="currentStep > 1"
            type="button"
            @click="previousStep"
            class="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span>Précédent</span>
          </button>
          <div v-else></div>

          <div class="flex items-center space-x-3">
            <button
              type="button"
              @click="handleClose"
              class="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
              :disabled="form.isSubmitting"
            >
              Annuler
            </button>

            <button
              v-if="currentStep < FORM_STEPS.length"
              type="button"
              @click="nextStep"
              :disabled="!canProceedToNext"
              class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Suivant</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <button
              v-else
              type="submit"
              :disabled="!form.isValid || form.isSubmitting"
              class="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <div v-if="form.isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{{ isEditing ? '✅ Modifier l\'objectif' : '🎯 Créer l\'objectif' }}</span>
            </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useForm } from '@/composables/ui/useForm'
import { useGoalStore } from '@/stores/goalStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useGamingStore } from '@/stores/gamingStore'
import type { FinancialGoal, CreateGoalData } from '@/types'

// ==========================================
// PROPS & EMITS
// ==========================================

interface Props {
  goal?: FinancialGoal
  mode?: 'create' | 'edit'
}

interface Emits {
  close: []
  success: [goal: FinancialGoal]
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<Emits>()

// ==========================================
// STORES
// ==========================================

const goalStore = useGoalStore()
const categoryStore = useCategoryStore()
const gamingStore = useGamingStore()

// ==========================================
// CONSTANTS
// ==========================================

const FORM_STEPS = [
  { id: 1, title: 'Informations' },
  { id: 2, title: 'Montants' },
  { id: 3, title: 'Automatisation' }
] as const

const GOAL_TEMPLATES = [
  {
    id: 'emergency',
    name: 'Fonds d\'urgence',
    icon: '🆘',
    suggestedAmount: 5000,
    category: 'emergency',
    priority: 'high',
    description: 'Constituez une réserve de sécurité pour faire face aux imprévus'
  },
  {
    id: 'vacation',
    name: 'Vacances',
    icon: '🏖️',
    suggestedAmount: 2000,
    category: 'vacation',
    priority: 'medium',
    description: 'Économisez pour vos prochaines vacances de rêve'
  },
  {
    id: 'house',
    name: 'Apport maison',
    icon: '🏠',
    suggestedAmount: 30000,
    category: 'house',
    priority: 'high',
    description: 'Constituez votre apport pour l\'achat immobilier'
  },
  {
    id: 'car',
    name: 'Voiture',
    icon: '🚗',
    suggestedAmount: 15000,
    category: 'car',
    priority: 'medium',
    description: 'Économisez pour l\'achat de votre nouvelle voiture'
  },
  {
    id: 'wedding',
    name: 'Mariage',
    icon: '💒',
    suggestedAmount: 12000,
    category: 'other',
    priority: 'high',
    description: 'Préparez le plus beau jour de votre vie'
  }
] as const

const GOAL_CATEGORIES = [
  { value: 'emergency', label: 'Fonds d\'urgence', icon: '🆘' },
  { value: 'vacation', label: 'Vacances', icon: '🏖️' },
  { value: 'house', label: 'Immobilier', icon: '🏠' },
  { value: 'car', label: 'Voiture', icon: '🚗' },
  { value: 'investment', label: 'Investissement', icon: '📈' },
  { value: 'education', label: 'Éducation', icon: '🎓' },
  { value: 'debt', label: 'Remboursement dette', icon: '💳' },
  { value: 'other', label: 'Autre', icon: '🎁' }
] as const

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Faible - Quand c\'est possible', icon: '🟢' },
  { value: 'medium', label: 'Moyenne - Important mais pas urgent', icon: '🟡' },
  { value: 'high', label: 'Haute - Très important et urgent', icon: '🔴' }
] as const

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Chaque semaine', icon: '📅' },
  { value: 'monthly', label: 'Chaque mois', icon: '📆' },
  { value: 'quarterly', label: 'Chaque trimestre', icon: '🗓️' }
] as const

// ==========================================
// REACTIVE STATE
// ==========================================

const currentStep = ref(1)
const selectedTemplate = ref<string | null>(null)
const loading = ref(false)

// Computed properties
const isEditing = computed(() => props.mode === 'edit' && !!props.goal)
const tomorrow = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
})

// ==========================================
// FORM SETUP
// ==========================================

const initialValues: CreateGoalData = {
  name: props.goal?.name || '',
  description: props.goal?.description || '',
  target_amount: props.goal?.target_amount || 0,
  current_amount: props.goal?.current_amount || 0,
  target_date: props.goal?.target_date || '',
  category: props.goal?.category || '',
  priority: props.goal?.priority || '',
  auto_contribute: false,
  contribution_amount: 0,
  contribution_frequency: '',
  linked_categories: [],
  is_public: false,
  reminder_enabled: true,
  reminder_frequency: 'monthly'
}

const form = useForm({
  initialValues,
  validationRules: {
    name: (value: string) => {
      if (!value?.trim()) return 'Le nom est obligatoire'
      if (value.length < 3) return 'Minimum 3 caractères'
      if (value.length > 100) return 'Maximum 100 caractères'
      return null
    },
    category: (value: string) => {
      if (!value) return 'La catégorie est obligatoire'
      return null
    },
    target_amount: (value: number) => {
      if (!value || value <= 0) return 'Le montant cible est obligatoire'
      if (value > 9999999.99) return 'Montant trop élevé (max 9,999,999€)'
      return null
    },
    target_date: (value: string) => {
      if (!value) return 'La date cible est obligatoire'
      const targetDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (targetDate <= today) return 'La date doit être dans le futur'
      return null
    },
    priority: (value: string) => {
      if (!value) return 'La priorité est obligatoire'
      return null
    }
  },
  formatters: {
    target_amount: (value: number) => Math.round(value * 100) / 100,
    current_amount: (value: number) => Math.round(value * 100) / 100,
    contribution_amount: (value: number) => Math.round(value * 100) / 100
  },
  onSubmit: handleFormSubmit,
  onSuccess: handleFormSuccess,
  gamingEnabled: true,
  cacheKey: isEditing.value ? `goal-edit-${props.goal?.id}` : 'goal-create',
  resetOnSubmit: !isEditing.value
})

// ==========================================
// COMPUTED PROPERTIES
// ==========================================

const progressPercentage = computed(() => {
  const target = form.values.target_amount || 0
  const current = form.values.current_amount || 0
  return target > 0 ? Math.round((current / target) * 100) : 0
})

const remainingAmount = computed(() => {
  const target = form.values.target_amount || 0
  const current = form.values.current_amount || 0
  return Math.max(0, target - current)
})

const monthsRemaining = computed(() => {
  if (!form.values.target_date) return 0
  const target = new Date(form.values.target_date)
  const now = new Date()
  const diffTime = target.getTime() - now.getTime()
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
  return Math.max(0, diffMonths)
})

const monthlyTargetSuggestion = computed(() => {
  const remaining = remainingAmount.value
  const months = monthsRemaining.value
  return months > 0 ? Math.ceil(remaining / months) : 0
})

const contributionEstimate = computed(() => {
  const amount = form.values.contribution_amount || 0
  const frequency = form.values.contribution_frequency

  if (!amount || !frequency) return null

  let monthlyAmount = 0
  switch (frequency) {
    case 'weekly':
      monthlyAmount = amount * 4.33 // Semaines moyennes par mois
      break
    case 'monthly':
      monthlyAmount = amount
      break
    case 'quarterly':
      monthlyAmount = amount / 3
      break
  }

  const remaining = remainingAmount.value
  const completionMonths = remaining > 0 ? Math.ceil(remaining / monthlyAmount) : 0

  return {
    monthlyAmount,
    completionMonths
  }
})

const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return form.values.name?.trim() &&
        form.values.category &&
        !form.getFieldError('name') &&
        !form.getFieldError('category')
    case 2:
      return form.values.target_amount > 0 &&
        form.values.target_date &&
        form.values.priority &&
        !form.getFieldError('target_amount') &&
        !form.getFieldError('target_date') &&
        !form.getFieldError('priority')
    default:
      return true
  }
})

// ==========================================
// METHODS
// ==========================================

/**
 * Naviguer vers l'étape suivante
 */
function nextStep(): void {
  if (currentStep.value < FORM_STEPS.length && canProceedToNext.value) {
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
 * Appliquer un template
 */
function applyTemplate(template: typeof GOAL_TEMPLATES[0]): void {
  selectedTemplate.value = template.id

  form.updateField('name', template.name)
  form.updateField('category', template.category)
  form.updateField('priority', template.priority)
  form.updateField('target_amount', template.suggestedAmount)
  form.updateField('description', template.description)
}

/**
 * Gérer la sélection des catégories liées
 */
function toggleLinkedCategory(categoryId: number): void {
  const current = form.values.linked_categories || []
  const index = current.indexOf(categoryId)

  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(categoryId)
  }

  form.updateField('linked_categories', [...current])
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
async function handleFormSubmit(data: CreateGoalData) {
  loading.value = true

  try {
    if (isEditing.value && props.goal) {
      // Mode édition
      return await goalStore.updateGoal(props.goal.id, data)
    } else {
      // Mode création
      return await goalStore.createGoal(data)
    }
  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
    throw error
  } finally {
    loading.value = false
  }
}

/**
 * Gérer le succès de la soumission
 */
function handleFormSuccess(response: any): void {
  const goal = response.data

  // Émettre l'événement de succès
  emit('success', goal)

  // Afficher un message de succès via le gaming store
  if (isEditing.value) {
    gamingStore.showNotification('✅ Objectif modifié avec succès !', 'success')
  } else {
    gamingStore.showNotification('🎯 Nouvel objectif créé ! +25 XP', 'success')
  }

  // Fermer le modal
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
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Charger les catégories si nécessaire
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories()
  }
})

onUnmounted(() => {
  // Nettoyer le formulaire
  form.cleanup()
})
</script>

<style scoped>
/* Styles pour les éléments de formulaire */
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-label.required::after {
  content: ' *';
  @apply text-red-500;
}

.form-input, .form-select, .form-textarea {
  @apply w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200;
}

.form-input::placeholder, .form-textarea::placeholder {
  @apply placeholder-gray-500;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  @apply shadow-lg;
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
  @apply h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded;
}

.form-group {
  @apply space-y-1;
}

/* Animation pour les transitions entre étapes */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Styles pour la progress bar personnalisée */
.progress-bar {
  @apply relative overflow-hidden rounded-full bg-gray-200;
}

.progress-bar::after {
  content: '';
  @apply absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent;
  width: 30%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(333%); }
}
</style>
