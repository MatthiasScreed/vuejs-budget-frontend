<!-- src/components/hq/YesterdayJournal.vue -->
<template>
  <section class="journal">
    <span class="journal__badge">📖 Hier</span>

    <p v-if="!summary.has_acted" class="journal__empty">
      Aucune action enregistrée hier.
    </p>

    <template v-else>
      <div class="journal__recap">
        <span v-if="summary.total_saved > 0" class="journal__item journal__item--save">
          +{{ formatAmount(summary.total_saved) }} € économisés
        </span>
        <span v-if="summary.total_spent > 0" class="journal__item journal__item--spend">
          -{{ formatAmount(summary.total_spent) }} € dépensés
        </span>
        <span class="journal__item journal__item--xp">⚡ +{{ summary.total_xp }} XP</span>
      </div>

      <p v-if="impactText" class="journal__impact" :class="impactClass">{{ impactText }}</p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectionImpact } from '@/stores/Queststore.ts'

const props = defineProps<{
  summary: { total_saved: number; total_spent: number; total_xp: number; has_acted: boolean }
  impact: ProjectionImpact | null
}>()

const impactText = computed(() => {
  if (!props.impact || props.impact.days_saved === 0) return null

  return props.impact.days_saved > 0
    ? `🚀 Ça t'a fait avancer ton objectif de ${props.impact.days_saved} jour${props.impact.days_saved > 1 ? 's' : ''} !`
    : `⏳ Ça a repoussé ton objectif de ${Math.abs(props.impact.days_saved)} jour${Math.abs(props.impact.days_saved) > 1 ? 's' : ''}.`
})

const impactClass = computed(() =>
  (props.impact?.days_saved ?? 0) >= 0 ? 'journal__impact--positive' : 'journal__impact--negative',
)

function formatAmount(val: number): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)
}
</script>

<style scoped>
.journal {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
}

.journal__badge { display: block; font-size: 12px; font-weight: 700; color: rgba(255, 255, 255, 0.5); margin-bottom: 10px; }
.journal__empty { font-size: 13px; color: rgba(255, 255, 255, 0.4); margin: 0; }

.journal__recap { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }

.journal__item {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
}

.journal__item--save { color: #4ade80; }
.journal__item--spend { color: #f87171; }
.journal__item--xp { color: #a78bfa; }

.journal__impact { font-size: 13px; font-weight: 600; margin: 0; }
.journal__impact--positive { color: #4ade80; }
.journal__impact--negative { color: #f87171; }
</style>
