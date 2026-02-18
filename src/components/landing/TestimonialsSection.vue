<!-- src/components/landing/TestimonialsSection.vue -->
<template>
  <section class="testimonials-section">
    <div class="container">
      <h2 class="section-title">{{ t('landing.testimonialsTitle') }}</h2>
      <p class="section-subtitle">{{ t('landing.testimonialsSubtitle') }}</p>

      <div class="testimonials-grid">
        <div
          v-for="testimonial in testimonialsWithAvatars"
          :key="testimonial.id"
          class="testimonial-card"
        >
          <div class="testimonial-header">
            <DynamicAvatar
              :src="testimonial.avatar"
              :name="testimonial.name"
              :size="60"
              :backgroundColor="testimonial.color"
              class="testimonial-avatar"
            />
            <div class="testimonial-author">
              <h4 class="author-name">{{ testimonial.name }}</h4>
              <p class="author-role">{{ testimonial.role }}</p>
            </div>
          </div>

          <blockquote class="testimonial-quote">"{{ testimonial.quote }}"</blockquote>

          <div class="testimonial-stats">
            <div class="stat">
              <span class="stat-value">{{ testimonial.savings }}</span>
              <span class="stat-label">{{ t('landing.saved') }}</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ testimonial.duration }}</span>
              <span class="stat-label">{{ t('landing.usage') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DynamicAvatar from '@/components/common/DynamicAvatar.vue'
import { TESTIMONIAL_AVATARS } from '@/config/avatars.config'
import type { Testimonial } from '@/types/landing.types'

const { t } = useI18n()

/**
 * Témoignages traduits via i18n
 * École 42: Computed réactif à la locale
 */
const testimonials = computed<Testimonial[]>(() => [
  {
    id: '1',
    name: 'Marie Dubois',
    role: t('testimonials.marieRole', 'Professeure'),
    avatar: '',
    quote: t(
      'testimonials.marieQuote',
      "J'ai économisé 400€ en 2 mois juste en visualisant mes dépenses. Je n'avais aucune idée que je dépensais autant en restaurants !",
    ),
    savings: '400€',
    duration: t('testimonials.marieDuration', '2 mois'),
  },
  {
    id: '2',
    name: 'Thomas Martin',
    role: t('testimonials.thomasRole', 'Développeur'),
    avatar: '',
    quote: t(
      'testimonials.thomasQuote',
      "L'import automatique des transactions me fait gagner un temps fou. Plus besoin de tout saisir à la main comme avec Excel.",
    ),
    savings: '850€',
    duration: t('testimonials.thomasDuration', '6 mois'),
  },
  {
    id: '3',
    name: 'Sophie Leroy',
    role: t('testimonials.sophieRole', 'Entrepreneure'),
    avatar: '',
    quote: t(
      'testimonials.sophieQuote',
      "Grâce aux objectifs intelligents, j'ai pu mettre de côté 15 000€ pour l'apport de mon appartement en 18 mois. C'était mon rêve !",
    ),
    savings: '15 000€',
    duration: t('testimonials.sophieDuration', '18 mois'),
  },
])

const testimonialsWithAvatars = computed(() => {
  const keys: ('marie' | 'thomas' | 'sophie')[] = ['marie', 'thomas', 'sophie']
  return testimonials.value.map((testimonial, index) => {
    const key = keys[index]
    const avatarConfig = TESTIMONIAL_AVATARS[key]
    return {
      ...testimonial,
      avatar: avatarConfig.uiAvatar,
      color: avatarConfig.color,
    }
  })
})
</script>

<style scoped>
.testimonials-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #f0f4ff 0%, #fef5ff 100%);
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
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}
.testimonial-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}
.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}
.testimonial-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.testimonial-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #667eea;
}
.author-name {
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.25rem;
}
.author-role {
  font-size: 0.875rem;
  color: #718096;
}
.testimonial-quote {
  font-size: 1rem;
  line-height: 1.6;
  color: #4a5568;
  font-style: italic;
  margin-bottom: 1.5rem;
  border-left: 4px solid #667eea;
  padding-left: 1rem;
}
.testimonial-stats {
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
.stat {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}
.stat-label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 768px) {
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}
</style>
