<!-- src/components/hq/MainGoalCard.vue -->
<template>
  <section v-if="quest" class="goal-card">
    <div class="goal-card__top">
      <div class="goal-card__info">
        <span class="goal-card__emoji">{{ quest.emoji }}</span>
        <div>
          <h1 class="goal-card__name">{{ quest.name }}</h1>
          <p class="goal-card__amounts">
            <strong>{{ formatAmount(quest.current_amount) }} €</strong>
            <span> / {{ formatAmount(quest.target_amount) }} €</span>
          </p>
        </div>
      </div>
      <div class="goal-card__pct">{{ quest.progress_percentage }}%</div>
    </div>

    <div class="goal-progress">
      <div
        class="goal-progress__bar"
        :style="{ width: quest.progress_percentage + '%' }"
        :class="quest.is_completed ? 'goal-progress__bar--done' : ''"
      />
    </div>

    <div class="goal-card__bottom">
      <span class="goal-remaining">{{ formatAmount(quest.remaining_amount) }} € restants</span>
      <span v-if="quest.days_remaining !== null" class="goal-deadline">
        {{ quest.days_remaining }}j
      </span>
    </div>
  </section>

  <section v-else class="goal-empty" @click="$emit('create')">
    <span class="goal-empty__icon">🎯</span>
    <p class="goal-empty__text">Crée ta première quête</p>
    <span class="goal-empty__cta">Commencer →</span>
  </section>
</template>

<script setup lang="ts">
import type { Quest } from '@/stores/Queststore.ts'

defineProps<{ quest: Quest | null }>()
defineEmits<{ create: [] }>()

function formatAmount(val: number): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)
}
</script>

<style scoped>
.goal-card {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 24px;
}

.goal-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.goal-card__info { display: flex; align-items: center; gap: 12px; }
.goal-card__emoji { font-size: 36px; }
.goal-card__name { font-size: 18px; font-weight: 700; color: white; margin: 0 0 4px; }
.goal-card__amounts { font-size: 14px; color: rgba(255, 255, 255, 0.7); margin: 0; }
.goal-card__amounts strong { color: #a78bfa; font-size: 16px; }
.goal-card__pct { font-size: 28px; font-weight: 800; color: #a78bfa; flex-shrink: 0; }

.goal-progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.goal-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a78bfa);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.goal-progress__bar--done { background: linear-gradient(90deg, #16a34a, #4ade80); }

.goal-card__bottom { display: flex; justify-content: space-between; align-items: center; }
.goal-remaining { font-size: 13px; color: rgba(255, 255, 255, 0.5); }
.goal-deadline { font-size: 12px; color: rgba(255, 255, 255, 0.4); }

.goal-empty {
  background: rgba(255, 255, 255, 0.04);
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.goal-empty:hover { border-color: rgba(139, 92, 246, 0.5); }
.goal-empty__icon { font-size: 40px; display: block; margin-bottom: 8px; }
.goal-empty__text { color: rgba(255, 255, 255, 0.6); margin: 0 0 8px; }
.goal-empty__cta { color: #a78bfa; font-weight: 600; font-size: 14px; }
</style>
