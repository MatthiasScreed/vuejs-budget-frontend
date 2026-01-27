/**
* 💰 MoneyInput.vue - Champ de montant formaté
*/
const MoneyInputComponent = `
<template>
  <div class="money-input-container">
    <div class="relative">
      <input
        :id="inputId"
        v-model="displayValue"
        type="text"
        :class="inputClasses"
        :placeholder="placeholder"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        :disabled="disabled"
        :readonly="readonly"
      >
      <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        <span class="text-gray-500 text-sm">{{ currency }}</span>
        <button
          v-if="showClearButton && modelValue > 0"
          type="button"
          @click="clearValue"
          class="text-gray-400 hover:text-red-500 text-xs"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Aide contextuelle -->
    <div v-if="showHelp" class="mt-2 text-xs text-gray-600 flex items-center space-x-2">
      <span>💡</span>
      <span>{{ helpText }}</span>
    </div>

    <!-- Conversion -->
    <div v-if="showConversion && convertedAmount" class="mt-1 text-xs text-gray-500">
      ≈ {{ convertedAmount }} {{ conversionCurrency }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  currency: { type: String, default: 'EUR' },
  placeholder: { type: String, default: '0,00' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  showClearButton: { type: Boolean, default: true },
  showHelp: { type: Boolean, default: false },
  helpText: { type: String, default: 'Saisissez un montant en euros' },
  showConversion: { type: Boolean, default: false },
  conversionRate: { type: Number, default: 1 },
  conversionCurrency: { type: String, default: 'USD' },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 999999.99 },
  step: { type: Number, default: 0.01 },
  inputId: { type: String, default: () => 'money-input-' + Math.random().toString(36).substr(2, 9) },
  error: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const displayValue = ref('')
const isFocused = ref(false)

// Classes CSS conditionnelles
const inputClasses = computed(() => [
  'form-input pr-16',
  {
    'input-error': props.error,
    'input-disabled': props.disabled,
    'bg-gray-50': props.readonly
  }
])

// Montant converti
const convertedAmount = computed(() => {
  if (!props.showConversion || !props.modelValue) return null
  const converted = parseFloat(props.modelValue) * props.conversionRate
  return converted.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

// Formater le montant pour l'affichage
const formatDisplayValue = (value) => {
  if (!value && value !== 0) return ''
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return ''
  return numValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Parser la valeur saisie
const parseInputValue = (value) => {
  if (!value) return 0
  // Remplacer la virgule par un point et enlever les espaces
  const cleanValue = value.replace(/[^0-9,-]/g, '').replace(',', '.')
  const numValue = parseFloat(cleanValue)
  return isNaN(numValue) ? 0 : Math.min(Math.max(numValue, props.min), props.max)
}

// Gestionnaires d'événements
const handleInput = (event) => {
  const rawValue = event.target.value
  const numericValue = parseInputValue(rawValue)
  emit('update:modelValue', numericValue)
}

const handleFocus = (event) => {
  isFocused.value = true
  // En mode focus, afficher la valeur brute pour faciliter l'édition
  displayValue.value = props.modelValue ? props.modelValue.toString().replace('.', ',') : ''
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  // En mode blur, formater l'affichage
  displayValue.value = formatDisplayValue(props.modelValue)
  emit('blur', event)
}

const clearValue = () => {
  emit('update:modelValue', 0)
  displayValue.value = ''
}

// Watcher pour synchroniser l'affichage
watch(() => props.modelValue, (newValue) => {
  if (!isFocused.value) {
    displayValue.value = formatDisplayValue(newValue)
  }
}, { immediate: true })
</script>
