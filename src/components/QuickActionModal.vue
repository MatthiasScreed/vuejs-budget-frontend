<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="modelValue" class="overlay" @click.self="handleClose">
        <Transition name="sheet-slide">
          <div v-if="modelValue" class="bottom-sheet" @click.stop>
            <!-- ── Handle bar ── -->
            <div class="handle-bar"></div>

            <!-- ── Header ── -->
            <div class="sheet-header">
              <div class="sheet-type-tabs">
                <button
                  class="type-tab"
                  :class="{ active: localType === 'save' }"
                  @click="localType = 'save'"
                >
                  💰 Économie
                </button>
                <button
                  class="type-tab"
                  :class="{ active: localType === 'spend' }"
                  @click="localType = 'spend'"
                >
                  💸 Dépense
                </button>
              </div>
              <button class="btn-close" @click="handleClose">✕</button>
            </div>

            <!-- ── Montant affiché ── -->
            <div
              class="amount-display"
              :class="localType === 'save' ? 'display-save' : 'display-spend'"
            >
              <span class="amount-sign">{{ localType === 'save' ? '+' : '−' }}</span>
              <span class="amount-digits">{{ displayAmount }}</span>
              <span class="amount-eur">€</span>
            </div>

            <!-- ── Impact sur la quête (si économie + objectif actif) ── -->
            <Transition name="fade">
              <div v-if="localType === 'save' && hasAmount && mainGoal" class="impact-banner">
                <span class="impact-icon">🎯</span>
                <span class="impact-text">
                  +{{ impactPercent }}% vers
                  <strong>{{ mainGoal.name }}</strong>
                </span>
                <span class="impact-xp">+10 XP</span>
              </div>
            </Transition>

            <!-- ── Raisons rapides (économie) ── -->
            <div v-if="localType === 'save'" class="reasons-section">
              <p class="section-label">Pourquoi ?</p>
              <div class="reasons-grid">
                <button
                  v-for="r in saveReasons"
                  :key="r.key"
                  class="reason-chip"
                  :class="{ selected: selectedReason === r.key }"
                  @click="selectedReason = r.key"
                >
                  <span class="reason-emoji">{{ r.emoji }}</span>
                  <span class="reason-label">{{ r.label }}</span>
                </button>
              </div>
            </div>

            <!-- ── Description (dépense) ── -->
            <div v-if="localType === 'spend'" class="description-section">
              <p class="section-label">C'était quoi ?</p>
              <div class="quick-tags">
                <button
                  v-for="tag in spendTags"
                  :key="tag"
                  class="quick-tag"
                  :class="{ selected: description === tag }"
                  @click="description = tag"
                >
                  {{ tag }}
                </button>
              </div>
              <input
                v-model="description"
                type="text"
                class="description-input"
                placeholder="Ou décris librement..."
                maxlength="60"
              />
            </div>

            <!-- ── Clavier numérique ── -->
            <div class="numpad">
              <button
                v-for="key in numpadKeys"
                :key="key"
                class="numpad-key"
                :class="{
                  'key-zero': key === '0',
                  'key-delete': key === '⌫',
                  'key-decimal': key === ',',
                }"
                @click="handleNumpad(key)"
              >
                <span v-if="key === '⌫'">⌫</span>
                <span v-else>{{ key }}</span>
              </button>
            </div>

            <!-- ── Bouton confirmer ── -->
            <button
              class="btn-confirm"
              :class="localType === 'save' ? 'confirm-save' : 'confirm-spend'"
              :disabled="!hasAmount || submitting"
              @click="handleSubmit"
            >
              <Transition name="fade" mode="out-in">
                <span v-if="submitting" key="loading" class="btn-inner">
                  <span class="spinner"></span>
                  Enregistrement...
                </span>
                <span v-else key="idle" class="btn-inner">
                  <span>{{
                    localType === 'save' ? "✓ Valider l'économie" : '✓ Enregistrer la dépense'
                  }}</span>
                  <span class="btn-amount">{{ displayAmount }}€</span>
                </span>
              </Transition>
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGoalStore } from '@/stores/goalStore'
import { useGamingStore } from '@/stores/gamingStore'
import { useStreakStore } from '@/stores/streakStore'
import { useTransactionStore } from '@/stores/transactionStore'

