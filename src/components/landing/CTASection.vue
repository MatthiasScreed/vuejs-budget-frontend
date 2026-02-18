<!-- src/components/landing/CTASection.vue -->
<template>
  <section class="cta-section">
    <div class="container">
      <h2 class="cta-title">{{ t('landing.ctaTitle', { amount: averageSavings }) }}</h2>
      <p class="cta-subtitle">{{ t('landing.ctaSubtitle') }}</p>

      <button class="btn-cta" @click="handleSignup">
        {{ t('landing.ctaBtn') }}
      </button>

      <p class="cta-features">{{ t('landing.ctaFeatures') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const averageSavings = '324€'

const handleSignup = (): void => {
  window.location.href = '/register'
}
</script>

<style scoped>
.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}
.container {
  max-width: 800px;
  margin: 0 auto;
}
.cta-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
}
.cta-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 3rem;
}
.btn-cta {
  padding: 1.5rem 4rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}
.btn-cta:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}
.cta-features {
  margin-top: 2rem;
  font-size: 1rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .cta-title {
    font-size: 2rem;
  }
  .cta-subtitle {
    font-size: 1.25rem;
  }
  .btn-cta {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
  }
}
</style>
