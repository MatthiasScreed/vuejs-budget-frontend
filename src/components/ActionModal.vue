<template>
  <!-- Overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="action-modal-overlay" @click.self="close">
        <div class="action-modal">
          <!-- Header -->
          <div class="action-modal__header">
            <h2 class="action-modal__title">{{ questEmoji }} {{ questName }}</h2>
            <button class="action-modal__close" @click="close" aria-label="Fermer">✕</button>
          </div>

          <!-- Toggle save / spend -->
          <div class="action-modal__toggle">
            <button
              :class="['toggle-btn', { 'toggle-btn--active save': form.type === 'save' }]"
              @click="form.type = 'save'"
            >
              💰 J'ai économisé
            </button>
            <button
              :class="['toggle-btn', { 'toggle-btn--active spend': form.type === 'spend' }]"
              @click="form.type = 'spend'"
            >
              💸 J'ai dépensé
            </button>
          </div>

          <!-- Montant -->
          <div class="action-modal__amount">
            <span class="amount-currency">€</span>
            <input
              ref="amountInput"
              v-model="form.amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0"
              class="amount-input"
              inputmode="decimal"
              @keyup.enter="submit"
            />
          </div>

          <!-- Raisons rapides -->
          <div class="action-modal__reasons">
            <button
              v-for="preset in currentPresets"
              :key="preset.value"
              :class="['reason-btn', { 'reason-btn--active': form.reason_preset === preset.value }]"
              @click="selectPreset(preset.value)"
            >
              {{ preset.label }}
            </button>
          </div>

          <!-- Raison libre (si "Autre") -->
          <Transition name="slide">
            <input
              v-if="showCustomReason"
              v-model="form.reason"
              type="text"
              placeholder="Précise la raison..."
              class="action-modal__custom-reason"
              maxlength="100"
            />
          </Transition>

          <!-- XP preview -->
          <div class="action-modal__xp-preview">
            <span class="xp-badge">⚡ +{{ xpPreview }} XP</span>
            <span v-if="streakDisplay" class="streak-badge">🔥 {{ streakDisplay }}</span>
          </div>

          <!-- Submit -->
          <button
            class="action-modal__submit"
            :class="form.type === 'save' ? 'submit--save' : 'submit--spend'"
            :disabled="!isValid || store.submitting"
            @click="submit"
          >
            <span v-if="store.submitting">...</span>
            <span v-else>
              {{ form.type === 'save' ? '✓ Économie enregistrée' : '✓ Dépense enregistrée' }}
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  useDailyActionStore,
  SAVE_PRESETS,
  SPEND_PRESETS,
  REASON_PRESETS,
  type ReasonPreset,
} from '@/stores/Dailyactionstore.ts'
import { useGamingStore } from '@/stores/gamingStore'

// ==========================================
// PROPS / EMITS
// ==========================================

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    questId?: number | null
    questName?: string
    questEmoji?: string
  }>(),
  {
    questId: null,
    questName: 'Ma quête',
    questEmoji: '🎯',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submitted: [result: any]
}>()

// ==========================================
// STORES
// ==========================================

const store = useDailyActionStore()
const gaming = useGamingStore()

// ==========================================
// STATE
// ==========================================

const amountInput = ref<HTMLInputElement | null>(null)

const form = ref({
  type: 'save' as 'save' | 'spend',
  amount: '' as string | number,
  reason_preset: null as ReasonPreset | null,
  reason: '',
})

// ==========================================
// COMPUTED
// ==========================================

const currentPresets = computed(() => {
  const keys = form.value.type === 'save' ? SAVE_PRESETS : SPEND_PRESETS
  return keys.map((k) => ({ value: k, label: REASON_PRESETS[k] }))
})

const showCustomReason = computed(
  () => form.value.reason_preset === 'other_save' || form.value.reason_preset === 'other_spend',
)

const isValid = computed(() => Number(form.value.amount) > 0)

const xpPreview = computed(() => (form.value.type === 'save' ? 10 : 3))

const streakDisplay = computed(() => {
  const current = gaming.currentStreak ?? 0
  if (current < 1) return null
  return `${current + 1}j de série`
})

// ==========================================
// WATCHERS
// ==========================================

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      resetForm()
      await nextTick()
      amountInput.value?.focus()
    }
  },
)

watch(
  () => form.value.type,
  () => {
    form.value.reason_preset = null
    form.value.reason = ''
  },
)

// ==========================================
// MÉTHODES
// ==========================================

function selectPreset(preset: ReasonPreset): void {
  form.value.reason_preset = form.value.reason_preset === preset ? null : preset
}

function resetForm(): void {
  form.value = { type: 'save', amount: '', reason_preset: null, reason: '' }
}

function close(): void {
  emit('update:modelValue', false)
}

async function submit(): Promise<void> {
  if (!isValid.value || store.submitting) return

  const result = await store.submitAction({
    type: form.value.type,
    amount: Number(form.value.amount),
    reason_preset: form.value.reason_preset ?? undefined,
    reason: showCustomReason.value ? form.value.reason : undefined,
    quest_id: props.questId,
  })

  if (result) {
    emit('submitted', result)
    close()
  }
}
</script>

<style scoped>
.action-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 0 0 env(safe-area-inset-bottom, 0);
}

@media (min-width: 640px) {
  .action-modal-overlay {
    align-items: center;
  }
}

.action-modal {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 32px;
  width: 100%;
  max-width: 480px;
}

@media (min-width: 640px) {
  .action-modal {
    border-radius: 20px;
    padding: 28px 28px 32px;
  }
}

.action-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.action-modal__title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.action-modal__close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-modal__toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 24px;
}

.toggle-btn {
  padding: 12px 8px;
  border-radius: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.toggle-btn--active.save {
  background: rgba(34, 197, 94, 0.15);
  border-color: #22c55e;
  color: #4ade80;
}

.toggle-btn--active.spend {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #f87171;
}

.action-modal__amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.amount-currency {
  font-size: 36px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
}

.amount-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 56px;
  font-weight: 700;
  color: white;
  width: 200px;
  text-align: center;
  -moz-appearance: textfield;
}

.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.amount-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.action-modal__reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.reason-btn {
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.reason-btn--active {
  background: rgba(139, 92, 246, 0.25);
  border-color: #8b5cf6;
  color: #c4b5fd;
}

.action-modal__custom-reason {
  width: 100%;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 12px 14px;
  color: white;
  font-size: 14px;
  outline: none;
  margin-bottom: 16px;
}

.action-modal__xp-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.xp-badge,
.streak-badge {
  font-size: 13px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
}

.xp-badge {
  background: rgba(234, 179, 8, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.streak-badge {
  background: rgba(249, 115, 22, 0.15);
  color: #fb923c;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.action-modal__submit {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.02em;
}

.action-modal__submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.submit--save {
  background: #22c55e;
  color: white;
}
.submit--save:not(:disabled):hover {
  background: #16a34a;
  transform: translateY(-1px);
}
.submit--spend {
  background: #ef4444;
  color: white;
}
.submit--spend:not(:disabled):hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .action-modal,
.modal-leave-active .action-modal {
  transition: transform 0.25s ease;
}
.modal-enter-from .action-modal,
.modal-leave-to .action-modal {
  transform: translateY(40px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  max-height: 60px;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
