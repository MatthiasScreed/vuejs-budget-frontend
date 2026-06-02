<!-- src/components/quest/QuestMiniCard.vue -->
<!-- Carte quête compacte affichée en haut de chaque page AppLayout -->
<template>
  <div v-if="quest" class="quest-mini-card" @click="goToQuest">
    <div class="quest-mini-card__left">
      <span class="quest-mini-card__emoji">{{ quest.emoji }}</span>
      <div class="quest-mini-card__info">
        <span class="quest-mini-card__name">{{ quest.name }}</span>
        <span class="quest-mini-card__amounts">
          {{ formatAmount(quest.current_amount) }} € / {{ formatAmount(quest.target_amount) }} €
        </span>
      </div>
    </div>

    <div class="quest-mini-card__right">
      <div class="quest-mini-card__pct">{{ quest.progress_percentage }}%</div>
      <div class="quest-mini-card__bar">
        <div class="quest-mini-card__fill" :style="{ width: quest.progress_percentage + '%' }" />
      </div>
      <span class="quest-mini-card__cta">Enregistrer →</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestStore } from '@/stores/Queststore.ts'

const questStore = useQuestStore()
const router = useRouter()

const quest = questStore.mainQuest

onMounted(async () => {
  if (!questStore.mainQuest) {
    await questStore.fetchMainQuest()
  }
})

function goToQuest(): void {
  router.push({ name: 'Quest' })
}

function formatAmount(val: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(val)
}
</script>

<style scoped>
.quest-mini-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.quest-mini-card:hover {
  border-color: rgba(139, 92, 246, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.2);
}

.quest-mini-card__left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.quest-mini-card__emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.quest-mini-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.quest-mini-card__name {
  font-size: 14px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quest-mini-card__amounts {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.quest-mini-card__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.quest-mini-card__pct {
  font-size: 16px;
  font-weight: 800;
  color: #a78bfa;
}

.quest-mini-card__bar {
  width: 80px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.quest-mini-card__fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a78bfa);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.quest-mini-card__cta {
  font-size: 11px;
  color: #a78bfa;
  font-weight: 600;
}
</style>