// ─── Props & Emits ────────────────────────
interface Props {
  modelValue: boolean
  type?: 'save' | 'spend'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'save',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: [payload: { type: 'save' | 'spend'; amount: number; xpGained: number }]
}>()

// ─── Stores ───────────────────────────────
const goalStore = useGoalStore()
const gamingStore = useGamingStore()
const streakStore = useStreakStore()
const transactionStore = useTransactionStore()

// ─── État local ───────────────────────────
const localType = ref<'save' | 'spend'>(props.type)
const rawAmount = ref('')
const selectedReason = ref('')
const description = ref('')
const submitting = ref(false)

// ─── Constantes ───────────────────────────
const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'] as const

const saveReasons = [
  { key: 'cook', emoji: '🍳', label: 'Cuisiné' },
  { key: 'transport', emoji: '🚶', label: 'Transports' },
  { key: 'avoided', emoji: '❌', label: 'Évité achat' },
  { key: 'challenge', emoji: '🏆', label: 'Défi réussi' },
  { key: 'promo', emoji: '🏷️', label: 'Promo saisie' },
  { key: 'other', emoji: '✨', label: 'Autre' },
] as const

const spendTags = ['Kebab', 'Café', 'Amazon', 'Netflix', 'Uber', 'Courses', 'Bar', 'Resto']

// ─── Computed ─────────────────────────────
const displayAmount = computed(() => rawAmount.value || '0')

const hasAmount = computed(
  () => rawAmount.value.length > 0 && parseFloat(rawAmount.value.replace(',', '.')) > 0,
)

const mainGoal = computed(() => goalStore.activeGoals[0] ?? null)

const impactPercent = computed(() => {
  if (!mainGoal.value || !hasAmount.value) return '0'
  const amount = parseFloat(rawAmount.value.replace(',', '.'))
  const remaining = goalStore.calculateRemaining(mainGoal.value)
  if (remaining <= 0) return '0'
  return ((amount / remaining) * 100).toFixed(1)
})

// ─── Watchers ─────────────────────────────
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      localType.value = props.type
      rawAmount.value = ''
      selectedReason.value = ''
      description.value = ''
    }
  },
)

watch(
  () => props.type,
  (t) => {
    localType.value = t
  },
)

// ─── Méthodes ─────────────────────────────

/**
 * Gère les touches du pavé numérique
 */
function handleNumpad(key: string): void {
  if (key === '⌫') {
    rawAmount.value = rawAmount.value.slice(0, -1)
    return
  }
  // Un seul séparateur décimal
  if (key === ',' && rawAmount.value.includes(',')) return
  // Max 2 décimales
  const parts = rawAmount.value.split(',')
  if (parts[1]?.length >= 2) return
  // Max 5 chiffres avant virgule
  if (!rawAmount.value.includes(',') && rawAmount.value.length >= 5) return

  rawAmount.value += key
}

/**
 * Soumet l'action (économie ou dépense)
 */
async function handleSubmit(): Promise<void> {
  if (!hasAmount.value || submitting.value) return

  submitting.value = true
  const amount = parseFloat(rawAmount.value.replace(',', '.'))
  const today = new Date().toISOString().split('T')[0]

  try {
    let xpGained = 0

    if (localType.value === 'save') {
      // 1. Contribuer à l'objectif principal
      if (mainGoal.value) {
        await goalStore.addContribution(mainGoal.value.id, amount, buildSaveDescription())
      }
      // 2. Créer une transaction income
      await transactionStore.createTransaction({
        type: 'income',
        amount,
        description: buildSaveDescription(),
        date: today,
      })
      // 3. Enregistrer l'activité streak
      await streakStore.recordSavingsActivity(amount)
      xpGained = 10
    } else {
      // 1. Créer une transaction expense
      await transactionStore.createTransaction({
        type: 'expense',
        amount,
        description: description.value || 'Dépense',
        date: today,
      })
      // 2. Enregistrer l'activité streak
      await streakStore.recordTransactionActivity()
      xpGained = 5
    }

    emit('success', { type: localType.value, amount, xpGained })
    handleClose()
  } finally {
    submitting.value = false
  }
}

