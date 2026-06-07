<!-- src/components/landing/HeroSection.vue -->
<template>
  <section class="hero">
    <!-- Badge announcement -->
    <div class="hero-badge">
      <span class="badge-dot"></span>
      <span>Bêta gratuite — 9 utilisateurs actifs</span>
    </div>

    <!-- Headline -->
    <h1 class="hero-title">
      Épargne comme<br />
      <span class="hero-title-accent">tu joues.</span>
    </h1>

    <p class="hero-sub">
      Pas de tableur. Pas de prise de tête.<br />
      Juste une quête, une série, et des économies qui s'accumulent.
    </p>

    <!-- Social proof rapide -->
    <div class="hero-proof">
      <div class="proof-item">
        <span class="proof-number">342</span>
        <span class="proof-label">actions enregistrées</span>
      </div>
      <div class="proof-divider"></div>
      <div class="proof-item">
        <span class="proof-number">9</span>
        <span class="proof-label">testeurs actifs</span>
      </div>
      <div class="proof-divider"></div>
      <div class="proof-item">
        <span class="proof-number">🔥 17j</span>
        <span class="proof-label">meilleure série</span>
      </div>
    </div>

    <!-- CTA -->
    <div class="hero-cta">
      <button class="btn-main" @click="handleSignup">
        Rejoindre la bêta gratuite
        <svg class="btn-arrow" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <p class="btn-sub">Gratuit · Aucune carte requise · 30 secondes pour démarrer</p>
    </div>

    <!-- App mockup -->
    <div class="hero-mockup">
      <div class="mockup-phone">
        <div class="mockup-screen">
          <!-- Header mockup -->
          <div class="mock-header">
            <div class="mock-xp">
              <span class="mock-xp-badge">⚡ 340 XP</span>
            </div>
            <div class="mock-streak">🔥 17</div>
          </div>

          <!-- Quest card -->
          <div class="mock-quest">
            <div class="mock-quest-label">✈️ Ma Quête</div>
            <div class="mock-quest-name">Voyage au Japon</div>
            <div class="mock-progress-track">
              <div class="mock-progress-fill" style="width: 41%"></div>
            </div>
            <div class="mock-quest-amounts">
              <span>1 250 €</span>
              <span class="mock-pct">41%</span>
              <span>3 000 €</span>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="mock-actions">
            <div class="mock-action mock-action-save">
              <span>+ Économie</span>
              <span class="mock-action-xp">+50 XP</span>
            </div>
            <div class="mock-action mock-action-spend">
              <span>− Dépense</span>
              <span class="mock-action-xp">+10 XP</span>
            </div>
          </div>

          <!-- Recent -->
          <div class="mock-recent">
            <div class="mock-tx">
              <span>🍳 Cuisiné à la maison</span>
              <span class="mock-tx-amount mock-green">+18 €</span>
            </div>
            <div class="mock-tx">
              <span>☕ Café évité</span>
              <span class="mock-tx-amount mock-green">+4 €</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating badges -->
      <div class="float-badge float-badge-1"><span>🏆</span> Succès débloqué !</div>
      <div class="float-badge float-badge-2"><span>🧊</span> Freeze utilisé — série sauvée</div>
    </div>
  </section>
</template>

<script setup lang="ts">
const handleSignup = (): void => {
  window.location.href = '/register'
}
</script>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5rem 1.5rem 4rem;
  background: #0a0a0f;
  position: relative;
  overflow: hidden;
}

/* Fond animé */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124, 58, 237, 0.3) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 80% 60%, rgba(245, 158, 11, 0.1) 0%, transparent 60%);
  pointer-events: none;
}

/* Badge */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.4);
  color: #a78bfa;
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin-bottom: 2rem;
  animation: fadeDown 0.6s ease both;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.1);
  }
}

/* Title */
.hero-title {
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 900;
  line-height: 1.05;
  color: #fff;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
  animation: fadeDown 0.6s 0.1s ease both;
}

.hero-title-accent {
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.7;
  max-width: 480px;
  margin-bottom: 2.5rem;
  animation: fadeDown 0.6s 0.2s ease both;
}

/* Proof */
.hero-proof {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
  animation: fadeDown 0.6s 0.3s ease both;
}

.proof-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.proof-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
}

.proof-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.proof-divider {
  width: 1px;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
}

/* CTA */
.hero-cta {
  margin-bottom: 4rem;
  animation: fadeDown 0.6s 0.4s ease both;
}

.btn-main {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 40px rgba(124, 58, 237, 0.4);
  letter-spacing: -0.01em;
}

.btn-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 60px rgba(124, 58, 237, 0.6);
}

.btn-arrow {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}

.btn-main:hover .btn-arrow {
  transform: translateX(3px);
}

.btn-sub {
  margin-top: 0.75rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.35);
}

/* Mockup */
.hero-mockup {
  position: relative;
  animation: fadeUp 0.8s 0.5s ease both;
}

.mockup-phone {
  width: 280px;
  background: #111118;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.25rem;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04),
    0 40px 80px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(124, 58, 237, 0.15);
  margin: 0 auto;
}

.mockup-screen {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mock-xp-badge {
  background: rgba(124, 58, 237, 0.2);
  color: #a78bfa;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
}

.mock-streak {
  font-size: 0.85rem;
  font-weight: 700;
  color: #f59e0b;
}

.mock-quest {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border-radius: 14px;
  padding: 1rem;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.mock-quest-label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}

.mock-quest-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.6rem;
}

.mock-progress-track {
  height: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.mock-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a78bfa);
  border-radius: 100px;
}

.mock-quest-amounts {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
}

.mock-pct {
  color: #a78bfa;
  font-weight: 700;
}

.mock-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.mock-action {
  border-radius: 10px;
  padding: 0.6rem;
  font-size: 0.65rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: #fff;
}

.mock-action-save {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.mock-action-spend {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.mock-action-xp {
  color: #f59e0b;
  font-size: 0.6rem;
}

.mock-recent {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.mock-tx {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.03);
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
}

.mock-tx-amount {
  font-weight: 700;
}
.mock-green {
  color: #10b981;
}

/* Floating badges */
.float-badge {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.5rem 0.9rem;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  animation: float 4s ease-in-out infinite;
}

.float-badge-1 {
  top: 10%;
  right: -3rem;
  animation-delay: 0s;
}

.float-badge-2 {
  bottom: 20%;
  left: -4rem;
  animation-delay: 1.5s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 4rem 1rem 3rem;
  }
  .hero-proof {
    gap: 1.25rem;
  }
  .float-badge-1 {
    right: -1rem;
    font-size: 0.65rem;
  }
  .float-badge-2 {
    left: -1rem;
    font-size: 0.65rem;
  }
}
</style>
