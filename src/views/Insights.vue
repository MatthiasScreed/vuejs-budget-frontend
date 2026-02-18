<!-- src/views/Insights.vue -->
<template>
  <div class="insights-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">💡 Coach IA</h1>
          <p class="page-subtitle">Recommandations personnalisées pour optimiser votre budget</p>
        </div>
      </div>
    </div>

    <!-- Panel principal -->
    <InsightsPanel />
  </div>
</template>

<script setup lang="ts">
import InsightsPanel from '@/components/insights/InsightsPanel.vue'
import { onMounted } from 'vue'

onMounted(() => {
  console.log('📊 Insights page mounted')
})
</script>

<style scoped>
/* ========================================== */
/* LAYOUT */
/* ========================================== */
.insights-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
}

/* ========================================== */
/* HEADER */
/* ========================================== */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .header-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.header-text {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
}

/* ========================================== */
/* RESPONSIVE */
/* ========================================== */
@media (max-width: 640px) {
  .insights-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }
}

/* ========================================== */
/* SAFE AREAS (iPhone) */
/* ========================================== */
@supports (padding: env(safe-area-inset-bottom)) {
  .insights-page {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}
</style>
