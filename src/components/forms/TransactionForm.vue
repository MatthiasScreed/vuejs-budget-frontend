<template>
  <div style="background-color: white; border-radius: 0.75rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 42rem; width: 100%;">
    <!-- Header -->
    <div style="background: linear-gradient(to right, #059669, #2563eb); color: white; padding: 2rem; border-radius: 0.75rem 0.75rem 0 0;">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div style="width: 3rem; height: 3rem; background-color: rgba(255, 255, 255, 0.2); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 1.5rem;">💰</span>
          </div>
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 700;">
              {{ isEditing ? 'Modifier la transaction' : 'Nouvelle transaction' }}
            </h2>
            <p style="color: rgba(255, 255, 255, 0.8); margin-top: 0.25rem;">Gérez vos finances précisément</p>
          </div>
        </div>
        <button
          @click="handleClose"
          style="color: rgba(255, 255, 255, 0.8); background: none; border: none; cursor: pointer; padding: 0.5rem;"
          title="Fermer"
        >
          <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Form Content -->
    <form @submit.prevent="handleSubmit" style="padding: 2rem;">
      <!-- Type de transaction -->
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 1rem;">⚡ Type de transaction</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <button
            type="button"
            @click="formData.type = 'expense'"
            class="transaction-type-btn"
            :class="{ 'selected': formData.type === 'expense' }"
          >
            <div style="width: 3rem; height: 3rem; background-color: #fee2e2; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">💸</div>
            <div>
              <h5 style="font-size: 1.125rem; font-weight: 700; color: #111827;">Dépense</h5>
              <p style="font-size: 0.875rem; color: #5b6270;">Argent qui sort</p>
            </div>
          </button>

          <button
            type="button"
            @click="formData.type = 'income'"
            class="transaction-type-btn"
            :class="{ 'selected': formData.type === 'income' }"
          >
            <div style="width: 3rem; height: 3rem; background-color: #dcfce7; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">💰</div>
            <div>
              <h5 style="font-size: 1.125rem; font-weight: 700; color: #111827;">Revenu</h5>
              <p style="font-size: 0.875rem; color: #5b6270;">Argent qui entre</p>
            </div>
          </button>
        </div>
        <div v-if="errors.type" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem;">
          ⚠️ {{ errors.type }}
        </div>
      </div>

      <!-- Montant -->
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 1rem;">💶 Montant</h3>
        <div style="position: relative;">
          <div style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1.125rem; font-weight: 600; color: #4b5563;">€</div>
          <input
            v-model.number="formData.amount"
            type="number"
            step="0.01"
            min="0"
            max="999999.99"
            style="width: 100%; padding: 1rem; padding-left: 3rem; font-size: 1.25rem; font-weight: 700; border: 1px solid #d1d5db; border-radius: 0.75rem; outline: none;"
            :style="{ borderColor: errors.amount ? '#dc2626' : '#d1d5db', backgroundColor: errors.amount ? '#fef2f2' : 'white' }"
            placeholder="0.00"
          >
        </div>
        <div v-if="errors.amount" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem;">
          ⚠️ {{ errors.amount }}
        </div>
      </div>

      <!-- Description -->
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 1rem;">📝 Description</h3>
        <input
          v-model="formData.description"
          type="text"
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.75rem; outline: none;"
          :style="{ borderColor: errors.description ? '#dc2626' : '#d1d5db', backgroundColor: errors.description ? '#fef2f2' : 'white' }"
          placeholder="ex: Courses chez Carrefour, Salaire janvier..."
          maxlength="255"
        >
        <div style="font-size: 0.75rem; color: #5b6270; margin-top: 0.25rem;">
          {{ formData.description?.length || 0 }}/255 caractères
        </div>
        <div v-if="errors.description" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem;">
          ⚠️ {{ errors.description }}
        </div>
      </div>

      <!-- Catégorie -->
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 1rem;">🗂️ Catégorie</h3>
        <select
          v-model="formData.category_id"
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.75rem; outline: none;"
          :style="{ borderColor: errors.category_id ? '#dc2626' : '#d1d5db', backgroundColor: errors.category_id ? '#fef2f2' : 'white' }"
        >
          <option value="">Choisir une catégorie...</option>
          <option
            v-for="category in filteredCategories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.icon }} {{ category.name }}
          </option>
        </select>
        <div v-if="errors.category_id" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem;">
          ⚠️ {{ errors.category_id }}
        </div>

        <!-- Lien vers création de catégorie -->
        <div style="text-align: center; margin-top: 0.75rem;">
          <button
            type="button"
            @click="handleCreateCategory"
            style="color: #059669; background: none; border: none; cursor: pointer; text-decoration: underline; font-size: 0.875rem;"
          >
            ➕ Créer une nouvelle catégorie
          </button>
        </div>
      </div>

      <!-- Date -->
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 1rem;">📅 Date</h3>
        <input
          v-model="formData.transaction_date"
          type="date"
          style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.75rem; outline: none;"
          :style="{ borderColor: errors.transaction_date ? '#dc2626' : '#d1d5db' }"
          :max="today"
        >
        <div v-if="errors.transaction_date" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem;">
          ⚠️ {{ errors.transaction_date }}
        </div>
      </div>

      <!-- Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
        <button
          type="button"
          @click="handleClose"
          style="padding: 0.75rem 1.5rem; background-color: #f3f4f6; color: #374151; border: none; border-radius: 0.75rem; cursor: pointer; font-weight: 500;"
          :disabled="isSubmitting"
        >
          Annuler
        </button>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <!-- Aperçu du montant -->
          <div v-if="formData.amount > 0" style="text-align: right;">
            <div style="font-size: 0.875rem; color: #5b6270;">Aperçu:</div>
            <div
              style="font-weight: 700; font-size: 1.125rem;"
              :style="{ color: formData.type === 'income' ? '#059669' : '#dc2626' }"
            >
              {{ formatAmount() }}
            </div>
          </div>

          <button
            type="submit"
            :disabled="!isFormValid || isSubmitting"
            style="padding: 0.75rem 1.5rem; background: linear-gradient(to right, #059669, #2563eb); color: white; border: none; border-radius: 0.75rem; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;"
            :style="{ opacity: (!isFormValid || isSubmitting) ? 0.5 : 1, cursor: (!isFormValid || isSubmitting) ? 'not-allowed' : 'pointer' }"
          >
            <div v-if="isSubmitting" style="width: 1rem; height: 1rem; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            {{ isEditing ? '✅ Modifier' : '💰 Créer' }}
          </button>
        </div>
      </div>
    </form>

    <!-- Erreur générale -->
    <div v-if="submitError" style="margin: 0 2rem 2rem; padding: 1rem; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.75rem;">
      <div class="flex items-center">
        <svg style="width: 1.25rem; height: 1.25rem; color: #dc2626; margin-right: 0.5rem;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        <span style="font-size: 0.875rem; color: #b91c1c;">{{ submitError }}</span>
      </div>
    </div>
  </div>

  <!-- Ajouter après le formulaire, avant la fermeture du template -->
  <Teleport to="body">
    <div
      v-if="showCategoryModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      @click.self="closeCategoryModal"
    >
      <div class="w-full max-width-28rem">
        <CategoryForm
          :default-type="categoryDefaultType"
          @save="saveCategory"
          @close="closeCategoryModal"
          @cancel="closeCategoryModal"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import CategoryForm from '@/components/forms/CategoryForm.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useCategoryModal } from '@/composables/ui/useCategoryModal'


