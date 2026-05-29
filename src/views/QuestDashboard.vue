<template>
  <div class="quest-dashboard">

    <!-- ═══════════════════════════════════════
         HEADER — Streak + Niveau
    ══════════════════════════════════════════ -->
    <header class="quest-header">
      <div class="header-left">
        <div class="streak-badge" :class="{ 'streak-danger': isStreakDanger }">
          <span class="streak-fire">🔥</span>
          <span class="streak-count">{{ currentStreakCount }}</span>
          <span class="streak-label">jours</span>
        </div>
      </div>

      <div class="header-center">
        <img src="/icons/icon-72x72.png" alt="CoinQuest" class="logo" />
      </div>

      <div class="header-right">
        <div class="level-badge">
          <span class="level-label">Niv.</span>
          <span class="level-number">{{ gamingStore.player.level }}</span>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════
         XP BAR
    ══════════════════════════════════════════ -->
    <div class="xp-bar-container">
      <div class="xp-bar-track">
        <div
          class="xp-bar-fill"
          :style="{ width: gamingStore.xpPercentage + '%' }"
        ></div>
      </div>
      <span class="xp-text">
        {{ gamingStore.player.currentXP }} / {{ gamingStore.player.maxXP }} XP
      </span>
    </div>

    <!-- ═══════════════════════════════════════
         ÉTAT CHARGEMENT
    ══════════════════════════════════════════ -->
    <div v-if="goalStore.loading" class="loading-state">
      <div class="loading-orb"></div>
      <p>Chargement de ta quête...</p>
    </div>

    <!-- ═══════════════════════════════════════
         PAS DE QUÊTE — Onboarding CTA
    ══════════════════════════════════════════ -->
    <div v-else-if="!mainGoal" class="empty-quest">
      <div class="empty-orb">🗺️</div>
      <h2>Aucune quête active</h2>
      <p>Crée ton premier objectif pour commencer l'aventure</p>
      <button class="btn-create-quest" @click="$router.push('/app/goals')">
        ⚔️ Créer ma quête
      </button>
    </div>

    <!-- ═══════════════════════════════════════
         CARTE QUÊTE PRINCIPALE
    ══════════════════════════════════════════ -->
    <div v-else class="quest-main">

      <!-- Nom de la quête -->
      <div class="quest-card">
        <div class="quest-card-top">
          <span class="quest-icon">{{ questIcon }}</span>
          <div class="quest-info">
            <h1 class="quest-name">{{ mainGoal.name }}</h1>
            <p class="quest-remaining">
              Plus que <strong>{{ formatCurrency(goalStore.calculateRemaining(mainGoal)) }}</strong>
            </p>
          </div>
          <button class="btn-quest-menu" @click="showGoalSelector = !showGoalSelector">
            ⋮
          </button>
        </div>

        <!-- Barre de progression -->
        <div class="progress-section">
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: progressPercent + '%' }"
            >
              <div class="progress-glow"></div>
            </div>
          </div>

          <div class="progress-stats">
            <span class="progress-current">{{ formatCurrency(mainGoal.current_amount) }}</span>
            <span class="progress-percent">{{ progressPercent }}%</span>
            <span class="progress-target">{{ formatCurrency(mainGoal.target_amount) }}</span>
          </div>
        </div>

        <!-- Date cible si définie -->
        <div v-if="daysRemaining !== null" class="quest-deadline">
          <span v-if="daysRemaining > 0">📅 {{ daysRemaining }} jours restants</span>
          <span v-else class="deadline-passed">⚠️ Échéance dépassée</span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════
           DÉFI DU JOUR
      ══════════════════════════════════════════ -->
      <div v-if="dailyChallenge" class="challenge-card" :class="{ 'challenge-done': dailyChallenge.completed }">
        <div class="challenge-header">
          <span class="challenge-tag">🎯 Défi du jour</span>
          <span class="challenge-reward">+{{ dailyChallenge.xp_reward }} XP</span>
        </div>
        <p class="challenge-text">{{ dailyChallenge.title }}</p>
        <button
          v-if="!dailyChallenge.completed"
          class="btn-challenge"
          :disabled="completingChallenge"
          @click="completeChallenge"
        >
          {{ completingChallenge ? '...' : '✓ Relevé !' }}
        </button>
        <div v-else class="challenge-completed-badge">
          ✅ Complété
        </div>
      </div>

      <!-- ═══════════════════════════════════════
           ACTIONS RAPIDES
      ══════════════════════════════════════════ -->
      <div class="quick-actions">
        <button class="btn-action btn-save" @click="openAction('save')">
          <span class="action-icon">💰</span>
          <span class="action-label">J'ai économisé</span>
        </button>
        <button class="btn-action btn-spend" @click="openAction('spend')">
          <span class="action-icon">💸</span>
          <span class="action-label">J'ai dépensé</span>
        </button>
      </div>

      <!-- Message de momentum -->
      <p class="momentum-message">{{ momentumMessage }}</p>

    </div>

    <!-- ═══════════════════════════════════════
         SÉLECTEUR DE QUÊTE (dropdown)
    ══════════════════════════════════════════ -->
    <Transition name="slide-up">
      <div v-if="showGoalSelector" class="goal-selector-overlay" @click.self="showGoalSelector = false">
        <div class="goal-selector">
          <h3>Changer de quête</h3>
          <button
            v-for="goal in goalStore.activeGoals"
            :key="goal.id"
            class="goal-selector-item"
            :class="{ active: goal.id === mainGoal?.id }"
            @click="selectGoal(goal)"
          >
            <span>{{ getGoalIcon(goal.name) }} {{ goal.name }}</span>
            <span class="goal-selector-progress">{{ goalStore.calculateProgress(goal) }}%</span>
          </button>
          <button class="goal-selector-new" @click="$router.push('/app/goals')">
            ➕ Nouvel objectif
          </button>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════
         MODAL ACTION RAPIDE
    ══════════════════════════════════════════ -->
    <Transition name="slide-up">
      <div v-if="showActionModal" class="action-overlay" @click.self="closeAction">
        <div class="action-modal">

          <!-- Header modal -->
          <div class="modal-header">
            <span class="modal-title">
              {{ actionType === 'save' ? '💰 Économie enregistrée' : '💸 Dépense enregistrée' }}
            </span>
            <button class="modal-close" @click="closeAction">✕</button>
          </div>

          <!-- Montant -->
          <div class="amount-display">
            <span class="amount-sign" :class="actionType === 'save' ? 'sign-plus' : 'sign-minus'">
              {{ actionType === 'save' ? '+' : '-' }}
            </span>
            <span class="amount-value">{{ actionAmount || '0' }}</span>
            <span class="amount-currency">€</span>
          </div>

          <!-- Clavier numérique -->
          <div class="numpad">
            <button
              v-for="key in numpadKeys"
              :key="key"
              class="numpad-key"
              :class="{ 'numpad-zero': key === '0', 'numpad-delete': key === '⌫' }"
              @click="handleNumpad(key)"
            >
              {{ key }}
            </button>
          </div>

          <!-- Raisons (économie) -->
          <div v-if="actionType === 'save'" class="reasons-grid">
            <button
              v-for="reason in saveReasons"
              :key="reason.label"
              class="reason-btn"
              :class="{ selected: selectedReason === reason.label }"
              @click="selectedReason = reason.label"
            >
              {{ reason.emoji }} {{ reason.label }}
            </button>
          </div>

          <!-- Description (dépense) -->
          <div v-if="actionType === 'spend'" class="spend-input">
            <input
              v-model="spendDescription"
              type="text"
              placeholder="Kebab, Netflix, Amazon..."
              class="spend-desc-input"
              maxlength="50"
            />
          </div>

          <!-- Impact quête -->
          <div v-if="actionAmount && actionType === 'save' && mainGoal" class="impact-preview">
            <span class="impact-text">
              🎯 +{{ ((parseFloat(actionAmount) / goalStore.calculateRemaining(mainGoal)) * 100).toFixed(1) }}%
              vers {{ mainGoal.name }}
            </span>
          </div>

          <!-- Bouton confirmer -->
          <button
            class="btn-confirm"
            :class="actionType === 'save' ? 'btn-confirm-save' : 'btn-confirm-spend'"
            :disabled="!actionAmount || submitting"
            @click="submitAction"
          >
            <span v-if="submitting">...</span>
            <span v-else>
              {{ actionType === 'save' ? '✓ Confirmer l\'économie' : '✓ Enregistrer la dépense' }}
            </span>
          </button>

        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════
         ANIMATION XP GAIN
    ══════════════════════════════════════════ -->
    <Transition name="xp-pop">
      <div v-if="showXPGain" class="xp-gain-popup">
        +{{ lastXPGain }} XP ⚡
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGoalStore } from '@/stores/goalStore'
import { useGamingStore } from '@/stores/gamingStore'
import { useStreakStore } from '@/stores/streakStore'
import { useChallengeStore } from '@/stores/challengeStore'
import type { FinancialGoal } from '@/types/entities/gaming'

