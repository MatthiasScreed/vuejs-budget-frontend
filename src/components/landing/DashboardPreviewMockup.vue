<!-- src/components/landing/DashboardPreviewMockup.vue -->
<template>
  <div
    class="dashboard-preview rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
    style="background: #1a1a2e"
  >
    <!-- Header -->
    <div class="px-5 py-4" style="background: linear-gradient(135deg, #312e81, #4c1d95)">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center text-base"
            style="background: rgba(255, 255, 255, 0.15)"
          >
            🪙
          </div>
          <span class="font-bold text-white text-sm">CoinQuest</span>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="text-xs font-semibold px-2 py-1 rounded-full"
            style="background: rgba(249, 115, 22, 0.2); color: #fb923c"
            >🔥 17j</span
          >
        </div>
      </div>
    </div>

    <div class="p-5 space-y-4">
      <!-- Quête principale -->
      <div
        class="rounded-xl p-4"
        style="
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          border: 1px solid rgba(139, 92, 246, 0.3);
        "
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">✈️</span>
            <div>
              <div class="text-white font-bold text-sm">Voyage au Japon</div>
              <div class="text-xs" style="color: rgba(255, 255, 255, 0.5)">1 250 € / 3 000 €</div>
            </div>
          </div>
          <span class="font-extrabold text-lg" style="color: #a78bfa">41%</span>
        </div>
        <!-- Progress bar -->
        <div class="h-2 rounded-full" style="background: rgba(255, 255, 255, 0.1)">
          <div
            class="h-full rounded-full"
            style="width: 41%; background: linear-gradient(90deg, #7c3aed, #a78bfa)"
          ></div>
        </div>
        <div class="mt-2 text-xs" style="color: rgba(255, 255, 255, 0.4)">1 750 € restants</div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-4 gap-2">
        <div
          class="rounded-xl p-2 text-center"
          style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.25)"
        >
          <div class="text-base">🔥</div>
          <div class="font-extrabold text-sm" style="color: #fb923c">17</div>
          <div class="text-xs" style="color: rgba(255, 255, 255, 0.35)">jours</div>
        </div>
        <div
          class="rounded-xl p-2 text-center"
          style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.25)"
        >
          <div class="text-base">⭐</div>
          <div class="font-extrabold text-sm" style="color: #fbbf24">8</div>
          <div class="text-xs" style="color: rgba(255, 255, 255, 0.35)">niveau</div>
        </div>
        <div
          class="rounded-xl p-2 text-center"
          style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.25)"
        >
          <div class="text-base">⚡</div>
          <div class="font-extrabold text-sm" style="color: #a78bfa">340</div>
          <div class="text-xs" style="color: rgba(255, 255, 255, 0.35)">XP</div>
        </div>
        <div
          class="rounded-xl p-2 text-center"
          style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25)"
        >
          <div class="text-base">💰</div>
          <div class="font-extrabold text-sm" style="color: #4ade80">85€</div>
          <div class="text-xs" style="color: rgba(255, 255, 255, 0.35)">mois</div>
        </div>
      </div>

      <!-- XP bar -->
      <div>
        <div class="flex justify-between text-xs mb-1" style="color: rgba(255, 255, 255, 0.4)">
          <span>Niveau 8</span>
          <span>1 505 / 2 000 XP</span>
        </div>
        <div class="h-1.5 rounded-full" style="background: rgba(255, 255, 255, 0.08)">
          <div
            class="h-full rounded-full"
            style="width: 75%; background: linear-gradient(90deg, #7c3aed, #ec4899)"
          ></div>
        </div>
      </div>

      <!-- Défi du jour -->
      <div
        class="rounded-xl p-3"
        style="background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.2)"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold" style="color: #fbbf24">DÉFI DU JOUR</span>
          <span class="text-xs font-bold" style="color: #fbbf24">+20 XP</span>
        </div>
        <p class="text-sm text-white font-medium">Pas de livraison aujourd'hui 🍕</p>
      </div>

      <!-- Action rapide -->
      <div
        class="rounded-xl p-3 text-center cursor-pointer"
        style="background: linear-gradient(135deg, #7c3aed, #4f46e5)"
      >
        <span class="text-white font-bold text-sm">+ Enregistrer une action</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Mockup statique MVP — quête + streak + XP + défi du jour
</script>

<style scoped>
.dashboard-preview {
  transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
  transition: transform 0.3s ease;
}
.dashboard-preview:hover {
  transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
}
</style>
