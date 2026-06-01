<!-- src/components/landing/BenefitsSection.vue -->
<template>
  <section class="benefits-section">
    <div class="container">
      <h2 class="section-title">{{ t('landing.benefitsTitle') }}</h2>
      <p class="section-subtitle">{{ t('landing.benefitsSubtitle') }}</p>

      <div class="benefits-grid">
        <BenefitCard v-for="benefit in benefits" :key="benefit.id" :benefit="benefit" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BenefitCard from './BenefitCard.vue'
import type { Benefit } from '@/types/landing.types'

const { t } = useI18n()

const benefits = computed<Benefit[]>(() => [
  {
    id: 'quest',
    icon: '🎯',
    title: 'Une quête, un objectif',
    description:
      "Choisis ce qui te motive vraiment : voyage, MacBook, fonds d'urgence… et suis ta progression chaque jour.",
    example: 'Exemple : Voyage au Japon — 1 250 € / 3 000 €',
  },
  {
    id: 'streak',
    icon: '🔥',
    title: 'Série quotidienne',
    description:
      'Chaque jour où tu enregistres une action, ta série grandit. Plus elle est longue, plus tu gagnes de points.',
    example: 'Exemple : 🔥 17 jours de série',
  },
  {
    id: 'actions',
    icon: '⚡',
    title: 'Action en 30 secondes',
    description:
      'Enregistre une économie ou une dépense en moins de 30 secondes. Pas de tableau, pas de complexité.',
    example: "Exemple : +15 € — J'ai cuisiné",
  },
  {
    id: 'levels',
    icon: '⭐',
    title: 'Niveaux et XP',
    description:
      "Chaque action te rapporte de l'expérience. Monte en niveau, débloque des badges, reste motivé.",
    example: 'Exemple : Niveau 8 — 1 505 XP',
  },
  {
    id: 'challenges',
    icon: '🏆',
    title: 'Défi du jour',
    description:
      "Un mini-défi quotidien pour t'encourager à aller plus loin : pas de livraison, moins de 5 € dépensés…",
    example: 'Récompense : +20 XP bonus',
  },
  {
    id: 'mobile',
    icon: '📱',
    title: 'Partout, tout le temps',
    description: t('benefits.mobileDesc', 'Suivez vos finances partout, sur tous vos appareils.'),
    example: t('benefits.mobileEx', 'iOS, Android et Web'),
  },
])
</script>

<style scoped>
.benefits-section {
  padding: 6rem 2rem;
  background: #f8f9fa;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1rem;
  color: #1a202c;
}
.section-subtitle {
  font-size: 1.25rem;
  text-align: center;
  color: #718096;
  margin-bottom: 4rem;
}
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .benefits-section {
    padding: 4rem 1.5rem;
  }
  .section-title {
    font-size: 2rem;
  }
  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
