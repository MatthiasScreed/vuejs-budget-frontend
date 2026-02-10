<!-- src/components/landing/HowItWorksSection.vue -->

<template>
  <section class="how-it-works-section">
    <div class="container">
      <h2 class="section-title">Comment ça marche ?</h2>
      <p class="section-subtitle">3 étapes pour reprendre le contrôle de vos finances</p>

      <div class="steps-container">
        <div v-for="(step, index) in steps" :key="step.id" class="step-card">
          <div class="step-number">
            {{ step.number }}
          </div>

          <div class="step-icon">
            {{ step.icon }}
          </div>

          <h3 class="step-title">
            {{ step.title }}
          </h3>

          <p class="step-description">
            {{ step.description }}
          </p>

          <!-- Flèche de connexion -->
          <div v-if="index < steps.length - 1" class="step-arrow">→</div>
        </div>
      </div>

      <!-- CTA -->
      <div class="cta-container">
        <button class="btn-large" @click="handleCTA">Commencer maintenant</button>
        <p class="cta-note">Essai gratuit de 30 jours • Aucune carte requise</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HowItWorksStep } from '@/types/landing.types'

const steps = ref<HowItWorksStep[]>([
  {
    id: 'connect',
    number: 1,
    title: 'Connectez votre banque',
    description:
      'Connexion sécurisée en 2 minutes via Bridge. Compatible avec plus de 400 banques françaises.',
    icon: '🏦',
  },
  {
    id: 'analyze',
    number: 2,
    title: 'Analysez vos finances',
    description:
      "Notre IA catégorise automatiquement vos transactions et identifie les opportunités d'économies.",
    icon: '📊',
  },
  {
    id: 'achieve',
    number: 3,
    title: 'Atteignez vos objectifs',
    description: 'Créez des objectifs personnalisés et suivez votre progression en temps réel.',
    icon: '🎯',
  },
])

const handleCTA = (): void => {
  window.location.href = '/register'
}
</script>

<style scoped>
.how-it-works-section {
  padding: 6rem 2rem;
  background: white;
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

.steps-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  margin-bottom: 4rem;
  position: relative;
}

.step-card {
  text-align: center;
  position: relative;
}

.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  margin: 0 auto 1.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.step-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
}

.step-description {
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.6;
}

.step-arrow {
  position: absolute;
  right: -3rem;
  top: 30px;
  font-size: 3rem;
  color: #cbd5e0;
}

.cta-container {
  text-align: center;
}

.btn-large {
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.cta-note {
  margin-top: 1rem;
  color: #718096;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .steps-container {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .step-arrow {
    display: none;
  }
}
</style>