/**
 * Construit la description pour une économie
 */
function buildSaveDescription(): string {
  const reasonMap: Record<string, string> = {
    cook: "J'ai cuisiné",
    transport: 'Transports en commun',
    avoided: 'Achat évité',
    challenge: 'Défi réussi',
    promo: 'Promo saisie',
    other: 'Économie',
  }
  return reasonMap[selectedReason.value] ?? 'Économie manuelle'
}

function handleClose(): void {
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* ═══════════════════════════════════════════
   OVERLAY
══════════════════════════════════════════ */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  backdrop-filter: blur(2px);
}

/* ═══════════════════════════════════════════
   BOTTOM SHEET
══════════════════════════════════════════ */
.bottom-sheet {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background: #141428;
  border-radius: 24px 24px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding: 12px 20px calc(env(safe-area-inset-bottom) + 16px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.5);
}

/* ── Handle ── */
.handle-bar {
  width: 36px;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  margin: 0 auto 4px;
}

/* ═══════════════════════════════════════════
   HEADER TABS
══════════════════════════════════════════ */
.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sheet-type-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
  flex: 1;
}

.type-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.type-tab.active {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.btn-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   MONTANT
══════════════════════════════════════════ */
.amount-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  padding: 4px 0;
  border-radius: 16px;
  transition: background 0.3s;
}

.display-save .amount-sign,
.display-save .amount-digits {
  color: #34d399;
}
.display-spend .amount-sign,
.display-spend .amount-digits {
  color: #f87171;
}

.amount-sign {
  font-size: 28px;
  font-weight: 700;
}
.amount-digits {
  font-size: 56px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -2px;
  min-width: 60px;
  text-align: center;
  line-height: 1;
}
.amount-eur {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.3);
  align-self: flex-end;
  padding-bottom: 6px;
}

/* ═══════════════════════════════════════════
   IMPACT BANNER
══════════════════════════════════════════ */
.impact-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 10px 14px;
}

.impact-icon {
  font-size: 16px;
}
.impact-text {
  flex: 1;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}
.impact-text strong {
  color: #34d399;
}
.impact-xp {
  font-size: 12px;
  font-weight: 700;
  color: #a78bfa;
  background: rgba(139, 92, 246, 0.15);
  padding: 3px 8px;
  border-radius: 8px;
}

/* ═══════════════════════════════════════════
   RAISONS / DESCRIPTION
══════════════════════════════════════════ */
.section-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 0 0 8px;
}

.reasons-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.reason-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.reason-chip.selected {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
}

.reason-emoji {
  font-size: 18px;
  line-height: 1;
}
.reason-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  text-align: center;
}
.reason-chip.selected .reason-label {
  color: #34d399;
}

/* ── Spend ── */
.description-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-tag {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.quick-tag.selected {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.35);
  color: #fca5a5;
}

.description-input {
  width: 100%;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.description-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}
.description-input:focus {
  border-color: rgba(248, 113, 113, 0.4);
}

/* ═══════════════════════════════════════════
   CLAVIER NUMÉRIQUE
══════════════════════════════════════════ */
.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.numpad-key {
  padding: 0;
  height: 52px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  color: #f1f5f9;
  font-size: 22px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.1s,
    transform 0.1s;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.numpad-key:active {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(0.94);
}

.key-delete {
  color: rgba(255, 255, 255, 0.35);
  font-size: 18px;
}
.key-decimal {
  font-size: 26px;
  color: rgba(255, 255, 255, 0.6);
}

/* ═══════════════════════════════════════════
   BOUTON CONFIRMER
══════════════════════════════════════════ */
.btn-confirm {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.btn-confirm:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-confirm:not(:disabled):active {
  transform: scale(0.97);
}

.confirm-save {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}
.confirm-spend {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.btn-amount {
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 13px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ═══════════════════════════════════════════
   TRANSITIONS
══════════════════════════════════════════ */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.sheet-slide-enter-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-slide-leave-active {
  transition: transform 0.22s ease-in;
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
