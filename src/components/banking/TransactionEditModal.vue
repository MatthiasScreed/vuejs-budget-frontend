<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="border-b border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900 flex items-center">
            ✏️ Modifier la transaction
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenu scrollable -->
      <div class="overflow-y-auto max-h-[60vh] p-6">
        <form @submit.prevent="save" class="space-y-6">
          <!-- Informations de base -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
              📄 Informations originales
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Banque:</span>
                <span class="ml-2 font-medium">{{ transaction.bank_connection?.bank_name }}</span>
              </div>
              <div>
                <span class="text-gray-600">Date:</span>
                <span class="ml-2 font-medium">{{ formatDate(transaction.transaction_date) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Montant:</span>
                <span class="ml-2 font-bold" :class="transaction.amount > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(Math.abs(transaction.amount)) }}
                </span>
              </div>
              <div>
                <span class="text-gray-600">Référence:</span>
                <span class="ml-2 font-mono text-xs text-gray-500">{{ transaction.external_id.slice(0, 12) }}...</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              v-model="form.description"
              type="text"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="transaction.description"
            />
            <p class="text-xs text-gray-500 mt-1">
              Description originale: "{{ transaction.description }}"
            </p>
          </div>

          <!-- Catégorie -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              v-model="form.category_id"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choisir une catégorie</option>
              <optgroup
                v-for="group in categoriesByType"
                :key="group.type"
                :label="group.type === 'income' ? 'Revenus' : 'Dépenses'"
              >
                <option
                  v-for="category in group.categories"
                  :key="category.id"
                  :value="category.id"
                  class="flex items-center"
                >
                  {{ category.icon }} {{ category.name }}
                </option>
              </optgroup>
            </select>

            <!-- Suggestion IA si disponible -->
            <div v-if="transaction.suggested_category && transaction.confidence_score"
                 class="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center text-sm">
                  <span class="text-blue-600">🤖 Suggestion IA:</span>
                  <span class="ml-2 font-medium">{{ transaction.suggested_category.name }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-blue-500">{{ Math.round(transaction.confidence_score * 100) }}%</span>
                  <button
                    type="button"
                    @click="applySuggestion"
                    class="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Utiliser
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Division de transaction -->
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-gray-900 flex items-center">
                ✂️ Division de transaction
              </h4>
              <button
                type="button"
                @click="toggleSplitMode"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {{ splitMode ? 'Annuler division' : 'Diviser la transaction' }}
              </button>
            </div>

            <div v-if="splitMode" class="space-y-3">
              <p class="text-sm text-gray-600">
                Divisez cette transaction en plusieurs catégories. Le montant total doit égaler {{ formatCurrency(Math.abs(transaction.amount)) }}.
              </p>

              <div
                v-for="(split, index) in form.splits"
                :key="index"
                class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <input
                  v-model.number="split.amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  :max="Math.abs(transaction.amount)"
                  placeholder="Montant"
                  class="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                />

                <select
                  v-model="split.category_id"
                  class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">Choisir catégorie</option>
                  <option
                    v-for="category in availableCategories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>

                <button
                  type="button"
                  @click="removeSplit(index)"
                  class="text-red-500 hover:text-red-700"
                  :disabled="form.splits.length <= 1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>

              <div class="flex items-center justify-between">
                <button
                  type="button"
                  @click="addSplit"
                  class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Ajouter une division
                </button>

                <div class="text-sm">
                  <span class="text-gray-600">Total:</span>
                  <span
                    class="ml-2 font-bold"
                    :class="splitTotal === Math.abs(transaction.amount) ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ formatCurrency(splitTotal) }}
                  </span>
                  <span class="text-gray-500 ml-1">
                    / {{ formatCurrency(Math.abs(transaction.amount)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes additionnelles -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ajouter des notes sur cette transaction..."
            ></textarea>
          </div>
        </form>
      </div>

      <!-- Footer avec actions -->
      <div class="border-t border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Les modifications seront appliquées immédiatement
            </span>
          </div>

          <div class="flex space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              @click="save"
              :disabled="!canSave"
              class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import type { BankTransaction } from '@/services/bankService'

// Props & Emits
const props = defineProps<{
  transaction: BankTransaction
  categories: any[]
}>()

const emit = defineEmits<{
  save: [transaction: any]
  close: []
}>()

// State
const saving = ref(false)
const splitMode = ref(false)

const form = reactive({
  description: '',
  category_id: '',
  notes: '',
  splits: [
    { amount: 0, category_id: '' }
  ]
})

// Computed
const availableCategories = computed(() => props.categories || [])

const categoriesByType = computed(() => {
  const transactionType = props.transaction.amount > 0 ? 'income' : 'expense'
  const relevant = props.categories.filter(c =>
    c.type === transactionType || c.type === 'both'
  )

  return [
    {
      type: transactionType,
      categories: relevant
    }
  ]
})

const splitTotal = computed(() => {
  return form.splits.reduce((sum, split) => sum + (split.amount || 0), 0)
})

const canSave = computed(() => {
  if (splitMode.value) {
    // Mode division : vérifier que total = montant original et toutes les catégories sélectionnées
    const allSplitsValid = form.splits.every(split =>
      split.amount > 0 && split.category_id
    )
    const totalMatches = Math.abs(splitTotal.value - Math.abs(props.transaction.amount)) < 0.01
    return allSplitsValid && totalMatches
  } else {
    // Mode simple : description et catégorie requis
    return form.description.trim().length > 0 && form.category_id
  }
})

// Lifecycle
onMounted(() => {
  // Pré-remplir le formulaire
  form.description = props.transaction.formatted_description || props.transaction.description
  form.category_id = props.transaction.suggested_category?.id || ''
  form.splits[0].amount = Math.abs(props.transaction.amount)
})

// Methods
function applySuggestion() {
  if (props.transaction.suggested_category) {
    form.category_id = props.transaction.suggested_category.id
  }
}

function toggleSplitMode() {
  splitMode.value = !splitMode.value

  if (splitMode.value) {
    // Reset splits
    form.splits = [
      { amount: Math.abs(props.transaction.amount), category_id: form.category_id }
    ]
  } else {
    // Reset à mode simple
    form.splits = [{ amount: 0, category_id: '' }]
  }
}

function addSplit() {
  form.splits.push({ amount: 0, category_id: '' })
}

function removeSplit(index: number) {
  if (form.splits.length > 1) {
    form.splits.splice(index, 1)
  }
}

async function save() {
  if (!canSave.value) return

  saving.value = true

  try {
    const saveData = {
      ...props.transaction,
      description: form.description,
      category_id: form.category_id,
      notes: form.notes,
      is_split: splitMode.value,
      splits: splitMode.value ? form.splits : null
    }

    emit('save', saveData)

  } catch (error) {
    console.error('Erreur sauvegarde:', error)
  } finally {
    saving.value = false
  }
}

// Utilitaires
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
/* Animation pour l'ouverture du modal */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content {
  animation: modalSlideIn 0.2s ease-out;
}

/* Style pour les splits */
.split-item {
  transition: background-color 0.2s;
}

.split-item:hover {
  background-color: rgb(249 250 251);
}
</style>
