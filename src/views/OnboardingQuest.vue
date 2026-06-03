<template>
  <div class="onboarding">
    <!-- Étape 1 : Bienvenue -->
    <Transition name="step" mode="out-in">
      <div v-if="step === 1" key="step1" class="onboarding__step">
        <div class="onboarding__hero">
          <div class="onboarding__logo">
            <img src="@/assets/images/icon/icon.svg" alt="logo_Coinquest">
          </div>
          <h1 class="onboarding__title">Bienvenue sur CoinQuest</h1>
          <p class="onboarding__subtitle">
            Pas de tableurs. Pas de culpabilité.<br />
            Juste toi, ton objectif, et chaque petit geste qui t'en rapproche.
          </p>
        </div>

        <div class="onboarding__examples">
          <div
            v-for="ex in examples"
            :key="ex.emoji"
            class="example-chip"
            @click="prefillQuest(ex)"
          >
            {{ ex.emoji }} {{ ex.name }}
          </div>
        </div>

        <button class="onboarding__cta" @click="step = 2">Créer ma première quête →</button>

        <p class="onboarding__skip" @click="skipOnboarding">Je le ferai plus tard</p>
      </div>

      <!-- Étape 2 : Nom + montant -->
      <div v-else-if="step === 2" key="step2" class="onboarding__step">
        <button class="onboarding__back" @click="step = 1">← Retour</button>

        <h2 class="onboarding__step-title">Quel est ton objectif ?</h2>
        <p class="onboarding__step-subtitle">
          Nomme-le comme tu veux. Plus c'est concret, plus c'est motivant.
        </p>

        <!-- Choix emoji -->
        <div class="emoji-row">
          <button
            v-for="e in questEmojis"
            :key="e"
            :class="['emoji-btn', { 'emoji-btn--active': form.emoji === e }]"
            @click="form.emoji = e"
          >
            {{ e }}
          </button>
        </div>

        <!-- Nom de la quête -->
        <div class="field">
          <label class="field__label">Nom de la quête</label>
          <input
            ref="nameInput"
            v-model="form.name"
            type="text"
            class="field__input"
            placeholder="Voyage au Japon, MacBook Pro, Fonds d'urgence…"
            maxlength="100"
            @keyup.enter="goToStep3"
          />
        </div>

        <!-- Montant cible -->
        <div class="field">
          <label class="field__label">Montant cible</label>
          <div class="field__amount-wrapper">
            <input
              v-model.number="form.target_amount"
              type="number"
              class="field__amount-input"
              placeholder="3000"
              min="1"
              @keyup.enter="goToStep3"
            />
            <span class="field__currency">€</span>
          </div>
        </div>

        <button
          class="onboarding__cta"
          :disabled="!form.name || !form.target_amount"
          @click="goToStep3"
        >
          Continuer →
        </button>
      </div>

      <!-- Étape 3 : Date (optionnelle) + récap -->
      <div v-else-if="step === 3" key="step3" class="onboarding__step">
        <button class="onboarding__back" @click="step = 2">← Retour</button>

        <h2 class="onboarding__step-title">Pour quand ?</h2>
        <p class="onboarding__step-subtitle">
          Optionnel — mais une date rend l'objectif plus réel.
        </p>

        <div class="field">
          <label class="field__label">Date cible (optionnelle)</label>
          <input v-model="form.target_date" type="date" class="field__input" :min="minDate" />
        </div>

        <!-- Récapitulatif -->
        <div class="recap-card">
          <div class="recap-card__emoji">{{ form.emoji }}</div>
          <div class="recap-card__content">
            <div class="recap-card__name">{{ form.name }}</div>
            <div class="recap-card__amount">{{ formatAmount(form.target_amount) }} €</div>
            <div v-if="form.target_date" class="recap-card__date">
              📅 {{ formatDate(form.target_date) }}
            </div>
          </div>
          <div class="recap-card__pct">0%</div>
        </div>

        <button
          class="onboarding__cta onboarding__cta--green"
          :disabled="questStore.saving"
          @click="createAndStart"
        >
          <span v-if="questStore.saving">Création en cours…</span>
          <span v-else>🎯 Lancer ma quête !</span>
        </button>
      </div>
    </Transition>

    <!-- Indicateur d'étapes -->
    <div class="onboarding__dots">
      <span
        v-for="i in 3"
        :key="i"
        :class="['dot', { 'dot--active': step === i, 'dot--done': step > i }]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestStore } from '@/stores/Queststore.ts'

// ==========================================
// STORES
// ==========================================

const questStore = useQuestStore()
const router = useRouter()

// ==========================================
// STATE
// ==========================================

const step = ref(1)
const nameInput = ref<HTMLInputElement | null>(null)

const form = ref({
  name: '',
  target_amount: null as number | null,
  target_date: '',
  emoji: '🎯',
})

