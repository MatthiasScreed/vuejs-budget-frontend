<template>
  <div class="dashboard">
    <!-- ===== QUÊTE PRINCIPALE ===== -->
    <section class="quest-card" v-if="questStore.hasMainQuest">
      <div class="quest-card__top">
        <div class="quest-card__info">
          <span class="quest-card__emoji">{{ quest.emoji }}</span>
          <div>
            <h1 class="quest-card__name">{{ quest.name }}</h1>
            <p class="quest-card__amounts">
              <strong>{{ formatAmount(quest.current_amount) }} €</strong>
              <span> / {{ formatAmount(quest.target_amount) }} €</span>
            </p>
          </div>
        </div>
        <div class="quest-card__pct">{{ quest.progress_percentage }}%</div>
      </div>

      <!-- Barre de progression -->
      <div class="quest-progress">
        <div
          class="quest-progress__bar"
          :style="{ width: quest.progress_percentage + '%' }"
          :class="quest.is_completed ? 'quest-progress__bar--done' : ''"
        />
      </div>

      <div class="quest-card__bottom">
        <span class="quest-remaining"> {{ formatAmount(quest.remaining_amount) }} € restants </span>
        <span v-if="quest.days_remaining !== null" class="quest-deadline">
          {{ quest.days_remaining }}j
        </span>
      </div>
    </section>

    <!-- Aucune quête -->
    <section v-else class="quest-empty" @click="showQuestForm = true">
      <span class="quest-empty__icon">🎯</span>
      <p class="quest-empty__text">Crée ta première quête</p>
      <span class="quest-empty__cta">Commencer →</span>
    </section>

    <!-- ===== STATS RAPIDES ===== -->
    <div class="stats-row">
      <!-- Streak -->
      <div class="stat-card stat-card--streak">
        <div class="stat-card__icon">🔥</div>
        <div class="stat-card__value">{{ currentStreak }}</div>
        <div class="stat-card__label">jours de série</div>
      </div>

      <!-- Niveau -->
      <div class="stat-card stat-card--level">
        <div class="stat-card__icon">⭐</div>
        <div class="stat-card__value">{{ playerLevel }}</div>
        <div class="stat-card__label">niveau</div>
      </div>

      <!-- XP du mois -->
      <div class="stat-card stat-card--xp">
        <div class="stat-card__icon">⚡</div>
        <div class="stat-card__value">{{ actionStore.monthStats.xp_earned }}</div>
        <div class="stat-card__label">XP ce mois</div>
      </div>

      <!-- Économies ce mois -->
      <div class="stat-card stat-card--save">
        <div class="stat-card__icon">💰</div>
        <div class="stat-card__value">{{ formatAmount(actionStore.monthStats.saved) }}</div>
        <div class="stat-card__label">économisés</div>
      </div>
    </div>

    <!-- ===== XP BAR ===== -->
    <div class="xp-bar-section">
      <div class="xp-bar-section__labels">
        <span>Niveau {{ playerLevel }}</span>
        <span>{{ currentXP }} / {{ maxXP }} XP</span>
      </div>
      <div class="xp-bar">
        <div class="xp-bar__fill" :style="{ width: xpPercent + '%' }" />
      </div>
    </div>

    <!-- ===== DÉFI DU JOUR ===== -->
    <section class="challenge-card" v-if="todayChallenge">
      <div class="challenge-card__header">
        <span class="challenge-badge">Défi du jour</span>
        <span class="challenge-xp">+{{ todayChallenge.xp_reward }} XP</span>
      </div>
      <p class="challenge-card__title">{{ todayChallenge.title }}</p>
      <div class="challenge-card__actions">
        <button class="challenge-btn challenge-btn--success" @click="completeChallenge(true)">
          ✓ Réussi
        </button>
        <button class="challenge-btn challenge-btn--fail" @click="completeChallenge(false)">
          ✗ Pas aujourd'hui
        </button>
      </div>
    </section>

    <!-- ===== ACTIONS DU JOUR ===== -->
    <section class="today-section" v-if="actionStore.todayActions.length > 0">
      <h2 class="today-section__title">Aujourd'hui</h2>
      <div class="today-actions">
        <div
          v-for="action in actionStore.todayActions.slice(0, 5)"
          :key="action.id"
          class="today-action"
          :class="action.type === 'save' ? 'today-action--save' : 'today-action--spend'"
        >
          <span class="today-action__label">{{ action.reason_label || action.reason || '—' }}</span>
          <span class="today-action__amount">
            {{ action.type === 'save' ? '+' : '-' }}{{ formatAmount(action.amount) }} €
          </span>
        </div>
      </div>
    </section>

    <!-- ===== BOUTON ACTION PRINCIPAL ===== -->
    <div class="fab-container">
      <button class="fab" @click="showActionModal = true">
        <span class="fab__icon">+</span>
        <span class="fab__label">Enregistrer</span>
      </button>
    </div>

    <!-- ===== MODALS ===== -->
    <ActionModal
      v-model="showActionModal"
      :quest-id="quest?.id ?? null"
      :quest-name="quest?.name ?? 'Ma quête'"
      :quest-emoji="quest?.emoji ?? '🎯'"
      @submitted="onActionSubmitted"
    />

    <!-- Formulaire création quête (simple) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showQuestForm" class="quest-form-overlay" @click.self="showQuestForm = false">
          <div class="quest-form">
            <h2 class="quest-form__title">Crée ta quête</h2>

            <label class="quest-form__label">Nom de la quête</label>
            <input
              v-model="newQuest.name"
              class="quest-form__input"
              placeholder="Voyage au Japon, MacBook..."
            />

            <label class="quest-form__label">Montant cible (€)</label>
            <input
              v-model.number="newQuest.target_amount"
              type="number"
              class="quest-form__input"
              placeholder="3000"
            />

            <label class="quest-form__label">Date cible (optionnelle)</label>
            <input v-model="newQuest.target_date" type="date" class="quest-form__input" />

            <div class="quest-form__emojis">
              <button
                v-for="e in questEmojis"
                :key="e"
                :class="['emoji-btn', { 'emoji-btn--active': newQuest.emoji === e }]"
                @click="newQuest.emoji = e"
              >
                {{ e }}
              </button>
            </div>

            <button
              class="quest-form__submit"
              :disabled="!newQuest.name || !newQuest.target_amount || questStore.saving"
              @click="createQuest"
            >
              {{ questStore.saving ? '...' : '✓ Créer ma quête' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ActionModal from '@/components/ActionModal.vue'
import { useQuestStore } from '@/stores/Queststore.ts'
import { useDailyActionStore } from '@/stores/Dailyactionstore.ts'
import { useGamingStore } from '@/stores/gamingStore'
import { api } from '@/services/api'

// ==========================================
// STORES
// ==========================================

const questStore = useQuestStore()
const actionStore = useDailyActionStore()
const gamingStore = useGamingStore()

// ==========================================
// STATE
// ==========================================

const showActionModal = ref(false)
const showQuestForm = ref(false)
const todayChallenge = ref<any>(null)

const newQuest = ref({
  name: '',
  target_amount: null as number | null,
  target_date: '',
  emoji: '🎯',
})

const questEmojis = ['🎯', '✈️', '💻', '🚗', '🏠', '🛡️', '📈', '🎓', '🎉', '💳']

// ==========================================
// COMPUTED
// ==========================================

const quest = computed(() => questStore.mainQuest)

const currentStreak = computed(() => {
  const dailyStreak = gamingStore.streaks.find((s: any) => s.type === 'daily')
  return dailyStreak?.current_count ?? 0
})

const playerLevel = computed(() => gamingStore.currentLevel?.level ?? 1)

const currentXP = computed(() => actionStore.monthStats.xp_earned ?? 0)

const maxXP = computed(() => 200)

const xpPercent = computed(() => Math.min(100, Math.round((currentXP.value / maxXP.value) * 100)))

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  await Promise.all([
    questStore.fetchMainQuest(),
    actionStore.fetchToday(),
    actionStore.fetchStats(),
    loadTodayChallenge(),
  ])
})

