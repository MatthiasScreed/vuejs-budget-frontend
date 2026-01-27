<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Navigation -->
    <nav class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center">
          <img src="@/assets/images/logo/logo-horizontal.svg" alt="CoinQuest Logo" class="w-40" />
        </div>
        <div class="flex items-center space-x-4">
          <router-link to="/login" class="text-gray-600 hover:text-gray-900 transition-colors">
            Connexion
          </router-link>
          <router-link to="/register" class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
            Inscription
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div class="text-center">

        <!-- Value Proposition Badge -->
        <div class="inline-flex items-center space-x-2 mb-6 px-4 py-2 bg-purple-100 rounded-full">
          <span class="text-purple-600 font-semibold text-sm">
            💰 Budget + 🎮 Motivation = 🚀 Résultats
          </span>
        </div>

        <!-- Titre principal -->
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          L'app qui rend la
          <span class="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            gestion d'argent
          </span>
          <br />fun et motivante
        </h1>

        <!-- Sous-titre clair -->
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          <strong>Tu économises pour un projet ?</strong> CoinQuest connecte ta banque,
          calcule automatiquement ta capacité d'épargne et te récompense à chaque
          étape. <strong>Simple. Automatique. Motivant.</strong>
        </p>

        <!-- 3 Bénéfices Concrets -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-4xl mb-3">🏦</div>
            <h3 class="font-semibold mb-2 text-gray-900">Connexion bancaire sécurisée</h3>
            <p class="text-sm text-gray-600">
              Tes transactions importées automatiquement depuis 300+ banques européennes
            </p>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-4xl mb-3">🎯</div>
            <h3 class="font-semibold mb-2 text-gray-900">Objectifs intelligents</h3>
            <p class="text-sm text-gray-600">
              L'app calcule combien mettre de côté chaque mois pour tes projets
            </p>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-4xl mb-3">⭐</div>
            <h3 class="font-semibold mb-2 text-gray-900">Progression motivante</h3>
            <p class="text-sm text-gray-600">
              Gagne des points et badges à chaque bonne décision financière
            </p>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <router-link
            to="/register"
            class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            🎮 Commencer gratuitement
          </router-link>
          <button
            @click="scrollToDemo"
            class="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-all"
          >
            👀 Voir comment ça marche
          </button>
        </div>

        <!-- Social Proof -->
        <div class="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>4.8★ sur les stores</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            <span>1,247 utilisateurs actifs</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>€2.4M épargnés collectivement</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Demo -->
    <section id="demo" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            3 étapes simples pour reprendre le contrôle de ton budget
          </p>
        </div>

        <!-- 3 étapes illustrées -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-purple-600">1</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Connecte ta banque</h3>
            <p class="text-gray-600">
              En 2 minutes, connexion sécurisée à ton compte. Tes transactions s'importent automatiquement.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Définis tes objectifs</h3>
            <p class="text-gray-600">
              Voyage, voiture, appart... L'app calcule combien économiser par mois.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-green-600">3</span>
            </div>
            <h3 class="text-xl font-bold mb-3">Progresse et gagne</h3>
            <p class="text-gray-600">
              Chaque bonne décision te rapporte des points. Suis ta progression en temps réel.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer avec signaux de confiance -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Signaux de confiance -->
        <div class="flex flex-wrap justify-center items-center gap-6 mb-8 pb-8 border-b border-gray-800">
          <div class="flex items-center space-x-2 text-sm">
            <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Connexion sécurisée Bridge</span>
          </div>

          <div class="flex items-center space-x-2 text-sm">
            <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Lecture seule (aucun virement)</span>
          </div>

          <div class="flex items-center space-x-2 text-sm">
            <svg class="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Conforme RGPD & PSD2</span>
          </div>
        </div>

        <!-- Copyright -->
        <div class="text-center text-gray-400 text-sm">
          <p>&copy; {{ currentYear }} CoinQuest. Tous droits réservés.</p>
          <p class="mt-2">
            CoinQuest utilise Bridge, le même système que ta banque pour connecter ton compte en toute sécurité
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())

const scrollToDemo = () => {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
@media (max-width: 640px) {
  .text-4xl {
    font-size: 2rem;
  }

  .text-xl {
    font-size: 1.125rem;
  }
}
</style>
