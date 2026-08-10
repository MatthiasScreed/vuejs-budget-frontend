<!-- src/components/hq/CurrentChallengeCard.vue -->
<template>
  <section v-if="challenge" class="challenge-card">
    <div class="challenge-card__header">
      <span class="challenge-badge">Défi en cours</span>
      <span class="challenge-xp">+{{ challenge.xp_reward }} XP</span>
    </div>
    <p class="challenge-card__title">{{ challenge.title }}</p>
    <div class="challenge-card__actions">
      <button
        class="challenge-btn challenge-btn--success"
        :disabled="completing"
        @click="$emit('complete', true)"
      >
        {{ completing ? '…' : '✓ Réussi' }}
      </button>
      <button
        class="challenge-btn challenge-btn--fail"
        :disabled="completing"
        @click="$emit('complete', false)"
      >
        ✗ Pas aujourd'hui
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  challenge: { id: number; title: string; xp_reward: number } | null
  completing: boolean
}>()

defineEmits<{ complete: [success: boolean] }>()
</script>

<style scoped>
.challenge-card {
  background: rgba(234, 179, 8, 0.08);
  border: 1px solid rgba(234, 179, 8, 0.25);
  border-radius: 16px;
  padding: 18px;
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

.challenge-xp { font-size: 13px; font-weight: 700; color: #fbbf24; }
.challenge-card__title { color: white; font-size: 15px; font-weight: 600; margin: 0 0 14px; }
.challenge-card__actions { display: flex; gap: 8px; }

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

.challenge-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.challenge-btn:not(:disabled):hover { opacity: 0.85; }
.challenge-btn--success { background: #22c55e; color: white; }
.challenge-btn--fail { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.5); }
</style>