// ─── Stores ───────────────────────────────
const goalStore     = useGoalStore()
const gamingStore   = useGamingStore()
const streakStore   = useStreakStore()
const challengeStore = useChallengeStore()

// ─── État local ───────────────────────────
const selectedGoalId    = ref<number | null>(null)
const showActionModal   = ref(false)
const showGoalSelector  = ref(false)
const actionType        = ref<'save' | 'spend'>('save')
const actionAmount      = ref('')
const selectedReason    = ref('')
const spendDescription  = ref('')
const submitting        = ref(false)
const completingChallenge = ref(false)
const showXPGain        = ref(false)
const lastXPGain        = ref(0)

// ─── Constantes ───────────────────────────
const saveReasons = [
  { emoji: '🍳', label: 'Cuisiné' },
  { emoji: '🚶', label: 'Transports' },
  { emoji: '❌', label: 'Évité achat' },
  { emoji: '✨', label: 'Autre' },
]

const numpadKeys = ['1','2','3','4','5','6','7','8','9','.','0','⌫']

// ─── Computed ─────────────────────────────
const mainGoal = computed<FinancialGoal | null>(() => {
  if (selectedGoalId.value) {
    return goalStore.goals.find(g => g.id === selectedGoalId.value) || null
  }
  return goalStore.activeGoals[0] || null
})

