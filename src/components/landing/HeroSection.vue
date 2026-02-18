<!-- src/components/landing/HeroSection.vue -->
<template>
  <section class="hero-section">
    <div class="container">
      <!-- Contenu principal -->
      <div class="hero-content">
        <h1 class="hero-title">
          {{ t('landing.heroSavings', { amount: averageSavings }) }}
        </h1>

        <p class="hero-subtitle">{{ t('landing.heroTagline') }}</p>

        <SavingsCalculator class="hero-calculator" />

        <div class="hero-cta">
          <button class="btn-primary" @click="handleSignup">
            {{ t('landing.signupCta') }}
          </button>
          <p class="cta-subtext">{{ t('landing.signupSubtext') }}</p>
        </div>

        <div class="trust-badges">
          <div class="badge">
            <span class="badge-icon">🔒</span>
            <span class="badge-text">{{ t('landing.trustPsd2') }}</span>
          </div>
          <div class="badge">
            <span class="badge-icon">⚡</span>
            <span class="badge-text">{{ t('landing.trustInstant') }}</span>
          </div>
          <div class="badge">
            <span class="badge-icon">🇫🇷</span>
            <span class="badge-text">{{ t('landing.trustFrance') }}</span>
          </div>
        </div>
      </div>

      <!-- Dashboard Preview -->
      <div class="hero-visual">
        <DashboardPreviewMockup />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SavingsCalculator from './SavingsCalculator.vue'
import DashboardPreviewMockup from './DashboardPreviewMockup.vue'

const { t } = useI18n()
const averageSavings = '324€'

const handleSignup = (): void => {
  window.location.href = '/register'
}
</script>

<style scoped>
.hero-section {
  min-height: 90vh;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}
.highlight {
  color: #ffd700;
  text-decoration: underline;
  text-decoration-thickness: 4px;
  text-underline-offset: 8px;
}
.hero-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 3rem;
  font-weight: 300;
}
.hero-calculator {
  margin-bottom: 3rem;
}
.hero-cta {
  margin-bottom: 2rem;
}
.btn-primary {
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
  font-weight: 600;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}
.cta-subtext {
  margin-top: 1rem;
  font-size: 0.875rem;
  opacity: 0.8;
}
.trust-badges {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}
.badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.badge-icon {
  font-size: 1.5rem;
}
.badge-text {
  font-size: 0.875rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .hero-title {
    font-size: 2.5rem;
  }
  .hero-subtitle {
    font-size: 1.25rem;
  }
  .hero-visual {
    order: -1;
  }
}
</style>
