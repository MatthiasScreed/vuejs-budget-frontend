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

/**
 * Bénéfices traduits via i18n
 * École 42: Computed réactif à la locale
 */
const benefits = computed<Benefit[]>(() => [
  {
    id: 'goals',
    icon: '🎯',
    title: t('benefits.goalsTitle', 'Objectifs intelligents'),
    description: t(
      'benefits.goalsDesc',
      'Créez des objectifs réalistes et suivez votre progression en temps réel.',
    ),
    example: t('benefits.goalsEx', 'Exemple : 15 000€ pour un voyage en 18 mois'),
  },
  {
    id: 'automation',
    icon: '🤖',
    title: t('benefits.autoTitle', 'Catégorisation automatique'),
    description: t(
      'benefits.autoDesc',
      "75% de vos transactions sont classées automatiquement grâce à l'IA.",
    ),
    example: t('benefits.autoEx', 'Gain de temps : 2h/mois économisées'),
  },
  {
    id: 'insights',
    icon: '📊',
    title: t('benefits.insightsTitle', 'Analyse détaillée'),
    description: t(
      'benefits.insightsDesc',
      'Visualisez où part votre argent avec des graphiques clairs.',
    ),
    example: t('benefits.insightsEx', "Identifiez 3-5 postes d'optimisation"),
  },
  {
    id: 'projections',
    icon: '🔮',
    title: t('benefits.projectionsTitle', 'Prévisions IA'),
    description: t(
      'benefits.projectionsDesc',
      'Anticipez vos finances futures basées sur vos habitudes.',
    ),
    example: t('benefits.projectionsEx', 'Prédictions à 3, 6 et 12 mois'),
  },
  {
    id: 'security',
    icon: '🔒',
    title: t('benefits.securityTitle', 'Sécurité bancaire'),
    description: t(
      'benefits.securityDesc',
      'Connexion sécurisée PSD2 via Bridge. Vos données restent en France.',
    ),
    example: t('benefits.securityEx', 'Certifié ACPR et agrégateur officiel'),
  },
  {
    id: 'mobile',
    icon: '📱',
    title: t('benefits.mobileTitle', 'Application mobile'),
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