// ==========================================
// PROPS & EMITS
// ==========================================

const props = defineProps({
  transaction: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  },
  defaultType: {
    type: String,
    default: 'expense'
  }
})

// ✅ CORRECTION: Déclaration correcte des événements
const emit = defineEmits(['save', 'close', 'create-category'])

// ==========================================
// STATE RÉACTIF
// ==========================================

const formData = ref({
  type: props.defaultType,
  amount: 0,
  description: '',
  category_id: null,
  transaction_date: new Date().toISOString().split('T')[0]
})

const errors = ref({})
const isSubmitting = ref(false)
const submitError = ref('')

const {
  showCategoryModal,
  openCategoryModal,
  closeCategoryModal,
  handleCategorySave: saveCategory
} = useCategoryModal()

// ==========================================
// COMPUTED
// ==========================================

const isEditing = computed(() => !!props.transaction)
const today = computed(() => new Date().toISOString().split('T')[0])

const filteredCategories = computed(() => {
  if (!formData.value.type) return props.categories
  return props.categories.filter(cat =>
    cat.type === formData.value.type || cat.type === 'both'
  )
})

const isFormValid = computed(() => {
  return !!(
    formData.value.type &&
    formData.value.amount > 0 &&
    formData.value.description?.trim() &&
    formData.value.category_id &&
    formData.value.transaction_date &&
    Object.keys(errors.value).length === 0
  )
})