const progressPercent = computed(() => {
  if (!mainGoal.value) return 0
  return goalStore.calculateProgress(mainGoal.value)
})

const daysRemaining = computed(() => {
  if (!mainGoal.value?.target_date) return null
  return goalStore.calculateDaysRemaining(mainGoal.value)
})

const currentStreakCount = computed(() =>
  streakStore.longestActiveStreak?.current_count ?? gamingStore.player.currentStreak
)

const isStreakDanger = computed(() =>
  streakStore.streaksNeedingAttention.length > 0
)

const dailyChallenge = computed(() => {
  const active = challengeStore.activeChallenges[0]
  if (!active) return null
  const userChallenge = challengeStore.userChallenges.find(uc => uc.challenge_id === active.id)
  return {
    ...active,
    completed: userChallenge?.status === 'completed',
    xp_reward: active.xp_reward ?? 20
  }
})

const questIcon = computed(() => mainGoal.value ? getGoalIcon(mainGoal.value.name) : '🎯')

const momentumMessage = computed(() => {
  const pct = progressPercent.value
  if (pct >= 90) return '🔥 Tu y es presque ! Un dernier effort !'
  if (pct >= 75) return '⚡ Excellent rythme, continue comme ça !'
  if (pct >= 50) return '💪 Mi-chemin, tu avances bien !'
  if (pct >= 25) return '🚀 Bonne dynamique, garde le cap !'
  return '🌱 Chaque euro compte. C\'est parti !'
})

