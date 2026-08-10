<!-- src/components/hq/TodayMission.vue -->
<template>
  <section class="mission" :class="{ 'mission--done': hasActedToday }">
    <template v-if="!hasActedToday">
      <span class="mission__badge">Mission du jour</span>
      <p class="mission__text">{{ callToAction }}</p>
      <button class="mission__cta" @click="$emit('act')">+ Enregistrer une action</button>
    </template>

    <template v-else>
      <span class="mission__badge mission__badge--done">✅ Mission accomplie</span>
      <div class="mission__recap">
        <span v-if="todaySummary.total_saved > 0" class="mission__recap-item mission__recap-item--save">
          +{{ formatAmount(todaySummary.total_saved) }} € économisés
        </span>
        <span v-if="todaySummary.total_spent > 0" class="mission__recap-item mission__recap-item--spend">
          -{{ formatAmount(todaySummary.total_spent) }} € dépensés
        </span>
        <span class="mission__recap-item mission__recap-item--xp">⚡ +{{ todaySummary.total_xp }} XP</span>
      </div>
      <button class="mission__cta mission__cta--secondary" @click="$emit('act')">
        Ajouter une autre action
      </button>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  hasActedToday: boolean
  todaySummary: { total_saved: number; total_spent: number; total_xp: number }
  streak: number
}>()

defineEmits<{ act: [] }>()

const callToAction = computed(() => {
  if (props.streak > 0) {
    return `Enregistre une action pour garder ta série de ${props.streak} jours 🔥`
  }
  return "Enregistre une économie ou une dépense pour démarrer ta série"
})

function formatAmount(val: number): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)
}
</script>

<style scoped>
.mission {
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.25);
  border-radius: 16px;
  padding: 18px;
}

.mission--done {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.25);
}

.mission__badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a78bfa;
  background: rgba(124, 58, 237, 0.15);
  padding: 3px 10px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.mission__badge--done { color: #4ade80; background: rgba(34, 197, 94, 0.15); }

.mission__text { color: white; font-size: 15px; font-weight: 600; margin: 0 0 14px; }

.mission__recap { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }

.mission__recap-item {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
}

.mission__recap-item--save { color: #4ade80; }
.mission__recap-item--spend { color: #f87171; }
.mission__recap-item--xp { color: #a78bfa; }

.mission__cta {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.mission__cta:hover { opacity: 0.9; }

.mission__cta--secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}
</style>
