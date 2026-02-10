<!-- src/components/landing/BenefitsSection.vue -->

<template>
  <section class="benefits-section">
    <div class="container">
      <h2 class="section-title">Pourquoi CoinQuest fonctionne ?</h2>
      <p class="section-subtitle">Des résultats concrets, pas des promesses</p>

      <div class="benefits-grid">
        <BenefitCard v-for="benefit in benefits" :key="benefit.id" :benefit="benefit" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BenefitCard from './BenefitCard.vue'
import type { Benefit } from '@/types/landing.types'

/**
 * Liste des bénéfices
 * École 42: Données séparées de la logique
 */
const benefits = ref<Benefit[]>([
  {
    id: 'goals',
    icon: '🎯',
    title: 'Objectifs intelligents',
    description: 'Créez des objectifs réalistes et suivez votre progression en temps réel.',
    example: 'Exemple : 15 000€ pour un voyage en 18 mois',
  },
  {
    id: 'automation',
    icon: '🤖',
    title: 'Catégorisation automatique',
    description: "75% de vos transactions sont classées automatiquement grâce à l'IA.",
    example: 'Gain de temps : 2h/mois économisées',
  },
  {
    id: 'insights',
    icon: '📊',
    title: 'Analyse détaillée',
    description: 'Visualisez où part votre argent avec des graphiques clairs.',
    example: "Identifiez 3-5 postes d'optimisation",
  },
  {
    id: 'projections',
    icon: '🔮',
    title: 'Prévisions IA',
    description: 'Anticipez vos finances futures basées sur vos habitudes.',
    example: 'Prédictions à 3, 6 et 12 mois',
  },
  {
    id: 'security',
    icon: '🔒',
    title: 'Sécurité bancaire',
    description: 'Connexion sécurisée PSD2 via Bridge. Vos données restent en France.',
    example: 'Certifié ACPR et agrégateur officiel',
  },
  {
    id: 'mobile',
    icon: '📱',
    title: 'Application mobile',
    description: 'Suivez vos finances partout, sur tous vos appareils.',
    example: 'iOS, Android et Web',
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

/* Responsive */
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