// ==========================================
// METHODS
// ==========================================

function formatAmount() {
  const sign = formData.value.type === 'income' ? '+' : '-'
  return `${sign}${formData.value.amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} €`
}

function validateForm() {
  errors.value = {}

  // Type
  if (!formData.value.type) {
    errors.value.type = 'Le type de transaction est obligatoire'
  }

  // Montant
  if (!formData.value.amount || formData.value.amount <= 0) {
    errors.value.amount = 'Le montant doit être supérieur à 0'
  }

  // Description
  if (!formData.value.description?.trim()) {
    errors.value.description = 'La description est obligatoire'
  } else if (formData.value.description.length > 255) {
    errors.value.description = 'Maximum 255 caractères'
  }

  // Catégorie
  if (!formData.value.category_id) {
    errors.value.category_id = 'La catégorie est obligatoire'
  }

  // Date
  if (!formData.value.transaction_date) {
    errors.value.transaction_date = 'La date est obligatoire'
  } else if (new Date(formData.value.transaction_date) > new Date()) {
    errors.value.transaction_date = 'La date ne peut pas être dans le futur'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    // Créer l'objet transaction
    const transaction = {
      id: props.transaction?.id || Date.now(),
      ...formData.value,
      created_at: props.transaction?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // ✅ CORRECTION: Émettre correctement l'événement
    emit('save', transaction)

    if (!isEditing.value) {
      resetForm()
    }

  } catch (error) {
    console.error('Erreur:', error)
    submitError.value = error.message || 'Une erreur est survenue'
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  formData.value = {
    type: props.defaultType,
    amount: 0,
    description: '',
    category_id: null,
    transaction_date: new Date().toISOString().split('T')[0]
  }
  errors.value = {}
}

// ✅ CORRECTION: Fonctions pour émettre les événements
function handleClose() {
  emit('close')
}

function handleCreateCategory() {
  const defaultType = formData.value.type || 'expense'
  openCategoryModal(defaultType, (newCategory) => {
    // Auto-sélectionner la nouvelle catégorie
    formData.value.category_id = newCategory.id

    // Ajouter à la liste locale
    if (!props.categories.find(c => c.id === newCategory.id)) {
      props.categories.push(newCategory)
    }
  })
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  if (props.transaction) {
    formData.value = {
      type: props.transaction.type,
      amount: props.transaction.amount,
      description: props.transaction.description || '',
      category_id: props.transaction.category_id,
      transaction_date: props.transaction.transaction_date
    }
  }
})

// Watcher pour reset catégorie si type change
watch(() => formData.value.type, () => {
  if (formData.value.category_id) {
    const category = props.categories.find(c => c.id === formData.value.category_id)
    if (category && category.type !== formData.value.type && category.type !== 'both') {
      formData.value.category_id = null
    }
  }
})
</script>

<style scoped>
/* Transaction type buttons */
.transaction-type-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.transaction-type-btn:hover {
  border-color: #059669;
}

.transaction-type-btn.selected {
  border-color: #059669;
  background-color: #f0fdf4;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

/* Utilities */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

/* Spin animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
