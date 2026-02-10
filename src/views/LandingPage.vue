<!-- src/views/LandingPage.vue -->

<template>
  <div class="landing-page">
    <!-- Hero avec calculateur -->
    <HeroSection />

    <!-- Bénéfices -->
    <BenefitsSection />

    <!-- Comment ça marche -->
    <HowItWorksSection />

    <!-- Témoignages -->
    <TestimonialsSection />

    <!-- CTA final -->
    <CTASection />
  </div>
</template>

<script setup lang="ts">
import HeroSection from '@/components/landing/HeroSection.vue'
import BenefitsSection from '@/components/landing/BenefitsSection.vue'
import HowItWorksSection from '@/components/landing/HowItWorksSection.vue'
import TestimonialsSection from '@/components/landing/TestimonialsSection.vue'
import CTASection from '@/components/landing/CTASection.vue'

/**
 * Landing page principale
 * École 42: Composition claire de composants
 */
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
}
</style>
