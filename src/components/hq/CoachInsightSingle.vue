<!-- src/components/hq/CoachInsightSingle.vue -->
<template>
  <section class="coach">
    <div class="coach__header">
      <span class="coach__badge">🧠 Coach IA</span>
      <RouterLink v-if="insights.length > 1" to="/app/insights" class="coach__more">
        Voir tout ({{ insights.length }}) →
      </RouterLink>
    </div>

    <div v-if="loading" class="coach__skeleton" />

    <div v-else-if="!topInsight" class="coach__empty">
      <p>Pas encore d'analyse. Le coach observe tes premières actions.</p>
    </div>

    <div v-else class="coach__card" @click="handleRead(topInsight)">
      <div class="coach__icon">{{ topInsight.icon || '💡' }}</div>
      <div class="coach__body">
        <h4 class="coach__title">{{ topInsight.title }}</h4>
        <p class="coach__desc">{{ topInsight.description }}</p>

        <button
          v-if="topInsight.action_label && !topInsight.acted_at"
          class="coach__cta"
          :disabled="actionLoading === topInsight.id"
          @click.stop="handleAction(topInsight)"
        >
          {{ actionLoading === topInsight.id ? '…' : `⚡ ${topInsight.action_label}` }}
        </button>
        <span v-else-if="topInsight.acted_at" class="coach__done">✅ Action effectuée</span>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div v-if="showXpToast" class="coach__xp-toast">✨ +{{ lastXpEarned }} XP</div>
    </Transition>

    <CoachActionModal
      v-model="showActionModal"
      :insight="activeInsight"
      :action="activeAction"
      @success="handleModalSuccess"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useInsights } from '@/composables/useInsights'
import { useInsightAction } from '@/composables/useInsightAction'
import CoachActionModal from '@/components/insights/CoachActionModal.vue'

const { insights, loading, markAsRead, handleInsightAction } = useInsights()

const {
  showActionModal,
  activeInsight,
  activeAction,
  actionLoading,
  showXpToast,
  lastXpEarned,
  handleAction,
  handleModalSuccess,
} = useInsightAction(handleInsightAction)

const topInsight = computed(() => insights.value[0] ?? null)

async function handleRead(insight: any): Promise<void> {
  if (!insight.is_read) await markAsRead(insight.id)
}
</script>

<style scoped>
.coach {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
}

.coach__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.coach__badge { font-size: 12px; font-weight: 700; color: #fbbf24; }
.coach__more { font-size: 12px; color: #a78bfa; text-decoration: none; }
.coach__more:hover { text-decoration: underline; }

.coach__skeleton {
  height: 64px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.coach__empty { font-size: 13px; color: rgba(255, 255, 255, 0.4); text-align: center; padding: 12px 0; }

.coach__card { display: flex; gap: 12px; cursor: pointer; }

.coach__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(251, 191, 36, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.coach__body { flex: 1; min-width: 0; }
.coach__title { font-size: 14px; font-weight: 700; color: white; margin: 0 0 4px; }
.coach__desc { font-size: 13px; color: rgba(255, 255, 255, 0.6); margin: 0 0 10px; line-height: 1.4; }

.coach__cta {
  padding: 8px 14px;
  background: #7c3aed;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.coach__cta:disabled { opacity: 0.5; cursor: not-allowed; }
.coach__done { font-size: 12px; color: #a78bfa; font-weight: 600; }

.coach__xp-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 50;
  background: #7c3aed;
  color: white;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}
</style>