const questEmojis = ['🎯', '✈️', '💻', '🚗', '🏠', '🛡️', '📈', '🎓', '🎉', '💳', '🏋️', '🎸']

const examples = [
  { emoji: '✈️', name: 'Voyage au Japon', target_amount: 3000 },
  { emoji: '💻', name: 'MacBook Pro', target_amount: 2500 },
  { emoji: '🛡️', name: "Fonds d'urgence", target_amount: 5000 },
  { emoji: '🚗', name: 'Permis de conduire', target_amount: 1800 },
  { emoji: '🏠', name: 'Apport immobilier', target_amount: 20000 },
  { emoji: '🎓', name: 'Formation en ligne', target_amount: 500 },
]

// ==========================================
// COMPUTED
// ==========================================

const minDate = computed(() => {
  return new Date(Date.now() + 86400000).toISOString().split('T')[0]
})

// ==========================================
// MÉTHODES
// ==========================================

function prefillQuest(ex: (typeof examples)[0]): void {
  form.value.emoji = ex.emoji
  form.value.name = ex.name
  form.value.target_amount = ex.target_amount
  step.value = 2
  nextTick(() => nameInput.value?.focus())
}

async function goToStep3(): Promise<void> {
  if (!form.value.name || !form.value.target_amount) return
  step.value = 3
}

async function createAndStart(): Promise<void> {
  if (!form.value.name || !form.value.target_amount) return

  const quest = await questStore.createQuest({
    name: form.value.name,
    target_amount: form.value.target_amount,
    target_date: form.value.target_date || null,
    emoji: form.value.emoji,
  })

  if (quest) {
    // Marquer l'onboarding comme terminé
    localStorage.setItem('onboarding_completed', 'true')
    router.push({ name: 'Quest' })
  }
}

function skipOnboarding(): void {
  localStorage.setItem('onboarding_completed', 'true')
  router.push({ name: 'Quest' })
}

function formatAmount(val: number | null): string {
  if (!val) return '0'
  return new Intl.NumberFormat('fr-FR').format(val)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  background: #0f0f1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 20px 80px;
}

.onboarding__step {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== ÉTAPE 1 ===== */
.onboarding__hero {
  text-align: center;
  margin-bottom: 8px;
}

.onboarding__logo {
  font-size: 64px;
  margin-bottom: 20px;
  display: block;
}

.onboarding__title {
  font-size: 26px;
  font-weight: 800;
  color: white;
  margin: 0 0 12px;
}

.onboarding__subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.6;
  margin: 0;
}

.onboarding__examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.example-chip {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.example-chip:hover {
  background: rgba(124, 58, 237, 0.2);
  border-color: #7c3aed;
  color: white;
}

/* ===== ÉTAPES 2 & 3 ===== */
.onboarding__back {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  text-align: left;
}

.onboarding__step-title {
  font-size: 22px;
  font-weight: 800;
  color: white;
  margin: 0;
}

.onboarding__step-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: -8px 0 0;
}

/* Emojis */
.emoji-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emoji-btn {
  width: 44px;
  height: 44px;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.emoji-btn--active {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.2);
}

/* Champs */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.4);
}

.field__input {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 14px 16px;
  color: white;
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s;
}

.field__input:focus {
  border-color: #7c3aed;
}

.field__amount-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.field__amount-wrapper:focus-within {
  border-color: #7c3aed;
}

.field__amount-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 14px 16px;
  color: white;
  font-size: 22px;
  font-weight: 700;
  outline: none;
  -moz-appearance: textfield;
}

.field__amount-input::-webkit-outer-spin-button,
.field__amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.field__currency {
  padding: 0 16px 0 0;
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
}

/* Récap */
.recap-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 20px;
}

.recap-card__emoji {
  font-size: 40px;
  flex-shrink: 0;
}

.recap-card__content {
  flex: 1;
}

.recap-card__name {
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.recap-card__amount {
  font-size: 20px;
  font-weight: 800;
  color: #a78bfa;
}

.recap-card__date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

.recap-card__pct {
  font-size: 24px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.2);
}

/* CTA */
.onboarding__cta {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.02em;
}

.onboarding__cta:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.onboarding__cta:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(124, 58, 237, 0.4);
}

.onboarding__cta--green {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.onboarding__cta--green:not(:disabled):hover {
  box-shadow: 0 6px 24px rgba(22, 163, 74, 0.4);
}

.onboarding__skip {
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  margin-top: -8px;
}

.onboarding__skip:hover {
  color: rgba(255, 255, 255, 0.5);
}

/* Dots */
.onboarding__dots {
  display: flex;
  gap: 8px;
  margin-top: 32px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  transition: all 0.3s;
}

.dot--active {
  width: 24px;
  background: #7c3aed;
}

.dot--done {
  background: rgba(124, 58, 237, 0.4);
}

/* Transitions */
.step-enter-active,
.step-leave-active {
  transition: all 0.2s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
