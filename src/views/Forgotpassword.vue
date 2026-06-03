<script setup lang="ts">
import { ref, reactive } from 'vue'
import { api } from '@/services/api'

const form = reactive({ email: '' })
const loading = ref(false)
const success = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!form.email) {
    error.value = "L'email est requis"
    return
  }
  loading.value = true
  error.value = ''

  try {
    await api.post('/auth/forgot-password', { email: form.email })
    success.value = true
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <img src="/images/logo/logo.svg" alt="CoinQuest" class="w-20 h-20" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h2>
        <p class="text-gray-600">Entre ton email pour recevoir un lien de réinitialisation</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <!-- Succès -->
        <div v-if="success" class="text-center space-y-4">
          <div class="text-6xl">📬</div>
          <h3 class="text-xl font-bold text-gray-900">Email envoyé !</h3>
          <p class="text-gray-600 text-sm">
            Si <strong>{{ form.email }}</strong> est associé à un compte, tu recevras un lien de
            réinitialisation dans quelques minutes.
          </p>
          <p class="text-gray-500 text-xs">Vérifie aussi tes spams.</p>
          <router-link
            to="/login"
            class="inline-block mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700"
          >
            ← Retour à la connexion
          </router-link>
        </div>

        <!-- Formulaire -->
        <form v-else class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2"
              >Adresse email</label
            >
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="votre@email.com"
              @keyup.enter="handleSubmit"
            />
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <svg
              v-if="loading"
              class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ loading ? 'Envoi en cours...' : 'Envoyer le lien' }}
          </button>

          <div class="text-center">
            <router-link
              to="/login"
              class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Retour à la connexion
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