// ==========================================
// MÉTHODES
// ==========================================

function formatAmount(val: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val)
}

async function loadTodayChallenge(): Promise<void> {
  try {
    const res = await api.get('/gaming/milestones')
    todayChallenge.value = res.data?.data?.[0] ?? null
  } catch {
    todayChallenge.value = null
  }
}

function onActionSubmitted(result: any): void {
  // Déjà géré dans le store (toasts, sync quête, gaming)
}

async function completeChallenge(success: boolean): Promise<void> {
  if (!todayChallenge.value) return

  try {
    if (success) {
      await api.post(`/gaming/milestones/${todayChallenge.value.id}/claim`)
    }
    todayChallenge.value = null
  } catch {
    todayChallenge.value = null
  }
}

async function createQuest(): Promise<void> {
  if (!newQuest.value.name || !newQuest.value.target_amount) return

  const quest = await questStore.createQuest({
    name: newQuest.value.name,
    target_amount: newQuest.value.target_amount,
    target_date: newQuest.value.target_date || null,
    emoji: newQuest.value.emoji,
  })

  if (quest) {
    showQuestForm.value = false
    newQuest.value = { name: '', target_amount: null, target_date: '', emoji: '🎯' }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px 16px 120px;
}

/* ===== QUÊTE CARD ===== */
.quest-card {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
}

.quest-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.quest-card__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quest-card__emoji {
  font-size: 36px;
}

.quest-card__name {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px;
}

.quest-card__amounts {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}
.quest-card__amounts strong {
  color: #a78bfa;
  font-size: 16px;
}

.quest-card__pct {
  font-size: 28px;
  font-weight: 800;
  color: #a78bfa;
  flex-shrink: 0;
}

.quest-progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.quest-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a78bfa);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.quest-progress__bar--done {
  background: linear-gradient(90deg, #16a34a, #4ade80);
}

.quest-card__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quest-remaining {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}
.quest-deadline {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.quest-empty {
  background: rgba(255, 255, 255, 0.04);
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.quest-empty:hover {
  border-color: rgba(139, 92, 246, 0.5);
}
.quest-empty__icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}
.quest-empty__text {
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 8px;
}
.quest-empty__cta {
  color: #a78bfa;
  font-weight: 600;
  font-size: 14px;
}

/* ===== STATS ROW ===== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px 8px;
  text-align: center;
}

.stat-card__icon {
  font-size: 20px;
  margin-bottom: 4px;
}
.stat-card__value {
  font-size: 18px;
  font-weight: 800;
  color: white;
  line-height: 1;
  margin-bottom: 2px;
}
.stat-card__label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.stat-card--streak {
  border-color: rgba(249, 115, 22, 0.3);
}
.stat-card--streak .stat-card__value {
  color: #fb923c;
}
.stat-card--level {
  border-color: rgba(234, 179, 8, 0.3);
}
.stat-card--level .stat-card__value {
  color: #fbbf24;
}
.stat-card--xp {
  border-color: rgba(139, 92, 246, 0.3);
}
.stat-card--xp .stat-card__value {
  color: #a78bfa;
}
.stat-card--save {
  border-color: rgba(34, 197, 94, 0.3);
}
.stat-card--save .stat-card__value {
  color: #4ade80;
}

/* ===== XP BAR ===== */
.xp-bar-section {
  margin-bottom: 16px;
}

.xp-bar-section__labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 6px;
}

.xp-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.xp-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #ec4899);
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* ===== CHALLENGE CARD ===== */
.challenge-card {
  background: rgba(234, 179, 8, 0.08);
  border: 1px solid rgba(234, 179, 8, 0.25);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 16px;
}

.challenge-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.challenge-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #fbbf24;
  background: rgba(234, 179, 8, 0.15);
  padding: 3px 10px;
  border-radius: 10px;
}

