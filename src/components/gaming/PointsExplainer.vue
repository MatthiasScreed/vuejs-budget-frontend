<template>
  <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
    <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span>🎯</span>
      À quoi servent tes points ?
    </h3>

    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <div
          class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl shrink-0"
        >
          🏆
        </div>
        <div>
          <h4 class="font-semibold text-gray-900">Débloquer des succès</h4>
          <p class="text-sm text-gray-600">Atteins des paliers pour obtenir des badges exclusifs</p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div
          class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl shrink-0"
        >
          📊
        </div>
        <div>
          <h4 class="font-semibold text-gray-900">Monter de niveau</h4>
          <p class="text-sm text-gray-600">Chaque niveau débloque de nouvelles fonctionnalités</p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div
          class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl shrink-0"
        >
          🎨
        </div>
        <div>
          <h4 class="font-semibold text-gray-900">Personnalisation (bientôt)</h4>
          <p class="text-sm text-gray-600">Thèmes, avatars et récompenses exclusives</p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div
          class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-xl shrink-0"
        >
          🏅
        </div>
        <div>
          <h4 class="font-semibold text-gray-900">Classement</h4>
          <p class="text-sm text-gray-600">Compare-toi aux autres utilisateurs</p>
        </div>
      </div>
    </div>

    <div class="mt-4 p-3 bg-white rounded-lg border border-purple-100">
      <p class="text-sm text-purple-700 font-medium">
        💡 <strong>Astuce :</strong> Plus tu gères tes finances régulièrement, plus tu gagnes de
        points !
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composant statique, pas de logique nécessaire
</script>
