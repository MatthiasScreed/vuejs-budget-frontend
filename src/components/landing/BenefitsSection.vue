<!-- src/components/landing/BenefitsSection.vue -->
<template>
  <section class="benefits">
    <div class="container">
      <!-- Header -->
      <div class="benefits-header">
        <span class="section-tag">Pourquoi ça marche</span>
        <h2 class="section-title">
          Ton cerveau aime les jeux.<br />
          <span class="title-muted">Tes finances aussi.</span>
        </h2>
        <p class="section-sub">CoinQuest transforme l'épargne en habitude — pas en corvée.</p>
      </div>

      <!-- Grid benefits -->
      <div class="benefits-grid">
        <BenefitCard v-for="benefit in benefits" :key="benefit.id" :benefit="benefit" />
      </div>

      <!-- Bande "comment ça marche" -->
      <div class="how-strip">
        <div class="how-step" v-for="(step, i) in steps" :key="i">
          <div class="how-number">{{ i + 1 }}</div>
          <div class="how-content">
            <div class="how-title">{{ step.title }}</div>
            <div class="how-desc">{{ step.desc }}</div>
          </div>
          <div v-if="i < steps.length - 1" class="how-arrow">→</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BenefitCard from './BenefitCard.vue'
import type { Benefit } from '@/types/landing.types'

const benefits = computed<Benefit[]>(() => [
  {
    id: 'quest',
    icon: '🎯',
    title: 'Une quête, un objectif clair',
    description:
      "Finis les listes de catégories que personne ne regarde. Choisis ce qui te motive — voyage, MacBook, fonds d'urgence — et suis ta progression chaque jour.",
    example: 'Voyage au Japon — 1 250 € / 3 000 € (41%)',
  },
  {
    id: 'streak',
    icon: '🔥',
    title: "Série qui crée l'habitude",
    description:
      'Chaque jour où tu enregistres une action, ta série grandit. 7 jours, 30 jours, 100 jours — chaque milestone te récompense en XP bonus.',
    example: '🔥 17 jours — +25 XP bonus à venir',
  },
  {
    id: 'freeze',
    icon: '🧊',
    title: 'Streak Freeze — la filet de sécurité',
    description:
      'La vie est imprévisible. Un freeze protège automatiquement ta série si tu rates un jour. Tu en gagnes en atteignant des milestones. Stock max : 3.',
    example: 'Gagné à 7 jours · 30 jours · défis quotidiens',
  },
  {
    id: 'actions',
    icon: '⚡',
    title: 'Action en 30 secondes',
    description:
      "Enregistre une économie ou une dépense en moins de 30 secondes depuis ton écran d'accueil. Pas de tableau, pas de synchronisation bancaire obligatoire.",
    example: '+18 € — Cuisiné à la maison · +10 XP',
  },
  {
    id: 'levels',
    icon: '⭐',
    title: 'XP et niveaux',
    description:
      "Chaque action rapporte de l'expérience. Monte en niveau, débloque des succès, reste dans une dynamique de progression permanente.",
    example: 'Niveau 8 — 1 505 XP · 3 succès cette semaine',
  },
  {
    id: 'recap',
    icon: '📧',
    title: 'Résumés intelligents',
    description:
      'Chaque lundi matin, un bilan de ta semaine par email. Et si ta série est en danger à 18h, un rappel discret — sans spam, juste ce qui compte.',
    example: '🔥 Ta série de 12 jours se termine ce soir',
  },
])

const steps = [
  { title: 'Crée ta quête', desc: '30 secondes' },
  { title: 'Note tes actions', desc: 'Chaque jour' },
  { title: 'Gagne des XP', desc: 'Automatique' },
  { title: 'Atteins ton objectif', desc: '🎉' },
]
</script>

<style scoped>
.benefits {
  padding: 7rem 1.5rem;
  background: #f9fafb;
  position: relative;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Header */
.benefits-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-tag {
  display: inline-block;
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.35rem 1rem;
  border-radius: 100px;
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}

.title-muted {
  color: #94a3b8;
}

.section-sub {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 440px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Grid */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

/* How strip */
.how-strip {
  background: #0f172a;
  border-radius: 20px;
  padding: 2rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.how-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 140px;
}

.how-number {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.25);
  color: #a78bfa;
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.how-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.how-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
}

.how-desc {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
}

.how-arrow {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  margin-left: auto;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .benefits {
    padding: 4rem 1rem;
  }
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  .how-strip {
    flex-direction: column;
    align-items: flex-start;
  }
  .how-arrow {
    display: none;
  }
}
</style>