.challenge-xp {
  font-size: 13px;
  font-weight: 700;
  color: #fbbf24;
}

.challenge-card__title {
  color: white;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 14px;
}

.challenge-card__actions {
  display: flex;
  gap: 8px;
}

.challenge-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.challenge-btn:hover {
  opacity: 0.85;
}
.challenge-btn--success {
  background: #22c55e;
  color: white;
}
.challenge-btn--fail {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

/* ===== TODAY ACTIONS ===== */
.today-section {
  margin-bottom: 16px;
}

.today-section__title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 10px;
}

.today-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.today-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
}

.today-action--save {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.2);
}
.today-action--spend {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.today-action__label {
  color: rgba(255, 255, 255, 0.7);
}
.today-action--save .today-action__amount {
  color: #4ade80;
  font-weight: 700;
}
.today-action--spend .today-action__amount {
  color: #f87171;
  font-weight: 700;
}

/* ===== FAB ===== */
.fab-container {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.fab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: none;
  border-radius: 50px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(124, 58, 237, 0.5);
  transition: all 0.15s;
}

.fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(124, 58, 237, 0.6);
}
.fab:active {
  transform: scale(0.97);
}

.fab__icon {
  font-size: 20px;
  font-weight: 300;
}
.fab__label {
  font-size: 15px;
}

/* ===== QUEST FORM ===== */
.quest-form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

@media (min-width: 640px) {
  .quest-form-overlay {
    align-items: center;
  }
}

.quest-form {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px 20px 0 0;
  padding: 28px 20px 40px;
  width: 100%;
  max-width: 480px;
}

@media (min-width: 640px) {
  .quest-form {
    border-radius: 20px;
  }
}

.quest-form__title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0 0 20px;
}

.quest-form__label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 6px;
}

.quest-form__input {
  width: 100%;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 12px 14px;
  color: white;
  font-size: 15px;
  outline: none;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.quest-form__emojis {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.emoji-btn {
  width: 40px;
  height: 40px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  background: transparent;
  font-size: 20px;
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

.quest-form__submit {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.quest-form__submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .quest-form,
.modal-leave-active .quest-form {
  transition: transform 0.25s ease;
}
.modal-enter-from .quest-form,
.modal-leave-to .quest-form {
  transform: translateY(40px);
}
</style>
