<!-- src/views/HqDashboard.vue -->
<template>
  <div class="hq-wrapper">
    <QuestHeader />

    <div class="hq">
      <!-- 1. OBJECTIF PRINCIPAL -->
      <MainGoalCard :quest="questStore.mainQuest" @create="showQuestForm = true" />

      <!-- 2. MISSION DU JOUR -->
      <TodayMission
        v-if="questStore.hasMainQuest"
        :has-acted-today="actionStore.hasActedToday"
        :today-summary="actionStore.todaySummary"
        :streak="currentStreak"
        @act="showActionModal = true"
      />

      <!-- 3. COACH IA -->
      <CoachInsightSingle />

      <!-- 4. DÉFI EN COURS -->
      <CurrentChallengeCard
        :challenge="todayChallenge"
        :completing="completingChallenge"
        @complete="completeChallenge"
      />

      <!-- 5. JOURNAL D'HIER -->
      <YesterdayJournal :summary="actionStore.yesterdaySummary" :impact="questStore.projectionImpact" />

      <!-- MODALS -->
      <ActionModal
        v-model="showActionModal"
        :quest-id="questStore.mainQuest?.id ?? null"
        :quest-name="questStore.mainQuest?.name ?? 'Ma quête'"
        :quest-emoji="questStore.mainQuest?.emoji ?? '🎯'"
      />

      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showQuestForm" class="quest-form-overlay" @click.self="showQuestForm = false">
            <div class="quest-form">
              <h2 class="quest-form__title">Crée ta quête</h2>

              <label class="quest-form__label">Nom de la quête</label>
              <input v-model="newQuest.name" class="quest-form__input" placeholder="Voyage au Japon, MacBook..." />

              <label class="quest-form__label">Montant cible (€)</label>
              <input v-model.number="newQuest.target_amount" type="number" class="quest-form__input" placeholder="3000" />

              <label class="quest-form__label">Date cible (optionnelle)</label>
              <input v-model="newQuest.target_date" type="date" class="quest-form__input" />

              <div class="quest-form__emojis">
                <button
                  v-for="e in questEmojis"
                  :key="e"
                  :class="['emoji-btn', { 'emoji-btn--active': newQuest.emoji === e }]"
                  @click="newQuest.emoji = e"
                >{{ e }}</button>
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

    <QuestBottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ActionModal from '@/components/ActionModal.vue'
import QuestHeader from '@/components/quest/QuestHeader.vue'
import QuestBottomNav from '@/components/quest/QuestBottomNav.vue'
import MainGoalCard from '@/components/hq/MainGoalCard.vue'
import TodayMission from '@/components/hq/TodayMission.vue'
import CoachInsightSingle from '@/components/hq/CoachInsightSingle.vue'
import CurrentChallengeCard from '@/components/hq/CurrentChallengeCard.vue'
import YesterdayJournal from '@/components/hq/YesterdayJournal.vue'
import { useHqDashboard } from '@/composables/useHqDashboard'

const { questStore, actionStore, currentStreak, todayChallenge, completingChallenge, completeChallenge } =
  useHqDashboard()

const showActionModal = ref(false)
const showQuestForm = ref(false)

const newQuest = ref({
  name: '',
  target_amount: null as number | null,
  target_date: '',
  emoji: '🎯',
})

const questEmojis = ['🎯', '✈️', '💻', '🚗', '🏠', '🛡️', '📈', '🎓', '🎉', '💳']

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
.hq-wrapper {
  min-height: 100vh;
  background: #0f0f1a;
  display: flex;
  flex-direction: column;
}

.hq {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 16px 16px 100px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== QUEST FORM (reprise de Dashboard.vue) ===== */
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
  .quest-form-overlay { align-items: center; }
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
  .quest-form { border-radius: 20px; }
}

.quest-form__title { font-size: 20px; font-weight: 700; color: white; margin: 0 0 20px; }

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

.quest-form__emojis { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }

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

.emoji-btn--active { border-color: #7c3aed; background: rgba(124, 58, 237, 0.2); }

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

.quest-form__submit:disabled { opacity: 0.4; cursor: not-allowed; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .quest-form, .modal-leave-active .quest-form { transition: transform 0.25s ease; }
.modal-enter-from .quest-form, .modal-leave-to .quest-form { transform: translateY(40px); }
</style>