// ─── Méthodes ─────────────────────────────
function getGoalIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('voyage') || n.includes('japan') || n.includes('vacance')) return '✈️'
  if (n.includes('voiture') || n.includes('auto') || n.includes('car')) return '🚗'
  if (n.includes('maison') || n.includes('appart') || n.includes('immo')) return '🏠'
  if (n.includes('mac') || n.includes('pc') || n.includes('ordi')) return '💻'
  if (n.includes('urgence') || n.includes('épargne')) return '🛡️'
  if (n.includes('permis')) return '🪪'
  if (n.includes('formation') || n.includes('étude')) return '🎓'
  if (n.includes('mariage') || n.includes('fête')) return '🎉'
  return '🎯'
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount)
}

function openAction(type: 'save' | 'spend'): void {
  actionType.value = type
  actionAmount.value = ''
  selectedReason.value = ''
  spendDescription.value = ''
  showActionModal.value = true
}

function closeAction(): void {
  showActionModal.value = false
}

function selectGoal(goal: FinancialGoal): void {
  selectedGoalId.value = goal.id
  showGoalSelector.value = false
}

function handleNumpad(key: string): void {
  if (key === '⌫') {
    actionAmount.value = actionAmount.value.slice(0, -1)
    return
  }
  if (key === '.' && actionAmount.value.includes('.')) return
  if (actionAmount.value.length >= 7) return
  actionAmount.value += key
}

async function submitAction(): Promise<void> {
  if (!actionAmount.value || !mainGoal.value) return

  submitting.value = true
  const amount = parseFloat(actionAmount.value)

  try {
    if (actionType.value === 'save') {
      await goalStore.addContribution(
        mainGoal.value.id,
        amount,
        selectedReason.value || 'Économie manuelle'
      )
      await streakStore.recordSavingsActivity(amount)
      triggerXPGain(10)
    } else {
      // Enregistrement dépense via transactionStore si disponible
      await streakStore.recordTransactionActivity()
      triggerXPGain(5)
    }
    closeAction()
  } finally {
    submitting.value = false
  }
}

async function completeChallenge(): Promise<void> {
  if (!dailyChallenge.value) return
  completingChallenge.value = true
  try {
    await challengeStore.joinChallenge(dailyChallenge.value.id)
    triggerXPGain(dailyChallenge.value.xp_reward)
  } finally {
    completingChallenge.value = false
  }
}

function triggerXPGain(xp: number): void {
  lastXPGain.value = xp
  showXPGain.value = true
  setTimeout(() => { showXPGain.value = false }, 1500)
}

// ─── Lifecycle ────────────────────────────
onMounted(async () => {
  await Promise.all([
    goalStore.fetchGoals(),
    streakStore.fetchStreaks(),
    challengeStore.fetchChallenges?.(),
  ])
})
</script>

<style scoped>
/* ═══════════════════════════════════════════
   BASE
══════════════════════════════════════════ */
.quest-dashboard {
  min-height: 100vh;
  background: linear-gradient(160deg, #0f0f23 0%, #1a1a2e 60%, #16213e 100%);
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
  padding-bottom: calc(env(safe-area-inset-bottom) + 80px);
  position: relative;
  overflow-x: hidden;
}

/* ═══════════════════════════════════════════
   HEADER
══════════════════════════════════════════ */
.quest-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 16px) 20px 12px;
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 107, 0, 0.15);
  border: 1px solid rgba(255, 107, 0, 0.3);
  border-radius: 20px;
  padding: 6px 12px;
  transition: all 0.3s;
}

