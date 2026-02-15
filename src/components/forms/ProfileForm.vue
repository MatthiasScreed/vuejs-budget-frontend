<template name="ProfileForm.vue">
  <div class="profile-form-container">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
        <div class="flex items-center space-x-6">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-24 h-24 bg-white/20 rounded-2xl overflow-hidden">
              <img
                v-if="avatarPreview || user.avatar"
                :src="avatarPreview || user.avatar"
                alt="Avatar"
                class="w-full h-full object-cover"
              >
              <div v-else class="w-full h-full flex items-center justify-center text-3xl text-white">
                {{ user.name?.charAt(0).toUpperCase() || '👤' }}
              </div>
            </div>

            <!-- Upload button -->
            <button
              type="button"
              @click="$refs.avatarInput.click()"
              class="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              📷
            </button>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              @change="handleAvatarChange"
              class="hidden"
            >
          </div>

          <div class="text-white">
            <h1 class="text-3xl font-bold">Mon profil</h1>
            <p class="text-white/80 mt-1">Gérez vos informations personnelles</p>
            <!-- Gaming Stats -->
            <div class="flex items-center space-x-4 mt-3">
            <span class="bg-white/20 px-3 py-1 rounded-full text-sm">
              ⭐ Niveau {{ user.level?.current_level || 1 }}
            </span>
              <span class="bg-white/20 px-3 py-1 rounded-full text-sm">
              🏆 {{ user.achievements_count || 0 }} succès
            </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
            :class="[
            activeTab === tab.id
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
          >
            <span class="mr-2">{{ tab.icon }}</span>
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit" class="p-8">
        <!-- Onglet: Informations personnelles -->
        <div v-if="activeTab === 'personal'" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nom -->
            <div class="form-group">
              <label for="name" class="form-label required">
                👤 Nom complet
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="form-input"
                :class="{ 'input-error': errors.name }"
                placeholder="Votre nom"
                maxlength="100"
              >
              <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label required">
                📧 Adresse email
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                :class="{ 'input-error': errors.email }"
                placeholder="votre@email.com"
              >
              <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
            </div>

            <!-- Téléphone -->
            <div class="form-group">
              <label for="phone" class="form-label">
                📱 Téléphone
              </label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                class="form-input"
                :class="{ 'input-error': errors.phone }"
                placeholder="06 12 34 56 78"
              >
              <div v-if="errors.phone" class="form-error">{{ errors.phone }}</div>
            </div>

            <!-- Date de naissance -->
            <div class="form-group">
              <label for="date_of_birth" class="form-label">
                🎂 Date de naissance
              </label>
              <input
                id="date_of_birth"
                v-model="formData.date_of_birth"
                type="date"
                :max="maxBirthDate"
                class="form-input"
                :class="{ 'input-error': errors.date_of_birth }"
              >
              <div v-if="errors.date_of_birth" class="form-error">{{ errors.date_of_birth }}</div>
            </div>
          </div>
        </div>

        <!-- Onglet: Préférences -->
        <div v-if="activeTab === 'preferences'" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Devise -->
            <div class="form-group">
              <label for="currency" class="form-label">
                💰 Devise par défaut
              </label>
              <select
                id="currency"
                v-model="formData.currency"
                class="form-select"
              >
                <option value="EUR">🇪🇺 Euro (EUR)</option>
                <option value="USD">🇺🇸 Dollar américain (USD)</option>
                <option value="GBP">🇬🇧 Livre sterling (GBP)</option>
                <option value="CHF">🇨🇭 Franc suisse (CHF)</option>
                <option value="CAD">🇨🇦 Dollar canadien (CAD)</option>
                <option value="JPY">🇯🇵 Yen japonais (JPY)</option>
              </select>
            </div>

            <!-- Langue -->
            <div class="form-group">
              <label for="language" class="form-label">
                🌍 Langue
              </label>
              <select
                id="language"
                v-model="formData.language"
                class="form-select"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="it">🇮🇹 Italiano</option>
              </select>
            </div>

            <!-- Fuseau horaire -->
            <div class="form-group">
              <label for="timezone" class="form-label">
                🕐 Fuseau horaire
              </label>
              <select
                id="timezone"
                v-model="formData.timezone"
                class="form-select"
              >
                <option value="Europe/Paris">🇫🇷 Paris (CET/CEST)</option>
                <option value="Europe/London">🇬🇧 Londres (GMT/BST)</option>
                <option value="America/New_York">🇺🇸 New York (EST/EDT)</option>
                <option value="America/Los_Angeles">🇺🇸 Los Angeles (PST/PDT)</option>
                <option value="Asia/Tokyo">🇯🇵 Tokyo (JST)</option>
              </select>
            </div>
          </div>

          <!-- Préférences d'affichage -->
          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">🎨 Affichage</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label for="theme" class="form-label">
                  🌙 Thème
                </label>
                <select
                  id="theme"
                  v-model="formData.preferences.theme"
                  class="form-select"
                >
                  <option value="light">☀️ Clair</option>
                  <option value="dark">🌙 Sombre</option>
                  <option value="auto">🔄 Automatique</option>
                </select>
              </div>

              <div class="form-group">
                <label for="date_format" class="form-label">
                  📅 Format de date
                </label>
                <select
                  id="date_format"
                  v-model="formData.preferences.date_format"
                  class="form-select"
                >
                  <option value="dd/mm/yyyy">DD/MM/YYYY (France)</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY (USA)</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD (ISO)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet: Notifications -->
        <div v-if="activeTab === 'notifications'" class="space-y-8">
          <div class="space-y-6">
            <!-- Notifications email -->
            <div class="bg-blue-50 rounded-xl p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">📧 Notifications email</h3>
                  <p class="text-sm text-gray-600 mt-1">Recevoir des emails pour les événements importants</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="formData.notifications.email" type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div v-if="formData.notifications.email" class="mt-4 space-y-3">
                <label class="flex items-center space-x-3">
                  <input v-model="formData.notifications.budget_alerts" type="checkbox" class="form-checkbox">
                  <span class="text-sm text-gray-700">🚨 Alertes de dépassement de budget</span>
                </label>
                <label class="flex items-center space-x-3">
                  <input v-model="formData.notifications.goal_reminders" type="checkbox" class="form-checkbox">
                  <span class="text-sm text-gray-700">🎯 Rappels d'objectifs financiers</span>
                </label>
                <label class="flex items-center space-x-3">
                  <input v-model="formData.notifications.weekly_summary" type="checkbox" class="form-checkbox">
                  <span class="text-sm text-gray-700">📊 Résumé hebdomadaire</span>
                </label>
              </div>
            </div>

            <!-- Notifications push -->
            <div class="bg-green-50 rounded-xl p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">📱 Notifications push</h3>
                  <p class="text-sm text-gray-600 mt-1">Notifications instantanées sur votre appareil</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="formData.notifications.push" type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            <!-- Notifications gaming -->
            <div class="bg-purple-50 rounded-xl p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">🎮 Notifications gaming</h3>
                  <p class="text-sm text-gray-600 mt-1">Succès débloqués, défis et classements</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="formData.notifications.gaming" type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet: Gaming -->
        <div v-if="activeTab === 'gaming'" class="space-y-8">
          <!-- Stats actuelles -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold">Niveau actuel</h3>
                  <p class="text-2xl font-bold mt-1">{{ user.level?.current_level || 1 }}</p>
                </div>
                <span class="text-3xl">⭐</span>
              </div>
            </div>

            <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold">XP Total</h3>
                  <p class="text-2xl font-bold mt-1">{{ user.level?.total_xp || 0 }}</p>
                </div>
                <span class="text-3xl">⚡</span>
              </div>
            </div>

            <div class="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold">Succès</h3>
                  <p class="text-2xl font-bold mt-1">{{ user.achievements_count || 0 }}</p>
                </div>
                <span class="text-3xl">🏆</span>
              </div>
            </div>
          </div>

          <!-- Préférences gaming -->
          <div class="space-y-6">
            <div class="bg-gray-50 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">🎮 Préférences gaming</h3>
              <div class="space-y-4">
                <label class="flex items-center space-x-3">
                  <input v-model="formData.gaming_preferences.public_profile" type="checkbox" class="form-checkbox">
                  <div>
                    <span class="text-sm font-medium text-gray-700">🌟 Profil public</span>
                    <p class="text-xs text-gray-600">Permettre aux autres utilisateurs de voir votre profil</p>
                  </div>
                </label>

                <label class="flex items-center space-x-3">
                  <input v-model="formData.gaming_preferences.show_achievements" type="checkbox" class="form-checkbox">
                  <div>
                    <span class="text-sm font-medium text-gray-700">🏆 Afficher mes succès</span>
                    <p class="text-xs text-gray-600">Montrer mes achievements dans mon profil public</p>
                  </div>
                </label>

                <label class="flex items-center space-x-3">
                  <input v-model="formData.gaming_preferences.challenge_notifications" type="checkbox" class="form-checkbox">
                  <div>
                    <span class="text-sm font-medium text-gray-700">🎯 Notifications de défis</span>
                    <p class="text-xs text-gray-600">Recevoir des alertes pour les nouveaux défis</p>
                  </div>
                </label>

                <label class="flex items-center space-x-3">
                  <input v-model="formData.gaming_preferences.leaderboard_participation" type="checkbox" class="form-checkbox">
                  <div>
                    <span class="text-sm font-medium text-gray-700">📊 Participation aux classements</span>
                    <p class="text-xs text-gray-600">Apparaître dans les leaderboards publics</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet: Confidentialité -->
        <div v-if="activeTab === 'privacy'" class="space-y-8">
          <div class="space-y-6">
            <div class="bg-red-50 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">🔒 Paramètres de confidentialité</h3>
              <div class="space-y-4">
                <div class="form-group">
                  <label for="profile_visibility" class="form-label">
                    👁️ Visibilité du profil
                  </label>
                  <select
                    id="profile_visibility"
                    v-model="formData.privacy.profile_visibility"
                    class="form-select"
                  >
                    <option value="public">🌍 Public - Tout le monde peut voir</option>
                    <option value="friends">👥 Amis seulement</option>
                    <option value="private">🔒 Privé - Moi seulement</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="transaction_visibility" class="form-label">
                    💳 Visibilité des transactions
                  </label>
                  <select
                    id="transaction_visibility"
                    v-model="formData.privacy.transaction_visibility"
                    class="form-select"
                  >
                    <option value="public">🌍 Public - Données anonymisées</option>
                    <option value="private">🔒 Privé - Moi seulement</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="goal_visibility" class="form-label">
                    🎯 Visibilité des objectifs
                  </label>
                  <select
                    id="goal_visibility"
                    v-model="formData.privacy.goal_visibility"
                    class="form-select"
                  >
                    <option value="public">🌍 Public - Motivation communautaire</option>
                    <option value="friends">👥 Amis seulement</option>
                    <option value="private">🔒 Privé - Moi seulement</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Zone dangereuse -->
            <div class="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-red-800 mb-4">⚠️ Zone dangereuse</h3>
              <div class="space-y-4">
                <button
                  type="button"
                  @click="exportData"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  📥 Exporter mes données
                </button>

                <button
                  type="button"
                  @click="confirmDeleteAccount"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-3"
                >
                  🗑️ Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-8 border-t border-gray-200">
          <button
            type="button"
            @click="resetForm"
            class="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            🔄 Réinitialiser
          </button>

          <div class="flex items-center space-x-3">
            <div v-if="hasChanges" class="text-sm text-amber-600 flex items-center space-x-1">
              <span>⚠️</span>
              <span>Modifications non sauvegardées</span>
            </div>

            <button
              type="submit"
              :disabled="!hasChanges || loading"
              class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>💾 Sauvegarder</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-red-800 mb-4">⚠️ Supprimer le compte</h3>
        <p class="text-gray-600 mb-6">
          Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées.
        </p>
        <div class="flex items-center justify-end space-x-3">
          <button
            @click="showDeleteConfirmation = false"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            @click="deleteAccount"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
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

