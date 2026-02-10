<!-- src/components/landing/CTASection.vue -->

<template>
  <section class="cta-section">
    <div class="container">
      <h2 class="cta-title">Prêt à économiser {{ averageSavings }}/mois ?</h2>
      <p class="cta-subtitle">Rejoignez les centaines d'utilisateurs qui ont repris le contrôle</p>

      <button class="btn-cta" @click="handleSignup">Commencer gratuitement</button>

      <p class="cta-features">
        ✓ Sans carte bancaire ✓ 30 jours gratuits ✓ Annulation à tout moment
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
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

/* Responsive */
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
