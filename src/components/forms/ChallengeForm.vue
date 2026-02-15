<template name="ChallengeForm.vue">
  <div class="challenge-form-container">
    <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-white">🏆 Créer un défi</h1>
            <p class="text-orange-100 mt-2">Motivez la communauté avec des défis engageants</p>
          </div>
          <button @click="$emit('close')" class="text-white/80 hover:text-white">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-8 space-y-10">
        <!-- Informations de base -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <span>📋</span>
            <span>Informations du défi</span>
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Titre -->
            <div class="form-group">
              <label for="title" class="form-label required">
                🏷️ Titre du défi
              </label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                class="form-input text-lg"
                :class="{ 'input-error': errors.title }"
                placeholder="ex: Économiser 500€ en 30 jours"
                maxlength="100"
              >
              <div v-if="errors.title" class="form-error">{{ errors.title }}</div>
            </div>

            <!-- Type -->
            <div class="form-group">
              <label for="type" class="form-label required">
                🎯 Type de défi
              </label>
              <select
                id="type"
                v-model="formData.type"
                class="form-select"
                :class="{ 'input-error': errors.type }"
              >
                <option value="">Choisir le type</option>
                <option value="savings">💰 Épargne - Économiser un montant</option>
                <option value="spending_limit">💸 Limite - Ne pas dépasser un budget</option>
                <option value="transaction_count">📊 Transactions - Nombre d'opérations</option>
                <option value="streak">🔥 Série - Maintenir une habitude</option>
                <option value="category_usage">🗂️ Catégorie - Usage spécifique</option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div class="form-group mt-6">
            <label for="description" class="form-label required">
              📝 Description détaillée
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-textarea h-32"
              :class="{ 'input-error': errors.description }"
              placeholder="Décrivez les règles, objectifs et récompenses du défi..."
              maxlength="500"
            ></textarea>
            <div class="text-xs text-gray-500 mt-1">
              {{ formData.description?.length || 0 }}/500 caractères
            </div>
          </div>
        </div>

        <!-- Configuration du défi -->
        <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <span>⚙️</span>
            <span>Configuration</span>
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Difficulté -->
            <div class="form-group">
              <label for="difficulty" class="form-label required">
                🏅 Niveau de difficulté
              </label>
              <select
                id="difficulty"
                v-model="formData.difficulty"
                class="form-select"
                :class="{ 'input-error': errors.difficulty }"
              >
                <option value="">Choisir la difficulté</option>
                <option value="easy">🟢 Facile - Débutants</option>
                <option value="medium">🟡 Moyen - Intermédiaire</option>
                <option value="hard">🔴 Difficile - Experts</option>
                <option value="legendary">⭐ Légendaire - Maîtres</option>
              </select>
            </div>

            <!-- Valeur cible -->
            <div class="form-group">
              <label for="target_value" class="form-label required">
                🎯 Valeur cible
              </label>
              <input
                id="target_value"
                v-model.number="formData.target_value"
                type="number"
                step="0.01"
                min="0"
                class="form-input"
                :class="{ 'input-error': errors.target_value }"
                placeholder="0"
              >
            </div>

            <!-- Unité -->
            <div class="form-group">
              <label for="target_unit" class="form-label required">
                📏 Unité de mesure
              </label>
              <select
                id="target_unit"
                v-model="formData.target_unit"
                class="form-select"
                :class="{ 'input-error': errors.target_unit }"
              >
                <option value="">Choisir l'unité</option>
                <option value="amount">💶 Euros</option>
                <option value="count">🔢 Nombre</option>
                <option value="days">📅 Jours</option>
                <option value="percentage">% Pourcentage</option>
              </select>
            </div>
          </div>

          <!-- Durée et dates -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div class="form-group">
              <label for="duration_days" class="form-label required">
                ⏱️ Durée (jours)
              </label>
              <input
                id="duration_days"
                v-model.number="formData.duration_days"
                type="number"
                min="1"
                max="365"
                class="form-input"
                :class="{ 'input-error': errors.duration_days }"
                placeholder="30"
              >
            </div>

            <div class="form-group">
              <label for="start_date" class="form-label required">
                🚀 Date de début
              </label>
              <input
                id="start_date"
                v-model="formData.start_date"
                type="date"
                :min="today"
                class="form-input"
                :class="{ 'input-error': errors.start_date }"
              >
            </div>

            <div class="form-group">
              <label for="end_date" class="form-label required">
                🏁 Date de fin
              </label>
              <input
                id="end_date"
                v-model="formData.end_date"
                type="date"
                :min="formData.start_date"
                class="form-input"
                :class="{ 'input-error': errors.end_date }"
              >
            </div>
          </div>
        </div>

        <!-- Récompenses -->
        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <span>🎁</span>
            <span>Récompenses</span>
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="form-group">
              <label for="xp_reward" class="form-label required">
                ⚡ Récompense XP
              </label>
              <input
                id="xp_reward"
                v-model.number="formData.xp_reward"
                type="number"
                min="10"
                max="10000"
                class="form-input"
                :class="{ 'input-error': errors.xp_reward }"
                placeholder="100"
              >
              <p class="text-xs text-gray-500 mt-1">
                Facile: 10-50 XP, Moyen: 50-150 XP, Difficile: 150-500 XP, Légendaire: 500+ XP
              </p>
            </div>

            <div class="form-group">
              <label for="badge_reward" class="form-label">
                🏆 Badge spécial (optionnel)
              </label>
              <input
                id="badge_reward"
                v-model="formData.badge_reward"
                type="text"
                class="form-input"
                placeholder="ex: Économe du mois"
                maxlength="100"
              >
            </div>
          </div>
        </div>

        <!-- Options avancées -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <span>🔧</span>
            <span>Options avancées</span>
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Participation -->
            <div class="space-y-6">
              <div class="form-group">
                <label for="max_participants" class="form-label">
                  👥 Nombre max de participants
                </label>
                <input
                  id="max_participants"
                  v-model.number="formData.max_participants"
                  type="number"
                  min="1"
                  max="1000"
                  class="form-input"
                  placeholder="Illimité"
                >
                <p class="text-xs text-gray-500 mt-1">
                  Laissez vide pour un nombre illimité
                </p>
              </div>

              <div class="space-y-3">
                <label class="flex items-center space-x-3">
                  <input v-model="formData.is_global" type="checkbox" class="form-checkbox">
                  <div>
                    <span class="text-sm font-medium text-gray-700">🌍 Défi global</span>
                    <p class="text-xs text-gray-600">Visible par tous les utilisateurs</p>
                  </div>
                </label>

                <label class="flex items-center space-x-3">
                  <input v-model="formData.auto_join" type="checkbox" class="form-checkbox">
                  <div>
                    <span class="text-sm font-medium text-gray-700">🚀 Inscription automatique</span>
                    <p class="text-xs text-gray-600">Les utilisateurs éligibles rejoignent automatiquement</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Restrictions -->
            <div class="space-y-6">
              <div class="form-group">
                <label class="form-label">
                  🗂️ Catégories autorisées (optionnel)
                </label>
                <div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  <label
                    v-for="category in availableCategories"
                    :key="category.id"
                    class="flex items-center space-x-2 text-sm"
                  >
                    <input
                      v-model="formData.category_restrictions"
                      :value="category.id"
                      type="checkbox"
                      class="form-checkbox text-xs"
                    >
                    <span>{{ category.icon }} {{ category.name }}</span>
                  </label>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Si aucune catégorie sélectionnée, toutes sont autorisées
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Aperçu du défi -->
        <div v-if="isFormValid" class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <span>👁️</span>
            <span>Aperçu du défi</span>
          </h2>

          <div class="bg-white rounded-xl p-6 border-l-4 border-purple-500">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-2xl">🏆</span>
                  <h3 class="text-xl font-bold text-gray-900">{{ formData.title }}</h3>
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="difficultyClasses[formData.difficulty]"
                  >
                  {{ difficultyLabels[formData.difficulty] }}
                </span>
                </div>

                <p class="text-gray-600 mb-4">{{ formData.description }}</p>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Objectif:</span>
                    <span class="font-semibold ml-1">
                    {{ formData.target_value }} {{ unitLabels[formData.target_unit] }}
                  </span>
                  </div>
                  <div>
                    <span class="text-gray-500">Durée:</span>
                    <span class="font-semibold ml-1">{{ formData.duration_days }} jours</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Récompense:</span>
                    <span class="font-semibold ml-1">{{ formData.xp_reward }} XP</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Participants:</span>
                    <span class="font-semibold ml-1">
                    {{ formData.max_participants || 'Illimité' }}
                  </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-8 border-t border-gray-200">
          <button
            type="button"
            @click="resetForm"
            class="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Réinitialiser</span>
          </button>

          <div class="flex items-center space-x-4">
            <button
              type="button"
              @click="saveAsDraft"
              class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center space-x-2"
            >
              <span>💾</span>
              <span>Enregistrer en brouillon</span>
            </button>

            <button
              type="submit"
              :disabled="!isFormValid || loading"
              class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
            >
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>🚀</span>
              <span>Lancer le défi</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-label.required::after {
  content: ' *';
  @apply text-red-500;
}

.form-input, .form-select, .form-textarea {
  @apply w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200;
}

.form-input::placeholder, .form-textarea::placeholder {
  @apply placeholder-gray-500;
}

.input-error {
  @apply border-red-500 bg-red-50;
}

.form-error {
  @apply text-sm text-red-600 mt-1 flex items-center;
}

.form-checkbox {
  @apply h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded;
}

.form-group {
  @apply space-y-1;
}
</style>