.streak-badge.streak-danger {
  background: rgba(255, 50, 50, 0.2);
  border-color: rgba(255, 50, 50, 0.5);
  animation: pulse-danger 1s infinite;
}

@keyframes pulse-danger {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.streak-fire { font-size: 16px; }
.streak-count { font-size: 18px; font-weight: 700; color: #ff6b00; }
.streak-label { font-size: 11px; color: rgba(255,255,255,0.5); }

.level-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 6px 12px;
}

.level-label { font-size: 11px; color: rgba(255,255,255,0.5); }
.level-number { font-size: 18px; font-weight: 700; color: #a78bfa; }

/* ═══════════════════════════════════════════
   XP BAR
══════════════════════════════════════════ */
.xp-bar-container {
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.xp-bar-track {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.xp-text {
  font-size: 10px;
  color: rgba(255,255,255,0.35);
  white-space: nowrap;
}

/* ═══════════════════════════════════════════
   LOADING & EMPTY
══════════════════════════════════════════ */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: rgba(255,255,255,0.4);
}

.loading-orb {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid rgba(139, 92, 246, 0.3);
  border-top-color: #a78bfa;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-quest {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  gap: 12px;
  text-align: center;
}

.empty-orb { font-size: 64px; }
.empty-quest h2 { font-size: 22px; font-weight: 700; margin: 0; }
.empty-quest p { color: rgba(255,255,255,0.4); margin: 0; font-size: 14px; }

.btn-create-quest {
  margin-top: 16px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.btn-create-quest:active { transform: scale(0.96); opacity: 0.9; }

/* ═══════════════════════════════════════════
   QUEST MAIN CONTENT
══════════════════════════════════════════ */
.quest-main {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ─── Quest Card ─── */
.quest-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(8px);
}

.quest-card-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.quest-icon { font-size: 36px; line-height: 1; }

.quest-info { flex: 1; }

.quest-name {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #f1f5f9;
  line-height: 1.2;
}

.quest-remaining {
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  margin: 0;
}

.quest-remaining strong { color: #a78bfa; }

.btn-quest-menu {
  background: none;
  border: none;
  color: rgba(255,255,255,0.3);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

/* ─── Progress ─── */
.progress-section { margin-bottom: 12px; }

.progress-track {
  height: 12px;
  background: rgba(255,255,255,0.07);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 6px;
  position: relative;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 4px;
}

.progress-glow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 8px #34d399;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.progress-current { color: #34d399; font-weight: 600; }
.progress-percent { color: rgba(255,255,255,0.7); font-weight: 700; font-size: 14px; }
.progress-target { color: rgba(255,255,255,0.35); }

.quest-deadline {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  text-align: center;
}

.deadline-passed { color: #f87171; }

/* ─── Challenge Card ─── */
.challenge-card {
  background: rgba(234, 179, 8, 0.08);
  border: 1px solid rgba(234, 179, 8, 0.2);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.3s;
}

.challenge-card.challenge-done {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.challenge-tag { font-size: 12px; color: #fbbf24; font-weight: 600; }
.challenge-reward {
  font-size: 12px;
  background: rgba(234, 179, 8, 0.15);
  color: #fbbf24;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.challenge-text {
  font-size: 15px;
  color: #f1f5f9;
  margin: 0 0 12px;
}

.btn-challenge {
  width: 100%;
  padding: 10px;
  background: rgba(234, 179, 8, 0.15);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: 10px;
  color: #fbbf24;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-challenge:active { transform: scale(0.97); }
.btn-challenge:disabled { opacity: 0.5; cursor: not-allowed; }

.challenge-completed-badge {
  text-align: center;
  color: #34d399;
  font-size: 14px;
  font-weight: 600;
}

/* ─── Quick Actions ─── */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 12px;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.btn-action:active { transform: scale(0.95); opacity: 0.9; }

.btn-save {
  background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1));
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.btn-spend {
  background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(248,113,113,0.1));
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-icon { font-size: 28px; }

.action-label {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.momentum-message {
  text-align: center;
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  margin: 0;
  padding: 4px 0;
}

/* ═══════════════════════════════════════════
   GOAL SELECTOR
══════════════════════════════════════════ */
.goal-selector-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 50;
  display: flex;
  align-items: flex-end;
}

.goal-selector {
  width: 100%;
  background: #1a1a2e;
  border-top: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px 20px 0 0;
  padding: 20px 20px calc(env(safe-area-inset-bottom) + 20px);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goal-selector h3 {
  font-size: 14px;
  color: rgba(255,255,255,0.4);
  margin: 0 0 8px;
  text-align: center;
}

.goal-selector-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.goal-selector-item.active {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
}

.goal-selector-progress { color: rgba(255,255,255,0.4); font-size: 13px; }

.goal-selector-new {
  padding: 14px;
  background: none;
  border: 1px dashed rgba(255,255,255,0.15);
  border-radius: 12px;
  color: rgba(255,255,255,0.4);
  font-size: 14px;
  cursor: pointer;
  text-align: center;
}

/* ═══════════════════════════════════════════
   ACTION MODAL
══════════════════════════════════════════ */
.action-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.action-modal {
  width: 100%;
  background: #1a1a2e;
  border-top: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px 24px 0 0;
  padding: 20px 20px calc(env(safe-area-inset-bottom) + 16px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title { font-size: 16px; font-weight: 600; }

.modal-close {
  background: rgba(255,255,255,0.08);
  border: none;
  color: rgba(255,255,255,0.5);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─── Amount display ─── */
.amount-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
}

.amount-sign { font-size: 28px; font-weight: 700; }
.sign-plus { color: #34d399; }
.sign-minus { color: #f87171; }

.amount-value {
  font-size: 52px;
  font-weight: 700;
  color: #f1f5f9;
  font-variant-numeric: tabular-nums;
  min-width: 80px;
  text-align: center;
}

.amount-currency { font-size: 24px; color: rgba(255,255,255,0.4); }

/* ─── Numpad ─── */
.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.numpad-key {
  padding: 16px 8px;
  background: rgba(255,255,255,0.06);
  border: none;
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.numpad-key:active { background: rgba(255,255,255,0.14); }
.numpad-delete { color: rgba(255,255,255,0.4); font-size: 18px; }

/* ─── Reasons ─── */
.reasons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.reason-btn {
  padding: 10px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.reason-btn.selected {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.4);
  color: #a78bfa;
}

/* ─── Spend input ─── */
.spend-desc-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
}

.spend-desc-input::placeholder { color: rgba(255,255,255,0.25); }
.spend-desc-input:focus { border-color: rgba(139, 92, 246, 0.4); }

/* ─── Impact preview ─── */
.impact-preview {
  text-align: center;
  padding: 8px;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 10px;
}

.impact-text { font-size: 13px; color: #34d399; font-weight: 600; }

/* ─── Confirm button ─── */
.btn-confirm {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-confirm:not(:disabled):active { transform: scale(0.97); }

.btn-confirm-save {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-confirm-spend {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

/* ═══════════════════════════════════════════
   XP GAIN POPUP
══════════════════════════════════════════ */
.xp-gain-popup {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 24px;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 50px;
  z-index: 200;
  pointer-events: none;
}

/* ═══════════════════════════════════════════
   TRANSITIONS
══════════════════════════════════════════ */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.xp-pop-enter-active { animation: xp-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.xp-pop-leave-active { animation: xp-fade 0.3s ease forwards; }

@keyframes xp-bounce {
  from { transform: translateX(-50%) scale(0.5); opacity: 0; }
  to   { transform: translateX(-50%) scale(1);   opacity: 1; }
}

@keyframes xp-fade {
  from { transform: translateX(-50%) translateY(0); opacity: 1; }
  to   { transform: translateX(-50%) translateY(-30px); opacity: 0; }
}
</style>
