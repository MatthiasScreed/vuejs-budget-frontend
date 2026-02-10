<template>
  <div
    class="dashboard-preview rounded-2xl shadow-2xl overflow-hidden bg-white border border-gray-200"
  >
    <!-- Header mockup -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white/20 rounded-lg"></div>
          <div class="h-4 w-24 bg-white/30 rounded"></div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-white/20 rounded-full"></div>
        </div>
      </div>
    </div>

    <!-- Dashboard content mockup -->
    <div class="p-6 space-y-6">
      <!-- Stats cards -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <div class="text-xs text-green-600 font-medium mb-1">Revenus</div>
          <div class="text-xl font-bold text-green-700">+2 450 €</div>
          <div class="mt-2 h-2 bg-green-200 rounded-full">
            <div class="h-full w-3/4 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
          <div class="text-xs text-red-600 font-medium mb-1">Dépenses</div>
          <div class="text-xl font-bold text-red-700">-1 280 €</div>
          <div class="mt-2 h-2 bg-red-200 rounded-full">
            <div class="h-full w-1/2 bg-red-500 rounded-full"></div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div class="text-xs text-blue-600 font-medium mb-1">Épargne</div>
          <div class="text-xl font-bold text-blue-700">+1 170 €</div>
          <div class="mt-2 h-2 bg-blue-200 rounded-full">
            <div class="h-full w-2/3 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Goals section -->
      <div class="space-y-3">
        <div class="text-sm font-semibold text-gray-700">Objectifs en cours</div>
        <div class="space-y-2">
          <div class="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <div class="text-2xl">🏖️</div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-800">Vacances été</div>
              <div class="h-2 bg-gray-200 rounded-full mt-1">
                <div
                  class="h-full w-3/5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                ></div>
              </div>
            </div>
            <div class="text-sm font-bold text-blue-600">60%</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <div class="text-2xl">🚗</div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-800">Nouvelle voiture</div>
              <div class="h-2 bg-gray-200 rounded-full mt-1">
                <div
                  class="h-full w-1/4 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                ></div>
              </div>
            </div>
            <div class="text-sm font-bold text-green-600">25%</div>
          </div>
        </div>
      </div>

      <!-- XP Bar (gaming touch) -->
      <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">⭐</span>
            <span class="text-sm font-semibold text-purple-700">Niveau 12</span>
          </div>
          <span class="text-xs text-purple-600">2,450 / 3,000 XP</span>
        </div>
        <div class="h-3 bg-purple-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
            style="width: 82%"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composant de prévisualisation du dashboard pour la landing page
// Affiche un mockup statique représentant les fonctionnalités
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
